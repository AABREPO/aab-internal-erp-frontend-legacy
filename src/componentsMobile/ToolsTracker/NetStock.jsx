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
      } else if (quantity > 0) {
        // Item with quantity only - use home location
        const homeLocation = getLocationName(homeLocationId);
        
        // Create merge key: location + itemName + brand
        const mergeKey = `${homeLocation}_${itemName}_${brand}_qty`;
        
        if (itemsMap.has(mergeKey)) {
          // Merge: add quantities
          const existing = itemsMap.get(mergeKey);
          existing.quantity += quantity;
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
            hasItemId: false
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
      } else if (quantity > 0) {
        // Sum quantities (only for items without itemIds)
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

  return (
    <div className="flex flex-col bg-white px-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Category and Brand Section */}
      <div className="flex justify-between mb-2 mt-2">
        <p className="text-[12px] text-[#848484] leading-normal mb-2">Category</p>
        <p className="text-[12px] text-[#848484] leading-normal mb-2">Brand</p>
      </div>
      
      {/* Table/List Segmented Control */}
      <div className="flex-shrink-0 pt-2">
        <div className="flex bg-gray-100 items-center h-9 shadow-sm flex-1 rounded-md">
          <button
            onClick={() => setViewMode('table')}
            className={`flex-1 py-1 px-4 ml-1 h-8 rounded text-[14px] font-medium transition-colors ${viewMode === 'table'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-1 px-4 ml-1 h-8 rounded text-[14px] font-medium transition-colors ${viewMode === 'list'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Item Name and Item ID Dropdowns */}
      <div className="flex gap-3 mt-4">
        {/* Item Name Dropdown */}
        <div className="flex-1 relative dropdown-container">
          <p className="text-[12px] font-medium text-black mb-1 leading-normal">Item Name</p>
          <div className="relative">
            <div
              onClick={() => {
                setShowItemNameDropdown(!showItemNameDropdown);
                setShowItemIdDropdown(false);
              }}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
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
          <p className="text-[12px] font-medium text-black mb-1 leading-normal">Item ID</p>
          <div className="relative">
            <div
              onClick={() => {
                setShowItemIdDropdown(!showItemIdDropdown);
                setShowItemNameDropdown(false);
              }}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
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
                {tableData.map((item, index) => (
                  <div key={item.id || index} className="border border-gray-200 rounded-lg p-3 bg-white">
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
                ))}
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
    </div>
  );
};

export default NetStock;
