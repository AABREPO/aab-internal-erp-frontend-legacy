import React, { useState, useEffect, useCallback } from 'react';
import Filter from '../Images/Filter.png';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import Close from '../Images/close.png';
import Download from '../Images/Download.svg';
import Search from '../Images/Search.png';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_tracker_management';
const TOOLS_STOCK_MANAGEMENT_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_tracker_stock_management';
const PROJECT_NAMES_BASE_URL = 'https://backendaab.in/demoAabuilderDash/api/project_Names';
const VENDOR_NAMES_BASE_URL = 'https://backendaab.in/demoAabuilderDash/api/vendor_Names';
const EMPLOYEE_DETAILS_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/employee_details';
const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_item_name';
const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_item_id';
const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_brand';

const PendingItems = ({ user }) => {
  const [pendingData, setPendingData] = useState([]);
  const [selectedDays, setSelectedDays] = useState('all');
  const [selectedHomeLocation, setSelectedHomeLocation] = useState(null);
  const [showHomeLocationDropdown, setShowHomeLocationDropdown] = useState(false);
  const [homeLocationSearchQuery, setHomeLocationSearchQuery] = useState('');
  const [homeLocationOptions, setHomeLocationOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistorySheet, setShowHistorySheet] = useState(false);
  const [selectedItemHistory, setSelectedItemHistory] = useState(null);
  const [toolsTrackerManagementData, setToolsTrackerManagementData] = useState([]);
  const [stockManagementData, setStockManagementData] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [vendorsMap, setVendorsMap] = useState({});
  const [employeesMap, setEmployeesMap] = useState({});
  const [itemNamesMap, setItemNamesMap] = useState({});
  const [itemIdsMap, setItemIdsMap] = useState({});
  const [brandsMap, setBrandsMap] = useState({});
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filterItemName, setFilterItemName] = useState(null);
  const [filterLocation, setFilterLocation] = useState(null);
  const [filterItemId, setFilterItemId] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [filterEntryNo, setFilterEntryNo] = useState(null);
  const [filterProjectIncharge, setFilterProjectIncharge] = useState(null);
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [itemIdOptions, setItemIdOptions] = useState([]);
  const [entryNoOptions, setEntryNoOptions] = useState([]);
  const [projectInchargeOptions, setProjectInchargeOptions] = useState([]);
  const [filterOpenPicker, setFilterOpenPicker] = useState(null);
  const [filterPickerSearch, setFilterPickerSearch] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
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
            map[i.id] = toolsId;
            map[String(i.id)] = toolsId;
          });
          setItemIdsMap(map);
        }
        const brandsRes = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(b => {
            const brandName = b.tools_brand || b.toolsBrand || '';
            map[b.id] = brandName;
            map[String(b.id)] = brandName;
          });
          setBrandsMap(map);
        }
      } catch (error) {
        console.error('Error fetching lookup data:', error);
      }
    };
    fetchLookupData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const transferRes = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (transferRes.ok) {
          const data = await transferRes.json();
          const entries = (Array.isArray(data) ? data : []).filter(entry => {
            const entryType = entry.tools_entry_type || entry.toolsEntryType || 'Entry';
            return entryType.toLowerCase() === 'entry' || entryType.toLowerCase() === 'relocate';
          });
          setToolsTrackerManagementData(entries);
        }
        const stockRes = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (stockRes.ok) {
          const data = await stockRes.json();
          setStockManagementData(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Get location name helper
  const getLocationName = useCallback((id, checkVendorsFirst = false) => {
    if (!id) return '-';
    const idStr = String(id);
    if (checkVendorsFirst) {
      if (vendorsMap[idStr]) return vendorsMap[idStr];
      if (vendorsMap[id]) return vendorsMap[id];
    }
    if (projectsMap[idStr]) return projectsMap[idStr];
    if (projectsMap[id]) return projectsMap[id];
    if (vendorsMap[idStr]) return vendorsMap[idStr];
    if (vendorsMap[id]) return vendorsMap[id];
    return '-';
  }, [projectsMap, vendorsMap]);

  // Build home location options - include both old (entry level/stock) and new (entryItem level) home locations
  // Build locationOptions for Current Location filter - From/To (current) locations from transfers
  useEffect(() => {
    const locations = new Set();
    const currentLocations = new Set();
    toolsTrackerManagementData.forEach(entry => {
      const entryType = String(entry.tools_entry_type || entry.toolsEntryType || '').toLowerCase();
      const fromId = entry.from_project_id || entry.fromProjectId;
      const toId = entry.to_project_id || entry.toProjectId;
      if (fromId) {
        const name = getLocationName(fromId);
        if (name && name !== '-') currentLocations.add(JSON.stringify({ id: String(fromId), name }));
      }
      if (toId) {
        const name = getLocationName(toId);
        if (name && name !== '-') currentLocations.add(JSON.stringify({ id: String(toId), name }));
      }
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
      entryItems.forEach(entryItem => {
        const itemHomeLocationId = entryItem.home_location_id || entryItem.homeLocationId;
        if (itemHomeLocationId) {
          const locationName = getLocationName(itemHomeLocationId);
          if (locationName && locationName !== '-') {
            locations.add(JSON.stringify({ id: String(itemHomeLocationId), name: locationName }));
            if (entryType === 'relocate' || entryType === 'relocation') {
              currentLocations.add(JSON.stringify({ id: String(itemHomeLocationId), name: locationName }));
            }
          }
        }
      });
      const entryHomeLocationId = entry.home_location_id || entry.homeLocationId;
      if (entryHomeLocationId) {
        const locationName = getLocationName(entryHomeLocationId);
        if (locationName && locationName !== '-') {
          locations.add(JSON.stringify({ id: String(entryHomeLocationId), name: locationName }));
        }
      }
    });
    stockManagementData.forEach(stock => {
      const homeLocationId = stock.home_location_id || stock.homeLocationId;
      if (homeLocationId) {
        const locationName = getLocationName(homeLocationId);
        if (locationName && locationName !== '-') {
          locations.add(JSON.stringify({ id: String(homeLocationId), name: locationName }));
        }
      }
    });
    const homeOptions = Array.from(locations).map(loc => {
      const parsed = JSON.parse(loc);
      return { id: parsed.id, value: parsed.name, label: parsed.name };
    });
    homeOptions.sort((a, b) => a.value.localeCompare(b.value));
    setHomeLocationOptions(homeOptions);
    const currentOptions = Array.from(currentLocations).map(loc => {
      const parsed = JSON.parse(loc);
      return { id: parsed.id, value: parsed.name, label: parsed.name };
    });
    currentOptions.sort((a, b) => a.value.localeCompare(b.value));
    setLocationOptions(currentOptions);
  }, [toolsTrackerManagementData, stockManagementData, getLocationName]);

  // Populate filter options
  useEffect(() => {
    // Item Name options
    const itemNames = Array.from(new Set(Object.values(itemNamesMap))).filter(Boolean).sort();
    setItemNameOptions(itemNames.map(name => ({ value: name, label: name })));

    // Item ID options
    const itemIds = Array.from(new Set(Object.values(itemIdsMap))).filter(Boolean).sort();
    setItemIdOptions(itemIds.map(id => ({ value: id, label: id })));

    // Entry No options
    const entryNos = new Set();
    toolsTrackerManagementData.forEach(entry => {
      const eno = entry.eno || '';
      if (eno) entryNos.add(eno);
    });
    setEntryNoOptions(Array.from(entryNos).sort().map(eno => ({ value: eno, label: eno })));

    // Project Incharge options
    const incharges = Array.from(new Set(Object.values(employeesMap))).filter(Boolean).sort();
    setProjectInchargeOptions(incharges.map(name => ({ value: name, label: name })));
  }, [itemNamesMap, itemIdsMap, toolsTrackerManagementData, employeesMap]);
  const calculateDays = (date1, date2) => {
    if (!date1 || !date2) return 0;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const getItemTransferHistory = (itemIdsId, brandId, machineNumber, homeLocationId) => {
    const itemIdsIdStr = String(itemIdsId);
    const brandIdStr = brandId ? String(brandId) : null;
    const machineNumberStr = machineNumber ? String(machineNumber).trim() : '';
    const transferEntries = [];
    for (const entry of toolsTrackerManagementData) {
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
      const hasMatchingItem = entryItems.some(entryItem => {
        const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        const entryBrandId = entryItem.brand_id || entryItem.brandId;
        const entryMachineNumber = entryItem.machine_number || entryItem.machineNumber || '';
        const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === itemIdsIdStr;
        const brandMatch = !brandIdStr || (entryBrandId && String(entryBrandId) === brandIdStr);
        const machineMatch = !machineNumberStr || (entryMachineNumber && String(entryMachineNumber).trim() === machineNumberStr);
        return itemIdsMatch && brandMatch && machineMatch;
      });
      if (hasMatchingItem) {
        const fromProjectId = entry.from_project_id || entry.fromProjectId;
        const toProjectId = entry.to_project_id || entry.toProjectId;
        const createdDateTime = entry.created_date_time || entry.createdDateTime || entry.timestamp || '';
        const projectInchargeId = entry.project_incharge_id || entry.projectInchargeId;
        const eno = entry.eno || '';
        transferEntries.push({
          fromLocationId: fromProjectId,
          toLocationId: toProjectId,
          date: createdDateTime,
          inchargeId: projectInchargeId,
          eno: eno
        });
      }
    }
    transferEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    const history = [];
    let currentLocationId = homeLocationId;
    let currentLocationName = getLocationName(homeLocationId);
    let locationStartDate = null;
    let firstTransferDate = transferEntries.length > 0 ? transferEntries[0].date : null;
    for (let i = 0; i < transferEntries.length; i++) {
      const transfer = transferEntries[i];
      const fromLocationId = transfer.fromLocationId;
      const toLocationId = transfer.toLocationId;
      const transferDate = transfer.date;
      if (String(fromLocationId) === String(currentLocationId)) {
        if (locationStartDate) {
          const daysAtLocation = calculateDays(locationStartDate, transferDate);
          history.push({
            locationId: currentLocationId,
            locationName: currentLocationName,
            fromDate: locationStartDate,
            toDate: transferDate,
            days: daysAtLocation,
            isHome: String(currentLocationId) === String(homeLocationId),
            inchargeId: transfer.inchargeId,
            eno: transfer.eno
          });
        } else if (i === 0 && String(fromLocationId) === String(homeLocationId)) {
          history.push({
            locationId: homeLocationId,
            locationName: currentLocationName,
            fromDate: transferDate,
            toDate: transferDate,
            days: 0,
            isHome: true,
            inchargeId: transfer.inchargeId,
            eno: transfer.eno
          });
        }
        currentLocationId = toLocationId;
        currentLocationName = getLocationName(toLocationId);
        locationStartDate = transferDate;
      }
    }
    if (locationStartDate) {
      const today = new Date();
      const daysAtCurrent = calculateDays(locationStartDate, today);
      const isAtHome = String(currentLocationId) === String(homeLocationId);
      history.push({
        locationId: currentLocationId,
        locationName: currentLocationName,
        fromDate: locationStartDate,
        toDate: today.toISOString(),
        days: daysAtCurrent,
        isHome: isAtHome,
        isCurrent: true
      });
    }
    const totalDaysAway = history
      .filter(h => !h.isHome)
      .reduce((sum, h) => sum + h.days, 0);

    return { history, totalDaysAway, currentLocationId, currentLocationName };
  };
  // Helper function to get home location ID - get the LAST (most recent) home_location_id from tools_tracker_management, fallback to stock_management
  const getHomeLocationId = (itemIdsId, brandId, machineNumber) => {
    // First, find all entries in tools_tracker_management that match this item and have home_location_id
    const matchingEntries = [];

    for (const entry of toolsTrackerManagementData) {
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];

      // Check each item in the entry for matching item and home_location_id
      for (const entryItem of entryItems) {
        const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        const entryBrandId = entryItem.brand_id || entryItem.brandId;
        const entryMachineNumber = entryItem.machine_number || entryItem.machineNumber || '';

        const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === String(itemIdsId);
        const brandMatch = !brandId || (entryBrandId && String(entryBrandId) === String(brandId));
        const machineMatch = !machineNumber || (entryMachineNumber && String(entryMachineNumber).trim() === machineNumber.trim());

        if (itemIdsMatch && brandMatch && machineMatch) {
          // Check if this specific item has home_location_id
          const itemHomeLocationId = entryItem.home_location_id || entryItem.homeLocationId;
          if (itemHomeLocationId) {
            const entryDate = entry.created_date_time || entry.createdDateTime || entry.timestamp || '';
            matchingEntries.push({
              homeLocationId: itemHomeLocationId,
              date: entryDate
            });
          }
        }
      }
    }

    // If we found entries with home_location_id, return the most recent one (by date)
    if (matchingEntries.length > 0) {
      // Sort by date descending (most recent first)
      matchingEntries.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Descending order
      });
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

    return null;
  };

  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        setLoading(true);
        const pendingItems = [];
        const processedItems = new Set();

        // Get all unique items from tools_tracker_management first, then fallback to stock_management
        const allItems = new Set();

        // Collect items from tools_tracker_management
        for (const entry of toolsTrackerManagementData) {
          const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
          entryItems.forEach(entryItem => {
            const itemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
            const brandId = entryItem.brand_id || entryItem.brandId;
            const machineNumber = entryItem.machine_number || entryItem.machineNumber || '';
            if (itemIdsId) {
              allItems.add(JSON.stringify({ itemIdsId, brandId, machineNumber }));
            }
          });
        }

        // Also collect items from stock_management that might not be in tools_tracker_management
        for (const stockItem of stockManagementData) {
          const itemIdsId = stockItem.item_ids_id || stockItem.itemIdsId;
          const brandId = stockItem.brand_name_id || stockItem.brandNameId;
          const machineNumber = stockItem.machine_number || stockItem.machineNumber || '';
          if (itemIdsId) {
            allItems.add(JSON.stringify({ itemIdsId, brandId, machineNumber }));
          }
        }

        // Process each unique item
        for (const itemStr of allItems) {
          const item = JSON.parse(itemStr);
          const { itemIdsId, brandId, machineNumber } = item;
          const itemKey = `${itemIdsId}_${brandId || ''}_${machineNumber}`;

          if (processedItems.has(itemKey)) continue;
          processedItems.add(itemKey);

          // Get home location ID - prioritize from tools_tracker_management
          const homeLocationId = getHomeLocationId(itemIdsId, brandId, machineNumber);
          if (!homeLocationId) continue;

          // Get item name from stock management
          const stockItem = stockManagementData.find(stock => {
            const stockItemIdsId = stock.item_ids_id || stock.itemIdsId;
            const stockBrandId = stock.brand_name_id || stock.brandNameId;
            const stockMachineNumber = stock.machine_number || stock.machineNumber || '';
            const itemIdsMatch = stockItemIdsId && String(stockItemIdsId) === String(itemIdsId);
            const brandMatch = !brandId || (stockBrandId && String(stockBrandId) === String(brandId));
            const machineMatch = !machineNumber || (stockMachineNumber && String(stockMachineNumber).trim() === machineNumber.trim());
            return itemIdsMatch && brandMatch && machineMatch;
          });
          const itemNameId = stockItem ? (stockItem.item_name_id || stockItem.itemNameId) : null;

          const { history, totalDaysAway, currentLocationId, currentLocationName } = getItemTransferHistory(
            itemIdsId,
            brandId,
            machineNumber,
            homeLocationId
          );
          if (String(currentLocationId) !== String(homeLocationId) && history.length > 0) {
            const lastTransfer = history[history.length - 1];
            const itemName = itemNameId ? (itemNamesMap[itemNameId] || itemNamesMap[String(itemNameId)] || 'Unknown Item') : 'Unknown Item';
            const itemId = itemIdsMap[itemIdsId] || itemIdsMap[String(itemIdsId)] || '';
            let mostRecentEntry = null;
            let mostRecentEntryItem = null;
            let mostRecentSortTime = -1;
            const getEntrySortTime = (entry) => {
              const rawDate = entry.created_date_time || entry.createdDateTime || entry.timestamp || '';
              const raw = String(rawDate || '').trim();
              if (raw) {
                const ddMmYyyyMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
                if (ddMmYyyyMatch) {
                  const day = Number(ddMmYyyyMatch[1]);
                  const month = Number(ddMmYyyyMatch[2]) - 1;
                  const year = Number(ddMmYyyyMatch[3]);
                  const hour = Number(ddMmYyyyMatch[4] || 0);
                  const minute = Number(ddMmYyyyMatch[5] || 0);
                  const second = Number(ddMmYyyyMatch[6] || 0);
                  const parsedDdMm = new Date(year, month, day, hour, minute, second).getTime();
                  if (!Number.isNaN(parsedDdMm)) return parsedDdMm;
                }
              }
              const parsed = Date.parse(rawDate);
              if (!Number.isNaN(parsed)) return parsed;
              const numeric = Number(rawDate);
              if (Number.isFinite(numeric)) return numeric;
              const entryId = Number(entry.id || entry.entryId || 0);
              return Number.isFinite(entryId) ? entryId : 0;
            };
            for (const entry of toolsTrackerManagementData) {
              const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
              const matchingEntryItem = entryItems.find(entryItem => {
                const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
                const entryBrandId = entryItem.brand_id || entryItem.brandId;
                const entryMachineNumber = entryItem.machine_number || entryItem.machineNumber || '';
                const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === String(itemIdsId);
                const brandMatch = !brandId || (entryBrandId && String(entryBrandId) === String(brandId));
                const machineMatch = !machineNumber || (entryMachineNumber && String(entryMachineNumber).trim() === machineNumber.trim());
                return itemIdsMatch && brandMatch && machineMatch;
              });
              if (matchingEntryItem) {
                const entrySortTime = getEntrySortTime(entry);
                const mostRecentEntryId = Number(mostRecentEntry?.id || mostRecentEntry?.entryId || 0);
                const currentEntryId = Number(entry.id || entry.entryId || 0);
                if (
                  entrySortTime > mostRecentSortTime
                  || (entrySortTime === mostRecentSortTime && currentEntryId > mostRecentEntryId)
                ) {
                  mostRecentSortTime = entrySortTime;
                  mostRecentEntry = entry;
                  mostRecentEntryItem = matchingEntryItem;
                }
              }
            }
            if (mostRecentEntry) {
              const fromLocationId = mostRecentEntry.from_project_id || mostRecentEntry.fromProjectId;
              const entryType = String(mostRecentEntry.tools_entry_type || mostRecentEntry.toolsEntryType || '').toLowerCase();
              const relocateHomeLocationId = mostRecentEntryItem?.home_location_id || mostRecentEntryItem?.homeLocationId;
              const toLocationId = (entryType === 'relocate' || entryType === 'relocation')
                ? relocateHomeLocationId
                : (mostRecentEntry.to_project_id || mostRecentEntry.toProjectId);
              const entryDate = mostRecentEntry.date || '';
              const createdDateTime = mostRecentEntry.created_date_time || mostRecentEntry.createdDateTime || mostRecentEntry.timestamp || '';
              const projectInchargeId = mostRecentEntry.project_incharge_id || mostRecentEntry.projectInchargeId;
              const eno = mostRecentEntry.eno || '';
              const fromLocation = getLocationName(fromLocationId);
              const toLocation = getLocationName(toLocationId);
              const inchargeName = employeesMap[projectInchargeId] || employeesMap[String(projectInchargeId)] || '-';
              const homeLocationName = getLocationName(homeLocationId);
              const formattedDate = entryDate ? (() => {
                try {
                  const d = new Date(entryDate);
                  return isNaN(d.getTime()) ? entryDate : d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                } catch { return entryDate; }
              })() : '-';
              const formattedCreatedDateTime = createdDateTime ? (() => {
                try {
                  const d = new Date(createdDateTime);
                  if (isNaN(d.getTime())) return String(createdDateTime);
                  const day = String(d.getDate()).padStart(2, '0');
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const year = d.getFullYear();
                  const h = d.getHours();
                  const m = d.getMinutes();
                  const h12 = h % 12 || 12;
                  const ampm = h < 12 ? 'AM' : 'PM';
                  return `${day}/${month}/${year} • ${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
                } catch { return String(createdDateTime); }
              })() : '';
              pendingItems.push({
                id: `${itemIdsId}_${brandId || ''}_${machineNumber}`,
                entryNo: eno,
                itemName: itemName,
                from: fromLocation,
                to: toLocation,
                date: entryDate,
                createdDateTimeFormatted: formattedCreatedDateTime,
                itemId: itemId,
                daysPending: `${totalDaysAway} ${totalDaysAway === 1 ? 'Day' : 'Days'}`,
                daysAway: totalDaysAway,
                personName: inchargeName,
                itemIdsId: itemIdsId,
                brandId: brandId,
                machineNumber: machineNumber,
                homeLocationId: homeLocationId,
                homeLocationName: homeLocationName,
                history: history
              });
            }
          }
        }
        pendingItems.sort((a, b) => b.daysAway - a.daysAway);
        let filteredItems = pendingItems;

        // Filter by home location first
        if (selectedHomeLocation) {
          filteredItems = filteredItems.filter(item => {
            const itemHomeLocationId = item.homeLocationId;
            if (!itemHomeLocationId) {
              return false; // Exclude items without home location ID
            }
            const matches = String(itemHomeLocationId) === String(selectedHomeLocation.id);
            return matches;
          });
        }

        // Then filter by days - show only items that have been out for MORE than the selected days
        if (selectedDays !== 'all') {
          const daysNum = parseInt(selectedDays);
          filteredItems = filteredItems.filter(item => item.daysAway > daysNum);
        }

        // Apply additional filters
        if (filterItemName) {
          const filterValue = String(filterItemName).toLowerCase().trim();
          filteredItems = filteredItems.filter(item =>
            item.itemName && String(item.itemName).toLowerCase().includes(filterValue)
          );
        }

        if (filterLocation) {
          const filterValue = String(filterLocation).trim();
          filteredItems = filteredItems.filter(item =>
            item.to && String(item.to).trim() === filterValue
          );
        }

        if (filterItemId) {
          const filterValue = String(filterItemId).toLowerCase().trim();
          filteredItems = filteredItems.filter(item =>
            item.itemId && String(item.itemId).toLowerCase().includes(filterValue)
          );
        }

        if (filterDate) {
          const filterDateStr = formatDateForDisplay(filterDate);
          if (filterDateStr) {
            filteredItems = filteredItems.filter(item =>
              item.date === filterDateStr
            );
          }
        }

        if (filterEntryNo) {
          const filterValue = String(filterEntryNo).trim();
          filteredItems = filteredItems.filter(item =>
            String(item.entryNo).trim() === filterValue
          );
        }

        if (filterProjectIncharge) {
          const filterValue = String(filterProjectIncharge).toLowerCase().trim();
          filteredItems = filteredItems.filter(item =>
            item.personName && String(item.personName).toLowerCase().includes(filterValue)
          );
        }

        setPendingData(filteredItems);
      } catch (error) {
        console.error('Error fetching pending items:', error);
        setPendingData([]);
      } finally {
        setLoading(false);
      }
    };
    if (toolsTrackerManagementData.length > 0 && stockManagementData.length > 0) {
      fetchPendingItems();
    }
  }, [selectedDays, selectedHomeLocation, filterItemName, filterLocation, filterItemId, filterDate, filterEntryNo, filterProjectIncharge, toolsTrackerManagementData, stockManagementData, projectsMap, vendorsMap, employeesMap, itemNamesMap, itemIdsMap]);
  // Helper function to get home location history for an item
  const getHomeLocationHistory = (itemIdsId, brandId, machineNumber) => {
    const homeLocationHistory = [];

    // Get all entries from tools_tracker_management that match this item and have home_location_id
    for (const entry of toolsTrackerManagementData) {

      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];

      // Check each item in the entry for matching item and home_location_id
      for (const entryItem of entryItems) {
        const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        const entryBrandId = entryItem.brand_id || entryItem.brandId;
        const entryMachineNumber = entryItem.machine_number || entryItem.machineNumber || '';

        const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === String(itemIdsId);
        const brandMatch = !brandId || (entryBrandId && String(entryBrandId) === String(brandId));
        const machineMatch = !machineNumber || (entryMachineNumber && String(entryMachineNumber).trim() === machineNumber.trim());

        if (itemIdsMatch && brandMatch && machineMatch) {
          // Check if this specific item has home_location_id
          const itemHomeLocationId = entryItem.home_location_id || entryItem.homeLocationId;
          if (itemHomeLocationId) {
            const entryDate = entry.created_date_time || entry.createdDateTime || entry.timestamp || '';
            const eno = entry.eno || '';
            const homeLocationName = getLocationName(itemHomeLocationId);

            homeLocationHistory.push({
              homeLocationId: itemHomeLocationId,
              homeLocationName: homeLocationName,
              date: entryDate,
              eno: eno,
              entryId: entry.id || entry.entryId
            });
          }
        }
      }
    }

    // Sort by date (oldest first)
    homeLocationHistory.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB; // Ascending order (oldest first)
    });

    // If no history found in tools_tracker_management, check stock_management
    if (homeLocationHistory.length === 0) {
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
        const stockHomeLocationId = stockItem.home_location_id || stockItem.homeLocationId;
        if (stockHomeLocationId) {
          const homeLocationName = getLocationName(stockHomeLocationId);
          homeLocationHistory.push({
            homeLocationId: stockHomeLocationId,
            homeLocationName: homeLocationName,
            date: null,
            eno: null,
            entryId: null,
            source: 'stock_management'
          });
        }
      }
    }

    return homeLocationHistory;
  };

  const handleDaysClick = (item) => {
    // Get and log home location history
    const homeLocationHistory = getHomeLocationHistory(item.itemIdsId, item.brandId, item.machineNumber);

    if (homeLocationHistory.length === 0) {
    } else {
      homeLocationHistory.forEach((historyItem, index) => {
      });
    }
    setSelectedItemHistory(item);
    setShowHistorySheet(true);
  };
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };
  // Get filtered home location options
  const getFilteredHomeLocationOptions = () => {
    if (!homeLocationSearchQuery.trim()) {
      return homeLocationOptions;
    }
    const query = homeLocationSearchQuery.toLowerCase();
    return homeLocationOptions.filter(option =>
      option.value.toLowerCase().includes(query) ||
      option.label.toLowerCase().includes(query)
    );
  };

  // Filter dropdown helpers
  const getFilterPickerOptions = () => {
    if (!filterOpenPicker) return [];
    const opts = {
      itemName: itemNameOptions,
      location: locationOptions,
      itemId: itemIdOptions,
      entryNo: entryNoOptions,
      projectIncharge: projectInchargeOptions
    }[filterOpenPicker] || [];
    const q = (filterPickerSearch || '').trim().toLowerCase();
    if (!q) return opts;
    return opts.filter(o => String(o.value || o.label || o).toLowerCase().includes(q));
  };

  const openFilterPicker = (field) => {
    setFilterOpenPicker(field);
    setFilterPickerSearch('');
  };

  const closeFilterPicker = () => {
    setFilterOpenPicker(null);
    setFilterPickerSearch('');
  };

  const handleFilterPickerSelect = (field, value) => {
    if (field === 'itemName') setFilterItemName(value);
    else if (field === 'location') setFilterLocation(value);
    else if (field === 'itemId') setFilterItemId(value);
    else if (field === 'entryNo') setFilterEntryNo(value);
    else if (field === 'projectIncharge') setFilterProjectIncharge(value);
    closeFilterPicker();
  };

  const handleClearFilter = (field, e) => {
    e.stopPropagation();
    if (field === 'itemName') setFilterItemName(null);
    else if (field === 'location') setFilterLocation(null);
    else if (field === 'itemId') setFilterItemId(null);
    else if (field === 'entryNo') setFilterEntryNo(null);
    else if (field === 'projectIncharge') setFilterProjectIncharge(null);
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-') && dateStr.length === 10) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const handleDatePickerOpen = () => {
    setShowDatePicker(true);
  };

  const handleDatePickerConfirm = (formattedDate) => {
    setFilterDate(formattedDate);
    setShowDatePicker(false);
  };

  // Generate PDF function
  const handleDownloadPDF = () => {
    if (!pendingData || pendingData.length === 0) {
      alert('No data to download');
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
    });

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Pending Items Report', 10, 18);

    // Prepare table data
    const tableData = pendingData.map((item, index) => {
      // Get Brand name
      const brandName = item.brandId ? (brandsMap[item.brandId] || brandsMap[String(item.brandId)] || '-') : '-';

      // Get Model and Machine Number from stock management
      let model = '-';
      let machineNumber = item.machineNumber || '-';

      const stockItem = stockManagementData.find(stock => {
        const stockItemIdsId = stock.item_ids_id || stock.itemIdsId;
        const stockBrandId = stock.brand_name_id || stock.brandNameId;
        const stockMachineNumber = stock.machine_number || stock.machineNumber || '';
        const itemIdsMatch = stockItemIdsId && String(stockItemIdsId) === String(item.itemIdsId);
        const brandMatch = !item.brandId || (stockBrandId && String(stockBrandId) === String(item.brandId));
        const machineMatch = !item.machineNumber || (stockMachineNumber && String(stockMachineNumber).trim() === String(item.machineNumber).trim());
        return itemIdsMatch && brandMatch && machineMatch;
      });
      if (stockItem) {
        model = stockItem.model || '-';
        if (!machineNumber || machineNumber === '-') {
          machineNumber = stockItem.machine_number || stockItem.machineNumber || '-';
        }
      }
      return [
        index + 1, // S.No
        item.date || '-', // Date
        item.itemName || '-', // Item Name
        item.itemId || '-', // Item ID
        brandName, // Brand
        model, // Model
        machineNumber, // Machine Number
        item.from || '-', // From
        item.to || '-', // To
        item.personName || '-' // Project Incharge
      ];
    });

    // Generate table - transparent bg, lighter borders, no extra column
    const columnWidths = [12, 20, 36, 20, 20, 24, 25, 46, 46, 30];
    const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
    autoTable(doc, {
      head: [['S.No', 'Date', 'Item Name', 'Item ID', 'Brand', 'Model', 'Machine Number', 'From', 'To', 'Project Incharge']],
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
    const filename = `Pending_Items_${dateStr}.pdf`;

    // Save PDF
    doc.save(filename);
  };

  const renderFilterDropdown = (field, value, placeholder) => {
    const fieldLabels = {
      itemName: 'Item Name',
      location: 'Current Location',
      itemId: 'Item ID',
      entryNo: 'Entry. No',
      projectIncharge: 'Project Incharge'
    };

    return (
      <div className="relative w-full">
        {showFilterSheet && filterOpenPicker === field ? (
          <input
            type="text"
            value={filterPickerSearch}
            onChange={(e) => setFilterPickerSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder={placeholder}
            className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[40px] text-[12px] font-medium bg-white focus:outline-none"
            style={{ color: '#000', boxSizing: 'border-box', paddingRight: '40px' }}
            autoFocus
          />
        ) : (
          <div onClick={() => openFilterPicker(field)}
            className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[40px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
            style={{ color: value ? '#000' : '#9E9E9E', boxSizing: 'border-box', paddingRight: value ? '60px' : '40px' }}
          >
            {value || placeholder}
          </div>
        )}
        {value && !(showFilterSheet && filterOpenPicker === field) && (
          <button
            type="button"
            onClick={(e) => handleClearFilter(field, e)}
            className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
            style={{ right: '12px' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {!value && !(showFilterSheet && filterOpenPicker === field) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        )}
        {/* Dropdown options - Popup Modal */}
        {showFilterSheet && filterOpenPicker === field && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] -top-[16px] flex items-center justify-center p-[16px]" onClick={(e) => { if (e.target === e.currentTarget) { closeFilterPicker(); } }} style={{ fontFamily: "'Manrope', sans-serif" }}>
            <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center px-[24px] pt-[24px]">
                <p className="text-[16px] font-semibold text-black">Select {fieldLabels[field] || field}</p>
                <button onClick={() => closeFilterPicker()} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                  <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
                </button>
              </div>
              <div className="px-[24px] pt-[4px] pb-[6px]">
                <div className="relative">
                  <input
                    type="text"
                    value={filterPickerSearch}
                    onChange={(e) => setFilterPickerSearch(e.target.value)}
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
                  {getFilterPickerOptions().length > 0 ? (
                    <div className="space-y-0">
                      {getFilterPickerOptions().map((opt, idx) => {
                        const optValue = opt.value || opt.label || opt;
                        const optLabel = opt.label || opt.value || opt;
                        const isSelected = value === optValue;
                        // Helper function to split option text at first hyphen
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
                        const { firstLine, secondLine } = splitOptionText(optLabel);
                        return (
                          <button key={idx} type="button" onClick={(e) => { e.stopPropagation(); handleFilterPickerSelect(field, optValue); }}
                            className={`w-full px-[10px] flex items-center gap-[12px] transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                              }`}
                            style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                          >
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
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
                        {filterPickerSearch.trim() ? 'No options found' : 'No options available'}
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

  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="sticky top-0 bg-white z-10 flex-shrink-0">
        {/* Header row: Home Location label (left) + Download (right) - like Item ID in History */}
        <div className="flex items-center justify-between pb-[8px] border-b border-[#E0E0E0] ">
          <div className="flex-shrink-0 flex items-center gap-[4px]">
            <button
              type="button"
              onClick={() => setShowHomeLocationDropdown(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent text-left"
            >
              {selectedHomeLocation ? selectedHomeLocation.value : 'Home Location'}
            </button>
            {selectedHomeLocation && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHomeLocation(null);
                }}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="#848484" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent text-right flex items-center gap-1"
          >
            Download
          </button>
        </div>
        <div className="flex w-full bg-[#F2F4F7] items-center h-[32px] rounded-md mt-[8px]">
          <button
            onClick={() => setSelectedDays('all')}
            className={`flex-1 ml-0.5 h-[28px] rounded text-[12px] font-semibold leading-normal duration-1000 ease-out transition-colors ${selectedDays === 'all'
              ? 'bg-white text-black'
              : 'bg-transparent text-[#848484]'
              }`}
          >
            All Days
          </button>
          <button
            onClick={() => setSelectedDays('30')}
            className={`flex-1 h-[28px] rounded text-[12px] font-semibold leading-normal duration-1000 ease-out transition-colors ${selectedDays === '30'
              ? 'bg-white text-black'
              : 'bg-transparent text-[#848484]'
              }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setSelectedDays('60')}
            className={`flex-1 mr-0.5 h-[28px] rounded text-[12px] font-semibold leading-normal duration-1000 ease-out transition-colors ${selectedDays === '60'
              ? 'bg-white text-black'
              : 'bg-transparent text-[#848484]'
              }`}
          >
            60 Days
          </button>
        </div>
        {/* Home Location - clickable text, opens popup; shows selected location or placeholder */}
        <div className="flex justify-between items-center gap-[4px] mb-0 flex-shrink-0 pt-[6px]">
          <div className="flex items-center gap-[4px] min-w-0 flex-1">
            <button onClick={() => setShowFilterSheet(true)} className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0">
              <img src={Filter} alt="Filter" className="w-[13px] h-[12px]" />
              {!(filterItemName || filterLocation || filterItemId || filterDate || filterEntryNo || filterProjectIncharge) && (
                <span className="text-[12px] font-medium text-black flex-shrink-0">Filter</span>
              )}
            </button>
            {/* Active Filter Chips - between Filter and toggle buttons */}
            <div className="flex items-center gap-[4px] overflow-x-auto no-scrollbar scrollbar-none min-w-0 flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {(filterItemName || filterLocation || filterItemId || filterDate || filterEntryNo || filterProjectIncharge) && (
                <div className="flex items-center gap-[4px] flex-nowrap">
                  {filterItemName && (
                    <div className="flex items-center gap-1 border px-[6px] py-[2px] rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Item Name</span>
                      <button onClick={() => setFilterItemName(null)} className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                  )}
                  {filterLocation && (
                    <div className="flex items-center gap-1 border px-[6px] py-[2px] rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Current Location</span>
                      <button onClick={() => setFilterLocation(null)} className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                  )}
                  {filterItemId && (
                    <div className="flex items-center gap-1 border px-[6px] py-[2px] rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Item ID</span>
                      <button onClick={() => setFilterItemId(null)} className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                  )}
                  {filterDate && (
                    <div className="flex items-center gap-1 border px-[6px] py-[2px] rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Date</span>
                      <button onClick={() => setFilterDate(null)} className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                  )}
                  {filterEntryNo && (
                    <div className="flex items-center gap-1 border px-[6px] py-[2px] rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Entry No</span>
                      <button onClick={() => setFilterEntryNo(null)} className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                  )}
                  {filterProjectIncharge && (
                    <div className="flex items-center gap-1 border px-[6px] py-[2px] rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Incharge</span>
                      <button onClick={() => setFilterProjectIncharge(null)} className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none pt-[6px] pb-[16px]">
        {loading ? (
          <div className="flex items-center justify-center py-[32px]">
            <p className="text-[12px] text-gray-500">Loading...</p>
          </div>
        ) : pendingData.length === 0 ? (
          <div className="flex items-center justify-center py-[32px]">
            <p className="text-[12px] text-gray-500">No pending items found.</p>
          </div>
        ) : (
          <div className="shadow-lg">
            {pendingData.map((item) => (
              <div key={item.id} className="bg-white rounded-[8px] px-[12px] py-[10px] shadow-lg border border-[#E0E0E0]">
                <div className="flex justify-between items-start mb-0.5">
                  <p className="text-[12px] font-semibold text-black leading-normal">
                    #{item.entryNo}, {item.itemName}
                  </p>
                  {item.itemId && (
                    <p className="text-[12px] font-semibold text-black leading-normal flex-shrink-0">
                      {item.itemId}
                    </p>
                  )}
                </div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                  From -  {item.from}
                </p>
                <div className="flex justify-between items-center gap-2 mb-0.5">
                  <p className="text-[12px] font-semibold text-[#BF9853] leading-normal min-w-0">
                    To - {item.to}
                  </p>
                  {item.daysPending && (
                    <button onClick={() => handleDaysClick(item)} className={`text-[12px] font-semibold leading-normal flex-shrink-0 cursor-pointer hover:underline ${(item.daysAway ?? 0) < 30 ? 'text-black' : 'text-[#E4572E]'}`}>
                      {item.daysPending}
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="flex items-center gap-[2px] text-[11px] leading-normal min-w-0">
                    <span className="font-bold text-black">{item.date}</span>
                    {item.createdDateTimeFormatted && <span className=" font-semibold text-[#9E9E9E]"> • {item.createdDateTimeFormatted}</span>}
                  </p>
                  <p className="text-[12px] font-semibold text-black leading-normal flex-shrink-0">
                    {item.personName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Home Location Dropdown */}
      {showHomeLocationDropdown && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-[16px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowHomeLocationDropdown(false);
              setHomeLocationSearchQuery('');
            }
          }}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-[24px] pt-[24px]">
              <p className="text-[16px] font-semibold text-black">Select Home Location</p>
              <button
                onClick={() => {
                  setShowHomeLocationDropdown(false);
                  setHomeLocationSearchQuery('');
                }}
                className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
              >
                <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
              </button>
            </div>
            <div className="px-[24px] pt-[4px] pb-[6px]">
              <div className="relative">
                <input
                  type="text"
                  value={homeLocationSearchQuery}
                  onChange={(e) => setHomeLocationSearchQuery(e.target.value)}
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
                {getFilteredHomeLocationOptions().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-[16px]">
                    <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                      {homeLocationSearchQuery ? 'No options found' : 'No options available'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {getFilteredHomeLocationOptions().map((option) => {
                      const isSelected = selectedHomeLocation && selectedHomeLocation.id === option.id;
                      // Helper function to split option text at first hyphen
                      const splitOptionText = (text) => {
                        if (!text) return { firstLine: '', secondLine: '' };
                        const firstHyphenIndex = text.indexOf(' - ');
                        if (firstHyphenIndex === -1) {
                          return { firstLine: text, secondLine: '' };
                        }
                        return {
                          firstLine: text.substring(0, firstHyphenIndex),
                          secondLine: text.substring(firstHyphenIndex + 3) // +3 to skip ' - '
                        };
                      };
                      const { firstLine, secondLine } = splitOptionText(option.value);
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSelectedHomeLocation(option);
                            setShowHomeLocationDropdown(false);
                            setHomeLocationSearchQuery('');
                          }}
                          className={`w-full px-[10px] flex items-center gap-[12px] transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`}
                          style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                        >
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistorySheet && selectedItemHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center" onClick={() => setShowHistorySheet(false)} style={{ fontFamily: "'Manrope', sans-serif" }}>
          <div className="bg-white w-full max-w-[360px] rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-[24px] pt-[20px] pb-[16px] border-b border-gray-200">
              <p className="text-[16px] font-semibold text-black">
                {selectedItemHistory.homeLocationName || '-'}
              </p>
              <button onClick={() => setShowHistorySheet(false)} className="text-[#e06256] text-xl font-bold hover:opacity-80 transition-opacity">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-[24px] py-[16px]">
              {selectedItemHistory.history && selectedItemHistory.history.length > 0 ? (
                <div className="">
                  {/* Filter out home entries and show only transfer locations */}
                  {selectedItemHistory.history
                    .filter(entry => !entry.isHome)
                    .map((entry, index) => (
                      <div key={index} className="pb-[12px] border-b border-gray-100 last:border-b-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-[14px] font-semibold text-black">
                            {entry.eno ? `#${entry.eno} ` : ''}{entry.locationName}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[12px] text-gray-600">
                            {formatDate(entry.fromDate)}
                          </p>
                          <p className="text-[12px] font-semibold text-[#e06256]">
                            {entry.days} {entry.days === 1 ? 'Day' : 'Days'}
                          </p>
                        </div>
                      </div>
                    ))}

                  {/* Summary */}
                  <div className="mt-4 pt-[16px] border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-black">Total Days</p>
                      <p className="text-[14px] font-bold text-[#e06256]">
                        {selectedItemHistory.daysAway} {selectedItemHistory.daysAway === 1 ? 'Day' : 'Days'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-[32px]">
                  <p className="text-[12px] text-gray-500">No transfer history available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Filter Bottom Sheet Modal */}
      {showFilterSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }} onClick={() => setShowFilterSheet(false)}>
          <div className="bg-white w-full h-[350px] rounded-tl-[16px] rounded-tr-[16px] relative z-[101] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-[24px] pt-[20px] pb-[4px]">
              <p className="text-[16px] font-bold text-black">Select Filters</p>
              <button type="button" onClick={() => setShowFilterSheet(false)} className="text-[#e06256] text-xl font-bold leading-none">
              <img src={Close} alt="close" className="w-[11px] h-[11px]" />
              </button>
            </div>
            {/* Backdrop for dropdown */}
            {filterOpenPicker && (
              <div
                className="fixed inset-0 z-[45]"
                onClick={closeFilterPicker}
              />
            )}
            {/* Form - scrollable */}
            <div className="flex-1 overflow-y-auto px-[24px] py-[4px]">
              <div className="flex gap-[12px] mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Item Name</p>
                  {renderFilterDropdown('itemName', filterItemName, 'Select')}
                </div>
              </div>
              <div className="flex gap-[12px] mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Current Location</p>
                  {renderFilterDropdown('location', filterLocation, 'Select')}
                </div>
              </div>
              <div className="flex gap-[12px] mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Date</p>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={formatDateForDisplay(filterDate) || ''}
                      onClick={handleDatePickerOpen}
                      onFocus={handleDatePickerOpen}
                      placeholder="dd-mm-yyyy"
                      className="w-full h-[32px] border border-[#d6d6d6] rounded pl-[12px] pr-[40px] text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500 cursor-pointer"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11 1V4M5 1V4M2 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Entry. No</p>
                  {renderFilterDropdown('entryNo', filterEntryNo, 'Select')}
                </div>
              </div>
              <div className="flex gap-[12px] mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Item ID</p>
                  {renderFilterDropdown('itemId', filterItemId, 'Select')}
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Project Incharge</p>
                  {renderFilterDropdown('projectIncharge', filterProjectIncharge, 'Select')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => {
          setShowDatePicker(false);
        }}
        onConfirm={handleDatePickerConfirm}
        initialDate={filterDate || ''}
      />
    </div>
  );
};
export default PendingItems;