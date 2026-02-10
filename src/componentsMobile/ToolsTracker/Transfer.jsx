import React, { useState, useEffect } from 'react';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import EditIcon from '../Images/edit1.png';
import DeleteIcon from '../Images/delete.png';
import FlottingButton from '../Images/Flotting Button Black.png'
import FlottingButtonWhite from '../Images/Flotting Button.png'
import Close from '../Images/close.png'
import Edit from '../Images/edit.png'

const Transfer = ({ user }) => {
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
  const [selectedRelocateItemId, setSelectedRelocateItemId] = useState(null);
  const [selectedCurrentLocation, setSelectedCurrentLocation] = useState(null);
  const [selectedRelocateLocation, setSelectedRelocateLocation] = useState(null);
  const [relocateItemDetails, setRelocateItemDetails] = useState(null);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [items, setItems] = useState([]);
  const [fromOptions, setFromOptions] = useState([]);
  const [toOptions, setToOptions] = useState([]);
  const [serviceStoreOptions, setServiceStoreOptions] = useState([]);
  const [inchargeOptions, setInchargeOptions] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showServiceStoreDropdown, setShowServiceStoreDropdown] = useState(false);
  const [showInchargeDropdown, setShowInchargeDropdown] = useState(false);
  const [showRelocateItemIdDropdown, setShowRelocateItemIdDropdown] = useState(false);
  const [showCurrentLocationDropdown, setShowCurrentLocationDropdown] = useState(false);
  const [showRelocateLocationDropdown, setShowRelocateLocationDropdown] = useState(false);
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
  const [relocateLocationSearchQuery, setRelocateLocationSearchQuery] = useState('');
  const [relocateLocationFavorites, setRelocateLocationFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteRelocateLocations');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentLocationSearchQuery, setCurrentLocationSearchQuery] = useState('');
  const [currentLocationFavorites, setCurrentLocationFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteCurrentLocations');
    return saved ? JSON.parse(saved) : [];
  });
  const [relocateItemIdSearchQuery, setRelocateItemIdSearchQuery] = useState('');
  const [relocateItemIdFavorites, setRelocateItemIdFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteItemIds');
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
  const [toolsItemNameListData, setToolsItemNameListData] = useState([]);
  const [toolsBrandFullData, setToolsBrandFullData] = useState([]);
  const [toolsItemIdFullData, setToolsItemIdFullData] = useState([]);
  const [apiItemIdOptions, setApiItemIdOptions] = useState([]);
  const [stockManagementData, setStockManagementData] = useState([]);
  const [toolsTrackerManagementData, setToolsTrackerManagementData] = useState([]);
  const [machineStatusData, setMachineStatusData] = useState([]); // Machine status data from new API
  const [machineNumbersList, setMachineNumbersList] = useState([]); // For resolving machine_number_id to machine_number
  const [selectedItemNameQuantity, setSelectedItemNameQuantity] = useState(0);
  const [selectedItemMachineNumber, setSelectedItemMachineNumber] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('Working');
  const [uploadDescription, setUploadDescription] = useState('');
  const [statusOptions] = useState(['Working', 'Not Working', 'Under Repair', 'Machine Dead']);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const TOOLS_STOCK_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_stock_management';
  const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_management';
  const TOOLS_MACHINE_STATUS_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools-machine-status';
  const TOOLS_MACHINE_NUMBER_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_machine_number';
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUniversalSearchModal, setShowUniversalSearchModal] = useState(false);
  const [universalSearchQuery, setUniversalSearchQuery] = useState('');
  const [showSearchConfirmModal, setShowSearchConfirmModal] = useState(false);
  const [selectedSearchItem, setSelectedSearchItem] = useState(null);
  const [showSearchUploadModal, setShowSearchUploadModal] = useState(false);
  const [searchUploadFiles, setSearchUploadFiles] = useState([]);
  const [searchUploadStatus, setSearchUploadStatus] = useState('Working');
  const [searchUploadDescription, setSearchUploadDescription] = useState('');
  const [showSearchStatusDropdown, setShowSearchStatusDropdown] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [swipeStates, setSwipeStates] = useState({});
  const [isEditingTransferDetails, setIsEditingTransferDetails] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageViewerData, setImageViewerData] = useState({
    images: [],
    currentIndex: 0,
    itemName: '',
    itemUniqueId: '',
    itemId: '',
    toLocation: '',
    machineStatus: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEntryId, setEditEntryId] = useState(null);
  const [originalEditData, setOriginalEditData] = useState(null);
  const [customAlert, setCustomAlert] = useState({
    isOpen: false,
    message: ''
  });
  const closeCustomAlert = () => {
    setCustomAlert({ isOpen: false, message: '' });
  };
  // Route existing alert(...) calls to a styled in-app modal.
  const alert = (message) => {
    setCustomAlert({
      isOpen: true,
      message: String(message ?? '')
    });
  };
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
          const serviceStoreVendors = data
            .filter(vendor => vendor.makeAsServiceShop === true)
            .map(vendor => ({
              value: vendor.vendorName,
              label: vendor.vendorName,
              id: vendor.id,
            }));
          setServiceStoreOptions(serviceStoreVendors);
          // Also store all vendors for purchase store lookup
          const allVendors = data.map(vendor => ({
            value: vendor.vendorName,
            label: vendor.vendorName,
            id: vendor.id,
          }));
          setVendorOptions(allVendors);
        } else {
          console.log('Error fetching service store vendors.');
        }
      } catch (error) {
        console.error('Error fetching service store vendors:', error);
      }
    };
    fetchServiceStoreVendors();
  }, []);
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
  useEffect(() => {
    const fetchEntryNo = async () => {
      try {
        let endpoint;
        if (entryServiceMode === 'Service') {
          endpoint = `${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/getServiceCount`;
        } else if (entryServiceMode === 'Relocate') {
          endpoint = `${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/getRelocationCount`;
        } else {
          endpoint = `${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/getEntryCount`;
        }
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setEntryNo(data + 1);
        }
      } catch (error) {
        console.error('Error fetching entry number:', error);
      }
    };
    fetchEntryNo();
  }, [entryServiceMode]);
  useEffect(() => {
    // Update current location in relocateItemDetails when selectedCurrentLocation changes
    if (entryServiceMode === 'Relocate' && relocateItemDetails && selectedCurrentLocation) {
      setRelocateItemDetails(prev => ({
        ...prev,
        currentLocation: selectedCurrentLocation.label || ''
      }));
    }
  }, [selectedCurrentLocation, entryServiceMode]);
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
    if (!showCurrentLocationDropdown) {
      setCurrentLocationSearchQuery('');
    }
    if (!showRelocateLocationDropdown) {
      setRelocateLocationSearchQuery('');
    }
    if (!showRelocateItemIdDropdown) {
      setRelocateItemIdSearchQuery('');
    }
  }, [showToDropdown, showServiceStoreDropdown, showFromDropdown, showInchargeDropdown, showCurrentLocationDropdown, showRelocateLocationDropdown, showRelocateItemIdDropdown]);
  useEffect(() => {
    if (items.length === 0) return;
    const minSwipeDistance = 50;
    const globalMouseMoveHandler = (e) => {
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };
        items.forEach(item => {
          const state = prev[item.id];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          const isExpanded = expandedItemId === item.id;
          if (deltaX < 0 || (isExpanded && deltaX > 0)) {
            newState[item.id] = {
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
        items.forEach(item => {
          const state = prev[item.id];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              setExpandedItemId(item.id);
            } else {
              setExpandedItemId(null);
            }
          } else {
            if (expandedItemId === item.id) {
              setExpandedItemId(null);
            }
          }
          delete newState[item.id];
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
  }, [items, expandedItemId]);
  const normalizeSearchText = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };
  const getFilteredToOptions = () => {
    const normalizedQuery = normalizeSearchText(toSearchQuery);
    const filtered = toOptions.filter(option => {
      const normalizedLabel = normalizeSearchText(option.label);
      return normalizedLabel.includes(normalizedQuery);
    });
    return filtered.sort((a, b) => {
      const aIsFavorite = toFavorites.includes(a.id);
      const bIsFavorite = toFavorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.label.localeCompare(b.label);
    });
  };
  const handleToggleToFavorite = (e, optionId) => {
    e.stopPropagation();
    const newFavorites = toFavorites.includes(optionId)
      ? toFavorites.filter(id => id !== optionId)
      : [...toFavorites, optionId];
    setToFavorites(newFavorites);
    localStorage.setItem('favoriteToSites', JSON.stringify(newFavorites));
  };
  const getFilteredFromOptions = () => {
    const normalizedQuery = normalizeSearchText(fromSearchQuery);
    const filtered = fromOptions.filter(option => {
      const normalizedLabel = normalizeSearchText(option.label);
      return normalizedLabel.includes(normalizedQuery);
    });
    return filtered.sort((a, b) => {
      const aIsFavorite = fromFavorites.includes(a.id);
      const bIsFavorite = fromFavorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.label.localeCompare(b.label);
    });
  };
  const handleToggleFromFavorite = (e, optionId) => {
    e.stopPropagation();
    const newFavorites = fromFavorites.includes(optionId)
      ? fromFavorites.filter(id => id !== optionId)
      : [...fromFavorites, optionId];
    setFromFavorites(newFavorites);
    localStorage.setItem('favoriteFromSites', JSON.stringify(newFavorites));
  };
  const getFilteredInchargeOptions = () => {
    const normalizedQuery = normalizeSearchText(inchargeSearchQuery);
    const filtered = inchargeOptions.filter(option => {
      const normalizedLabel = normalizeSearchText(option.label);
      return normalizedLabel.includes(normalizedQuery);
    });
    return filtered.sort((a, b) => {
      const aIsFavorite = inchargeFavorites.includes(a.id);
      const bIsFavorite = inchargeFavorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.label.localeCompare(b.label);
    });
  };
  const handleToggleInchargeFavorite = (e, optionId) => {
    e.stopPropagation();
    const newFavorites = inchargeFavorites.includes(optionId)
      ? inchargeFavorites.filter(id => id !== optionId)
      : [...inchargeFavorites, optionId];
    setInchargeFavorites(newFavorites);
    localStorage.setItem('favoriteIncharges', JSON.stringify(newFavorites));
  };
  const getFilteredRelocateLocationOptions = () => {
    const normalizedQuery = normalizeSearchText(relocateLocationSearchQuery);
    const filtered = fromOptions.filter(option => {
      const normalizedLabel = normalizeSearchText(option.label);
      return normalizedLabel.includes(normalizedQuery);
    });
    return filtered.sort((a, b) => {
      const aIsFavorite = relocateLocationFavorites.includes(a.id);
      const bIsFavorite = relocateLocationFavorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.label.localeCompare(b.label);
    });
  };
  const handleToggleRelocateLocationFavorite = (e, optionId) => {
    e.stopPropagation();
    const newFavorites = relocateLocationFavorites.includes(optionId)
      ? relocateLocationFavorites.filter(id => id !== optionId)
      : [...relocateLocationFavorites, optionId];
    setRelocateLocationFavorites(newFavorites);
    localStorage.setItem('favoriteRelocateLocations', JSON.stringify(newFavorites));
  };
  const getFilteredCurrentLocationOptions = () => {
    const normalizedQuery = normalizeSearchText(currentLocationSearchQuery);
    const filtered = fromOptions.filter(option => {
      const normalizedLabel = normalizeSearchText(option.label);
      return normalizedLabel.includes(normalizedQuery);
    });
    return filtered.sort((a, b) => {
      const aIsFavorite = currentLocationFavorites.includes(a.id);
      const bIsFavorite = currentLocationFavorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.label.localeCompare(b.label);
    });
  };
  const handleToggleCurrentLocationFavorite = (e, optionId) => {
    e.stopPropagation();
    const newFavorites = currentLocationFavorites.includes(optionId)
      ? currentLocationFavorites.filter(id => id !== optionId)
      : [...currentLocationFavorites, optionId];
    setCurrentLocationFavorites(newFavorites);
    localStorage.setItem('favoriteCurrentLocations', JSON.stringify(newFavorites));
  };
  const getFilteredServiceStoreOptions = () => {
    const normalizedQuery = normalizeSearchText(serviceStoreSearchQuery);
    const filtered = serviceStoreOptions.filter(option => {
      const normalizedLabel = normalizeSearchText(option.label);
      return normalizedLabel.includes(normalizedQuery);
    });
    return filtered.sort((a, b) => {
      const aIsFavorite = serviceStoreFavorites.includes(a.id);
      const bIsFavorite = serviceStoreFavorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.label.localeCompare(b.label);
    });
  };
  const handleToggleServiceStoreFavorite = (e, optionId) => {
    e.stopPropagation();
    const newFavorites = serviceStoreFavorites.includes(optionId)
      ? serviceStoreFavorites.filter(id => id !== optionId)
      : [...serviceStoreFavorites, optionId];
    setServiceStoreFavorites(newFavorites);
    localStorage.setItem('favoriteServiceStores', JSON.stringify(newFavorites));
  };
  const getFilteredItemIdOptions = () => {
    const normalizedQuery = normalizeSearchText(relocateItemIdSearchQuery);
    const filtered = itemIdOptions.filter(option => {
      const normalizedOption = normalizeSearchText(option);
      return normalizedOption.includes(normalizedQuery);
    });
    return filtered.sort((a, b) => {
      const aId = toolsItemIdFullData.find(i => (i?.item_id?.trim() ?? i?.itemId?.trim()) === a)?.id;
      const bId = toolsItemIdFullData.find(i => (i?.item_id?.trim() ?? i?.itemId?.trim()) === b)?.id;
      const aIsFavorite = aId && relocateItemIdFavorites.includes(aId);
      const bIsFavorite = bId && relocateItemIdFavorites.includes(bId);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.localeCompare(b);
    });
  };
  const handleToggleItemIdFavorite = (e, itemIdValue) => {
    e.stopPropagation();
    const itemIdObj = toolsItemIdFullData.find(i => (i?.item_id?.trim() ?? i?.itemId?.trim()) === itemIdValue);
    if (!itemIdObj?.id) return;
    const newFavorites = relocateItemIdFavorites.includes(itemIdObj.id)
      ? relocateItemIdFavorites.filter(id => id !== itemIdObj.id)
      : [...relocateItemIdFavorites, itemIdObj.id];
    setRelocateItemIdFavorites(newFavorites);
    localStorage.setItem('favoriteItemIds', JSON.stringify(newFavorites));
  };
  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return `${day}/${month}/${year}`;
  };
  const areFieldsFilled = entryServiceMode === 'Entry'
    ? (selectedFrom && selectedTo && selectedIncharge)
    : entryServiceMode === 'Relocate'
      ? (selectedRelocateItemId && selectedCurrentLocation && selectedRelocateLocation)
      : (selectedFrom && selectedServiceStore && selectedIncharge);
  const handleSwitchToEntry = () => {
    setEntryServiceMode('Entry');
    setSelectedServiceStore(null);
    setSelectedRelocateItemId(null);
    setSelectedCurrentLocation(null);
    setSelectedRelocateLocation(null);
    setRelocateItemDetails(null);
  };
  const handleSwitchToService = () => {
    setEntryServiceMode('Service');
    setSelectedTo(null);
    setSelectedRelocateItemId(null);
    setSelectedCurrentLocation(null);
    setSelectedRelocateLocation(null);
    setRelocateItemDetails(null);
  };
  const handleSwitchToRelocate = () => {
    setEntryServiceMode('Relocate');
    setSelectedTo(null);
    setSelectedServiceStore(null);
    setSelectedFrom(null);
    setRelocateLocationSearchQuery('');
  };
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
          setToolsItemIdFullData(Array.isArray(data) ? data : []);
          const itemIdOpts = (Array.isArray(data) ? data : [])
            .map(item => item?.item_id?.trim() ?? item?.itemId?.trim())
            .filter(item => item)
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
  useEffect(() => {
    const fetchToolsTrackerManagement = async () => {
      try {
        const response = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setToolsTrackerManagementData(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching tools tracker management data:', error);
      }
    };
    fetchToolsTrackerManagement();
  }, []);

  // Fetch machine numbers (for resolving machine_number_id to display text)
  useEffect(() => {
    const fetchMachineNumbers = async () => {
      try {
        const response = await fetch(`${TOOLS_MACHINE_NUMBER_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setMachineNumbersList(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching machine numbers:', error);
      }
    };
    fetchMachineNumbers();
  }, []);

  // Fetch machine status data from the new API
  useEffect(() => {
    const fetchMachineStatus = async () => {
      try {
        const response = await fetch(`${TOOLS_MACHINE_STATUS_BASE_URL}/all`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setMachineStatusData(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching machine status data:', error);
      }
    };
    fetchMachineStatus();
  }, []);
  useEffect(() => {
    if (fromOptions.length === 0 || inchargeOptions.length === 0 || toolsItemNameListData.length === 0) {
      return;
    }
    const loadEditData = async () => {
      try {
        const editEntryId = localStorage.getItem('editingToolsTrackerEntryId');
        if (editEntryId) {
          const response = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/get/${editEntryId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch entry data');
          }
          const editData = await response.json();
          if (editData.eno) {
            setEntryNo(editData.eno);
          }
          if (editData.created_date_time || editData.createdDateTime) {
            const date = new Date(editData.created_date_time || editData.createdDateTime);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            setDate(`${day}/${month}/${year}`);
          }
          const entryType = editData.tools_entry_type || editData.toolsEntryType || 'entry';
          setEntryServiceMode(entryType === 'service' ? 'Service' : 'Entry');
          const loadItems = () => {
            const entryItems = editData.tools_tracker_item_name_table || editData.toolsTrackerItemNameTable || [];
            const loadedItems = entryItems.map((item, index) => {
              const rawImages = item.tools_item_live_images || item.toolsItemLiveImages || [];
              const processedImages = rawImages.map(img => {
                if (img.tools_image || img.toolsImage) {
                  const base64Data = img.tools_image || img.toolsImage;
                  return `data:image/jpeg;base64,${base64Data}`;
                }
                return null;
              }).filter(Boolean);
              const localImageUrls = processedImages;
              const itemName = toolsItemNameListData.find(i => String(i?.id) === String(item?.item_name_id ?? item?.itemNameId))?.item_name ||
                toolsItemNameListData.find(i => String(i?.id) === String(item?.item_name_id ?? item?.itemNameId))?.itemName || '';
              const brand = toolsBrandFullData.find(b => String(b?.id) === String(item?.brand_id ?? item?.brandId))?.tools_brand ||
                toolsBrandFullData.find(b => String(b?.id) === String(item?.brand_id ?? item?.brandId))?.toolsBrand || '';
              const itemId = toolsItemIdFullData.find(i => String(i?.id) === String(item?.item_ids_id ?? item?.itemIdsId))?.item_id ||
                toolsItemIdFullData.find(i => String(i?.id) === String(item?.item_ids_id ?? item?.itemIdsId))?.itemId || '';
              return {
                id: item.id || Date.now() + index,
                timestamp: item.timestamp || new Date().toISOString().slice(0, 19),
                item_name_id: item.item_name_id ? String(item.item_name_id) : null,
                item_ids_id: item.item_ids_id ? String(item.item_ids_id) : null,
                brand_id: item.brand_id ? String(item.brand_id) : null,
                model: item.model || '',
                machine_number: item.machine_number || item.machineNumber || '',
                quantity: item.quantity || 0,
                machine_status: item.machine_status || item.machineStatus || 'Working',
                description: item.description || '',
                tools_item_live_images: rawImages.map(img => ({
                  tools_image: img.tools_image || img.toolsImage
                })),
                localImageUrls: localImageUrls,
                itemName: itemName,
                brand: brand,
                itemId: itemId
              };
            });
            setItems(loadedItems);
          };
          setIsEditMode(true);
          setEditEntryId(editEntryId);
          setOriginalEditData({
            from_project_id: editData.from_project_id || editData.fromProjectId,
            to_project_id: editData.to_project_id || editData.toProjectId,
            service_store_id: editData.service_store_id || editData.serviceStoreId,
            project_incharge_id: editData.project_incharge_id || editData.projectInchargeId,
            tools_entry_type: editData.tools_entry_type || editData.toolsEntryType,
            items: (editData.tools_tracker_item_name_table || editData.toolsTrackerItemNameTable || []).map(it => ({
              id: it.id,
              item_name_id: it.item_name_id ? String(it.item_name_id) : null,
              item_ids_id: it.item_ids_id ? String(it.item_ids_id) : null,
              brand_id: it.brand_id ? String(it.brand_id) : null,
              model: it.model || '',
              machine_number: it.machine_number || it.machineNumber || '',
              quantity: it.quantity || 0,
              machine_status: it.machine_status || it.machineStatus || 'Working',
              description: it.description || ''
            }))
          });
          if (fromOptions.length > 0 && inchargeOptions.length > 0) {
            const fromOption = fromOptions.find(opt => String(opt.id) === String(editData.from_project_id || editData.fromProjectId));
            if (fromOption) {
              setSelectedFrom(fromOption);
            }
            if (entryType === 'service') {
              const serviceStoreOption = serviceStoreOptions.find(opt => String(opt.id) === String(editData.service_store_id || editData.serviceStoreId));
              if (serviceStoreOption) {
                setSelectedServiceStore(serviceStoreOption);
              }
            } else {
              const toOption = toOptions.find(opt => String(opt.id) === String(editData.to_project_id || editData.toProjectId));
              if (toOption) {
                setSelectedTo(toOption);
              }
            }
            const inchargeOption = inchargeOptions.find(opt => String(opt.id) === String(editData.project_incharge_id || editData.projectInchargeId));
            if (inchargeOption) {
              setSelectedIncharge(inchargeOption);
            }
            setTimeout(() => {
              loadItems();
            }, 100);
          } else {
            const checkInterval = setInterval(() => {
              if (fromOptions.length > 0 && inchargeOptions.length > 0) {
                clearInterval(checkInterval);
                const fromOption = fromOptions.find(opt => String(opt.id) === String(editData.from_project_id || editData.fromProjectId));
                if (fromOption) {
                  setSelectedFrom(fromOption);
                }
                if (entryType === 'service') {
                  const serviceStoreOption = serviceStoreOptions.find(opt => String(opt.id) === String(editData.service_store_id || editData.serviceStoreId));
                  if (serviceStoreOption) {
                    setSelectedServiceStore(serviceStoreOption);
                  }
                } else {
                  const toOption = toOptions.find(opt => String(opt.id) === String(editData.to_project_id || editData.toProjectId));
                  if (toOption) {
                    setSelectedTo(toOption);
                  }
                }
                const inchargeOption = inchargeOptions.find(opt => String(opt.id) === String(editData.project_incharge_id || editData.projectInchargeId));
                if (inchargeOption) {
                  setSelectedIncharge(inchargeOption);
                }
                loadItems();
              }
            }, 100);
            setTimeout(() => clearInterval(checkInterval), 5000);
          }
          localStorage.removeItem('editingToolsTrackerEntryId');
        }
      } catch (error) {
        console.error('Error loading edit data:', error);
        localStorage.removeItem('editingToolsTrackerEntryId');
      }
    };
    loadEditData();
  }, [fromOptions, toOptions, serviceStoreOptions, inchargeOptions, toolsItemNameListData, toolsBrandFullData, toolsItemIdFullData]);
  const handleAddItem = () => {
    if (areFieldsFilled) {
      setShowAddItemsModal(true);
    }
  };
  const handleCloseAddItemsModal = () => {
    setShowAddItemsModal(false);
    setEditingItem(null);
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
    if (addItemFormData.itemName) {
      if (editingItem) {
        const newItemNameId = addItemFormData.itemNameId ? String(addItemFormData.itemNameId) : editingItem.item_name_id;
        const newItemIdDbId = addItemFormData.itemIdDbId ? String(addItemFormData.itemIdDbId) : editingItem.item_ids_id;
        const newBrandId = addItemFormData.brandId ? String(addItemFormData.brandId) : editingItem.brand_id;
        const newMachineNumber = addItemFormData.machineNumber || editingItem.machine_number || '';

        // If itemId is selected, only check the full set (itemIdsId + brandId + machineNumber)
        // Don't check itemNameId separately when itemId is selected
        if (selectedFrom && newItemIdDbId) {
          const itemSetValidation = validateItemSetAvailability(
            newItemIdDbId,
            newBrandId,
            newMachineNumber,
            newItemNameId,
            addItemFormData.itemName,
            selectedFrom.id
          );

          if (!itemSetValidation.isValid) {
            alert(itemSetValidation.errorMessage);
            return;
          }
        } else if (selectedFrom && newItemNameId) {
          // Only check itemNameId if itemId is NOT selected (for quantity-based transfers)
          // Check quantity availability with brandId if provided
          const newBrandId = addItemFormData.brandId ? String(addItemFormData.brandId) : editingItem.brand_id;
          const newQuantity = addItemFormData.quantity ? String(addItemFormData.quantity) : String(editingItem.quantity || 0);
          const validation = validateItemLocation(
            newItemNameId,
            addItemFormData.itemName,
            newBrandId,
            newQuantity,
            selectedFrom.id
          );

          if (!validation.isValid) {
            alert(validation.errorMessage);
            return;
          }
        }

        const updatedItem = {
          ...editingItem,
          item_name_id: newItemNameId,
          item_ids_id: addItemFormData.itemIdDbId ? String(addItemFormData.itemIdDbId) : editingItem.item_ids_id,
          brand_id: addItemFormData.brandId ? String(addItemFormData.brandId) : editingItem.brand_id,
          machine_number: addItemFormData.machineNumber || '',
          quantity: addItemFormData.quantity ? parseInt(addItemFormData.quantity, 10) : editingItem.quantity || 0,
          itemName: addItemFormData.itemName,
          brand: addItemFormData.brand,
          itemId: addItemFormData.itemId
        };
        setItems(prev => prev.map(item =>
          item.id === editingItem.id ? updatedItem : item
        ));
        setEditingItem(null);
        handleCloseAddItemsModal();
      } else {
        setShowUploadModal(true);
      }
    }
  };
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
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
    for (const file of files) {
      const fileId = Date.now() + Math.random();
      const localPreviewUrl = URL.createObjectURL(file);
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
        const progressInterval = setInterval(() => {
          setUploadFiles(prev => prev.map(f =>
            f.id === fileId && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          ));
        }, 100);
        const base64Data = await fileToBase64(file);
        clearInterval(progressInterval);
        setUploadFiles(prev => prev.map(f =>
          f.id === fileId
            ? { ...f, progress: 100, base64Data: base64Data }
            : f
        ));
      } catch (error) {
        console.error('Error converting file to base64:', error);
        setUploadFiles(prev => prev.filter(f => f.id !== fileId));
        alert(`Failed to process ${file.name}. Please try again.`);
      }
    }
    setIsUploading(false);
    e.target.value = '';
  };
  const normalizeMachineNumberValue = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  };
  const getMachineNumberCandidates = (machineNumber, machineNumberId) => {
    const candidates = new Set();
    const addCandidate = (value) => {
      const normalized = normalizeMachineNumberValue(value);
      if (normalized) candidates.add(normalized);
    };

    addCandidate(machineNumber);
    addCandidate(machineNumberId);

    const machineNumberNormalized = normalizeMachineNumberValue(machineNumber);
    const machineNumberIdNormalized = normalizeMachineNumberValue(machineNumberId);

    if (machineNumberNormalized) {
      const byId = machineNumbersList.find((m) => String(m?.id ?? m?._id) === machineNumberNormalized);
      if (byId) {
        addCandidate(byId?.machine_number ?? byId?.machineNumber);
        addCandidate(byId?.id ?? byId?._id);
      }
      const byNumber = machineNumbersList.find(
        (m) => normalizeMachineNumberValue(m?.machine_number ?? m?.machineNumber) === machineNumberNormalized
      );
      if (byNumber) {
        addCandidate(byNumber?.machine_number ?? byNumber?.machineNumber);
        addCandidate(byNumber?.id ?? byNumber?._id);
      }
    }

    if (machineNumberIdNormalized) {
      const byId = machineNumbersList.find((m) => String(m?.id ?? m?._id) === machineNumberIdNormalized);
      if (byId) {
        addCandidate(byId?.machine_number ?? byId?.machineNumber);
        addCandidate(byId?.id ?? byId?._id);
      }
    }

    return candidates;
  };
  const isMachineNumberMatch = (sourceMachineNumber, sourceMachineNumberId, targetMachineNumber) => {
    const targetNormalized = normalizeMachineNumberValue(targetMachineNumber);
    if (!targetNormalized) return true;
    const sourceCandidates = getMachineNumberCandidates(sourceMachineNumber, sourceMachineNumberId);
    return sourceCandidates.has(targetNormalized);
  };
  const getLocationLabelById = (locationId) => {
    const locationIdStr = String(locationId);
    const projectOption =
      toOptions.find(opt => String(opt.id) === locationIdStr) ||
      fromOptions.find(opt => String(opt.id) === locationIdStr);
    if (projectOption) return projectOption?.label || projectOption?.name || '';

    const vendorOption = vendorOptions.find(opt => String(opt.id) === locationIdStr);
    if (vendorOption) return vendorOption?.label || vendorOption?.name || '';

    return '';
  };
  const getItemIdLabelById = (itemIdsId) => {
    if (itemIdsId === null || itemIdsId === undefined || itemIdsId === '') return '';
    const itemIdsIdStr = String(itemIdsId);
    const itemIdObj = toolsItemIdFullData.find(item => String(item?.id) === itemIdsIdStr);
    return itemIdObj?.item_id || itemIdObj?.itemId || '';
  };
  const getBrandLabelById = (brandId) => {
    if (brandId === null || brandId === undefined || brandId === '') return '';
    const brandIdStr = String(brandId);
    const brandObj = toolsBrandFullData.find(brand => String(brand?.id) === brandIdStr);
    return brandObj?.tools_brand || brandObj?.toolsBrand || '';
  };
  const getItemNameLabelById = (itemNameId) => {
    if (itemNameId === null || itemNameId === undefined || itemNameId === '') return '';
    const itemNameIdStr = String(itemNameId);
    const itemNameObj = toolsItemNameListData.find(item => String(item?.id) === itemNameIdStr);
    return itemNameObj?.item_name || itemNameObj?.itemName || '';
  };
  const getEntryTypeNormalized = (entry) => {
    return String(entry?.tools_entry_type || entry?.toolsEntryType || '').toLowerCase();
  };
  const isRelocateEntryType = (entryType) => {
    return entryType === 'relocate' || entryType === 'relocation';
  };
  const isMovementEntryType = (entryType) => {
    return entryType === 'entry' || isRelocateEntryType(entryType);
  };
  const getEntrySortTime = (entry) => {
    const rawDate = entry?.created_date_time || entry?.createdDateTime || entry?.timestamp || '';
    const parsed = Date.parse(rawDate);
    if (!Number.isNaN(parsed)) return parsed;
    const numeric = Number(rawDate);
    return Number.isFinite(numeric) ? numeric : 0;
  };
  const findMatchingItemSetInEntry = (entry, itemIdsIdStr, brandIdStr, machineNumberStr) => {
    const entryItems = entry?.tools_tracker_item_name_table || entry?.toolsTrackerItemNameTable || [];
    return entryItems.find(entryItem => {
      const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
      const entryBrandId = entryItem.brand_id || entryItem.brandId;
      const entryMachineNumber = entryItem.machine_number || entryItem.machineNumber || '';
      const entryMachineNumberId = entryItem.machine_number_id || entryItem.machineNumberId;

      const itemIdsMatch = entryItemIdsId && String(entryItemIdsId) === itemIdsIdStr;
      const brandMatch = !brandIdStr || (entryBrandId && String(entryBrandId) === brandIdStr);
      const machineMatch = isMachineNumberMatch(entryMachineNumber, entryMachineNumberId, machineNumberStr);

      return itemIdsMatch && brandMatch && machineMatch;
    }) || null;
  };
  const getLatestItemSetMovement = (itemIdsIdStr, brandIdStr, machineNumberStr) => {
    let latestMovement = null;

    for (const entry of toolsTrackerManagementData) {
      const entryType = getEntryTypeNormalized(entry);
      if (!isMovementEntryType(entryType)) continue;

      const matchingEntryItem = findMatchingItemSetInEntry(entry, itemIdsIdStr, brandIdStr, machineNumberStr);
      if (!matchingEntryItem) continue;

      const entrySortTime = getEntrySortTime(entry);
      if (!latestMovement || entrySortTime > latestMovement.entrySortTime) {
        latestMovement = {
          entry,
          entryType,
          matchingEntryItem,
          entrySortTime
        };
      }
    }

    return latestMovement;
  };
  // Helper function to get current location of an item (quantity-based: itemNameId + brandId)
  const getItemCurrentLocation = (itemNameId, brandId) => {
    if (!itemNameId) return null;

    const itemNameIdStr = String(itemNameId);
    const brandIdStr = brandId ? String(brandId) : null;
    let currentLocationId = null;
    let locationType = null; // 'project' or 'home'

    // First, check in tools_tracker_management entries (transfer history)
    const matchesItem = (entryItem) => {
      const entryItemNameId = entryItem.item_name_id || entryItem.itemNameId;
      const entryBrandId = entryItem.brand_id || entryItem.brandId;
      const itemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
      if (itemIdsId) return false; // Skip item-set items
      const itemNameMatch = entryItemNameId && String(entryItemNameId) === itemNameIdStr;
      const brandMatch = !brandIdStr || (entryBrandId && String(entryBrandId) === brandIdStr);
      return itemNameMatch && brandMatch;
    };

    let mostRecentEntry = null;
    let mostRecentDate = null;
    for (const entry of toolsTrackerManagementData) {
      const entryType = entry.tools_entry_type || entry.toolsEntryType || '';
      if (entryType.toLowerCase() !== 'entry') continue;
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
      const hasItem = entryItems.some(matchesItem);
      if (hasItem) {
        const entryDate = entry.created_date_time || entry.createdDateTime || entry.timestamp || '';
        if (!mostRecentDate || entryDate > mostRecentDate) {
          mostRecentDate = entryDate;
          mostRecentEntry = entry;
        }
      }
    }

    if (mostRecentEntry) {
      const entryToProjectId = mostRecentEntry.to_project_id || mostRecentEntry.toProjectId;
      if (entryToProjectId) {
        currentLocationId = String(entryToProjectId);
        locationType = 'project';
        return { locationId: currentLocationId, locationType };
      }
    }

    const stockItem = stockManagementData.find(stock => {
      const stockItemNameId = stock.item_name_id || stock.itemNameId;
      const stockBrandId = stock.brand_name_id || stock.brandNameId;
      const noItemIdsId = !stock.item_ids_id && !stock.itemIdsId;
      const itemNameMatch = stockItemNameId && String(stockItemNameId) === itemNameIdStr;
      const brandMatch = !brandIdStr || (stockBrandId && String(stockBrandId) === brandIdStr);
      return itemNameMatch && brandMatch && noItemIdsId;
    });

    if (stockItem) {
      const homeLocationId = stockItem.home_location_id || stockItem.homeLocationId;
      if (homeLocationId) {
        currentLocationId = String(homeLocationId);
        locationType = 'home';
        return { locationId: currentLocationId, locationType };
      }
    }

    return null;
  };

  // Helper function to check if a specific item set (itemIdsId + brandId + machineNumber) is available at a location
  const isItemSetAvailableAtLocation = (itemIdsId, brandId, machineNumber, locationId) => {
    if (!itemIdsId || !locationId) return false;

    const itemIdsIdStr = String(itemIdsId);
    const brandIdStr = brandId ? String(brandId) : null;
    const machineNumberStr = machineNumber ? String(machineNumber).trim() : '';
    const locationIdStr = String(locationId);

    const latestMovement = getLatestItemSetMovement(itemIdsIdStr, brandIdStr, machineNumberStr);
    if (latestMovement) {
      if (isRelocateEntryType(latestMovement.entryType)) {
        const relocatedHomeLocationId = latestMovement.matchingEntryItem?.home_location_id || latestMovement.matchingEntryItem?.homeLocationId;
        return relocatedHomeLocationId && String(relocatedHomeLocationId) === locationIdStr;
      }

      const entryToProjectId = latestMovement.entry?.to_project_id || latestMovement.entry?.toProjectId;
      if (entryToProjectId) {
        return String(entryToProjectId) === locationIdStr;
      }

      const movementHomeLocationId = latestMovement.matchingEntryItem?.home_location_id || latestMovement.matchingEntryItem?.homeLocationId;
      if (movementHomeLocationId) {
        return String(movementHomeLocationId) === locationIdStr;
      }
    }

    // Fallback to stock management when no movement entry is found
    const stockItem = stockManagementData.find(stock => {
      const stockItemIdsId = stock.item_ids_id || stock.itemIdsId;
      const stockBrandId = stock.brand_name_id || stock.brandNameId;
      const stockMachineNumber = stock.machine_number || stock.machineNumber || '';
      const stockMachineNumberId = stock.machine_number_id || stock.machineNumberId;

      const itemIdsMatch = stockItemIdsId && String(stockItemIdsId) === itemIdsIdStr;
      const brandMatch = !brandIdStr || (stockBrandId && String(stockBrandId) === brandIdStr);
      const machineMatch = isMachineNumberMatch(stockMachineNumber, stockMachineNumberId, machineNumberStr);

      return itemIdsMatch && brandMatch && machineMatch;
    });

    if (!stockItem) return false;
    const homeLocationId = stockItem.home_location_id || stockItem.homeLocationId;
    return !!homeLocationId && String(homeLocationId) === locationIdStr;
  };

  // Helper function to get current location of an item set (itemIdsId + brandId + machineNumber)
  const getItemSetCurrentLocation = (itemIdsId, brandId, machineNumber) => {
    if (!itemIdsId) return null;

    const itemIdsIdStr = String(itemIdsId);
    const brandIdStr = brandId ? String(brandId) : null;
    const machineNumberStr = machineNumber ? String(machineNumber).trim() : '';
    let currentLocationId = null;
    let locationType = null; // 'project' or 'home'

    // First, check in tools_tracker_management entries (entry + relocate history)
    const latestMovement = getLatestItemSetMovement(itemIdsIdStr, brandIdStr, machineNumberStr);
    if (latestMovement) {
      if (isRelocateEntryType(latestMovement.entryType)) {
        const relocatedHomeLocationId = latestMovement.matchingEntryItem?.home_location_id || latestMovement.matchingEntryItem?.homeLocationId;
        if (relocatedHomeLocationId) {
          currentLocationId = String(relocatedHomeLocationId);
          locationType = 'home';
          return { locationId: currentLocationId, locationType };
        }
      }

      const entryToProjectId = latestMovement.entry?.to_project_id || latestMovement.entry?.toProjectId;
      if (entryToProjectId) {
        currentLocationId = String(entryToProjectId);
        locationType = 'project';
        return { locationId: currentLocationId, locationType };
      }

      const movementHomeLocationId = latestMovement.matchingEntryItem?.home_location_id || latestMovement.matchingEntryItem?.homeLocationId;
      if (movementHomeLocationId) {
        currentLocationId = String(movementHomeLocationId);
        locationType = 'home';
        return { locationId: currentLocationId, locationType };
      }
    }

    // If no toProjectId found, check home_location_id from stock management
    const stockItem = stockManagementData.find(stock => {
      const stockItemIdsId = stock.item_ids_id || stock.itemIdsId;
      const stockBrandId = stock.brand_name_id || stock.brandNameId;
      const stockMachineNumber = stock.machine_number || stock.machineNumber || '';
      const stockMachineNumberId = stock.machine_number_id || stock.machineNumberId;

      const itemIdsMatch = stockItemIdsId && String(stockItemIdsId) === itemIdsIdStr;
      const brandMatch = !brandIdStr || (stockBrandId && String(stockBrandId) === brandIdStr);
      const machineMatch = isMachineNumberMatch(stockMachineNumber, stockMachineNumberId, machineNumberStr);

      return itemIdsMatch && brandMatch && machineMatch;
    });

    if (stockItem) {
      const homeLocationId = stockItem.home_location_id || stockItem.homeLocationId;
      if (homeLocationId) {
        currentLocationId = String(homeLocationId);
        locationType = 'home';
        return { locationId: currentLocationId, locationType };
      }
    }

    return null; // Item set location not found
  };

  // Helper function to calculate available quantity of itemNameId (with optional brandId) at a location
  const getAvailableQuantityAtLocation = (itemNameId, brandId, locationId) => {
    if (!itemNameId || !locationId) return 0;

    const itemNameIdStr = String(itemNameId);
    const brandIdStr = brandId ? String(brandId) : null;
    const locationIdStr = String(locationId);
    let availableQuantity = 0;

    // Start with quantity from stock management (home location)
    // Filter by itemNameId and optionally brandId
    const stockItems = stockManagementData.filter(stock => {
      const stockItemNameId = stock.item_name_id || stock.itemNameId;
      const stockBrandId = stock.brand_name_id || stock.brandNameId;
      const stockHomeLocationId = stock.home_location_id || stock.homeLocationId;

      const itemNameMatch = stockItemNameId && String(stockItemNameId) === itemNameIdStr;
      const brandMatch = !brandIdStr || (stockBrandId && String(stockBrandId) === brandIdStr);
      const locationMatch = stockHomeLocationId && String(stockHomeLocationId) === locationIdStr;
      // Only count items without itemIdsId (quantity-based items)
      const noItemIdsId = !stock.item_ids_id && !stock.itemIdsId;

      return itemNameMatch && brandMatch && locationMatch && noItemIdsId;
    });

    // Sum quantities from stock management
    stockItems.forEach(stock => {
      const qty = parseInt(stock.quantity || 0, 10);
      availableQuantity += qty;
    });

    // Track transfers: add items transferred TO this location, subtract items transferred FROM this location
    for (const entry of toolsTrackerManagementData) {
      const entryType = entry.tools_entry_type || entry.toolsEntryType || '';
      if (entryType.toLowerCase() !== 'entry') continue; // Only check Entry type, not Service

      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
      const entryToProjectId = entry.to_project_id || entry.toProjectId;
      const entryFromProjectId = entry.from_project_id || entry.fromProjectId;

      for (const entryItem of entryItems) {
        // Only count items without itemIdsId (quantity-based items)
        const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        if (entryItemIdsId) continue; // Skip items with itemIdsId

        const entryItemNameId = entryItem.item_name_id || entryItem.itemNameId;
        const entryBrandId = entryItem.brand_id || entryItem.brandId;

        const itemNameMatch = entryItemNameId && String(entryItemNameId) === itemNameIdStr;
        const brandMatch = !brandIdStr || (entryBrandId && String(entryBrandId) === brandIdStr);

        if (itemNameMatch && brandMatch) {
          const itemQuantity = parseInt(entryItem.quantity || 0, 10);

          // If transferred TO this location, add to available quantity
          if (entryToProjectId && String(entryToProjectId) === locationIdStr) {
            availableQuantity += itemQuantity;
          }

          // If transferred FROM this location, subtract from available quantity
          if (entryFromProjectId && String(entryFromProjectId) === locationIdStr) {
            availableQuantity -= itemQuantity;
          }
        }
      }
    }

    return Math.max(0, availableQuantity); // Ensure non-negative
  };

  // Helper to get all locations where item (itemNameId + brandId) has positive quantity
  const getLocationsWithAvailableQuantity = (itemNameId, brandId) => {
    if (!itemNameId) return [];
    const itemNameIdStr = String(itemNameId);
    const brandIdStr = brandId ? String(brandId) : null;
    const locationIds = new Set();
    stockManagementData.forEach(stock => {
      const stockItemNameId = stock.item_name_id || stock.itemNameId;
      const stockBrandId = stock.brand_name_id || stock.brandNameId;
      const stockHomeLocationId = stock.home_location_id || stock.homeLocationId;
      const noItemIdsId = !stock.item_ids_id && !stock.itemIdsId;
      const itemNameMatch = stockItemNameId && String(stockItemNameId) === itemNameIdStr;
      const brandMatch = !brandIdStr || (stockBrandId && String(stockBrandId) === brandIdStr);
      if (itemNameMatch && brandMatch && noItemIdsId && stockHomeLocationId) {
        locationIds.add(String(stockHomeLocationId));
      }
    });
    toolsTrackerManagementData.forEach(entry => {
      const entryType = entry.tools_entry_type || entry.toolsEntryType || '';
      if (entryType.toLowerCase() !== 'entry') return;
      const entryItems = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
      entryItems.forEach(entryItem => {
        const entryItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
        if (entryItemIdsId) return;
        const entryItemNameId = entryItem.item_name_id || entryItem.itemNameId;
        const entryBrandId = entryItem.brand_id || entryItem.brandId;
        const itemNameMatch = entryItemNameId && String(entryItemNameId) === itemNameIdStr;
        const brandMatch = !brandIdStr || (entryBrandId && String(entryBrandId) === brandIdStr);
        if (itemNameMatch && brandMatch) {
          const toId = entry.to_project_id || entry.toProjectId;
          const fromId = entry.from_project_id || entry.fromProjectId;
          if (toId) locationIds.add(String(toId));
          if (fromId) locationIds.add(String(fromId));
        }
      });
    });
    return Array.from(locationIds)
      .map(locId => ({ locationId: locId, quantity: getAvailableQuantityAtLocation(itemNameId, brandId, locId) }))
      .filter(p => p.quantity > 0)
      .map(p => {
        const opt = fromOptions.find(o => String(o.id) === p.locationId) || toOptions.find(o => String(o.id) === p.locationId);
        return { ...p, locationName: opt?.label || opt?.name || `ID: ${p.locationId}` };
      });
  };

  // Validation function to check if item can be transferred from selected location (with quantity check)
  const validateItemLocation = (itemNameId, itemName, brandId, quantity, fromProjectId) => {
    if (!itemNameId || !fromProjectId) return { isValid: true };

    const fromProjectIdStr = String(fromProjectId);
    const requestedQuantity = parseInt(quantity || 0, 10);

    // If quantity is specified, check available quantity
    if (requestedQuantity > 0) {
      const availableQuantity = getAvailableQuantityAtLocation(itemNameId, brandId, fromProjectIdStr);

      if (availableQuantity < requestedQuantity) {
        const projectOption = toOptions.find(opt => String(opt.id) === fromProjectIdStr);
        const projectName = projectOption?.label || projectOption?.name || fromProjectIdStr;

        const resolvedBrand = getBrandLabelById(brandId);
        const resolvedItemName = itemName || getItemNameLabelById(itemNameId);
        const itemDetails = [
          resolvedItemName ? `Item Name: ${resolvedItemName}` : `Item Name ID: ${itemNameId}`,
          brandId ? `Brand: ${resolvedBrand || brandId}` : null
        ].filter(Boolean).join(', ');

        const currentLocations = getLocationsWithAvailableQuantity(itemNameId, brandId);
        const whereItIs = currentLocations.length > 0
          ? ` Currently available at: ${currentLocations.map(l => `"${l.locationName}" (${l.quantity} unit(s))`).join(', ')}.`
          : '';

        return {
          isValid: false,
          errorMessage: `Cannot transfer item "${itemName}" (${itemDetails}). Only ${availableQuantity} unit(s) available at "${projectName}" (Project ID: ${fromProjectIdStr}), but ${requestedQuantity} unit(s) requested.${whereItIs}`
        };
      }
    } else {
      // If no quantity specified, check if item exists at location (legacy check)
      const locationInfo = getItemCurrentLocation(itemNameId, brandId);
      if (!locationInfo) {
        return { isValid: true };
      }
      const { locationId, locationType } = locationInfo;
      if (locationId !== fromProjectIdStr) {
        let locationName = locationId;
        const resolvedLocationName = getLocationLabelById(locationId);
        if (resolvedLocationName) {
          locationName = resolvedLocationName;
        } else if (locationType === 'home') {
          locationName = `Home Location (ID: ${locationId})`;
        }
        const resolvedBrand = getBrandLabelById(brandId);
        const resolvedItemName = itemName || getItemNameLabelById(itemNameId);
        const itemDetails = [
          resolvedItemName ? `Item Name: ${resolvedItemName}` : `Item Name ID: ${itemNameId}`,
          brandId ? `Brand: ${resolvedBrand || brandId}` : null
        ].filter(Boolean).join(', ');
        return {
          isValid: false,
          errorMessage: `Cannot transfer item "${itemName}" (${itemDetails}). This item is currently ${locationType === 'project' ? 'in project' : 'at home location'} "${locationName}" (ID: ${locationId}), not in the selected "From" project.`
        };
      }
    }
    return { isValid: true };
  };
  // Validation function to check if item set (itemIdsId + brandId + machineNumber) is available at location (before sending to backend)
  const validateItemSetAvailability = (itemIdsId, brandId, machineNumber, itemNameId, itemName, fromProjectId) => {
    if (!itemIdsId || !fromProjectId) return { isValid: true }; // If no itemId selected, skip check    
    const fromProjectIdStr = String(fromProjectId);
    const isAvailable = isItemSetAvailableAtLocation(itemIdsId, brandId, machineNumber, fromProjectIdStr);
    if (!isAvailable) {
      const projectOption = toOptions.find(opt => String(opt.id) === fromProjectIdStr);
      const projectName = projectOption?.label || projectOption?.name || fromProjectIdStr;
      // Find where the item set currently is (entry + relocate aware)
      let currentLocation = null;
      let currentLocationName = 'unknown location';
      const currentLocationInfo = getItemSetCurrentLocation(itemIdsId, brandId, machineNumber);
      if (currentLocationInfo?.locationId) {
        currentLocation = String(currentLocationInfo.locationId);
        currentLocationName = getLocationLabelById(currentLocation)
          || (currentLocationInfo.locationType === 'home'
            ? `Home Location (ID: ${currentLocation})`
            : currentLocation);
      }

      const resolvedItemId = getItemIdLabelById(itemIdsId);
      const resolvedBrand = getBrandLabelById(brandId);
      const itemSetDetails = [
        `Item ID: ${resolvedItemId || itemIdsId}`,
        brandId ? `Brand: ${resolvedBrand || brandId}` : null,
        machineNumber ? `Machine Number: ${machineNumber}` : null
      ].filter(Boolean).join(', ');

      return {
        isValid: false,
        errorMessage: `Cannot transfer item "${itemName}" (${itemSetDetails}). This item set is currently at "${currentLocationName}", not at the selected "From" project "${projectName}".`
      };
    }

    return { isValid: true };
  };

  const handleConfirmUpload = () => {
    // If itemId is selected, only check the full set (itemIdsId + brandId + machineNumber)
    // Don't check itemNameId separately when itemId is selected
    if (selectedFrom && addItemFormData.itemIdDbId) {
      const itemSetValidation = validateItemSetAvailability(
        addItemFormData.itemIdDbId,
        addItemFormData.brandId,
        addItemFormData.machineNumber,
        addItemFormData.itemNameId,
        addItemFormData.itemName,
        selectedFrom.id
      );

      if (!itemSetValidation.isValid) {
        alert(itemSetValidation.errorMessage);
        return;
      }
    } else if (selectedFrom && addItemFormData.itemNameId) {
      // Only check itemNameId if itemId is NOT selected (for quantity-based transfers)
      // Check quantity availability with brandId if provided
      const validation = validateItemLocation(
        addItemFormData.itemNameId,
        addItemFormData.itemName,
        addItemFormData.brandId,
        addItemFormData.quantity,
        selectedFrom.id
      );

      if (!validation.isValid) {
        alert(validation.errorMessage);
        return;
      }
    }

    const uploadedImages = uploadFiles
      .filter(f => f.base64Data) // Only include files with base64 data
      .map(f => ({
        tools_image: f.base64Data // Send as byte array (base64 encoded)
      }));
    const localImageUrls = uploadFiles
      .filter(f => f.localUrl)
      .map(f => f.localUrl);
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
      localImageUrls: localImageUrls,
      itemName: addItemFormData.itemName,
      brand: addItemFormData.brand,
      itemId: addItemFormData.itemId
    };
    setItems([...items, newItem]);
    handleCloseUploadModal();
    handleCloseAddItemsModal();
  };
  const hasEditChanges = () => {
    if (!originalEditData) return true;
    const orig = originalEditData;
    const fromId = selectedFrom?.id ? String(selectedFrom.id) : null;
    const toId = selectedTo?.id ? String(selectedTo.id) : null;
    const storeId = selectedServiceStore?.id ? String(selectedServiceStore.id) : null;
    const inchargeId = selectedIncharge?.id ? String(selectedIncharge.id) : null;
    if (String(orig.from_project_id) !== String(fromId)) return true;
    if (String(orig.to_project_id || '') !== String(toId || '')) return true;
    if (String(orig.service_store_id || '') !== String(storeId || '')) return true;
    if (String(orig.project_incharge_id || '') !== String(inchargeId || '')) return true;
    if ((orig.items || []).length !== items.length) return true;
    for (let i = 0; i < items.length; i++) {
      const curr = items[i];
      const origItem = (orig.items || [])[i];
      if (!origItem) return true;
      if (String(curr.item_name_id || '') !== String(origItem.item_name_id || '')) return true;
      if (String(curr.item_ids_id || '') !== String(origItem.item_ids_id || '')) return true;
      if (String(curr.brand_id || '') !== String(origItem.brand_id || '')) return true;
      if (String(curr.machine_number || '') !== String(origItem.machine_number || '')) return true;
      if (Number(curr.quantity) !== Number(origItem.quantity)) return true;
      if (String(curr.machine_status || '') !== String(origItem.machine_status || '')) return true;
      if (String(curr.description || '') !== String(origItem.description || '')) return true;
      if (String(curr.model || '') !== String(origItem.model || '')) return true;
    }
    return false;
  };
  const handleUpdateTransfer = async () => {
    if (!editEntryId || !originalEditData) return;
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
    if (!hasEditChanges()) {
      alert('No changes to save');
      return;
    }
    setIsSaving(true);
    try {
      const statusItemsForApi = [];
      const updatedItemRows = [];
      for (const item of items) {
        const origItemIds = (originalEditData?.items || []).map(it => it.id).filter(Boolean);
        const isExistingItem = origItemIds.some(oid => String(oid) === String(item.id));
        const itemRow = {
          id: isExistingItem && item.id ? item.id : null,
          timestamp: item.timestamp || new Date().toISOString().slice(0, 19),
          item_name_id: item.item_name_id || null,
          item_ids_id: item.item_ids_id || null,
          brand_id: item.brand_id || null,
          model: item.model || '',
          quantity: item.quantity || 0,
          machine_status: item.machine_status || 'Working',
          description: item.description || '',
          tools_item_live_images: item.tools_item_live_images || []
        };

        if (itemRow.item_ids_id) {
          const machineNumberId = resolveMachineNumberIdForItemSet(
            itemRow.item_ids_id,
            itemRow.brand_id,
            item.machine_number || ''
          );
          const hasMachineNumberIdConfigured = hasMachineNumberIdConfiguredForItemSet(
            itemRow.item_ids_id,
            itemRow.brand_id,
            item.machine_number || ''
          );
          if (hasMachineNumberIdConfigured && !machineNumberId) {
            const itemIdLabel = item.itemId || getItemIdLabelById(itemRow.item_ids_id) || itemRow.item_ids_id;
            alert(`Machine Number ID is required for Item ID "${itemIdLabel}". Please select this item again and try.`);
            setIsSaving(false);
            return;
          }
          if (machineNumberId) {
            itemRow.machine_number_id = String(machineNumberId);
          }
        }

        updatedItemRows.push(itemRow);

        if (itemRow.item_ids_id && item.machine_number) {
          statusItemsForApi.push({
            item_ids_id: itemRow.item_ids_id,
            machine_number_id: itemRow.machine_number_id || null,
            machine_status: itemRow.machine_status
          });
        }
      }

      const payload = {
        from_project_id: selectedFrom?.id ? String(selectedFrom.id) : null,
        to_project_id: entryServiceMode === 'Entry' && selectedTo?.id ? String(selectedTo.id) : null,
        project_incharge_id: selectedIncharge?.id ? String(selectedIncharge.id) : null,
        service_store_id: entryServiceMode === 'Service' && selectedServiceStore?.id ? String(selectedServiceStore.id) : null,
        tools_entry_type: entryServiceMode.toLowerCase(),
        tools_tracker_item_name_table: updatedItemRows
      };
      const editedBy = user?.name || user?.username || 'mobile';
      const response = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/update/${editEntryId}?editedBy=${encodeURIComponent(editedBy)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Failed to update: ${response.status} ${response.statusText}`);
      }

      // Save machine_status to the new API for each item that has itemIdsId and machine_number_id
      const machineStatusPromises = statusItemsForApi
        .filter(item => item.item_ids_id && item.machine_number_id)
        .map(async (item) => {
          try {
            const statusResponse = await fetch(`${TOOLS_MACHINE_STATUS_BASE_URL}/save`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                item_ids_id: String(item.item_ids_id),
                machine_number_id: String(item.machine_number_id),
                machine_status: item.machine_status || 'Working',
                created_by: user?.name || user?.username || 'mobile'
              })
            });
            if (!statusResponse.ok) {
              console.error(`Failed to save machine status for item ${item.item_ids_id}, machineId ${item.machine_number_id}`);
            }
          } catch (error) {
            console.error('Error saving machine status:', error);
          }
        });

      // Wait for all machine status saves to complete (don't block on errors)
      await Promise.allSettled(machineStatusPromises);

      alert('Updated successfully!');
      localStorage.removeItem('editingToolsTrackerEntryId');
      setIsEditMode(false);
      setEditEntryId(null);
      setOriginalEditData(null);
      setSelectedFrom(null);
      setSelectedTo(null);
      setSelectedServiceStore(null);
      setSelectedIncharge(null);
      setItems([]);
      const endpoint = entryServiceMode === 'Service'
        ? `${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/getServiceCount`
        : `${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/getEntryCount`;
      const countRes = await fetch(endpoint);
      if (countRes.ok) {
        const data = await countRes.json();
        setEntryNo(data + 1);
      }
    } catch (error) {
      console.error('Error updating transfer:', error);
      alert('Failed to update. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  const handleSaveTransfer = async () => {
    if (entryServiceMode === 'Relocate') {
      if (!selectedRelocateItemId || !selectedCurrentLocation || !selectedRelocateLocation) {
        alert('Please fill in all required fields (Item ID, Current Location, and Relocate Location)');
        return;
      }
    } else {
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
    }

    // Validation: Check if items are available at fromProjectId (before sending to backend)
    // Skip validation for Relocate mode as it uses different flow
    if (entryServiceMode !== 'Relocate' && selectedFrom) {
      const fromProjectId = String(selectedFrom.id);

      for (const item of items) {
        if (!item.item_name_id) continue;

        // If itemId is selected, only check the full set (itemIdsId + brandId + machineNumber)
        // Don't check itemNameId separately when itemId is selected
        if (item.item_ids_id) {
          const itemSetValidation = validateItemSetAvailability(
            item.item_ids_id,
            item.brand_id,
            item.machine_number,
            item.item_name_id,
            item.itemName,
            fromProjectId
          );

          if (!itemSetValidation.isValid) {
            alert(itemSetValidation.errorMessage);
            setIsSaving(false);
            return;
          }
        } else {
          // Only check itemNameId if itemId is NOT selected (for quantity-based transfers)
          // Check quantity availability with brandId if provided
          const validation = validateItemLocation(
            item.item_name_id,
            item.itemName,
            item.brand_id,
            item.quantity,
            fromProjectId
          );

          if (!validation.isValid) {
            alert(validation.errorMessage);
            setIsSaving(false);
            return;
          }
        }
      }
    }

    // Additional validation: Check if items are currently in a different project (for Entry mode)
    if (entryServiceMode === 'Entry' && selectedTo && selectedFrom) {
      const targetProjectId = String(selectedTo.id);
      const fromProjectId = String(selectedFrom.id);

      for (const item of items) {
        // If itemId is selected, check by full set (itemIdsId + brandId + machineNumber)
        // Otherwise, check by itemNameId (for quantity-based transfers)
        if (item.item_ids_id) {
          // Check by full set
          const locationInfo = getItemSetCurrentLocation(
            item.item_ids_id,
            item.brand_id,
            item.machine_number
          );
          if (!locationInfo) continue; // Item set location not found - allow transfer

          const { locationId, locationType } = locationInfo;

          // If item set is in a project (not home), check if it's different from both FROM and TO
          if (locationType === 'project') {
            const currentProjectId = String(locationId);

            // Allow transfer if we're transferring FROM the project where item set currently is
            // Block if item set is in a different project than both FROM and TO
            if (currentProjectId !== fromProjectId && currentProjectId !== targetProjectId) {
              const projectOption = toOptions.find(opt => String(opt.id) === currentProjectId);
              const projectName = projectOption?.label || projectOption?.name || currentProjectId;
              const itemName = item.itemName || 'Unknown Item';
              const resolvedItemId = item.itemId || getItemIdLabelById(item.item_ids_id) || item.item_ids_id;
              const resolvedBrand = item.brand || getBrandLabelById(item.brand_id) || item.brand_id;
              const itemSetDetails = [
                `Item ID: ${resolvedItemId}`,
                item.brand_id ? `Brand: ${resolvedBrand}` : null,
                item.machine_number ? `Machine Number: ${item.machine_number}` : null
              ].filter(Boolean).join(', ');
              alert(`Cannot transfer item "${itemName}" (${itemSetDetails}). This item set is currently in project "${projectName}". Please return it to home location first or transfer it from the current project.`);
              setIsSaving(false);
              return;
            }
          }
        } else if (item.item_name_id) {
          // Check by itemNameId + brandId (for quantity-based transfers)
          const locationInfo = getItemCurrentLocation(item.item_name_id, item.brand_id);
          if (!locationInfo) continue; // Item location not found - allow transfer

          const { locationId, locationType } = locationInfo;

          // If item is in a project (not home), check if it's different from both FROM and TO
          if (locationType === 'project') {
            const currentProjectId = String(locationId);

            // Allow transfer if we're transferring FROM the project where item currently is
            // Block if item is in a different project than both FROM and TO
            if (currentProjectId !== fromProjectId && currentProjectId !== targetProjectId) {
              const projectOption = toOptions.find(opt => String(opt.id) === currentProjectId);
              const projectName = projectOption?.label || projectOption?.name || currentProjectId;
              const itemName = item.itemName || 'Unknown Item';
              const resolvedItemName = itemName || getItemNameLabelById(item.item_name_id) || item.item_name_id;
              alert(`Cannot transfer item "${itemName}" (Item Name: ${resolvedItemName}). This item is currently in project "${projectName}". Please return it to home location first or transfer it from the current project.`);
              setIsSaving(false);
              return;
            }
          }
        }
      }
    }

    setIsSaving(true);
    try {
      let payload;
      const statusItemsForApi = [];

      if (entryServiceMode === 'Relocate') {
        // For Relocate mode, get item details from stock management
        const stockItem = stockManagementData.find(item => {
          const itemIdsId = item?.item_ids_id ?? item?.itemIdsId;
          return String(itemIdsId) === String(selectedRelocateItemId);
        });

        if (!stockItem) {
          alert('Item not found in stock management');
          setIsSaving(false);
          return;
        }

        const relocateMachineNumberId = resolveMachineNumberIdForItemSet(
          selectedRelocateItemId,
          stockItem.brand_id || stockItem.brandId || stockItem.brand_name_id || stockItem.brandNameId || null,
          stockItem.machine_number || stockItem.machineNumber || ''
        );
        const relocateHasMachineNumberIdConfigured = hasMachineNumberIdConfiguredForItemSet(
          selectedRelocateItemId,
          stockItem.brand_id || stockItem.brandId || stockItem.brand_name_id || stockItem.brandNameId || null,
          stockItem.machine_number || stockItem.machineNumber || ''
        );
        if (relocateHasMachineNumberIdConfigured && !relocateMachineNumberId) {
          alert('Machine Number ID is required for this selected Item ID. Please reselect the item and try again.');
          setIsSaving(false);
          return;
        }

        const relocateItemRow = {
          timestamp: new Date().toISOString().slice(0, 19),
          item_name_id: stockItem.item_name_id || stockItem.itemNameId || null,
          item_ids_id: String(selectedRelocateItemId),
          brand_id: stockItem.brand_id || stockItem.brandId || stockItem.brand_name_id || stockItem.brandNameId || null,
          model: stockItem.model || '',
          quantity: stockItem.quantity || 0,
          machine_status: stockItem.machine_status || stockItem.machineStatus || 'Working',
          description: '',
          home_location_id: selectedRelocateLocation?.id ? String(selectedRelocateLocation.id) : null,
          tools_item_live_images: []
        };
        if (relocateMachineNumberId) {
          relocateItemRow.machine_number_id = String(relocateMachineNumberId);
        }

        payload = {
          from_project_id: selectedCurrentLocation?.id ? String(selectedCurrentLocation.id) : null,
          to_project_id: null,
          project_incharge_id: null,
          service_store_id: null,
          created_by: user?.name || user?.username || 'mobile',
          tools_entry_type: 'relocate',
          eno: String(entryNo),
          tools_tracker_item_name_table: [relocateItemRow]
        };
        if (relocateItemRow.item_ids_id && relocateItemRow.machine_number_id) {
          statusItemsForApi.push({
            item_ids_id: relocateItemRow.item_ids_id,
            machine_number_id: relocateItemRow.machine_number_id,
            machine_status: relocateItemRow.machine_status
          });
        }
      } else {
        const itemRows = [];
        for (const item of items) {
          const itemRow = {
            timestamp: item.timestamp || new Date().toISOString().slice(0, 19),
            item_name_id: item.item_name_id || null,
            item_ids_id: item.item_ids_id || null,
            brand_id: item.brand_id || null,
            model: item.model || '',
            quantity: item.quantity || 0,
            machine_status: item.machine_status || 'Working',
            description: item.description || '',
            tools_item_live_images: item.tools_item_live_images || []
          };

          if (itemRow.item_ids_id) {
            const machineNumberId = resolveMachineNumberIdForItemSet(
              itemRow.item_ids_id,
              itemRow.brand_id,
              item.machine_number || ''
            );
            const hasMachineNumberIdConfigured = hasMachineNumberIdConfiguredForItemSet(
              itemRow.item_ids_id,
              itemRow.brand_id,
              item.machine_number || ''
            );
            if (hasMachineNumberIdConfigured && !machineNumberId) {
              const itemIdLabel = item.itemId || getItemIdLabelById(itemRow.item_ids_id) || itemRow.item_ids_id;
              alert(`Machine Number ID is required for Item ID "${itemIdLabel}". Please select this item again and try.`);
              setIsSaving(false);
              return;
            }
            if (machineNumberId) {
              itemRow.machine_number_id = String(machineNumberId);
            }
            if (item.machine_number) {
              statusItemsForApi.push({
                item_ids_id: itemRow.item_ids_id,
                machine_number_id: itemRow.machine_number_id || null,
                machine_status: itemRow.machine_status
              });
            }
          }

          itemRows.push(itemRow);
        }

        payload = {
          from_project_id: selectedFrom?.id ? String(selectedFrom.id) : null,
          to_project_id: entryServiceMode === 'Entry' && selectedTo?.id ? String(selectedTo.id) : null,
          project_incharge_id: selectedIncharge?.id ? String(selectedIncharge.id) : null,
          service_store_id: entryServiceMode === 'Service' && selectedServiceStore?.id ? String(selectedServiceStore.id) : null,
          created_by: user?.name || user?.username || 'mobile',
          tools_entry_type: entryServiceMode.toLowerCase(), // "entry" or "service"
          eno: String(entryNo),
          tools_tracker_item_name_table: itemRows
        };
      }
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

      // Save machine_status to the new API for each item that has itemIdsId and machine_number_id
      const machineStatusPromises = statusItemsForApi
        .filter(item => item.item_ids_id && item.machine_number_id)
        .map(async (item) => {
          try {
            const statusResponse = await fetch(`${TOOLS_MACHINE_STATUS_BASE_URL}/save`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                item_ids_id: String(item.item_ids_id),
                machine_number_id: String(item.machine_number_id),
                machine_status: item.machine_status || 'Working',
                created_by: user?.name || user?.username || 'mobile'
              })
            });
            if (!statusResponse.ok) {
              console.error(`Failed to save machine status for item ${item.item_ids_id}, machineId ${item.machine_number_id}`);
            }
          } catch (error) {
            console.error('Error saving machine status:', error);
          }
        });

      // Wait for all machine status saves to complete (don't block on errors)
      await Promise.allSettled(machineStatusPromises);

      alert('Transfer saved successfully!');
      setSelectedFrom(null);
      setSelectedTo(null);
      setSelectedServiceStore(null);
      setSelectedIncharge(null);
      setSelectedRelocateItemId(null);
      setSelectedCurrentLocation(null);
      setSelectedRelocateLocation(null);
      setRelocateItemDetails(null);
      setItems([]);
      setEntryNo(prev => prev + 1);
    } catch (error) {
      console.error('Error saving transfer:', error);
      alert('Failed to save transfer. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  const handleRemoveItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };
  const handleEditItem = (item) => {
    setEditingItem(item);
    setAddItemFormData({
      itemName: item.itemName || '',
      itemNameId: item.item_name_id ? String(item.item_name_id) : null,
      brand: item.brand || '',
      brandId: item.brand_id ? String(item.brand_id) : null,
      itemId: item.itemId || '',
      itemIdDbId: item.item_ids_id ? String(item.item_ids_id) : null,
      quantity: item.quantity ? String(item.quantity) : '',
      machineNumber: item.machine_number || item.machineNumber || ''
    });
    setShowAddItemsModal(true);
  };
  const handleOpenImageViewer = (item, imageIndex = 0) => {
    const images = item.localImageUrls || [];
    if (images.length === 0) return;
    setImageViewerData({
      images: images,
      currentIndex: imageIndex,
      itemName: item.itemName || 'Unknown Item',
      itemId: item.itemId || '',
      itemUniqueId: item.id, // Store the unique id for updating
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
  const handleDeleteViewerImage = (indexToDelete) => {
    const currentItemId = imageViewerData.itemUniqueId;
    if (!currentItemId) return;
    setItems(prev => prev.map(item => {
      if (item.id === currentItemId) {
        const newLocalImages = [...(item.localImageUrls || [])];
        const newToolsImages = [...(item.tools_item_live_images || [])];
        newLocalImages.splice(indexToDelete, 1);
        if (newToolsImages.length > indexToDelete) {
          newToolsImages.splice(indexToDelete, 1);
        }
        return {
          ...item,
          localImageUrls: newLocalImages,
          tools_item_live_images: newToolsImages
        };
      }
      return item;
    }));
    setImageViewerData(prev => {
      const newImages = [...prev.images];
      newImages.splice(indexToDelete, 1);
      if (newImages.length === 0) {
        setShowImageViewer(false);
        return prev;
      }
      let newIndex = prev.currentIndex;
      if (newIndex >= newImages.length) {
        newIndex = newImages.length - 1;
      }
      return {
        ...prev,
        images: newImages,
        currentIndex: newIndex
      };
    });
  };
  const handleAddImageToViewer = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const currentItemId = imageViewerData.itemUniqueId;
    if (!currentItemId) return;
    for (const file of files) {
      try {
        const localPreviewUrl = URL.createObjectURL(file);
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        setItems(prev => prev.map(item => {
          if (item.id === currentItemId) {
            return {
              ...item,
              localImageUrls: [...(item.localImageUrls || []), localPreviewUrl],
              tools_item_live_images: [...(item.tools_item_live_images || []), { tools_image: base64Data }]
            };
          }
          return item;
        }));
        setImageViewerData(prev => ({
          ...prev,
          images: [...prev.images, localPreviewUrl],
          currentIndex: prev.images.length
        }));
      } catch (error) {
        console.error('Error adding image:', error);
      }
    }
    e.target.value = '';
  };
  const handleDeleteUploadFile = (fileId) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };
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
  const resolveMachineNumberText = (machineNumberOrId) => {
    if (machineNumberOrId === null || machineNumberOrId === undefined || machineNumberOrId === '') return '';
    const value = String(machineNumberOrId).trim();
    if (!value) return '';

    const byId = machineNumbersList.find((m) => String(m?.id ?? m?._id) === value);
    if (byId) {
      return (byId?.machine_number ?? byId?.machineNumber ?? '').trim();
    }

    const byNumber = machineNumbersList.find(
      (m) => String(m?.machine_number ?? m?.machineNumber ?? '').trim() === value
    );
    if (byNumber) {
      return (byNumber?.machine_number ?? byNumber?.machineNumber ?? '').trim();
    }
    return value;
  };
  const resolveMachineNumFromStock = (item) => {
    if (!item) return '';
    const machineNumberId = item?.machine_number_id ?? item?.machineNumberId;
    if (machineNumberId) {
      const resolved = resolveMachineNumberText(machineNumberId);
      if (resolved) return resolved;
    }
    return resolveMachineNumberText(item?.machine_number ?? item?.machineNumber ?? '');
  };
  const resolveMachineNumberId = (machineNumberOrId) => {
    if (machineNumberOrId === null || machineNumberOrId === undefined || machineNumberOrId === '') return null;
    const value = String(machineNumberOrId).trim();
    if (!value) return null;

    const byId = machineNumbersList.find((m) => String(m?.id ?? m?._id) === value);
    if (byId) return String(byId?.id ?? byId?._id);

    const byNumber = machineNumbersList.find(
      (m) => String(m?.machine_number ?? m?.machineNumber ?? '').trim() === value
    );
    if (byNumber) return String(byNumber?.id ?? byNumber?._id);

    return null;
  };
  const hasMachineNumberIdConfiguredForItemSet = (itemIdsId, brandId, machineNumber) => {
    if (!itemIdsId) return false;

    const itemIdsIdStr = String(itemIdsId);
    const brandIdStr = brandId ? String(brandId) : null;
    const machineNumberStr = machineNumber ? String(machineNumber).trim() : '';

    const matchingStockRows = stockManagementData.filter(stock => {
      const stockItemIdsId = stock?.item_ids_id ?? stock?.itemIdsId;
      const stockBrandId = stock?.brand_id ?? stock?.brandId ?? stock?.brand_name_id ?? stock?.brandNameId;
      const stockMachineNumber = stock?.machine_number ?? stock?.machineNumber ?? '';
      const stockMachineNumberId = stock?.machine_number_id ?? stock?.machineNumberId;
      const itemIdsMatch = stockItemIdsId && String(stockItemIdsId) === itemIdsIdStr;
      const brandMatch = !brandIdStr || (stockBrandId && String(stockBrandId) === brandIdStr);
      const machineMatch = !machineNumberStr || isMachineNumberMatch(stockMachineNumber, stockMachineNumberId, machineNumberStr);
      return itemIdsMatch && brandMatch && machineMatch;
    });

    if (matchingStockRows.length > 0) {
      return matchingStockRows.some(stock => (stock?.machine_number_id ?? stock?.machineNumberId));
    }

    return !!resolveMachineNumberId(machineNumber);
  };
  const resolveMachineNumberIdForItemSet = (itemIdsId, brandId, machineNumber) => {
    if (!itemIdsId) return null;

    const itemIdsIdStr = String(itemIdsId);
    const brandIdStr = brandId ? String(brandId) : null;
    const machineNumberStr = machineNumber ? String(machineNumber).trim() : '';

    const exactStock = stockManagementData.find(stock => {
      const stockItemIdsId = stock?.item_ids_id ?? stock?.itemIdsId;
      const stockBrandId = stock?.brand_id ?? stock?.brandId ?? stock?.brand_name_id ?? stock?.brandNameId;
      const stockMachineNumber = stock?.machine_number ?? stock?.machineNumber ?? '';
      const stockMachineNumberId = stock?.machine_number_id ?? stock?.machineNumberId;
      const itemIdsMatch = stockItemIdsId && String(stockItemIdsId) === itemIdsIdStr;
      const brandMatch = !brandIdStr || (stockBrandId && String(stockBrandId) === brandIdStr);
      const machineMatch = !machineNumberStr || isMachineNumberMatch(stockMachineNumber, stockMachineNumberId, machineNumberStr);
      return itemIdsMatch && brandMatch && machineMatch;
    });
    const exactStockMachineNumberId = exactStock?.machine_number_id ?? exactStock?.machineNumberId;
    if (exactStockMachineNumberId) return String(exactStockMachineNumberId);

    const fallbackStock = stockManagementData.find(stock => {
      const stockItemIdsId = stock?.item_ids_id ?? stock?.itemIdsId;
      const stockBrandId = stock?.brand_id ?? stock?.brandId ?? stock?.brand_name_id ?? stock?.brandNameId;
      const itemIdsMatch = stockItemIdsId && String(stockItemIdsId) === itemIdsIdStr;
      const brandMatch = !brandIdStr || (stockBrandId && String(stockBrandId) === brandIdStr);
      return itemIdsMatch && brandMatch;
    });
    const fallbackStockMachineNumberId = fallbackStock?.machine_number_id ?? fallbackStock?.machineNumberId;
    if (fallbackStockMachineNumberId) return String(fallbackStockMachineNumberId);

    return resolveMachineNumberId(machineNumber);
  };
  const getItemCountByNameAndBrand = (itemNameId, brandId) => {
    if (!itemNameId) return 0;
    const itemNameIdStr = String(itemNameId);
    const brandIdStr = brandId ? String(brandId) : null;

    const quantityBasedStock = stockManagementData.filter(item => {
      const stockItemNameId = item?.item_name_id ?? item?.itemNameId;
      const stockItemIdsId = item?.item_ids_id ?? item?.itemIdsId;
      const stockBrandId = item?.brand_id ?? item?.brandId ?? item?.brand_name_id ?? item?.brandNameId;
      const itemNameMatch = String(stockItemNameId) === itemNameIdStr;
      const noItemIdsId = !stockItemIdsId;
      const brandMatch = !brandIdStr || (stockBrandId && String(stockBrandId) === brandIdStr);
      return itemNameMatch && noItemIdsId && brandMatch;
    });

    const itemSetStock = stockManagementData.filter(item => {
      const stockItemNameId = item?.item_name_id ?? item?.itemNameId;
      const stockItemIdsId = item?.item_ids_id ?? item?.itemIdsId;
      const stockBrandId = item?.brand_id ?? item?.brandId ?? item?.brand_name_id ?? item?.brandNameId;
      const itemNameMatch = String(stockItemNameId) === itemNameIdStr;
      const hasItemIdsId = !!stockItemIdsId;
      const brandMatch = !brandIdStr || (stockBrandId && String(stockBrandId) === brandIdStr);
      return itemNameMatch && hasItemIdsId && brandMatch;
    });

    const quantitySum = quantityBasedStock.reduce((sum, item) => sum + parseInt(item?.quantity || 0, 10), 0);
    return quantitySum + itemSetStock.length;
  };
  const handleFieldChange = (field, value) => {
    setAddItemFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'itemId' && value) {
        updated.quantity = '';
        setSelectedItemNameQuantity(0);
      } else if (field === 'quantity' && value && value.trim() !== '') {
        updated.itemId = '';
        updated.itemIdDbId = null;
        updated.machineNumber = '';
        setSelectedItemMachineNumber('');
      }
      if (field === 'itemName' && value) {
        const itemNameObj = toolsItemNameListData.find(
          item => (item?.item_name ?? item?.itemName) === value
        );
        updated.itemNameId = itemNameObj?.id ?? null;
        const toolsDetails = Array.isArray(itemNameObj?.tools_details)
          ? itemNameObj.tools_details
          : Array.isArray(itemNameObj?.toolsDetails)
            ? itemNameObj.toolsDetails
            : [];
        const brandIdToUse = updated.brandId ?? prev.brandId;
        const quantityBasedStock = stockManagementData.filter(item => {
          const itemNameId = item?.item_name_id ?? item?.itemNameId;
          const itemIdsId = item?.item_ids_id ?? item?.itemIdsId;
          const brandId = item?.brand_id ?? item?.brandId ?? item?.brand_name_id ?? item?.brandNameId;
          const itemNameMatch = String(itemNameId) === String(itemNameObj?.id);
          const noItemIdsId = !itemIdsId;
          const brandMatch = !brandIdToUse || (brandId && String(brandId) === String(brandIdToUse));
          return itemNameMatch && noItemIdsId && brandMatch;
        });
        const itemSetStock = stockManagementData.filter(item => {
          const itemNameId = item?.item_name_id ?? item?.itemNameId;
          const itemIdsId = item?.item_ids_id ?? item?.itemIdsId;
          const brandId = item?.brand_id ?? item?.brandId ?? item?.brand_name_id ?? item?.brandNameId;
          const itemNameMatch = String(itemNameId) === String(itemNameObj?.id);
          const hasItemIdsId = !!itemIdsId;
          const brandMatch = !brandIdToUse || (brandId && String(brandId) === String(brandIdToUse));
          return itemNameMatch && hasItemIdsId && brandMatch;
        });
        const quantitySum = quantityBasedStock.reduce((sum, item) => sum + parseInt(item?.quantity || 0, 10), 0);
        const itemSetCount = itemSetStock.length;
        const totalCount = quantitySum + itemSetCount;
        setSelectedItemNameQuantity(totalCount);
      } else if (field === 'itemName' && !value) {
        updated.itemNameId = null;
        setSelectedItemNameQuantity(0);
      }
      if (field === 'brand' && value) {
        const brandObj = toolsBrandFullData.find(
          b => (b?.tools_brand?.trim() ?? b?.toolsBrand?.trim()) === value
        );
        updated.brandId = brandObj?.id ?? null;
        if (updated.itemNameId && updated.itemName) {
          const itemNameObj = toolsItemNameListData.find(
            i => String(i?.id) === String(updated.itemNameId)
          );
          const brandIdToUse = updated.brandId;
          const quantityBasedStock = stockManagementData.filter(item => {
            const itemNameId = item?.item_name_id ?? item?.itemNameId;
            const itemIdsId = item?.item_ids_id ?? item?.itemIdsId;
            const brandId = item?.brand_id ?? item?.brandId ?? item?.brand_name_id ?? item?.brandNameId;
            const itemNameMatch = String(itemNameId) === String(itemNameObj?.id);
            const noItemIdsId = !itemIdsId;
            const brandMatch = !brandIdToUse || (brandId && String(brandId) === String(brandIdToUse));
            return itemNameMatch && noItemIdsId && brandMatch;
          });
          const itemSetStock = stockManagementData.filter(item => {
            const itemNameId = item?.item_name_id ?? item?.itemNameId;
            const itemIdsId = item?.item_ids_id ?? item?.itemIdsId;
            const brandId = item?.brand_id ?? item?.brandId ?? item?.brand_name_id ?? item?.brandNameId;
            const itemNameMatch = String(itemNameId) === String(itemNameObj?.id);
            const hasItemIdsId = !!itemIdsId;
            const brandMatch = !brandIdToUse || (brandId && String(brandId) === String(brandIdToUse));
            return itemNameMatch && hasItemIdsId && brandMatch;
          });
          const quantitySum = quantityBasedStock.reduce((sum, item) => sum + parseInt(item?.quantity || 0, 10), 0);
          const itemSetCount = itemSetStock.length;
          const totalCount = quantitySum + itemSetCount;
          setSelectedItemNameQuantity(totalCount);
        }
      } else if (field === 'brand' && !value) {
        updated.brandId = null;
        if (updated.itemNameId && updated.itemName) {
          const itemNameObj = toolsItemNameListData.find(
            i => String(i?.id) === String(updated.itemNameId)
          );
          const quantityBasedStock = stockManagementData.filter(item => {
            const itemNameId = item?.item_name_id ?? item?.itemNameId;
            const itemIdsId = item?.item_ids_id ?? item?.itemIdsId;
            const itemNameMatch = String(itemNameId) === String(itemNameObj?.id);
            const noItemIdsId = !itemIdsId;
            return itemNameMatch && noItemIdsId;
          });
          const itemSetStock = stockManagementData.filter(item => {
            const itemNameId = item?.item_name_id ?? item?.itemNameId;
            const itemIdsId = item?.item_ids_id ?? item?.itemIdsId;
            const itemNameMatch = String(itemNameId) === String(itemNameObj?.id);
            const hasItemIdsId = !!itemIdsId;
            return itemNameMatch && hasItemIdsId;
          });
          const quantitySum = quantityBasedStock.reduce((sum, item) => sum + parseInt(item?.quantity || 0, 10), 0);
          const itemSetCount = itemSetStock.length;
          const totalCount = quantitySum + itemSetCount;
          setSelectedItemNameQuantity(totalCount);
        }
      }
      if (field === 'itemId' && value) {
        const itemIdObj = toolsItemIdFullData.find(
          item => (item?.item_id?.trim() ?? item?.itemId?.trim()) === value
        );
        updated.itemIdDbId = itemIdObj?.id ?? null;

        if (itemIdObj?.id) {
          const itemIdsIdStr = String(itemIdObj.id);

          // Find all entries with this item_ids_id from both stockManagementData and toolsTrackerManagementData
          const allEntries = [];

          // Get from stockManagementData
          stockManagementData.forEach(item => {
            const itemIdsId = item?.item_ids_id ?? item?.itemIdsId;
            if (String(itemIdsId) === itemIdsIdStr) {
              allEntries.push({
                id: item?.id ?? item?._id ?? 0,
                timestamp: item?.timestamp || item?.created_date_time || item?.createdDateTime || '',
                item_name_id: item?.item_name_id ?? item?.itemNameId,
                brand_id: item?.brand_id ?? item?.brandId ?? item?.brand_name_id ?? item?.brandNameId,
                machine_number: resolveMachineNumFromStock(item)
              });
            }
          });

          // Get from toolsTrackerManagementData
          toolsTrackerManagementData.forEach(entry => {
            const entryItems = entry?.tools_tracker_item_name_table ?? entry?.toolsTrackerItemNameTable ?? [];
            entryItems.forEach(item => {
              const itemIdsId = item?.item_ids_id ?? item?.itemIdsId;
              if (String(itemIdsId) === itemIdsIdStr) {
                allEntries.push({
                  id: entry?.id ?? entry?._id ?? 0,
                  timestamp: entry?.created_date_time ?? entry?.createdDateTime ?? entry?.timestamp ?? '',
                  item_name_id: item?.item_name_id ?? item?.itemNameId,
                  brand_id: item?.brand_id ?? item?.brandId,
                  machine_number: resolveMachineNumberText(
                    item?.machine_number_id ??
                    item?.machineNumberId ??
                    item?.machine_number ??
                    item?.machineNumber ??
                    ''
                  )
                });
              }
            });
          });

          // Sort by id descending (highest id = most recent) or timestamp descending
          allEntries.sort((a, b) => {
            // First try to sort by id (numeric comparison)
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            if (idB !== idA) {
              return idB - idA;
            }
            // If ids are equal or both 0, sort by timestamp
            if (a.timestamp && b.timestamp) {
              return new Date(b.timestamp) - new Date(a.timestamp);
            }
            return 0;
          });

          // Get the last (most recent) entry
          const lastEntry = allEntries.length > 0 ? allEntries[0] : null;
          let countItemNameId = null;
          let countBrandId = null;

          if (lastEntry) {
            // Set Item Name from the last entry
            if (lastEntry.item_name_id) {
              const itemNameObj = toolsItemNameListData.find(
                item => String(item?.id) === String(lastEntry.item_name_id)
              );
              if (itemNameObj) {
                updated.itemName = itemNameObj?.item_name ?? itemNameObj?.itemName ?? '';
                updated.itemNameId = itemNameObj?.id ?? null;
                countItemNameId = itemNameObj?.id ?? null;
              }
            }

            // Set Brand from the last entry
            if (lastEntry.brand_id) {
              const brandObj = toolsBrandFullData.find(
                b => String(b?.id) === String(lastEntry.brand_id)
              );
              if (brandObj) {
                updated.brand = brandObj?.tools_brand ?? brandObj?.toolsBrand ?? '';
                updated.brandId = brandObj?.id ?? null;
                countBrandId = brandObj?.id ?? null;
              }
            }

            // Get latest machine number from new API that doesn't have "Machine Dead" status
            const machineStatusesForItemId = Array.isArray(machineStatusData)
              ? machineStatusData.filter(status => {
                const statusItemIdsId = String(status.item_ids_id || status.itemIdsId || '');
                return statusItemIdsId === itemIdsIdStr;
              })
              : [];

            // Group by machine number and get latest status for each
            const machineStatusMap = new Map();
            machineStatusesForItemId.forEach(status => {
              const machineNum = resolveMachineNumberText(
                status.machine_number_id ||
                status.machineNumberId ||
                status.machine_number ||
                status.machineNumber ||
                ''
              );
              if (machineNum) {
                const existing = machineStatusMap.get(machineNum);
                if (!existing || (status.id || 0) > (existing.id || 0)) {
                  machineStatusMap.set(machineNum, status);
                }
              }
            });

            // Find the latest machine number that doesn't have "Machine Dead" status
            let latestMachineNumber = null;
            let latestStatusId = 0;

            machineStatusMap.forEach((status, machineNum) => {
              const machineStatus = (status.machine_status || status.machineStatus || '').trim();
              const machineStatusLower = machineStatus.toLowerCase();
              // Include all statuses EXCEPT "Machine Dead" and "Not Working"
              // This includes: "Working", "Under Repair", empty string, or any other status
              if (machineStatusLower !== 'machine dead' &&
                machineStatusLower !== 'not working') {
                const statusId = status.id || 0;
                if (statusId > latestStatusId) {
                  latestStatusId = statusId;
                  latestMachineNumber = machineNum;
                }
              }
            });

            // If found in new API, use it
            if (latestMachineNumber) {
              updated.machineNumber = latestMachineNumber;
              setSelectedItemMachineNumber(latestMachineNumber);
            } else {
              // Check if lastEntry.machine_number is NOT dead before using it as fallback
              const lastEntryMachineNum = lastEntry.machine_number ? String(lastEntry.machine_number).trim() : '';
              if (lastEntryMachineNum) {
                const lastEntryStatus = machineStatusMap.get(lastEntryMachineNum);
                if (lastEntryStatus) {
                  // Machine number exists in new API - check its status
                  const lastEntryMachineStatus = (lastEntryStatus.machine_status || lastEntryStatus.machineStatus || '').trim();
                  const lastEntryMachineStatusLower = lastEntryMachineStatus.toLowerCase();
                  // Only use fallback if it's not "Machine Dead" or "Not Working"
                  if (lastEntryMachineStatusLower !== 'machine dead' &&
                    lastEntryMachineStatusLower !== 'not working' &&
                    lastEntryMachineStatus !== 'Machine Dead' &&
                    lastEntryMachineStatus !== 'Not Working') {
                    updated.machineNumber = lastEntryMachineNum;
                    setSelectedItemMachineNumber(lastEntryMachineNum);
                  } else {
                    // Last entry machine is dead, don't use it
                    updated.machineNumber = '';
                    setSelectedItemMachineNumber('');
                  }
                } else {
                  // No status found in new API for last entry machine - safe to use it
                  // (It's probably a new machine or status hasn't been set yet)
                  updated.machineNumber = lastEntryMachineNum;
                  setSelectedItemMachineNumber(lastEntryMachineNum);
                }
              } else {
                updated.machineNumber = '';
                setSelectedItemMachineNumber('');
              }
            }
            if (!countItemNameId) {
              countItemNameId = lastEntry.item_name_id ?? null;
            }
            if (!countBrandId) {
              countBrandId = lastEntry.brand_id ?? null;
            }
          } else {
            // If no entry found, try to get itemName from stockManagementData (fallback)
            const stockItem = stockManagementData.find(item => {
              const itemIdsId = item?.item_ids_id ?? item?.itemIdsId;
              return String(itemIdsId) === itemIdsIdStr;
            });

            if (stockItem?.item_name_id) {
              const itemNameObj = toolsItemNameListData.find(
                item => String(item?.id) === String(stockItem.item_name_id)
              );
              if (itemNameObj) {
                updated.itemName = itemNameObj?.item_name ?? itemNameObj?.itemName ?? '';
                updated.itemNameId = itemNameObj?.id ?? null;
                countItemNameId = itemNameObj?.id ?? null;
              }
            }
            countBrandId = stockItem?.brand_id ?? stockItem?.brandId ?? stockItem?.brand_name_id ?? stockItem?.brandNameId ?? null;

            // Get latest machine number from new API that doesn't have "Machine Dead" status
            const machineStatusesForItemId = Array.isArray(machineStatusData)
              ? machineStatusData.filter(status => {
                const statusItemIdsId = String(status.item_ids_id || status.itemIdsId || '');
                return statusItemIdsId === itemIdsIdStr;
              })
              : [];

            // Group by machine number and get latest status for each
            const machineStatusMap = new Map();
            machineStatusesForItemId.forEach(status => {
              const machineNum = resolveMachineNumberText(
                status.machine_number_id ||
                status.machineNumberId ||
                status.machine_number ||
                status.machineNumber ||
                ''
              );
              if (machineNum) {
                const existing = machineStatusMap.get(machineNum);
                if (!existing || (status.id || 0) > (existing.id || 0)) {
                  machineStatusMap.set(machineNum, status);
                }
              }
            });

            // Find the latest machine number that doesn't have "Machine Dead" status
            let latestMachineNumber = null;
            let latestStatusId = 0;

            machineStatusMap.forEach((status, machineNum) => {
              const machineStatus = (status.machine_status || status.machineStatus || '').trim();
              const machineStatusLower = machineStatus.toLowerCase();
              // Include all statuses EXCEPT "Machine Dead" and "Not Working"
              // This includes: "Working", "Under Repair", empty string, or any other status
              if (machineStatusLower !== 'machine dead' &&
                machineStatusLower !== 'not working') {
                const statusId = status.id || 0;
                if (statusId > latestStatusId) {
                  latestStatusId = statusId;
                  latestMachineNumber = machineNum;
                }
              }
            });

            // If found in new API, use it
            if (latestMachineNumber) {
              updated.machineNumber = latestMachineNumber;
              setSelectedItemMachineNumber(latestMachineNumber);
            } else {
              // Check if stockItem.machine_number is NOT dead before using it as fallback
              const stockMachineNum = resolveMachineNumFromStock(stockItem);
              const stockMachineNumStr = stockMachineNum ? String(stockMachineNum).trim() : '';
              if (stockMachineNumStr) {
                const stockMachineStatus = machineStatusMap.get(stockMachineNumStr);
                if (stockMachineStatus) {
                  // Machine number exists in new API - check its status
                  const stockMachineStatusValue = (stockMachineStatus.machine_status || stockMachineStatus.machineStatus || '').trim();
                  const stockMachineStatusLower = stockMachineStatusValue.toLowerCase();
                  // Only use fallback if it's not "Machine Dead" or "Not Working"
                  if (stockMachineStatusLower !== 'machine dead' &&
                    stockMachineStatusLower !== 'not working' &&
                    stockMachineStatusValue !== 'Machine Dead' &&
                    stockMachineStatusValue !== 'Not Working') {
                    updated.machineNumber = stockMachineNumStr;
                    setSelectedItemMachineNumber(stockMachineNumStr);
                  } else {
                    // Stock machine is dead, don't use it
                    updated.machineNumber = '';
                    setSelectedItemMachineNumber('');
                  }
                } else {
                  // No status found in new API for stock machine - safe to use it
                  // (It's probably a new machine or status hasn't been set yet)
                  updated.machineNumber = stockMachineNumStr;
                  setSelectedItemMachineNumber(stockMachineNumStr);
                }
              } else {
                updated.machineNumber = '';
                setSelectedItemMachineNumber('');
              }
            }
          }
          // Keep UI badge in sync even if a branch above didn't call setter.
          setSelectedItemMachineNumber(updated.machineNumber || '');
          const finalItemNameId = countItemNameId ?? updated.itemNameId;
          const finalBrandId = countBrandId ?? updated.brandId;
          setSelectedItemNameQuantity(getItemCountByNameAndBrand(finalItemNameId, finalBrandId));
        }
      } else if (field === 'itemId' && !value) {
        updated.itemIdDbId = null;
        updated.itemName = '';
        updated.itemNameId = null;
        updated.brand = '';
        updated.brandId = null;
        updated.machineNumber = '';
        setSelectedItemNameQuantity(0);
        setSelectedItemMachineNumber('');
      }
      return updated;
    });
  };
  const handleAddNewItemName = async (newItemName) => {
    if (!newItemName || !newItemName.trim()) {
      return;
    }
    const trimmedName = newItemName.trim();
    if (itemNameOptions.some(name => name.toLowerCase() === trimmedName.toLowerCase())) {
      handleFieldChange('itemName', trimmedName);
      return;
    }
    try {
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
      // Try to get ID from response first
      let savedItemId = null;
      try {
        const responseText = await res.clone().text();
        if (responseText) {
          const responseData = JSON.parse(responseText);
          savedItemId = responseData?.id ?? responseData?._id ?? null;
        }
      } catch {
        // If response doesn't have JSON, continue to refresh
      }

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

        // Find the ID from refreshed data if not in response
        if (!savedItemId) {
          const newItem = (Array.isArray(data) ? data : []).find(
            item => (item?.item_name ?? item?.itemName) === trimmedName
          );
          savedItemId = newItem?.id ?? newItem?._id ?? null;
        }

        // Set both itemName and itemNameId
        setAddItemFormData(prev => ({
          ...prev,
          itemName: trimmedName,
          itemNameId: savedItemId
        }));
      }
    } catch (e) {
      console.error('Error saving new Item Name:', e);
      alert('Failed to save new Item Name. Please try again.');
    }
  };
  const handleAddNewBrand = async (newBrand) => {
    if (!newBrand || !newBrand.trim()) {
      return;
    }
    const trimmedBrand = newBrand.trim();
    if (brandOptions.some(b => b.toLowerCase() === trimmedBrand.toLowerCase())) {
      handleFieldChange('brand', trimmedBrand);
      return;
    }
    try {
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
      // Try to get ID from response first
      let savedBrandId = null;
      try {
        const responseText = await res.clone().text();
        if (responseText) {
          const responseData = JSON.parse(responseText);
          savedBrandId = responseData?.id ?? responseData?._id ?? null;
        }
      } catch {
        // If response doesn't have JSON, continue to refresh
      }

      const refreshed = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        setToolsBrandFullData(Array.isArray(data) ? data : []);
        const brandOpts = (Array.isArray(data) ? data : [])
          .map(b => b?.tools_brand?.trim() ?? b?.toolsBrand?.trim())
          .filter(b => b);
        setBrandOptions(Array.from(new Set(brandOpts)));

        // Find the ID from refreshed data if not in response
        if (!savedBrandId) {
          const newBrand = (Array.isArray(data) ? data : []).find(
            b => (b?.tools_brand?.trim() ?? b?.toolsBrand?.trim()) === trimmedBrand
          );
          savedBrandId = newBrand?.id ?? newBrand?._id ?? null;
        }

        // Set both brand and brandId
        setAddItemFormData(prev => ({
          ...prev,
          brand: trimmedBrand,
          brandId: savedBrandId
        }));
      }
    } catch (e) {
      console.error('Error saving new Brand:', e);
      alert('Failed to save new Brand. Please try again.');
    }
  };
  const handleAddNewItemId = async (newItemId) => {
    if (!newItemId || !newItemId.trim()) {
      return;
    }
    const trimmedItemId = newItemId.trim();
    if (itemIdOptions.some(id => id.toLowerCase() === trimmedItemId.toLowerCase())) {
      handleFieldChange('itemId', trimmedItemId);
      return;
    }
    try {
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
      // Try to get ID from response first
      let savedItemIdDbId = null;
      try {
        const responseText = await res.clone().text();
        if (responseText) {
          const responseData = JSON.parse(responseText);
          savedItemIdDbId = responseData?.id ?? responseData?._id ?? null;
        }
      } catch {
        // If response doesn't have JSON, continue to refresh
      }

      const refreshed = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        setToolsItemIdFullData(Array.isArray(data) ? data : []);
        const itemIdOpts = (Array.isArray(data) ? data : [])
          .map(item => item?.item_id?.trim() ?? item?.itemId?.trim())
          .filter(item => item)
          .filter(item => !/^\d+$/.test(item));
        setApiItemIdOptions(itemIdOpts);
        setItemIdOptions(itemIdOpts);

        // Find the ID from refreshed data if not in response
        if (!savedItemIdDbId) {
          const newItemId = (Array.isArray(data) ? data : []).find(
            item => (item?.item_id?.trim() ?? item?.itemId?.trim()) === trimmedItemId
          );
          savedItemIdDbId = newItemId?.id ?? newItemId?._id ?? null;
        }

        // Set both itemId and itemIdDbId
        setAddItemFormData(prev => ({
          ...prev,
          itemId: trimmedItemId,
          itemIdDbId: savedItemIdDbId
        }));
      }
    } catch (e) {
      console.error('Error saving new Item ID:', e);
      alert('Failed to save new Item ID. Please try again.');
    }
  };
  return (
    <div className="flex flex-col min-h-[calc(100vh-90px-80px)] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex-shrink-0 px-4 pt-1 pb-0.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <p className="text-[12px] font-semibold text-black leading-normal">
            #{entryNo || 'NO'}
          </p>
          <button type="button" onClick={() => setShowDatePicker(true)} className="text-[12px] font-semibold text-black leading-normal underline-offset-2 hover:underline">
            {date}
          </button>
        </div>
        <div className='flex gap-3'>
          {!isEditMode && ((items.length > 0 && areFieldsFilled) || (entryServiceMode === 'Relocate' && areFieldsFilled)) && (
            <button onClick={() => setShowConfirmModal(true)} disabled={isSaving} className="flex items-center gap-1 text-[14px] font-medium text-black">
              {isSaving ? (
                <span className="text-gray-500">...</span>
              ) : (
                <span>{entryServiceMode === 'Service' ? 'Sent to service' : entryServiceMode === 'Relocate' ? 'Relocate' : 'Transfer'}</span>
              )}
            </button>
          )}
          {!isEditMode && (
            <div>
              <button onClick={() => setIsEditingTransferDetails(!isEditingTransferDetails)}>
                <img src={Edit} alt="Edit" className="w-[14px] h-[14px]" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 px-4 pb-2">
        {isEditMode ? (
          <div className="flex bg-[#E0E0E0] items-center h-[36px] rounded-[8px]">
            <button
              onClick={handleUpdateTransfer}
              disabled={isSaving || !areFieldsFilled || items.length === 0}
              className="flex-1 h-full rounded text-[12px] font-semibold leading-normal bg-[#007233] text-white disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
            >
              {isSaving ? 'Updating...' : 'Update'}
            </button>
          </div>
        ) : (
          <div className="flex bg-[#E0E0E0] items-center h-9 rounded-md">
            <button
              onClick={handleSwitchToEntry}
              className={`flex-1 ml-0.5 h-8 rounded text-[12px] font-semibold leading-normal duration-1000 ease-out transition-colors ${entryServiceMode === 'Entry'
                ? 'bg-white text-black'
                : 'bg-transparent text-[#848484]'
                }`}
            >
              Entry
            </button>
            <button
              onClick={handleSwitchToService}
              className={`flex-1 h-8 rounded text-[12px] font-semibold leading-normal duration-1000 ease-out transition-colors ${entryServiceMode === 'Service'
                ? 'bg-white text-black'
                : 'bg-transparent text-[#848484]'
                }`}
            >
              Service
            </button>
            <button
              onClick={handleSwitchToRelocate}
              className={`flex-1 h-8 rounded mr-0.5 text-[12px] font-semibold leading-normal duration-1000 ease-out transition-colors ${entryServiceMode === 'Relocate'
                ? 'bg-white text-black'
                : 'bg-transparent text-[#848484]'
                }`}
            >
              Relocate
            </button>
          </div>
        )}
      </div>
      {items.length > 0 && !isEditingTransferDetails && entryServiceMode !== 'Relocate' && (
        <div className="flex-shrink-0 px-4">
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
      {(items.length === 0 || isEditingTransferDetails) && entryServiceMode !== 'Relocate' && (
        <div className="flex-shrink-0 px-4 space-y-[6px]">
          <div className="relative dropdown-container">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              From<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <div
                onClick={() => {
                  setShowFromDropdown(!showFromDropdown);
                  setShowToDropdown(false);
                  setShowInchargeDropdown(false);
                }}
                className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
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
          {showFromDropdown && entryServiceMode !== 'Relocate' && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 -top-4 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowFromDropdown(false);
                }
              }}
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center px-6 pt-5">
                  <p className="text-[16px] font-semibold text-black">Select From</p>
                  <button onClick={() => setShowFromDropdown(false)} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                    <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
                  </button>
                </div>
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
                <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6">
                  <div className="shadow-md rounded-lg overflow-hidden">
                    {fromSearchQuery.trim() && !fromOptions.some(opt => {
                      const normalizedOpt = normalizeSearchText(opt.label);
                      const normalizedQuery = normalizeSearchText(fromSearchQuery.trim());
                      return normalizedOpt === normalizedQuery;
                    }) && (
                        <button
                          onClick={() => {
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
                                // Validate existing items before changing "From" project
                                if (items.length > 0) {
                                  const invalidItems = [];
                                  for (const item of items) {
                                    if (!item.item_name_id) continue;

                                    // If itemId is selected, only check the full set (itemIdsId + brandId + machineNumber)
                                    // Don't check itemNameId separately when itemId is selected
                                    if (item.item_ids_id) {
                                      const itemSetValidation = validateItemSetAvailability(
                                        item.item_ids_id,
                                        item.brand_id,
                                        item.machine_number,
                                        item.item_name_id,
                                        item.itemName,
                                        option.id
                                      );

                                      if (!itemSetValidation.isValid) {
                                        invalidItems.push({
                                          name: item.itemName || 'Unknown Item',
                                          error: itemSetValidation.errorMessage
                                        });
                                      }
                                    } else {
                                      // Only check itemNameId if itemId is NOT selected (for quantity-based transfers)
                                      // Check quantity availability with brandId if provided
                                      const validation = validateItemLocation(
                                        item.item_name_id,
                                        item.itemName,
                                        item.brand_id,
                                        item.quantity,
                                        option.id
                                      );

                                      if (!validation.isValid) {
                                        invalidItems.push({
                                          name: item.itemName || 'Unknown Item',
                                          error: validation.errorMessage
                                        });
                                      }
                                    }
                                  }

                                  if (invalidItems.length > 0) {
                                    const errorMessage = invalidItems
                                      .map(inv => inv.error)
                                      .join('\n\n');
                                    alert(`Cannot change "From" project. The following items are not in the selected location:\n\n${errorMessage}`);
                                    setShowFromDropdown(false);
                                    return;
                                  }
                                }

                                setSelectedFrom(option);
                                setShowFromDropdown(false);
                                setIsEditingTransferDetails(false);
                              }}
                              className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                                }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button onClick={(e) => handleToggleFromFavorite(e, option.id)} className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                  {isFavorite ? (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ) : (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </button>
                                <p className="text-[14px] font-medium text-black text-left truncate">{option.label}</p>
                              </div>
                              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                                {isSelected ? (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none" />
                                    <circle cx="10" cy="10" r="4" fill="#e4572e" />
                                  </svg>
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
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
          {entryServiceMode === 'Entry' && (
            <div className="relative dropdown-container">
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
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
                  className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
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
          {entryServiceMode === 'Service' && (
            <div className="mb-4 relative dropdown-container">
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
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
                  className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
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
          {showToDropdown && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 -top-4 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowToDropdown(false);
                }
              }}
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center px-6 pt-5">
                  <p className="text-[16px] font-semibold text-black">Select To</p>
                  <button onClick={() => setShowToDropdown(false)} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                  <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
                  </button>
                </div>
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
                <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6">
                  <div className="shadow-md rounded-lg overflow-hidden">
                    {toSearchQuery.trim() && !toOptions.some(opt => {
                      const normalizedOpt = normalizeSearchText(opt.label);
                      const normalizedQuery = normalizeSearchText(toSearchQuery.trim());
                      return normalizedOpt === normalizedQuery;
                    }) && (
                        <button
                          onClick={() => {
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
                                setIsEditingTransferDetails(false);
                              }}
                              className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                                }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button onClick={(e) => handleToggleToFavorite(e, option.id)} className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                  {isFavorite ? (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ) : (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </button>
                                <p className="text-[14px] font-medium text-black text-left truncate">{option.label}</p>
                              </div>
                              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                                {isSelected ? (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none" />
                                    <circle cx="10" cy="10" r="4" fill="#e4572e" />
                                  </svg>
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
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
          {showServiceStoreDropdown && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 -top-4 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowServiceStoreDropdown(false);
                }
              }}
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center px-6 pt-5">
                  <p className="text-[16px] font-semibold text-black">Select Service Store</p>
                  <button onClick={() => setShowServiceStoreDropdown(false)} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                  <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
                  </button>
                </div>
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
                <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6">
                  <div className="shadow-md rounded-lg overflow-hidden">
                    {serviceStoreSearchQuery.trim() && !serviceStoreOptions.some(opt => {
                      const normalizedOpt = normalizeSearchText(opt.label);
                      const normalizedQuery = normalizeSearchText(serviceStoreSearchQuery.trim());
                      return normalizedOpt === normalizedQuery;
                    }) && (
                        <button
                          onClick={() => {
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
                                setIsEditingTransferDetails(false);
                              }}
                              className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                                }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button onClick={(e) => handleToggleServiceStoreFavorite(e, option.id)} className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                  {isFavorite ? (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ) : (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </button>
                                <p className="text-[14px] font-medium text-black text-left truncate">{option.label}</p>
                              </div>
                              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                                {isSelected ? (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none" />
                                    <circle cx="10" cy="10" r="4" fill="#e4572e" />
                                  </svg>
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
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
          <div className="relative dropdown-container">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
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
                className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
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
          {showInchargeDropdown && (
            <div className="fixed inset-0 bg-black -top-4 bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowInchargeDropdown(false);
                }
              }}
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()} >
                <div className="flex justify-between items-center px-6 pt-5">
                  <p className="text-[16px] font-semibold text-black">Select Project Incharge</p>
                  <button onClick={() => setShowInchargeDropdown(false)} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity" >
                  <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
                  </button>
                </div>
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
                <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6">
                  <div className="shadow-md rounded-lg overflow-hidden">
                    {inchargeSearchQuery.trim() && !inchargeOptions.some(opt => {
                      const normalizedOpt = normalizeSearchText(opt.label);
                      const normalizedQuery = normalizeSearchText(inchargeSearchQuery.trim());
                      return normalizedOpt === normalizedQuery;
                    }) && (
                        <button
                          onClick={() => {
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
                                setIsEditingTransferDetails(false);
                              }}
                              className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                                }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button onClick={(e) => handleToggleInchargeFavorite(e, option.id)} className="w-6 h-6 flex items-center justify-center flex-shrink-0" >
                                  {isFavorite ? (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ) : (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </button>
                                <p className="text-[14px] font-medium text-black text-left truncate">{option.label}</p>
                              </div>
                              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                                {isSelected ? (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none" />
                                    <circle cx="10" cy="10" r="4" fill="#e4572e" />
                                  </svg>
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
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
      {entryServiceMode === 'Relocate' && (
        <div className="flex-shrink-0 px-4 space-y-[6px]">
          <div className="relative dropdown-container">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Item ID<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <div
                onClick={() => {
                  setShowRelocateItemIdDropdown(true);
                  setShowCurrentLocationDropdown(false);
                  setShowRelocateLocationDropdown(false);
                }}
                className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  color: selectedRelocateItemId ? '#000' : '#9E9E9E',
                  boxSizing: 'border-box',
                  paddingRight: selectedRelocateItemId ? '40px' : '40px'
                }}
              >
                {selectedRelocateItemId ? (toolsItemIdFullData.find(i => String(i?.id) === String(selectedRelocateItemId))?.item_id || toolsItemIdFullData.find(i => String(i?.id) === String(selectedRelocateItemId))?.itemId || '') : 'Select Item ID'}
              </div>
              {selectedRelocateItemId && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRelocateItemId(null);
                    setSelectedCurrentLocation(null);
                    setRelocateItemDetails(null);
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
            {showRelocateItemIdDropdown && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowRelocateItemIdDropdown(false);
                  }
                }}
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center px-6 pt-5">
                    <p className="text-[16px] font-semibold text-black">Select Item ID</p>
                    <button onClick={() => setShowRelocateItemIdDropdown(false)} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                    <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
                    </button>
                  </div>
                  <div className="px-6 pt-4 pb-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={relocateItemIdSearchQuery}
                        onChange={(e) => setRelocateItemIdSearchQuery(e.target.value)}
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
                  <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="shadow-md rounded-lg overflow-hidden">
                      {relocateItemIdSearchQuery.trim() && !itemIdOptions.some(opt => {
                        const normalizedOpt = normalizeSearchText(opt);
                        const normalizedQuery = normalizeSearchText(relocateItemIdSearchQuery.trim());
                        return normalizedOpt === normalizedQuery;
                      }) && (
                          <button
                            onClick={() => {
                              handleAddNewItemId(relocateItemIdSearchQuery.trim());
                            }}
                            className="w-full h-[36px] px-6 flex items-center bg-gray-100 gap-2 hover:bg-[#F5F5F5] transition-colors"
                          >
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </div>
                            <p className="text-[14px] text-gray-600 font-normal text-left truncate">New Item ID</p>
                          </button>
                        )}
                      {getFilteredItemIdOptions().length > 0 ? (
                        <div className="space-y-0">
                          {getFilteredItemIdOptions().map((option) => {
                            const itemIdObj = toolsItemIdFullData.find(i => (i?.item_id?.trim() ?? i?.itemId?.trim()) === option);
                            const itemIdDbId = itemIdObj?.id;
                            const isFavorite = itemIdDbId && relocateItemIdFavorites.includes(itemIdDbId);
                            const isSelected = selectedRelocateItemId && String(selectedRelocateItemId) === String(itemIdDbId);
                            return (
                              <button
                                key={option}
                                onClick={() => {
                                  const value = option;
                                  const itemIdObj = toolsItemIdFullData.find(
                                    item => (item?.item_id?.trim() ?? item?.itemId?.trim()) === value
                                  );
                                  if (itemIdObj) {
                                    setSelectedRelocateItemId(itemIdObj.id);
                                    const itemIdsIdStr = String(itemIdObj.id);
                                    const latestMovement = getLatestItemSetMovement(itemIdsIdStr, null, '');
                                    const currentLocationInfo = getItemSetCurrentLocation(itemIdObj.id, null, '');
                                    const currentLocationId = currentLocationInfo?.locationId ? String(currentLocationInfo.locationId) : null;

                                    // Set the current location
                                    let locationOption = null;
                                    if (currentLocationId) {
                                      locationOption = toOptions.find(opt => String(opt.id) === currentLocationId);
                                      if (locationOption) {
                                        setSelectedCurrentLocation(locationOption);
                                      }
                                    }

                                    // Get item details from stock management
                                    const stockItem = stockManagementData.find(item => {
                                      const itemIdsId = item?.item_ids_id ?? item?.itemIdsId;
                                      return String(itemIdsId) === itemIdsIdStr;
                                    });

                                    if (stockItem) {
                                      // Get item name
                                      const itemNameId = stockItem.item_name_id || stockItem.itemNameId;
                                      const itemNameObj = toolsItemNameListData.find(i => String(i?.id) === String(itemNameId));
                                      const itemName = itemNameObj?.item_name || itemNameObj?.itemName || '';

                                      // Get purchase store name
                                      const purchaseStoreId = stockItem.purchase_store_id || stockItem.purchaseStoreId;
                                      const purchaseStore = purchaseStoreId
                                        ? vendorOptions.find(v => String(v.id) === String(purchaseStoreId))?.label || ''
                                        : '';

                                      // Get birth location (original home location)
                                      const birthLocationId = stockItem.home_location_id || stockItem.homeLocationId;
                                      const birthLocation = birthLocationId
                                        ? toOptions.find(opt => String(opt.id) === String(birthLocationId))?.label || ''
                                        : '';

                                      // Get current location label
                                      const currentLocationLabel = locationOption?.label || '';

                                      // Get last updated image from transfer history
                                      let lastImageUrl = '';
                                      if (latestMovement?.matchingEntryItem) {
                                        const images = latestMovement.matchingEntryItem.tools_item_live_images || latestMovement.matchingEntryItem.toolsItemLiveImages || [];
                                        if (images.length > 0) {
                                          // Get the last image (most recent)
                                          const lastImage = images[images.length - 1];
                                          if (lastImage.tools_image || lastImage.toolsImage) {
                                            const base64Data = lastImage.tools_image || lastImage.toolsImage;
                                            lastImageUrl = `data:image/jpeg;base64,${base64Data}`;
                                          }
                                        }
                                      }

                                      // Fallback to stock management image if no transfer history image found
                                      const imageUrl = lastImageUrl || stockItem.file_url || stockItem.fileUrl || '';

                                      // Set item details for display
                                      setRelocateItemDetails({
                                        itemName: itemName,
                                        birthLocation: birthLocation,
                                        currentLocation: currentLocationLabel,
                                        purchaseStore: purchaseStore,
                                        imageUrl: imageUrl
                                      });
                                    } else {
                                      setRelocateItemDetails(null);
                                    }
                                    setShowRelocateItemIdDropdown(false);
                                  } else {
                                    setSelectedRelocateItemId(null);
                                    setSelectedCurrentLocation(null);
                                    setRelocateItemDetails(null);
                                  }
                                }}
                                className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                                  }`}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <button onClick={(e) => handleToggleItemIdFavorite(e, option)} className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                    {isFavorite ? (
                                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    ) : (
                                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </button>
                                  <p className="text-[14px] font-medium text-black text-left truncate">{option}</p>
                                </div>
                                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                                  {isSelected ? (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none" />
                                      <circle cx="10" cy="10" r="4" fill="#e4572e" />
                                    </svg>
                                  ) : (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
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
                            {relocateItemIdSearchQuery ? 'No options found' : 'No options available'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative dropdown-container">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Current Location<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <div
                onClick={() => {
                  setShowCurrentLocationDropdown(!showCurrentLocationDropdown);
                  setShowFromDropdown(false);
                  setShowToDropdown(false);
                  setShowServiceStoreDropdown(false);
                  setShowInchargeDropdown(false);
                  setShowRelocateLocationDropdown(false);
                }}
                className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  color: selectedCurrentLocation ? '#000' : '#9E9E9E',
                  boxSizing: 'border-box',
                  paddingRight: selectedCurrentLocation ? '40px' : '40px'
                }}
              >
                {selectedCurrentLocation ? selectedCurrentLocation.label : 'Select'}
              </div>
              {selectedCurrentLocation && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCurrentLocation(null);
                    setRelocateItemDetails(null);
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
          <div className="mb-2 relative dropdown-container">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Relocate Location<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowRelocateLocationDropdown(true);
                  setShowFromDropdown(false);
                  setShowToDropdown(false);
                  setShowServiceStoreDropdown(false);
                  setShowInchargeDropdown(false);
                  setShowCurrentLocationDropdown(false);
                }}
                className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  color: selectedRelocateLocation ? '#000' : '#9E9E9E',
                  boxSizing: 'border-box',
                  paddingRight: '40px'
                }}
              >
                {selectedRelocateLocation ? selectedRelocateLocation.label : 'Select'}
              </div>
              {selectedRelocateLocation && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRelocateLocation(null);
                  }}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  style={{ zIndex: 5 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ zIndex: 1 }}>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          {selectedRelocateItemId && relocateItemDetails && (
            <div className="mb-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <p className="text-[14px] font-semibold text-black mb-3">Product Detail</p>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <span className="text-[12px] font-medium text-gray-600 w-[120px] flex-shrink-0">Item Name</span>
                    <span className="text-[12px] font-medium text-black flex-1">: {relocateItemDetails.itemName || '-'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[12px] font-medium text-gray-600 w-[120px] flex-shrink-0">Birth Location</span>
                    <span className="text-[12px] font-medium text-black flex-1">: {relocateItemDetails.birthLocation || '-'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[12px] font-medium text-gray-600 w-[120px] flex-shrink-0">Current Location</span>
                    <span className="text-[12px] font-medium text-black flex-1">: {relocateItemDetails.currentLocation || '-'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-[12px] font-medium text-gray-600 w-[120px] flex-shrink-0">Purchase Store</span>
                    <span className="text-[12px] font-medium text-black flex-1">: {relocateItemDetails.purchaseStore || '-'}</span>
                  </div>
                </div>
              </div>
              {relocateItemDetails.imageUrl && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={relocateItemDetails.imageUrl}
                    alt={relocateItemDetails.itemName || 'Product'}
                    className="max-w-full h-auto rounded-lg shadow-md"
                    style={{ maxHeight: '300px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {showRelocateLocationDropdown && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRelocateLocationDropdown(false);
            }
          }}
          style={{ fontFamily: "'Manrope', sans-serif", zIndex: 9999 }}
        >
          <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-5">
              <p className="text-[16px] font-semibold text-black">Select Relocate Location</p>
              <button onClick={() => {
                setShowRelocateLocationDropdown(false);
                setRelocateLocationSearchQuery('');
              }} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
              </button>
            </div>
            <div className="px-6 pt-4 pb-4">
              <div className="relative">
                <input
                  type="text"
                  value={relocateLocationSearchQuery}
                  onChange={(e) => setRelocateLocationSearchQuery(e.target.value)}
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
            <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6">
              <div className="shadow-md rounded-lg overflow-hidden">
                {relocateLocationSearchQuery.trim() && !fromOptions.some(opt => {
                  const normalizedOpt = normalizeSearchText(opt.label);
                  const normalizedQuery = normalizeSearchText(relocateLocationSearchQuery.trim());
                  return normalizedOpt === normalizedQuery;
                }) && (
                    <button
                      onClick={() => {
                      }}
                      className="w-full h-[36px] px-6 flex items-center bg-gray-100 gap-2 hover:bg-[#F5F5F5] transition-colors"
                    >
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-[14px] text-gray-600 font-normal text-left truncate">"{relocateLocationSearchQuery.trim()}"</p>
                    </button>
                  )}
                {getFilteredRelocateLocationOptions().length > 0 ? (
                  <div className="space-y-0">
                    {getFilteredRelocateLocationOptions().map((option) => {
                      const isFavorite = relocateLocationFavorites.includes(option.id);
                      const isSelected = selectedRelocateLocation?.id === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSelectedRelocateLocation(option);
                            setShowRelocateLocationDropdown(false);
                            setRelocateLocationSearchQuery('');
                            setIsEditingTransferDetails(false);
                          }}
                          className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                            }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button onClick={(e) => handleToggleRelocateLocationFavorite(e, option.id)} className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                              {isFavorite ? (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                            <p className="text-[14px] font-medium text-black text-left truncate">{option.label}</p>
                          </div>
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                            {isSelected ? (
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none" />
                                <circle cx="10" cy="10" r="4" fill="#e4572e" />
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
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
                      {relocateLocationSearchQuery ? 'No options found' : 'No options available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showCurrentLocationDropdown && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCurrentLocationDropdown(false);
            }
          }}
          style={{ fontFamily: "'Manrope', sans-serif", zIndex: 9999 }}
        >
          <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-5">
              <p className="text-[16px] font-semibold text-black">Select Current Location</p>
              <button onClick={() => {
                setShowCurrentLocationDropdown(false);
                setCurrentLocationSearchQuery('');
              }} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
              </button>
            </div>
            <div className="px-6 pt-4 pb-4">
              <div className="relative">
                <input
                  type="text"
                  value={currentLocationSearchQuery}
                  onChange={(e) => setCurrentLocationSearchQuery(e.target.value)}
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
            <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6">
              <div className="shadow-md rounded-lg overflow-hidden">
                {currentLocationSearchQuery.trim() && !fromOptions.some(opt => {
                  const normalizedOpt = normalizeSearchText(opt.label);
                  const normalizedQuery = normalizeSearchText(currentLocationSearchQuery.trim());
                  return normalizedOpt === normalizedQuery;
                }) && (
                    <button
                      onClick={() => {
                      }}
                      className="w-full h-[36px] px-6 flex items-center bg-gray-100 gap-2 hover:bg-[#F5F5F5] transition-colors"
                    >
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-[14px] text-gray-600 font-normal text-left truncate">"{currentLocationSearchQuery.trim()}"</p>
                    </button>
                  )}
                {getFilteredCurrentLocationOptions().length > 0 ? (
                  <div className="space-y-0">
                    {getFilteredCurrentLocationOptions().map((option) => {
                      const isFavorite = currentLocationFavorites.includes(option.id);
                      const isSelected = selectedCurrentLocation?.id === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSelectedCurrentLocation(option);
                            setShowCurrentLocationDropdown(false);
                            setCurrentLocationSearchQuery('');
                            setIsEditingTransferDetails(false);
                          }}
                          className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                            }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button onClick={(e) => handleToggleCurrentLocationFavorite(e, option.id)} className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                              {isFavorite ? (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                            <p className="text-[14px] font-medium text-black text-left truncate">{option.label}</p>
                          </div>
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                            {isSelected ? (
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none" />
                                <circle cx="10" cy="10" r="4" fill="#e4572e" />
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
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
                      {currentLocationSearchQuery ? 'No options found' : 'No options available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {entryServiceMode !== 'Relocate' && (
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
      )}
      {items.length > 0 && (
        <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none px-4 pt-2 pb-[120px]">
          <div className="shadow-md rounded-lg">
            {items.map((item, index) => {
              const itemId = item.id;
              const minSwipeDistance = 50;
              const buttonWidth = 96;
              const swipeState = swipeStates[itemId];
              const isExpanded = expandedItemId === itemId;
              const swipeOffset =
                swipeState && swipeState.isSwiping
                  ? Math.max(-buttonWidth, swipeState.currentX - swipeState.startX)
                  : isExpanded
                    ? -buttonWidth
                    : 0;
              const handleTouchStart = (e) => {
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
              const handleTouchMove = (e) => {
                e.preventDefault();
                const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
                setSwipeStates(prev => {
                  const state = prev[itemId];
                  if (!state) return prev;
                  const deltaX = touch.clientX - state.startX;
                  if (deltaX < 0 || (isExpanded && deltaX > 0)) {
                    return {
                      ...prev,
                      [itemId]: {
                        ...state,
                        currentX: touch.clientX,
                        isSwiping: true
                      }
                    };
                  }
                  return prev;
                });
              };
              const handleTouchEnd = () => {
                setSwipeStates(prev => {
                  const state = prev[itemId];
                  if (!state) return prev;
                  const deltaX = state.currentX - state.startX;
                  const absDeltaX = Math.abs(deltaX);
                  if (absDeltaX >= minSwipeDistance) {
                    if (deltaX < 0) {
                      setExpandedItemId(itemId);
                    } else {
                      setExpandedItemId(null);
                    }
                  } else {
                    if (isExpanded) {
                      setExpandedItemId(null);
                    }
                  }
                  const newState = { ...prev };
                  delete newState[itemId];
                  return newState;
                });
              };
              const handleMouseDown = (e) => {
                if (e.button !== 0) return;
                const syntheticEvent = {
                  touches: [{ clientX: e.clientX }],
                  preventDefault: () => e.preventDefault()
                };
                handleTouchStart(syntheticEvent);
              };
              const handleCardClick = (e) => {
                if (e.target.closest('.action-button')) {
                  return;
                }
                if (isExpanded) {
                  setExpandedItemId(null);
                }
              };
              return (
                <div key={itemId} className="relative overflow-hidden">
                  <div
                    className="bg-white border-2 border-[#E0E0E0] rounded-[8px] px-3 py-2 min-h-[66px] cursor-pointer transition-transform duration-300 ease-out select-none"
                    style={{
                      transform: `translateX(${swipeOffset}px)`,
                      touchAction: 'pan-y',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onClick={handleCardClick}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-black leading-snug truncate">
                          {item.itemName || 'Unknown Item'}
                        </p>
                        <div className="mt-1 space-y-1 min-h-[32px]">
                          {item.machine_number || item.machineNumber ? (
                            <p className="text-[11px] font-medium text-[#777777] leading-snug truncate">
                              {item.machine_number || item.machineNumber}
                            </p>
                          ) : null}
                          {item.brand && (
                            <p className="text-[11px] font-medium text-[#9E9E9E] leading-snug truncate">
                              {item.brand}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {item.localImageUrls?.length > 0 && (
                          <div
                            className="flex items-center gap-1 text-[#E4572E] cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenImageViewer(item, 0);
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
                              <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <span className="text-[10px] font-medium">Image</span>
                          </div>
                        )}
                        <p className="text-[12px] font-semibold text-black leading-snug">
                          {item.itemId || (item.quantity > 0 ? `${item.quantity} Qty` : '')}
                        </p>
                      </div>
                    </div>
                  </div>
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
                        setExpandedItemId(null);
                        handleEditItem(item);
                      }}
                      className="action-button w-[40px] h-full bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 hover:bg-[#22a882] transition-colors shadow-sm"
                    >
                      <img src={EditIcon} alt="Edit" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedItemId(null);
                        handleRemoveItem(item.id);
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
        </div>
      )}
      {entryServiceMode !== 'Relocate' && (
        <div className="fixed bottom-[110px] right-1 lg:right-[calc(50%-164px)] z-30 cursor-pointer" onClick={areFieldsFilled ? handleAddItem : undefined}>
          <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center">
            <img src={areFieldsFilled ? FlottingButton : FlottingButtonWhite} alt="+" className="w-[80px] h-[80px]" />
          </div>
        </div>
      )}
      {showAddItemsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }} onClick={handleCloseAddItemsModal} >
          <div className="bg-white w-full max-w-[360px] rounded-tl-[16px] rounded-tr-[16px] relative z-50" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <p className="text-[16px] font-medium text-black leading-normal">
                {editingItem ? 'Edit Item' : 'Add Items'}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => {/* Handle category selection */ }} className="text-[16px] font-semibold text-black" >
                  {selectedCategory ? selectedCategory.value : 'Electricals'}
                </button>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="flex gap-3 mb-[10px]">
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
                    disabled={!!addItemFormData.itemId}
                  />
                </div>
                <div className="w-[80px] relative">
                  <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                    Quantity
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={addItemFormData.quantity}
                      onChange={(e) => handleFieldChange('quantity', e.target.value)}
                      disabled={!!addItemFormData.itemId}
                      className={`w-full h-[32px] border border-[#d6d6d6] rounded px-3 pr-7 text-[12px] font-medium focus:outline-none text-black ${addItemFormData.itemId ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white'
                        }`}
                      placeholder="Enter"
                    />                    
                  </div>
                </div>
              </div>
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
                  className={`flex-1 h-[40px] border border-[#f4ede2] rounded-[8px] text-[14px] font-bold leading-normal ${addItemFormData.itemName
                    ? 'bg-black text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {editingItem ? 'Save' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseUploadModal}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white w-full max-w-[360px] rounded-[16px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-5 pb-2 flex-shrink-0">
              <div>
                <p className="text-[16px] font-semibold text-black">Upload and Attach files</p>
                <p className="text-[12px] text-gray-500">Attachments will be of this Transfer</p>
              </div>
              <button onClick={handleCloseUploadModal} className="text-[#e06256] text-xl font-bold">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none">
              <div className="px-6 py-4">
                <label
                  htmlFor="file-upload-input"
                  className="flex flex-col items-center justify-center w-full h-[100px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17 8L12 3L7 8" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 3V15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              {uploadFiles.length > 0 && (
                <div className="px-6 pb-4">
                  <p className="text-[12px] font-medium text-black mb-2">File Uploading</p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto no-scrollbar scrollbar-none">
                    {uploadFiles.map((fileItem) => (
                      <div key={fileItem.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {fileItem.name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="8.5" cy="8.5" r="1.5" stroke="#E4572E" strokeWidth="2" />
                                <polyline points="21,15 16,10 5,21" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-black truncate">{fileItem.name}</p>
                            <p className="text-[10px] text-gray-500">{(fileItem.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleDeleteUploadFile(fileItem.id)} className="text-red-500 hover:text-red-700">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <span className="text-[12px] font-semibold text-black w-[40px] text-right">{fileItem.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="px-6 pb-4">
                <p className="text-[12px] font-medium text-black mb-2">Status</p>
                <div className="relative">
                  <div onClick={() => setShowStatusDropdown(!showStatusDropdown)}
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
                          className={`w-full px-4 py-2 text-left text-[14px] hover:bg-gray-100 ${uploadStatus === status ? 'bg-gray-50 font-semibold' : ''
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
            <div className="px-6 pb-6 pt-2 flex-shrink-0">
              <button onClick={handleConfirmUpload} disabled={isUploading}
                className={`w-full h-[48px] rounded-lg text-[16px] font-bold text-white ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black'
                  }`}
              >
                {isUploading ? 'Uploading...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showImageViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col" style={{ fontFamily: "'Manrope', sans-serif" }}>
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
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {imageViewerData.images[imageViewerData.currentIndex] && (
                <img
                  src={imageViewerData.images[imageViewerData.currentIndex]}
                  alt={`${imageViewerData.itemName} - ${imageViewerData.currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
            {imageViewerData.images.length > 1 && (
              <>
                <button onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
            {imageViewerData.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                <span className="text-[12px] text-white">
                  {imageViewerData.currentIndex + 1} / {imageViewerData.images.length}
                </span>
              </div>
            )}
          </div>
          <div className="px-4 py-3 bg-black bg-opacity-60">
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-white">
                To - {imageViewerData.toLocation || 'N/A'}
              </p>
              <span className={`text-[11px] font-medium px-2 py-1 rounded ${imageViewerData.machineStatus === 'Working' ? 'bg-green-500 text-white' :
                imageViewerData.machineStatus === 'Not Working' ? 'bg-red-500 text-white' :
                  imageViewerData.machineStatus === 'Under Repair' ? 'bg-yellow-500 text-white' :
                    'bg-gray-500 text-white'
                }`}>
                • {imageViewerData.machineStatus}
              </span>
            </div>
          </div>
          <div className="px-4 py-2 bg-black bg-opacity-60 overflow-x-auto">
            <div className="flex gap-2 items-center">
              {imageViewerData.images.map((img, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <div onClick={() => setImageViewerData(prev => ({ ...prev, currentIndex: index }))}
                    className={`w-[50px] h-[50px] rounded-lg overflow-hidden cursor-pointer border-2 ${index === imageViewerData.currentIndex ? 'border-[#E4572E]' : 'border-transparent'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {index === imageViewerData.currentIndex && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteViewerImage(index);
                      }}
                      className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[#E4572E] rounded-full flex items-center justify-center shadow-md"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <label className="w-[50px] h-[50px] rounded-lg border-2 border-dashed border-[#E4572E] flex-shrink-0 cursor-pointer flex items-center justify-center bg-transparent hover:bg-[#E4572E] hover:bg-opacity-10 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddImageToViewer}
                  className="hidden"
                />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="#E4572E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </label>
            </div>
          </div>
        </div>
      )}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white w-full max-w-[320px] rounded-[16px] p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-4">
              <div className="w-[60px] h-[60px] rounded-full bg-[#FFF3E0] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h3 className="text-[18px] font-semibold text-black text-center mb-2">
              Please Confirm ?
            </h3>
            <p className="text-[13px] text-[#666666] text-center mb-6 leading-relaxed">
              Please check that all the machines you take are in proper running condition before taking them.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)}
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
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(formattedDate) => {
          setDate(formattedDate);
          setShowDatePicker(false);
        }}
        initialDate={date}
      />
      {showUniversalSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center" onClick={handleCloseUniversalSearch} style={{ fontFamily: "'Manrope', sans-serif" }}>
          <div className="bg-white w-full max-w-[400px] rounded-tl-[16px] rounded-tr-[16px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
              <p className="text-[16px] font-semibold text-black">Search Items</p>
              <button onClick={handleCloseUniversalSearch} className="text-[#E4572E] text-xl font-bold">
                ×
              </button>
            </div>
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
            <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none px-4 pb-4">
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
                    const inchargeName = inchargeObj?.label || '';
                    const dateTime = formatSearchItemDate(item?.created_date_time ?? item?.createdDateTime);
                    return (
                      <div key={item.id || index} className="py-4 cursor-pointer hover:bg-gray-50" onClick={() => handleSelectSearchItem(item)}>
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-[14px] font-semibold text-black">{itemName}</p>
                        </div>
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-[13px] text-black">{machineNumber || '-'}</p>
                          <p className="text-[13px] font-medium text-black">{itemIdName}</p>
                        </div>
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-[12px] text-gray-600">{brandName}</p>
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${machineStatus === 'Working' ? 'bg-[#4CAF50]' :
                              machineStatus === 'Not Working' ? 'bg-[#F44336]' :
                                'bg-[#FF9800]'
                              }`}></span>
                            <p className={`text-[11px] font-medium ${machineStatus === 'Working' ? 'text-[#4CAF50]' :
                              machineStatus === 'Not Working' ? 'text-[#F44336]' :
                                'text-[#FF9800]'
                              }`}>
                              {machineStatus}
                            </p>
                          </div>
                        </div>
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
      {showSearchConfirmModal && selectedSearchItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleCancelSearchConfirm}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white w-full max-w-[320px] rounded-[16px] p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-4">
              <div className="w-[60px] h-[60px] rounded-full bg-[#E8F5E9] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h3 className="text-[18px] font-semibold text-black text-center mb-2">
              Confirm Cart?
            </h3>
            <p className="text-[13px] text-[#666666] text-center mb-6 leading-relaxed">
              Do you Want to Confirm Move the machine please upload Image
            </p>
            <div className="flex gap-3">
              <button onClick={handleCancelSearchConfirm}
                className="flex-1 h-[44px] border border-gray-300 rounded-[8px] text-[14px] font-semibold text-black bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleConfirmSearchItem}
                className="flex-1 h-[44px] bg-black rounded-[8px] text-[14px] font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {showSearchUploadModal && selectedSearchItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleCloseSearchUploadModal}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white w-full max-w-[360px] rounded-[16px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-5 pb-2 flex-shrink-0">
              <div>
                <p className="text-[16px] font-semibold text-black">Upload and Attach files</p>
                <p className="text-[12px] text-gray-500">Attachments will be of this Transfer</p>
              </div>
              <button onClick={handleCloseSearchUploadModal} className="text-[#E4572E] text-xl font-bold">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none">
              <div className="px-6 py-4">
                <label htmlFor="search-file-upload-input"
                  className="flex flex-col items-center justify-center w-full h-[100px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17 8L12 3L7 8" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 3V15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              {searchUploadFiles.length > 0 && (
                <div className="px-6 pb-4">
                  <p className="text-[12px] font-medium text-black mb-2">File Uploading</p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto no-scrollbar scrollbar-none">
                    {searchUploadFiles.map((fileItem) => (
                      <div key={fileItem.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx="8.5" cy="8.5" r="1.5" stroke="#E4572E" strokeWidth="2" />
                              <polyline points="21,15 16,10 5,21" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-black truncate">{fileItem.name}</p>
                            <p className="text-[10px] text-gray-500">{(fileItem.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleDeleteSearchUploadFile(fileItem.id)} className="text-red-500 hover:text-red-700">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <span className="text-[12px] font-semibold text-black w-[40px] text-right">{fileItem.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="px-6 pb-4">
                <p className="text-[12px] font-medium text-black mb-2">Status</p>
                <div className="relative">
                  <div onClick={() => setShowSearchStatusDropdown(!showSearchStatusDropdown)}
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
                          className={`w-full px-4 py-2 text-left text-[14px] hover:bg-gray-100 ${searchUploadStatus === status ? 'bg-gray-50 font-semibold' : ''
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
            <div className="px-6 pb-6 pt-2 flex-shrink-0">
              <button onClick={handleConfirmSearchUpload} className="w-full h-[48px] rounded-lg text-[16px] font-bold text-white bg-black">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {customAlert.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[120] flex items-center justify-center p-4"
          onClick={closeCustomAlert}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[360px] rounded-[16px] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF4F0] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-black">Notice</h3>
            </div>
            <p className="text-[13px] text-[#333333] leading-relaxed whitespace-pre-line">
              {customAlert.message}
            </p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={closeCustomAlert}
                className="min-w-[88px] h-[38px] px-5 rounded-full bg-[#8A4B2D] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Transfer;