import React, { useState, useEffect, useCallback } from 'react';
import Filter from '../Images/Filter.png';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';

const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_management';
const TOOLS_STOCK_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_stock_management';
const PROJECT_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/project_Names';
const VENDOR_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/vendor_Names';
const EMPLOYEE_DETAILS_BASE_URL = 'https://backendaab.in/aabuildersDash/api/employee_details';
const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_name';
const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_id';

const PendingItems = ({ user }) => {
  const [pendingData, setPendingData] = useState([]);
  const [selectedDays, setSelectedDays] = useState('30');
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
  useEffect(() => {
    const locations = new Set();
    // First, add home locations from tools_tracker_management entries (old home locations)
    toolsTrackerManagementData.forEach(entry => {
      const entryHomeLocationId = entry.home_location_id || entry.homeLocationId;
      if (entryHomeLocationId) {
        const locationName = getLocationName(entryHomeLocationId);
        if (locationName && locationName !== '-') {
          locations.add(JSON.stringify({ id: String(entryHomeLocationId), name: locationName }));
        }
      }
      // Also add home locations from entry items (new home locations)
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
      entryItems.forEach(entryItem => {
        const itemHomeLocationId = entryItem.home_location_id || entryItem.homeLocationId;
        if (itemHomeLocationId) {
          const locationName = getLocationName(itemHomeLocationId);
          if (locationName && locationName !== '-') {
            locations.add(JSON.stringify({ id: String(itemHomeLocationId), name: locationName }));
          }
        }
      });
    });
    // Then, add home locations from stock management (for items not in tools_tracker_management)
    stockManagementData.forEach(stock => {
      const homeLocationId = stock.home_location_id || stock.homeLocationId;
      if (homeLocationId) {
        const locationName = getLocationName(homeLocationId);
        if (locationName && locationName !== '-') {
          locations.add(JSON.stringify({ id: String(homeLocationId), name: locationName }));
        }
      }
    });
    const options = Array.from(locations).map(loc => {
      const parsed = JSON.parse(loc);
      return {
        id: parsed.id,
        value: parsed.name,
        label: parsed.name
      };
    });
    // Sort alphabetically
    options.sort((a, b) => a.value.localeCompare(b.value));
    setHomeLocationOptions(options);
    setLocationOptions(options);
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
            let mostRecentDate = null;
            for (const entry of toolsTrackerManagementData) {
              const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
              const hasMatchingItem = entryItems.some(entryItem => {
                const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
                const entryBrandId = entryItem.brand_id || entryItem.brandId;
                const entryMachineNumber = entryItem.machine_number || entryItem.machineNumber || '';
                const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === String(itemIdsId);
                const brandMatch = !brandId || (entryBrandId && String(entryBrandId) === String(brandId));
                const machineMatch = !machineNumber || (entryMachineNumber && String(entryMachineNumber).trim() === machineNumber.trim());
                return itemIdsMatch && brandMatch && machineMatch;
              });
              if (hasMatchingItem) {
                const entryDate = entry.created_date_time || entry.createdDateTime || entry.timestamp || '';
                if (!mostRecentDate || entryDate > mostRecentDate) {
                  mostRecentDate = entryDate;
                  mostRecentEntry = entry;
                }
              }
            }
            if (mostRecentEntry) {
              console.log("Most Recent Entry: ", mostRecentEntry);
              const fromLocationId = mostRecentEntry.from_project_id || mostRecentEntry.fromProjectId;
              const toLocationId = mostRecentEntry.to_project_id || mostRecentEntry.toProjectId;
              console.log("To Location ID: ", toLocationId);
              console.log("From Location ID: ", fromLocationId);
              const createdDateTime = mostRecentEntry.created_date_time || mostRecentEntry.createdDateTime || mostRecentEntry.timestamp || '';
              const projectInchargeId = mostRecentEntry.project_incharge_id || mostRecentEntry.projectInchargeId;
              const eno = mostRecentEntry.eno || '';
              const fromLocation = getLocationName(fromLocationId);
              const toLocation = getLocationName(toLocationId);
              console.log("To Location: ", toLocation);
              const inchargeName = employeesMap[projectInchargeId] || employeesMap[String(projectInchargeId)] || '-';
              const homeLocationName = getLocationName(homeLocationId);
              const dateObj = new Date(createdDateTime);
              const formattedDate = dateObj.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
              pendingItems.push({
                id: `${itemIdsId}_${brandId || ''}_${machineNumber}`,
                entryNo: eno,
                itemName: itemName,
                from: fromLocation,
                to: toLocation,
                date: formattedDate,
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
            if (!matches) {
              console.log(`Item ${item.itemId || item.itemIdsId} excluded: homeLocationId ${itemHomeLocationId} !== selected ${selectedHomeLocation.id}`);
            }
            return matches;
          });
        }

        // Then filter by days - show only items that have been out for MORE than the selected days
        if (selectedDays !== 'all') {
          const daysNum = parseInt(selectedDays);
          filteredItems = filteredItems.filter(item => item.daysAway > daysNum);
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
  }, [selectedDays, selectedHomeLocation, toolsTrackerManagementData, stockManagementData, projectsMap, vendorsMap, employeesMap, itemNamesMap, itemIdsMap]);
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
      console.log(`Total Home Location Changes: ${homeLocationHistory.length}`);
      console.log('----------------------------------------');
      homeLocationHistory.forEach((historyItem, index) => {
        if (historyItem.source) {
          console.log(`   Source: ${historyItem.source}`);
        }
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
  
  const renderFilterDropdown = (field, value, placeholder) => {
    const fieldLabels = {
      itemName: 'Item Name',
      location: 'Location',
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
            placeholder={placeholder}
            className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white focus:outline-none"
            style={{ color: '#000', boxSizing: 'border-box', paddingRight: '40px' }}
            autoFocus
          />
        ) : (
          <div onClick={() => openFilterPicker(field)}
            className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
            style={{ color: value ? '#000' : '#9E9E9E', boxSizing: 'border-box', paddingRight: '40px' }}
          >
            {value || placeholder}
          </div>
        )}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        {/* Dropdown options */}
        {showFilterSheet && filterOpenPicker === field && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] shadow-lg max-h-[150px] overflow-hidden flex flex-col" style={{ zIndex: 9 }}>
            <div className="overflow-y-auto max-h-[150px]">
              {getFilterPickerOptions().length > 0 ? (
                getFilterPickerOptions().map((opt, idx) => {
                  const optValue = opt.value || opt.label || opt;
                  const optLabel = opt.label || opt.value || opt;
                  return (
                    <button key={idx} type="button" onClick={() => handleFilterPickerSelect(field, optValue)}
                      className="w-full h-[36px] px-3 flex items-center text-left hover:bg-[#F5F5F5] transition-colors text-[12px] font-medium text-black"
                    >
                      {optLabel}
                    </button>
                  );
                })
              ) : (
                <p className="text-[12px] font-medium text-[#9E9E9E] text-center py-3">
                  {filterPickerSearch.trim() ? 'No options found' : 'No options available'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-90px-80px)] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Home Location Filter */}
      <div className="px-4 pt-2 pb-2">
        <label className="block text-[13px] font-medium text-black mb-0.5">
          Home Location<span className="text-[#eb2f8e]">*</span>
        </label>
        <div
          onClick={() => setShowHomeLocationDropdown(true)}
          className="w-full h-[32px] px-3 border border-[rgba(0,0,0,0.16)] rounded flex items-center justify-between cursor-pointer bg-white"
        >
          <span className={`text-[12px] ${selectedHomeLocation ? 'text-black font-medium' : 'text-[#9E9E9E]'}`}>
            {selectedHomeLocation ? selectedHomeLocation.value : 'Select Home Location'}
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="flex justify-between px-4 mb-2">
        <div className="flex bg-[#F2F4F7] items-center h-6 shadow-sm rounded-full">
          <button onClick={() => setSelectedDays('all')}
            className={`flex px-4 ml-0.5 h-5 rounded-full text-[11px] items-center font-medium transition-colors duration-1000 ease-out ${selectedDays === 'all'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            All Days
          </button>
          <button onClick={() => setSelectedDays('30')}
            className={`flex px-4 h-5 rounded-full text-[11px] items-center font-medium transition-colors duration-1000 ease-out ${selectedDays === '30'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            30 Days
          </button>
          <button onClick={() => setSelectedDays('60')}
            className={`flex px-4 mr-0.5 h-5 rounded-full text-[11px] items-center font-medium transition-colors duration-1000 ease-out ${selectedDays === '60'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            60 Days
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-black leading-normal">Download</span>
          <img src={Filter} alt="Filter" className="w-[12px] h-[12px] cursor-pointer" onClick={() => setShowFilterSheet(true)} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">Loading...</p>
          </div>
        ) : pendingData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">No pending items found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingData.map((item) => (
              <div key={item.id} className="bg-white rounded-[8px] p-4 shadow-sm border border-[#E0E0E0]">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                      #{item.entryNo}, {item.itemName}
                    </p>
                    <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                      From - {item.from}
                    </p>
                    <p className="text-[12px] font-semibold text-[#BF9853] leading-normal mb-1">
                      To - {item.to}
                    </p>
                    <p className="text-[11px] text-[#848484] leading-normal">
                      {item.date}
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    {item.itemId && (
                      <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                        {item.itemId}
                      </p>
                    )}
                    {item.daysPending && (
                      <button onClick={() => handleDaysClick(item)} className="text-[12px] font-semibold text-[#e06256] leading-normal mb-1 cursor-pointer hover:underline">
                        {item.daysPending}
                      </button>
                    )}
                    <p className="text-[12px] font-semibold text-[#848484] leading-normal">
                      {item.personName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Home Location Dropdown */}
      {showHomeLocationDropdown && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowHomeLocationDropdown(false);
              setHomeLocationSearchQuery('');
            }
          }}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 pt-5">
              <p className="text-[16px] font-semibold text-black">Select Home Location</p>
              <button
                onClick={() => {
                  setShowHomeLocationDropdown(false);
                  setHomeLocationSearchQuery('');
                }}
                className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
              >
                ×
              </button>
            </div>
            <div className="px-6 pt-4 pb-4">
              <div className="relative">
                <input
                  type="text"
                  value={homeLocationSearchQuery}
                  onChange={(e) => setHomeLocationSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full h-[32px] pl-10 pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                  autoFocus
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" />
                    <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto mb-4 px-6">
              <div className="shadow-md rounded-lg overflow-hidden">
                {getFilteredHomeLocationOptions().length === 0 ? (
                  <div className="p-4 text-center text-[12px] text-gray-500">
                    No locations found
                  </div>
                ) : (
                  getFilteredHomeLocationOptions().map((option) => (
                    <div
                      key={option.id}
                      onClick={() => {
                        setSelectedHomeLocation(option);
                        setShowHomeLocationDropdown(false);
                        setHomeLocationSearchQuery('');
                      }}
                      className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${selectedHomeLocation && selectedHomeLocation.id === option.id ? 'bg-blue-50' : ''
                        }`}
                    >
                      <p className="text-[13px] font-medium text-black">{option.value}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistorySheet && selectedItemHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center" onClick={() => setShowHistorySheet(false)} style={{ fontFamily: "'Manrope', sans-serif" }}>
          <div className="bg-white w-full max-w-[360px] rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-gray-200">
              <p className="text-[16px] font-semibold text-black">
                {selectedItemHistory.homeLocationName || '-'}
              </p>
              <button onClick={() => setShowHistorySheet(false)} className="text-[#e06256] text-xl font-bold hover:opacity-80 transition-opacity">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {selectedItemHistory.history && selectedItemHistory.history.length > 0 ? (
                <div className="space-y-3">
                  {/* Filter out home entries and show only transfer locations */}
                  {selectedItemHistory.history
                    .filter(entry => !entry.isHome)
                    .map((entry, index) => (
                      <div key={index} className="pb-3 border-b border-gray-100 last:border-b-0">
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
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-black">Total Days</p>
                      <p className="text-[14px] font-bold text-[#e06256]">
                        {selectedItemHistory.daysAway} {selectedItemHistory.daysAway === 1 ? 'Day' : 'Days'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-[12px] text-gray-500">No transfer history available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Filter Bottom Sheet Modal */}
      {showFilterSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }} onClick={() => setShowFilterSheet(false)}>
          <div className="bg-white w-full max-w-[360px] max-h-[70vh] rounded-tl-[16px] rounded-tr-[16px] relative z-50 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-1">
              <p className="text-[16px] font-bold text-black">Select Filters</p>
              <button type="button" onClick={() => setShowFilterSheet(false)} className="text-[#e06256] text-xl font-bold leading-none">
                ×
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
            <div className="flex-1 overflow-y-auto px-6 py-1">
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Item Name</p>
                  {renderFilterDropdown('itemName', filterItemName, 'Select')}
                </div>
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
                      className="w-full h-[32px] border border-[#d6d6d6] rounded pl-3 pr-10 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500 cursor-pointer"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11 1V4M5 1V4M2 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Location</p>
                  {renderFilterDropdown('location', filterLocation, 'Select')}
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Entry. No</p>
                  {renderFilterDropdown('entryNo', filterEntryNo, 'Select')}
                </div>
              </div>
              <div className="flex gap-3 mb-2">
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
            {/* Footer: Cancel + Save */}
            <div className="flex-shrink-0 flex gap-4 px-6 pb-6 pt-2">
              <button type="button" onClick={() => setShowFilterSheet(false)}
                className="flex-1 h-[40px] border border-black rounded-[8px] text-[14px] font-bold text-black bg-white"
              >
                Cancel
              </button>
              <button type="button" onClick={() => setShowFilterSheet(false)}
                className="flex-1 h-[40px] rounded-[8px] text-[14px] font-bold text-white bg-black"
              >
                Save
              </button>
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