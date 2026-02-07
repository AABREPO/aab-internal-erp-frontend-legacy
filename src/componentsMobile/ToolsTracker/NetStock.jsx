import React, { useState, useEffect, useMemo } from 'react';

const TOOLS_STOCK_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_stock_management';
const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_management';
const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_name';
const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_id';
const PROJECT_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/project_Names';
const VENDOR_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/vendor_Names';
const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_brand';

const NetStock = ({ user }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'list'
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showItemNameDropdown, setShowItemNameDropdown] = useState(false);
  const [showItemIdDropdown, setShowItemIdDropdown] = useState(false);
  const [stockManagementData, setStockManagementData] = useState([]);
  const [toolsTrackerManagementData, setToolsTrackerManagementData] = useState([]);
  const [itemNamesMap, setItemNamesMap] = useState({});
  const [itemIdsMap, setItemIdsMap] = useState({});
  const [brandsMap, setBrandsMap] = useState({});
  const [projectsMap, setProjectsMap] = useState({});
  const [vendorsMap, setVendorsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [itemIdOptions, setItemIdOptions] = useState([]);
  
  // Edit stock bottom sheet state
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  const [newCount, setNewCount] = useState('');
  const [swipeStates, setSwipeStates] = useState({});
  const [expandedItemId, setExpandedItemId] = useState(null);

  // Fetch lookup data
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        // Fetch item names
        const itemNamesRes = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (itemNamesRes.ok) {
          const data = await itemNamesRes.json();
          const map = {};
          const names = [];
          (Array.isArray(data) ? data : []).forEach(i => {
            const itemName = i.item_name || i.itemName || '';
            map[i.id] = itemName;
            map[String(i.id)] = itemName;
            if (itemName) names.push(itemName);
          });
          setItemNamesMap(map);
          setItemNameOptions([...new Set(names)].sort());
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
          const ids = [];
          (Array.isArray(data) ? data : []).forEach(i => {
            const itemId = i.item_id || i.itemId || '';
            map[i.id] = itemId;
            map[String(i.id)] = itemId;
            if (itemId && !/^\d+$/.test(itemId)) ids.push(itemId);
          });
          setItemIdsMap(map);
          setItemIdOptions([...new Set(ids)].sort());
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
            const brandName = b.tools_brand || b.toolsBrand || '';
            map[b.id] = brandName;
            map[String(b.id)] = brandName;
          });
          setBrandsMap(map);
        }

        // Fetch projects
        const projectsRes = await fetch(`${PROJECT_NAMES_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(p => {
            const projectName = p.siteName || p.site_name || p.projectName || p.project_name || '';
            map[p.id] = projectName;
            map[String(p.id)] = projectName;
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
          const data = await vendorsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(v => {
            const vendorName = v.vendorName || v.vendor_name || '';
            map[v.id] = vendorName;
            map[String(v.id)] = vendorName;
          });
          setVendorsMap(map);
        }
      } catch (error) {
        console.error('Error fetching lookup data:', error);
      }
    };
    fetchLookupData();
  }, []);

  // Fetch stock management and tools tracker management data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const stockRes = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (stockRes.ok) {
          const data = await stockRes.json();
          setStockManagementData(Array.isArray(data) ? data : []);
        }

        const trackerRes = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (trackerRes.ok) {
          const data = await trackerRes.json();
          const entries = (Array.isArray(data) ? data : []).filter(entry => {
            const entryType = entry.tools_entry_type || entry.toolsEntryType || 'Entry';
            return entryType.toLowerCase() === 'entry' || entryType.toLowerCase() === 'relocation';
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
  }, []);

  // Helper to get location name
  const getLocationName = (id) => {
    if (!id) return '-';
    const idStr = String(id);
    if (projectsMap[idStr]) return projectsMap[idStr];
    if (projectsMap[id]) return projectsMap[id];
    if (vendorsMap[idStr]) return vendorsMap[idStr];
    if (vendorsMap[id]) return vendorsMap[id];
    return '-';
  };

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
        const entryMachineNumber = entryItem.machine_number || entryItem.machineNumber || '';
        
        const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === String(itemIdsId);
        const brandMatch = !brandId || (entryBrandId && String(entryBrandId) === String(brandId));
        const machineMatch = !machineNumber || (entryMachineNumber && String(entryMachineNumber).trim() === machineNumber.trim());
        
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

  // Process data for table view (individual items) - merge items with same location, itemName, brand
  const tableData = useMemo(() => {
    const itemsMap = new Map(); // Use Map to merge items
    const processedItemIds = new Set();

    // Process items from stock management
    stockManagementData.forEach(stock => {
      const itemNameId = stock.item_name_id || stock.itemNameId;
      const itemIdsId = stock.item_ids_id || stock.itemIdsId;
      const brandId = stock.brand_name_id || stock.brandNameId;
      const homeLocationId = stock.home_location_id || stock.homeLocationId;
      const quantity = parseInt(stock.quantity || 0, 10);
      const machineNumber = stock.machine_number || stock.machineNumber || '';
      const status = stock.machine_status || stock.machineStatus || 'Working';

      const itemName = itemNamesMap[itemNameId] || itemNamesMap[String(itemNameId)] || '-';
      const brand = brandsMap[brandId] || brandsMap[String(brandId)] || '-';

      if (itemIdsId) {
        // Item with itemId - get home location first, then current location
        const itemKey = `${itemIdsId}_${brandId || ''}_${machineNumber}`;
        if (!processedItemIds.has(itemKey)) {
          processedItemIds.add(itemKey);
          const itemId = itemIdsMap[itemIdsId] || itemIdsMap[String(itemIdsId)] || '-';
          // Get most recent home location from tools_tracker_management, fallback to stock_management
          const actualHomeLocationId = getHomeLocationId(itemIdsId, brandId, machineNumber, homeLocationId);
          // Get current location (which is the home location)
          const currentLocationId = getCurrentLocationForItem(itemIdsId, brandId, machineNumber, actualHomeLocationId);
          const currentLocation = getLocationName(currentLocationId);
          
          // Create merge key: location + itemName + brand + machineNumber + status
          const mergeKey = `${currentLocation}_${itemName}_${brand}_${machineNumber}_${status}`;
          
          if (itemsMap.has(mergeKey)) {
            // Merge: increment itemId count
            const existing = itemsMap.get(mergeKey);
            existing.itemIdCount = (existing.itemIdCount || 0) + 1;
            existing.itemIds = existing.itemIds || [];
            existing.itemIds.push(itemId);
          } else {
            itemsMap.set(mergeKey, {
              id: itemKey,
              itemName,
              itemId,
              itemIds: [itemId],
              itemIdCount: 1,
              location: currentLocation,
              brand,
              machineNumber,
              status,
              quantity: 0,
              hasItemId: true
            });
          }
        }
      } else if (!itemIdsId) {
        // Item with quantity only (can be positive or negative) - use home location
        const homeLocation = getLocationName(homeLocationId);
        
        // Create merge key: location + itemName + brand
        const mergeKey = `${homeLocation}_${itemName}_${brand}_qty`;
        
        if (itemsMap.has(mergeKey)) {
          // Merge: add quantities (including negative values)
          const existing = itemsMap.get(mergeKey);
          existing.quantity += quantity;
          // Store stock record IDs for API calls
          if (!existing.stockRecordIds) {
            existing.stockRecordIds = [];
          }
          existing.stockRecordIds.push({
            stockId: stock.id,
            itemNameId,
            brandId,
            homeLocationId,
            quantity: parseInt(stock.quantity || 0, 10)
          });
        } else {
          itemsMap.set(mergeKey, {
            id: `qty_${itemNameId}_${brandId || ''}_${homeLocationId}`,
            itemName,
            itemId: '-',
            location: homeLocation,
            brand,
            machineNumber: '-',
            status: '-',
            quantity,
            hasItemId: false,
            // Store IDs needed for API calls
            itemNameId,
            brandId,
            homeLocationId,
            stockRecordIds: [{
              stockId: stock.id,
              itemNameId,
              brandId,
              homeLocationId,
              quantity: parseInt(stock.quantity || 0, 10)
            }]
          });
        }
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

    return filtered;
  }, [stockManagementData, toolsTrackerManagementData, itemNamesMap, itemIdsMap, brandsMap, projectsMap, vendorsMap, selectedItemName, selectedItemId, getHomeLocationId, getCurrentLocationForItem, getLocationName]);

  // Calculate aggregated summary for List view table display
  const aggregatedSummary = useMemo(() => {
    const aggregated = {};
    const processedItemIds = new Set();

    // Process stock management data directly
    stockManagementData.forEach(stock => {
      const itemNameId = stock.item_name_id || stock.itemNameId;
      const itemIdsId = stock.item_ids_id || stock.itemIdsId;
      const brandId = stock.brand_name_id || stock.brandNameId;
      const quantity = parseInt(stock.quantity || 0, 10);

      if (!itemNameId) return;

      const itemName = itemNamesMap[itemNameId] || itemNamesMap[String(itemNameId)] || '-';
      const brand = brandsMap[brandId] || brandsMap[String(brandId)] || '-';
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
        const itemId = itemIdsMap[itemIdsId] || itemIdsMap[String(itemIdsId)];
        if (itemId) {
          aggregated[key].itemIdSet.add(itemId);
        }
      } else {
        // Sum quantities (including negative values) for items without itemIds
        aggregated[key].quantitySum += quantity;
      }
    });

    // Also check tools_tracker_management for items that might have been transferred
    toolsTrackerManagementData.forEach(entry => {
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
      entryItems.forEach(entryItem => {
        const itemNameId = entryItem.item_name_id || entryItem.itemNameId;
        const itemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        const brandId = entryItem.brand_id || entryItem.brandId;

        if (!itemNameId) return;

        const itemName = itemNamesMap[itemNameId] || itemNamesMap[String(itemNameId)] || '-';
        const brand = brandsMap[brandId] || brandsMap[String(brandId)] || '-';
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
          const itemId = itemIdsMap[itemIdsId] || itemIdsMap[String(itemIdsId)];
          if (itemId) {
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

    return filtered.sort((a, b) => {
      if (a.itemName !== b.itemName) {
        return a.itemName.localeCompare(b.itemName);
      }
      return a.brand.localeCompare(b.brand);
    });
  }, [stockManagementData, toolsTrackerManagementData, itemNamesMap, itemIdsMap, brandsMap, selectedItemName]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowItemNameDropdown(false);
        setShowItemIdDropdown(false);
      }
    };

    if (showItemNameDropdown || showItemIdDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showItemNameDropdown, showItemIdDropdown]);

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
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    const state = swipeStates[itemId];
    if (!state) return;

    const deltaX = touch.clientX - state.startX;
    const isExpanded = expandedItemId === itemId;

    // Only allow swiping left to reveal edit action for items without itemId
    if (deltaX < 0) {
      e.preventDefault();
      setSwipeStates(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          currentX: touch.clientX,
          isSwiping: true
        }
      }));
    } else if (isExpanded && deltaX > 0) {
      // Allow swiping right to hide if already expanded
      e.preventDefault();
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

  const handleTouchEnd = (itemId, item) => {
    const state = swipeStates[itemId];
    if (!state) return;

    const deltaX = state.currentX - state.startX;
    const absDeltaX = Math.abs(deltaX);

    // Only allow edit for items without itemId but with quantity
    if (absDeltaX >= minSwipeDistance && deltaX < 0 && !item.hasItemId && item.quantity > 0) {
      // Swiped left - reveal edit button
      setExpandedItemId(itemId);
    } else if (absDeltaX >= minSwipeDistance && deltaX > 0) {
      // Swiped right - hide buttons
      setExpandedItemId(null);
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

    try {
      // Get the stock record IDs for this item
      const stockRecordIds = selectedItemForEdit.stockRecordIds || [];
      
      if (stockRecordIds.length === 0) {
        alert('Unable to find stock records for this item');
        return;
      }

      // For each stock record, update the quantity
      // We'll create a new stock management entry with the difference
      const stockManagementPayload = {
        item_name_id: String(selectedItemForEdit.itemNameId || ''),
        brand_name_id: selectedItemForEdit.brandId ? String(selectedItemForEdit.brandId) : '',
        item_ids_id: '', // No itemId for quantity-only items
        home_location_id: selectedItemForEdit.homeLocationId ? String(selectedItemForEdit.homeLocationId) : '',
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
      const fetchData = async () => {
        try {
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
          console.error('Error refreshing data:', error);
        }
      };
      await fetchData();

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
    <div className="flex flex-col bg-white px-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Category and Brand Section */}
      <div className="flex justify-between mt-2">
        <p className="text-[12px] text-black font-medium leading-normal mb-2">Category</p>
        <p className="text-[12px] text-black font-medium leading-normal mb-2">Brand</p>
      </div>
      
      {/* Table/List Segmented Control */}
      <div className="flex-shrink-0">
        <div className="flex bg-gray-100 items-center h-9 shadow-sm flex-1 rounded-md">
          <button
            onClick={() => setViewMode('table')}
            className={`flex-1 py-1 px-4 ml-0.5 h-8 rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${viewMode === 'table'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-1 px-4 mr-0.5 h-8 rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${viewMode === 'list'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Item Name and Item ID Dropdowns */}
      <div className="flex gap-3 mt-2">
        {/* Item Name Dropdown */}
        <div className="flex-1 relative dropdown-container">
          <p className="text-[12px] font-medium text-black mb-0.5 leading-normal">Item Name</p>
          <div className="relative">
            <div
              onClick={() => {
                setShowItemNameDropdown(!showItemNameDropdown);
                setShowItemIdDropdown(false);
              }}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                color: selectedItemName ? '#000' : '#9E9E9E',
                boxSizing: 'border-box'
              }}
            >
              {selectedItemName || 'Select'}
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {showItemNameDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] max-h-[200px] overflow-y-auto">
                <div
                  onClick={() => {
                    setSelectedItemName(null);
                    setShowItemNameDropdown(false);
                  }}
                  className="px-3 py-2 text-[12px] font-medium cursor-pointer hover:bg-gray-100"
                >
                  All
                </div>
                {itemNameOptions.map((name) => (
                  <div
                    key={name}
                    onClick={() => {
                      setSelectedItemName(name);
                      setShowItemNameDropdown(false);
                    }}
                    className="px-3 py-2 text-[12px] font-medium cursor-pointer hover:bg-gray-100"
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Item ID Dropdown */}
        <div className="flex-1 relative dropdown-container">
          <p className="text-[12px] font-medium text-black mb-0.5 leading-normal">Item ID</p>
          <div className="relative">
            <div
              onClick={() => {
                setShowItemIdDropdown(!showItemIdDropdown);
                setShowItemNameDropdown(false);
              }}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                color: selectedItemId ? '#000' : '#9E9E9E',
                boxSizing: 'border-box'
              }}
            >
              {selectedItemId || 'Select'}
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {showItemIdDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] max-h-[200px] overflow-y-auto">
                <div
                  onClick={() => {
                    setSelectedItemId(null);
                    setShowItemIdDropdown(false);
                  }}
                  className="px-3 py-2 text-[12px] font-medium cursor-pointer hover:bg-gray-100"
                >
                  All
                </div>
                {itemIdOptions.map((id) => (
                  <div
                    key={id}
                    onClick={() => {
                      setSelectedItemId(id);
                      setShowItemIdDropdown(false);
                    }}
                    className="px-3 py-2 text-[12px] font-medium cursor-pointer hover:bg-gray-100"
                  >
                    {id}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Link */}
      <div className="flex justify-end mt-2">
        <span className="text-[12px] text-blue-600 underline cursor-pointer">Download</span>
      </div>

      {/* Main Content Area */}
      <div key={viewMode} className="flex-1 px-4 pb-4 mt-4 min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-[14px] text-gray-500">Loading...</p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View - Individual Items */
          <div className="mt-4">
            {tableData.length === 0 ? (
              <p className="text-[14px] text-gray-500 text-center mt-8">No data available</p>
            ) : (
              <div className="space-y-3">
                {tableData.map((item, index) => {
                  const itemId = item.id || index;
                  const swipeState = swipeStates[itemId];
                  const isExpanded = expandedItemId === itemId;
                  // Allow editing for items without itemId that have a non-zero quantity (can be positive or negative)
                  const canEdit = !item.hasItemId && item.quantity !== 0;
                  
                  // Calculate swipe offset for items that can be edited (button width is 96px)
                  const buttonWidth = 96;
                  const swipeOffset = canEdit && swipeState && swipeState.isSwiping
                    ? Math.max(-buttonWidth, Math.min(0, swipeState.currentX - swipeState.startX))
                    : isExpanded && canEdit
                      ? -buttonWidth
                      : 0;

                  return (
                    <div key={itemId} className="relative overflow-hidden">
                      {/* Edit Button - Behind the card on the right, revealed on swipe */}
                      {canEdit && (
                        <div
                          className="absolute right-0 top-0 h-full w-10 bg-green-800 flex items-center justify-center z-10 transition-all duration-300 ease-out rounded-md"
                          style={{
                            opacity: isExpanded || (swipeState && swipeState.isSwiping && swipeOffset < -20) ? 1 : 0,
                            transform: swipeOffset < 0 
                              ? `translateX(${Math.max(0, 96 + swipeOffset)}px)` 
                              : 'translateX(96px)',
                            transition: (swipeState && swipeState.isSwiping) ? 'none' : 'opacity 0.2s ease-out, transform 0.3s ease-out',
                          }}
                        >
                          <button
                            onClick={() => {
                              setSelectedItemForEdit(item);
                              setNewCount(String(item.quantity));
                              setShowEditStockModal(true);
                              setExpandedItemId(null);
                            }}
                            className="w-full h-full flex items-center justify-center"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      )}                      
                      {/* Card */}
                      <div
                        className="border border-gray-200 rounded-lg p-3 bg-white relative transition-all duration-300 ease-out"
                        style={{
                          transform: `translateX(${swipeOffset}px)`,
                          touchAction: canEdit ? 'pan-y' : 'auto',
                          userSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                          WebkitUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                          MozUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                          msUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto'
                        }}
                        onTouchStart={canEdit ? (e) => handleTouchStart(e, itemId) : undefined}
                        onTouchMove={canEdit ? (e) => handleTouchMove(e, itemId) : undefined}
                        onTouchEnd={canEdit ? () => handleTouchEnd(itemId, item) : undefined}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            {/* Top line: Location, Item Name - larger bold */}
                            <p className="text-[14px] font-semibold text-black leading-tight mb-1">
                              {item.location !== '-' ? `${item.location}, ${item.itemName}` : item.itemName}
                            </p>
                            {/* Middle line: Machine number - smaller regular */}
                            {item.machineNumber !== '-' && (
                              <p className="text-[12px] text-gray-700 leading-tight mb-1">{item.machineNumber}</p>
                            )}
                            {/* Bottom line: Brand - smaller regular */}
                            <p className="text-[12px] text-gray-700 leading-tight">{item.brand}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-3 flex-shrink-0">
                            {/* Status badge - top right */}
                            {item.status !== '-' && (
                              <span className={`px-2 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${
                                item.status === 'Working' ? 'bg-green-100 text-green-800' : 
                                item.status === 'Dead' ? 'bg-orange-100 text-orange-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.status}
                              </span>
                            )}
                            {/* Item ID or Quantity - bottom right */}
                            <p className="text-[12px] font-medium text-black">
                              {item.hasItemId 
                                ? (item.isMerged ? item.quantity : item.itemId) 
                                : item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* List View - Aggregated Summary Table Only */
          <div className="mt-4">
            {aggregatedSummary.length === 0 ? (
              <p className="text-[14px] text-gray-500 text-center mt-8">No data available</p>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                {/* Table Header */}
                <div className="bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-2 px-3 py-2">
                    <div className="col-span-1 text-[12px] font-medium text-gray-700">#</div>
                    <div className="col-span-5 text-[12px] font-medium text-gray-700">Item Name</div>
                    <div className="col-span-3 text-[12px] font-medium text-gray-700">Brand</div>
                    <div className="col-span-3 text-[12px] font-medium text-gray-700 text-right">Total Stock</div>
                  </div>
                </div>
                {/* Table Body */}
                <div>
                  {aggregatedSummary.map((item, index) => (
                    <div 
                      key={`${item.itemName}_${item.brand}_${index}`} 
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <div className="grid grid-cols-12 gap-2 px-3 py-3">
                        <div className="col-span-1 text-[12px] text-gray-700">{index + 1}</div>
                        <div className="col-span-5 text-[12px] text-black">{item.itemName}</div>
                        <div className="col-span-3 text-[12px] text-gray-700">{item.brand}</div>
                        <div className="col-span-3 text-[12px] font-medium text-black text-right">
                          {String(item.total).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200">
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
            <div className="px-4 py-4 space-y-4">
              {/* Item Name - Read Only */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                  Item Name<span className="text-red-500">*</span>
                </p>
                <input
                  type="text"
                  value={selectedItemForEdit.itemName || ''}
                  readOnly
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-3 text-[12px] font-medium bg-gray-100 text-gray-600 cursor-not-allowed"
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
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-3 text-[12px] font-medium bg-gray-100 text-gray-600 cursor-not-allowed"
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
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-3 text-[12px] font-medium bg-white text-black"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                  placeholder="Enter"
                />
              </div>
            </div>
            {/* Action Buttons */}
            <div className="px-4 pb-4 pt-2 flex gap-3">
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
    </div>
  );
};

export default NetStock;
