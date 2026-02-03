import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const NetStock = () => {
  const navigate = useNavigate();
  // Helper function for date
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStockingLocation, setSelectedStockingLocation] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStockingLocationModal, setShowStockingLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [stockingLocationOptions, setStockingLocationOptions] = useState([]);
  const [netStockData, setNetStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemNamesData, setItemNamesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [stockQuantities, setStockQuantities] = useState([]);
  const [locationNamesMap, setLocationNamesMap] = useState({});
  const [poBrand, setPoBrand] = useState([]);
  const [poModel, setPoModel] = useState([]);
  const [poType, setPoType] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectionFilter, setSelectionFilter] = useState('All'); // 'All' | 'Minimum' | 'Default' | 'Excess' - controls dropdown selection
  const [selectAllFiltered, setSelectAllFiltered] = useState(false); // toggle: select all filtered items when true
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
  // Fetch stocking locations
  useEffect(() => {
    const fetchStockingLocations = async () => {
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
          const locations = data
            .filter(site => site.markedAsStockingLocation === true)
            .map(site => ({
              value: site.siteName,
              label: site.siteName,
              id: site.id
            }));
          setStockingLocationOptions(locations);
        }
      } catch (error) {
        console.error('Error fetching stocking locations:', error);
      }
    };
    fetchStockingLocations();
  }, []);
  // Fetch location names mapping
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
  // Fetch item names from API (for getting names and minQty/defaultQty)
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
  // Fetch brand, model, type APIs for name resolution
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [brandRes, modelRes, typeRes] = await Promise.all([
          fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll')
        ]);
        if (brandRes.ok) {
          const brandData = await brandRes.json();
          setPoBrand(brandData);
        }
        if (modelRes.ok) {
          const modelData = await modelRes.json();
          setPoModel(modelData);
        }
        if (typeRes.ok) {
          const typeData = await typeRes.json();
          setPoType(typeData);
        }
      } catch (error) {
        console.error('Error fetching brand/model/type:', error);
      }
    };
    fetchAll();
  }, []);
  // Calculate net stock from inventory data based on selected stocking location
  const calculateNetStock = (inventoryRecords, selectedLocationId) => {
    // Filter out deleted records
    const activeRecords = inventoryRecords.filter(record => {
      const recordDeleteStatus = record.delete_status !== undefined ? record.delete_status : record.deleteStatus;
      return !recordDeleteStatus;
    });
    // Group by composite key: item_id-category_id-model_id-brand_id-type_id
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
  };
  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://backendaab.in/aabuildersDash/api/inventory/getAll');
        if (!response.ok) {
          console.error('Failed to fetch inventory data');
          setLoading(false);
          return;
        }
        const inventoryRecords = await response.json();
        setInventoryData(inventoryRecords);
        // Calculate initial net stock (all locations)
        const inventoryItems = calculateNetStock(inventoryRecords, null);
        setStockQuantities(inventoryItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);
  // Recalculate net stock when stocking location changes
  useEffect(() => {
    if (inventoryData.length === 0) return;
    const selectedLocationOption = stockingLocationOptions.find(loc =>
      loc.value === selectedStockingLocation || loc.label === selectedStockingLocation
    );
    const selectedLocationId = selectedLocationOption?.id || null;
    const inventoryItems = calculateNetStock(inventoryData, selectedLocationId);
    setStockQuantities(inventoryItems);
  }, [selectedStockingLocation, inventoryData, stockingLocationOptions]);
  // Process inventory items and match with item names API to get display names and minQty/defaultQty
  useEffect(() => {
    if (stockQuantities.length === 0 || itemNamesData.length === 0) {
      if (stockQuantities.length === 0 && !loading) {
        setNetStockData([]);
      }
      return;
    }
    setLoading(true);
    const processedData = [];
    // Create lookup maps from item names API
    const itemNameMap = {}; // itemId -> item data
    const entityMap = {}; // composite key -> entity data
    itemNamesData.forEach(item => {
      const itemId = item.id || item._id || null;
      if (itemId) {
        itemNameMap[String(itemId)] = item;
        // Map entities by composite key, include qty info if present
        const otherPOEntityList = item.otherPOEntityList || [];
        otherPOEntityList.forEach(entity => {
          const entityItemId = entity.itemId || itemId;
          const brandId = entity.brandId || entity.brand_id || null;
          const modelId = entity.modelId || entity.model_id || null;
          const typeId = entity.typeId || entity.type_id || null;
          const categoryId = item.categoryId || item.category_id || null;
          const entityKey = `${entityItemId || 'null'}-${categoryId || 'null'}-${modelId || 'null'}-${brandId || 'null'}-${typeId || 'null'}`;
          const defaultQtyFromEntity = entity.defaultQty || entity.default_qty || '25';
          const minQtyFromEntity = entity.minimumQty || entity.minimum_qty || entity.minQty || entity.min_qty || '5';
          entityMap[entityKey] = {
            ...entity,
            itemName: item.itemName || item.poItemName || item.name || '',
            categoryId: categoryId,
            itemId: entityItemId,
            defaultQty: defaultQtyFromEntity,
            minimumQty: minQtyFromEntity
          };
        });
      }
    });
    // Process each inventory item
    stockQuantities.forEach(invItem => {
      const itemId = invItem.itemId;
      const categoryId = invItem.categoryId;
      const modelId = invItem.modelId;
      const brandId = invItem.brandId;
      const typeId = invItem.typeId;
      const netStock = invItem.netStock;
      // Create composite key to match with entity
      const compositeKey = `${itemId || 'null'}-${categoryId || 'null'}-${modelId || 'null'}-${brandId || 'null'}-${typeId || 'null'}`;
      // Try to find matching entity first
      const matchedEntity = entityMap[compositeKey];
      if (matchedEntity) {
        // Found matching entity - use its data
        const itemName = matchedEntity.itemName || '';
        const brand = matchedEntity.brandName || '';
        const model = matchedEntity.modelName || '';
        const type = matchedEntity.typeColor || '';
        const minQty = matchedEntity.minimumQty || matchedEntity.minQty || '5';
        const defaultQty = matchedEntity.defaultQty || '';
        const categoryIdFromEntity = matchedEntity.categoryId || categoryId;
        // Log resolved qtys for items that will be displayed (from entityMap)
        try {
          console.log('Displayed item (entityMap)', compositeKey, { itemName, defaultQty, minQty });
        } catch (e) { /* ignore */ }
        // Resolve category name
        let categoryName = '';
        if (categoryIdFromEntity) {
          const categoryOption = categoryOptions.find(cat =>
            String(cat.id) === String(categoryIdFromEntity)
          );
          categoryName = categoryOption?.label || categoryOption?.value || '';
        }
        // Determine status based on net stock and min qty
        const minQtyNum = Number(minQty) || 5;
        let status = 'Available';
        if (minQtyNum > 0 && netStock < minQtyNum) {
          status = 'Place Order';
        }
        processedData.push({
          id: compositeKey,
          itemId: itemId,
          itemName: itemName,
          model: model,
          brand: brand,
          type: type,
          category: categoryName,
          defaultQty: defaultQty,
          minQty: minQty,
          netStock: netStock,
          status: status,
          isFavorite: false,
          brandId: brandId,
          modelId: modelId,
          typeId: typeId,
          categoryId: categoryIdFromEntity
        });
      } else {
        // No matching entity found - try to get item name from itemNameMap and resolve brand/model/type
        const itemData = itemNameMap[String(itemId)];
        if (itemData) {
          const itemName = itemData.itemName || itemData.poItemName || itemData.name || '';
          const categoryIdFromItem = itemData.categoryId || itemData.category_id || categoryId;
          // Resolve category name
          let categoryName = '';
          if (categoryIdFromItem) {
            const categoryOption = categoryOptions.find(cat =>
              String(cat.id) === String(categoryIdFromItem)
            );
            categoryName = categoryOption?.label || categoryOption?.value || '';
          }
          // Resolve brand, model, type from their respective APIs
          const findNameById = (array, id, fieldName) => {
            if (!id || !array || array.length === 0) return '';
            const item = array.find(i => String(i.id || i._id) === String(id));
            return item ? (item[fieldName] || item.name || '') : '';
          };
          const brandName = brandId ? findNameById(poBrand, brandId, 'brand') : '';
          const modelName = modelId ? findNameById(poModel, modelId, 'model') : '';
          const typeName = typeId ? findNameById(poType, typeId, 'typeColor') || findNameById(poType, typeId, 'type') : '';
          // Extract qty info from itemData when available. Prefer matching entry in otherPOEntityList when possible
          let defaultQtyFromItem = itemData.defaultQty || itemData.default_qty || '25';
          let minQtyFromItem = itemData.minimumQuantity || itemData.minimumQty || itemData.minimum_qty || itemData.minQty || itemData.min_qty || itemData.minimum || '5';
          if (Array.isArray(itemData.otherPOEntityList) && itemData.otherPOEntityList.length) {
            const matchEntity = itemData.otherPOEntityList.find(ent => {
              // Try to match by brand/model/type when available
              const eBrand = ent.brandId || ent.brand_id || ent.brandName || '';
              const eModel = ent.modelId || ent.model_id || ent.modelName || '';
              const eType = ent.typeId || ent.type_id || ent.typeColor || '';
              const brandMatch = !brandId || String(eBrand) === String(brandId) || String(eBrand) === String(ent.brandName) || String(ent.brandName) === String(brandId);
              const modelMatch = !modelId || String(eModel) === String(modelId) || String(eModel) === String(ent.modelName) || String(ent.modelName) === String(modelId);
              const typeMatch = !typeId || String(eType) === String(typeId) || String(eType) === String(ent.typeColor) || String(ent.typeColor) === String(typeId);
              // Also allow matching by category if provided
              const categoryMatch = !categoryIdFromItem || String(ent.categoryId || ent.category_id) === String(categoryIdFromItem);
              return brandMatch && modelMatch && typeMatch && categoryMatch;
            });
            if (matchEntity) {
              defaultQtyFromItem = defaultQtyFromItem || matchEntity.defaultQty || matchEntity.default_qty || '25';
              minQtyFromItem = minQtyFromItem || matchEntity.minimumQty || matchEntity.minimum_qty || matchEntity.minQty || matchEntity.min_qty || '5';
            } else {
              // No exact match - pick any entry with qtys as a fallback
              const fallbackEntity = itemData.otherPOEntityList.find(ent => ent.defaultQty || ent.default_qty || ent.minimumQty || ent.minimum_qty || ent.minQty || ent.min_qty);
              if (fallbackEntity) {
                defaultQtyFromItem = defaultQtyFromItem || fallbackEntity.defaultQty || fallbackEntity.default_qty || '25';
                minQtyFromItem = minQtyFromItem || fallbackEntity.minimumQty || fallbackEntity.minimum_qty || fallbackEntity.minQty || fallbackEntity.min_qty || '5';
              } else {
                try { console.log('No matching or fallback otherPOEntityList entry for', compositeKey, { defaultQtyFromItem, minQtyFromItem }); } catch (e) { }
              }
            }
          }
          // Determine status based on minQty and net stock
          const minQtyNum = Number(minQtyFromItem) || 5;
          let status = 'Available';
          if (minQtyNum > 0 && netStock < minQtyNum) {
            status = 'Place Order';
          }
          processedData.push({
            id: compositeKey,
            itemId: itemId,
            itemName: itemName,
            model: modelName,
            brand: brandName,
            type: typeName,
            category: categoryName,
            defaultQty: defaultQtyFromItem,
            minQty: minQtyFromItem,
            netStock: netStock,
            status: status,
            isFavorite: false,
            brandId: brandId,
            modelId: modelId,
            typeId: typeId,
            categoryId: categoryIdFromItem
          });
        }
        // If item not found in itemNameMap, skip it (shouldn't happen if inventory is correct)
      }
    });
    setNetStockData(processedData);
    setLoading(false);
  }, [stockQuantities, itemNamesData, categoryOptions, poBrand, poModel, poType, loading]);
  // Filter data based on category and search
  // Note: Stocking location filtering is handled by recalculating net stock
  useEffect(() => {
    let filtered = [...netStockData];
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(item => {
        const itemCategory = item.category || '';
        // Find category option to get both name and ID
        const categoryOption = categoryOptions.find(cat =>
          cat.value === selectedCategory || cat.label === selectedCategory
        );
        const selectedCategoryId = categoryOption?.id || null;
        // Match by name or ID
        return itemCategory === selectedCategory ||
          itemCategory.toLowerCase() === selectedCategory.toLowerCase() ||
          (selectedCategoryId && String(item.categoryId) === String(selectedCategoryId));
      });
    }
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        String(item.itemId || '').toLowerCase().includes(query) ||
        (item.itemName || '').toLowerCase().includes(query) ||
        (item.model || '').toLowerCase().includes(query) ||
        (item.brand || '').toLowerCase().includes(query) ||
        (item.type || '').toLowerCase().includes(query) ||
        (item.category || '').toLowerCase().includes(query)
      );
    }
    // Apply dropdown selectionFilter to the displayed list
    if (selectionFilter) {
      if (selectionFilter === 'Minimum') {
        // Minimum -> items with Place Order status
        filtered = filtered.filter(i => String(i.status) === 'Place Order');
      } else if (selectionFilter === 'Default') {
        // Default -> Available items where netStock < defaultQty (defaultQty must be > 0)
        filtered = filtered.filter(i => {
          const defaultNum = Number(i.defaultQty) || 25;
          return i.status === 'Available' && defaultNum > 0 && Number(i.netStock) < defaultNum;
        });
      } else if (selectionFilter === 'Excess') {
        // Excess -> Available items where netStock >= defaultQty (defaultQty must be > 0)
        filtered = filtered.filter(i => {
          const defaultNum = Number(i.defaultQty) || 25;
          return i.status === 'Available' && defaultNum > 0 && Number(i.netStock) >= defaultNum;
        });
      } else if (selectionFilter === 'All') {
        // All -> no additional filtering
      }
    }
    setFilteredData(filtered);
  }, [selectedCategory, searchQuery, netStockData, categoryOptions, selectionFilter]);
  // Sync selectAll state with selectedCards
  useEffect(() => {
    if (filteredData.length > 0) {
      setSelectAll(selectedCards.length === filteredData.length && filteredData.length > 0);
    } else {
      setSelectAll(false);
    }
  }, [selectedCards, filteredData]);
  // Keep the toggle state in sync: if ALL filtered items are currently selected, show toggle ON.
  useEffect(() => {
    if (!filteredData || filteredData.length === 0) {
      setSelectAllFiltered(false);
      return;
    }
    const allSelected = filteredData.every(i => selectedCards.includes(i.id));
    if (allSelected !== selectAllFiltered) setSelectAllFiltered(allSelected);
  }, [selectedCards, filteredData]);
  // Selection of items is controlled only by the toggle button now.
  // Changing the dropdown filter will NOT auto-select items.
  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };
  const handleExportPDF = () => {
    const doc = new jsPDF();
    // Add title
    doc.setFontSize(16);
    doc.text('Net Stock Report', 14, 15);
    // Add date
    doc.setFontSize(10);
    doc.text(`Date: ${selectedDate}`, 14, 25);
    // Add filters
    if (selectedCategory) {
      doc.text(`Category: ${selectedCategory}`, 14, 32);
    }
    if (selectedStockingLocation) {
      doc.text(`Stocking Location: ${selectedStockingLocation}`, 14, 39);
    }
    // Prepare table data
    const tableData = filteredData.map(item => [
      item.itemId,
      item.itemName,
      item.model,
      item.brand,
      item.type,
      item.category,
      item.defaultQty,
      item.netStock,
      item.minQty,
      item.status
    ]);
    // Add table
    doc.autoTable({
      startY: selectedStockingLocation ? 46 : (selectedCategory ? 39 : 32),
      head: [['Item ID', 'Item Name', 'Model', 'Brand', 'Type', 'Category', 'Default Qty', 'Net Stock', 'Min Qty', 'Status']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [191, 152, 83] }
    });
    // Save PDF
    doc.save(`NetStock_${selectedDate.replace(/\//g, '-')}.pdf`);
  };
  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden">
      {/* Date Row */}
      <div className="px-4">
        <div className=" pt-2 pb-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="text-[12px] font-medium text-black leading-normal underline-offset-2 hover:underline"
            >
              {selectedDate}
            </button>
            <div className="flex items-center gap-3">
              {selectedCards.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    // Get selected items data (include items selected even if currently filtered out)
                    const selectedItemsData = selectedCards
                      .map(selId => netStockData.find(item => item.id === selId))
                      .filter(Boolean)
                      .map(item => ({
                        itemName: item.itemName || '',
                        category: item.category || '',
                        model: item.model || '',
                        brand: item.brand || '',
                        type: item.type || '',
                        quantity: String(
                          item.status === 'Available' ? (item.defaultQty || item.minQty || 1)
                            : item.status === 'Place Order' ? (item.minQty || item.defaultQty || 1)
                              : (item.defaultQty || item.minQty || 1)
                        ),
                        itemId: item.itemId || null,
                        brandId: item.brandId || null,
                        modelId: item.modelId || null,
                        typeId: item.typeId || null,
                        categoryId: item.categoryId || null
                      }))
                      .filter(item => item.itemId !== null && item.itemId !== undefined); // Only include items with valid itemId
                    // Store in localStorage
                    localStorage.setItem('netStockSelectedItems', JSON.stringify(selectedItemsData));
                    // Navigate to PurchaseOrder page
                    navigate('/purchaseorder');
                  }}
                  className="text-[13px] font-medium text-black leading-normal"
                >
                  Add to PO
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Filters Section */}
      <div className="px-4 pt-2 mb-2">
        {/* Category Filter */}
        <div className="space-y-[6px]">
          <div className="">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[12px] font-semibold text-black leading-normal">
                Category
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="text-[12px] font-semibold text-black leading-normal"
                >
                  Export PDF
                </button>
              </div>
            </div>
            <div className="relative">
              <div
                onClick={() => setShowCategoryModal(true)}
                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
                style={{
                  paddingRight: selectedCategory ? '40px' : '12px',
                  boxSizing: 'border-box',
                  color: selectedCategory ? '#000' : '#9E9E9E'
                }}
              >
                <span>{selectedCategory || 'Select Category'}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {selectedCategory && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('');
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
          {/* Stocking Location Filter */}
          <div className="">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Stocking Location
            </p>
            <div className="relative">
              <div
                onClick={() => setShowStockingLocationModal(true)}
                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
                style={{
                  paddingRight: selectedStockingLocation ? '40px' : '12px',
                  boxSizing: 'border-box',
                  color: selectedStockingLocation ? '#000' : '#9E9E9E'
                }}
              >
                <span>{selectedStockingLocation || 'Select Location'}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {selectedStockingLocation && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStockingLocation('');
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
        {/* Search Bar */}
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[40px] border border-[rgba(0,0,0,0.16)] rounded-full pl-10 pr-3 text-[12px] font-medium bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] border border-[rgba(0,0,0,0.16)] rounded-full px-2 py-1 font-semibold text-black">{selectedCards.length}</span>
            </div>
            <div className="flex flex-col">
              <select
                value={selectionFilter || 'All'}
                onChange={(e) => setSelectionFilter(e.target.value)}
                className="h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-1 pr-1 text-[12px] font-medium bg-white"
                style={{ minWidth: '100px' }}
              >
                <option value="All">All</option>
                <option value="Minimum">Minimum</option>
                <option value="Default">Default</option>
                <option value="Excess">Excess</option>
              </select>
            </div>
          </div>
        </div>
        {/* Toggle switch matching provided image (adds/removes only filtered items) */}
        <div className="flex items-center justify-between">
          {selectionFilter && (
            <div className="mt-2">
              <div className="flex items-center">
                <span className="text-[12px] font-medium text-black">
                  {selectionFilter}:
                </span>
                <span className={`text-[12px] font-semibold ${selectionFilter === 'Minimum' ? 'text-[#E4572E]' :
                  selectionFilter === 'Default' ? 'text-[#BF9853]' :
                    selectionFilter === 'Excess' ? 'text-[#007233]' :
                      'text-black'
                  }`}>
                  {filteredData.length}
                </span>
              </div>
            </div>
          )}
          <div
            role="switch"
            tabIndex={0}
            aria-checked={selectAllFiltered}
            aria-disabled={filteredData.length === 0}
            onKeyDown={(e) => {
              if (filteredData.length === 0) return;
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                // Toggle selection: add filtered items (union) or remove filtered items
                if (!selectAllFiltered) {
                  setSelectedCards(prev => {
                    const s = new Set(prev || []);
                    filteredData.forEach(i => s.add(i.id));
                    return Array.from(s);
                  });
                  setSelectAllFiltered(true);
                } else {
                  const filteredSet = new Set(filteredData.map(i => i.id));
                  setSelectedCards(prev => (prev || []).filter(id => !filteredSet.has(id)));
                  setSelectAllFiltered(false);
                }
              }
            }}
            onClick={() => {
              if (filteredData.length === 0) return;
              if (!selectAllFiltered) {
                setSelectedCards(prev => {
                  const s = new Set(prev || []);
                  filteredData.forEach(i => s.add(i.id));
                  return Array.from(s);
                });
                setSelectAllFiltered(true);
              } else {
                const filteredSet = new Set(filteredData.map(i => i.id));
                setSelectedCards(prev => (prev || []).filter(id => !filteredSet.has(id)));
                setSelectAllFiltered(false);
              }
            }}
            className={`w-14 h-5 rounded-full mt- p-1 flex items-center transition-colors ${filteredData.length === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${selectAllFiltered ? 'bg-[#BEE6CC]' : 'bg-[#cfd4d8]'}`}
            title={filteredData.length === 0 ? 'No items to select' : (selectAllFiltered ? 'Unselect filtered items' : 'Select all filtered items')}
          >
            <div className={`bg-white w-5 h-4 rounded-full shadow transform transition-transform duration-200 ease-in-out ${selectAllFiltered ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
        </div>
      </div>
      {/* Product List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide no-scrollbar scrollbar-none">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-[14px] text-gray-500">Loading...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-[14px] text-gray-500">No items found</p>
          </div>
        ) : (
          <div>
            {filteredData.map((item) => {
              const isSelected = selectedCards.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`relative overflow-hidden shadow-lg border bg-gray-50 rounded-[8px] h-[100px] ${isSelected ? 'border-[#007233] border-opacity-100' : 'border-[#E0E0E0] border-opacity-30'}`}
                >
                  {/* Checkmark icon for selected cards */}
                  {isSelected && (
                    <div className="absolute -top-1 -left-0.5 w-6 h-6 bg-[#007233] rounded-full flex items-center justify-center z-10">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.6667 3.5L5.25 10.5L2.33334 7.58333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <div
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCards(selectedCards.filter(id => id !== item.id));
                        if (selectedCards.length === filteredData.length) {
                          setSelectAll(false);
                        }
                      } else {
                        setSelectedCards([...selectedCards, item.id]);
                        if (selectedCards.length + 1 === filteredData.length) {
                          setSelectAll(true);
                        }
                      }
                    }}
                    className="flex-1 bg-white rounded-[8px] h-full px-3 py-3 cursor-pointer transition-all duration-300 ease-out"
                  >
                    <div className="flex items-start justify-between">
                      {/* Left side: Item details */}
                      <div className="flex-1">
                        {/* Item ID and Favorite */}
                        <div className="flex items-center gap-1 mb-1">
                          {item.isFavorite && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.5L6 8.885L2.91 10.5L3.5 7.07L1 4.635L4.455 4.13L6 1Z" fill="#EF4444" />
                            </svg>
                          )}
                        </div>
                        {/* Item Name */}
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-[13px] font-semibold text-black leading-tight">
                            {item.itemName}
                          </p>
                          {item.status === 'Place Order' ? (
                            <button className="bg-[#007233] text-white text-[11px] font-medium px-3 rounded-[4px]">
                              Place Order
                            </button>
                          ) : (
                            <div className="bg-[#f7f1c9] text-[#BF9853] text-[11px] font-medium px-3 rounded-[15px] ">
                              Available
                            </div>
                          )}
                        </div>
                        {/* Model */}
                        <div className="mb-1">
                          <p className="text-[13px] font-semibold text-black leading-tight">
                            {item.model ? `${item.model}` : ''}
                          </p>
                        </div>
                        {/* Brand and Type */}
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-[12px] font-medium text-[#616161]">
                            {item.brand && item.type ? `${item.brand}, ${item.type}` : item.brand || item.type || ''}
                          </p>
                          <p className="text-[11px] font-medium text-[#E4572E] pl-3">
                            Net Stock : {String(item.netStock).padStart(2, '0')}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Default Qty and Min Qty - Same horizontal line */}
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium text-[#BF9853]">
                        Default Qty : {item.defaultQty || '25'}
                      </p>
                      <p className="text-[11px] font-medium text-[#007233] text-right">
                        Min Qty : {item.minQty || '5'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Modals */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialDate={selectedDate}
      />
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
        isOpen={showStockingLocationModal}
        onClose={() => setShowStockingLocationModal(false)}
        onSelect={(value) => {
          setSelectedStockingLocation(value);
          setShowStockingLocationModal(false);
        }}
        selectedValue={selectedStockingLocation}
        options={stockingLocationOptions.map(loc => loc.value || loc.label)}
        fieldName="Stocking Location"
      />
    </div>
  );
};
export default NetStock;