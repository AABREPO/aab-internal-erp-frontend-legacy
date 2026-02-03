import React, { useState, useEffect, useRef, useCallback } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import AddButton from '../PurchaseOrder/AddButton';
import AddItemsToIncoming from './AddItemsToIncoming';
import ItemCard from '../PurchaseOrder/ItemCard';
import DeleteConfirmModal from '../PurchaseOrder/DeleteConfirmModal';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import SearchItemsModal from '../PurchaseOrder/SearchItemsModal';
import SelectPOModal from './SelectPOModal';
import editIcon from '../Images/edit.png';
import jsPDF from 'jspdf';
const Incoming = ({ user }) => {
  // Helper functions for date
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };
  // Incoming page state
  const [incomingData, setIncomingData] = useState({
    poNumber: '',
    vendorName: '',
    vendorId: null,
    stockingLocation: '',
    date: getTodayDate(),
    inventoryId: null // For edit mode
  });
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showStockingLocationModal, setShowStockingLocationModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasOpenedAdd, setHasOpenedAdd] = useState(false);
  const [showAddItems, setShowAddItems] = useState(false);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [swipeStates, setSwipeStates] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSearchItemsModal, setShowSearchItemsModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [poItemName, setPoItemName] = useState([]);
  const [poBrand, setPoBrand] = useState([]);
  const [poModel, setPoModel] = useState([]);
  const [poType, setPoType] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [allPurchaseOrders, setAllPurchaseOrders] = useState([]); // Cache all POs
  const [loadingPOItems, setLoadingPOItems] = useState(false);
  const expandedItemIdRef = useRef(expandedItemId);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [filePreviews, setFilePreviews] = useState({});
  const filePreviewsRef = useRef({});
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);
  // Incoming page options
  const [vendorNameOptions, setVendorNameOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [stockingLocationOptions, setStockingLocationOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  // Fetch vendor names from API
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
        if (response.ok) {
          const data = await response.json();
          const formattedData = data.map(item => ({
            value: item.vendorName,
            label: item.vendorName,
            type: "Vendor",
            id: item.id,
          }));
          setVendorNameOptions(formattedData);
          setVendorOptions(formattedData.map(option => option.value));
        } else {
          console.log('Error fetching vendor names.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchVendorNames();
  }, []);

  // Fetch project names (sites) from API for Stocking Location
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.siteName,
          label: item.siteName,
          sNo: item.siteNo,
          id: item.id,
          markedAsStockingLocation: item.markedAsStockingLocation || false,
        }));
        setSiteOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);

  // Fetch stocking locations with markedAsStockingLocation=true
  useEffect(() => {
    const fetchStockingLocations = async () => {
      try {
        // Filter sites where markedAsStockingLocation is true
        const stockingLocations = siteOptions
          .filter(site => site.markedAsStockingLocation === true)
          .map(site => site.value || site.label || '')
          .filter(Boolean);
        // Remove duplicates
        const uniqueLocations = [...new Set(stockingLocations)];
        setStockingLocationOptions(uniqueLocations);
      } catch (error) {
        console.error('Error fetching stocking locations:', error);
        setStockingLocationOptions([]);
      }
    };
    if (siteOptions.length > 0) {
      fetchStockingLocations();
    }
  }, [siteOptions]);
  // Check if we're in empty state (no fields filled and no items)
  const isEmptyState = !incomingData.vendorName && !incomingData.stockingLocation && items.length === 0 && !isEditMode;
  // Check if all required fields are filled (for enabling AddButton)
  const areIncomingFieldsFilled = incomingData.vendorName && incomingData.stockingLocation;
  const handleDateConfirm = (date) => {
    setIncomingData({ ...incomingData, date });
    setShowDatePicker(false);
  };
  // Fetch PO item names from API
  const fetchPoItemName = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoItemName(data);
      }
    } catch (error) {
      console.error('Error fetching PO item names:', error);
    }
  }, []);
  // Fetch PO brand from API
  const fetchPoBrand = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoBrand(data);
      }
    } catch (error) {
      console.error('Error fetching PO brands:', error);
    }
  }, []);
  // Fetch PO model from API
  const fetchPoModel = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoModel(data);
      }
    } catch (error) {
      console.error('Error fetching PO models:', error);
    }
  }, []);
  // Fetch PO type from API
  const fetchPoType = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoType(data);
      }
    } catch (error) {
      console.error('Error fetching PO types:', error);
    }
  }, []);
  // Fetch PO categories from API
  const fetchPoCategory = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll');
      if (response.ok) {
        const data = await response.json();
        const options = (data || []).map(item => ({
          value: item.category || item.categoryName || item.name || '',
          label: item.category || item.categoryName || item.name || '',
          id: item.id || item._id || null,
        }));
        setCategoryOptions(options);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoryOptions([]);
    }
  }, []);
  // Helper function to find name by ID
  const findNameById = (array, id, fieldName) => {
    if (!array || !id) return '';
    const found = array.find(item => String(item.id || item._id) === String(id));
    return found ? (found[fieldName] || found.name || '') : '';
  };

  // Helper functions to resolve names from IDs (similar to Outgoing.jsx)
  const resolveItemName = (itemId) => {
    if (!itemId) return '';
    return findNameById(poItemName, itemId, 'itemName') || findNameById(poItemName, itemId, 'name') || '';
  };

  const resolveBrandName = (brandId) => {
    if (!brandId) return '';
    return findNameById(poBrand, brandId, 'brand') || findNameById(poBrand, brandId, 'brandName') || findNameById(poBrand, brandId, 'name') || '';
  };

  const resolveModelName = (modelId) => {
    if (!modelId) return '';
    return findNameById(poModel, modelId, 'model') || findNameById(poModel, modelId, 'modelName') || findNameById(poModel, modelId, 'name') || '';
  };

  const resolveTypeName = (typeId) => {
    if (!typeId) return '';
    return findNameById(poType, typeId, 'typeColor') || findNameById(poType, typeId, 'type') || findNameById(poType, typeId, 'typeName') || findNameById(poType, typeId, 'name') || '';
  };

  const resolveCategoryName = (categoryId) => {
    if (!categoryId) return '';
    return findNameById(categoryOptions, categoryId, 'category') || findNameById(categoryOptions, categoryId, 'name') || findNameById(categoryOptions, categoryId, 'label') || '';
  };
  // Helper function to extract numeric value from eno (same as PurchaseOrder.jsx)
  const getNumericEno = (eno) => {
    if (!eno) return 0;
    if (typeof eno === 'number') {
      return eno;
    }
    const str = String(eno);
    // Extract numeric part (remove #, spaces, etc.)
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };
  // Fetch all purchase orders and cache them
  const fetchAllPurchaseOrders = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/purchase_orders/getAll');
      if (response.ok) {
        const data = await response.json();
        setAllPurchaseOrders(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    }
    return [];
  }, []);
  // Fetch items from selected PO and add to items list
  const fetchPOItems = useCallback(async (eno, cachedPO = null) => {
    if (!eno) return;
    setLoadingPOItems(true);
    try {
      let data = allPurchaseOrders;
      let po = null;
      // If we have a cached PO, use it directly (from SelectPOModal)
      if (cachedPO) {
        po = cachedPO;
      } else {
        // Use cached data if available, otherwise fetch
        if (data.length === 0) {
          data = await fetchAllPurchaseOrders();
        }
        // Find the PO with matching ENO - use numeric comparison for better matching
        const targetEno = getNumericEno(eno);
        // Filter by vendor first to narrow down the search
        const vendorPOs = incomingData.vendorId
          ? data.filter(p => String(p.vendor_id || p.vendorId) === String(incomingData.vendorId))
          : data;
        // Find ALL POs with matching ENO for this vendor
        const matchingPOs = vendorPOs.filter(p => {
          const poEno = getNumericEno(p.eno || p.ENO || p.poNumber || p.po_number || '');
          return poEno === targetEno && poEno !== 0;
        });
        // Prioritize PO with items - find all POs with items, then pick the most recent one
        const posWithItems = matchingPOs.filter(p => {
          const items = p.purchaseTable || p.purchase_table || p.items || [];
          return items.length > 0;
        });
        if (posWithItems.length > 0) {
          // If multiple POs have items, pick the most recent one (highest ID)
          po = posWithItems.reduce((latest, current) => {
            const latestId = parseInt(latest.id || latest._id || 0);
            const currentId = parseInt(current.id || current._id || 0);
            return currentId > latestId ? current : latest;
          });
        } else if (matchingPOs.length > 0) {
          // If no PO with items found, use the most recent one (highest ID)
          po = matchingPOs.reduce((latest, current) => {
            const latestId = parseInt(latest.id || latest._id || 0);
            const currentId = parseInt(current.id || current._id || 0);
            return currentId > latestId ? current : latest;
          });
        }
      }
      if (po) {
        // Handle purchaseTable - it might be an array or might need to be accessed differently
        const purchaseTableItems = po.purchaseTable || po.purchase_table || po.items || [];
        if (purchaseTableItems.length === 0) {
          setLoadingPOItems(false);
          return;
        }
        // Fetch existing inventory records for this PO number to check already added quantities
        // Map using composite key: item_id-category_id-model_id-brand_id-type_id
        let inventoryItemQuantities = {}; // Map of composite key to total quantity already added
        try {
          const poNumberStr = String(eno).replace('#', '').trim();
          const inventoryResponse = await fetch('https://backendaab.in/aabuildersDash/api/inventory/getAll');
          if (inventoryResponse.ok) {
            const inventoryRecords = await inventoryResponse.json();
            // Filter inventory records by purchase_no matching the PO number and exclude deleted records
            const matchingInventoryRecords = inventoryRecords.filter(record => {
              // Exclude deleted records
              const recordDeleteStatus = record.delete_status !== undefined ? record.delete_status : record.deleteStatus;
              if (recordDeleteStatus) {
                return false;
              }
              // Match by purchase_no
              const recordPurchaseNo = record.purchase_no || record.purchaseNo || record.purchase_number || '';
              const recordPurchaseNoStr = String(recordPurchaseNo).replace('#', '').trim();
              return recordPurchaseNoStr === poNumberStr;
            });
            // Calculate total quantity per full row (composite key) from inventory records
            matchingInventoryRecords.forEach(record => {
              const inventoryItems = record.inventoryItems || record.inventory_items || [];
              if (Array.isArray(inventoryItems)) {
                inventoryItems.forEach(invItem => {
                  const itemId = invItem.item_id || invItem.itemId || null;
                  const categoryId = invItem.category_id || invItem.categoryId || null;
                  const modelId = invItem.model_id || invItem.modelId || null;
                  const brandId = invItem.brand_id || invItem.brandId || null;
                  const typeId = invItem.type_id || invItem.typeId || null;
                  const quantity = Math.abs(invItem.quantity || 0); // Use absolute value for incoming                    
                  // Create composite key for full row matching
                  const compositeKey = `${itemId || 'null'}-${categoryId || 'null'}-${modelId || 'null'}-${brandId || 'null'}-${typeId || 'null'}`;
                  if (itemId !== null && itemId !== undefined) {
                    inventoryItemQuantities[compositeKey] = (inventoryItemQuantities[compositeKey] || 0) + quantity;
                  }
                });
              }
            });
          }
        } catch (error) {
          console.error('Error fetching inventory records:', error);
          // Continue with PO items even if inventory fetch fails
        }
        // Transform purchaseTable items to the format expected by items
        // Use functional update to get current items and generate IDs correctly
        setItems(prevItems => {
          const maxId = prevItems.length > 0 ? Math.max(...prevItems.map(i => i.id)) : 0;
          // First, filter and adjust quantities based on inventory (matching full row)
          const filteredAndAdjustedItems = purchaseTableItems
            .map((item) => {
              const poItemId = item.item_id || item.itemId || null;
              const poCategoryId = item.category_id || item.categoryId || null;
              const poModelId = item.model_id || item.modelId || null;
              const poBrandId = item.brand_id || item.brandId || null;
              const poTypeId = item.type_id || item.typeId || null;
              const poQuantity = item.quantity || 0;
              // If item_id exists, check inventory quantities using full row match
              if (poItemId !== null && poItemId !== undefined) {
                // Create composite key for full row matching (same format as inventory)
                const compositeKey = `${poItemId || 'null'}-${poCategoryId || 'null'}-${poModelId || 'null'}-${poBrandId || 'null'}-${poTypeId || 'null'}`;
                const alreadyAddedQty = inventoryItemQuantities[compositeKey] || 0;
                // Calculate balance quantity
                const balanceQty = poQuantity - alreadyAddedQty;
                // If balance is 0 or negative, don't include this item
                if (balanceQty <= 0) {
                  return null;
                }
                // Use balance quantity instead of PO quantity
                return { ...item, quantity: balanceQty };
              }
              // If no item_id, include as is
              return item;
            })
            .filter(item => item !== null); // Remove items with 0 or negative balance
          // Then transform to the expected format
          const transformedItems = filteredAndAdjustedItems.map((item, index) => {
            // Look up item name - check multiple possible field names
            let itemName = item.itemName || item.name || item.item_name || '';
            // Try to get item name from poItemName API data if not provided in purchaseTable
            if (!itemName && (item.item_id || item.itemId) && poItemName && poItemName.length > 0) {
              const itemId = item.item_id || item.itemId;
              itemName = findNameById(poItemName, itemId, 'itemName') ||
                findNameById(poItemName, itemId, 'name') || '';
            }
            // Fallback if still no name - check if name is just the ID
            if (!itemName) {
              const itemId = item.item_id || item.itemId || '';
              if (itemId && String(itemName) === String(itemId)) {
                // Name was just the ID, treat as missing
                itemName = '';
              }
              itemName = itemName || (itemId ? `Item ${itemId}` : 'Item');
            }
            // Look up category name from categoryOptions if we have category_id
            // Check multiple possible field names
            let categoryName = item.categoryName || item.category_name || item.category || '';
            const categoryId = item.category_id || item.categoryId;
            if (!categoryName && categoryId && categoryOptions && categoryOptions.length > 0) {
              const foundCategory = categoryOptions.find(cat => String(cat.id) === String(categoryId));
              categoryName = foundCategory ? foundCategory.label : '';
            }
            // Look up brand name from poBrand if we have brand_id
            // Check multiple possible field names
            let brand = item.brandName || item.brand_name || item.brand || '';
            const brandId = item.brand_id || item.brandId;
            if (!brand && brandId && poBrand && poBrand.length > 0) {
              brand = findNameById(poBrand, brandId, 'brand') ||
                findNameById(poBrand, brandId, 'brandName') ||
                findNameById(poBrand, brandId, 'name') || '';
            }
            // Look up model name from poModel if we have model_id
            // Check multiple possible field names
            let model = item.modelName || item.model_name || item.model || '';
            const modelId = item.model_id || item.modelId;
            if (!model && modelId && poModel && poModel.length > 0) {
              model = findNameById(poModel, modelId, 'model') ||
                findNameById(poModel, modelId, 'modelName') ||
                findNameById(poModel, modelId, 'name') || '';
            }
            // Look up type name from poType if we have type_id
            // Check multiple possible field names
            let type = item.typeName || item.type_name || item.type || item.typeColor || '';
            const typeId = item.type_id || item.typeId;
            if (!type && typeId && poType && poType.length > 0) {
              type = findNameById(poType, typeId, 'typeColor') ||
                findNameById(poType, typeId, 'type') ||
                findNameById(poType, typeId, 'typeName') ||
                findNameById(poType, typeId, 'name') || '';
            }
            const newItemId = maxId + 1 + index;
            return {
              id: newItemId,
              name: `${itemName}${categoryName ? ', ' + categoryName : ''}`,
              brand: brand,
              model: model,
              type: type,
              category: categoryName || '',
              quantity: item.quantity || 0,
              price: item.price || (item.amount && item.quantity ? item.amount / item.quantity : 0) || 0,
              itemId: item.item_id || item.itemId || null,
              brandId: brandId || null,
              modelId: modelId || null,
              typeId: typeId || null,
              categoryId: categoryId || null,
            };
          });
          return [...prevItems, ...transformedItems];
        });
      }
    } catch (error) {
      console.error('Error fetching PO items:', error);
    } finally {
      setLoadingPOItems(false);
    }
  }, [poItemName, poBrand, poModel, poType, categoryOptions, allPurchaseOrders, incomingData.vendorId, fetchAllPurchaseOrders]);
  // Initial fetch on mount
  useEffect(() => {
    fetchPoItemName();
    fetchPoBrand();
    fetchPoModel();
    fetchPoType();
    fetchPoCategory();
  }, [fetchPoItemName, fetchPoBrand, fetchPoModel, fetchPoType, fetchPoCategory]);

  // Listen for editInventory event from NonPOHistory component
  useEffect(() => {
    const handleEditInventory = async (event) => {
      const inventoryItem = event.detail;
      if (!inventoryItem) return;

      // Only wait for essential data (vendor options and site options)
      if (vendorNameOptions.length === 0 || siteOptions.length === 0) {
        // Store in localStorage and retry when dependencies are ready
        localStorage.setItem('editingInventory', JSON.stringify(inventoryItem));
        return;
      }

      // Check if this is edit mode
      const editMode = inventoryItem.isEditMode === true;

      // Format date
      const itemDate = inventoryItem.date || inventoryItem.created_at || inventoryItem.createdAt;
      let formattedDate = getTodayDate();
      if (itemDate) {
        const dateObj = new Date(itemDate);
        formattedDate = dateObj.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }

      // Get vendor name from vendor_id
      const vendorId = inventoryItem.vendor_id || inventoryItem.vendorId;
      let vendorName = '';
      if (vendorId && vendorNameOptions.length > 0) {
        const vendor = vendorNameOptions.find(v =>
          v.id === vendorId || String(v.id) === String(vendorId)
        );
        vendorName = vendor ? (vendor.value || vendor.label || '') : '';
      }

      // Get stocking location from stocking_location_id
      const stockingLocationId = inventoryItem.stocking_location_id || inventoryItem.stockingLocationId;
      let stockingLocation = '';
      if (stockingLocationId && siteOptions.length > 0) {
        const site = siteOptions.find(s =>
          (s.id === stockingLocationId || String(s.id) === String(stockingLocationId)) &&
          s.markedAsStockingLocation === true
        );
        stockingLocation = site ? (site.value || site.label || '') : '';
      }

      // Get PO number
      const poNumber = inventoryItem.purchase_no || inventoryItem.purchaseNo || inventoryItem.purchase_number || '';

      // Set incoming data (including inventoryId if in edit mode)
      setIncomingData({
        poNumber: poNumber === 'NO_PO' ? '' : poNumber,
        vendorName: vendorName,
        vendorId: vendorId,
        stockingLocation: stockingLocation,
        date: formattedDate,
        inventoryId: editMode && inventoryItem.id ? inventoryItem.id : null
      });

      // Process inventory items
      const inventoryItems = inventoryItem.inventoryItems || inventoryItem.inventory_items || [];
      let formattedItems = [];
      if (Array.isArray(inventoryItems) && inventoryItems.length > 0) {
        // Transform inventory items to the format expected by items
        formattedItems = inventoryItems.map((invItem, index) => {
          // Get IDs from the inventory item
          const itemId = invItem.item_id || invItem.itemId || null;
          const brandId = invItem.brand_id || invItem.brandId || null;
          const modelId = invItem.model_id || invItem.modelId || null;
          const typeId = invItem.type_id || invItem.typeId || null;
          const categoryId = invItem.category_id || invItem.categoryId || null;

          // First, try to get names from the inventory item itself (if available)
          let itemName = invItem.itemName || invItem.item_name || '';
          let brand = invItem.brandName || invItem.brand_name || invItem.brand || '';
          let model = invItem.modelName || invItem.model_name || invItem.model || '';
          let type = invItem.typeName || invItem.type_name || invItem.type || '';
          let category = invItem.categoryName || invItem.category_name || invItem.category || '';

          // If names are missing, resolve from IDs using API data (if available)
          // This will work even if APIs are still loading - names will resolve as APIs load
          if (!itemName && itemId && poItemName.length > 0) {
            itemName = resolveItemName(itemId);
          }
          if (!brand && brandId && brandId !== 0 && poBrand.length > 0) {
            brand = resolveBrandName(brandId);
          }
          if (!model && modelId && poModel.length > 0) {
            model = resolveModelName(modelId);
          }
          if (!type && typeId && typeId !== 0 && poType.length > 0) {
            type = resolveTypeName(typeId);
          }
          // Always try to resolve category from categoryId if available (even if category is already set)
          // This ensures category is resolved when categoryOptions loads
          if (categoryId && categoryOptions.length > 0) {
            const resolvedCategory = resolveCategoryName(categoryId);
            if (resolvedCategory) {
              category = resolvedCategory;
            }
          }

          // If itemName includes category (format: "ItemName, Category")
          if (itemName && itemName.includes(',')) {
            const parts = itemName.split(',');
            itemName = parts[0].trim();
            // Only use category from itemName if we don't already have a resolved category
            if (!category || category === '') {
              category = parts[1] ? parts[1].trim() : category;
            }
          }

          return {
            id: index + 1,
            name: itemName && category ? `${itemName}, ${category}` : itemName || '',
            brand: brand || '',
            model: model || '',
            type: type || '',
            category: category || '',
            quantity: Math.abs(invItem.quantity || 0),
            price: invItem.amount && invItem.quantity ? Math.abs(invItem.amount / invItem.quantity) : 0,
            itemId: itemId,
            brandId: brandId,
            modelId: modelId,
            typeId: typeId,
            categoryId: categoryId,
          };
        });
      }

      // Set items immediately (names will resolve as APIs load)
      setItems(formattedItems);
      setHasOpenedAdd(formattedItems.length > 0);

      // Set edit mode if needed
      if (editMode) {
        setIsEditMode(true);
      }

      // Clear from localStorage after loading
      localStorage.removeItem('editingInventory');
    };

    window.addEventListener('editInventory', handleEditInventory);

    return () => {
      window.removeEventListener('editInventory', handleEditInventory);
    };
  }, [vendorNameOptions, siteOptions, poItemName, poBrand, poModel, poType, categoryOptions]);

  // Check localStorage on mount and when essential dependencies are loaded
  useEffect(() => {
    const editingInventory = localStorage.getItem('editingInventory');
    if (editingInventory && vendorNameOptions.length > 0 && siteOptions.length > 0) {
      try {
        const inventoryItem = JSON.parse(editingInventory);
        // Dispatch event to trigger loadInventoryData
        window.dispatchEvent(new CustomEvent('editInventory', { detail: inventoryItem }));
        // Clear from localStorage after loading
        localStorage.removeItem('editingInventory');
      } catch (error) {
        console.error('Error parsing editingInventory from localStorage:', error);
      }
    }
  }, [vendorNameOptions, siteOptions]);

  // Re-resolve item names when API data loads (for items already in state)
  // This ensures names are resolved even if APIs weren't loaded when items were first set
  useEffect(() => {
    if (items.length > 0 && (poItemName.length > 0 || poBrand.length > 0 || poModel.length > 0 || poType.length > 0 || categoryOptions.length > 0)) {
      setItems(prevItems => {
        const updatedItems = prevItems.map(item => {
          let itemName = item.name ? item.name.split(',')[0].trim() : '';
          // Extract category from item.category first, then from item.name if category is empty
          let category = item.category || '';
          if (!category && item.name && item.name.includes(',')) {
            category = item.name.split(',')[1]?.trim() || '';
          }
          let brand = item.brand || '';
          let model = item.model || '';
          let type = item.type || '';
          // Re-resolve names if we have IDs but missing names
          if (!itemName && item.itemId && poItemName.length > 0) {
            itemName = resolveItemName(item.itemId);
          }
          if (!brand && item.brandId && item.brandId !== 0 && poBrand.length > 0) {
            brand = resolveBrandName(item.brandId);
          }
          if (!model && item.modelId && poModel.length > 0) {
            model = resolveModelName(item.modelId);
          }
          if (!type && item.typeId && item.typeId !== 0 && poType.length > 0) {
            type = resolveTypeName(item.typeId);
          }
          // Always try to resolve category from categoryId if available (even if category is already set)
          // This ensures category is resolved when categoryOptions loads
          if (item.categoryId && categoryOptions.length > 0) {
            const resolvedCategory = resolveCategoryName(item.categoryId);
            if (resolvedCategory) {
              category = resolvedCategory;
            }
          }
          return {
            ...item,
            name: itemName && category ? `${itemName}, ${category}` : itemName || '',
            brand: brand || '',
            model: model || '',
            type: type || '',
            category: category || ''
          };
        });
        // Only update if names actually changed
        const hasChanges = updatedItems.some((updatedItem, index) => {
          const original = prevItems[index];
          return updatedItem.name !== original.name ||
            updatedItem.brand !== original.brand ||
            updatedItem.model !== original.model ||
            updatedItem.type !== original.type ||
            updatedItem.category !== original.category;
        });
        return hasChanges ? updatedItems : prevItems;
      });
    }
  }, [poItemName, poBrand, poModel, poType, categoryOptions]);
  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(filePreviewsRef.current).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);
  // Get available items function - returns the actual API data structure
  const getAvailableItems = useCallback(() => {
    // Return the actual API data structure with nested otherPOEntityList
    // This contains the real relationships between itemName, brand, model, and type
    if (poItemName && poItemName.length > 0) {
      return {
        items: poItemName, // Array of items with otherPOEntityList
        useNestedStructure: true
      };
    }
    // Fallback to old format if API data not available
    return {
      items: [],
      useNestedStructure: false
    };
  }, [poItemName]);
  // Handle search result add with quantity
  const handleSearchAdd = (item, quantity, isIncremental = false) => {
    // Normalize values for comparison
    const normalizeValue = (val) => (val || '').toString().toLowerCase().trim();
    const newItemName = normalizeValue(item.itemName);
    const newCategory = normalizeValue(item.category);
    const newModel = normalizeValue(item.model);
    const newBrand = normalizeValue(item.brand);
    const newType = normalizeValue(item.type);
    // Check if an item with the same properties (including category) already exists
    const existingItemIndex = items.findIndex(existingItem => {
      const nameParts = existingItem.name ? existingItem.name.split(',') : [];
      const existingItemName = normalizeValue(nameParts[0]);
      const existingCategory = normalizeValue(nameParts[1] || existingItem.category || '');
      const existingModel = normalizeValue(existingItem.model);
      const existingBrand = normalizeValue(existingItem.brand);
      const existingType = normalizeValue(existingItem.type);
      // Match if all properties including category are the same
      return (
        existingItemName === newItemName &&
        existingCategory === newCategory &&
        existingModel === newModel &&
        existingBrand === newBrand &&
        existingType === newType
      );
    });
    if (existingItemIndex !== -1) {
      // Update existing item quantity (merge quantities)
      const updatedItems = [...items];
      const currentQuantity = updatedItems[existingItemIndex].quantity || 0;
      const newQuantity = isIncremental ? currentQuantity + quantity : quantity;
      if (newQuantity > 0) {
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity
        };
        setItems(updatedItems);
      } else {
        // Remove item if quantity becomes 0 or negative
        updatedItems.splice(existingItemIndex, 1);
        setItems(updatedItems);
      }
    } else if (quantity > 0) {
      // Add new item
      const newItemId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
      // Resolve categoryId if not provided
      let categoryId = item.categoryId || null;
      if (!categoryId && item.category && categoryOptions.length > 0) {
        categoryId = resolveCategoryId(item.category);
      }
      const newItem = {
        id: newItemId,
        name: `${item.itemName}, ${item.category}`,
        brand: item.brand,
        model: item.model,
        type: item.type,
        category: item.category || '',
        quantity: quantity,
        price: 0, // Incoming items don't have a price field in the form, so default to 0
        itemId: item.itemId || null,
        brandId: item.brandId || null,
        modelId: item.modelId || null,
        typeId: item.typeId || null,
        categoryId: categoryId,
      };
      setItems([...items, newItem]);
    }
    setHasOpenedAdd(true);
  };
  // Update ref when expandedItemId changes
  useEffect(() => {
    expandedItemIdRef.current = expandedItemId;
  }, [expandedItemId]);
  // Global mouse handlers for desktop support (like PurchaseOrder)
  useEffect(() => {
    if (items.length === 0) return;
    const minSwipeDistance = 50;
    const globalMouseMoveHandler = (e) => {
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };
        items.forEach(item => {
          const state = prev[item.id];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          const isExpanded = expandedItemIdRef.current === item.id;
          // Only update if dragging horizontally
          if (deltaX < 0 || (isExpanded && deltaX > 0)) {
            newState[item.id] = {
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
        items.forEach(item => {
          const state = prev[item.id];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              // Swiped left (reveal buttons)
              setExpandedItemId(item.id);
            } else {
              // Swiped right (hide buttons)
              setExpandedItemId(null);
            }
          } else {
            // Small movement - snap back
            if (expandedItemIdRef.current === item.id) {
              setExpandedItemId(null);
            }
          }
          // Remove swipe state for this card
          delete newState[item.id];
          hasChanges = true;
        });
        return hasChanges ? newState : prev;
      });
    };
    // Add global mouse event listeners
    document.addEventListener('mousemove', globalMouseMoveHandler);
    document.addEventListener('mouseup', globalMouseUpHandler);
    return () => {
      document.removeEventListener('mousemove', globalMouseMoveHandler);
      document.removeEventListener('mouseup', globalMouseUpHandler);
    };
  }, [items]);
  // Helper function to resolve category ID
  const resolveCategoryId = (categoryName) => {
    if (!categoryName || !categoryOptions.length) return null;
    const category = categoryOptions.find(cat => {
      const label = (cat.label || cat.value || cat.category || cat.categoryName || cat.name || '').toLowerCase().trim();
      return label === categoryName.toLowerCase().trim();
    });
    return category ? (category.id || category._id || null) : null;
  };
  const handleAddItem = (itemData) => {
    if (editingItem) {
      const updatedItems = items.map(item =>
        item.id === editingItem.id
          ? {
            ...item,
            name: `${itemData.itemName}, ${itemData.category}`,
            brand: itemData.brand,
            model: itemData.model,
            type: itemData.type,
            quantity: parseInt(itemData.quantity),
            category: itemData.category || '',
            itemId: itemData.itemId || item.itemId || null,
            brandId: itemData.brandId || item.brandId || null,
            modelId: itemData.modelId || item.modelId || null,
            typeId: itemData.typeId || item.typeId || null,
            categoryId: itemData.categoryId || item.categoryId || resolveCategoryId(itemData.category) || null,
          }
          : item
      );
      setItems(updatedItems);
      setEditingItem(null);
    } else {
      // Normalize values for comparison
      const normalizeValue = (val) => (val || '').toString().toLowerCase().trim();
      const newItemName = normalizeValue(itemData.itemName);
      const newCategory = normalizeValue(itemData.category);
      const newModel = normalizeValue(itemData.model);
      const newBrand = normalizeValue(itemData.brand);
      const newType = normalizeValue(itemData.type);
      const newQuantity = parseInt(itemData.quantity) || 0;
      // Check if an item with the same properties exists
      const existingItemIndex = items.findIndex(item => {
        const itemNameParts = item.name ? item.name.split(',') : [];
        const existingItemName = normalizeValue(itemNameParts[0]);
        const existingCategory = normalizeValue(itemNameParts[1] || item.category || '');
        const existingModel = normalizeValue(item.model);
        const existingBrand = normalizeValue(item.brand);
        const existingType = normalizeValue(item.type);
        // Match if all properties are the same
        return (
          existingItemName === newItemName &&
          existingCategory === newCategory &&
          existingModel === newModel &&
          existingBrand === newBrand &&
          existingType === newType
        );
      });
      if (existingItemIndex !== -1) {
        // Merge with existing item by adding quantities
        const updatedItems = items.map((item, index) => {
          if (index === existingItemIndex) {
            return {
              ...item,
              quantity: (item.quantity || 0) + newQuantity,
            };
          }
          return item;
        });
        setItems(updatedItems);
      } else {
        // Add as new item
        const newItem = {
          id: items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1,
          name: `${itemData.itemName}, ${itemData.category}`,
          brand: itemData.brand,
          model: itemData.model,
          type: itemData.type,
          category: itemData.category || '',
          quantity: newQuantity,
          price: 0,
          itemId: itemData.itemId || null,
          brandId: itemData.brandId || null,
          modelId: itemData.modelId || null,
          typeId: itemData.typeId || null,
          categoryId: itemData.categoryId || resolveCategoryId(itemData.category) || null,
        };
        setItems([...items, newItem]);
      }
    }
  };
  const handleDeleteItem = (itemId) => {
    setItemToDelete(itemId);
    setShowDeleteConfirm(true);
  };
  const confirmDelete = () => {
    if (itemToDelete) {
      setItems(items.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
    }
    setShowDeleteConfirm(false);
  };
  // Convert image to PDF format
  const convertImageToPDF = (file) => {
    return new Promise((resolve, reject) => {
      const fileType = file.type;
      // If already a PDF, return as is
      if (fileType === 'application/pdf') {
        resolve(file);
        return;
      }
      // If it's an image, convert to PDF
      if (fileType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const pdf = new jsPDF();
            const imgWidth = img.width;
            const imgHeight = img.height;
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            // Calculate dimensions to fit the image in PDF
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const width = imgWidth * ratio;
            const height = imgHeight * ratio;
            const x = (pdfWidth - width) / 2;
            const y = (pdfHeight - height) / 2;
            pdf.addImage(e.target.result, 'JPEG', x, y, width, height);
            // Convert PDF to Blob
            const pdfBlob = pdf.output('blob');
            const pdfFile = new File([pdfBlob], file.name.replace(/\.[^/.]+$/, '.pdf'), {
              type: 'application/pdf',
              lastModified: Date.now()
            });
            resolve(pdfFile);
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      } else {
        // For other file types, reject
        reject(new Error('Unsupported file type. Please upload an image or PDF.'));
      }
    });
  };
  // Convert file to JPG format (for preview)
  const convertFileToJPG = (file) => {
    return new Promise((resolve, reject) => {
      const fileType = file.type;
      // If already an image, convert to JPG
      if (fileType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              const jpgFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(jpgFile);
            }, 'image/jpeg', 0.9);
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      } else if (fileType === 'application/pdf') {
        // For PDFs, render the PDF content as an image using PDF.js
        const loadPDFJS = () => {
          return new Promise((pdfResolve, pdfReject) => {
            if (window.pdfjsLib) {
              pdfResolve();
              return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => pdfResolve();
            script.onerror = () => pdfReject(new Error('Failed to load PDF.js'));
            document.head.appendChild(script);
          });
        };
        loadPDFJS().then(() => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          // Read PDF file as ArrayBuffer
          const reader = new FileReader();
          reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            window.pdfjsLib.getDocument({ data: arrayBuffer }).promise.then((pdf) => {
              // Render all pages
              const numPages = pdf.numPages;
              const pagePromises = [];
              // Get all page viewports first to calculate total height
              for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                pagePromises.push(pdf.getPage(pageNum));
              }
              Promise.all(pagePromises).then((pages) => {
                const scale = 2.0;
                let totalHeight = 0;
                let maxWidth = 0;
                // Calculate total dimensions
                pages.forEach((page) => {
                  const viewport = page.getViewport({ scale });
                  totalHeight += viewport.height;
                  maxWidth = Math.max(maxWidth, viewport.width);
                });
                // Create a single canvas for all pages
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = maxWidth;
                canvas.height = totalHeight;
                // Fill white background
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);
                // Render all pages vertically sequentially
                let currentY = 0;
                const renderPage = (pageIndex) => {
                  if (pageIndex >= pages.length) {
                    // All pages rendered, convert to blob
                    canvas.toBlob((blob) => {
                      const jpgFile = new File([blob], file.name.replace(/\.pdf$/i, '.jpg'), {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                      });
                      resolve(jpgFile);
                    }, 'image/jpeg', 0.9);
                    return;
                  }
                  const page = pages[pageIndex];
                  const viewport = page.getViewport({ scale });
                  // Save context state
                  context.save();
                  // Translate to position for this page
                  context.translate(0, currentY);
                  const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                  };
                  page.render(renderContext).promise.then(() => {
                    // Restore context after rendering
                    context.restore();
                    currentY += viewport.height;
                    // Render next page
                    renderPage(pageIndex + 1);
                  }).catch(() => {
                    // If rendering fails, restore context and continue with next page
                    context.restore();
                    currentY += viewport.height;
                    renderPage(pageIndex + 1);
                  });
                };
                // Start rendering from first page
                renderPage(0);
              }).catch(() => {
                createPDFPlaceholder(file, resolve);
              });
            }).catch(() => {
              createPDFPlaceholder(file, resolve);
            });
          };
          reader.onerror = () => {
            createPDFPlaceholder(file, resolve);
          };
          reader.readAsArrayBuffer(file);
        }).catch(() => {
          createPDFPlaceholder(file, resolve);
        });
        function createPDFPlaceholder(file, resolve) {
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 1000;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#000000';
          ctx.font = '24px Arial';
          ctx.fillText('PDF Document', 50, 100);
          ctx.font = '16px Arial';
          ctx.fillText(file.name, 50, 150);
          canvas.toBlob((blob) => {
            const jpgFile = new File([blob], file.name.replace(/\.pdf$/i, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(jpgFile);
          }, 'image/jpeg', 0.9);
        }
      } else {
        // For other file types, create a text representation as image
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        ctx.font = '24px Arial';
        ctx.fillText('File: ' + file.name, 50, 100);
        ctx.font = '16px Arial';
        ctx.fillText('Type: ' + fileType, 50, 150);
        ctx.fillText('Size: ' + (file.size / 1024 / 1024).toFixed(2) + ' MB', 50, 200);
        canvas.toBlob((blob) => {
          const jpgFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(jpgFile);
        }, 'image/jpeg', 0.9);
      }
    });
  };
  // Handle file selection
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    // Process files sequentially (one at a time) to avoid race conditions
    for (const file of files) {
      // Check file size (5 MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 5 MB limit`);
        continue;
      }
      // Create file object with upload state - use a more unique ID
      const fileId = Date.now() + Math.random() + Math.random() * 1000;
      const newFile = {
        id: fileId,
        originalFile: file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'uploading', // uploading, completed, error
        timeLeft: null,
        convertedFile: null,
        pdfUrl: null // Store the uploaded PDF URL
      };
      setAttachedFiles(prev => [...prev, newFile]);
      // Simulate upload progress
      const startTime = Date.now();
      let totalSize = file.size;
      let uploadedSize = 0;
      const uploadSpeed = 2 * 1024 * 1024; // 2 MB per second
      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000; // seconds
        uploadedSize = Math.min(elapsed * uploadSpeed, totalSize);
        const progress = (uploadedSize / totalSize) * 100;
        const remaining = totalSize - uploadedSize;
        const timeLeft = Math.ceil(remaining / uploadSpeed);
        setAttachedFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, progress: Math.min(progress, 99), timeLeft }
            : f
        ));
      }, 100);
      try {
        // Convert image to PDF if needed, or use PDF as is
        const pdfFile = await convertImageToPDF(file);
        totalSize = pdfFile.size; // Update total size for progress calculation
        // Get vendor and site info for file naming
        const selectedSite = siteOptions.find(
          site => site.value === incomingData.stockingLocation && site.markedAsStockingLocation === true
        );
        const vendor = incomingData.vendorName || '';
        const contractor = vendor; // Using vendor as contractor for naming        
        // Prepare file name with timestamp - include milliseconds and fileId for uniqueness
        const now = new Date();
        const timestamp = now.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
          .replace(",", "")
          .replace(/\s/g, "-");
        // Add milliseconds and a unique counter to ensure uniqueness for each file
        const milliseconds = now.getMilliseconds();
        // Use fileId converted to a unique string (combine timestamp and random parts)
        const uniqueId = Math.floor(fileId).toString().replace('.', '').slice(-8); // Use last 8 digits
        const originalFileName = file.name.replace(/\.[^/.]+$/, '').substring(0, 30); // Limit filename length
        const finalName = `${timestamp}-${milliseconds}-${uniqueId} ${selectedSite?.sNo || ''} ${vendor || contractor} ${originalFileName}`.trim();
        // Upload to Google Drive
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('file_name', finalName);
        const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
          method: "POST",
          body: formData,
        });
        if (!uploadResponse.ok) {
          throw new Error('File upload failed');
        }
        const uploadResult = await uploadResponse.json();
        const pdfUrl = uploadResult.url;
        // Convert file to JPG for preview
        const jpgFile = await convertFileToJPG(file);
        // Create preview URL for the converted JPG
        const previewUrl = URL.createObjectURL(jpgFile);
        setFilePreviews(prev => {
          const newPreviews = { ...prev, [fileId]: previewUrl };
          filePreviewsRef.current = newPreviews;
          return newPreviews;
        });
        // Complete upload
        clearInterval(progressInterval);
        setAttachedFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, progress: 100, status: 'completed', convertedFile: jpgFile, pdfUrl: pdfUrl, timeLeft: 0 }
            : f
        ));
      } catch (error) {
        clearInterval(progressInterval);
        setAttachedFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'error', progress: 0 }
            : f
        ));
        console.error('Error uploading file:', error);
        alert(`Error uploading file "${file.name}": ${error.message}`);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  // Handle file deletion
  const handleDeleteFile = (fileId) => {
    // Clean up preview URL
    if (filePreviews[fileId]) {
      URL.revokeObjectURL(filePreviews[fileId]);
      setFilePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[fileId];
        filePreviewsRef.current = newPreviews;
        return newPreviews;
      });
    }
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };
  // Save incoming inventory data
  const handleSaveIncoming = async () => {
    // Validate required fields
    if (!incomingData.vendorName || !incomingData.vendorId || !incomingData.stockingLocation) {
      alert('Please fill in all required fields (Vendor Name and Stocking Location)');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    try {
      // Find stocking location ID from siteOptions
      const stockingLocationSite = siteOptions.find(
        site => site.value === incomingData.stockingLocation && site.markedAsStockingLocation === true
      );
      if (!stockingLocationSite || !stockingLocationSite.id) {
        alert('Stocking location ID not found. Please select a valid stocking location.');
        return;
      }
      const stockingLocationId = stockingLocationSite.id;

      // Convert date from DD/MM/YYYY to YYYY-MM-DD format for backend
      const dateParts = incomingData.date.split('/');
      const formattedDate = dateParts.length === 3
        ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        : incomingData.date;

      // Prepare inventory items - ensure quantities are positive
      const inventoryItems = items.map(item => ({
        item_id: item.itemId || null,
        category_id: item.categoryId || null,
        model_id: item.modelId || null,
        brand_id: item.brandId || null,
        type_id: item.typeId || null,
        quantity: Math.abs(item.quantity || 0), // Always positive for incoming
        amount: Math.abs((item.price || 0) * (item.quantity || 0))
      }));

      // Check if this is an update or new record
      const isUpdate = isEditMode && incomingData.inventoryId;

      let payload = {
        vendor_id: incomingData.vendorId,
        stocking_location_id: stockingLocationId,
        inventory_type: 'incoming',
        date: formattedDate,
        purchase_no: incomingData.poNumber || 'NO_PO',
        created_by: (user && user.username) || '',
        inventoryItems: inventoryItems
      };

      // For new records, get ENO
      if (!isUpdate) {
        const countResponse = await fetch(
          `https://backendaab.in/aabuildersDash/api/inventory/incomingCount?stockingLocationId=${stockingLocationId}`
        );
        if (!countResponse.ok) {
          throw new Error('Failed to fetch incoming count');
        }
        const incomingCount = await countResponse.json();
        const eno = String(incomingCount + 1 || 0);
        payload.eno = eno;
      } else {
        // For updates, include the inventory ID
        payload.id = incomingData.inventoryId;
      }
      const username = (user && user.username) || '';
      // Save or update to backend
      const url = isUpdate
        ? `https://backendaab.in/aabuildersDash/api/inventory/edit_with_history/${incomingData.inventoryId}?changedBy=${encodeURIComponent(username)}`
        : 'https://backendaab.in/aabuildersDash/api/inventory/save';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save inventory data');
      }
      const savedData = await response.json();
      const inventoryManagementId = savedData.id || savedData.inventoryManagementId || savedData.inventory_management_id;
      if (!inventoryManagementId) {
        console.warn('Inventory management ID not found in saved data:', savedData);
      }
      if (inventoryManagementId && attachedFiles.length > 0) {
        const filesWithUrls = attachedFiles.filter(f => f.pdfUrl && f.status === 'completed');
        if (filesWithUrls.length > 0) {
          try {
            const pdfSavePromises = filesWithUrls.map(async (file) => {
              const pdfPayload = {
                incoming_pdf: file.pdfUrl,
                inventory_management_id: inventoryManagementId
              };
              const pdfResponse = await fetch('https://backendaab.in/aabuildersDash/api/incoming_pdfs/save', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(pdfPayload)
              });
              if (!pdfResponse.ok) {
                const errorData = await pdfResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to save PDF URL');
              }
              return await pdfResponse.json();
            });
            await Promise.all(pdfSavePromises);
          } catch (pdfError) {
            console.error('Error saving PDF URLs:', pdfError);
            alert(`Inventory saved successfully, but there was an error saving PDF attachments: ${pdfError.message}`);
          }
        }
      }
      alert(`Inventory data ${isUpdate ? 'updated' : 'saved'} successfully!`);
      // Reset form
      setIncomingData({
        poNumber: '',
        vendorName: '',
        vendorId: null,
        stockingLocation: '',
        date: getTodayDate(),
        inventoryId: null
      });
      setItems([]);
      setHasOpenedAdd(false);
      setIsEditMode(false);
      setAttachedFiles([]);
      setFilePreviews({});
      filePreviewsRef.current = {};
    } catch (error) {
      console.error('Error saving inventory:', error);
      alert(`Error saving inventory: ${error.message}`);
    }
  };
  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden">
      {/* PO Number and Date Row - Only show when not in empty state */}
      {!isEmptyState && (
        <div className="px-4">
          <div className="sticky top-[100px] z-30 bg-white flex items-center justify-between mt-2 border-b border-[#E0E0E0]">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  if (incomingData.vendorName && incomingData.stockingLocation) {
                    setShowPOModal(true);
                  }
                }}
                className={`text-[12px] font-medium leading-normal ${incomingData.poNumber
                  ? 'text-black'
                  : incomingData.vendorName && incomingData.stockingLocation
                    ? 'text-[#616161] underline-offset-2 hover:underline'
                    : 'text-[#9E9E9E]'
                  }`}
                disabled={!incomingData.vendorName || !incomingData.stockingLocation}
              >
                {incomingData.poNumber ? `#${incomingData.poNumber}` : '#PO'}
              </button>
              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="text-[12px] font-medium text-black leading-normal underline-offset-2 hover:underline"
              >
                {incomingData.date}
              </button>
            </div>
            <div className="flex items-center mb-2">
              {hasOpenedAdd && items.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveIncoming}
                  className="text-[13px] font-medium text-black leading-normal rounded-[8px] px-3 py-1.5 hover:bg-gray-100"
                >
                  {isEditMode ? 'Update' : 'Add to Stock'}
                </button>
              )}
              {hasOpenedAdd && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(true);
                    setHasOpenedAdd(false);
                  }}
                  className="flex items-center font-semibold justify-center rounded p-1"
                >
                  <img src={editIcon} alt="Edit" className="w-[15px] h-[15px]" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Form Fields - visible while you are selecting the fields (before first + click) */}
      {!showAddItems && !hasOpenedAdd && (
        <div className="px-4">
          {/* Date in empty state */}
          {isEmptyState && (
            <div className="sticky z-30 bg-white flex items-center justify-between mt-2 border-b border-[#E0E0E0]">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    if (incomingData.vendorName && incomingData.stockingLocation) {
                      setShowPOModal(true);
                    }
                  }}
                  className={`text-[12px] font-medium leading-normal ${incomingData.poNumber
                    ? 'text-black'
                    : incomingData.vendorName && incomingData.stockingLocation
                      ? 'text-[#616161] underline-offset-2 hover:underline'
                      : 'text-[#9E9E9E]'
                    }`}
                  disabled={!incomingData.vendorName || !incomingData.stockingLocation}
                >
                  {incomingData.poNumber ? `#${incomingData.poNumber}` : '#PO'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(true)}
                  className="text-[12px] font-medium text-black leading-normal underline-offset-2 hover:underline"
                >
                  {incomingData.date}
                </button>
              </div>
            </div>
          )}
          {/* Vendor Name Field */}
          <div className="space-y-[6px]">
            <div className="mt-2 relative">
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                Vendor Name<span className="text-[#eb2f8e]">*</span>
              </p>
              <div className="relative">
                <div
                  onClick={() => setShowVendorModal(true)}
                  className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
                  style={{
                    paddingRight: incomingData.vendorName ? '40px' : '12px',
                    boxSizing: 'border-box',
                    color: incomingData.vendorName ? '#000' : '#9E9E9E'
                  }}
                >
                  <span>{incomingData.vendorName || 'Select Vendor Name'}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {incomingData.vendorName && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIncomingData({ ...incomingData, vendorName: '', vendorId: null, poNumber: '' });
                      setItems([]); // Clear items when vendor is cleared
                    }}
                    className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    style={{ right: '24px' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Stocking Location Field */}
            <div className="relative">
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                Stocking Location<span className="text-[#eb2f8e]">*</span>
              </p>
              <div className="relative">
                <div
                  onClick={() => setShowStockingLocationModal(true)}
                  className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
                  style={{
                    paddingRight: incomingData.stockingLocation ? '40px' : '12px',
                    boxSizing: 'border-box',
                    color: incomingData.stockingLocation ? '#000' : '#9E9E9E'
                  }}
                >
                  <span>{incomingData.stockingLocation || 'Select Stocking Location'}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {incomingData.stockingLocation && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIncomingData({ ...incomingData, stockingLocation: '', poNumber: '' });
                    }}
                    className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    style={{ right: '24px' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Summary details card - show after first + click */}
      {hasOpenedAdd && !isEmptyState && (incomingData.vendorName || incomingData.stockingLocation) && (
        <div className="flex-shrink-0 mx-2 mb-1 p-2 bg-white border border-[#aaaaaa] rounded-[8px]">
          <div className="flex flex-col gap-2 px-2">
            {incomingData.vendorName && (
              <div className="flex items-start">
                <p className="text-[12px] font-medium text-[#3f3f3f] leading-normal w-[111px]">Vendor Name</p>
                <p className="text-[12px] font-medium text-black leading-normal mx-1">:</p>
                <p className="text-[12px] font-medium text-[#a6a6a6] leading-normal flex-1">{incomingData.vendorName}</p>
              </div>
            )}
            {incomingData.stockingLocation && (
              <div className="flex items-start">
                <p className="text-[12px] font-medium text-[#3f3f3f] leading-normal w-[111px]">Stocking Location</p>
                <p className="text-[12px] font-medium text-black leading-normal mx-1">:</p>
                <p className="text-[12px] font-medium text-[#a6a6a6] leading-normal flex-1">{incomingData.stockingLocation}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Filled State extras (items) - Show when fields are filled OR after opening add items OR in edit mode */}
      {(hasOpenedAdd || !isEmptyState || isEditMode) && (
        <>
          {/* Items Section - Show only when all fields are filled */}
          {(!isEmptyState || isEditMode) && incomingData.vendorName && incomingData.stockingLocation && (
            <div className="flex flex-col flex-1 min-h-0 mx-4 mb-4 mt-2">
              {/* Items Header - Fixed */}
              <div className="flex-shrink-0 flex items-center gap-2 mb-2 border-b border-[#E0E0E0] pb-2">
                <p className="text-[14px] font-medium text-black leading-normal">Items</p>
                <input
                  type="text"
                  value={items.length}
                  readOnly
                  className="w-[30px] h-[30px] border border-[rgba(0,0,0,0.16)] rounded-full px-2 text-[12px] font-medium text-black bg-gray-200 text-center"
                />
                <div className="ml-auto cursor-pointer" onClick={() => setShowSearchItemsModal(true)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
                    <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              {/* Loading indicator */}
              {loadingPOItems && (
                <div className="flex items-center justify-center py-8">
                  <p className="text-[14px] text-gray-500">Loading items...</p>
                </div>
              )}
              {/* Items List - Scrollable */}
              {!loadingPOItems && items.length > 0 && (
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <div className="space-y-2">
                    {items.map((item) => {
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
                        // Allow swiping left to reveal buttons, or swiping right to hide if already expanded
                        if (deltaX < 0 || (isExpanded && deltaX > 0)) {
                          if (e.preventDefault) {
                            e.preventDefault();
                          }
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
                            // Swiped left (reveal buttons) - only expand this card
                            setExpandedItemId(itemId);
                          } else {
                            // Swiped right (hide buttons)
                            setExpandedItemId(null);
                          }
                        } else {
                          // Small movement - snap back or close if already expanded
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
                      return (
                        <ItemCard
                          key={item.id}
                          item={item}
                          isExpanded={expandedItemId === item.id}
                          swipeState={swipeStates[item.id]}
                          onSwipeStart={handleTouchStart}
                          onSwipeMove={handleTouchMove}
                          onSwipeEnd={handleTouchEnd}
                          onEdit={() => {
                            setExpandedItemId(null);
                            setEditingItem(item);
                            setHasOpenedAdd(true);
                            setShowAddItems(true);
                          }}
                          onDelete={() => {
                            setExpandedItemId(null);
                            handleDeleteItem(item.id);
                          }}
                          onAmountChange={(itemId, newPrice) => {
                            const updatedItems = items.map(i =>
                              i.id === itemId ? { ...i, price: newPrice } : i
                            );
                            setItems(updatedItems);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {/* File Upload Button - Fixed position above + button */}
      {hasOpenedAdd && items.length > 0 && incomingData.vendorName && incomingData.stockingLocation && (
        <div className="fixed bottom-[170px] right-[24px] lg:right-[calc(50%-164px)] z-30">
          <button
            type="button"
            onClick={() => setShowFileUploadModal(true)}
            className="flex items-center gap-2 bg-black text-white rounded-full px-4 py-2.5 text-[14px] font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V10M8 2L5 5M8 2L11 5M3 10V13C3 13.5523 3.44772 14 4 14H12C12.5523 14 13 13.5523 13 13V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            File Upload
          </button>
        </div>
      )}
      {/* Add Button - Fixed position (only enabled when all required fields are filled) */}
      <AddButton
        onClick={() => {
          setHasOpenedAdd(true);
          setEditingItem(null);
          setShowAddItems(true);
        }}
        disabled={!areIncomingFieldsFilled}
        showNew={false}
      />
      {/* Modals */}
      <SelectVendorModal
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        onSelect={(value) => {
          const vendorOption = vendorNameOptions.find(opt => opt.value === value);
          setIncomingData({
            ...incomingData,
            vendorName: value,
            vendorId: vendorOption?.id || null,
            poNumber: '' // Clear PO number when vendor changes
          });
          setShowVendorModal(false);
        }}
        selectedValue={incomingData.vendorName}
        options={vendorOptions}
        fieldName="Vendor Name"
      />
      <SelectVendorModal
        isOpen={showStockingLocationModal}
        onClose={() => setShowStockingLocationModal(false)}
        onSelect={(value) => {
          setIncomingData({ ...incomingData, stockingLocation: value });
          setShowStockingLocationModal(false);
        }}
        selectedValue={incomingData.stockingLocation}
        options={stockingLocationOptions}
        fieldName="Stocking Location"
      />
      <AddItemsToIncoming
        isOpen={showAddItems}
        onClose={() => {
          setShowAddItems(false);
          setEditingItem(null);
        }}
        onAdd={handleAddItem}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        initialData={editingItem ? {
          itemName: editingItem.name ? editingItem.name.split(',')[0].trim() : '',
          model: editingItem.model || '',
          brand: editingItem.brand || '',
          type: editingItem.type || '',
          quantity: editingItem.quantity ? String(editingItem.quantity) : '',
          category: editingItem.name ? editingItem.name.split(',')[1]?.trim() || '' : '',
          itemId: editingItem.itemId || null,
          brandId: editingItem.brandId || null,
          modelId: editingItem.modelId || null,
          typeId: editingItem.typeId || null,
          categoryId: editingItem.categoryId || null,
        } : {}}
      />
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialDate={incomingData.date}
      />
      <SearchItemsModal
        isOpen={showSearchItemsModal}
        onClose={() => setShowSearchItemsModal(false)}
        onAdd={handleSearchAdd}
        getAvailableItems={getAvailableItems}
        existingItems={items}
        onRefreshData={fetchPoItemName}
        stockingLocationId={(() => {
          const stockingLocationSite = siteOptions.find(
            site => site.value === incomingData.stockingLocation && site.markedAsStockingLocation === true
          ); console.log("stockingLocationId", stockingLocationSite?.id);
          return stockingLocationSite?.id || null;
        })()}
        disableAvailabilityCheck={true}
      />
      <SelectPOModal
        isOpen={showPOModal}
        onClose={() => setShowPOModal(false)}
        onSelect={async (poNumber, cachedPOData) => {
          // If PO number changed, clear existing items first to avoid duplicates
          if (poNumber !== incomingData.poNumber && poNumber) {
            setItems([]);
          }
          setIncomingData({ ...incomingData, poNumber });
          setShowPOModal(false);
          // Fetch and add PO items to the items list - use cached data if available
          if (poNumber) {
            await fetchPOItems(poNumber, cachedPOData);
            // Set hasOpenedAdd to true so items are visible
            setHasOpenedAdd(true);
          } else {
            // If "Non PO" is selected, clear items
            setItems([]);
          }
        }}
        selectedValue={incomingData.poNumber}
        vendorName={incomingData.vendorName}
        vendorId={incomingData.vendorId}
        stockingLocation={incomingData.stockingLocation}
        allPurchaseOrders={allPurchaseOrders}
        onFetchPOs={fetchAllPurchaseOrders}
      />
      {/* File Upload Modal */}
      {showFileUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[350px] max-h-[70vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-[16px] font-semibold text-black">Upload and Attach files</h2>
              <button
                type="button"
                onClick={() => setShowFileUploadModal(false)}
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-4">
              <p className="text-[12px] font-medium text-[#616161] mb-4">Attachments will be of this invoice</p>
              {/* Upload Area */}
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#FF9800] rounded-[8px] p-8 mb-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
                <div className="flex flex-col items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
                    <path d="M24 8V32M24 8L18 14M24 8L30 14M12 32V40C12 41.1046 12.8954 42 14 42H34C35.1046 42 36 41.1046 36 40V32" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-[14px] font-medium text-[#FF9800] mb-1">Click to Upload</p>
                  <p className="text-[12px] font-medium text-[#9E9E9E]">(Max, File size: 5 MB)</p>
                </div>
              </div>
              {/* File Uploading Section */}
              {attachedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-[14px] font-semibold text-black mb-3">File Uploading</p>
                  <div className="space-y-3">
                    {attachedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-[8px] cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          if (file.status === 'completed' && filePreviews[file.id]) {
                            setSelectedFilePreview(filePreviews[file.id]);
                            setShowInvoicePreview(true);
                          }
                        }}
                      >
                        {/* File Icon/Preview */}
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {filePreviews[file.id] && file.status === 'completed' ? (
                            <img
                              src={filePreviews[file.id]}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 3C4.44772 3 4 3.44772 4 4V16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16V7.41421C16 7.149 15.8946 6.89464 15.7071 6.70711L11.2929 2.29289C11.1054 2.10536 10.851 2 10.5858 2H5Z" stroke="#616161" strokeWidth="1.5" />
                              <path d="M11 2V7H16" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-black truncate">{file.name}</p>
                          {file.status === 'uploading' && (
                            <>
                              <p className="text-[11px] font-medium text-[#9E9E9E] mt-1">
                                {(file.size / 1024 / 1024).toFixed(2)} MB - {file.timeLeft} sec left
                              </p>
                              {/* Progress Bar */}
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-[#FF9800] h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${file.progress}%` }}
                                />
                              </div>
                            </>
                          )}
                          {file.status === 'completed' && (
                            <p className="text-[11px] font-medium text-[#26bf94] mt-1">
                              {(file.size / 1024 / 1024).toFixed(2)} MB - Uploaded
                            </p>
                          )}
                          {file.status === 'error' && (
                            <p className="text-[11px] font-medium text-[#eb2f8e] mt-1">
                              Upload failed
                            </p>
                          )}
                        </div>
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4L12 12M12 4L4 12" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Invoice Preview Modal */}
      {showInvoicePreview && selectedFilePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center p-2">
          {/* Close Button - Above the image, centered */}
          <button
            type="button"
            onClick={() => {
              setShowInvoicePreview(false);
              setSelectedFilePreview(null);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors z-[60] ml-[320px] shadow-sm mb-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="#E4572E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="bg-white rounded-[8px] w-full h-full max-w-[18vw] max-h-[55vh] overflow-hidden flex flex-col shadow-lg">
            {/* Invoice Image Content - White background like document */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
              <img
                src={selectedFilePreview}
                alt="Invoice"
                className="w-full h-auto object-contain"
                style={{ display: 'block', maxWidth: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Incoming;