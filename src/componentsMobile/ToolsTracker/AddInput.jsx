import React, { useState, useEffect } from 'react';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';
import SelectLocatorsModal from '../Inventory/SelectLocatorsModal';

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
  const [stockManagementData, setStockManagementData] = useState([]); // For checking item_ids_id usage
  const [addSheetForm, setAddSheetForm] = useState({
    itemName: '',
    itemNameId: null, // Store the ID
    quantity: '0',
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
    shopAddress: ''
  });
  const [purchaseStoreOptions, setPurchaseStoreOptions] = useState([]); // Vendors with makeAsServiceShop === true
  const [showNewItemIdInput, setShowNewItemIdInput] = useState(false);
  const [newItemIdValue, setNewItemIdValue] = useState('');
  
  // Get list of Item IDs that are already assigned to a machine (and tool_status is not "Dead")
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
  
  // Filter out used Item IDs from the dropdown options
  const sheetItemIdOptions = React.useMemo(() => {
    return apiItemIdOptions.filter(itemIdName => {
      // Find the database ID for this item ID name
      const itemIdObj = toolsItemIdFullData.find(
        item => (item?.item_id?.trim() ?? item?.itemId?.trim()) === itemIdName
      );
      const dbId = itemIdObj?.id;
      
      // If we can't find the DB ID, keep it in the list (safe default)
      if (!dbId) return true;
      
      // Filter out if this ID is already used
      return !usedItemIds.has(String(dbId));
    });
  }, [apiItemIdOptions, toolsItemIdFullData, usedItemIds]);
  const [tableData, setTableData] = useState([]);
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

  // When item name changes, derive details/options from tools_item_name data
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
    
    // Merge with API-fetched item IDs
    const allIds = Array.from(new Set([...apiItemIdOptions, ...idsFromDetails]));
    setItemIdOptions(allIds);
  }, [selectedItemName, toolsItemNameListData, apiItemIdOptions]);
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
          // Store full brand data with IDs
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

  // Fetch item IDs from API
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
          // Store full item ID data with IDs
          setToolsItemIdFullData(Array.isArray(data) ? data : []);
          const itemIdOpts = (Array.isArray(data) ? data : [])
            .map(item => item?.item_id?.trim() ?? item?.itemId?.trim())
            .filter(item => item);
          setApiItemIdOptions(itemIdOpts);
        }
      } catch (error) {
        console.error('Error fetching item IDs:', error);
      }
    };
    fetchItemIds();
  }, []);
  
  // Fetch stock management data to check item_ids_id usage
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
  // Fetch item IDs when item name or brand is selected
  useEffect(() => {
    // Item IDs are derived from selected item name (see effect above).
    // When no item name is selected, show only API-fetched item IDs
    if (!selectedItemName) {
      setItemIdOptions(apiItemIdOptions);
    }
  }, [selectedItemName, selectedBrand, apiItemIdOptions]);
  // Fetch vendor names
  useEffect(() => {
    fetchVendorNames();
  }, []);

  // Fetch service store vendors (vendors with makeAsServiceShop === true) for Purchase Store dropdown
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
          // Filter only vendors with makeAsServiceShop === true and store full data
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
        // Store full vendor data
        setAllVendorData(data);
        const formattedData = data.map(item => ({
          value: item.vendorName,
          label: item.vendorName,
          id: item.id,
          makeAsServiceShop: item.makeAsServiceShop || false,
        }));
        // Sort vendors: makeAsServiceShop === true first, then alphabetically
        const sortedVendors = formattedData.sort((a, b) => {
          if (a.makeAsServiceShop && !b.makeAsServiceShop) return -1;
          if (!a.makeAsServiceShop && b.makeAsServiceShop) return 1;
          return (a.label || a.value || '').localeCompare(b.label || b.value || '');
        });
        setVendorOptions(sortedVendors);
        // Extract vendor names as strings for the modal (already sorted)
        const vendorNames = sortedVendors.map(item => item.label || item.value).filter(Boolean);
        setVendorNameOptions(vendorNames);
      } else {
        console.log('Error fetching vendor names.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Initialize selectedVendors from vendors that are already marked as service shops
  useEffect(() => {
    if (vendorOptions.length > 0 && previousSelectedVendors.length === 0 && selectedVendors.length === 0) {
      const initialSelected = vendorOptions
        .filter(vendor => vendor.makeAsServiceShop === true)
        .map(vendor => vendor.value)
        .filter(Boolean);

      // Always set previousSelectedVendors, even if empty, so comparison works correctly
      setPreviousSelectedVendors(initialSelected);

      if (initialSelected.length > 0) {
        setSelectedVendors(initialSelected);
      }
    }
  }, [vendorOptions]);

  // Refresh vendor data from API
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
        // Sort vendors: makeAsServiceShop === true first, then alphabetically
        const sortedVendors = formattedData.sort((a, b) => {
          if (a.makeAsServiceShop && !b.makeAsServiceShop) return -1;
          if (!a.makeAsServiceShop && b.makeAsServiceShop) return 1;
          return (a.label || a.value || '').localeCompare(b.label || b.value || '');
        });
        setVendorOptions(sortedVendors);
        // Extract vendor names as strings for the modal (already sorted)
        const vendorNames = sortedVendors.map(item => item.label || item.value).filter(Boolean);
        setVendorNameOptions(vendorNames);
      }
    } catch (error) {
      console.error("Error refreshing vendor data: ", error);
    }
  };
  // Update service shop status when vendors are selected/deselected
  const updateServiceShopStatus = async (newSelectedVendors) => {
    try {
      // Process all vendors - update based on whether they're in the new selection
      const updatePromises = [];
      for (const vendor of vendorOptions) {
        if (vendor.id && vendor.value) {
          const shouldBeSelected = newSelectedVendors.includes(vendor.value);
          const wasSelected = previousSelectedVendors.includes(vendor.value);
          // Only update if the status needs to change
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
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      // Update previous selection for next comparison
      setPreviousSelectedVendors(newSelectedVendors);
      // Refresh vendor data to get updated makeAsServiceShop values
      await refreshVendorData();
    } catch (error) {
      console.error('Error updating service shop status:', error);
    }
  };
  const [sheetOpenPicker, setSheetOpenPicker] = useState(null);
  const [sheetPickerSearch, setSheetPickerSearch] = useState('');
  const handleAddNew = () => {
    setShowAddNewSheet(true);
  };
  const handleCloseAddNewSheet = () => {
    setShowAddNewSheet(false);
    setSheetOpenPicker(null);
    setSheetPickerSearch('');
    setSelectedFile(null);
    setFileUrl('');
    // Reset form to initial state
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
      // Mutual exclusivity: Item ID and Quantity
      if (field === 'itemId' && value) {
        // If Item ID is selected, clear Quantity and find the database ID
        updated.quantity = '0';
        const itemIdObj = toolsItemIdFullData.find(
          item => (item?.item_id?.trim() ?? item?.itemId?.trim()) === value
        );
        updated.itemIdDbId = itemIdObj?.id ?? null;
      } else if (field === 'itemId' && !value) {
        updated.itemIdDbId = null;
      } else if (field === 'quantity' && value && value !== '0' && value.trim() !== '') {
        // If Quantity is entered (and not empty/zero), clear Item ID
        updated.itemId = '';
        updated.itemIdDbId = null;
      }
      
      // Store IDs for dropdown selections
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
      
      return updated;
    });
  };
  const toLocalDateTimeString = (date) => {
    // LocalDateTime expects: yyyy-MM-ddTHH:mm:ss (no timezone suffix)
    return date.toISOString().slice(0, 19);
  };
  
  // Check if item_ids_id is already in use with a machine_number (unless tool_status is "Dead")
  // This checks in tools_tracker_item_stock_management table
  const isItemIdInUseWithMachine = (itemIdDbId, itemIdName) => {
    if (!itemIdDbId && !itemIdName) return { inUse: false, machineNumber: null };
    
    // Check in stock management data - the item_ids_id in this table stores the database ID
    const foundInStockManagement = stockManagementData.find(item => {
      const storedItemIdId = item?.item_ids_id ?? item?.itemIdsId;
      const machineNum = item?.machine_number ?? item?.machineNumber;
      const toolStatus = (item?.tool_status ?? item?.toolStatus)?.toLowerCase();
      
      // Check if the item_ids_id matches (either by DB ID or by name) and has a machine number
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
  // Handler for when user adds a new item name via dropdown
  const handleAddNewItemName = async (newItemName) => {
    if (!newItemName || !newItemName.trim()) {
      return;
    }
    const trimmedName = newItemName.trim();
    // Check if item name already exists
    if (itemNameOptions.some(name => name.toLowerCase() === trimmedName.toLowerCase())) {
      setSelectedItemName(trimmedName);
      return;
    }
    try {
      // Save new item name to API (with empty tools_details array)
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
      // Refresh item names list
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
        // Set the newly created item name as selected
        setSelectedItemName(trimmedName);
      }
    } catch (e) {
      console.error('Error saving new Item Name:', e);
      alert('Failed to save new Item Name. Please try again.');
    }
  };
  // Handler for when user adds a new brand via dropdown
  const handleAddNewBrand = async (newBrand) => {
    if (!newBrand || !newBrand.trim()) {
      return;
    }
    const trimmedBrand = newBrand.trim();    
    // Check if brand already exists
    if (brandOptions.some(b => b.toLowerCase() === trimmedBrand.toLowerCase())) {
      setSelectedBrand(trimmedBrand);
      return;
    }
    try {
      // Save new brand to API
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
      // Refresh brands list
      const refreshed = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        // Store full brand data with IDs
        setToolsBrandFullData(Array.isArray(data) ? data : []);
        const brandOpts = (Array.isArray(data) ? data : [])
          .map(b => b?.tools_brand?.trim() ?? b?.toolsBrand?.trim())
          .filter(b => b);
        setBrandOptions(Array.from(new Set(brandOpts)));
        // Set the newly created brand as selected
        setSelectedBrand(trimmedBrand);
      }
    } catch (e) {
      console.error('Error saving new Brand:', e);
      alert('Failed to save new Brand. Please try again.');
    }
  };
  // Handler for when user adds a new item ID via dropdown
  const handleAddNewItemId = async (newItemId) => {
    if (!newItemId || !newItemId.trim()) {
      return;
    }
    const trimmedItemId = newItemId.trim();    
    // Check if item ID already exists
    if (itemIdOptions.some(id => id.toLowerCase() === trimmedItemId.toLowerCase())) {
      setSelectedItemId(trimmedItemId);
      return;
    }
    try {
      // Save new item ID to API
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
      // Refresh item IDs list
      const refreshed = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        // Store full item ID data with IDs
        setToolsItemIdFullData(Array.isArray(data) ? data : []);
        const itemIdOpts = (Array.isArray(data) ? data : [])
          .map(item => item?.item_id?.trim() ?? item?.itemId?.trim())
          .filter(item => item);
        setApiItemIdOptions(itemIdOpts);
        // Merge with item IDs from tools_details if item name is selected
        const currentDetails = currentToolsItemNameList?.tools_details ?? currentToolsItemNameList?.toolsDetails ?? [];
        const idsFromDetails = currentDetails
          .map(d => d?.item_ids_id ?? d?.itemIdsId)
          .filter(Boolean);
        const allIds = Array.from(new Set([...itemIdOpts, ...idsFromDetails]));
        setItemIdOptions(allIds);
        // Set the newly created item ID as selected
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
    
    // Validate required fields
    if (!addSheetForm.model?.trim()) {
      alert('Model is required.');
      return;
    }
    if (!addSheetForm.machineNumber?.trim()) {
      alert('Machine Number is required.');
      return;
    }
    if (!addSheetForm.brand?.trim()) {
      alert('Brand is required.');
      return;
    }
    if (!addSheetForm.purchaseDate) {
      alert('Purchase Date is required.');
      return;
    }
    if (!addSheetForm.warrantyDate) {
      alert('Warranty Date is required.');
      return;
    }
    if (!addSheetForm.contact?.trim()) {
      alert('Contact is required.');
      return;
    }
    if (!addSheetForm.purchaseStore?.trim()) {
      alert('Purchase Store is required.');
      return;
    }
    if (!addSheetForm.shopAddress?.trim()) {
      alert('Shop Address is required.');
      return;
    }
    
    // Validate that item_ids_id is not already in use with a machine_number (unless tool_status is "Dead")
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
      // Find the item name ID from existing data - check for exact match (case-insensitive, trimmed)
      const normalizedItemName = itemName.toLowerCase().trim();
      const existingItemName = toolsItemNameListData.find(
        item => {
          const existingName = (item?.item_name ?? item?.itemName ?? '').toLowerCase().trim();
          return existingName === normalizedItemName;
        }
      );
      
      // Use existing item name ID if found, otherwise use the one from form
      let itemNameId = existingItemName?.id ?? addSheetForm.itemNameId;
      
      // Build payload for ToolsTrackerItemStockManagement API - send IDs instead of names
      const stockManagementPayload = {
        item_name_id: itemNameId ? String(itemNameId) : itemName, // Use ID if available, otherwise use name
        brand_name_id: addSheetForm.brandId ? String(addSheetForm.brandId) : '',
        item_ids_id: addSheetForm.itemIdDbId ? String(addSheetForm.itemIdDbId) : '',
        model: addSheetForm.model?.trim() || '',
        machine_number: addSheetForm.machineNumber?.trim() || '',
        purchase_store_id: addSheetForm.purchaseStoreId ? String(addSheetForm.purchaseStoreId) : '',
        purchase_date: addSheetForm.purchaseDate || '',
        warranty_date: addSheetForm.warrantyDate || '',
        contact: addSheetForm.contact?.trim() || '',
        shop_address: addSheetForm.shopAddress?.trim() || '',
        quantity: addSheetForm.quantity || '0',
        file_url: fileUrl || '',
        tool_status: 'Available'
      };
      
      // Save to ToolsTrackerItemStockManagement API
      const stockRes = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockManagementPayload)
      });
      
      if (!stockRes.ok) {
        throw new Error(`Failed to save stock management: ${stockRes.status} ${stockRes.statusText}`);
      }
      
      // Also save to tools_item_name for legacy/table display purposes
      const newDetail = buildNewToolDetail();
      
      // Check if item name already exists in the database - MUST use existing one, never create duplicate
      if (existingItemName?.id) {
        // Item name exists - UPDATE it by adding the new tool detail
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
        // Item name doesn't exist in database - create new ONLY in this case
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
      
      // Refresh item names + details
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
      
      // Refresh stock management data
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
    const opts = { itemName: itemNameOptions, itemId: sheetItemIdOptions, brand: brandOptions, purchaseStore: purchaseStoreOptions }[sheetOpenPicker] || [];
    const q = (sheetPickerSearch || '').trim().toLowerCase();
    if (!q) return opts;
    return opts.filter(o => String(o).toLowerCase().includes(q));
  };
  const getPickerPlaceholder = () => {
    const pl = { itemName: 'Select', itemId: 'Select', brand: 'Select', purchaseStore: 'Select' }[sheetOpenPicker];
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
    // Handle "+ Create new" option for itemId
    if (field === 'itemId' && value === '__CREATE_NEW__') {
      setShowNewItemIdInput(true);
      return;
    }
    handleAddSheetFieldChange(field, value);
    closeSheetPicker();
  };
  
  // Handle creating a new Item ID from the picker modal
  const handleCreateNewItemId = async () => {
    if (!newItemIdValue || !newItemIdValue.trim()) {
      alert('Please enter an Item ID');
      return;
    }
    
    const trimmedItemId = newItemIdValue.trim();
    
    // Check if already exists
    if (apiItemIdOptions.some(id => id.toLowerCase() === trimmedItemId.toLowerCase())) {
      alert('This Item ID already exists. Please enter a different one.');
      return;
    }
    
    try {
      // Save new item ID to API
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
      
      // Refresh item IDs list
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
        
        // Find the newly created item ID's database ID from the refreshed data
        const newItemIdObj = dataArray.find(
          item => (item?.item_id?.trim() ?? item?.itemId?.trim())?.toLowerCase() === trimmedItemId.toLowerCase()
        );
        const newItemIdDbId = newItemIdObj?.id ?? null;
        
        // Set the form values directly with the new item ID and its database ID
        setAddSheetForm(prev => ({
          ...prev,
          itemId: trimmedItemId,
          itemIdDbId: newItemIdDbId,
          quantity: '0' // Clear quantity when item ID is selected
        }));
        
        closeSheetPicker();
      }
    } catch (e) {
      console.error('Error saving new Item ID:', e);
      alert('Failed to save new Item ID. Please try again.');
    }
  };
  const renderSheetDropdown = (field, value, placeholder) => (
    <div className="relative w-full">
      <div
        onClick={() => openSheetPicker(field)}
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
      {/* Category Section */}
      <div className="flex-shrink-0 px-4 pt-2 pb-3">
        <div className="flex items-center justify-between border-b border-gray-200 gap-2">
          <p className="text-[12px] mb-2 font-medium text-black leading-normal">Category</p>
          <button
            onClick={() => setShowVendorsModal(true)}
            className="text-[12px] mb-2 font-medium text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
          >
            Manage shops
          </button>
        </div>
      </div>
      {/* Input Fields */}
      <div className="flex-shrink-0 px-4 pb-4">
        {/* Item Name */}
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
        {/* Brand and Item ID Row */}
        <div className="flex gap-3 mb-4">
          {/* Brand */}
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
          {/* Item ID */}
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
                    Model<span className="text-[#eb2f8e]">*</span>
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
                    Machine Number<span className="text-[#eb2f8e]">*</span>
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
                    Brand<span className="text-[#eb2f8e]">*</span>
                  </p>
                  {renderSheetDropdown('brand', addSheetForm.brand, 'Select')}
                </div>
              </div>
              {/* Row 4: Purchase Date* + Warranty Date* */}
              <div className="flex gap-3 w-[100px] mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Purchase Date<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <div className="relative">
                    <input
                      type="date"
                      value={addSheetForm.purchaseDate}
                      onChange={(e) => handleAddSheetFieldChange('purchaseDate', e.target.value)}
                      className="w-[150px] h-[32px] border border-[#d6d6d6] pl-3 pr-3 text-[12px] font-medium focus:outline-none text-gray-700"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Warranty Date<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <div className="relative">
                    <input
                      type="date"
                      value={addSheetForm.warrantyDate}
                      onChange={(e) => handleAddSheetFieldChange('warrantyDate', e.target.value)}
                      className="w-[150px] h-[32px] border border-[#d6d6d6] pl-3 pr-3 text-[12px] font-medium focus:outline-none text-gray-700"
                    />
                  </div>
                </div>
              </div>
              {/* Row 5: Contact* + Purchase Store* */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Contact<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <input
                    type="text"
                    value={addSheetForm.contact}
                    onChange={(e) => handleAddSheetFieldChange('contact', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                    placeholder="Enter"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Purchase Store<span className="text-[#eb2f8e]">*</span>
                  </p>
                  {renderSheetDropdown('purchaseStore', addSheetForm.purchaseStore, 'Select')}
                </div>
              </div>
              {/* Row 6: Shop Address* full width */}
              <div className="mb-2">
                <p className="text-[12px] font-medium text-black mb-1">
                  Shop Address<span className="text-[#eb2f8e]">*</span>
                </p>
                <input
                  type="text"
                  value={addSheetForm.shopAddress}
                  onChange={(e) => handleAddSheetFieldChange('shopAddress', e.target.value)}
                  className="w-full h-[32px] border border-[#d6d6d6]  px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                  placeholder="Enter"
                />
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
              <button 
                type="button" 
                onClick={handleCloseAddNewSheet} 
                disabled={isSaving || isUploading}
                className={`flex-1 h-[40px] border border-black rounded-[8px] text-[14px] font-bold text-black bg-white ${(isSaving || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleAddSheetSave} 
                disabled={isSaving || isUploading}
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
                {showNewItemIdInput ? 'Create New Item ID' : `Select ${({ itemName: 'Item Name', itemId: 'Item ID', brand: 'Brand', purchaseStore: 'Purchase Store' })[sheetOpenPicker]}`}
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
                  <button
                    type="button"
                    onClick={handleCreateNewItemId}
                    className="flex-1 h-[40px] rounded-[8px] text-[14px] font-bold text-white bg-black"
                  >
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
                      <button
                        type="button"
                        onClick={() => handleSheetPickerSelect('itemId', '__CREATE_NEW__')}
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
    </div>
  );
};
export default AddInput;