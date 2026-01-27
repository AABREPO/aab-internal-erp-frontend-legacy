import React, { useState, useEffect } from 'react';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';

const Transfer = ({ user }) => {
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
    brand: '',
    itemId: '',
    quantity: ''
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
        const response = await fetch('https:///api/tools_tracker/getNextEntryNo');
        if (response.ok) {
          const data = await response.json();
          setEntryNo(data.entryNo || 0);
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
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https:///api/po_category/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = data.map(item => ({
            value: item.category,
            label: item.category,
            id: item.id,
          }));
          setCategoryOptions(options);
          // Set default to "Electricals" if available
          const electricals = options.find(opt => opt.value === 'Electricals' || opt.value === 'Electrical');
          if (electricals) {
            setSelectedCategory(electricals);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);
  // Fetch item names
  useEffect(() => {
    const fetchItemNames = async () => {
      try {
        const response = await fetch('https:///api/po_itemNames/getAll');
        if (response.ok) {
          const data = await response.json();
          const filteredItems = selectedCategory
            ? data.filter(item => item.category?.toLowerCase() === selectedCategory.value?.toLowerCase())
            : data;
          const itemNameOpts = filteredItems.map(item => ({
            value: item.itemName,
            label: item.itemName,
            id: item.id,
            category: item.category,
          }));
          setItemNameOptions(itemNameOpts.map(item => item.value));
        }
      } catch (error) {
        console.error('Error fetching item names:', error);
      }
    };
    if (selectedCategory) {
      fetchItemNames();
    }
  }, [selectedCategory]);
  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('https:///api/po_brand/getAll');
        if (response.ok) {
          const data = await response.json();
          const filteredBrands = selectedCategory
            ? data.filter(b => !b.category || b.category?.toLowerCase() === selectedCategory.value?.toLowerCase())
            : data;
          const brandOpts = filteredBrands
            .map(b => ({
              value: b.brand?.trim(),
              label: b.brand?.trim(),
              id: b.id
            }))
            .filter(b => b.value);
          setBrandOptions(brandOpts.map(b => b.value));
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    if (selectedCategory) {
      fetchBrands();
    }
  }, [selectedCategory]);
  // Fetch item IDs when item name or brand is selected
  useEffect(() => {
    if (addItemFormData.itemName || addItemFormData.brand) {
      // TODO: Replace with actual API endpoint for tools tracker item IDs
      // For now, generate sample item IDs
      const sampleItemIds = [
        'AA DM 01',
        'AA DM 02',
        'AA DM 03',
      ];
      setItemIdOptions(sampleItemIds);
    } else {
      setItemIdOptions([]);
    }
  }, [addItemFormData.itemName, addItemFormData.brand]);
  const handleAddItem = () => {
    if (areFieldsFilled) {
      setShowAddItemsModal(true);
    }
  };
  const handleCloseAddItemsModal = () => {
    setShowAddItemsModal(false);
    setAddItemFormData({
      itemName: '',
      brand: '',
      itemId: '',
      quantity: ''
    });
  };
  const handleAddItemSubmit = () => {
    if (addItemFormData.itemName && addItemFormData.brand && addItemFormData.itemId && addItemFormData.quantity) {
      const newItem = {
        id: Date.now(),
        ...addItemFormData
      };
      setItems([...items, newItem]);
      handleCloseAddItemsModal();
    }
  };
  const handleFieldChange = (field, value) => {
    setAddItemFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return (
    <div className="flex flex-col min-h-[calc(100vh-90px-80px)] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Entry Number and Date */}
      <div className="flex-shrink-0 px-4 pt-2 pb-1">
        <p className="text-[12px] font-medium text-black leading-normal">
          #NO {date}
        </p>
      </div>
      {/* Entry/Service Segmented Control */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3">
        <div className="flex bg-[#E0E0E0] items-center h-[36px] rounded-[8px] p-1">
          <button
            onClick={() => setEntryServiceMode('Entry')}
            className={`flex-1 h-full rounded-[6px] text-[12px] font-semibold leading-normal transition-colors ${
              entryServiceMode === 'Entry'
                ? 'bg-white text-black'
                : 'bg-transparent text-[#848484]'
            }`}
          >
            Entry
          </button>
          <button
            onClick={() => setEntryServiceMode('Service')}
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

      {/* Input Fields */}
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
      {/* Items Label */}
      <div className="flex-shrink-0 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-[12px] font-semibold text-black leading-normal">Items</p>
            <div className="w-[20px] h-[20px] rounded-full bg-[#E0E0E0] flex items-center justify-center">
              <span className="text-[10px] font-medium text-black">{items.length}</span>
            </div>
          </div>
          {entryServiceMode === 'Service' && areFieldsFilled && (
            <div className="cursor-pointer" onClick={() => {/* Handle search */}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5.5" stroke="#000" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button - Light Gray */}
      <div 
        className="fixed bottom-[110px] right-[24px] lg:right-[calc(50%-164px)] z-30 cursor-pointer"
        onClick={handleAddItem}
      >
        <div className="w-[48px] h-[43px] rounded-full flex items-center justify-center bg-[#E0E0E0]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {/* Add Items Bottom Sheet Modal */}
      {showAddItemsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }} onClick={handleCloseAddItemsModal} >
          <div className="bg-white w-full max-w-[360px] h-[422px] rounded-tl-[16px] rounded-tr-[16px] relative z-50" onClick={(e) => e.stopPropagation()}>
            {/* Header with Title and Category */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <p className="text-[16px] font-medium text-black leading-normal">
                Add Items
              </p>
              <div className="flex items-center gap-2">
                {addItemFormData.quantity && (
                  <span className="text-[16px] font-semibold text-[#e06256]">{addItemFormData.quantity}</span>
                )}
                <button
                  onClick={() => {/* Handle category selection */}}
                  className="text-[16px] font-semibold text-black underline decoration-solid"
                  style={{ textUnderlinePosition: 'from-font' }}
                >
                  {selectedCategory ? selectedCategory.value : 'Electricals'}
                </button>
                <button
                  onClick={handleCloseAddItemsModal}
                  className="text-[#e06256] text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            {/* Form fields */}
            <div className="px-6 pb-32">
              {/* Item Name */}
              <div className="mb-[10px] relative">
                <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                  Item Name<span className="text-[#eb2f8e]">*</span>
                </p>
                <SearchableDropdown
                  value={addItemFormData.itemName}
                  onChange={(value) => handleFieldChange('itemName', value)}
                  options={itemNameOptions}
                  placeholder="Drilling Machine"
                  fieldName="Item Name"
                  showAllOptions={true}
                />
              </div>
              {/* Quantity */}
              <div className="mb-[10px] relative">
                <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                  Quantity<span className="text-[#eb2f8e]">*</span>
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={addItemFormData.quantity}
                    onChange={(e) => handleFieldChange('quantity', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] rounded-[8px] px-3 text-[12px] font-medium bg-white focus:outline-none text-black"
                    placeholder="Enter"
                  />
                </div>
              </div>
              {/* Brand */}
              <div className="mb-[10px] relative">
                <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                  Brand<span className="text-[#eb2f8e]">*</span>
                </p>
                <SearchableDropdown
                  value={addItemFormData.brand}
                  onChange={(value) => handleFieldChange('brand', value)}
                  options={brandOptions}
                  placeholder="Stanley"
                  fieldName="Brand"
                  showAllOptions={true}
                />
              </div>
              {/* Item ID */}
              <div className="mb-10 relative">
                <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                  Item ID<span className="text-[#eb2f8e]">*</span>
                </p>
                <SearchableDropdown
                  value={addItemFormData.itemId}
                  onChange={(value) => handleFieldChange('itemId', value)}
                  options={itemIdOptions}
                  placeholder="AA DM 01"
                  fieldName="Item ID"
                  showAllOptions={true}
                />
                {addItemFormData.itemId && (
                  <p className="text-[12px] text-[#e06256] mt-1">4534666666100</p>
                )}
              </div>
              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleCloseAddItemsModal}
                  className="w-[175px] h-[40px] border border-[#949494] rounded-[8px] text-[14px] font-bold text-[#363636] bg-white leading-normal"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItemSubmit}
                  disabled={!addItemFormData.itemName || !addItemFormData.brand || !addItemFormData.itemId || !addItemFormData.quantity}
                  className={`w-[175px] h-[40px] border border-[#f4ede2] rounded-[8px] text-[14px] font-bold leading-normal ${
                    addItemFormData.itemName && addItemFormData.brand && addItemFormData.itemId && addItemFormData.quantity
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
    </div>
  );
};

export default Transfer;
