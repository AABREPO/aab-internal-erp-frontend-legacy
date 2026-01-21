import React, { useState, useEffect } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';

const NonPOHistory = () => {
  const [nonPORecords, setNonPORecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorData, setVendorData] = useState([]);
  const [siteData, setSiteData] = useState([]);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
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

          return {
            ...record,
            entryNumber,
            vendorName,
            stockingLocation,
            numberOfItems,
            totalQuantity,
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

  // Close dropdowns when filter sheet closes
  useEffect(() => {
    if (!showFilterSheet) {
      setProjectNameOpen(false);
      setStockingLocationOpen(false);
      setShowCategoryModal(false);
      setProjectNameSearch('');
      setStockingLocationSearch('');
    }
  }, [showFilterSheet]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!showFilterSheet) return;
      
      const target = event.target;
      const isProjectNameDropdown = target.closest('[data-dropdown="projectName"]');
      const isStockingLocationDropdown = target.closest('[data-dropdown="stockingLocation"]');
      
      if (projectNameOpen && !isProjectNameDropdown) {
        setProjectNameOpen(false);
      }
      if (stockingLocationOpen && !isStockingLocationDropdown) {
        setStockingLocationOpen(false);
      }
    };

    if (showFilterSheet) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [projectNameOpen, stockingLocationOpen, showFilterSheet]);

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
        <button
          onClick={() => setShowFilterSheet(true)}
          type="button"
          className="flex items-center gap-2 text-[14px] font-medium text-gray-700"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Filter
        </button>
      </div>

      {/* Records List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide no-scrollbar scrollbar-none">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">No non-PO records found</p>
          </div>
        ) : (
          <div className="">
            {filteredRecords.map((record) => (
              <div
                key={record.id || record._id}
                className="bg-white border-2 shadow-md border-gray-200 rounded-lg p-4"
              >
                <div className=" justify-between items-start">
                  {/* Left Side */}
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-[12px] font-semibold text-black">
                        #{record.entryNumber}
                      </span>
                      <span className="text-[12px] font-semibold text-black">
                        , {record.vendorName}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-600 mb-1">
                      No. of Items - {record.numberOfItems}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-600 mb-1">
                      {record.stockingLocation}
                    </p>
                  </div>
                  <div>

                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-gray-500">
                      {record.created_date_time && new Date(record.created_date_time).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                    <p className="text-[12px] font-semibold text-[#BF9853]">
                      Quantity - {record.totalQuantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      {showFilterSheet && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowFilterSheet(false)}
          />

          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[360px] bg-white rounded-t-[20px] z-50 shadow-lg">
            {/* Header */}
            <div className="flex-shrink-0">
              <div className='flex justify-end mr-4 mt-1'>
                <button
                    onClick={() => setShowFilterSheet(false)}
                    className="text-red-500 hover:text-red-700 text-xl font-bold"
                  >
                    ✕
                  </button>
              </div>
              <div className="flex justify-between items-center px-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Select Filters
              </h2>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="text-[16px] font-semibold text-black underline decoration-solid"
                  style={{ textUnderlinePosition: 'from-font' }}
                >
                  {filterData.category || 'Category'}
                </button>
              </div>
              </div>
            </div>
            {/* Filter Form */}
            <div className="px-6 py-4 space-y-5 overflow-y-hidden overflow-x-hidden flex-1" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              {/* Project Name */}
              <div className="relative" data-dropdown="projectName">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Select Project"
                    value={projectNameOpen ? projectNameSearch : (filterData.projectName ? siteData.find(s => s.id === filterData.projectName)?.siteName || '' : '')}
                    onChange={(e) => {
                      setProjectNameSearch(e.target.value);
                      setProjectNameOpen(true);
                      setStockingLocationOpen(false);
                    }}
                    onFocus={() => {
                      setProjectNameOpen(true);
                      setStockingLocationOpen(false);
                      if (!projectNameOpen) {
                        setProjectNameSearch('');
                      }
                    }}
                    className="w-full h-[40px] px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-400 bg-white pr-10"
                  />
                  <svg 
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectNameOpen(!projectNameOpen);
                      if (!projectNameOpen) {
                        setProjectNameSearch('');
                      }
                    }}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer transition-transform ${projectNameOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {projectNameOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-hidden">
                      <div className="overflow-y-auto max-h-48">
                        <button
                          type="button"
                          onClick={() => {
                            setFilterData({ ...filterData, projectName: '' });
                            setProjectNameOpen(false);
                            setProjectNameSearch('');
                          }}
                          className={`w-full h-[40px] px-4 py-2 text-left text-sm hover:bg-gray-100 ${!filterData.projectName ? 'bg-gray-100' : ''}`}
                        >
                          Select Project
                        </button>
                        {siteData
                          .filter(site => 
                            site.siteName?.toLowerCase().includes(projectNameSearch.toLowerCase())
                          )
                          .map((site) => (
                            <button
                              key={site.id}
                              type="button"
                              onClick={() => {
                                setFilterData({ ...filterData, projectName: site.id });
                                setProjectNameOpen(false);
                                setProjectNameSearch('');
                              }}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${filterData.projectName === site.id ? 'bg-gray-100' : ''}`}
                            >
                              {site.siteName}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stocking Location */}
              <div className="relative" data-dropdown="stockingLocation">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stocking Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="AA Stock Room A"
                    value={stockingLocationOpen ? stockingLocationSearch : (filterData.stockingLocation ? siteData.find(s => s.id === filterData.stockingLocation)?.siteName || '' : '')}
                    onChange={(e) => {
                      setStockingLocationSearch(e.target.value);
                      setStockingLocationOpen(true);
                      setProjectNameOpen(false);
                    }}
                    onFocus={() => {
                      setStockingLocationOpen(true);
                      setProjectNameOpen(false);
                      if (!stockingLocationOpen) {
                        setStockingLocationSearch('');
                      }
                    }}
                    className="w-full h-[40px] px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-400 bg-white pr-10"
                  />
                  <svg 
                    onClick={(e) => {
                      e.stopPropagation();
                      setStockingLocationOpen(!stockingLocationOpen);
                      if (!stockingLocationOpen) {
                        setStockingLocationSearch('');
                      }
                    }}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer transition-transform ${stockingLocationOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {stockingLocationOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden" style={{ maxHeight: '200px', bottom: 'auto', top: '100%' }}>
                      <div className="overflow-y-auto" style={{ maxHeight: '100px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setFilterData({ ...filterData, stockingLocation: '' });
                            setStockingLocationOpen(false);
                            setStockingLocationSearch('');
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${!filterData.stockingLocation ? 'bg-gray-100' : ''}`}
                        >
                          AA Stock Room A
                        </button>
                        {siteData
                          .filter(site => 
                            site.siteName?.toLowerCase().includes(stockingLocationSearch.toLowerCase())
                          )
                          .map((site) => (
                            <button
                              key={site.id}
                              type="button"
                              onClick={() => {
                                setFilterData({ ...filterData, stockingLocation: site.id });
                                setStockingLocationOpen(false);
                                setStockingLocationSearch('');
                              }}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${filterData.stockingLocation === site.id ? 'bg-gray-100' : ''}`}
                            >
                              {site.siteName}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Date and Entry No */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={filterData.date}
                    onChange={(e) => setFilterData({ ...filterData, date: e.target.value })}
                    className="w-full h-[40px] px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entry.No
                  </label>
                  <input
                    type="text"
                    placeholder="Enter"
                    value={filterData.entryNo}
                    onChange={(e) => setFilterData({ ...filterData, entryNo: e.target.value })}
                    className="w-full h-[40px] px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-400 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-gray-200">
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
    </div>
  );
};

export default NonPOHistory;

