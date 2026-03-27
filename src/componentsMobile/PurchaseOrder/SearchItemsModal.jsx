import React, { useState, useEffect } from 'react';
import SelectVendorModal from './SelectVendorModal';
import Search from '../Images/Search.png';

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
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-end"
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
            style={{ fontFamily: "'Manrope', sans-serif" }}
        >
            <div className="bg-white w-full mx-auto rounded-t-[20px] flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center px-[24px] pt-[20px]">
                    <p className="text-[16px] font-semibold text-black">
                        <span className="text-[#BF9853]">{itemName}</span> - Stock Summary
                    </p>
                    <button onClick={onClose} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L4 12M4 4L12 12" stroke="#e4572e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                {/* Content */}
                <div className="flex-1 overflow-y-auto px-[24px] py-[16px]">
                    {breakdownArray.length === 0 ? (
                        <p className="text-[14px] font-medium text-[#9E9E9E] text-center py-[32px]">
                            No stock available
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {breakdownArray.map((entry, index) => (
                                <div key={entry.locationId} className="flex items-center justify-between py-[8px] border-b border-[#E0E0E0]">
                                    <p className="text-[14px] font-semibold text-[#8E8E8E]">{entry.locationName}</p>
                                    <p className="text-[14px] font-semibold text-black">{entry.quantity}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Grand Total */}
                {breakdownArray.length > 0 && (
                    <div className="px-[24px] py-[16px]">
                        <div
                            className="w-full h-[2px] mb-[16px]"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(90deg, #E0E0E0 0 14px, transparent 14px 28px)'
                            }}
                        />
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

const SplitItemModal = ({
    isOpen,
    onClose,
    item,
    splitRows,
    splitBaseQuantity,
    onSplitBaseQuantityChange,
    isOutgoingSplitMode,
    onOpenTypeModal,
    onRowChange,
    onAddMore,
    onSubmit,
    isSubmitting
}) => {
    if (!isOpen || !item) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-end"
            onClick={onClose}
            style={{ fontFamily: "'Manrope', sans-serif" }}
        >
            <div className="bg-white w-full mx-auto rounded-t-[20px] flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()} >
                <div className="flex justify-between items-center px-[24px] pt-[20px] gap-[10px]">
                    <p className="text-[16px] font-semibold text-black whitespace-nowrap">Split Item</p>
                    <div className="ml-auto flex items-center gap-[8px]">
                        {isOutgoingSplitMode && (
                            <input
                                type="number"
                                min="0"
                                value={splitBaseQuantity}
                                onChange={(e) => onSplitBaseQuantityChange(e.target.value)}
                                placeholder="Split Qty"
                                className="w-[96px] h-[30px] border border-[rgba(0,0,0,0.16)] rounded px-[8px] text-[12px] text-black focus:outline-none"
                            />
                        )}
                        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4L4 12M4 4L12 12" stroke="#e4572e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="px-[24px] pt-[8px] pb-[12px] border-b border-[#EAEAEA]">
                    <p className="text-[13px] font-semibold text-black">{item.itemName || '-'}</p>
                    <p className="text-[11px] font-medium text-[#5F5F5F] mt-1">
                        Brand: {item.brand || '-'} | Model: {item.model || '-'} | Type: {item.type || '-'}
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto px-[24px] py-[12px] space-y-[10px]">
                    {splitRows.map((row, index) => {
                        const rowQty = Number(row.quantity || 0);
                        const baseQty = Number(splitBaseQuantity || 0);
                        const outputQty = Math.max(0, rowQty * baseQty);
                        return (
                            <div key={index} className="grid grid-cols-3 gap-[8px]">
                                {isOutgoingSplitMode ? (
                                    <button
                                        type="button"
                                        onClick={() => onOpenTypeModal(index)}
                                        className="h-[36px] border border-[rgba(0,0,0,0.16)] rounded px-[10px] text-[12px] text-black focus:outline-none bg-white flex items-center justify-between"
                                    >
                                        <span className={row.type ? 'text-black truncate' : 'text-[#9E9E9E] truncate'}>
                                            {row.type || 'Select Type'}
                                        </span>
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                ) : (
                                    <input
                                        type="text"
                                        value={row.projectName}
                                        onChange={(e) => onRowChange(index, 'projectName', e.target.value)}
                                        placeholder="Project Name"
                                        className="h-[36px] border border-[rgba(0,0,0,0.16)] rounded px-[10px] text-[12px] text-black focus:outline-none"
                                    />
                                )}
                                <input
                                    type="number"
                                    min="0"
                                    value={row.quantity}
                                    onChange={(e) => onRowChange(index, 'quantity', e.target.value)}
                                    placeholder="Quantity"
                                    className="h-[36px] border border-[rgba(0,0,0,0.16)] rounded px-[10px] text-[12px] text-black focus:outline-none"
                                />
                                <input
                                    type="text"
                                    value={isOutgoingSplitMode ? outputQty : ''}
                                    readOnly
                                    placeholder={isOutgoingSplitMode ? 'Output Qty' : ''}
                                    className="h-[36px] border border-[rgba(0,0,0,0.16)] rounded px-[10px] text-[12px] text-black bg-[#FAFAFA] focus:outline-none"
                                />
                            </div>
                        );
                    })}
                    <button
                        onClick={onAddMore}
                        className="h-[34px] px-[14px] rounded border border-[#BF9853] text-[#BF9853] text-[12px] font-semibold hover:opacity-90 transition"
                    >
                        +AddMore
                    </button>
                </div>
                <div className="px-[24px] pb-[16px] pt-[8px]">
                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="w-full h-[38px] rounded border border-[#BF9853] text-[#BF9853] text-[14px] font-semibold hover:opacity-90 transition disabled:opacity-60"
                    >
                        {isSubmitting ? 'Splitting...' : 'Split'}
                    </button>
                </div>
            </div>
        </div>
    );
};
const SearchItemsModal = ({ isOpen, onClose, onAdd, getAvailableItems, existingItems = [], onRefreshData, stockingLocationId = null, disableAvailabilityCheck = false, useInventoryData = false, isFromUpdate = false, fromProjectId = null, enableSplit = false, isOutgoingSplitMode = false, splitSiteInchargeId = null, splitSiteInchargeType = '' }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [itemQuantities, setItemQuantities] = useState({});
    const [focusedInputId, setFocusedInputId] = useState(null); // Track which input is being edited
    const [stockQuantities, setStockQuantities] = useState({}); // Store available stock quantities (total across all locations)
    const [stockBreakdown, setStockBreakdown] = useState({}); // Store breakdown by location for each item
    const [stockAmounts, setStockAmounts] = useState({}); // Store available stock amount totals across all locations
    const [stockAmountBreakdown, setStockAmountBreakdown] = useState({}); // Store amount breakdown by location for each item
    const [splitItemKeys, setSplitItemKeys] = useState(new Set()); // Track items that have Split inventory entries
    const [showStockSummary, setShowStockSummary] = useState(false); // Show stock summary modal
    const [selectedItemForSummary, setSelectedItemForSummary] = useState(null); // Item to show summary for
    const [inventoryItems, setInventoryItems] = useState([]); // Store inventory items when useInventoryData is true
    const [poItemNames, setPoItemNames] = useState([]); // Store PO item names for resolving names
    const [poBrands, setPoBrands] = useState([]);
    const [poModels, setPoModels] = useState([]);
    const [poTypes, setPoTypes] = useState([]);
    const [poCategories, setPoCategories] = useState([]);
    const [showMoveProjectModal, setShowMoveProjectModal] = useState(false);
    const [moveProject, setMoveProject] = useState('');
    const [moveProjectId, setMoveProjectId] = useState(null);
    const [projectOptions, setProjectOptions] = useState([]);
    const [moveDescription, setMoveDescription] = useState('');
    const [splitTagPanel, setSplitTagPanel] = useState({
        key: null,
        description: '',
        pinned: false
    });
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [selectedSplitItem, setSelectedSplitItem] = useState(null);
    const [splitRows, setSplitRows] = useState([{ projectName: '', type: '', quantity: '' }]);
    const [isSplitSubmitting, setIsSplitSubmitting] = useState(false);
    const [splitBaseQuantity, setSplitBaseQuantity] = useState('');
    const [showSplitTypeModal, setShowSplitTypeModal] = useState(false);
    const [splitTypeRowIndex, setSplitTypeRowIndex] = useState(null);
    const [stockRefreshTick, setStockRefreshTick] = useState(0);
    // Store all selected items with their full details (persists across searches)
    const [selectedItemsMap, setSelectedItemsMap] = useState({}); // Key: itemKey, Value: { item, quantity }
    // Refresh data when modal opens
    useEffect(() => {
        if (isOpen && onRefreshData) {
            onRefreshData();
        }
    }, [isOpen, onRefreshData]);
    // Fetch project names when modal opens with isFromUpdate
    useEffect(() => {
        if (isOpen && isFromUpdate) {
            const fetchProjects = async () => {
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
                        const formattedData = data.map(item => ({
                            value: item.siteName || item.site_name || '',
                            label: item.siteName || item.site_name || '',
                            id: item.id
                        })).filter(item => item.value);
                        setProjectOptions(formattedData);
                    }
                } catch (error) {
                    console.error("Error fetching projects:", error);
                }
            };
            fetchProjects();
        } else {
            // Reset project options when modal closes
            setProjectOptions([]);
        }
    }, [isOpen, isFromUpdate]);
    useEffect(() => {
        if (!isOpen || isFromUpdate || projectOptions.length > 0) return;
        const fetchProjectsForSplit = async () => {
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
                    const formattedData = data.map(item => ({
                        value: item.siteName || item.site_name || '',
                        label: item.siteName || item.site_name || '',
                        id: item.id
                    })).filter(item => item.value);
                    setProjectOptions(formattedData);
                }
            } catch (error) {
                console.error("Error fetching projects for split:", error);
            }
        };
        fetchProjectsForSplit();
    }, [isOpen, isFromUpdate, projectOptions.length]);
    // Clear search when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setDebouncedSearchQuery('');
            setSearchResults([]);
            setFocusedInputId(null);
            setShowSplitModal(false);
            setSelectedSplitItem(null);
            setSplitRows([{ projectName: '', type: '', quantity: '' }]);
            setSplitBaseQuantity('');
            setShowSplitTypeModal(false);
            setSplitTypeRowIndex(null);
            setSplitTagPanel({ key: null, description: '', pinned: false });
            // Clear project selection when modal closes (only if isFromUpdate)
            if (isFromUpdate) {
                setMoveProject('');
                setMoveProjectId(null);
                setMoveDescription('');
                setSelectedItemsMap({}); // Clear selected items when modal closes
            }
        }
    }, [isOpen, isFromUpdate]);
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
            // Some flows (ex: Split/Inventory) differentiate entries by `item_type`.
            // Include it in the key so items don't get merged across different item_type values.
            const itemType =
                (item.item_type || item.itemType || item.inventory_type || '').toString().trim();
            const baseKey = `${itemName}_${category}_${brand}_${model}_${type}`;
            return itemType ? `${baseKey}_${itemType}` : baseKey;
        } else {
            // For searchResults format: has itemName, brand, model, type directly
            const itemName = (item.itemName || '').trim();
            const category = (item.category || '').trim();
            const brand = (item.brand || '').trim();
            const model = (item.model || '').trim();
            const type = (item.type || '').trim();
            const itemType =
                (item.item_type || item.itemType || item.inventory_type || '').toString().trim();
            const baseKey = `${itemName}_${category}_${brand}_${model}_${type}`;
            return itemType ? `${baseKey}_${itemType}` : baseKey;
        }
    };
    const getItemDescription = (item) => {
        const raw =
            item?.description ??
            item?.item_description ??
            item?.itemDescription ??
            item?.inventory_description ??
            item?.inventoryDescription ??
            '';
        if (raw === null || raw === undefined) return '';
        return String(raw);
    };
    // Close Split tooltip when clicking outside
    useEffect(() => {
        if (!splitTagPanel.key) return;
        const onDocumentMouseDown = (e) => {
            const target = e.target;
            if (!target || !(target instanceof Element)) {
                setSplitTagPanel({ key: null, description: '', pinned: false });
                return;
            }
            const clickedInsideButton = target.closest('[data-split-tag-button="true"]');
            const clickedInsideTooltip = target.closest('[data-split-tag-tooltip="true"]');
            if (!clickedInsideButton && !clickedInsideTooltip) {
                setSplitTagPanel({ key: null, description: '', pinned: false });
            }
        };
        document.addEventListener('mousedown', onDocumentMouseDown, true);
        return () => {
            document.removeEventListener('mousedown', onDocumentMouseDown, true);
        };
    }, [splitTagPanel.key]);
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
            // If a stocking location is selected, show items available at that location by default
            // BUT: if isFromUpdate is true, show ALL items regardless of stock availability
            if (stockingLocationId && !disableAvailabilityCheck && !isFromUpdate) {
                const results = [];
                if (useInventoryData && Array.isArray(inventoryItems) && inventoryItems.length > 0) {
                    // Include inventory items that have positive stock at the selected location
                    inventoryItems.forEach(item => {
                        const qty = Number(getAvailableQuantity(item)) || 0;
                        if (qty > 0) results.push(item);
                    });
                } else {
                    // For non-inventory mode, derive items from stockBreakdown keys where the selected location has stock
                    Object.keys(stockBreakdown || {}).forEach(key => {
                        const breakdown = stockBreakdown[key] || {};
                        const qty = Number(breakdown[String(stockingLocationId)] || 0);
                        if (qty > 0) {
                            // Resolve item name if possible
                            const itemName = resolveItemName(key) || '';
                            results.push({ itemId: key, itemName });
                        }
                    });
                }
                // Initialize quantities from existingItems for items in results
                setItemQuantities(prev => {
                    const cleaned = {};
                    const existingItemsMap = {};
                    existingItems.forEach(item => {
                        const key = getItemKey(item);
                        if (key && item.quantity > 0) existingItemsMap[key] = item.quantity;
                    });
                    results.forEach(item => {
                        const itemKey = getItemKey(item);
                        if (existingItemsMap[itemKey] !== undefined) {
                            cleaned[itemKey] = existingItemsMap[itemKey];
                        } else if (prev[itemKey] !== undefined && prev[itemKey] > 0) {
                            cleaned[itemKey] = prev[itemKey];
                        }
                    });
                    return cleaned;
                });
                setSearchResults(results);
                return;
            }
            // For isFromUpdate, show all items when search is empty (user needs to search to see items)
            if (isFromUpdate) {
                setSearchResults([]);
                setItemQuantities(prev => {
                    const cleaned = {};
                    existingItems.forEach(item => {
                        const key = getItemKey(item);
                        if (key && item.quantity > 0 && prev[key] !== undefined) {
                            cleaned[key] = prev[key];
                        }
                    });
                    return cleaned;
                });
                return;
            }
            setSearchResults([]);
            // Keep only quantities from existing items when search is cleared
            setItemQuantities(prev => {
                const cleaned = {};
                existingItems.forEach(item => {
                    const itemName = item.name ? item.name.split(',')[0].trim() : '';
                    const category = (item.category || (item.name && item.name.includes(',') ? item.name.split(',')[1]?.trim() : '') || '').trim();
                    const brand = (item.brand || '').trim();
                    const model = (item.model || '').trim();
                    const type = (item.type || '').trim();
                    const itemKey = useInventoryData
                        ? `${itemName}_${category}_${brand}_${model}_${type}`
                        : `${itemName}_${brand}_${model}_${type}`;
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
        const query = trimmedQuery.toLowerCase();
        // Split query into individual words/numbers
        const searchTerms = query.split(/\s+/).filter(term => term.length > 0);
        const MAX_RESULTS = 100; // Limit results to prevent memory issues
        const results = [];
        // If using inventory data, search from inventoryItems
        // BUT: if isFromUpdate is true, also search from getAvailableItems to include all PO items
        if (useInventoryData && inventoryItems.length > 0) {
            const seenKeys = new Set(); // Track items we've already added to avoid duplicates
            // First, add items from inventoryItems
            for (const item of inventoryItems) {
                if (results.length >= MAX_RESULTS) break;
                const itemName = item.itemName || '';
                const category = item.category || '';
                const brand = item.brand || '';
                const model = item.model || '';
                const type = item.type || '';
                const itemNameLower = itemName.toLowerCase();
                const categoryLower = category.toLowerCase();
                const brandLower = brand.toLowerCase();
                const modelLower = model.toLowerCase();
                const typeLower = type.toLowerCase();
                // Check if ALL search terms match across ANY of the fields (itemName, category, brand, model, type)
                const matches = searchTerms.every(term => {
                    return (
                        itemNameLower.includes(term) ||
                        categoryLower.includes(term) ||
                        brandLower.includes(term) ||
                        modelLower.includes(term) ||
                        typeLower.includes(term)
                    );
                });
                if (matches) {
                    // Include inventory-based items in results even if they currently have 0 stock in the selected location.
                    const itemKey = getItemKey(item);
                    seenKeys.add(itemKey);
                    results.push({
                        itemName,
                        category,
                        brand,
                        model,
                        type,
                        // Preserve item_type so we don't merge Split vs non-Split inventory rows.
                        item_type: item.item_type ?? item.itemType ?? item.inventory_type ?? item.inventoryType ?? null,
                        description: getItemDescription(item),
                        itemId: item.itemId || null,
                        categoryId: item.categoryId || null,
                        brandId: item.brandId || null,
                        modelId: item.modelId || null,
                        typeId: item.typeId || null,
                    });
                }
            }
            // If isFromUpdate is true, also search from getAvailableItems to include all PO items
            if (isFromUpdate) {
                const data = getAvailableItems();                
                // Check if using nested structure from API (with otherPOEntityList)
                if (data.useNestedStructure && data.items && Array.isArray(data.items)) {
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
                                    // Create composite key to check for duplicates
                                    const itemKey = `${itemName}_${category}_${brand}_${model}_${type}`;
                                    if (!seenKeys.has(itemKey)) {
                                        seenKeys.add(itemKey);
                                        results.push({
                                            itemName,
                                            brand,
                                            model,
                                            type,
                                            category,
                                            defaultQty: entity.defaultQty || '1',
                                            minimumQty: entity.minimumQty || '1',
                                            entityId: entity.id,
                                            itemId: item.id || item.itemId || item._id || null,
                                            categoryId: item.categoryId || item.category_id || null,
                                            brandId: entity.brandId || entity.brand_id || null,
                                            modelId: entity.modelId || entity.model_id || null,
                                            typeId: entity.typeId || entity.type_id || null,
                                        });
                                    }
                                }
                            }
                        } else if (itemNameMatches) {
                            // If no entities but itemName matches, add item with empty brand/model/type
                            const itemKey = `${itemName}_${category}__`;
                            if (!seenKeys.has(itemKey)) {
                                seenKeys.add(itemKey);
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
                    }
                }
            }
            setSearchResults(results);
            // Clean up itemQuantities for inventory-based results
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
        const data = getAvailableItems();
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
                            // Include entities even if they currently have 0 stock in the selected location.
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
            // Clean up itemQuantities for array format results (preserve only positive existing quantities)
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
    }, [debouncedSearchQuery, getAvailableItems, existingItems, useInventoryData, inventoryItems, stockingLocationId, stockBreakdown]);
    // Helper function to update selected items map (for isFromUpdate)
    const updateSelectedItem = (item, quantity) => {
        if (!isFromUpdate) return;
        const itemKey = getItemKey(item);
        // Ensure categoryId is set - resolve from category name if missing
        let enrichedItem = { ...item };
        if (!enrichedItem.categoryId && !enrichedItem.category_id && enrichedItem.category) {
            const resolvedCategoryId = resolveCategoryId(enrichedItem.category);
            if (resolvedCategoryId) {
                enrichedItem.categoryId = resolvedCategoryId;
            }
        }
        setSelectedItemsMap(prev => {
            const newMap = { ...prev };
            if (quantity > 0) {
                newMap[itemKey] = { item: enrichedItem, quantity };
            } else {
                delete newMap[itemKey];
            }
            return newMap;
        });
    };
    const handleQuantityChange = (itemId, delta) => {
        setItemQuantities(prev => {
            const current = prev[itemId] || 0;
            const newValue = Math.max(0, current + delta);
            return { ...prev, [itemId]: newValue };
        });
    };
    // Resolve categoryId from category name (reverse lookup) - defined early for use in updateSelectedItem
    const resolveCategoryId = (categoryName) => {
        if (!categoryName || !poCategories || poCategories.length === 0) return null;
        const category = poCategories.find(cat => {
            const catName = (cat.category || cat.name || cat.label || '').toString().trim().toLowerCase();
            const searchName = categoryName.toString().trim().toLowerCase();
            return catName === searchName;
        });
        return category ? (category.id || category._id || null) : null;
    };
    // Check if item is available in selected stocking location
    const checkItemAvailabilityInLocation = (item) => {
        // Skip availability check if disabled (e.g., for incoming inventory where we're adding stock)
        if (disableAvailabilityCheck) {
            return true;
        }
        // Do not block actions based on availability here - allow selecting/adding items even if stock is 0.
        if (!stockingLocationId) {
            return true; // If no location selected, allow (parent will validate if needed)
        }
        // Always allow items to be acted upon regardless of stock
        return true;
    };
    const handleQuantityInputChange = (itemId, value) => {
        // Allow empty string or valid number
        if (value === '') {
            setItemQuantities(prev => ({ ...prev, [itemId]: 0 }));
            if (isFromUpdate) {
                // Find item and update selectedItemsMap
                const item = searchResults.find(r => getItemKey(r) === itemId) || 
                            Object.values(selectedItemsMap).find(si => getItemKey(si.item) === itemId)?.item;
                if (item) updateSelectedItem(item, 0);
            }
            return;
        }
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            // Find the item to check availability
            const item = searchResults.find(r => getItemKey(r) === itemId) ||
                        Object.values(selectedItemsMap).find(si => getItemKey(si.item) === itemId)?.item;
            setItemQuantities(prev => ({ ...prev, [itemId]: numValue }));
            if (isFromUpdate && item) {
                updateSelectedItem(item, numValue);
            }
        }
    };
    const handleQuantityInputBlur = (item, itemId) => {
        const quantity = itemQuantities[itemId] || 0;  
        // For isFromUpdate, just update selectedItemsMap (don't call onAdd)
        if (isFromUpdate) {
            updateSelectedItem(item, quantity);
            setFocusedInputId(null);
            return;
        }        
        // Get current quantity from existingItems to compare
        const existingItem = existingItems.find(existing => {
            const existingKey = getItemKey(existing);
            return existingKey === itemId;
        });
        const currentQuantity = existingItem ? (existingItem.quantity || 0) : 0;
        if (quantity !== currentQuantity) {
            if (quantity > 0) {
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
    // Fetch PO data (itemNames, brands, models, types, categories) when useInventoryData is true
    useEffect(() => {
        if (!isOpen || !useInventoryData) return;
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
                    setPoItemNames(data);
                }
                if (brandsRes.ok) {
                    const data = await brandsRes.json();
                    setPoBrands(data);
                }
                if (modelsRes.ok) {
                    const data = await modelsRes.json();
                    setPoModels(data);
                }
                if (typesRes.ok) {
                    const data = await typesRes.json();
                    setPoTypes(data);
                }
                if (categoriesRes.ok) {
                    const data = await categoriesRes.json();
                    setPoCategories(data);
                }
            } catch (error) {
                console.error('Error fetching PO data:', error);
            }
        };
        fetchPOData();
    }, [isOpen, useInventoryData]);
    // Helper function to resolve IDs to names
    const findNameById = (array, id, fieldName) => {
        if (!array || !id || id === 0) return '';
        const item = array.find(i => {
            const itemId = i.id || i._id;
            return String(itemId) === String(id) || Number(itemId) === Number(id);
        });
        if (!item) return '';
        return item[fieldName] || item.name || item.label || '';
    };
    const resolveItemName = (itemId) => {
        return findNameById(poItemNames, itemId, 'itemName') || findNameById(poItemNames, itemId, 'name') || '';
    };
    const resolveBrandName = (brandId) => {
        if (!brandId || brandId === 0) return '';
        return findNameById(poBrands, brandId, 'brand') || findNameById(poBrands, brandId, 'brandName') || findNameById(poBrands, brandId, 'name') || '';
    };
    const resolveModelName = (modelId) => {
        if (!modelId) return '';
        return findNameById(poModels, modelId, 'model') || findNameById(poModels, modelId, 'modelName') || findNameById(poModels, modelId, 'name') || '';
    };
    const resolveTypeName = (typeId) => {
        if (!typeId || typeId === 0) return '';
        return findNameById(poTypes, typeId, 'typeColor') || findNameById(poTypes, typeId, 'type') || findNameById(poTypes, typeId, 'typeName') || findNameById(poTypes, typeId, 'name') || '';
    };
    const resolveCategoryName = (categoryId) => {
        if (!categoryId) return '';
        return findNameById(poCategories, categoryId, 'category') || findNameById(poCategories, categoryId, 'name') || findNameById(poCategories, categoryId, 'label') || '';
    };
    // Fetch inventory data and calculate available stock quantities across ALL locations
    useEffect(() => {
        const fetchStockQuantities = async () => {
            if (!isOpen) {
                setStockQuantities({});
                setStockBreakdown({});
                setStockAmounts({});
                setStockAmountBreakdown({});
                setSplitItemKeys(new Set());
                if (useInventoryData) {
                    setInventoryItems([]);
                }
                return;
            }
            try {
                // Fetch all inventory records to get complete data
                const response = await fetch('https://backendaab.in/aabuildersDash/api/inventory/getAll');
                if (!response.ok) {
                    console.error('Failed to fetch inventory data');
                    setStockQuantities({});
                    setStockBreakdown({});
                    setStockAmounts({});
                    setStockAmountBreakdown({});
                    setSplitItemKeys(new Set());
                    if (useInventoryData) {
                        setInventoryItems([]);
                    }
                    return;
                }
                const inventoryRecords = await response.json();
                // Filter out deleted records only (don't filter by stocking location - we want ALL locations)
                const activeRecords = inventoryRecords.filter(record => {
                    const recordDeleteStatus = record.delete_status !== undefined ? record.delete_status : record.deleteStatus;
                    return !recordDeleteStatus;
                });
                if (useInventoryData) {
                    // For inventory-based search: group by itemName + category + model + brand + type combination
                    const stockMap = {}; // Total quantity per composite key
                    const breakdownMap = {}; // Breakdown by location per composite key
                    const stockAmountMap = {}; // Total amount per composite key
                    const amountBreakdownMap = {}; // Amount breakdown by location per composite key
                    const itemsMap = {}; // Store unique items with their details
                    const splitKeys = new Set();
                    activeRecords.forEach(record => {
                        const recordStockingLocationId = record.stocking_location_id || record.stockingLocationId;
                        const inventoryItems = record.inventoryItems || record.inventory_items || [];
                        if (Array.isArray(inventoryItems)) {
                            inventoryItems.forEach(invItem => {
                                const itemId = invItem.item_id || invItem.itemId || null;
                                const categoryId = invItem.category_id || invItem.categoryId || null;
                                const modelId = invItem.model_id || invItem.modelId || null;
                                const brandId = invItem.brand_id || invItem.brandId || null;
                                const typeId = invItem.type_id || invItem.typeId || null;
                                if (itemId !== null && itemId !== undefined) {
                                    // Resolve names from IDs
                                    const itemName = resolveItemName(itemId);
                                    const category = resolveCategoryName(categoryId);
                                    const model = resolveModelName(modelId);
                                    const brand = resolveBrandName(brandId);
                                    const type = resolveTypeName(typeId);
                                    // Only process items that have at least one of category/model/brand/type
                                    const hasOtherData = category || model || brand || type;
                                    if (hasOtherData && itemName) {
                                    // item_type (ex: Split vs NULL) should differentiate rows for merge/selection.
                                    const itemTypeRaw =
                                        invItem.item_type ?? invItem.itemType ?? invItem.inventory_type ?? invItem.inventoryType ?? null;
                                    const itemTypeKey = itemTypeRaw ? itemTypeRaw.toString().trim() : 'NULL';
                                        // Create composite key: itemName + category + model + brand + type
                                        const compositeKey = `${itemName}_${category || ''}_${brand || ''}_${model || ''}_${type || ''}_${itemTypeKey}`;
                                        // Initialize if not exists
                                        if (!stockMap[compositeKey]) {
                                            stockMap[compositeKey] = 0;
                                        }
                                        if (!breakdownMap[compositeKey]) {
                                            breakdownMap[compositeKey] = {};
                                        }
                                        if (!stockAmountMap[compositeKey]) {
                                            stockAmountMap[compositeKey] = 0;
                                        }
                                        if (!amountBreakdownMap[compositeKey]) {
                                            amountBreakdownMap[compositeKey] = {};
                                        }
                                        if (!itemsMap[compositeKey]) {
                                            itemsMap[compositeKey] = {
                                                itemName,
                                                category: category || '',
                                                brand: brand || '',
                                                model: model || '',
                                                type: type || '',
                                                item_type: itemTypeRaw,
                                                // Best-effort description coming from inventory record/item.
                                                description:
                                                    invItem.description ||
                                                    invItem.item_description ||
                                                    invItem.itemDescription ||
                                                    invItem.inventory_description ||
                                                    invItem.inventoryDescription ||
                                                    record.description ||
                                                    record.description_text ||
                                                    '',
                                                itemId,
                                                categoryId,
                                                brandId,
                                                modelId,
                                                typeId
                                            };
                                        } else if (!itemsMap[compositeKey].description) {
                                            const existing = itemsMap[compositeKey];
                                            const nextDescription =
                                                invItem.description ||
                                                invItem.item_description ||
                                                invItem.itemDescription ||
                                                invItem.inventory_description ||
                                                invItem.inventoryDescription ||
                                                record.description ||
                                                record.description_text ||
                                                '';
                                            if (nextDescription) {
                                                itemsMap[compositeKey] = {
                                                    ...existing,
                                                    description: nextDescription
                                                };
                                            }
                                        }
                                        // Convert quantity to number
                                        const quantity = Number(invItem.quantity) || 0;
                                        const amount = Number(invItem.amount) || 0;
                                        // Detect transfer records (move stock from one location to another)
                                        const inventoryType = (record.inventory_type || record.inventoryType || '').toString().toLowerCase();
                                        const toStockingLocationId = record.to_stocking_location_id || record.toStockingLocationId || null;
                                        if (inventoryType === 'split' && quantity > 0) {
                                            splitKeys.add(compositeKey);
                                        }
                                        if (inventoryType === 'transfer' && toStockingLocationId) {
                                            // For transfers: subtract from the source location and add to the destination location.
                                            // Total stock across locations does not change for a transfer.
                                            const fromKey = String(recordStockingLocationId);
                                            const toKey = String(toStockingLocationId);
                                            if (!breakdownMap[compositeKey][fromKey]) {
                                                breakdownMap[compositeKey][fromKey] = 0;
                                            }
                                            breakdownMap[compositeKey][fromKey] -= quantity;
                                            // Amount is treated as "per 1 quantity" value, so we don't add/subtract by quantity.
                                            if (!amountBreakdownMap[compositeKey][fromKey] || amountBreakdownMap[compositeKey][fromKey] === 0) {
                                                amountBreakdownMap[compositeKey][fromKey] = amount;
                                            }
                                            if (!breakdownMap[compositeKey][toKey]) {
                                                breakdownMap[compositeKey][toKey] = 0;
                                            }
                                            breakdownMap[compositeKey][toKey] += quantity;
                                            if (!amountBreakdownMap[compositeKey][toKey] || amountBreakdownMap[compositeKey][toKey] === 0) {
                                                amountBreakdownMap[compositeKey][toKey] = amount;
                                            }
                                        } else {
                                            // Non-transfer behavior: add to total and to the location breakdown
                                            stockMap[compositeKey] += quantity;
                                            // Amount is treated as "per 1 quantity" value.
                                            // So we keep the first non-zero amount seen for this compositeKey.
                                            if (!stockAmountMap[compositeKey] || stockAmountMap[compositeKey] === 0) {
                                                stockAmountMap[compositeKey] = amount;
                                            }
                                            const locationKey = String(recordStockingLocationId);
                                            if (!breakdownMap[compositeKey][locationKey]) {
                                                breakdownMap[compositeKey][locationKey] = 0;
                                            }
                                            breakdownMap[compositeKey][locationKey] += quantity;
                                            if (!amountBreakdownMap[compositeKey][locationKey] || amountBreakdownMap[compositeKey][locationKey] === 0) {
                                                amountBreakdownMap[compositeKey][locationKey] = amount;
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    });
                    // Convert itemsMap to array for search results
                    setInventoryItems(Object.values(itemsMap));
                    setStockQuantities(stockMap);
                    setStockBreakdown(breakdownMap);
                    setStockAmounts(stockAmountMap);
                    setStockAmountBreakdown(amountBreakdownMap);
                    setSplitItemKeys(splitKeys);
                } else {
                    // Original logic: Calculate net stock for each item_id across ALL locations
                    const stockMap = {}; // Total quantity per item_id
                    const breakdownMap = {}; // Breakdown by location per item_id
                    const splitKeys = new Set();
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
                                    // Convert quantity to number
                                    const quantity = Number(invItem.quantity) || 0;
                                    // Detect transfer records and handle moves between locations
                                    const inventoryType = (record.inventory_type || record.inventoryType || '').toString().toLowerCase();
                                    const toStockingLocationId = record.to_stocking_location_id || record.toStockingLocationId || null;
                                    if (inventoryType === 'split' && quantity > 0) {
                                        splitKeys.add(itemKey);
                                    }
                                    if (inventoryType === 'transfer' && toStockingLocationId) {
                                        // Transfer: subtract from source and add to destination; total remains unchanged
                                        const fromKey = String(recordStockingLocationId);
                                        const toKey = String(toStockingLocationId);
                                        if (!breakdownMap[itemKey][fromKey]) {
                                            breakdownMap[itemKey][fromKey] = 0;
                                        }
                                        breakdownMap[itemKey][fromKey] -= quantity;
                                        if (!breakdownMap[itemKey][toKey]) {
                                            breakdownMap[itemKey][toKey] = 0;
                                        }
                                        breakdownMap[itemKey][toKey] += quantity;
                                    } else {
                                        // Normal behaviour: add to total and to the location breakdown
                                        stockMap[itemKey] += quantity;
                                        const locationKey = String(recordStockingLocationId);
                                        if (!breakdownMap[itemKey][locationKey]) {
                                            breakdownMap[itemKey][locationKey] = 0;
                                        }
                                        breakdownMap[itemKey][locationKey] += quantity;
                                    }
                                }
                            });
                        }
                    });
                    setStockQuantities(stockMap);
                    setStockBreakdown(breakdownMap);
                    setStockAmounts({});
                    setStockAmountBreakdown({});
                    setSplitItemKeys(splitKeys);
                }
            } catch (error) {
                console.error('Error fetching stock quantities:', error);
                setStockQuantities({});
                setStockBreakdown({});
                setStockAmounts({});
                setStockAmountBreakdown({});
                setSplitItemKeys(new Set());
                if (useInventoryData) {
                    setInventoryItems([]);
                }
            }
        };
        fetchStockQuantities();
    }, [isOpen, useInventoryData, poItemNames, poBrands, poModels, poTypes, poCategories, stockRefreshTick]);
    // Check if item is available in selected stocking location (helper function for search filtering)
    const checkItemAvailabilityInLocationHelper = (item) => {
        // Skip availability check if disabled (e.g., for incoming inventory where we're adding stock)
        if (disableAvailabilityCheck) {
            return true;
        }
        // Do not block items based on availability here - show 0 qty items as well.
        // If no stocking location selected, allow results (parent will validate if needed)
        if (!stockingLocationId) {
            return true;
        }
        // Always allow items to be shown regardless of stock levels (we still expose available quantity to the user)
        return true;
    };
    // Get available quantity from calculated stock
    const getAvailableQuantity = (item) => {
        if (useInventoryData) {
            // For inventory-based search: use composite key (itemName + category + model + brand + type)
            const itemName = (item.itemName || '').trim();
            const category = (item.category || '').trim();
            const brand = (item.brand || '').trim();
            const model = (item.model || '').trim();
            const type = (item.type || '').trim();
            const itemTypeRaw = item.item_type ?? item.itemType ?? item.inventory_type ?? item.inventoryType ?? null;
            const itemTypeKey = itemTypeRaw ? itemTypeRaw.toString().trim() : 'NULL';
            // Only show quantity if item has at least one of category/model/brand/type
            const hasOtherData = category || model || brand || type;
            if (!hasOtherData) {
                return 0; // Don't show quantity if no other data
            }
            const compositeKey = `${itemName}_${category}_${brand}_${model}_${type}_${itemTypeKey}`;
            // If stocking location is selected, return stock for that location only
            if (stockingLocationId) {
                const breakdown = stockBreakdown[compositeKey] || {};
                const locationStock = breakdown[String(stockingLocationId)] || 0;
                return Math.max(0, locationStock);
            }
            // Otherwise return total stock across all locations
            const availableQty = stockQuantities[compositeKey] || 0;
            return Math.max(0, availableQty);
        } else {
            // Original logic: Use only item_id to get the quantity
            const itemId = item.itemId || item.item_id || null;
            if (itemId === null || itemId === undefined) {
                return 0; // Return 0 if item_id is not available
            }
            // Use item_id as the key (same as in stockMap)
            const itemKey = String(itemId);
            const availableQty = stockQuantities[itemKey] || 0;
            // Return max of 0 (can't have negative stock)
            return Math.max(0, availableQty);
        }
    };
    // Get available amount from calculated stock amounts
    const getAvailableAmount = (item) => {
        if (useInventoryData) {
            const itemName = (item.itemName || '').trim();
            const category = (item.category || '').trim();
            const brand = (item.brand || '').trim();
            const model = (item.model || '').trim();
            const type = (item.type || '').trim();
            const itemTypeRaw = item.item_type ?? item.itemType ?? item.inventory_type ?? item.inventoryType ?? null;
            const itemTypeKey = itemTypeRaw ? itemTypeRaw.toString().trim() : 'NULL';
            const hasOtherData = category || model || brand || type;
            if (!hasOtherData) return 0;
            const compositeKey = `${itemName}_${category}_${brand}_${model}_${type}_${itemTypeKey}`;
            if (stockingLocationId) {
                const breakdown = stockAmountBreakdown[compositeKey] || {};
                const locationStock = breakdown[String(stockingLocationId)] || 0;
                return Math.max(0, locationStock);
            }
            const availableAmount = stockAmounts[compositeKey] || 0;
            return Math.max(0, availableAmount);
        }
        return 0;
    };
    // Get stock breakdown for an item
    const getStockBreakdown = (item) => {
        if (useInventoryData) {
            // For inventory-based search: use composite key
            const itemName = (item.itemName || '').trim();
            const category = (item.category || '').trim();
            const brand = (item.brand || '').trim();
            const model = (item.model || '').trim();
            const type = (item.type || '').trim();
            const itemTypeRaw = item.item_type ?? item.itemType ?? item.inventory_type ?? item.inventoryType ?? null;
            const itemTypeKey = itemTypeRaw ? itemTypeRaw.toString().trim() : 'NULL';
            const compositeKey = `${itemName}_${category}_${brand}_${model}_${type}_${itemTypeKey}`;
            return stockBreakdown[compositeKey] || {};
        } else {
            // Original logic: use item_id
            const itemId = item.itemId || item.item_id || null;
            if (itemId === null || itemId === undefined) {
                return {};
            }
            const itemKey = String(itemId);
            return stockBreakdown[itemKey] || {};
        }
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
    const handleOpenSplitModal = (item) => {
        setSelectedSplitItem(item);
        setSplitRows([{ projectName: '', type: '', quantity: '' }]);
        setSplitBaseQuantity('');
        setShowSplitModal(true);
    };
    const handleSplitRowChange = (index, field, value) => {
        setSplitRows(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };
    const handleAddSplitRow = () => {
        setSplitRows(prev => [...prev, { projectName: '', type: '', quantity: '' }]);
    };
    const handleOpenSplitTypeModal = (rowIndex) => {
        setSplitTypeRowIndex(rowIndex);
        setShowSplitTypeModal(true);
    };
    const handleSelectSplitType = (typeValue) => {
        if (splitTypeRowIndex === null || splitTypeRowIndex === undefined) return;
        setSplitRows(prev => {
            const updated = [...prev];
            updated[splitTypeRowIndex] = { ...updated[splitTypeRowIndex], type: typeValue };
            return updated;
        });
    };
    const handleCreateSplitType = async (newType) => {
        const trimmedType = (newType || '').trim();
        if (!trimmedType) return;
        // Match AddItemsToPO.jsx behavior: it sends `category` as the *category name* (not id),
        // because `categoryOptions` there use `value/label` = category string.
        const categoryName =
            selectedSplitItem?.category ||
            selectedSplitItem?.categoryName ||
            selectedSplitItem?.category_name ||
            (selectedSplitItem?.categoryId || selectedSplitItem?.category_id || selectedSplitItem?.categoryId) ?
                resolveCategoryName(
                    selectedSplitItem.categoryId || selectedSplitItem.category_id
                ) :
                null;
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    typeColor: trimmedType,
                    category: categoryName
                })
            });
            if (!response.ok) {
                throw new Error('Failed to save type');
            }
            const refreshResponse = await fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll');
            if (refreshResponse.ok) {
                const refreshed = await refreshResponse.json();
                setPoTypes(refreshed);
            } else {
                setPoTypes(prev => [...prev, { typeColor: trimmedType, category: categoryName }]);
            }
        } catch (error) {
            console.error('Error creating split type:', error);
            setPoTypes(prev => {
                const exists = prev.some(t => {
                    const name = (t.typeColor || t.type || t.typeName || t.name || '').toString().toLowerCase().trim();
                    return name === trimmedType.toLowerCase();
                });
                return exists ? prev : [...prev, { typeColor: trimmedType, category: categoryName }];
            });
        }
    };
    const handleSubmitSplit = async () => {
        if (!selectedSplitItem) return;
        if (!stockingLocationId) {
            alert('Stocking Location is required');
            return;
        }
        const baseQty = Number(splitBaseQuantity || 0);
        const validRows = splitRows
            .map(row => {
                if (isOutgoingSplitMode) {
                    const selectedType = (row.type || '').trim();
                    const rowQty = Number(row.quantity || 0);
                    return {
                        type: selectedType,
                        rowQty,
                        quantity: Math.max(0, baseQty * rowQty)
                    };
                }
                return {
                    projectName: (row.projectName || '').trim(),
                    quantity: Number(row.quantity || 0)
                };
            })
            .filter(row => {
                if (isOutgoingSplitMode) {
                    return row.type && row.rowQty > 0 && row.quantity > 0;
                }
                return row.projectName && row.quantity > 0;
            });
        if (validRows.length === 0) {
            alert('Please enter at least one valid split row');
            return;
        }
        if (isOutgoingSplitMode && baseQty <= 0) {
            alert('Please enter Split Qty in header');
            return;
        }
        const availableQty = Number(getAvailableQuantity(selectedSplitItem) || 0);
        if (isOutgoingSplitMode) {
            if (baseQty > availableQty) {
                alert(`Split Qty exceeds available stock (${availableQty})`);
                return;
            }
        } else {
            const totalSplitQty = validRows.reduce((sum, row) => sum + row.quantity, 0);
            if (totalSplitQty > availableQty) {
                alert(`Split quantity exceeds available stock (${availableQty})`);
                return;
            }
        }
        setIsSplitSubmitting(true);
        try {
            let eno = '';
            try {
                const countRes = await fetch(`https://backendaab.in/aabuildersDash/api/inventory/updateCount?stockingLocationId=${stockingLocationId}`);
                if (countRes.ok) {
                    const count = await countRes.json();
                    eno = String((count || 0) + 1);
                }
            } catch (e) {
                // ignore and proceed without eno
            }
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const formattedDate = new Date().toISOString().slice(0, 10);
            if (isOutgoingSplitMode) {
                const clientIdForPayload = fromProjectId || null;
                const headingItemId = selectedSplitItem.itemId || selectedSplitItem.item_id || selectedSplitItem.itemID || selectedSplitItem.id || null;
                const headingCategoryId = selectedSplitItem.categoryId || selectedSplitItem.category_id || (selectedSplitItem.category ? resolveCategoryId(selectedSplitItem.category) : null);
                const headingModelId = selectedSplitItem.modelId || selectedSplitItem.model_id || null;
                const headingBrandId = selectedSplitItem.brandId || selectedSplitItem.brand_id || null;
                const headingTypeId = selectedSplitItem.typeId || selectedSplitItem.type_id || null;
                const siteInchargeId = splitSiteInchargeId || 0;
                const siteInchargeType = splitSiteInchargeType || '';
                const headingName = selectedSplitItem.itemName || '';
                const headingBrand = selectedSplitItem.brand || '';
                const headingModel = selectedSplitItem.model || '';
                const headingType = selectedSplitItem.type || '';
                const headingItemType = selectedSplitItem.item_type || '';
                const headingDetails = `${headingName} , ${headingBrand}, ${headingModel}, ${headingType}`;
                const extractTypeNumber = (value) => {
                    const str = (value || '').toString();
                    const match = str.match(/(\d+(?:\.\d+)?)/);
                    return match ? Number(match[1]) : 0;
                };
                // `amount` in inventoryItems is treated as "per 1 quantity" amount,
                // so we do NOT divide by total qty and we do NOT multiply by row qty.
                const headingUnitAmount = Number(getAvailableAmount(selectedSplitItem) || 0);
                const headingTypeNumber = extractTypeNumber(headingType);
                const amountPerTypeUnit = headingTypeNumber > 0 ? headingUnitAmount / headingTypeNumber : 0;
                const round2 = (n) => {
                    const num = Number(n);
                    if (!isFinite(num)) return 0;
                    return Math.round((num + Number.EPSILON) * 100) / 100;
                };
                const generatedRows = validRows.map((row) => {
                    const selectedTypeOption = poTypes.find(t =>
                        ((t.typeColor || t.type || t.typeName || t.name || '').toString().trim().toLowerCase()) === row.type.toLowerCase()
                    );
                    const selectedTypeId = selectedTypeOption ? (selectedTypeOption.id || selectedTypeOption._id || null) : null;
                    const rowDescription = `${headingDetails} - ${row.quantity}`;
                    const rowTypeNumber = extractTypeNumber(row.type);
                    const computedRowAmount = round2(
                        amountPerTypeUnit > 0
                            ? Math.abs(rowTypeNumber) * amountPerTypeUnit
                            : headingUnitAmount // fallback
                    );
                    return {
                        item_id: headingItemId,
                        category_id: headingCategoryId,
                        model_id: headingModelId,
                        brand_id: headingBrandId,
                        type_id: selectedTypeId,
                        quantity: row.quantity,
                        amount: computedRowAmount,
                        description: rowDescription
                    };
                });
                const firstEntryDescription = `${headingDetails} - ${Math.abs(baseQty)}`;
                const firstEntryAmount = round2(headingUnitAmount);
                const firstPayload = {
                    client_id: clientIdForPayload,
                    stocking_location_id: stockingLocationId,
                    inventory_type: 'Split',
                    site_incharge_id: siteInchargeId,
                    site_incharge_type: siteInchargeType,
                    date: formattedDate,
                    created_by: (user && user.username) || '',
                    eno: eno,
                    purchase_no: '',
                    description: firstEntryDescription,
                    inventoryItems: [
                        {
                            item_id: headingItemId,
                            category_id: headingCategoryId,
                            model_id: headingModelId,
                            brand_id: headingBrandId,
                            type_id: headingTypeId,
                            quantity: -Math.abs(baseQty),
                            amount: firstEntryAmount,
                            description: firstEntryDescription,
                            item_type: headingItemType
                        }
                    ]
                };
                const firstResponse = await fetch('https://backendaab.in/aabuildersDash/api/inventory/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(firstPayload)
                });
                if (!firstResponse.ok) {
                    const err = await firstResponse.json().catch(() => ({}));
                    throw new Error(err.message || 'Failed to save split source entry');
                }
                // Save each split row as a separate entry (2nd, 3rd, ... one-by-one)
                for (const rowItem of generatedRows) {
                    const rowPayload = {
                        client_id: clientIdForPayload,
                        stocking_location_id: stockingLocationId,
                        inventory_type: 'Split',
                        site_incharge_id: siteInchargeId,
                        site_incharge_type: siteInchargeType,
                        date: formattedDate,
                        created_by: (user && user.username) || '',
                        eno: eno,
                        purchase_no: '',
                        description: rowItem.description || '',
                        inventoryItems: [
                            {
                                ...rowItem,
                                item_type: 'Split'
                            }
                        ]
                    };
                    const rowResponse = await fetch('https://backendaab.in/aabuildersDash/api/inventory/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(rowPayload)
                    });
                    if (!rowResponse.ok) {
                        const err = await rowResponse.json().catch(() => ({}));
                        throw new Error(err.message || 'Failed to save split row entry');
                    }
                }
            } else {
                for (const row of validRows) {
                    let clientIdForPayload = fromProjectId || null;
                    const projectMatch = projectOptions.find(
                        p => (p.value || '').toLowerCase().trim() === row.projectName.toLowerCase().trim()
                    );
                    if (!projectMatch?.id) {
                        throw new Error(`Project not found: ${row.projectName}`);
                    }
                    clientIdForPayload = projectMatch.id;
                    const payload = {
                        stocking_location_id: stockingLocationId,
                        client_id: clientIdForPayload,
                        description: `Split - ${selectedSplitItem.itemName || ''}`,
                        inventory_type: 'Split',
                        date: formattedDate,
                        eno: eno,
                        purchase_no: '',
                        created_by: (user && user.username) || '',
                        inventoryItems: [
                            {
                                item_id: selectedSplitItem.itemId || selectedSplitItem.item_id || selectedSplitItem.itemID || selectedSplitItem.id || null,
                                category_id: selectedSplitItem.categoryId || selectedSplitItem.category_id || (selectedSplitItem.category ? resolveCategoryId(selectedSplitItem.category) : null),
                                model_id: selectedSplitItem.modelId || selectedSplitItem.model_id || null,
                                brand_id: selectedSplitItem.brandId || selectedSplitItem.brand_id || null,
                                type_id: selectedSplitItem.typeId || selectedSplitItem.type_id || null,
                                quantity: row.quantity,
                                amount: 0,
                                item_type: 'Split'
                            }
                        ]
                    };
                    const response = await fetch('https://backendaab.in/aabuildersDash/api/inventory/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const err = await response.json().catch(() => ({}));
                        throw new Error(err.message || 'Failed to split item');
                    }
                }
            }
            alert('Item split saved successfully');
            setShowSplitModal(false);
            setSelectedSplitItem(null);
            setSplitRows([{ projectName: '', type: '', quantity: '' }]);
            setSplitBaseQuantity('');
            // Refresh inventory/getAll derived stocks and list without closing SearchItemsModal
            setStockRefreshTick(prev => prev + 1);
            if (onRefreshData) onRefreshData();
        } catch (error) {
            console.error('Error saving split:', error);
            alert(`Error saving split: ${error.message}`);
        } finally {
            setIsSplitSubmitting(false);
        }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" onClick={onClose} style={{ fontFamily: "'Manrope', sans-serif" }} >
            <div
                className="bg-white w-full mx-auto rounded-t-[20px] flex flex-col"
                style={{ maxHeight: 'calc(100vh - 100px)', height: 'auto', minHeight: '600px' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-[24px] pt-[20px]">
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
                {/* Project Name Dropdown - ONLY for Update → Other Returns */}
                {isFromUpdate && (
                    <div className=" px-[16px]">
                        <p className="text-[12px] font-semibold text-black leading-normal mb-1">Project Name</p>
                        <div
                            onClick={() => setShowMoveProjectModal(true)}
                            className="relative w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[12px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                            style={{ color: moveProject ? '#000' : '#9E9E9E', paddingRight: moveProject ? '40px' : '12px' }}
                        >
                            {moveProject || 'Select Project'}
                            {moveProject && (
                                <button
                                    type="button" onClick={(e) => { e.stopPropagation(); setMoveProject(''); setMoveProjectId(null); }}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {/* Description Field */}
                        <div className="mt-2">
                            <p className="text-[12px] font-semibold text-black leading-normal mb-1">Description</p>
                            <input
                                type="text"
                                value={moveDescription}
                                onChange={(e) => setMoveDescription(e.target.value)}
                                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[12px] text-[12px] font-medium bg-white text-black"
                                placeholder="Enter description"
                            />
                        </div>
                    </div>
                )}
                {/* Search Input */}
                <div className="px-[16px] pt-[4px] pb-[8px] bg-white sticky top-0 z-10">
                    <div className="relative items-center">
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
                            className="w-full h-[40px] pl-[30px] pr-[16px] border border-[rgba(0,0,0,0.16)] rounded-full text-[14px] font-medium text-black placeholder:text-[#bdbbbb] placeholder:text-[12px]  placeholder:font-extralight bg-white focus:outline-none"
                            autoFocus={false}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <img src={Search} alt='search' className=' w-[12px] h-[12px]' />
                        </div>
                    </div>
                </div>
                {/* Results List */}
                <div className="flex-1 overflow-y-auto px-[24px] no-scrollbar scrollbar-none" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                    {(() => {
                        // For isFromUpdate, merge search results with selected items that aren't in search results
                        let itemsToDisplay = [...searchResults];
                        if (isFromUpdate) {
                            const searchKeys = new Set(searchResults.map(item => getItemKey(item)));
                            Object.values(selectedItemsMap).forEach(({ item }) => {
                                const itemKey = getItemKey(item);
                                if (!searchKeys.has(itemKey)) {
                                    itemsToDisplay.push(item);
                                }
                            });
                        }                        
                        if (itemsToDisplay.length === 0) {
                            return (
                                <div className="flex flex-col items-center justify-center py-[48px]">
                                    <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                                        {searchQuery ? 'No items found' : 'Start typing to search for items'}
                                    </p>
                                </div>
                            );
                        }                        
                        return (
                            <div className="space-y-[3px]">
                                {itemsToDisplay.map((item) => {
                                const itemId = getItemKey(item);
                                // Find matching existing item
                                const existingItem = existingItems.find(existing => {
                                    const existingKey = getItemKey(existing);
                                    return existingKey === itemId;
                                });
                                // Determine quantity to display:
                                // For isFromUpdate: use selectedItemsMap as source of truth
                                // Otherwise: use existingItems or itemQuantities
                                let quantity = 0;
                                if (isFromUpdate) {
                                    const selectedItem = selectedItemsMap[itemId];
                                    if (focusedInputId === itemId) {
                                        // User is editing this input - show what they're typing
                                        quantity = itemQuantities[itemId] !== undefined ? itemQuantities[itemId] : (selectedItem ? selectedItem.quantity : 0);
                                    } else {
                                        // Show from selectedItemsMap (source of truth for isFromUpdate)
                                        quantity = selectedItem ? selectedItem.quantity : (itemQuantities[itemId] || 0);
                                    }
                                } else {
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
                                }
                                const availableQty = getAvailableQuantity(item);
                                const splitKey = useInventoryData
                                    ? (() => {
                                        const itemTypeRaw = item.item_type ?? item.itemType ?? item.inventory_type ?? item.inventoryType ?? null;
                                        const itemTypeKey = itemTypeRaw ? itemTypeRaw.toString().trim() : 'NULL';
                                        return `${(item.itemName || '').trim()}_${(item.category || '').trim()}_${(item.brand || '').trim()}_${(item.model || '').trim()}_${(item.type || '').trim()}_${itemTypeKey}`;
                                    })()
                                    : String(item.itemId || item.item_id || '');
                                const isSplitItem = splitItemKeys.has(splitKey);
                                return (
                                    <div key={itemId} className="bg-white border border-[#E0E0E0] rounded-[8px] p-[8px]" >
                                        <div className="">
                                            {/* Left Side: Item Name, Model, Type and Brand */}
                                            <div className="w-full">
                                                <div className="flex items-center justify-between">
                                                    {/* Item Name */}
                                                    <div className="flex items-center gap-[6px] mb-1 relative">
                                                        <p className={`text-[12px] font-semibold leading-normal ${isSplitItem ? 'text-[#BF9853]' : 'text-black'}`}>
                                                            {highlightText(item.itemName || '', debouncedSearchQuery)}
                                                        </p>
                                                        {isSplitItem && (
                                                            <span
                                                                role="button"
                                                                tabIndex={0}
                                                                data-split-tag-button="true"
                                                                className="text-[9px] font-semibold px-[6px] py-[2px] rounded-full bg-[#FFF3E0] text-[#BF9853] border border-[#F2D4A2] cursor-pointer"
                                                                onMouseEnter={() => {
                                                                    setSplitTagPanel({
                                                                        key: itemId,
                                                                        description: getItemDescription(item),
                                                                        pinned: false
                                                                    });
                                                                }}
                                                                onMouseLeave={() => {
                                                                    setSplitTagPanel(prev => (prev.pinned ? prev : { key: null, description: '', pinned: false }));
                                                                }}
                                                                onClick={() => {
                                                                    setSplitTagPanel(prev => {
                                                                        if (prev.key === itemId && prev.pinned) {
                                                                            return { key: null, description: '', pinned: false };
                                                                        }
                                                                        return { key: itemId, description: getItemDescription(item), pinned: true };
                                                                    });
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                                        e.preventDefault();
                                                                        setSplitTagPanel(prev => {
                                                                            if (prev.key === itemId && prev.pinned) {
                                                                                return { key: null, description: '', pinned: false };
                                                                            }
                                                                            return { key: itemId, description: getItemDescription(item), pinned: true };
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                SPLIT
                                                            </span>
                                                        )}
                                                        {/* Tooltip for Split description */}
                                                        {isSplitItem && splitTagPanel.key === itemId && (
                                                            <div
                                                                className="absolute z-[80] top-full left-0 mt-[6px] w-[240px] max-w-[240px] rounded-[8px] border border-[#F2D4A2] bg-white shadow-lg px-[10px] py-[8px] text-[11px] font-medium text-black break-words"
                                                                style={{ right: 'auto' }}
                                                            data-split-tag-tooltip="true"
                                                                onMouseEnter={() => {
                                                                    // While reading tooltip, keep it visible if it was pinned.
                                                                    setSplitTagPanel(prev => (prev.pinned ? prev : { ...prev, key: prev.key }));
                                                                }}
                                                            >
                                                                {splitTagPanel.description || 'Split description not available'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Category Tag */}
                                                    <span className={`text-[10px] font-medium px-[10px] py-[4px] rounded-full mb-1.5 whitespace-nowrap ${getCategoryColor(item.category || 'Electricals')}`}>
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
                                                        onClick={() => { if (availableQty > 0) handleQuantityClick(item); }}
                                                        className={
                                                            `text-[11px] font-medium ${availableQty > 0 ? 'text-[#777777] cursor-pointer hover:text-black underline mb-1 ml-auto' : 'text-[#9E9E9E] mb-1 ml-auto'}`
                                                        }
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
                                                <div className="flex items-center gap-[8px] ml-auto relative">
                                                    {enableSplit && (
                                                        <button
                                                            onClick={() => handleOpenSplitModal(item)}
                                                            className="h-[28px] px-[10px] rounded-[6px] border border-[#BF9853] text-[#BF9853] text-[11px] font-semibold hover:opacity-90 transition"
                                                        >
                                                            Split
                                                        </button>
                                                    )}
                                                    <div className="flex items-center border border-[rgba(0,0,0,0.16)] rounded-[6px]">
                                                    <button
                                                        onClick={() => {
                                                            let current = 0;
                                                            if (isFromUpdate) {
                                                                const selectedItem = selectedItemsMap[itemId];
                                                                current = selectedItem ? selectedItem.quantity : (itemQuantities[itemId] || 0);
                                                            } else {
                                                                const existingItem = existingItems.find(existing => {
                                                                    const existingKey = getItemKey(existing);
                                                                    return existingKey === itemId;
                                                                });
                                                                current = existingItem ? (existingItem.quantity || 0) : (itemQuantities[itemId] || 0);
                                                            }
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
                                                                if (isFromUpdate) {
                                                                    updateSelectedItem(item, newQuantity);
                                                                } else {
                                                                    // Decrease quantity in the item list (incremental subtract)
                                                                    onAdd(item, -1, true);
                                                                }
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
                                                            // Initialize quantity in itemQuantities
                                                            let currentQty = 0;
                                                            if (isFromUpdate) {
                                                                const selectedItem = selectedItemsMap[itemId];
                                                                currentQty = selectedItem ? selectedItem.quantity : (itemQuantities[itemId] || 0);
                                                            } else {
                                                                const existingItem = existingItems.find(existing => {
                                                                    const existingKey = getItemKey(existing);
                                                                    return existingKey === itemId;
                                                                });
                                                                currentQty = existingItem ? (existingItem.quantity || 0) : (itemQuantities[itemId] || 0);
                                                            }
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
                                                            let current = 0;
                                                            if (isFromUpdate) {
                                                                const selectedItem = selectedItemsMap[itemId];
                                                                current = selectedItem ? selectedItem.quantity : (itemQuantities[itemId] || 0);
                                                            } else {
                                                                const existingItem = existingItems.find(existing => {
                                                                    const existingKey = getItemKey(existing);
                                                                    return existingKey === itemId;
                                                                });
                                                                current = existingItem ? (existingItem.quantity || 0) : (itemQuantities[itemId] || 0);
                                                            }
                                                            const newQuantity = current + 1;
                                                            // Update quantity optimistically for immediate UI feedback
                                                            setItemQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
                                                            
                                                            if (isFromUpdate) {
                                                                updateSelectedItem(item, newQuantity);
                                                            } else {
                                                                // Add 1 item immediately (incremental add) - this updates parent state
                                                                onAdd(item, 1, true);
                                                            }
                                                        }}
                                                        className="w-[24px] h-[28px] flex items-center justify-center text-[16px] font-medium text-black hover:bg-[#f5f5f5] rounded-r-[6px] transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        );
                    })()}
                </div>
                {/* Sticky Footer - Update Button */}
                {isFromUpdate && (
                    <div className="sticky bottom-0 bg-white border-t border-[#E0E0E0] px-[16px] py-[12px] flex justify-end">
                        <button
                            onClick={async () => {
                                // Collect all items with quantity > 0
                                const itemsToUpdate = [];                                
                                if (isFromUpdate) {
                                    // For isFromUpdate, use selectedItemsMap as source of truth
                                    Object.values(selectedItemsMap).forEach(({ item, quantity }) => {
                                        if (quantity > 0) {
                                            itemsToUpdate.push({ item, quantity });
                                        }
                                    });
                                } else {
                                    // Get all items from itemQuantities that have quantity > 0
                                    Object.keys(itemQuantities).forEach(itemKey => {
                                        const quantity = Number(itemQuantities[itemKey] || 0);
                                        if (quantity > 0) {
                                            // Find the item from searchResults or existingItems
                                            let foundItem = searchResults.find(r => getItemKey(r) === itemKey);                                            
                                            // If not found in searchResults, check existingItems
                                            if (!foundItem) {
                                                foundItem = existingItems.find(existing => {
                                                    const existingKey = getItemKey(existing);
                                                    return existingKey === itemKey;
                                                });
                                            }                                            
                                            if (foundItem) {
                                                itemsToUpdate.push({
                                                    item: foundItem,
                                                    quantity: quantity
                                                });
                                            }
                                        }
                                    });
                                }
                                if (itemsToUpdate.length === 0) {
                                    alert('Please select at least one item with quantity > 0');
                                    return;
                                }
                                if (!moveProjectId) {
                                    alert('Please select a Project');
                                    return;
                                }
                                if (!stockingLocationId) {
                                    alert('Stocking Location is required');
                                    return;
                                }
                                try {
                                    // Get ENO
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
                                    // Build inventoryItems array
                                    const inventoryItems = itemsToUpdate.map(({ item, quantity }) => {
                                        const selectedItemForEdit = item;
                                        // Resolve category_id - try multiple sources
                                        let categoryId = selectedItemForEdit.categoryId || selectedItemForEdit.category_id || null;
                                        // If categoryId is missing but category name exists, resolve it
                                        if (!categoryId && selectedItemForEdit.category) {
                                            categoryId = resolveCategoryId(selectedItemForEdit.category);
                                        }                                        
                                        return {
                                            item_id: selectedItemForEdit.itemId || selectedItemForEdit.item_id || selectedItemForEdit.id || null,
                                            category_id: categoryId,
                                            model_id: selectedItemForEdit.modelId || selectedItemForEdit.model_id || null,
                                            brand_id: selectedItemForEdit.brandId || selectedItemForEdit.brand_id || null,
                                            type_id: selectedItemForEdit.typeId || selectedItemForEdit.type_id || null,
                                            quantity: quantity,
                                            amount: Math.abs((selectedItemForEdit.price || 0) * quantity)
                                        };
                                    });
                                    const user = JSON.parse(localStorage.getItem('user') || 'null');
                                    const formattedDate = new Date().toISOString().slice(0, 10);
                                    const payload = {
                                        stocking_location_id: stockingLocationId,
                                        client_id: moveProjectId,
                                        description: moveDescription,
                                        inventory_type: 'Update',
                                        date: formattedDate,
                                        eno: eno,
                                        purchase_no: '',
                                        created_by: (user && user.username) || '',
                                        inventoryItems: inventoryItems
                                    };
                                    // Send the payload
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
                                    await response.json();
                                    alert('Stock updated successfully');
                                    onClose();
                                } catch (error) {
                                    console.error('Error updating stock:', error);
                                    alert(`Error updating stock: ${error.message}`);
                                }
                            }}
                            className="h-[36px] px-[24px] rounded border border-[#BF9853] text-[#BF9853] text-[14px] font-semibold hover:opacity-90 transition"
                        >
                            Update
                        </button>
                    </div>
                )}
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
            <SplitItemModal
                isOpen={showSplitModal}
                onClose={() => {
                    if (isSplitSubmitting) return;
                    setShowSplitModal(false);
                    setSelectedSplitItem(null);
                }}
                item={selectedSplitItem}
                splitRows={splitRows}
                splitBaseQuantity={splitBaseQuantity}
                onSplitBaseQuantityChange={setSplitBaseQuantity}
                isOutgoingSplitMode={isOutgoingSplitMode}
                onOpenTypeModal={handleOpenSplitTypeModal}
                onRowChange={handleSplitRowChange}
                onAddMore={handleAddSplitRow}
                onSubmit={handleSubmitSplit}
                isSubmitting={isSplitSubmitting}
            />
            <SelectVendorModal
                isOpen={showSplitTypeModal}
                onClose={() => {
                    setShowSplitTypeModal(false);
                    setSplitTypeRowIndex(null);
                }}
                onSelect={handleSelectSplitType}
                selectedValue={
                    splitTypeRowIndex !== null && splitRows[splitTypeRowIndex]
                        ? (splitRows[splitTypeRowIndex].type || '')
                        : ''
                }
                options={poTypes.map(t => (t.typeColor || t.type || t.typeName || t.name || '').toString()).filter(Boolean)}
                fieldName="Type"
                onAddNew={handleCreateSplitType}
            />
            {/* Project Selection Modal */}
            <SelectVendorModal
                isOpen={showMoveProjectModal}
                onClose={() => setShowMoveProjectModal(false)}
                onSelect={(value) => {
                    setMoveProject(value);
                    const found = projectOptions.find(opt => (opt.value || opt.label) === value);
                    setMoveProjectId(found ? found.id : null);
                    setShowMoveProjectModal(false);
                }}
                selectedValue={moveProject}
                options={projectOptions.map(o => o.value || o.label)}
                fieldName="Project Name"
            />
        </div>
    );
};

export default SearchItemsModal;