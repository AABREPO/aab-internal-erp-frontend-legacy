import React, { useState, useEffect, useMemo } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';

const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_name';
const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_brand';
const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_id';
const TOOLS_STOCK_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_stock_management';
const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_management';
const TOOLS_MACHINE_NUMBER_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_machine_number';
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
  const [machineNumbersList, setMachineNumbersList] = useState([]);
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
  const [showEditSheetItemNameModal, setShowEditSheetItemNameModal] = useState(false);
  const [showEditSheetItemIdModal, setShowEditSheetItemIdModal] = useState(false);
  const [showEditSheetBrandModal, setShowEditSheetBrandModal] = useState(false);
  const [showEditSheetHomeLocationModal, setShowEditSheetHomeLocationModal] = useState(false);
  const [showEditSheetPurchaseStoreModal, setShowEditSheetPurchaseStoreModal] = useState(false);
  const [showCreateConfirmModal, setShowCreateConfirmModal] = useState(false);
  const [pendingCreateValue, setPendingCreateValue] = useState('');
  const [pendingCreateType, setPendingCreateType] = useState('itemId'); // 'itemName' | 'brand' | 'itemId'
  /** When false, successful create applies to edit bottom sheet fields instead of main filters */
  const [pendingCreateApplyToMain, setPendingCreateApplyToMain] = useState(true);
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
    machineNumberId: null,
    brand: '',
    brandId: null,
    purchaseDate: '',
    warrantyDate: '',
    purchaseStore: '',
    purchaseStoreId: null,
    homeLocation: '',
    homeLocationId: null,
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
            const normalizedType = String(entryType).toLowerCase();
            return normalizedType === 'entry' || normalizedType === 'relocate' || normalizedType === 'relocation';
          });
          setToolsTrackerManagementData(entries);
        }
      } catch (err) {
        console.error('Error fetching stock/tracker:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch machine numbers (to resolve machine_number text -> machine_number_id for stock matching)
  useEffect(() => {
    const fetchMachineNumbers = async () => {
      try {
        const res = await fetch(`${TOOLS_MACHINE_NUMBER_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setMachineNumbersList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching machine numbers:', err);
      }
    };
    fetchMachineNumbers();
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

  // Resolve selected machine number text to machine_number_id (stock management API has machine_number_id, not machine_number text)
  const selectedMachineNumberId = useMemo(() => {
    if (!selectedMachineNumber || machineNumbersList.length === 0) return null;
    const mnTrimmed = selectedMachineNumber.trim();
    const found = machineNumbersList.find(
      m => (m.machine_number || m.machineNumber || '').trim() === mnTrimmed
    );
    return found ? (found.id ?? found._id) : null;
  }, [selectedMachineNumber, machineNumbersList]);

  // Helper to resolve machine_number_id to text (tools_details and stock now use machine_number_id)
  const resolveMachineNumberText = React.useCallback((item) => {
    const mnId = item?.machine_number_id ?? item?.machineNumberId;
    if (mnId && machineNumbersList.length > 0) {
      const rec = machineNumbersList.find(m => String(m?.id ?? m?._id) === String(mnId));
      return rec ? (rec.machine_number ?? rec.machineNumber ?? '').trim() : '';
    }
    return (item?.machine_number ?? item?.machineNumber ?? '').trim();
  }, [machineNumbersList]);
  const resolveMachineNumberFromStatus = React.useCallback((status) => {
    const statusMachineNumberId = status?.machine_number_id ?? status?.machineNumberId;
    if (statusMachineNumberId != null && machineNumbersList.length > 0) {
      const rec = machineNumbersList.find(
        m => String(m?.id ?? m?._id) === String(statusMachineNumberId)
      );
      if (rec) {
        return (rec.machine_number ?? rec.machineNumber ?? '').trim();
      }
    }
    return String(status?.machine_number ?? status?.machineNumber ?? '').trim();
  }, [machineNumbersList]);

  // Machine Number dropdown: one itemId can have multiple machine numbers (current + old), so show all in popup
  const machineNumberOptions = useMemo(() => {
    if (!selectedItemIdDbId || selectedToolsDetails.length === 0) return [];
    const idStr = String(selectedItemIdDbId);
    const collected = new Set();
    selectedToolsDetails.forEach(d => {
      const iid = d?.item_ids_id ?? d?.itemIdsId;
      if (iid != null && String(iid) === idStr) {
        const mn = resolveMachineNumberText(d);
        if (mn) collected.add(mn);
      }
    });
    return Array.from(collected).sort();
  }, [selectedItemIdDbId, selectedToolsDetails, resolveMachineNumberText]);

  // Edit sheet: same option sources as main filters, keyed off editFormData (AddInput-style SelectVendorModal)
  const editSheetItemNameRecord = useMemo(() => {
    if (!showEditSheet) return null;
    if (editFormData.itemNameId) {
      const byId = toolsItemNameListData.find((i) => i != null && String(i.id) === String(editFormData.itemNameId));
      if (byId) return byId;
    }
    const name = (editFormData.itemName || '').trim();
    if (name) {
      return toolsItemNameListData.find((i) => (i?.item_name ?? i?.itemName) === name) || null;
    }
    return null;
  }, [showEditSheet, editFormData.itemName, editFormData.itemNameId, toolsItemNameListData]);

  const editSheetToolsDetails = useMemo(() => {
    const details = editSheetItemNameRecord?.tools_details ?? editSheetItemNameRecord?.toolsDetails;
    return Array.isArray(details) ? details : [];
  }, [editSheetItemNameRecord]);

  const editSheetBrandOptions = useMemo(() => {
    if (!showEditSheet || !editSheetItemNameRecord) return [];
    if (editSheetToolsDetails.length === 0) return brandOptions;
    const brandIds = new Set();
    editSheetToolsDetails.forEach((d) => {
      const bid = d?.brand_id ?? d?.brandId;
      if (bid != null) brandIds.add(String(bid));
    });
    if (brandIds.size === 0) return brandOptions;
    return brandOptions.filter((name) => {
      const b = toolsBrandFullData.find((x) => (x?.tools_brand ?? x?.toolsBrand ?? '').trim() === name);
      return b && brandIds.has(String(b.id));
    });
  }, [showEditSheet, editSheetItemNameRecord, editSheetToolsDetails, brandOptions, toolsBrandFullData]);

  const editSheetItemIdOptions = useMemo(() => {
    if (!showEditSheet) return [];
    const itemNameId =
      editSheetItemNameRecord?.id ??
      editFormData.itemNameId ??
      toolsItemNameListData.find((i) => (i?.item_name ?? i?.itemName) === (editFormData.itemName || '').trim())?.id;
    if (!itemNameId) return [];
    if (editSheetToolsDetails.length > 0) {
      const itemIdsIds = new Set();
      editSheetToolsDetails.forEach((d) => {
        const iid = d?.item_ids_id ?? d?.itemIdsId;
        if (iid != null) itemIdsIds.add(String(iid));
      });
      const filtered = itemIdOptions.filter((name) => {
        const row = toolsItemIdFullData.find((x) => (x?.item_id ?? x?.itemId ?? '').trim() === name);
        return row && itemIdsIds.has(String(row.id));
      });
      if (filtered.length > 0) return filtered;
    }
    return toolsItemIdFullData
      .filter((item) => String(item?.item_name_id ?? item?.itemNameId ?? '') === String(itemNameId))
      .map((item) => (item?.item_id ?? item?.itemId ?? '').trim())
      .filter(Boolean)
      .filter((x, idx, a) => a.indexOf(x) === idx)
      .sort();
  }, [
    showEditSheet,
    editSheetItemNameRecord,
    editSheetToolsDetails,
    editFormData.itemName,
    editFormData.itemNameId,
    itemIdOptions,
    toolsItemIdFullData,
    toolsItemNameListData
  ]);

  // When Item ID is cleared, clear Machine Number
  useEffect(() => {
    if (!selectedItemIdDbId) {
      setSelectedMachineNumber('');
      setMachineStatusHistory([]);
    }
  }, [selectedItemIdDbId]);

  // Fetch log history (status + machine number edits + home location changes) when itemId is selected
  useEffect(() => {
    const formatDateTime = (rawValue) => {
      if (!rawValue) return { date: '', time: '', sortTime: 0 };
      const rawString = String(rawValue || '').trim();
      const ddMmYyyyMatch = rawString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
      if (ddMmYyyyMatch) {
        const day = Number(ddMmYyyyMatch[1]);
        const month = Number(ddMmYyyyMatch[2]) - 1;
        const year = Number(ddMmYyyyMatch[3]);
        const hour = Number(ddMmYyyyMatch[4] || 0);
        const minute = Number(ddMmYyyyMatch[5] || 0);
        const second = Number(ddMmYyyyMatch[6] || 0);
        const parsedDdMm = new Date(year, month, day, hour, minute, second);
        if (!Number.isNaN(parsedDdMm.getTime())) {
          const t = parsedDdMm.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
          return {
            date: parsedDdMm.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            time: t ? t.replace(/\b(am|pm)\b/gi, (m) => m.toUpperCase()) : '',
            sortTime: parsedDdMm.getTime()
          };
        }
      }
      const parsed = new Date(rawValue);
      if (Number.isNaN(parsed.getTime())) return { date: '', time: '', sortTime: 0 };
      const t = parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      return {
        date: parsed.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: t ? t.replace(/\b(am|pm)\b/gi, (m) => m.toUpperCase()) : '',
        sortTime: parsed.getTime()
      };
    };

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

        const statusData = response.ok ? await response.json() : [];
        const statusList = Array.isArray(statusData) ? statusData : [];

        const itemIdString = String(selectedItemIdDbId);
        const machineNumberIds = new Set();

        // Collect all machine number ids related to this selected item id
        stockManagementData.forEach((stock) => {
          const itemId = stock?.item_ids_id ?? stock?.itemIdsId;
          const machineNumberId = stock?.machine_number_id ?? stock?.machineNumberId;
          if (itemId != null && machineNumberId != null && String(itemId) === itemIdString) {
            machineNumberIds.add(String(machineNumberId));
          }
        });

        selectedToolsDetails.forEach((detail) => {
          const itemId = detail?.item_ids_id ?? detail?.itemIdsId;
          const machineNumberId = detail?.machine_number_id ?? detail?.machineNumberId;
          if (itemId != null && machineNumberId != null && String(itemId) === itemIdString) {
            machineNumberIds.add(String(machineNumberId));
          }
        });

        if (selectedMachineNumberId != null) {
          machineNumberIds.add(String(selectedMachineNumberId));
        }

        const historyResults = await Promise.all(
          Array.from(machineNumberIds).map(async (machineNumberId) => {
            try {
              const historyRes = await fetch(
                `${TOOLS_MACHINE_NUMBER_BASE_URL}/history/getByMachineNumberId/${machineNumberId}`,
                {
                  method: 'GET',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
              if (!historyRes.ok) return [];
              const historyData = await historyRes.json();
              return Array.isArray(historyData) ? historyData : [];
            } catch (historyError) {
              console.error(`Error fetching machine edit history for ${machineNumberId}:`, historyError);
              return [];
            }
          })
        );

        const machineNumberHistory = historyResults.flat();
        const resolveLocationById = (locationId) => {
          if (locationId == null || locationId === '') return '';
          const idStr = String(locationId);
          return projectsMap[idStr] || projectsMap[locationId] || vendorsMap[idStr] || vendorsMap[locationId] || idStr;
        };
        const resolveMachineNumberById = (machineNumberId) => {
          if (machineNumberId == null || machineNumberId === '') return '';
          const rec = machineNumbersList.find(
            m => String(m?.id ?? m?._id) === String(machineNumberId)
          );
          return rec ? String(rec.machine_number ?? rec.machineNumber ?? '').trim() : '';
        };

        // Build home-location history from relocate entries for selected itemId
        const homeLocationHistory = [];
        const selectedItemIdStr = String(selectedItemIdDbId);
        const selectedBrandIdStr = selectedBrandId != null && selectedBrandId !== '' ? String(selectedBrandId) : null;
        const selectedMachineNumberTrimmed = String(selectedMachineNumber || '').trim();
        const selectedMachineNumberIdStr = selectedMachineNumberId != null && selectedMachineNumberId !== '' ? String(selectedMachineNumberId) : null;
        for (const entry of toolsTrackerManagementData) {
          const entryType = String(entry?.tools_entry_type || entry?.toolsEntryType || '').toLowerCase();
          if (entryType !== 'relocate' && entryType !== 'relocation') continue;
          const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
          for (const entryItem of entryItems) {
            const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
            const entryBrandId = entryItem.brand_id || entryItem.brandId;
            const entryMachineNumber = String(entryItem.machine_number || entryItem.machineNumber || '').trim();
            const entryMachineNumberId = entryItem.machine_number_id || entryItem.machineNumberId;
            const itemHomeLocationId = entryItem.home_location_id || entryItem.homeLocationId;

            const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === selectedItemIdStr;
            const brandMatch = !selectedBrandIdStr || !entryBrandId || String(entryBrandId) === selectedBrandIdStr;
            const machineMatch = (!selectedMachineNumberTrimmed && !selectedMachineNumberIdStr)
              || (selectedMachineNumberIdStr && entryMachineNumberId != null && String(entryMachineNumberId) === selectedMachineNumberIdStr)
              || (selectedMachineNumberTrimmed && entryMachineNumber && entryMachineNumber === selectedMachineNumberTrimmed)
              || (!entryMachineNumberId && !entryMachineNumber);

            if (itemIdsMatch && brandMatch && machineMatch && itemHomeLocationId) {
              const entryDate = entry.created_date_time || entry.createdDateTime || entry.timestamp || '';
              const { sortTime } = formatDateTime(entryDate);
              const resolvedEntryMachineNumber = entryMachineNumber || resolveMachineNumberById(entryMachineNumberId) || selectedMachineNumberTrimmed || '-';
              homeLocationHistory.push({
                homeLocationId: itemHomeLocationId,
                homeLocationName: resolveLocationById(itemHomeLocationId),
                machineNumber: resolvedEntryMachineNumber,
                date: entryDate,
                sortTime,
                entryId: Number(entry?.id || entry?.entryId || 0)
              });
            }
          }
        }

        homeLocationHistory.sort((a, b) => {
          const aSort = Number(a?.sortTime || 0);
          const bSort = Number(b?.sortTime || 0);
          if (aSort !== bSort) return aSort - bSort;
          return Number(a?.entryId || 0) - Number(b?.entryId || 0);
        });

        const homeLocationChangeLogs = [];
        for (let i = 0; i < homeLocationHistory.length; i++) {
          const current = homeLocationHistory[i];
          const previous = i > 0 ? homeLocationHistory[i - 1] : null;
          const oldHomeLocationName = previous?.homeLocationName || resolveLocationById(previous?.homeLocationId) || '-';
          const newHomeLocationName = current?.homeLocationName || resolveLocationById(current?.homeLocationId) || '-';
          if (previous && String(previous?.homeLocationId || '') === String(current?.homeLocationId || '')) {
            continue;
          }
          const { date, time, sortTime } = formatDateTime(current?.date);
          const fallbackSort = Number(current?.entryId || 0);
          homeLocationChangeLogs.push({
            id: `home-location-change-${i}-${current?.entryId || current?.date || ''}`,
            key: `home-location-change-${i}-${current?.entryId || current?.date || ''}`,
            type: 'home_location_changed',
            status: 'Location Changed',
            machineNumber: current?.machineNumber || selectedMachineNumberTrimmed || '-',
            oldMachineNumber: null,
            oldHomeLocation: oldHomeLocationName,
            newHomeLocation: newHomeLocationName,
            date,
            time,
            sortTime: sortTime || fallbackSort
          });
        }

        const statusLogs = statusList.map((status, index) => {
          const machineNum = resolveMachineNumberFromStatus(status);
          const machineStatus = String(status.machine_status || status.machineStatus || '').trim();
          const logDate =
            status.createdAt ||
            status.created_at ||
            status.createdDate ||
            status.created_date ||
            status.timestamp ||
            status.dateCreated ||
            null;
          const { date, time, sortTime } = formatDateTime(logDate);
          const fallbackSort = Number(status?.id) || 0;

          return {
            id: status?.id ?? `status-${index}`,
            key: `status-${status?.id ?? index}`,
            type: 'status_change',
            status: machineStatus || '-',
            machineNumber: machineNum,
            oldMachineNumber: null,
            date,
            time,
            sortTime: sortTime || fallbackSort
          };
        });

        // Use dedicated history table for machine-number edits
        const machineEditLogs = machineNumberHistory
          .filter((row) => {
            const oldMachine = String(row?.old_machine_number ?? row?.oldMachineNumber ?? '').trim();
            const newMachine = String(row?.new_machine_number ?? row?.newMachineNumber ?? '').trim();
            return oldMachine && newMachine && oldMachine !== newMachine;
          })
          .map((row, index) => {
            const oldMachine = String(row?.old_machine_number ?? row?.oldMachineNumber ?? '').trim();
            const newMachine = String(row?.new_machine_number ?? row?.newMachineNumber ?? '').trim();
            const editedDate = row?.edited_date ?? row?.editedDate ?? row?.timestamp ?? null;
            const { date, time, sortTime } = formatDateTime(editedDate);
            const fallbackSort = Number(row?.id) || 0;

            return {
              id: row?.id ?? `machine-edit-${index}`,
              key: `machine-edit-${row?.id ?? index}`,
              type: 'machine_number_changed',
              status: 'Machine Number Changed',
              machineNumber: newMachine,
              oldMachineNumber: oldMachine,
              date,
              time,
              sortTime: sortTime || fallbackSort
            };
          });

        const combinedLogs = [...homeLocationChangeLogs, ...machineEditLogs, ...statusLogs]
          .sort((a, b) => (b.sortTime || 0) - (a.sortTime || 0));

        setMachineStatusHistory(combinedLogs);
      } catch (error) {
        console.error('Error fetching machine status history:', error);
        setMachineStatusHistory([]);
      } finally {
        setLoadingLog(false);
      }
    };

    fetchMachineStatusHistory();
  }, [
    selectedItemIdDbId,
    selectedMachineNumberId,
    selectedMachineNumber,
    selectedBrandId,
    selectedToolsDetails,
    stockManagementData,
    toolsTrackerManagementData,
    projectsMap,
    vendorsMap,
    resolveMachineNumberFromStatus
  ]);

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

  // --- Location helpers (copied from NetStock.jsx) ---

  // Get the most recent home_location_id for an item from tools_tracker_management,
  // falling back to stock_management when needed.
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

              const sItemIdsMatch = stockItemIdsId && String(stockItemIdsId) === String(itemIdsId);
              const sBrandMatch = !brandId || (stockBrandId && String(stockBrandId) === String(brandId));
              const sMachineMatch = !machineNumber || (stockMachineNumber && String(stockMachineNumber).trim() === machineNumber.trim());

              return sItemIdsMatch && sBrandMatch && sMachineMatch;
            });

            if (stockItem) {
              itemHomeLocationId = stockItem.home_location_id || stockItem.homeLocationId;
            }
          }

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

    if (matchingEntries.length > 0) {
      matchingEntries.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
      return matchingEntries[0].homeLocationId;
    }

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

    return stockHomeLocationId;
  };

  // Get current "To" location from tools_tracker_management, falling back to home location.
  const getCurrentToLocation = (itemIdsId, brandId, machineNumber, homeLocationId) => {
    if (!itemIdsId) return homeLocationId;

    let latestEntry = null;
    let latestDate = null;

    for (const entry of toolsTrackerManagementData) {
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];

      for (const entryItem of entryItems) {
        const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        const entryBrandId = entryItem.brand_id || entryItem.brandId;
        const entryMachineNumber = (entryItem.machine_number || entryItem.machineNumber || '').trim();

        const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === String(itemIdsId);
        const brandMatch = !brandId || (entryBrandId && String(entryBrandId) === String(brandId));
        const machineMatch = !machineNumber || (entryMachineNumber && entryMachineNumber === String(machineNumber).trim());

        if (itemIdsMatch && brandMatch && machineMatch) {
          const entryDate = entry.created_date_time || entry.createdDateTime || entry.timestamp || '';
          if (!latestDate || entryDate > latestDate) {
            latestDate = entryDate;
            latestEntry = { entry, entryItem };
          }
        }
      }
    }

    if (latestEntry) {
      const entryType = String(latestEntry.entry.tools_entry_type || latestEntry.entry.toolsEntryType || '').toLowerCase();

      if (entryType === 'entry') {
        const toProjectId = latestEntry.entry.to_project_id || latestEntry.entry.toProjectId;
        if (toProjectId) return toProjectId;
        const serviceStoreId = latestEntry.entry.service_store_id || latestEntry.entry.serviceStoreId;
        if (serviceStoreId) return serviceStoreId;
      } else if (entryType === 'relocate' || entryType === 'relocation') {
        const itemHomeLocationId = latestEntry.entryItem.home_location_id || latestEntry.entryItem.homeLocationId;
        if (itemHomeLocationId) return itemHomeLocationId;
        const toProjectId = latestEntry.entry.to_project_id || latestEntry.entry.toProjectId;
        if (toProjectId) return toProjectId;
      } else if (entryType === 'service_return') {
        const toProjectId = latestEntry.entry.to_project_id || latestEntry.entry.toProjectId;
        if (toProjectId) return toProjectId;
        const fromProjectId = latestEntry.entry.from_project_id || latestEntry.entry.fromProjectId;
        if (fromProjectId) return fromProjectId;
      } else {
        const serviceStoreId = latestEntry.entry.service_store_id || latestEntry.entry.serviceStoreId;
        if (serviceStoreId) return serviceStoreId;
        const toProjectId = latestEntry.entry.to_project_id || latestEntry.entry.toProjectId;
        if (toProjectId) return toProjectId;
      }
    }

    return homeLocationId;
  };

  const getEntryTypeNormalized = (entry) => {
    return String(entry?.tools_entry_type || entry?.toolsEntryType || '').toLowerCase();
  };
  const isRelocateEntryType = (entryType) => {
    return entryType === 'relocate' || entryType === 'relocation';
  };
  const isMovementEntryType = (entryType) => {
    return entryType === 'entry' || isRelocateEntryType(entryType);
  };
  const getEntrySortTime = (entry) => {
    const rawDate = entry?.created_date_time || entry?.createdDateTime || entry?.timestamp || '';
    const parsed = Date.parse(rawDate);
    if (!Number.isNaN(parsed)) return parsed;
    const numeric = Number(rawDate);
    return Number.isFinite(numeric) ? numeric : 0;
  };
  const machineNumberMatches = (entryMachineNumber, entryMachineNumberId, targetMachineNumber, targetMachineNumberId) => {
    const targetNumber = (targetMachineNumber || '').trim();
    if (!targetNumber && (targetMachineNumberId == null || targetMachineNumberId === '')) return true;

    const entryNumber = (entryMachineNumber || '').trim();
    const entryNumberId = entryMachineNumberId != null ? String(entryMachineNumberId) : '';
    const targetNumberId = targetMachineNumberId != null ? String(targetMachineNumberId) : '';

    if (targetNumberId && entryNumberId && entryNumberId === targetNumberId) return true;
    if (targetNumber && entryNumber && entryNumber === targetNumber) return true;

    return false;
  };
  const getCurrentLocationId = (itemIdsId, brandId, machineNumber, machineNumberId, stockHomeLocationId) => {
    if (!itemIdsId) return stockHomeLocationId;

    let latestMovement = null;
    for (const entry of toolsTrackerManagementData) {
      const entryType = getEntryTypeNormalized(entry);
      if (!isMovementEntryType(entryType)) continue;

      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
      const matchingEntryItem = entryItems.find(entryItem => {
        const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        const entryBrandId = entryItem.brand_id || entryItem.brandId;
        const entryMachineNumber = entryItem.machine_number || entryItem.machineNumber || '';
        const entryMachineNumberId = entryItem.machine_number_id || entryItem.machineNumberId;
        const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === String(itemIdsId);
        const brandMatch = !brandId || (entryBrandId && String(entryBrandId) === String(brandId));
        const machineMatch = machineNumberMatches(entryMachineNumber, entryMachineNumberId, machineNumber, machineNumberId);
        return itemIdsMatch && brandMatch && machineMatch;
      });

      if (!matchingEntryItem) continue;
      const entrySortTime = getEntrySortTime(entry);
      if (!latestMovement || entrySortTime > latestMovement.entrySortTime) {
        latestMovement = { entry, entryType, matchingEntryItem, entrySortTime };
      }
    }

    if (latestMovement) {
      if (isRelocateEntryType(latestMovement.entryType)) {
        const relocatedHomeLocationId = latestMovement.matchingEntryItem?.home_location_id || latestMovement.matchingEntryItem?.homeLocationId;
        if (relocatedHomeLocationId) return relocatedHomeLocationId;
      }

      const toProjectId = latestMovement.entry?.to_project_id || latestMovement.entry?.toProjectId;
      if (toProjectId) return toProjectId;

      const movementHomeLocationId = latestMovement.matchingEntryItem?.home_location_id || latestMovement.matchingEntryItem?.homeLocationId;
      if (movementHomeLocationId) return movementHomeLocationId;
    }

    return stockHomeLocationId;
  };

  // Matching stock management record for details card (from TOOLS_STOCK_MANAGEMENT_BASE_URL/getAll)
  // Stock API returns machine_number_id, not machine_number text - match by machine_number_id when available.
  // If no Machine Number is selected, fall back to the first stock row that matches Item ID (+ Brand),
  // mirroring NetStock.jsx behavior for per-item selection.
  const selectedStockForCard = useMemo(() => {
    if (!selectedItemIdDbId || stockManagementData.length === 0) return null;
    const idStr = String(selectedItemIdDbId);
    const brandStr = selectedBrandId != null ? String(selectedBrandId) : null;
    const mnTrimmed = (selectedMachineNumber || '').trim();
    return stockManagementData.find(stock => {
      const stockItemIdsId = stock.item_ids_id ?? stock.itemIdsId;
      const stockBrandId = stock.brand_name_id ?? stock.brandNameId;
      const stockMachineNumberId = stock.machine_number_id ?? stock.machineNumberId;
      const stockMachineNumber = (stock.machine_number ?? stock.machineNumber ?? '').trim();
      const itemBrandMatch = stockItemIdsId != null && String(stockItemIdsId) === idStr &&
        (!brandStr || (stockBrandId != null && String(stockBrandId) === brandStr));
      if (!itemBrandMatch) return false;
      // If a specific machine is selected, match by machine number / id
      if (mnTrimmed) {
        if (selectedMachineNumberId != null && stockMachineNumberId != null) {
          return String(stockMachineNumberId) === String(selectedMachineNumberId);
        }
        return stockMachineNumber === mnTrimmed;
      }
      // No machine selected: any matching Item ID (+ Brand) is acceptable
      return true;
    }) || null;
  }, [selectedItemIdDbId, selectedBrandId, selectedMachineNumber, selectedMachineNumberId, stockManagementData]);

  // Whether the selected item exists in tools_tracker_management (transfers)
  const isItemInToolsTrackerManagement = useMemo(() => {
    if (!selectedItemIdDbId || !selectedMachineNumber) return false;
    const idStr = String(selectedItemIdDbId);
    for (const entry of toolsTrackerManagementData) {
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
      for (const entryItem of entryItems) {
        const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        const entryBrandId = entryItem.brand_id || entryItem.brandId;
        const entryMachineNumber = (entryItem.machine_number || entryItem.machineNumber || '').trim();
        const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === idStr;
        const brandMatch = !selectedBrandId || (entryBrandId && String(entryBrandId) === String(selectedBrandId));
        const machineMatch = entryMachineNumber && entryMachineNumber === selectedMachineNumber.trim();
        if (itemIdsMatch && brandMatch && machineMatch) return true;
      }
    }
    return false;
  }, [selectedItemIdDbId, selectedBrandId, selectedMachineNumber, toolsTrackerManagementData]);

  // Current location for selected item (output field)
  // Mirrors NetStock.jsx logic: use most recent home location, then latest movement "To" location.
  const currentLocation = useMemo(() => {
    if (!selectedStockForCard) return '';

    const stock = selectedStockForCard;
    const itemIdsId = stock.item_ids_id ?? stock.itemIdsId;
    const brandId = stock.brand_name_id ?? stock.brandNameId ?? stock.brand_id ?? stock.brandId;
    const stockHomeLocationId = stock.home_location_id ?? stock.homeLocationId;
    const machineNumberId = stock.machine_number_id ?? stock.machineNumberId;
    const machineNumberRaw = stock.machine_number ?? stock.machineNumber ?? '';
    const machineNumber = machineNumberId ? resolveMachineNumberText(machineNumberId) : machineNumberRaw;

    if (!itemIdsId) return getLocationName(stockHomeLocationId) || '';

    const actualHomeLocationId = getHomeLocationId(itemIdsId, brandId, machineNumber, stockHomeLocationId);
    const currentLocationId = getCurrentToLocation(itemIdsId, brandId, machineNumber, actualHomeLocationId);

    return getLocationName(currentLocationId || actualHomeLocationId) || '';
  }, [
    selectedStockForCard,
    toolsTrackerManagementData,
    stockManagementData,
    projectsMap,
    vendorsMap
  ]);

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

  const normalizeTextValue = (v) =>
    String(v || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const normalizeItemIdValue = (v) =>
    String(v || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const findItemNameRecordByValue = (value, source = toolsItemNameListData) => {
    const n = normalizeTextValue(value);
    if (!n) return null;
    return (Array.isArray(source) ? source : []).find(
      (item) => normalizeTextValue(item?.item_name ?? item?.itemName) === n
    ) || null;
  };
  const findBrandRecordByValue = (value, source = toolsBrandFullData) => {
    const n = normalizeTextValue(value);
    if (!n) return null;
    return (Array.isArray(source) ? source : []).find(
      (item) => normalizeTextValue(item?.tools_brand ?? item?.toolsBrand) === n
    ) || null;
  };
  const findItemIdRecordByValue = (value, source = toolsItemIdFullData) => {
    const n = normalizeItemIdValue(value);
    if (!n) return null;
    return (Array.isArray(source) ? source : []).find(
      (item) => normalizeItemIdValue(item?.item_id ?? item?.itemId) === n
    ) || null;
  };

  const closeCreateConfirmModal = () => {
    setShowCreateConfirmModal(false);
    setPendingCreateValue('');
    setPendingCreateType('itemId');
    setPendingCreateApplyToMain(true);
  };

  const requestCreateItemNameConfirmation = (raw, applyToMain = true) => {
    const trimmed = String(raw || '').trim().replace(/\s+/g, ' ');
    if (!trimmed) {
      alert('Please enter an Item Name');
      return;
    }
    const existing = findItemNameRecordByValue(trimmed);
    if (existing) {
      const label = existing?.item_name ?? existing?.itemName ?? trimmed;
      if (applyToMain) {
        handleSelectItemName(label, toolsItemNameListData);
      } else {
        setEditFormData((prev) => ({
          ...prev,
          itemName: label,
          itemNameId: existing?.id ?? null
        }));
      }
      alert('This Item Name already exists. Please enter a different one.');
      return;
    }
    setPendingCreateApplyToMain(applyToMain);
    setPendingCreateValue(trimmed);
    setPendingCreateType('itemName');
    setShowCreateConfirmModal(true);
  };

  const requestCreateBrandConfirmation = (raw, applyToMain = true) => {
    const trimmed = String(raw || '').trim().replace(/\s+/g, ' ');
    if (!trimmed) {
      alert('Please enter a Brand');
      return;
    }
    const existing = findBrandRecordByValue(trimmed);
    if (existing) {
      const label = existing?.tools_brand ?? existing?.toolsBrand ?? trimmed;
      if (applyToMain) {
        handleSelectBrand(label, toolsBrandFullData);
      } else {
        setEditFormData((prev) => ({
          ...prev,
          brand: label,
          brandId: existing?.id ?? null
        }));
      }
      alert('This Brand already exists. Please enter a different one.');
      return;
    }
    setPendingCreateApplyToMain(applyToMain);
    setPendingCreateValue(trimmed);
    setPendingCreateType('brand');
    setShowCreateConfirmModal(true);
  };

  const requestCreateItemIdConfirmation = (raw, applyToMain = true) => {
    const trimmed = String(raw || '').trim().replace(/\s+/g, ' ');
    if (!trimmed) {
      alert('Please enter an Item ID');
      return;
    }
    const effectiveItemName = applyToMain ? selectedItemName : (editFormData.itemName || '').trim();
    if (!effectiveItemName) {
      alert('Please select an Item Name before creating an Item ID.');
      return;
    }
    const existing = findItemIdRecordByValue(trimmed);
    if (existing) {
      if (applyToMain) {
        handleSelectItemId(trimmed, toolsItemIdFullData);
      } else {
        setEditFormData((prev) => ({
          ...prev,
          itemId: trimmed,
          itemIdDbId: existing?.id ?? null,
          quantity: '0'
        }));
      }
      alert('This Item ID already exists. Please enter a different one.');
      return;
    }
    setPendingCreateApplyToMain(applyToMain);
    setPendingCreateValue(trimmed);
    setPendingCreateType('itemId');
    setShowCreateConfirmModal(true);
  };

  const handleSelectItemName = (value, nameListOverride = null) => {
    const list = nameListOverride ?? toolsItemNameListData;
    const v = (value || '').trim();
    setSelectedItemName(v);
    const found = list.find(
      i => (i?.item_name ?? i?.itemName ?? '').trim() === v
    );
    setSelectedItemNameId(found ? found.id : null);
    setSelectedBrand('');
    setSelectedBrandId(null);
    setSelectedItemId('');
    setSelectedItemIdDbId(null);
    setSelectedMachineNumber('');
    setShowItemNamePopup(false);
  };

  const handleSelectBrand = (value, brandListOverride = null) => {
    const list = brandListOverride ?? toolsBrandFullData;
    const v = (value || '').trim();
    setSelectedBrand(v);
    const found = list.find(
      b => (b?.tools_brand ?? b?.toolsBrand ?? '').trim() === v
    );
    setSelectedBrandId(found ? found.id : null);
    setShowBrandPopup(false);
  };

  const handleSelectItemId = (value, itemIdFullDataOverride = null) => {
    const fullData = itemIdFullDataOverride ?? toolsItemIdFullData;
    const v = (value || '').trim();
    // When Item ID changes, always clear the previously selected machine number and log history
    setSelectedItemId(v);
    setSelectedMachineNumber('');
    setMachineStatusHistory([]);
    const found = fullData.find(
      i => (i?.item_id ?? i?.itemId ?? '').trim() === v
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
        const machineNum = resolveMachineNumberText(detail);
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
      // Fallback: try stock management - if stock exists for this itemId, auto-fill brand + machine number
      const matchingStocks = stockManagementData.filter(s =>
        String(s?.item_ids_id ?? s?.itemIdsId) === String(itemIdDbId)
      );
      if (matchingStocks.length >= 1) {
        const stock = matchingStocks[0];
        const brandId = stock?.brand_name_id ?? stock?.brandNameId;
        const machineNum = resolveMachineNumberText(stock);
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
    }

    setShowItemIdPopup(false);
  };

  const handleSelectMachineNumber = (value) => {
    setSelectedMachineNumber(value || '');
    setShowMachineNumberPopup(false);
  };

  const handleConfirmCreate = async () => {
    const pendingValue = String(pendingCreateValue || '').trim().replace(/\s+/g, ' ');
    if (!pendingValue) {
      closeCreateConfirmModal();
      return;
    }
    const typeSnapshot = pendingCreateType;
    const applyMainSnapshot = pendingCreateApplyToMain;
    const editItemNameSnapshot = editFormData.itemName;
    const editItemNameIdSnapshot = editFormData.itemNameId;
    setShowCreateConfirmModal(false);
    try {
      if (typeSnapshot === 'itemName') {
        const existingRes = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (existingRes.ok) {
          const existingData = await existingRes.json();
          const existingArray = Array.isArray(existingData) ? existingData : [];
          const existingRecord = findItemNameRecordByValue(pendingValue, existingArray);
          if (existingRecord) {
            setToolsItemNameListData(existingArray);
            const names = existingArray.map((item) => item?.item_name ?? item?.itemName).filter(Boolean);
            setItemNameOptions([...new Set(names)]);
            const existingLabel = existingRecord?.item_name ?? existingRecord?.itemName ?? pendingValue;
            if (applyMainSnapshot) {
              handleSelectItemName(existingLabel, existingArray);
            } else {
              setEditFormData((prev) => ({
                ...prev,
                itemName: existingLabel,
                itemNameId: existingRecord?.id ?? null
              }));
            }
            alert('This Item Name already exists. Please enter a different one.');
            return;
          }
        }
        const payload = { category_id: null, item_name: pendingValue, tools_details: [] };
        const saveRes = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/save`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!saveRes.ok) {
          throw new Error(`Failed to save: ${saveRes.status} ${saveRes.statusText}`);
        }
        const refreshed = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (refreshed.ok) {
          const data = await refreshed.json();
          const dataArray = Array.isArray(data) ? data : [];
          setToolsItemNameListData(dataArray);
          const names = dataArray.map((item) => item?.item_name ?? item?.itemName).filter(Boolean);
          setItemNameOptions([...new Set(names)]);
          const created = findItemNameRecordByValue(pendingValue, dataArray);
          const createdLabel = created?.item_name ?? created?.itemName ?? pendingValue;
          if (applyMainSnapshot) {
            handleSelectItemName(createdLabel, dataArray);
          } else {
            setEditFormData((prev) => ({
              ...prev,
              itemName: createdLabel,
              itemNameId: created?.id ?? null
            }));
          }
        }
      } else if (typeSnapshot === 'brand') {
        const existingRes = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (existingRes.ok) {
          const existingData = await existingRes.json();
          const existingArray = Array.isArray(existingData) ? existingData : [];
          const existingRecord = findBrandRecordByValue(pendingValue, existingArray);
          if (existingRecord) {
            setToolsBrandFullData(existingArray);
            const brandOpts = existingArray
              .map((b) => b?.tools_brand?.trim() ?? b?.toolsBrand?.trim())
              .filter(Boolean);
            setBrandOptions([...new Set(brandOpts)]);
            const existingLabel = existingRecord?.tools_brand ?? existingRecord?.toolsBrand ?? pendingValue;
            if (applyMainSnapshot) {
              handleSelectBrand(existingLabel, existingArray);
            } else {
              setEditFormData((prev) => ({
                ...prev,
                brand: existingLabel,
                brandId: existingRecord?.id ?? null
              }));
            }
            alert('This Brand already exists. Please enter a different one.');
            return;
          }
        }
        const saveRes = await fetch(`${TOOLS_BRAND_BASE_URL}/save`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tools_brand: pendingValue })
        });
        if (!saveRes.ok) {
          throw new Error(`Failed to save: ${saveRes.status} ${saveRes.statusText}`);
        }
        const refreshed = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (refreshed.ok) {
          const data = await refreshed.json();
          const dataArray = Array.isArray(data) ? data : [];
          setToolsBrandFullData(dataArray);
          const brandOpts = dataArray
            .map((b) => b?.tools_brand?.trim() ?? b?.toolsBrand?.trim())
            .filter(Boolean);
          setBrandOptions([...new Set(brandOpts)]);
          const created = findBrandRecordByValue(pendingValue, dataArray);
          const createdLabel = created?.tools_brand ?? created?.toolsBrand ?? pendingValue;
          if (applyMainSnapshot) {
            handleSelectBrand(createdLabel, dataArray);
          } else {
            setEditFormData((prev) => ({
              ...prev,
              brand: createdLabel,
              brandId: created?.id ?? null
            }));
          }
        }
      } else {
        const existingRes = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (existingRes.ok) {
          const existingData = await existingRes.json();
          const existingArray = Array.isArray(existingData) ? existingData : [];
          const existingRecord = findItemIdRecordByValue(pendingValue, existingArray);
          if (existingRecord) {
            setToolsItemIdFullData(existingArray);
            const itemIdOpts = existingArray
              .map((item) => item?.item_id?.trim() ?? item?.itemId?.trim())
              .filter(Boolean);
            setItemIdOptions([...new Set(itemIdOpts)]);
            if (applyMainSnapshot) {
              handleSelectItemId(pendingValue, existingArray);
            } else {
              setEditFormData((prev) => ({
                ...prev,
                itemId: pendingValue,
                itemIdDbId: existingRecord?.id ?? null,
                quantity: '0'
              }));
            }
            alert('This Item ID already exists. Please enter a different one.');
            return;
          }
        }
        const itemNameRecordForSave = applyMainSnapshot
          ? findItemNameRecordByValue(selectedItemName)
          : findItemNameRecordByValue(editItemNameSnapshot) ||
            (editItemNameIdSnapshot != null
              ? toolsItemNameListData.find((i) => i != null && String(i.id) === String(editItemNameIdSnapshot))
              : null);
        const relatedItemNameId = itemNameRecordForSave?.id ?? editItemNameIdSnapshot ?? null;
        const res = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/save`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: pendingValue, item_name_id: relatedItemNameId })
        });
        if (!res.ok) {
          throw new Error(`Failed to save: ${res.status} ${res.statusText}`);
        }
        const refreshed = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (refreshed.ok) {
          const data = await refreshed.json();
          const dataArray = Array.isArray(data) ? data : [];
          setToolsItemIdFullData(dataArray);
          const itemIdOpts = dataArray
            .map((item) => item?.item_id?.trim() ?? item?.itemId?.trim())
            .filter(Boolean);
          setItemIdOptions([...new Set(itemIdOpts)]);
          if (applyMainSnapshot) {
            handleSelectItemId(pendingValue, dataArray);
          } else {
            const createdRow = findItemIdRecordByValue(pendingValue, dataArray);
            setEditFormData((prev) => ({
              ...prev,
              itemId: pendingValue,
              itemIdDbId: createdRow?.id ?? null,
              quantity: '0'
            }));
          }
        }
      }
    } catch (e) {
      console.error('Error creating master data:', e);
      if (typeSnapshot === 'itemName') {
        alert('Failed to save new Item Name. Please try again.');
      } else if (typeSnapshot === 'brand') {
        alert('Failed to save new Brand. Please try again.');
      } else {
        alert('Failed to save new Item ID. Please try again.');
      }
    } finally {
      closeCreateConfirmModal();
    }
  };

  const renderDropdownTrigger = (label, value, placeholder, onClick, disabled = false, onClear = null) => (
    <div className="flex-1">
      <p className="text-[12px] font-medium text-black mb-0.5 leading-normal">{label}</p>
      <div className="relative">
        <div
          onClick={disabled ? undefined : onClick}
          className={`w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[40px] text-[12px] font-medium bg-white flex items-center ${disabled ? 'bg-[#E0E0E0] cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            color: value ? '#000' : '#9E9E9E',
            boxSizing: 'border-box',
            paddingRight: value && onClear ? '40px' : '40px'
          }}
        >
          {value || placeholder}
        </div>
        {!disabled && value && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {!disabled && !value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  // Resolve stock item for edit: use selectedStockForCard if available, else first stock matching selectedItemIdDbId (and optional brand/machine)
  const stockItemForEdit = useMemo(() => {
    if (selectedStockForCard) return selectedStockForCard;
    if (!selectedItemIdDbId || stockManagementData.length === 0) return null;
    const idStr = String(selectedItemIdDbId);
    const brandStr = selectedBrandId != null ? String(selectedBrandId) : null;
    const mnTrimmed = (selectedMachineNumber || '').trim();
    const matching = stockManagementData.filter(stock => {
      const stockItemIdsId = stock.item_ids_id ?? stock.itemIdsId;
      if (!stockItemIdsId || String(stockItemIdsId) !== idStr) return false;
      if (brandStr && (stock.brand_name_id ?? stock.brandNameId) != null && String(stock.brand_name_id ?? stock.brandNameId) !== brandStr) return false;
      if (mnTrimmed) {
        const stockMnId = stock.machine_number_id ?? stock.machineNumberId;
        const stockMn = (stock.machine_number ?? stock.machineNumber ?? '').trim();
        if (selectedMachineNumberId != null && stockMnId != null) return String(stockMnId) === String(selectedMachineNumberId);
        return stockMn === mnTrimmed;
      }
      return true;
    });
    return matching.length > 0 ? matching[0] : null;
  }, [selectedStockForCard, selectedItemIdDbId, selectedBrandId, selectedMachineNumber, selectedMachineNumberId, stockManagementData]);

  // Handle Edit button click - open bottom sheet with pre-populated data
  const handleEditClick = () => {
    if (!selectedItemName || !selectedItemId) {
      alert('Please select Item Name and Item ID');
      return;
    }

    const stockItem = stockItemForEdit;
    const itemNameId = selectedItemNameId || (stockItem && (stockItem.item_name_id || stockItem.itemNameId));
    const itemNameObj = toolsItemNameListData.find(item => String(item?.id) === String(itemNameId));
    const itemName = itemNameObj?.item_name || itemNameObj?.itemName || selectedItemName || '';
    const itemIdsId = selectedItemIdDbId || (stockItem && (stockItem.item_ids_id || stockItem.itemIdsId));
    const itemIdObj = toolsItemIdFullData.find(i => String(i?.id) === String(itemIdsId));
    const itemIdName = itemIdObj?.item_id || itemIdObj?.itemId || selectedItemId || '';

    let brandId = stockItem ? (stockItem.brand_name_id || stockItem.brandNameId) : selectedBrandId;
    let brandName = '';
    if (brandId != null) {
      const brandObj = toolsBrandFullData.find(b => String(b?.id) === String(brandId));
      brandName = brandObj?.tools_brand || brandObj?.toolsBrand || selectedBrand || '';
    } else
      brandName = selectedBrand || '';

    let machineNumberId = stockItem ? (stockItem.machine_number_id || stockItem.machineNumberId) : selectedMachineNumberId;
    let machineNumberText = '';
    if (machineNumberId != null && machineNumbersList.length > 0) {
      const machineNumberRecord = machineNumbersList.find(m => String(m?.id ?? m?._id) === String(machineNumberId));
      machineNumberText = machineNumberRecord ? (machineNumberRecord.machine_number || machineNumberRecord.machineNumber || '').trim() : (stockItem?.machine_number ?? stockItem?.machineNumber ?? selectedMachineNumber ?? '').trim();
    } else
      machineNumberText = (stockItem?.machine_number ?? stockItem?.machineNumber ?? selectedMachineNumber ?? '').trim();

    const purchaseStoreId = stockItem?.purchase_store_id ?? stockItem?.purchaseStoreId;
    const purchaseStoreObj = purchaseStoreFullData.find(s => String(s?.id) === String(purchaseStoreId));
    const purchaseStoreName = purchaseStoreObj?.vendorName || purchaseStoreObj?.vendor_name || '';

    const homeLocationId = stockItem?.home_location_id ?? stockItem?.homeLocationId;
    const homeLocationObj = homeLocationFullData.find(l => String(l?.id) === String(homeLocationId));
    const homeLocationName = homeLocationObj?.siteName || homeLocationObj?.site_name || homeLocationObj?.projectName || homeLocationObj?.project_name || '';

    setEditFormData({
      itemName,
      itemNameId: itemNameId || null,
      quantity: String(stockItem?.quantity ?? '0'),
      itemId: itemIdName,
      itemIdDbId: itemIdsId || null,
      model: stockItem?.model ?? '',
      machineNumber: machineNumberText,
      machineNumberId: machineNumberId || null,
      brand: brandName,
      brandId: brandId || null,
      purchaseDate: stockItem?.purchase_date ?? stockItem?.purchaseDate ?? '',
      warrantyDate: stockItem?.warranty_date ?? stockItem?.warrantyDate ?? '',
      purchaseStore: purchaseStoreName,
      purchaseStoreId: purchaseStoreId || null,
      homeLocation: homeLocationName,
      homeLocationId: homeLocationId || null
    });

    setFileUrl(stockItem?.file_url ?? stockItem?.fileUrl ?? '');
    setSelectedFile(null);
    setShowEditSheet(true);
  };

  const handleCloseEditSheet = () => {
    setShowEditSheet(false);
    setShowEditSheetItemNameModal(false);
    setShowEditSheetItemIdModal(false);
    setShowEditSheetBrandModal(false);
    setShowEditSheetHomeLocationModal(false);
    setShowEditSheetPurchaseStoreModal(false);
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
    const stockToUpdate = stockItemForEdit;
    if (!stockToUpdate) {
      alert('No item selected to update');
      return;
    }

    const stockId = stockToUpdate.id || stockToUpdate._id;
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

      const editedBy = user?.name || user?.username || 'mobile';
      const stockItem = stockToUpdate;

      // Original values for comparison
      const origItemNameId = stockItem.item_name_id || stockItem.itemNameId;
      const origItemNameObj = toolsItemNameListData.find(item => String(item?.id) === String(origItemNameId));
      const origItemName = origItemNameObj?.item_name || origItemNameObj?.itemName || '';
      const origMachineNumber = (stockItem.machine_number || stockItem.machineNumber || '').trim();
      const newMachineNumber = (editFormData.machineNumber || '').trim();

      const normalizedItemName = itemName.toLowerCase().trim();
      const existingItemName = toolsItemNameListData.find(
        item => {
          const existingName = (item?.item_name ?? item?.itemName ?? '').toLowerCase().trim();
          return existingName === normalizedItemName;
        }
      );
      const itemNameId = existingItemName?.id ?? editFormData.itemNameId;

      // Check if only machine number changed (other fields same)
      const onlyMachineNumberChanged = (
        origMachineNumber !== newMachineNumber &&
        (editFormData.itemName || '').trim() === (origItemName || '').trim() &&
        String(editFormData.brandId || '') === String(stockItem.brand_name_id || stockItem.brandNameId || '') &&
        String(editFormData.itemIdDbId || '') === String(stockItem.item_ids_id || stockItem.itemIdsId || '') &&
        (editFormData.model || '').trim() === (stockItem.model || '').trim() &&
        String(editFormData.purchaseStoreId || '') === String(stockItem.purchase_store_id || stockItem.purchaseStoreId || '') &&
        String(editFormData.homeLocationId || '') === String(stockItem.home_location_id || stockItem.homeLocationId || '') &&
        (editFormData.purchaseDate || '') === (stockItem.purchase_date || stockItem.purchaseDate || '') &&
        (editFormData.warrantyDate || '') === (stockItem.warranty_date || stockItem.warrantyDate || '') &&
        String(editFormData.quantity || '0') === String(stockItem.quantity || '0') &&
        (fileUrl || '') === (stockItem.file_url || stockItem.fileUrl || '')
      );

      // If only machine number changed and we have machine_number_id: edit machine number table only
      if (onlyMachineNumberChanged && editFormData.machineNumberId) {
        const machineNumRes = await fetch(
          `${TOOLS_MACHINE_NUMBER_BASE_URL}/edit/${editFormData.machineNumberId}?editedBy=${encodeURIComponent(editedBy)}`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              machine_number: newMachineNumber,
              tool_status: stockItem.tool_status || stockItem.toolStatus || 'Available'
            })
          }
        );
        if (!machineNumRes.ok) {
          throw new Error(`Failed to update machine number: ${machineNumRes.status} ${machineNumRes.statusText}`);
        }
        const refreshRes = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setStockManagementData(Array.isArray(data) ? data : []);
        }
        setSelectedMachineNumber(newMachineNumber);
        alert('Updated successfully!');
        handleCloseEditSheet();
        setIsSaving(false);
        return;
      }

      let machineNumberId = editFormData.machineNumberId ? String(editFormData.machineNumberId) : '';
      if (newMachineNumber) {
        if (editFormData.machineNumberId) {
          // Edit existing machine number row
          const machineNumRes = await fetch(
            `${TOOLS_MACHINE_NUMBER_BASE_URL}/edit/${editFormData.machineNumberId}?editedBy=${encodeURIComponent(editedBy)}`,
            {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                machine_number: newMachineNumber,
                tool_status: stockItem.tool_status || stockItem.toolStatus || 'Available'
              })
            }
          );
          if (!machineNumRes.ok) {
            throw new Error(`Failed to update machine number: ${machineNumRes.status} ${machineNumRes.statusText}`);
          }
          machineNumberId = String(editFormData.machineNumberId);
        } else {
          // Create new machine number and use its id
          const machineNumRes = await fetch(`${TOOLS_MACHINE_NUMBER_BASE_URL}/save`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              machine_number: newMachineNumber,
              tool_status: stockItem.tool_status || stockItem.toolStatus || 'Available'
            })
          });
          if (!machineNumRes.ok) {
            throw new Error(`Failed to save machine number: ${machineNumRes.status} ${machineNumRes.statusText}`);
          }
          const savedMachine = await machineNumRes.json();
          machineNumberId = savedMachine?.id ? String(savedMachine.id) : '';
        }
      }

      const updatePayload = {
        item_name_id: itemNameId ? String(itemNameId) : null,
        brand_name_id: editFormData.brandId ? String(editFormData.brandId) : null,
        item_ids_id: editFormData.itemIdDbId ? String(editFormData.itemIdDbId) : null,
        model: editFormData.model?.trim() || null,
        machine_number_id: machineNumberId || null,
        purchase_store_id: editFormData.purchaseStoreId ? String(editFormData.purchaseStoreId) : null,
        home_location_id: editFormData.homeLocationId ? String(editFormData.homeLocationId) : null,
        purchase_date: editFormData.purchaseDate || null,
        warranty_date: editFormData.warrantyDate || null,
        quantity: editFormData.quantity || '0',
        file_url: fileUrl || null,
        tool_status: stockItem.tool_status || stockItem.toolStatus || 'Available'
      };

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

  const openEditSheetPicker = (field) => {
    if (field === 'itemId' && !(editFormData.itemName || '').trim()) {
      alert('Please select an Item Name first.');
      return;
    }
    if (field === 'itemName') setShowEditSheetItemNameModal(true);
    else if (field === 'itemId') setShowEditSheetItemIdModal(true);
    else if (field === 'brand') setShowEditSheetBrandModal(true);
    else if (field === 'homeLocation') setShowEditSheetHomeLocationModal(true);
    else if (field === 'purchaseStore') setShowEditSheetPurchaseStoreModal(true);
  };

  const renderSheetDropdown = (field, value, placeholder) => (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => openEditSheetPicker(field)}
        className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-[12px] pr-[40px] text-[12px] font-medium bg-white flex items-center cursor-pointer text-left"
        style={{ color: value ? '#000' : '#9E9E9E', boxSizing: 'border-box' }}
      >
        {value || placeholder}
      </button>
      {value && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleEditFieldChange(field, ''); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Top row: Item Name (left) + Edit button (right) when Item tab active, Item Name (left) + Item ID (right) when Log tab active */}
      <div className="sticky top-0 bg-white z-10 flex-shrink-0">
        <div className="">
          <div className="flex justify-between items-center border-b border-gray-200 pb-[8px] gap-[8px]">
            {/* Show Item Name button when Item tab or Log tab is active */}
            {(activeSegment === 'item' || activeSegment === 'log') && (
              <div className="flex items-center gap-[4px] min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowItemNamePopup(true);
                    setShowBrandPopup(false);
                    setShowItemIdPopup(false);
                    setShowMachineNumberPopup(false);
                  }}
                  className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-[0px] border-0 bg-transparent text-left"
                >
                  {selectedItemName ? selectedItemName : 'Item Name'}
                </button>
                {selectedItemName && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemName('');
                      setSelectedItemNameId(null);
                      setSelectedBrand('');
                      setSelectedBrandId(null);
                      setSelectedItemId('');
                      setSelectedItemIdDbId(null);
                      setSelectedMachineNumber('');
                      setMachineStatusHistory([]);
                    }}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3L3 9M3 3L9 9" stroke="#848484" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {/* Show Edit button when Item Name and Item ID are selected (details auto-fill from selected itemId) */}
            {activeSegment === 'item' && selectedItemName && selectedItemId && !isItemInToolsTrackerManagement && (
              <button
                type="button"
                onClick={handleEditClick}
                className="text-[12px] font-medium text-black leading-normal cursor-pointer hover:opacity-80 p-[0px] border-0 bg-transparent text-right flex-shrink-0 flex items-center gap-[4px]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Edit
              </button>
            )}
            {/* Show Item ID button when Log tab is active */}
            {activeSegment === 'log' && (
              <div className="flex items-center gap-[4px] flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowItemIdPopup(true);
                    setShowItemNamePopup(false);
                    setShowBrandPopup(false);
                    setShowMachineNumberPopup(false);
                  }}
                  className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-[0px] border-0 bg-transparent text-right"
                >
                  {selectedItemId || 'Item ID'}
                </button>
                {selectedItemId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId('');
                      setSelectedItemIdDbId(null);
                      setSelectedMachineNumber('');
                      setMachineStatusHistory([]);
                    }}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3L3 9M3 3L9 9" stroke="#848484" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Item / Log segmented control */}
          <div className="flex bg-[#F2F4F7] items-center h-[32px] shadow-sm rounded-md mt-[8px]">
            <button
              type="button" onClick={() => setActiveSegment('item')}
              className={`flex-1 px-[16px] ml-0.5 h-[28px] rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${activeSegment === 'item' ? 'bg-white text-black' : 'bg-gray-100 text-gray-600'
                }`}
            >
              Item
            </button>
            <button
              type="button"
              onClick={() => setActiveSegment('log')}
              className={`flex-1 px-[16px] mr-0.5 h-[28px] rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${activeSegment === 'log' ? 'bg-white text-black' : 'bg-gray-100 text-gray-600'
                }`}
            >
              Log
            </button>
          </div>
        </div>
      </div>

      {/* Item tab: Brand, Item ID, Machine Number, Location dropdowns + details card */}
      {activeSegment === 'item' && (
        <>
          <div className="flex-shrink-0 mt-[8px] pb-[8px] space-y-[6px]">
            <div className="flex gap-[12px]">
              {renderDropdownTrigger('Item ID', selectedItemId, 'Select', () => {
                setShowItemIdPopup(true);
                setShowItemNamePopup(false);
                setShowBrandPopup(false);
                setShowMachineNumberPopup(false);
              }, false, () => {
                setSelectedItemId('');
                setSelectedItemIdDbId(null);
                setSelectedMachineNumber('');
                setMachineStatusHistory([]);
              })}
              {renderDropdownTrigger('Brand', selectedBrand, 'Select', () => {
                setShowBrandPopup(true);
                setShowItemNamePopup(false);
                setShowItemIdPopup(false);
                setShowMachineNumberPopup(false);
              }, false, () => {
                setSelectedBrand('');
                setSelectedBrandId(null);
              })}

            </div>
            <div className="space-y-[6px]">
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
                !selectedItemIdDbId,
                !selectedItemIdDbId ? null : () => {
                  setSelectedMachineNumber('');
                }
              )}
              <div className="relative">
                <p className="text-[12px] font-medium text-black mb-0.5 leading-normal">Location</p>
                <div
                  className="w-full h-[32px] border border-[#EDEDED] rounded pl-[12px] pr-[12px] text-[12px] font-medium bg-[#EDEDED] text-black flex items-center"
                  style={{ boxSizing: 'border-box' }}
                >
                  {currentLocation || '—'}
                </div>
              </div>
            </div>
          </div>
          {/* Details card + image from stock management API */}
          {selectedItemName && selectedBrand && selectedItemId && selectedMachineNumber && selectedStockForCard && (
            <div className="flex-1 pb-[16px] mt-2">
              <div className="rounded-[8px] border border-[rgba(0,0,0,0.16)] p-[12px] bg-white">
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
        <div className="flex-1 pb-[16px] mt-4 min-h-[200px] overflow-y-auto">
          {!selectedItemIdDbId ? (
            <div className="flex items-center justify-center py-[32px]">
              <p className="text-[12px] text-gray-500">Please select an Item ID to view log history</p>
            </div>
          ) : loadingLog ? (
            <div className="flex items-center justify-center py-[32px]">
              <p className="text-[12px] text-gray-500">Loading...</p>
            </div>
          ) : machineStatusHistory.length === 0 ? (
            <div className="flex items-center justify-center py-[32px]">
              <p className="text-[12px] text-gray-500">No log history found for this Item ID</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-lg">
              {/* Table Header */}
              <div className="">
                <div className="grid grid-cols-2 gap-[8px] px-[16px] py-[8px]">
                  <div className="text-[14px] font-semibold text-[#939393]">Date</div>
                  <div className="text-[14px] font-semibold text-[#939393] text-right">Machine Number</div>
                </div>
              </div>
              {/* Table Body */}
              <div>
                {machineStatusHistory.map((logEntry, index) => (
                  <div
                    key={logEntry.key || logEntry.id || index}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <div className="grid grid-cols-2 gap-[8px] px-[16px] py-[12px]">
                      {/* Left column: Event/Status and Date & Time */}
                      <div className="flex flex-col">
                        <p className="text-[12px] font-semibold text-black leading-snug mb-[2px]">
                          {logEntry.status}
                        </p>
                        <p className="text-[10px] text-[#7B7B7B] font-semibold leading-snug">
                          {logEntry.date} • {logEntry.time}
                        </p>
                      </div>
                      {/* Right column: Machine Number */}
                      <div className="text-right">
                        {logEntry.type === 'machine_number_changed' ? (
                          <div className="flex flex-col items-end">
                            <p className="text-[12px] font-semibold text-[black] leading-snug mb-[2px]">
                              {logEntry.oldMachineNumber}
                            </p>
                            <p className="text-[12px] font-semibold text-[#007233] leading-snug">
                              {logEntry.machineNumber}
                            </p>
                          </div>
                        ) : logEntry.type === 'home_location_changed' ? (
                          <div className="flex flex-col items-end">
                            <p className="text-[12px] font-semibold text-[#007233] leading-snug mb-[2px]">
                              {logEntry.machineNumber || '-'}
                            </p>
                            <p className="text-[12px] font-medium text-[#848484] leading-snug">
                              {(logEntry.oldHomeLocation && logEntry.oldHomeLocation !== '-')
                                ? `${logEntry.oldHomeLocation} -> ${logEntry.newHomeLocation || '-'}`
                                : (logEntry.newHomeLocation || '-')}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[12px] font-semibold text-[#007233] leading-snug">
                            {logEntry.machineNumber || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Main content area for Item tab (spacer when no details card) */}
      {activeSegment === 'item' && (
        <div className="flex-1 px-[16px] pb-[16px] mt-4 min-h-[200px]" />
      )}
      {/* Popups — SelectVendorModal with Add New (search + confirm), same pattern as AddInput */}
      <SelectVendorModal
        isOpen={showItemNamePopup}
        onClose={() => setShowItemNamePopup(false)}
        onSelect={handleSelectItemName}
        selectedValue={selectedItemName}
        options={itemNameOptions}
        fieldName="Item Name"
        onAddNew={(v) => {
          setShowItemNamePopup(false);
          requestCreateItemNameConfirmation(v);
        }}
      />
      <SelectVendorModal
        isOpen={showBrandPopup}
        onClose={() => setShowBrandPopup(false)}
        onSelect={handleSelectBrand}
        selectedValue={selectedBrand}
        options={brandOptionsFiltered}
        fieldName="Brand"
        onAddNew={(v) => {
          setShowBrandPopup(false);
          requestCreateBrandConfirmation(v);
        }}
      />
      <SelectVendorModal
        isOpen={showItemIdPopup}
        onClose={() => setShowItemIdPopup(false)}
        onSelect={handleSelectItemId}
        selectedValue={selectedItemId}
        options={itemIdOptionsFiltered}
        fieldName="Item ID"
        onAddNew={(v) => {
          setShowItemIdPopup(false);
          requestCreateItemIdConfirmation(v);
        }}
      />
      <SelectVendorModal
        isOpen={showMachineNumberPopup}
        onClose={() => setShowMachineNumberPopup(false)}
        onSelect={handleSelectMachineNumber}
        selectedValue={selectedMachineNumber}
        options={machineNumberOptions}
        fieldName="Machine Number"
      />
      {showCreateConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[10050] flex items-center justify-center p-[16px]"
          onClick={closeCreateConfirmModal}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[360px] rounded-[16px] p-[20px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[18px] font-semibold text-black leading-none">Confirm Create?</h3>
              <button
                type="button"
                onClick={closeCreateConfirmModal}
                className="text-[#E4572E] text-[20px] leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-[13px] text-[#6D6D6D] leading-relaxed mb-5">
              Do you want to create &quot;{pendingCreateValue}&quot; as a new{' '}
              {pendingCreateType === 'itemName' ? 'item name' : pendingCreateType === 'brand' ? 'brand' : 'item id'}?
            </p>
            <div className="flex gap-[12px]">
              <button
                type="button"
                onClick={closeCreateConfirmModal}
                className="flex-1 h-[44px] border border-black rounded-[8px] text-[14px] font-bold text-black bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreate}
                className="flex-1 h-[44px] bg-black rounded-[8px] text-[14px] font-bold text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Bottom Sheet Modal */}
      {showEditSheet && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-end justify-center"
          style={{ fontFamily: "'Manrope', sans-serif", overflow: 'hidden', overscrollBehavior: 'contain' }}
          onClick={handleCloseEditSheet}
        >
          <div className="bg-white w-full max-h-[70vh] rounded-tl-[16px] rounded-tr-[16px] relative z-[101] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-[24px] pt-[20px] pb-[4px]">
              <p className="text-[16px] font-bold text-black">Add Item</p>
              <button type="button" onClick={handleCloseEditSheet} className="text-[#e06256] text-xl font-bold leading-none">
                ×
              </button>
            </div>
            {/* Form — layout matches AddInput bottom sheet; scroll when content exceeds max height */}
            <div className="flex-1 min-h-0 overflow-y-auto px-[24px] py-[4px]">
              {/* Row 1: Item Name* + Quantity */}
              <div className="flex gap-[12px] mb-2 w-full">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Item Name<span className="text-[#E4572E]">*</span>
                  </p>
                  <div className="w-full min-w-0">
                    {renderSheetDropdown('itemName', editFormData.itemName, 'Select')}
                  </div>
                </div>
                <div className="w-[120px] flex-shrink-0">
                  <p className="text-[12px] font-medium text-black mb-1">Quantity</p>
                  <input
                    type="text"
                    value={editFormData.quantity}
                    onChange={(e) => handleEditFieldChange('quantity', e.target.value)}
                    disabled={!!editFormData.itemId}
                    className={`w-[120px] max-w-[120px] box-border h-[32px] border border-[#d6d6d6] rounded px-[12px] text-[12px] font-medium focus:outline-none text-gray-700 text-left ${!!editFormData.itemId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="0"
                  />
                </div>
              </div>
              {/* Row 2: Item ID + Model* */}
              <div className="flex gap-[12px] mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Item ID</p>
                  <div className={editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '' ? 'opacity-50 pointer-events-none' : ''}>
                    {renderSheetDropdown('itemId', editFormData.itemId, 'Select')}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Model{!(editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '') && <span className="text-[#E4572E]">*</span>}
                  </p>
                  <input
                    type="text"
                    value={editFormData.model}
                    onChange={(e) => handleEditFieldChange('model', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] rounded px-[12px] text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                    placeholder="Enter"
                  />
                </div>
              </div>
              {/* Row 3: Machine Number* + Brand* */}
              <div className="flex gap-[12px] mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Machine Number{!(editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '') && <span className="text-[#E4572E]">*</span>}
                  </p>
                  <input
                    type="text"
                    value={editFormData.machineNumber}
                    onChange={(e) => handleEditFieldChange('machineNumber', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] rounded px-[12px] text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                    placeholder="Enter"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Brand{!(editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '') && <span className="text-[#E4572E]">*</span>}
                  </p>
                  {renderSheetDropdown('brand', editFormData.brand, 'Select')}
                </div>
              </div>
              {/* Home Location */}
              <div className="flex gap-[12px] mb-2">
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
              <div className="flex gap-[12px] mb-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-medium text-black">
                      Purchase Store{!(editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '') && <span className="text-[#E4572E]">*</span>}
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
              <div className="flex gap-[12px] mb-2 w-full">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Purchase Date{!(editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '') && <span className="text-[#E4572E]">*</span>}
                  </p>
                  <div className="relative w-full min-w-0">
                    <input
                      type="text"
                      readOnly
                      value={formatDateForDisplay(editFormData.purchaseDate) || ''}
                      onClick={() => handleDatePickerOpen('purchaseDate')}
                      onFocus={() => handleDatePickerOpen('purchaseDate')}
                      placeholder="dd-mm-yyyy"
                      className="w-full h-[32px] border border-[#d6d6d6] rounded pl-[12px] pr-[40px] text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500 cursor-pointer box-border"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11 1V4M5 1V4M2 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Warranty Date{!(editFormData.quantity && editFormData.quantity !== '0' && editFormData.quantity.trim() !== '') && <span className="text-[#E4572E]">*</span>}
                  </p>
                  <div className="relative w-full min-w-0">
                    <input
                      type="text"
                      readOnly
                      value={formatDateForDisplay(editFormData.warrantyDate) || ''}
                      onClick={() => handleDatePickerOpen('warrantyDate')}
                      onFocus={() => handleDatePickerOpen('warrantyDate')}
                      placeholder="dd-mm-yyyy"
                      className="w-full h-[32px] border border-[#d6d6d6] rounded pl-[12px] pr-[40px] text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500 cursor-pointer box-border"
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
              {/* Attach File */}
              <div className="mb-2">
                <div className="flex items-center gap-[8px] flex-wrap">
                  <label htmlFor="edit-sheet-attach-file" className={`flex items-center gap-[4px] cursor-pointer text-[12px] font-medium text-[#E4572E] ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                    {isUploading ? 'Uploading...' : 'Attach File'}
                  </label>
                  {selectedFile && (
                    <div className="flex items-center gap-[4px] bg-gray-100 px-[8px] py-[4px] rounded-md max-w-[200px]">
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
            <div className="flex-shrink-0 flex gap-[16px] px-[24px] pb-[24px] pt-[8px]">
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
      {/* Edit sheet pickers — same SelectVendorModal UX as AddInput (stars, two-line labels, Add New) */}
      {showEditSheet && (
        <>
          <SelectVendorModal
            isOpen={showEditSheetItemNameModal}
            onClose={() => setShowEditSheetItemNameModal(false)}
            onSelect={(v) => handleEditFieldChange('itemName', v)}
            selectedValue={editFormData.itemName}
            options={itemNameOptions}
            fieldName="Item Name"
            onAddNew={(v) => {
              setShowEditSheetItemNameModal(false);
              requestCreateItemNameConfirmation(v, false);
            }}
          />
          <SelectVendorModal
            isOpen={showEditSheetItemIdModal}
            onClose={() => setShowEditSheetItemIdModal(false)}
            onSelect={(v) => handleEditFieldChange('itemId', v)}
            selectedValue={editFormData.itemId}
            options={editSheetItemIdOptions}
            fieldName="Item ID"
            onAddNew={(v) => {
              setShowEditSheetItemIdModal(false);
              requestCreateItemIdConfirmation(v, false);
            }}
          />
          <SelectVendorModal
            isOpen={showEditSheetBrandModal}
            onClose={() => setShowEditSheetBrandModal(false)}
            onSelect={(v) => handleEditFieldChange('brand', v)}
            selectedValue={editFormData.brand}
            options={editSheetBrandOptions}
            fieldName="Brand"
            onAddNew={(v) => {
              setShowEditSheetBrandModal(false);
              requestCreateBrandConfirmation(v, false);
            }}
          />
          <SelectVendorModal
            isOpen={showEditSheetHomeLocationModal}
            onClose={() => setShowEditSheetHomeLocationModal(false)}
            onSelect={(v) => handleEditFieldChange('homeLocation', v)}
            selectedValue={editFormData.homeLocation}
            options={homeLocationOptions}
            fieldName="Home Location"
          />
          <SelectVendorModal
            isOpen={showEditSheetPurchaseStoreModal}
            onClose={() => setShowEditSheetPurchaseStoreModal(false)}
            onSelect={(v) => handleEditFieldChange('purchaseStore', v)}
            selectedValue={editFormData.purchaseStore}
            options={purchaseStoreOptions}
            fieldName="Purchase Store"
          />
        </>
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