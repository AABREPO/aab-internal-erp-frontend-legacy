import React, { useState, useEffect } from 'react';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';

const Transfer = ({ user }) => {
  // Tools Tracker API URLs
  const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_name';
  const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_brand';
  const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_id';
  
  const [entryNo, setEntryNo] = useState(0);
  const [date, setDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  });
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [selectedServiceStore, setSelectedServiceStore] = useState(null);
  const [selectedIncharge, setSelectedIncharge] = useState(null);
  const [items, setItems] = useState([]);
  const [fromOptions, setFromOptions] = useState([]);
  const [toOptions, setToOptions] = useState([]);
  const [serviceStoreOptions, setServiceStoreOptions] = useState([]);
  const [inchargeOptions, setInchargeOptions] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showServiceStoreDropdown, setShowServiceStoreDropdown] = useState(false);
  const [showInchargeDropdown, setShowInchargeDropdown] = useState(false);
  const [toSearchQuery, setToSearchQuery] = useState('');
  const [toFavorites, setToFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteToSites');
    return saved ? JSON.parse(saved) : [];
  });
  const [serviceStoreSearchQuery, setServiceStoreSearchQuery] = useState('');
  const [serviceStoreFavorites, setServiceStoreFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteServiceStores');
    return saved ? JSON.parse(saved) : [];
  });
  const [fromSearchQuery, setFromSearchQuery] = useState('');
  const [fromFavorites, setFromFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteFromSites');
    return saved ? JSON.parse(saved) : [];
  });
  const [inchargeSearchQuery, setInchargeSearchQuery] = useState('');
  const [inchargeFavorites, setInchargeFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteIncharges');
    return saved ? JSON.parse(saved) : [];
  });
  const [entryServiceMode, setEntryServiceMode] = useState('Entry');
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [itemIdOptions, setItemIdOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [addItemFormData, setAddItemFormData] = useState({
    itemName: '',
    itemNameId: null,
    brand: '',
    brandId: null,
    itemId: '',
    itemIdDbId: null,
    quantity: '',
    machineNumber: ''
  });
  // Store full data from tools tracker APIs
  const [toolsItemNameListData, setToolsItemNameListData] = useState([]);
  const [toolsBrandFullData, setToolsBrandFullData] = useState([]);
  const [toolsItemIdFullData, setToolsItemIdFullData] = useState([]);
  const [apiItemIdOptions, setApiItemIdOptions] = useState([]);
  const [stockManagementData, setStockManagementData] = useState([]);
  
  // State for item name quantity count and selected item machine number
  const [selectedItemNameQuantity, setSelectedItemNameQuantity] = useState(0);
  const [selectedItemMachineNumber, setSelectedItemMachineNumber] = useState('');
  
  // State for upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]); // Array of {file, progress, url, id}
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('Working');
  const [uploadDescription, setUploadDescription] = useState('');
  const [statusOptions] = useState(['Working', 'Not Working', 'Under Repair', 'Dead']);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // Image upload is now handled as base64 bytes sent directly to tools_image field
  const TOOLS_STOCK_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_stock_management';
  const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_management';
  
  // State for saving
  const [isSaving, setIsSaving] = useState(false);
  
  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // State for universal search modal
  const [showUniversalSearchModal, setShowUniversalSearchModal] = useState(false);
  const [universalSearchQuery, setUniversalSearchQuery] = useState('');
  const [showSearchConfirmModal, setShowSearchConfirmModal] = useState(false);
  const [selectedSearchItem, setSelectedSearchItem] = useState(null);
  const [showSearchUploadModal, setShowSearchUploadModal] = useState(false);
  const [searchUploadFiles, setSearchUploadFiles] = useState([]);
  const [searchUploadStatus, setSearchUploadStatus] = useState('Working');
  const [searchUploadDescription, setSearchUploadDescription] = useState('');
  const [showSearchStatusDropdown, setShowSearchStatusDropdown] = useState(false);
  
  // State for image viewer modal
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageViewerData, setImageViewerData] = useState({
    images: [],
    currentIndex: 0,
    itemName: '',
    itemId: '',
    toLocation: '',
    machineStatus: ''
  });
  // Fetch sites/projects for From and To dropdowns
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
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.siteName,
          label: item.siteName,
          sNo: item.siteNo,
          id: item.id,
        }));
        setFromOptions(formattedData);
        setToOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);
  // Fetch vendors for Service Store dropdown (only those with makeAsServiceShop === true)
  useEffect(() => {
    const fetchServiceStoreVendors = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll', {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('All vendor data:', data);
          // Filter only vendors with makeAsServiceShop === true
          const serviceStoreVendors = data
            .filter(vendor => vendor.makeAsServiceShop === true)
            .map(vendor => ({
              value: vendor.vendorName,
              label: vendor.vendorName,
              id: vendor.id,
            }));
          console.log('Service store vendors:', serviceStoreVendors);
          setServiceStoreOptions(serviceStoreVendors);
        } else {
          console.log('Error fetching service store vendors.');
        }
      } catch (error) {
        console.error('Error fetching service store vendors:', error);
      }
    };
    fetchServiceStoreVendors();
  }, []);
  // Fetch site incharge
  useEffect(() => {
    const fetchSiteIncharge = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/site_engineers');
        if (response.ok) {
          const data = await response.json();
          const formatted = data.map((item) => ({
            value: item.id,
            label: item.employee_name,
            mobileNumber: item.employee_mobile_number,
            id: item.id,
          }));
          setInchargeOptions(formatted);
        } else {
          console.log('Error fetching site incharge.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchSiteIncharge();
  }, []);
  // Fetch entry number
  useEffect(() => {
    const fetchEntryNo = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/tools_tracker_management/getEntryCount');
        if (response.ok) {
          const data = await response.json();
          setEntryNo(data.eno + 1);
        }
      } catch (error) {
        console.error('Error fetching entry number:', error);
      }
    };
    fetchEntryNo();
  }, []);
  // Reset search when dropdowns close
  useEffect(() => {
    if (!showToDropdown) {
      setToSearchQuery('');
    }
    if (!showServiceStoreDropdown) {
      setServiceStoreSearchQuery('');
    }
    if (!showFromDropdown) {
      setFromSearchQuery('');
    }
    if (!showInchargeDropdown) {
      setInchargeSearchQuery('');
    }
  }, [showToDropdown, showServiceStoreDropdown, showFromDropdown, showInchargeDropdown]);
  // Normalize search text for flexible matching
  const normalizeSearchText = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };
  // Filter and sort To options
  const getFilteredToOptions = () => {
    const normalizedQuery = normalizeSearchText(toSearchQuery);
    const filtered = toOptions.filter(option => {
      const normalizedLabel = normalizeSearchText(option.label);
      return normalizedLabel.includes(normalizedQuery);
    });
    // Sort: favorites first, then alphabetically
    return filtered.sort((a, b) => {
      const aIsFavorite = toFavorites.includes(a.id);
      const bIsFavorite = toFavorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.label.localeCompare(b.label);
    });
  };
  // Handle toggle favorite for To options
  const handleToggleToFavorite = (e, optionId) => {
    e.stopPropagation();
    const newFavorites = toFavorites.includes(optionId)
      ? toFavorites.filter(id => id !== optionId)
      : [...toFavorites, optionId];
    setToFavorites(newFavorites);
    localStorage.setItem('favoriteToSites', JSON.stringify(newFavorites));
  };
  // Filter and sort From options
  const getFilteredFromOptions = () => {
    const normalizedQuery = normalizeSearchText(fromSearchQuery);
    const filtered = fromOptions.filter(option => {
      const normalizedLabel = normalizeSearchText(option.label);
      return normalizedLabel.includes(normalizedQuery);
    });
    // Sort: favorites first, then alphabetically
    return filtered.sort((a, b) => {
      const aIsFavorite = fromFavorites.includes(a.id);
      const bIsFavorite = fromFavorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.label.localeCompare(b.label);
    });
  };
  // Handle toggle favorite for From options
  const handleToggleFromFavorite = (e, optionId) => {
    e.stopPropagation();
    const newFavorites = fromFavorites.includes(optionId)
      ? fromFavorites.filter(id => id !== optionId)
      : [...fromFavorites, optionId];
    setFromFavorites(newFavorites);
    localStorage.setItem('favoriteFromSites', JSON.stringify(newFavorites));
  };
  // Filter and sort Incharge options
  const getFilteredInchargeOptions = () => {
    const normalizedQuery = normalizeSearchText(inchargeSearchQuery);
    const filtered = inchargeOptions.filter(option => {
      const normalizedLabel = normalizeSearchText(option.label);
      return normalizedLabel.includes(normalizedQuery);
    });
    // Sort: favorites first, then alphabetically
    return filtered.sort((a, b) => {
      const aIsFavorite = inchargeFavorites.includes(a.id);
      const bIsFavorite = inchargeFavorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.label.localeCompare(b.label);
    });
  };
  // Handle toggle favorite for Incharge options
  const handleToggleInchargeFavorite = (e, optionId) => {
    e.stopPropagation();
    const newFavorites = inchargeFavorites.includes(optionId)
      ? inchargeFavorites.filter(id => id !== optionId)
      : [...inchargeFavorites, optionId];
    setInchargeFavorites(newFavorites);
    localStorage.setItem('favoriteIncharges', JSON.stringify(newFavorites));
  };
  // Filter and sort Service Store options
  const getFilteredServiceStoreOptions = () => {
    const normalizedQuery = normalizeSearchText(serviceStoreSearchQuery);
    const filtered = serviceStoreOptions.filter(option => {
      const normalizedLabel = normalizeSearchText(option.label);
      return normalizedLabel.includes(normalizedQuery);
    });
    // Sort: favorites first, then alphabetically
    return filtered.sort((a, b) => {
      const aIsFavorite = serviceStoreFavorites.includes(a.id);
      const bIsFavorite = serviceStoreFavorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.label.localeCompare(b.label);
    });
  };
  // Handle toggle favorite for Service Store options
  const handleToggleServiceStoreFavorite = (e, optionId) => {
    e.stopPropagation();
    const newFavorites = serviceStoreFavorites.includes(optionId)
      ? serviceStoreFavorites.filter(id => id !== optionId)
      : [...serviceStoreFavorites, optionId];
    setServiceStoreFavorites(newFavorites);
    localStorage.setItem('favoriteServiceStores', JSON.stringify(newFavorites));
  };
  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return `${day}/${month}/${year}`;
  };
  // Check if all required fields are filled based on mode
  const areFieldsFilled = entryServiceMode === 'Entry' 
    ? (selectedFrom && selectedTo && selectedIncharge)
    : (selectedFrom && selectedServiceStore && selectedIncharge);

  // Handler for switching to Entry mode
  const handleSwitchToEntry = () => {
    setEntryServiceMode('Entry');
    // Clear Service Store when switching to Entry mode
    setSelectedServiceStore(null);
  };

  // Handler for switching to Service mode
  const handleSwitchToService = () => {
    setEntryServiceMode('Service');
    // Clear To project when switching to Service mode
    setSelectedTo(null);
  };
  // Fetch tools item names from tools tracker API
  useEffect(() => {
    const fetchToolsItemNames = async () => {
      try {
        const response = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setToolsItemNameListData(Array.isArray(data) ? data : []);
          const itemNameOpts = (Array.isArray(data) ? data : [])
            .map(item => item?.item_name ?? item?.itemName)
            .filter(Boolean);
          setItemNameOptions(Array.from(new Set(itemNameOpts)));
        }
      } catch (error) {
        console.error('Error fetching tools item names:', error);
      }
    };
    fetchToolsItemNames();
  }, []);

  // Fetch tools brands from tools tracker API
  useEffect(() => {
    const fetchToolsBrands = async () => {
      try {
        const response = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          // Store full brand data with IDs
          setToolsBrandFullData(Array.isArray(data) ? data : []);
          const brandOpts = (Array.isArray(data) ? data : [])
            .map(b => b?.tools_brand?.trim() ?? b?.toolsBrand?.trim())
            .filter(b => b);
          setBrandOptions(Array.from(new Set(brandOpts)));
        }
      } catch (error) {
        console.error('Error fetching tools brands:', error);
      }
    };
    fetchToolsBrands();
  }, []);

  // Fetch tools item IDs from tools tracker API
  useEffect(() => {
    const fetchToolsItemIds = async () => {
      try {
        const response = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          // Store full item ID data with IDs
          setToolsItemIdFullData(Array.isArray(data) ? data : []);
          const itemIdOpts = (Array.isArray(data) ? data : [])
            .map(item => item?.item_id?.trim() ?? item?.itemId?.trim())
            .filter(item => item)
            // Filter out purely numeric values (these are likely database IDs, not actual item IDs)
            .filter(item => !/^\d+$/.test(item));
          setApiItemIdOptions(itemIdOpts);
          setItemIdOptions(itemIdOpts);
        }
      } catch (error) {
        console.error('Error fetching tools item IDs:', error);
      }
    };
    fetchToolsItemIds();
  }, []);

  // Fetch stock management data to get machine numbers
  useEffect(() => {
    const fetchStockManagement = async () => {
      try {
        const response = await fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setStockManagementData(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching stock management data:', error);
      }
    };
    fetchStockManagement();
  }, []);
  const handleAddItem = () => {
    if (areFieldsFilled) {
      setShowAddItemsModal(true);
    }
  };
  const handleCloseAddItemsModal = () => {
    setShowAddItemsModal(false);
    setAddItemFormData({
      itemName: '',
      itemNameId: null,
      brand: '',
      brandId: null,
      itemId: '',
      itemIdDbId: null,
      quantity: '',
      machineNumber: ''
    });
    setSelectedItemNameQuantity(0);
    setSelectedItemMachineNumber('');
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadFiles([]);
    setIsUploading(false);
    setUploadStatus('Working');
    setUploadDescription('');
  };
  const handleAddItemSubmit = () => {
    // Only Item Name is required, other fields are optional
    if (addItemFormData.itemName) {
      // Show upload modal instead of directly adding
      setShowUploadModal(true);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:image/png;base64,") to get raw base64
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setIsUploading(true);
    
    // Process each file
    for (const file of files) {
      const fileId = Date.now() + Math.random();
      
      // Create local preview URL for UI display
      const localPreviewUrl = URL.createObjectURL(file);
      
      // Add file to list with initial progress
      setUploadFiles(prev => [...prev, {
        id: fileId,
        file: file,
        name: file.name,
        size: file.size,
        progress: 0,
        localUrl: localPreviewUrl,
        base64Data: null
      }]);
      
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadFiles(prev => prev.map(f => 
            f.id === fileId && f.progress < 90 
              ? { ...f, progress: f.progress + 10 }
              : f
          ));
        }, 100);
        
        // Convert file to base64
        const base64Data = await fileToBase64(file);
        
        clearInterval(progressInterval);
        
        // Update file with base64 data and 100% progress
        setUploadFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, progress: 100, base64Data: base64Data }
            : f
        ));
      } catch (error) {
        console.error('Error converting file to base64:', error);
        // Remove failed file from list
        setUploadFiles(prev => prev.filter(f => f.id !== fileId));
        alert(`Failed to process ${file.name}. Please try again.`);
      }
    }
    
    setIsUploading(false);
    e.target.value = '';
  };

  const handleConfirmUpload = () => {
    // Add item with all data including upload info
    // Send images as base64 bytes to tools_image field
    const uploadedImages = uploadFiles
      .filter(f => f.base64Data) // Only include files with base64 data
      .map(f => ({
        tools_image: f.base64Data // Send as byte array (base64 encoded)
      }));
    
    // Also keep local URLs for UI display
    const localImageUrls = uploadFiles
      .filter(f => f.localUrl)
      .map(f => f.localUrl);
    
    // Structure the item according to ToolsTrackerItemNameTable entity
    const newItem = {
      id: Date.now(), // Temporary ID for UI
      timestamp: new Date().toISOString().slice(0, 19), // LocalDateTime format
      item_name_id: addItemFormData.itemNameId ? String(addItemFormData.itemNameId) : null,
      item_ids_id: addItemFormData.itemIdDbId ? String(addItemFormData.itemIdDbId) : null,
      brand_id: addItemFormData.brandId ? String(addItemFormData.brandId) : null,
      model: '', // Can be added if needed
      machine_number: addItemFormData.machineNumber || '',
      quantity: addItemFormData.quantity ? parseInt(addItemFormData.quantity, 10) : 0,
      machine_status: uploadStatus,
      description: uploadDescription,
      tools_item_live_images: uploadedImages, // For backend (base64 bytes)
      localImageUrls: localImageUrls, // For UI display only
      // Keep display data for UI
      itemName: addItemFormData.itemName,
      brand: addItemFormData.brand,
      itemId: addItemFormData.itemId
    };
    setItems([...items, newItem]);
    
    // Close both modals
    handleCloseUploadModal();
    handleCloseAddItemsModal();
  };

  // Function to save all data to the API
  const handleSaveTransfer = async () => {
    if (!selectedFrom || !selectedIncharge) {
      alert('Please fill in all required fields (From and Project Incharge)');
      return;
    }
    
    if (entryServiceMode === 'Entry' && !selectedTo) {
      alert('Please select the "To" field');
      return;
    }
    
    if (entryServiceMode === 'Service' && !selectedServiceStore) {
      alert('Please select the Service Store');
      return;
    }
    
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Build the payload according to ToolsTrackerManagement entity
      const payload = {
        from_project_id: selectedFrom?.id ? String(selectedFrom.id) : null,
        to_project_id: entryServiceMode === 'Entry' && selectedTo?.id ? String(selectedTo.id) : null,
        project_incharge_id: selectedIncharge?.id ? String(selectedIncharge.id) : null,
        service_store_id: entryServiceMode === 'Service' && selectedServiceStore?.id ? String(selectedServiceStore.id) : null,
        created_by: user?.name || user?.username || 'mobile',
        tools_entry_type: entryServiceMode.toLowerCase(), // "entry" or "service"
        eno: String(entryNo),
        tools_tracker_item_name_table: items.map(item => ({
          timestamp: item.timestamp || new Date().toISOString().slice(0, 19),
          item_name_id: item.item_name_id || null,
          item_ids_id: item.item_ids_id || null,
          brand_id: item.brand_id || null,
          model: item.model || '',
          machine_number: item.machine_number || '',
          quantity: item.quantity || 0,
          machine_status: item.machine_status || 'Working',
          description: item.description || '',
          tools_item_live_images: item.tools_item_live_images || []
        }))
      };
      
      const response = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      alert('Transfer saved successfully!');
      
      // Reset form after successful save
      setSelectedFrom(null);
      setSelectedTo(null);
      setSelectedServiceStore(null);
      setSelectedIncharge(null);
      setItems([]);
      setEntryNo(prev => prev + 1);
      
    } catch (error) {
      console.error('Error saving transfer:', error);
      alert('Failed to save transfer. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to remove an item from the list
  const handleRemoveItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Image viewer handlers
  const handleOpenImageViewer = (item, imageIndex = 0) => {
    // Use localImageUrls for UI display
    const images = item.localImageUrls || [];
    if (images.length === 0) return;
    
    setImageViewerData({
      images: images,
      currentIndex: imageIndex,
      itemName: item.itemName || 'Unknown Item',
      itemId: item.itemId || '',
      toLocation: selectedTo?.label || selectedServiceStore?.label || '',
      machineStatus: item.machine_status || 'Working'
    });
    setShowImageViewer(true);
  };

  const handleCloseImageViewer = () => {
    setShowImageViewer(false);
  };

  const handlePrevImage = () => {
    setImageViewerData(prev => ({
      ...prev,
      currentIndex: prev.currentIndex > 0 ? prev.currentIndex - 1 : prev.images.length - 1
    }));
  };

  const handleNextImage = () => {
    setImageViewerData(prev => ({
      ...prev,
      currentIndex: prev.currentIndex < prev.images.length - 1 ? prev.currentIndex + 1 : 0
    }));
  };

  const handleDeleteUploadFile = (fileId) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Universal Search Handlers
  const handleOpenUniversalSearch = () => {
    setUniversalSearchQuery('');
    setShowUniversalSearchModal(true);
  };

  const handleCloseUniversalSearch = () => {
    setShowUniversalSearchModal(false);
    setUniversalSearchQuery('');
  };

  const handleSelectSearchItem = (item) => {
    setSelectedSearchItem(item);
    setShowUniversalSearchModal(false);
    setShowSearchConfirmModal(true);
  };

  const handleConfirmSearchItem = () => {
    setShowSearchConfirmModal(false);
    setSearchUploadFiles([]);
    setSearchUploadStatus('Working');
    setSearchUploadDescription('');
    setShowSearchUploadModal(true);
  };

  const handleCancelSearchConfirm = () => {
    setShowSearchConfirmModal(false);
    setSelectedSearchItem(null);
  };

  const handleCloseSearchUploadModal = () => {
    setShowSearchUploadModal(false);
    setSelectedSearchItem(null);
    setSearchUploadFiles([]);
    setSearchUploadStatus('Working');
    setSearchUploadDescription('');
  };

  const handleSearchFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is 5MB.`);
        return;
      }
      const newFile = {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        progress: 100,
        base64: null
      };
      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        setSearchUploadFiles(prev => prev.map(f => 
          f.id === newFile.id ? { ...f, base64: base64String } : f
        ));
      };
      reader.readAsDataURL(file);
      setSearchUploadFiles(prev => [...prev, newFile]);
    });
    e.target.value = '';
  };

  const handleDeleteSearchUploadFile = (fileId) => {
    setSearchUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleConfirmSearchUpload = () => {
    if (!selectedSearchItem) return;
    
    // Get item details from the selected search item
    const itemNameObj = toolsItemNameListData.find(
      item => String(item?.id) === String(selectedSearchItem?.item_name_id ?? selectedSearchItem?.itemNameId)
    );
    const brandObj = toolsBrandFullData.find(
      item => String(item?.id) === String(selectedSearchItem?.brand_id ?? selectedSearchItem?.brandId)
    );
    const itemIdObj = toolsItemIdFullData.find(
      item => String(item?.id) === String(selectedSearchItem?.item_ids_id ?? selectedSearchItem?.itemIdsId)
    );

    const newItem = {
      id: Date.now(),
      itemName: itemNameObj?.item_name || itemNameObj?.itemName || 'Unknown',
      itemNameId: selectedSearchItem?.item_name_id ?? selectedSearchItem?.itemNameId,
      brand: brandObj?.tools_brand || brandObj?.toolsBrand || '',
      brandId: selectedSearchItem?.brand_id ?? selectedSearchItem?.brandId,
      itemId: itemIdObj?.item_id || itemIdObj?.itemId || '',
      itemIdDbId: selectedSearchItem?.item_ids_id ?? selectedSearchItem?.itemIdsId,
      machineNumber: selectedSearchItem?.machine_number ?? selectedSearchItem?.machineNumber ?? '',
      machine_number: selectedSearchItem?.machine_number ?? selectedSearchItem?.machineNumber ?? '',
      quantity: selectedSearchItem?.quantity || 1,
      machine_status: searchUploadStatus,
      description: searchUploadDescription,
      localImageUrls: searchUploadFiles.filter(f => f.base64).map(f => `data:image/jpeg;base64,${f.base64}`),
      imageBase64List: searchUploadFiles.filter(f => f.base64).map(f => f.base64)
    };
    
    setItems([...items, newItem]);
    handleCloseSearchUploadModal();
  };

  // Get filtered items for universal search
  const getFilteredSearchItems = () => {
    if (!stockManagementData || stockManagementData.length === 0) return [];
    
    return stockManagementData.filter(item => {
      const itemNameObj = toolsItemNameListData.find(
        i => String(i?.id) === String(item?.item_name_id ?? item?.itemNameId)
      );
      const itemIdObj = toolsItemIdFullData.find(
        i => String(i?.id) === String(item?.item_ids_id ?? item?.itemIdsId)
      );
      const brandObj = toolsBrandFullData.find(
        i => String(i?.id) === String(item?.brand_id ?? item?.brandId)
      );
      
      const itemName = itemNameObj?.item_name || itemNameObj?.itemName || '';
      const itemIdName = itemIdObj?.item_id || itemIdObj?.itemId || '';
      const brandName = brandObj?.tools_brand || brandObj?.toolsBrand || '';
      const machineNumber = item?.machine_number ?? item?.machineNumber ?? '';
      
      const searchLower = universalSearchQuery.toLowerCase();
      return (
        itemName.toLowerCase().includes(searchLower) ||
        itemIdName.toLowerCase().includes(searchLower) ||
        brandName.toLowerCase().includes(searchLower) ||
        machineNumber.toLowerCase().includes(searchLower)
      );
    });
  };

  // Format date for search items
  const formatSearchItemDate = (timestamp) => {
    if (!timestamp) return '';
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
      return `${formattedDate} • ${formattedTime}`;
    } catch {
      return '';
    }
  };

  const handleFieldChange = (field, value) => {
    setAddItemFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Mutual exclusivity: Item ID and Quantity
      if (field === 'itemId' && value) {
        // If Item ID is selected, clear Quantity
        updated.quantity = '';
      } else if (field === 'quantity' && value && value.trim() !== '') {
        // If Quantity is entered, clear Item ID
        updated.itemId = '';
        updated.itemIdDbId = null;
        updated.machineNumber = '';
        setSelectedItemMachineNumber('');
      }
      
      // Store IDs for dropdown selections
      if (field === 'itemName' && value) {
        const itemNameObj = toolsItemNameListData.find(
          item => (item?.item_name ?? item?.itemName) === value
        );
        updated.itemNameId = itemNameObj?.id ?? null;
        
        // Calculate quantity count from tools_details or stock management
        const toolsDetails = Array.isArray(itemNameObj?.tools_details)
          ? itemNameObj.tools_details
          : Array.isArray(itemNameObj?.toolsDetails)
            ? itemNameObj.toolsDetails
            : [];
        
        // Count from stock management data for this item name
        const stockCount = stockManagementData.filter(item => {
          const itemNameId = item?.item_name_id ?? item?.itemNameId;
          return String(itemNameId) === String(itemNameObj?.id);
        }).length;
        
        const quantityCount = Math.max(toolsDetails.length, stockCount);
        setSelectedItemNameQuantity(quantityCount);
      } else if (field === 'itemName' && !value) {
        updated.itemNameId = null;
        setSelectedItemNameQuantity(0);
      }
      
      if (field === 'brand' && value) {
        const brandObj = toolsBrandFullData.find(
          b => (b?.tools_brand?.trim() ?? b?.toolsBrand?.trim()) === value
        );
        updated.brandId = brandObj?.id ?? null;
      } else if (field === 'brand' && !value) {
        updated.brandId = null;
      }
      
      if (field === 'itemId' && value) {
        const itemIdObj = toolsItemIdFullData.find(
          item => (item?.item_id?.trim() ?? item?.itemId?.trim()) === value
        );
        updated.itemIdDbId = itemIdObj?.id ?? null;
        
        // Find machine number from stock management data
        const stockItem = stockManagementData.find(item => {
          const itemIdsId = item?.item_ids_id ?? item?.itemIdsId;
          return String(itemIdsId) === String(itemIdObj?.id);
        });
        const machineNum = stockItem?.machine_number ?? stockItem?.machineNumber ?? '';
        updated.machineNumber = machineNum;
        setSelectedItemMachineNumber(machineNum);
      } else if (field === 'itemId' && !value) {
        updated.itemIdDbId = null;
        updated.machineNumber = '';
        setSelectedItemMachineNumber('');
      }
      
      return updated;
    });
  };

  // Handler for when user adds a new item name via dropdown
  const handleAddNewItemName = async (newItemName) => {
    if (!newItemName || !newItemName.trim()) {
      return;
    }
    const trimmedName = newItemName.trim();
    // Check if item name already exists
    if (itemNameOptions.some(name => name.toLowerCase() === trimmedName.toLowerCase())) {
      handleFieldChange('itemName', trimmedName);
      return;
    }
    try {
      // Save new item name to API (with empty tools_details array)
      const payload = {
        category_id: selectedCategory?.id ?? null,
        item_name: trimmedName,
        tools_details: []
      };
      const res = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Failed to save: ${res.status} ${res.statusText}`);
      }
      // Refresh item names list
      const refreshed = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/getAll`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        setToolsItemNameListData(Array.isArray(data) ? data : []);
        const names = (Array.isArray(data) ? data : [])
          .map(item => item?.item_name ?? item?.itemName)
          .filter(Boolean);
        setItemNameOptions(Array.from(new Set(names)));
        // Set the newly created item name as selected
        handleFieldChange('itemName', trimmedName);
      }
    } catch (e) {
      console.error('Error saving new Item Name:', e);
      alert('Failed to save new Item Name. Please try again.');
    }
  };

  // Handler for when user adds a new brand via dropdown
  const handleAddNewBrand = async (newBrand) => {
    if (!newBrand || !newBrand.trim()) {
      return;
    }
    const trimmedBrand = newBrand.trim();
    // Check if brand already exists
    if (brandOptions.some(b => b.toLowerCase() === trimmedBrand.toLowerCase())) {
      handleFieldChange('brand', trimmedBrand);
      return;
    }
    try {
      // Save new brand to API
      const payload = {
        tools_brand: trimmedBrand
      };
      const res = await fetch(`${TOOLS_BRAND_BASE_URL}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Failed to save: ${res.status} ${res.statusText}`);
      }
      // Refresh brands list
      const refreshed = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        // Store full brand data with IDs
        setToolsBrandFullData(Array.isArray(data) ? data : []);
        const brandOpts = (Array.isArray(data) ? data : [])
          .map(b => b?.tools_brand?.trim() ?? b?.toolsBrand?.trim())
          .filter(b => b);
        setBrandOptions(Array.from(new Set(brandOpts)));
        // Set the newly created brand as selected
        handleFieldChange('brand', trimmedBrand);
      }
    } catch (e) {
      console.error('Error saving new Brand:', e);
      alert('Failed to save new Brand. Please try again.');
    }
  };

  // Handler for when user adds a new item ID via dropdown
  const handleAddNewItemId = async (newItemId) => {
    if (!newItemId || !newItemId.trim()) {
      return;
    }
    const trimmedItemId = newItemId.trim();
    // Check if item ID already exists
    if (itemIdOptions.some(id => id.toLowerCase() === trimmedItemId.toLowerCase())) {
      handleFieldChange('itemId', trimmedItemId);
      return;
    }
    try {
      // Save new item ID to API
      const payload = {
        item_id: trimmedItemId
      };
      const res = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Failed to save: ${res.status} ${res.statusText}`);
      }
      // Refresh item IDs list
      const refreshed = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        // Store full item ID data with IDs
        setToolsItemIdFullData(Array.isArray(data) ? data : []);
        const itemIdOpts = (Array.isArray(data) ? data : [])
          .map(item => item?.item_id?.trim() ?? item?.itemId?.trim())
          .filter(item => item)
          .filter(item => !/^\d+$/.test(item));
        setApiItemIdOptions(itemIdOpts);
        setItemIdOptions(itemIdOpts);
        // Set the newly created item ID as selected
        handleFieldChange('itemId', trimmedItemId);
      }
    } catch (e) {
      console.error('Error saving new Item ID:', e);
      alert('Failed to save new Item ID. Please try again.');
    }
  };
  return (
    <div className="flex flex-col min-h-[calc(100vh-90px-80px)] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Entry Number and Date with Transfer Button */}
      <div className="flex-shrink-0 px-4 pt-2 pb-1 flex items-center justify-between">
        <p className="text-[12px] font-medium text-black leading-normal">
          #{entryNo || 'NO'} {date}
        </p>
        {/* Transfer Button - Show when items exist */}
        {items.length > 0 && areFieldsFilled && (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isSaving}
            className="flex items-center gap-1 text-[14px] font-medium text-black"
          >
            <span>Transfer</span>
            {isSaving ? (
              <span className="text-gray-500">...</span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5H6C5.46957 5 4.96086 5.21071 4.58579 5.58579C4.21071 5.96086 4 6.46957 4 7V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H17C17.5304 20 18.0391 19.7893 18.4142 19.4142C18.7893 19.0391 19 18.5304 19 18V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.5 2.5C17.8978 2.10217 18.4374 1.87868 19 1.87868C19.5626 1.87868 20.1022 2.10217 20.5 2.5C20.8978 2.89782 21.1213 3.43739 21.1213 4C21.1213 4.56261 20.8978 5.10217 20.5 5.5L12 14L8 15L9 11L17.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {/* Entry/Service Segmented Control */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3">
        <div className="flex bg-[#E0E0E0] items-center h-[36px] rounded-[8px] p-1">
          <button
            onClick={handleSwitchToEntry}
            className={`flex-1 h-full rounded-[6px] text-[12px] font-semibold leading-normal transition-colors ${
              entryServiceMode === 'Entry'
                ? 'bg-white text-black'
                : 'bg-transparent text-[#848484]'
            }`}
          >
            Entry
          </button>
          <button
            onClick={handleSwitchToService}
            className={`flex-1 h-full rounded-[6px] text-[12px] font-semibold leading-normal transition-colors ${
              entryServiceMode === 'Service'
                ? 'bg-white text-black'
                : 'bg-transparent text-[#848484]'
            }`}
          >
            Service
          </button>
        </div>
      </div>

      {/* Summary View - Show when items exist */}
      {items.length > 0 && (
        <div className="flex-shrink-0 px-4 pt-2">
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="text-[12px] text-gray-500 w-[100px]">From</span>
                <span className="text-[12px] text-gray-500 mx-2">:</span>
                <span className="text-[12px] text-gray-700">{selectedFrom?.label || '-'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[12px] text-gray-500 w-[100px]">{entryServiceMode === 'Entry' ? 'To' : 'Service Store'}</span>
                <span className="text-[12px] text-gray-500 mx-2">:</span>
                <span className="text-[12px] text-gray-700">
                  {entryServiceMode === 'Entry' ? (selectedTo?.label || '-') : (selectedServiceStore?.label || '-')}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-[12px] text-gray-500 w-[100px]">Project Incharge</span>
                <span className="text-[12px] text-gray-500 mx-2">:</span>
                <span className="text-[12px] text-gray-700">{selectedIncharge?.label || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Fields - Show when no items */}
      {items.length === 0 && (
      <div className="flex-shrink-0 px-4 pt-4">
        {/* From Field */}
        <div className="mb-4 relative dropdown-container">
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            From<span className="text-[#eb2f8e]">*</span>
          </p>
          <div className="relative">
            <div
              onClick={() => {
                setShowFromDropdown(!showFromDropdown);
                setShowToDropdown(false);
                setShowInchargeDropdown(false);
              }}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                color: selectedFrom ? '#000' : '#9E9E9E',
                boxSizing: 'border-box',
                paddingRight: selectedFrom ? '40px' : '40px'
              }}
            >
              {selectedFrom ? selectedFrom.label : 'Select'}
            </div>
            {selectedFrom && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFrom(null);
                }}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* From Field Modal */}
        {showFromDropdown && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFromDropdown(false);
              }
            }}
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <div 
              className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 pt-5">
                <p className="text-[16px] font-semibold text-black">Select From</p>
                <button 
                  onClick={() => setShowFromDropdown(false)} 
                  className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
                >
                  ×
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 pt-4 pb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={fromSearchQuery}
                    onChange={(e) => setFromSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full h-[32px] pl-10 pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                    autoFocus
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" />
                      <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Options List */}
              <div className="flex-1 overflow-y-auto mb-4 px-6">
                <div className="shadow-md rounded-lg overflow-hidden">
                  {/* Create New Option - Show when typing something that doesn't exist */}
                  {fromSearchQuery.trim() && !fromOptions.some(opt => {
                    const normalizedOpt = normalizeSearchText(opt.label);
                    const normalizedQuery = normalizeSearchText(fromSearchQuery.trim());
                    return normalizedOpt === normalizedQuery;
                  }) && (
                    <button
                      onClick={() => {
                        // Handle new item creation - you can add your logic here
                        console.log('Create new item:', fromSearchQuery);
                      }}
                      className="w-full h-[36px] px-6 flex items-center bg-gray-100 gap-2 hover:bg-[#F5F5F5] transition-colors"
                    >
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-[14px] text-gray-600 font-normal text-left truncate">"{fromSearchQuery.trim()}"</p>
                    </button>
                  )}
                  {getFilteredFromOptions().length > 0 ? (
                    <div className="space-y-0">
                      {getFilteredFromOptions().map((option) => {
                        const isFavorite = fromFavorites.includes(option.id);
                        const isSelected = selectedFrom?.id === option.id;
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedFrom(option);
                              setShowFromDropdown(false);
                            }}
                            className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${
                              isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                            }`}
                          >
                            {/* Left: Star Icon and Option Text */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button
                                onClick={(e) => handleToggleFromFavorite(e, option.id)}
                                className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                              >
                                {isFavorite ? (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </button>
                              <p className="text-[14px] font-medium text-black text-left truncate">{option.label}</p>
                            </div>

                            {/* Right: Radio Button */}
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                              {isSelected ? (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none"/>
                                  <circle cx="10" cy="10" r="4" fill="#e4572e"/>
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none"/>
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                        {fromSearchQuery ? 'No options found' : 'No options available'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* To Field - Only show in Entry mode */}
        {entryServiceMode === 'Entry' && (
          <div className="mb-4 relative dropdown-container">
            <p className="text-[12px] font-semibold text-black leading-normal mb-1">
              To<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <div
                onClick={() => {
                  setShowToDropdown(!showToDropdown);
                  setShowFromDropdown(false);
                  setShowServiceStoreDropdown(false);
                  setShowInchargeDropdown(false);
                }}
                className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  color: selectedTo ? '#000' : '#9E9E9E',
                  boxSizing: 'border-box',
                  paddingRight: selectedTo ? '40px' : '40px'
                }}
              >
                {selectedTo ? selectedTo.label : 'Select'}
              </div>
              {selectedTo && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTo(null);
                  }}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Service Store Field - Only show in Service mode */}
        {entryServiceMode === 'Service' && (
          <div className="mb-4 relative dropdown-container">
            <p className="text-[12px] font-semibold text-black leading-normal mb-1">
              Service Store<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <div
                onClick={() => {
                  setShowServiceStoreDropdown(!showServiceStoreDropdown);
                  setShowFromDropdown(false);
                  setShowToDropdown(false);
                  setShowInchargeDropdown(false);
                }}
                className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  color: selectedServiceStore ? '#000' : '#9E9E9E',
                  boxSizing: 'border-box',
                  paddingRight: selectedServiceStore ? '40px' : '40px'
                }}
              >
                {selectedServiceStore ? selectedServiceStore.label : 'Select'}
              </div>
              {selectedServiceStore && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedServiceStore(null);
                  }}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        )}
        {/* To Field Modal */}
        {showToDropdown && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowToDropdown(false);
              }
            }}
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <div 
              className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 pt-5">
                <p className="text-[16px] font-semibold text-black">Select To</p>
                <button 
                  onClick={() => setShowToDropdown(false)} 
                  className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
                >
                  ×
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 pt-4 pb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={toSearchQuery}
                    onChange={(e) => setToSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full h-[32px] pl-10 pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                    autoFocus
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" />
                      <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Options List */}
              <div className="flex-1 overflow-y-auto mb-4 px-6">
                <div className="shadow-md rounded-lg overflow-hidden">
                  {/* Create New Option - Show when typing something that doesn't exist */}
                  {toSearchQuery.trim() && !toOptions.some(opt => {
                    const normalizedOpt = normalizeSearchText(opt.label);
                    const normalizedQuery = normalizeSearchText(toSearchQuery.trim());
                    return normalizedOpt === normalizedQuery;
                  }) && (
                    <button
                      onClick={() => {
                        // Handle new item creation - you can add your logic here
                        console.log('Create new item:', toSearchQuery);
                      }}
                      className="w-full h-[36px] px-6 flex items-center bg-gray-100 gap-2 hover:bg-[#F5F5F5] transition-colors"
                    >
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-[14px] text-gray-600 font-normal text-left truncate">"{toSearchQuery.trim()}"</p>
                    </button>
                  )}
                  {getFilteredToOptions().length > 0 ? (
                    <div className="space-y-0">
                      {getFilteredToOptions().map((option) => {
                        const isFavorite = toFavorites.includes(option.id);
                        const isSelected = selectedTo?.id === option.id;
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedTo(option);
                              setShowToDropdown(false);
                            }}
                            className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${
                              isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                            }`}
                          >
                            {/* Left: Star Icon and Option Text */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button
                                onClick={(e) => handleToggleToFavorite(e, option.id)}
                                className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                              >
                                {isFavorite ? (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </button>
                              <p className="text-[14px] font-medium text-black text-left truncate">{option.label}</p>
                            </div>

                            {/* Right: Radio Button */}
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                              {isSelected ? (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none"/>
                                  <circle cx="10" cy="10" r="4" fill="#e4572e"/>
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none"/>
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                        {toSearchQuery ? 'No options found' : 'No options available'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Store Field Modal */}
        {showServiceStoreDropdown && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowServiceStoreDropdown(false);
              }
            }}
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <div 
              className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 pt-5">
                <p className="text-[16px] font-semibold text-black">Select Service Store</p>
                <button 
                  onClick={() => setShowServiceStoreDropdown(false)} 
                  className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
                >
                  ×
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 pt-4 pb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={serviceStoreSearchQuery}
                    onChange={(e) => setServiceStoreSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full h-[32px] pl-10 pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                    autoFocus
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" />
                      <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Options List */}
              <div className="flex-1 overflow-y-auto mb-4 px-6">
                <div className="shadow-md rounded-lg overflow-hidden">
                  {/* Create New Option - Show when typing something that doesn't exist */}
                  {serviceStoreSearchQuery.trim() && !serviceStoreOptions.some(opt => {
                    const normalizedOpt = normalizeSearchText(opt.label);
                    const normalizedQuery = normalizeSearchText(serviceStoreSearchQuery.trim());
                    return normalizedOpt === normalizedQuery;
                  }) && (
                    <button
                      onClick={() => {
                        // Handle new item creation - you can add your logic here
                        console.log('Create new item:', serviceStoreSearchQuery);
                      }}
                      className="w-full h-[36px] px-6 flex items-center bg-gray-100 gap-2 hover:bg-[#F5F5F5] transition-colors"
                    >
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-[14px] text-gray-600 font-normal text-left truncate">"{serviceStoreSearchQuery.trim()}"</p>
                    </button>
                  )}
                  {getFilteredServiceStoreOptions().length > 0 ? (
                    <div className="space-y-0">
                      {getFilteredServiceStoreOptions().map((option) => {
                        const isFavorite = serviceStoreFavorites.includes(option.id);
                        const isSelected = selectedServiceStore?.id === option.id;
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedServiceStore(option);
                              setShowServiceStoreDropdown(false);
                            }}
                            className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${
                              isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                            }`}
                          >
                            {/* Left: Star Icon and Option Text */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button
                                onClick={(e) => handleToggleServiceStoreFavorite(e, option.id)}
                                className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                              >
                                {isFavorite ? (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </button>
                              <p className="text-[14px] font-medium text-black text-left truncate">{option.label}</p>
                            </div>

                            {/* Right: Radio Button */}
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                              {isSelected ? (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none"/>
                                  <circle cx="10" cy="10" r="4" fill="#e4572e"/>
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none"/>
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                        {serviceStoreSearchQuery ? 'No options found' : 'No options available'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Incharge Field */}
        <div className="mb-4 relative dropdown-container">
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            Project Incharge<span className="text-[#eb2f8e]">*</span>
          </p>
          <div className="relative">
            <div
              onClick={() => {
                setShowInchargeDropdown(!showInchargeDropdown);
                setShowFromDropdown(false);
                setShowToDropdown(false);
                setShowServiceStoreDropdown(false);
              }}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                color: selectedIncharge ? '#000' : '#9E9E9E',
                boxSizing: 'border-box',
                paddingRight: selectedIncharge ? '40px' : '40px'
              }}
            >
              {selectedIncharge ? selectedIncharge.label : 'Select Incharge'}
            </div>
            {selectedIncharge && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIncharge(null);
                }}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
        {/* Project Incharge Field Modal */}
        {showInchargeDropdown && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowInchargeDropdown(false);
              }
            }}
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()} >
              {/* Header */}
              <div className="flex justify-between items-center px-6 pt-5">
                <p className="text-[16px] font-semibold text-black">Select Project Incharge</p>
                <button onClick={() => setShowInchargeDropdown(false)} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity" >
                  ×
                </button>
              </div>
              {/* Search Bar */}
              <div className="px-6 pt-4 pb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={inchargeSearchQuery}
                    onChange={(e) => setInchargeSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full h-[32px] pl-10 pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                    autoFocus
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" />
                      <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Options List */}
              <div className="flex-1 overflow-y-auto mb-4 px-6">
                <div className="shadow-md rounded-lg overflow-hidden">
                  {/* Create New Option - Show when typing something that doesn't exist */}
                  {inchargeSearchQuery.trim() && !inchargeOptions.some(opt => {
                    const normalizedOpt = normalizeSearchText(opt.label);
                    const normalizedQuery = normalizeSearchText(inchargeSearchQuery.trim());
                    return normalizedOpt === normalizedQuery;
                  }) && (
                    <button
                      onClick={() => {
                        // Handle new item creation - you can add your logic here
                        console.log('Create new item:', inchargeSearchQuery);
                      }}
                      className="w-full h-[36px] px-6 flex items-center bg-gray-100 gap-2 hover:bg-[#F5F5F5] transition-colors"
                    >
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-[14px] text-gray-600 font-normal text-left truncate">"{inchargeSearchQuery.trim()}"</p>
                    </button>
                  )}
                  {getFilteredInchargeOptions().length > 0 ? (
                    <div className="space-y-0">
                      {getFilteredInchargeOptions().map((option) => {
                        const isFavorite = inchargeFavorites.includes(option.id);
                        const isSelected = selectedIncharge?.id === option.id;                      
                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedIncharge(option);
                              setShowInchargeDropdown(false);
                            }}
                            className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${
                              isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                            }`}
                          >
                            {/* Left: Star Icon and Option Text */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button onClick={(e) => handleToggleInchargeFavorite(e, option.id)} className="w-6 h-6 flex items-center justify-center flex-shrink-0" >
                                {isFavorite ? (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </button>
                              <p className="text-[14px] font-medium text-black text-left truncate">{option.label}</p>
                            </div>
                            {/* Right: Radio Button */}
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                              {isSelected ? (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none"/>
                                  <circle cx="10" cy="10" r="4" fill="#e4572e"/>
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none"/>
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                        {inchargeSearchQuery ? 'No options found' : 'No options available'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
      {/* Items Label */}
      <div className="flex-shrink-0 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-[12px] font-semibold text-black leading-normal">Items</p>
            <div className="w-[20px] h-[20px] rounded-full bg-[#E0E0E0] flex items-center justify-center">
              <span className="text-[10px] font-medium text-black">{items.length}</span>
            </div>
          </div>
          {areFieldsFilled && (
            <div className="cursor-pointer" onClick={handleOpenUniversalSearch}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="6" stroke="#000" strokeWidth="1.5" />
                <path d="M13.5 13.5L17 17" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>
      </div>
      {/* Items List */}
      {items.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-[120px]">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="bg-white border-b border-gray-200 pb-3">
                <div className="flex">
                  {/* Left Side - Item Details */}
                  <div className="flex-1 min-w-0">
                    {/* Item Name */}
                    <p className="text-[14px] font-semibold text-black">{item.itemName || 'Unknown Item'}</p>
                    {/* Machine Number */}
                    <p className="text-[12px] text-gray-600 mt-0.5">
                      {item.machine_number || item.machineNumber || ''}
                    </p>
                    {/* Brand */}
                    <p className="text-[12px] text-gray-600 mt-0.5">{item.brand || ''}</p>
                  </div>                  
                  {/* Right Side - Category, Image, Item ID */}
                  <div className="flex flex-col items-end gap-1 ml-2">
                    {/* Category Tag */}
                    <span className="text-[11px] font-medium text-[#E4572E] bg-[#FFF0EB] px-2 py-0.5 rounded">
                      {selectedCategory?.value || 'Electricals'}
                    </span>                    
                    {/* Image Indicator */}
                    {item.localImageUrls?.length > 0 && (
                      <div 
                        className="flex items-center gap-1 text-[#E4572E] cursor-pointer"
                        onClick={() => handleOpenImageViewer(item, 0)}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span className="text-[11px] font-medium">Image</span>
                      </div>
                    )}                    
                    {/* Item ID or Quantity */}
                    <p className="text-[12px] font-medium text-black">
                      {item.itemId || (item.quantity > 0 ? item.quantity : '')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Floating Action Button - Black with + icon */}
      <div className="fixed bottom-[110px] right-[24px] lg:right-[calc(50%-164px)] z-30 cursor-pointer" onClick={areFieldsFilled ? handleAddItem : undefined}>
        <div className={`w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-lg ${
          areFieldsFilled ? 'bg-black' : 'bg-gray-400'
        }`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {/* Add Items Bottom Sheet Modal */}
      {showAddItemsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }} onClick={handleCloseAddItemsModal} >
          <div className="bg-white w-full max-w-[360px] rounded-tl-[16px] rounded-tr-[16px] relative z-50" onClick={(e) => e.stopPropagation()}>
            {/* Header with Title and Category */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <p className="text-[16px] font-medium text-black leading-normal">
                Add Items
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => {/* Handle category selection */}} className="text-[16px] font-semibold text-black" >
                  {selectedCategory ? selectedCategory.value : 'Electricals'}
                </button>
                <button onClick={handleCloseAddItemsModal} className="text-[#e06256] text-xl font-bold">
                  ×
                </button>
              </div>
            </div>
            {/* Form fields */}
            <div className="px-6 pb-6">
              {/* Row 1: Item Name with Quantity Count + Quantity Input */}
              <div className="flex gap-3 mb-[10px]">
                {/* Item Name */}
                <div className="flex-1 relative">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[13px] font-medium text-black leading-normal">
                      Item Name<span className="text-[#eb2f8e]">*</span>
                    </p>
                    {selectedItemNameQuantity > 0 && (
                      <span className="text-[13px] font-semibold text-[#e06256]">{selectedItemNameQuantity}</span>
                    )}
                  </div>
                  <SearchableDropdown
                    value={addItemFormData.itemName}
                    onChange={(value) => handleFieldChange('itemName', value)}
                    onAddNew={handleAddNewItemName}
                    options={itemNameOptions}
                    placeholder="Drilling Machine"
                    fieldName="Item Name"
                    showAllOptions={true}
                  />
                </div>
                {/* Quantity */}
                <div className="w-[80px] relative">
                  <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                    Quantity
                  </p>
                  <input
                    type="text"
                    value={addItemFormData.quantity}
                    onChange={(e) => handleFieldChange('quantity', e.target.value)}
                    disabled={!!addItemFormData.itemId}
                    className={`w-full h-[32px] border border-[#d6d6d6] rounded-[8px] px-3 text-[12px] font-medium focus:outline-none text-black ${
                      addItemFormData.itemId ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white'
                    }`}
                    placeholder="Enter"
                  />
                </div>
              </div>
              {/* Brand */}
              <div className="mb-[10px] relative">
                <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                  Brand
                </p>
                <SearchableDropdown
                  value={addItemFormData.brand}
                  onChange={(value) => handleFieldChange('brand', value)}
                  onAddNew={handleAddNewBrand}
                  options={brandOptions}
                  placeholder="Stanley"
                  fieldName="Brand"
                  showAllOptions={true}
                />
              </div>
              {/* Item ID with Machine Number */}
              <div className="mb-6 relative">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[13px] font-medium text-black leading-normal">
                    Item ID
                  </p>
                  {selectedItemMachineNumber && (
                    <span className="text-[13px] font-semibold text-[#e06256]">{selectedItemMachineNumber}</span>
                  )}
                </div>
                <div className={addItemFormData.quantity && addItemFormData.quantity.trim() !== '' ? 'opacity-50 pointer-events-none' : ''}>
                  <SearchableDropdown
                    value={addItemFormData.itemId}
                    onChange={(value) => handleFieldChange('itemId', value)}
                    onAddNew={handleAddNewItemId}
                    options={itemIdOptions}
                    placeholder="AA DM 01"
                    fieldName="Item ID"
                    showAllOptions={true}
                  />
                </div>
              </div>
              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleCloseAddItemsModal}
                  className="flex-1 h-[40px] border border-[#949494] rounded-[8px] text-[14px] font-bold text-[#363636] bg-white leading-normal"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItemSubmit}
                  disabled={!addItemFormData.itemName}
                  className={`flex-1 h-[40px] border border-[#f4ede2] rounded-[8px] text-[14px] font-bold leading-normal ${
                    addItemFormData.itemName
                      ? 'bg-black text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Upload and Attach Files Modal */}
      {showUploadModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseUploadModal}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white w-full max-w-[360px] rounded-[16px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2 flex-shrink-0">
              <div>
                <p className="text-[16px] font-semibold text-black">Upload and Attach files</p>
                <p className="text-[12px] text-gray-500">Attachments will be of this Transfer</p>
              </div>
              <button onClick={handleCloseUploadModal} className="text-[#e06256] text-xl font-bold">
                ×
              </button>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Upload Area */}
              <div className="px-6 py-4">
                <label 
                  htmlFor="file-upload-input"
                  className="flex flex-col items-center justify-center w-full h-[100px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 8L12 3L7 8" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3V15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-[14px] font-medium text-[#E4572E] mt-2">Click to Upload</p>
                  <p className="text-[10px] text-gray-400">(Max. File size: 5 MB)</p>
                </label>
                <input 
                  id="file-upload-input"
                  type="file" 
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,image/*,application/pdf"
                  multiple
                />
              </div>
              {/* File Uploading Section - Multiple Files */}
              {uploadFiles.length > 0 && (
                <div className="px-6 pb-4">
                  <p className="text-[12px] font-medium text-black mb-2">File Uploading</p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {uploadFiles.map((fileItem) => (
                      <div key={fileItem.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {fileItem.name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="8.5" cy="8.5" r="1.5" stroke="#E4572E" strokeWidth="2"/>
                                <polyline points="21,15 16,10 5,21" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-black truncate">{fileItem.name}</p>
                            <p className="text-[10px] text-gray-500">{(fileItem.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleDeleteUploadFile(fileItem.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <span className="text-[12px] font-semibold text-black w-[40px] text-right">{fileItem.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Status Dropdown */}
              <div className="px-6 pb-4">
                <p className="text-[12px] font-medium text-black mb-2">Status</p>
                <div className="relative">
                  <div
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="w-full h-[40px] border border-gray-300 rounded-lg px-4 flex items-center justify-between cursor-pointer bg-white"
                  >
                    <span className="text-[14px] text-black">{uploadStatus}</span>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {showStatusDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setUploadStatus(status);
                            setShowStatusDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-[14px] hover:bg-gray-100 ${
                            uploadStatus === status ? 'bg-gray-50 font-semibold' : ''
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Description */}
              <div className="px-6 pb-4">
                <p className="text-[12px] font-medium text-black mb-2">Description</p>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Enter"
                  className="w-full h-[80px] border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-black placeholder-gray-400 resize-none focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>
            {/* Confirm Button - Fixed at bottom */}
            <div className="px-6 pb-6 pt-2 flex-shrink-0">
              <button
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className={`w-full h-[48px] rounded-lg text-[16px] font-bold text-white ${
                  isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black'
                }`}
              >
                {isUploading ? 'Uploading...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Image Viewer Modal */}
      {showImageViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col" style={{ fontFamily: "'Manrope', sans-serif" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black bg-opacity-60">
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-white truncate">
                #{items.findIndex(item => item.itemName === imageViewerData.itemName) + 1}. {imageViewerData.itemName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {imageViewerData.itemId && (
                <span className="text-[12px] font-medium text-white">{imageViewerData.itemId}</span>
              )}
              <button onClick={handleCloseImageViewer} className="w-8 h-8 flex items-center justify-center text-[#E4572E]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          {/* Image Container with Swipe */}
          <div className="flex-1 relative overflow-hidden">
            {/* Current Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              {imageViewerData.images[imageViewerData.currentIndex] && (
                <img 
                  src={imageViewerData.images[imageViewerData.currentIndex]} 
                  alt={`${imageViewerData.itemName} - ${imageViewerData.currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
            {/* Navigation Arrows - Only show if multiple images */}
            {imageViewerData.images.length > 1 && (
              <>
                {/* Left Arrow */}
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>                
                {/* Right Arrow */}
                <button 
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}
            {/* Image Counter */}
            {imageViewerData.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                <span className="text-[12px] text-white">
                  {imageViewerData.currentIndex + 1} / {imageViewerData.images.length}
                </span>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="px-4 py-3 bg-black bg-opacity-60">
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-white">
                To - {imageViewerData.toLocation || 'N/A'}
              </p>
              <span className={`text-[11px] font-medium px-2 py-1 rounded ${
                imageViewerData.machineStatus === 'Working' ? 'bg-green-500 text-white' :
                imageViewerData.machineStatus === 'Not Working' ? 'bg-red-500 text-white' :
                imageViewerData.machineStatus === 'Under Repair' ? 'bg-yellow-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                • {imageViewerData.machineStatus}
              </span>
            </div>
          </div>
          {/* Thumbnail Strip - Only show if multiple images */}
          {imageViewerData.images.length > 1 && (
            <div className="px-4 py-2 bg-black bg-opacity-60 overflow-x-auto">
              <div className="flex gap-2">
                {imageViewerData.images.map((img, index) => (
                  <div 
                    key={index}
                    onClick={() => setImageViewerData(prev => ({ ...prev, currentIndex: index }))}
                    className={`w-[50px] h-[50px] rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 ${
                      index === imageViewerData.currentIndex ? 'border-[#E4572E]' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowConfirmModal(false)}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white w-full max-w-[320px] rounded-[16px] p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-[60px] h-[60px] rounded-full bg-[#FFF3E0] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {/* Title */}
            <h3 className="text-[18px] font-semibold text-black text-center mb-2">
              Please Confirm ?
            </h3>
            {/* Message */}
            <p className="text-[13px] text-[#666666] text-center mb-6 leading-relaxed">
              Please check that all the machines you take are in proper running condition before taking them.
            </p>
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 h-[44px] border border-gray-300 rounded-[8px] text-[14px] font-semibold text-black bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSaveTransfer();
                }}
                disabled={isSaving}
                className="flex-1 h-[44px] bg-black rounded-[8px] text-[14px] font-semibold text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {isSaving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Universal Search Bottom Sheet Modal */}
      {showUniversalSearchModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center"
          onClick={handleCloseUniversalSearch}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div 
            className="bg-white w-full max-w-[400px] rounded-tl-[16px] rounded-tr-[16px] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
              <p className="text-[16px] font-semibold text-black">Search Items</p>
              <button 
                onClick={handleCloseUniversalSearch}
                className="text-[#E4572E] text-xl font-bold"
              >
                ×
              </button>
            </div>
            {/* Search Input */}
            <div className="px-4 pb-3 flex-shrink-0">
              <div className="relative">
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={universalSearchQuery}
                  onChange={(e) => setUniversalSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full h-[40px] border border-gray-300 rounded-full pl-10 pr-4 text-[14px] text-black placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {getFilteredSearchItems().length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-[12px] text-gray-500">No items found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {getFilteredSearchItems().map((item, index) => {
                    const itemNameObj = toolsItemNameListData.find(
                      i => String(i?.id) === String(item?.item_name_id ?? item?.itemNameId)
                    );
                    const itemIdObj = toolsItemIdFullData.find(
                      i => String(i?.id) === String(item?.item_ids_id ?? item?.itemIdsId)
                    );
                    const brandObj = toolsBrandFullData.find(
                      i => String(i?.id) === String(item?.brand_id ?? item?.brandId)
                    );
                    const inchargeObj = inchargeOptions.find(
                      i => String(i?.id) === String(item?.project_incharge_id ?? item?.projectInchargeId)
                    );                    
                    const itemName = itemNameObj?.item_name || itemNameObj?.itemName || 'Unknown';
                    const itemIdName = itemIdObj?.item_id || itemIdObj?.itemId || '';
                    const brandName = brandObj?.tools_brand || brandObj?.toolsBrand || '';
                    const machineNumber = item?.machine_number ?? item?.machineNumber ?? '';
                    const machineStatus = item?.machine_status ?? item?.machineStatus ?? 'Working';
                    const categoryName = selectedCategory?.value || 'Electricals';
                    const inchargeName = inchargeObj?.label || '';
                    const dateTime = formatSearchItemDate(item?.created_date_time ?? item?.createdDateTime);                    
                    return (
                      <div 
                        key={item.id || index}
                        className="py-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSelectSearchItem(item)}
                      >
                        {/* Row 1: Item Name | Category Tag */}
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-[14px] font-semibold text-black">{itemName}</p>
                          <span className="text-[11px] font-medium text-[#4CAF50] bg-[#E8F5E9] px-2 py-0.5 rounded">
                            {categoryName}
                          </span>
                        </div>
                        {/* Row 2: Machine Number | Item ID */}
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-[13px] text-black">{machineNumber || '-'}</p>
                          <p className="text-[13px] font-medium text-black">{itemIdName}</p>
                        </div>
                        {/* Row 3: Brand | Status */}
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-[12px] text-gray-600">{brandName}</p>
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              machineStatus === 'Working' ? 'bg-[#4CAF50]' : 
                              machineStatus === 'Not Working' ? 'bg-[#F44336]' :
                              'bg-[#FF9800]'
                            }`}></span>
                            <p className={`text-[11px] font-medium ${
                              machineStatus === 'Working' ? 'text-[#4CAF50]' : 
                              machineStatus === 'Not Working' ? 'text-[#F44336]' :
                              'text-[#FF9800]'
                            }`}>
                              {machineStatus}
                            </p>
                          </div>
                        </div>
                        {/* Row 4: Date/Time | Incharge Name */}
                        <div className="flex items-start justify-between">
                          <p className="text-[11px] text-gray-500">{dateTime}</p>
                          <p className="text-[12px] text-gray-600">{inchargeName}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Search Item Confirmation Modal */}
      {showSearchConfirmModal && selectedSearchItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleCancelSearchConfirm}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div 
            className="bg-white w-full max-w-[320px] rounded-[16px] p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success/Info Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-[60px] h-[60px] rounded-full bg-[#E8F5E9] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {/* Title */}
            <h3 className="text-[18px] font-semibold text-black text-center mb-2">
              Confirm Cart?
            </h3>
            {/* Message */}
            <p className="text-[13px] text-[#666666] text-center mb-6 leading-relaxed">
              Do you Want to Confirm Move the machine please upload Image
            </p>
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelSearchConfirm}
                className="flex-1 h-[44px] border border-gray-300 rounded-[8px] text-[14px] font-semibold text-black bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSearchItem}
                className="flex-1 h-[44px] bg-black rounded-[8px] text-[14px] font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Search Upload Modal */}
      {showSearchUploadModal && selectedSearchItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseSearchUploadModal}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div 
            className="bg-white w-full max-w-[360px] rounded-[16px] shadow-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2 flex-shrink-0">
              <div>
                <p className="text-[16px] font-semibold text-black">Upload and Attach files</p>
                <p className="text-[12px] text-gray-500">Attachments will be of this Transfer</p>
              </div>
              <button 
                onClick={handleCloseSearchUploadModal}
                className="text-[#E4572E] text-xl font-bold"
              >
                ×
              </button>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Upload Area */}
              <div className="px-6 py-4">
                <label 
                  htmlFor="search-file-upload-input"
                  className="flex flex-col items-center justify-center w-full h-[100px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 8L12 3L7 8" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3V15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-[14px] font-medium text-[#E4572E] mt-2">Click to Upload</p>
                  <p className="text-[10px] text-gray-400">(Max. File size: 5 MB)</p>
                </label>
                <input 
                  id="search-file-upload-input"
                  type="file" 
                  className="hidden"
                  onChange={handleSearchFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,image/*,application/pdf"
                  multiple
                />
              </div>
              {/* File Uploading Section */}
              {searchUploadFiles.length > 0 && (
                <div className="px-6 pb-4">
                  <p className="text-[12px] font-medium text-black mb-2">File Uploading</p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {searchUploadFiles.map((fileItem) => (
                      <div key={fileItem.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="8.5" cy="8.5" r="1.5" stroke="#E4572E" strokeWidth="2"/>
                              <polyline points="21,15 16,10 5,21" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-black truncate">{fileItem.name}</p>
                            <p className="text-[10px] text-gray-500">{(fileItem.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleDeleteSearchUploadFile(fileItem.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <span className="text-[12px] font-semibold text-black w-[40px] text-right">{fileItem.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Status Dropdown */}
              <div className="px-6 pb-4">
                <p className="text-[12px] font-medium text-black mb-2">Status</p>
                <div className="relative">
                  <div
                    onClick={() => setShowSearchStatusDropdown(!showSearchStatusDropdown)}
                    className="w-full h-[40px] border border-gray-300 rounded-lg px-4 flex items-center justify-between cursor-pointer bg-white"
                  >
                    <span className="text-[14px] text-black">{searchUploadStatus}</span>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {showSearchStatusDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setSearchUploadStatus(status);
                            setShowSearchStatusDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-[14px] hover:bg-gray-100 ${
                            searchUploadStatus === status ? 'bg-gray-50 font-semibold' : ''
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Description */}
              <div className="px-6 pb-4">
                <p className="text-[12px] font-medium text-black mb-2">Description</p>
                <textarea
                  value={searchUploadDescription}
                  onChange={(e) => setSearchUploadDescription(e.target.value)}
                  placeholder="Enter"
                  className="w-full h-[80px] border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-black placeholder-gray-400 resize-none focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>
            {/* Confirm Button */}
            <div className="px-6 pb-6 pt-2 flex-shrink-0">
              <button
                onClick={handleConfirmSearchUpload}
                className="w-full h-[48px] rounded-lg text-[16px] font-bold text-white bg-black"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfer;
