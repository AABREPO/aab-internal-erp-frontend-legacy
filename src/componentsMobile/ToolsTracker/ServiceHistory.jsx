import React, { useState, useEffect, useRef, useMemo } from 'react';
import EditIcon from '../Images/edit1.png';
import DeleteIcon from '../Images/delete.png';
import Filter from '../Images/Filter.png';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import Close from '../Images/close.png';
import Search from '../Images/Search.png';
import CloseIcon from '../Images/Close F.svg';
import { fetchUserModulePermissions } from '../utils/fetchUserModulePermissions';

const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_management';
const PROJECT_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/project_Names';
const VENDOR_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/vendor_Names';
const EMPLOYEE_DETAILS_BASE_URL = 'https://backendaab.in/aabuildersDash/api/employee_details';
const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_name';
const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_brand';
const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_id';
const TOOLS_MACHINE_STATUS_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools-machine-status';
const TOOLS_MACHINE_NUMBER_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_machine_number';
const EXPENSES_FORM_GET_URL = 'https://backendaab.in/aabuilderDash/expenses_form/get_form';

const resolveActiveBranchId = () => {
  try {
    const selectedBranchId = localStorage.getItem('selectedBranchId');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fallbackBranchId = user?.branchId ?? user?.branch_id ?? user?.brachId;
    const resolved = Number(selectedBranchId || fallbackBranchId);
    return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
  } catch {
    return null;
  }
};

const normalizeExpenseToolId = (exp) => {
  const v = exp?.machineTools ?? exp?.itemIdsId ?? exp?.item_ids_id;
  if (v == null || v === '') return '';
  return String(v).trim();
};

const isMachineRepairExpense = (exp) =>
  String(exp?.category || '')
    .trim()
    .toLowerCase() === 'machine repair';

const ServiceHistory = ({ user, onTabChange }) => {
  const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());
  const [viewMode, setViewMode] = useState('live'); // 'live' or 'history'
  const [historyData, setHistoryData] = useState([]);
  const [serviceReturnData, setServiceReturnData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsMap, setProjectsMap] = useState({});
  const [vendorsMap, setVendorsMap] = useState({});
  const [employeesMap, setEmployeesMap] = useState({});
  const [itemNamesMap, setItemNamesMap] = useState({});
  const [brandsMap, setBrandsMap] = useState({});
  const [itemIdsMap, setItemIdsMap] = useState({});
  const [machineNumbersMap, setMachineNumbersMap] = useState({});

  // Resolve module permissions (Create/Edit/Delete) for mobile create actions.
  const [modulePermissions, setModulePermissions] = useState([]);
  useEffect(() => {
    const moduleName = 'Tools Tracker';
    const resolvedUserRoles =
      user?.userRoles ||
      (() => {
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          return stored?.userRoles || [];
        } catch {
          return [];
        }
      })();

    fetchUserModulePermissions(resolvedUserRoles, moduleName)
      .then(setModulePermissions)
      .catch(() => setModulePermissions([]));
  }, [user?.userRoles]);

  const canCreate = modulePermissions.includes('Create');
  const canEdit = modulePermissions.includes('Edit');
  const canManageMachineStatus = canCreate || canEdit;

  // Image viewer state
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imageViewerData, setImageViewerData] = useState({
    images: [],
    currentIndex: 0,
    itemName: '',
    itemId: '',
    machineStatus: ''
  });
  // Bottom sheet state
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Filter bottom sheet state
  const [showFilterBottomSheet, setShowFilterBottomSheet] = useState(false);
  const [filterItemName, setFilterItemName] = useState('');
  const [filterMachineNumber, setFilterMachineNumber] = useState('');
  const [filterItemId, setFilterItemId] = useState('');
  const [filterProjectIncharge, setFilterProjectIncharge] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilterItemNameModal, setShowFilterItemNameModal] = useState(false);
  const [showFilterMachineNumberModal, setShowFilterMachineNumberModal] = useState(false);
  const [showFilterItemIdModal, setShowFilterItemIdModal] = useState(false);
  const [showFilterProjectInchargeModal, setShowFilterProjectInchargeModal] = useState(false);
  const [showFilterDatePicker, setShowFilterDatePicker] = useState(false);
  const [showFilterStatusDropdown, setShowFilterStatusDropdown] = useState(false);
  const [filterStatusSearchQuery, setFilterStatusSearchQuery] = useState('');
  const [filterItemNameSearchQuery, setFilterItemNameSearchQuery] = useState('');
  const [filterMachineNumberSearchQuery, setFilterMachineNumberSearchQuery] = useState('');
  const [filterItemIdSearchQuery, setFilterItemIdSearchQuery] = useState('');
  const [filterProjectInchargeSearchQuery, setFilterProjectInchargeSearchQuery] = useState('');

  const statusOptions = [
    { value: 'Working', label: 'Problem Solved' },
    { value: 'Not Working', label: 'Not Working' },
    { value: 'Under Repair', label: 'Under Repair' },
    { value: 'Machine Dead', label: 'Machine Dead' }
  ];
  const [statusSearchQuery, setStatusSearchQuery] = useState('');
  // Shop Name popup state
  const [showShopNameDropdown, setShowShopNameDropdown] = useState(false);
  const [selectedShopName, setSelectedShopName] = useState(null);
  const [shopNameSearchQuery, setShopNameSearchQuery] = useState('');
  const [serviceStoreOptions, setServiceStoreOptions] = useState([]);
  const [shopNameFavorites, setShopNameFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('favoriteServiceStores');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  // Swipe detection state - track per card
  const [swipeStates, setSwipeStates] = useState({});
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const expandedEntryIdRef = useRef(expandedEntryId);

  // Keep ref in sync with state
  useEffect(() => {
    expandedEntryIdRef.current = expandedEntryId;
  }, [expandedEntryId]);

  const [expensesFormList, setExpensesFormList] = useState([]);

  useEffect(() => {
    const syncBranch = () => {
      const next = resolveActiveBranchId();
      setActiveBranchId((prev) => (prev === next ? prev : next));
    };
    syncBranch();
    window.addEventListener('branchSelectionChanged', syncBranch);
    return () => window.removeEventListener('branchSelectionChanged', syncBranch);
  }, []);

  useEffect(() => {
    const fetchExpensesForm = async () => {
      try {
        const url = new URL(EXPENSES_FORM_GET_URL);
        if (activeBranchId != null) {
          url.searchParams.set('branchId', String(activeBranchId));
        }
        const response = await fetch(url.toString(), {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error('expenses_form get_form failed');
        }
        const data = await response.json();
        setExpensesFormList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching expenses form:', error);
        setExpensesFormList([]);
      }
    };
    fetchExpensesForm();
  }, [activeBranchId]);

  const getMachineStatusKey = (itemIdsId, machineNumberId, machineNumber) => {
    const itemId = String(itemIdsId || '').trim();
    const machineId = String(machineNumberId || '').trim();
    const machineNum = String(machineNumber || '').trim();
    if (!itemId) return '';
    if (machineId) return `${itemId}::id::${machineId}`;
    if (machineNum) return `${itemId}::num::${machineNum}`;
    return '';
  };

  // Helper function to save/update machine status
  const resolveMachineNumberId = (entry) => {
    const directMachineNumberId = entry?.machineNumberId;
    if (directMachineNumberId != null && String(directMachineNumberId).trim() !== '') {
      return String(directMachineNumberId).trim();
    }

    const machineNumberText = String(entry?.machineNumber || '').trim();
    if (!machineNumberText) return '';

    const matchedMachineNumber = Object.entries(machineNumbersMap).find(([, value]) => {
      return String(value || '').trim() === machineNumberText;
    });

    return matchedMachineNumber ? String(matchedMachineNumber[0]).trim() : '';
  };

  const saveMachineStatus = async (itemIdsId, machineNumberId, machineStatus) => {
    if (!itemIdsId || !machineNumberId || !machineStatus) {
      console.error('Missing required fields for saving machine status');
      return false;
    }
    if (!canManageMachineStatus) {
      console.warn('Skipping tools-machine-status/save - user lacks Create/Edit permission');
      return false;
    }
    try {
      const response = await fetch(`${TOOLS_MACHINE_STATUS_BASE_URL}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_ids_id: String(itemIdsId),
          machine_number_id: String(machineNumberId),
          machine_status: machineStatus,
          created_by: user?.name || user?.username || 'mobile'
        })
      });
      if (response.ok) {
        return true;
      } else {
        console.error('Failed to save machine status:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error saving machine status:', error);
      return false;
    }
  };

  const resolveMachineNumberText = (entry) => {
    const machineNumberId = entry?.machineNumberId;
    if (machineNumberId) {
      const byId = machineNumbersMap[String(machineNumberId)];
      if (byId) return byId;
    }
    return entry?.machineNumber || '-';
  };

  // Fetch lookup data for mapping IDs to names
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        // Fetch projects (using siteName field like Transfer.jsx)
        const projectsRes = await fetch(`${PROJECT_NAMES_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(p => {
            map[p.id] = p.siteName || p.site_name || p.projectName || p.project_name || '';
          });
          setProjectsMap(map);
        }

        // Fetch vendors (using vendorName field like Transfer.jsx)
        const vendorsRes = await fetch(`${VENDOR_NAMES_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (vendorsRes.ok) {
          const data = await vendorsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(v => {
            map[v.id] = v.vendorName || v.vendor_name || '';
          });
          setVendorsMap(map);
        }

        // Fetch employees
        const employeesRes = await fetch(`${EMPLOYEE_DETAILS_BASE_URL}/site_engineers`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (employeesRes.ok) {
          const data = await employeesRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(e => {
            map[e.id] = e.employee_name || e.employeeName || '';
          });
          setEmployeesMap(map);
        }

        // Fetch item names
        const itemNamesRes = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (itemNamesRes.ok) {
          const data = await itemNamesRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(i => {
            map[i.id] = i.item_name || i.itemName || '';
          });
          setItemNamesMap(map);
        }

        // Fetch brands
        const brandsRes = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(b => {
            map[b.id] = b.tools_brand || b.toolsBrand || '';
          });
          setBrandsMap(map);
        }

        // Fetch item IDs
        const itemIdsRes = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (itemIdsRes.ok) {
          const data = await itemIdsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(i => {
            const toolsId = i.item_id || i.itemId || '';
            // Store with both string and number keys for flexible lookup
            map[i.id] = toolsId;
            map[String(i.id)] = toolsId;
          });
          setItemIdsMap(map);
        }
      } catch (error) {
        console.error('Error fetching lookup data:', error);
      }
    };
    fetchLookupData();
  }, []);

  // Fetch machine numbers (for resolving machine_number_id to display text)
  useEffect(() => {
    const fetchMachineNumbers = async () => {
      try {
        const response = await fetch(`${TOOLS_MACHINE_NUMBER_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach((m) => {
            const id = m?.id ?? m?._id;
            const machineNumber = (m?.machine_number ?? m?.machineNumber ?? '').trim();
            if (id != null && machineNumber) {
              map[String(id)] = machineNumber;
            }
          });
          setMachineNumbersMap(map);
        }
      } catch (error) {
        console.error('Error fetching machine numbers:', error);
      }
    };
    fetchMachineNumbers();
  }, []);

  // Fetch service store vendors (for Shop Name popup)
  useEffect(() => {
    const fetchServiceStoreVendors = async () => {
      try {
        const response = await fetch(`${VENDOR_NAMES_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          const serviceStoreVendors = (Array.isArray(data) ? data : [])
            .filter(vendor => vendor.makeAsServiceShop === true)
            .map(vendor => ({
              value: vendor.vendorName || vendor.vendor_name || '',
              label: vendor.vendorName || vendor.vendor_name || '',
              id: vendor.id,
            }));
          setServiceStoreOptions(serviceStoreVendors);
        }
      } catch (error) {
        console.error('Error fetching service store vendors:', error);
      }
    };
    fetchServiceStoreVendors();
  }, []);

  // Fetch history data from tools tracker management API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          // Flatten the data - create separate entries for each item
          const flattenedData = [];
          (Array.isArray(data) ? data : []).forEach(entry => {
            const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
            if (entryItems.length === 0) {
              flattenedData.push({
                id: `${entry.id}-0`,
                entryId: entry.id,
                itemTableId: null,
                eno: entry.eno || '',
                toolsEntryType: entry.tools_entry_type || entry.toolsEntryType || 'Entry',
                fromProjectId: entry.from_project_id || entry.fromProjectId || '',
                toProjectId: entry.to_project_id || entry.toProjectId || '',
                serviceStoreId: entry.service_store_id || entry.serviceStoreId || '',
                projectInchargeId: entry.project_incharge_id || entry.projectInchargeId || '',
                createdDateTime: entry.created_date_time || entry.createdDateTime || entry.timestamp || '',
                createdBy: entry.created_by || entry.createdBy || '',
                itemNameId: '',
                brandId: '',
                itemIdsId: '',
                machineNumber: '',
                machineStatus: '',
                quantity: 0,
                description: ''
              });
            } else {
              entryItems.forEach((item, index) => {
                const itemTableId = item.id ?? item.Id ?? null;
                flattenedData.push({
                  id: `${entry.id}-${index}`,
                  entryId: entry.id,
                  itemTableId: itemTableId,
                  eno: entry.eno || '',
                  toolsEntryType: entry.tools_entry_type || entry.toolsEntryType || 'Entry',
                  fromProjectId: entry.from_project_id || entry.fromProjectId || '',
                  toProjectId: entry.to_project_id || entry.toProjectId || '',
                  serviceStoreId: entry.service_store_id || entry.serviceStoreId || '',
                  projectInchargeId: entry.project_incharge_id || entry.projectInchargeId || '',
                  createdDateTime: entry.created_date_time || entry.createdDateTime || entry.timestamp || '',
                  createdBy: entry.created_by || entry.createdBy || '',
                  itemNameId: item.item_name_id || item.itemNameId || '',
                  brandId: item.brand_id || item.brandId || '',
                  itemIdsId: item.item_ids_id || item.itemIdsId || '',
                  machineNumber: item.machine_number || item.machineNumber || '',
                  machineNumberId: item.machine_number_id || item.machineNumberId || '',
                  machineStatus: item.machine_status || item.machineStatus || 'Working',
                  quantity: item.quantity || 0,
                  description: item.description || ''
                });
              });
            }
          });
          // Separate service and service return entries
          const serviceEntries = [];
          const serviceReturnEntries = [];
          flattenedData.forEach((entry) => {
            const type = String(entry.toolsEntryType || '').toLowerCase();
            if (type === 'service') {
              serviceEntries.push(entry);
            } else if (type === 'service_return') {
              serviceReturnEntries.push(entry);
            }
          });

          // Sort service entries by created_date_time (newest first)
          serviceEntries.sort((a, b) => {
            const dateA = new Date(a.createdDateTime);
            const dateB = new Date(b.createdDateTime);
            return dateB - dateA;
          });

          // Fetch latest status list once and resolve current status by item_ids_id + machine_number_id
          let machineStatusList = [];
          try {
            const statusResponse = await fetch(`${TOOLS_MACHINE_STATUS_BASE_URL}/all`, {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              machineStatusList = Array.isArray(statusData) ? statusData : [];
            }
          } catch (error) {
            console.error('Error fetching machine status list:', error);
          }

          const latestStatusByKey = new Map();
          machineStatusList.forEach((statusRow) => {
            const key = getMachineStatusKey(
              statusRow.item_ids_id || statusRow.itemIdsId,
              statusRow.machine_number_id || statusRow.machineNumberId,
              statusRow.machine_number || statusRow.machineNumber
            );
            if (!key) return;
            const existing = latestStatusByKey.get(key);
            const existingId = Number(existing?.id || 0);
            const currentId = Number(statusRow?.id || 0);
            if (!existing || currentId >= existingId) {
              latestStatusByKey.set(key, statusRow);
            }
          });

          const enrichedData = serviceEntries.map((entry) => {
            const key = getMachineStatusKey(entry.itemIdsId, entry.machineNumberId, entry.machineNumber);
            const latestStatusRow = key ? latestStatusByKey.get(key) : null;
            const apiStatus = latestStatusRow
              ? (latestStatusRow.machine_status || latestStatusRow.machineStatus || '')
              : '';

            if (apiStatus) {
              return { ...entry, machineStatus: apiStatus };
            }

            // If this entry has machine_number_id but no status in /all, avoid showing stale dead status.
            if (entry.machineNumberId) {
              return { ...entry, machineStatus: 'Working' };
            }

            return { ...entry, machineStatus: entry.machineStatus || 'Working' };
          });
          setHistoryData(enrichedData);
          setServiceReturnData(serviceReturnEntries);
        } else {
          console.error('Failed to fetch history data');
          setHistoryData([]);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Format timestamp to date and time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: '', time: '' };
    try {
      const date = new Date(timestamp);
      const formattedDate = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return { date: formattedDate, time: formattedTime };
    } catch {
      return { date: '', time: '' };
    }
  };

  // Get location name (project or vendor)
  const getLocationName = (id, checkVendorsFirst = false) => {
    if (!id) return '-';

    // Convert to string for comparison
    const idStr = String(id);

    if (checkVendorsFirst) {
      // Check vendors first (for service stores)
      if (vendorsMap[idStr]) {
        return vendorsMap[idStr];
      }
      if (vendorsMap[id]) {
        return vendorsMap[id];
      }
    }

    // Check projects
    if (projectsMap[idStr]) {
      return projectsMap[idStr];
    }
    if (projectsMap[id]) {
      return projectsMap[id];
    }

    // Check vendors
    if (vendorsMap[idStr]) {
      return vendorsMap[idStr];
    }
    if (vendorsMap[id]) {
      return vendorsMap[id];
    }

    return '-';
  };

  const toolIdsInHistory = useMemo(() => {
    const s = new Set();
    historyData.forEach((e) => {
      const id = String(e.itemIdsId || '').trim();
      if (id) s.add(id);
    });
    return s;
  }, [historyData]);

  const machineRepairExpensesForTrackedTools = useMemo(
    () =>
      expensesFormList.filter(
        (exp) =>
          isMachineRepairExpense(exp) &&
          toolIdsInHistory.has(normalizeExpenseToolId(exp))
      ),
    [expensesFormList, toolIdsInHistory]
  );

  const headerServiceCostTotal = useMemo(() => {
    let list = machineRepairExpensesForTrackedTools;
    if (selectedShopName?.label) {
      const shop = String(selectedShopName.label).trim();
      list = list.filter((e) => String(e.vendor || '').trim() === shop);
    }
    return list.reduce((sum, e) => sum + Math.abs(Number(e.amount) || 0), 0);
  }, [machineRepairExpensesForTrackedTools, selectedShopName]);

  const formatServiceCostRs = (n) => {
    const v = Math.round(Number(n) || 0);
    return v.toLocaleString('en-IN');
  };

  const computeServiceCostForEntry = (entry) => {
    const tid = String(entry.itemIdsId || '').trim();
    if (!tid) return 0;
    let shopName = getLocationName(entry.serviceStoreId, true);
    const fromVendor = shopName !== '-';
    if (!fromVendor) {
      shopName = getLocationName(entry.toProjectId, false);
    }
    return machineRepairExpensesForTrackedTools.reduce((sum, exp) => {
      if (normalizeExpenseToolId(exp) !== tid) return sum;
      if (shopName === '-') {
        return sum + Math.abs(Number(exp.amount) || 0);
      }
      if (fromVendor) {
        if (String(exp.vendor || '').trim() !== String(shopName).trim()) return sum;
      } else {
        if (String(exp.siteName || '').trim() !== String(shopName).trim()) return sum;
      }
      return sum + Math.abs(Number(exp.amount) || 0);
    }, 0);
  };

  // Image viewer handlers - fetch images on demand via API
  const handleOpenImageViewer = async (entry, itemName, displayValue) => {
    const itemTableId = entry.itemTableId;
    if (!itemTableId) {
      alert('No images available for this item');
      return;
    }
    setImageViewerData({
      images: [],
      currentIndex: 0,
      itemName: itemName,
      itemId: displayValue,
      machineStatus: entry.machineStatus || ''
    });
    setShowImageViewer(true);
    setImagesLoading(true);
    try {
      const res = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/items/${itemTableId}/images`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        setImageViewerData(prev => ({ ...prev, images: [] }));
        setImagesLoading(false);
        return;
      }
      const rawImages = await res.json();
      const arr = Array.isArray(rawImages) ? rawImages : [];
      const processedImages = arr.map(img => {
        const base64 = img.tools_image ?? img.toolsImage;
        const url = img.tools_image_url ?? img.toolsImageUrl;
        if (base64) return `data:image/jpeg;base64,${base64}`;
        if (url) return url;
        return null;
      }).filter(Boolean);
      setImageViewerData(prev => ({
        ...prev,
        images: processedImages,
        currentIndex: 0
      }));
      if (processedImages.length === 0) {
        alert('No images available for this item');
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      alert('Failed to load images');
      setImageViewerData(prev => ({ ...prev, images: [] }));
    } finally {
      setImagesLoading(false);
    }
  };

  const handleCloseImageViewer = () => {
    setShowImageViewer(false);
  };

  const handlePrevImage = () => {
    setImageViewerData(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }));
  };

  const handleNextImage = () => {
    setImageViewerData(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1
    }));
  };

  // Bottom sheet handlers
  const handleCardClickForBottomSheet = (entry) => {
    setSelectedEntry(entry);
    const statusToSet = entry.machineStatus || '';
    setSelectedStatus(statusToSet);
    setShowBottomSheet(true);
  };

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
    setSelectedEntry(null);
    setSelectedStatus('');
    setShowStatusDropdown(false);
    setStatusSearchQuery('');
  };

  const handleSaveFilter = async () => {
    if (!selectedEntry || !selectedStatus) {
      handleCloseBottomSheet();
      return;
    }

    const resolvedMachineNumberId = resolveMachineNumberId(selectedEntry);

    if (!selectedEntry.itemIdsId || !resolvedMachineNumberId) {
      console.error('Unable to resolve machine status payload', {
        itemIdsId: selectedEntry.itemIdsId,
        machineNumberId: selectedEntry.machineNumberId,
        machineNumber: selectedEntry.machineNumber
      });
      alert('Machine number details are missing for this item, so the status could not be updated.');
      handleCloseBottomSheet();
      return;
    }

    // Save machine status to the new API
    const success = await saveMachineStatus(
      selectedEntry.itemIdsId,
      resolvedMachineNumberId,
      selectedStatus
    );

    if (success) {
      // Update local state to reflect the change
      setHistoryData(prevData =>
        prevData.map(entry =>
          entry.id === selectedEntry.id
            ? { ...entry, machineStatus: selectedStatus }
            : entry
        )
      );
      alert('Machine status updated successfully');
    } else {
      alert('Failed to update machine status. Please try again.');
    }

    handleCloseBottomSheet();
  };

  const handleCardClick = (e) => {
    // Don't trigger if clicking on the action buttons
    if (e.target.closest('.action-button')) {
      return;
    }
    // Don't trigger if clicking on item ID (for image viewer)
    if (e.target.closest('.item-id-clickable')) {
      return;
    }
    // Close expanded card if clicking elsewhere
    if (expandedEntryId) {
      setExpandedEntryId(null);
    } else {
      // Open bottom sheet if card is not expanded
      const entryId = e.currentTarget.dataset.entryId;
      if (entryId) {
        const entry = historyData.find(ent => ent.id === entryId);
        if (entry) {
          handleCardClickForBottomSheet(entry);
        }
      }
    }
  };

  // Swipe handlers
  const minSwipeDistance = 50;
  const handleTouchStart = (e, entryId) => {
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    setSwipeStates(prev => ({
      ...prev,
      [entryId]: {
        startX: touch.clientX,
        currentX: touch.clientX,
        isSwiping: false
      }
    }));
  };

  const handleTouchMove = (e, entryId) => {
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    setSwipeStates(prev => {
      const state = prev[entryId];
      if (!state) return prev;
      const deltaX = touch.clientX - state.startX;
      const isExpanded = expandedEntryIdRef.current === entryId;
      // Only allow left swipe (negative deltaX)
      if (deltaX < 0 || (isExpanded && deltaX > 0)) {
        return {
          ...prev,
          [entryId]: {
            ...state,
            currentX: touch.clientX,
            isSwiping: true
          }
        };
      }
      return prev;
    });
  };

  const handleTouchEnd = (entryId) => {
    setSwipeStates(prev => {
      const state = prev[entryId];
      if (!state) return prev;
      const deltaX = state.currentX - state.startX;
      const absDeltaX = Math.abs(deltaX);

      if (absDeltaX >= minSwipeDistance) {
        if (deltaX < 0) {
          // Swiped left (reveal buttons)
          setExpandedEntryId(entryId);
        } else {
          // Swiped right (hide buttons)
          setExpandedEntryId(null);
        }
      } else {
        // Small movement - snap back
        if (expandedEntryIdRef.current === entryId) {
          setExpandedEntryId(null);
        }
      }

      // Remove swipe state
      const newState = { ...prev };
      delete newState[entryId];
      return newState;
    });
  };

  const handleMouseDown = (e, entryId) => {
    if (e.button !== 0) return; // Only handle left mouse button
    const syntheticEvent = {
      touches: [{ clientX: e.clientX }],
      preventDefault: () => e.preventDefault()
    };
    handleTouchStart(syntheticEvent, entryId);
  };

  // Global mouse handlers for desktop support
  useEffect(() => {
    if (historyData.length === 0) return;

    const globalMouseMoveHandler = (e) => {
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };
        historyData.forEach(entry => {
          const state = prev[entry.id];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          const isExpanded = expandedEntryIdRef.current === entry.id;
          // Only update if dragging horizontally
          if (deltaX < 0 || (isExpanded && deltaX > 0)) {
            newState[entry.id] = {
              ...state,
              currentX: e.clientX,
              isSwiping: true
            };
            hasChanges = true;
          }
        });
        return hasChanges ? newState : prev;
      });
    };

    const globalMouseUpHandler = () => {
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };
        historyData.forEach(entry => {
          const state = prev[entry.id];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              // Swiped left (reveal buttons)
              setExpandedEntryId(entry.id);
            } else {
              // Swiped right (hide buttons)
              setExpandedEntryId(null);
            }
          } else {
            // Small movement - snap back
            if (expandedEntryIdRef.current === entry.id) {
              setExpandedEntryId(null);
            }
          }
          // Remove swipe state for this card
          delete newState[entry.id];
          hasChanges = true;
        });
        return hasChanges ? newState : prev;
      });
    };

    // Add global mouse event listeners
    document.addEventListener('mousemove', globalMouseMoveHandler);
    document.addEventListener('mouseup', globalMouseUpHandler);
    return () => {
      document.removeEventListener('mousemove', globalMouseMoveHandler);
      document.removeEventListener('mouseup', globalMouseUpHandler);
    };
  }, [historyData]);

  const buildItemKey = (entry) => {
    const itemNameId = entry?.itemNameId || '';
    const itemIdsId = entry?.itemIdsId || '';
    const machineNumberId = entry?.machineNumberId || '';
    const machineNumber = entry?.machineNumber || '';
    return [itemNameId, itemIdsId, machineNumberId, machineNumber].join('::');
  };

  // Get status display text and color
  const getStatusDisplay = (status) => {
    const normalized = String(status || '').trim();
    if (normalized === 'Machine Dead') {
      return { text: 'Machine Dead', color: 'text-[#F44336]' };
    }
    if (normalized === 'Not Working') {
      return { text: 'Not Working', color: 'text-[#F44336]' };
    }
    if (normalized === 'Under Repair') {
      return { text: 'Under Repair', color: 'text-[#FF9800]' };
    }
    if (normalized === 'Working') {
      return { text: 'Working', color: 'text-[#4CAF50]' };
    }
    return { text: normalized || 'Pending', color: 'text-[#BF9853]' };
  };

  // Get filter options
  const filterItemNameOptions = Object.values(itemNamesMap).filter(Boolean);
  const filterMachineNumberOptions = Array.from(
    new Set(historyData.map((entry) => resolveMachineNumberText(entry)).filter(Boolean))
  );
  const filterItemIdOptions = Object.values(itemIdsMap).filter(Boolean);
  const filterProjectInchargeOptions = Object.values(employeesMap).filter(Boolean);

  // Helper functions for Shop Name popup
  const normalizeSearchText = (text) => {
    if (!text) return '';
    return String(text).toLowerCase().trim();
  };

  const getFilteredServiceStoreOptions = () => {
    const normalizedQuery = normalizeSearchText(shopNameSearchQuery);
    const filtered = serviceStoreOptions.filter(option => {
      const normalizedLabel = normalizeSearchText(option.label);
      return normalizedLabel.includes(normalizedQuery);
    });
    return filtered.sort((a, b) => {
      const aIsFavorite = shopNameFavorites.includes(a.id);
      const bIsFavorite = shopNameFavorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.label.localeCompare(b.label);
    });
  };

  const handleToggleShopNameFavorite = (e, optionId) => {
    e.stopPropagation();
    const newFavorites = shopNameFavorites.includes(optionId)
      ? shopNameFavorites.filter(id => id !== optionId)
      : [...shopNameFavorites, optionId];
    setShopNameFavorites(newFavorites);
    localStorage.setItem('favoriteServiceStores', JSON.stringify(newFavorites));
  };

  // Pre-compute returned item keys (items that have been returned to any project)
  const returnedItemKeys = new Set(
    serviceReturnData
      .filter((retEntry) => retEntry.toProjectId)
      .map(buildItemKey)
  );

  // Filter bottom sheet handlers
  const getFilteredFilterItemNames = () => {
    if (!filterItemNameSearchQuery.trim()) return filterItemNameOptions;
    const q = normalizeSearchText(filterItemNameSearchQuery);
    return filterItemNameOptions.filter(name => normalizeSearchText(name).includes(q));
  };
  const getFilteredFilterMachineNumbers = () => {
    if (!filterMachineNumberSearchQuery.trim()) return filterMachineNumberOptions;
    const q = normalizeSearchText(filterMachineNumberSearchQuery);
    return filterMachineNumberOptions.filter(num => normalizeSearchText(num).includes(q));
  };
  const getFilteredFilterItemIds = () => {
    if (!filterItemIdSearchQuery.trim()) return filterItemIdOptions;
    const q = normalizeSearchText(filterItemIdSearchQuery);
    return filterItemIdOptions.filter(id => normalizeSearchText(id).includes(q));
  };
  const getFilteredFilterProjectIncharges = () => {
    if (!filterProjectInchargeSearchQuery.trim()) return filterProjectInchargeOptions;
    const q = normalizeSearchText(filterProjectInchargeSearchQuery);
    return filterProjectInchargeOptions.filter(name => normalizeSearchText(name).includes(q));
  };

  const handleCloseFilterBottomSheet = () => {
    setShowFilterBottomSheet(false);
    setShowFilterItemNameModal(false);
    setShowFilterMachineNumberModal(false);
    setShowFilterItemIdModal(false);
    setShowFilterProjectInchargeModal(false);
    setShowFilterDatePicker(false);
    setShowFilterStatusDropdown(false);
    setFilterStatusSearchQuery('');
    setFilterItemNameSearchQuery('');
    setFilterMachineNumberSearchQuery('');
    setFilterItemIdSearchQuery('');
    setFilterProjectInchargeSearchQuery('');
  };

  const handleSaveFilterBottomSheet = () => {
    // Apply filters here (you can implement the filtering logic)
    handleCloseFilterBottomSheet();
  };

  return (
    <div className="flex flex-col bg-white min-h-[calc(100vh-90px-80px)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="sticky top-0 bg-white z-10 flex-shrink-0">
        {/* Top Header Section */}
        <div className="flex-shrink-0">
          <div className="flex justify-between  items-start border-b border-gray-200 pb-[8px]">
            <div className="flex items-center gap-[4px] min-w-0">
              <p
                className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline"
                onClick={() => setShowShopNameDropdown(true)}
              >
                {selectedShopName ? selectedShopName.label : 'Shop Name'}
              </p>
              {selectedShopName && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedShopName(null);
                    setShopNameSearchQuery('');
                  }}
                  className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="#848484" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                </button>
              )}
            </div>
            <div className="flex items-center gap-[10px]">
              <span className="text-[12px] text-[#848484] leading-normal flex items-center gap-[4px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#848484]" />
                {selectedShopName ? 'P C: 0' : 'Purchase Cost: 0'}
              </span>
              <span className="text-[12px] font-semibold text-[#BF9853] leading-normal flex items-center gap-[4px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BF9853]" />
                {selectedShopName
                  ? `S C: ${formatServiceCostRs(headerServiceCostTotal)}`
                  : `Service Cost: ${formatServiceCostRs(headerServiceCostTotal)}`}
              </span>
            </div>
          </div>
        </div>
        {/* Live/History Toggle */}
        <div className="flex-shrink-0 pt-[8px]">
          <div className="flex bg-[#F2F4F7] items-center h-[32px] rounded-md">
          <button
            onClick={() => setViewMode('live')}
            className={`flex-1 ml-0.5 h-[28px] rounded text-[12px] font-semibold leading-normal duration-1000 ease-out transition-colors ${
              viewMode === 'live'
                ? 'bg-white text-black'
                : 'bg-transparent text-black'
            }`}
          >
            Live
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`flex-1 mr-0.5 h-[28px] rounded text-[12px] font-semibold leading-normal duration-1000 ease-out transition-colors ${
              viewMode === 'history'
                ? 'bg-white text-black'
                : 'bg-transparent text-black'
            }`}
          >
            History
          </button>
        </div>
        </div>
      </div>
      {/* Filter and Download Row - same look as History.jsx */}
      <div className="flex justify-between items-center gap-[4px] px-0 pt-[6px] pb-[6px] flex-shrink-0">
        <div className="flex items-center gap-[4px] min-w-0">
          <button onClick={() => setShowFilterBottomSheet(true)} className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0">
            <img src={Filter} alt="Filter" className="w-[13px] h-[11px]" />
            {!(filterItemName || filterMachineNumber || filterItemId || filterProjectIncharge || filterDate || filterStatus) && (
              <span className="text-[12px] font-medium text-black flex-shrink-0">Filter</span>
            )}
          </button>
          <div className="flex items-center gap-[4px] overflow-x-auto no-scrollbar scrollbar-none min-w-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {(filterItemName || filterMachineNumber || filterItemId || filterProjectIncharge || filterDate || filterStatus) && (
              <div className="flex items-center gap-[4px] flex-nowrap">
                
                {filterItemName && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Item Name</span>
                    <button onClick={() => setFilterItemName('')} className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                )}
                {filterMachineNumber && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Machine</span>
                    <button onClick={() => setFilterMachineNumber('')} className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                )}
                {filterItemId && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Item ID</span>
                    <button onClick={() => setFilterItemId('')} className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                )}
                {filterProjectIncharge && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Incharge</span>
                    <button onClick={() => setFilterProjectIncharge('')} className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                )}
                {filterDate && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Date</span>
                    <button onClick={() => setFilterDate('')} className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                )}
                {filterStatus && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Status</span>
                    <button onClick={() => setFilterStatus('')} className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <button className="text-[12px] font-semibold text-black cursor-pointer hover:opacity-80 flex-shrink-0">
          Download
        </button>
      </div>

      {/* Service Records List */}
      <div className="flex-1 overflow-y-auto pb-[16px]">
        {loading ? (
          <div className="flex items-center justify-center py-[32px]">
            <p className="text-[12px] text-gray-500">Loading...</p>
          </div>
        ) : historyData.length === 0 ? (
          <div className="flex items-center justify-center py-[32px]">
            <p className="text-[12px] text-gray-500">No service history entries found.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {historyData.filter((entry) => {
              // Apply Live vs History view filtering
              if (viewMode === 'live') {
                // Build a set of item keys that have been returned to any project
                const returnedItemKeys = new Set(
                  serviceReturnData
                    .filter(retEntry => retEntry.toProjectId)
                    .map(buildItemKey)
                );
                const key = buildItemKey(entry);
                if (key && returnedItemKeys.has(key)) {
                  return false;
                }
              }

              // Filter by Item ID
              if (filterItemId) {
                const itemIdName = entry.itemIdsId ? (itemIdsMap[entry.itemIdsId] || itemIdsMap[String(entry.itemIdsId)] || '') : '';
                if (!itemIdName || String(itemIdName).toLowerCase() !== String(filterItemId).toLowerCase()) {
                  return false;
                }
              }
              // Filter by Item Name
              if (filterItemName) {
                const itemName = itemNamesMap[entry.itemNameId] || itemNamesMap[String(entry.itemNameId)] || '';
                if (!itemName || String(itemName).toLowerCase() !== String(filterItemName).toLowerCase()) {
                  return false;
                }
              }
              // Filter by Machine Number
              if (filterMachineNumber) {
                const machineText = resolveMachineNumberText(entry);
                if (!machineText || String(machineText).toLowerCase() !== String(filterMachineNumber).toLowerCase()) {
                  return false;
                }
              }
              // Filter by Project Incharge
              if (filterProjectIncharge) {
                const inchargeName = employeesMap[entry.projectInchargeId] || employeesMap[String(entry.projectInchargeId)] || '';
                if (!inchargeName || String(inchargeName).toLowerCase() !== String(filterProjectIncharge).toLowerCase()) {
                  return false;
                }
              }
              // Filter by Date
              if (filterDate) {
                const entryDate = entry.date || (entry.createdDateTime ? new Date(entry.createdDateTime).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-') : '');
                const filterDateNorm = filterDate.replace(/\//g, '-');
                if (!entryDate || entryDate.replace(/\//g, '-') !== filterDateNorm) {
                  return false;
                }
              }
              // Filter by Status
              if (filterStatus) {
                const entryStatus = (entry.machineStatus || entry.machine_status || '').toString().toLowerCase();
                const statusVal = (filterStatus || '').toString().toLowerCase();
                if (entryStatus !== statusVal) {
                  return false;
                }
              }
              return true;
            }).map((entry) => {
              const { date, time } = formatDateTime(entry.createdDateTime);

              // For Service type: check serviceStoreId first (vendors), then toProjectId
              let shopName = getLocationName(entry.serviceStoreId, true);
              if (shopName === '-') {
                shopName = getLocationName(entry.toProjectId, false);
              }

              const inchargeName = employeesMap[entry.projectInchargeId] || employeesMap[String(entry.projectInchargeId)] || '-';
              const itemName = itemNamesMap[entry.itemNameId] || itemNamesMap[String(entry.itemNameId)] || entry.itemNameId || '-';

              // Get item ID name (like "AA DM 01") from the map using item_ids_id
              const itemIdName = entry.itemIdsId ? (itemIdsMap[entry.itemIdsId] || itemIdsMap[String(entry.itemIdsId)] || '') : '';
              const canViewImages = Boolean(entry.itemTableId);
              const machineNumberText = resolveMachineNumberText(entry);

              // Get status display
              const statusDisplay = getStatusDisplay(entry.machineStatus);

              const serviceCost = computeServiceCostForEntry(entry);

              // Swipe state and offset calculation
              const entryId = entry.id;
              const swipeState = swipeStates[entryId];
              const isExpanded = expandedEntryId === entryId;
              const buttonWidth = 96; // 2 * 40px + gap
              const swipeOffset =
                swipeState && swipeState.isSwiping
                  ? Math.max(-buttonWidth, swipeState.currentX - swipeState.startX)
                  : isExpanded
                    ? -buttonWidth
                    : 0;

              return (
                <div key={entry.id} className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] h-[100px]">
                  {/* Card */}
                  <div
                    data-entry-id={entryId}
                    className="bg-white rounded-[8px] h-full px-[12px] py-[10px] cursor-pointer transition-all duration-300 ease-out select-none"
                    style={{
                      transform: `translateX(${swipeOffset}px)`,
                      touchAction: 'pan-y',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                    onTouchStart={(e) => handleTouchStart(e, entryId)}
                    onTouchMove={(e) => handleTouchMove(e, entryId)}
                    onTouchEnd={() => handleTouchEnd(entryId)}
                    onMouseDown={(e) => handleMouseDown(e, entryId)}
                    onClick={handleCardClick}
                  >
                    {/* Row 1: Entry number + Item Name | Date (if separate) */}
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[12px] font-semibold text-black leading-snug truncate flex-1 min-w-0">
                        #{entry.eno}, {itemName}
                      </p>
                    </div>

                    {/* Row 2: Machine Number | Person Name */}
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[12px] font-semibold text-black leading-snug truncate flex-1 min-w-0">
                        {machineNumberText}
                      </p>
                      <p className="text-[12px] text-black leading-snug flex-shrink-0 ml-2">
                        {inchargeName}
                      </p>
                    </div>

                    {/* Row 3: Shop Name | Status + Cost */}
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[11px] font-semibold leading-snug truncate flex-1 min-w-0 text-[#BF9853]">
                        {shopName}
                      </p>
                      <p className="text-[11px] leading-snug flex-shrink-0 ml-2">
                        <span className={`font-medium ${statusDisplay.color}`}>
                          {statusDisplay.text}
                        </span>
                        <span className="text-[#4CAF50] font-medium">, Rs.{serviceCost}</span>
                      </p>
                    </div>

                    {/* Row 4: Date/Time | Item ID (green) */}
                    <div className="flex items-start justify-between">
                      <p className="text-[11px] text-[#848484] leading-snug truncate flex-1 min-w-0">
                        {date} • {time}
                      </p>
                      {itemIdName && (
                        <p
                          className={`item-id-clickable text-[12px] font-semibold leading-snug flex-shrink-0 ml-2 ${canViewImages ? 'text-black cursor-pointer underline' : 'text-[#4CAF50]'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canViewImages) {
                              handleOpenImageViewer(entry, itemName, itemIdName || 'View');
                            }
                          }}
                        >
                          {itemIdName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Behind the card on the right, revealed on swipe */}
                  <div
                    className="absolute right-0 top-[0px] bottom-0 flex gap-[8px] flex-shrink-0 z-0"
                    style={{
                      opacity:
                        isExpanded ||
                          (swipeState && swipeState.isSwiping && swipeOffset < -20)
                          ? 1
                          : 0,
                      transition: 'opacity 0.2s ease-out',
                      pointerEvents: isExpanded ? 'auto' : 'none'
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedEntryId(null);
                        // Handle edit - store only entry ID to avoid localStorage quota issues
                        localStorage.setItem('editingToolsTrackerEntryId', String(entry.entryId));
                        // Switch to Transfer tab
                        if (onTabChange) {
                          onTabChange('transfer');
                        }
                      }}
                      className="action-button w-[40px] h-full bg-[#007233] rounded-[6px] flex items-center justify-center gap-[6px] hover:bg-[#22a882] transition-colors shadow-sm"
                    >
                      <img src={EditIcon} alt="Edit" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedEntryId(null);
                      }}
                      className="action-button w-[40px] h-full bg-[#E4572E] flex rounded-[6px] items-center justify-center gap-[6px] hover:bg-[#cc4d26] transition-colors shadow-sm"
                    >
                      <img src={DeleteIcon} alt="Delete" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Viewer Modal - Floating style */}
      {showImageViewer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleCloseImageViewer}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>

          {/* Image Container */}
          <div
            className="relative z-10 w-full max-w-[90%] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative">
              {imagesLoading ? (
                <div className="flex items-center justify-center min-h-[200px] rounded-lg bg-gray-100">
                  <p className="text-[14px] text-gray-600">Loading images...</p>
                </div>
              ) : imageViewerData.images.length > 0 && imageViewerData.images[imageViewerData.currentIndex] ? (
                <img
                  src={imageViewerData.images[imageViewerData.currentIndex]}
                  alt={`${imageViewerData.itemName} - ${imageViewerData.currentIndex + 1}`}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <div className="flex items-center justify-center min-h-[200px] rounded-lg bg-gray-100">
                  <p className="text-[14px] text-gray-600">No images available</p>
                </div>
              )}
              {/* Close Button - Inside image at top right */}
              <button
                onClick={handleCloseImageViewer}
                className="absolute -top-[28px] -right-1 w-8 h-8 rounded-full flex items-center justify-center z-20 "
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#E4572E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {/* Previous Button */}
              {imageViewerData.images.length > 1 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}

              {/* Next Button */}
              {imageViewerData.images.length > 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}

              {/* Image Counter */}
              {imageViewerData.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 px-[12px] py-[4px] rounded-full">
                  <span className="text-[12px] text-white">
                    {imageViewerData.currentIndex + 1} / {imageViewerData.images.length}
                  </span>
                </div>
              )}
            </div>

            {/* Status indicator below image */}
            <div className="flex items-center justify-center gap-[8px] mt-3">
              <span
                className={`w-2 h-2 rounded-full ${imageViewerData.machineStatus === 'Working' ? 'bg-[#4CAF50]' :
                  imageViewerData.machineStatus === 'Not Working' || imageViewerData.machineStatus === 'Machine Dead' ? 'bg-[#F44336]' :
                    imageViewerData.machineStatus === 'Under Repair' ? 'bg-[#FF9800]' :
                      'bg-[#9E9E9E]'
                  }`}
              ></span>
              <p
                className={`text-[12px] font-medium ${imageViewerData.machineStatus === 'Working' ? 'text-[#4CAF50]' :
                  imageViewerData.machineStatus === 'Not Working' || imageViewerData.machineStatus === 'Machine Dead' ? 'text-[#F44336]' :
                    imageViewerData.machineStatus === 'Under Repair' ? 'text-[#FF9800]' :
                      'text-[#9E9E9E]'
                  }`}
              >
                {imageViewerData.machineStatus}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet Modal */}
      {showBottomSheet && (
        <div
          className="fixed inset-0 z-[100] flex items-end"
          onClick={handleCloseBottomSheet}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>

          {/* Bottom Sheet */}
          <div
            className="relative z-10 w-full bg-white rounded-t-[20px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-[16px] pt-[16px] pb-[12px] border-b border-gray-200">
              <p className="text-[16px] font-semibold text-black">Select Filters</p>
              <button
                onClick={handleCloseBottomSheet}
                className="w-6 h-6 flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-[16px] py-[16px]">
              {/* Machine Status Filter */}
              <div className="mb-4">
                <label className="block text-[14px] font-medium text-black mb-2">
                  Machine Status
                </label>
                <button
                  onClick={() => setShowStatusDropdown(true)}
                  className="w-full px-[12px] py-[10px] text-left bg-white border border-gray-300 rounded-[8px] flex items-center justify-between"
                >
                  <span className={`text-[14px] ${selectedStatus ? 'text-black' : 'text-gray-400'}`}>
                    {(statusOptions.find(o => o.value === selectedStatus)?.label) || 'Select Status'}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 9L12 15L18 9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-[12px] px-[16px] pb-[8px]">
              <button
                onClick={handleCloseBottomSheet}
                className="flex-1 px-[16px] py-[12px] text-[14px] font-medium text-black bg-white border border-gray-300 rounded-[8px] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                className="flex-1 px-[16px] py-[12px] text-[14px] font-medium text-white bg-black rounded-[8px] hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          </div>

          {/* Select Status Modal - centered overlay when Machine Status dropdown is clicked */}
          {showStatusDropdown && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center px-[16px]"
              onClick={() => setShowStatusDropdown(false)}
            >
              <div
                className="absolute inset-0 bg-black bg-opacity-40"
              />
              <div
                className="relative z-10 w-full max-w-[340px] bg-white rounded-[12px] shadow-xl p-[16px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[16px] font-semibold text-black">Select Status</p>
                  <button
                    onClick={() => setShowStatusDropdown(false)}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                {/* Search Bar */}
                <div className="relative mb-3">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search"
                    value={statusSearchQuery}
                    onChange={(e) => setStatusSearchQuery(e.target.value)}
                    className="w-full pl-[36px] pr-[12px] py-[10px] text-[14px] border border-gray-300 rounded-[8px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
                {/* Radio Options */}
                <div className="space-y-0">
                  {statusOptions
                    .filter((opt) =>
                      opt.label.toLowerCase().includes(statusSearchQuery.toLowerCase())
                    )
                    .map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedStatus(option.value);
                          setShowStatusDropdown(false);
                          setStatusSearchQuery('');
                        }}
                        className={`w-full flex items-center justify-between px-[12px] py-[10px] rounded-[8px] text-left ${selectedStatus === option.value
                          ? 'bg-[#FFF3E0]'
                          : 'hover:bg-gray-50'
                          }`}
                      >
                        <span className={`text-[14px] ${selectedStatus === option.value ? 'font-medium' : ''}`}>
                          {option.label}
                        </span>
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedStatus === option.value
                            ? 'border-[#E07C24] bg-white'
                            : 'border-gray-300 bg-white'
                            }`}
                        >
                          {selectedStatus === option.value && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E07C24]" />
                          )}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Bottom Sheet Modal */}
      {showFilterBottomSheet && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-end justify-center"
          onClick={handleCloseFilterBottomSheet}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {/* Bottom Sheet - same as History.jsx */}
          <div
            className="bg-white w-full h-[380px] rounded-tl-[16px] rounded-tr-[16px] relative z-[101] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-1">
              <p className="text-[16px] font-bold text-black">Select Filters</p>
              <button type="button" onClick={handleCloseFilterBottomSheet} className="text-[#e06256] text-xl font-bold leading-none">
                <img src={Close} alt="close" className="w-[11px] h-[11px]" />
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Item Name - same as History.jsx */}
              <div className="mb-4">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Item Name</p>
                <div className="relative">
                  <div
                    onClick={() => setShowFilterItemNameModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0"
                    style={{ color: filterItemName ? '#000' : '#9E9E9E', boxSizing: 'border-box' }}
                  >
                    <span className="truncate">{filterItemName || 'Select Item Name'}</span>
                  </div>
                  {filterItemName && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFilterItemName(''); }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                    </button>
                  )}
                  {!filterItemName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Machine Number - same as History.jsx */}
              <div className="mb-4">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Machine Number</p>
                <div className="relative">
                  <div
                    onClick={() => setShowFilterMachineNumberModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0"
                    style={{ color: filterMachineNumber ? '#000' : '#9E9E9E', boxSizing: 'border-box' }}
                  >
                    <span className="truncate">{filterMachineNumber || 'Select Machine Number'}</span>
                  </div>
                  {filterMachineNumber && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFilterMachineNumber(''); }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                    </button>
                  )}
                  {!filterMachineNumber && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  )}
                </div>
              </div>
              {/* Item ID & Project Incharge - flex side by side */}
              <div className="flex gap-[8px] mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Item ID</p>
                  <div className="relative">
                    <div
                      onClick={() => setShowFilterItemIdModal(true)}
                      className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0"
                      style={{ color: filterItemId ? '#000' : '#9E9E9E', boxSizing: 'border-box' }}
                    >
                      <span className="truncate">{filterItemId || 'Select Item ID'}</span>
                    </div>
                    {filterItemId && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFilterItemId(''); }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    )}
                    {!filterItemId && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Project Incharge</p>
                  <div className="relative">
                    <div
                      onClick={() => setShowFilterProjectInchargeModal(true)}
                      className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0"
                      style={{ color: filterProjectIncharge ? '#000' : '#9E9E9E', boxSizing: 'border-box' }}
                    >
                      <span className="truncate">{filterProjectIncharge || 'Select Incharge'}</span>
                    </div>
                    {filterProjectIncharge && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFilterProjectIncharge(''); }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    )}
                    {!filterProjectIncharge && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Date */}
              <div className='flex gap-[8px]'>
                <div className='flex-1'>
                  <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Date</p>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={filterDate || ''}
                      onClick={() => setShowFilterDatePicker(true)}
                      onFocus={() => setShowFilterDatePicker(true)}
                      placeholder="dd-mm-yyyy"
                      className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] pl-[12px] pr-[40px] text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500 cursor-pointer"
                      style={{ color: filterDate ? '#000' : '#9E9E9E' }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11 1V4M5 1V4M2 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Status */}
                <div className='flex-1'>
                  <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Status</p>
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterStatusDropdown(true)}
                      className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[40px] text-[12px] font-medium bg-white flex items-center cursor-pointer text-left"
                      style={{ color: filterStatus ? '#000' : '#9E9E9E', boxSizing: 'border-box', paddingRight: '40px' }}
                    >
                      {(statusOptions.find(o => o.value === filterStatus)?.label) || 'Select'}
                    </button>
                    {filterStatus && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFilterStatus(''); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    )}
                    {!filterStatus && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter dropdown modals - History.jsx style */}
      {showFilterItemNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={() => { setShowFilterItemNameModal(false); setFilterItemNameSearchQuery(''); }}>
          <div className="w-full max-w-[360px] rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col bg-white overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-[16px] font-semibold text-black">Select Item Name</p>
              <button type="button" onClick={() => { setShowFilterItemNameModal(false); setFilterItemNameSearchQuery(''); }} className="w-6 h-6 flex items-center justify-center">
                <img src={CloseIcon} alt="Close" className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-2">
              <div className="relative">
                <img src={Search} alt="Search" className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
                <input type="text" value={filterItemNameSearchQuery} onChange={(e) => setFilterItemNameSearchQuery(e.target.value)} placeholder="Search" className="w-full h-[32px] pl-[30px] pr-3 border border-[rgba(0,0,0,0.16)] rounded text-[12px] outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
              {getFilteredFilterItemNames().length === 0 ? (
                <p className="text-[12px] text-gray-500 py-4">No options found</p>
              ) : (
                getFilteredFilterItemNames().map((opt) => (
                  <button key={opt} type="button" onClick={() => { setFilterItemName(opt); setShowFilterItemNameModal(false); setFilterItemNameSearchQuery(''); }} className="w-full h-[44px] flex items-center justify-start px-3 rounded text-left text-[14px] font-medium hover:bg-[#F5F5F5] transition-colors" style={{ backgroundColor: filterItemName === opt ? '#FFF9E6' : undefined }}>{opt}</button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {showFilterMachineNumberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={() => { setShowFilterMachineNumberModal(false); setFilterMachineNumberSearchQuery(''); }}>
          <div className="w-full max-w-[360px] rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col bg-white overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-[16px] font-semibold text-black">Select Machine Number</p>
              <button type="button" onClick={() => { setShowFilterMachineNumberModal(false); setFilterMachineNumberSearchQuery(''); }} className="w-6 h-6 flex items-center justify-center">
                <img src={CloseIcon} alt="Close" className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-2">
              <div className="relative">
                <img src={Search} alt="Search" className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
                <input type="text" value={filterMachineNumberSearchQuery} onChange={(e) => setFilterMachineNumberSearchQuery(e.target.value)} placeholder="Search" className="w-full h-[32px] pl-[30px] pr-3 border border-[rgba(0,0,0,0.16)] rounded text-[12px] outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
              {getFilteredFilterMachineNumbers().length === 0 ? (
                <p className="text-[12px] text-gray-500 py-4">No options found</p>
              ) : (
                getFilteredFilterMachineNumbers().map((opt) => (
                  <button key={opt} type="button" onClick={() => { setFilterMachineNumber(opt); setShowFilterMachineNumberModal(false); setFilterMachineNumberSearchQuery(''); }} className="w-full h-[44px] flex items-center justify-start px-3 rounded text-left text-[14px] font-medium hover:bg-[#F5F5F5] transition-colors" style={{ backgroundColor: filterMachineNumber === opt ? '#FFF9E6' : undefined }}>{opt}</button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {showFilterItemIdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={() => { setShowFilterItemIdModal(false); setFilterItemIdSearchQuery(''); }}>
          <div className="w-full max-w-[360px] rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col bg-white overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-[16px] font-semibold text-black">Select Item ID</p>
              <button type="button" onClick={() => { setShowFilterItemIdModal(false); setFilterItemIdSearchQuery(''); }} className="w-6 h-6 flex items-center justify-center">
                <img src={CloseIcon} alt="Close" className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-2">
              <div className="relative">
                <img src={Search} alt="Search" className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
                <input type="text" value={filterItemIdSearchQuery} onChange={(e) => setFilterItemIdSearchQuery(e.target.value)} placeholder="Search" className="w-full h-[32px] pl-[30px] pr-3 border border-[rgba(0,0,0,0.16)] rounded text-[12px] outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
              {getFilteredFilterItemIds().length === 0 ? (
                <p className="text-[12px] text-gray-500 py-4">No options found</p>
              ) : (
                getFilteredFilterItemIds().map((opt) => (
                  <button key={opt} type="button" onClick={() => { setFilterItemId(opt); setShowFilterItemIdModal(false); setFilterItemIdSearchQuery(''); }} className="w-full h-[44px] flex items-center justify-start px-3 rounded text-left text-[14px] font-medium hover:bg-[#F5F5F5] transition-colors" style={{ backgroundColor: filterItemId === opt ? '#FFF9E6' : undefined }}>{opt}</button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {showFilterProjectInchargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={() => { setShowFilterProjectInchargeModal(false); setFilterProjectInchargeSearchQuery(''); }}>
          <div className="w-full max-w-[360px] rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col bg-white overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-[16px] font-semibold text-black">Select Incharge</p>
              <button type="button" onClick={() => { setShowFilterProjectInchargeModal(false); setFilterProjectInchargeSearchQuery(''); }} className="w-6 h-6 flex items-center justify-center">
                <img src={CloseIcon} alt="Close" className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-2">
              <div className="relative">
                <img src={Search} alt="Search" className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
                <input type="text" value={filterProjectInchargeSearchQuery} onChange={(e) => setFilterProjectInchargeSearchQuery(e.target.value)} placeholder="Search" className="w-full h-[32px] pl-[30px] pr-3 border border-[rgba(0,0,0,0.16)] rounded text-[12px] outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
              {getFilteredFilterProjectIncharges().length === 0 ? (
                <p className="text-[12px] text-gray-500 py-4">No options found</p>
              ) : (
                getFilteredFilterProjectIncharges().map((opt) => (
                  <button key={opt} type="button" onClick={() => { setFilterProjectIncharge(opt); setShowFilterProjectInchargeModal(false); setFilterProjectInchargeSearchQuery(''); }} className="w-full h-[44px] flex items-center justify-start px-3 rounded text-left text-[14px] font-medium hover:bg-[#F5F5F5] transition-colors" style={{ backgroundColor: filterProjectIncharge === opt ? '#FFF9E6' : undefined }}>{opt}</button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      <DatePickerModal
        isOpen={showFilterDatePicker}
        onClose={() => setShowFilterDatePicker(false)}
        onConfirm={(formattedDate) => {
          setFilterDate(formattedDate);
          setShowFilterDatePicker(false);
        }}
        initialDate={filterDate}
      />

      {/* Filter Status Dropdown Modal */}
      {showFilterBottomSheet && showFilterStatusDropdown && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-[16px]"
          onClick={() => setShowFilterStatusDropdown(false)}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div
            className="relative z-10 w-full max-w-[340px] bg-white rounded-[12px] shadow-xl p-[16px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[16px] font-semibold text-black">Select Status</p>
              <button
                onClick={() => setShowFilterStatusDropdown(false)}
                className="w-6 h-6 flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={filterStatusSearchQuery}
                onChange={(e) => setFilterStatusSearchQuery(e.target.value)}
                className="w-full pl-[36px] pr-[12px] py-[10px] text-[14px] border border-gray-300 rounded-[8px] focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div className="space-y-0">
              {statusOptions
                .filter((opt) =>
                  opt.label.toLowerCase().includes(filterStatusSearchQuery.toLowerCase())
                )
                .map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilterStatus(option.value);
                      setShowFilterStatusDropdown(false);
                      setFilterStatusSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-[12px] py-[10px] rounded-[8px] text-left ${filterStatus === option.value
                      ? 'bg-[#FFF3E0]'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <span className={`text-[14px] ${filterStatus === option.value ? 'font-medium' : ''}`}>
                      {option.label}
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${filterStatus === option.value
                        ? 'border-[#E07C24] bg-white'
                        : 'border-gray-300 bg-white'
                        }`}
                    >
                      {filterStatus === option.value && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E07C24]" />
                      )}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Shop Name / Service Store Dropdown Modal - same as Transfer.jsx */}
      {showShopNameDropdown && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 -top-[16px] z-50 flex items-center justify-center p-[16px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowShopNameDropdown(false);
              setShopNameSearchQuery('');
            }
          }}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-[24px] pt-[24px]">
              <p className="text-[16px] font-semibold text-black">Select Service Store</p>
              <button type="button" onClick={() => { setShowShopNameDropdown(false); setShopNameSearchQuery(''); }} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
              </button>
            </div>
            <div className="px-[24px] pt-[4px] pb-[6px]">
              <div className="relative">
                <input
                  type="text"
                  value={shopNameSearchQuery}
                  onChange={(e) => setShopNameSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full h-[32px] pl-[30px] pr-[16px] border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                  autoFocus
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <img src={Search} alt="Search" className="w-[12px] h-[12px]" />
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-[24px] min-h-[65vh]">
              <div className="shadow-md rounded-lg overflow-hidden">
                {shopNameSearchQuery.trim() && !serviceStoreOptions.some(opt => {
                  const normalizedOpt = normalizeSearchText(opt.label);
                  const normalizedQuery = normalizeSearchText(shopNameSearchQuery.trim());
                  return normalizedOpt === normalizedQuery;
                }) && (
                  <button type="button" onClick={() => {}} className="w-full h-[36px] px-[24px] flex items-center bg-gray-100 gap-[8px] hover:bg-[#F5F5F5] transition-colors">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-[14px] text-gray-600 font-normal text-left truncate">"{shopNameSearchQuery.trim()}"</p>
                  </button>
                )}
                {getFilteredServiceStoreOptions().length > 0 ? (
                  <div className="space-y-0">
                    {getFilteredServiceStoreOptions().map((option) => {
                      const isFavorite = shopNameFavorites.includes(option.id);
                      const isSelected = selectedShopName?.id === option.id;
                      const splitOptionText = (text) => {
                        if (!text) return { firstLine: '', secondLine: '' };
                        const firstHyphenIndex = text.indexOf(' - ');
                        if (firstHyphenIndex === -1) {
                          return { firstLine: text, secondLine: '' };
                        }
                        return {
                          firstLine: text.substring(0, firstHyphenIndex),
                          secondLine: text.substring(firstHyphenIndex + 3)
                        };
                      };
                      const { firstLine, secondLine } = splitOptionText(option.label);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSelectedShopName(option);
                            setShowShopNameDropdown(false);
                            setShopNameSearchQuery('');
                          }}
                          className={`w-full px-[10px] flex items-center gap-[12px] transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`}
                          style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                        >
                          <button type="button" onClick={(e) => handleToggleShopNameFavorite(e, option.id)} className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                            {isFavorite ? (
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                          <div className="flex flex-col flex-1 min-w-0 text-left">
                            <p className="text-[12px] font-medium text-black truncate whitespace-nowrap text-left">{firstLine}</p>
                            {secondLine && (
                              <p className="text-[11px] font-medium text-[#777777] truncate whitespace-nowrap text-left">{secondLine}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-[16px]">
                    <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                      {shopNameSearchQuery ? 'No options found' : 'No options available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceHistory;
