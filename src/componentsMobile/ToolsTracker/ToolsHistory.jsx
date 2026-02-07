import React, { useState, useEffect, useMemo } from 'react';
import SelectOptionModal from '../PurchaseOrder/SelectOptionModal';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';

const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_name';
const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_brand';
const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_id';
const TOOLS_STOCK_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_stock_management';
const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_management';
const TOOLS_MACHINE_STATUS_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools-machine-status';
const PROJECT_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/project_Names';
const VENDOR_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/vendor_Names';

const ToolsHistory = ({ user }) => {
  const [activeSegment, setActiveSegment] = useState('item'); // 'item' or 'log'
  const [selectedItemName, setSelectedItemName] = useState('');
  const [selectedItemNameId, setSelectedItemNameId] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemIdDbId, setSelectedItemIdDbId] = useState(null);
  const [selectedMachineNumber, setSelectedMachineNumber] = useState('');
  const [stockManagementData, setStockManagementData] = useState([]);
  const [toolsTrackerManagementData, setToolsTrackerManagementData] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [vendorsMap, setVendorsMap] = useState({});
  const [machineStatusHistory, setMachineStatusHistory] = useState([]);
  const [loadingLog, setLoadingLog] = useState(false);

  const [showItemNamePopup, setShowItemNamePopup] = useState(false);
  const [showBrandPopup, setShowBrandPopup] = useState(false);
  const [showItemIdPopup, setShowItemIdPopup] = useState(false);
  const [showMachineNumberPopup, setShowMachineNumberPopup] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState(null);
  const [sheetOpenPicker, setSheetOpenPicker] = useState(null);
  const [sheetPickerSearch, setSheetPickerSearch] = useState('');
  const [purchaseStoreOptions, setPurchaseStoreOptions] = useState([]);
  const [homeLocationOptions, setHomeLocationOptions] = useState([]);
  const [purchaseStoreFullData, setPurchaseStoreFullData] = useState([]);
  const [homeLocationFullData, setHomeLocationFullData] = useState([]);
  const [editFormData, setEditFormData] = useState({
    itemName: '',
    itemNameId: null,
    quantity: '',
    itemId: '',
    itemIdDbId: null,
    model: '',
    machineNumber: '',
    brand: '',
    brandId: null,
    purchaseDate: '',
    warrantyDate: '',
    contact: '',
    purchaseStore: '',
    purchaseStoreId: null,
    homeLocation: '',
    homeLocationId: null,
    shopAddress: ''
  });

  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [itemIdOptions, setItemIdOptions] = useState([]);
  // From tools_item_name/getAll: list of { id, item_name, tools_details: [{ item_ids_id, brand_id, machine_number, ... }] }
  const [toolsItemNameListData, setToolsItemNameListData] = useState([]);
  const [toolsBrandFullData, setToolsBrandFullData] = useState([]);
  const [toolsItemIdFullData, setToolsItemIdFullData] = useState([]);

  // Fetch item names
  useEffect(() => {
    const fetchItemNames = async () => {
      try {
        const response = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : [];
          setToolsItemNameListData(list);
          const opts = list
            .map(i => (i?.item_name ?? i?.itemName ?? '').trim())
            .filter(Boolean);
          setItemNameOptions([...new Set(opts)]);
        }
      } catch (err) {
        console.error('Error fetching item names:', err);
      }
    };
    fetchItemNames();
  }, []);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : [];
          setToolsBrandFullData(list);
          const opts = list
            .map(b => (b?.tools_brand ?? b?.toolsBrand ?? '').trim())
            .filter(Boolean);
          setBrandOptions([...new Set(opts)]);
        }
      } catch (err) {
        console.error('Error fetching brands:', err);
      }
    };
    fetchBrands();
  }, []);

  // Fetch item IDs
  useEffect(() => {
    const fetchItemIds = async () => {
      try {
        const response = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : [];
          setToolsItemIdFullData(list);
          const opts = list
            .map(i => (i?.item_id ?? i?.itemId ?? '').trim())
            .filter(Boolean);
          setItemIdOptions([...new Set(opts)]);
        }
      } catch (err) {
        console.error('Error fetching item IDs:', err);
      }
    };
    fetchItemIds();
  }, []);

  // Fetch stock management and tools tracker management (like NetStock.jsx) for current location
  useEffect(() => {
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
      } catch (err) {
        console.error('Error fetching stock/tracker:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch projects and vendors for location name resolution (like NetStock.jsx)
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const [projectsRes, vendorsRes] = await Promise.all([
          fetch(`${PROJECT_NAMES_BASE_URL}/getAll`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch(`${VENDOR_NAMES_BASE_URL}/getAll`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          })
        ]);
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          const map = {};
          const locationData = Array.isArray(data) ? data : [];
          locationData.forEach(p => {
            const name = p.siteName || p.site_name || p.projectName || p.project_name || '';
            map[p.id] = name;
            map[String(p.id)] = name;
          });
          setProjectsMap(map);
          setHomeLocationFullData(locationData);
          const homeLocationNames = locationData.map(item => item.siteName || item.site_name || item.projectName || item.project_name || '').filter(Boolean);
          setHomeLocationOptions(homeLocationNames);
        }
        if (vendorsRes.ok) {
          const data = await vendorsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(v => {
            const name = v.vendorName || v.vendor_name || '';
            map[v.id] = name;
            map[String(v.id)] = name;
          });
          setVendorsMap(map);
          // Set purchase store options (vendors with makeAsServiceShop === true)
          const serviceStoreVendors = (Array.isArray(data) ? data : []).filter(vendor => vendor.makeAsServiceShop === true);
          setPurchaseStoreFullData(serviceStoreVendors);
          const serviceStoreNames = serviceStoreVendors.map(vendor => vendor.vendorName || vendor.vendor_name || '').filter(Boolean);
          setPurchaseStoreOptions(serviceStoreNames);
        }
      } catch (err) {
        console.error('Error fetching projects/vendors:', err);
      }
    };
    fetchMaps();
  }, []);

  // Selected item from tools_item_name/getAll (has tools_details with item_ids_id, brand_id, machine_number)
  const selectedItemNameRecord = useMemo(() => {
    if (!selectedItemNameId) return null;
    return toolsItemNameListData.find(
      i => i != null && String(i.id) === String(selectedItemNameId)
    ) || null;
  }, [selectedItemNameId, toolsItemNameListData]);

  const selectedToolsDetails = useMemo(() => {
    const details = selectedItemNameRecord?.tools_details ?? selectedItemNameRecord?.toolsDetails;
    return Array.isArray(details) ? details : [];
  }, [selectedItemNameRecord]);

  // Brand options from selected item's tools_details (itemIdsId, brandId, machine_number)
  const brandOptionsFiltered = useMemo(() => {
    if (!selectedItemNameId || selectedToolsDetails.length === 0) return [];
    const brandIds = new Set();
    selectedToolsDetails.forEach(d => {
      const bid = d?.brand_id ?? d?.brandId;
      if (bid != null) brandIds.add(String(bid));
    });
    if (brandIds.size === 0) return [];
    return brandOptions.filter(name => {
      const b = toolsBrandFullData.find(
        x => (x?.tools_brand ?? x?.toolsBrand ?? '').trim() === name
      );
      return b && brandIds.has(String(b.id));
    });
  }, [selectedItemNameId, selectedToolsDetails, brandOptions, toolsBrandFullData]);

  // Item ID options from selected item's tools_details
  const itemIdOptionsFiltered = useMemo(() => {
    if (!selectedItemNameId || selectedToolsDetails.length === 0) return [];
    const itemIdsIds = new Set();
    selectedToolsDetails.forEach(d => {
      const iid = d?.item_ids_id ?? d?.itemIdsId;
      if (iid != null) itemIdsIds.add(String(iid));
    });
    if (itemIdsIds.size === 0) return [];
    return itemIdOptions.filter(name => {
      const i = toolsItemIdFullData.find(
        x => (x?.item_id ?? x?.itemId ?? '').trim() === name
      );
      return i && itemIdsIds.has(String(i.id));
    });
  }, [selectedItemNameId, selectedToolsDetails, itemIdOptions, toolsItemIdFullData]);

  // Machine Number dropdown: one itemId can have multiple machine numbers (current + old), so show all in popup
  const machineNumberOptions = useMemo(() => {
    if (!selectedItemIdDbId || selectedToolsDetails.length === 0) return [];
    const idStr = String(selectedItemIdDbId);
    const collected = new Set();
    selectedToolsDetails.forEach(d => {
      const iid = d?.item_ids_id ?? d?.itemIdsId;
      if (iid != null && String(iid) === idStr) {
        const mn = (d?.machine_number ?? d?.machineNumber ?? '').trim();
        if (mn) collected.add(mn);
      }
    });
    return Array.from(collected).sort();
  }, [selectedItemIdDbId, selectedToolsDetails]);

  // When Item ID is cleared, clear Machine Number
  useEffect(() => {
    if (!selectedItemIdDbId) {
      setSelectedMachineNumber('');
      setMachineStatusHistory([]);
    }
  }, [selectedItemIdDbId]);

  // Fetch machine status history when itemId is selected
  useEffect(() => {
    const fetchMachineStatusHistory = async () => {
      if (!selectedItemIdDbId) {
        setMachineStatusHistory([]);
        return;
      }
      
      setLoadingLog(true);
      try {
        const response = await fetch(`${TOOLS_MACHINE_STATUS_BASE_URL}/item/${selectedItemIdDbId}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          const statusList = Array.isArray(data) ? data : [];
          
          // Sort by id descending (newest first)
          const sortedStatuses = statusList.sort((a, b) => (b.id || 0) - (a.id || 0));
          
          // Process to detect "Machine Number Changed" events and create log entries
          const processedLogs = [];
          const seenStatusIds = new Set();
          
          // Group by machine number to detect changes
          const statusByMachineNumber = new Map();
          sortedStatuses.forEach(status => {
            const machineNum = String(status.machine_number || status.machineNumber || '').trim();
            if (machineNum) {
              if (!statusByMachineNumber.has(machineNum)) {
                statusByMachineNumber.set(machineNum, []);
              }
              statusByMachineNumber.get(machineNum).push(status);
            }
          });
          
          // Process each status entry
          sortedStatuses.forEach((status, index) => {
            const machineNum = String(status.machine_number || status.machineNumber || '').trim();
            const machineStatus = String(status.machine_status || status.machineStatus || '').trim();
            const statusId = status.id || 0;
            
            if (seenStatusIds.has(statusId)) return;
            seenStatusIds.add(statusId);
            
            // Check if machine number changed from previous entry
            let isMachineNumberChange = false;
            let oldMachineNumber = null;
            
            if (index > 0 && machineNum) {
              const prevStatus = sortedStatuses[index - 1];
              const prevMachineNum = String(prevStatus.machine_number || prevStatus.machineNumber || '').trim();
              
              if (prevMachineNum && machineNum !== prevMachineNum) {
                isMachineNumberChange = true;
                oldMachineNumber = prevMachineNum;
              }
            }
            
            // Format date - check for common timestamp field names
            // Spring Boot JPA entities often have createdAt, createdDate, or timestamp fields
            const logDate = status.createdAt || status.created_at || status.createdDate || 
                           status.created_date || status.timestamp || status.dateCreated || null;
            let formattedDate = '';
            let formattedTime = '';
            
            if (logDate) {
              try {
                const date = new Date(logDate);
                if (!isNaN(date.getTime())) {
                  formattedDate = date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  formattedTime = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                }
              } catch (e) {
                console.error('Error parsing date:', e);
              }
            }
            
            // If no date available, show empty (or you could use a placeholder)
            // The UI will still show the status and machine number
            
            // If machine number changed, add a change entry
            if (isMachineNumberChange && oldMachineNumber) {
              processedLogs.push({
                id: statusId,
                type: 'machine_number_changed',
                status: 'Machine Number Changed',
                machineNumber: machineNum,
                oldMachineNumber: oldMachineNumber,
                timestamp: statusId,
                date: formattedDate,
                time: formattedTime
              });
            }
            
            // Add status entry
            if (machineStatus) {
              processedLogs.push({
                id: statusId,
                type: 'status_change',
                status: machineStatus,
                machineNumber: machineNum,
                timestamp: statusId,
                date: formattedDate,
                time: formattedTime
              });
            }
          });
          
          // Sort processed logs by id descending (newest first)
          processedLogs.sort((a, b) => (b.id || 0) - (a.id || 0));
          
          setMachineStatusHistory(processedLogs);
        } else {
          setMachineStatusHistory([]);
        }
      } catch (error) {
        console.error('Error fetching machine status history:', error);
        setMachineStatusHistory([]);
      } finally {
        setLoadingLog(false);
      }
    };
    
    fetchMachineStatusHistory();
  }, [selectedItemIdDbId]);

  // Location name from project or vendor ID (like NetStock.jsx)
  const getLocationName = (id) => {
    if (!id) return '';
    const idStr = String(id);
    if (projectsMap[idStr]) return projectsMap[idStr];
    if (projectsMap[id]) return projectsMap[id];
    if (vendorsMap[idStr]) return vendorsMap[idStr];
    if (vendorsMap[id]) return vendorsMap[id];
    return '';
  };

  // Home location ID: most recent from tools_tracker_management, else from stock_management (like NetStock.jsx)
  const getHomeLocationId = (itemIdsId, brandId, machineNumber, stockHomeLocationId) => {
    const matchingEntries = [];
    for (const entry of toolsTrackerManagementData) {
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
      for (const entryItem of entryItems) {
        const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        const entryBrandId = entryItem.brand_id || entryItem.brandId;
        const entryMachineNumber = entryItem.machine_number || entryItem.machineNumber || '';
        const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === String(itemIdsId);
        const brandMatch = !brandId || (entryBrandId && String(entryBrandId) === String(brandId));
        const machineMatch = !machineNumber || (entryMachineNumber && String(entryMachineNumber).trim() === machineNumber.trim());
        if (itemIdsMatch && brandMatch && machineMatch) {
          let itemHomeLocationId = entryItem.home_location_id || entryItem.homeLocationId;
          if (!itemHomeLocationId) {
            const stockItem = stockManagementData.find(stock => {
              const stockItemIdsId = stock.item_ids_id || stock.itemIdsId;
              const stockBrandId = stock.brand_name_id || stock.brandNameId;
              const stockMachineNumber = stock.machine_number || stock.machineNumber || '';
              return stockItemIdsId && String(stockItemIdsId) === String(itemIdsId) &&
                (!brandId || (stockBrandId && String(stockBrandId) === String(brandId))) &&
                (!machineNumber || (stockMachineNumber && String(stockMachineNumber).trim() === machineNumber.trim()));
            });
            if (stockItem) itemHomeLocationId = stockItem.home_location_id || stockItem.homeLocationId;
          }
          if (itemHomeLocationId) {
            const entryDate = entry.created_date_time || entry.createdDateTime || entry.timestamp || '';
            matchingEntries.push({ homeLocationId: itemHomeLocationId, date: entryDate });
          }
        }
      }
    }
    if (matchingEntries.length > 0) {
      matchingEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      return matchingEntries[0].homeLocationId;
    }
    const stockItem = stockManagementData.find(stock => {
      const stockItemIdsId = stock.item_ids_id || stock.itemIdsId;
      const stockBrandId = stock.brand_name_id || stock.brandNameId;
      const stockMachineNumber = stock.machine_number || stock.machineNumber || '';
      return stockItemIdsId && String(stockItemIdsId) === String(itemIdsId) &&
        (!brandId || (stockBrandId && String(stockBrandId) === String(brandId))) &&
        (!machineNumber || (stockMachineNumber && String(stockMachineNumber).trim() === machineNumber.trim()));
    });
    if (stockItem) return stockItem.home_location_id || stockItem.homeLocationId;
    return stockHomeLocationId;
  };

  // Matching stock management record for details card (from TOOLS_STOCK_MANAGEMENT_BASE_URL/getAll)
  const selectedStockForCard = useMemo(() => {
    if (!selectedItemIdDbId || !selectedMachineNumber || stockManagementData.length === 0) return null;
    const idStr = String(selectedItemIdDbId);
    const brandStr = selectedBrandId != null ? String(selectedBrandId) : null;
    return stockManagementData.find(stock => {
      const stockItemIdsId = stock.item_ids_id ?? stock.itemIdsId;
      const stockBrandId = stock.brand_name_id ?? stock.brandNameId;
      const stockMachineNumber = (stock.machine_number ?? stock.machineNumber ?? '').trim();
      return stockItemIdsId != null && String(stockItemIdsId) === idStr &&
        (!brandStr || (stockBrandId != null && String(stockBrandId) === brandStr)) &&
        stockMachineNumber === selectedMachineNumber.trim();
    }) || null;
  }, [selectedItemIdDbId, selectedBrandId, selectedMachineNumber, stockManagementData]);

  // Current location for selected item set (output field)
  const currentLocation = useMemo(() => {
    if (!selectedItemIdDbId || !selectedMachineNumber) return '';
    const idStr = String(selectedItemIdDbId);
    const stockItem = stockManagementData.find(stock => {
      const stockItemIdsId = stock.item_ids_id || stock.itemIdsId;
      const stockBrandId = stock.brand_name_id || stock.brandNameId;
      const stockMachineNumber = stock.machine_number || stock.machineNumber || '';
      return stockItemIdsId && String(stockItemIdsId) === idStr &&
        (!selectedBrandId || (stockBrandId && String(stockBrandId) === String(selectedBrandId))) &&
        stockMachineNumber && String(stockMachineNumber).trim() === selectedMachineNumber.trim();
    });
    const homeLocationId = stockItem ? (stockItem.home_location_id || stockItem.homeLocationId) : null;
    const locationId = getHomeLocationId(selectedItemIdDbId, selectedBrandId, selectedMachineNumber, homeLocationId);
    return getLocationName(locationId) || '';
  }, [selectedItemIdDbId, selectedBrandId, selectedMachineNumber, stockManagementData, toolsTrackerManagementData, projectsMap, vendorsMap]);

  // When Item Name is cleared, clear dependent Brand, Item ID, Machine Number
  useEffect(() => {
    if (!selectedItemNameId) {
      setSelectedBrand('');
      setSelectedBrandId(null);
      setSelectedItemId('');
      setSelectedItemIdDbId(null);
      setSelectedMachineNumber('');
    }
  }, [selectedItemNameId]);

  const handleSelectItemName = (value) => {
    setSelectedItemName(value || '');
    const found = toolsItemNameListData.find(
      i => (i?.item_name ?? i?.itemName ?? '').trim() === value
    );
    setSelectedItemNameId(found ? found.id : null);
    setSelectedBrand('');
    setSelectedBrandId(null);
    setSelectedItemId('');
    setSelectedItemIdDbId(null);
    setSelectedMachineNumber('');
    setShowItemNamePopup(false);
  };

  const handleSelectBrand = (value) => {
    setSelectedBrand(value || '');
    const found = toolsBrandFullData.find(
      b => (b?.tools_brand ?? b?.toolsBrand ?? '').trim() === value
    );
    setSelectedBrandId(found ? found.id : null);
    setShowBrandPopup(false);
  };

  const handleSelectItemId = (value) => {
    setSelectedItemId(value || '');
    const found = toolsItemIdFullData.find(
      i => (i?.item_id ?? i?.itemId ?? '').trim() === value
    );
    const itemIdDbId = found ? found.id : null;
    setSelectedItemIdDbId(itemIdDbId);

    // Auto-fill Brand and Machine Number from selected item's tools_details for this item_ids_id
    if (itemIdDbId && selectedToolsDetails.length > 0) {
      const idStr = String(itemIdDbId);
      // Use first matching detail (or latest by timestamp if available)
      const matches = selectedToolsDetails.filter(
        d => (d?.item_ids_id ?? d?.itemIdsId) != null && String(d?.item_ids_id ?? d?.itemIdsId) === idStr
      );
      const detail = matches.length > 0
        ? matches.sort((a, b) => {
            const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
            const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
            return tb - ta; // latest first
          })[0]
        : null;
      if (detail) {
        const brandId = detail?.brand_id ?? detail?.brandId;
        const machineNum = (detail?.machine_number ?? detail?.machineNumber ?? '').trim();
        if (brandId != null) {
          const brandRecord = toolsBrandFullData.find(b => b != null && String(b.id) === String(brandId));
          const brandName = brandRecord ? (brandRecord?.tools_brand ?? brandRecord?.toolsBrand ?? '').trim() : '';
          if (brandName) {
            setSelectedBrand(brandName);
            setSelectedBrandId(brandRecord.id);
          }
        }
        if (machineNum) setSelectedMachineNumber(machineNum);
      } else {
        setSelectedMachineNumber('');
      }
    } else {
      setSelectedMachineNumber('');
    }

    setShowItemIdPopup(false);
  };

  const handleSelectMachineNumber = (value) => {
    setSelectedMachineNumber(value || '');
    setShowMachineNumberPopup(false);
  };

  const renderDropdownTrigger = (label, value, placeholder, onClick, disabled = false) => (
    <div className="flex-1">
      <p className="text-[12px] font-medium text-black mb-0.5 leading-normal">{label}</p>
      <div className="relative">
        <div
          onClick={disabled ? undefined : onClick}
          className={`w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center ${disabled ? 'bg-[#E0E0E0] cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            color: value ? '#000' : '#9E9E9E',
            boxSizing: 'border-box'
          }}
        >
          {value || placeholder}
        </div>
        {!disabled && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  // Handle Edit button click - open bottom sheet with pre-populated data
  const handleEditClick = () => {
    if (!selectedStockForCard) {
      alert('Please select an item to edit');
      return;
    }
    
    // Pre-populate form with selectedStockForCard data
    const stockItem = selectedStockForCard;
    
    // Get item name
    const itemNameId = stockItem.item_name_id || stockItem.itemNameId;
    const itemNameObj = toolsItemNameListData.find(item => String(item?.id) === String(itemNameId));
    const itemName = itemNameObj?.item_name || itemNameObj?.itemName || '';
    
    // Get brand
    const brandId = stockItem.brand_name_id || stockItem.brandNameId;
    const brandObj = toolsBrandFullData.find(b => String(b?.id) === String(brandId));
    const brandName = brandObj?.tools_brand || brandObj?.toolsBrand || '';
    
    // Get item ID
    const itemIdsId = stockItem.item_ids_id || stockItem.itemIdsId;
    const itemIdObj = toolsItemIdFullData.find(i => String(i?.id) === String(itemIdsId));
    const itemIdName = itemIdObj?.item_id || itemIdObj?.itemId || '';
    
    // Get purchase store
    const purchaseStoreId = stockItem.purchase_store_id || stockItem.purchaseStoreId;
    const purchaseStoreObj = purchaseStoreFullData.find(s => String(s?.id) === String(purchaseStoreId));
    const purchaseStoreName = purchaseStoreObj?.vendorName || purchaseStoreObj?.vendor_name || '';
    
    // Get home location
    const homeLocationId = stockItem.home_location_id || stockItem.homeLocationId;
    const homeLocationObj = homeLocationFullData.find(l => String(l?.id) === String(homeLocationId));
    const homeLocationName = homeLocationObj?.siteName || homeLocationObj?.site_name || homeLocationObj?.projectName || homeLocationObj?.project_name || '';
    
    setEditFormData({
      itemName: itemName,
      itemNameId: itemNameId || null,
      quantity: String(stockItem.quantity || '0'),
      itemId: itemIdName,
      itemIdDbId: itemIdsId || null,
      model: stockItem.model || '',
      machineNumber: stockItem.machine_number || stockItem.machineNumber || '',
      brand: brandName,
      brandId: brandId || null,
      purchaseDate: stockItem.purchase_date || stockItem.purchaseDate || '',
      warrantyDate: stockItem.warranty_date || stockItem.warrantyDate || '',
      contact: stockItem.contact || '',
      purchaseStore: purchaseStoreName,
      purchaseStoreId: purchaseStoreId || null,
      homeLocation: homeLocationName,
      homeLocationId: homeLocationId || null,
      shopAddress: stockItem.shop_address || stockItem.shopAddress || ''
    });
    
    setFileUrl(stockItem.file_url || stockItem.fileUrl || '');
    setSelectedFile(null);
    setShowEditSheet(true);
  };

  const handleCloseEditSheet = () => {
    setShowEditSheet(false);
    setSheetOpenPicker(null);
    setSheetPickerSearch('');
    setShowDatePicker(false);
    setDatePickerField(null);
  };

  const handleEditFieldChange = (field, value) => {
    setEditFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'itemId' && value) {
        updated.quantity = '0';
        const itemIdObj = toolsItemIdFullData.find(
          item => (item?.item_id?.trim() ?? item?.itemId?.trim()) === value
        );
        updated.itemIdDbId = itemIdObj?.id ?? null;
      } else if (field === 'itemId' && !value) {
        updated.itemIdDbId = null;
      } else if (field === 'quantity' && value && value !== '0' && value.trim() !== '') {
        updated.itemId = '';
        updated.itemIdDbId = null;
      }
      if (field === 'itemName' && value) {
        const itemNameObj = toolsItemNameListData.find(
          item => (item?.item_name ?? item?.itemName) === value
        );
        updated.itemNameId = itemNameObj?.id ?? null;
      } else if (field === 'itemName' && !value) {
        updated.itemNameId = null;
      }
      if (field === 'brand' && value) {
        const brandObj = toolsBrandFullData.find(
          b => (b?.tools_brand?.trim() ?? b?.toolsBrand?.trim()) === value
        );
        updated.brandId = brandObj?.id ?? null;
      } else if (field === 'brand' && !value) {
        updated.brandId = null;
      }
      if (field === 'purchaseStore' && value) {
        const storeObj = purchaseStoreFullData.find(
          v => (v?.vendorName || v?.vendor_name) === value
        );
        updated.purchaseStoreId = storeObj?.id ?? null;
      } else if (field === 'purchaseStore' && !value) {
        updated.purchaseStoreId = null;
      }
      if (field === 'homeLocation' && value) {
        const locationObj = homeLocationFullData.find(
          item => (item?.siteName || item?.site_name || item?.projectName || item?.project_name) === value
        );
        updated.homeLocationId = locationObj?.id ?? null;
      } else if (field === 'homeLocation' && !value) {
        updated.homeLocationId = null;
      }
      return updated;
    });
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    // If date is in yyyy-mm-dd format (from HTML5 date input), convert to dd/mm/yyyy
    if (dateStr.includes('-') && dateStr.length === 10) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    // If already in dd/mm/yyyy format, return as is
    return dateStr;
  };

  const handleDatePickerOpen = (field) => {
    setDatePickerField(field);
    setShowDatePicker(true);
  };

  const handleDatePickerConfirm = (formattedDate) => {
    if (datePickerField) {
      handleEditFieldChange(datePickerField, formattedDate);
    }
    setShowDatePicker(false);
    setDatePickerField(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setIsUploading(true);
    try {
      const formData = new FormData();
      const now = new Date();
      const timestamp = now.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
        .replace(",", "")
        .replace(/\s/g, "-");
      const itemName = editFormData.itemName || selectedItemName || 'Tool';
      const finalName = `${timestamp} ${itemName} ${editFormData.machineNumber || ''}`.trim();
      formData.append('file', file);
      formData.append('file_name', finalName);
      const uploadRes = await fetch('https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        const uploadedUrl = uploadData.fileUrl || uploadData.file_url || '';
        setFileUrl(uploadedUrl);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedStockForCard) {
      alert('No item selected to update');
      return;
    }
    
    const stockId = selectedStockForCard.id || selectedStockForCard._id;
    if (!stockId) {
      alert('Cannot update: Item ID not found');
      return;
    }

    if (!editFormData.homeLocationId) {
      alert('Home Location is required.');
      return;
    }

    if (isUploading) {
      alert('Please wait for file upload to complete.');
      return;
    }

    setIsSaving(true);
    try {
      const itemName = (editFormData.itemName || selectedItemName || '').trim();
      if (!itemName) {
        alert('Item Name is required.');
        setIsSaving(false);
        return;
      }

      const normalizedItemName = itemName.toLowerCase().trim();
      const existingItemName = toolsItemNameListData.find(
        item => {
          const existingName = (item?.item_name ?? item?.itemName ?? '').toLowerCase().trim();
          return existingName === normalizedItemName;
        }
      );
      const itemNameId = existingItemName?.id ?? editFormData.itemNameId;

      const updatePayload = {
        item_name_id: itemNameId ? String(itemNameId) : null,
        brand_name_id: editFormData.brandId ? String(editFormData.brandId) : null,
        item_ids_id: editFormData.itemIdDbId ? String(editFormData.itemIdDbId) : null,
        model: editFormData.model?.trim() || null,
        machine_number: editFormData.machineNumber?.trim() || null,
        purchase_store_id: editFormData.purchaseStoreId ? String(editFormData.purchaseStoreId) : null,
        home_location_id: editFormData.homeLocationId ? String(editFormData.homeLocationId) : null,
        purchase_date: editFormData.purchaseDate || null,
        warranty_date: editFormData.warrantyDate || null,
        contact: editFormData.contact?.trim() || null,
        shop_address: editFormData.shopAddress?.trim() || null,
        quantity: editFormData.quantity || '0',
        file_url: fileUrl || null,
        tool_status: selectedStockForCard.tool_status || selectedStockForCard.toolStatus || 'Available'
      };

      const editedBy = user?.name || user?.username || 'mobile';
      const response = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/edit/${stockId}?editedBy=${encodeURIComponent(editedBy)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        throw new Error(`Failed to update: ${response.status} ${response.statusText}`);
      }

      // Refresh stock management data
      const refreshRes = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/getAll`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setStockManagementData(Array.isArray(data) ? data : []);
      }

      alert('Updated successfully!');
      handleCloseEditSheet();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSheetDropdown = (field, value, placeholder) => (
    <div className="relative w-full">
      <div onClick={() => {
        setSheetOpenPicker(field);
        setSheetPickerSearch('');
      }}
        className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
        style={{ color: value ? '#000' : '#9E9E9E', boxSizing: 'border-box', paddingRight: '40px' }}
      >
        {value || placeholder}
      </div>
      {value && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleEditFieldChange(field, ''); }}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );

  const getPickerOptions = () => {
    if (!sheetOpenPicker) return [];
    let opts = [];
    if (sheetOpenPicker === 'itemName') {
      opts = itemNameOptions || [];
    } else if (sheetOpenPicker === 'itemId') {
      opts = itemIdOptionsFiltered || [];
    } else if (sheetOpenPicker === 'brand') {
      opts = brandOptionsFiltered || [];
    } else if (sheetOpenPicker === 'purchaseStore') {
      opts = purchaseStoreOptions || [];
    } else if (sheetOpenPicker === 'homeLocation') {
      opts = homeLocationOptions || [];
    }
    const q = (sheetPickerSearch || '').trim().toLowerCase();
    if (!q) return opts;
    return opts.filter(o => String(o).toLowerCase().includes(q));
  };

  const handleSheetPickerSelect = (field, value) => {
    handleEditFieldChange(field, value);
    setSheetOpenPicker(null);
    setSheetPickerSearch('');
  };

  return (
    <div className="flex flex-col bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Top row: Item Name (left) + Edit button (right) when Item tab active, Item ID button when Log tab active */}
      <div className="flex-shrink-0 px-4 pt-2">
        <div className="flex justify-between items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowItemNamePopup(true);
              setShowBrandPopup(false);
              setShowItemIdPopup(false);
              setShowMachineNumberPopup(false);
            }}
            className="text-[12px] font-medium text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent text-left"
          >
            {selectedItemName ? selectedItemName : 'Item Name'}
          </button>
          {/* Show Edit button when Item tab is active and item is selected */}
          {activeSegment === 'item' && selectedStockForCard && (
            <button
              type="button"
              onClick={handleEditClick}
              className="text-[12px] font-medium text-black leading-normal cursor-pointer hover:opacity-80 p-0 border-0 bg-transparent text-right flex-shrink-0 flex items-center gap-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit
            </button>
          )}
          {/* Only show Item ID button when Log tab is active */}
          {activeSegment === 'log' && selectedItemName && (
            <button
              type="button"
              onClick={() => {
                setShowItemIdPopup(true);
                setShowItemNamePopup(false);
                setShowBrandPopup(false);
                setShowMachineNumberPopup(false);
              }}
              className="text-[12px] font-medium text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent text-right flex-shrink-0"
            >
              {selectedItemId || 'Item ID'}
            </button>
          )}
        </div>
        {/* Item / Log segmented control */}
        <div className="flex bg-gray-100 items-center h-9 shadow-sm flex-1 rounded-md mt-2">
          <button
            type="button"
            onClick={() => setActiveSegment('item')}
            className={`flex-1 py-1 px-4 ml-1 h-8 rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${
              activeSegment === 'item' ? 'bg-white text-black' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Item
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment('log')}
            className={`flex-1 py-1 px-4 ml-1 h-8 rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${
              activeSegment === 'log' ? 'bg-white text-black' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Log
          </button>
        </div>
      </div>

      {/* Item tab: Brand, Item ID, Machine Number, Location dropdowns + details card */}
      {activeSegment === 'item' && (
        <>
          <div className="flex-shrink-0 px-4 mt-2 pb-2 space-y-[6px]">
            <div className="flex gap-3">
              {renderDropdownTrigger('Brand', selectedBrand, 'Select', () => {
                setShowBrandPopup(true);
                setShowItemNamePopup(false);
                setShowItemIdPopup(false);
                setShowMachineNumberPopup(false);
              })}
              {renderDropdownTrigger('Item ID', selectedItemId, 'Select', () => {
                setShowItemIdPopup(true);
                setShowItemNamePopup(false);
                setShowBrandPopup(false);
                setShowMachineNumberPopup(false);
              })}
            </div>
            <div className="flex gap-3">
              {renderDropdownTrigger(
                'Machine Number',
                selectedMachineNumber,
                'Select',
                () => {
                  if (!selectedItemIdDbId) return;
                  setShowMachineNumberPopup(true);
                  setShowItemNamePopup(false);
                  setShowBrandPopup(false);
                  setShowItemIdPopup(false);
                },
                !selectedItemIdDbId
              )}
              <div className="flex-1 relative">
                <p className="text-[12px] font-medium text-black mb-0.5 leading-normal">Location</p>
                <div
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-3 text-[12px] font-medium bg-[#E0E0E0] text-black flex items-center"
                  style={{ boxSizing: 'border-box' }}
                >
                  {currentLocation || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Details card + image from stock management API */}
          {selectedItemName && selectedBrand && selectedItemId && selectedMachineNumber && selectedStockForCard && (
        <div className="flex-1 px-4 pb-4 mt-2">
          <div className="rounded-[8px] border border-[rgba(0,0,0,0.16)] p-3 bg-white">
            {selectedStockForCard.model != null && String(selectedStockForCard.model).trim() !== '' && (
              <p className="text-[12px] text-black mb-1"><span className="font-medium">Model:</span> {selectedStockForCard.model}</p>
            )}
            {(selectedStockForCard.purchase_date ?? selectedStockForCard.purchaseDate) != null && String(selectedStockForCard.purchase_date ?? selectedStockForCard.purchaseDate).trim() !== '' && (
              <p className="text-[12px] text-black mb-1"><span className="font-medium">Purchase Date:</span> {selectedStockForCard.purchase_date ?? selectedStockForCard.purchaseDate}</p>
            )}
            {(selectedStockForCard.warranty_date ?? selectedStockForCard.warrantyDate) != null && String(selectedStockForCard.warranty_date ?? selectedStockForCard.warrantyDate).trim() !== '' && (
              <p className="text-[12px] text-black mb-1"><span className="font-medium">Warranty Date:</span> {selectedStockForCard.warranty_date ?? selectedStockForCard.warrantyDate}</p>
            )}
            {(selectedStockForCard.purchase_store_id ?? selectedStockForCard.purchaseStoreId) != null && (() => {
              const storeId = selectedStockForCard.purchase_store_id ?? selectedStockForCard.purchaseStoreId;
              const storeName = getLocationName(storeId) || storeId;
              return String(storeName).trim() !== '' ? (
                <p className="text-[12px] text-black mb-1"><span className="font-medium">Purchase Store:</span> {storeName}</p>
              ) : null;
            })()}
            {(selectedStockForCard.contact) != null && String(selectedStockForCard.contact).trim() !== '' && (
              <p className="text-[12px] text-black mb-1"><span className="font-medium">Contact:</span> {selectedStockForCard.contact}</p>
            )}
            {(selectedStockForCard.shop_address ?? selectedStockForCard.shopAddress) != null && String(selectedStockForCard.shop_address ?? selectedStockForCard.shopAddress).trim() !== '' && (
              <p className="text-[12px] text-black mb-1"><span className="font-medium">Shop Address:</span> {selectedStockForCard.shop_address ?? selectedStockForCard.shopAddress}</p>
            )}
            {(selectedStockForCard.tool_status ?? selectedStockForCard.toolStatus) != null && String(selectedStockForCard.tool_status ?? selectedStockForCard.toolStatus).trim() !== '' && (
              <p className="text-[12px] text-black mb-1"><span className="font-medium">Status:</span> {selectedStockForCard.tool_status ?? selectedStockForCard.toolStatus}</p>
            )}
          </div>
          {(selectedStockForCard.file_url ?? selectedStockForCard.fileUrl) && (
            <div className="mt-3 rounded-[8px] overflow-hidden border border-[rgba(0,0,0,0.16)]">
              <img src={selectedStockForCard.file_url ?? selectedStockForCard.fileUrl} alt={selectedItemName} className="w-full h-auto object-contain max-h-[280px]" />
            </div>
          )}
        </div>
      )}
        </>
      )}

      {/* Log tab: no dropdowns, just log entries list (Item ID is already in top right as button) */}
      {activeSegment === 'log' && (
        <div className="flex-1 px-4 pb-4 mt-4 min-h-[200px] overflow-y-auto">
          {!selectedItemIdDbId ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-[12px] text-gray-500">Please select an Item ID to view log history</p>
            </div>
          ) : loadingLog ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-[12px] text-gray-500">Loading...</p>
            </div>
          ) : machineStatusHistory.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-[12px] text-gray-500">No log history found for this Item ID</p>
            </div>
          ) : (
            <div className="space-y-3">
              {machineStatusHistory.map((logEntry, index) => (
                <div key={logEntry.id || index} className="bg-white border-2 border-[#E0E0E0] rounded-[8px] px-3 py-2">
                  <div className="flex items-start justify-between">
                    {/* Left side: Status and Date */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-black leading-snug mb-1">
                        {logEntry.status}
                      </p>
                      <p className="text-[11px] text-[#848484] leading-snug">
                        {logEntry.date} • {logEntry.time}
                      </p>
                    </div>
                    
                    {/* Right side: Machine Number(s) */}
                    <div className="flex-shrink-0 ml-2 text-right">
                      {logEntry.type === 'machine_number_changed' ? (
                        <div className="flex flex-col items-end">
                          <p className="text-[13px] font-semibold text-[#848484] line-through leading-snug mb-1">
                            {logEntry.oldMachineNumber}
                          </p>
                          <p className="text-[13px] font-semibold text-[#4CAF50] leading-snug">
                            {logEntry.machineNumber}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[13px] font-semibold text-[#4CAF50] leading-snug">
                          {logEntry.machineNumber || '-'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main content area for Item tab (spacer when no details card) */}
      {activeSegment === 'item' && (
        <div className="flex-1 px-4 pb-4 mt-4 min-h-[200px]" />
      )}

      {/* Popups */}
      <SelectOptionModal
        isOpen={showItemNamePopup}
        onClose={() => setShowItemNamePopup(false)}
        onSelect={handleSelectItemName}
        selectedValue={selectedItemName}
        options={itemNameOptions}
        fieldName="Item Name"
      />
      <SelectOptionModal
        isOpen={showBrandPopup}
        onClose={() => setShowBrandPopup(false)}
        onSelect={handleSelectBrand}
        selectedValue={selectedBrand}
        options={brandOptionsFiltered}
        fieldName="Brand"
      />
      <SelectOptionModal
        isOpen={showItemIdPopup}
        onClose={() => setShowItemIdPopup(false)}
        onSelect={handleSelectItemId}
        selectedValue={selectedItemId}
        options={itemIdOptionsFiltered}
        fieldName="Item ID"
      />
      <SelectOptionModal
        isOpen={showMachineNumberPopup}
        onClose={() => setShowMachineNumberPopup(false)}
        onSelect={handleSelectMachineNumber}
        selectedValue={selectedMachineNumber}
        options={machineNumberOptions}
        fieldName="Machine Number"
      />

      {/* Edit Bottom Sheet Modal */}
      {showEditSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }} onClick={handleCloseEditSheet}>
          <div className="bg-white w-full max-w-[360px] max-h-[70vh] rounded-tl-[16px] rounded-tr-[16px] relative z-50 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-1">
              <p className="text-[16px] font-bold text-black">Select Filters</p>
              <button type="button" onClick={handleCloseEditSheet} className="text-[#e06256] text-xl font-bold leading-none">
                ×
              </button>
            </div>
            {/* Form - scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-1">
              {/* Row 1: Item Name* + Quantity */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Item Name<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <div className='w-[220px]'>
                    {renderSheetDropdown('itemName', editFormData.itemName, 'Select')}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Quantity</p>
                  <input
                    type="text"
                    value={editFormData.quantity}
                    onChange={(e) => handleEditFieldChange('quantity', e.target.value)}
                    disabled={!!editFormData.itemId}
                    className={`w-full h-[32px] border border-[#d6d6d6] px-3 text-[12px] font-medium focus:outline-none text-gray-700 ${!!editFormData.itemId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="0"
                  />
                </div>
              </div>
              {/* Row 2: Item ID + Model* */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Item ID</p>
                  <div className={editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '' ? 'opacity-50 pointer-events-none' : ''}>
                    {renderSheetDropdown('itemId', editFormData.itemId, 'Select')}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Model{!(editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '') && <span className="text-[#eb2f8e]">*</span>}
                  </p>
                  <input
                    type="text"
                    value={editFormData.model}
                    onChange={(e) => handleEditFieldChange('model', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                    placeholder="Enter"
                  />
                </div>
              </div>
              {/* Row 3: Machine Number* + Brand* */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Machine Number{!(editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '') && <span className="text-[#eb2f8e]">*</span>}
                  </p>
                  <input
                    type="text"
                    value={editFormData.machineNumber}
                    onChange={(e) => handleEditFieldChange('machineNumber', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                    placeholder="Enter"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Brand{!(editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '') && <span className="text-[#eb2f8e]">*</span>}
                  </p>
                  {renderSheetDropdown('brand', editFormData.brand, 'Select')}
                </div>
              </div>
              {/* Home Location */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-medium text-black">
                      Home Location<span className="text-[#eb2f8e]">*</span>
                    </p>
                    {editFormData.homeLocation && (() => {
                      const selectedLocation = homeLocationFullData.find(item => (item?.siteName || item?.site_name || item?.projectName || item?.project_name) === editFormData.homeLocation);
                      return selectedLocation?.branch ? (
                        <span className="text-[12px] font-medium text-[#E4572E]">{selectedLocation.branch}</span>
                      ) : null;
                    })()}
                  </div>
                  {renderSheetDropdown('homeLocation', editFormData.homeLocation, 'Select')}
                </div>
              </div>
              {/* Purchase Store */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-medium text-black">
                      Purchase Store{!(editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '') && <span className="text-[#eb2f8e]">*</span>}
                    </p>
                    {editFormData.purchaseStore && (() => {
                      const selectedStore = purchaseStoreFullData.find(item => (item?.vendorName || item?.vendor_name) === editFormData.purchaseStore);
                      return selectedStore?.contact_number ? (
                        <span className="text-[12px] font-medium text-[#E4572E]">{selectedStore.contact_number}</span>
                      ) : null;
                    })()}
                  </div>
                  {renderSheetDropdown('purchaseStore', editFormData.purchaseStore, 'Select')}
                </div>
              </div>
              {/* Purchase Date + Warranty Date */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Purchase Date{!(editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '') && <span className="text-[#eb2f8e]">*</span>}
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={formatDateForDisplay(editFormData.purchaseDate) || ''}
                      onClick={() => handleDatePickerOpen('purchaseDate')}
                      onFocus={() => handleDatePickerOpen('purchaseDate')}
                      placeholder="dd-mm-yyyy"
                      className="w-[150px] h-[32px] border border-[#d6d6d6] pl-3 pr-10 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500 cursor-pointer"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11 1V4M5 1V4M2 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Warranty Date{!(editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '') && <span className="text-[#eb2f8e]">*</span>}
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={formatDateForDisplay(editFormData.warrantyDate) || ''}
                      onClick={() => handleDatePickerOpen('warrantyDate')}
                      onFocus={() => handleDatePickerOpen('warrantyDate')}
                      placeholder="dd-mm-yyyy"
                      className="w-[150px] h-[32px] border border-[#d6d6d6] pl-3 pr-10 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500 cursor-pointer"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11 1V4M5 1V4M2 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              {/* Contact */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Contact</p>
                  <input
                    type="text"
                    value={editFormData.contact}
                    onChange={(e) => handleEditFieldChange('contact', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                    placeholder="Enter"
                  />
                </div>
              </div>
              {/* Shop Address */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Shop Address</p>
                  <input
                    type="text"
                    value={editFormData.shopAddress}
                    onChange={(e) => handleEditFieldChange('shopAddress', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                    placeholder="Enter"
                  />
                </div>
              </div>
              {/* Attach File */}
              <div className="mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <label htmlFor="edit-sheet-attach-file" className={`flex items-center gap-1 cursor-pointer text-[12px] font-medium text-[#E4572E] ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                    {isUploading ? 'Uploading...' : 'Attach File'}
                  </label>
                  {selectedFile && (
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md max-w-[200px]">
                      <span className="text-[11px] text-gray-700 truncate">{selectedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFileUrl('');
                        }}
                        className="text-gray-500 hover:text-red-500 flex-shrink-0"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {fileUrl && !isUploading && (
                    <span className="text-[10px] text-green-600">Uploaded</span>
                  )}
                </div>
                <input
                  id="edit-sheet-attach-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,image/*,application/pdf"
                />
              </div>
            </div>
            {/* Footer: Cancel + Update */}
            <div className="flex-shrink-0 flex gap-4 px-6 pb-6 pt-2">
              <button type="button" onClick={handleCloseEditSheet} disabled={isSaving || isUploading}
                className={`flex-1 h-[40px] border border-black rounded-[8px] text-[14px] font-bold text-black bg-white ${(isSaving || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Cancel
              </button>
              <button type="button" onClick={handleUpdateStock} disabled={isSaving || isUploading}
                className={`flex-1 h-[40px] rounded-[8px] text-[14px] font-bold text-white bg-black ${(isSaving || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? 'Updating...' : isUploading ? 'Uploading...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sheet dropdown picker modal */}
      {showEditSheet && sheetOpenPicker && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSheetOpenPicker(null);
              setSheetPickerSearch('');
            }
          }}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-5">
              <p className="text-[16px] font-semibold text-black">
                Select {({ itemName: 'Item Name', itemId: 'Item ID', brand: 'Brand', purchaseStore: 'Purchase Store', homeLocation: 'Home Location' })[sheetOpenPicker] || sheetOpenPicker}
              </p>
              <button type="button" onClick={() => {
                setSheetOpenPicker(null);
                setSheetPickerSearch('');
              }} className="text-red-500 text-[20px] font-semibold hover:opacity-80">
                ×
              </button>
            </div>
            <div className="px-6 pt-4 pb-4">
              <div className="relative">
                <input
                  type="text"
                  value={sheetPickerSearch}
                  onChange={(e) => setSheetPickerSearch(e.target.value)}
                  placeholder="Search"
                  className="w-full h-[32px] pl-10 pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" /><path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto mb-4 px-6">
              <div className="shadow-md rounded-lg overflow-hidden">
                {getPickerOptions().length > 0 ? (
                  getPickerOptions().map((opt) => (
                    <button key={opt} type="button" onClick={() => handleSheetPickerSelect(sheetOpenPicker, opt)}
                      className="w-full h-[40px] px-6 flex items-center text-left hover:bg-[#F5F5F5] transition-colors text-[14px] font-medium text-black"
                    >
                      {opt}
                    </button>
                  ))
                ) : (
                  <p className="text-[14px] font-medium text-[#9E9E9E] text-center py-4">
                    {sheetPickerSearch.trim() ? 'No options found' : 'No options available'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DatePickerModal
          isOpen={showDatePicker}
          onClose={() => {
            setShowDatePicker(false);
            setDatePickerField(null);
          }}
          onConfirm={handleDatePickerConfirm}
        />
      )}
    </div>
  );
};

export default ToolsHistory;
