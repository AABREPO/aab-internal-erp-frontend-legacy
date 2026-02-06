import React, { useState, useEffect } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import SelectLocatorsModal from './SelectLocatorsModal';
import Edit from '../Images/edit1.png';
import Delete from '../Images/delete.png';

const AddInput = () => {
  // Form state (same as InputData)
  const [category, setCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [formData, setFormData] = useState({
    itemName: '',
    model: '',
    type: '',
    brand: '',
    minQty: '',
    defaultQty: ''
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemNameModal, setShowItemNameModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupOptions, setGroupOptions] = useState([]);

  // State for otherPOEntityList and selected item data (same as InputData)
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [otherPOEntityList, setOtherPOEntityList] = useState([]);
  const [poItemNameData, setPoItemNameData] = useState([]);
  const [poItemNameId, setPoItemNameId] = useState(null);
  const [poEditItemList, setPoEditItemList] = useState({
    itemName: '',
    category: '',
    groupName: '',
    otherPOEntityList: []
  });

  // State for editing row and swipe functionality (same as InputData)
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [swipeStates, setSwipeStates] = useState({});
  const [expandedRowIndex, setExpandedRowIndex] = useState(null);

  // Fetch group names from API (same as InputData page but independent)
  const fetchGroupNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/group_name/getAll');
      if (response.ok) {
        const data = await response.json();
        const options = (data || []).map(item => item.groupName || '').filter(Boolean);
        setGroupOptions(options);
      } else {
        console.log('Error fetching group names.');
        setGroupOptions([]);
      }
    } catch (error) {
      console.error('Error fetching group names:', error);
      setGroupOptions([]);
    }
  };

  // Fetch categories with IDs from API
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

  // Fetch group names when component mounts
  useEffect(() => {
    fetchGroupNames();
    fetchPoCategory();
    loadOptions();
  }, []);

  // Load options from localStorage and API
  const loadOptions = () => {
    // Load from localStorage and filter out empty strings
    const itemNames = JSON.parse(localStorage.getItem('itemNameOptions') || '[]')
      .filter(item => item && item.trim() !== '' && typeof item === 'string');
    const brands = JSON.parse(localStorage.getItem('brandOptions') || '[]')
      .filter(brand => brand && brand.trim() !== '' && typeof brand === 'string');
    const models = JSON.parse(localStorage.getItem('modelOptions') || '[]')
      .filter(model => model && model.trim() !== '' && typeof model === 'string');
    const types = JSON.parse(localStorage.getItem('typeOptions') || '[]')
      .filter(type => type && type.trim() !== '' && typeof type === 'string');

    setItemNameOptions(itemNames);
    setBrandOptions(brands);
    setModelOptions(models);
    setTypeOptions(types);

    // Also try to fetch from API
    fetchPoItemName();
    fetchPoModel();
    fetchPoBrand();
    fetchPoType();
  };

  // Handle adding new category
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
        await fetchPoCategory();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  };

  // Handle adding new group name
  const handleAddNewGroupName = async (newGroupName) => {
    if (!newGroupName || !newGroupName.trim()) {
      return;
    }
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/group_name/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupName: newGroupName.trim() }),
      });
      if (response.ok) {
        console.log('Group name saved successfully!');
        await fetchGroupNames();
        if (!groupOptions.includes(newGroupName.trim())) {
          setGroupOptions([...groupOptions, newGroupName.trim()]);
        }
      } else {
        console.log('Error saving group name.');
        // Still add to local options for immediate use
        if (!groupOptions.includes(newGroupName.trim())) {
          setGroupOptions([...groupOptions, newGroupName.trim()]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error saving group name.');
      // Still add to local options for immediate use
      if (!groupOptions.includes(newGroupName.trim())) {
        setGroupOptions([...groupOptions, newGroupName.trim()]);
      }
    }
  };

  const [selectedLocators, setSelectedLocators] = useState([]);
  const [showLocatorsModal, setShowLocatorsModal] = useState(false);
  const [locatorOptions, setLocatorOptions] = useState([]);
  const [previousSelectedLocators, setPreviousSelectedLocators] = useState([]);

  // Outgoing page options for locators (same as PurchaseOrder but independent)
  const [outgoingSiteOptions, setOutgoingSiteOptions] = useState([]);
  const [outgoingProjectOptions, setOutgoingProjectOptions] = useState([]);
  const [allSiteData, setAllSiteData] = useState([]); // Store full site data including markedAsStockingLocation

  // Fetch project names (sites) from API for locators
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

  // Update locator options to use project names when available
  useEffect(() => {
    if (outgoingProjectOptions.length > 0) {
      setLocatorOptions(outgoingProjectOptions);
    }
  }, [outgoingProjectOptions]);

  // Initialize selectedLocators from sites that are already marked as stocking locations
  // Only initialize once when site options are first loaded
  useEffect(() => {
    if (outgoingSiteOptions.length > 0 && previousSelectedLocators.length === 0 && selectedLocators.length === 0) {
      const initialSelected = outgoingSiteOptions
        .filter(site => site.markedAsStockingLocation === true)
        .map(site => site.value)
        .filter(Boolean);

      // Always set previousSelectedLocators, even if empty, so comparison works correctly
      setPreviousSelectedLocators(initialSelected);

      if (initialSelected.length > 0) {
        setSelectedLocators(initialSelected);
      }
    }
  }, [outgoingSiteOptions]);

  // Refresh site data from API
  const refreshSiteData = async () => {
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
        setAllSiteData(data);
        const formattedData = data.map(item => ({
          value: item.siteName,
          label: item.siteName,
          sNo: item.siteNo,
          id: item.id,
          markedAsStockingLocation: item.markedAsStockingLocation || false,
        }));
        setOutgoingSiteOptions(formattedData);
      }
    } catch (error) {
      console.error("Error refreshing site data: ", error);
    }
  };

  // Update stocking location status when locators are selected/deselected
  const updateStockingLocationStatus = async (newSelectedLocators) => {
    try {
      // Process all sites - update based on whether they're in the new selection
      const updatePromises = [];
      for (const site of outgoingSiteOptions) {
        if (site.id && site.value) {
          const shouldBeSelected = newSelectedLocators.includes(site.value);
          const wasSelected = previousSelectedLocators.includes(site.value);
          // Only update if the status needs to change
          if (shouldBeSelected !== wasSelected) {
            const url = `https://backendaab.in/aabuilderDash/api/project_Names/${site.id}/stocking-location?markedAsStockingLocation=${shouldBeSelected}`;
            const updatePromise = fetch(url, {
              method: 'PUT',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            })
              .then(response => {
                if (response.ok) {
                  return { success: true, siteId: site.id, siteName: site.value };
                } else {
                  console.error(`✗ Failed to update site ${site.id}: ${response.status} ${response.statusText}`);
                  return { success: false, siteId: site.id, siteName: site.value, error: response.statusText };
                }
              })
              .catch(error => {
                console.error(`✗ Error updating site ${site.id}:`, error);
                return { success: false, siteId: site.id, siteName: site.value, error: error.message };
              });
            updatePromises.push(updatePromise);
          } else {
            console.log(`Skipping site ${site.value} - no change needed (was: ${wasSelected}, should be: ${shouldBeSelected})`);
          }
        }
      }
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      // Update previous selection for next comparison
      setPreviousSelectedLocators(newSelectedLocators);
      // Refresh site data to get updated markedAsStockingLocation values
      await refreshSiteData();
    } catch (error) {
      console.error('Error updating stocking location status:', error);
    }
  };
  const [selectedCategories, setSelectedCategories] = useState([]);
  // Category options from API (with IDs) and strings for dropdown
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryOptionsStrings, setCategoryOptionsStrings] = useState([]);
  // State for fetched data (same as PurchaseOrder Input Data page)
  const [poItemName, setPoItemName] = useState([]);
  const [poModel, setPoModel] = useState([]);
  const [poBrand, setPoBrand] = useState([]);
  const [poType, setPoType] = useState([]);
  // Options for dropdowns (merged API + localStorage)
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  // Fetch item names from API
  const fetchPoItemName = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
      if (response.ok) {
        const data = await response.json();
        // Store full data for otherPOEntityList lookup
        setPoItemNameData(data);
        setPoItemName(data);
        // Extract item names from API response
        const extractedNames = data.map(item =>
          item.itemName || item.poItemName || item.name || item.item_name || ''
        ).filter(name => name !== '');
        // Merge with any previously saved item names from localStorage
        const savedItemNames = localStorage.getItem('itemNameOptions');
        const savedNames = savedItemNames ? JSON.parse(savedItemNames) : [];
        // Combine API names with saved names, removing duplicates
        const allNames = [...new Set([...extractedNames, ...savedNames])];
        setItemNameOptions(allNames);
      } else {
        console.log('Error fetching item names.');
        // Load from localStorage if API fails
        const savedItemNames = localStorage.getItem('itemNameOptions');
        if (savedItemNames) {
          setItemNameOptions(JSON.parse(savedItemNames));
        }
      }
    } catch (error) {
      console.error('Error fetching item names:', error);
      // Load from localStorage if API fails
      const savedItemNames = localStorage.getItem('itemNameOptions');
      if (savedItemNames) {
        setItemNameOptions(JSON.parse(savedItemNames));
      }
    }
  };

  // Fetch models from API
  const fetchPoModel = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoModel(data);
        // Extract model names from API response
        const extractedModels = data.map(item =>
          item.model || item.poModel || item.modelName || item.name || ''
        ).filter(model => model !== '');

        // Merge with any previously saved models from localStorage
        const savedModels = localStorage.getItem('modelOptions');
        const savedModelNames = savedModels ? JSON.parse(savedModels) : [];

        // Combine API models with saved models, removing duplicates
        const allModels = [...new Set([...extractedModels, ...savedModelNames])];
        setModelOptions(allModels);
      } else {
        console.log('Error fetching model names.');
        // Load from localStorage if API fails
        const savedModels = localStorage.getItem('modelOptions');
        if (savedModels) {
          setModelOptions(JSON.parse(savedModels));
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      // Load from localStorage if API fails
      const savedModels = localStorage.getItem('modelOptions');
      if (savedModels) {
        setModelOptions(JSON.parse(savedModels));
      }
    }
  };

  // Fetch brands from API
  const fetchPoBrand = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoBrand(data);
        // Extract brand names from API response - filter out empty/null/undefined values
        const extractedBrands = data
          .map(item => item.brand || item.poBrand || item.brandName || item.name || '')
          .filter(brand => brand && brand.trim() !== '' && typeof brand === 'string');

        // Merge with any previously saved brands from localStorage
        const savedBrands = localStorage.getItem('brandOptions');
        const savedBrandNames = savedBrands ? JSON.parse(savedBrands) : [];

        // Filter out empty strings from saved brands as well
        const validSavedBrands = savedBrandNames.filter(brand =>
          brand && brand.trim() !== '' && typeof brand === 'string'
        );

        // Combine API brands with saved brands, removing duplicates and empty values
        const allBrands = [...new Set([...extractedBrands, ...validSavedBrands])]
          .filter(brand => brand && brand.trim() !== '');
        setBrandOptions(allBrands);
      } else {
        console.log('Error fetching brand names.');
        // Load from localStorage if API fails
        const savedBrands = localStorage.getItem('brandOptions');
        if (savedBrands) {
          const parsed = JSON.parse(savedBrands);
          const validBrands = parsed.filter(brand =>
            brand && brand.trim() !== '' && typeof brand === 'string'
          );
          setBrandOptions(validBrands);
        }
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      // Load from localStorage if API fails
      const savedBrands = localStorage.getItem('brandOptions');
      if (savedBrands) {
        const parsed = JSON.parse(savedBrands);
        const validBrands = parsed.filter(brand =>
          brand && brand.trim() !== '' && typeof brand === 'string'
        );
        setBrandOptions(validBrands);
      }
    }
  };

  // Fetch types from API
  const fetchPoType = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoType(data);

        // Extract type names from API response
        let extractedTypes = [];
        if (Array.isArray(data)) {
          if (data.length > 0 && typeof data[0] === 'string') {
            // Array of strings
            extractedTypes = data.filter(type => type && type.trim() !== '');
          } else if (data.length > 0 && typeof data[0] === 'object') {
            // Array of objects - try to extract type field
            extractedTypes = data.map(item => {
              if (!item) return '';
              const typeValue = item.type ||
                item.poType ||
                item.typeName ||
                item.name ||
                item.type_name ||
                item.itemType ||
                item.value ||
                item.label ||
                item.po_type ||
                item.typeColor ||
                '';
              return typeValue ? String(typeValue).trim() : '';
            }).filter(type => type !== '' && type);
          }
        }

        // Merge with any previously saved types from localStorage
        const savedTypes = localStorage.getItem('typeOptions');
        const savedTypeNames = savedTypes ? JSON.parse(savedTypes) : [];

        // Combine API types with saved types, removing duplicates
        const allTypes = [...new Set([...extractedTypes, ...savedTypeNames])];
        setTypeOptions(allTypes);
      } else {
        console.log('Error fetching type names.');
        // Load from localStorage if API fails
        const savedTypes = localStorage.getItem('typeOptions');
        if (savedTypes) {
          setTypeOptions(JSON.parse(savedTypes));
        }
      }
    } catch (error) {
      console.error('Error fetching types:', error);
      // Load from localStorage if API fails
      const savedTypes = localStorage.getItem('typeOptions');
      if (savedTypes) {
        setTypeOptions(JSON.parse(savedTypes));
      }
    }
  };

  // API handlers for saving new items (same as InputData)
  const handleSubmitItemName = async (itemName, selectedCategory) => {
    // Use the category string (label) for itemName API
    const categoryToUse = selectedCategory || category;

    const payload = {
      itemName: itemName,
      category: categoryToUse,
      groupName: selectedGroup || '',
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
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleSubmitModel = async (model, selectedCategory) => {
    // Find category ID from categoryOptions - use value (ID) for API
    const categoryToUse = selectedCategory || category;
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
      } else {
        throw new Error('Failed to save model');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleSubmitBrand = async (brand, selectedCategory) => {
    // Find category ID from categoryOptions - use value (ID) for API
    const categoryToUse = selectedCategory || category;
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
      } else {
        throw new Error('Failed to save brand');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleSubmitType = async (typeColor, selectedCategory) => {
    // Find category ID from categoryOptions - use value (ID) for API
    const categoryToUse = selectedCategory || category;
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
      } else {
        throw new Error('Failed to save type');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  // Handler for adding new item name
  const handleAddNewItemName = async (newItemName) => {
    if (!newItemName || !newItemName.trim()) {
      return;
    }
    const trimmedName = newItemName.trim();
    try {
      await handleSubmitItemName(trimmedName, category);
      await fetchPoItemName();
      // Update local options immediately
      if (!itemNameOptions.includes(trimmedName)) {
        setItemNameOptions([...itemNameOptions, trimmedName]);
      }
    } catch (error) {
      console.error('Error saving item name:', error);
      // Still add to local options for immediate use
      if (!itemNameOptions.includes(trimmedName)) {
        setItemNameOptions([...itemNameOptions, trimmedName]);
      }
      throw error;
    }
  };

  // Handler for adding new model
  const handleAddNewModel = async (newModel) => {
    if (!newModel || !newModel.trim()) {
      return;
    }
    const trimmedModel = newModel.trim();
    try {
      await handleSubmitModel(trimmedModel, category);
      await fetchPoModel();
      // Update local options immediately
      if (!modelOptions.includes(trimmedModel)) {
        setModelOptions([...modelOptions, trimmedModel]);
      }
    } catch (error) {
      console.error('Error saving model:', error);
      // Still add to local options for immediate use
      if (!modelOptions.includes(trimmedModel)) {
        setModelOptions([...modelOptions, trimmedModel]);
      }
      throw error;
    }
  };

  // Handler for adding new brand
  const handleAddNewBrand = async (newBrand) => {
    if (!newBrand || !newBrand.trim()) {
      return;
    }
    const trimmedBrand = newBrand.trim();
    try {
      await handleSubmitBrand(trimmedBrand, category);
      await fetchPoBrand();
      // Update local options immediately
      if (!brandOptions.includes(trimmedBrand)) {
        setBrandOptions([...brandOptions, trimmedBrand]);
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      // Still add to local options for immediate use
      if (!brandOptions.includes(trimmedBrand)) {
        setBrandOptions([...brandOptions, trimmedBrand]);
      }
      throw error;
    }
  };

  // Handler for adding new type
  const handleAddNewType = async (newType) => {
    if (!newType || !newType.trim()) {
      return;
    }
    const trimmedType = newType.trim();
    try {
      await handleSubmitType(trimmedType, category);
      await fetchPoType();
      // Update local options immediately
      if (!typeOptions.includes(trimmedType)) {
        setTypeOptions([...typeOptions, trimmedType]);
      }
    } catch (error) {
      console.error('Error saving type:', error);
      // Still add to local options for immediate use
      if (!typeOptions.includes(trimmedType)) {
        setTypeOptions([...typeOptions, trimmedType]);
      }
      throw error;
    }
  };

  // Handle category select (same as InputData)
  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  // Handle field change (same as InputData)
  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Reset editing state when itemName changes
    if (field === 'itemName') {
      setEditingRowIndex(null);
      setExpandedRowIndex(null);
    }

    // If itemName is selected, fetch and display otherPOEntityList
    if (field === 'itemName') {
      if (value) {
        const selectedItem = poItemNameData.find(item =>
          (item.itemName || item.poItemName || item.name || '').toLowerCase() === value.toLowerCase()
        );
        if (selectedItem) {
          setSelectedItemData(selectedItem);
          setOtherPOEntityList(selectedItem.otherPOEntityList || []);

          // Populate category and groupName if they exist
          if (selectedItem.category) {
            setCategory(selectedItem.category);
          }
          if (selectedItem.groupName) {
            setSelectedGroup(selectedItem.groupName);
          }

          // Set the item ID for edit API
          const itemId = selectedItem.id || selectedItem._id || null;
          setPoItemNameId(itemId);

          // Initialize poEditItemList for edit API
          setPoEditItemList({
            itemName: selectedItem.itemName || selectedItem.poItemName || selectedItem.name || value,
            category: selectedItem.category || category,
            groupName: selectedItem.groupName || selectedGroup,
            otherPOEntityList: selectedItem.otherPOEntityList || []
          });
        } else {
          setSelectedItemData(null);
          setOtherPOEntityList([]);
          setPoItemNameId(null);
          setPoEditItemList({
            itemName: '',
            category: '',
            groupName: '',
            otherPOEntityList: []
          });
        }
      } else {
        // Clear when itemName is cleared
        setSelectedItemData(null);
        setOtherPOEntityList([]);
        setPoItemNameId(null);
        setPoEditItemList({
          itemName: '',
          category: '',
          groupName: '',
          otherPOEntityList: []
        });
      }
    }

    // Add to options if it's a new value (same logic as AddItemsToPO)
    // Only process dropdown fields (itemName, model, brand, type), not input fields (minQty, defaultQty)
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

    // Only add if field exists in optionArrays (dropdown fields) and value is not empty and is a valid string
    if (optionArrays[field] && value && typeof value === 'string' && value.trim() !== '' && !optionArrays[field].includes(value)) {
      const trimmedValue = value.trim();
      const newOptions = [...optionArrays[field], trimmedValue];
      optionSetters[field](newOptions);
      localStorage.setItem(`${field === 'itemName' ? 'itemName' : field}Options`, JSON.stringify(newOptions));
    }
  };

  // API handler for editing item name (updating otherPOEntityList) - same as InputData
  const handleSubmitEditItemName = async (updatedPoEditItemList) => {
    if (!poItemNameId) {
      console.error('No item ID available for editing');
      return;
    }

    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/po_itemNames/edit/${poItemNameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPoEditItemList),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Item updated successfully:', result);
        // Update local state
        setPoEditItemList(updatedPoEditItemList);
        setOtherPOEntityList(updatedPoEditItemList.otherPOEntityList || []);
      } else {
        const errorResult = await response.text();
        console.error('Failed to update:', errorResult);
        throw new Error('Failed to update item');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  // Swipe handlers (same as InputData)
  const minSwipeDistance = 50;

  const handleTouchStart = (e, rowIndex) => {
    const touch = e.touches[0];
    setSwipeStates(prev => ({
      ...prev,
      [rowIndex]: {
        startX: touch.clientX,
        currentX: touch.clientX,
        isSwiping: false
      }
    }));
  };

  const handleTouchMove = (e, rowIndex) => {
    const touch = e.touches[0];
    const state = swipeStates[rowIndex];
    if (!state) return;

    const deltaX = touch.clientX - state.startX;
    const isExpanded = expandedRowIndex === rowIndex;

    // Allow swiping left to reveal buttons, or swiping right to hide buttons if already expanded
    if (deltaX < 0 || (isExpanded && deltaX > 0)) {
      e.preventDefault();
      setSwipeStates(prev => ({
        ...prev,
        [rowIndex]: {
          ...prev[rowIndex],
          currentX: touch.clientX,
          isSwiping: true
        }
      }));
    }
  };

  const handleTouchEnd = (rowIndex) => {
    const state = swipeStates[rowIndex];
    if (!state) return;

    const deltaX = state.currentX - state.startX;
    const absDeltaX = Math.abs(deltaX);

    if (absDeltaX >= minSwipeDistance) {
      if (deltaX < 0) {
        // Swiped left (reveal buttons)
        setExpandedRowIndex(rowIndex);
      } else {
        // Swiped right (hide buttons)
        setExpandedRowIndex(null);
      }
    } else {
      // Small movement - snap back
      if (expandedRowIndex === rowIndex) {
        setExpandedRowIndex(null);
      }
    }

    // Reset swipe state
    setSwipeStates(prev => {
      const newState = { ...prev };
      delete newState[rowIndex];
      return newState;
    });
  };

  // Handle edit row (same as InputData)
  const handleEditRow = (rowIndex) => {
    const entity = otherPOEntityList[rowIndex];
    if (entity) {
      setFormData({
        itemName: formData.itemName, // Keep itemName
        model: entity.modelName || '',
        type: entity.typeColor || '',
        brand: entity.brandName || '',
        minQty: entity.minimumQty || '',
        defaultQty: entity.defaultQty || ''
      });
      setEditingRowIndex(rowIndex);
      setExpandedRowIndex(null);
    }
  };

  // Handle delete row (same as InputData)
  const handleDeleteRow = async (rowIndex) => {
    if (!poItemNameId || !selectedItemData) {
      alert('Cannot delete: Item not found in database');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this row?')) {
      setExpandedRowIndex(null);
      return;
    }

    try {
      const existingOtherPOEntityList = [...(selectedItemData.otherPOEntityList || [])];
      existingOtherPOEntityList.splice(rowIndex, 1);

      const updatedPoEditItemList = {
        itemName: selectedItemData.itemName || selectedItemData.poItemName || selectedItemData.name || formData.itemName,
        category: selectedItemData.category || category,
        groupName: selectedItemData.groupName || selectedGroup,
        otherPOEntityList: existingOtherPOEntityList
      };

      await handleSubmitEditItemName(updatedPoEditItemList);

      // Reload item names to get updated otherPOEntityList
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
        if (response.ok) {
          const data = await response.json();
          setPoItemNameData(data);

          const updatedSelectedItem = data.find(item =>
            (item.id || item._id) === poItemNameId
          );
          if (updatedSelectedItem) {
            setSelectedItemData(updatedSelectedItem);
            setOtherPOEntityList(updatedSelectedItem.otherPOEntityList || []);
            setPoEditItemList({
              itemName: updatedSelectedItem.itemName || updatedSelectedItem.poItemName || updatedSelectedItem.name || '',
              category: updatedSelectedItem.category || category,
              groupName: updatedSelectedItem.groupName || selectedGroup,
              otherPOEntityList: updatedSelectedItem.otherPOEntityList || []
            });
          }
        }
      } catch (error) {
        console.error('Error reloading item data:', error);
      }

      setExpandedRowIndex(null);
    } catch (error) {
      console.error('Error deleting row:', error);
      alert('Failed to delete row. Please try again.');
    }
  };

  // Filter options based on selected category (same logic as PurchaseOrder page)
  const getFilteredItemNameOptions = () => {
    if (!category) {
      // If no category selected, return all item names
      return itemNameOptions;
    }
    const filtered = poItemName.filter(
      item => item.category?.toLowerCase() === category.toLowerCase()
    );
    const apiNames = filtered.map(item => item.itemName?.trim()).filter(Boolean);
    // Merge with localStorage options that match category
    return [...new Set([...apiNames, ...itemNameOptions])];
  };

  const getFilteredModelOptions = () => {
    if (!category) {
      // If no category selected, return all models
      return modelOptions;
    }
    const filtered = poModel.filter(
      item => item.category?.toLowerCase() === category.toLowerCase()
    );
    const apiModels = filtered.map(item => item.model?.trim()).filter(Boolean);
    // Merge with localStorage options that match category
    return [...new Set([...apiModels, ...modelOptions])];
  };

  const getFilteredBrandOptions = () => {
    if (!category) {
      // If no category selected, return all brands
      return brandOptions;
    }
    const filtered = poBrand.filter(item => {
      const brandCategory = item.category?.toLowerCase() || "";
      const currentCategory = category.toLowerCase();
      return !brandCategory || brandCategory === currentCategory;
    });
    const apiBrands = filtered.map(item => item.brand?.trim()).filter(Boolean);
    // Merge with localStorage options that match category
    return [...new Set([...apiBrands, ...brandOptions])];
  };

  const getFilteredTypeOptions = () => {
    if (!category) {
      // If no category selected, return all types
      return typeOptions;
    }
    const filtered = poType.filter(
      item => item.category?.toLowerCase() === category.toLowerCase()
    );
    const apiTypes = filtered.map(item => {
      return item.typeColor || item.type || item.poType || item.typeName || item.name || '';
    }).filter(Boolean);
    // Merge with localStorage options that match category
    return [...new Set([...apiTypes, ...typeOptions])];
  };

  // Handle Add to List (same as InputData)
  const handleAddToList = async () => {
    // Check if category is selected first
    if (!category) {
      alert('Please select category first');
      return;
    }

    if (!formData.itemName || !formData.model || !formData.type || !formData.brand) {
      return; // Don't add if required fields are missing
    }

    // Check if we're editing an existing row
    if (editingRowIndex !== null && poItemNameId && selectedItemData) {
      // Update existing entity in otherPOEntityList
      try {
        const existingOtherPOEntityList = [...(selectedItemData.otherPOEntityList || [])];

        // Update the entity at editingRowIndex
        existingOtherPOEntityList[editingRowIndex] = {
          modelName: formData.model,
          brandName: formData.brand,
          typeColor: formData.type,
          minimumQty: formData.minQty || '',
          defaultQty: formData.defaultQty || ''
        };

        // Update poEditItemList with current values
        const updatedPoEditItemList = {
          itemName: selectedItemData.itemName || selectedItemData.poItemName || selectedItemData.name || formData.itemName,
          category: selectedItemData.category || category,
          groupName: selectedItemData.groupName || selectedGroup,
          otherPOEntityList: existingOtherPOEntityList
        };

        // Call edit API
        await handleSubmitEditItemName(updatedPoEditItemList);

        // Reload item names to get updated otherPOEntityList
        try {
          const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
          if (response.ok) {
            const data = await response.json();
            setPoItemNameData(data);

            // Update selectedItemData and otherPOEntityList with the new data
            const updatedSelectedItem = data.find(item =>
              (item.id || item._id) === poItemNameId
            );
            if (updatedSelectedItem) {
              setSelectedItemData(updatedSelectedItem);
              setOtherPOEntityList(updatedSelectedItem.otherPOEntityList || []);
              setPoEditItemList({
                itemName: updatedSelectedItem.itemName || updatedSelectedItem.poItemName || updatedSelectedItem.name || '',
                category: updatedSelectedItem.category || category,
                groupName: updatedSelectedItem.groupName || selectedGroup,
                otherPOEntityList: updatedSelectedItem.otherPOEntityList || []
              });
            }
          }
        } catch (error) {
          console.error('Error reloading item data:', error);
        }

        // Reset form and editing state
        setFormData({
          itemName: formData.itemName, // Keep itemName selected
          model: '',
          type: '',
          brand: '',
          minQty: '',
          defaultQty: ''
        });
        setEditingRowIndex(null);
        setExpandedRowIndex(null);
      } catch (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item. Please try again.');
      }
      return;
    }

    // Check if itemName exists in database (has an ID)
    if (poItemNameId && selectedItemData) {
      // Item exists in database, update using edit API
      try {
        // Create new entity object
        const newEntity = {
          modelName: formData.model,
          brandName: formData.brand,
          typeColor: formData.type,
          minimumQty: formData.minQty || '',
          defaultQty: formData.defaultQty || ''
        };

        // Get existing otherPOEntityList from selectedItemData (most up-to-date)
        const existingOtherPOEntityList = selectedItemData.otherPOEntityList || [];

        // Add to existing otherPOEntityList
        const updatedOtherPOEntityList = [
          ...existingOtherPOEntityList,
          newEntity
        ];

        // Update poEditItemList with current values
        const updatedPoEditItemList = {
          itemName: selectedItemData.itemName || selectedItemData.poItemName || selectedItemData.name || formData.itemName,
          category: selectedItemData.category || category,
          groupName: selectedItemData.groupName || selectedGroup,
          otherPOEntityList: updatedOtherPOEntityList
        };

        // Call edit API
        await handleSubmitEditItemName(updatedPoEditItemList);

        // Reload item names to get updated otherPOEntityList
        try {
          const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
          if (response.ok) {
            const data = await response.json();
            setPoItemNameData(data);

            // Update selectedItemData and otherPOEntityList with the new data
            const updatedSelectedItem = data.find(item =>
              (item.id || item._id) === poItemNameId
            );
            if (updatedSelectedItem) {
              setSelectedItemData(updatedSelectedItem);
              setOtherPOEntityList(updatedSelectedItem.otherPOEntityList || []);
              setPoEditItemList({
                itemName: updatedSelectedItem.itemName || updatedSelectedItem.poItemName || updatedSelectedItem.name || '',
                category: updatedSelectedItem.category || category,
                groupName: updatedSelectedItem.groupName || selectedGroup,
                otherPOEntityList: updatedSelectedItem.otherPOEntityList || []
              });
            }
          }
        } catch (error) {
          console.error('Error reloading item data:', error);
        }

        // Reset form (keep itemName selected)
        setFormData({
          itemName: formData.itemName, // Keep itemName selected
          model: '',
          type: '',
          brand: '',
          minQty: '',
          defaultQty: ''
        });
      } catch (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item. Please try again.');
      }
    } else {
      // Item doesn't exist in database, just reset form
      setFormData({
        itemName: '',
        model: '',
        type: '',
        brand: '',
        minQty: '',
        defaultQty: ''
      });
    }
  };

  return (
    <div className="relative w-full bg-white max-w-[360px] mx-auto" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* New Input Section */}
      <div className="px-4 pt-2">
        {/* New Input Header - Sticky */}
        <div className=" top-[100px] z-30 bg-white flex items-center justify-between mb-2 border-b border-[#E0E0E0] pb-1">
          {/* Group Dropdown - Left Side */}
          <button
            onClick={() => setShowGroupModal(true)}
            className="text-[12px] font-medium text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
          >
            {selectedGroup || 'Group'}
          </button>
          <div className="flex items-center gap-2">
            {/* Locators - Middle */}
            <button
              onClick={() => setShowLocatorsModal(true)}
              className="text-[12px] font-medium text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
            >
              Locators
            </button>

            {/* Category Dropdown - Right Side */}
            <button
              onClick={() => setShowCategoryModal(true)}
              className="text-[12px] font-medium text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
            >
              {category || 'Category'}
            </button>
          </div>
        </div>
        {/* Form Fields */}
        <div className="space-y-[6px]">
          {/* Item Name */}
          <div className="">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Item Name<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowItemNameModal(true)}
                className="w-full h-[32px] px-3 border border-[rgba(0,0,0,0.16)] rounded text-[12px] font-medium text-black bg-white flex items-center justify-between focus:outline-none"
                style={{
                  paddingRight: formData.itemName ? '32px' : '12px',
                  boxSizing: 'border-box'
                }}
              >
                <span className={formData.itemName ? 'text-black' : 'text-[#9E9E9E]'}>
                  {formData.itemName || '12A Switch'}
                </span>
                {!formData.itemName && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              {formData.itemName && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFieldChange('itemName', '');
                  }}
                  className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
                  style={{ right: '8px' }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 3L3 9M3 3L9 9"
                      stroke="#000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Model */}
          <div className="">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Model<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelModal(true)}
                className="w-full h-[32px] px-3 border border-[rgba(0,0,0,0.16)] rounded text-[12px] font-medium text-black bg-white flex items-center justify-between focus:outline-none"
                style={{
                  paddingRight: formData.model ? '32px' : '12px',
                  boxSizing: 'border-box'
                }}
              >
                <span className={formData.model ? 'text-black' : 'text-[#9E9E9E]'}>
                  {formData.model || 'Select Model'}
                </span>
                {!formData.model && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              {formData.model && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFieldChange('model', '');
                  }}
                  className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
                  style={{ right: '8px' }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 3L3 9M3 3L9 9"
                      stroke="#000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Type */}
          <div className="">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Type<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTypeModal(true)}
                className="w-full h-[32px] px-3 border border-[rgba(0,0,0,0.16)] rounded text-[12px] font-medium text-black bg-white flex items-center justify-between focus:outline-none"
                style={{
                  paddingRight: formData.type ? '32px' : '12px',
                  boxSizing: 'border-box'
                }}
              >
                <span className={formData.type ? 'text-black' : 'text-[#9E9E9E]'}>
                  {formData.type || 'Select Type'}
                </span>
                {!formData.type && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              {formData.type && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFieldChange('type', '');
                  }}
                  className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
                  style={{ right: '8px' }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 3L3 9M3 3L9 9"
                      stroke="#000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {/* Brand */}
            <div>
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                Brand<span className="text-[#eb2f8e]">*</span>
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(true)}
                  className="w-[120px] h-[32px] px-3 border border-[rgba(0,0,0,0.16)] rounded text-[12px] font-medium text-black bg-white flex items-center justify-between focus:outline-none"
                  style={{
                    paddingRight: formData.brand ? '32px' : '12px',
                    boxSizing: 'border-box'
                  }}
                >
                  <span className={formData.brand ? 'text-black' : 'text-[#9E9E9E]'}>
                    {formData.brand || 'Select Brand'}
                  </span>
                  {!formData.brand && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                {formData.brand && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFieldChange('brand', '');
                    }}
                    className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
                    style={{ right: '8px' }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 3L3 9M3 3L9 9"
                        stroke="#000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Min Qty */}
            <div>
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                Min Qty
              </p>
              <input
                type="text"
                value={formData.minQty}
                onChange={(e) => handleFieldChange('minQty', e.target.value)}
                placeholder="Type Min Qty"
                className="w-[90px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-4 text-[12px] font-medium text-black bg-white placeholder:text-[#9E9E9E] focus:outline-none"
              />
            </div>
            {/* Default Qty */}
            <div>
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                Default Qty
              </p>
              <input
                type="text"
                value={formData.defaultQty}
                onChange={(e) => handleFieldChange('defaultQty', e.target.value)}
                placeholder="Type Default Qty"
                className="w-[90px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-4 text-[12px] font-medium text-black bg-white placeholder:text-[#9E9E9E] focus:outline-none"
              />
            </div>
          </div>
        </div>
        {/* Add to List / Update List Button */}
        <div className="mt-2">
          <button
            onClick={handleAddToList}
            disabled={!formData.itemName || !formData.model || !formData.type || !formData.brand}
            className={`w-[328px] h-[32px] rounded flex items-center justify-center gap-2 text-white text-[12px] font-medium transition-colors ${formData.itemName && formData.model && formData.type && formData.brand
              ? 'bg-black hover:bg-gray-800'
              : 'bg-[#757575] cursor-not-allowed'
              }`}
          >
            {editingRowIndex !== null ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3333 2L5.33333 10M13.3333 2L9.33333 2M13.3333 2L13.3333 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Update List</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Add to List</span>
              </>
            )}
          </button>
        </div>
      </div>
      {/* otherPOEntityList Table - Show when itemName is selected */}
      {formData.itemName && otherPOEntityList.length > 0 && (
        <div className="px-4 pt-3">
          <p className="text-[12px] font-semibold text-black leading-normal mb-2">
            Available Combinations for {formData.itemName}
          </p>
          <div className="border border-[#E0E0E0] rounded-[8px] overflow-hidden">
            {/* Table Header */}
            <div className="bg-[#F5F5F5] flex items-center px-3 py-2 border-b border-[#E0E0E0]">
              <div className="w-[24px] text-[11px] font-semibold text-black">#</div>
              <div className="w-[120px] text-[11px] font-semibold text-black px-1">Model</div>
              <div className="w-[60px] text-[11px] font-semibold text-black px-1">Brand</div>
              <div className="flex-1 text-[11px] font-semibold text-black px-1">Type</div>
            </div>
            {/* Table Rows - Scrollable */}
            <div
              className="divide-y divide-[#E0E0E0] overflow-y-auto no-scrollbar scrollbar-none"
              style={{ maxHeight: 'calc(79vh - 420px)' }}
            >
              {otherPOEntityList.map((entity, index) => {
                const isExpanded = expandedRowIndex === index;
                const swipeState = swipeStates[index];
                let swipeOffset = 0;
                if (swipeState && swipeState.isSwiping) {
                  swipeOffset = Math.max(-110, Math.min(0, swipeState.currentX - swipeState.startX));
                } else if (isExpanded) {
                  swipeOffset = -110;
                } else {
                  swipeOffset = 0;
                }
                return (
                  <div key={index} className="relative overflow-hidden">
                    {/* Row Content */}
                    <div
                      className="flex items-center px-3 py-2 bg-white transition-all duration-300 ease-out"
                      style={{
                        transform: `translateX(${swipeOffset}px)`,
                        touchAction: 'pan-y'
                      }}
                      onTouchStart={(e) => handleTouchStart(e, index)}
                      onTouchMove={(e) => handleTouchMove(e, index)}
                      onTouchEnd={() => handleTouchEnd(index)}
                      onClick={() => {
                        if (!isExpanded) {
                          // Allow click when not expanded
                        } else {
                          setExpandedRowIndex(null);
                        }
                      }}
                    >
                      <div className="w-[24px] text-[12px] font-medium text-black">{index + 1}</div>
                      <div className="w-[120px] text-[12px] font-medium text-black truncate">
                        {entity.modelName || ''}
                      </div>
                      <div className="w-[60px] text-[12px] font-medium text-black px-1 truncate">
                        {entity.brandName || ''}
                      </div>
                      <div className="flex-1 text-[12px] font-medium text-black truncate">
                        {entity.typeColor || ''}
                      </div>
                    </div>
                    {/* Action Buttons - Behind the row on the right, revealed on swipe */}
                    <div
                      className="absolute right-0 top-0 bottom-0 flex gap-2 z-0"
                      style={{
                        opacity: isExpanded || (swipeState && swipeState.isSwiping && swipeOffset < -20) ? 1 : 0,
                        transform: swipeOffset < 0
                          ? `translateX(${Math.max(0, 110 + swipeOffset)}px)`
                          : 'translateX(110px)',
                        transition: (swipeState && swipeState.isSwiping) ? 'none' : 'opacity 0.2s ease-out, transform 0.3s ease-out',
                        pointerEvents: isExpanded ? 'auto' : 'none'
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRow(index);
                        }}
                        className="action-button w-[44px] h-full bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 hover:bg-[#22a882] transition-colors shadow-sm"
                        title="Edit"
                      >
                        <img src={Edit} alt="Edit" className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRow(index);
                        }}
                        className="action-button w-[44px] h-full bg-[#E4572E] flex rounded-[6px] items-center justify-center gap-1.5 hover:bg-[#cc4d26] transition-colors shadow-sm"
                        title="Delete"
                      >
                        <img src={Delete} alt="Delete" className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Category Select Modal */}
      <SelectVendorModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(value) => {
          handleCategorySelect(value);
          setShowCategoryModal(false);
        }}
        selectedValue={category}
        options={categoryOptionsStrings}
        fieldName="Category"
        onAddNew={handleAddNewCategory}
        showStarIcon={false}
      />

      {/* Group Name Select Modal */}
      <SelectVendorModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onSelect={(value) => {
          setSelectedGroup(value);
          setShowGroupModal(false);
        }}
        selectedValue={selectedGroup}
        options={groupOptions}
        fieldName="Group"
        onAddNew={handleAddNewGroupName}
        showStarIcon={false}
      />

      {/* Item Name Select Modal */}
      <SelectVendorModal
        isOpen={showItemNameModal}
        onClose={() => setShowItemNameModal(false)}
        onSelect={(value) => {
          handleFieldChange('itemName', value);
          setShowItemNameModal(false);
        }}
        selectedValue={formData.itemName}
        options={getFilteredItemNameOptions()}
        fieldName="Item Name"
        onAddNew={handleAddNewItemName}
        showStarIcon={false}
      />

      {/* Model Select Modal */}
      <SelectVendorModal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        onSelect={(value) => {
          handleFieldChange('model', value);
          setShowModelModal(false);
        }}
        selectedValue={formData.model}
        options={getFilteredModelOptions()}
        fieldName="Model"
        onAddNew={handleAddNewModel}
        showStarIcon={false}
      />

      {/* Type Select Modal */}
      <SelectVendorModal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelect={(value) => {
          handleFieldChange('type', value);
          setShowTypeModal(false);
        }}
        selectedValue={formData.type}
        options={getFilteredTypeOptions()}
        fieldName="Type"
        onAddNew={handleAddNewType}
        showStarIcon={false}
      />

      {/* Brand Select Modal */}
      <SelectVendorModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSelect={(value) => {
          handleFieldChange('brand', value);
          setShowBrandModal(false);
        }}
        selectedValue={formData.brand}
        options={getFilteredBrandOptions()}
        fieldName="Brand"
        onAddNew={handleAddNewBrand}
        showStarIcon={false}
      />
      <SelectLocatorsModal
        isOpen={showLocatorsModal}
        onClose={() => setShowLocatorsModal(false)}
        onSelect={async (values) => {
          setSelectedLocators(values);
          await updateStockingLocationStatus(values);
          // Don't close modal immediately - let user continue selecting
        }}
        selectedValues={selectedLocators}
        options={locatorOptions}
        fieldName="Locators"
        onAddNew={(newLocator) => {
          if (newLocator && !locatorOptions.includes(newLocator)) {
            setLocatorOptions([...locatorOptions, newLocator]);
          }
        }}
      />
    </div>
  );
};

export default AddInput;

