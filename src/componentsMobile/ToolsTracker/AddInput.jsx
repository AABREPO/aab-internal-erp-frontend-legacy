import React, { useState, useEffect } from 'react';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';
import SelectLocatorsModal from '../Inventory/SelectLocatorsModal';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';

const AddInput = ({ user }) => {
  const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_name';
  const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_brand';
  const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_id';
  const TOOLS_STOCK_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_stock_management';
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
  const usedItemIds = React.useMemo(() => {
    const usedIds = new Set();
    stockManagementData.forEach(item => {
      const itemIdId = item?.item_ids_id ?? item?.itemIdsId;
      const machineNum = item?.machine_number ?? item?.machineNumber;
      const toolStatus = (item?.tool_status ?? item?.toolStatus)?.toLowerCase();
      if (itemIdId && machineNum && toolStatus !== 'dead') {
        usedIds.add(String(itemIdId));
      }
    });
    return usedIds;
  }, [stockManagementData]);
  const sheetItemIdOptions = React.useMemo(() => {
    return apiItemIdOptions.filter(itemIdName => {
      const itemIdObj = toolsItemIdFullData.find(
        item => (item?.item_id?.trim() ?? item?.itemId?.trim()) === itemIdName
      );
      const dbId = itemIdObj?.id;
      if (!dbId) return true;
      return !usedItemIds.has(String(dbId));
    });
  }, [apiItemIdOptions, toolsItemIdFullData, usedItemIds]);
  const [tableData, setTableData] = useState([]);
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
      machine: d?.machine_number ?? d?.machineNumber ?? ''
    }));
    setTableData(mappedTable);
    const idsFromDetails = details
      .map(d => d?.item_ids_id ?? d?.itemIdsId)
      .filter(Boolean);
    const allIds = Array.from(new Set([...apiItemIdOptions, ...idsFromDetails]));
    setItemIdOptions(allIds);
  }, [selectedItemName, toolsItemNameListData, apiItemIdOptions]);
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
    const foundInStockManagement = stockManagementData.find(item => {
      const storedItemIdId = item?.item_ids_id ?? item?.itemIdsId;
      const machineNum = item?.machine_number ?? item?.machineNumber;
      const toolStatus = (item?.tool_status ?? item?.toolStatus)?.toLowerCase();
      const idMatches = itemIdDbId
        ? String(storedItemIdId) === String(itemIdDbId)
        : String(storedItemIdId) === String(itemIdName);
      return idMatches && machineNum && toolStatus !== 'dead';
    });
    if (foundInStockManagement) {
      return {
        inUse: true,
        machineNumber: foundInStockManagement?.machine_number ?? foundInStockManagement?.machineNumber
      };
    }
    return { inUse: false, machineNumber: null };
  };
  const buildNewToolDetail = () => ({
    timestamp: toLocalDateTimeString(new Date()),
    item_ids_id: addSheetForm.itemIdDbId ? String(addSheetForm.itemIdDbId) : null,
    brand_id: addSheetForm.brandId ? String(addSheetForm.brandId) : null,
    model: (addSheetForm.model || '').trim() || null,
    machine_number: (addSheetForm.machineNumber || '').trim() || null,
    tool_status: 'Available'
  });
  const handleAddNewItemName = async (newItemName) => {
    if (!newItemName || !newItemName.trim()) {
      return;
    }
    const trimmedName = newItemName.trim();
    if (itemNameOptions.some(name => name.toLowerCase() === trimmedName.toLowerCase())) {
      setSelectedItemName(trimmedName);
      return;
    }
    try {
      const payload = {
        category_id: selectedCategory ?? null,
        item_name: trimmedName,
        tools_details: []
      };
      const res = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Failed to save: ${res.status} ${res.statusText}`);
      }
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
        setSelectedItemName(trimmedName);
      }
    } catch (e) {
      console.error('Error saving new Item Name:', e);
      alert('Failed to save new Item Name. Please try again.');
    }
  };
  const handleAddNewBrand = async (newBrand) => {
    if (!newBrand || !newBrand.trim()) {
      return;
    }
    const trimmedBrand = newBrand.trim();
    if (brandOptions.some(b => b.toLowerCase() === trimmedBrand.toLowerCase())) {
      setSelectedBrand(trimmedBrand);
      return;
    }
    try {
      const payload = {
        tools_brand: trimmedBrand
      };
      const res = await fetch(`${TOOLS_BRAND_BASE_URL}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Failed to save: ${res.status} ${res.statusText}`);
      }
      const refreshed = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        setToolsBrandFullData(Array.isArray(data) ? data : []);
        const brandOpts = (Array.isArray(data) ? data : [])
          .map(b => b?.tools_brand?.trim() ?? b?.toolsBrand?.trim())
          .filter(b => b);
        setBrandOptions(Array.from(new Set(brandOpts)));
        setSelectedBrand(trimmedBrand);
      }
    } catch (e) {
      console.error('Error saving new Brand:', e);
      alert('Failed to save new Brand. Please try again.');
    }
  };
  const handleAddNewItemId = async (newItemId) => {
    if (!newItemId || !newItemId.trim()) {
      return;
    }
    const trimmedItemId = newItemId.trim();
    if (itemIdOptions.some(id => id.toLowerCase() === trimmedItemId.toLowerCase())) {
      setSelectedItemId(trimmedItemId);
      return;
    }
    try {
      const payload = {
        item_id: trimmedItemId
      };
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
        setToolsItemIdFullData(Array.isArray(data) ? data : []);
        const itemIdOpts = (Array.isArray(data) ? data : [])
          .map(item => item?.item_id?.trim() ?? item?.itemId?.trim())
          .filter(item => item);
        setApiItemIdOptions(itemIdOpts);
        const currentDetails = currentToolsItemNameList?.tools_details ?? currentToolsItemNameList?.toolsDetails ?? [];
        const idsFromDetails = currentDetails
          .map(d => d?.item_ids_id ?? d?.itemIdsId)
          .filter(Boolean);
        const allIds = Array.from(new Set([...itemIdOpts, ...idsFromDetails]));
        setItemIdOptions(allIds);
        setSelectedItemId(trimmedItemId);
      }
    } catch (e) {
      console.error('Error saving new Item ID:', e);
      alert('Failed to save new Item ID. Please try again.');
    }
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
      let itemNameId = existingItemName?.id ?? addSheetForm.itemNameId;
      const stockManagementPayload = {
        item_name_id: itemNameId ? String(itemNameId) : itemName,
        brand_name_id: addSheetForm.brandId ? String(addSheetForm.brandId) : '',
        item_ids_id: addSheetForm.itemIdDbId ? String(addSheetForm.itemIdDbId) : '',
        model: addSheetForm.model?.trim() || '',
        machine_number: addSheetForm.machineNumber?.trim() || '',
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
        const newDetail = buildNewToolDetail();
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
  };
  const closeSheetPicker = () => {
    setSheetOpenPicker(null);
    setSheetPickerSearch('');
    setShowNewItemIdInput(false);
    setNewItemIdValue('');
  };
  const handleSheetPickerSelect = (field, value) => {
    if (field === 'itemId' && value === '__CREATE_NEW__') {
      setShowNewItemIdInput(true);
      return;
    }
    handleAddSheetFieldChange(field, value);
    closeSheetPicker();
  };
  const handleCreateNewItemId = async () => {
    if (!newItemIdValue || !newItemIdValue.trim()) {
      alert('Please enter an Item ID');
      return;
    }
    const trimmedItemId = newItemIdValue.trim();
    if (apiItemIdOptions.some(id => id.toLowerCase() === trimmedItemId.toLowerCase())) {
      alert('This Item ID already exists. Please enter a different one.');
      return;
    }
    try {
      const payload = { item_id: trimmedItemId };
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
        const newItemIdObj = dataArray.find(
          item => (item?.item_id?.trim() ?? item?.itemId?.trim())?.toLowerCase() === trimmedItemId.toLowerCase()
        );
        const newItemIdDbId = newItemIdObj?.id ?? null;
        setAddSheetForm(prev => ({
          ...prev,
          itemId: trimmedItemId,
          itemIdDbId: newItemIdDbId,
        }));
        closeSheetPicker();
      }
    } catch (e) {
      console.error('Error saving new Item ID:', e);
      alert('Failed to save new Item ID. Please try again.');
    }
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
      <div onClick={() => openSheetPicker(field)}
        className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
        style={{ color: value ? '#000' : '#9E9E9E', boxSizing: 'border-box', paddingRight: '40px' }}
      >
        {value || placeholder}
      </div>
      {value && (
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
    </div>
  );
  return (
    <div className="flex flex-col min-h-[calc(100vh-90px-80px)] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex-shrink-0 px-4 pt-2 pb-3">
        <div className="flex items-center justify-between border-b border-gray-200 gap-2">
          <p className="text-[12px] mb-2 font-medium text-black leading-normal">Category</p>
          <button onClick={() => setShowVendorsModal(true)} className="text-[12px] mb-2 font-medium text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity">
            Manage shops
          </button>
        </div>
      </div>
      <div className="flex-shrink-0 px-4 pb-4">
        <div className="mb-4">
          <p className="text-[12px] font-medium text-black leading-normal mb-1">
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
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <p className="text-[12px] font-medium text-black leading-normal mb-1">
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
            <p className="text-[12px] font-medium text-black leading-normal mb-1">
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
        <div className="bg-white rounded-[8px] border border-[#E0E0E0]">
          {/* Table Header */}
          <div className="bg-[#F5F5F5] px-2 py-2 border-b border-[#E0E0E0]">
            <div className="grid grid-cols-5 gap-2">
              <div className="text-[10px] font-bold text-black leading-normal"></div>
              <div className="text-[10px] font-bold text-black leading-normal">Item ID</div>
              <div className="text-[10px] font-bold text-black leading-normal">Brand</div>
              <div className="text-[10px] font-bold text-black leading-normal">Model</div>
              <div className="text-[10px] font-bold text-black leading-normal">Machine</div>
            </div>
          </div>
          {/* Table Body */}
          <div>
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
                ×
              </button>
            </div>
            {/* Form - scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-1">
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
                    className={`w-full h-[32px] border border-[#d6d6d6] px-3 text-[12px] font-medium focus:outline-none text-gray-700 ${!!addSheetForm.itemId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                    className="w-full h-[32px] border border-[#d6d6d6] px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
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
                    className="w-full h-[32px] border border-[#d6d6d6] px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
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
            <div className="flex-shrink-0 flex gap-4 px-6 pb-6 pt-2">
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
      {/* Sheet dropdown picker modal (Transfer-style) */}
      {showAddNewSheet && sheetOpenPicker && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeSheetPicker()}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-5">
              <p className="text-[16px] font-semibold text-black">
                {showNewItemIdInput ? 'Create New Item ID' : `Select ${({ itemName: 'Item Name', itemId: 'Item ID', brand: 'Brand', purchaseStore: 'Purchase Store', homeLocation: 'Home Location' })[sheetOpenPicker]}`}
              </p>
              <button type="button" onClick={closeSheetPicker} className="text-red-500 text-[20px] font-semibold hover:opacity-80">
                ×
              </button>
            </div>
            {/* Show input form for creating new Item ID */}
            {showNewItemIdInput && sheetOpenPicker === 'itemId' ? (
              <div className="px-6 pt-4 pb-6">
                <p className="text-[12px] font-medium text-gray-600 mb-2">Enter a new Item ID:</p>
                <input
                  type="text"
                  value={newItemIdValue}
                  onChange={(e) => setNewItemIdValue(e.target.value)}
                  placeholder="e.g., AA DM 07"
                  className="w-full h-[40px] px-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[14px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewItemIdInput(false);
                      setNewItemIdValue('');
                    }}
                    className="flex-1 h-[40px] border border-black rounded-[8px] text-[14px] font-bold text-black bg-white"
                  >
                    Back
                  </button>
                  <button type="button" onClick={handleCreateNewItemId} className="flex-1 h-[40px] rounded-[8px] text-[14px] font-bold text-white bg-black">
                    Create
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                    {/* "+ Create new" option for Item ID */}
                    {sheetOpenPicker === 'itemId' && !sheetPickerSearch.trim() && (
                      <button type="button" onClick={() => handleSheetPickerSelect('itemId', '__CREATE_NEW__')}
                        className="w-full h-[40px] px-6 flex items-center text-left hover:bg-[#F5F5F5] transition-colors text-[14px] font-medium text-[#E4572E] border-b border-gray-100"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
                          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Create new Item ID
                      </button>
                    )}
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
              </>
            )}
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