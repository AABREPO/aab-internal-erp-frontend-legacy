import React, { useState, useEffect, useRef } from 'react';
import EditIcon from '../Images/edit1.png';
import DeleteIcon from '../Images/delete.png';
import Filter from '../Images/Filter.png'

const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_management';
const PROJECT_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/project_Names';
const VENDOR_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/vendor_Names';
const EMPLOYEE_DETAILS_BASE_URL = 'https://backendaab.in/aabuildersDash/api/employee_details';
const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_name';
const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_brand';
const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_id';
const TOOLS_MACHINE_STATUS_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools-machine-status';

const ServiceHistory = ({ user, onTabChange }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsMap, setProjectsMap] = useState({});
  const [vendorsMap, setVendorsMap] = useState({});
  const [employeesMap, setEmployeesMap] = useState({});
  const [itemNamesMap, setItemNamesMap] = useState({});
  const [brandsMap, setBrandsMap] = useState({});
  const [itemIdsMap, setItemIdsMap] = useState({});
  
  // Image viewer state
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageViewerData, setImageViewerData] = useState({
    images: [],
    currentIndex: 0,
    itemName: '',
    itemId: '',
    machineStatus: ''
  });
  // Bottom sheet state
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  const statusOptions = [
    { value: 'Working', label: 'Problem Solved' },
    { value: 'Under Repair', label: 'Not Working' },
    { value: 'Machine Dead', label: 'Machine Dead' }
  ];
  const [statusSearchQuery, setStatusSearchQuery] = useState('');
  // Swipe detection state - track per card
  const [swipeStates, setSwipeStates] = useState({});
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const expandedEntryIdRef = useRef(expandedEntryId);
  
  // Keep ref in sync with state
  useEffect(() => {
    expandedEntryIdRef.current = expandedEntryId;
  }, [expandedEntryId]);

  // Helper function to fetch latest machine status from the new API
  const fetchLatestMachineStatus = async (itemIdsId, machineNumber) => {
    if (!itemIdsId || !machineNumber) return null;
    try {
      const response = await fetch(`${TOOLS_MACHINE_STATUS_BASE_URL}/item/${itemIdsId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const statusList = await response.json();
        if (Array.isArray(statusList) && statusList.length > 0) {
          // Filter by machine number and get the latest one (by id, assuming higher id = newer)
          const matchingStatuses = statusList.filter(
            status => String(status.machine_number || status.machineNumber || '').trim() === String(machineNumber).trim()
          );
          if (matchingStatuses.length > 0) {
            // Sort by id descending to get the latest
            matchingStatuses.sort((a, b) => (b.id || 0) - (a.id || 0));
            return matchingStatuses[0].machine_status || matchingStatuses[0].machineStatus || null;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching machine status:', error);
    }
    return null;
  };

  // Helper function to save/update machine status
  const saveMachineStatus = async (itemIdsId, machineNumber, machineStatus) => {
    if (!itemIdsId || !machineNumber || !machineStatus) {
      console.error('Missing required fields for saving machine status');
      return false;
    }
    try {
      const response = await fetch(`${TOOLS_MACHINE_STATUS_BASE_URL}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_ids_id: String(itemIdsId),
          machine_number: String(machineNumber),
          machine_status: machineStatus,
          created_by: user?.name || user?.username || 'mobile'
        })
      });
      if (response.ok) {
        return true;
      } else {
        console.error('Failed to save machine status:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error saving machine status:', error);
      return false;
    }
  };

  // Fetch lookup data for mapping IDs to names
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        // Fetch projects (using siteName field like Transfer.jsx)
        const projectsRes = await fetch(`${PROJECT_NAMES_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(p => {
            map[p.id] = p.siteName || p.site_name || p.projectName || p.project_name || '';
          });
          setProjectsMap(map);
        }

        // Fetch vendors (using vendorName field like Transfer.jsx)
        const vendorsRes = await fetch(`${VENDOR_NAMES_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (vendorsRes.ok) {
          const data = await vendorsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(v => {
            map[v.id] = v.vendorName || v.vendor_name || '';
          });
          setVendorsMap(map);
        }

        // Fetch employees
        const employeesRes = await fetch(`${EMPLOYEE_DETAILS_BASE_URL}/site_engineers`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (employeesRes.ok) {
          const data = await employeesRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(e => {
            map[e.id] = e.employee_name || e.employeeName || '';
          });
          setEmployeesMap(map);
        }

        // Fetch item names
        const itemNamesRes = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (itemNamesRes.ok) {
          const data = await itemNamesRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(i => {
            map[i.id] = i.item_name || i.itemName || '';
          });
          setItemNamesMap(map);
        }

        // Fetch brands
        const brandsRes = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(b => {
            map[b.id] = b.tools_brand || b.toolsBrand || '';
          });
          setBrandsMap(map);
        }

        // Fetch item IDs
        const itemIdsRes = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (itemIdsRes.ok) {
          const data = await itemIdsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(i => {
            const toolsId = i.item_id || i.itemId || '';
            // Store with both string and number keys for flexible lookup
            map[i.id] = toolsId;
            map[String(i.id)] = toolsId;
          });
          setItemIdsMap(map);
        }
      } catch (error) {
        console.error('Error fetching lookup data:', error);
      }
    };
    fetchLookupData();
  }, []);

  // Fetch history data from tools tracker management API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });        
        if (response.ok) {
          const data = await response.json();          
          // Flatten the data - create separate entries for each item
          const flattenedData = [];
          (Array.isArray(data) ? data : []).forEach(entry => {
            const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];            
            if (entryItems.length === 0) {
              // If no items, still show the entry
              flattenedData.push({
                id: `${entry.id}-0`,
                entryId: entry.id,
                eno: entry.eno || '',
                toolsEntryType: entry.tools_entry_type || entry.toolsEntryType || 'Entry',
                fromProjectId: entry.from_project_id || entry.fromProjectId || '',
                toProjectId: entry.to_project_id || entry.toProjectId || '',
                serviceStoreId: entry.service_store_id || entry.serviceStoreId || '',
                projectInchargeId: entry.project_incharge_id || entry.projectInchargeId || '',
                createdDateTime: entry.created_date_time || entry.createdDateTime || entry.timestamp || '',
                createdBy: entry.created_by || entry.createdBy || '',
                itemNameId: '',
                brandId: '',
                itemIdsId: '',
                machineNumber: '',
                machineStatus: '',
                quantity: 0,
                description: '',
                images: []
              });
            } else {
              // Create separate entry for each item
              entryItems.forEach((item, index) => {
                // Process images - convert base64 to data URLs if needed
                const rawImages = item.tools_item_live_images || item.toolsItemLiveImages || [];
                const processedImages = rawImages.map(img => {
                  // If tools_image exists (byte array as base64), convert to data URL
                  if (img.tools_image || img.toolsImage) {
                    const base64Data = img.tools_image || img.toolsImage;
                    return `data:image/jpeg;base64,${base64Data}`;
                  }
                  // Fallback to URL if exists
                  if (img.tools_image_url || img.toolsImageUrl) {
                    return img.tools_image_url || img.toolsImageUrl;
                  }
                  return null;
                }).filter(Boolean);
                flattenedData.push({
                  id: `${entry.id}-${index}`,
                  entryId: entry.id,
                  eno: entry.eno || '',
                  toolsEntryType: entry.tools_entry_type || entry.toolsEntryType || 'Entry',
                  fromProjectId: entry.from_project_id || entry.fromProjectId || '',
                  toProjectId: entry.to_project_id || entry.toProjectId || '',
                  serviceStoreId: entry.service_store_id || entry.serviceStoreId || '',
                  projectInchargeId: entry.project_incharge_id || entry.projectInchargeId || '',
                  createdDateTime: entry.created_date_time || entry.createdDateTime || entry.timestamp || '',
                  createdBy: entry.created_by || entry.createdBy || '',
                  itemNameId: item.item_name_id || item.itemNameId || '',
                  brandId: item.brand_id || item.brandId || '',
                  itemIdsId: item.item_ids_id || item.itemIdsId || '',
                  machineNumber: item.machine_number || item.machineNumber || '',
                  machineStatus: item.machine_status || item.machineStatus || 'Working',
                  quantity: item.quantity || 0,
                  description: item.description || '',
                  images: processedImages
                });
              });
            }
          });          
          // Sort by created_date_time (newest first)
          flattenedData.sort((a, b) => {
            const dateA = new Date(a.createdDateTime);
            const dateB = new Date(b.createdDateTime);
            return dateB - dateA;
          });
          
          // Filter to only show 'Service' type data (exclude Entry and other types)
          const filteredData = flattenedData.filter(entry => entry.toolsEntryType === 'service');
          
          // Fetch latest machine status from the new API for each entry
          const enrichedData = await Promise.all(
            filteredData.map(async (entry) => {
              if (entry.itemIdsId && entry.machineNumber) {
                const latestStatus = await fetchLatestMachineStatus(entry.itemIdsId, entry.machineNumber);
                if (latestStatus) {
                  return { ...entry, machineStatus: latestStatus };
                }
              }
              return entry;
            })
          );
          
          setHistoryData(enrichedData);
        } else {
          console.error('Failed to fetch history data');
          setHistoryData([]);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Format timestamp to date and time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: '', time: '' };
    try {
      const date = new Date(timestamp);
      const formattedDate = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return { date: formattedDate, time: formattedTime };
    } catch {
      return { date: '', time: '' };
    }
  };

  // Get location name (project or vendor)
  const getLocationName = (id, checkVendorsFirst = false) => {
    if (!id) return '-';
    
    // Convert to string for comparison
    const idStr = String(id);
    
    if (checkVendorsFirst) {
      // Check vendors first (for service stores)
      if (vendorsMap[idStr]) {
        return vendorsMap[idStr];
      }
      if (vendorsMap[id]) {
        return vendorsMap[id];
      }
    }
    
    // Check projects
    if (projectsMap[idStr]) {
      return projectsMap[idStr];
    }
    if (projectsMap[id]) {
      return projectsMap[id];
    }
    
    // Check vendors
    if (vendorsMap[idStr]) {
      return vendorsMap[idStr];
    }
    if (vendorsMap[id]) {
      return vendorsMap[id];
    }
    
    return '-';
  };

  // Image viewer handlers
  const handleOpenImageViewer = (entry, itemName, itemId) => {
    if (entry.images.length === 0) {
      alert('No images available for this item');
      return;
    }
    
    setImageViewerData({
      images: entry.images,
      currentIndex: 0,
      itemName: itemName,
      itemId: itemId,
      machineStatus: entry.machineStatus
    });
    setShowImageViewer(true);
  };

  const handleCloseImageViewer = () => {
    setShowImageViewer(false);
  };

  const handlePrevImage = () => {
    setImageViewerData(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }));
  };

  const handleNextImage = () => {
    setImageViewerData(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1
    }));
  };

  // Bottom sheet handlers
  const handleCardClickForBottomSheet = (entry) => {
    setSelectedEntry(entry);
    // Map "Not Working" to "Machine Dead" for consistency
    const statusToSet = entry.machineStatus === 'Not Working' ? 'Machine Dead' : (entry.machineStatus || '');
    setSelectedStatus(statusToSet);
    setShowBottomSheet(true);
  };

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
    setSelectedEntry(null);
    setSelectedStatus('');
    setShowStatusDropdown(false);
    setStatusSearchQuery('');
  };

  const handleSaveFilter = async () => {
    if (!selectedEntry || !selectedStatus) {
      handleCloseBottomSheet();
      return;
    }

    // Save machine status to the new API
    const success = await saveMachineStatus(
      selectedEntry.itemIdsId,
      selectedEntry.machineNumber,
      selectedStatus
    );

    if (success) {
      // Update local state to reflect the change
      setHistoryData(prevData =>
        prevData.map(entry =>
          entry.id === selectedEntry.id
            ? { ...entry, machineStatus: selectedStatus }
            : entry
        )
      );
      alert('Machine status updated successfully');
    } else {
      alert('Failed to update machine status. Please try again.');
    }

    handleCloseBottomSheet();
  };

  const handleCardClick = (e) => {
    // Don't trigger if clicking on the action buttons
    if (e.target.closest('.action-button')) {
      return;
    }
    // Don't trigger if clicking on item ID (for image viewer)
    if (e.target.closest('.item-id-clickable')) {
      return;
    }
    // Close expanded card if clicking elsewhere
    if (expandedEntryId) {
      setExpandedEntryId(null);
    } else {
      // Open bottom sheet if card is not expanded
      const entryId = e.currentTarget.dataset.entryId;
      if (entryId) {
        const entry = historyData.find(ent => ent.id === entryId);
        if (entry) {
          handleCardClickForBottomSheet(entry);
        }
      }
    }
  };

  // Swipe handlers
  const minSwipeDistance = 50;
  const handleTouchStart = (e, entryId) => {
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    setSwipeStates(prev => ({
      ...prev,
      [entryId]: {
        startX: touch.clientX,
        currentX: touch.clientX,
        isSwiping: false
      }
    }));
  };

  const handleTouchMove = (e, entryId) => {
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    setSwipeStates(prev => {
      const state = prev[entryId];
      if (!state) return prev;
      const deltaX = touch.clientX - state.startX;
      const isExpanded = expandedEntryIdRef.current === entryId;
      // Only allow left swipe (negative deltaX)
      if (deltaX < 0 || (isExpanded && deltaX > 0)) {
        return {
          ...prev,
          [entryId]: {
            ...state,
            currentX: touch.clientX,
            isSwiping: true
          }
        };
      }
      return prev;
    });
  };

  const handleTouchEnd = (entryId) => {
    setSwipeStates(prev => {
      const state = prev[entryId];
      if (!state) return prev;
      const deltaX = state.currentX - state.startX;
      const absDeltaX = Math.abs(deltaX);
      
      if (absDeltaX >= minSwipeDistance) {
        if (deltaX < 0) {
          // Swiped left (reveal buttons)
          setExpandedEntryId(entryId);
        } else {
          // Swiped right (hide buttons)
          setExpandedEntryId(null);
        }
      } else {
        // Small movement - snap back
        if (expandedEntryIdRef.current === entryId) {
          setExpandedEntryId(null);
        }
      }
      
      // Remove swipe state
      const newState = { ...prev };
      delete newState[entryId];
      return newState;
    });
  };

  const handleMouseDown = (e, entryId) => {
    if (e.button !== 0) return; // Only handle left mouse button
    const syntheticEvent = {
      touches: [{ clientX: e.clientX }],
      preventDefault: () => e.preventDefault()
    };
    handleTouchStart(syntheticEvent, entryId);
  };

  // Global mouse handlers for desktop support
  useEffect(() => {
    if (historyData.length === 0) return;

    const globalMouseMoveHandler = (e) => {
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };
        historyData.forEach(entry => {
          const state = prev[entry.id];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          const isExpanded = expandedEntryIdRef.current === entry.id;
          // Only update if dragging horizontally
          if (deltaX < 0 || (isExpanded && deltaX > 0)) {
            newState[entry.id] = {
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
        historyData.forEach(entry => {
          const state = prev[entry.id];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              // Swiped left (reveal buttons)
              setExpandedEntryId(entry.id);
            } else {
              // Swiped right (hide buttons)
              setExpandedEntryId(null);
            }
          } else {
            // Small movement - snap back
            if (expandedEntryIdRef.current === entry.id) {
              setExpandedEntryId(null);
            }
          }
          // Remove swipe state for this card
          delete newState[entry.id];
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
  }, [historyData]);

  // Get status display text and color
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'Working':
        return { text: 'Problem Solved', color: 'text-[#BF9853]' };
      case 'Not Working':
        return { text: 'Machine Dead', color: 'text-[#F44336]' };
      case 'Machine Dead':
        return { text: 'Machine Dead', color: 'text-[#F44336]' };
      case 'Under Repair':
        return { text: 'Pending', color: 'text-[#BF9853]' };
      default:
        return { text: status || 'Pending', color: 'text-[#BF9853]' };
    }
  };

  return (
    <div className="flex flex-col bg-white min-h-[calc(100vh-90px-80px)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Top Header Section */}
      <div className="flex-shrink-0 px-4 pt-2 pb-1.5">
        <div className="flex justify-between items-start border-b border-gray-200 pb-1.5">
          <div>
            <p className="text-[12px] font-medium text-black leading-normal">Shop Name</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#848484] leading-normal flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#848484]" />
              Purchase Cost: 0
            </span>
            <span className="text-[12px] text-[#E07C24] leading-normal flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E07C24]" />
              Service Cost: 0
            </span>
          </div>
        </div>
      </div>
      {/* Filter and Download Row */}
      <div className="flex justify-between items-center px-4 pb-3">
        <div className="flex items-center gap-2">
        <img src={Filter} alt="Filter" className="w-[13px] h-[11px]" />
          <span className="text-[12px] font-medium text-black">Filter</span>
        </div>
        <button className="text-[14px] font-medium text-black cursor-pointer hover:opacity-80">
          Download
        </button>
      </div>

      {/* Service Records List */}
      <div className="flex-1 px-4 overflow-y-auto pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">Loading...</p>
          </div>
        ) : historyData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">No service history entries found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {historyData.map((entry) => {
              const { date, time } = formatDateTime(entry.createdDateTime);
              
              // For Service type: check serviceStoreId first (vendors), then toProjectId
              let shopName = getLocationName(entry.serviceStoreId, true);
              if (shopName === '-') {
                shopName = getLocationName(entry.toProjectId, false);
              }
              
              const inchargeName = employeesMap[entry.projectInchargeId] || employeesMap[String(entry.projectInchargeId)] || '-';
              const itemName = itemNamesMap[entry.itemNameId] || itemNamesMap[String(entry.itemNameId)] || entry.itemNameId || '-';
              
              // Get item ID name (like "AA DM 01") from the map using item_ids_id
              const itemIdName = entry.itemIdsId ? (itemIdsMap[entry.itemIdsId] || itemIdsMap[String(entry.itemIdsId)] || '') : '';
              const hasImages = entry.images.length > 0;
              
              // Get status display
              const statusDisplay = getStatusDisplay(entry.machineStatus);
              
              // Service cost (placeholder - you may need to add this field to the data)
              const serviceCost = entry.serviceCost || 0;
              
              // Swipe state and offset calculation
              const entryId = entry.id;
              const swipeState = swipeStates[entryId];
              const isExpanded = expandedEntryId === entryId;
              const buttonWidth = 96; // 2 * 40px + gap
              const swipeOffset =
                swipeState && swipeState.isSwiping
                  ? Math.max(-buttonWidth, swipeState.currentX - swipeState.startX)
                  : isExpanded
                    ? -buttonWidth
                    : 0;

              return (
                <div key={entry.id} className="relative overflow-hidden">
                  {/* Card */}
                  <div
                    data-entry-id={entryId}
                    className="bg-white border-2 border-[#E0E0E0] rounded-[8px] px-3 py-2 cursor-pointer transition-transform duration-300 ease-out select-none"
                    style={{
                      transform: `translateX(${swipeOffset}px)`,
                      touchAction: 'pan-y',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                    onTouchStart={(e) => handleTouchStart(e, entryId)}
                    onTouchMove={(e) => handleTouchMove(e, entryId)}
                    onTouchEnd={() => handleTouchEnd(entryId)}
                    onMouseDown={(e) => handleMouseDown(e, entryId)}
                    onClick={handleCardClick}
                  >
                  {/* Row 1: Entry number + Item Name | Date (if separate) */}
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-[13px] font-semibold text-black leading-snug truncate flex-1 min-w-0">
                      #{entry.eno}, {itemName}
                    </p>
                  </div>

                  {/* Row 2: Machine Number | Person Name */}
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-[14px] font-semibold text-black leading-snug truncate flex-1 min-w-0">
                      {entry.machineNumber || '-'}
                    </p>
                    <p className="text-[12px] text-black leading-snug flex-shrink-0 ml-2">
                      {inchargeName}
                    </p>
                  </div>

                  {/* Row 3: Shop Name | Status + Cost */}
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-[12px] font-medium leading-snug truncate flex-1 min-w-0 text-[#BF9853]">
                      {shopName}
                    </p>
                    <p className="text-[11px] leading-snug flex-shrink-0 ml-2">
                      <span className={`font-medium ${statusDisplay.color}`}>
                        {statusDisplay.text}
                      </span>
                      <span className="text-[#4CAF50] font-medium">, Rs.{serviceCost}</span>
                    </p>
                  </div>

                  {/* Row 4: Date/Time | Item ID (green) */}
                  <div className="flex items-start justify-between">
                    <p className="text-[11px] text-[#848484] leading-snug truncate flex-1 min-w-0">
                      {date} • {time}
                    </p>
                    {itemIdName && (
                      <p 
                        className={`item-id-clickable text-[13px] font-semibold leading-snug flex-shrink-0 ml-2 ${hasImages ? 'text-[#E4572E] cursor-pointer underline' : 'text-[#4CAF50]'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasImages) {
                            handleOpenImageViewer(entry, itemName, itemIdName || 'View');
                          }
                        }}
                      >
                        {itemIdName}
                      </p>
                    )}
                  </div>
                  </div>

                  {/* Action Buttons - Behind the card on the right, revealed on swipe */}
                  <div
                    className="absolute right-0 top-0 bottom-0 flex gap-2 flex-shrink-0 z-0"
                    style={{
                      opacity:
                        isExpanded ||
                          (swipeState && swipeState.isSwiping && swipeOffset < -20)
                          ? 1
                          : 0,
                      transition: 'opacity 0.2s ease-out',
                      pointerEvents: isExpanded ? 'auto' : 'none'
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedEntryId(null);
                        // Handle edit - store only entry ID to avoid localStorage quota issues
                        localStorage.setItem('editingToolsTrackerEntryId', String(entry.entryId));
                        // Switch to Transfer tab
                        if (onTabChange) {
                          onTabChange('transfer');
                        }
                      }}
                      className="action-button w-[40px] h-full bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 hover:bg-[#22a882] transition-colors shadow-sm"
                    >
                      <img src={EditIcon} alt="Edit" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedEntryId(null);
                      }}
                      className="action-button w-[40px] h-full bg-[#E4572E] flex rounded-[6px] items-center justify-center gap-1.5 hover:bg-[#cc4d26] transition-colors shadow-sm"
                    >
                      <img src={DeleteIcon} alt="Delete" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Viewer Modal - Floating style */}
      {showImageViewer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleCloseImageViewer}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          {/* Image Container */}
          <div 
            className="relative z-10 w-full max-w-[90%] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative">
              <img
                src={imageViewerData.images[imageViewerData.currentIndex]}
                alt={`${imageViewerData.itemName} - ${imageViewerData.currentIndex + 1}`}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-2xl"
              />              
              {/* Close Button - Inside image at top right */}
              <button
                onClick={handleCloseImageViewer}
                className="absolute -top-7 -right-1 w-8 h-8 rounded-full flex items-center justify-center z-20 "
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#E4572E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>              
              {/* Previous Button */}
              {imageViewerData.images.length > 1 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              {/* Next Button */}
              {imageViewerData.images.length > 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              {/* Image Counter */}
              {imageViewerData.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
                  <span className="text-[12px] text-white">
                    {imageViewerData.currentIndex + 1} / {imageViewerData.images.length}
                  </span>
                </div>
              )}
            </div>

            {/* Status indicator below image */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span
                className={`w-2 h-2 rounded-full ${
                  imageViewerData.machineStatus === 'Working' ? 'bg-[#4CAF50]' : 
                  imageViewerData.machineStatus === 'Not Working' || imageViewerData.machineStatus === 'Machine Dead' ? 'bg-[#F44336]' :
                  imageViewerData.machineStatus === 'Under Repair' ? 'bg-[#FF9800]' :
                  'bg-[#9E9E9E]'
                }`}
              ></span>
              <p
                className={`text-[12px] font-medium ${
                  imageViewerData.machineStatus === 'Working' ? 'text-[#4CAF50]' : 
                  imageViewerData.machineStatus === 'Not Working' || imageViewerData.machineStatus === 'Machine Dead' ? 'text-[#F44336]' :
                  imageViewerData.machineStatus === 'Under Repair' ? 'text-[#FF9800]' :
                  'text-[#9E9E9E]'
                }`}
              >
                {imageViewerData.machineStatus === 'Not Working' ? 'Machine Dead' : imageViewerData.machineStatus}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet Modal */}
      {showBottomSheet && (
        <div 
          className="fixed inset-0 z-50 flex items-end"
          onClick={handleCloseBottomSheet}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          {/* Bottom Sheet */}
          <div 
            className="relative z-10 w-full bg-white rounded-t-[20px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200">
              <p className="text-[16px] font-semibold text-black">Select Filters</p>
              <button
                onClick={handleCloseBottomSheet}
                className="w-6 h-6 flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-4">
              {/* Machine Status Filter */}
              <div className="mb-4">
                <label className="block text-[14px] font-medium text-black mb-2">
                  Machine Status
                </label>
                <button
                  onClick={() => setShowStatusDropdown(true)}
                  className="w-full px-3 py-2.5 text-left bg-white border border-gray-300 rounded-[8px] flex items-center justify-between"
                >
                  <span className={`text-[14px] ${selectedStatus ? 'text-black' : 'text-gray-400'}`}>
                    {(statusOptions.find(o => o.value === selectedStatus)?.label) || 'Select Status'}
                  </span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 9L12 15L18 9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 px-4 pb-2">
              <button
                onClick={handleCloseBottomSheet}
                className="flex-1 px-4 py-3 text-[14px] font-medium text-black bg-white border border-gray-300 rounded-[8px] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                className="flex-1 px-4 py-3 text-[14px] font-medium text-white bg-black rounded-[8px] hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          </div>

          {/* Select Status Modal - centered overlay when Machine Status dropdown is clicked */}
          {showStatusDropdown && (
            <div 
              className="fixed inset-0 z-[60] flex items-center justify-center px-4"
              onClick={() => setShowStatusDropdown(false)}
            >
              <div 
                className="absolute inset-0 bg-black bg-opacity-40"
              />
              <div 
                className="relative z-10 w-full max-w-[340px] bg-white rounded-[12px] shadow-xl p-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[16px] font-semibold text-black">Select Status</p>
                  <button
                    onClick={() => setShowStatusDropdown(false)}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                {/* Search Bar */}
                <div className="relative mb-3">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search"
                    value={statusSearchQuery}
                    onChange={(e) => setStatusSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-[14px] border border-gray-300 rounded-[8px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
                {/* Radio Options */}
                <div className="space-y-0">
                  {statusOptions
                    .filter((opt) =>
                      opt.label.toLowerCase().includes(statusSearchQuery.toLowerCase())
                    )
                    .map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedStatus(option.value);
                          setShowStatusDropdown(false);
                          setStatusSearchQuery('');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-left ${
                          selectedStatus === option.value
                            ? 'bg-[#FFF3E0]'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className={`text-[14px] ${selectedStatus === option.value ? 'font-medium' : ''}`}>
                          {option.label}
                        </span>
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedStatus === option.value
                              ? 'border-[#E07C24] bg-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {selectedStatus === option.value && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E07C24]" />
                          )}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceHistory;
