import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import SearchItemsModal from '../PurchaseOrder/SearchItemsModal';
import Edit from '../Images/edit.png'
import Change1 from '../Images/right-left.png'
import Change2 from '../Images/two-arrow.png'
import { to } from 'mathjs';

const EditStock = () => {
  const [activeSubTab, setActiveSubTab] = useState('transfer'); // 'transfer', 'update', 'history'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [fromLocation, setFromLocation] = useState('Stock Room A');
  const [showFromModal, setShowFromModal] = useState(false);
  const [toLocation, setToLocation] = useState('Stock Room B');
  const [showToModal, setShowToModal] = useState(false);
  const [itemsCount, setItemsCount] = useState(0);
  const [items, setItems] = useState([]);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showSearchItemsModal, setShowSearchItemsModal] = useState(false);
  const [poItemName, setPoItemName] = useState([]);
  const [poBrand, setPoBrand] = useState([]);
  const [poModel, setPoModel] = useState([]);
  const [poType, setPoType] = useState([]);
  const [poCategoryOptions, setPoCategoryOptions] = useState([]);
  const [stockRoomOptions, setStockRoomOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [swipeStates, setSwipeStates] = useState({});
  const [allProjectNames, setAllProjectNames] = useState([]);
  const [isFromUpdate, setIsFromUpdate] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [selectedEno, setSelectedEno] = useState('');
  const [showEnoModal, setShowEnoModal] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filterData, setFilterData] = useState({
    stockingLocation: '',
    itemName: '',
    transfer: '',
    update: ''
  });
  const [stockingLocationFilterOpen, setStockingLocationFilterOpen] = useState(false);
  const [itemNameFilterOpen, setItemNameFilterOpen] = useState(false);
  const [transferFilterOpen, setTransferFilterOpen] = useState(false);
  const [updateFilterOpen, setUpdateFilterOpen] = useState(false);
  const [stockingLocationFilterSearch, setStockingLocationFilterSearch] = useState('');
  const [itemNameFilterSearch, setItemNameFilterSearch] = useState('');
  const [transferFilterSearch, setTransferFilterSearch] = useState('');
  const [updateFilterSearch, setUpdateFilterSearch] = useState('');
  const blockClickRef = useRef(false);
  const filterTagsContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  // Swipe handlers for desktop
  const handleMouseDown = (index, e) => {
    e.preventDefault();
    const startX = e.clientX;
    let hasMoved = false;
    let translateX = 0;
    const mouseMoveHandler = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      if (Math.abs(deltaX) > 10) {
        hasMoved = true;
        translateX = deltaX;
      }
    };
    const mouseUpHandler = () => {
      // Only delete if there was actual movement and significant swipe left
      if (hasMoved && translateX < -100) {
        // Swipe left to delete
        setItems(prev => prev.filter((_, i) => i !== index));
        setItemsCount(prev => prev - 1);
      }
      // Clean up event listeners
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };
  const handleMouseMove = useCallback((index, e) => {
    if (!swipeStates[index]) return;
    const deltaX = e.clientX - swipeStates[index].startX;
    if (Math.abs(deltaX) > 10) {
      setSwipeStates(prev => ({
        ...prev,
        [index]: { ...prev[index], isSwiping: true, translateX: deltaX }
      }));
    }
  }, [swipeStates]);
  const handleMouseUp = useCallback((index) => {
    if (!swipeStates[index]) return;
    const { translateX } = swipeStates[index];
    if (translateX && translateX < -100) {
      // Swipe left to delete
      setItems(prev => prev.filter((_, i) => i !== index));
      setItemsCount(prev => prev - 1);
    }
    setSwipeStates(prev => ({
      ...prev,
      [index]: { ...prev[index], isSwiping: false, translateX: 0 }
    }));
    document.removeEventListener('mousemove', (e) => handleMouseMove(index, e));
    document.removeEventListener('mouseup', () => handleMouseUp(index));
  }, [swipeStates]);
  const [updateSelectedLocation, setUpdateSelectedLocation] = useState('');
  const [showUpdateLocationModal, setShowUpdateLocationModal] = useState(false);
  const [updateSearchQuery, setUpdateSearchQuery] = useState('');
  const [updateStockData, setUpdateStockData] = useState([]);
  const [filteredUpdateData, setFilteredUpdateData] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState([]);
  const [itemNamesData, setItemNamesData] = useState([]);
  const [locationNamesMap, setLocationNamesMap] = useState({});
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [showMoveStockModal, setShowMoveStockModal] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  const [currentStock, setCurrentStock] = useState('');
  const [newCount, setNewCount] = useState('');
  // Move stock modal fields
  const [moveProject, setMoveProject] = useState('');
  const [moveProjectId, setMoveProjectId] = useState(null);
  const [moveDescription, setMoveDescription] = useState('');
  const [showMoveProjectModal, setShowMoveProjectModal] = useState(false);
  const cardRefs = React.useRef({});
  const expandedItemIdRef = React.useRef(null);
  const swipeCleanupRef = React.useRef([]);
  // Fetch category options
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = data.map(item => ({
            value: item.category || item.name || item.label,
            label: item.category || item.name || item.label,
            id: item.id
          })).filter(item => item.value);
          setCategoryOptions(options);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);
  // Fetch stock room locations from project names (marked as stocking locations)
  useEffect(() => {
    const fetchStockRooms = async () => {
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
          // Filter for locations marked as stocking locations, or include all as fallback
          const allProjectNames = data.map(item => ({
            value: item.siteName || item.site_name || '',
            label: item.siteName || item.site_name || '',
            id: item.id
          }));
          setAllProjectNames(allProjectNames);
          const stockRooms = data
            .filter(item => item.markedAsStockingLocation === true)
            .map(item => ({
              value: item.siteName || item.site_name || '',
              label: item.siteName || item.site_name || '',
              id: item.id
            }))
            .filter(item => item.value);
          setStockRoomOptions(stockRooms);
        }
      } catch (error) {
        console.error("Error fetching stock rooms:", error);
        // Set default options
        setStockRoomOptions([
          { value: 'Stock Room A', label: 'Stock Room A', id: null },
          { value: 'Stock Room B', label: 'Stock Room B', id: null }
        ]);
      }
    };
    fetchStockRooms();
  }, []);
  // Fetch PO item names, brands, models, types, and categories
  useEffect(() => {
    const fetchPOData = async () => {
      try {
        const [itemNamesRes, brandsRes, modelsRes, typesRes, categoriesRes] = await Promise.all([
          fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll')
        ]);
        if (itemNamesRes.ok) {
          const data = await itemNamesRes.json();
          setPoItemName(data);
        }
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          setPoBrand(data);
        }
        if (modelsRes.ok) {
          const data = await modelsRes.json();
          setPoModel(data);
        }
        if (typesRes.ok) {
          const data = await typesRes.json();
          setPoType(data);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          const options = (data || []).map(item => ({
            value: item.category || item.categoryName || item.name || '',
            label: item.category || item.categoryName || item.name || '',
            id: item.id || item._id || null,
          }));
          setPoCategoryOptions(options);
        }
      } catch (error) {
        console.error('Error fetching PO data:', error);
      }
    };
    fetchPOData();
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
  // Fetch function for refreshing data
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
  // Fetch location names mapping for Update tab
  useEffect(() => {
    const fetchLocationNames = async () => {
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
          const nameMap = {};
          data.forEach(site => {
            if (site.id) {
              nameMap[String(site.id)] = site.siteName || '';
            }
          });
          setLocationNamesMap(nameMap);
        }
      } catch (error) {
        console.error('Error fetching location names:', error);
      }
    };
    fetchLocationNames();
  }, []);
  // Fetch item names from API for Update tab
  useEffect(() => {
    const fetchItemNames = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
        if (response.ok) {
          const data = await response.json();
          setItemNamesData(data);
        }
      } catch (error) {
        console.error('Error fetching item names:', error);
      }
    };
    fetchItemNames();
  }, []);
  // Calculate net stock from inventory data based on selected location (similar to NetStock)
  // Handles transfer items properly: subtract from source and add to destination
  const calculateNetStock = useCallback((inventoryRecords, selectedLocationId) => {
    // Filter out deleted records
    const activeRecords = inventoryRecords.filter(record => {
      const recordDeleteStatus = record.delete_status !== undefined ? record.delete_status : record.deleteStatus;
      return !recordDeleteStatus;
    });
    // Group by composite key: item_id-category_id-model_id-brand_id-type_id
    // Calculate net stock for each unique combination. For transfer records we treat them specially:
    // - When viewing a specific location: subtract from source (stocking_location_id) and add to destination (to_stocking_location_id)
    // - When viewing across all locations (selectedLocationId is falsy): transfer is neutral (no net change)
    const stockMap = {}; // Key: composite key, Value: net stock quantity
    activeRecords.forEach(record => {
      const recordStockingLocationId = record.stocking_location_id || record.stockingLocationId;
      const inventoryType = (record.inventory_type || record.inventoryType || '').toString().toLowerCase();
      const toStockingLocationId = record.to_stocking_location_id || record.toStockingLocationId || null;
      const inventoryItems = record.inventoryItems || record.inventory_items || [];
      if (Array.isArray(inventoryItems)) {
        inventoryItems.forEach(invItem => {
          const itemId = invItem.item_id || invItem.itemId || null;
          const categoryId = invItem.category_id || invItem.categoryId || null;
          const modelId = invItem.model_id || invItem.modelId || null;
          const brandId = invItem.brand_id || invItem.brandId || null;
          const typeId = invItem.type_id || invItem.typeId || null;
          if (itemId !== null && itemId !== undefined) {
            // Create composite key for unique combination
            const compositeKey = `${itemId || 'null'}-${categoryId || 'null'}-${modelId || 'null'}-${brandId || 'null'}-${typeId || 'null'}`;
            if (!stockMap[compositeKey]) {
              stockMap[compositeKey] = {
                itemId: itemId,
                categoryId: categoryId,
                modelId: modelId,
                brandId: brandId,
                typeId: typeId,
                quantity: 0
              };
            }
            // Convert quantity to number
            const quantity = Number(invItem.quantity) || 0;
            let delta = 0;
            if (!selectedLocationId) {
              // Viewing across all locations: transfers are neutral (they move stock between locations)
              if (inventoryType === 'transfer' && toStockingLocationId) {
                delta = 0;
              } else {
                delta = quantity;
              }
            } else {
              // Viewing a specific location: adjust based on whether the record is source or destination of a transfer
              if (inventoryType === 'transfer' && toStockingLocationId) {
                if (String(recordStockingLocationId) === String(selectedLocationId)) {
                  // stock moved out from this location
                  delta = -quantity;
                } else if (String(toStockingLocationId) === String(selectedLocationId)) {
                  // stock moved into this location
                  delta = quantity;
                } else {
                  delta = 0; // transfer unrelated to this location
                }
              } else {
                // Non-transfer and belongs to this location
                if (String(recordStockingLocationId) === String(selectedLocationId)) {
                  delta = quantity;
                } else {
                  delta = 0;
                }
              }
            }
            stockMap[compositeKey].quantity += delta;
          }
        });
      }
    });
    // Convert to array format for processing and ensure non-negative net stock
    return Object.values(stockMap).map(item => ({
      ...item,
      netStock: Math.max(0, item.quantity) // Ensure non-negative
    }));
  }, []);
  // Fetch inventory data for Update tab
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setUpdateLoading(true);
        const response = await fetch('https://backendaab.in/aabuildersDash/api/inventory/getAll');
        if (!response.ok) {
          console.error('Failed to fetch inventory data');
          setUpdateLoading(false);
          return;
        }
        const inventoryRecords = await response.json();
        setInventoryData(inventoryRecords);
        setUpdateLoading(false);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setUpdateLoading(false);
      }
    };
    fetchInventory();
  }, []);
  // Process inventory items for Update tab (similar to NetStock)
  useEffect(() => {
    if (inventoryData.length === 0 || itemNamesData.length === 0 || poBrand.length === 0 || poModel.length === 0 || poType.length === 0) {
      if (inventoryData.length === 0 && !updateLoading) {
        setUpdateStockData([]);
      }
      return;
    }
    const selectedLocationOption = stockRoomOptions.find(loc =>
      (loc.value || loc) === updateSelectedLocation || (loc.label || loc) === updateSelectedLocation
    );
    const selectedLocationId = selectedLocationOption?.id || null;
    const stockQuantities = calculateNetStock(inventoryData, selectedLocationId);
    setUpdateLoading(true);
    const processedData = [];
    const itemNameMap = {};
    const entityMap = {};
    itemNamesData.forEach(item => {
      const itemId = item.id || item._id || null;
      if (itemId) {
        itemNameMap[String(itemId)] = item;
        const otherPOEntityList = item.otherPOEntityList || [];
        otherPOEntityList.forEach(entity => {
          const entityItemId = entity.itemId || itemId;
          const brandId = entity.brandId || entity.brand_id || null;
          const modelId = entity.modelId || entity.model_id || null;
          const typeId = entity.typeId || entity.type_id || null;
          const categoryId = item.categoryId || item.category_id || null;
          const entityKey = `${entityItemId || 'null'}-${categoryId || 'null'}-${modelId || 'null'}-${brandId || 'null'}-${typeId || 'null'}`;
          entityMap[entityKey] = {
            ...entity,
            itemName: item.itemName || item.poItemName || item.name || '',
            categoryId: categoryId,
            itemId: entityItemId
          };
        });
      }
    });
    stockQuantities.forEach(invItem => {
      const itemId = invItem.itemId;
      const categoryId = invItem.categoryId;
      const modelId = invItem.modelId;
      const brandId = invItem.brandId;
      const typeId = invItem.typeId;
      const netStock = invItem.netStock;
      const compositeKey = `${itemId || 'null'}-${categoryId || 'null'}-${modelId || 'null'}-${brandId || 'null'}-${typeId || 'null'}`;
      const matchedEntity = entityMap[compositeKey];
      if (matchedEntity) {
        const itemName = matchedEntity.itemName || '';
        const brand = matchedEntity.brandName || '';
        const model = matchedEntity.modelName || '';
        const type = matchedEntity.typeColor || '';
        const categoryIdFromEntity = matchedEntity.categoryId || categoryId;
        let categoryName = '';
        if (categoryIdFromEntity) {
          const categoryOption = poCategoryOptions.find(cat =>
            String(cat.id) === String(categoryIdFromEntity)
          );
          categoryName = categoryOption?.label || categoryOption?.value || '';
        }
        const locationId = selectedLocationId;
        const locationName = locationId ? (locationNamesMap[String(locationId)] || updateSelectedLocation || '') : '';
        processedData.push({
          id: compositeKey,
          itemId: itemId,
          itemName: itemName,
          model: model,
          brand: brand,
          type: type,
          category: categoryName,
          netStock: netStock,
          location: locationName,
          brandId: brandId,
          modelId: modelId,
          typeId: typeId,
          categoryId: categoryIdFromEntity,
          locationId: locationId
        });
      } else {
        const itemData = itemNameMap[String(itemId)];
        if (itemData) {
          const itemName = itemData.itemName || itemData.poItemName || itemData.name || '';
          const categoryIdFromItem = itemData.categoryId || itemData.category_id || categoryId;
          let categoryName = '';
          if (categoryIdFromItem) {
            const categoryOption = poCategoryOptions.find(cat =>
              String(cat.id) === String(categoryIdFromItem)
            );
            categoryName = categoryOption?.label || categoryOption?.value || '';
          }
          const findNameById = (array, id, fieldName) => {
            if (!id || !array || array.length === 0) return '';
            const item = array.find(i => String(i.id || i._id) === String(id));
            return item ? (item[fieldName] || item.name || '') : '';
          };
          const brandName = brandId ? findNameById(poBrand, brandId, 'brand') : '';
          const modelName = modelId ? findNameById(poModel, modelId, 'model') : '';
          const typeName = typeId ? findNameById(poType, typeId, 'typeColor') || findNameById(poType, typeId, 'type') : '';
          const locationId = selectedLocationId;
          const locationName = locationId ? (locationNamesMap[String(locationId)] || updateSelectedLocation || '') : '';
          processedData.push({
            id: compositeKey,
            itemId: itemId,
            itemName: itemName,
            model: modelName,
            brand: brandName,
            type: typeName,
            category: categoryName,
            netStock: netStock,
            location: locationName,
            brandId: brandId,
            modelId: modelId,
            typeId: typeId,
            categoryId: categoryIdFromItem,
            locationId: locationId
          });
        }
      }
    });
    setUpdateStockData(processedData);
    setUpdateLoading(false);
  }, [inventoryData, itemNamesData, poBrand, poModel, poType, poCategoryOptions, updateSelectedLocation, stockRoomOptions, locationNamesMap, calculateNetStock, updateLoading]);
  // Filter update data based on category and search
  useEffect(() => {
    let filtered = [...updateStockData];
    if (selectedCategory) {
      filtered = filtered.filter(item => {
        const itemCategory = item.category || '';
        const categoryOption = categoryOptions.find(cat =>
          (cat.value || cat) === selectedCategory || (cat.label || cat) === selectedCategory
        );
        const selectedCategoryValue = categoryOption?.value || categoryOption?.label || selectedCategory;
        const selectedCategoryId = categoryOption?.id || null;
        return itemCategory === selectedCategory ||
          itemCategory === selectedCategoryValue ||
          itemCategory.toLowerCase() === selectedCategory.toLowerCase() ||
          (selectedCategoryId && String(item.categoryId) === String(selectedCategoryId));
      });
    }
    if (updateSearchQuery.trim()) {
      const query = updateSearchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        String(item.itemId || '').toLowerCase().includes(query) ||
        (item.itemName || '').toLowerCase().includes(query) ||
        (item.model || '').toLowerCase().includes(query) ||
        (item.brand || '').toLowerCase().includes(query) ||
        (item.type || '').toLowerCase().includes(query) ||
        (item.category || '').toLowerCase().includes(query)
      );
    }
    setFilteredUpdateData(filtered);
  }, [selectedCategory, updateSearchQuery, updateStockData, categoryOptions]);
  // Recalculate when location changes
  useEffect(() => {
    if (inventoryData.length === 0) return;
    const selectedLocationOption = stockRoomOptions.find(loc =>
      (loc.value || loc) === updateSelectedLocation || (loc.label || loc) === updateSelectedLocation
    );
    const selectedLocationId = selectedLocationOption?.id || null;
    const stockQuantities = calculateNetStock(inventoryData, selectedLocationId);
    // Trigger re-processing by setting updateLoading
    setUpdateLoading(true);
    setTimeout(() => setUpdateLoading(false), 100);
  }, [updateSelectedLocation, inventoryData, stockRoomOptions, calculateNetStock]);
  // Update ref when expandedItemId changes
  useEffect(() => {
    expandedItemIdRef.current = expandedItemId;
  }, [expandedItemId]);
  // Swipe handlers for Update tab
  const minSwipeDistance = 50;
  // Set up swipe event listeners (matching PurchaseOrder History pattern)
  useEffect(() => {
    if (activeSubTab !== 'update' || filteredUpdateData.length === 0) {
      // Clean up when not on update tab
      swipeCleanupRef.current.forEach(cleanup => cleanup());
      swipeCleanupRef.current = [];
      return;
    }
    // Delay to ensure refs are set after render
    const timeoutId = setTimeout(() => {
      // Global mouse event handlers for desktop support
      const globalMouseMoveHandler = (e) => {
        setSwipeStates(prev => {
          let hasChanges = false;
          const newState = { ...prev };
          filteredUpdateData.forEach((item, index) => {
            const itemId = `${item.itemId}-${item.categoryId}-${item.modelId}-${item.brandId}-${item.typeId}-${index}`;
            const state = prev[itemId];
            if (!state) return;
            const deltaX = e.clientX - state.startX;
            const isExpanded = expandedItemIdRef.current === itemId;
            // Only update if dragging horizontally
            if (deltaX < 0 || (isExpanded && deltaX > 0)) {
              newState[itemId] = {
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
          filteredUpdateData.forEach((item, index) => {
            const itemId = `${item.itemId}-${item.categoryId}-${item.modelId}-${item.brandId}-${item.typeId}-${index}`;
            const state = prev[itemId];
            if (!state) return;
            const deltaX = state.currentX - state.startX;
            const absDeltaX = Math.abs(deltaX);
            if (absDeltaX >= minSwipeDistance) {
              blockClickRef.current = true;
              if (deltaX < 0) {
                setExpandedItemId(itemId);
              } else {
                setExpandedItemId(null);
              }
            } else {
              if (expandedItemIdRef.current === itemId) {
                setExpandedItemId(null);
              }
            }
            delete newState[itemId];
            hasChanges = true;
          });
          return hasChanges ? newState : prev;
        });
      };
      // Add global mouse event listeners
      document.addEventListener('mousemove', globalMouseMoveHandler);
      document.addEventListener('mouseup', globalMouseUpHandler);
      swipeCleanupRef.current.push(() => {
        document.removeEventListener('mousemove', globalMouseMoveHandler);
        document.removeEventListener('mouseup', globalMouseUpHandler);
      });
      // Set up event listeners for each card
      filteredUpdateData.forEach((item, index) => {
        const itemId = `${item.itemId}-${item.categoryId}-${item.modelId}-${item.brandId}-${item.typeId}-${index}`;
        const element = cardRefs.current[itemId];
        if (!element) return;
        const touchStartHandler = (e) => {
          const touch = e.touches[0];
          e.preventDefault();
          setSwipeStates(prev => ({
            ...prev,
            [itemId]: {
              startX: touch.clientX,
              currentX: touch.clientX,
              isSwiping: false
            }
          }));
        };
        const touchMoveHandler = (e) => {
          const touch = e.touches[0];
          setSwipeStates(prev => {
            const state = prev[itemId];
            if (!state) return prev;
            const deltaX = touch.clientX - state.startX;
            const isExpanded = expandedItemIdRef.current === itemId;
            if (deltaX < 0 || (isExpanded && deltaX > 0)) {
              e.preventDefault();
              return {
                ...prev,
                [itemId]: {
                  ...prev[itemId],
                  currentX: touch.clientX,
                  isSwiping: true
                }
              };
            }
            return prev;
          });
        };
        const touchEndHandler = () => {
          setSwipeStates(prev => {
            const state = prev[itemId];
            if (!state) return prev;
            const deltaX = state.currentX - state.startX;
            const absDeltaX = Math.abs(deltaX);
            if (absDeltaX >= minSwipeDistance) {
              blockClickRef.current = true;
              if (deltaX < 0) {
                setExpandedItemId(itemId);
              } else {
                setExpandedItemId(null);
              }
            } else {
              if (expandedItemIdRef.current === itemId) {
                setExpandedItemId(null);
              }
            }
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
          });
        };
        const mouseDownHandler = (e) => {
          e.preventDefault();
          setSwipeStates(prev => ({
            ...prev,
            [itemId]: {
              startX: e.clientX,
              currentX: e.clientX,
              isSwiping: false
            }
          }));
        };
        // Add event listeners
        element.addEventListener('touchstart', touchStartHandler, { passive: false });
        element.addEventListener('touchmove', touchMoveHandler, { passive: false });
        element.addEventListener('touchend', touchEndHandler, { passive: false });
        element.addEventListener('mousedown', mouseDownHandler);
        swipeCleanupRef.current.push(() => {
          element.removeEventListener('touchstart', touchStartHandler);
          element.removeEventListener('touchmove', touchMoveHandler);
          element.removeEventListener('touchend', touchEndHandler);
          element.removeEventListener('mousedown', mouseDownHandler);
        });
      });
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      swipeCleanupRef.current.forEach(cleanup => cleanup());
      swipeCleanupRef.current = [];
    };
  }, [activeSubTab, filteredUpdateData, minSwipeDistance]);
  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };
  // Category color helper
  const getCategoryColor = (category) => {
    if (!category) return 'bg-[#E3F2FD] text-[#1976D2]';
    // Define a palette of color combinations
    const colorPalette = [
      'bg-[#E3F2FD] text-[#1976D2]', // Light blue
      'bg-[#E8F5E9] text-[#2E7D32]', // Light green
      'bg-[#FFF3E0] text-[#F57C00]', // Light orange
      'bg-[#F3E5F5] text-[#7B1FA2]', // Light purple
      'bg-[#FCE4EC] text-[#C2185B]', // Light pink
      'bg-[#E0F2F1] text-[#00695C]', // Light teal
      'bg-[#FFF9C4] text-[#F57F17]', // Light yellow
      'bg-[#E1BEE7] text-[#6A1B9A]', // Light lavender
      'bg-[#FFE0B2] text-[#E65100]', // Light deep orange
      'bg-[#BBDEFB] text-[#0D47A1]', // Light indigo
      'bg-[#C8E6C9] text-[#1B5E20]', // Light dark green
      'bg-[#FFCCBC] text-[#BF360C]', // Light deep orange red
    ];
    // Hash the category name to get a consistent index
    const hash = hashString(category.toLowerCase());
    const colorIndex = hash % colorPalette.length;
    return colorPalette[colorIndex];
  };
  // Handle edit button click
  const handleEditClick = (item) => {
    setSelectedItemForEdit(item);
    setCurrentStock(String(item.netStock || 0));
    setNewCount(String(item.netStock || 0));
    // reset move modal fields
    setMoveProject('');
    setMoveProjectId(null);
    setMoveDescription('');
    setShowMoveStockModal(true);
    setExpandedItemId(null);
  };
  // Handle move stock submit (modal edit for a single item)
  const handleMoveStockSubmit = async () => {
    if (!selectedItemForEdit) return;
    // Decide which stocking location id to use: if Update tab is active, use the selected Update location
    const updateSelectedOption = stockRoomOptions.find(loc => (loc.value || loc.label) === updateSelectedLocation);
    const updateStockingLocationId = updateSelectedOption?.id || null;
    const stockingLocationId = activeSubTab === 'update'
      ? (updateStockingLocationId || selectedItemForEdit.stocking_location_id || selectedItemForEdit.stockingLocationId || selectedItemForEdit.stocking_location || null)
      : (selectedItemForEdit.stocking_location_id || selectedItemForEdit.stockingLocationId || selectedItemForEdit.stocking_location || null);
    const qtyDelta = (Number(newCount) || 0) - (Number(currentStock) || 0);
    let eno = '';
    try {
      const countRes = await fetch(`https://backendaab.in/aabuildersDash/api/inventory/updateCount?stockingLocationId=${stockingLocationId}`);
      if (countRes.ok) {
        const count = await countRes.json();
        eno = String((count || 0) + 1);
      }
    } catch (e) {
      // ignore and leave eno as empty
    }
    const inventoryItems = [
      {
        item_id: selectedItemForEdit.itemId || selectedItemForEdit.item_id || selectedItemForEdit.id || null,
        category_id: selectedItemForEdit.categoryId || selectedItemForEdit.category_id || null,
        model_id: selectedItemForEdit.modelId || selectedItemForEdit.model_id || null,
        brand_id: selectedItemForEdit.brandId || selectedItemForEdit.brand_id || null,
        type_id: selectedItemForEdit.typeId || selectedItemForEdit.type_id || null,
        quantity: qtyDelta,
        amount: Math.abs((selectedItemForEdit.price || 0) * (Number(selectedItemForEdit.quantity || currentStock) || 0))
      }
    ];
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const formattedDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const payload = {
      stocking_location_id: stockingLocationId,
      client_id: 0,
      description: moveDescription,
      inventory_type: 'Update',
      date: formattedDate,
      eno: eno,
      purchase_no: '',
      created_by: (user && user.username) || '',
      inventoryItems: inventoryItems
    };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/inventory/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save update');
      }
      const data = await response.json();
      alert('Stock updated successfully');
      // update local item quantity/netStock so UI reflects change
      setItems(prev => prev.map(it => it.id === selectedItemForEdit.id ? { ...it, netStock: Number(newCount) } : it));
      setShowMoveStockModal(false);
      setSelectedItemForEdit(null);
      setCurrentStock('');
      setNewCount('');
      setMoveProject('');
      setMoveProjectId(null);
      setMoveDescription('');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert(`Error updating stock: ${error.message}`);
    }
  };
  const [transferLoading, setTransferLoading] = useState(false);
  // Handle transfer (Move Stock) submit for Transfer tab
  const handleTransferSubmit = async () => {
    // Basic validation
    if (!fromLocation || !toLocation) {
      alert('Please select both From and To locations.');
      return;
    }
    if (fromLocation === toLocation) {
      alert('From and To locations cannot be the same.');
      return;
    }
    if (!items || items.length === 0) {
      alert('Please add items to transfer.');
      return;
    }
    // Find IDs for stocking locations
    const fromOption = stockRoomOptions.find(loc => (loc.value || loc.label || loc) === fromLocation);
    const toOption = stockRoomOptions.find(loc => (loc.value || loc.label || loc) === toLocation);
    const fromStockingLocationId = fromOption?.id || null;
    const toStockingLocationId = toOption?.id || null;
    if (!fromStockingLocationId || !toStockingLocationId) {
      alert('Unable to resolve stocking location IDs. Please select valid locations.');
      return;
    }
    // Find project IDs from allProjectNames for client_id and to_client_id (project to project transfer)
    const fromProjectOption = allProjectNames.find(proj => (proj.value || proj.label || proj) === fromLocation);
    const toProjectOption = allProjectNames.find(proj => (proj.value || proj.label || proj) === toLocation);
    const fromProjectId = fromProjectOption?.id || null;
    const toProjectId = toProjectOption?.id || null;
    setTransferLoading(true);
    try {
      // Attempt to fetch a new ENO (similar to incoming flow); if it fails we'll send empty string
      let eno = '';
      try {
        const countRes = await fetch(`https://backendaab.in/aabuildersDash/api/inventory/transferCount?stockingLocationId=${fromStockingLocationId}`);
        if (countRes.ok) {
          const count = await countRes.json();
          eno = String((count || 0) + 1);
        }
      } catch (e) {
        // ignore and leave eno as empty
      }
      const formattedDate = new Date().toISOString().split('T')[0];
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const inventoryItems = items.map(item => ({
        item_id: item.itemId || item.id || null,
        category_id: item.categoryId || item.category_id || null,
        model_id: item.modelId || item.model_id || null,
        brand_id: item.brandId || item.brand_id || null,
        type_id: item.typeId || item.type_id || null,
        quantity: Math.abs(item.quantity || 0),
        amount: Math.abs((item.price || 0) * (item.quantity || 0))
      }));
      const payload = {
        stocking_location_id: fromStockingLocationId,
        to_stocking_location_id: toStockingLocationId,
        inventory_type: 'Transfer',
        date: formattedDate,
        eno: eno,
        purchase_no: '',
        created_by: (user && user.username) || '',
        inventoryItems: inventoryItems
      };
      // Add client_id and to_client_id for project to project transfers
      if (fromProjectId) {
        payload.client_id = fromProjectId;
      }
      if (toProjectId) {
        payload.to_client_id = toProjectId;
      }
      const response = await fetch('https://backendaab.in/aabuildersDash/api/inventory/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save transfer');
      }
      await response.json();
      alert('Transfer saved successfully!');
      // Clear items
      setItems([]);
      setItemsCount(0);
    } catch (error) {
      console.error('Error saving transfer:', error);
      alert(error.message || 'Error saving transfer');
    } finally {
      setTransferLoading(false);
    }
  };
  // Get stocking location options for Update tab
  const updateStockingLocationOptions = stockRoomOptions.length > 0 ? stockRoomOptions : [
    { value: 'Stock Room A', label: 'Stock Room A', id: null },
    { value: 'Stock Room B', label: 'Stock Room B', id: null }
  ];
  // Resolve the ID for the selected 'From' stocking location to pass into SearchItemsModal
  const fromSelectedOption = stockRoomOptions.find(loc =>
    (loc.value || loc.label || loc) === fromLocation
  );
  const fromStockingLocationId = fromSelectedOption?.id || null;
  // Resolve the ID for the selected Update location to pass into SearchItemsModal when isFromUpdate
  const updateSelectedOption = stockRoomOptions.find(loc =>
    (loc.value || loc.label) === updateSelectedLocation
  );
  const updateStockingLocationId = updateSelectedOption?.id || null;
  // Helper function to get display value for location
  const getDisplayValue = (location) => {
    if (!location) return '';
    if (showProjects) {
      if (location === 'Stock Room A') return 'Project A';
      if (location === 'Stock Room B') return 'Project B';
      return location;
    }
    return location;
  };
  // Helper function to get options for dropdowns
  const getLocationOptions = () => {
    if (showProjects) {
      return allProjectNames.length > 0
        ? allProjectNames.map(loc => loc.value || loc.label || loc)
        : [];
    }
    return stockRoomOptions.length > 0
      ? stockRoomOptions.map(loc => loc.value || loc.label || loc)
      : ['Stock Room A', 'Stock Room B'];
  };
  // Resolve the ID for the selected 'From' project to pass into SearchItemsModal
  const fromProjectOption = allProjectNames.find(proj => (proj.value || proj.label || proj) === fromLocation);
  const fromProjectId = fromProjectOption?.id || null;
  // Memoized map of net stock per composite key for the selected From location
  const stockQuantitiesMap = useMemo(() => {
    const list = calculateNetStock(inventoryData, fromStockingLocationId);
    return (list || []).reduce((acc, cur) => {
      const key = `${cur.itemId || 'null'}-${cur.categoryId || 'null'}-${cur.modelId || 'null'}-${cur.brandId || 'null'}-${cur.typeId || 'null'}`;
      acc[key] = Number(cur.netStock || 0);
      return acc;
    }, {});
  }, [inventoryData, calculateNetStock, fromStockingLocationId]);
  const historyList = useMemo(() => {
    if (!inventoryData || inventoryData.length === 0) return [];
    const entries = [];
    (inventoryData || [])
      .filter(rec => {
        const t = (rec.inventory_type || rec.inventoryType || '').toLowerCase();
        return t === 'transfer' || t === 'update';
      })
      .forEach(rec => {
        const inventoryItems = rec.inventoryItems || rec.inventory_items || [];
        const clientId = rec.client_id || rec.clientId;
        const projectObj = allProjectNames.find(p => p.id === clientId);
        const projectName = projectObj ? (projectObj.value || projectObj.label || projectObj.name) : '';
        const fromName = locationNamesMap[rec.stocking_location_id || rec.stockingLocationId] || '';
        const toName = locationNamesMap[rec.to_stocking_location_id || rec.toStockingLocationId] || '';
        const isTransfer = ((rec.inventory_type || rec.inventoryType || '') || '').toString().toLowerCase() === 'transfer';
        const locationName = isTransfer ? (fromName && toName ? `${fromName} to ${toName}` : (fromName || toName)) : (fromName || '');
        const fromLocationName = isTransfer ? fromName : null;
        const toLocationName = isTransfer ? toName : null;
        const dateVal = rec.created_date_time || rec.created_at || rec.createdAt;
        const formattedDate = dateVal ? new Date(dateVal).toLocaleString() : '';
        const eno = rec.eno || rec.eno_number || '';
        const findNameById = (array, id, fieldName) => {
          if (!id || !array || array.length === 0) return ''
          const item = array.find(i => String(i.id || i._id) === String(id));
          return item ? (item[fieldName] || item.name || '') : '';
        };
        if (!inventoryItems || inventoryItems.length === 0) {
          entries.push({
            id: rec.id || rec._id || `${rec.stocking_location_id || ''}-${dateVal || ''}`,
            itemsText: '',
            model: '',
            brand: '',
            typeName: '',
            category: '',
            projectName,
            locationName,
            fromLocationName,
            toLocationName,
            type: rec.inventory_type || rec.inventoryType || '',
            dateValue: dateVal,
            formattedDate,
            eno: eno
          });
        } else {
          inventoryItems.forEach(ii => {
            const itemId = ii.item_id || ii.itemId;
            const itemObj = itemNamesData.find(it => (it.id || it.item_id) === itemId || (it.value || it.itemName) === ii.item_name);
            const itemName = itemObj ? (itemObj.value || itemObj.label || itemObj.name || itemObj.itemName) : (ii.item_name || ii.itemName || '');
            const entryId = ii.id || ii._id || `${rec.id || rec._id || ''}-${itemId || itemName || ''}-${dateVal || ''}`;
            const categoryId = ii.category_id || null;
            const modelId = ii.model_id || null;
            const brandId = ii.brand_id || null;
            const typeId = ii.type_id || null;
            const findNameById = (array, id, fieldName) => {
              if (!id || !array || array.length === 0) return ''
              const item = array.find(i => String(i.id || i._id) === String(id));
              return item ? (item[fieldName] || item.name || '') : '';
            };
            const categoryName = categoryId ? findNameById(poCategoryOptions, categoryId, 'label') || findNameById(poCategoryOptions, categoryId, 'value') : '';
            const brandName = brandId ? findNameById(poBrand, brandId, 'brand') : '';
            const modelName = modelId ? findNameById(poModel, modelId, 'model') : '';
            const typeName = typeId ? findNameById(poType, typeId, 'typeColor') || findNameById(poType, typeId, 'type') : '';
            entries.push({
              id: entryId,
              itemsText: itemName,
              model: modelName,
              brand: brandName,
              typeName: typeName || '',
              category: categoryName,
              projectName,
              locationName,
              fromLocationName,
              toLocationName,
              type: rec.inventory_type || rec.inventoryType || '',
              dateValue: dateVal,
              formattedDate,
              quantity: Number(ii.quantity || 0),
              itemId: itemId,
              categoryId: categoryId,
              modelId: modelId,
              brandId: brandId,
              typeId: typeId,
              stockingLocationId: rec.stocking_location_id || rec.stockingLocationId,
              toStockingLocationId: rec.to_stocking_location_id || rec.toStockingLocationId,
              eno: eno
            });
          });
        }
      });
    return entries.sort((a, b) => new Date(b.dateValue || 0) - new Date(a.dateValue || 0));
  }, [inventoryData, itemNamesData, allProjectNames, locationNamesMap, poCategoryOptions, poBrand, poModel, poType]);
  // Calculate overall stock (all locations) for history display
  const overallStockMap = useMemo(() => {
    const list = calculateNetStock(inventoryData, null); // null = all locations
    return (list || []).reduce((acc, cur) => {
      const key = `${cur.itemId || 'null'}-${cur.categoryId || 'null'}-${cur.modelId || 'null'}-${cur.brandId || 'null'}-${cur.typeId || 'null'}`;
      acc[key] = Number(cur.netStock || 0);
      return acc;
    }, {});
  }, [inventoryData, calculateNetStock]);
  // Helper function to get location-specific stock for a record
  const getLocationStock = useCallback((itemId, categoryId, modelId, brandId, typeId, locationId) => {
    const list = calculateNetStock(inventoryData, locationId);
    const compositeKey = `${itemId || 'null'}-${categoryId || 'null'}-${modelId || 'null'}-${brandId || 'null'}-${typeId || 'null'}`;
    const item = list.find(cur =>
      String(cur.itemId || 'null') === String(itemId || 'null') &&
      String(cur.categoryId || 'null') === String(categoryId || 'null') &&
      String(cur.modelId || 'null') === String(modelId || 'null') &&
      String(cur.brandId || 'null') === String(brandId || 'null') &&
      String(cur.typeId || 'null') === String(typeId || 'null')
    );
    return item ? Number(item.netStock || 0) : 0;
  }, [inventoryData, calculateNetStock]);
  // Compute the stock for a specific item at a given timestamp (i.e., as of that inventory record)
  const getLocationStockAtTime = useCallback((itemId, categoryId, modelId, brandId, typeId, locationId, dateValue) => {
    if (!dateValue) return 0;
    // filter inventory records to those on or before the provided date
    const cutoff = new Date(dateValue);
    const recordsUpToDate = (inventoryData || []).filter(rec => {
      const recDate = rec.created_date_time || rec.created_at || rec.createdAt;
      if (!recDate) return false;
      const r = new Date(recDate);
      return r <= cutoff;
    });
    const list = calculateNetStock(recordsUpToDate, locationId);
    const item = list.find(cur =>
      String(cur.itemId || 'null') === String(itemId || 'null') &&
      String(cur.categoryId || 'null') === String(categoryId || 'null') &&
      String(cur.modelId || 'null') === String(modelId || 'null') &&
      String(cur.brandId || 'null') === String(brandId || 'null') &&
      String(cur.typeId || 'null') === String(typeId || 'null')
    );
    return item ? Number(item.netStock || 0) : 0;
  }, [inventoryData, calculateNetStock]);
  // Get unique eno values from historyList
  const enoOptions = useMemo(() => {
    const enos = [...new Set(historyList.map(record => record.eno).filter(eno => eno && eno !== ''))];
    return enos.sort((a, b) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numB - numA; // Sort descending
    });
  }, [historyList]);
  // Filter historyList based on selected eno and filterData
  const filteredHistoryList = useMemo(() => {
    let filtered = historyList;
    // Filter by eno
    if (selectedEno) {
      filtered = filtered.filter(record => record.eno === selectedEno);
    }
    // Filter by stocking location
    if (filterData.stockingLocation) {
      filtered = filtered.filter(record => record.locationName === filterData.stockingLocation);
    }
    // Filter by item name
    if (filterData.itemName) {
      filtered = filtered.filter(record => record.itemsText === filterData.itemName);
    }
    // Filter by transfer
    if (filterData.transfer) {
      filtered = filtered.filter(record => {
        const recordType = (record.type || '').toLowerCase();
        return recordType === 'transfer';
      });
    }
    // Filter by update
    if (filterData.update) {
      filtered = filtered.filter(record => {
        const recordType = (record.type || '').toLowerCase();
        return recordType === 'update';
      });
    }
    return filtered;
  }, [historyList, selectedEno, filterData]);
  // Close dropdowns when filter sheet closes
  useEffect(() => {
    if (!showFilterSheet) {
      setStockingLocationFilterOpen(false);
      setItemNameFilterOpen(false);
      setTransferFilterOpen(false);
      setUpdateFilterOpen(false);
      setStockingLocationFilterSearch('');
      setItemNameFilterSearch('');
      setTransferFilterSearch('');
      setUpdateFilterSearch('');
    }
  }, [showFilterSheet]);
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!showFilterSheet) return;
      const target = event.target;
      const isStockingLocationDropdown = target.closest('[data-dropdown="stockingLocationFilter"]');
      const isItemNameDropdown = target.closest('[data-dropdown="itemNameFilter"]');
      const isTransferDropdown = target.closest('[data-dropdown="transferFilter"]');
      const isUpdateDropdown = target.closest('[data-dropdown="updateFilter"]');
      if (stockingLocationFilterOpen && !isStockingLocationDropdown) {
        setStockingLocationFilterOpen(false);
      }
      if (itemNameFilterOpen && !isItemNameDropdown) {
        setItemNameFilterOpen(false);
      }
      if (transferFilterOpen && !isTransferDropdown) {
        setTransferFilterOpen(false);
      }
      if (updateFilterOpen && !isUpdateDropdown) {
        setUpdateFilterOpen(false);
      }
    };
    if (showFilterSheet) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [stockingLocationFilterOpen, itemNameFilterOpen, transferFilterOpen, updateFilterOpen, showFilterSheet]);
  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden bg-white">
      {/* Category Text */}
      {activeSubTab === 'update' && activeSubTab !== 'history' && (
        <div className="flex-shrink-0 px-4 pt-2 pb-2">
          <div className="flex items-center justify-between flex-1">
            <p className="text-[12px] font-medium text-black leading-normal">
              #
            </p>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="text-[12px] font-medium text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
            >
              Category
            </button>
          </div>
        </div>
      )}
      {activeSubTab === 'history' && (
        <div className="flex-shrink-0 px-4 pt-2 pb-2">
          <div className="flex items-center justify-between flex-1">
            <div
              onClick={() => setShowEnoModal(true)}
              className="text-[12px] font-medium text-black leading-normal cursor-pointer flex items-center gap-1"
            >
              {selectedEno ? `#${selectedEno}` : 'Eno'}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="text-[12px] font-medium text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
              >
                Category
              </button>
            </div>
          </div>
        </div>
      )}
      {activeSubTab === 'transfer' && (
        <div className="flex-shrink-0 px-4 pt-2 pb-2 flex items-center justify-between">
          <div className="flex items-center justify-between flex-1">
            <p className="text-[12px] font-medium text-black leading-normal">
              #
            </p>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="text-[12px] font-medium text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
            >
              Category
            </button>
          </div>
          {/* Action Buttons */}
          {items.length > 0 && (
            <div className="flex">
              <button
                type="button"
                onClick={handleTransferSubmit}
                disabled={transferLoading}
                className={`text-black px-4 rounded-full text-[12px] font-medium ${transferLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {transferLoading ? 'Moving...' : 'Move Stock'}
              </button>
              <button
                type="button"
                className=" rounded-full flex items-center justify-center"
              >
                <img src={Edit} alt="Edit" className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
      {/* Sub-navigation Tabs: Transfer, Update, History */}
      <div className="flex-shrink-0 px-4">
        <div className="flex bg-gray-100 items-center h-9 shadow-sm flex-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('transfer')}
            className={`flex-1 h-[32px] rounded-md text-[12px] font-medium leading-normal transition-colors duration-1000 ease-out ${activeSubTab === 'transfer'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            Transfer
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('update')}
            className={`flex-1 h-[32px] rounded-md text-[12px] font-medium leading-normal transition-colors duration-1000 ease-out ${activeSubTab === 'update'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 h-[32px] rounded-md text-[12px] font-medium leading-normal transition-colors duration-1000 ease-out ${activeSubTab === 'history'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            History
          </button>
        </div>
      </div>
      {activeSubTab === 'history' && (
        <div
          ref={filterTagsContainerRef}
          className="flex items-center justify-start mt-3 mb-0 px-5 gap-2 overflow-x-auto scrollbar-hide no-scrollbar scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={(e) => {
            if (e.target.closest('button')) return;
            setIsDragging(true);
            setStartX(e.pageX - filterTagsContainerRef.current.offsetLeft);
            setScrollLeft(filterTagsContainerRef.current.scrollLeft);
          }}
          onMouseMove={(e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - filterTagsContainerRef.current.offsetLeft;
            const walk = (x - startX) * 2;
            filterTagsContainerRef.current.scrollLeft = scrollLeft - walk;
          }}
          onMouseUp={() => {
            setIsDragging(false);
          }}
          onMouseLeave={() => {
            setIsDragging(false);
          }}
        >
          <button
            onClick={() => setShowFilterSheet(true)}
            className="flex items-center gap-2 text-[12px] font-medium text-gray-700"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Top horizontal line */}
              <line x1="2" y1="5" x2="16" y2="5" stroke={(filterData.stockingLocation || filterData.itemName || filterData.transfer || filterData.update) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" />
              {/* Top vertical line intersecting center */}
              <line x1="9" y1="3" x2="9" y2="7" stroke={(filterData.stockingLocation || filterData.itemName || filterData.transfer || filterData.update) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" />
              {/* Top arrows pointing left and right */}
              <path d="M7 4L9 5L11 4" stroke={(filterData.stockingLocation || filterData.itemName || filterData.transfer || filterData.update) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M7 6L9 5L11 6" stroke={(filterData.stockingLocation || filterData.itemName || filterData.transfer || filterData.update) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Bottom horizontal line */}
              <line x1="2" y1="13" x2="16" y2="13" stroke={(filterData.stockingLocation || filterData.itemName || filterData.transfer || filterData.update) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" />
              {/* Bottom vertical line intersecting center */}
              <line x1="9" y1="11" x2="9" y2="15" stroke={(filterData.stockingLocation || filterData.itemName || filterData.transfer || filterData.update) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" />
              {/* Bottom arrows pointing left and right */}
              <path d="M7 12L9 13L11 12" stroke={(filterData.stockingLocation || filterData.itemName || filterData.transfer || filterData.update) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M7 14L9 13L11 14" stroke={(filterData.stockingLocation || filterData.itemName || filterData.transfer || filterData.update) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            {!(filterData.stockingLocation || filterData.itemName || filterData.transfer || filterData.update) && (
              <span className="text-[12px] font-medium text-black">Filter</span>
            )}
          </button>
          {filterData.stockingLocation && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full flex-shrink-0">
              <span className="text-[12px] font-medium text-black">Stocking Location</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterData({ ...filterData, stockingLocation: '' });
                }}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
          {filterData.itemName && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full flex-shrink-0">
              <span className="text-[12px] font-medium text-black">Item Name</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterData({ ...filterData, itemName: '' });
                }}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
          {filterData.transfer && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full flex-shrink-0">
              <span className="text-[12px] font-medium text-black">Transfer</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterData({ ...filterData, transfer: '' });
                }}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
          {filterData.update && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full flex-shrink-0">
              <span className="text-[12px] font-medium text-black">Update</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterData({ ...filterData, update: '' });
                }}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
      {/* Transfer Form Fields (shown when Transfer tab is active) */}
      {activeSubTab === 'transfer' && (
        <div className="flex-1 px-4 pb-4">
          {/* From Field */}
          <div className="space-y-[6px]">
            <div className="mt-2">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[12px] font-semibold text-black leading-normal">
                  From
                </p>
                <button
                  onClick={() => setShowProjects(!showProjects)}
                  className="flex items-center justify-center"
                >
                  <img
                    src={showProjects ? Change2 : Change1}
                    alt="change"
                    className="w-5 h-5"
                  />
                </button>
              </div>
              <div className="relative">
                <div
                  onClick={() => setShowFromModal(true)}
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
                  style={{
                    color: fromLocation ? '#000' : '#9E9E9E'
                  }}
                >
                  <span>{getDisplayValue(fromLocation) || 'Select Location'}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-3"
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
            {/* To Field */}
            <div>
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                To
              </p>
              <div className="relative">
                <div
                  onClick={() => setShowToModal(true)}
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
                  style={{
                    color: toLocation ? '#000' : '#9E9E9E'
                  }}
                >
                  <span>{getDisplayValue(toLocation) || 'Select Location'}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-3"
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Items Field - Show only after selecting both From and To */}
          {fromLocation && toLocation && fromLocation !== 'Stock Room A' && toLocation !== 'Stock Room B' && (
            <div>
              <div className="flex items-center justify-between mt-3 mb-2 px-2">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-semibold text-black leading-normal">
                    Items
                  </p>
                  <div className="w-5 h-5 rounded-full bg-[#9E9E9E] flex items-center justify-center">
                    <span className="text-[10px] font-medium text-white">{itemsCount}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSearchItemsModal(true)}
                  className="cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
                    <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {/* Added Items List */}
          {items.length > 0 && (
            <div className="">
              <div className="">
                {items.map((item, index) => {
                  // Build composite key that matches calculateNetStock output
                  const compositeKey = `${item.itemId || item.id || 'null'}-${item.categoryId || item.category_id || 'null'}-${item.modelId || item.model_id || 'null'}-${item.brandId || item.brand_id || 'null'}-${item.typeId || item.type_id || 'null'}`;
                  const currentCount = stockQuantitiesMap[compositeKey] ?? 0;
                  const transferCount = Number(item.quantity || 0);
                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-pointer select-none"
                    >
                      <div className=" ">
                        <div className="flex items-center justify-between">
                          <p className="text-[14px] font-semibold text-black">{item.itemName}</p>
                          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                            {(item.category || 'Electricals').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between ">
                          <p className="text-[12px] font-medium text-gray-600">
                            {item.model ? `${item.model}` : ''}
                          </p>
                          <p className={`text-[12px] font-medium text-gray-400`}>
                            Current Count: <span className="font-semibold text-black">{currentCount}</span>
                          </p>
                        </div>
                        <div className="flex items-center justify-between">

                          <p className="text-[12px] font-medium text-gray-600">
                            {item.brand ? `${item.brand}` : ''} {item.type ? `${item.type}` : ''}
                          </p>
                          <p className="text-[12px] font-medium text-[#007323]">
                            Transfer Count: <span className="font-semibold text-[#007323]">{transferCount}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Empty content area below */}
          <div className="flex-1"></div>
        </div>
      )}
      {/* Update Tab Content */}
      {activeSubTab === 'update' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Category Text and Filters */}
          <div className="flex-shrink-0 px-4">
            {/* Stocking Location Filter */}
            <div className="mb-2">
              <p className="text-[12px] font-semibold text-black leading-normal mb-1 mt-2">
                Stocking Location
              </p>
              <div className="relative">
                <div
                  onClick={() => setShowUpdateLocationModal(true)}
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
                  style={{
                    paddingRight: updateSelectedLocation ? '40px' : '12px',
                    boxSizing: 'border-box',
                    color: updateSelectedLocation ? '#000' : '#9E9E9E'
                  }}
                >
                  <span>{updateSelectedLocation || 'Select Project'}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {updateSelectedLocation && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUpdateSelectedLocation('');
                      setUpdateSearchQuery('');
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
            <div className='flex items-center '>
              {/* Search Bar - Only show after Stocking Location is selected */}
              {updateSelectedLocation && updateSelectedLocation !== 'Select Project' && (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
                      <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={updateSearchQuery}
                    onChange={(e) => setUpdateSearchQuery(e.target.value)}
                    className="w-full h-[40px] rounded-full pl-10 pr-3 text-[12px] font-medium bg-white focus:outline-none"
                  />
                </div>
              )}
              {updateSelectedLocation && updateSelectedLocation !== 'Select Project' && (
                <div className=''>
                  <label
                    className="text-[12px] font-semibold text-black cursor-pointer ml-8"
                    onClick={() => {
                      setIsFromUpdate(true);          // ✅ mark Update flow
                      setShowSearchItemsModal(true);  // existing line
                    }}
                  >
                    Other Returns
                  </label>
                </div>
              )}
            </div>
          </div>
          {/* Stock Items List - Only show after Stocking Location is selected */}
          {updateSelectedLocation && updateSelectedLocation !== 'Select Project' ? (
            <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide no-scrollbar">
              {updateLoading ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-[14px] text-gray-500">Loading...</p>
                </div>
              ) : filteredUpdateData.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-[14px] text-gray-500">No items found</p>
                </div>
              ) : (
                <div className="mt-2">
                  {filteredUpdateData.map((item, index) => {
                    const itemId = `${item.itemId}-${item.categoryId}-${item.modelId}-${item.brandId}-${item.typeId}-${index}`;
                    const isExpanded = expandedItemId === itemId;
                    const swipeState = swipeStates[itemId];
                    const buttonWidth = 56; // Width of edit button (matching image - ONLY EDIT, NO DELETE)
                    const swipeOffset =
                      swipeState && swipeState.isSwiping
                        ? Math.max(-buttonWidth, Math.min(0, swipeState.currentX - swipeState.startX))
                        : isExpanded
                          ? -buttonWidth
                          : 0;
                    return (
                      <div key={itemId} className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-gray-50 rounded-[8px] h-[100px]">
                        {/* Card */}
                        <div
                          ref={(el) => {
                            if (el) cardRefs.current[itemId] = el;
                          }}
                          className="flex-1 bg-white rounded-[8px] h-full px-3 py-1 transition-all duration-300 ease-out"
                          style={{
                            transform: `translateX(${swipeOffset}px)`,
                            touchAction: 'pan-y',
                            userSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                            WebkitUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                            MozUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                            msUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto'
                          }}
                          onClick={(e) => {
                            if (blockClickRef.current) {
                              e.preventDefault();
                              e.stopPropagation();
                              blockClickRef.current = false;
                              return;
                            }
                            if (e.target.closest('.action-button')) {
                              return;
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            {/* Left Side - Item Details */}
                            <div className="flex-1 pr-2">
                              <div className="flex items-center justify-between">
                                {/* Item Name */}
                                <p className="text-[14px] font-semibold text-black leading-tight mb-1">
                                  {item.itemName || 'N/A'}
                                </p>
                                {/* Category Tag */}
                                {item.category && (
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${getCategoryColor(item.category)} mb-2`}>
                                    {item.category.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                {/* Item ID */}
                                <p className="text-[12px] font-medium text-gray-600 mb-1">
                                  {item.model || ''}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                {/* Brand and Type */}
                                <p className="text-[12px] font-medium text-gray-600 mb-1">
                                  {item.brand && item.type ? `${item.brand}, ${item.type}` : item.brand || item.type || ''}
                                </p>
                              </div>
                              {/* Right Side - Category Tag and Current Count */}
                              <div className="flex items-center justify-between">
                                {/* Location */}
                                <p className="text-[12px] font-medium text-gray-600">
                                  {item.location || 'N/A'}
                                </p>
                                {/* Current Count */}
                                <p className="text-[12px] font-medium text-black">
                                  Current Count : {item.netStock || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Edit Button - Behind the card on the right, revealed on swipe (ONLY EDIT, NO DELETE) */}
                        <div
                          className="absolute right-0 top-0 flex items-center z-0"
                          style={{
                            opacity: isExpanded || (swipeState && swipeState.isSwiping && swipeOffset < -20) ? 1 : 0,
                            transform: swipeOffset < 0
                              ? `translateX(${Math.max(0, buttonWidth + swipeOffset)}px)`
                              : `translateX(${buttonWidth}px)`,
                            transition: 'opacity 0.2s ease-out',
                            pointerEvents: isExpanded ? 'auto' : 'none'
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(item);
                            }}
                            className="action-button w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 hover:bg-[#22a882] transition-colors shadow-sm"
                          >
                            <img src={Edit} alt="Edit" className="w-[18px] h-[18px]" style={{ filter: 'brightness(0) invert(1)' }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center">
              <p className="text-[14px] text-gray-500">Please select a Stocking Location</p>
            </div>
          )}
        </div>
      )}
      {/* History Tab Content */}
      {activeSubTab === 'history' && (
        <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mt-4 px-3 pb-">
          {filteredHistoryList.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[14px] text-gray-500">No history records found</p>
            </div>
          ) : (
            <div>
              {filteredHistoryList.map(record => (
                <div key={record.id} className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-gray-50 rounded-[8px] h-[100px]">
                  <div className="flex-1 bg-white rounded-[8px] h-full px-3 py-3">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-black truncate">{record.itemsText || 'No items'}</p>
                          <p>
                            {record.category && (
                              <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${getCategoryColor(record.category)} mb-2`}>
                                {record.category.toUpperCase()}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-gray-400 mt-1">{record.model}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-gray-400 mt-1">{record.brand && record.typeName ? `${record.brand}, ${record.typeName}` : (record.brand || record.typeName || '')}</p>
                          {String(record.type || '').toLowerCase() === 'transfer' ? null : (
                            <p className="text-[10px] text-gray-400 mt-1">Changed Count: <span className="font-semibold text-black">{Number(record.quantity || 0)}</span></p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-gray-400 mt-1">{record.formattedDate}</p>
                          <div className="flex items-center gap-2">
                            {String(record.type || '').toLowerCase() === 'transfer' ? null : (
                              <p className="text-[10px] text-gray-400 mt-1">Old Count: <span className="font-semibold text-black">{(() => {
                                const newCountAtRecord = getLocationStockAtTime(record.itemId, record.categoryId, record.modelId, record.brandId, record.typeId, record.stockingLocationId, record.dateValue);
                                const qty = Number(record.quantity || 0);
                                return Math.max(0, newCountAtRecord - qty);
                              })()}</span></p>
                            )}
                          </div>
                        </div>
                        <div className={`flex ${String(record.type || '').toLowerCase() === 'transfer' ? 'items-start' : 'items-center'} justify-between`}>
                          {String(record.type || '').toLowerCase() === 'transfer' ? (
                            <div className="flex flex-col">
                              {record.fromLocationName && <p className="text-[10px] text-gray-500 truncate"> {record.fromLocationName}</p>}
                              <p className="text-[9px] text-gray-500 text-center">to</p>
                              {record.toLocationName && <p className="text-[10px] text-gray-500 truncate">{record.toLocationName}</p>}
                            </div>
                          ) : (
                            <p className="text-[10px] text-gray-500 mt-1 truncate">{record.fromLocationName || record.locationName}</p>
                          )}
                          {String(record.type || '').toLowerCase() === 'transfer' ? (
                            <p className="text-[10px] text-[#007323] mt-1">Transfer Count: <span className="font-semibold text-[#007323]">{record.quantity || 0}</span></p>
                          ) : (
                            <p className="text-[10px] text-[#007323] mt-1">New Count: <span className="font-semibold text-[#007323]">{getLocationStockAtTime(record.itemId, record.categoryId, record.modelId, record.brandId, record.typeId, record.stockingLocationId, record.dateValue)}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Modals */}
      <SelectVendorModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(value) => {
          setSelectedCategory(value);
          setShowCategoryModal(false);
        }}
        selectedValue={selectedCategory}
        options={categoryOptions.map(cat => cat.value || cat.label)}
        fieldName="Category"
      />
      <SelectVendorModal
        isOpen={showEnoModal}
        onClose={() => setShowEnoModal(false)}
        onSelect={(value) => {
          setSelectedEno(value === 'All' ? '' : value);
          setShowEnoModal(false);
        }}
        selectedValue={selectedEno || 'All'}
        options={['All', ...enoOptions.map(eno => String(eno))]}
        fieldName="ENO"
      />
      <SelectVendorModal
        isOpen={showFromModal}
        onClose={() => setShowFromModal(false)}
        onSelect={(value) => {
          // Guard: prevent selecting same as 'To' (defensive, options already filter it out)
          if (value === toLocation) {
            alert('From and To locations cannot be the same.');
            return;
          }
          setFromLocation(value);
          setShowFromModal(false);
        }}
        selectedValue={fromLocation}
        options={getLocationOptions().filter(v => v !== toLocation)}
        fieldName="From"
      />
      <SelectVendorModal
        isOpen={showToModal}
        onClose={() => setShowToModal(false)}
        onSelect={(value) => {
          // Guard: prevent selecting same as 'From' (defensive, options already filter it out)
          if (value === fromLocation) {
            alert('From and To locations cannot be the same.');
            return;
          }
          setToLocation(value);
          setShowToModal(false);
        }}
        selectedValue={toLocation}
        options={getLocationOptions().filter(v => v !== fromLocation)}
        fieldName="To"
      />
      <SelectVendorModal
        isOpen={showItemsModal}
        onClose={() => setShowItemsModal(false)}
        onSelect={(value) => {
          // Handle item selection
          setShowItemsModal(false);
        }}
        selectedValue=""
        options={[]}
        fieldName="Items"
      />
      <SearchItemsModal
        isOpen={showSearchItemsModal}
        onClose={() => {
          setShowSearchItemsModal(false);
          setIsFromUpdate(false); // ✅ reset when closed
        }}
        isFromUpdate={isFromUpdate}
        onAdd={(item, quantity, isIncremental) => {
          // Handle adding/updating item quantities from the modal
          setItems(prev => {
            const updated = [...prev];
            const matchIndex = updated.findIndex(p => {
              const pId = p.itemId || p.id || null;
              const iId = item.itemId || item.id || null;
              if (pId && iId) return String(pId) === String(iId);
              // Fallback to matching by name/category/brand/model/type
              return (
                (p.itemName || '') === (item.itemName || '') &&
                (p.category || '') === (item.category || '') &&
                (p.brand || '') === (item.brand || '') &&
                (p.model || '') === (item.model || '') &&
                (p.type || '') === (item.type || '')
              );
            });
            const delta = Number(quantity || 0);
            if (isIncremental) {
              // Incremental update (called by + / - buttons or blur difference)
              if (matchIndex !== -1) {
                const newQty = (Number(updated[matchIndex].quantity) || 0) + delta;
                if (newQty > 0) {
                  updated[matchIndex] = { ...updated[matchIndex], quantity: newQty };
                } else {
                  // Remove the item if quantity becomes 0 or less
                  updated.splice(matchIndex, 1);
                }
              } else if (delta > 0) {
                updated.push({ ...item, quantity: delta });
              }
            } else {
              // Absolute set (replace or add)
              if (matchIndex !== -1) {
                updated[matchIndex] = { ...updated[matchIndex], ...item, quantity: delta };
              } else if (delta > 0) {
                updated.push({ ...item, quantity: delta });
              }
            }
            // Update itemsCount to reflect the number of line items
            setItemsCount(updated.length);
            return updated;
          });
          // Do NOT auto-close the modal; allow users to add multiple items before closing manually
        }}
        getAvailableItems={getAvailableItems}
        existingItems={items}
        onRefreshData={fetchPoItemName}
        stockingLocationId={isFromUpdate ? updateStockingLocationId : fromStockingLocationId}
        useInventoryData={true}
      />
      {/* Move Stock Bottom Sheet */}
      {showMoveStockModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => {
              setShowMoveStockModal(false);
              setSelectedItemForEdit(null);
              setCurrentStock('');
              setNewCount('');
              setMoveProject('');
              setMoveProjectId(null);
              setMoveDescription('');
            }}
          />
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[360px] bg-white rounded-t-[20px] z-50 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200">
              <h2 className="text-[16px] font-semibold text-black">Update Stock</h2>
              <button
                type="button"
                onClick={() => {
                  setShowMoveStockModal(false);
                  setSelectedItemForEdit(null);
                  setCurrentStock('');
                  setNewCount('');
                  setMoveProject('');
                  setMoveProjectId(null);
                  setMoveDescription('');
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
              {/* Current Stock */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                  Current Stock
                </p>
                <input
                  type="text"
                  value={currentStock}
                  readOnly
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-3 text-[12px] font-medium bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
              {/* New Count */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                  New Count
                </p>
                <input
                  type="number"
                  value={newCount}
                  onChange={(e) => setNewCount(e.target.value)}
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-3 text-[12px] font-medium bg-white text-black"
                  placeholder="Enter new count"
                />
              </div>
              {/* Description */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-1">Description</p>
                <input
                  type="text"
                  value={moveDescription}
                  onChange={(e) => setMoveDescription(e.target.value)}
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-3 text-[12px] font-medium bg-white text-black"
                  placeholder="Enter description"
                />
              </div>
            </div>
            {/* Action Buttons */}
            <div className="px-4 pb-4 pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowMoveStockModal(false);
                  setSelectedItemForEdit(null);
                  setCurrentStock('');
                  setNewCount('');
                  setMoveProject('');
                  setMoveProjectId(null);
                  setMoveDescription('');
                }}
                className="flex-1 h-[40px] border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[14px] font-medium text-black bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMoveStockSubmit}
                className="flex-1 h-[40px] bg-black rounded-[8px] text-[14px] font-medium text-white hover:bg-gray-800"
              >
                Edit
              </button>
            </div>
          </div>
        </>
      )}
      {/* Project Select for Move Stock Modal */}
      <SelectVendorModal
        isOpen={showMoveProjectModal}
        onClose={() => setShowMoveProjectModal(false)}
        onSelect={(value) => {
          setMoveProject(value);
          const found = allProjectNames.find(opt => (opt.value || opt.label) === value);
          setMoveProjectId(found ? found.id : null);
          setShowMoveProjectModal(false);
        }}
        selectedValue={moveProject}
        options={allProjectNames.map(o => o.value)}
        fieldName="Project"
      />
      {/* Update Location Modal */}
      <SelectVendorModal
        isOpen={showUpdateLocationModal}
        onClose={() => setShowUpdateLocationModal(false)}
        onSelect={(value) => {
          setUpdateSelectedLocation(value);
          setShowUpdateLocationModal(false);
        }}
        selectedValue={updateSelectedLocation}
        options={updateStockingLocationOptions.map(loc => (loc.value || loc.label || loc))}
        fieldName="Stocking Location"
      />
      {/* Filter Bottom Sheet */}
      {showFilterSheet && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowFilterSheet(false)}
          />
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[360px] bg-white rounded-t-[20px] z-50 shadow-lg">
            {/* Header */}
            <div className='flex justify-between items-center mt-3'>
              <div className="flex justify-between items-center px-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Select Filters
                </h2>
              </div>
              <div className=' mr-4 mt-1'>
                <button onClick={() => setShowFilterSheet(false)} className="text-red-500 hover:text-red-700 text-xl font-bold">
                  ✕
                </button>
              </div>
            </div>
            {/* Filter Form */}
            <div className="px-6 py-4 space-y-4 overflow-y-hidden overflow-x-hidden flex-1" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              {/* Stocking Location */}
              <div className='space-y-[6px]'>
                <div className="relative" data-dropdown="stockingLocationFilter">
                  <label className="block text-sm font-medium text-black mb-0.5">
                    Stocking Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Stocking Location"
                      value={stockingLocationFilterOpen ? stockingLocationFilterSearch : (filterData.stockingLocation || '')}
                      onChange={(e) => {
                        setStockingLocationFilterSearch(e.target.value);
                        setStockingLocationFilterOpen(true);
                        setItemNameFilterOpen(false);
                        setTransferFilterOpen(false);
                        setUpdateFilterOpen(false);
                      }}
                      onFocus={() => {
                        setStockingLocationFilterOpen(true);
                        setItemNameFilterOpen(false);
                        setTransferFilterOpen(false);
                        setUpdateFilterOpen(false);
                        if (!stockingLocationFilterOpen) {
                          setStockingLocationFilterSearch('');
                        }
                      }}
                      className="w-full h-[32px] px-4 py-2 border border-gray-300 rounded-lg text-gray-700 placeholder:text-[12px] focus:outline-none focus:border-gray-400 bg-white pr-10"
                    />
                    <svg
                      onClick={(e) => {
                        e.stopPropagation();
                        setStockingLocationFilterOpen(!stockingLocationFilterOpen);
                        if (!stockingLocationFilterOpen) {
                          setStockingLocationFilterSearch('');
                        }
                      }}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer transition-transform ${stockingLocationFilterOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {stockingLocationFilterOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-hidden">
                        <div className="overflow-y-auto max-h-48">
                          <button
                            type="button"
                            onClick={() => {
                              setFilterData({ ...filterData, stockingLocation: '' });
                              setStockingLocationFilterOpen(false);
                              setStockingLocationFilterSearch('');
                            }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${!filterData.stockingLocation ? 'bg-gray-100' : ''}`}
                          >
                            All Locations
                          </button>
                          {[...new Set(historyList.map(r => r.locationName).filter(Boolean))]
                            .filter(loc =>
                              loc.toLowerCase().includes(stockingLocationFilterSearch.toLowerCase())
                            )
                            .map((location) => (
                              <button
                                key={location}
                                type="button"
                                onClick={() => {
                                  setFilterData({ ...filterData, stockingLocation: location });
                                  setStockingLocationFilterOpen(false);
                                  setStockingLocationFilterSearch('');
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${filterData.stockingLocation === location ? 'bg-gray-100' : ''}`}
                              >
                                {location}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Item Name */}
                <div className="relative" data-dropdown="itemNameFilter">
                  <label className="block text-sm font-medium text-black mb-0.5">
                    Item Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Item Name"
                      value={itemNameFilterOpen ? itemNameFilterSearch : (filterData.itemName || '')}
                      onChange={(e) => {
                        setItemNameFilterSearch(e.target.value);
                        setItemNameFilterOpen(true);
                        setStockingLocationFilterOpen(false);
                        setTransferFilterOpen(false);
                        setUpdateFilterOpen(false);
                      }}
                      onFocus={() => {
                        setItemNameFilterOpen(true);
                        setStockingLocationFilterOpen(false);
                        setTransferFilterOpen(false);
                        setUpdateFilterOpen(false);
                        if (!itemNameFilterOpen) {
                          setItemNameFilterSearch('');
                        }
                      }}
                      className="w-full h-[32px] px-4 py-2 border border-gray-300 rounded-lg text-gray-700 placeholder:text-[12px] focus:outline-none focus:border-gray-400 bg-white pr-10"
                    />
                    <svg
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemNameFilterOpen(!itemNameFilterOpen);
                        if (!itemNameFilterOpen) {
                          setItemNameFilterSearch('');
                        }
                      }}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer transition-transform ${itemNameFilterOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {itemNameFilterOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-hidden">
                        <div className="overflow-y-auto max-h-24">
                          <button
                            type="button"
                            onClick={() => {
                              setFilterData({ ...filterData, itemName: '' });
                              setItemNameFilterOpen(false);
                              setItemNameFilterSearch('');
                            }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${!filterData.itemName ? 'bg-gray-100' : ''}`}
                          >
                            All Items
                          </button>
                          {[...new Set(historyList.map(r => r.itemsText).filter(Boolean))]
                            .filter(item =>
                              item.toLowerCase().includes(itemNameFilterSearch.toLowerCase())
                            )
                            .map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => {
                                  setFilterData({ ...filterData, itemName: item });
                                  setItemNameFilterOpen(false);
                                  setItemNameFilterSearch('');
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${filterData.itemName === item ? 'bg-gray-100' : ''}`}
                              >
                                {item}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Transfer */}
                  <div className="relative" data-dropdown="transferFilter">
                    <label className="block text-sm font-medium text-black mb-0.5">
                      Transfer
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Select Transfer"
                        value={transferFilterOpen ? transferFilterSearch : (filterData.transfer || '')}
                        onChange={(e) => {
                          setTransferFilterSearch(e.target.value);
                          setTransferFilterOpen(true);
                          setStockingLocationFilterOpen(false);
                          setItemNameFilterOpen(false);
                          setUpdateFilterOpen(false);
                        }}
                        onFocus={() => {
                          setTransferFilterOpen(true);
                          setStockingLocationFilterOpen(false);
                          setItemNameFilterOpen(false);
                          setUpdateFilterOpen(false);
                          if (!transferFilterOpen) {
                            setTransferFilterSearch('');
                          }
                        }}
                        className="w-full h-[32px] px-4 py-2 border border-gray-300 rounded-lg text-gray-700 placeholder:text-[12px] focus:outline-none focus:border-gray-400 bg-white pr-10"
                      />
                      <svg
                        onClick={(e) => {
                          e.stopPropagation();
                          setTransferFilterOpen(!transferFilterOpen);
                          if (!transferFilterOpen) {
                            setTransferFilterSearch('');
                          }
                        }}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer transition-transform ${transferFilterOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {transferFilterOpen && (
                        <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-hidden">
                          <div className="overflow-y-auto max-h-48">
                            <button
                              type="button"
                              onClick={() => {
                                setFilterData({ ...filterData, transfer: '' });
                                setTransferFilterOpen(false);
                                setTransferFilterSearch('');
                              }}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${!filterData.transfer ? 'bg-gray-100' : ''}`}
                            >
                              All
                            </button>
                            {['Transfer'].filter(opt =>
                              opt.toLowerCase().includes(transferFilterSearch.toLowerCase())
                            ).map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setFilterData({ ...filterData, transfer: option });
                                  setTransferFilterOpen(false);
                                  setTransferFilterSearch('');
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${filterData.transfer === option ? 'bg-gray-100' : ''}`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Update */}
                  <div className="relative" data-dropdown="updateFilter">
                    <label className="block text-sm font-medium text-black mb-0.5">
                      Update
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Select Update"
                        value={updateFilterOpen ? updateFilterSearch : (filterData.update || '')}
                        onChange={(e) => {
                          setUpdateFilterSearch(e.target.value);
                          setUpdateFilterOpen(true);
                          setStockingLocationFilterOpen(false);
                          setItemNameFilterOpen(false);
                          setTransferFilterOpen(false);
                        }}
                        onFocus={() => {
                          setUpdateFilterOpen(true);
                          setStockingLocationFilterOpen(false);
                          setItemNameFilterOpen(false);
                          setTransferFilterOpen(false);
                          if (!updateFilterOpen) {
                            setUpdateFilterSearch('');
                          }
                        }}
                        className="w-full h-[32px] px-4 py-2 border border-gray-300 rounded-lg text-gray-700 placeholder:text-[12px] focus:outline-none focus:border-gray-400 bg-white pr-10"
                      />
                      <svg
                        onClick={(e) => {
                          e.stopPropagation();
                          setUpdateFilterOpen(!updateFilterOpen);
                          if (!updateFilterOpen) {
                            setUpdateFilterSearch('');
                          }
                        }}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer transition-transform ${updateFilterOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {updateFilterOpen && (
                        <div className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-hidden">
                          <div className="overflow-y-auto max-h-48">
                            <button
                              type="button"
                              onClick={() => {
                                setFilterData({ ...filterData, update: '' });
                                setUpdateFilterOpen(false);
                                setUpdateFilterSearch('');
                              }}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${!filterData.update ? 'bg-gray-100' : ''}`}
                            >
                              All
                            </button>
                            {['Update'].filter(opt =>
                              opt.toLowerCase().includes(updateFilterSearch.toLowerCase())
                            ).map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setFilterData({ ...filterData, update: option });
                                  setUpdateFilterOpen(false);
                                  setUpdateFilterSearch('');
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${filterData.update === option ? 'bg-gray-100' : ''}`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex-shrink-0 flex gap-3 px-6 py-4">
              <button
                onClick={() => {
                  setFilterData({ stockingLocation: '', itemName: '', transfer: '', update: '' });
                  setShowFilterSheet(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={() => setShowFilterSheet(false)} className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900">
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default EditStock;