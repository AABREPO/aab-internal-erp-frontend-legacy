import React, { useState, useEffect, useRef } from 'react';
import Edit from '../Images/edit1.png';
import Delete from '../Images/delete.png';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';

const History = ({ onTabChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState([]);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [cloneExpandedItemId, setCloneExpandedItemId] = useState(null);
  const [swipeStates, setSwipeStates] = useState({});
  const expandedItemIdRef = useRef(expandedItemId);
  const cardRefs = useRef({});
  const [activeType, setActiveType] = useState('stack return'); // 'stack return' or 'dispatch'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterProjectName, setFilterProjectName] = useState('');
  const [filterProjectIncharge, setFilterProjectIncharge] = useState('');
  const [filterStockingLocation, setFilterStockingLocation] = useState('');
  const [filterSRNumber, setFilterSRNumber] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showInchargeDropdown, setShowInchargeDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Fetch client data
  useEffect(() => {
    const fetchClients = async () => {
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
        const formattedData = data.map(item => ({
          value: item.siteName,
          label: item.siteName,
          id: item.id,
          siteNo: item.siteNo,
          branch: item.branch,
          markedAsStockingLocation: item.markedAsStockingLocation || false,
        }));
        setClientData(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchClients();
  }, []);

  // Fetch employee data for Project Incharge
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll');
        if (response.ok) {
          const data = await response.json();
          const siteEngineers = data.filter(
            (emp) => emp.role_of_employee === 'Site Engineer'
          );
          setEmployeeData(siteEngineers);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch inventory history data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Fetch inventory data from getAll endpoint
        const response = await fetch('https://backendaab.in/aabuildersDash/api/inventory/getAll', {
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
        // Filter for outgoing type only
        const outgoingItems = inventoryData.filter(item =>
          item.inventory_type === 'outgoing' || item.inventoryType === 'outgoing'
        );
        // Format the outgoing items
        const formattedHistory = outgoingItems.map(item => {
          // Get the date from date column
          const itemDate = item.date || item.created_at || item.createdAt;
          const dateObj = new Date(itemDate);
          const year = dateObj.getFullYear();
          // Get entry number - use eno as primary source
          const entryNumber = item.eno || item.ENO || item.entry_number || item.entryNumber || item.entrynumber || item.id || '';
          // Determine transaction ID based on outgoing type
          let transactionId = '';
          const outgoingType = item.outgoing_type || item.outgoingType || '';
          if (outgoingType.toLowerCase() === 'stock return' || outgoingType.toLowerCase() === 'stockreturn') {
            transactionId = `SR - ${year} - ${entryNumber}`;
          } else if (outgoingType.toLowerCase() === 'dispatch') {
            transactionId = `DP - ${year} - ${entryNumber}`;
          } else {
            // Default fallback
            transactionId = `SR - ${year} - ${entryNumber}`;
          }
          // Get client name from client_id
          const clientId = item.client_id || item.clientId;
          let clientName = '';
          if (clientId && clientData.length > 0) {
            const client = clientData.find(c =>
              c.id === clientId ||
              c.client_id === clientId ||
              String(c.id) === String(clientId) ||
              String(c.client_id) === String(clientId)
            );
            clientName = client ? (client.label || client.value || '') : '';
          }
          // Calculate numberOfItems from inventoryItems count
          const inventoryItems = item.inventoryItems || item.inventory_items || [];
          const numberOfItems = Array.isArray(inventoryItems) ? inventoryItems.length : 0;
          // Calculate quantity as sum of inventoryItems qty
          const quantity = Array.isArray(inventoryItems)
            ? inventoryItems.reduce((sum, invItem) => {
              const qty = invItem.qty || invItem.quantity || invItem.Qty || invItem.Quantity || 0;
              return sum + (parseFloat(qty) || 0);
            }, 0)
            : (item.total_quantity || item.totalQuantity || item.quantity || 0);
          // Ensure originalItem includes inventoryItems explicitly
          const originalItemWithItems = {
            ...item,
            inventoryItems: inventoryItems.length > 0 ? inventoryItems : (item.inventoryItems || []),
            inventory_items: inventoryItems.length > 0 ? inventoryItems : (item.inventory_items || [])
          };
          return {
            id: item.id,
            transactionId: transactionId,
            customerName: clientName || item.project_name || item.projectName || item.project_incharge || item.projectIncharge || '',
            location: item.stocking_location || item.stockingLocation || '',
            date: itemDate,
            createdDateTime: item.created_date_time || item.createdDateTime || item.created_at,
            time: item.time || (itemDate ? new Date(itemDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''),
            numberOfItems: numberOfItems,
            quantity: quantity,
            price: item.total_price || item.totalPrice || item.price || 0,
            type: outgoingType.toLowerCase() === 'dispatch' ? 'DP' : 'SR',
            // Store original item data for editing with inventoryItems explicitly included
            originalItem: originalItemWithItems
          };
        });
        // Sort by created_date_time (latest entry first)
        formattedHistory.sort((a, b) => {
          const dateTimeA = a.createdDateTime || a.created_date_time || a.created_at || a.date;
          const dateTimeB = b.createdDateTime || b.created_date_time || b.created_at || b.date;
          const timeA = new Date(dateTimeA).getTime();
          const timeB = new Date(dateTimeB).getTime();
          return timeB - timeA; // Latest first (descending order)
        });
        setHistoryData(formattedHistory);
        setFilteredData(formattedHistory);
        console.log(formattedHistory);
      } catch (error) {
        console.error('Error fetching inventory history:', error);
        setHistoryData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [clientData]);

  // Filter data based on search query and active type
  useEffect(() => {
    let filtered = historyData;

    // Filter by active type (Stack Return or Dispatch)
    if (activeType === 'stack return') {
      filtered = filtered.filter(item => item.type === 'SR');
    } else if (activeType === 'dispatch') {
      filtered = filtered.filter(item => item.type === 'DP');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const customerLocation = `${item.customerName} - ${item.location}`.toLowerCase();
        const transactionId = item.transactionId.toLowerCase();
        return customerLocation.includes(query) || transactionId.includes(query);
      });
    }

    // Filter by Project Name
    if (filterProjectName.trim()) {
      filtered = filtered.filter(item => {
        const customerName = item.customerName || '';
        return customerName.toLowerCase() === filterProjectName.toLowerCase();
      });
    }

    // Filter by Project Incharge
    if (filterProjectIncharge.trim()) {
      filtered = filtered.filter(item => {
        const incharge = item.originalItem?.project_incharge || item.originalItem?.projectIncharge || '';
        return incharge.toLowerCase() === filterProjectIncharge.toLowerCase();
      });
    }

    // Filter by Stocking Location
    if (filterStockingLocation.trim()) {
      filtered = filtered.filter(item => {
        const location = item.location || '';
        return location.toLowerCase() === filterStockingLocation.toLowerCase();
      });
    }

    // Filter by SR Number
    if (filterSRNumber.trim()) {
      filtered = filtered.filter(item => {
        const srNumber = filterSRNumber.replace('#', '').trim();
        const transactionId = item.transactionId || '';
        // Extract number from transaction ID (e.g., "SR - 2026 - 2" -> "2")
        const match = transactionId.match(/- (\d+)$/);
        if (match) {
          return match[1] === srNumber;
        }
        return transactionId.includes(srNumber);
      });
    }

    // Filter by Date
    if (filterDate.trim()) {
      filtered = filtered.filter(item => {
        const itemDate = item.date || item.created_at || item.createdAt;
        if (!itemDate) return false;
        const dateObj = new Date(itemDate);
        const filterDateObj = new Date(filterDate);
        return dateObj.toDateString() === filterDateObj.toDateString();
      });
    }

    setFilteredData(filtered);
  }, [searchQuery, historyData, activeType, filterProjectName, filterProjectIncharge, filterStockingLocation, filterSRNumber, filterDate]);

  // Format date to show "Today" or actual date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return 'Today';
    } else {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  // Format time
  const formatTime = (dateString, timeString) => {
    if (timeString) return timeString;
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDDMMYYYYFromISO = (isoDate) => {
    if (!isoDate) return '';
    // Expecting YYYY-MM-DD (from previous <input type="date"> behavior)
    if (typeof isoDate === 'string' && isoDate.includes('-')) {
      const [year, month, day] = isoDate.split('-');
      if (year && month && day) return `${day}/${month}/${year}`;
    }
    return '';
  };

  const formatISOFromDDMMYYYY = (ddmmyyyy) => {
    if (!ddmmyyyy) return '';
    // Expecting DD/MM/YYYY (from DatePickerModal)
    if (typeof ddmmyyyy === 'string' && ddmmyyyy.includes('/')) {
      const [day, month, year] = ddmmyyyy.split('/');
      if (year && month && day) return `${year}-${month}-${day}`;
    }
    return '';
  };

  // Update ref when expandedItemId changes
  useEffect(() => {
    expandedItemIdRef.current = expandedItemId;
  }, [expandedItemId]);

  // Swipe handlers
  const minSwipeDistance = 50;

  const handleTouchStart = (e, itemId) => {
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    const wasCloneExpanded = cloneExpandedItemId === itemId;
    setSwipeStates(prev => ({
      ...prev,
      [itemId]: {
        startX: touch.clientX,
        currentX: touch.clientX,
        isSwiping: false,
        wasCloneExpanded: wasCloneExpanded
      }
    }));
  };

  const handleTouchMove = (e, itemId) => {
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    const state = swipeStates[itemId];
    if (!state) return;
    const deltaX = touch.clientX - state.startX;
    const isExpanded = expandedItemIdRef.current === itemId;
    const isCloneExpanded = cloneExpandedItemId === itemId;
    // Allow swiping left to reveal buttons, swiping right to reveal clone, or swiping to hide if already expanded
    if (deltaX < 0 || (deltaX > 0 && !isExpanded) || (isExpanded && deltaX > 0) || (isCloneExpanded && deltaX < 0)) {
      // preventDefault is handled by non-passive listener in useEffect
      setSwipeStates(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          currentX: touch.clientX,
          isSwiping: true,
          wasCloneExpanded: prev[itemId].wasCloneExpanded
        }
      }));
    }
  };

  const handleTouchEnd = (itemId) => {
    const state = swipeStates[itemId];
    if (!state) return;
    const deltaX = state.currentX - state.startX;
    const absDeltaX = Math.abs(deltaX);
    const wasCloneExpanded = state.wasCloneExpanded || false;
    if (absDeltaX >= minSwipeDistance) {
      if (deltaX < 0) {
        // Swiped left
        if (wasCloneExpanded) {
          // If clone was expanded, only close clone button - don't show edit/delete buttons
          setCloneExpandedItemId(null);
        } else {
          // If clone was NOT expanded, reveal edit/delete buttons on right
          setExpandedItemId(itemId);
          setCloneExpandedItemId(null);
        }
      } else {
        // Swiped right (reveal clone button on left)
        if (expandedItemIdRef.current === itemId) {
          // Hide right buttons if they were shown
          setExpandedItemId(null);
        } else {
          // Show clone button on left
          setCloneExpandedItemId(itemId);
        }
      }
    } else {
      // Small movement - snap back (no change needed, buttons stay as they are)
    }
    // Reset swipe state
    setSwipeStates(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  // Set up non-passive touch event listeners to allow preventDefault
  useEffect(() => {
    const cleanupFunctions = [];

    // Set up non-passive touchmove listeners for each card to handle preventDefault
    Object.keys(cardRefs.current).forEach(itemId => {
      const cardElement = cardRefs.current[itemId];
      if (!cardElement) return;

      const touchMoveHandler = (e) => {
        const state = swipeStates[itemId];
        if (!state) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - state.startX;
        const isExpanded = expandedItemIdRef.current === itemId;
        const isCloneExpanded = cloneExpandedItemId === itemId;
        // Prevent default scrolling when swiping horizontally
        if (deltaX < 0 || (deltaX > 0 && !isExpanded) || (isExpanded && deltaX > 0) || (isCloneExpanded && deltaX < 0)) {
          e.preventDefault();
        }
      };

      // Add non-passive touchmove listener
      cardElement.addEventListener('touchmove', touchMoveHandler, { passive: false });

      cleanupFunctions.push(() => {
        cardElement.removeEventListener('touchmove', touchMoveHandler);
      });
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [filteredData, swipeStates, cloneExpandedItemId]);

  // Global mouse handlers for desktop support
  useEffect(() => {
    if (filteredData.length === 0) return;

    const globalMouseMoveHandler = (e) => {
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };

        filteredData.forEach(item => {
          const state = prev[item.id];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          const isExpanded = expandedItemIdRef.current === item.id;
          const isCloneExpanded = cloneExpandedItemId === item.id;
          // Only update if dragging horizontally
          if (deltaX < 0 || (deltaX > 0 && !isExpanded) || (isExpanded && deltaX > 0) || (isCloneExpanded && deltaX < 0)) {
            newState[item.id] = {
              ...state,
              currentX: e.clientX,
              isSwiping: true,
              wasCloneExpanded: state.wasCloneExpanded
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

        filteredData.forEach(item => {
          const state = prev[item.id];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          const wasCloneExpanded = state.wasCloneExpanded || false;
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              // Swiped left
              if (wasCloneExpanded) {
                // If clone was expanded, only close clone button - don't show edit/delete buttons
                setCloneExpandedItemId(null);
              } else {
                // If clone was NOT expanded, reveal edit/delete buttons on right
                setExpandedItemId(item.id);
                setCloneExpandedItemId(null);
              }
            } else {
              // Swiped right (reveal clone button on left)
              if (expandedItemIdRef.current === item.id) {
                // Hide right buttons if they were shown
                setExpandedItemId(null);
              } else {
                // Show clone button on left
                setCloneExpandedItemId(item.id);
              }
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
  }, [filteredData]);

  // Handle view (for viewing when clicking transaction ID)
  const handleView = async (item) => {
    try {
      // Get the original inventory item data (should already have inventoryItems from originalItem)
      let inventoryData = item.originalItem || item;

      // Check if inventoryItems are present in the data
      const hasInventoryItems = inventoryData?.inventoryItems || inventoryData?.inventory_items;

      // If inventoryItems are missing, try to fetch them from the backend
      if (!hasInventoryItems || (Array.isArray(inventoryData?.inventoryItems) && inventoryData.inventoryItems.length === 0) ||
        (Array.isArray(inventoryData?.inventory_items) && inventoryData.inventory_items.length === 0)) {
        if (inventoryData?.id) {
          try {
            // Try to fetch the inventory record with items by ID
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/inventory/edit_with_history/${inventoryData.id}`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const detailedData = await response.json();
              // Merge the detailed data with inventoryItems
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
            // Continue with existing data even if fetch fails
          }
        }
      }

      // Ensure inventoryItems are explicitly set (use both field names for compatibility)
      if (inventoryData?.inventoryItems || inventoryData?.inventory_items) {
        const items = inventoryData.inventoryItems || inventoryData.inventory_items;
        inventoryData = {
          ...inventoryData,
          inventoryItems: items,
          inventory_items: items
        };
      }

      // Mark as view mode (not edit mode) - for showing Download button
      inventoryData.isEditMode = false;
      // Mark as view mode from History (for showing Download button instead of Stack Return/Dispatch)
      inventoryData.fromHistory = true;

      // Store inventory item data in localStorage to load in outgoing tab
      if (inventoryData) {
        localStorage.setItem('editingInventory', JSON.stringify(inventoryData));
      }
      // Dispatch custom event for outgoing component to listen
      window.dispatchEvent(new CustomEvent('editInventory', { detail: inventoryData }));
      // Navigate to outgoing tab for viewing
      if (onTabChange) {
        onTabChange('outgoing');
      }
      setExpandedItemId(null);
    } catch (error) {
      console.error('Error in handleView:', error);
      // Fallback: still try to pass the data even if there's an error
      const inventoryData = item.originalItem || item;
      inventoryData.isEditMode = false;
      inventoryData.fromHistory = true;
      localStorage.setItem('editingInventory', JSON.stringify(inventoryData));
      window.dispatchEvent(new CustomEvent('editInventory', { detail: inventoryData }));
      if (onTabChange) {
        onTabChange('outgoing');
      }
      setExpandedItemId(null);
    }
  };

  // Handle edit (for update)
  const handleEdit = async (item) => {
    try {
      // Get the original inventory item data (should already have inventoryItems from originalItem)
      let inventoryData = item.originalItem || item;

      // Check if inventoryItems are present in the data
      const hasInventoryItems = inventoryData?.inventoryItems || inventoryData?.inventory_items;

      // If inventoryItems are missing, try to fetch them from the backend
      if (!hasInventoryItems || (Array.isArray(inventoryData?.inventoryItems) && inventoryData.inventoryItems.length === 0) ||
        (Array.isArray(inventoryData?.inventory_items) && inventoryData.inventory_items.length === 0)) {
        if (inventoryData?.id) {
          try {
            // Try to fetch the inventory record with items by ID
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/inventory/edit_with_history/${inventoryData.id}`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const detailedData = await response.json();
              // Merge the detailed data with inventoryItems
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
            // Continue with existing data even if fetch fails
          }
        }
      }

      // Ensure inventoryItems are explicitly set (use both field names for compatibility)
      if (inventoryData?.inventoryItems || inventoryData?.inventory_items) {
        const items = inventoryData.inventoryItems || inventoryData.inventory_items;
        inventoryData = {
          ...inventoryData,
          inventoryItems: items,
          inventory_items: items
        };
      }

      // Mark as edit mode (update, not clone)
      inventoryData.isEditMode = true;
      // Mark as view mode from History (for showing Download button instead of Stack Return/Dispatch)
      inventoryData.fromHistory = true;

      // Store inventory item data in localStorage to load in outgoing tab
      if (inventoryData) {
        localStorage.setItem('editingInventory', JSON.stringify(inventoryData));
      }
      // Dispatch custom event for outgoing component to listen
      window.dispatchEvent(new CustomEvent('editInventory', { detail: inventoryData }));
      // Navigate to outgoing tab for editing
      if (onTabChange) {
        onTabChange('outgoing');
      }
      setExpandedItemId(null);
    } catch (error) {
      console.error('Error in handleEdit:', error);
      // Fallback: still try to pass the data even if there's an error
      const inventoryData = item.originalItem || item;
      inventoryData.isEditMode = true;
      inventoryData.fromHistory = true;
      localStorage.setItem('editingInventory', JSON.stringify(inventoryData));
      window.dispatchEvent(new CustomEvent('editInventory', { detail: inventoryData }));
      if (onTabChange) {
        onTabChange('outgoing');
      }
      setExpandedItemId(null);
    }
  };

  // Handle clone (for create new)
  const handleClone = async (item) => {
    try {
      // Get the original inventory item data (should already have inventoryItems from originalItem)
      let inventoryData = item.originalItem || item;

      // Check if inventoryItems are present in the data
      const hasInventoryItems = inventoryData?.inventoryItems || inventoryData?.inventory_items;

      // If inventoryItems are missing, try to fetch them from the backend
      if (!hasInventoryItems || (Array.isArray(inventoryData?.inventoryItems) && inventoryData.inventoryItems.length === 0) ||
        (Array.isArray(inventoryData?.inventory_items) && inventoryData.inventory_items.length === 0)) {
        if (inventoryData?.id) {
          try {
            // Try to fetch the inventory record with items by ID
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/inventory/edit_with_history/${inventoryData.id}`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const detailedData = await response.json();
              // Merge the detailed data with inventoryItems
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
            // Continue with existing data even if fetch fails
          }
        }
      }

      // Ensure inventoryItems are explicitly set (use both field names for compatibility)
      if (inventoryData?.inventoryItems || inventoryData?.inventory_items) {
        const items = inventoryData.inventoryItems || inventoryData.inventory_items;
        inventoryData = {
          ...inventoryData,
          inventoryItems: items,
          inventory_items: items
        };
      }

      // Mark as clone mode (create new, not update) - remove isEditMode or set to false
      inventoryData.isEditMode = false;
      // Remove ID to ensure it creates new record
      delete inventoryData.id;

      // Store inventory item data in localStorage to load in outgoing tab
      if (inventoryData) {
        localStorage.setItem('editingInventory', JSON.stringify(inventoryData));
      }
      // Dispatch custom event for outgoing component to listen
      window.dispatchEvent(new CustomEvent('editInventory', { detail: inventoryData }));
      // Navigate to outgoing tab for cloning
      if (onTabChange) {
        onTabChange('outgoing');
      }
      setCloneExpandedItemId(null);
    } catch (error) {
      console.error('Error in handleClone:', error);
      // Fallback: still try to pass the data even if there's an error
      const inventoryData = item.originalItem || item;
      inventoryData.isEditMode = false;
      delete inventoryData.id;
      localStorage.setItem('editingInventory', JSON.stringify(inventoryData));
      window.dispatchEvent(new CustomEvent('editInventory', { detail: inventoryData }));
      if (onTabChange) {
        onTabChange('outgoing');
      }
      setCloneExpandedItemId(null);
    }
  };

  // Handle delete
  const handleDelete = (itemId) => {
    console.log('Delete item:', itemId);
    // TODO: Implement delete functionality
    setExpandedItemId(null);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Date and Category Section */}
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between">
          <button className="text-[12px] font-medium text-black leading-normal">
            {getTodayDate()}
          </button>
          <button className="text-[12px] font-medium text-black leading-normal">
            Category
          </button>
        </div>
      </div>
      {/* Stack Return/Dispatch Toggle */}
      <div className="px-4 mt-2">
        <div className="flex items-center ga">
          {/* Stack Return/Dispatch Tabs */}
          <div className="flex bg-gray-100 items-center h-9 flex-1">
            <button
              type="button"
              onClick={() => setActiveType('stack return')}
              className={`flex-1 py-1 px-4 ml-1 h-8 rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${activeType === 'stack return'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              Stock Return
            </button>
            <button
              type="button"
              onClick={() => setActiveType('dispatch')}
              className={`flex-1 py-1 px-4 mr-1 h-8 rounded-lg text-[14px] font-medium transition-colors duration-1000 ease-out ${activeType === 'dispatch'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              Dispatch
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3">
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[40px] pl-10 pr-4 border border-[rgba(0,0,0,0.16)] rounded-full text-[12px] font-medium text-black bg-white focus:outline-none focus:border-[#BF9853]"
          />
        </div>
      </div>

      {/* Filter */}
      <div className="flex-shrink-0 px-4 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Top horizontal line */}
              <line x1="2" y1="5" x2="16" y2="5" stroke={(filterProjectName || filterProjectIncharge || filterStockingLocation || filterSRNumber || filterDate) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" />
              {/* Top vertical line intersecting center */}
              <line x1="9" y1="3" x2="9" y2="7" stroke={(filterProjectName || filterProjectIncharge || filterStockingLocation || filterSRNumber || filterDate) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" />
              {/* Top arrows pointing left and right */}
              <path d="M7 4L9 5L11 4" stroke={(filterProjectName || filterProjectIncharge || filterStockingLocation || filterSRNumber || filterDate) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M7 6L9 5L11 6" stroke={(filterProjectName || filterProjectIncharge || filterStockingLocation || filterSRNumber || filterDate) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Bottom horizontal line */}
              <line x1="2" y1="13" x2="16" y2="13" stroke={(filterProjectName || filterProjectIncharge || filterStockingLocation || filterSRNumber || filterDate) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" />
              {/* Bottom vertical line intersecting center */}
              <line x1="9" y1="11" x2="9" y2="15" stroke={(filterProjectName || filterProjectIncharge || filterStockingLocation || filterSRNumber || filterDate) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" />
              {/* Bottom arrows pointing left and right */}
              <path d="M7 12L9 13L11 12" stroke={(filterProjectName || filterProjectIncharge || filterStockingLocation || filterSRNumber || filterDate) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M7 14L9 13L11 14" stroke={(filterProjectName || filterProjectIncharge || filterStockingLocation || filterSRNumber || filterDate) ? "#9E9E9E" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            {!(filterProjectName || filterProjectIncharge || filterStockingLocation || filterSRNumber || filterDate) && (
              <span className="text-[12px] font-medium text-black">Filter</span>
            )}
          </button>
          {filterProjectName && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-[12px] font-medium text-black">Project Name</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterProjectName('');
                }}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
          {filterProjectIncharge && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-[12px] font-medium text-black">Project Incharge</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterProjectIncharge('');
                }}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
          {filterStockingLocation && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-[12px] font-medium text-black">Stocking Location</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterStockingLocation('');
                }}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
          {filterSRNumber && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-[12px] font-medium text-black">{activeType === 'dispatch' ? 'DP Number' : 'SR Number'}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterSRNumber('');
                }}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
          {filterDate && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-[12px] font-medium text-black">Date</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterDate('');
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
      </div>

      {/* History List */}
      <div className="flex overflow-y-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">Loading...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">No history found</p>
          </div>
        ) : (
          <div>
            {filteredData.map((item) => {
              // Get created_date_time and add 5.30 hours
              const createdDateTime = item.created_date_time || item.createdDateTime || item.created_at;
              let adjustedDate = null;
              if (createdDateTime) {
                adjustedDate = new Date(createdDateTime);
                // Add 5 hours and 30 minutes (5.30 hours = 5.5 hours = 19800000 milliseconds)
                adjustedDate.setTime(adjustedDate.getTime());
              }

              const displayDate = adjustedDate ? formatDate(adjustedDate.toISOString()) : formatDate(item.date);
              const displayTime = adjustedDate ? formatTime(adjustedDate.toISOString(), null) : formatTime(item.date, item.time);
              const customerLocation = `${item.customerName}`;

              const isExpanded = expandedItemId === item.id;
              const isCloneExpanded = cloneExpandedItemId === item.id;
              const swipeState = swipeStates[item.id];
              let swipeOffset = 0;
              if (swipeState && swipeState.isSwiping) {
                const deltaX = swipeState.currentX - swipeState.startX;
                if (deltaX < 0) {
                  swipeOffset = Math.max(-110, Math.min(0, deltaX));
                } else {
                  swipeOffset = Math.min(48, Math.max(0, deltaX));
                }
              } else if (isExpanded) {
                swipeOffset = -110;
              } else if (isCloneExpanded) {
                swipeOffset = 48;
              } else {
                swipeOffset = 0;
              }

              return (
                <div key={item.id} className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-gray-50 rounded-[8px] h-[100px]">
                  {/* Clone Button - Behind the card on the left, revealed on right swipe */}
                  <div
                    className="absolute left-0 top-0 flex gap-2 flex-shrink-0 z-0"
                    style={{
                      opacity: isCloneExpanded || (swipeState && swipeState.isSwiping && swipeOffset > 20) ? 1 : 0,
                      transition: 'opacity 0.2s ease-out',
                      pointerEvents: isCloneExpanded ? 'auto' : 'none'
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClone(item);
                      }}
                      className="action-button w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      title="Clone"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 6.75V3.75C12 3.33579 11.6642 3 11.25 3H3.75C3.33579 3 3 3.33579 3 3.75V11.25C3 11.6642 3.33579 12 3.75 12H6.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15 6.75H7.5C6.67157 6.75 6 7.42157 6 8.25V14.25C6 15.0784 6.67157 15.75 7.5 15.75H14.25C15.0784 15.75 15.75 15.0784 15.75 14.25V8.25C15.75 7.42157 15.0784 6.75 14.25 6.75H15Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  {/* History Card */}
                  <div
                    ref={(el) => {
                      if (el) {
                        cardRefs.current[item.id] = el;
                      } else {
                        delete cardRefs.current[item.id];
                      }
                    }}
                    className="flex-1 bg-white rounded-[8px] h-full px-3 py-3 transition-all duration-300 ease-out"
                    style={{
                      transform: `translateX(${swipeOffset}px)`,
                      touchAction: 'pan-y',
                      userSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                      WebkitUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                      MozUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                      msUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto'
                    }}
                    onTouchStart={(e) => handleTouchStart(e, item.id)}
                    onTouchMove={(e) => handleTouchMove(e, item.id)}
                    onTouchEnd={() => handleTouchEnd(item.id)}
                    onMouseDown={(e) => handleTouchStart(e, item.id)}
                  >
                    <div className="flex items-start justify-between">
                      {/* Left side: Transaction ID, Customer/Location Name, Date and Time */}
                      <div className="flex-1">
                        {/* Transaction ID */}
                        <div className="mb-1">
                          <p
                            className="text-[14px] font-semibold text-black leading-normal cursor-pointer hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isExpanded && !isCloneExpanded) {
                                // Navigate to outgoing page (view mode from History)
                                handleView(item);
                              }
                            }}
                          >
                            {item.transactionId}
                          </p>
                        </div>

                        {/* Customer/Location Name */}
                        <div className="mb-1">
                          <p className="text-[12px] font-medium text-black leading-normal">
                            {customerLocation}
                          </p>
                        </div>

                        {/* Date and Time */}
                        <div>
                          <p className="text-[12px] font-medium text-[#616161] leading-normal">
                            {displayDate} • {displayTime}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Number of Items, Quantity, and Price */}
                      <div className="flex flex-col items-end text-right flex-shrink-0 ml-4">
                        <p className="text-[11px] font-medium text-[#616161] leading-normal mb-1">
                          No. of Items - {item.numberOfItems}
                        </p>
                        <p className="text-[12px] font-semibold text-[#BF9853] leading-normal mb-1">
                          Quantity - {Math.abs(item.quantity)}
                        </p>
                        <p className="text-[14px] font-semibold text-black leading-normal">
                          {formatPrice(item.price)}
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
                        handleEdit(item);
                      }}
                      className="action-button w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 hover:bg-[#22a882] transition-colors shadow-sm"
                      title="Edit"
                    >
                      <img src={Edit} alt="Edit" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
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

      {/* Filter Modal */}
      {showFilterModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFilterModal(false);
              setShowProjectDropdown(false);
              setShowInchargeDropdown(false);
              setShowLocationDropdown(false);
            }
          }}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[360px] h-[400px] rounded-t-3xl shadow-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-4 mb-3">
              <h2 className="text-[16px] font-semibold text-black">Select Filters</h2>
              <button
                type="button"
                onClick={() => {
                  setShowFilterModal(false);
                  setShowProjectDropdown(false);
                  setShowInchargeDropdown(false);
                  setShowLocationDropdown(false);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 overflow-visible">
              {/* Project Name */}
              <div className="space-y-[6px]">
                <div className="relative">
                  <label className="block text-[13px] font-medium text-black mb-0.5">Project Name</label>
                  <SearchableDropdown
                    value={filterProjectName}
                    onChange={(value) => {
                      setFilterProjectName(value);
                      setShowProjectDropdown(false);
                      setShowInchargeDropdown(false);
                      setShowLocationDropdown(false);
                    }}
                    options={[...new Set(clientData.map((c) => c.value || c.label || c.siteName || '').filter(Boolean))]}
                    placeholder="Select"
                    fieldName="Project Name"
                    showAddNew={false}
                    showAllOptions={true}
                    className="w-full h-[32px]"
                  />
                </div>
                {/* Project Incharge */}
                <div className="relative">
                  <label className="block text-[13px] font-medium text-black mb-0.5">Project Incharge</label>
                  <SearchableDropdown
                    value={filterProjectIncharge}
                    onChange={(value) => {
                      setFilterProjectIncharge(value);
                      setShowProjectDropdown(false);
                      setShowInchargeDropdown(false);
                      setShowLocationDropdown(false);
                    }}
                    options={[...new Set(employeeData.map((e) => e.employeeName || e.name || e.fullName || e.employee_name || '').filter(Boolean))]}
                    placeholder="Select"
                    fieldName="Project Incharge"
                    showAddNew={false}
                    showAllOptions={true}
                    className="w-full h-[32px]"
                  />
                </div>
                {/* Stocking Location */}

                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-black mb-0.5">Stocking Location</label>
                  <SearchableDropdown
                    value={filterStockingLocation}
                    onChange={(value) => {
                      setFilterStockingLocation(value);
                      setShowProjectDropdown(false);
                      setShowInchargeDropdown(false);
                      setShowLocationDropdown(false);
                    }}
                    options={[...new Set(clientData.filter((c) => c.markedAsStockingLocation === true).map((c) => c.value || c.label || c.siteName || '').filter(Boolean))]}
                    placeholder="Select"
                    fieldName="Stocking Location"
                    showAddNew={false}
                    showAllOptions={true}
                    className="w-full h-[32px]"
                  />
                </div>


                <div className=" flex items-center gap-2 ">
                  {/* Date */}
                  <div className="flex-1">
                    <label className="block text-[13px] font-medium text-black mb-0.5">Date</label>
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(true)}
                      className="w-full h-[32px] px-3 border border-gray-300 rounded-lg text-[14px] bg-white focus:outline-none focus:border-gray-400 flex items-center justify-between"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                      <span className={`${filterDate ? 'text-black' : 'text-[#9E9E9E]'} truncate`}>
                        {filterDate ? formatDDMMYYYYFromISO(filterDate) : 'Select Date'}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 ml-2">
                        <path d="M3 4H13M3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4M3 4C3 3.44772 3.44772 3 4 3H12C12.5523 3 13 3.44772 13 4M6 2V5M10 2V5" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  {/* Entry Number */}
                  <div className="flex-1">
                    <label className="block text-[13px] font-medium text-black mb-0.5">Entry Number</label>
                    <input
                      type="text"
                      placeholder="Enter"
                      value={filterSRNumber}
                      onChange={(e) => setFilterSRNumber(e.target.value)}
                      className="w-full h-[32px] px-3 border border-gray-300 rounded-lg text-[12px] bg-white focus:outline-none focus:border-gray-400"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    />
                  </div>
                </div>
              </div>
              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-10">
                <button
                  type="button"
                  onClick={() => {
                    setFilterProjectName('');
                    setFilterProjectIncharge('');
                    setFilterStockingLocation('');
                    setFilterSRNumber('');
                    setFilterDate('');
                    setShowFilterModal(false);
                    setShowProjectDropdown(false);
                    setShowInchargeDropdown(false);
                    setShowLocationDropdown(false);
                  }}
                  className="px-6 py-2 w-[175px] h-[40px] border border-black rounded-lg text-[14px] font-medium text-black bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFilterModal(false);
                    setShowProjectDropdown(false);
                    setShowInchargeDropdown(false);
                    setShowLocationDropdown(false);
                  }}
                  className="px-6 py-2 w-[175px] h-[40px] bg-black text-white rounded-lg text-[14px] font-medium hover:bg-gray-800"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        initialDate={formatDDMMYYYYFromISO(filterDate)}
        onConfirm={(picked) => {
          setFilterDate(formatISOFromDDMMYYYY(picked));
          setShowDatePicker(false);
        }}
      />
    </div>
  );
};

export default History;

