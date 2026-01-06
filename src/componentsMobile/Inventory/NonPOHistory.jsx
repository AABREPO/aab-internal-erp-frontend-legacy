import React, { useState, useEffect } from 'react';

const NonPOHistory = () => {
  const [nonPORecords, setNonPORecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorData, setVendorData] = useState([]);
  const [siteData, setSiteData] = useState([]);

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
            className="w-full h-[40px] pl-10 pr-4 border border-gray-300 rounded-lg text-[14px] bg-white focus:outline-none focus:border-gray-400"
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
          type="button"
          className="flex items-center gap-2 text-[14px] font-medium text-gray-700"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Filter
        </button>
      </div>

      {/* Records List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">No non-PO records found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id || record._id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  {/* Left Side */}
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[14px] font-semibold text-black">
                        #{record.entryNumber}
                      </span>
                      <span className="text-[14px] font-semibold text-black">
                        , {record.vendorName}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-600 mb-1">
                      {record.stockingLocation}
                    </p>
                    <p className="text-[12px] text-gray-500">
                      {record.isToday ? 'Today' : record.formattedDate} • {record.formattedTime}
                    </p>
                  </div>
                  
                  {/* Right Side */}
                  <div className="flex flex-col items-end">
                    <p className="text-[12px] text-gray-600 mb-1">
                      No. of Items - {record.numberOfItems}
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
    </div>
  );
};

export default NonPOHistory;

