import React, { useState, useEffect, useRef } from 'react';
import DeleteConfirmModal from './DeleteConfirmModal';
import SearchableDropdown from './SearchableDropdown';
import DateRangePickerModal from './DateRangePickerModal';
import SelectVendorModal from './SelectVendorModal';
import Edit from '../Images/edit1.png'
import Delete from '../Images/delete.png'
const History = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [poToDelete, setPoToDelete] = useState(null);
  const [expandedPoId, setExpandedPoId] = useState(null);
  const [isFirstCardClosed, setIsFirstCardClosed] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [filters, setFilters] = useState({
    vendorName: '',
    clientName: '',
    siteIncharge: '',
    startDate: '',
    endDate: '',
    poNumber: '',
    branch: ''
  });

  // Swipe detection state - track per card
  const [swipeStates, setSwipeStates] = useState({});
  
  // Refs to store element references for non-passive event listeners
  const cardRefs = useRef({});
  
  // Refs to track current state values for event handlers
  const expandedPoIdRef = useRef(expandedPoId);
  const isFirstCardClosedRef = useRef(isFirstCardClosed);
  
  // Keep refs in sync with state
  useEffect(() => {
    expandedPoIdRef.current = expandedPoId;
  }, [expandedPoId]);
  
  useEffect(() => {
    isFirstCardClosedRef.current = isFirstCardClosed;
  }, [isFirstCardClosed]);

  // State for all available options from APIs
  const [allVendors, setAllVendors] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [allSupportStaff, setAllSupportStaff] = useState([]);

  // Fetch all vendors, projects, employees, and support staff from APIs
  useEffect(() => {
    fetchAllVendors();
    fetchAllProjects();
    fetchAllEmployees();
    fetchAllSupportStaff();
  }, []);

  // Clear clientName if it doesn't belong to the selected branch
  useEffect(() => {
    if (filters.branch && filters.clientName) {
      const selectedProject = allProjects.find(
        p => (p.siteName === filters.clientName || p.projectName === filters.clientName) && p.branch === filters.branch
      );
      if (!selectedProject) {
        setFilters(prev => ({ ...prev, clientName: '' }));
      }
    }
  }, [filters.branch, filters.clientName, allProjects]);

  const fetchAllVendors = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        setAllVendors(data); // Store full objects instead of just names
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchAllProjects = async () => {
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
        setAllProjects(data); // Store full objects instead of just names
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll');
      if (response.ok) {
        const data = await response.json();
        setAllEmployees(data); // Store full objects instead of just names
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAllSupportStaff = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/support_staff/getAll');
      if (response.ok) {
        const data = await response.json();
        setAllSupportStaff(data);
      }
    } catch (error) {
      console.error('Error fetching support staff:', error);
    }
  };

  // Load purchase orders from API
  const loadPurchaseOrders = async () => {
    try {
      // Check if any filters are active
      const hasActiveFilters = searchQuery || filters.vendorName || filters.clientName || filters.siteIncharge || filters.startDate || filters.endDate || filters.poNumber || filters.branch;
      
      // Use /get/latest for faster initial load (last 250 records)
      // Use /getAll only when filters are applied
      const apiUrl = hasActiveFilters 
        ? 'https://backendaab.in/aabuildersDash/api/purchase_orders/getAll'
        : 'https://backendaab.in/aabuildersDash/api/purchase_orders/get/latest';
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch purchase orders');
      }
      const data = await response.json();
      console.log(data);

      // Filter out deleted POs and transform API data to match expected format
      const transformedPOs = data
        .filter((po) => {
          // Filter out POs with delete_status: true (backend uses delete_status field)
          return !(po.delete_status === true || po.deleteStatus === true);
        })
        .map((po) => {
        // Fetch vendor name if we have vendor_id
        let vendorName = '';
        if (po.vendor_id) {
          const vendorMatch = allVendors.find(v => v.id === po.vendor_id);
          vendorName = vendorMatch?.vendorName || '';
        }

        // Fetch project/site name if we have client_id
        let projectName = '';
        let projectBranch = '';
        if (po.client_id) {
          const projectMatch = allProjects.find(p => p.id === po.client_id);
          projectName = projectMatch?.siteName || projectMatch?.projectName || '';
          projectBranch = projectMatch?.branch || '';
        }

        // Fetch site incharge name if we have site_incharge_id - check both employees and support staff
        let projectIncharge = '';
        if (po.site_incharge_id) {
          const inchargeType = po.site_incharge_type || po.siteInchargeType;
          if (inchargeType === 'support staff' || inchargeType === 'support_staff') {
            const supportStaffMatch = allSupportStaff.find(s => s.id === po.site_incharge_id);
            projectIncharge = supportStaffMatch?.support_staff_name || supportStaffMatch?.supportStaffName || '';
          } else {
            const inchargeMatch = allEmployees.find(e => e.id === po.site_incharge_id);
            projectIncharge = inchargeMatch?.employeeName || inchargeMatch?.name || inchargeMatch?.fullName || inchargeMatch?.employee_name || '';
          }
        }

        // Transform purchaseTable to items format
        const items = (po.purchaseTable || []).map(item => ({
          name: item.itemName || `${item.item_id || ''}`,
          brand: item.brandName || '',
          model: item.modelName || '',
          type: item.typeName || '',
          quantity: item.quantity || 0,
          price: item.price || (item.amount / (item.quantity || 1)) || 0,
          amount: item.amount || 0,
          itemId: item.item_id,
          categoryId: item.category_id,
          modelId: item.model_id,
          brandId: item.brand_id,
          typeId: item.type_id,
        }));

        // Extract year from date (format: DD/MM/YYYY)
        const getYearFromDate = (dateStr) => {
          if (!dateStr) return new Date().getFullYear();
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            return parts[2] || new Date().getFullYear();
          }
          try {
            const date = new Date(dateStr);
            return date.getFullYear();
          } catch {
            return new Date().getFullYear();
          }
        };
        const year = getYearFromDate(po.date);

        // Determine payment status from payment_complete_status field
        let paymentStatus = 'Unpaid';
        if (po.payment_complete_status !== undefined) {
          paymentStatus = po.payment_complete_status === true ? 'Paid' : 'Unpaid';
        } else if (po.paymentCompleteStatus !== undefined) {
          paymentStatus = po.paymentCompleteStatus === true ? 'Paid' : 'Unpaid';
        } else if (po.paymentStatus) {
          // Fallback to existing paymentStatus field if available
          paymentStatus = po.paymentStatus;
        }

        return {
          id: po.id || po._id,
          poNumber: po.eno ? `PO - ${year} - ${po.eno}` : po.poNumber || '',
          eno: po.eno || null, // Preserve eno for edit screen
          date: po.date || '',
          vendorName: vendorName || po.vendorName || '',
          projectName: projectName || po.projectName || '',
          projectBranch: projectBranch || po.branch || '',
          projectIncharge: projectIncharge || po.site_incharge_name || '',
          contact: po.site_incharge_mobile_number || po.contact || '',
          created_by: po.created_by || '',
          items: items,
          paymentStatus: paymentStatus,
          createdAt: po.createdAt || po.created_at || po.created_date_time || po.date || new Date().toISOString(),
          created_date_time: po.created_date_time || po.createdAt || po.created_at || null,
          // Preserve raw IDs so edit screen can send them back when unchanged
          vendor_id: po.vendor_id,
          client_id: po.client_id,
          site_incharge_id: po.site_incharge_id,
          site_incharge_mobile_number: po.site_incharge_mobile_number,
          site_incharge_type: po.site_incharge_type || po.siteInchargeType || null,
        };
      });
      // Sort by ID (highest ID first - most recently entered)
      const sorted = transformedPOs.sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idB - idA; // Descending order (highest ID first)
      });
      setPurchaseOrders(sorted);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      // Fallback to localStorage if API fails
      try {
        const savedPOs = localStorage.getItem('purchaseOrders');
        if (savedPOs) {
          const parsed = JSON.parse(savedPOs);
          const sorted = parsed.sort((a, b) => {
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idB - idA; // Descending order (highest ID first)
          });
          setPurchaseOrders(sorted);
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
    // Also listen for custom event when PO is updated
    const handlePOUpdate = () => {
      loadPurchaseOrders();
    };
    window.addEventListener('poUpdated', handlePOUpdate);
    // Check if filters are active
    const hasActiveFilters = searchQuery || filters.vendorName || filters.clientName || filters.siteIncharge || filters.startDate || filters.endDate || filters.poNumber || filters.branch;
    // Poll for changes periodically (only when no filters are active to avoid heavy load)
    const interval = hasActiveFilters ? null : setInterval(() => {
      loadPurchaseOrders();
    }, 5000); // Poll every 5 seconds
    return () => {
      window.removeEventListener('poUpdated', handlePOUpdate);
      if (interval) {
        clearInterval(interval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allVendors.length, allProjects.length, allEmployees.length, searchQuery, filters]);
  const handleEdit = (po) => {
    // Store PO data in localStorage to load in create tab
    localStorage.setItem('editingPO', JSON.stringify(po));
    // Switch to create tab (this will be handled by parent component)
    // For now, just store the data - parent component can check for it
    window.dispatchEvent(new CustomEvent('editPO', { detail: po }));
  };
  const handleDelete = (poId) => {
    setPoToDelete(poId);
    setShowDeleteConfirm(true);
  };
  const confirmDelete = async () => {
    if (poToDelete) {
      try {
        // Find the PO to get its order ID
        const order = purchaseOrders.find(po => po.id === poToDelete);
        if (order) {
          // Call API to mark PO as deleted - matching working example format
          const apiUrl = `https://backendaab.in/aabuildersDash/api/purchase_orders/markDeleted/${order.id}?deleteStatus=true`;
          const response = await fetch(apiUrl, {
            method: 'PUT',
          });
          if (response.ok) {
            const responseData = await response.json();
            // Wait a moment for database to update, then reload
            setTimeout(() => {
              loadPurchaseOrders();
            }, 1000);
            window.location.reload();
          } else {
            const errorText = await response.text();
            console.error('API Error - Status:', response.status);
            console.error('API Error - Response:', errorText);
            alert(`Failed to delete purchase order. Status: ${response.status}`);
          }
        } else {
          console.error('Order not found with ID:', poToDelete);
          alert('Purchase order not found.');
        }
      } catch (error) {
        console.error('Error deleting purchase order:', error);
        alert('An error occurred while deleting the purchase order. Please try again.');
      } finally {
        setShowDeleteConfirm(false);
        setPoToDelete(null);
        setExpandedPoId(null);
      }
    }
  };
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPoToDelete(null);
  };
  const handleClear = () => {
    setSearchQuery('');
    setFilters({
      vendorName: '',
      clientName: '',
      siteIncharge: '',
      startDate: '',
      endDate: '',
      poNumber: '',
      branch: ''
    });
  };
  const filteredPOs = purchaseOrders.filter(po => {
    // Search query filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      // Helper function to parse date from various formats
      const parseDate = (dateStr) => {
        if (!dateStr) return null;
        // Try DD/MM/YYYY format first
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
              return new Date(year, month, day);
            }
          }
        }
        // Try standard date parsing
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date;
        }
        return null;
      };
      
      // Helper function to check if date matches
      const dateMatches = (poDate, targetDate) => {
        if (!poDate || !targetDate) return false;
        const po = new Date(poDate);
        const target = new Date(targetDate);
        po.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        return po.getTime() === target.getTime();
      };
      
      // Check for "today" keyword
      if (query === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const poDate = parseDate(po.date || po.createdAt);
        if (!poDate || !dateMatches(poDate, today)) {
          return false;
        }
      }
      // Check for "yesterday" keyword
      else if (query === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const poDate = parseDate(po.date || po.createdAt);
        if (!poDate || !dateMatches(poDate, yesterday)) {
          return false;
        }
      }
      // Check for "paid" keyword
      else if (query === 'paid') {
        if (po.paymentStatus?.toLowerCase() !== 'paid') {
          return false;
        }
      }
      // Check for "unpaid" keyword
      else if (query === 'unpaid') {
        if (po.paymentStatus?.toLowerCase() !== 'unpaid') {
          return false;
        }
      }
      // General search across multiple fields
      else {
        // First check if query matches date (try parsing as date)
        const parsedDate = parseDate(query);
        let dateMatchFound = false;
        if (parsedDate) {
          const poDate = parseDate(po.date || po.createdAt);
          if (poDate) {
            const poDateObj = new Date(poDate);
            const targetDateObj = new Date(parsedDate);
            poDateObj.setHours(0, 0, 0, 0);
            targetDateObj.setHours(0, 0, 0, 0);
            dateMatchFound = poDateObj.getTime() === targetDateObj.getTime();
          }
        }
        
        // Check all searchable fields
        const matchesSearch = (
          dateMatchFound ||
          po.poNumber?.toLowerCase().includes(query) ||
          po.vendorName?.toLowerCase().includes(query) ||
          po.projectName?.toLowerCase().includes(query) ||
          po.date?.toLowerCase().includes(query) ||
          po.projectBranch?.toLowerCase().includes(query) ||
          po.projectIncharge?.toLowerCase().includes(query) ||
          po.contact?.toLowerCase().includes(query) ||
          po.created_by?.toLowerCase().includes(query) ||
          po.paymentStatus?.toLowerCase().includes(query) ||
          (po.eno && String(po.eno).includes(query))
        );
        if (!matchesSearch) return false;
      }
    }
    // Filter by vendor name
    if (filters.vendorName && po.vendorName?.toLowerCase() !== filters.vendorName.toLowerCase()) {
      return false;
    }
    // Filter by client name (project name)
    if (filters.clientName && po.projectName?.toLowerCase() !== filters.clientName.toLowerCase()) {
      return false;
    }
    // Filter by site incharge (project incharge)
    if (filters.siteIncharge && po.projectIncharge?.toLowerCase() !== filters.siteIncharge.toLowerCase()) {
      return false;
    }
    // Filter by date range
    if (filters.startDate || filters.endDate) {
      const poDate = new Date(po.createdAt || po.date || 0);
      poDate.setHours(0, 0, 0, 0); // Reset time to compare dates only
      if (filters.startDate && filters.endDate) {
        // Both start and end dates selected - check if PO date is within range
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(filters.endDate);
        endDate.setHours(0, 0, 0, 0);
        if (poDate < startDate || poDate > endDate) {
          return false;
        }
      } else if (filters.startDate) {
        // Only start date selected - check if PO date is on or after start date
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (poDate < startDate) {
          return false;
        }
      } else if (filters.endDate) {
        // Only end date selected - check if PO date is on or before end date
        const endDate = new Date(filters.endDate);
        endDate.setHours(0, 0, 0, 0);
        if (poDate > endDate) {
          return false;
        }
      }
    }
    // Filter by PO number
    if (filters.poNumber && po.poNumber?.toLowerCase().includes(filters.poNumber.toLowerCase()) === false) {
      return false;
    }
    // Filter by branch
    if (filters.branch && po.projectBranch?.toLowerCase() !== filters.branch.toLowerCase()) {
      return false;
    }
    return true;
  });
  // Reset first card to expanded state on mount and when filtered list changes
  useEffect(() => {
    setIsFirstCardClosed(true);
  }, [filteredPOs.length]);
  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;
  const handleTouchStart = (e, poId) => {
    const touch = e.touches[0];
    setSwipeStates(prev => ({
      ...prev,
      [poId]: {
        startX: touch.clientX,
        currentX: touch.clientX,
        isSwiping: false
      }
    }));
  };
  const handleTouchMove = (e, poId) => {
    const touch = e.touches[0];
    const state = swipeStates[poId];
    if (!state) return;
    const deltaX = touch.clientX - state.startX;
    const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === poId;
    const isExpanded = isFirstCard ? (!isFirstCardClosed || expandedPoId === poId) : expandedPoId === poId;
    // Allow swiping left to reveal buttons, or swiping right to hide buttons if already expanded
    if (deltaX < 0 || (isExpanded && deltaX > 0)) {
      e.preventDefault();
      setSwipeStates(prev => ({
        ...prev,
        [poId]: {
          ...prev[poId],
          currentX: touch.clientX,
          isSwiping: true
        }
      }));
    }
  };
  const handleTouchEnd = (poId) => {
    const state = swipeStates[poId];
    if (!state) return;
    const deltaX = state.currentX - state.startX;
    const absDeltaX = Math.abs(deltaX);
    const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === poId;
    if (absDeltaX >= minSwipeDistance) {
      if (deltaX < 0) {
        // Swiped left (reveal buttons)
        if (isFirstCard) {
          setIsFirstCardClosed(false);
        }
        setExpandedPoId(poId);
      } else {
        // Swiped right (hide buttons)
        if (isFirstCard) {
          setIsFirstCardClosed(true);
        }
        setExpandedPoId(null);
      }
    } else {
      // Small movement - snap back
      if (expandedPoId === poId) {
        if (isFirstCard) {
          setIsFirstCardClosed(true);
        }
        setExpandedPoId(null);
      }
    }
    // Reset swipe state
    setSwipeStates(prev => {
      const newState = { ...prev };
      delete newState[poId];
      return newState;
    });
  };
  // Set up non-passive event listeners using refs
  useEffect(() => {
    const cleanupFunctions = [];
    // Global mouse event handlers for desktop support
    const globalMouseMoveHandler = (e) => {
      // Check all cards to see if any are being dragged
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };
        filteredPOs.forEach(po => {
          const state = prev[po.id];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === po.id;
          // Use refs to get current values
          const currentIsFirstCardClosed = isFirstCardClosedRef.current;
          const currentExpandedPoId = expandedPoIdRef.current;
          // Check if card is expanded
          const isExpanded = isFirstCard 
            ? (!currentIsFirstCardClosed || currentExpandedPoId === po.id) 
            : currentExpandedPoId === po.id;
          // Only update if dragging horizontally
          if (deltaX < 0 || (isExpanded && deltaX > 0)) {
            newState[po.id] = {
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
        filteredPOs.forEach(po => {
          const state = prev[po.id];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === po.id;
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              // Swiped left (reveal buttons)
              if (isFirstCard) {
                setIsFirstCardClosed(false);
              }
              setExpandedPoId(po.id);
            } else {
              // Swiped right (hide buttons)
              if (isFirstCard) {
                setIsFirstCardClosed(true);
              }
              setExpandedPoId(null);
            }
          } else {
            // Small movement - snap back
            const currentExpandedPoId = expandedPoIdRef.current;
            if (currentExpandedPoId === po.id) {
              if (isFirstCard) {
                setIsFirstCardClosed(true);
              }
              setExpandedPoId(null);
            }
          }
          // Remove swipe state for this card
          delete newState[po.id];
          hasChanges = true;
        });
        return hasChanges ? newState : prev;
      });
    };
    // Add global mouse event listeners
    document.addEventListener('mousemove', globalMouseMoveHandler);
    document.addEventListener('mouseup', globalMouseUpHandler);
    cleanupFunctions.push(() => {
      document.removeEventListener('mousemove', globalMouseMoveHandler);
      document.removeEventListener('mouseup', globalMouseUpHandler);
    });
    filteredPOs.forEach(po => {
      const element = cardRefs.current[po.id];
      if (!element) return;
      const touchStartHandler = (e) => {
        const touch = e.touches[0];
        setSwipeStates(prev => ({
          ...prev,
          [po.id]: {
            startX: touch.clientX,
            currentX: touch.clientX,
            isSwiping: false
          }
        }));
      };
      const touchMoveHandler = (e) => {
        const touch = e.touches[0];
        setSwipeStates(prev => {
          const state = prev[po.id];
          if (!state) return prev;
          const deltaX = touch.clientX - state.startX;
          const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === po.id;
          // Use refs to get current values
          const currentIsFirstCardClosed = isFirstCardClosedRef.current;
          const currentExpandedPoId = expandedPoIdRef.current;
          // Check if card is expanded
          const isExpanded = isFirstCard 
            ? (!currentIsFirstCardClosed || currentExpandedPoId === po.id) 
            : currentExpandedPoId === po.id;
          // Only prevent default and update if swiping horizontally
          if (deltaX < 0 || (isExpanded && deltaX > 0)) {
            e.preventDefault();
            return {
              ...prev,
              [po.id]: {
                ...prev[po.id],
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
          const state = prev[po.id];
          if (!state) return prev;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === po.id;
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              // Swiped left (reveal buttons)
              if (isFirstCard) {
                setIsFirstCardClosed(false);
              }
              setExpandedPoId(po.id);
            } else {
              // Swiped right (hide buttons)
              if (isFirstCard) {
                setIsFirstCardClosed(true);
              }
              setExpandedPoId(null);
            }
          } else {
            // Small movement - snap back
            const currentExpandedPoId = expandedPoIdRef.current;
            if (currentExpandedPoId === po.id) {
              if (isFirstCard) {
                setIsFirstCardClosed(true);
              }
              setExpandedPoId(null);
            }
          }
          // Reset swipe state
          const newState = { ...prev };
          delete newState[po.id];
          return newState;
        });
      };
      // Mouse event handlers for desktop support
      const mouseDownHandler = (e) => {
        setSwipeStates(prev => ({
          ...prev,
          [po.id]: {
            startX: e.clientX,
            currentX: e.clientX,
            isSwiping: false
          }
        }));
      };
      // Add non-passive event listeners for touch
      element.addEventListener('touchstart', touchStartHandler, { passive: false });
      element.addEventListener('touchmove', touchMoveHandler, { passive: false });
      element.addEventListener('touchend', touchEndHandler, { passive: false });
      // Add mouse event listeners for desktop support
      element.addEventListener('mousedown', mouseDownHandler);
      cleanupFunctions.push(() => {
        element.removeEventListener('touchstart', touchStartHandler);
        element.removeEventListener('touchmove', touchMoveHandler);
        element.removeEventListener('touchend', touchEndHandler);
        element.removeEventListener('mousedown', mouseDownHandler);
      });
    });
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [filteredPOs, minSwipeDistance]);
  // Format date/time for display: "Today • 09:42 AM", "Yesterday • 11:11 AM", or "DD/MM/YYYY • HH:MM AM/PM"
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      // Format time
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;
      // Check if today, yesterday, or older
      if (dateOnly.getTime() === today.getTime()) {
        return `Today • ${timeStr}`;
      } else if (dateOnly.getTime() === yesterday.getTime()) {
        return `Yesterday • ${timeStr}`;
      } else {
        // Format date as DD/MM/YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year} • ${timeStr}`;
      }
    } catch (error) {
      console.error('Error formatting date/time:', error);
      return '';
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('/')) return dateString;
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };
  const handleDateConfirm = (startDate, endDate) => {
    setFilters({
      ...filters,
      startDate: startDate || '',
      endDate: endDate || ''
    });
    setShowDatePicker(false);
  };
  const hasActiveFilters = searchQuery || filters.vendorName || filters.clientName || filters.siteIncharge || filters.startDate || filters.endDate || filters.poNumber || filters.branch;
  // Use all available options from APIs for filter dropdowns
  const uniqueVendors = [...new Set(allVendors.map(v => v.vendorName).filter(Boolean))].sort();
  // Extract unique branches from projects
  const uniqueBranches = [...new Set(allProjects.map(p => p.branch).filter(Boolean))].sort();
  // Filter projects by selected branch
  const filteredProjects = filters.branch 
    ? allProjects.filter(p => p.branch === filters.branch)
    : allProjects;
  const uniqueClients = [...new Set(filteredProjects.map(p => p.siteName || p.projectName).filter(Boolean))].sort();
  const uniqueSiteIncharges = [...new Set([
    ...allEmployees.map(e =>
      e.employeeName || e.name || e.fullName || e.employee_name || ''
    ),
    ...allSupportStaff.map(s =>
      s.support_staff_name || s.supportStaffName || ''
    )
  ].filter(Boolean))].sort();
  return (
    <div className="relative w-full h-screen bg-white max-w-[360px] mx-auto flex flex-col overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 bg-white px-4 pt-4 z-30">
        {/* Search Bar */}
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[328px] h-[43px] pl-10 pr-4 border border-[#E0E0E0] rounded-3xl text-[14px] font-medium text-black placeholder:text-[#9E9E9E] focus:outline-none"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 15L11 11" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {/* Filter and Clear Buttons with Filter Tags */}
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-2  min-w-0">
            <button onClick={() => setShowFilterModal(true)} className="flex items-center gap-2 px-0 flex-shrink-0" >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Top horizontal line */}
                <line x1="2" y1="5" x2="16" y2="5" stroke={hasActiveFilters ? "#26bf94" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" />
                {/* Top vertical line intersecting center */}
                <line x1="9" y1="3" x2="9" y2="7" stroke={hasActiveFilters ? "#26bf94" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" />
                {/* Top arrows pointing left and right */}
                <path d="M7 4L9 5L11 4" stroke={hasActiveFilters ? "#26bf94" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M7 6L9 5L11 6" stroke={hasActiveFilters ? "#26bf94" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                {/* Bottom horizontal line */}
                <line x1="2" y1="13" x2="16" y2="13" stroke={hasActiveFilters ? "#26bf94" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" />
                {/* Bottom vertical line intersecting center */}
                <line x1="9" y1="11" x2="9" y2="15" stroke={hasActiveFilters ? "#26bf94" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" />
                {/* Bottom arrows pointing left and right */}
                <path d="M7 12L9 13L11 12" stroke={hasActiveFilters ? "#26bf94" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M7 14L9 13L11 14" stroke={hasActiveFilters ? "#26bf94" : "#9E9E9E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              {!hasActiveFilters && (
                <span className="text-[14px] font-medium flex-shrink-0 text-[#9E9E9E]">
                  Filter
                </span>
              )}
            </button>

            {/* Active Filter Tags - Next to Filter button */}
            <div className="flex items-center gap-2 overflow-x-auto  min-w-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Show "Filter" text only when no filters are active */}
              
              {/* Show filter tags when filters are active */}
              {(filters.vendorName || filters.clientName || filters.siteIncharge || filters.startDate || filters.endDate || filters.branch) && (
                <div className="flex items-center gap-2 flex-nowrap">
                  {filters.branch && (
                    <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Branch</span>
                      <button
                        onClick={() => {
                          setFilters({ ...filters, branch: '', clientName: '' }); // Clear clientName when branch is cleared
                        }}
                        className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {filters.vendorName && (
                    <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Vendor</span>
                      <button
                        onClick={() => setFilters({ ...filters, vendorName: '' })}
                        className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {filters.clientName && (
                    <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Project</span>
                      <button
                        onClick={() => setFilters({ ...filters, clientName: '' })}
                        className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {filters.siteIncharge && (
                    <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Incharge</span>
                      <button
                        onClick={() => setFilters({ ...filters, siteIncharge: '' })}
                        className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {(filters.startDate || filters.endDate) && (
                    <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black whitespace-nowrap">
                        Date
                      </span>
                      <button
                        onClick={() => setFilters({ ...filters, startDate: '', endDate: '' })}
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

          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="text-[14px] font-medium hover:text-black transition-colors flex-shrink-0 text-[#9E9E9E]"
            >
              x
            </button>
          )}
        </div>
      </div>

      {/* Purchase Orders List - Scrollable */}
      <div
        className="overflow-y-auto scrollbar-hide px-4 mt-1 pb-4"
        style={{ height: 'calc(100vh - 180px - 80px)', maxHeight: 'calc(100vh - 180px - 80px)' }}
        onClick={() => setExpandedPoId(null)}
      >
        {filteredPOs.length === 0 ? (
          <div className="flex flex-col items-center justify-center ">
            <div className="w-[64px] h-[64px] rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12H24M8 20H24M8 28H24" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
              {searchQuery ? 'No purchase orders found' : 'No purchase orders yet'}
            </p>
          </div>
        ) : (
          <div className="">
            {filteredPOs.map((po, index) => {
              const isFirstCard = index === 0;
              // First card starts expanded, but can be closed by swiping right
              const isExpanded = isFirstCard
                ? (!isFirstCardClosed || expandedPoId === po.id)
                : expandedPoId === po.id;
              const totalItems = po.items?.length || 0;
              const totalQuantity = po.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
              const totalAmount = po.items?.reduce((sum, item) => {
                const amount = item.amount || (item.quantity * item.price) || 0;
                return sum + Number(amount);
              }, 0) || 0;

              const swipeState = swipeStates[po.id];
              let swipeOffset = 0;
              if (swipeState && swipeState.isSwiping) {
                swipeOffset = Math.max(-110, Math.min(0, swipeState.currentX - swipeState.startX));
              } else if (isExpanded) {
                swipeOffset = -110;
              } else {
                swipeOffset = 0;
              }

              return (
                <div key={po.id} className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-gray-50 rounded-[8px] h-[100px]">
                  {/* PO Card */}
                  <div
                    ref={(el) => {
                      if (el) {
                        cardRefs.current[po.id] = el;
                      } else {
                        delete cardRefs.current[po.id];
                      }
                    }}
                    className="flex-1 bg-white rounded-[8px] h-full px-3 py-3 transition-all duration-300 ease-out"
                    style={{
                      transform: `translateX(${swipeOffset}px)`,
                      touchAction: 'pan-y'
                    }}
                    onClick={(e) => {
                      if (!isExpanded) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Left: PO Details */}
                      <div className=" min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('viewPO', { detail: po }));
                            }}
                            className="text-[12px] font-semibold text-black leading-snug cursor-pointer hover:text-blue-600 hover:underline text-left"
                          >
                            {po.poNumber || 'N/A'}
                          </button>

                        </div>
                        <p className="text-[12px] font-semibold text-black leading-snug truncate mb-0.5">
                          {po.vendorName || 'N/A'}
                        </p>
                        <p className="text-[11px] font-medium text-[#777777] leading-snug truncate">
                          {po.projectName || 'N/A'}
                        </p>
                        {!isExpanded && (
                          <span className="text-[11px] font-medium text-[#777777] leading-snug">
                            {formatDateTime(po.created_date_time || po.createdAt)}
                          </span>
                        )}
                      </div>

                      {/* Right: Payment Status Badge and Amount - Always visible */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        {po.paymentStatus && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${po.paymentStatus === 'Paid'
                              ? 'bg-[#E8F5E9] text-[#2E7D32]'
                              : po.paymentStatus === 'Unpaid'
                                ? 'bg-[#FFEBEE] text-[#C62828]'
                                : po.paymentStatus === 'Partially paid'
                                  ? 'bg-[#E8F5E9] text-[#388E3C]'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${po.paymentStatus === 'Paid'
                                ? 'bg-[#2E7D32]'
                                : po.paymentStatus === 'Unpaid'
                                  ? 'bg-[#C62828]'
                                  : po.paymentStatus === 'Partially paid'
                                    ? 'bg-[#388E3C]'
                                    : 'bg-gray-600'
                                }`}
                            ></span>
                            {po.paymentStatus}
                          </span>
                        )}
                        {totalAmount > 0 && (
                          <>
                            <p className="text-[12px] font-semibold text-black block leading-snug mt-5 mb-0">
                              ₹{totalAmount.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] font-medium text-[#9E9E9E]"> Incl Tax</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Behind the card on the right, revealed on swipe */}
                  <div
                    className="absolute right-0 top-0 flex gap-2 flex-shrink-0 z-0"
                    style={{
                      opacity: isExpanded || (swipeState && swipeState.isSwiping && swipeOffset < -20) ? 1 : 0,
                      transition: 'opacity 0.2s ease-out',
                      pointerEvents: isExpanded ? 'auto' : 'none'
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit - load PO data into create tab
                        handleEdit(po);
                        setExpandedPoId(null); // Close after edit
                      }}
                      className="action-button w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 hover:bg-[#22a882] transition-colors shadow-sm"
                      title="Edit"
                    >
                        <img src={Edit} alt="Edit" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(po.id);
                        setExpandedPoId(null); // Close after delete
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }} onClick={() => setShowFilterModal(false)}>
          <div className="bg-white w-full max-w-[360px] rounded-tl-[16px] rounded-tr-[16px] relative z-50 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }} onClick={(e) => e.stopPropagation()}>
            {/* Title */}
            <div className="px-6 pt-5 pb-4 flex items-center justify-between">
              <p className="text-[16px] font-semibold text-black">Select Filters</p>
              {/* Branch Filter Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBranchModal(true);
                }}
                className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
              >
                {filters.branch || 'Branch'}
              </button>
            </div>

            <div className="px-6 pb-32">
              <div className="space-y-4">
                {/* Vendor Name Filter */}
                <div>
                  <label className="text-[12px] font-semibold text-black mb-1 block">
                    Vendor Name
                  </label>
                  <SearchableDropdown
                    value={filters.vendorName}
                    onChange={(value) => setFilters({ ...filters, vendorName: value })}
                    options={uniqueVendors}
                    placeholder="Select"
                    fieldName="Vendor Filter"
                    showAddNew={false}
                    showAllOptions={true}
                  />
                </div>

                {/* Client Name Filter */}
                <div>
                  <label className="text-[12px] font-semibold text-black mb-1 block">
                    Project Name
                  </label>
                  <SearchableDropdown
                    value={filters.clientName}
                    onChange={(value) => setFilters({ ...filters, clientName: value })}
                    options={uniqueClients}
                    placeholder="Select"
                    fieldName="Client Filter"
                    showAddNew={false}
                    showAllOptions={true}
                  />
                </div>

                {/* Site Incharge Filter */}
                <div>
                  <label className="text-[12px] font-semibold text-black mb-1 block">
                    Site Incharge
                  </label>
                  <SearchableDropdown
                    value={filters.siteIncharge}
                    onChange={(value) => setFilters({ ...filters, siteIncharge: value })}
                    options={uniqueSiteIncharges}
                    placeholder="Select"
                    fieldName="Site Incharge Filter"
                    showAddNew={false}
                    showAllOptions={true}
                  />
                </div>

                <div className="flex gap-2">
                  {/* Date Filter */}
                  <div className="flex-1">
                    <label className="text-[12px] font-semibold text-black mb-1 block">Date</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(true)}
                        className="w-full h-[32px] px-4 border border-[#E0E0E0] rounded-[8px] text-[10px] font-medium text-black bg-white flex items-center justify-between focus:outline-none"
                      >
                        <span className={`${(filters.startDate || filters.endDate) ? 'text-black' : 'text-[#9E9E9E]'} whitespace-nowrap overflow-hidden text-ellipsis`}>
                          {filters.startDate && filters.endDate
                            ? `${formatDate(filters.startDate)} to ${formatDate(filters.endDate)}`
                            : filters.startDate
                              ? formatDate(filters.startDate)
                              : filters.endDate
                                ? formatDate(filters.endDate)
                                : 'Select Date'}
                        </span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 ml-2">
                          <path d="M3 4H13M3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4M3 4C3 3.44772 3.44772 3 4 3H12C12.5523 3 13 3.44772 13 4M6 2V5M10 2V5" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* PO.No Filter */}
                  <div className="flex-1">
                    <label className="text-[12px] font-semibold text-black mb-1 block">PO.No</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.poNumber}
                        onChange={(e) => setFilters({ ...filters, poNumber: e.target.value })}
                        placeholder="Enter"
                        className="w-full h-[32px] px-4 border border-[#E0E0E0] rounded-[8px] text-[14px] font-medium text-black placeholder:text-[#9E9E9E] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Fixed at bottom */}
            <div className="absolute bottom-6 left-0 right-0 px-6 flex gap-4">
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-[175px] h-[40px] border border-[#949494] rounded-[8px] text-[14px] font-bold text-[#363636] bg-white leading-normal"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-[175px] h-[40px] bg-black border border-[#f4ede2] rounded-[8px] text-[14px] font-bold text-white leading-normal"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="Are you sure you want to delete this purchase order?"
      />

      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialStartDate={filters.startDate ? formatDate(filters.startDate) : ''}
        initialEndDate={filters.endDate ? formatDate(filters.endDate) : ''}
      />

      {/* Branch Select Modal */}
      <SelectVendorModal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        onSelect={(value) => {
          setFilters({ ...filters, branch: value, clientName: '' });
          setShowBranchModal(false);
        }}
        selectedValue={filters.branch}
        options={uniqueBranches}
        fieldName="Branch"
        onAddNew={null}
        showStarIcon={false}
      />
    </div>
  );
};

export default History;

