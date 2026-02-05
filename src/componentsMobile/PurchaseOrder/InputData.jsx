import React, { useState, useEffect } from 'react';
import SearchableDropdown from './SearchableDropdown';
import SelectOptionModal from './SelectOptionModal';
import AddOptionModal from './AddOptionModal';
import SelectVendorModal from './SelectVendorModal';
import Edit from '../Images/edit1.png';
import Delete from '../Images/delete.png';

const InputData = () => {
    const [category, setCategory] = useState('');
    const [selectedGroupName, setSelectedGroupName] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    
    // Category and Group options as strings for dropdowns
    const [categoryOptionsStrings, setCategoryOptionsStrings] = useState([]);
    const [groupNameOptions, setGroupNameOptions] = useState([]);
    
    // Modal states for all dropdowns
    const [showItemNameModal, setShowItemNameModal] = useState(false);
    const [showAddItemNameModal, setShowAddItemNameModal] = useState(false);
    const [showModelModal, setShowModelModal] = useState(false);
    const [showAddModelModal, setShowAddModelModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showAddTypeModal, setShowAddTypeModal] = useState(false);
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [showAddBrandModal, setShowAddBrandModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        itemName: '',
        model: '',
        type: '',
        brand: '',
        minQty: '',
        defaultQty: ''
    });

    // Item list state
    const [itemList, setItemList] = useState([]);

    // Options for dropdowns
    const [itemNameOptions, setItemNameOptions] = useState([]);
    const [modelOptions, setModelOptions] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    
    // Category options from API
    const [categoryOptions, setCategoryOptions] = useState([]);

    // State for otherPOEntityList and selected item data
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

    // State for editing row and swipe functionality
    const [editingRowIndex, setEditingRowIndex] = useState(null);
    const [swipeStates, setSwipeStates] = useState({});
    const [expandedRowIndex, setExpandedRowIndex] = useState(null);

    // Clean up empty strings from localStorage
    const cleanupLocalStorage = () => {
        const optionKeys = ['itemNameOptions', 'brandOptions', 'modelOptions', 'typeOptions'];
        optionKeys.forEach(key => {
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const cleaned = parsed.filter(item => 
                        item && typeof item === 'string' && item.trim() !== ''
                    );
                    if (cleaned.length !== parsed.length) {
                        localStorage.setItem(key, JSON.stringify(cleaned));
                    }
                } catch (error) {
                    console.error(`Error cleaning ${key}:`, error);
                }
            }
        });
    };

    // Load options from localStorage and API
    useEffect(() => {
        cleanupLocalStorage(); // Clean up empty strings first
        loadOptions();
        loadItemList();
        fetchPoCategory();
        fetchGroupNames();
    }, []);
    
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

    // Fetch group names from API
    const fetchGroupNames = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/group_name/getAll');
            if (response.ok) {
                const data = await response.json();
                const options = (data || []).map(item => item.groupName || '').filter(Boolean);
                setGroupNameOptions(options);
            } else {
                console.log('Error fetching group names.');
                setGroupNameOptions([]);
            }
        } catch (error) {
            console.error('Error fetching group names:', error);
            setGroupNameOptions([]);
        }
    };

    const loadOptions = () => {
        // Load from localStorage and filter out empty strings
        const itemNames = JSON.parse(localStorage.getItem('itemNameOptions') || '["12A Switch", "16A Switch", "20A Switch", "MCB", "24A Switch"]')
            .filter(item => item && item.trim() !== '' && typeof item === 'string');
        const brands = JSON.parse(localStorage.getItem('brandOptions') || '["Kundan", "Legrand", "Havells", "Schneider", "Orient", "Crompton"]')
            .filter(brand => brand && brand.trim() !== '' && typeof brand === 'string');
        const models = JSON.parse(localStorage.getItem('modelOptions') || '["Natural Cream", "White", "Ivory", "Beige", "Green", "Double color"]')
            .filter(model => model && model.trim() !== '' && typeof model === 'string');
        const types = JSON.parse(localStorage.getItem('typeOptions') || '["Flip Type", "Toggle Type", "Push Button", "Rocker Type", "Flip", "On/off", "1 Lit"]')
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

    const fetchPoItemName = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
            if (response.ok) {
                const data = await response.json();
                // Store full data for otherPOEntityList lookup
                setPoItemNameData(data);
                // Extract item names from API response - same logic as AddItemsToPO
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

    const fetchPoModel = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll');
            if (response.ok) {
                const data = await response.json();
                // Extract model names from API response - same logic as AddItemsToPO
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

    const fetchPoBrand = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll');
            if (response.ok) {
                const data = await response.json();
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

    const fetchPoType = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll');
            if (response.ok) {
                const data = await response.json();                
                // Extract type names from API response - same logic as AddItemsToPO
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
                                '';
                            if (!typeValue) {
                                for (const key in item) {
                                    if (typeof item[key] === 'string' && item[key].trim() !== '') {
                                        return item[key].trim();
                                    }
                                }
                            }
                            return typeValue ? String(typeValue).trim() : '';
                        }).filter(type => type !== '' && type);
                    }
                }
                const savedTypes = localStorage.getItem('typeOptions');
                const savedTypeNames = savedTypes ? JSON.parse(savedTypes) : [];
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

    const loadItemList = () => {
        const saved = localStorage.getItem('inputDataItems');
        if (saved) {
            try {
                setItemList(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading item list:', error);
            }
        }
    };

    const saveItemList = (list) => {
        localStorage.setItem('inputDataItems', JSON.stringify(list));
    };

    const handleCategorySelect = (selectedCategory) => {
        setCategory(selectedCategory);
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
                await fetchPoCategory();
            }
        } catch (error) {
            console.error('Error saving category:', error);
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
                await fetchGroupNames();
                if (!groupNameOptions.includes(newGroupName.trim())) {
                    setGroupNameOptions([...groupNameOptions, newGroupName.trim()]);
                }
            } else {
                // Still add to local options for immediate use
                if (!groupNameOptions.includes(newGroupName.trim())) {
                    setGroupNameOptions([...groupNameOptions, newGroupName.trim()]);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            // Still add to local options for immediate use
            if (!groupNameOptions.includes(newGroupName.trim())) {
                setGroupNameOptions([...groupNameOptions, newGroupName.trim()]);
            }
        }
    };

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
                        setSelectedGroupName(selectedItem.groupName);
                    }
                    
                    // Set the item ID for edit API
                    const itemId = selectedItem.id || selectedItem._id || null;
                    setPoItemNameId(itemId);
                    
                    // Initialize poEditItemList for edit API
                    setPoEditItemList({
                        itemName: selectedItem.itemName || selectedItem.poItemName || selectedItem.name || value,
                        category: selectedItem.category || category,
                        groupName: selectedItem.groupName || selectedGroupName,
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
                    groupName: selectedItemData.groupName || selectedGroupName,
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
                                groupName: updatedSelectedItem.groupName || selectedGroupName,
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
                    groupName: selectedItemData.groupName || selectedGroupName,
                    otherPOEntityList: updatedOtherPOEntityList
                };

                // Call edit API
                await handleSubmitEditItemName(updatedPoEditItemList);
                
                // Also add to local list for display
                const newItem = {
                    id: Date.now(),
                    itemName: formData.itemName,
                    model: formData.model,
                    type: formData.type,
                    brand: formData.brand,
                    minQty: formData.minQty || '',
                    defaultQty: formData.defaultQty || '',
                    category: category
                };

                const updatedList = [...itemList, newItem];
                setItemList(updatedList);
                saveItemList(updatedList);

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
                                groupName: updatedSelectedItem.groupName || selectedGroupName,
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
            // Item doesn't exist in database, just add to local list
            const newItem = {
                id: Date.now(),
                itemName: formData.itemName,
                model: formData.model,
                type: formData.type,
                brand: formData.brand,
                minQty: formData.minQty || '',
                defaultQty: formData.defaultQty || '',
                category: category
            };

            const updatedList = [...itemList, newItem];
            setItemList(updatedList);
            saveItemList(updatedList);

            // Reset form
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

    // API handler for editing item name (updating otherPOEntityList)
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

    // Swipe handlers
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

    // Handle edit row
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

    // Handle delete row
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
                groupName: selectedItemData.groupName || selectedGroupName,
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
                            groupName: updatedSelectedItem.groupName || selectedGroupName,
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

    // API handlers for saving new items
    const handleSubmitItemName = async (itemName, selectedCategory) => {
        // Use the category string (label) for itemName API
        const categoryToUse = selectedCategory || category;
        
        const payload = {
            itemName: itemName,
            category: categoryToUse,
            groupName: selectedGroupName || '',
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


    return (
        <div className="relative w-full bg-white max-w-[360px] mx-auto" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {/* New Input Section */}
            <div className="px-4 pt-2">
                {/* New Input Header - Sticky */}
                <div className="sticky top-[100px] z-30 bg-white flex items-center justify-between mb-4 border-b border-[#E0E0E0] pb-2 shadow-sm">
                    {/* Group Dropdown - Left Side */}
                    <button
                        onClick={() => setShowGroupModal(true)}
                        className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        {selectedGroupName || 'Group'}
                    </button>
                    
                    {/* Category Dropdown - Right Side */}
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        {category || 'Category'}
                    </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-[6px] mb-4">
                    {/* Item Name */}
                    <div>
                        <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                            Item Name<span className="text-[#eb2f8e]">*</span>
                        </p>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowItemNameModal(true)}
                                className="w-full h-[32px] px-3 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black bg-white flex items-center justify-between focus:outline-none"
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
                    <div>
                        <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                            Model<span className="text-[#eb2f8e]">*</span>
                        </p>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowModelModal(true)}
                                className="w-full h-[32px] px-3 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black bg-white flex items-center justify-between focus:outline-none"
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
                    <div>
                        <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                            Type<span className="text-[#eb2f8e]">*</span>
                        </p>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowTypeModal(true)}
                                className="w-full h-[32px] px-3 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black bg-white flex items-center justify-between focus:outline-none"
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
                                    className="w-[120px] h-[32px] px-3 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black bg-white flex items-center justify-between focus:outline-none"
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
                                className="w-[90px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium text-black bg-white placeholder:text-[#9E9E9E] focus:outline-none"
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
                            className="w-[90px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium text-black bg-white placeholder:text-[#9E9E9E] focus:outline-none"
                        />
                    </div>
                    </div>

                   
                </div>
                {/* Add to List / Update List Button */}
                <button
                    onClick={handleAddToList}
                    disabled={!formData.itemName || !formData.model || !formData.type || !formData.brand}
                    className={`w-[328px] h-[32px] rounded-[8px] flex items-center justify-center gap-2 text-white text-[12px] font-medium transition-colors ${
                        formData.itemName && formData.model && formData.type && formData.brand
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

            {/* otherPOEntityList Table - Show when itemName is selected */}
            {formData.itemName && otherPOEntityList.length > 0 && (
                <div className="px-4 pt-6 pb-4">
                    <p className="text-[12px] font-semibold text-black leading-normal mb-2">
                        Available Combinations for {formData.itemName}
                    </p>
                    <div className="border border-[#E0E0E0] rounded-[8px] overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-[#F5F5F5] flex items-center px-3 py-2 border-b border-[#E0E0E0]">
                            <div className="w-[24px] text-[11px] font-semibold text-black">#</div>
                            <div className="w-[120px] text-[11px] font-semibold text-black px-2">Model</div>
                            <div className="w-[60px] text-[11px] font-semibold text-black px-2">Brand</div>
                            <div className="flex-1 text-[11px] font-semibold text-black px-2">Type</div>
                        </div>
                        {/* Table Rows */}
                        <div className="divide-y divide-[#E0E0E0] overflow-y-auto no-scrollbar scrollbar-none" style={{maxHeight: 'calc(79vh - 420px)'}}>
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
                                            <div className="w-[120px] text-[12px] font-medium text-black px-2 truncate">
                                                {entity.modelName || ''}
                                            </div>
                                            <div className="w-[60px] text-[12px] font-medium text-black px-2 truncate">
                                                {entity.brandName || ''}
                                            </div>
                                            <div className="flex-1 text-[12px] font-medium text-black px-2 truncate">
                                                {entity.typeColor || ''}
                                            </div>
                                        </div>
                                        {/* Action Buttons - Behind the row on the right, revealed on swipe */}
                                        <div
                                            className="absolute right-0 top-0 flex gap-2  z-0"
                                            style={{
                                                opacity: isExpanded || (swipeState && swipeState.isSwiping && swipeOffset < -20) ? 1 : 0,
                                                transition: 'opacity 0.2s ease-out',
                                                pointerEvents: isExpanded ? 'auto' : 'none'
                                            }}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditRow(index);
                                                }}
                                                className="action-button w-full h-full bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 hover:bg-[#22a882] transition-colors shadow-sm"
                                                title="Edit"
                                            >
                                                <img src={Edit} alt="Edit" className="w-[18px] h-[18px]" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteRow(index);
                                                }}
                                                className="action-button w-[48px] h-full bg-[#E4572E] flex rounded-[6px] items-center justify-center gap-1.5 hover:bg-[#cc4d26] transition-colors shadow-sm"
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
                    setSelectedGroupName(value);
                    setShowGroupModal(false);
                }}
                selectedValue={selectedGroupName}
                options={groupNameOptions}
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
                options={itemNameOptions}
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
                options={modelOptions}
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
                options={typeOptions}
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
                options={brandOptions}
                fieldName="Brand"
                onAddNew={handleAddNewBrand}
                showStarIcon={false}
            />
        </div>
    );
};

export default InputData;
