import React, { useState, useEffect, useRef } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';
import Edit from '../Images/edit1.png';
import Delete from '../Images/delete.png';
import Filter from '../Images/Filter.png'

const NonPOHistory = ({ onTabChange }) => {
  const [nonPORecords, setNonPORecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorData, setVendorData] = useState([]);
  const [siteData, setSiteData] = useState([]);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterData, setFilterData] = useState({
    projectName: '',
    stockingLocation: '',
    date: '',
    entryNo: '',
    category: ''
  });
  const [projectNameOpen, setProjectNameOpen] = useState(false);
  const [stockingLocationOpen, setStockingLocationOpen] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryOptionsStrings, setCategoryOptionsStrings] = useState([]);
  const [projectNameSearch, setProjectNameSearch] = useState('');
  const [stockingLocationSearch, setStockingLocationSearch] = useState('');
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [swipeStates, setSwipeStates] = useState({});
  const expandedItemIdRef = useRef(expandedItemId);
  const cardRefs = useRef({});

  const formatDDMMYYYYFromISO = (isoDate) => {
    if (!isoDate) return '';
    if (typeof isoDate === 'string' && isoDate.includes('-')) {
      const [year, month, day] = isoDate.split('-');
      if (year && month && day) return `${day}/${month}/${year}`;
    }
    return '';
  };

  const formatISOFromDDMMYYYY = (ddmmyyyy) => {
    if (!ddmmyyyy) return '';
    if (typeof ddmmyyyy === 'string' && ddmmyyyy.includes('/')) {
      const [day, month, year] = ddmmyyyy.split('/');
      if (year && month && day) return `${year}-${month}-${day}`;
    }
    return '';
  };

  // Fetch vendor data
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
        if (response.ok) {
          const data = await response.json();
          setVendorData(data);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };
    fetchVendors();
  }, []);

  // Fetch site data
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
        if (response.ok) {
          const data = await response.json();
          setSiteData(data);
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };
    fetchSites();
  }, []);

  // Fetch category options from API
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

  // Fetch and process non-PO incoming records
  useEffect(() => {
    const fetchNonPORecords = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://backendaab.in/aabuildersDash/api/inventory/getIncoming', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const inventoryData = await response.json();

        // Filter for non-PO records (no purchase_no or purchase_no is 'NO_PO') and exclude deleted
        const nonPOItems = inventoryData.filter(item => {
          const isDeleted = item.delete_status || item.deleteStatus;
          const purchaseNo = item.purchase_no || item.purchaseNo || item.purchase_number || '';
          // Check if purchase_no is empty/null or equals 'NO_PO' (case-insensitive)
          const isNonPO = !purchaseNo ||
            String(purchaseNo).trim() === '' ||
            String(purchaseNo).toUpperCase() === 'NO_PO';
          return !isDeleted && isNonPO;
        });

        // Process each non-PO record
        const processedRecords = nonPOItems.map((record) => {
          // Get vendor name
          const vendorId = record.vendor_id || record.vendorId;
          const vendor = vendorData.find(v => v.id === vendorId);
          const vendorName = vendor ? vendor.vendorName : 'Unknown Vendor';

          // Get stocking location name
          const stockingLocationId = record.stocking_location_id || record.stockingLocationId;
          const site = siteData.find(s => s.id === stockingLocationId);
          const stockingLocation = site ? site.siteName : 'Unknown Location';

          // Calculate total items and quantity
          const inventoryItems = record.inventoryItems || record.inventory_items || [];
          const numberOfItems = inventoryItems.length;
          const totalQuantity = inventoryItems.reduce((sum, item) => {
            return sum + Math.abs(item.quantity || 0);
          }, 0);
          const totalAmount = inventoryItems.reduce((sum, item) => {
            return sum + Math.abs(item.amount || 0);
          }, 0);

          // Format date
          const itemDate = record.date || record.created_at || record.createdAt;
          const dateObj = new Date(itemDate);
          const formattedDate = dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          const formattedTime = dateObj.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });

          // Get entry number
          const entryNumber = record.eno || record.ENO || record.entry_number || record.entryNumber || record.id || '';
          // Get year from date
          const year = dateObj.getFullYear();
          // Format as NPO - year - entryNumber (like PO - year - entryNumber in PurchaseOrder History)
          const formattedEntryNumber = entryNumber ? `NPO - ${year} - ${entryNumber}` : '';

          return {
            ...record,
            entryNumber,
            formattedEntryNumber,
            vendorName,
            stockingLocation,
            numberOfItems,
            totalQuantity,
            totalAmount,
            formattedDate,
            formattedTime,
            isToday: formattedDate === new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
          };
        });

        // Sort by date (newest first)
        processedRecords.sort((a, b) => {
          const dateA = new Date(a.date || a.created_at || a.createdAt);
          const dateB = new Date(b.date || b.created_at || b.createdAt);
          return dateB - dateA;
        });

        setNonPORecords(processedRecords);
      } catch (error) {
        console.error('Error fetching non-PO records:', error);
        setNonPORecords([]);
      } finally {
        setLoading(false);
      }
    };

    if (vendorData.length > 0 && siteData.length > 0) {
      fetchNonPORecords();
    }
  }, [vendorData, siteData]);

  // Filter records based on search query
  useEffect(() => {
    let filtered = nonPORecords;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => {
        return (
          record.vendorName?.toLowerCase().includes(query) ||
          record.stockingLocation?.toLowerCase().includes(query) ||
          String(record.entryNumber)?.includes(query)
        );
      });
    }

    setFilteredRecords(filtered);
  }, [nonPORecords, searchQuery]);

  // Close category modal when filter sheet closes
  useEffect(() => {
    if (!showFilterSheet) {
      setShowCategoryModal(false);
    }
  }, [showFilterSheet]);

  // Update ref when expandedItemId changes
  useEffect(() => {
    expandedItemIdRef.current = expandedItemId;
  }, [expandedItemId]);

  // Swipe handlers
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
    const isExpanded = expandedItemIdRef.current === itemId;
    if (deltaX < 0 || (isExpanded && deltaX > 0)) {
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
        setExpandedItemId(itemId);
      } else {
        setExpandedItemId(null);
      }
    }
    setSwipeStates(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  // Set up non-passive touch event listeners
  useEffect(() => {
    const cleanupFunctions = [];

    Object.keys(cardRefs.current).forEach(itemId => {
      const cardElement = cardRefs.current[itemId];
      if (!cardElement) return;

      const touchMoveHandler = (e) => {
        const state = swipeStates[itemId];
        if (!state) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - state.startX;
        const isExpanded = expandedItemIdRef.current === itemId;
        if (deltaX < 0 || (isExpanded && deltaX > 0)) {
          e.preventDefault();
        }
      };

      cardElement.addEventListener('touchmove', touchMoveHandler, { passive: false });

      cleanupFunctions.push(() => {
        cardElement.removeEventListener('touchmove', touchMoveHandler);
      });
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [filteredRecords, swipeStates]);

  // Global mouse handlers for desktop support
  useEffect(() => {
    if (filteredRecords.length === 0) return;

    const globalMouseMoveHandler = (e) => {
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };

        filteredRecords.forEach(record => {
          const state = prev[record.id || record._id];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          const isExpanded = expandedItemIdRef.current === (record.id || record._id);
          if (deltaX < 0 || (isExpanded && deltaX > 0)) {
            newState[record.id || record._id] = {
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

        filteredRecords.forEach(record => {
          const state = prev[record.id || record._id];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              setExpandedItemId(record.id || record._id);
            } else {
              setExpandedItemId(null);
            }
          } else {
            if (expandedItemIdRef.current === (record.id || record._id)) {
              setExpandedItemId(null);
            }
          }
          delete newState[record.id || record._id];
          hasChanges = true;
        });

        return hasChanges ? newState : prev;
      });
    };

    document.addEventListener('mousemove', globalMouseMoveHandler);
    document.addEventListener('mouseup', globalMouseUpHandler);

    return () => {
      document.removeEventListener('mousemove', globalMouseMoveHandler);
      document.removeEventListener('mouseup', globalMouseUpHandler);
    };
  }, [filteredRecords]);

  // Handle edit
  const handleEdit = async (record) => {
    try {
      let inventoryData = record;

      // Check if inventoryItems are present
      const hasInventoryItems = inventoryData?.inventoryItems || inventoryData?.inventory_items;

      // If inventoryItems are missing, try to fetch them from the backend
      if (!hasInventoryItems || (Array.isArray(inventoryData?.inventoryItems) && inventoryData.inventoryItems.length === 0) ||
        (Array.isArray(inventoryData?.inventory_items) && inventoryData.inventory_items.length === 0)) {
        if (inventoryData?.id) {
          try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/inventory/edit_with_history/${inventoryData.id}`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const detailedData = await response.json();
              if (detailedData.inventoryItems || detailedData.inventory_items) {
                const items = detailedData.inventoryItems || detailedData.inventory_items;
                inventoryData = {
                  ...inventoryData,
                  inventoryItems: items,
                  inventory_items: items
                };
              }
            }
          } catch (fetchError) {
            console.error('Error fetching inventory details:', fetchError);
          }
        }
      }

      // Ensure inventoryItems are explicitly set
      if (inventoryData?.inventoryItems || inventoryData?.inventory_items) {
        const items = inventoryData.inventoryItems || inventoryData.inventory_items;
        inventoryData = {
          ...inventoryData,
          inventoryItems: items,
          inventory_items: items
        };
      }

      // Mark as edit mode
      inventoryData.isEditMode = true;

      // Store inventory item data in localStorage
      if (inventoryData) {
        localStorage.setItem('editingInventory', JSON.stringify(inventoryData));
      }
      // Dispatch custom event for incoming component to listen
      window.dispatchEvent(new CustomEvent('editInventory', { detail: inventoryData }));
      // Navigate to incoming tab for editing
      if (onTabChange) {
        onTabChange('incoming');
      }
      setExpandedItemId(null);
    } catch (error) {
      console.error('Error in handleEdit:', error);
      const inventoryData = record;
      inventoryData.isEditMode = true;
      localStorage.setItem('editingInventory', JSON.stringify(inventoryData));
      window.dispatchEvent(new CustomEvent('editInventory', { detail: inventoryData }));
      if (onTabChange) {
        onTabChange('incoming');
      }
      setExpandedItemId(null);
    }
  };

  // Handle delete
  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      setExpandedItemId(null);
      return;
    }

    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/inventory/delete/${recordId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove from local state
        setNonPORecords(prev => prev.filter(record => (record.id || record._id) !== recordId));
        alert('Record deleted successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert(`Error deleting record: ${error.message}`);
    }
    setExpandedItemId(null);
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

  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden bg-white">
      {/* Search Bar */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[40px] pl-10 pr-4 border border-gray-300 rounded-full text-[14px] bg-white focus:outline-none focus:border-gray-400"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Filter Button */}
      <div className="flex-shrink-0 px-4 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilterSheet(true)}
            type="button"
            className="flex items-center gap-2 text-[14px] font-medium text-gray-700 flex-shrink-0"
          >
            <img src={Filter} alt="Filter" className="w-[13px] h-[11px]" />
            {!(filterData.projectName || filterData.stockingLocation || filterData.date || filterData.entryNo || filterData.category) && (
              <span className="text-[12px] font-medium text-black">Filter</span>
            )}
          </button>
          {/* Active Filter Tags - Next to Filter button */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none min-w-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {(filterData.projectName || filterData.stockingLocation || filterData.date || filterData.entryNo || filterData.category) && (
              <div className="flex items-center gap-2 flex-nowrap">
                {filterData.projectName && (
                  <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Project</span>
                    <button
                      onClick={() => setFilterData({ ...filterData, projectName: '' })}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {filterData.stockingLocation && (
                  <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Location</span>
                    <button
                      onClick={() => setFilterData({ ...filterData, stockingLocation: '' })}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {filterData.date && (
                  <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Date</span>
                    <button
                      onClick={() => setFilterData({ ...filterData, date: '' })}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {filterData.entryNo && (
                  <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Entry.No</span>
                    <button
                      onClick={() => setFilterData({ ...filterData, entryNo: '' })}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {filterData.category && (
                  <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Category</span>
                    <button
                      onClick={() => setFilterData({ ...filterData, category: '' })}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="flex-1 overflow-y-auto px-4 scrollbar-hide no-scrollbar scrollbar-none">
        {loading ? (
          <div className="flex items-center justify-center py-">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex items-center justify-center py-">
            <p className="text-gray-500">No non-PO records found</p>
          </div>
        ) : (
          <div>
            {filteredRecords.map((record) => {
              const recordId = record.id || record._id;
              const isExpanded = expandedItemId === recordId;
              const swipeState = swipeStates[recordId];
              let swipeOffset = 0;
              if (swipeState && swipeState.isSwiping) {
                const deltaX = swipeState.currentX - swipeState.startX;
                if (deltaX < 0) {
                  swipeOffset = Math.max(-110, Math.min(0, deltaX));
                } else {
                  swipeOffset = Math.min(0, Math.max(0, deltaX));
                }
              } else if (isExpanded) {
                swipeOffset = -110;
              } else {
                swipeOffset = 0;
              }

              return (
                <div key={recordId} className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] h-[100px]">
                  {/* History Card */}
                  <div
                    ref={(el) => {
                      if (el) {
                        cardRefs.current[recordId] = el;
                      } else {
                        delete cardRefs.current[recordId];
                      }
                    }}
                    className="flex-1 bg-white rounded-[8px] h-full px-3 py-2 transition-all duration-300 ease-out"
                    style={{
                      transform: `translateX(${swipeOffset}px)`,
                      touchAction: 'pan-y',
                      userSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                      WebkitUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                      MozUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                      msUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto'
                    }}
                    onTouchStart={(e) => handleTouchStart(e, recordId)}
                    onTouchMove={(e) => handleTouchMove(e, recordId)}
                    onTouchEnd={() => handleTouchEnd(recordId)}
                    onMouseDown={(e) => handleTouchStart(e, recordId)}
                  >
                    <div className=" justify-between items-start">
                      {/* Left Side */}
                      <div className="flex items-center justify-between mb-">
                        <div>
                          <span className="text-[12px] font-semibold text-black">
                            {record.formattedEntryNumber || `#${record.entryNumber}`}
                          </span>
                        </div>
                        <p className="text-[12px] text-black mb-1">
                          No. of Items - {record.numberOfItems}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-black">
                          {record.vendorName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-[#777777]">
                          {record.stockingLocation}
                        </p>
                        <p className="text-[12px] font-semibold text-[#BF9853]">
                          Quantity - {record.totalQuantity}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-[#777777]">
                          {record.created_date_time && (() => {
                            const date = new Date(record.created_date_time);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            const hours = date.getHours();
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            const displayHours = hours % 12 || 12;
                            return `${day}/${month}/${year} • ${displayHours}:${minutes} ${ampm}`;
                          })()}
                        </p>
                        <p className="text-[12px] font-semibold text-black">
                          ₹{record.totalAmount?.toLocaleString('en-IN') || '0'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Behind the card on the right, revealed on swipe */}
                  <div
                    className="absolute right-0 top-0 flex gap-2 flex-shrink-0 z-0"
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
                        handleEdit(record);
                      }}
                      className="action-button w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 hover:bg-[#22a882] transition-colors shadow-sm"
                      title="Edit"
                    >
                      <img src={Edit} alt="Edit" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(recordId);
                      }}
                      className="action-button w-[48px] h-[95px] bg-[#E4572E] flex rounded-[6px] items-center justify-center gap-1.5 hover:bg-[#cc4d26] transition-colors shadow-sm"
                      title="Delete"
                    >
                      <img src={Delete} alt="Delete" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      {showFilterSheet && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFilterSheet(false);
              }
            }}
          >
          {/* Bottom Sheet */}
          <div 
            className="w-full max-w-[360px] bg-white rounded-t-[20px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 51 }}
          >
            {/* Header */}
            <div className="flex-shrink-0">
              <div className="flex justify-between items-center px-6 mt-3">
                <h2 className="text-md font-semibold">
                  Select Filters
                </h2>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="text-[16px] font-semibold text-black decoration-solid"
                    style={{ textUnderlinePosition: 'from-font' }}
                  >
                    {filterData.category || 'Category'}
                  </button>
                </div>
              </div>
            </div>
            {/* Filter Form */}
            <div className="px-6 py-4 space-y-1 overflow-visible flex-1" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              {/* Project Name */}
              <div className="relative" data-dropdown="projectName">
                <label className="block text-[13px] font-medium text-black mb-0.5">
                  Project Name
                </label>
                <SearchableDropdown
                  value={filterData.projectName}
                  onChange={(value) => {
                    setFilterData({ ...filterData, projectName: value });
                  }}
                  options={[...new Set(siteData.map((s) => s.siteName || s.name || '').filter(Boolean))]}
                  placeholder="Select"
                  fieldName="Project Name"
                  showAddNew={false}
                  showAllOptions={true}
                  className="w-full h-[32px]"
                />
              </div>

              {/* Stocking Location */}
              <div className="relative" data-dropdown="stockingLocation">
                <label className="block text-[13px] font-medium text-black mb-0.5 mt-2">
                  Stocking Location
                </label>
                <SearchableDropdown
                  value={filterData.stockingLocation}
                  onChange={(value) => {
                    setFilterData({ ...filterData, stockingLocation: value });
                  }}
                  options={[...new Set(siteData.map((s) => s.siteName || s.name || '').filter(Boolean))]}
                  placeholder="Select"
                  fieldName="Stocking Location"
                  showAddNew={false}
                  showAllOptions={true}
                  className="w-full h-[32px]"
                />
              </div>

              {/* Date and Entry No */}
              <div className="grid grid-cols-2 gap-4" style={{ overflow: 'visible' }}>
                <div className="relative">
                  <label className="block text-[13px] font-medium text-black mb-0.5 mt-2">
                    Date
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(true)}
                    className="w-full h-[32px] px-4 text-[12px] font-medium py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-gray-400 bg-white flex items-center justify-between"
                  >
                    <span className={`${filterData.date ? 'text-black' : 'text-[#9E9E9E]'} truncate`}>
                      {filterData.date ? formatDDMMYYYYFromISO(filterData.date) : 'Select Date'}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 ml-2">
                      <path d="M3 4H13M3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4M3 4C3 3.44772 3.44772 3 4 3H12C12.5523 3 13 3.44772 13 4M6 2V5M10 2V5" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-black mb-0.5 mt-2">
                    Entry.No
                  </label>
                  <input
                    type="text"
                    placeholder="Enter"
                    value={filterData.entryNo}
                    onChange={(e) => setFilterData({ ...filterData, entryNo: e.target.value })}
                    className="w-full h-[32px] px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-gray-400 bg-white placeholder:text-[12px]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex gap-3 px-6 py-4">
              <button
                onClick={() => setShowFilterSheet(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900"
              >
                Save
              </button>
            </div>
          </div>
          </div>
        </>
      )}

      <SelectVendorModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(value) => {
          setFilterData({ ...filterData, category: value });
          setShowCategoryModal(false);
        }}
        selectedValue={filterData.category}
        options={categoryOptionsStrings}
        fieldName="Category"
        onAddNew={handleAddNewCategory}
      />

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        initialDate={formatDDMMYYYYFromISO(filterData.date)}
        onConfirm={(picked) => {
          setFilterData({ ...filterData, date: formatISOFromDDMMYYYY(picked) });
          setShowDatePicker(false);
        }}
      />
    </div>
  );
};

export default NonPOHistory;

