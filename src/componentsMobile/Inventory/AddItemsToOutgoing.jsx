import React, { useState, useEffect, useRef } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import CloseIcon from '../Images/Close F.svg';
import { fetchUserModulePermissions } from '../utils/fetchUserModulePermissions';

const AddItemsToOutgoing = ({ isOpen, onClose, onAdd, initialData = {}, selectedCategory = '', onCategoryChange, onRefreshItemName, onRefreshModel, onRefreshBrand, onRefreshType }) => {
  const [formData, setFormData] = useState({
    itemName: initialData.itemName || '',
    model: initialData.model || '',
    brand: initialData.brand || '',
    type: initialData.type || '',
    quantity: initialData.quantity || '',
    category: initialData.category || selectedCategory || '',
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemNameModal, setShowItemNameModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [quantityError, setQuantityError] = useState('');

  // Resolve module permissions (Create/Edit/Delete) for mobile create actions.
  const [modulePermissions, setModulePermissions] = useState([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      fetchUserModulePermissions(stored?.userRoles || [], 'Inventory')
        .then(setModulePermissions)
        .catch(() => setModulePermissions([]));
    } catch {
      setModulePermissions([]);
    }
  }, []);

  const canCreate = modulePermissions.includes('Create');

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

  // Track previous initialData to prevent unnecessary form resets
  const previousInitialDataRef = useRef(null);

  // Fetch PO item names from API
  useEffect(() => {
    fetchPoItemName();
  }, []);

  const fetchPoItemName = async () => {
    try {
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_itemNames/getAll');
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
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_model/getAll');
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
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_brand/getAll');
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
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_type/getAll');
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
  useEffect(() => {
    const fetchPoCategory = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_category/getAll');
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
    // Filter item names
    if (poItemName && poItemName.length > 0) {
      const filteredItemNames = filterByCategory(poItemName, ['itemName', 'poItemName', 'name', 'item_name'], 'category');
      // Merge with saved names from localStorage
      const savedItemNames = localStorage.getItem('itemNameOptions');
      const savedNames = savedItemNames ? JSON.parse(savedItemNames) : [];
      // Keep localStorage suggestions only if they belong to current category
      const savedNamesInCategory = savedNames.filter((n) => filteredItemNames.includes(n));
      const allItemNames = [...new Set([...filteredItemNames, ...savedNamesInCategory])];
      setItemNameOptions(allItemNames);
    } else {
      // If no API data, load from localStorage
      const savedItemNames = localStorage.getItem('itemNameOptions');
      if (savedItemNames) {
        setItemNameOptions(JSON.parse(savedItemNames));
      }
    }
    // Filter models
    if (poModel && poModel.length > 0) {
      const filteredModels = filterByCategory(poModel, ['model', 'poModel', 'modelName', 'name'], 'category');
      const savedModels = localStorage.getItem('modelOptions');
      const savedModelNames = savedModels ? JSON.parse(savedModels) : [];
      const savedModelsInCategory = savedModelNames.filter((n) => filteredModels.includes(n));
      const allModels = [...new Set([...filteredModels, ...savedModelsInCategory])];
      setModelOptions(allModels);
    } else {
      const savedModels = localStorage.getItem('modelOptions');
      if (savedModels) {
        setModelOptions(JSON.parse(savedModels));
      }
    }

    // Filter brands
    if (poBrand && poBrand.length > 0) {
      const filteredBrands = filterByCategory(poBrand, ['brand', 'poBrand', 'brandName', 'name'], 'category');
      const savedBrands = localStorage.getItem('brandOptions');
      const savedBrandNames = savedBrands ? JSON.parse(savedBrands) : [];
      const savedBrandsInCategory = savedBrandNames.filter((n) => filteredBrands.includes(n));
      const allBrands = [...new Set([...filteredBrands, ...savedBrandsInCategory])];
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
      const savedTypesInCategory = savedTypeNames.filter((n) => filteredTypesCombined.includes(n));
      const allTypes = [...new Set([...filteredTypesCombined, ...savedTypesInCategory])];
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
    if (!canCreate) {
      alert("You don't have permission to create categories.");
      return;
    }
    try {
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_category/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newCategory.trim() }),
      });
      if (response.ok) {
        console.log('Category saved successfully!');
        // Reload categories from API
        const fetchResponse = await fetch('https://backendaab.in/demoAabuildersDash/api/po_category/getAll');
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

  const findIdByLabel = (list, value, nameFields = []) => {
    if (!value || !Array.isArray(list)) return null;
    const target = value.toLowerCase().trim();
    const match = list.find(item =>
      nameFields.some(field => (item?.[field] || '').toString().toLowerCase().trim() === target)
    );
    return match ? (match.id || match._id || null) : null;
  };
  const handleFieldSelect = (field, value) => {
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
      return;
    }
    setFormData({ ...formData, [field]: value });
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
  const handleSubmitItemName = async (itemName, selectedCategory) => {
    if (!canCreate) {
      alert("You don't have permission to create item names.");
      return;
    }
    const categoryToUse = selectedCategory || formData.category || '';
    const payload = {
      itemName: itemName,
      category: categoryToUse,
      groupName: '',
      otherPOEntityList: [],
    };
    try {
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_itemNames/save', {
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
      await fetchPoItemName();
      if (onRefreshItemName) {
        await onRefreshItemName();
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const handleSubmitModel = async (model, selectedCategory) => {
    if (!canCreate) {
      alert("You don't have permission to create models.");
      return;
    }
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
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_model/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newModelData),
      });
      if (response.ok) {
        await fetchPoModel();
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
    if (!canCreate) {
      alert("You don't have permission to create brands.");
      return;
    }
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
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_brand/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBrandData),
      });
      if (response.ok) {
        await fetchPoBrand();
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
    if (!canCreate) {
      alert("You don't have permission to create types.");
      return;
    }
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
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_type/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTypeData),
      });
      if (response.ok) {
        await fetchPoType();
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
    const currentCategory = formData.category || selectedCategory || '';
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
    const apiHandlers = {
      itemName: handleSubmitItemName,
      model: handleSubmitModel,
      brand: handleSubmitBrand,
      type: handleSubmitType,
    };
    const apiHandler = apiHandlers[field];
    if (apiHandler) {
      try {
        await apiHandler(value, currentCategory);
        handleFieldSelect(field, value);
      } catch (error) {
        console.error(`Error saving ${field}:`, error);
        alert(`Failed to save ${field}. Please try again.`);
        handleFieldSelect(field, value);
      }
    } else {
      handleFieldSelect(field, value);
    }
  };
  const handleAdd = () => {
    const currentCategory = formData.category || selectedCategory || '';
    if (!currentCategory) {
      alert('Please select a category first before adding items.');
      return;
    }
    if (!formData.quantity || isNaN(formData.quantity)) {
      setQuantityError('Please Enter Valid Quantity');
      return;
    }
    const resolvedItemId =
      initialData.itemId ||
      findIdByLabel(poItemName, formData.itemName, ['itemName', 'poItemName', 'name', 'item_name']);
    const resolvedModelId =
      initialData.modelId ||
      findIdByLabel(poModel, formData.model, ['model', 'poModel', 'modelName', 'name']);
    const resolvedBrandId =
      initialData.brandId ||
      findIdByLabel(poBrand, formData.brand, ['brand', 'poBrand', 'brandName', 'name']);
    const resolvedTypeId =
      initialData.typeId ||
      findIdByLabel(poType, formData.type, ['type', 'poType', 'typeName', 'name', 'typeColor']);
    let resolvedCategoryId =
      initialData.categoryId ||
      findIdByLabel(categoryOptions, formData.category || selectedCategory, ['label', 'name', 'categoryName', 'category']);
    if (!resolvedCategoryId && categoryOptions.length > 0) {
      const categoryToMatch = (formData.category || selectedCategory || '').toLowerCase().trim();
      const matchedCategory = categoryOptions.find(cat => {
        const catName = (cat.category || cat.label || cat.name || '').toLowerCase().trim();
        return catName === categoryToMatch;
      });
      resolvedCategoryId = matchedCategory ? (matchedCategory.id || matchedCategory._id || null) : null;
    }
    if (!resolvedCategoryId) {
      alert('Category is required. Please select a valid category.');
      return;
    }
    onAdd({
      ...formData,
      itemId: resolvedItemId || null,
      modelId: resolvedModelId || null,
      brandId: resolvedBrandId || null,
      typeId: resolvedTypeId || null,
      categoryId: resolvedCategoryId || null,
    });
    const categoryToPreserve = formData.category || selectedCategory;
    setFormData({
      itemName: '',
      model: '',
      brand: '',
      type: '',
      quantity: '',
      category: categoryToPreserve,
    });
    setQuantityError('');
  };
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }} onClick={handleBackdropClick}>
        <div className="bg-white w-full h-[370px] rounded-tl-[16px] rounded-tr-[16px] relative z-50" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-[24px] pt-[20px] pb-[16px]">
            <p className="text-[16px] font-bold text-black leading-normal">
              Add Items
            </p>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="text-[16px] font-semibold text-black decoration-solid"
              style={{ textUnderlinePosition: 'from-font' }}
            >
              {(formData.category || selectedCategory) || 'Category'}
            </button>
          </div>
          <div className="px-[24px]">
            <div>
              {(() => {
                const isCategorySelected = !!(formData.category || selectedCategory);
                return (
                  <div className="space-y-[6px]">
                    <div className=" relative">
                      <p className="text-[13px] font-medium text-black mb-0.5 leading-normal">
                        Item Name<span className="text-[#E4572E]">*</span>
                      </p>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            if (isCategorySelected) setShowItemNameModal(true);
                          }}
                          disabled={!isCategorySelected}
                          className={`w-full h-[32px] px-[12px] border border-[rgba(0,0,0,0.16)] rounded text-[12px] font-medium text-black bg-white flex items-center justify-between focus:outline-none ${
                            !isCategorySelected ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          style={{
                            paddingRight: formData.itemName ? '32px' : '12px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <span className={formData.itemName ? 'text-black' : 'text-[#9E9E9E]'}>
                            {formData.itemName || 'Select ...'}
                          </span>
                          {!formData.itemName && (
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        {formData.itemName && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData((prev) => ({ ...prev, itemName: '' }));
                            }}
                            className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
                            style={{ right: '8px' }}
                          >
                            <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className=" relative">
                      <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                        Model<span className="text-[#E4572E]">*</span>
                      </p>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            if (isCategorySelected) setShowModelModal(true);
                          }}
                          disabled={!isCategorySelected}
                          className={`w-full h-[32px] px-[12px] border border-[rgba(0,0,0,0.16)] rounded text-[12px] font-medium text-black bg-white flex items-center justify-between focus:outline-none ${
                            !isCategorySelected ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          style={{
                            paddingRight: formData.model ? '32px' : '12px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <span className={formData.model ? 'text-black' : 'text-[#9E9E9E]'}>
                            {formData.model || 'Select ...'}
                          </span>
                          {!formData.model && (
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        {formData.model && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData((prev) => ({ ...prev, model: '' }));
                            }}
                            className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
                            style={{ right: '8px' }}
                          >
                            <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="w-full relative">
                      <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                        Type<span className="text-[#E4572E]">*</span>
                      </p>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            if (isCategorySelected) setShowTypeModal(true);
                          }}
                          disabled={!isCategorySelected}
                          className={`w-full h-[32px] px-[12px] border border-[rgba(0,0,0,0.16)] rounded text-[12px] font-medium text-black bg-white flex items-center justify-between focus:outline-none ${
                            !isCategorySelected ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          style={{
                            paddingRight: formData.type ? '32px' : '12px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <span className={formData.type ? 'text-black' : 'text-[#9E9E9E]'}>
                            {formData.type || 'Select ...'}
                          </span>
                          {!formData.type && (
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        {formData.type && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData((prev) => ({ ...prev, type: '' }));
                            }}
                            className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
                            style={{ right: '8px' }}
                          >
                            <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-[12px]">
                      <div className="w-full relative">
                        <p className="text-[13px] font-medium text-black mb-0.5 leading-normal">
                          Brand<span className="text-[#E4572E]">*</span>
                        </p>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              if (isCategorySelected) setShowBrandModal(true);
                            }}
                            disabled={!isCategorySelected}
                            className={`w-full h-[32px] px-[12px] border border-[rgba(0,0,0,0.16)] rounded text-[12px] font-medium text-black bg-white flex items-center justify-between focus:outline-none ${
                              !isCategorySelected ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            style={{
                              paddingRight: formData.brand ? '32px' : '12px',
                              boxSizing: 'border-box',
                            }}
                          >
                            <span className={formData.brand ? 'text-black' : 'text-[#9E9E9E]'}>
                              {formData.brand || 'Select ...'}
                            </span>
                            {!formData.brand && (
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                          {formData.brand && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData((prev) => ({ ...prev, brand: '' }));
                              }}
                              className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
                              style={{ right: '8px' }}
                            >
                              <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="w-[100px] relative">
                        <p className="text-[13px] font-medium text-black mb-0.5 leading-normal">
                          Quantity<span className="text-[#E4572E]">*</span>
                        </p>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.quantity}
                            onChange={handleQuantityChange}
                            className={`w-[100px] h-[32px] border rounded px-[12px] text-[12px] font-medium bg-white focus:outline-none ${quantityError ? 'border-[#e06256] text-black' : 'border-[#d6d6d6] text-black'
                              }`}
                            style={{ fontFamily: "'Manrope', sans-serif" }}
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
                  </div>
                );
              })()}
            </div>
            <div className="mt-5 mb-3 flex gap-[16px] sticky bottom-0 bg-white z-[10]">
              <button
                onClick={onClose}
                className="w-full h-[40px] border border-[#949494] rounded-[8px] text-[14px] font-bold text-[#363636] bg-white leading-normal"
              >
                Cancel
              </button>
              <button onClick={handleAdd} className="w-full h-[40px] bg-black border border-[#f4ede2] rounded-[8px] text-[14px] font-bold text-white leading-normal">
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
      <SelectVendorModal
        isOpen={showItemNameModal}
        onClose={() => setShowItemNameModal(false)}
        onSelect={(value) => {
          handleFieldSelect('itemName', value);
        }}
        selectedValue={formData.itemName}
        options={itemNameOptions.filter((opt) => opt && opt.toString().trim() !== '')}
        fieldName="Item Name"
        onAddNew={(value) => handleFieldAddNew('itemName', value)}
      />
      <SelectVendorModal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        onSelect={(value) => {
          handleFieldSelect('model', value);
        }}
        selectedValue={formData.model}
        options={modelOptions}
        fieldName="Model"
        onAddNew={(value) => handleFieldAddNew('model', value)}
      />
      <SelectVendorModal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelect={(value) => {
          handleFieldSelect('type', value);
        }}
        selectedValue={formData.type}
        options={typeOptions}
        fieldName="Type"
        onAddNew={(value) => handleFieldAddNew('type', value)}
      />
      <SelectVendorModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSelect={(value) => {
          handleFieldSelect('brand', value);
        }}
        selectedValue={formData.brand}
        options={brandOptions}
        fieldName="Brand"
        onAddNew={(value) => handleFieldAddNew('brand', value)}
      />
    </>
  );
};
export default AddItemsToOutgoing;