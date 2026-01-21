import React, { useState, useEffect, useRef } from 'react';
import SelectVendorModal from './SelectVendorModal';
import SearchableDropdown from './SearchableDropdown';

const AddItemsToPO = ({ isOpen, onClose, onAdd, initialData = {}, selectedCategory = '', onCategoryChange, onRefreshItemName, onRefreshModel, onRefreshBrand, onRefreshType }) => {
  const [formData, setFormData] = useState({
    itemName: initialData.itemName || '',
    model: initialData.model || '',
    brand: initialData.brand || '',
    type: initialData.type || '',
    quantity: initialData.quantity || '',
    category: initialData.category || selectedCategory || '',
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [quantityError, setQuantityError] = useState('');

  // State for PO item names from API
  const [poItemName, setPoItemName] = useState([]);

  // State for PO model from API
  const [poModel, setPoModel] = useState([]);

  // State for PO brand from API
  const [poBrand, setPoBrand] = useState([]);

  // State for PO type from API
  const [poType, setPoType] = useState([]);

  // State for categories (with IDs) from API
  const [categoryOptions, setCategoryOptions] = useState([]);
  // Category options as strings for dropdown
  const [categoryOptionsStrings, setCategoryOptionsStrings] = useState([]);

  // Store options for each field (could be loaded from localStorage or API)
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]); // Default types until API loads

  // Tile specific options (for when category is TILES) - store with IDs
  const [tileNames, setTileNames] = useState([]);
  const [tileSizes, setTileSizes] = useState([]);
  const [tileData, setTileData] = useState([]); // Store full tile objects with IDs
  const [tileSizeData, setTileSizeData] = useState([]); // Store full tile size objects with IDs

  // Track previous initialData to prevent unnecessary form resets
  const previousInitialDataRef = useRef(null);

  // Fetch PO item names from API
  useEffect(() => {
    fetchPoItemName();
  }, []);

  const fetchPoItemName = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoItemName(data);
        // Options will be filtered by category in useEffect
      } else {
        console.log('Error fetching tile area names.');
        setPoItemName([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setPoItemName([]);
    }
  };

  // Fetch PO model from API
  useEffect(() => {
    fetchPoModel();
  }, []);

  const fetchPoModel = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoModel(data);
        // Options will be filtered by category in useEffect
      } else {
        console.log('Error fetching model names.');
        setPoModel([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setPoModel([]);
    }
  };

  // Fetch PO brand from API
  useEffect(() => {
    fetchPoBrand();
  }, []);

  const fetchPoBrand = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoBrand(data);
        // Options will be filtered by category in useEffect
      } else {
        console.log('Error fetching brand names.');
        setPoBrand([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setPoBrand([]);
    }
  };

  // Fetch PO type from API
  useEffect(() => {
    fetchPoType();
  }, []);

  const fetchPoType = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoType(data);
        // Options will be filtered by category in useEffect
      } else {
        console.log('Error fetching type names.');
        setPoType([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setPoType([]);
    }
  };

  // Fetch tiles list (tile names) and tile sizes for TILES category
  useEffect(() => {
    fetchTiles();
    fetchTileSizes();
  }, []);

  const fetchTiles = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tiles/all/data');
      if (response.ok) {
        const data = await response.json();
        // Store full tile objects with IDs
        setTileData(data || []);
        // Extract names for dropdown display
        const names = (data || []).map(t => t.label || t.tileName).filter(Boolean);
        setTileNames(Array.from(new Set(names)));
      } else {
        setTileData([]);
        setTileNames([]);
      }
    } catch (error) {
      console.error('Error fetching tiles:', error);
      setTileData([]);
      setTileNames([]);
    }
  };

  const fetchTileSizes = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/quantity/size');
      if (response.ok) {
        const data = await response.json();
        // Store full tile size objects with IDs
        setTileSizeData(data || []);
        // Extract size/name fields for dropdown display
        const sizes = (data || []).map(s => s.size || s.tileSize || s.label || s.name).filter(Boolean);
        setTileSizes(Array.from(new Set(sizes)));
      } else {
        setTileSizeData([]);
        setTileSizes([]);
      }
    } catch (error) {
      console.error('Error fetching tile sizes:', error);
      setTileSizeData([]);
      setTileSizes([]);
    }
  };
  useEffect(() => {
    const fetchPoCategory = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = (data || []).map(item => ({
            value: item.category || '',
            label: item.category || '',
            id: item.id || null,
          }));
          setCategoryOptions(options);
          // Also set string options for dropdown
          const categoryStrings = options.map(item => item.label || item.value).filter(Boolean);
          setCategoryOptionsStrings(categoryStrings);
        } else {
          console.log('Error fetching categories, using empty list.');
          setCategoryOptions([]);
          setCategoryOptionsStrings([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoryOptions([]);
        setCategoryOptionsStrings([]);
      }
    };
    fetchPoCategory();
  }, []);
  // Save options to localStorage when they change
  const saveOptions = (field, newOptions) => {
    localStorage.setItem(`${field}Options`, JSON.stringify(newOptions));
  };
  // Filter options based on selected category
  useEffect(() => {
    const currentCategory = formData.category || selectedCategory || '';

    // If TILES category is selected, show tile names and sizes instead of PO item/model lists
    const isTilesCategory = currentCategory && currentCategory.toString().toLowerCase() === 'tile';
    if (isTilesCategory) {
      // Use fetched tile lists (fall back to empty arrays)
      setItemNameOptions(tileNames || []);
      setModelOptions(tileSizes || []);
      // Keep brand and type filtering behavior same as other categories (do not clear them)
      // Intentionally continue to the filtering logic so brand/type options are provided.
    }

    // Helper function to extract name from item based on field type
    const extractName = (item, nameFields) => {
      if (typeof item === 'string') return item;
      for (const field of nameFields) {
        if (item[field] && typeof item[field] === 'string' && item[field].trim() !== '') {
          return item[field].trim();
        }
      }
      return '';
    };
    // Helper function to filter items by category
    const filterByCategory = (items, nameFields, categoryField = 'category') => {
      if (!Array.isArray(items) || items.length === 0) return [];

      if (!currentCategory) {
        // If no category selected, return all items
        return items
          .map(item => extractName(item, nameFields))
          .filter(name => name !== '');
      }
      // Filter items that match the selected category
      return items
        .filter(item => {
          if (typeof item === 'string') return false; // Skip string items if category filtering
          const itemCategory = item[categoryField] || '';
          return itemCategory.toString().toLowerCase().trim() === currentCategory.toLowerCase().trim();
        })
        .map(item => extractName(item, nameFields))
        .filter(name => name !== '');
    };
    // Filter item names (skip when TILES category, we already set tile names above)
    if (!isTilesCategory) {
      if (poItemName && poItemName.length > 0) {
        const filteredItemNames = filterByCategory(poItemName, ['itemName', 'poItemName', 'name', 'item_name'], 'category');
        // Merge with saved names from localStorage
        const savedItemNames = localStorage.getItem('itemNameOptions');
        const savedNames = savedItemNames ? JSON.parse(savedItemNames) : [];
        const allItemNames = [...new Set([...filteredItemNames, ...savedNames])];
        setItemNameOptions(allItemNames);
      } else {
        // If no API data, load from localStorage
        const savedItemNames = localStorage.getItem('itemNameOptions');
        if (savedItemNames) {
          setItemNameOptions(JSON.parse(savedItemNames));
        }
      }
    }
    // Filter models (skip when TILES category, we already set tile sizes above)
    if (!isTilesCategory) {
      if (poModel && poModel.length > 0) {
        const filteredModels = filterByCategory(poModel, ['model', 'poModel', 'modelName', 'name'], 'category');
        const savedModels = localStorage.getItem('modelOptions');
        const savedModelNames = savedModels ? JSON.parse(savedModels) : [];
        const allModels = [...new Set([...filteredModels, ...savedModelNames])];
        setModelOptions(allModels);
      } else {
        const savedModels = localStorage.getItem('modelOptions');
        if (savedModels) {
          setModelOptions(JSON.parse(savedModels));
        }
      }
    }
    // Filter brands
    if (poBrand && poBrand.length > 0) {
      const filteredBrands = filterByCategory(poBrand, ['brand', 'poBrand', 'brandName', 'name'], 'category');
      const savedBrands = localStorage.getItem('brandOptions');
      const savedBrandNames = savedBrands ? JSON.parse(savedBrands) : [];
      const allBrands = [...new Set([...filteredBrands, ...savedBrandNames])];
      setBrandOptions(allBrands);
    } else {
      const savedBrands = localStorage.getItem('brandOptions');
      if (savedBrands) {
        setBrandOptions(JSON.parse(savedBrands));
      }
    }
    // Filter types
    if (poType && poType.length > 0) {
      // Try multiple type field names
      const filteredTypes1 = filterByCategory(poType, ['typeColor'], 'category');
      const filteredTypes2 = filterByCategory(poType, ['type', 'poType', 'typeName', 'name'], 'category');
      const filteredTypesCombined = [...new Set([...filteredTypes1, ...filteredTypes2])];
      const savedTypes = localStorage.getItem('typeOptions');
      const savedTypeNames = savedTypes ? JSON.parse(savedTypes) : [];
      const allTypes = [...new Set([...filteredTypesCombined, ...savedTypeNames])];
      setTypeOptions(allTypes);
    } else {
      const savedTypes = localStorage.getItem('typeOptions');
      if (savedTypes) {
        setTypeOptions(JSON.parse(savedTypes));
      }
    }
  }, [formData.category, selectedCategory, poItemName, poModel, poBrand, poType]);
  // Keep form data in sync when an item is opened for editing
  // Only update when initialData actually changes (not just object reference)
  useEffect(() => {
    // Create a string representation of initialData for comparison
    const currentInitialDataStr = JSON.stringify({
      itemName: initialData?.itemName || '',
      model: initialData?.model || '',
      brand: initialData?.brand || '',
      type: initialData?.type || '',
      quantity: initialData?.quantity || '',
      category: initialData?.category || '',
    });
    const previousInitialDataStr = previousInitialDataRef.current;
    // Only update formData if initialData actually changed
    if (currentInitialDataStr !== previousInitialDataStr) {
      // Check if initialData has any meaningful values (editing mode)
      const hasInitialData = initialData && (
        initialData.itemName ||
        initialData.model ||
        initialData.brand ||
        initialData.type ||
        initialData.quantity ||
        initialData.category
      );
      if (hasInitialData) {
        // Editing mode: update formData with initialData values
        setFormData({
          itemName: initialData.itemName || '',
          model: initialData.model || '',
          brand: initialData.brand || '',
          type: initialData.type || '',
          quantity: initialData.quantity || '',
          category: initialData.category || selectedCategory || '',
        });
      }
      // If no initialData (new item mode), don't reset formData - preserve user's input
      // Update ref to track current initialData
      previousInitialDataRef.current = currentInitialDataStr;
    }
    // Handle category updates separately (only if it actually changed)
    if (selectedCategory) {
      setFormData(prev => {
        // Only update if category actually changed
        if (prev.category !== selectedCategory) {
          return { ...prev, category: selectedCategory };
        }
        return prev;
      });
    }
  }, [
    initialData?.itemName,
    initialData?.model,
    initialData?.brand,
    initialData?.type,
    initialData?.quantity,
    initialData?.category,
    selectedCategory
  ]);
  if (!isOpen) return null;
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, quantity: value });
    if (value && isNaN(value)) {
      setQuantityError('Please Enter Valid Quantity');
    } else {
      setQuantityError('');
    }
  };
  const handleCategorySelect = (category) => {
    setFormData({ ...formData, category });
    // Update parent component to persist category
    if (onCategoryChange) {
      onCategoryChange(category);
    }
    setShowCategoryModal(false);
  };
  // Handler for adding new category
  const handleAddNewCategory = async (newCategory) => {
    if (!newCategory || !newCategory.trim()) {
      return;
    }
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newCategory.trim() }),
      });
      if (response.ok) {
        console.log('Category saved successfully!');
        // Reload categories from API
        const fetchResponse = await fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll');
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          const options = (data || []).map(item => ({
            value: item.category || '',
            label: item.category || '',
            id: item.id || null,
          }));
          setCategoryOptions(options);
          const categoryStrings = options.map(item => item.label || item.value).filter(Boolean);
          setCategoryOptionsStrings(categoryStrings);
        }
        if (!categoryOptionsStrings.includes(newCategory.trim())) {
          setCategoryOptionsStrings([...categoryOptionsStrings, newCategory.trim()]);
        }
      } else {
        console.log('Error saving category.');
        // Still add to local options for immediate use
        if (!categoryOptionsStrings.includes(newCategory.trim())) {
          setCategoryOptionsStrings([...categoryOptionsStrings, newCategory.trim()]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error saving category.');
      // Still add to local options for immediate use
      if (!categoryOptionsStrings.includes(newCategory.trim())) {
        setCategoryOptionsStrings([...categoryOptionsStrings, newCategory.trim()]);
      }
    }
  };
  // Helper: find an id from an array of objects by matching any of the provided name fields
  const findIdByLabel = (list, value, nameFields = []) => {
    if (!value || !Array.isArray(list)) return null;
    const target = value.toLowerCase().trim();
    const match = list.find(item =>
      nameFields.some(field => (item?.[field] || '').toString().toLowerCase().trim() === target)
    );
    return match ? (match.id || match._id || null) : null;
  };
  const handleFieldSelect = (field, value) => {
    // Check if category is required for this field
    const fieldsRequiringCategory = ['itemName', 'model', 'brand', 'type'];
    const currentCategory = formData.category || selectedCategory;
    if (fieldsRequiringCategory.includes(field) && !currentCategory) {
      const fieldNames = {
        itemName: 'Item Name',
        model: 'Model',
        brand: 'Brand',
        type: 'Type'
      };
      alert(`Please select a category first before selecting ${fieldNames[field]}.`);
      return; // Don't allow selection without category
    }
    setFormData({ ...formData, [field]: value });
    // Add to options if it's a new value
    const optionSetters = {
      itemName: setItemNameOptions,
      model: setModelOptions,
      brand: setBrandOptions,
      type: setTypeOptions,
    };
    const optionArrays = {
      itemName: itemNameOptions,
      model: modelOptions,
      brand: brandOptions,
      type: typeOptions,
    };
    if (!optionArrays[field].includes(value)) {
      const newOptions = [...optionArrays[field], value];
      optionSetters[field](newOptions);
      saveOptions(field, newOptions);
    }
  };
  // API handlers for saving new items (same as InputData.jsx)
  const handleSubmitItemName = async (itemName, selectedCategory) => {
    const categoryToUse = selectedCategory || formData.category || '';
    const payload = {
      itemName: itemName,
      category: categoryToUse,
      groupName: '',
      otherPOEntityList: [], // Always empty when saving new item name
    };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to submit data');
      }
      const data = await response.json();
      // Reload item names from API
      await fetchPoItemName();
      // Also refresh parent component's state
      if (onRefreshItemName) {
        await onRefreshItemName();
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const handleSubmitModel = async (model, selectedCategory) => {
    const categoryToUse = selectedCategory || formData.category || '';
    const categoryOption = categoryOptions.find(cat =>
      cat.label === categoryToUse || cat.value === categoryToUse
    );
    const categoryId = categoryOption?.value || categoryOption?.id || null;
    const newModelData = {
      model: model,
      category: categoryId,
    };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newModelData),
      });
      if (response.ok) {
        console.log('Model saved successfully!');
        // Reload models from API
        await fetchPoModel();
        // Also refresh parent component's state
        if (onRefreshModel) {
          await onRefreshModel();
        }
      } else {
        throw new Error('Failed to save model');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const handleSubmitBrand = async (brand, selectedCategory) => {
    const categoryToUse = selectedCategory || formData.category || '';
    const categoryOption = categoryOptions.find(cat =>
      cat.label === categoryToUse || cat.value === categoryToUse
    );
    const categoryId = categoryOption?.value || categoryOption?.id || null;
    const newBrandData = {
      brand,
      category: categoryId
    };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBrandData),
      });
      if (response.ok) {
        console.log('Brand saved successfully!');
        // Reload brands from API
        await fetchPoBrand();
        // Also refresh parent component's state
        if (onRefreshBrand) {
          await onRefreshBrand();
        }
      } else {
        throw new Error('Failed to save brand');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const handleSubmitType = async (typeColor, selectedCategory) => {
    const categoryToUse = selectedCategory || formData.category || '';
    const categoryOption = categoryOptions.find(cat =>
      cat.label === categoryToUse || cat.value === categoryToUse
    );
    const categoryId = categoryOption?.value || categoryOption?.id || null;
    const newTypeData = {
      typeColor,
      category: categoryId
    };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTypeData),
      });
      if (response.ok) {
        console.log('Type saved successfully!');
        // Reload types from API
        await fetchPoType();
        // Also refresh parent component's state
        if (onRefreshType) {
          await onRefreshType();
        }
      } else {
        throw new Error('Failed to save type');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const handleFieldAddNew = async (field, value) => {
    // Get current category
    const currentCategory = formData.category || selectedCategory || '';
    // Check if category is required for this field
    const fieldsRequiringCategory = ['itemName', 'model', 'brand', 'type'];
    if (fieldsRequiringCategory.includes(field) && !currentCategory) {
      const fieldNames = {
        itemName: 'Item Name',
        model: 'Model',
        brand: 'Brand',
        type: 'Type'
      };
      alert(`Please select a category first before adding new ${fieldNames[field]}.`);
      return;
    }
    // Map field names to API handlers
    const apiHandlers = {
      itemName: handleSubmitItemName,
      model: handleSubmitModel,
      brand: handleSubmitBrand,
      type: handleSubmitType,
    };
    // Call API handler if it exists for this field
    const apiHandler = apiHandlers[field];
    if (apiHandler) {
      try {
        await apiHandler(value, currentCategory);
        // After successful API call, add to local state
        handleFieldSelect(field, value);
      } catch (error) {
        console.error(`Error saving ${field}:`, error);
        alert(`Failed to save ${field}. Please try again.`);
        // Still add to local state even if API fails (fallback behavior)
        handleFieldSelect(field, value);
      }
    } else {
      // No API handler, just add to local state
      handleFieldSelect(field, value);
    }
  };
  const handleAdd = async () => {
    if (!formData.quantity || isNaN(formData.quantity)) {
      setQuantityError('Please Enter Valid Quantity');
      return;
    }
    // Check if TILE category is selected (category_id = 10 or category name is "TILE")
    const currentCategory = formData.category || selectedCategory || '';
    const isTilesCategory = currentCategory && (
      currentCategory.toString().toLowerCase() === 'tile' ||
      currentCategory.toString() === '10'
    );
    
    // First, try to resolve IDs with current arrays
    // Check if we're in editing mode
    const isEditingMode = initialData && (initialData.itemId !== undefined || initialData.itemName !== undefined);
    // Check if itemName has changed from initialData
    // If initialData.itemName is empty/missing but we have formData.itemName, consider it changed
    // This handles the case where old item was deleted and only had an ID
    const hasInitialItemName = initialData && initialData.itemName && initialData.itemName.trim() !== '';
    const hasFormItemName = formData.itemName && formData.itemName.trim() !== '';
    const itemNameChanged = isEditingMode && (
      !hasInitialItemName || // If initialData has no itemName but formData does, it changed
      !hasFormItemName || // If formData has no itemName but initialData does, it changed
      (hasInitialItemName && hasFormItemName && 
       initialData.itemName.toLowerCase().trim() !== formData.itemName.toLowerCase().trim()) // Names don't match
    );
    // Always try to resolve ID from the current formData.itemName first
    // This ensures we get the correct ID for newly selected items
    let resolvedItemId = null;
    if (formData.itemName) {
      // For TILE category, resolve from tileData instead of poItemName
      if (isTilesCategory) {
        resolvedItemId = findIdByLabel(tileData, formData.itemName, ['label', 'tileName', 'name']);
      } else {
        resolvedItemId = findIdByLabel(poItemName, formData.itemName, ['itemName', 'poItemName', 'name', 'item_name']);
      }
    }
    // Only use initialData.itemId as fallback if:
    // 1. We couldn't resolve from formData.itemName AND
    // 2. The itemName hasn't changed (meaning user is editing the same item, not selecting a new one)
    // IMPORTANT: If itemNameChanged is true OR if we're editing and formData.itemName exists, 
    // we should NEVER use initialData.itemId, even if resolution fails
    if (!resolvedItemId && !itemNameChanged && initialData && initialData.itemId) {
      resolvedItemId = initialData.itemId;
    }
    // If we're editing and itemName changed but couldn't resolve, log a warning
    if (isEditingMode && itemNameChanged && !resolvedItemId && formData.itemName) {
      console.warn('Could not resolve itemId for changed item:', formData.itemName, 'Initial itemName:', initialData.itemName);
    }
    // Only use initialData IDs if the corresponding field hasn't changed
    const modelChanged = isEditingMode && initialData.model && formData.model && 
      initialData.model.toLowerCase().trim() !== formData.model.toLowerCase().trim();
    const brandChanged = isEditingMode && initialData.brand && formData.brand && 
      initialData.brand.toLowerCase().trim() !== formData.brand.toLowerCase().trim();
    const typeChanged = isEditingMode && initialData.type && formData.type && 
      initialData.type.toLowerCase().trim() !== formData.type.toLowerCase().trim();
    // Always try to resolve from current formData first
    let resolvedModelId = null;
    if (formData.model) {
      // For TILE category, resolve from tileSizeData instead of poModel
      if (isTilesCategory) {
        resolvedModelId = findIdByLabel(tileSizeData, formData.model, ['size', 'tileSize', 'label', 'name']);
      } else {
        resolvedModelId = findIdByLabel(poModel, formData.model, ['model', 'poModel', 'modelName', 'name']);
      }
    }
    if (!resolvedModelId && !modelChanged && initialData.modelId) {
      resolvedModelId = initialData.modelId;
    }
    let resolvedBrandId = null;
    if (formData.brand) {
      resolvedBrandId = findIdByLabel(poBrand, formData.brand, ['brand', 'poBrand', 'brandName', 'name']);
    }
    if (!resolvedBrandId && !brandChanged && initialData.brandId) {
      resolvedBrandId = initialData.brandId;
    }    
    let resolvedTypeId = null;
    if (formData.type) {
      resolvedTypeId = findIdByLabel(poType, formData.type, ['type', 'poType', 'typeName', 'name', 'typeColor']);
    }
    if (!resolvedTypeId && !typeChanged && initialData.typeId) {
      resolvedTypeId = initialData.typeId;
    }
    // If any ID is missing, refresh the arrays and try again
    if ((!resolvedItemId && formData.itemName) ||
        (!resolvedModelId && formData.model) ||
        (!resolvedBrandId && formData.brand) ||
        (!resolvedTypeId && formData.type)) {
      // Refresh all arrays that need refreshing
      const refreshPromises = [];
      if (!resolvedItemId && formData.itemName) {
        if (isTilesCategory) {
          refreshPromises.push(fetchTiles());
        } else {
          refreshPromises.push(fetchPoItemName());
          if (onRefreshItemName) {
            refreshPromises.push(onRefreshItemName());
          }
        }
      }
      if (!resolvedModelId && formData.model) {
        if (isTilesCategory) {
          refreshPromises.push(fetchTileSizes());
        } else {
          refreshPromises.push(fetchPoModel());
          if (onRefreshModel) {
            refreshPromises.push(onRefreshModel());
          }
        }
      }
      if (!resolvedBrandId && formData.brand) {
        refreshPromises.push(fetchPoBrand());
        if (onRefreshBrand) {
          refreshPromises.push(onRefreshBrand());
        }
      }
      if (!resolvedTypeId && formData.type) {
        refreshPromises.push(fetchPoType());
        if (onRefreshType) {
          refreshPromises.push(onRefreshType());
        }
      }
      // Wait for all refreshes to complete
      await Promise.all(refreshPromises);
      // Fetch fresh data directly from API to resolve IDs
      let freshItemName = poItemName;
      let freshModel = poModel;
      let freshTileData = tileData;
      let freshTileSizeData = tileSizeData;
      let freshBrand = poBrand;
      let freshType = poType;
      // If still not resolved, fetch directly
      if (!resolvedItemId && formData.itemName) {
        try {
          if (isTilesCategory) {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/tiles/all/data');
            if (response.ok) {
              freshTileData = await response.json();
              setTileData(freshTileData);
              resolvedItemId = findIdByLabel(freshTileData, formData.itemName, ['label', 'tileName', 'name']);
              if (!resolvedItemId) {
                console.warn('Could not find tile ID for:', formData.itemName);
              }
            }
          } else {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
            if (response.ok) {
              freshItemName = await response.json();
              // Update poItemName state with fresh data
              setPoItemName(freshItemName);
              resolvedItemId = findIdByLabel(freshItemName, formData.itemName, ['itemName', 'poItemName', 'name', 'item_name']);
              // Debug logging
              if (!resolvedItemId) {
                console.warn('Could not find itemId for:', formData.itemName, 'in fresh data. Available items:', freshItemName.slice(0, 5).map(i => i.itemName || i.name));
              }
            }
          }
        } catch (error) {
          console.error('Error fetching item names:', error);
        }
      }
      if (!resolvedModelId && formData.model) {
        try {
          if (isTilesCategory) {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/quantity/size');
            if (response.ok) {
              freshTileSizeData = await response.json();
              setTileSizeData(freshTileSizeData);
              resolvedModelId = findIdByLabel(freshTileSizeData, formData.model, ['size', 'tileSize', 'label', 'name']);
              if (!resolvedModelId) {
                console.warn('Could not find tile size ID for:', formData.model);
              }
            }
          } else {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll');
            if (response.ok) {
              freshModel = await response.json();
              resolvedModelId = findIdByLabel(freshModel, formData.model, ['model', 'poModel', 'modelName', 'name']);
            }
          }
        } catch (error) {
          console.error('Error fetching models:', error);
        }
      }
      if (!resolvedBrandId && formData.brand) {
        try {
          const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll');
          if (response.ok) {
            freshBrand = await response.json();
            resolvedBrandId = findIdByLabel(freshBrand, formData.brand, ['brand', 'poBrand', 'brandName', 'name']);
          }
        } catch (error) {
          console.error('Error fetching brands:', error);
        }
      }
      if (!resolvedTypeId && formData.type) {
        try {
          const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll');
          if (response.ok) {
            freshType = await response.json();
            resolvedTypeId = findIdByLabel(freshType, formData.type, ['type', 'poType', 'typeName', 'name', 'typeColor']);
          }
        } catch (error) {
          console.error('Error fetching types:', error);
        }
      }
    }
    let resolvedCategoryId =
      initialData.categoryId ||
      findIdByLabel(categoryOptions, formData.category, ['label', 'name', 'categoryName', 'category']);
    // If category is "TILE" (case-insensitive), ensure it resolves to category_id = 10
    if (!resolvedCategoryId && formData.category && formData.category.toString().toLowerCase() === 'tile') {
      resolvedCategoryId = 10;
    }
    if (!resolvedCategoryId && categoryOptions.length > 0) {
      resolvedCategoryId = categoryOptions[0].id || null;
    }
    onAdd({
      ...formData,
      itemId: resolvedItemId || null,
      modelId: resolvedModelId || null,
      brandId: resolvedBrandId || null,
      typeId: resolvedTypeId || null,
      categoryId: resolvedCategoryId || null,
    });
    // Clear all fields after adding, but preserve category
    const categoryToPreserve = formData.category || selectedCategory;
    setFormData({
      itemName: '',
      model: '',
      brand: '',
      type: '',
      quantity: '',
      category: categoryToPreserve, // Preserve current selection
    });
    setQuantityError('');
    // Don't close the popup - let user close manually or continue adding items
  };
  const handleBackdropClick = (e) => {
    // Close modal if clicking on the backdrop (not on the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center"
        style={{ fontFamily: "'Manrope', sans-serif" }}
        onClick={handleBackdropClick}
      >
        <div className="bg-white w-full max-w-[360px] h-[422px] rounded-tl-[16px] rounded-tr-[16px] relative z-50" onClick={(e) => e.stopPropagation()}>
          {/* Header with Title and Category */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            {/* Title on the left */}
            <p className="text-[16px] font-medium text-black leading-normal">
              Add Items to PO
            </p>
            {/* Category label on the right */}
            <button
              onClick={() => setShowCategoryModal(true)}
              className="text-[16px] font-semibold text-black underline decoration-solid"
              style={{ textUnderlinePosition: 'from-font' }}
            >
              {(formData.category || selectedCategory) || 'Category'}
            </button>
          </div>
          {/* Form fields - All fields are enabled and can be used independently of category selection */}
          <div className="px-6 pb-32">
            {/* Item Name - Can be selected without category */}
            <div className="mb-[10px] relative">
              <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                Item Name<span className="text-[#eb2f8e]">*</span>
              </p>
              <SearchableDropdown
                value={formData.itemName}
                onChange={(value) => handleFieldSelect('itemName', value)}
                onAddNew={(value) => handleFieldAddNew('itemName', value)}
                options={itemNameOptions}
                placeholder="12A Switch"
                fieldName="Item Name"
                showAllOptions={true}
              />
            </div>
            {/* Model - Can be selected without category */}
            <div className="mb-[10px] relative">
              <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                Model<span className="text-[#eb2f8e]">*</span>
              </p>
              <SearchableDropdown
                value={formData.model}
                onChange={(value) => handleFieldSelect('model', value)}
                onAddNew={(value) => handleFieldAddNew('model', value)}
                options={modelOptions}
                placeholder="Natural Cream"
                fieldName="Model"
                showAllOptions={true}
              />
            </div>
            {/* Brand - Can be selected without category */}
            <div className="w-full mb-[10px] relative">
              <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                Type<span className="text-[#eb2f8e]">*</span>
              </p>
              <SearchableDropdown
                value={formData.type}
                onChange={(value) => handleFieldSelect('type', value)}
                onAddNew={(value) => handleFieldAddNew('type', value)}
                options={typeOptions}
                placeholder="Flip Type"
                className="w-full h-[32px]"
                fieldName="Type"
                showAllOptions={true}
              />
            </div>
            {/* Type and Quantity row */}
            <div className="flex gap-3 mb-10">
              {/* Type - Can be selected without category */}
              <div className="w-full relative">
                <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                  Brand<span className="text-[#eb2f8e]">*</span>
                </p>
                <SearchableDropdown
                  value={formData.brand}
                  onChange={(value) => handleFieldSelect('brand', value)}
                  onAddNew={(value) => handleFieldAddNew('brand', value)}
                  options={brandOptions}
                  placeholder="Kundan"
                  fieldName="Brand"
                  showAllOptions={true}
                />
              </div>
              {/* Quantity */}
              <div className="w-[100px] relative">
                <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                  Quantity<span className="text-[#eb2f8e]">*</span>
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={handleQuantityChange}
                    className={`w-[100px] h-[32px] border rounded-[8px] px-3 text-[12px] font-medium bg-white focus:outline-none ${quantityError ? 'border-[#e06256] text-black' : 'border-[#d6d6d6] text-black'
                      }`}
                    placeholder="Enter"
                  />
                  {quantityError && (
                    <p className="absolute -bottom-5 left-0 text-[10px] text-[#f57368] leading-normal">
                      {quantityError}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className=" bottom-6 flex gap-4">
              <button
                onClick={onClose}
                className="w-[175px] h-[40px] border border-[#949494] rounded-[8px] text-[14px] font-bold text-[#363636] bg-white leading-normal"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="w-[175px] h-[40px] bg-black border border-[#f4ede2] rounded-[8px] text-[14px] font-bold text-white leading-normal"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      <SelectVendorModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(value) => {
          handleCategorySelect(value);
          setShowCategoryModal(false);
        }}
        selectedValue={formData.category || selectedCategory}
        options={categoryOptionsStrings}
        fieldName="Category"
        onAddNew={handleAddNewCategory}
      />
    </>
  );
};
export default AddItemsToPO;