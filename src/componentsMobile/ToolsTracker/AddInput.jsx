import React, { useState, useEffect } from 'react';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';
import SelectLocatorsModal from '../Inventory/SelectLocatorsModal';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import Close from '../Images/close.png';

const AddInput = ({ user }) => {
  const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_name';
  const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_brand';
  const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_id';
  const TOOLS_STOCK_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_stock_management';
  const TOOLS_MACHINE_NUMBER_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_machine_number';
  const TOOLS_MACHINE_STATUS_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools-machine-status';
  const GOOGLE_UPLOAD_URL = 'https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive';
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [itemIdOptions, setItemIdOptions] = useState([]);
  const [apiItemIdOptions, setApiItemIdOptions] = useState([]); // Item IDs from /api/tools_item_id
  const [showAddNewSheet, setShowAddNewSheet] = useState(false);
  const [vendorNameOptions, setVendorNameOptions] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [showVendorsModal, setShowVendorsModal] = useState(false);
  const [allVendorData, setAllVendorData] = useState([]); // Store full vendor data including makeAsServiceShop
  const [vendorOptions, setVendorOptions] = useState([]); // Store vendor options with IDs and makeAsServiceShop
  const [previousSelectedVendors, setPreviousSelectedVendors] = useState([]);
  const [toolsItemNameListData, setToolsItemNameListData] = useState([]); // raw /api/tools_item_name/getAll
  const [currentToolsItemNameList, setCurrentToolsItemNameList] = useState(null); // selected itemName object from API
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Store full data objects with IDs
  const [toolsBrandFullData, setToolsBrandFullData] = useState([]); // Full brand objects with id and tools_brand
  const [toolsItemIdFullData, setToolsItemIdFullData] = useState([]); // Full item ID objects with id and item_id
  const [purchaseStoreFullData, setPurchaseStoreFullData] = useState([]); // Full vendor objects with id and vendorName
  const [homeLocationFullData, setHomeLocationFullData] = useState([]); // Full project objects with id, siteName, and branch
  const [stockManagementData, setStockManagementData] = useState([]); // For checking item_ids_id usage
  const [machineStatusData, setMachineStatusData] = useState([]); // Machine status data from new API
  const [machineNumbersList, setMachineNumbersList] = useState([]); // For resolving machine_number_id to text
  const [addSheetForm, setAddSheetForm] = useState({
    itemName: '',
    itemNameId: null, // Store the ID
    quantity: '',
    itemId: '',
    itemIdDbId: null, // Store the database ID of item_id
    model: '',
    machineNumber: '',
    brand: '',
    brandId: null, // Store the ID
    purchaseDate: '',
    warrantyDate: '',
    contact: '',
    purchaseStore: '',
    purchaseStoreId: null, // Store the ID
    homeLocation: '',
    homeLocationId: null, // Store the ID
    shopAddress: ''
  });
  const [purchaseStoreOptions, setPurchaseStoreOptions] = useState([]); // Vendors with makeAsServiceShop === true
  const [homeLocationOptions, setHomeLocationOptions] = useState([]); // Project names from project_Names API
  const [showNewItemIdInput, setShowNewItemIdInput] = useState(false);
  const [newItemIdValue, setNewItemIdValue] = useState('');
  const [showCreateItemIdConfirmModal, setShowCreateItemIdConfirmModal] = useState(false);
  const [pendingItemIdToCreate, setPendingItemIdToCreate] = useState('');
  const [pendingItemIdContext, setPendingItemIdContext] = useState('sheet');
  const [pendingCreateType, setPendingCreateType] = useState('itemId');
  const [showNewItemNameInput, setShowNewItemNameInput] = useState(false);
  const [newItemNameValue, setNewItemNameValue] = useState('');
  const [showNewBrandInput, setShowNewBrandInput] = useState(false);
  const [newBrandValue, setNewBrandValue] = useState('');
  const getStatusSortScore = React.useCallback((status) => {
    const rawTimestamp = status?.timestamp;
    const parsedTime = rawTimestamp ? new Date(rawTimestamp).getTime() : NaN;
    const timeScore = Number.isFinite(parsedTime) ? parsedTime : 0;
    const idScore = Number(status?.id || 0);
    // Keep id as tie-breaker when timestamp is same/missing.
    return (timeScore * 1000000) + idScore;
  }, []);
  const machineNumberTextById = React.useMemo(() => {
    const map = {};
    machineNumbersList.forEach((m) => {
      const id = m?.id ?? m?._id;
      const machineText = (m?.machine_number ?? m?.machineNumber ?? '').trim();
      if (id != null && machineText) {
        map[String(id)] = machineText;
      }
    });
    return map;
  }, [machineNumbersList]);

  // Helper to get latest machine status for an itemIdsId + machineNumber combination
  const getLatestMachineStatus = React.useMemo(() => {
    const statusMap = new Map();
    // Group machine statuses by itemIdsId + machineNumber and get latest for each
    machineStatusData.forEach(status => {
      const itemIdsId = String(status.item_ids_id || status.itemIdsId || '');
      const machineNumId = status.machine_number_id || status.machineNumberId;
      const machineNum = String(
        (machineNumId != null ? machineNumberTextById[String(machineNumId)] : null) ||
        status.machine_number ||
        status.machineNumber ||
        ''
      ).trim();
      const key = `${itemIdsId}_${machineNum}`;
      if (itemIdsId && machineNum) {
        const existing = statusMap.get(key);
        if (!existing || getStatusSortScore(status) > getStatusSortScore(existing)) {
          statusMap.set(key, status);
        }
      }
    });
    return statusMap;
  }, [machineStatusData, machineNumberTextById, getStatusSortScore]);

  const resolveMachineNumFromStock = React.useCallback((item) => {
    const mnId = item?.machine_number_id ?? item?.machineNumberId;
    if (mnId && machineNumbersList.length > 0) {
      const rec = machineNumbersList.find(m => String(m?.id ?? m?._id) === String(mnId));
      return rec ? (rec.machine_number ?? rec.machineNumber ?? '').trim() : '';
    }
    return (item?.machine_number ?? item?.machineNumber ?? '').trim();
  }, [machineNumbersList]);

  const getLatestStatusForItemMachine = React.useCallback((itemIdsId, machineNumberId, machineNumberText) => {
    const itemIdStr = String(itemIdsId || '');
    if (!itemIdStr) return null;

    // First preference: exact match by machine_number_id.
    if (machineNumberId != null && machineNumberId !== '') {
      const byMachineId = machineStatusData
        .filter((status) =>
          String(status?.item_ids_id ?? status?.itemIdsId ?? '') === itemIdStr &&
          String(status?.machine_number_id ?? status?.machineNumberId ?? '') === String(machineNumberId)
        )
        .sort((a, b) => getStatusSortScore(b) - getStatusSortScore(a));
      if (byMachineId.length > 0) return byMachineId[0];
    }

    // Fallback: match by resolved machine number text.
    if (machineNumberText) {
      return getLatestMachineStatus.get(`${itemIdStr}_${String(machineNumberText)}`) || null;
    }
    return null;
  }, [machineStatusData, getLatestMachineStatus, getStatusSortScore]);

  const shouldShowItemIdInSheet = React.useCallback((itemIdDbId) => {
    const itemIdStr = String(itemIdDbId || '');
    if (!itemIdStr) return false;

    const linkedRows = (stockManagementData || []).filter((item) =>
      String(item?.item_ids_id ?? item?.itemIdsId ?? '') === itemIdStr
    );

    // Show Item ID if no machine number ID is linked with this Item ID.
    const rowsWithMachineId = linkedRows.filter((item) => {
      const machineNumberId = item?.machine_number_id ?? item?.machineNumberId;
      return machineNumberId !== null && machineNumberId !== undefined && String(machineNumberId).trim() !== '';
    });

    if (rowsWithMachineId.length === 0) {
      return true;
    }

    // If linked, show only when linked machine status is Machine Dead.
    return rowsWithMachineId.some((item) => {
      const machineNumberId = item?.machine_number_id ?? item?.machineNumberId;
      const machineNumberText = resolveMachineNumFromStock(item);
      const latestStatus = getLatestStatusForItemMachine(itemIdStr, machineNumberId, machineNumberText);
      const statusText = String(
        latestStatus?.machine_status ??
        latestStatus?.machineStatus ??
        item?.tool_status ??
        item?.toolStatus ??
        ''
      ).trim().toLowerCase();
      return statusText === 'machine dead';
    });
  }, [stockManagementData, resolveMachineNumFromStock, getLatestStatusForItemMachine]);

  const sheetItemIdOptions = React.useMemo(() => {
    return apiItemIdOptions.filter(itemIdName => {
      const itemIdObj = toolsItemIdFullData.find(
        item => (item?.item_id?.trim() ?? item?.itemId?.trim()) === itemIdName
      );
      const dbId = itemIdObj?.id;
      if (!dbId) {
        return false;
      }
      return shouldShowItemIdInSheet(dbId);
    });
  }, [apiItemIdOptions, toolsItemIdFullData, shouldShowItemIdInSheet]);
  const [tableData, setTableData] = useState([]);
  const normalizeTextValue = (value) =>
    String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();

  const normalizeItemIdValue = (value) =>
    String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();

  const findItemIdRecordByValue = (value, source = toolsItemIdFullData) => {
    const normalized = normalizeItemIdValue(value);
    if (!normalized) return null;
    return (Array.isArray(source) ? source : []).find(
      (item) => normalizeItemIdValue(item?.item_id ?? item?.itemId) === normalized
    ) || null;
  };

  const findItemNameRecordByValue = (value, source = toolsItemNameListData) => {
    const normalized = normalizeTextValue(value);
    if (!normalized) return null;
    return (Array.isArray(source) ? source : []).find(
      (item) => normalizeTextValue(item?.item_name ?? item?.itemName) === normalized
    ) || null;
  };

  const findBrandRecordByValue = (value, source = toolsBrandFullData) => {
    const normalized = normalizeTextValue(value);
    if (!normalized) return null;
    return (Array.isArray(source) ? source : []).find(
      (item) => normalizeTextValue(item?.tools_brand ?? item?.toolsBrand) === normalized
    ) || null;
  };

  const closeCreateConfirmModal = () => {
    setShowCreateItemIdConfirmModal(false);
    setPendingItemIdToCreate('');
    setPendingItemIdContext('sheet');
    setPendingCreateType('itemId');
  };

  const applyItemIdSelectionByContext = (itemIdValue, context, itemRecord = null) => {
    const normalizedDisplayValue = String(itemIdValue || '').trim().replace(/\s+/g, ' ');
    const resolvedValue =
      ((itemRecord?.item_id ?? itemRecord?.itemId ?? normalizedDisplayValue) || '').trim();
    const resolvedDbId = itemRecord?.id ?? null;

    if (context === 'main') {
      setSelectedItemId(resolvedValue);
      return;
    }

    setAddSheetForm((prev) => ({
      ...prev,
      itemId: resolvedValue,
      itemIdDbId: resolvedDbId
    }));
  };

  const requestCreateItemIdConfirmation = (rawItemId, context = 'sheet') => {
    const trimmedItemId = String(rawItemId || '').trim().replace(/\s+/g, ' ');
    if (!trimmedItemId) {
      alert('Please enter an Item ID');
      return;
    }

    const existing = findItemIdRecordByValue(trimmedItemId);
    if (existing) {
      applyItemIdSelectionByContext(trimmedItemId, context, existing);
      alert('This Item ID already exists. Please enter a different one.');
      return;
    }

    setPendingItemIdToCreate(trimmedItemId);
    setPendingItemIdContext(context);
    setPendingCreateType('itemId');
    setShowCreateItemIdConfirmModal(true);
  };

  const requestCreateItemNameConfirmation = (rawItemName, context = 'sheet') => {
    const trimmedItemName = String(rawItemName || '').trim().replace(/\s+/g, ' ');
    if (!trimmedItemName) {
      alert('Please enter an Item Name');
      return;
    }

    const existing = findItemNameRecordByValue(trimmedItemName);
    if (existing) {
      const existingLabel = existing?.item_name ?? existing?.itemName ?? trimmedItemName;
      if (context === 'main') {
        setSelectedItemName(existingLabel);
      } else {
        setAddSheetForm((prev) => ({
          ...prev,
          itemName: existingLabel,
          itemNameId: existing?.id ?? null
        }));
      }
      alert('This Item Name already exists. Please enter a different one.');
      return;
    }

    setPendingItemIdToCreate(trimmedItemName);
    setPendingItemIdContext(context);
    setPendingCreateType('itemName');
    setShowCreateItemIdConfirmModal(true);
  };

  const requestCreateBrandConfirmation = (rawBrand, context = 'sheet') => {
    const trimmedBrand = String(rawBrand || '').trim().replace(/\s+/g, ' ');
    if (!trimmedBrand) {
      alert('Please enter a Brand');
      return;
    }

    const existing = findBrandRecordByValue(trimmedBrand);
    if (existing) {
      const existingLabel = existing?.tools_brand ?? existing?.toolsBrand ?? trimmedBrand;
      if (context === 'main') {
        setSelectedBrand(existingLabel);
      } else {
        setAddSheetForm((prev) => ({
          ...prev,
          brand: existingLabel,
          brandId: existing?.id ?? null
        }));
      }
      alert('This Brand already exists. Please enter a different one.');
      return;
    }

    setPendingItemIdToCreate(trimmedBrand);
    setPendingItemIdContext(context);
    setPendingCreateType('brand');
    setShowCreateItemIdConfirmModal(true);
  };

  const handleConfirmCreateItemId = async () => {
    const pendingValue = String(pendingItemIdToCreate || '').trim().replace(/\s+/g, ' ');
    if (!pendingValue) {
      closeCreateConfirmModal();
      return;
    }

    setShowCreateItemIdConfirmModal(false);
    try {
      if (pendingCreateType === 'itemName') {
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
            const names = existingArray
              .map(item => item?.item_name ?? item?.itemName)
              .filter(Boolean);
            setItemNameOptions(Array.from(new Set(names)));
            const existingLabel = existingRecord?.item_name ?? existingRecord?.itemName ?? pendingValue;
            if (pendingItemIdContext === 'main') {
              setSelectedItemName(existingLabel);
            } else {
              setAddSheetForm(prev => ({ ...prev, itemName: existingLabel, itemNameId: existingRecord?.id ?? null }));
            }
            alert('This Item Name already exists. Please enter a different one.');
            return;
          }
        }

        const payload = { category_id: selectedCategory ?? null, item_name: pendingValue, tools_details: [] };
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
          const names = dataArray
            .map(item => item?.item_name ?? item?.itemName)
            .filter(Boolean);
          setItemNameOptions(Array.from(new Set(names)));
          const created = findItemNameRecordByValue(pendingValue, dataArray);
          const createdLabel = created?.item_name ?? created?.itemName ?? pendingValue;
          if (pendingItemIdContext === 'main') {
            setSelectedItemName(createdLabel);
          } else {
            setAddSheetForm(prev => ({ ...prev, itemName: createdLabel, itemNameId: created?.id ?? null }));
            closeSheetPicker();
          }
        }
      } else if (pendingCreateType === 'brand') {
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
              .map(b => b?.tools_brand?.trim() ?? b?.toolsBrand?.trim())
              .filter(Boolean);
            setBrandOptions(Array.from(new Set(brandOpts)));
            const existingLabel = existingRecord?.tools_brand ?? existingRecord?.toolsBrand ?? pendingValue;
            if (pendingItemIdContext === 'main') {
              setSelectedBrand(existingLabel);
            } else {
              setAddSheetForm(prev => ({ ...prev, brand: existingLabel, brandId: existingRecord?.id ?? null }));
            }
            alert('This Brand already exists. Please enter a different one.');
            return;
          }
        }

        const payload = { tools_brand: pendingValue };
        const saveRes = await fetch(`${TOOLS_BRAND_BASE_URL}/save`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
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
            .map(b => b?.tools_brand?.trim() ?? b?.toolsBrand?.trim())
            .filter(Boolean);
          setBrandOptions(Array.from(new Set(brandOpts)));
          const created = findBrandRecordByValue(pendingValue, dataArray);
          const createdLabel = created?.tools_brand ?? created?.toolsBrand ?? pendingValue;
          if (pendingItemIdContext === 'main') {
            setSelectedBrand(createdLabel);
          } else {
            setAddSheetForm(prev => ({ ...prev, brand: createdLabel, brandId: created?.id ?? null }));
            closeSheetPicker();
          }
        }
      } else {
        // Re-check with latest server state to prevent duplicate creation on stale client data.
        const existingRes = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (existingRes.ok) {
          const existingData = await existingRes.json();
          const existingDataArray = Array.isArray(existingData) ? existingData : [];
          const existingRecord = findItemIdRecordByValue(pendingValue, existingDataArray);
          if (existingRecord) {
            setToolsItemIdFullData(existingDataArray);
            const itemIdOpts = existingDataArray
              .map(item => item?.item_id?.trim() ?? item?.itemId?.trim())
              .filter(item => item);
            setApiItemIdOptions(itemIdOpts);
            applyItemIdSelectionByContext(pendingValue, pendingItemIdContext, existingRecord);
            alert('This Item ID already exists. Please enter a different one.');
            return;
          }
        }

        const payload = { item_id: pendingValue };
        const res = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/save`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
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
            .map(item => item?.item_id?.trim() ?? item?.itemId?.trim())
            .filter(item => item);
          setApiItemIdOptions(itemIdOpts);

          const newItemIdObj = findItemIdRecordByValue(pendingValue, dataArray);
          applyItemIdSelectionByContext(pendingValue, pendingItemIdContext, newItemIdObj);
        }
      }

      setNewItemIdValue('');
      setShowNewItemIdInput(false);
      setNewItemNameValue('');
      setShowNewItemNameInput(false);
      setNewBrandValue('');
      setShowNewBrandInput(false);
      if (pendingItemIdContext === 'sheet' && pendingCreateType === 'itemId') {
        closeSheetPicker();
      }
    } catch (e) {
      console.error('Error creating new master data:', e);
      if (pendingCreateType === 'itemName') {
        alert('Failed to save new Item Name. Please try again.');
      } else if (pendingCreateType === 'brand') {
        alert('Failed to save new Brand. Please try again.');
      } else {
        alert('Failed to save new Item ID. Please try again.');
      }
    } finally {
      closeCreateConfirmModal();
    }
  };
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
          setToolsItemNameListData(Array.isArray(data) ? data : []);
          const itemNameOpts = (Array.isArray(data) ? data : [])
            .map(item => item?.item_name ?? item?.itemName)
            .filter(Boolean);
          setItemNameOptions(Array.from(new Set(itemNameOpts)));
        }
      } catch (error) {
        console.error('Error fetching item names:', error);
      }
    };
    fetchItemNames();
  }, []);
  useEffect(() => {
    if (!selectedItemName) {
      setCurrentToolsItemNameList(null);
      setTableData([]);
      setItemIdOptions([]);
      return;
    }
    const found = toolsItemNameListData.find(
      (x) => (x?.item_name ?? x?.itemName) === selectedItemName
    );
    setCurrentToolsItemNameList(found || null);
    const details = Array.isArray(found?.tools_details)
      ? found.tools_details
      : Array.isArray(found?.toolsDetails)
        ? found.toolsDetails
        : [];
    const mappedTable = details.map((d, idx) => ({
      id: d?.id ?? idx + 1,
      itemId: d?.item_ids_id ?? d?.itemIdsId ?? '',
      brand: d?.brand_id ?? d?.brandId ?? '',
      model: d?.model ?? '',
      machine: resolveMachineNumFromStock(d)
    }));
    setTableData(mappedTable);
    const idsFromDetails = details
      .map(d => d?.item_ids_id ?? d?.itemIdsId)
      .filter(Boolean);
    const detailItemIdOptions = idsFromDetails
      .map((itemIdDbId) => {
        const match = toolsItemIdFullData.find(
          (item) => String(item?.id) === String(itemIdDbId)
        );
        return (match?.item_id ?? match?.itemId ?? '').trim();
      })
      .filter(Boolean);
    if (detailItemIdOptions.length > 0) {
      const detailSet = new Set(detailItemIdOptions.map((x) => x.toLowerCase()));
      setItemIdOptions(apiItemIdOptions.filter((x) => detailSet.has(String(x).toLowerCase())));
    } else {
      setItemIdOptions(apiItemIdOptions);
    }
  }, [selectedItemName, toolsItemNameListData, apiItemIdOptions, machineNumbersList, resolveMachineNumFromStock, toolsItemIdFullData]);
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
          setToolsBrandFullData(Array.isArray(data) ? data : []);
          const brandOpts = (Array.isArray(data) ? data : [])
            .map(b => b?.tools_brand?.trim() ?? b?.toolsBrand?.trim())
            .filter(b => b);
          setBrandOptions(Array.from(new Set(brandOpts)));
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);
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
          setToolsItemIdFullData(Array.isArray(data) ? data : []);
          const itemIdOpts = (Array.isArray(data) ? data : [])
            .map(item => item?.item_id?.trim() ?? item?.itemId?.trim())
            .filter(item => item)
            .filter(item => !/^\d+$/.test(item));
          setApiItemIdOptions(itemIdOpts);
        }
      } catch (error) {
        console.error('Error fetching item IDs:', error);
      }
    };
    fetchItemIds();
  }, []);
  useEffect(() => {
    const fetchStockManagement = async () => {
      try {
        const response = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setStockManagementData(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching stock management data:', error);
      }
    };
    fetchStockManagement();
  }, []);
  // Fetch machine numbers (to resolve machine_number_id for display)
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
  // Fetch machine status data from the new API
  useEffect(() => {
    const fetchMachineStatus = async () => {
      try {
        const response = await fetch(`${TOOLS_MACHINE_STATUS_BASE_URL}/all`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          const normalizedStatusData = (Array.isArray(data) ? data : []).map((status) => ({
            ...status,
            // Explicitly normalize to ToolsMachineNumberStatusDetails columns.
            timestamp: status?.timestamp ?? null,
            created_by: status?.created_by ?? status?.createdBy ?? null,
            item_ids_id: status?.item_ids_id ?? status?.itemIdsId ?? null,
            machine_number_id: status?.machine_number_id ?? status?.machineNumberId ?? null,
            machine_status: status?.machine_status ?? status?.machineStatus ?? ''
          }));
          setMachineStatusData(normalizedStatusData);
        }
      } catch (error) {
        console.error('Error fetching machine status data:', error);
      }
    };
    fetchMachineStatus();
  }, []);
  useEffect(() => {
    if (!selectedItemName) {
      setItemIdOptions(apiItemIdOptions);
    }
  }, [selectedItemName, selectedBrand, apiItemIdOptions]);
  useEffect(() => {
    fetchVendorNames();
  }, []);
  useEffect(() => {
    const fetchServiceStoreVendors = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll', {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (response.ok) {
          const data = await response.json();
          const serviceStoreVendorsData = data.filter(vendor => vendor.makeAsServiceShop === true);
          setPurchaseStoreFullData(serviceStoreVendorsData);
          const serviceStoreVendorNames = serviceStoreVendorsData
            .map(vendor => vendor.vendorName)
            .filter(Boolean);
          setPurchaseStoreOptions(serviceStoreVendorNames);
        } else {
          console.log('Error fetching service store vendors.');
        }
      } catch (error) {
        console.error('Error fetching service store vendors:', error);
      }
    };
    fetchServiceStoreVendors();
  }, []);
  useEffect(() => {
    const fetchHomeLocations = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (response.ok) {
          const data = await response.json();
          setHomeLocationFullData(data);
          const homeLocationNames = data
            .map(item => item.siteName)
            .filter(Boolean);
          setHomeLocationOptions(homeLocationNames);
        } else {
          console.log('Error fetching home locations.');
        }
      } catch (error) {
        console.error('Error fetching home locations:', error);
      }
    };
    fetchHomeLocations();
  }, []);
  const fetchVendorNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll', {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllVendorData(data);
        const formattedData = data.map(item => ({
          value: item.vendorName,
          label: item.vendorName,
          id: item.id,
          makeAsServiceShop: item.makeAsServiceShop || false,
        }));
        const sortedVendors = formattedData.sort((a, b) => {
          if (a.makeAsServiceShop && !b.makeAsServiceShop) return -1;
          if (!a.makeAsServiceShop && b.makeAsServiceShop) return 1;
          return (a.label || a.value || '').localeCompare(b.label || b.value || '');
        });
        setVendorOptions(sortedVendors);
        const vendorNames = sortedVendors.map(item => item.label || item.value).filter(Boolean);
        setVendorNameOptions(vendorNames);
      } else {
        console.log('Error fetching vendor names.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(() => {
    if (vendorOptions.length > 0 && previousSelectedVendors.length === 0 && selectedVendors.length === 0) {
      const initialSelected = vendorOptions
        .filter(vendor => vendor.makeAsServiceShop === true)
        .map(vendor => vendor.value)
        .filter(Boolean);
      setPreviousSelectedVendors(initialSelected);
      if (initialSelected.length > 0) {
        setSelectedVendors(initialSelected);
      }
    }
  }, [vendorOptions]);
  const refreshVendorData = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll', {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllVendorData(data);
        const formattedData = data.map(item => ({
          value: item.vendorName,
          label: item.vendorName,
          id: item.id,
          makeAsServiceShop: item.makeAsServiceShop || false,
        }));
        const sortedVendors = formattedData.sort((a, b) => {
          if (a.makeAsServiceShop && !b.makeAsServiceShop) return -1;
          if (!a.makeAsServiceShop && b.makeAsServiceShop) return 1;
          return (a.label || a.value || '').localeCompare(b.label || b.value || '');
        });
        setVendorOptions(sortedVendors);
        const vendorNames = sortedVendors.map(item => item.label || item.value).filter(Boolean);
        setVendorNameOptions(vendorNames);
      }
    } catch (error) {
      console.error("Error refreshing vendor data: ", error);
    }
  };
  const updateServiceShopStatus = async (newSelectedVendors) => {
    try {
      const updatePromises = [];
      for (const vendor of vendorOptions) {
        if (vendor.id && vendor.value) {
          const shouldBeSelected = newSelectedVendors.includes(vendor.value);
          const wasSelected = previousSelectedVendors.includes(vendor.value);
          if (shouldBeSelected !== wasSelected) {
            const url = `https://backendaab.in/aabuilderDash/api/vendor_Names/${vendor.id}/make-store?makeAsServiceStore=${shouldBeSelected}`;
            const updatePromise = fetch(url, {
              method: 'PUT',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            })
              .then(response => {
                if (response.ok) {
                  return { success: true, vendorId: vendor.id, vendorName: vendor.value };
                } else {
                  console.error(`✗ Failed to update vendor ${vendor.id}: ${response.status} ${response.statusText}`);
                  return { success: false, vendorId: vendor.id, vendorName: vendor.value, error: response.statusText };
                }
              })
              .catch(error => {
                console.error(`✗ Error updating vendor ${vendor.id}:`, error);
                return { success: false, vendorId: vendor.id, vendorName: vendor.value, error: error.message };
              });
            updatePromises.push(updatePromise);
          }
        }
      }
      await Promise.all(updatePromises);
      setPreviousSelectedVendors(newSelectedVendors);
      await refreshVendorData();
    } catch (error) {
      console.error('Error updating service shop status:', error);
    }
  };
  const [sheetOpenPicker, setSheetOpenPicker] = useState(null);
  const [sheetPickerSearch, setSheetPickerSearch] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState(null); // 'purchaseDate' or 'warrantyDate'
  const handleAddNew = () => {
    setShowAddNewSheet(true);
  };
  const handleCloseAddNewSheet = () => {
    setShowAddNewSheet(false);
    setSheetOpenPicker(null);
    setSheetPickerSearch('');
    setShowDatePicker(false);
    setDatePickerField(null);
    setSelectedFile(null);
    setFileUrl('');
    setAddSheetForm({
      itemName: '',
      itemNameId: null,
      quantity: '0',
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
      const itemName = addSheetForm.itemName || selectedItemName || 'Tool';
      const finalName = `${timestamp} ${itemName} ${addSheetForm.machineNumber || ''}`.trim();
      formData.append('file', file);
      formData.append('file_name', finalName);
      const uploadResponse = await fetch(GOOGLE_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }
      const uploadResult = await uploadResponse.json();
      setFileUrl(uploadResult.url);
    } catch (error) {
      console.error('Error during file upload:', error);
      alert('Failed to upload file. Please try again.');
      setSelectedFile(null);
      setFileUrl('');
    } finally {
      setIsUploading(false);
    }
    e.target.value = '';
  };
  const handleAddSheetFieldChange = (field, value) => {
    setAddSheetForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'itemId' && value) {
        updated.quantity = '0';
        const itemIdObj = findItemIdRecordByValue(value);
        updated.itemIdDbId = itemIdObj?.id ?? null;
      } else if (field === 'itemId' && !value) {
        updated.itemIdDbId = null;
      } else if (field === 'quantity' && value && value !== '0' && value.trim() !== '') {
        updated.itemId = '';
        updated.itemIdDbId = null;
      }
      if (field === 'itemName' && value) {
        const itemNameObj = findItemNameRecordByValue(value);
        const normalizedItemName = String(value).trim().replace(/\s+/g, ' ');
        if (itemNameObj) {
          updated.itemName = itemNameObj?.item_name ?? itemNameObj?.itemName ?? normalizedItemName;
        }
        updated.itemNameId = itemNameObj?.id ?? null;
      } else if (field === 'itemName' && !value) {
        updated.itemNameId = null;
      }
      if (field === 'brand' && value) {
        const brandObj = findBrandRecordByValue(value);
        const normalizedBrand = String(value).trim().replace(/\s+/g, ' ');
        if (brandObj) {
          updated.brand = brandObj?.tools_brand ?? brandObj?.toolsBrand ?? normalizedBrand;
        }
        updated.brandId = brandObj?.id ?? null;
      } else if (field === 'brand' && !value) {
        updated.brandId = null;
      }
      if (field === 'purchaseStore' && value) {
        const storeObj = purchaseStoreFullData.find(
          v => v?.vendorName === value
        );
        updated.purchaseStoreId = storeObj?.id ?? null;
      } else if (field === 'purchaseStore' && !value) {
        updated.purchaseStoreId = null;
      }
      if (field === 'homeLocation' && value) {
        const locationObj = homeLocationFullData.find(
          item => item?.siteName === value
        );
        updated.homeLocationId = locationObj?.id ?? null;
      } else if (field === 'homeLocation' && !value) {
        updated.homeLocationId = null;
      }
      return updated;
    });
  };
  const toLocalDateTimeString = (date) => {
    // Convert to Indian Standard Time (IST = UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istDate = new Date(date.getTime() + istOffset);

    // Format as YYYY-MM-DDTHH:mm:ss (ISO-8601 format for Java LocalDateTime)
    const year = istDate.getUTCFullYear();
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    const hours = String(istDate.getUTCHours()).padStart(2, '0');
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };
  const isItemIdInUseWithMachine = (itemIdDbId, itemIdName) => {
    if (!itemIdDbId && !itemIdName) return { inUse: false, machineNumber: null };

    // Find matching items in stock management (stock has machine_number_id, resolve to text for status lookup)
    const matchingStockItems = stockManagementData.filter(item => {
      const storedItemIdId = item?.item_ids_id ?? item?.itemIdsId;
      const machineNum = resolveMachineNumFromStock(item);
      const idMatches = itemIdDbId
        ? String(storedItemIdId) === String(itemIdDbId)
        : String(storedItemIdId) === String(itemIdName);
      return idMatches && machineNum;
    });

    // Check machine status from new API for each matching item
    for (const stockItem of matchingStockItems) {
      const itemIdsId = String(stockItem?.item_ids_id ?? stockItem?.itemIdsId);
      const machineNum = String(resolveMachineNumFromStock(stockItem));
      const key = `${itemIdsId}_${machineNum}`;
      const latestStatus = getLatestMachineStatus.get(key);

      if (latestStatus) {
        // Use status from new API
        const machineStatus = (latestStatus.machine_status || latestStatus.machineStatus || '').toLowerCase();
        // Only consider in use if status is NOT "Machine Dead" or "Not Working"
        if (machineStatus !== 'machine dead' && machineStatus !== 'not working') {
          return {
            inUse: true,
            machineNumber: machineNum
          };
        }
      } else {
        // Fallback to tool_status from stock management if no status in new API
        const toolStatus = (stockItem?.tool_status ?? stockItem?.toolStatus)?.toLowerCase();
        if (toolStatus && toolStatus !== 'dead' && toolStatus !== 'machine dead' && toolStatus !== 'not working') {
          return {
            inUse: true,
            machineNumber: machineNum
          };
        }
      }
    }

    return { inUse: false, machineNumber: null };
  };
  const buildNewToolDetail = (machineNumberId) => ({
    timestamp: toLocalDateTimeString(new Date()),
    item_ids_id: addSheetForm.itemIdDbId ? String(addSheetForm.itemIdDbId) : null,
    brand_id: addSheetForm.brandId ? String(addSheetForm.brandId) : null,
    model: (addSheetForm.model || '').trim() || null,
    machine_number_id: machineNumberId ? String(machineNumberId) : null,
    tool_status: 'Available'
  });
  const handleAddNewItemName = async (newItemName) => {
    requestCreateItemNameConfirmation(newItemName, 'main');
  };
  const handleAddNewBrand = async (newBrand) => {
    requestCreateBrandConfirmation(newBrand, 'main');
  };
  const handleAddNewItemId = async (newItemId) => {
    requestCreateItemIdConfirmation(newItemId, 'main');
  };
  const handleAddSheetSave = async () => {
    const itemName = (addSheetForm.itemName || selectedItemName || '').trim();
    if (!itemName) {
      alert('Item Name is required.');
      return;
    }
    if (!addSheetForm.homeLocationId) {
      alert('Home Location is required.');
      return;
    }
    if (addSheetForm.itemId) {
      const { inUse, machineNumber } = isItemIdInUseWithMachine(addSheetForm.itemIdDbId, addSheetForm.itemId);
      if (inUse) {
        alert(`Item ID "${addSheetForm.itemId}" is already assigned to machine number "${machineNumber}" and the tool status is not Dead. Please select a different Item ID.`);
        return;
      }
    }
    if (isUploading) {
      alert('Please wait for file upload to complete.');
      return;
    }
    setIsSaving(true);
    try {
      const normalizedItemName = itemName.toLowerCase().trim();
      const existingItemName = toolsItemNameListData.find(
        item => {
          const existingName = (item?.item_name ?? item?.itemName ?? '').toLowerCase().trim();
          return existingName === normalizedItemName;
        }
      );
      const resolvedItemNameRecord = findItemNameRecordByValue(itemName);
      const resolvedBrandRecord = findBrandRecordByValue(addSheetForm.brand);
      let itemNameId = existingItemName?.id ?? addSheetForm.itemNameId ?? resolvedItemNameRecord?.id;
      const brandIdToSend = addSheetForm.brandId ?? resolvedBrandRecord?.id ?? '';
      let machineNumberId = '';
      const machineNumberTrimmed = addSheetForm.machineNumber?.trim() || '';
      if (machineNumberTrimmed) {
        const machineNumPayload = {
          machine_number: machineNumberTrimmed,
          tool_status: 'Available'
        };
        const machineNumRes = await fetch(`${TOOLS_MACHINE_NUMBER_BASE_URL}/save`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(machineNumPayload)
        });
        if (!machineNumRes.ok) {
          throw new Error(`Failed to save machine number: ${machineNumRes.status} ${machineNumRes.statusText}`);
        }
        const savedMachine = await machineNumRes.json();
        machineNumberId = savedMachine?.id ? String(savedMachine.id) : '';
      }
      const stockManagementPayload = {
        item_name_id: itemNameId ? String(itemNameId) : itemName,
        brand_name_id: brandIdToSend ? String(brandIdToSend) : '',
        item_ids_id: addSheetForm.itemIdDbId ? String(addSheetForm.itemIdDbId) : '',
        model: addSheetForm.model?.trim() || '',
        machine_number_id: machineNumberId,
        purchase_store_id: addSheetForm.purchaseStoreId ? String(addSheetForm.purchaseStoreId) : '',
        home_location_id: addSheetForm.homeLocationId ? String(addSheetForm.homeLocationId) : '',
        purchase_date: addSheetForm.purchaseDate || '',
        warranty_date: addSheetForm.warrantyDate || '',
        contact: addSheetForm.contact?.trim() || '',
        shop_address: addSheetForm.shopAddress?.trim() || '',
        quantity: addSheetForm.quantity || '0',
        file_url: fileUrl || '',
        tool_status: 'Available'
      };
      const stockRes = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockManagementPayload)
      });
      if (!stockRes.ok) {
        throw new Error(`Failed to save stock management: ${stockRes.status} ${stockRes.statusText}`);
      }
      // Only update ToolsItemNameList if quantity is not entered (quantity is empty, '0', or not set)
      const hasQuantity = addSheetForm.quantity && addSheetForm.quantity !== '0' && addSheetForm.quantity.trim() !== '';
      if (!hasQuantity) {
        const newDetail = buildNewToolDetail(machineNumberId);
        if (existingItemName?.id) {
          const existingDetails = Array.isArray(existingItemName?.tools_details)
            ? existingItemName.tools_details
            : Array.isArray(existingItemName?.toolsDetails)
              ? existingItemName.toolsDetails
              : [];
          const payload = {
            category_id: existingItemName?.category_id ?? existingItemName?.categoryId ?? selectedCategory ?? null,
            item_name: existingItemName?.item_name ?? existingItemName?.itemName, // Use the EXACT existing name
            tools_details: [...existingDetails, newDetail]
          };
          const res = await fetch(
            `${TOOLS_ITEM_NAME_BASE_URL}/edit/${existingItemName.id}?edited_by=${encodeURIComponent(user?.name || user?.username || 'mobile')}`,
            {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }
          );
          if (!res.ok) throw new Error(`Failed to update ToolsItemNameList: ${res.status} ${res.statusText}`);
        } else {
          const payload = {
            category_id: selectedCategory ?? null,
            item_name: itemName,
            tools_details: [newDetail]
          };
          const res = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/save`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error(`Failed to save new ToolsItemNameList: ${res.status} ${res.statusText}`);
        }
        // Refresh ToolsItemNameList only if we updated it
        const refreshed = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (refreshed.ok) {
          const data = await refreshed.json();
          setToolsItemNameListData(Array.isArray(data) ? data : []);
          const names = (Array.isArray(data) ? data : [])
            .map(item => item?.item_name ?? item?.itemName)
            .filter(Boolean);
          setItemNameOptions(Array.from(new Set(names)));
          setSelectedItemName(itemName);
        }
      }
      const stockRefreshed = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/getAll`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (stockRefreshed.ok) {
        const stockData = await stockRefreshed.json();
        setStockManagementData(Array.isArray(stockData) ? stockData : []);
      }
      alert('Saved successfully!');
      handleCloseAddNewSheet();
    } catch (e) {
      console.error('Error saving Tools Item Name/Details:', e);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  const getPickerOptions = () => {
    if (!sheetOpenPicker) return [];
    const opts = { itemName: itemNameOptions, itemId: sheetItemIdOptions, brand: brandOptions, purchaseStore: purchaseStoreOptions, homeLocation: homeLocationOptions }[sheetOpenPicker] || [];
    const q = (sheetPickerSearch || '').trim().toLowerCase();
    if (!q) return opts;
    return opts.filter(o => String(o).toLowerCase().includes(q));
  };
  const getPickerPlaceholder = () => {
    const pl = { itemName: 'Select', itemId: 'Select', brand: 'Select', purchaseStore: 'Select', homeLocation: 'Select' }[sheetOpenPicker];
    return pl || 'Select';
  };
  const openSheetPicker = (field) => {
    setSheetOpenPicker(field);
    setSheetPickerSearch('');
    setShowNewItemIdInput(false);
    setNewItemIdValue('');
    setShowNewItemNameInput(false);
    setNewItemNameValue('');
    setShowNewBrandInput(false);
    setNewBrandValue('');
  };
  const closeSheetPicker = () => {
    setSheetOpenPicker(null);
    setSheetPickerSearch('');
    setShowNewItemIdInput(false);
    setNewItemIdValue('');
    setShowNewItemNameInput(false);
    setNewItemNameValue('');
    setShowNewBrandInput(false);
    setNewBrandValue('');
  };
  const handleSheetPickerSelect = async (field, value) => {
    if (field === 'itemId' && value === '__CREATE_NEW__') {
      setShowNewItemIdInput(true);
      return;
    }
    if (value === '__CREATE_FROM_SEARCH__') {
      const searchTerm = (sheetPickerSearch || '').trim();
      if (!searchTerm) return;

      if (field === 'itemName') {
        await handleCreateNewItemNameFromSheet(searchTerm);
      } else if (field === 'itemId') {
        await handleCreateNewItemIdFromSheet(searchTerm);
      } else if (field === 'brand') {
        await handleCreateNewBrandFromSheet(searchTerm);
      }
      return;
    }
    handleAddSheetFieldChange(field, value);
    closeSheetPicker();
  };
  const handleCreateNewItemNameFromSheet = async (newItemName) => {
    requestCreateItemNameConfirmation(newItemName, 'sheet');
  };
  const handleCreateNewBrandFromSheet = async (newBrand) => {
    requestCreateBrandConfirmation(newBrand, 'sheet');
  };
  const handleCreateNewItemIdFromSheet = async (newItemId) => {
    requestCreateItemIdConfirmation(newItemId, 'sheet');
  };
  const handleCreateNewItemId = async () => {
    requestCreateItemIdConfirmation(newItemIdValue, 'sheet');
  };
  const handleCreateNewItemName = async () => {
    requestCreateItemNameConfirmation(newItemNameValue, 'sheet');
  };
  const handleCreateNewBrand = async () => {
    requestCreateBrandConfirmation(newBrandValue, 'sheet');
  };
  // Helper functions to convert between date formats
  // DatePickerModal returns "dd/mm/yyyy", but we store dates in "dd/mm/yyyy" format for display
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

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    // Convert dd/mm/yyyy to yyyy-mm-dd for HTML5 date input (if needed)
    if (dateStr.includes('/') && dateStr.length === 10) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const handleDatePickerOpen = (field) => {
    setDatePickerField(field);
    setShowDatePicker(true);
  };

  const handleDatePickerConfirm = (formattedDate) => {
    if (datePickerField) {
      handleAddSheetFieldChange(datePickerField, formattedDate);
    }
    setShowDatePicker(false);
    setDatePickerField(null);
  };

  const renderSheetDropdown = (field, value, placeholder) => (
    <div className="relative w-full">
      {showAddNewSheet && sheetOpenPicker === field ? (
        <input
          type="text"
          value={sheetPickerSearch}
          onChange={(e) => setSheetPickerSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white focus:outline-none"
          style={{ color: '#000', boxSizing: 'border-box', paddingRight: '40px' }}
          autoFocus
        />
      ) : (
        <div onClick={() => openSheetPicker(field)}
          className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
          style={{ color: value ? '#000' : '#9E9E9E', boxSizing: 'border-box', paddingRight: '40px' }}
        >
          {value || placeholder}
        </div>
      )}
      {value && !(showAddNewSheet && sheetOpenPicker === field) && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleAddSheetFieldChange(field, ''); }}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      {/* Dropdown options */}
      {showAddNewSheet && sheetOpenPicker === field && (
        <div className={`absolute ${field === 'purchaseStore' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 right-0 bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] shadow-lg max-h-[150px] overflow-hidden flex flex-col`} style={{ zIndex: 60 }}>
          {/* Show input form for creating new Item ID */}
          {showNewItemIdInput && field === 'itemId' ? (
            <div className="p-3">
              <p className="text-[12px] font-medium text-gray-600 mb-2">Enter a new Item ID:</p>
              <input
                type="text"
                value={newItemIdValue}
                onChange={(e) => setNewItemIdValue(e.target.value)}
                placeholder="e.g., AA DM 07"
                className="w-full h-[32px] px-3 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button type="button" onClick={handleCreateNewItemId} className="flex-1 h-[32px] rounded-[8px] text-[12px] font-bold text-white bg-black">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewItemIdInput(false);
                    setNewItemIdValue('');
                  }}
                  className="flex-1 h-[32px] border border-black rounded-[8px] text-[12px] font-bold text-black bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : showNewItemNameInput && field === 'itemName' ? (
            <div className="p-3">
              <p className="text-[12px] font-medium text-gray-600 mb-2">Enter new item name:</p>
              <input
                type="text"
                value={newItemNameValue}
                onChange={(e) => setNewItemNameValue(e.target.value)}
                placeholder="Enter new item name"
                className="w-full h-[32px] px-3 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button type="button" onClick={handleCreateNewItemName} className="flex-1 h-[32px] rounded-[8px] text-[12px] font-bold text-white bg-black">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewItemNameInput(false);
                    setNewItemNameValue('');
                  }}
                  className="flex-1 h-[32px] border border-black rounded-[8px] text-[12px] font-bold text-black bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : showNewBrandInput && field === 'brand' ? (
            <div className="p-3">
              <p className="text-[12px] font-medium text-gray-600 mb-2">Enter new brand:</p>
              <input
                type="text"
                value={newBrandValue}
                onChange={(e) => setNewBrandValue(e.target.value)}
                placeholder="Enter new brand"
                className="w-full h-[32px] px-3 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button type="button" onClick={handleCreateNewBrand} className="flex-1 h-[32px] rounded-[8px] text-[12px] font-bold text-white bg-black">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewBrandInput(false);
                    setNewBrandValue('');
                  }}
                  className="flex-1 h-[32px] border border-black rounded-[8px] text-[12px] font-bold text-black bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[200px]">
              {(() => {
                const searchTerm = (sheetPickerSearch || '').trim();
                const isCreatable = ['itemName', 'itemId', 'brand'].includes(field);
                const hasMatches = getPickerOptions().length > 0;
                const showCreateFromSearch = isCreatable && searchTerm && !hasMatches;
                const fieldLabels = {
                  itemName: 'Item Name',
                  itemId: 'Item ID',
                  brand: 'Brand'
                };
                return (
                  <>
                    {/* "+ Add New [Field]" option for creatable fields when search is empty */}
                    {isCreatable && !searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          if (field === 'itemId') {
                            setShowNewItemIdInput(true);
                          } else if (field === 'itemName') {
                            setShowNewItemNameInput(true);
                          } else if (field === 'brand') {
                            setShowNewBrandInput(true);
                          }
                        }}
                        className="w-full h-[36px] px-3 flex items-center text-left hover:bg-[#F5F5F5] transition-colors text-[12px] font-medium text-black border-b border-gray-100"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mr-2">
                          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Add New {fieldLabels[field]}
                      </button>
                    )}
                    {/* "+ 'search term'" option for creatable fields when no matches */}
                    {showCreateFromSearch && (
                      <button
                        type="button"
                        onClick={() => handleSheetPickerSelect(field, '__CREATE_FROM_SEARCH__')}
                        className="w-full h-[36px] px-3 flex items-center text-left hover:bg-[#F5F5F5] transition-colors text-[12px] font-medium text-black border-b border-gray-100"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mr-2">
                          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        '{searchTerm}'
                      </button>
                    )}
                    {hasMatches ? (
                      getPickerOptions().map((opt) => (
                        <button key={opt} type="button" onClick={() => handleSheetPickerSelect(field, opt)}
                          className="w-full h-[36px] px-3 flex items-center text-left hover:bg-[#F5F5F5] transition-colors text-[12px] font-medium text-black"
                        >
                          {opt}
                        </button>
                      ))
                    ) : (
                      !showCreateFromSearch && !isCreatable && (
                        <p className="text-[12px] font-medium text-[#9E9E9E] text-center py-3">
                          {searchTerm ? 'No options found' : 'No options available'}
                        </p>
                      )
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
  return (
    <div className="flex flex-col  min-h-[calc(100vh-90px-80px)] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex-shrink-0  px-4 pt-1.5 pb-1.5">
        <div className="flex items-center pb-1.5 justify-between border-b border-gray-200 gap-2">
          <p className="text-[12px] font-semibold text-black leading-normal">Category</p>
          <button onClick={() => setShowVendorsModal(true)} className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity">
            Manage shops
          </button>
        </div>
      </div>
      <div className="flex-shrink-0 px-4 pb-2 space-y-[6px]">
        <div className="">
          <p className="text-[12px] font-medium text-black leading-normal mb-0.5">
            Item Name<span className="text-[#eb2f8e]">*</span>
          </p>
          <SearchableDropdown
            value={selectedItemName || ''}
            onChange={(value) => setSelectedItemName(value)}
            onAddNew={handleAddNewItemName}
            options={itemNameOptions}
            placeholder="Drilling Machine"
            fieldName="Item Name"
            showAllOptions={true}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-[12px] font-medium text-black leading-normal mb-0.5">
              Brand<span className="text-[#eb2f8e]">*</span>
            </p>
            <SearchableDropdown
              value={selectedBrand || ''}
              onChange={(value) => setSelectedBrand(value)}
              onAddNew={handleAddNewBrand}
              options={brandOptions}
              placeholder="Select Brand"
              fieldName="Brand"
              showAllOptions={true}
            />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-black leading-normal mb-0.5">
              Item ID<span className="text-[#eb2f8e]">*</span>
            </p>
            <SearchableDropdown
              value={selectedItemId || ''}
              onChange={(value) => setSelectedItemId(value)}
              onAddNew={handleAddNewItemId}
              options={itemIdOptions}
              placeholder="Select Item ID"
              fieldName="Item ID"
              showAllOptions={true}
            />
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="bg-white rounded-[18px] ">
          {/* Table Header */}
          <div className="bg-[#F5F5F5] px-2 py-2 border-b border-[#E0E0E0]">
            <div className="grid grid-cols-[16px_1.1fr_0.8fr_1.2fr_1.6fr]">
              <div className="text-[12px] font-semibold text-black leading-normal"></div>
              <div className="text-[12px] font-semibold text-black leading-normal">Item ID</div>
              <div className="text-[12px] font-semibold text-black leading-normal">Brand</div>
              <div className="text-[12px] font-semibold text-black leading-normal">Model</div>
              <div className="text-[12px] font-semibold text-black leading-normal">Machine</div>
            </div>
          </div>
          {/* Table Body */}
          <div>
            {tableData.length > 0 ? (
              tableData.map((row, index) => {
                const itemIdName = row.itemId ? (toolsItemIdFullData.find(item => String(item?.id) === String(row.itemId))?.item_id || toolsItemIdFullData.find(item => String(item?.id) === String(row.itemId))?.itemId || row.itemId || '-') : '-';
                const brandName = row.brand ? (toolsBrandFullData.find(b => String(b?.id) === String(row.brand))?.tools_brand || toolsBrandFullData.find(b => String(b?.id) === String(row.brand))?.toolsBrand || row.brand || '-') : '-';
                return (
                  <div key={row.id || index} className="grid grid-cols-[16px_1.1fr_0.8fr_1.2fr_1.6fr] px-2 py-2 border-b border-[#E0E0E0] last:border-b-0">
                    <div className="text-[11px] font-medium text-black leading-normal text-left">{index + 1}</div>
                    <div className="text-[11px] font-medium text-black leading-normal truncate text-left">{itemIdName}</div>
                    <div className="text-[11px] font-medium text-black leading-normal truncate text-left">{brandName}</div>
                    <div className="text-[11px] font-medium text-black leading-normal truncate text-left">{row.model || '-'}</div>
                    <div className="text-[11px] font-medium text-black leading-normal truncate text-left">{row.machine || '-'}</div>
                  </div>
                );
              })
            ) : (
              <div className="px-2 py-4 text-center">
                <p className="text-[12px] text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Floating Action Button - Add New */}
      <div className="fixed bottom-[110px] right-[24px] lg:right-[calc(50%-164px)] z-30 cursor-pointer" onClick={handleAddNew} >
        <div className="bg-black rounded-full px-4 py-2 flex items-center gap-2 h-[43px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-white text-[14px] font-medium">Add New</span>
        </div>
      </div>
      {/* Select Filters Bottom Sheet Modal */}
      {showAddNewSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }} onClick={handleCloseAddNewSheet}>
          <div className="bg-white w-full max-w-[360px] max-h-[70vh] rounded-tl-[16px] rounded-tr-[16px] relative z-50 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-1">
              <p className="text-[16px] font-bold text-black">Select Filters</p>
              <button type="button" onClick={handleCloseAddNewSheet} className="text-[#e06256] text-xl font-bold leading-none">
                <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
              </button>
            </div>
            {/* Backdrop for dropdown */}
            {sheetOpenPicker && (
              <div
                className="fixed inset-0 z-[45]"
                onClick={closeSheetPicker}
              />
            )}
            {/* Form - scrollable */}
            <div className="flex-1 overflow-hidden px-6 py-1">
              {/* Row 1: Item Name* + Quantity (half) */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Item Name<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <div className='w-[220px]'>
                    {renderSheetDropdown('itemName', addSheetForm.itemName, 'Select')}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Quantity</p>
                  <input
                    type="text"
                    value={addSheetForm.quantity}
                    onChange={(e) => handleAddSheetFieldChange('quantity', e.target.value)}
                    disabled={!!addSheetForm.itemId}
                    className={`w-full h-[32px] border border-[#d6d6d6] rounded px-3 text-[12px] font-medium focus:outline-none text-gray-700 ${!!addSheetForm.itemId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="0"
                  />
                </div>
              </div>
              {/* Row 2: Item ID + Model* */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Item ID</p>
                  <div className={addSheetForm.quantity && addSheetForm.quantity !== '0' && addSheetForm.quantity.trim() !== '' ? 'opacity-50 pointer-events-none' : ''}>
                    {renderSheetDropdown('itemId', addSheetForm.itemId, 'Select')}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Model{!(addSheetForm.quantity && addSheetForm.quantity !== '0' && addSheetForm.quantity.trim() !== '') && <span className="text-[#eb2f8e]">*</span>}
                  </p>
                  <input
                    type="text"
                    value={addSheetForm.model}
                    onChange={(e) => handleAddSheetFieldChange('model', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] rounded px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                    placeholder="Enter"
                  />
                </div>
              </div>
              {/* Row 3: Machine Number* + Brand* */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Machine Number{!(addSheetForm.quantity && addSheetForm.quantity !== '0' && addSheetForm.quantity.trim() !== '') && <span className="text-[#eb2f8e]">*</span>}
                  </p>
                  <input
                    type="text"
                    value={addSheetForm.machineNumber}
                    onChange={(e) => handleAddSheetFieldChange('machineNumber', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] rounded px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                    placeholder="Enter"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Brand{!(addSheetForm.quantity && addSheetForm.quantity !== '0' && addSheetForm.quantity.trim() !== '') && <span className="text-[#eb2f8e]">*</span>}
                  </p>
                  {renderSheetDropdown('brand', addSheetForm.brand, 'Select')}
                </div>
              </div>
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-medium text-black">
                      Home Location<span className="text-[#eb2f8e]">*</span>
                    </p>
                    {addSheetForm.homeLocation && (() => {
                      const selectedLocation = homeLocationFullData.find(item => item?.siteName === addSheetForm.homeLocation);
                      return selectedLocation?.branch ? (
                        <span className="text-[12px] font-medium text-[#E4572E]">{selectedLocation.branch}</span>
                      ) : null;
                    })()}
                  </div>
                  {renderSheetDropdown('homeLocation', addSheetForm.homeLocation, 'Select')}
                </div>
              </div>
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-medium text-black">
                      Purchase Store{!(addSheetForm.quantity && addSheetForm.quantity !== '0' && addSheetForm.quantity.trim() !== '') && <span className="text-[#eb2f8e]">*</span>}
                    </p>
                    {addSheetForm.purchaseStore && (() => {
                      const selectedStore = purchaseStoreFullData.find(item => item?.vendorName === addSheetForm.purchaseStore);
                      return selectedStore?.contact_number ? (
                        <span className="text-[12px] font-medium text-[#E4572E]">{selectedStore.contact_number}</span>
                      ) : null;
                    })()}
                  </div>
                  {renderSheetDropdown('purchaseStore', addSheetForm.purchaseStore, 'Select')}
                </div>
              </div>
              {/* Row 4: Purchase Date* + Warranty Date* */}
              <div className="flex gap-3 w-[100px] mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Purchase Date{!(addSheetForm.quantity && addSheetForm.quantity !== '0' && addSheetForm.quantity.trim() !== '') && <span className="text-[#eb2f8e]">*</span>}
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={formatDateForDisplay(addSheetForm.purchaseDate) || ''}
                      onClick={() => handleDatePickerOpen('purchaseDate')}
                      onFocus={() => handleDatePickerOpen('purchaseDate')}
                      placeholder="dd-mm-yyyy"
                      className="w-[150px] h-[32px] border border-[#d6d6d6] rounded pl-3 pr-10 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500 cursor-pointer"
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
                  <p className="text-[12px] font-medium text-black mb-1">
                    Warranty Date{!(addSheetForm.quantity && addSheetForm.quantity !== '0' && addSheetForm.quantity.trim() !== '') && <span className="text-[#eb2f8e]">*</span>}
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={formatDateForDisplay(addSheetForm.warrantyDate) || ''}
                      onClick={() => handleDatePickerOpen('warrantyDate')}
                      onFocus={() => handleDatePickerOpen('warrantyDate')}
                      placeholder="dd-mm-yyyy"
                      className="w-[150px] h-[32px] border border-[#d6d6d6] rounded pl-3 pr-10 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500 cursor-pointer"
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
                <div className="flex items-center gap-2 flex-wrap">
                  <label htmlFor="add-sheet-attach-file" className={`flex items-center gap-1 cursor-pointer text-[12px] font-medium text-[#E4572E] ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                  id="add-sheet-attach-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,image/*,application/pdf"
                />
              </div>
            </div>
            {/* Footer: Cancel + Save */}
            <div className=" flex gap-4 px-6 pb-6 pt-2">
              <button type="button" onClick={handleCloseAddNewSheet} disabled={isSaving || isUploading}
                className={`flex-1 h-[40px] border border-black rounded-[8px] text-[14px] font-bold text-black bg-white ${(isSaving || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Cancel
              </button>
              <button type="button" onClick={handleAddSheetSave} disabled={isSaving || isUploading}
                className={`flex-1 h-[40px] rounded-[8px] text-[14px] font-bold text-white bg-black ${(isSaving || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? 'Saving...' : isUploading ? 'Uploading...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreateItemIdConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[120] flex items-center justify-center p-4"
          onClick={closeCreateConfirmModal}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[360px] rounded-[16px] p-5 shadow-xl"
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
              Do you want to create "{pendingItemIdToCreate}" as a new {pendingCreateType === 'itemName' ? 'item name' : pendingCreateType === 'brand' ? 'brand' : 'item id'}?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeCreateConfirmModal}
                className="flex-1 h-[44px] border border-black rounded-[8px] text-[14px] font-bold text-black bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateItemId}
                className="flex-1 h-[44px] bg-black rounded-[8px] text-[14px] font-bold text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Vendor Names Modal */}
      <SelectLocatorsModal
        isOpen={showVendorsModal}
        onClose={() => setShowVendorsModal(false)}
        onSelect={async (values) => {
          setSelectedVendors(values);
          await updateServiceShopStatus(values);
          // Don't close modal immediately - let user continue selecting
        }}
        selectedValues={selectedVendors}
        options={vendorNameOptions}
        fieldName="Vendor"
        onAddNew={(newVendor) => {
          if (newVendor && !vendorNameOptions.includes(newVendor)) {
            setVendorNameOptions([...vendorNameOptions, newVendor]);
          }
        }}
      />
      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => {
          setShowDatePicker(false);
          setDatePickerField(null);
        }}
        onConfirm={handleDatePickerConfirm}
        initialDate={datePickerField === 'purchaseDate' ? addSheetForm.purchaseDate : datePickerField === 'warrantyDate' ? addSheetForm.warrantyDate : ''}
      />
    </div>
  );
};
export default AddInput;