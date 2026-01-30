import React, { useState, useEffect } from 'react';

const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_management';
const PROJECT_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/project_Names';
const VENDOR_NAMES_BASE_URL = 'https://backendaab.in/aabuilderDash/api/vendor_Names';
const EMPLOYEE_DETAILS_BASE_URL = 'https://backendaab.in/aabuildersDash/api/employee_details';
const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_name';
const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_brand';
const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_id';

const History = ({ user }) => {
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
          console.log('ItemIds Map:', map);
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
          // Filter to only show 'Entry' type data (exclude Service and other types)
          const filteredData = flattenedData.filter(entry => entry.toolsEntryType === 'entry');          
          setHistoryData(filteredData);
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
  return (
    <div className="flex flex-col bg-white min-h-[calc(100vh-90px-80px)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Category Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-gray-200">
        <p className="text-[12px] text-black font-medium">Category</p>
      </div>
      {/* History Entries List */}
      <div className="flex-1 px-4 overflow-y-auto pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">Loading...</p>
          </div>
        ) : historyData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">No history entries found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {historyData.map((entry) => {
              const { date, time } = formatDateTime(entry.createdDateTime);
              const fromLocation = getLocationName(entry.fromProjectId, false);              
              // For "To" location - check based on entry type
              let toLocation = '-';
              if (entry.toolsEntryType === 'Entry') {
                // Entry type: check toProjectId first, then serviceStoreId
                toLocation = getLocationName(entry.toProjectId, false);
                if (toLocation === '-') {
                  toLocation = getLocationName(entry.serviceStoreId, true);
                }
              } else {
                // Service type: check serviceStoreId first (vendors), then toProjectId
                toLocation = getLocationName(entry.serviceStoreId, true);
                if (toLocation === '-') {
                  toLocation = getLocationName(entry.toProjectId, false);
                }
              }              
              const inchargeName = employeesMap[entry.projectInchargeId] || employeesMap[String(entry.projectInchargeId)] || '-';
              const itemName = itemNamesMap[entry.itemNameId] || itemNamesMap[String(entry.itemNameId)] || entry.itemNameId || '-';              
              // Get item ID name (like "AA DM 01") from the map using item_ids_id
              const itemIdName = entry.itemIdsId ? (itemIdsMap[entry.itemIdsId] || itemIdsMap[String(entry.itemIdsId)] || '') : '';
              const hasImages = entry.images.length > 0;              
              // Determine what to show: itemIdName (like "AA DM 01") or quantity
              const displayValue = itemIdName || (entry.quantity > 0 ? String(entry.quantity) : '');
              return (
                <div key={entry.id} className="py-4">
                  {/* Row 1: Entry number + Item Name | Item ID Name or Quantity */}
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-[12px] font-semibold text-black leading-normal">
                      #{entry.eno}, {itemName}
                    </p>
                    <div className="flex flex-col items-end">
                      {displayValue ? (
                        <p 
                          className={`text-[12px] font-semibold leading-normal ${hasImages ? 'text-[#E4572E] cursor-pointer underline' : 'text-black'}`}
                          onClick={() => hasImages && handleOpenImageViewer(entry, itemName, displayValue)}
                        >
                          {displayValue}
                        </p>
                      ) : hasImages ? (
                        <p 
                          className="text-[12px] font-semibold leading-normal text-[#E4572E] cursor-pointer underline"
                          onClick={() => handleOpenImageViewer(entry, itemName, 'View')}
                        >
                          📷 Image
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {/* Row 2: From | Machine Number */}
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-[11px] text-[#848484] leading-normal">
                      From - {fromLocation}
                    </p>
                    {entry.machineNumber && (
                      <p className="text-[12px] leading-normal text-black">
                        {entry.machineNumber}
                      </p>
                    )}
                  </div>
                  {/* Row 3: To | Status */}
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-[11px] text-[#BF9853] leading-normal">
                      To - {toLocation}
                    </p>
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          entry.machineStatus === 'Working' ? 'bg-[#4CAF50]' : 
                          entry.machineStatus === 'Not Working' ? 'bg-[#F44336]' :
                          entry.machineStatus === 'Under Repair' ? 'bg-[#FF9800]' :
                          'bg-[#9E9E9E]'
                        }`}
                      ></span>
                      <p
                        className={`text-[11px] font-medium leading-normal ${
                          entry.machineStatus === 'Working' ? 'text-[#4CAF50]' : 
                          entry.machineStatus === 'Not Working' ? 'text-[#F44336]' :
                          entry.machineStatus === 'Under Repair' ? 'text-[#FF9800]' :
                          'text-[#9E9E9E]'
                        }`}
                      >
                        {entry.machineStatus}
                      </p>
                    </div>
                  </div>
                  {/* Row 4: Date/Time | Person Name */}
                  <div className="flex items-start justify-between">
                    <p className="text-[11px] text-[#848484] leading-normal">
                      {date} • {time}
                    </p>
                    <p className="text-[12px] font-medium text-black leading-normal">
                      {inchargeName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Image Viewer Modal - Floating style */}
      {showImageViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleCloseImageViewer} style={{ fontFamily: "'Manrope', sans-serif" }} >
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>          
          {/* Image Container */}
          <div className="relative z-10 w-full max-w-[90%] mx-4" onClick={(e) => e.stopPropagation()} >
            {/* Image */}
            <div className="relative">
              <img
                src={imageViewerData.images[imageViewerData.currentIndex]}
                alt={`${imageViewerData.itemName} - ${imageViewerData.currentIndex + 1}`}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-2xl"
              />              
              {/* Close Button - Inside image at top right */}
              <button onClick={handleCloseImageViewer} className="absolute -top-7 -right-1 w-8 h-8 rounded-full flex items-center justify-center z-20 ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#E4572E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>              
              {/* Previous Button */}
              {imageViewerData.images.length > 1 && (
                <button onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              {/* Next Button */}
              {imageViewerData.images.length > 1 && (
                <button onClick={handleNextImage}
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
                  imageViewerData.machineStatus === 'Not Working' ? 'bg-[#F44336]' :
                  imageViewerData.machineStatus === 'Under Repair' ? 'bg-[#FF9800]' :
                  'bg-[#9E9E9E]'
                }`}
              ></span>
              <p
                className={`text-[12px] font-medium ${
                  imageViewerData.machineStatus === 'Working' ? 'text-[#4CAF50]' : 
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