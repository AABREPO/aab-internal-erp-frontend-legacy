import React, { useState, useEffect } from 'react';

// Helper function to highlight matching text (highlights all matching terms)
const highlightText = (text, searchQuery) => {
    if (!text || !searchQuery) {
        return text;
    }

    // Split query into individual words/numbers
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(term => term.length > 0);

    if (searchTerms.length === 0) {
        return text;
    }

    let textLower = text.toLowerCase();
    let result = [];
    let lastIndex = 0;
    let highlightedRanges = [];

    // Find all matches for all search terms
    searchTerms.forEach(term => {
        let index = textLower.indexOf(term, lastIndex);
        while (index !== -1) {
            highlightedRanges.push({ start: index, end: index + term.length, term });
            index = textLower.indexOf(term, index + 1);
        }
    });

    // Sort ranges by start position
    highlightedRanges.sort((a, b) => a.start - b.start);

    // Merge overlapping ranges
    let mergedRanges = [];
    highlightedRanges.forEach(range => {
        if (mergedRanges.length === 0) {
            mergedRanges.push(range);
        } else {
            const last = mergedRanges[mergedRanges.length - 1];
            if (range.start <= last.end) {
                // Overlapping, merge them
                last.end = Math.max(last.end, range.end);
            } else {
                mergedRanges.push(range);
            }
        }
    });

    // Build result with highlighted sections
    mergedRanges.forEach((range, idx) => {
        // Add text before highlight
        if (range.start > lastIndex) {
            result.push(text.substring(lastIndex, range.start));
        }
        // Add highlighted text
        result.push(
            <span key={`highlight-${idx}`} className="font-bold text-blue-600">
                {text.substring(range.start, range.end)}
            </span>
        );
        lastIndex = range.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
        result.push(text.substring(lastIndex));
    }

    // If no matches found, return original text
    if (result.length === 0) {
        return text;
    }

    return <>{result}</>;
};

// Stock Summary Modal Component
const StockSummaryModal = ({ isOpen, onClose, item, stockBreakdown, locationNamesMap }) => {
    if (!isOpen || !item) return null;

    const itemName = item.itemName || '';
    const breakdown = stockBreakdown || {};
    
    // Convert breakdown object to array and sort by location name
    const breakdownArray = Object.entries(breakdown)
        .map(([locationId, quantity]) => ({
            locationId,
            locationName: locationNamesMap[locationId] || `Location ${locationId}`,
            quantity: Math.max(0, quantity) // Ensure non-negative
        }))
        .filter(entry => entry.quantity > 0) // Only show locations with stock
        .sort((a, b) => a.locationName.localeCompare(b.locationName));

    // Calculate grand total
    const grandTotal = breakdownArray.reduce((sum, entry) => sum + entry.quantity, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-end" onClick={onClose} style={{ fontFamily: "'Manrope', sans-serif" }}>
            <div
                className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-[#E0E0E0]">
                    <p className="text-[16px] font-semibold text-black">{itemName} - Stock Summary</p>
                    <button
                        onClick={onClose}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L4 12M4 4L12 12" stroke="#e4572e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {breakdownArray.length === 0 ? (
                        <p className="text-[14px] font-medium text-[#9E9E9E] text-center py-8">
                            No stock available
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {breakdownArray.map((entry, index) => (
                                <div key={entry.locationId} className="flex items-center justify-between py-2 border-b border-[#E0E0E0]">
                                    <p className="text-[14px] font-medium text-black">{entry.locationName}</p>
                                    <p className="text-[14px] font-medium text-black">{entry.quantity}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Grand Total */}
                {breakdownArray.length > 0 && (
                    <div className="px-6 py-4 border-t border-[#E0E0E0] bg-gray-50">
                        <div className="flex items-center justify-between">
                            <p className="text-[16px] font-semibold text-black">Grand Total</p>
                            <p className="text-[16px] font-semibold text-black">{grandTotal} Qty</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SearchItemsModal = ({ isOpen, onClose, onAdd, getAvailableItems, existingItems = [], onRefreshData, stockingLocationId = null, disableAvailabilityCheck = false }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [itemQuantities, setItemQuantities] = useState({});
    const [focusedInputId, setFocusedInputId] = useState(null); // Track which input is being edited
    const [stockQuantities, setStockQuantities] = useState({}); // Store available stock quantities (total across all locations)
    const [stockBreakdown, setStockBreakdown] = useState({}); // Store breakdown by location for each item
    const [showStockSummary, setShowStockSummary] = useState(false); // Show stock summary modal
    const [selectedItemForSummary, setSelectedItemForSummary] = useState(null); // Item to show summary for

    // Refresh data when modal opens
    useEffect(() => {
        if (isOpen && onRefreshData) {
            onRefreshData();
        }
    }, [isOpen, onRefreshData]);

    // Clear search when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setDebouncedSearchQuery('');
            setSearchResults([]);
            setFocusedInputId(null);
        }
    }, [isOpen]);

    // Helper function to get item key from item object
    // Includes category to distinguish items with same name but different categories
    const getItemKey = (item) => {
        if (item.name) {
            // For existingItems format: "itemName, category"
            const nameParts = item.name.split(',');
            const itemName = nameParts[0].trim();
            const category = (nameParts[1] || item.category || '').trim();
            const brand = (item.brand || '').trim();
            const model = (item.model || '').trim();
            const type = (item.type || '').trim();
            return `${itemName}_${category}_${brand}_${model}_${type}`;
        } else {
            // For searchResults format: has itemName, brand, model, type directly
            const itemName = (item.itemName || '').trim();
            const category = (item.category || '').trim();
            const brand = (item.brand || '').trim();
            const model = (item.model || '').trim();
            const type = (item.type || '').trim();
            return `${itemName}_${category}_${brand}_${model}_${type}`;
        }
    };

    // Sync itemQuantities with existingItems whenever they change (but preserve focused input and user edits)
    useEffect(() => {
        if (isOpen) {
            // Build a map of existing items with their quantities
            const existingQuantities = {};
            existingItems.forEach(item => {
                const itemKey = getItemKey(item);
                // Only add if we have a valid itemKey and quantity > 0
                if (itemKey && item.quantity > 0) {
                    existingQuantities[itemKey] = item.quantity;
                }
            });
            // Update itemQuantities, syncing with existingItems
            setItemQuantities(prev => {
                const updated = { ...prev }; // Start with current state to preserve user edits
                // Update quantities from existingItems (source of truth) - but don't override focused input
                Object.keys(existingQuantities).forEach(key => {
                    if (key !== focusedInputId) {
                        updated[key] = existingQuantities[key];
                    }
                });
                return updated;
            });
        } else {
            // Clear quantities when modal closes
            setItemQuantities({});
            setFocusedInputId(null);
        }
    }, [isOpen, existingItems, focusedInputId]);

    // Initialize quantities for new search results from existingItems
    useEffect(() => {
        if (isOpen && searchResults.length > 0) {
            setItemQuantities(prev => {
                const updated = { ...prev };
                // For each search result, check if it exists in existingItems and initialize quantity
                searchResults.forEach(result => {
                    const resultKey = getItemKey(result);
                    // Only initialize if not already set and not currently focused
                    if (updated[resultKey] === undefined && resultKey !== focusedInputId) {
                        const existingItem = existingItems.find(existing => {
                            const existingKey = getItemKey(existing);
                            return existingKey === resultKey;
                        });
                        if (existingItem && existingItem.quantity > 0) {
                            updated[resultKey] = existingItem.quantity;
                        }
                    }
                });
                return updated;
            });
        }
    }, [isOpen, searchResults, existingItems, focusedInputId]);

    // Debounce search query to avoid freezing on every keystroke
    useEffect(() => {
        // If search is cleared (only whitespace), update immediately without debounce
        if (searchQuery.trim().length === 0) {
            setDebouncedSearchQuery('');
            setSearchResults([]);
            return;
        }
        
        // Clear results immediately when query changes to show loading state
        setSearchResults([]);
        
        const timer = setTimeout(() => {
            // Keep the original searchQuery with spaces for better search matching
            // Don't trim here - let the search logic handle spaces
            setDebouncedSearchQuery(searchQuery);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchQuery]);
    useEffect(() => {
        // Only clear results if debouncedSearchQuery is truly empty (no non-whitespace characters)
        const trimmedQuery = debouncedSearchQuery ? debouncedSearchQuery.trim() : '';
        if (!debouncedSearchQuery || trimmedQuery.length === 0) {
            setSearchResults([]);
            // Keep only quantities from existing items when search is cleared
            setItemQuantities(prev => {
                const cleaned = {};
                existingItems.forEach(item => {
                    const itemName = item.name ? item.name.split(',')[0].trim() : '';
                    const brand = (item.brand || '').trim();
                    const model = (item.model || '').trim();
                    const type = (item.type || '').trim();
                    const itemKey = `${itemName}_${brand}_${model}_${type}`;
                    if (itemName && item.quantity > 0 && prev[itemKey] !== undefined) {
                        cleaned[itemKey] = prev[itemKey];
                    }
                });
                return cleaned;
            });
            return;
        }
        
        // Perform search when debouncedSearchQuery has content
        // Clear results at start of search to prevent stale results
        setSearchResults([]);
        
        const data = getAvailableItems();
        const query = trimmedQuery.toLowerCase();

        // Split query into individual words/numbers
        const searchTerms = query.split(/\s+/).filter(term => term.length > 0);

        const MAX_RESULTS = 100; // Limit results to prevent memory issues
        const results = [];

        // Check if using nested structure from API (with otherPOEntityList)
        if (data.useNestedStructure && data.items && Array.isArray(data.items)) {
            // Use the actual API structure with nested otherPOEntityList
            for (const item of data.items) {
                if (results.length >= MAX_RESULTS) break;

                const itemName = item.itemName || '';
                const category = item.category || '';
                const otherPOEntityList = item.otherPOEntityList || [];
                const itemNameLower = itemName.toLowerCase();

                // Check if itemName matches first (in case there are no entities)
                const itemNameMatches = searchTerms.every(term => itemNameLower.includes(term));

                // If there are entities, check them
                if (otherPOEntityList.length > 0) {
                    // Check all entities for matches - search terms can match across itemName, brand, model, type
                    for (const entity of otherPOEntityList) {
                        if (results.length >= MAX_RESULTS) break;

                        const brand = entity.brandName || '';
                        const model = entity.modelName || '';
                        const type = entity.typeColor || '';

                        const brandLower = brand.toLowerCase();
                        const modelLower = model.toLowerCase();
                        const typeLower = type.toLowerCase();

                        // Check if ALL search terms match across ANY of the fields (itemName, brand, model, type)
                        const matches = searchTerms.every(term => {
                            return (
                                itemNameLower.includes(term) ||
                                brandLower.includes(term) ||
                                modelLower.includes(term) ||
                                typeLower.includes(term)
                            );
                        });

                        if (matches) {
                            results.push({
                                itemName,
                                brand,
                                model,
                                type,
                                category,
                                defaultQty: entity.defaultQty || '1',
                                minimumQty: entity.minimumQty || '1',
                                entityId: entity.id,
                                // Include IDs when available
                                itemId: item.id || item.itemId || item._id || null,
                                categoryId: item.categoryId || item.category_id || null,
                                brandId: entity.brandId || entity.brand_id || null,
                                modelId: entity.modelId || entity.model_id || null,
                                typeId: entity.typeId || entity.type_id || null,
                            });
                        }
                    }
                } else if (itemNameMatches) {
                    // If no entities but itemName matches, add item with empty brand/model/type
                    results.push({
                        itemName,
                        brand: '',
                        model: '',
                        type: '',
                        category,
                        defaultQty: '1',
                        minimumQty: '1',
                        entityId: null,
                        itemId: item.id || item.itemId || item._id || null,
                        categoryId: item.categoryId || item.category_id || null,
                        brandId: null,
                        modelId: null,
                        typeId: null,
                    });
                }
            }

            setSearchResults(results);
            
            // Clean up itemQuantities for nested structure results
            setItemQuantities(prev => {
                const cleaned = {};
                const existingItemsMap = {};
                existingItems.forEach(item => {
                    const itemKey = getItemKey(item);
                    if (itemKey && item.quantity > 0) {
                        existingItemsMap[itemKey] = item.quantity;
                    }
                });
                
                results.forEach(item => {
                    const itemId = getItemKey(item);
                    if (existingItemsMap[itemId] !== undefined) {
                        cleaned[itemId] = existingItemsMap[itemId];
                    } else if (prev[itemId] !== undefined && prev[itemId] > 0) {
                        cleaned[itemId] = prev[itemId];
                    }
                });
                
                return cleaned;
            });
            return;
        }

        // Old format handling (array of items or separate arrays)
        const itemNames = Array.isArray(data) ? [] : (data.itemNames || []);
        const brands = Array.isArray(data) ? [] : (data.brands || []);
        const models = Array.isArray(data) ? [] : (data.models || []);
        const types = Array.isArray(data) ? [] : (data.types || []);
        const category = Array.isArray(data) ? '' : (data.category || '');

        // If it's the old format (array of items), filter and remove duplicates
        if (Array.isArray(data)) {
                const filtered = data.filter(item => {
                const itemNameLower = item.itemName?.toLowerCase() || '';
                const brandLower = item.brand?.toLowerCase() || '';
                const modelLower = item.model?.toLowerCase() || '';
                const typeLower = item.type?.toLowerCase() || '';

                return searchTerms.every(term => {
                    return (
                        itemNameLower.includes(term) ||
                        brandLower.includes(term) ||
                        modelLower.includes(term) ||
                        typeLower.includes(term)
                    );
                });
            });
            
            // Remove duplicates based on itemName only (show unique item names)
            const seenItemNames = new Set();
            const uniqueResults = [];
            
            for (const item of filtered) {
                if (seenItemNames.has(item.itemName)) continue;
                seenItemNames.add(item.itemName);
                uniqueResults.push(item);
                if (uniqueResults.length >= MAX_RESULTS) break;
            }
            
            setSearchResults(uniqueResults);
            
            // Clean up itemQuantities for array format results
            setItemQuantities(prev => {
                const cleaned = {};
                const existingItemsMap = {};
                existingItems.forEach(item => {
                    const itemKey = getItemKey(item);
                    if (itemKey && item.quantity > 0) {
                        existingItemsMap[itemKey] = item.quantity;
                    }
                });
                
                uniqueResults.forEach(item => {
                    const itemId = getItemKey(item);
                    if (existingItemsMap[itemId] !== undefined) {
                        cleaned[itemId] = existingItemsMap[itemId];
                    } else if (prev[itemId] !== undefined && prev[itemId] > 0) {
                        cleaned[itemId] = prev[itemId];
                    }
                });
                
                return cleaned;
            });
            return;
        }

        // Fallback: Generate combinations from separate arrays
        const matchingItemNames = itemNames.filter(name => 
                searchTerms.some(term => name.toLowerCase().includes(term))
            );
        const matchingBrands = brands.filter(brand => 
            searchTerms.some(term => brand.toLowerCase().includes(term))
        );
        const matchingModels = models.filter(model => 
            searchTerms.some(term => model.toLowerCase().includes(term))
        );
        const matchingTypes = types.filter(type => 
            searchTerms.some(term => type.toLowerCase().includes(term))
        );

        const itemsToUse = matchingItemNames.length > 0 ? matchingItemNames : itemNames;
        const brandsToUse = matchingBrands.length > 0 ? matchingBrands : brands;
        const modelsToUse = matchingModels.length > 0 ? matchingModels : models;
        const typesToUse = matchingTypes.length > 0 ? matchingTypes : types;

        const seenCombinations = new Set();
        let count = 0;

        for (const itemName of itemsToUse) {
            if (count >= MAX_RESULTS) break;
            for (const brand of brandsToUse) {
                if (count >= MAX_RESULTS) break;
                for (const model of modelsToUse) {
                    if (count >= MAX_RESULTS) break;
                    for (const type of typesToUse) {
                        if (count >= MAX_RESULTS) break;
                        
                        const combinationKey = `${itemName}|${brand}|${model}|${type}`;
                        if (seenCombinations.has(combinationKey)) continue;
                        
                        const itemNameLower = itemName.toLowerCase();
                        const brandLower = brand.toLowerCase();
                        const modelLower = model.toLowerCase();
                        const typeLower = type.toLowerCase();

                        const matches = searchTerms.every(term => {
                            return (
                                itemNameLower.includes(term) ||
                                brandLower.includes(term) ||
                                modelLower.includes(term) ||
                                typeLower.includes(term)
                            );
                        });

                        if (matches) {
                            results.push({
                                itemName,
                                brand,
                                model,
                                type,
                                category
                            });
                            
                            seenCombinations.add(combinationKey);
                            count++;
                        }
                    }
                }
            }
        }

        setSearchResults(results);
        
        // Clean up itemQuantities and initialize from existingItems for items in current search results
        setItemQuantities(prev => {
            const cleaned = {};
            
            // First, build a map of existing items for quick lookup
            const existingItemsMap = {};
            existingItems.forEach(item => {
                const itemKey = getItemKey(item);
                if (itemKey && item.quantity > 0) {
                    existingItemsMap[itemKey] = item.quantity;
                }
            });
            
            // For items in current search results, use existing item quantity if available, otherwise keep user-set quantity
            results.forEach(item => {
                const itemId = getItemKey(item);
                // Prioritize existing item quantity, then user-set quantity, otherwise 0
                if (existingItemsMap[itemId] !== undefined) {
                    cleaned[itemId] = existingItemsMap[itemId];
                } else if (prev[itemId] !== undefined && prev[itemId] > 0) {
                    cleaned[itemId] = prev[itemId];
                }
            });
            
            return cleaned;
        });
    }, [debouncedSearchQuery, getAvailableItems, existingItems]);

    const handleQuantityChange = (itemId, delta) => {
        setItemQuantities(prev => {
            const current = prev[itemId] || 0;
            const newValue = Math.max(0, current + delta);
            return { ...prev, [itemId]: newValue };
        });
    };

    // Check if item is available in selected stocking location
    const checkItemAvailabilityInLocation = (item) => {
        // Skip availability check if disabled (e.g., for incoming inventory where we're adding stock)
        if (disableAvailabilityCheck) {
            return true;
        }
        if (!stockingLocationId) {
            return true; // If no location selected, allow (will be validated in parent)
        }
        const itemId = item.itemId || item.item_id || null;
        if (itemId === null || itemId === undefined) {
            return false;
        }
        const itemKey = String(itemId);
        const breakdown = stockBreakdown[itemKey] || {};
        const locationStock = breakdown[String(stockingLocationId)] || 0;
        return locationStock > 0;
    };

    const handleQuantityInputChange = (itemId, value) => {
        // Allow empty string or valid number
        if (value === '') {
            setItemQuantities(prev => ({ ...prev, [itemId]: 0 }));
            return;
        }
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            // Find the item to check availability
            const item = searchResults.find(r => getItemKey(r) === itemId);
            if (item && numValue > 0) {
                // Check if item is available in selected stocking location
                if (!checkItemAvailabilityInLocation(item)) {
                    alert(`Item "${item.itemName || 'this item'}" is not available in the selected Stocking Location.`);
                    // Reset to 0 or previous value
                    const existingItem = existingItems.find(existing => {
                        const existingKey = getItemKey(existing);
                        return existingKey === itemId;
                    });
                    const currentQuantity = existingItem ? (existingItem.quantity || 0) : 0;
                    setItemQuantities(prev => ({ ...prev, [itemId]: currentQuantity }));
                    return;
                }
            }
            setItemQuantities(prev => ({ ...prev, [itemId]: numValue }));
        }
    };

    const handleQuantityInputBlur = (item, itemId) => {
        const quantity = itemQuantities[itemId] || 0;
        // Get current quantity from existingItems to compare
        const existingItem = existingItems.find(existing => {
            const existingKey = getItemKey(existing);
            return existingKey === itemId;
        });
        const currentQuantity = existingItem ? (existingItem.quantity || 0) : 0;
        
        if (quantity !== currentQuantity) {
            if (quantity > 0) {
                // Check if item is available in selected stocking location
                if (!checkItemAvailabilityInLocation(item)) {
                    alert(`Item "${item.itemName || 'this item'}" is not available in the selected Stocking Location.`);
                    // Reset to current quantity
                    setItemQuantities(prev => ({ ...prev, [itemId]: currentQuantity }));
                    setFocusedInputId(null);
                    return;
                }
                // Calculate the difference to add/subtract
                const difference = quantity - currentQuantity;
                // Update quantity (incremental add/subtract)
                onAdd(item, difference, true);
            } else if (currentQuantity > 0) {
                // If user set quantity to 0, remove the item
                onAdd(item, -currentQuantity, true);
            }
        }
        // Clear focus
        setFocusedInputId(null);
    };


    // Get category color
    const getCategoryColor = (category) => {
        switch (category) {
            case 'Electricals':
                return 'bg-[#E3F2FD] text-[#1976D2]'; // Light blue
            case 'Paint':
                return 'bg-[#E8F5E9] text-[#2E7D32]'; // Light green
            case 'Plumbing':
                return 'bg-[#FFF3E0] text-[#F57C00]'; // Light orange
            case 'Carpentry':
                return 'bg-[#F3E5F5] text-[#7B1FA2]'; // Light purple
            default:
                return 'bg-[#E3F2FD] text-[#1976D2]';
        }
    };
    // Fetch inventory data and calculate available stock quantities across ALL locations
    useEffect(() => {
        const fetchStockQuantities = async () => {
            if (!isOpen) {
                setStockQuantities({});
                setStockBreakdown({});
                return;
            }

            try {
                // Fetch all inventory records to get complete data
                const response = await fetch('https://backendaab.in/aabuildersDash/api/inventory/getAll');
                if (!response.ok) {
                    console.error('Failed to fetch inventory data');
                    setStockQuantities({});
                    setStockBreakdown({});
                    return;
                }

                const inventoryRecords = await response.json();
                
                // Filter out deleted records only (don't filter by stocking location - we want ALL locations)
                const activeRecords = inventoryRecords.filter(record => {
                    const recordDeleteStatus = record.delete_status !== undefined ? record.delete_status : record.deleteStatus;
                    return !recordDeleteStatus;
                });

                // Calculate net stock for each item_id across ALL locations
                // Also store breakdown by location for each item
                const stockMap = {}; // Total quantity per item_id
                const breakdownMap = {}; // Breakdown by location per item_id
                
                activeRecords.forEach(record => {
                    const recordStockingLocationId = record.stocking_location_id || record.stockingLocationId;
                    const inventoryItems = record.inventoryItems || record.inventory_items || [];
                    
                    if (Array.isArray(inventoryItems)) {
                        inventoryItems.forEach(invItem => {
                            // Use only item_id to group and sum quantities
                            const itemId = invItem.item_id || invItem.itemId || null;
                            
                            if (itemId !== null && itemId !== undefined) {
                                // Use item_id as the key (convert to string for consistency)
                                const itemKey = String(itemId);
                                
                                // Initialize if not exists
                                if (!stockMap[itemKey]) {
                                    stockMap[itemKey] = 0;
                                }
                                if (!breakdownMap[itemKey]) {
                                    breakdownMap[itemKey] = {};
                                }
                                
                                // Convert quantity to number and sum (incoming is positive, outgoing dispatch is negative, stock return is positive)
                                const quantity = Number(invItem.quantity) || 0;
                                stockMap[itemKey] += quantity;
                                
                                // Store breakdown by location
                                const locationKey = String(recordStockingLocationId);
                                if (!breakdownMap[itemKey][locationKey]) {
                                    breakdownMap[itemKey][locationKey] = 0;
                                }
                                breakdownMap[itemKey][locationKey] += quantity;
                            }
                        });
                    }
                });

                setStockQuantities(stockMap);
                setStockBreakdown(breakdownMap);
            } catch (error) {
                console.error('Error fetching stock quantities:', error);
                setStockQuantities({});
                setStockBreakdown({});
            }
        };

        fetchStockQuantities();
    }, [isOpen]);

    // Get available quantity from calculated stock (based on item_id only) - across ALL locations
    const getAvailableQuantity = (item) => {
        // Use only item_id to get the quantity
        const itemId = item.itemId || item.item_id || null;
        
        if (itemId === null || itemId === undefined) {
            return 0; // Return 0 if item_id is not available
        }

        // Use item_id as the key (same as in stockMap)
        const itemKey = String(itemId);
        
        const availableQty = stockQuantities[itemKey] || 0;
        
        // Return max of 0 (can't have negative stock)
        return Math.max(0, availableQty);
    };

    // Get stock breakdown for an item
    const getStockBreakdown = (item) => {
        const itemId = item.itemId || item.item_id || null;
        if (itemId === null || itemId === undefined) {
            return {};
        }
        const itemKey = String(itemId);
        return stockBreakdown[itemKey] || {};
    };

    // Fetch location names mapping
    const [locationNamesMap, setLocationNamesMap] = useState({});
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
        if (isOpen) {
            fetchLocationNames();
        }
    }, [isOpen]);

    // Handle click on quantity to show breakdown
    const handleQuantityClick = (item) => {
        const breakdown = getStockBreakdown(item);
        if (Object.keys(breakdown).length > 0) {
            setSelectedItemForSummary(item);
            setShowStockSummary(true);
        }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" onClick={onClose} style={{ fontFamily: "'Manrope', sans-serif" }} >
            <div
                className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] flex flex-col"
                style={{ 
                    maxHeight: 'calc(100vh - 100px)',
                    height: 'auto',
                    minHeight: '600px'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-[#E0E0E0]">
                    <p className="text-[16px] font-semibold text-black">Search Items</p>
                    <button
                        onClick={onClose}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L4 12M4 4L12 12" stroke="#e4572e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                {/* Search Input */}
                <div className="px-6 pt-4 pb-4 border-b border-[#E0E0E0]">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setSearchQuery(newValue);
                            }}
                            onFocus={(e) => {
                                // Scroll input into view when keyboard appears on mobile
                                setTimeout(() => {
                                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 300);
                            }}
                            placeholder="Search by Item Name, Model, Brand, or Type"
                            className="w-full h-[40px] pl-10 pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[14px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                            autoFocus={false}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="7" cy="7" r="5.5" stroke="#9E9E9E" strokeWidth="1.5" />
                                <path d="M11 11L14 14" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>
                {/* Results List */}
                <div className="flex-1 overflow-y-auto px-4 py-4" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                    {searchResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                                {searchQuery ? 'No items found' : 'Start typing to search for items'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {searchResults.map((item) => {
                                const itemId = getItemKey(item);
                                // Find matching existing item
                                const existingItem = existingItems.find(existing => {
                                    const existingKey = getItemKey(existing);
                                    return existingKey === itemId;
                                });
                                
                                // Determine quantity to display:
                                // 1. If input is focused, show what user is typing (from itemQuantities)
                                // 2. Otherwise, show from existingItems (source of truth)
                                // 3. Fallback to itemQuantities if not in existingItems
                                let quantity = 0;
                                if (focusedInputId === itemId) {
                                    // User is editing this input - show what they're typing
                                    quantity = itemQuantities[itemId] !== undefined ? itemQuantities[itemId] : (existingItem ? (existingItem.quantity || 0) : 0);
                                } else {
                                    // Not editing - show from existingItems (source of truth)
                                    if (existingItem && existingItem.quantity > 0) {
                                        quantity = existingItem.quantity;
                                    } else if (itemQuantities[itemId] !== undefined && itemQuantities[itemId] > 0) {
                                        quantity = itemQuantities[itemId];
                                    } else {
                                        quantity = 0;
                                    }
                                }
                                
                                const availableQty = getAvailableQuantity(item);
                                return (
                                    <div key={itemId} className="bg-white border border-[#E0E0E0] rounded-[8px] p-2" >
                                        <div className="">
                                            {/* Left Side: Item Name, Model, Type and Brand */}
                                            <div className="w-full">
                                                <div className="flex items-center justify-between">
                                                    {/* Item Name */}
                                                    <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                                                        {highlightText(item.itemName, debouncedSearchQuery)}
                                                    </p>
                                                    {/* Category Tag */}
                                                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full mb-1.5 whitespace-nowrap ${getCategoryColor(item.category || 'Electricals')}`}>
                                                        {item.category || 'Electricals'}
                                                    </span>
                                                </div>
                                                {/* Details: Model and Brand, Type */}
                                                <div className="flex items-center justify-between">
                                                    {item.model && (
                                                        <p className="text-[11px] font-medium text-black leading-normal">
                                                            {highlightText(item.model, debouncedSearchQuery)}
                                                        </p>
                                                    )}
                                                    <span 
                                                        onClick={() => handleQuantityClick(item)}
                                                        className="text-[11px] font-medium text-[#777777] mb-1 ml-auto cursor-pointer hover:text-black underline"
                                                    >
                                                        {availableQty}pcs
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Right Side: Category, Available Quantity, Quantity Selector */}
                                            <div className="flex items-end justify-between">
                                                {(item.brand || item.type) && (
                                                    <p className="text-[11px] font-medium text-black leading-normal">
                                                        {item.brand && (
                                                            <>
                                                                {highlightText(item.brand, debouncedSearchQuery)}
                                                                {item.type && ', '}
                                                            </>
                                                        )}
                                                        {item.type && highlightText(item.type, debouncedSearchQuery)}
                                                    </p>
                                                )}
                                                {/* Available Quantity */}
                                                {/* Quantity Selector - Always aligned to right */}
                                                <div className="flex items-center border border-[rgba(0,0,0,0.16)] rounded-[6px] ml-auto">
                                                    <button
                                                        onClick={() => {
                                                            // Get current quantity from existingItems (source of truth)
                                                            const existingItem = existingItems.find(existing => {
                                                                const existingKey = getItemKey(existing);
                                                                return existingKey === itemId;
                                                            });
                                                            const current = existingItem ? (existingItem.quantity || 0) : (itemQuantities[itemId] || 0);
                                                            
                                                            if (current > 0) {
                                                                const newQuantity = current - 1;
                                                                // Update quantity optimistically for immediate UI feedback
                                                                setItemQuantities(prev => {
                                                                    if (newQuantity > 0) {
                                                                        return { ...prev, [itemId]: newQuantity };
                                                                    } else {
                                                                        // If quantity becomes 0, remove from quantities
                                                                        const newQuantities = { ...prev };
                                                                        delete newQuantities[itemId];
                                                                        return newQuantities;
                                                                    }
                                                                });
                                                                // Decrease quantity in the item list (incremental subtract)
                                                                onAdd(item, -1, true);
                                                            }
                                                        }}
                                                        className="w-[24px] h-[28px] flex items-center justify-center text-[16px] font-medium text-black hover:bg-[#f5f5f5] rounded-l-[6px] transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={quantity || ''}
                                                        onChange={(e) => handleQuantityInputChange(itemId, e.target.value)}
                                                        onFocus={() => {
                                                            setFocusedInputId(itemId);
                                                            // Initialize quantity in itemQuantities from existingItems (source of truth)
                                                            const existingItem = existingItems.find(existing => {
                                                                const existingKey = getItemKey(existing);
                                                                return existingKey === itemId;
                                                            });
                                                            const currentQty = existingItem ? (existingItem.quantity || 0) : (itemQuantities[itemId] || 0);
                                                            setItemQuantities(prev => ({ ...prev, [itemId]: currentQty }));
                                                        }}
                                                        onBlur={() => handleQuantityInputBlur(item, itemId)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.target.blur();
                                                            }
                                                        }}
                                                        className="w-[40px] h-[28px] flex items-center justify-center text-[12px] font-semibold text-black text-center border-0 focus:outline-none bg-transparent"
                                                        inputMode="numeric"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            // Check if item is available in selected stocking location
                                                            if (!checkItemAvailabilityInLocation(item)) {
                                                                alert(`Item "${item.itemName || 'this item'}" is not available in the selected Stocking Location.`);
                                                                return;
                                                            }
                                                            // Get current quantity from existingItems (source of truth)
                                                            const existingItem = existingItems.find(existing => {
                                                                const existingKey = getItemKey(existing);
                                                                return existingKey === itemId;
                                                            });
                                                            const current = existingItem ? (existingItem.quantity || 0) : (itemQuantities[itemId] || 0);
                                                            const newQuantity = current + 1;
                                                            // Update quantity optimistically for immediate UI feedback
                                                            setItemQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
                                                            // Add 1 item immediately (incremental add) - this updates parent state
                                                            onAdd(item, 1, true);
                                                        }}
                                                        className="w-[24px] h-[28px] flex items-center justify-center text-[16px] font-medium text-black hover:bg-[#f5f5f5] rounded-r-[6px] transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Stock Summary Modal */}
            <StockSummaryModal
                isOpen={showStockSummary}
                onClose={() => {
                    setShowStockSummary(false);
                    setSelectedItemForSummary(null);
                }}
                item={selectedItemForSummary}
                stockBreakdown={selectedItemForSummary ? getStockBreakdown(selectedItemForSummary) : {}}
                locationNamesMap={locationNamesMap}
            />
        </div>
    );
};

export default SearchItemsModal;

