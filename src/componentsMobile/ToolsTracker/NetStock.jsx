import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import EditIcon from '../Images/edit1.png';
import SelectOptionModal from '../PurchaseOrder/SelectOptionModal';
import Close from '../Images/close.png';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Search from '../Images/Search.png';
import CloseIcon from '../Images/Close F.svg';
import Filter from '../Images/Filter.png';
import { getToolsNetStockPrefetchCache } from './netStockPrefetch';
import { fetchUserModulePermissions } from '../utils/fetchUserModulePermissions';
const TOOLS_STOCK_MANAGEMENT_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_tracker_stock_management';
const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_tracker_management';
const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_item_name';
const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_item_id';
const PROJECT_NAMES_BASE_URL = 'https://backendaab.in/demoAabuilderDash/api/project_Names';
const VENDOR_NAMES_BASE_URL = 'https://backendaab.in/demoAabuilderDash/api/vendor_Names';
const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_brand';
const TOOLS_MACHINE_NUMBER_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_machine_number';
const EMPLOYEE_DETAILS_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/employee_details';

const isQuantityTransferEntryType = (entry) => {
  const t = (entry.tools_entry_type || entry.toolsEntryType || '').toLowerCase().trim();
  return t === 'entry' || t === 'relocation' || t === 'relocate';
};

const NetStock = ({ user }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'list'
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showItemNameDropdown, setShowItemNameDropdown] = useState(false);
  const [showItemIdDropdown, setShowItemIdDropdown] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [stockManagementData, setStockManagementData] = useState([]);
  const [toolsTrackerManagementData, setToolsTrackerManagementData] = useState([]);
  const [itemNamesMap, setItemNamesMap] = useState({});
  const [itemIdsMap, setItemIdsMap] = useState({});
  const [brandsMap, setBrandsMap] = useState({});
  const [toolsItemIdFullData, setToolsItemIdFullData] = useState([]);
  const [toolsBrandFullData, setToolsBrandFullData] = useState([]);
  const [toolsItemNameFullData, setToolsItemNameFullData] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [vendorsMap, setVendorsMap] = useState({});
  const [employeesMap, setEmployeesMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Resolve module permissions for mobile create actions.
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
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [itemIdOptions, setItemIdOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [machineNumbersList, setMachineNumbersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemNameSearchQuery, setItemNameSearchQuery] = useState('');
  const [itemIdSearchQuery, setItemIdSearchQuery] = useState('');
  const [showFilterBottomSheet, setShowFilterBottomSheet] = useState(false);
  const [selectedHomeLocation, setSelectedHomeLocation] = useState('');
  const [selectedCurrentLocation, setSelectedCurrentLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showHomeLocationDropdown, setShowHomeLocationDropdown] = useState(false);
  const [showCurrentLocationDropdown, setShowCurrentLocationDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [homeLocationSearchQuery, setHomeLocationSearchQuery] = useState('');
  const [currentLocationSearchQuery, setCurrentLocationSearchQuery] = useState('');
  const [statusSearchQuery, setStatusSearchQuery] = useState('');

  // Edit stock bottom sheet state
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  const [newCount, setNewCount] = useState('');
  const [swipeStates, setSwipeStates] = useState({});
  const [expandedItemId, setExpandedItemId] = useState(null);
  const expandedItemIdRef = useRef(expandedItemId);
  useEffect(() => {
    expandedItemIdRef.current = expandedItemId;
  }, [expandedItemId]);

  // Helper to extract array from API response (handles wrapped responses like { data: [...] })
  const extractArrayFromResponse = useCallback((data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      return data.data ?? data.content ?? data.records ?? data.items ?? [];
    }
    return [];
  }, []);

  // Hydrate from prefetched in-memory cache (if available) to avoid waiting on network.
  useEffect(() => {
    const cached = getToolsNetStockPrefetchCache();
    if (!cached) return;

    const stock = extractArrayFromResponse(cached.stockManagement);
    const tracker = extractArrayFromResponse(cached.trackerManagement);
    if (stockManagementData.length === 0 && Array.isArray(stock) && stock.length > 0) setStockManagementData(stock);
    if (toolsTrackerManagementData.length === 0 && Array.isArray(tracker) && tracker.length > 0) setToolsTrackerManagementData(tracker);

    const itemNames = extractArrayFromResponse(cached.itemNames);
    if (toolsItemNameFullData.length === 0 && Array.isArray(itemNames) && itemNames.length > 0) {
      setToolsItemNameFullData(itemNames);
      const map = {};
      const names = [];
      itemNames.forEach((i) => {
        const pk = i.id ?? i._id;
        const itemName = (i.item_name ?? i.itemName ?? '').toString().trim();
        if (pk != null) {
          map[pk] = itemName;
          map[String(pk)] = itemName;
        }
        if (itemName) names.push(itemName);
      });
      setItemNamesMap(map);
      setItemNameOptions([...new Set(names)].sort());
    }

    const itemIds = extractArrayFromResponse(cached.itemIds);
    if (toolsItemIdFullData.length === 0 && Array.isArray(itemIds) && itemIds.length > 0) {
      setToolsItemIdFullData(itemIds);
      const map = {};
      const ids = [];
      itemIds.forEach((i) => {
        const pk = i.id ?? i._id;
        const itemId = (i.item_id ?? i.itemId ?? i.item_ids_id ?? i.itemIdsId ?? '').toString().trim();
        if (pk != null) {
          map[pk] = itemId;
          map[String(pk)] = itemId;
        }
        if (itemId) ids.push(itemId);
      });
      setItemIdsMap(map);
      setItemIdOptions([...new Set(ids)].sort());
    }

    const brands = extractArrayFromResponse(cached.brands);
    if (toolsBrandFullData.length === 0 && Array.isArray(brands) && brands.length > 0) {
      setToolsBrandFullData(brands);
      const map = {};
      const brandNames = [];
      brands.forEach((b) => {
        const pk = b.id ?? b._id;
        const brandName = (b.tools_brand ?? b.toolsBrand ?? '').toString().trim();
        if (pk != null) {
          map[pk] = brandName;
          map[String(pk)] = brandName;
        }
        if (brandName) brandNames.push(brandName);
      });
      setBrandsMap(map);
      setBrandOptions([...new Set(brandNames)].sort());
    }

    const projects = extractArrayFromResponse(cached.projects);
    if (Object.keys(projectsMap).length === 0 && Array.isArray(projects) && projects.length > 0) {
      const map = {};
      projects.forEach((p) => {
        const pk = p.id ?? p._id;
        const projectName = (p.siteName ?? p.site_name ?? p.projectName ?? p.project_name ?? '').toString().trim();
        if (pk != null) {
          map[pk] = projectName;
          map[String(pk)] = projectName;
        }
      });
      setProjectsMap(map);
    }

    const vendors = extractArrayFromResponse(cached.vendors);
    if (Object.keys(vendorsMap).length === 0 && Array.isArray(vendors) && vendors.length > 0) {
      const map = {};
      vendors.forEach((v) => {
        const pk = v.id ?? v._id;
        const vendorName = (v.vendorName ?? v.vendor_name ?? '').toString().trim();
        if (pk != null) {
          map[pk] = vendorName;
          map[String(pk)] = vendorName;
        }
      });
      setVendorsMap(map);
    }

    const machineNumbers = extractArrayFromResponse(cached.machineNumbers);
    if (machineNumbersList.length === 0 && Array.isArray(machineNumbers) && machineNumbers.length > 0) {
      setMachineNumbersList(machineNumbers);
    }

    const employees = extractArrayFromResponse(cached.employees);
    if (Object.keys(employeesMap).length === 0 && Array.isArray(employees) && employees.length > 0) {
      const map = {};
      employees.forEach((e) => {
        map[e.id] = e.employee_name || e.employeeName || '';
        map[String(e.id)] = e.employee_name || e.employeeName || '';
      });
      setEmployeesMap(map);
    }

    // If we already have core datasets, avoid showing loader.
    if ((Array.isArray(stock) && stock.length > 0) || (Array.isArray(tracker) && tracker.length > 0)) {
      setLoading(false);
    }
  }, [extractArrayFromResponse]);

  // Resolve item_id from tools_item_id API using item_ids_id - never show raw item_ids_id
  const resolveItemIdDisplay = useCallback((itemIdsId) => {
    if (itemIdsId === null || itemIdsId === undefined || itemIdsId === '') return '-';
    const idStr = String(itemIdsId).trim();
    if (!idStr) return '-';
    // Look up by id, _id, or item_ids_id (support various API response structures)
    const found = toolsItemIdFullData.find((i) => {
      const pk = i?.id ?? i?._id ?? i?.item_ids_id ?? i?.itemIdsId;
      return String(pk) === idStr || Number(pk) === Number(itemIdsId);
    });
    if (found) {
      const display = found.item_id ?? found.itemId ?? '';
      const displayStr = String(display).trim();
      if (displayStr) return displayStr;
    }
    const fromMap = itemIdsMap[idStr] ?? itemIdsMap[Number(itemIdsId)];
    if (fromMap) return String(fromMap).trim();
    return '-';
  }, [toolsItemIdFullData, itemIdsMap]);

  // Resolve brand display from brand_id using full API data
  const resolveBrandDisplay = useCallback((brandId) => {
    if (brandId === null || brandId === undefined || brandId === '') return '-';
    const idStr = String(brandId).trim();
    if (!idStr) return '-';
    const found = toolsBrandFullData.find(
      (b) => String(b?.id ?? b?._id ?? '') === idStr
    );
    if (found) {
      const display = found.tools_brand ?? found.toolsBrand ?? '';
      return String(display).trim() || '-';
    }
    return brandsMap[idStr] ?? brandsMap[Number(brandId)] ?? '-';
  }, [toolsBrandFullData, brandsMap]);

  // Resolve item name display from item_name_id using full API data
  const resolveItemNameDisplay = useCallback((itemNameId) => {
    if (itemNameId === null || itemNameId === undefined || itemNameId === '') return '-';
    const idStr = String(itemNameId).trim();
    if (!idStr) return '-';
    const found = toolsItemNameFullData.find(
      (i) => String(i?.id ?? i?._id ?? '') === idStr
    );
    if (found) {
      const display = found.item_name ?? found.itemName ?? '';
      return String(display).trim() || '-';
    }
    return itemNamesMap[idStr] ?? itemNamesMap[Number(itemNameId)] ?? '-';
  }, [toolsItemNameFullData, itemNamesMap]);

  // Fetch lookup data
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        // If prefetched data already hydrated, skip network calls.
        const hasLookups =
          toolsItemNameFullData.length > 0 &&
          toolsItemIdFullData.length > 0 &&
          toolsBrandFullData.length > 0 &&
          machineNumbersList.length > 0;
        if (hasLookups) return;

        // Fetch item names
        const itemNamesRes = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (itemNamesRes.ok) {
          const raw = await itemNamesRes.json();
          const data = extractArrayFromResponse(raw);
          const map = {};
          const names = [];
          data.forEach((i) => {
            const pk = i.id ?? i._id;
            const itemName = (i.item_name ?? i.itemName ?? '').toString().trim();
            if (pk != null) {
              map[pk] = itemName;
              map[String(pk)] = itemName;
            }
            if (itemName) names.push(itemName);
          });
          setItemNamesMap(map);
          setToolsItemNameFullData(data);
          setItemNameOptions([...new Set(names)].sort());
        }

        // Fetch item IDs
        const itemIdsRes = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (itemIdsRes.ok) {
          const raw = await itemIdsRes.json();
          const data = extractArrayFromResponse(raw);
          const map = {};
          const ids = [];
          data.forEach((i) => {
            const pk = i.id ?? i._id;
            const itemId = (i.item_id ?? i.itemId ?? i.item_ids_id ?? i.itemIdsId ?? '').toString().trim();
            if (pk != null) {
              map[pk] = itemId;
              map[String(pk)] = itemId;
            }
            if (itemId) ids.push(itemId);
          });
          setItemIdsMap(map);
          setToolsItemIdFullData(data);
          setItemIdOptions([...new Set(ids)].sort());
        }

        // Fetch brands
        const brandsRes = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (brandsRes.ok) {
          const raw = await brandsRes.json();
          const data = extractArrayFromResponse(raw);
          const map = {};
          const brands = [];
          data.forEach((b) => {
            const pk = b.id ?? b._id;
            const brandName = (b.tools_brand ?? b.toolsBrand ?? '').toString().trim();
            if (pk != null) {
              map[pk] = brandName;
              map[String(pk)] = brandName;
            }
            if (brandName) brands.push(brandName);
          });
          setBrandsMap(map);
          setToolsBrandFullData(data);
          setBrandOptions([...new Set(brands)].sort());
        }

        // Fetch projects
        const projectsRes = await fetch(`${PROJECT_NAMES_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (projectsRes.ok) {
          const raw = await projectsRes.json();
          const data = extractArrayFromResponse(raw);
          const map = {};
          data.forEach((p) => {
            const pk = p.id ?? p._id;
            const projectName = (p.siteName ?? p.site_name ?? p.projectName ?? p.project_name ?? '').toString().trim();
            if (pk != null) {
              map[pk] = projectName;
              map[String(pk)] = projectName;
            }
          });
          setProjectsMap(map);
        }

        // Fetch vendors
        const vendorsRes = await fetch(`${VENDOR_NAMES_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (vendorsRes.ok) {
          const raw = await vendorsRes.json();
          const data = extractArrayFromResponse(raw);
          const map = {};
          data.forEach((v) => {
            const pk = v.id ?? v._id;
            const vendorName = (v.vendorName ?? v.vendor_name ?? '').toString().trim();
            if (pk != null) {
              map[pk] = vendorName;
              map[String(pk)] = vendorName;
            }
          });
          setVendorsMap(map);
        }

        // Fetch machine numbers (for resolving machine_number_id to display text)
        const machineNumbersRes = await fetch(`${TOOLS_MACHINE_NUMBER_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (machineNumbersRes.ok) {
          const raw = await machineNumbersRes.json();
          setMachineNumbersList(extractArrayFromResponse(raw));
        }

        // Fetch employees for Project Incharge
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
            map[String(e.id)] = e.employee_name || e.employeeName || '';
          });
          setEmployeesMap(map);
        }
      } catch (error) {
        console.error('Error fetching lookup data:', error);
      }
    };
    fetchLookupData();
  }, [extractArrayFromResponse, toolsItemNameFullData, toolsItemIdFullData, toolsBrandFullData, machineNumbersList]);

  // Resolve machine number id/text to display text (same idea as ToolsHistory Log tab)
  const resolveMachineNumberText = useCallback((machineNumberOrId) => {
    if (machineNumberOrId === null || machineNumberOrId === undefined) return '';
    const value = String(machineNumberOrId).trim();
    if (!value) return '';
    if (machineNumbersList.length > 0) {
      const byId = machineNumbersList.find((m) => String(m?.id ?? m?._id) === value);
      if (byId) return String(byId.machine_number ?? byId.machineNumber ?? '').trim();
      const byText = machineNumbersList.find(
        (m) => String(m?.machine_number ?? m?.machineNumber ?? '').trim() === value
      );
      if (byText) return String(byText.machine_number ?? byText.machineNumber ?? '').trim();
    }
    return value;
  }, [machineNumbersList]);

  // Fetch stock management and tools tracker management data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (stockManagementData.length > 0 && toolsTrackerManagementData.length > 0) {
          return;
        }
        setLoading(true);

        const stockRes = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (stockRes.ok) {
          const raw = await stockRes.json();
          const data = extractArrayFromResponse(raw);
          setStockManagementData(Array.isArray(data) ? data : []);
        }

        const trackerRes = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (trackerRes.ok) {
          const raw = await trackerRes.json();
          const data = extractArrayFromResponse(raw);
          // Include all movement-related entry types so we can find the true last entry for current location
          const movementTypes = ['entry', 'relocation', 'relocate', 'service_return', 'service return'];
          const entries = (Array.isArray(data) ? data : []).filter((entry) => {
            const entryType = (entry.tools_entry_type || entry.toolsEntryType || 'Entry').toLowerCase().trim();
            return movementTypes.some(t => entryType === t);
          });
          setToolsTrackerManagementData(entries);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [extractArrayFromResponse]);

  // Helper to get location name
  const getLocationName = useCallback((id) => {
    if (!id) return '-';
    const idStr = String(id);
    if (projectsMap[idStr]) return projectsMap[idStr];
    if (projectsMap[id]) return projectsMap[id];
    if (vendorsMap[idStr]) return vendorsMap[idStr];
    if (vendorsMap[id]) return vendorsMap[id];
    return '-';
  }, [projectsMap, vendorsMap]);

  // Helper function to get home location ID - get the LAST (most recent) home_location_id from tools_tracker_management, fallback to stock_management
  // Matches the logic from PendingItems.jsx
  const getHomeLocationId = (itemIdsId, brandId, machineNumber, stockHomeLocationId) => {
    // First, find all entries in tools_tracker_management that match this item and have home_location_id
    const matchingEntries = [];

    for (const entry of toolsTrackerManagementData) {
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];

      // Check each item in the entry for matching item and home_location_id
      for (const entryItem of entryItems) {
        const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        const entryBrandId = entryItem.brand_id || entryItem.brandId;
        const entryMachineNumberId = entryItem.machine_number_id || entryItem.machineNumberId;
        const entryMachineNumberResolved = entryMachineNumberId ? resolveMachineNumberText(entryMachineNumberId) : (entryItem.machine_number || entryItem.machineNumber || '').trim();

        const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === String(itemIdsId);
        const brandMatch = !brandId || (entryBrandId && String(entryBrandId) === String(brandId));
        const machineMatch = !machineNumber || (String(entryMachineNumberResolved).trim() === String(machineNumber).trim());

        if (itemIdsMatch && brandMatch && machineMatch) {
          // Check if this specific item has home_location_id
          let itemHomeLocationId = entryItem.home_location_id || entryItem.homeLocationId;

          // If no home_location_id in entryItem, get it from stock_management for this itemIdsId
          if (!itemHomeLocationId) {
            const stockItem = stockManagementData.find(stock => {
              const stockItemIdsId = stock.item_ids_id || stock.itemIdsId;
              const stockBrandId = stock.brand_name_id || stock.brandNameId;
              const stockMachineNumber = stock.machine_number || stock.machineNumber || '';

              const itemIdsMatch = stockItemIdsId && String(stockItemIdsId) === String(itemIdsId);
              const brandMatch = !brandId || (stockBrandId && String(stockBrandId) === String(brandId));
              const machineMatch = !machineNumber || (stockMachineNumber && String(stockMachineNumber).trim() === machineNumber.trim());

              return itemIdsMatch && brandMatch && machineMatch;
            });

            if (stockItem) {
              itemHomeLocationId = stockItem.home_location_id || stockItem.homeLocationId;
            }
          }

          // If we have a home_location_id (from entryItem or stock_management), add it to matching entries
          if (itemHomeLocationId) {
            const entryId = Number(entry.id ?? entry._id ?? 0) || 0;
            matchingEntries.push({
              homeLocationId: itemHomeLocationId,
              entryId
            });
          }
        }
      }
    }

    // If we found entries with home_location_id, return the most recent one (by id, not date)
    if (matchingEntries.length > 0) {
      matchingEntries.sort((a, b) => b.entryId - a.entryId); // Descending by id (higher id = more recent)
      return matchingEntries[0].homeLocationId;
    }

    // If not found in tools_tracker_management, check stock_management
    const stockItem = stockManagementData.find(stock => {
      const stockItemIdsId = stock.item_ids_id || stock.itemIdsId;
      const stockBrandId = stock.brand_name_id || stock.brandNameId;
      const stockMachineNumber = stock.machine_number || stock.machineNumber || '';
      const itemIdsMatch = stockItemIdsId && String(stockItemIdsId) === String(itemIdsId);
      const brandMatch = !brandId || (stockBrandId && String(stockBrandId) === String(brandId));
      const machineMatch = !machineNumber || (stockMachineNumber && String(stockMachineNumber).trim() === machineNumber.trim());
      return itemIdsMatch && brandMatch && machineMatch;
    });

    if (stockItem) {
      return stockItem.home_location_id || stockItem.homeLocationId;
    }

    // Final fallback to the provided stockHomeLocationId
    return stockHomeLocationId;
  };

  // Helper to get current location for an item set - use getHomeLocationId to get the correct home location
  const getCurrentLocationForItem = (itemIdsId, brandId, machineNumber, stockHomeLocationId) => {
    if (!itemIdsId) return stockHomeLocationId;

    // Use getHomeLocationId to get the correct home location (most recent from tools_tracker_management, or from stock_management)
    const correctHomeLocationId = getHomeLocationId(itemIdsId, brandId, machineNumber, stockHomeLocationId);

    return correctHomeLocationId || stockHomeLocationId;
  };

  // Helper to get current location (To location) from tools_tracker_management.
  // Uses the LAST entry for this itemIdsId (by id, not date) to get to_project_id (where the item moved to = current location).
  // Only considers data that has this itemIdsId - does not use date or created_date_time.
  const getCurrentToLocation = (itemIdsId, itemNameId, brandId, machineNumber, homeLocationId) => {
    if (!itemIdsId) return homeLocationId;

    let latestEntry = null;
    let latestEntryId = 0;

    // Find the most recent entry in tools_tracker_management for this item (only by itemIdsId + brand + machine, use id for ordering)
    for (const entry of toolsTrackerManagementData) {
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];

      for (const entryItem of entryItems) {
        const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        const entryBrandId = entryItem.brand_id || entryItem.brandId;
        const entryMachineNumberId = entryItem.machine_number_id || entryItem.machineNumberId;
        const entryMachineNumberResolved = entryMachineNumberId ? resolveMachineNumberText(entryMachineNumberId) : (entryItem.machine_number || entryItem.machineNumber || '').trim();

        const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === String(itemIdsId);
        const brandMatch = !brandId || (entryBrandId && String(entryBrandId) === String(brandId));
        const machineMatch = !machineNumber || (String(entryMachineNumberResolved).trim() === String(machineNumber).trim());

        if (itemIdsMatch && brandMatch && machineMatch) {
          const entryId = Number(entry.id ?? entry._id ?? 0) || 0;
          if (entryId > latestEntryId) {
            latestEntryId = entryId;
            latestEntry = { entry, entryItem };
          }
        }
      }
    }
    // For the last entry: to_project_id is where the item was sent = current location
    if (latestEntry) {
      const toProjectId = latestEntry.entry.to_project_id || latestEntry.entry.toProjectId;
      if (toProjectId) return toProjectId;
      const serviceStoreId = latestEntry.entry.service_store_id || latestEntry.entry.serviceStoreId;
      if (serviceStoreId) return serviceStoreId;
      const fromProjectId = latestEntry.entry.from_project_id || latestEntry.entry.fromProjectId;
      if (fromProjectId) return fromProjectId;
      const itemHomeLocationId = latestEntry.entryItem.home_location_id || latestEntry.entryItem.homeLocationId;
      if (itemHomeLocationId) return itemHomeLocationId;
    }

    // Fallback to home location
    return homeLocationId;
  };

  // Quantity-only (no item_ids_id): overall total from stock rows; per-location qty from stock ± tracker transfers
  // (same model as Transfer.jsx getAvailableQuantityAtLocation).
  const buildQuantityOnlyLocationSummary = useCallback(
    (itemNameId, brandId, homeStockRows) => {
      const getAvailableQuantityAtLocationForQuantityOnly = (locItemNameId, locBrandId, locationId) => {
        if (!locItemNameId || !locationId) return 0;
        const itemNameIdStr = String(locItemNameId);
        const brandIdStr = locBrandId != null && locBrandId !== '' ? String(locBrandId) : null;
        const locationIdStr = String(locationId);
        let availableQuantity = 0;

        const stockItems = stockManagementData.filter((stock) => {
          const stockItemNameId = stock.item_name_id || stock.itemNameId;
          const stockBrandId = stock.brand_name_id || stock.brandNameId;
          const stockHomeLocationId = stock.home_location_id || stock.homeLocationId;
          const noItemIdsId = !stock.item_ids_id && !stock.itemIdsId;
          const itemNameMatch = stockItemNameId && String(stockItemNameId) === itemNameIdStr;
          const brandMatch = !brandIdStr || (stockBrandId && String(stockBrandId) === brandIdStr);
          const locationMatch = stockHomeLocationId && String(stockHomeLocationId) === locationIdStr;
          return itemNameMatch && brandMatch && locationMatch && noItemIdsId;
        });
        stockItems.forEach((stock) => {
          availableQuantity += parseInt(stock.quantity || 0, 10);
        });

        for (const entry of toolsTrackerManagementData) {
          if (!isQuantityTransferEntryType(entry)) continue;
          const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
          const entryToProjectId = entry.to_project_id || entry.toProjectId;
          const entryFromProjectId = entry.from_project_id || entry.fromProjectId;

          for (const entryItem of entryItems) {
            const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
            if (entryItemIdsId) continue;

            const entryItemNameId = entryItem.item_name_id || entryItem.itemNameId;
            const entryBrandId = entryItem.brand_id || entryItem.brandId;
            const itemNameMatch = entryItemNameId && String(entryItemNameId) === itemNameIdStr;
            const brandMatch = !brandIdStr || (entryBrandId && String(entryBrandId) === brandIdStr);

            if (itemNameMatch && brandMatch) {
              const itemQuantity = parseInt(entryItem.quantity || 0, 10);
              if (entryToProjectId && String(entryToProjectId) === locationIdStr) {
                availableQuantity += itemQuantity;
              }
              if (entryFromProjectId && String(entryFromProjectId) === locationIdStr) {
                availableQuantity -= itemQuantity;
              }
            }
          }
        }

        return Math.max(0, availableQuantity);
      };

      const collectLocationIdsForQuantityOnlyItem = (locItemNameId, locBrandId) => {
        const ids = new Set();
        const itemNameIdStr = String(locItemNameId);
        const brandIdStr = locBrandId != null && locBrandId !== '' ? String(locBrandId) : null;

        stockManagementData.forEach((stock) => {
          const stockItemNameId = stock.item_name_id || stock.itemNameId;
          const stockBrandId = stock.brand_name_id || stock.brandNameId;
          const stockHomeLocationId = stock.home_location_id || stock.homeLocationId;
          const noItemIdsId = !stock.item_ids_id && !stock.itemIdsId;
          const itemNameMatch = stockItemNameId && String(stockItemNameId) === itemNameIdStr;
          const brandMatch = !brandIdStr || (stockBrandId && String(stockBrandId) === brandIdStr);
          if (itemNameMatch && brandMatch && noItemIdsId && stockHomeLocationId) {
            ids.add(String(stockHomeLocationId));
          }
        });

        toolsTrackerManagementData.forEach((entry) => {
          if (!isQuantityTransferEntryType(entry)) return;
          const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
          const toId = entry.to_project_id || entry.toProjectId;
          const fromId = entry.from_project_id || entry.fromProjectId;
          entryItems.forEach((entryItem) => {
            const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
            if (entryItemIdsId) return;
            const entryItemNameId = entryItem.item_name_id || entryItem.itemNameId;
            const entryBrandId = entryItem.brand_id || entryItem.brandId;
            const itemNameMatch = entryItemNameId && String(entryItemNameId) === itemNameIdStr;
            const brandMatch = !brandIdStr || (entryBrandId && String(entryBrandId) === brandIdStr);
            if (itemNameMatch && brandMatch) {
              if (toId) ids.add(String(toId));
              if (fromId) ids.add(String(fromId));
            }
          });
        });

        return Array.from(ids);
      };

      const totalStock = homeStockRows.reduce(
        (acc, s) => acc + parseInt(s.quantity || 0, 10),
        0
      );
      const homeLabel = [
        ...new Set(
          homeStockRows
            .map((s) => getLocationName(s.home_location_id || s.homeLocationId))
            .filter((n) => n && n !== '-')
        )
      ].join(', ') || '-';

      const locIds = collectLocationIdsForQuantityOnlyItem(itemNameId, brandId);
      const parts = [];
      locIds.forEach((locId) => {
        const q = getAvailableQuantityAtLocationForQuantityOnly(itemNameId, brandId, locId);
        if (q > 0) {
          parts.push({ locationId: String(locId), name: getLocationName(locId), q });
        }
      });
      parts.sort((a, b) => b.q - a.q);
      const currentLocationStr =
        parts.map((p) => `${p.name} (${p.q})`).join(', ') || '-';

      return { totalStock, homeLabel, currentLocationStr, parts };
    },
    [stockManagementData, toolsTrackerManagementData, getLocationName]
  );

  // Process data for table view (individual items) - merge items with same location, itemName, brand
  const tableData = useMemo(() => {
    const itemsMap = new Map(); // Use Map to merge items
    const processedItemIds = new Set();
    const quantityOnlyGroups = new Map();

    // Process items from stock management
    stockManagementData.forEach((stock) => {
      const itemNameId = stock.item_name_id ?? stock.itemNameId;
      const itemIdsId = stock.item_ids_id ?? stock.itemIdsId;
      const brandId = stock.brand_name_id ?? stock.brandNameId ?? stock.brand_id ?? stock.brandId;
      const homeLocationId = stock.home_location_id || stock.homeLocationId;
      // Resolve machine number: check machine_number_id first, then machine_number
      const machineNumberId = stock.machine_number_id || stock.machineNumberId;
      const machineNumberRaw = stock.machine_number || stock.machineNumber || '';
      const machineNumber = machineNumberId ? resolveMachineNumberText(machineNumberId) : machineNumberRaw;
      const status = stock.machine_status || stock.machineStatus || 'Working';

      const itemName = resolveItemNameDisplay(itemNameId);
      const brand = resolveBrandDisplay(brandId);

      const hasItemIdsId = itemIdsId != null && itemIdsId !== '';
      if (hasItemIdsId) {
        // Item with itemId - each unique (item_ids_id, brand, machine_number) is a separate row
        const itemKey = `${itemIdsId}_${brandId || ''}_${machineNumber}`;
        if (!processedItemIds.has(itemKey)) {
          processedItemIds.add(itemKey);
          const itemId = resolveItemIdDisplay(itemIdsId);
          // Get most recent home location from tools_tracker_management, fallback to stock_management
          const actualHomeLocationId = getHomeLocationId(itemIdsId, brandId, machineNumber, homeLocationId);
          const homeLocation = getLocationName(actualHomeLocationId);
          // Get current location from last entry's to_project_id
          const currentLocationId = getCurrentToLocation(itemIdsId, itemNameId, brandId, machineNumber, actualHomeLocationId);
          const currentLocation = getLocationName(currentLocationId);

          // Use itemKey as mergeKey so each item shows as its own row (no merging of different tools)
          const mergeKey = itemKey;

          itemsMap.set(mergeKey, {
            id: itemKey,
            itemName,
            itemId,
            itemIds: [itemId],
            itemIdCount: 1,
            location: homeLocation,
            currentLocation: currentLocation,
            brand,
            model: (stock.model || '').trim() || '',
            machineNumber,
            status,
            quantity: 0,
            hasItemId: true
          });
        }
      } else if (!hasItemIdsId) {
        // Quantity-only: group by item_name_id + brand (overall qty from stock; splits from tracker)
        const mergeKey = `qty_${itemNameId}_${brandId || ''}`;
        if (!quantityOnlyGroups.has(mergeKey)) {
          quantityOnlyGroups.set(mergeKey, {
            itemNameId,
            brandId,
            itemName,
            brand,
            stocks: []
          });
        }
        quantityOnlyGroups.get(mergeKey).stocks.push(stock);
      }
    });

    quantityOnlyGroups.forEach((group, mergeKey) => {
      const { itemNameId, brandId, itemName, brand, stocks } = group;
      const stockRecordIds = stocks.map((s) => ({
        stockId: s.id,
        itemNameId,
        brandId,
        homeLocationId: s.home_location_id || s.homeLocationId,
        quantity: parseInt(s.quantity || 0, 10)
      }));
      const firstStock = stocks[0];
      const summary = buildQuantityOnlyLocationSummary(itemNameId, brandId, stocks);

      // Create one card per location with available quantity at that location
      const parts = Array.isArray(summary.parts) ? summary.parts : [];
      if (parts.length === 0) {
        // Fallback: keep a single card with total when we cannot resolve locations
        itemsMap.set(mergeKey, {
          id: mergeKey,
          itemName,
          itemId: '-',
          location: summary.homeLabel,
          currentLocation: '-',
          currentLocationId: '',
          brand,
          model: (firstStock.model || '').trim() || '-',
          machineNumber: '-',
          status: '-',
          quantity: summary.totalStock,
          hasItemId: false,
          itemNameId,
          brandId,
          homeLocationId: firstStock.home_location_id || firstStock.homeLocationId,
          stockRecordIds,
          isQuantityLocationCard: true,
          isEditableQuantityCard: true
        });
      } else {
        parts.forEach((p) => {
          const perLocKey = `${mergeKey}_${p.locationId}`;
          itemsMap.set(perLocKey, {
            id: perLocKey,
            itemName,
            itemId: '-',
            location: summary.homeLabel,
            currentLocation: p.name,
            currentLocationId: p.locationId,
            brand,
            model: (firstStock.model || '').trim() || '-',
            machineNumber: '-',
            status: '-',
            quantity: p.q,
            hasItemId: false,
            itemNameId,
            brandId,
            homeLocationId: firstStock.home_location_id || firstStock.homeLocationId,
            stockRecordIds,
            isQuantityLocationCard: true,
            isEditableQuantityCard: true
          });
        });
      }
    });
    // Convert Map to array
    const items = Array.from(itemsMap.values()).map(item => {
      // For items with itemIds, if merged (count > 1), show the count as quantity
      if (item.hasItemId && item.itemIdCount > 1) {
        return {
          ...item,
          quantity: item.itemIdCount, // Show count as quantity for merged items
          displayItemIds: item.itemIds, // Keep original itemIds for reference
          isMerged: true
        };
      }
      return item;
    });
    // Apply filters
    let filtered = items;
    if (selectedItemName) {
      filtered = filtered.filter(item => item.itemName === selectedItemName);
    }
    if (selectedItemId) {
      filtered = filtered.filter(item => {
        if (item.hasItemId && item.displayItemIds) {
          return item.displayItemIds.includes(selectedItemId);
        }
        return item.itemId === selectedItemId;
      });
    }
    if (selectedBrand) {
      filtered = filtered.filter(item => item.brand === selectedBrand);
    }
    if (selectedHomeLocation) {
      filtered = filtered.filter((item) => {
        const loc = item.location;
        if (!loc || loc === '-') return false;
        if (loc === selectedHomeLocation) return true;
        return loc.split(',').map((s) => s.trim()).includes(selectedHomeLocation);
      });
    }
    if (selectedCurrentLocation) {
      filtered = filtered.filter((item) => {
        const cur = item.currentLocation;
        if (!cur || cur === '-') return false;
        return (
          cur === selectedCurrentLocation ||
          cur.toLowerCase().includes(selectedCurrentLocation.toLowerCase())
        );
      });
    }
    if (selectedStatus) {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }
    return filtered;
  }, [stockManagementData, toolsTrackerManagementData, itemNamesMap, itemIdsMap, brandsMap, projectsMap, vendorsMap, selectedItemName, selectedItemId, selectedBrand, selectedHomeLocation, selectedCurrentLocation, selectedStatus, machineNumbersList, getHomeLocationId, getCurrentLocationForItem, getCurrentToLocation, buildQuantityOnlyLocationSummary, getLocationName, resolveMachineNumberText, resolveItemIdDisplay, resolveBrandDisplay, resolveItemNameDisplay]);

  // Apply universal search filter to tableData
  const filteredTableData = useMemo(() => {
    if (!searchQuery.trim()) return tableData;
    const query = searchQuery.toLowerCase().trim();
    return tableData.filter(item => {
      const searchableText = [
        item.itemName || '',
        item.itemId || '',
        item.location || '',
        item.currentLocation || '',
        item.brand || '',
        item.model || '',
        item.machineNumber || '',
        item.status || '',
        item.quantity?.toString() || ''
      ].join(' ').toLowerCase();
      return searchableText.includes(query);
    });
  }, [tableData, searchQuery]);

  // Calculate aggregated summary for List view table display
  const aggregatedSummary = useMemo(() => {
    const aggregated = {};
    const processedItemIds = new Set();
    // Process stock management data directly
    stockManagementData.forEach((stock) => {
      const itemNameId = stock.item_name_id ?? stock.itemNameId;
      const itemIdsId = stock.item_ids_id ?? stock.itemIdsId;
      const brandId = stock.brand_name_id ?? stock.brandNameId ?? stock.brand_id ?? stock.brandId;
      const quantity = parseInt(stock.quantity || 0, 10);
      if (!itemNameId) return;
      const itemName = resolveItemNameDisplay(itemNameId);
      const brand = resolveBrandDisplay(brandId);
      const key = `${itemName}_${brand}`;
      if (!aggregated[key]) {
        aggregated[key] = {
          itemName,
          brand,
          itemIdSet: new Set(),
          quantitySum: 0,
          total: 0
        };
      }
      if (itemIdsId) {
        // Track unique itemIds
        const itemId = resolveItemIdDisplay(itemIdsId);
        if (itemId && itemId !== '-') {
          aggregated[key].itemIdSet.add(itemId);
        }
      } else {
        // Sum quantities (including negative values) for items without itemIds
        aggregated[key].quantitySum += quantity;
      }
    });
    // Also check tools_tracker_management for items that might have been transferred
    toolsTrackerManagementData.forEach((entry) => {
      const entryItems = entry.tools_tracker_item_name_table ?? entry.toolsTrackerItemNameTable ?? [];
      entryItems.forEach((entryItem) => {
        const itemNameId = entryItem.item_name_id ?? entryItem.itemNameId;
        const itemIdsId = entryItem.item_ids_id ?? entryItem.itemIdsId;
        const brandId = entryItem.brand_id ?? entryItem.brandId;
        if (!itemNameId) return;
        const itemName = resolveItemNameDisplay(itemNameId);
        const brand = resolveBrandDisplay(brandId);
        const key = `${itemName}_${brand}`;
        if (!aggregated[key]) {
          aggregated[key] = {
            itemName,
            brand,
            itemIdSet: new Set(),
            quantitySum: 0,
            total: 0
          };
        }
        if (itemIdsId) {
          // Track unique itemIds
          const itemId = resolveItemIdDisplay(itemIdsId);
          if (itemId && itemId !== '-') {
            aggregated[key].itemIdSet.add(itemId);
          }
        }
        // Note: We don't add quantities from transfers here as they're already counted in stock
        // This is just to capture itemIds that might be in transfers but not in stock
      });
    });
    // Convert Sets to counts and calculate totals
    const result = Object.values(aggregated).map(item => ({
      itemName: item.itemName,
      brand: item.brand,
      itemIdCount: item.itemIdSet.size,
      quantitySum: item.quantitySum,
      total: item.itemIdSet.size + item.quantitySum
    }));
    // Filter if needed
    let filtered = result;
    if (selectedItemName) {
      filtered = filtered.filter(item => item.itemName === selectedItemName);
    }
    if (selectedBrand) {
      filtered = filtered.filter(item => item.brand === selectedBrand);
    }
    return filtered.sort((a, b) => {
      if (a.itemName !== b.itemName) {
        return a.itemName.localeCompare(b.itemName);
      }
      return a.brand.localeCompare(b.brand);
    });
  }, [stockManagementData, toolsTrackerManagementData, resolveItemNameDisplay, resolveBrandDisplay, resolveItemIdDisplay, selectedItemName, selectedBrand]);
  // Apply universal search filter to aggregatedSummary
  const filteredAggregatedSummary = useMemo(() => {
    if (!searchQuery.trim()) return aggregatedSummary;
    const query = searchQuery.toLowerCase().trim();
    return aggregatedSummary.filter(item => {
      const searchableText = [
        item.itemName || '',
        item.brand || '',
        item.itemIdCount?.toString() || '',
        item.quantitySum?.toString() || '',
        item.total?.toString() || ''
      ].join(' ').toLowerCase();

      return searchableText.includes(query);
    });
  }, [aggregatedSummary, searchQuery]);

  // Filter item name options based on search
  const getFilteredItemNameOptions = () => {
    const query = (itemNameSearchQuery || '').trim().toLowerCase();
    if (!query) return itemNameOptions;
    return itemNameOptions.filter(option =>
      String(option).toLowerCase().includes(query)
    );
  };

  // Filter item ID options based on search
  const getFilteredItemIdOptions = () => {
    const query = (itemIdSearchQuery || '').trim().toLowerCase();
    if (!query) return itemIdOptions;
    return itemIdOptions.filter(option =>
      String(option).toLowerCase().includes(query)
    );
  };

  const homeLocationOptions = useMemo(() => {
    return [...new Set(tableData.map((item) => item.location).filter((location) => location && location !== '-'))].sort();
  }, [tableData]);

  const currentLocationOptions = useMemo(() => {
    return [...new Set(tableData.map((item) => item.currentLocation).filter((location) => location && location !== '-'))].sort();
  }, [tableData]);

  const statusOptions = useMemo(() => {
    return [...new Set(tableData.map((item) => item.status).filter((status) => status && status !== '-'))].sort();
  }, [tableData]);

  const getFilteredHomeLocationOptions = () => {
    const query = (homeLocationSearchQuery || '').trim().toLowerCase();
    if (!query) return homeLocationOptions;
    return homeLocationOptions.filter((option) =>
      String(option).toLowerCase().includes(query)
    );
  };

  const getFilteredCurrentLocationOptions = () => {
    const query = (currentLocationSearchQuery || '').trim().toLowerCase();
    if (!query) return currentLocationOptions;
    return currentLocationOptions.filter((option) =>
      String(option).toLowerCase().includes(query)
    );
  };

  const getFilteredStatusOptions = () => {
    const query = (statusSearchQuery || '').trim().toLowerCase();
    if (!query) return statusOptions;
    return statusOptions.filter((option) =>
      String(option).toLowerCase().includes(query)
    );
  };

  // Reset search queries when dropdowns close
  useEffect(() => {
    if (!showItemNameDropdown) {
      setItemNameSearchQuery('');
    }
  }, [showItemNameDropdown]);

  useEffect(() => {
    if (!showItemIdDropdown) {
      setItemIdSearchQuery('');
    }
  }, [showItemIdDropdown]);

  useEffect(() => {
    if (!showHomeLocationDropdown) {
      setHomeLocationSearchQuery('');
    }
  }, [showHomeLocationDropdown]);

  useEffect(() => {
    if (!showCurrentLocationDropdown) {
      setCurrentLocationSearchQuery('');
    }
  }, [showCurrentLocationDropdown]);

  useEffect(() => {
    if (!showStatusDropdown) {
      setStatusSearchQuery('');
    }
  }, [showStatusDropdown]);

  // Swipe handlers for edit functionality
  const minSwipeDistance = 50;
  const handleTouchStart = (e, itemId) => {
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    setSwipeStates(prev => ({
      ...prev,
      [itemId]: {
        startX: touch.clientX,
        currentX: touch.clientX,
        isSwiping: false
      }
    }));
  };

  const handleTouchMove = (e, itemId) => {
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    const state = swipeStates[itemId];
    if (!state) return;

    const deltaX = touch.clientX - state.startX;
    const isExpanded = expandedItemId === itemId;

    if (deltaX < 0 || (isExpanded && deltaX > 0)) {
      setSwipeStates(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          currentX: touch.clientX,
          isSwiping: true
        }
      }));
    }
  };

  const handleTouchEnd = (itemId) => {
    const state = swipeStates[itemId];
    if (!state) return;

    const deltaX = state.currentX - state.startX;
    const absDeltaX = Math.abs(deltaX);

    if (absDeltaX >= minSwipeDistance) {
      if (deltaX < 0) {
        // Swiped left - reveal edit button
        setExpandedItemId(itemId);
      } else {
        // Swiped right - hide buttons
        setExpandedItemId(null);
      }
    } else {
      // Small movement - snap back
      if (expandedItemId === itemId) {
        setExpandedItemId(null);
      }
    }

    // Reset swipe state
    setSwipeStates(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  const handleMouseDown = (e, itemId) => {
    if (e.button !== 0) return;
    const syntheticEvent = {
      touches: [{ clientX: e.clientX }],
      preventDefault: () => e.preventDefault()
    };
    handleTouchStart(syntheticEvent, itemId);
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.action-button')) {
      return;
    }
    if (expandedItemId) {
      setExpandedItemId(null);
    }
  };

  // Global mouse handlers for desktop support
  useEffect(() => {
    if (tableData.length === 0) return;

    const globalMouseMoveHandler = (e) => {
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };
        tableData.forEach(item => {
          const itemId = item.id;
          const state = prev[itemId];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          const isExpanded = expandedItemIdRef.current === itemId;
          if (deltaX < 0 || (isExpanded && deltaX > 0)) {
            newState[itemId] = {
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
        tableData.forEach(item => {
          const itemId = item.id;
          const state = prev[itemId];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              setExpandedItemId(itemId);
            } else {
              setExpandedItemId(null);
            }
          } else {
            if (expandedItemIdRef.current === itemId) {
              setExpandedItemId(null);
            }
          }
          delete newState[itemId];
          hasChanges = true;
        });
        return hasChanges ? newState : prev;
      });
    };

    document.addEventListener('mousemove', globalMouseMoveHandler);
    document.addEventListener('mouseup', globalMouseUpHandler);
    return () => {
      document.removeEventListener('mousemove', globalMouseMoveHandler);
      document.removeEventListener('mouseup', globalMouseUpHandler);
    };
  }, [tableData]);

  // Helper to get Project Incharge from tools_tracker_management
  // Only considers data that has this itemIdsId; uses id (not date) to pick the latest entry
  const getProjectIncharge = (itemIdsId, brandId, machineNumber) => {
    if (!itemIdsId) return '-';

    let latestEntry = null;
    let latestEntryId = 0;

    // Find the most recent entry in tools_tracker_management for this item (by id, not date)
    for (const entry of toolsTrackerManagementData) {
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];

      for (const entryItem of entryItems) {
        const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        const entryBrandId = entryItem.brand_id || entryItem.brandId;
        const entryMachineNumberId = entryItem.machine_number_id || entryItem.machineNumberId;
        const entryMachineNumberResolved = entryMachineNumberId ? resolveMachineNumberText(entryMachineNumberId) : (entryItem.machine_number || entryItem.machineNumber || '').trim();

        const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === String(itemIdsId);
        const brandMatch = !brandId || (entryBrandId && String(entryBrandId) === String(brandId));
        const machineMatch = !machineNumber || (String(entryMachineNumberResolved).trim() === String(machineNumber).trim());

        if (itemIdsMatch && brandMatch && machineMatch) {
          const entryId = Number(entry.id ?? entry._id ?? 0) || 0;
          if (entryId > latestEntryId) {
            latestEntryId = entryId;
            latestEntry = entry;
          }
        }
      }
    }

    if (latestEntry) {
      const projectInchargeId = latestEntry.project_incharge_id || latestEntry.projectInchargeId;
      if (projectInchargeId) {
        return employeesMap[projectInchargeId] || employeesMap[String(projectInchargeId)] || '-';
      }
    }

    return '-';
  };

  // Generate PDF function
  const handleDownloadPDF = () => {
    if (!filteredTableData || filteredTableData.length === 0) {
      alert('No data to download');
      return;
    }
    const doc = new jsPDF({
      orientation: "landscape",
    });
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Stock Report', 10, 18);

    // Prepare table data
    const tableData = filteredTableData.map((item, index) => {
      // Get Model and Project Incharge from stock management
      let model = '-';
      let projectIncharge = '-';

      if (item.hasItemId && item.itemId !== '-') {
        // Find the stock item by matching itemId display string, brand, and machineNumber
        const stockItem = stockManagementData.find(stock => {
          const stockItemIdsId = stock.item_ids_id || stock.itemIdsId;
          if (!stockItemIdsId) return false;

          const stockItemIdDisplay = resolveItemIdDisplay(stockItemIdsId);
          const stockBrandId = stock.brand_name_id || stock.brandNameId;
          const stockBrandDisplay = resolveBrandDisplay(stockBrandId);
          const stockMachineNumberId = stock.machine_number_id || stock.machineNumberId;
          const stockMachineNumberRaw = stock.machine_number || stock.machineNumber || '';
          const stockMachineNumber = stockMachineNumberId ? resolveMachineNumberText(stockMachineNumberId) : stockMachineNumberRaw;

          const itemIdMatch = stockItemIdDisplay === item.itemId;
          const brandMatch = !item.brand || stockBrandDisplay === item.brand;
          const machineMatch = !item.machineNumber || item.machineNumber === '-' || stockMachineNumber === item.machineNumber;

          return itemIdMatch && brandMatch && machineMatch;
        });

        if (stockItem) {
          model = stockItem.model || '-';

          // Get Project Incharge using the stock item's IDs
          const itemIdsId = stockItem.item_ids_id || stockItem.itemIdsId;
          const brandId = stockItem.brand_name_id || stockItem.brandNameId;
          const machineNumber = stockItem.machine_number || stockItem.machineNumber || '';
          projectIncharge = getProjectIncharge(itemIdsId, brandId, machineNumber);
        }
      }

      return [
        index + 1, // S.No
        item.itemName || '-', // Item Name
        item.itemId || '-', // Item ID
        item.brand || '-', // Brand
        model, // Model
        item.machineNumber && item.machineNumber !== '-' ? item.machineNumber : '-', // Machine Number
        item.location && item.location !== '-' ? item.location : '-', // Home
        item.currentLocation && item.currentLocation !== '-' ? item.currentLocation : '-', // Current
        projectIncharge // Project Incharge
      ];
    });

    // Generate table - transparent bg, lighter borders, no extra column (like PendingItems)
    const columnWidths = [12, 36, 20, 20, 26, 30, 50, 50, 35];
    const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
    autoTable(doc, {
      head: [['S.No', 'Item Name', 'Item ID', 'Brand', 'Model', 'Machine Number', 'Home', 'Current', 'Project Incharge']],
      body: tableData,
      startY: 24,
      tableWidth,
      styles: { fontSize: 7, cellPadding: 1.5, fillColor: false, lineColor: [180, 180, 180], lineWidth: 0.1 },
      headStyles: { fillColor: false, textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7, lineColor: [180, 180, 180], lineWidth: 0.1 },
      alternateRowStyles: { fillColor: false },
      tableLineColor: [180, 180, 180],
      tableLineWidth: 0.1,
      columnStyles: Object.fromEntries(columnWidths.map((w, i) => [i, { cellWidth: w }])),
      margin: { left: 10, right: 10 },
      didDrawPage: function (data) {
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }
    });

    // Generate filename
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    const filename = `Net_Stock_${dateStr}.pdf`;

    // Save PDF
    doc.save(filename);
  };

  // Handle save edit stock
  const handleSaveEditStock = async () => {
    if (!selectedItemForEdit || !newCount) {
      alert('Please enter a new count');
      return;
    }

    const oldCount = selectedItemForEdit.quantity || 0;
    const newCountNum = parseInt(newCount, 10);

    if (isNaN(newCountNum)) {
      alert('Please enter a valid number');
      return;
    }

    const quantityDifference = newCountNum - oldCount;

    if (quantityDifference === 0) {
      alert('New count is the same as old count');
      return;
    }

    if (!canCreate) {
      alert("You don't have permission to update stock.");
      return;
    }

    try {
      // Get the stock record IDs for this item
      const stockRecordIds = selectedItemForEdit.stockRecordIds || [];

      if (stockRecordIds.length === 0) {
        alert('Unable to find stock records for this item');
        return;
      }

      const targetLocationId = selectedItemForEdit.currentLocationId || selectedItemForEdit.homeLocationId || '';

      // Save the quantity difference against the location shown on the edited card.
      const stockManagementPayload = {
        item_name_id: String(selectedItemForEdit.itemNameId || ''),
        brand_name_id: selectedItemForEdit.brandId ? String(selectedItemForEdit.brandId) : '',
        item_ids_id: '', // No itemId for quantity-only items
        home_location_id: targetLocationId ? String(targetLocationId) : '',
        quantity: String(quantityDifference), // Send the difference
        tool_status: 'Available'
      };

      const stockRes = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockManagementPayload)
      });

      if (!stockRes.ok) {
        const errorText = await stockRes.text();
        throw new Error(`Failed to save stock management: ${stockRes.status} ${stockRes.statusText} - ${errorText}`);
      }

      // Refresh data
      const refreshRes = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/getAll`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (refreshRes.ok) {
        const raw = await refreshRes.json();
        const data = extractArrayFromResponse(raw);
        setStockManagementData(Array.isArray(data) ? data : []);
      }

      alert('Stock updated successfully');
      setShowEditStockModal(false);
      setSelectedItemForEdit(null);
      setNewCount('');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert(`Error updating stock: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden bg-white " style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="sticky top-0 bg-white z-10 flex-shrink-0">
        {/* Category and Brand Section */}
        <div className="flex items-center justify-between pb-[8px] border-b border-[#E0E0E0]">
          <div className="flex items-center gap-[4px] min-w-0">
            <button
              type="button"
              onClick={() => setShowBrandModal(true)}
              className="text-[12px] text-black font-semibold leading-normal cursor-pointer hover:underline p-[0px] border-0 bg-transparent text-right"
            >
              {selectedBrand ? selectedBrand : 'Brand'}
            </button>
            {selectedBrand && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBrand(null);
                }}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="#848484" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
          <span className="text-[12px] font-semibold cursor-pointer whitespace-nowrap" onClick={handleDownloadPDF}>Download</span>
        </div>
        {/* Table/List Segmented Control */}
        <div className="flex-shrink-0 pt-[8px]">
          <div className="flex bg-[#F2F4F7] items-center h-[32px] shadow-sm rounded-md">
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 px-[16px] ml-0.5 h-[28px] rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${viewMode === 'table'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-[16px] mr-0.5 h-[28px] rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${viewMode === 'list'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Universal Search and Filter */}
      <div className="mt-[6px] pb-[6px]">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[36px] pl-[40px] pr-[12px] text-[12px] rounded-full font-medium bg-white focus:outline-none border border-[rgba(0,0,0,0.12)]"
          />
        </div>
        <div className="flex items-center mt-[6px] gap-[4px] min-w-0">
          <button onClick={() => setShowFilterBottomSheet(true)} className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0">
            <img src={Filter} alt="Filter" className="w-[13px] h-[11px]" /> {!(selectedItemName || selectedItemId || selectedHomeLocation || selectedCurrentLocation || selectedStatus) && (
              <span className="text-[12px] font-medium text-black">Filter</span>
            )}
          </button>
          {/* Active Filter Chips */}
          <div
            className="flex items-center gap-[4px] overflow-x-auto no-scrollbar scrollbar-none min-w-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {(selectedItemName || selectedItemId || selectedHomeLocation || selectedCurrentLocation || selectedStatus) && (
              <>
                {selectedItemName && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Item Name</span>
                    <button
                      onClick={() => setSelectedItemName(null)}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {selectedItemId && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Item ID</span>
                    <button
                      onClick={() => setSelectedItemId(null)}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {selectedHomeLocation && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Home</span>
                    <button
                      onClick={() => setSelectedHomeLocation('')}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {selectedCurrentLocation && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Current</span>
                    <button
                      onClick={() => setSelectedCurrentLocation('')}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {selectedStatus && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Status</span>
                    <button
                      onClick={() => setSelectedStatus('')}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div key={viewMode} className="flex-1 overflow-y-auto no-scrollbar scrollbar-none pb-[8px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-[14px] text-gray-500">Loading...</p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View - Individual Items */
          <div className="pt-[6px">
            {filteredTableData.length === 0 ? (
              <p className="text-[14px] text-gray-500 text-center mt-8">No data available</p>
            ) : (
              <>
                <div className="overflow-y-auto scrollbar-none no-scrollbar scrollbar-none">
                  {filteredTableData.map((item, index) => {
                    const itemId = item.id || index;
                    const swipeState = swipeStates[itemId];
                    const isExpanded = expandedItemId === itemId;
                    // Quantity-only rows are editable, including split-by-location cards.
                    const canEdit =
                      !item.hasItemId &&
                      item.quantity !== 0 &&
                      item.isEditableQuantityCard !== false;

                    // Calculate swipe offset (button width is 48px)
                    const buttonWidth = 48;
                    const swipeOffset = swipeState && swipeState.isSwiping
                      ? Math.max(-buttonWidth, Math.min(0, swipeState.currentX - swipeState.startX))
                      : isExpanded
                        ? -buttonWidth
                        : 0;

                    return (
                      <div key={itemId} className="relative shadow-xl border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px]">
                        {/* Card */}
                        <div
                          className="bg-white rounded-[8px] h-full px-[12px] py-[10px] cursor-pointer transition-all duration-300 ease-out select-none"
                          style={{
                            transform: `translateX(${swipeOffset}px)`,
                            touchAction: 'pan-y',
                            userSelect: 'none',
                            WebkitUserSelect: 'none'
                          }}
                          onTouchStart={(e) => handleTouchStart(e, itemId)}
                          onTouchMove={(e) => handleTouchMove(e, itemId)}
                          onTouchEnd={() => handleTouchEnd(itemId)}
                          onMouseDown={(e) => handleMouseDown(e, itemId)}
                          onClick={handleCardClick}
                        >
                          <div className="flex flex-col">
                            {/* Top line: Location, Item Name and Status badge */}
                            <div className="flex justify-between items-start">
                              <p className="text-[12px] font-semibold leading-tight">
                                {item.location !== '-' ? (
                                  <>
                                    <span className="text-black">{item.itemName}</span>
                                  </>
                                ) : (
                                  <span className="text-black">{item.itemName}</span>
                                )}
                              </p>
                              {item.status !== '-' && (
                                <span className={`pl-[6px] pr-[10px] py-[2px] rounded-full text-[10px] font-medium whitespace-nowrap flex-shrink-0 ml-3 ${item.status === 'Working' ? 'bg-[#E6FFEE] text-[#007233]' :
                                  item.status === 'Not Working' ? 'bg-[#FFF2DB] text-[#BF9853]' : item.status === 'Machine Dead' ? 'bg-[#FFEAE4] text-[#E4572E]' :
                                    'bg-[#E6E6E6] text-[#212121]'
                                  }`}>
                                  • {item.status}
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-start mb-0.5">
                              <div className="flex flex-col">
                                <p className="text-[11px] leading-tight">
                                  <span className="text-black font-semibold">Home: </span>
                                  <span className="text-black font-semibold">{item.location !== '-' ? item.location : '-'}</span>
                                </p>
                                <p className="text-[11px] leading-tight text-[#BF9853] mt-0.5">
                                  <span className=" font-semibold">Current: </span>
                                  <span className=" font-semibold">{item.currentLocation && item.currentLocation !== '-' ? item.currentLocation : '-'}</span>
                                </p>
                              </div>
                            </div>
                            {/* Middle line: Machine number - empty opposite */}
                            <div className="flex justify-between items-start mb-0.5">
                              <p className="text-[12px] text-black leading-tight">
                                {item.machineNumber !== '-' ? resolveMachineNumberText(item.machineNumber) : ''}
                              </p>
                              <div className="flex-shrink-0 ml-3"></div>
                            </div>
                            {/* Bottom line: Brand, Model and Item ID/Quantity */}
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-[12px] text-[#9E9E9E] font-semibold leading-tight min-w-0 flex-1">
                                {[item.brand || '', item.model && item.model !== '' ? item.model : null].filter(Boolean).join(', ') || ''}
                              </p>
                              <p className="text-[12px] font-medium text-black flex-shrink-0">
                                {item.hasItemId
                                  ? (item.isMerged ? item.quantity : item.itemId)
                                  : item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Edit Button - Behind the card on the right, revealed on swipe */}
                        <div
                          className="absolute right-0 top-0 bottom-0 flex gap-[8px] flex-shrink-0 z-0"
                          style={{
                            opacity: isExpanded || (swipeState && swipeState.isSwiping && swipeOffset < -20) ? 1 : 0,
                            transform: swipeOffset < 0
                              ? `translateX(${Math.max(0, 48 + swipeOffset)}px)`
                              : 'translateX(48px)',
                            transition: (swipeState && swipeState.isSwiping) ? 'none' : 'opacity 0.2s ease-out, transform 0.3s ease-out',
                            pointerEvents: isExpanded ? 'auto' : 'none'
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canEdit) {
                                setSelectedItemForEdit(item);
                                setNewCount(String(item.quantity));
                                setShowEditStockModal(true);
                                setExpandedItemId(null);
                              } else {
                                setExpandedItemId(null);
                              }
                            }}
                            className="action-button w-[48px] h-full min-h-[48px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-[6px] hover:bg-[#22a882] transition-colors shadow-sm"
                            title="Edit"
                          >
                            <img src={EditIcon} alt="Edit" className="w-[18px] h-[18px]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          /* List View - Aggregated Summary Table Only */
          <div className="">
            {filteredAggregatedSummary.length === 0 ? (
              <p className="text-[14px] text-gray-500 text-center mt-8">No data available</p>
            ) : (
              <>
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-col max-h-[50vh]">
                  {/* Table Header - fixed, does not scroll */}
                  <div className="bg-gray-50 border-b border-gray-200 flex-shrink-0">
                    <div className="grid grid-cols-12 gap-[8px] px-[12px] py-[8px]">
                      <div className="col-span-1 text-[12px] font-semibold"></div>
                      <div className="col-span-5 text-[12px] text-black font-semibold">Item Name</div>
                      <div className="col-span-3 text-[12px] text-black font-semibold">Brand</div>
                      <div className="col-span-3 text-[12px] text-black text-right font-semibold">Total Stock</div>
                    </div>
                  </div>
                  {/* Table Body - scrollable */}
                  <div className="overflow-y-auto flex-1 min-h-0">
                    {filteredAggregatedSummary.map((item, index) => (
                      <div
                        key={`${item.itemName}_${item.brand}_${index}`}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <div className="grid grid-cols-12 gap-[8px] px-[12px] py-[12px]">
                          <div className="col-span-1 text-[12px] text-black font-medium">{index + 1}</div>
                          <div className="col-span-5 text-[12px] text-black font-medium">{item.itemName}</div>
                          <div className="col-span-3 text-[12px] text-black font-medium">{item.brand}</div>
                          <div className="col-span-3 text-[12px] font-medium text-black text-center">
                            {String(item.total).padStart(2, '0')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Stock Bottom Sheet Modal */}
      {showEditStockModal && selectedItemForEdit && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => {
              setShowEditStockModal(false);
              setSelectedItemForEdit(null);
              setNewCount('');
            }}
          />
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[360px] bg-white rounded-t-[20px] z-50 shadow-lg" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-[16px] pt-[16px] pb-[12px] border-b border-gray-200">
              <h2 className="text-[16px] font-semibold text-black">Edit Stock</h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditStockModal(false);
                  setSelectedItemForEdit(null);
                  setNewCount('');
                }}
                className="text-red-500 hover:text-red-700"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {/* Content */}
            <div className="px-[16px] py-[16px] space-y-4">
              {/* Item Name - Read Only */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                  Item Name<span className="text-red-500">*</span>
                </p>
                <input
                  type="text"
                  value={selectedItemForEdit.itemName || ''}
                  readOnly
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-[12px] pr-[12px] text-[12px] font-medium bg-gray-100 text-gray-600 cursor-not-allowed"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                />
              </div>
              {/* Brand - Read Only */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                  Brand<span className="text-red-500">*</span>
                </p>
                <input
                  type="text"
                  value={selectedItemForEdit.brand || '-'}
                  readOnly
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-[12px] pr-[12px] text-[12px] font-medium bg-gray-100 text-gray-600 cursor-not-allowed"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                />
              </div>
              {/* New Count - Editable */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                  New Count<span className="text-red-500">*</span>
                </p>
                <input
                  type="number"
                  value={newCount}
                  onChange={(e) => setNewCount(e.target.value)}
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-[12px] pr-[12px] text-[12px] font-medium bg-white text-black"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                  placeholder="Enter"
                />
              </div>
            </div>
            {/* Action Buttons */}
            <div className="px-[16px] pb-[16px] pt-[8px] flex gap-[12px]">
              <button
                type="button"
                onClick={() => {
                  setShowEditStockModal(false);
                  setSelectedItemForEdit(null);
                  setNewCount('');
                }}
                className="flex-1 h-[40px] border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[14px] font-medium text-black bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditStock}
                className="flex-1 h-[40px] bg-black rounded-[8px] text-[14px] font-medium text-white hover:bg-gray-800"
              >
                Add
              </button>
            </div>
          </div>
        </>
      )}
      {showFilterBottomSheet && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-end justify-center"
          style={{ fontFamily: "'Manrope', sans-serif" }}
          onClick={() => setShowFilterBottomSheet(false)}
        >
          <div
            className="bg-white w-full h-[380px] rounded-tl-[16px] rounded-tr-[16px] relative z-[101] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-1">
              <p className="text-[16px] font-bold text-black">Select Filters</p>
              <button type="button" onClick={() => setShowFilterBottomSheet(false)} className="text-[#e06256] text-xl font-bold leading-none">
                <img src={Close} alt="close" className="w-[11px] h-[11px]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-1">
               <div className='flex items-start gap-[12px]'>
                 <div className="mb-4 flex-1">
                  <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Item Name</p>
                  <div className="relative">
                    <div onClick={() => setShowItemNameDropdown(true)} className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0" style={{ color: selectedItemName ? '#000' : '#9E9E9E', boxSizing: 'border-box' }}>
                      <span className="truncate">{selectedItemName || 'Select Item Name'}</span>
                    </div>
                    {selectedItemName && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedItemName(null); }} className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    )}
                  </div>
                </div>
                 <div className="mb-4 flex-1">
                  <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Item ID</p>
                  <div className="relative">
                    <div onClick={() => setShowItemIdDropdown(true)} className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0" style={{ color: selectedItemId ? '#000' : '#9E9E9E', boxSizing: 'border-box' }}>
                      <span className="truncate">{selectedItemId || 'Select Item ID'}</span>
                    </div>
                    {selectedItemId && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedItemId(null); }} className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Home Location</p>
                <div className="relative">
                  <div onClick={() => setShowHomeLocationDropdown(true)} className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0" style={{ color: selectedHomeLocation ? '#000' : '#9E9E9E', boxSizing: 'border-box' }}>
                    <span className="truncate">{selectedHomeLocation || 'Select Home Location'}</span>
                  </div>
                  {selectedHomeLocation && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedHomeLocation(''); }} className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                      <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Current Location</p>
                <div className="relative">
                  <div onClick={() => setShowCurrentLocationDropdown(true)} className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0" style={{ color: selectedCurrentLocation ? '#000' : '#9E9E9E', boxSizing: 'border-box' }}>
                    <span className="truncate">{selectedCurrentLocation || 'Select Current Location'}</span>
                  </div>
                  {selectedCurrentLocation && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedCurrentLocation(''); }} className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                      <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Status</p>
                <div className="relative">
                  <div onClick={() => setShowStatusDropdown(true)} className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0" style={{ color: selectedStatus ? '#000' : '#9E9E9E', boxSizing: 'border-box' }}>
                    <span className="truncate">{selectedStatus || 'Select Status'}</span>
                  </div>
                  {selectedStatus && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedStatus(''); }} className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                      <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showItemNameDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowItemNameDropdown(false); }} style={{ fontFamily: "'Manrope', sans-serif" }}>
          <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-[24px]">
              <p className="text-[16px] font-semibold text-black">Select Item Name</p>
              <button onClick={() => setShowItemNameDropdown(false)} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"><img src={Close} alt="Close" className="w-[11px] h-[11px]" /></button>
            </div>
            <div className="px-6 pt-[4px] pb-[6px]">
              <div className="relative">
                <input type="text" value={itemNameSearchQuery} onChange={(e) => setItemNameSearchQuery(e.target.value)} placeholder="Search" className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none" autoFocus />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"><img src={Search} alt="Search" className="w-[12px] h-[12px]" /></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]">
              <div className="shadow-md rounded-lg overflow-hidden">
                {getFilteredItemNameOptions().length > 0 ? (
                  <div className="space-y-0">
                    <button type="button" onClick={() => { setSelectedItemName(null); setShowItemNameDropdown(false); }} className={`w-full px-[16px] flex items-center gap-3 transition-colors ${!selectedItemName ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`} style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}>
                      <p className="text-[12px] font-medium text-black text-left">All</p>
                    </button>
                    {getFilteredItemNameOptions().map((name) => (
                      <button key={name} type="button" onClick={() => { setSelectedItemName(name); setShowItemNameDropdown(false); }} className={`w-full px-[16px] flex items-center gap-3 transition-colors ${selectedItemName === name ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`} style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}>
                        <p className="text-[12px] font-medium text-black text-left">{name}</p>
                      </button>
                    ))}
                  </div>
                ) : <div className="flex flex-col items-center justify-center py-4"><p className="text-[14px] font-medium text-[#9E9E9E] text-center">{itemNameSearchQuery.trim() ? 'No options found' : 'No options available'}</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {showItemIdDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowItemIdDropdown(false); }} style={{ fontFamily: "'Manrope', sans-serif" }}>
          <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-[24px]">
              <p className="text-[16px] font-semibold text-black">Select Item ID</p>
              <button onClick={() => setShowItemIdDropdown(false)} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"><img src={Close} alt="Close" className="w-[11px] h-[11px]" /></button>
            </div>
            <div className="px-6 pt-[4px] pb-[6px]">
              <div className="relative">
                <input type="text" value={itemIdSearchQuery} onChange={(e) => setItemIdSearchQuery(e.target.value)} placeholder="Search" className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none" autoFocus />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"><img src={Search} alt="Search" className="w-[12px] h-[12px]" /></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]">
              <div className="shadow-md rounded-lg overflow-hidden">
                {getFilteredItemIdOptions().length > 0 ? (
                  <div className="space-y-0">
                    <button type="button" onClick={() => { setSelectedItemId(null); setShowItemIdDropdown(false); }} className={`w-full px-[16px] flex items-center gap-3 transition-colors ${!selectedItemId ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`} style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}>
                      <p className="text-[12px] font-medium text-black text-left">All</p>
                    </button>
                    {getFilteredItemIdOptions().map((id) => (
                      <button key={id} type="button" onClick={() => { setSelectedItemId(id); setShowItemIdDropdown(false); }} className={`w-full px-[16px] flex items-center gap-3 transition-colors ${selectedItemId === id ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`} style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}>
                        <p className="text-[12px] font-medium text-black text-left">{id}</p>
                      </button>
                    ))}
                  </div>
                ) : <div className="flex flex-col items-center justify-center py-4"><p className="text-[14px] font-medium text-[#9E9E9E] text-center">{itemIdSearchQuery.trim() ? 'No options found' : 'No options available'}</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {showHomeLocationDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowHomeLocationDropdown(false); }} style={{ fontFamily: "'Manrope', sans-serif" }}>
          <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-[24px]"><p className="text-[16px] font-semibold text-black">Select Home Location</p><button onClick={() => setShowHomeLocationDropdown(false)} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"><img src={Close} alt="Close" className="w-[11px] h-[11px]" /></button></div>
            <div className="px-6 pt-[4px] pb-[6px]"><div className="relative"><input type="text" value={homeLocationSearchQuery} onChange={(e) => setHomeLocationSearchQuery(e.target.value)} placeholder="Search" className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none" autoFocus /><div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"><img src={Search} alt="Search" className="w-[12px] h-[12px]" /></div></div></div>
            <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]"><div className="shadow-md rounded-lg overflow-hidden">{getFilteredHomeLocationOptions().length > 0 ? <div className="space-y-0"><button type="button" onClick={() => { setSelectedHomeLocation(''); setShowHomeLocationDropdown(false); }} className={`w-full px-[16px] flex items-center gap-3 transition-colors ${!selectedHomeLocation ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`} style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}><p className="text-[12px] font-medium text-black text-left">All</p></button>{getFilteredHomeLocationOptions().map((location) => (<button key={location} type="button" onClick={() => { setSelectedHomeLocation(location); setShowHomeLocationDropdown(false); }} className={`w-full px-[16px] flex items-center gap-3 transition-colors ${selectedHomeLocation === location ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`} style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}><p className="text-[12px] font-medium text-black text-left">{location}</p></button>))}</div> : <div className="flex flex-col items-center justify-center py-4"><p className="text-[14px] font-medium text-[#9E9E9E] text-center">{homeLocationSearchQuery.trim() ? 'No options found' : 'No options available'}</p></div>}</div></div>
          </div>
        </div>
      )}

      {showCurrentLocationDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowCurrentLocationDropdown(false); }} style={{ fontFamily: "'Manrope', sans-serif" }}>
          <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-[24px]"><p className="text-[16px] font-semibold text-black">Select Current Location</p><button onClick={() => setShowCurrentLocationDropdown(false)} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"><img src={Close} alt="Close" className="w-[11px] h-[11px]" /></button></div>
            <div className="px-6 pt-[4px] pb-[6px]"><div className="relative"><input type="text" value={currentLocationSearchQuery} onChange={(e) => setCurrentLocationSearchQuery(e.target.value)} placeholder="Search" className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none" autoFocus /><div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"><img src={Search} alt="Search" className="w-[12px] h-[12px]" /></div></div></div>
            <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]"><div className="shadow-md rounded-lg overflow-hidden">{getFilteredCurrentLocationOptions().length > 0 ? <div className="space-y-0"><button type="button" onClick={() => { setSelectedCurrentLocation(''); setShowCurrentLocationDropdown(false); }} className={`w-full px-[16px] flex items-center gap-3 transition-colors ${!selectedCurrentLocation ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`} style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}><p className="text-[12px] font-medium text-black text-left">All</p></button>{getFilteredCurrentLocationOptions().map((location) => (<button key={location} type="button" onClick={() => { setSelectedCurrentLocation(location); setShowCurrentLocationDropdown(false); }} className={`w-full px-[16px] flex items-center gap-3 transition-colors ${selectedCurrentLocation === location ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`} style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}><p className="text-[12px] font-medium text-black text-left">{location}</p></button>))}</div> : <div className="flex flex-col items-center justify-center py-4"><p className="text-[14px] font-medium text-[#9E9E9E] text-center">{currentLocationSearchQuery.trim() ? 'No options found' : 'No options available'}</p></div>}</div></div>
          </div>
        </div>
      )}

      {showStatusDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowStatusDropdown(false); }} style={{ fontFamily: "'Manrope', sans-serif" }}>
          <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-[24px]"><p className="text-[16px] font-semibold text-black">Select Status</p><button onClick={() => setShowStatusDropdown(false)} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"><img src={Close} alt="Close" className="w-[11px] h-[11px]" /></button></div>
            <div className="px-6 pt-[4px] pb-[6px]"><div className="relative"><input type="text" value={statusSearchQuery} onChange={(e) => setStatusSearchQuery(e.target.value)} placeholder="Search" className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none" autoFocus /><div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"><img src={Search} alt="Search" className="w-[12px] h-[12px]" /></div></div></div>
            <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]"><div className="shadow-md rounded-lg overflow-hidden">{getFilteredStatusOptions().length > 0 ? <div className="space-y-0"><button type="button" onClick={() => { setSelectedStatus(''); setShowStatusDropdown(false); }} className={`w-full px-[16px] flex items-center gap-3 transition-colors ${!selectedStatus ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`} style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}><p className="text-[12px] font-medium text-black text-left">All</p></button>{getFilteredStatusOptions().map((status) => (<button key={status} type="button" onClick={() => { setSelectedStatus(status); setShowStatusDropdown(false); }} className={`w-full px-[16px] flex items-center gap-3 transition-colors ${selectedStatus === status ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`} style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}><p className="text-[12px] font-medium text-black text-left">{status}</p></button>))}</div> : <div className="flex flex-col items-center justify-center py-4"><p className="text-[14px] font-medium text-[#9E9E9E] text-center">{statusSearchQuery.trim() ? 'No options found' : 'No options available'}</p></div>}</div></div>
          </div>
        </div>
      )}
      {/* Brand Modal */}
      <SelectOptionModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSelect={(value) => {
          setSelectedBrand(value);
          setShowBrandModal(false);
        }}
        selectedValue={selectedBrand}
        options={brandOptions}
        fieldName="Brand"
      />
    </div>
  );
};

export default NetStock;
