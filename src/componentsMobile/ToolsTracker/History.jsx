import React, { useState, useEffect, useRef } from 'react';
import EditIcon from '../Images/edit1.png';
import DeleteIcon from '../Images/delete.png';

const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_management';
const PROJECT_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/project_Names';
const VENDOR_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/vendor_Names';
const EMPLOYEE_DETAILS_BASE_URL = 'https://backendaab.in/aabuildersDash/api/employee_details';
const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_name';
const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_brand';
const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_id';

const History = ({ user, onTabChange }) => {
  const [historyType, setHistoryType] = useState('entry'); // 'entry' or 'relocate'
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullEntriesData, setFullEntriesData] = useState([]); // Store full entries before flattening
  const [projectsMap, setProjectsMap] = useState({});
  const [vendorsMap, setVendorsMap] = useState({});
  const [employeesMap, setEmployeesMap] = useState({});
  const [itemNamesMap, setItemNamesMap] = useState({});
  const [brandsMap, setBrandsMap] = useState({});
  const [itemIdsMap, setItemIdsMap] = useState({});
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageViewerData, setImageViewerData] = useState({
    images: [],
    currentIndex: 0,
    itemName: '',
    itemId: '',
    machineStatus: ''
  });
  const [swipeStates, setSwipeStates] = useState({});
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const expandedEntryIdRef = useRef(expandedEntryId);
  useEffect(() => {
    expandedEntryIdRef.current = expandedEntryId;
  }, [expandedEntryId]);
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
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
          const allEntries = Array.isArray(data) ? data : [];
          setFullEntriesData(allEntries);
          const flattenedData = [];
          allEntries.forEach(entry => {
            const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
            if (entryItems.length === 0) {
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
              entryItems.forEach((item, index) => {
                const rawImages = item.tools_item_live_images || item.toolsItemLiveImages || [];
                const processedImages = rawImages.map(img => {
                  if (img.tools_image || img.toolsImage) {
                    const base64Data = img.tools_image || img.toolsImage;
                    return `data:image/jpeg;base64,${base64Data}`;
                  }
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
          flattenedData.sort((a, b) => {
            const idA = Number(a.entryId ?? a.id ?? 0);
            const idB = Number(b.entryId ?? b.id ?? 0);
            if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
              return idB - idA; // latest entry id first
            }
            return String(b.entryId ?? b.id ?? '').localeCompare(String(a.entryId ?? a.id ?? ''));
          });
          setHistoryData(flattenedData);
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
  const getLocationName = (id, checkVendorsFirst = false) => {
    if (!id) return '-';
    const idStr = String(id);
    if (checkVendorsFirst) {
      if (vendorsMap[idStr]) {
        return vendorsMap[idStr];
      }
      if (vendorsMap[id]) {
        return vendorsMap[id];
      }
    }
    if (projectsMap[idStr]) {
      return projectsMap[idStr];
    }
    if (projectsMap[id]) {
      return projectsMap[id];
    }
    if (vendorsMap[idStr]) {
      return vendorsMap[idStr];
    }
    if (vendorsMap[id]) {
      return vendorsMap[id];
    }
    return '-';
  };
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
  // Handle edit (for update)
  const handleEdit = async (entry) => {
    try {
      // Get the entry ID
      const entryId = entry.entryId || entry.id;
      if (!entryId) {
        console.error('Entry ID not found');
        return;
      }

      // Try to fetch the full entry data from the backend
      try {
        const response = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/get/${entryId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const editData = await response.json();
          // Mark as edit mode (update, not create)
          editData.isEditMode = true;
          // Mark as from History (for showing appropriate UI in Transfer page)
          editData.fromHistory = true;

          // Store entry ID in localStorage for Transfer page compatibility
          localStorage.setItem('editingToolsTrackerEntryId', String(entryId));
          // Store full entry data in localStorage (for potential future use)
          localStorage.setItem('editingToolsTrackerEntry', JSON.stringify(editData));
          // Dispatch custom event for Transfer component to listen
          window.dispatchEvent(new CustomEvent('editToolsTrackerEntry', { detail: editData }));
        } else {
          // If fetch fails, still store the ID and navigate
          localStorage.setItem('editingToolsTrackerEntryId', String(entryId));
        }
      } catch (fetchError) {
        console.error('Error fetching entry details:', fetchError);
        // Continue with ID-only approach if fetch fails
        localStorage.setItem('editingToolsTrackerEntryId', String(entryId));
      }

      // Navigate to transfer tab for editing
      if (onTabChange) {
        onTabChange('transfer');
      }
      setExpandedEntryId(null);
    } catch (error) {
      console.error('Error in handleEdit:', error);
      // Fallback: still try to navigate even if there's an error
      const entryId = entry.entryId || entry.id;
      if (entryId) {
        localStorage.setItem('editingToolsTrackerEntryId', String(entryId));
        if (onTabChange) {
          onTabChange('transfer');
        }
      }
      setExpandedEntryId(null);
    }
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
          setExpandedEntryId(entryId);
        } else {
          setExpandedEntryId(null);
        }
      } else {
        if (expandedEntryIdRef.current === entryId) {
          setExpandedEntryId(null);
        }
      }
      const newState = { ...prev };
      delete newState[entryId];
      return newState;
    });
  };
  const handleMouseDown = (e, entryId) => {
    if (e.button !== 0) return;
    const syntheticEvent = {
      touches: [{ clientX: e.clientX }],
      preventDefault: () => e.preventDefault()
    };
    handleTouchStart(syntheticEvent, entryId);
  };
  const handleCardClick = (e) => {
    if (e.target.closest('.action-button')) {
      return;
    }
    if (expandedEntryId) {
      setExpandedEntryId(null);
    }
  };
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
              setExpandedEntryId(entry.id);
            } else {
              setExpandedEntryId(null);
            }
          } else {
            if (expandedEntryIdRef.current === entry.id) {
              setExpandedEntryId(null);
            }
          }
          delete newState[entry.id];
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
  }, [historyData]);
  const filteredHistoryData = historyData.filter(entry => {
    const entryType = entry.toolsEntryType || 'Entry';
    if (historyType === 'entry') {
      return entryType.toLowerCase() === 'entry';
    } else {
      return entryType.toLowerCase() === 'relocate';
    }
  });

  return (
    <div className="flex flex-col px-4 bg-white min-h-[calc(100vh-90px-80px)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex items-center justify-between pt-1.5 pb-1.5">
        <p className="text-[12px] text-black font-semibold">Category</p>
      </div>
      <div className="flex bg-[#F2F4F7] items-center h-9 rounded-md">
        <button
          onClick={() => setHistoryType('entry')}
          className={`flex-1 ml-0.5 h-8 rounded text-[12px] font-semibold leading-normal duration-1000 ease-out transition-colors ${historyType === 'entry'
              ? 'bg-white text-black shadow-sm'
              : 'text-[#9E9E9E]'
            }`}
        >
          Entry History
        </button>
        <button
          onClick={() => setHistoryType('relocate')}
          className={`flex-1 mr-0.5 h-8 rounded text-[12px] font-semibold leading-normal duration-1000 ease-out transition-colors ${historyType === 'relocate'
              ? 'bg-white text-black shadow-sm'
              : 'text-[#9E9E9E]'
            }`}
        >
          Relocate History
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">Loading...</p>
          </div>
        ) : filteredHistoryData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">No history entries found.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-0.5">
            {filteredHistoryData.map((entry) => {
              const { date, time } = formatDateTime(entry.createdDateTime);
              const fromLocation = getLocationName(entry.fromProjectId, false);
              let toLocation = '-';
              if (entry.toolsEntryType === 'Entry') {
                toLocation = getLocationName(entry.toProjectId, false);
                if (toLocation === '-') {
                  toLocation = getLocationName(entry.serviceStoreId, true);
                }
              } else {
                toLocation = getLocationName(entry.serviceStoreId, true);
                if (toLocation === '-') {
                  toLocation = getLocationName(entry.toProjectId, false);
                }
              }
              const inchargeName = employeesMap[entry.projectInchargeId] || employeesMap[String(entry.projectInchargeId)] || '-';
              const itemName = itemNamesMap[entry.itemNameId] || itemNamesMap[String(entry.itemNameId)] || entry.itemNameId || '-';
              const itemIdName = entry.itemIdsId ? (itemIdsMap[entry.itemIdsId] || itemIdsMap[String(entry.itemIdsId)] || '') : '';
              const hasImages = entry.images.length > 0;
              const displayValue = itemIdName || (entry.quantity > 0 ? String(entry.quantity) : '');
              const entryId = entry.id;
              const swipeState = swipeStates[entryId];
              const isExpanded = expandedEntryId === entryId;
              const buttonWidth = 96;
              const swipeOffset =
                swipeState && swipeState.isSwiping
                  ? Math.max(-buttonWidth, swipeState.currentX - swipeState.startX)
                  : isExpanded
                    ? -buttonWidth
                    : 0;
              return (
                <div key={entry.id} className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] h-[100px]">
                  <div
                    className="bg-white rounded-[8px] h-full px-3 py-3 cursor-pointer transition-all duration-300 ease-out select-none"
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
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[12px] font-semibold text-black leading-snug truncate">
                        #{entry.eno}, {itemName}
                      </p>
                      <div className="flex flex-col items-end flex-shrink-0 ml-2">
                        {displayValue ? (
                          <p className={`text-[12px] font-semibold leading-snug ${hasImages ? 'text-[#E4572E] cursor-pointer underline' : 'text-black'}`}
                            onClick={() => hasImages && handleOpenImageViewer(entry, itemName, displayValue)}
                          >
                            {displayValue}
                          </p>
                        ) : hasImages ? (
                          <p className="text-[12px] font-semibold leading-snug text-[#E4572E] cursor-pointer underline"
                            onClick={() => handleOpenImageViewer(entry, itemName, 'View')}
                          >
                            📷 Image
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[11px] text-[#848484] leading-snug truncate flex-1 min-w-0">
                        From - {fromLocation}
                      </p>
                      {entry.machineNumber && (
                        <p className="text-[12px] leading-snug text-black flex-shrink-0 ml-2">
                          {entry.machineNumber}
                        </p>
                      )}
                    </div>
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[11px] text-[#BF9853] leading-snug truncate flex-1 min-w-0">
                        To - {toLocation}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${entry.machineStatus === 'Working' ? 'bg-[#4CAF50]' :
                              entry.machineStatus === 'Not Working' ? 'bg-[#F44336]' :
                                entry.machineStatus === 'Under Repair' ? 'bg-[#FF9800]' :
                                  'bg-[#9E9E9E]'
                            }`}
                        ></span>
                        <p
                          className={`text-[11px] font-medium leading-snug ${entry.machineStatus === 'Working' ? 'text-[#4CAF50]' :
                              entry.machineStatus === 'Not Working' ? 'text-[#F44336]' :
                                entry.machineStatus === 'Under Repair' ? 'text-[#FF9800]' :
                                  'text-[#9E9E9E]'
                            }`}
                        >
                          {entry.machineStatus}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start justify-between">
                      <p className="text-[11px] text-[#848484] leading-snug truncate flex-1 min-w-0">
                        {date} • {time}
                      </p>
                      <p className="text-[12px] font-medium text-black leading-snug flex-shrink-0 ml-2">
                        {inchargeName}
                      </p>
                    </div>
                  </div>
                  <div
                    className="absolute right-0 top-0 flex gap-2 flex-shrink-0 z-0"
                    style={{
                      opacity: isExpanded || (swipeState && swipeState.isSwiping && swipeOffset < -20) ? 1 : 0,
                      transform: swipeOffset < 0
                        ? `translateX(${Math.max(0, 96 + swipeOffset)}px)`
                        : 'translateX(96px)',
                      transition: (swipeState && swipeState.isSwiping) ? 'none' : 'opacity 0.2s ease-out, transform 0.3s ease-out',
                      pointerEvents: isExpanded ? 'auto' : 'none'
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(entry);
                      }}
                      className="action-button w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 hover:bg-[#22a882] transition-colors shadow-sm"
                      title="Edit"
                    >
                      <img src={EditIcon} alt="Edit" className="w-[18px] h-[18px]" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setExpandedEntryId(null); }}
                      className="action-button w-[48px] h-[95px] bg-[#E4572E] flex rounded-[6px] items-center justify-center gap-1.5 hover:bg-[#cc4d26] transition-colors shadow-sm"
                      title="Delete"
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
      {showImageViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleCloseImageViewer} style={{ fontFamily: "'Manrope', sans-serif" }} >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative z-10 w-full max-w-[90%] mx-4" onClick={(e) => e.stopPropagation()} >
            <div className="relative">
              <img
                src={imageViewerData.images[imageViewerData.currentIndex]}
                alt={`${imageViewerData.itemName} - ${imageViewerData.currentIndex + 1}`}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-2xl"
              />
              <button onClick={handleCloseImageViewer} className="absolute -top-7 -right-1 w-8 h-8 rounded-full flex items-center justify-center z-20 ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#E4572E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {imageViewerData.images.length > 1 && (
                <button onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              {imageViewerData.images.length > 1 && (
                <button onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              {imageViewerData.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
                  <span className="text-[12px] text-white">
                    {imageViewerData.currentIndex + 1} / {imageViewerData.images.length}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span
                className={`w-2 h-2 rounded-full ${imageViewerData.machineStatus === 'Working' ? 'bg-[#4CAF50]' :
                    imageViewerData.machineStatus === 'Not Working' ? 'bg-[#F44336]' :
                      imageViewerData.machineStatus === 'Under Repair' ? 'bg-[#FF9800]' :
                        'bg-[#9E9E9E]'
                  }`}
              ></span>
              <p
                className={`text-[12px] font-medium ${imageViewerData.machineStatus === 'Working' ? 'text-[#4CAF50]' :
                    imageViewerData.machineStatus === 'Not Working' ? 'text-[#F44336]' :
                      imageViewerData.machineStatus === 'Under Repair' ? 'text-[#FF9800]' :
                        'text-[#9E9E9E]'
                  }`}
              >
                {imageViewerData.machineStatus}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;