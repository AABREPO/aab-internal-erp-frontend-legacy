import React, { useState, useEffect, useRef, useCallback } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import AddButton from '../PurchaseOrder/AddButton';
import AddItemsToOutgoing from './AddItemsToOutgoing';
import ItemCard from '../PurchaseOrder/ItemCard';
import DeleteConfirmModal from '../PurchaseOrder/DeleteConfirmModal';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import SearchItemsModal from '../PurchaseOrder/SearchItemsModal';
import editIcon from '../Images/edit.png';
import SR from '../Images/SR.png';
import DP from '../Images/DP.png';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Outgoing = ({ user }) => {
  // Helper functions for date
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };
  // Outgoing page state
  const [outgoingData, setOutgoingData] = useState({
    projectName: '',
    projectIncharge: '',
    stockingLocation: '',
    contact: '',
    date: getTodayDate()
  });
  // State to track selected incharge with contact info
  const [selectedIncharge, setSelectedIncharge] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showInchargeModal, setShowInchargeModal] = useState(false);
  const [showStockingLocationModal, setShowStockingLocationModal] = useState(false);
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
  const [hideSummaryCard, setHideSummaryCard] = useState(false);
  const [showSearchItemsModal, setShowSearchItemsModal] = useState(false);
  const [poItemName, setPoItemName] = useState([]);
  const [poBrand, setPoBrand] = useState([]);
  const [poModel, setPoModel] = useState([]);
  const [poType, setPoType] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const expandedItemIdRef = useRef(expandedItemId);
  // State for edit mode additional fields
  const [editTransactionId, setEditTransactionId] = useState('');
  const [editingInventoryId, setEditingInventoryId] = useState(null);
  const [pendingItemsFromClone, setPendingItemsFromClone] = useState([]);
  const [fromHistory, setFromHistory] = useState(false);
  // Outgoing page options (same as PurchaseOrder but independent)
  const [outgoingSiteOptions, setOutgoingSiteOptions] = useState([]);
  const [outgoingProjectOptions, setOutgoingProjectOptions] = useState([]);
  const [outgoingEmployeeList, setOutgoingEmployeeList] = useState([]);
  const [outgoingInchargeOptions, setOutgoingInchargeOptions] = useState([]);
  const [stockingLocationOptions, setStockingLocationOptions] = useState([]);
  const [allSiteData, setAllSiteData] = useState([]); // Store full site data including markedAsStockingLocation
  // Fetch project names (sites) from API for Outgoing page (same as PurchaseOrder)
  useEffect(() => {
    const fetchOutgoingSites = async () => {
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
        // Store full site data
        setAllSiteData(data);
        const formattedData = data.map(item => ({
          value: item.siteName,
          label: item.siteName,
          sNo: item.siteNo,
          id: item.id,
          markedAsStockingLocation: item.markedAsStockingLocation || false,
        }));
        setOutgoingSiteOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchOutgoingSites();
  }, []);
  // Extract project names as strings for the dropdown
  useEffect(() => {
    setOutgoingProjectOptions(outgoingSiteOptions.map(option => option.value));
  }, [outgoingSiteOptions]);
  // Fetch employee list from API for Outgoing page (same as PurchaseOrder)
  useEffect(() => {
    const fetchOutgoingEmployeeList = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll');
        if (response.ok) {
          const data = await response.json();
          const siteEngineers = data.filter(
            (emp) => emp.role_of_employee === 'Site Engineer'
          );
          setOutgoingEmployeeList(siteEngineers);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchOutgoingEmployeeList();
  }, []);
  // Extract employee names as strings for the dropdown
  useEffect(() => {
    const extracted = outgoingEmployeeList.map(employee => {
      return employee.employeeName || employee.name || employee.fullName || employee.employee_name || '';
    }).filter(name => name !== '');
    setOutgoingInchargeOptions(extracted);
  }, [outgoingEmployeeList]);
  // Fetch stocking locations with markedAsStockingLocation=true for all sites
  const fetchStockingLocations = async () => {
    try {
      // Filter sites where markedAsStockingLocation is true
      const stockingLocations = outgoingSiteOptions
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
  // Fetch stocking locations when site options are available
  useEffect(() => {
    if (outgoingSiteOptions.length > 0) {
      fetchStockingLocations();
    }
  }, [outgoingSiteOptions]);
  // Check if all required fields are filled (for enabling AddButton)
  const areOutgoingFieldsFilled = outgoingData.projectName && outgoingData.projectIncharge && outgoingData.stockingLocation;
  // Check if we're in empty/home state
  const isEmptyState = !outgoingData.projectName && !outgoingData.projectIncharge && !outgoingData.stockingLocation && items.length === 0 && !isEditMode;
  const handleDateConfirm = (date) => {
    setOutgoingData({ ...outgoingData, date });
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
      console.error('Error fetching PO brand:', error);
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
      console.error('Error fetching PO model:', error);
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
      console.error('Error fetching PO type:', error);
    }
  }, []);
  // Fetch category options from API
  const fetchCategoryOptions = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll');
      if (response.ok) {
        const data = await response.json();
        setCategoryOptions(data);
      }
    } catch (error) {
      console.error('Error fetching category options:', error);
    }
  }, []);
  // Initial fetch on mount
  useEffect(() => {
    fetchPoItemName();
    fetchPoBrand();
    fetchPoModel();
    fetchPoType();
    fetchCategoryOptions();
  }, [fetchPoItemName, fetchPoBrand, fetchPoModel, fetchPoType, fetchCategoryOptions]);
  // Helper functions to resolve IDs to names
  const findNameById = (array, id, fieldName) => {
    if (!array || !id || id === 0) return '';
    const item = array.find(i => {
      const itemId = i.id || i._id;
      return String(itemId) === String(id) || Number(itemId) === Number(id);
    });
    if (!item) {
      console.log(`Could not find ${fieldName} for ID ${id} in array of length ${array.length}`);
      return '';
    }
    return item[fieldName] || item.name || item.label || '';
  };
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
  // Helper function to resolve category ID
  const resolveCategoryId = (categoryName) => {
    if (!categoryName || !categoryOptions.length) return null;
    const category = categoryOptions.find(cat => {
      const label = (cat.label || cat.name || cat.categoryName || '').toLowerCase().trim();
      return label === categoryName.toLowerCase().trim();
    });
    return category ? (category.id || category._id || null) : null;
  };
  // Listen for editInventory event from History component
  useEffect(() => {
    const handleEditInventory = async (event) => {
      const inventoryItem = event.detail;
      if (!inventoryItem) return;
      if (outgoingSiteOptions.length === 0 || outgoingEmployeeList.length === 0) {
        localStorage.setItem('editingInventory', JSON.stringify(inventoryItem));
        return;
      }
      // Format date
      const itemDate = inventoryItem.date || inventoryItem.created_at || inventoryItem.createdAt;
      const formattedDate = itemDate ? formatDate(itemDate) : getTodayDate();
      // Get project name from client_id
      const clientId = inventoryItem.client_id || inventoryItem.clientId;
      let projectName = '';
      if (clientId && outgoingSiteOptions.length > 0) {
        const projectSite = outgoingSiteOptions.find(site =>
          site.id === clientId ||
          String(site.id) === String(clientId)
        );
        projectName = projectSite ? (projectSite.value || projectSite.label || '') : '';
      }
      // Fallback to direct field if client_id mapping fails
      if (!projectName) {
        projectName = inventoryItem.project_name || inventoryItem.projectName || '';
      }
      // Get contact from site_incharge_mobile_number or contact field
      const contact = inventoryItem.site_incharge_mobile_number || inventoryItem.siteInchargeMobileNumber || inventoryItem.contact || '';
      // Get stocking location from stocking_location_id
      const stockingLocationId = inventoryItem.stocking_location_id || inventoryItem.stockingLocationId;
      let stockingLocation = '';
      if (stockingLocationId && outgoingSiteOptions.length > 0) {
        const stockingLocationSite = outgoingSiteOptions.find(site =>
          (site.id === stockingLocationId || String(site.id) === String(stockingLocationId)) &&
          site.markedAsStockingLocation === true
        );
        stockingLocation = stockingLocationSite ? (stockingLocationSite.value || stockingLocationSite.label || '') : '';
      }
      // Fallback to direct field if ID mapping fails
      if (!stockingLocation) {
        stockingLocation = inventoryItem.stocking_location || inventoryItem.stockingLocation || '';
      }
      // Find and set selected incharge by ID
      const inchargeId = inventoryItem.site_incharge_id || inventoryItem.siteInchargeId || null;
      let projectInchargeName = inventoryItem.project_incharge || inventoryItem.projectIncharge || '';
      if (inchargeId && outgoingEmployeeList.length > 0) {
        const employee = outgoingEmployeeList.find(emp =>
          String(emp.id) === String(inchargeId)
        );
        if (employee) {
          projectInchargeName = employee.employeeName || employee.name || employee.fullName || employee.employee_name || projectInchargeName;
          setSelectedIncharge({
            id: employee.id,
            name: projectInchargeName,
            mobileNumber: employee.employee_mobile_number || employee.mobileNumber || employee.mobile_number || employee.contact || contact || '',
            type: 'employee'
          });
        }
      } else if (projectInchargeName && outgoingEmployeeList.length > 0) {
        // Fallback: find by name if ID not available
        const employee = outgoingEmployeeList.find(emp => {
          const empName = emp.employeeName || emp.name || emp.fullName || emp.employee_name || '';
          return empName === projectInchargeName;
        });
        if (employee) {
          projectInchargeName = employee.employeeName || employee.name || employee.fullName || employee.employee_name || projectInchargeName;
          setSelectedIncharge({
            id: employee.id,
            name: projectInchargeName,
            mobileNumber: employee.employee_mobile_number || employee.mobileNumber || employee.mobile_number || employee.contact || contact || '',
            type: 'employee'
          });
        }
      }
      // Ensure projectInchargeName is set even if employee not found
      if (!projectInchargeName) {
        projectInchargeName = inventoryItem.project_incharge || inventoryItem.projectIncharge || '';
      }
      // Load inventory items
      const inventoryItems = inventoryItem.inventoryItems || inventoryItem.inventory_items || [];
      let formattedItems = [];
      if (Array.isArray(inventoryItems) && inventoryItems.length > 0) {
        // Generate IDs starting from 1 (fresh start for edit)
        formattedItems = inventoryItems.map((invItem, index) => {
          // Get IDs from the inventory item
          const itemId = invItem.item_id || invItem.itemId || null;
          const brandId = invItem.brand_id || invItem.brandId || null;
          const modelId = invItem.model_id || invItem.modelId || null;
          const typeId = invItem.type_id || invItem.typeId || null;
          const categoryId = invItem.category_id || invItem.categoryId || null;
          // Resolve names from IDs using helper functions
          let itemName = invItem.itemName || invItem.item_name || '';
          let brand = invItem.brandName || invItem.brand_name || invItem.brand || '';
          let model = invItem.modelName || invItem.model_name || invItem.model || '';
          let type = invItem.typeName || invItem.type_name || invItem.type || '';
          let category = invItem.categoryName || invItem.category_name || invItem.category || '';
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
          const formattedItem = {
            id: index + 1,
            name: itemName && category ? `${itemName}, ${category}` : itemName || '',
            brand: brand || '',
            model: model || '',
            type: type || '',
            category: category || '',
            quantity: Math.abs(invItem.qty || invItem.quantity || invItem.Qty || invItem.Quantity || 0),
            price: 0,
            itemId: itemId,
            brandId: brandId,
            modelId: modelId,
            typeId: typeId,
            categoryId: categoryId,
          };
          return formattedItem;
        });
      }
      // Get outgoing type before using it
      const outgoingType = inventoryItem.outgoing_type || inventoryItem.outgoingType || '';
      // Load inventory data into form
      setOutgoingData({
        projectName: projectName,
        projectIncharge: projectInchargeName,
        stockingLocation: stockingLocation,
        contact: contact,
        date: formattedDate,
        outgoingType: outgoingType
      });
      // Calculate transaction ID (same format as History.jsx)
      const dateObj = new Date(itemDate);
      const year = dateObj.getFullYear();
      const entryNumber = inventoryItem.eno || inventoryItem.ENO || inventoryItem.entry_number || inventoryItem.entryNumber || inventoryItem.entrynumber || inventoryItem.id || '';
      let transactionId = '';
      if (outgoingType.toLowerCase() === 'stock return' || outgoingType.toLowerCase() === 'stockreturn') {
        transactionId = `SR - ${year} - ${entryNumber}`;
      } else if (outgoingType.toLowerCase() === 'dispatch') {
        transactionId = `DP - ${year} - ${entryNumber}`;
      } else {
        transactionId = `SR - ${year} - ${entryNumber}`;
      }
      // Set edit mode fields
      setEditTransactionId(transactionId);
      const isEditModeFlag = inventoryItem.isEditMode === true;
      setIsEditMode(isEditModeFlag);
      // Check if coming from History (view mode)
      const fromHistoryFlag = inventoryItem.fromHistory === true;
      setFromHistory(fromHistoryFlag);
      // Store inventory ID only if in edit mode (for updates)
      if (isEditModeFlag && inventoryItem.id) {
        setEditingInventoryId(inventoryItem.id);
      } else {
        setEditingInventoryId(null);
      }
      // Both edit and clone mode should set items immediately
      setItems(formattedItems);
      setHasOpenedAdd(formattedItems.length > 0);
      // When cloning (not edit mode, not from history), show form fields instead of summary card
      if (!isEditModeFlag && !fromHistoryFlag && formattedItems.length > 0) {
        setHideSummaryCard(true);
      } else if (isEditModeFlag && fromHistoryFlag) {
        // When editing from history, show summary card by default
        setHideSummaryCard(false);
      }
    };
    window.addEventListener('editInventory', handleEditInventory);
    return () => {
      window.removeEventListener('editInventory', handleEditInventory);
    };
  }, [outgoingEmployeeList, outgoingSiteOptions, poItemName, poBrand, poModel, poType, categoryOptions]);
  useEffect(() => {
    const editingInventory = localStorage.getItem('editingInventory');
    if (editingInventory && outgoingSiteOptions.length > 0 && outgoingEmployeeList.length > 0) {
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
  }, [outgoingEmployeeList, outgoingSiteOptions]);
  // Re-resolve item names when API data loads (for items already in state)
  useEffect(() => {
    if (items.length > 0 && (poItemName.length > 0 || poBrand.length > 0 || poModel.length > 0 || poType.length > 0 || categoryOptions.length > 0)) {
      const updatedItems = items.map(item => {
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
        const original = items[index];
        return updatedItem.name !== original.name ||
          updatedItem.brand !== original.brand ||
          updatedItem.model !== original.model ||
          updatedItem.type !== original.type ||
          updatedItem.category !== original.category;
      });
      if (hasChanges) {
        setItems(updatedItems);
      }
    }
  }, [poItemName, poBrand, poModel, poType, categoryOptions, isEditMode]);
  // Get available items function - returns the actual API data structure
  const getAvailableItems = useCallback(() => {
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
  const handleSearchAdd = async (item, quantity, isIncremental = false) => {
    // Check if stocking location is selected
    if (!outgoingData.stockingLocation) {
      alert('Please select a Stocking Location first');
      return;
    }
    // Get stocking location ID
    const stockingLocationSite = outgoingSiteOptions.find(
      site => site.value === outgoingData.stockingLocation && site.markedAsStockingLocation === true
    );
    if (!stockingLocationSite || !stockingLocationSite.id) {
      alert('Stocking location ID not found. Please select a valid stocking location.');
      return;
    }
    const stockingLocationId = stockingLocationSite.id;
    const itemId = item.itemId || item.item_id || null;
    // Normalize values for comparison (used for both stock check and item matching)
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
    // Calculate what the final quantity would be (considering merge with existing item)
    let finalQuantity = quantity;
    if (existingItemIndex !== -1) {
      const currentQuantity = items[existingItemIndex].quantity || 0;
      finalQuantity = isIncremental ? currentQuantity + quantity : quantity;
    }
    // Check stock availability and get amount for this item in the selected stocking location
    let itemPrice = 0; // Default price
    if (itemId !== null && itemId !== undefined) {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/inventory/getAll');
        if (response.ok) {
          const inventoryRecords = await response.json();
          // Filter out deleted records and filter by stocking location
          const activeRecords = inventoryRecords.filter(record => {
            const recordDeleteStatus = record.delete_status !== undefined ? record.delete_status : record.deleteStatus;
            const recordStockingLocationId = record.stocking_location_id || record.stockingLocationId;
            return !recordDeleteStatus && String(recordStockingLocationId) === String(stockingLocationId);
          });
          // Calculate available stock and find amount for this item in this location
          let availableStock = 0;
          const matchingAmounts = []; // Store amounts found for this item          
          activeRecords.forEach(record => {
            const inventoryItems = record.inventoryItems || record.inventory_items || [];
            if (Array.isArray(inventoryItems)) {
              inventoryItems.forEach(invItem => {
                const invItemId = invItem.item_id || invItem.itemId || null;
                const invCategoryId = invItem.category_id || invItem.categoryId || null;
                const invModelId = invItem.model_id || invItem.modelId || null;
                const invBrandId = invItem.brand_id || invItem.brandId || null;
                const invTypeId = invItem.type_id || invItem.typeId || null;
                // Match by composite key: itemId + categoryId + modelId + brandId + typeId
                const matchesItem = String(invItemId) === String(itemId) &&
                  String(invCategoryId || 'null') === String(item.categoryId || 'null') &&
                  String(invModelId || 'null') === String(item.modelId || 'null') &&
                  String(invBrandId || 'null') === String(item.brandId || 'null') &&
                  String(invTypeId || 'null') === String(item.typeId || 'null');
                if (matchesItem) {
                  const qty = Number(invItem.quantity) || 0;
                  availableStock += qty;
                  // Get amount and calculate price per unit
                  const amount = Number(invItem.amount) || 0;
                  if (amount > 0 && qty > 0) {
                    const pricePerUnit = amount / Math.abs(qty); // Use absolute quantity for price calculation
                    matchingAmounts.push(pricePerUnit);
                  }
                }
              });
            }
          });
          // If multiple amounts exist, use the first one
          if (matchingAmounts.length > 0) {
            itemPrice = matchingAmounts[0];
          }
        }
      } catch (error) {
        console.error('Error checking stock availability:', error);
        // Continue with adding item if API fails (don't block user)
      }
    }
    if (existingItemIndex !== -1) {
      const updatedItems = [...items];
      const currentQuantity = updatedItems[existingItemIndex].quantity || 0;
      const newQuantity = isIncremental ? currentQuantity + quantity : quantity;
      if (newQuantity > 0) {
        // Use fetched price if available, otherwise keep existing price
        const finalPrice = itemPrice > 0 ? itemPrice : (updatedItems[existingItemIndex].price || 0);
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
          price: finalPrice
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
      const newItem = {
        id: newItemId,
        name: `${item.itemName}, ${item.category}`,
        brand: item.brand,
        model: item.model,
        type: item.type,
        category: item.category || '',
        quantity: quantity,
        price: itemPrice, // Use price fetched from inventory (first amount if multiple exist)
        itemId: item.itemId || null,
        brandId: item.brandId || null,
        modelId: item.modelId || null,
        typeId: item.typeId || null,
        categoryId: item.categoryId || null,
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
  // Download PDF function
  const handleDownloadPDF = () => {
    if (items.length === 0) {
      alert('No items to download');
      return;
    }
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    // Title
    doc.setFontSize(16);
    doc.text(editTransactionId || 'Outgoing Inventory', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    // Project Information
    doc.setFontSize(12);
    yPos += 5;
    doc.text(`Project Name: ${outgoingData.projectName || ''}`, 14, yPos);
    yPos += 7;
    doc.text(`Project Incharge: ${outgoingData.projectIncharge || ''}`, 14, yPos);
    yPos += 7;
    doc.text(`Stocking Location: ${outgoingData.stockingLocation || ''}`, 14, yPos);
    yPos += 7;
    doc.text(`Date: ${outgoingData.date || ''}`, 14, yPos);
    yPos += 10;
    // Items Table
    const tableData = items.map((item, index) => {
      const itemNameParts = item.name ? item.name.split(',') : [];
      const itemName = itemNameParts[0] || '';
      const category = itemNameParts[1] || item.category || '';
      return [
        index + 1,
        itemName,
        category,
        item.model || '',
        item.brand || '',
        item.type || '',
        item.quantity || 0
      ];
    });
    doc.autoTable({
      head: [['S.No', 'Item Name', 'Category', 'Model', 'Brand', 'Type', 'Quantity']],
      body: tableData,
      startY: yPos,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      margin: { left: 14, right: 14 }
    });
    // Total Quantity
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Quantity: ${totalQuantity}`, 14, finalY);
    // Save PDF
    const fileName = editTransactionId ? `${editTransactionId}.pdf` : `Outgoing_${outgoingData.date || 'Inventory'}.pdf`;
    doc.save(fileName);
  };
  // Save outgoing inventory data (for both dispatch and stock return)
  const handleSaveOutgoing = async (outgoingType) => {
    // Validate required fields
    if (!outgoingData.projectName || !outgoingData.projectIncharge || !outgoingData.stockingLocation) {
      alert('Please fill in all required fields (Project Name, Project Incharge, and Stocking Location)');
      return;
    }
    const username = (user && user.username) || '';
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    // Validate that all items have a category
    for (const item of items) {
      if (!item.categoryId && !item.category) {
        const itemName = item.name ? item.name.split(',')[0].trim() : 'item';
        alert(`Please select a category for "${itemName}". Category is required for all items.`);
        return;
      }
    }
    if (!selectedIncharge || !selectedIncharge.id) {
      alert('Project Incharge ID not found. Please select a valid project incharge.');
      return;
    }
    try {
      // Find stocking location ID from outgoingSiteOptions
      const stockingLocationSite = outgoingSiteOptions.find(
        site => site.value === outgoingData.stockingLocation && site.markedAsStockingLocation === true
      );
      if (!stockingLocationSite || !stockingLocationSite.id) {
        alert('Stocking location ID not found. Please select a valid stocking location.');
        return;
      }
      const stockingLocationId = stockingLocationSite.id;
      // Find project/client ID from outgoingSiteOptions (needed for stock return validation)
      const projectSite = outgoingSiteOptions.find(
        site => site.value === outgoingData.projectName
      );
      if (!projectSite || !projectSite.id) {
        alert('Project ID not found. Please select a valid project.');
        return;
      }
      const clientId = projectSite.id;
      if ((outgoingType || '').toLowerCase() === 'dispatch' && !isEditMode) {
        try {
          const inventoryResponse = await fetch('https://backendaab.in/aabuildersDash/api/inventory/getAll');
          if (inventoryResponse.ok) {
            const inventoryRecords = await inventoryResponse.json();
            const activeRecords = inventoryRecords.filter(record => {
              const recordDeleteStatus = record.delete_status !== undefined ? record.delete_status : record.deleteStatus;
              return !recordDeleteStatus;
            });
            // Check each item in the items array
            for (const item of items) {
              const itemId = item.itemId || null;
              if (itemId !== null && itemId !== undefined) {
                // Calculate available stock for this item in this location, taking transfers into account
                let availableStock = 0;
                activeRecords.forEach(record => {
                  const recordStockingLocationId = record.stocking_location_id || record.stockingLocationId || null;
                  const inventoryType = (record.inventory_type || record.inventoryType || '').toString().toLowerCase();
                  const toStockingLocationId = record.to_stocking_location_id || record.toStockingLocationId || null;
                  const inventoryItems = record.inventoryItems || record.inventory_items || [];
                  if (Array.isArray(inventoryItems)) {
                    inventoryItems.forEach(invItem => {
                      const invItemId = invItem.item_id || invItem.itemId || null;
                      if (String(invItemId) === String(itemId)) {
                        const qty = Number(invItem.quantity) || 0;
                        if (inventoryType === 'transfer' && toStockingLocationId) {
                          // Subtract from source, add to destination
                          if (String(recordStockingLocationId) === String(stockingLocationId)) {
                            availableStock -= qty;
                          } else if (String(toStockingLocationId) === String(stockingLocationId)) {
                            availableStock += qty;
                          }
                        } else {
                          // Non-transfer: only count if record belongs to this location
                          if (String(recordStockingLocationId) === String(stockingLocationId)) {
                            availableStock += qty;
                          }
                        }
                      }
                    });
                  }
                });
                // Get requested quantity (use absolute value since quantity can be negative for dispatch)
                const requestedQuantity = Math.abs(item.quantity || 0);
                // If item is not available (stock <= 0), show alert and prevent save
                if (availableStock <= 0) {
                  const itemName = item.name ? item.name.split(',')[0].trim() : 'this item';
                  alert(`Item "${itemName}" is not available in the selected Stocking Location "${outgoingData.stockingLocation}". Available stock: ${availableStock}`);
                  return;
                }
                // If requested quantity exceeds available stock, show alert and prevent save
                if (requestedQuantity > availableStock) {
                  const itemName = item.name ? item.name.split(',')[0].trim() : 'this item';
                  alert(`Item "${itemName}" has only ${availableStock} qty available in the selected Stocking Location "${outgoingData.stockingLocation}". You requested ${requestedQuantity} qty.`);
                  return;
                }
              }
            }
          }
        } catch (error) {
          console.error('Error validating item availability:', error);
          // Continue with save if validation fails (don't block user)
        }
      }
      // Validate stock return: check if return quantity exceeds dispatch quantity for this client_id
      if ((outgoingType || '').toLowerCase() === 'stock return' || (outgoingType || '').toLowerCase() === 'stockreturn') {
        try {
          const inventoryResponse = await fetch('https://backendaab.in/aabuildersDash/api/inventory/getAll');
          if (inventoryResponse.ok) {
            const inventoryRecords = await inventoryResponse.json();
            // Filter for outgoing records for this client_id (not deleted)
            const clientOutgoingRecords = inventoryRecords.filter(record => {
              const recordDeleteStatus = record.delete_status !== undefined ? record.delete_status : record.deleteStatus;
              const recordClientId = record.client_id || record.clientId;
              const inventoryType = (record.inventory_type || record.inventoryType || '').toString().toLowerCase();
              return !recordDeleteStatus &&
                String(recordClientId) === String(clientId) &&
                inventoryType === 'outgoing';
            });
            // Check if this is an update (edit mode) - we need to exclude current record from calculations
            const isUpdate = isEditMode && editingInventoryId;
            // Check each item being returned
            for (const item of items) {
              const itemId = item.itemId || null;
              const categoryId = item.categoryId || null;
              const modelId = item.modelId || null;
              const brandId = item.brandId || null;
              const typeId = item.typeId || null;
              const returnQuantity = Math.abs(item.quantity || 0);
              if (itemId === null || itemId === undefined) {
                continue; // Skip items without itemId
              }
              // Calculate total dispatched quantity and total already returned quantity for this item
              let totalDispatched = 0;
              let totalReturned = 0;
              clientOutgoingRecords.forEach(record => {
                // Skip current record if editing (to exclude it from calculations)
                if (isUpdate && (record.id === editingInventoryId || record._id === editingInventoryId)) {
                  return;
                }
                const outgoingType = (record.outgoing_type || record.outgoingType || '').toString().toLowerCase();
                const inventoryItems = record.inventoryItems || record.inventory_items || [];
                if (Array.isArray(inventoryItems)) {
                  inventoryItems.forEach(invItem => {
                    const invItemId = invItem.item_id || invItem.itemId || null;
                    const invCategoryId = invItem.category_id || invItem.categoryId || null;
                    const invModelId = invItem.model_id || invItem.modelId || null;
                    const invBrandId = invItem.brand_id || invItem.brandId || null;
                    const invTypeId = invItem.type_id || invItem.typeId || null;
                    // Match by composite key: itemId + categoryId + modelId + brandId + typeId
                    const matchesItem = String(invItemId) === String(itemId) &&
                      String(invCategoryId || 'null') === String(categoryId || 'null') &&
                      String(invModelId || 'null') === String(modelId || 'null') &&
                      String(invBrandId || 'null') === String(brandId || 'null') &&
                      String(invTypeId || 'null') === String(typeId || 'null');
                    if (matchesItem) {
                      const qty = Number(invItem.quantity) || 0;
                      if (outgoingType === 'dispatch') {
                        // Dispatch has negative quantity, so we add the absolute value
                        totalDispatched += Math.abs(qty);
                      } else if (outgoingType === 'stock return' || outgoingType === 'stockreturn') {
                        // Stock return has positive quantity
                        totalReturned += Math.abs(qty);
                      }
                    }
                  });
                }
              });
              // Calculate maximum returnable quantity
              const maxReturnable = totalDispatched - totalReturned;
              // Check if item was ever dispatched
              if (totalDispatched === 0) {
                const itemName = item.name ? item.name.split(',')[0].trim() : 'this item';
                alert(`Cannot return item "${itemName}". This item was never dispatched to "${outgoingData.projectName}". Only dispatched items can be returned.`);
                return;
              }
              // Check if return quantity exceeds maximum returnable
              if (returnQuantity > maxReturnable) {
                const itemName = item.name ? item.name.split(',')[0].trim() : 'this item';
                alert(
                  `Cannot return ${returnQuantity} qty of "${itemName}".\n\n` +
                  `For client "${outgoingData.projectName}":\n` +
                  `- Total dispatched: ${totalDispatched} qty\n` +
                  `- Already returned: ${totalReturned} qty\n` +
                  `- Maximum returnable: ${maxReturnable} qty\n\n` +
                  `Please reduce the return quantity to ${maxReturnable} qty or less.`
                );
                return;
              }
            }
          }
        } catch (error) {
          console.error('Error validating stock return:', error);
          alert('Error validating stock return. Please try again.');
          return;
        }
      }
      const siteInchargeId = selectedIncharge.id;
      const siteInchargeMobileNumber = outgoingData.contact || selectedIncharge.mobileNumber || '';
      // Check if this is an update (edit mode) or create new (clone mode)
      const isUpdate = isEditMode && editingInventoryId;
      let eno = '';
      if (!isUpdate) {
        // Get outgoing count for ENO only for new records
        const countResponse = await fetch(
          `https://backendaab.in/aabuildersDash/api/inventory/outgoingCount?stockingLocationId=${stockingLocationId}`
        );
        if (!countResponse.ok) {
          throw new Error('Failed to fetch outgoing count');
        }
        const outgoingCount = await countResponse.json();
        eno = String(outgoingCount + 1 || 0);
      }
      // Convert date from DD/MM/YYYY to YYYY-MM-DD format for backend
      const dateParts = outgoingData.date.split('/');
      const formattedDate = dateParts.length === 3
        ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        : outgoingData.date;
      const inventoryItems = items.map(item => {
        const baseQuantity = Math.abs(item.quantity || 0);
        const quantity = outgoingType === 'dispatch' ? -baseQuantity : baseQuantity;
        // Resolve categoryId if not already present
        let categoryId = item.categoryId || null;
        if (!categoryId && item.category && categoryOptions.length > 0) {
          const categoryOption = categoryOptions.find(cat => {
            const catName = (cat.category || cat.name || cat.label || '').toLowerCase().trim();
            const itemCategory = item.category.toLowerCase().trim();
            return catName === itemCategory;
          });
          categoryId = categoryOption ? (categoryOption.id || categoryOption._id || null) : null;
        }
        // Category is mandatory - throw error if still missing
        if (!categoryId) {
          const itemName = item.name ? item.name.split(',')[0].trim() : 'item';
          throw new Error(`Category is required for "${itemName}". Please select a category.`);
        }
        return {
          item_id: item.itemId || null,
          category_id: categoryId, // Category is now mandatory
          model_id: item.modelId || null,
          brand_id: item.brandId || null,
          type_id: item.typeId || null,
          quantity: quantity,
          amount: Math.abs((item.price || 0) * baseQuantity)
        };
      });
      // Prepare payload
      const payload = {
        client_id: clientId,
        stocking_location_id: stockingLocationId,
        inventory_type: 'outgoing',
        outgoing_type: outgoingType,
        site_incharge_id: siteInchargeId,
        site_incharge_type: selectedIncharge.type || 'employee',
        date: formattedDate,
        site_incharge_mobile_number: siteInchargeMobileNumber,
        created_by: (user && user.username) || '',
        inventoryItems: inventoryItems
      };
      // Add eno only for new records
      if (!isUpdate) {
        payload.eno = eno;
      }
      // Determine API endpoint and method
      const apiUrl = isUpdate
        ? `https://backendaab.in/aabuildersDash/api/inventory/edit_with_history/${editingInventoryId}?changedBy=${encodeURIComponent(username)}`
        : 'https://backendaab.in/aabuildersDash/api/inventory/save';
      const method = isUpdate ? 'PUT' : 'POST';
      // Save/Update to backend
      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isUpdate ? 'update' : 'save'} inventory data`);
      }
      const savedData = await response.json();
      alert(`Inventory data ${isUpdate ? 'updated' : 'saved'} successfully!`);
      // Reset form
      setOutgoingData({
        projectName: '',
        projectIncharge: '',
        stockingLocation: '',
        contact: '',
        date: getTodayDate()
      });
      setSelectedIncharge(null);
      setItems([]);
      setHasOpenedAdd(false);
      setIsEditMode(false);
      setFromHistory(false);
      // Clear edit mode fields
      setEditTransactionId('');
      setEditingInventoryId(null);
    } catch (error) {
      console.error('Error saving inventory:', error);
      alert(`Error saving inventory: ${error.message}`);
    }
  };
  return (
    <div className="flex flex-col px-4 h-[calc(100vh-90px-80px)] overflow-hidden">
      {/* Date and Actions Row - Only show when not in empty state */}
      {!isEmptyState && (
        <div className="items-center px-4 border-b border-[#E0E0E0]">
          <div className="sticky top-[100px] z-30 bg-white flex items-center justify-between mb-2 ">
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="text-[12px] font-semibold text-black leading-normal underline-offset-2 hover:underline"
            >
              {outgoingData.date}
            </button>
            <div className="flex items-center">
              {isEditMode && fromHistory ? (
                <button type="button" onClick={() => handleSaveOutgoing(outgoingData.outgoingType || 'stock return')}
                  className="flex items-center text-[13px] font-semibold text-black leading-normal hover:bg-gray-100 rounded-[8px] px-2 py-1.5"
                >
                  Update
                </button>
              ) : fromHistory && !isEditMode && ((outgoingData.outgoingType || '').toLowerCase() === 'stock return' || (outgoingData.outgoingType || '').toLowerCase() === 'stockreturn') ? (
                <button type="button" onClick={() => handleDownloadPDF()}
                  className="flex items-center text-[13px] font-semibold text-black leading-normal hover:bg-gray-100 rounded-[8px] px-2 py-1.5"
                >
                  Download
                </button>
              ) : fromHistory && !isEditMode && (outgoingData.outgoingType || '').toLowerCase() === 'dispatch' ? (
                <button type="button" onClick={() => handleDownloadPDF()}
                  className="flex items-center text-[13px] font-semibold text-black leading-normal hover:bg-gray-100 rounded-[8px] px-2 py-1.5"
                >
                  Download
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => handleSaveOutgoing('stock return')}
                    className="flex items-center text-[12px] gap-1 font-semibold text-black leading-normal hover:bg-gray-100 rounded-[8px] px-2 py-1.5"
                  >
                    Stock Return <img src={SR} alt="SR" className="w-[11px] h-[11px]" />
                  </button>
                  <button type="button" onClick={() => handleSaveOutgoing('dispatch')}
                    className="flex items-center text-[12px] gap-1 font-semibold text-black leading-normal hover:bg-gray-100 rounded-[8px] px-2 py-1.5"
                  >
                    Dispatch <img src={DP} alt="DP" className="w-[11px] h-[11px]" />
                  </button>
                  {hasOpenedAdd && (
                    <button
                      type="button"
                      onClick={() => {
                        setHideSummaryCard(true);
                        setIsEditMode(true);
                      }}
                      className="flex items-center font-semibold justify-center rounded ml-1"
                    >
                      <img src={editIcon} alt="Edit" className="w-[15px] h-[15px]" />
                    </button>
                  )}
                </>
              )}
              {hasOpenedAdd && isEditMode && fromHistory && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(true);
                    setHasOpenedAdd(false);
                    setHideSummaryCard(true);
                  }}
                  className="flex items-center font-semibold justify-center rounded"
                >
                  <img src={editIcon} alt="Edit" className="w-[15px] h-[15px]" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Form Fields - visible while you are selecting the three fields (before first + click) or when hideSummaryCard is true */}
      {(!hasOpenedAdd || hideSummaryCard) && (
        <div className=" ">
          {/* Date in empty state */}
          {isEmptyState && (
            <div className="mb-2 items-center border-b border-gray-200 pb-1 mt-0.5">
              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="text-[12px] font-medium text-black leading-normal underline-offset-2 hover:underline"
              >
                {outgoingData.date}
              </button>
            </div>
          )}
          {/* Project Name Field */}
          <div className="space-y-[6px]">
            <div className=" relative">
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                Project Name<span className="text-[#eb2f8e]">*</span>
              </p>
              <div className="relative">
                <div
                  onClick={() => setShowProjectModal(true)}
                  className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                  style={{
                    boxSizing: 'border-box',
                    color: outgoingData.projectName ? '#000' : '#9E9E9E'
                  }}
                >
                  <span>{outgoingData.projectName || 'Select Project Name'}</span>
                </div>
                {outgoingData.projectName ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOutgoingData({ ...outgoingData, projectName: '' });
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            {/* Project Incharge Field */}
            <div className=" relative">
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                Project Incharge<span className="text-[#eb2f8e]">*</span>
              </p>
              <div className="relative">
                <div
                  onClick={() => setShowInchargeModal(true)}
                  className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                  style={{
                    boxSizing: 'border-box',
                    color: outgoingData.projectIncharge ? '#000' : '#9E9E9E'
                  }}
                >
                  <span>{outgoingData.projectIncharge || 'Select Project Incharge'}</span>
                </div>
                {outgoingData.projectIncharge ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIncharge(null);
                      setOutgoingData({ ...outgoingData, projectIncharge: '', contact: '' });
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
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
                  className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                  style={{
                    boxSizing: 'border-box',
                    color: outgoingData.stockingLocation ? '#000' : '#9E9E9E'
                  }}
                >
                  <span>{outgoingData.stockingLocation || 'Select Stocking Location'}</span>
                </div>
                {outgoingData.stockingLocation ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOutgoingData({ ...outgoingData, stockingLocation: '' });
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Summary details card - show after first + click or in edit mode */}
      {(hasOpenedAdd || isEditMode) && !hideSummaryCard && !isEmptyState && (outgoingData.projectName || outgoingData.projectIncharge || outgoingData.stockingLocation) && (
        <div className="flex-shrink-0 mx-2 mb-1 p-2 bg-white border border-[#aaaaaa] rounded-[8px]">
          <div className="flex flex-col gap-2 px-2">
            {outgoingData.projectName && (
              <div className="flex items-start">
                <p className="text-[12px] font-medium text-[#3f3f3f] leading-normal w-[111px]">Project Name</p>
                <p className="text-[12px] font-medium text-black leading-normal mx-1">:</p>
                <p className="text-[12px] font-medium text-[#a6a6a6] leading-normal flex-1">{outgoingData.projectName}</p>
              </div>
            )}
            {outgoingData.projectIncharge && (
              <div className="flex items-start">
                <p className="text-[12px] font-medium text-[#3f3f3f] leading-normal w-[111px]">Project Incharge</p>
                <p className="text-[12px] font-medium text-black leading-normal mx-1">:</p>
                <p className="text-[12px] font-medium text-[#a6a6a6] leading-normal flex-1">{outgoingData.projectIncharge}</p>
              </div>
            )}
            {outgoingData.stockingLocation && (
              <div className="flex items-start">
                <p className="text-[12px] font-medium text-[#3f3f3f] leading-normal w-[111px]">Stocking Location</p>
                <p className="text-[12px] font-medium text-black leading-normal mx-1">:</p>
                <p className="text-[12px] font-medium text-[#a6a6a6] leading-normal flex-1">{outgoingData.stockingLocation}</p>
              </div>
            )}
            {(outgoingData.contact || (selectedIncharge && (selectedIncharge.mobileNumber || selectedIncharge.mobile_number || selectedIncharge.contact))) && (
              <div className="flex items-start">
                <p className="text-[12px] font-medium text-[#3f3f3f] leading-normal w-[111px]">Contact</p>
                <p className="text-[12px] font-medium text-black leading-normal mx-1">:</p>
                <p className="text-[12px] font-medium text-[#a6a6a6] leading-normal flex-1">
                  {outgoingData.contact || selectedIncharge?.mobileNumber || selectedIncharge?.mobile_number || selectedIncharge?.contact}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Filled State extras (items) - Show when fields are filled OR after opening add items OR in edit mode */}
      {(hasOpenedAdd || !isEmptyState || isEditMode) && (
        <>
          {/* Items Section - Show only when all three fields are filled */}
          {(!isEmptyState || isEditMode) && outgoingData.projectName && outgoingData.projectIncharge && outgoingData.stockingLocation && (
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
              {/* Items List - Scrollable */}
              {items.length > 0 && (
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <div className="space-y-2">
                    {items.map((item, index) => {
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
                          hideButtons={fromHistory && !isEditMode}
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
      {/* Add Button - Fixed position (only enabled when all required fields are filled) */}
      <AddButton
        onClick={() => {
          if (fromHistory && !isEditMode) {
            // Reset to main outgoing page when clicking "+ New"
            setOutgoingData({
              projectName: '',
              projectIncharge: '',
              stockingLocation: '',
              contact: '',
              date: getTodayDate()
            });
            setSelectedIncharge(null);
            setItems([]);
            setHasOpenedAdd(false);
            setIsEditMode(false);
            setFromHistory(false);
            setEditTransactionId('');
            setEditingInventoryId(null);
            setHideSummaryCard(false);
          } else {
            setHasOpenedAdd(true);
            setEditingItem(null);
            setShowAddItems(true);
          }
        }}
        disabled={fromHistory && !isEditMode ? false : !areOutgoingFieldsFilled}
        showNew={fromHistory && !isEditMode}
      />
      {/* Modals */}
      <SelectVendorModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelect={(value) => {
          setOutgoingData({ ...outgoingData, projectName: value });
          setShowProjectModal(false);
        }}
        selectedValue={outgoingData.projectName}
        options={outgoingProjectOptions}
        fieldName="Project Name"
      />
      <SelectVendorModal
        isOpen={showInchargeModal}
        onClose={() => setShowInchargeModal(false)}
        onSelect={(value) => {
          // Find the selected employee to get contact info
          const selectedEmployee = outgoingEmployeeList.find(emp => {
            const empName = emp.employeeName || emp.name || emp.fullName || emp.employee_name || '';
            return empName === value;
          });
          if (selectedEmployee) {
            const contactNumber = selectedEmployee.employee_mobile_number || selectedEmployee.mobileNumber || selectedEmployee.mobile_number || selectedEmployee.contact || '';
            setSelectedIncharge({
              id: selectedEmployee.id,
              name: value,
              mobileNumber: contactNumber,
              type: 'employee'
            });
            setOutgoingData({
              ...outgoingData,
              projectIncharge: value,
              contact: contactNumber
            });
          } else {
            setSelectedIncharge(null);
            setOutgoingData({ ...outgoingData, projectIncharge: value, contact: '' });
          }
          setShowInchargeModal(false);
        }}
        selectedValue={outgoingData.projectIncharge}
        options={outgoingInchargeOptions}
        fieldName="Project Incharge"
      />
      <SelectVendorModal
        isOpen={showStockingLocationModal}
        onClose={() => setShowStockingLocationModal(false)}
        onSelect={(value) => {
          setOutgoingData({ ...outgoingData, stockingLocation: value });
          setShowStockingLocationModal(false);
        }}
        selectedValue={outgoingData.stockingLocation}
        options={stockingLocationOptions}
        fieldName="Stocking Location"
      />
      <AddItemsToOutgoing
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
          category: editingItem.category || (editingItem.name && editingItem.name.includes(',') ? editingItem.name.split(',')[1]?.trim() || '' : '') || '',
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
        initialDate={outgoingData.date}
      />
      <SearchItemsModal
        isOpen={showSearchItemsModal}
        onClose={() => setShowSearchItemsModal(false)}
        onAdd={handleSearchAdd}
        getAvailableItems={getAvailableItems}
        existingItems={items}
        onRefreshData={fetchPoItemName}
        stockingLocationId={(() => {
          const stockingLocationSite = outgoingSiteOptions.find(
            site => site.value === outgoingData.stockingLocation && site.markedAsStockingLocation === true
          );
          return stockingLocationSite?.id || null;
        })()}
        useInventoryData={true}
      />
    </div>
  );
};

export default Outgoing;