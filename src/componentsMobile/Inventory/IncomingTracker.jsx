import React, { useState, useEffect } from 'react';

const IncomingTracker = () => {
  const [activeStatus, setActiveStatus] = useState('live'); // 'live' or 'closed'
  const [incomingRecords, setIncomingRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorData, setVendorData] = useState([]);
  const [siteData, setSiteData] = useState([]);
  const [allPurchaseOrders, setAllPurchaseOrders] = useState([]);

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

  // Fetch all purchase orders
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/purchase_orders/getAll');
        if (response.ok) {
          const data = await response.json();
          setAllPurchaseOrders(data);
        }
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
      }
    };
    fetchPurchaseOrders();
  }, []);

  // Helper function to extract numeric value from eno
  const getNumericEno = (eno) => {
    if (!eno) return 0;
    if (typeof eno === 'number') {
      return eno;
    }
    const str = String(eno);
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Check if an incoming record has balance quantity
  const checkBalanceQuantity = (incomingRecord, poData) => {
    if (!poData || !poData.purchaseTable && !poData.purchase_table && !poData.items) {
      return false; // No PO data, consider as closed
    }

    const poItems = poData.purchaseTable || poData.purchase_table || poData.items || [];
    const inventoryItems = incomingRecord.inventoryItems || incomingRecord.inventory_items || [];

    // Create a map of inventory items by composite key
    const inventoryMap = {};
    inventoryItems.forEach(invItem => {
      const itemId = invItem.item_id || invItem.itemId || null;
      const categoryId = invItem.category_id || invItem.categoryId || null;
      const modelId = invItem.model_id || invItem.modelId || null;
      const brandId = invItem.brand_id || invItem.brandId || null;
      const typeId = invItem.type_id || invItem.typeId || null;
      const quantity = Math.abs(invItem.quantity || 0);

      if (itemId !== null && itemId !== undefined) {
        const compositeKey = `${itemId || 'null'}-${categoryId || 'null'}-${modelId || 'null'}-${brandId || 'null'}-${typeId || 'null'}`;
        inventoryMap[compositeKey] = (inventoryMap[compositeKey] || 0) + quantity;
      }
    });

    // Check each PO item for balance
    for (const poItem of poItems) {
      const poItemId = poItem.item_id || poItem.itemId || null;
      const poCategoryId = poItem.category_id || poItem.categoryId || null;
      const poModelId = poItem.model_id || poItem.modelId || null;
      const poBrandId = poItem.brand_id || poItem.brandId || null;
      const poTypeId = poItem.type_id || poItem.typeId || null;
      const poQuantity = poItem.quantity || 0;

      if (poItemId !== null && poItemId !== undefined) {
        const compositeKey = `${poItemId || 'null'}-${poCategoryId || 'null'}-${poModelId || 'null'}-${poBrandId || 'null'}-${poTypeId || 'null'}`;
        const inventoryQty = inventoryMap[compositeKey] || 0;
        const balanceQty = poQuantity - inventoryQty;

        // If there's any balance quantity, this record is "live"
        if (balanceQty > 0) {
          return true;
        }
      }
    }

    // All items are fully received
    return false;
  };

  // Fetch and process incoming records
  useEffect(() => {
    const fetchIncomingRecords = async () => {
      try {
        setLoading(true);
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

        // Filter for incoming type only and exclude deleted
        // Only show records where inventory_type is exactly 'incoming'
        const incomingItems = inventoryData.filter(item => {
          const inventoryType = item.inventory_type || item.inventoryType || '';
          const isIncoming = String(inventoryType).toLowerCase() === 'incoming';
          const isDeleted = item.delete_status || item.deleteStatus;
          return isIncoming && !isDeleted;
        });

        // Process each incoming record (only those with PO numbers)
        const processedRecords = await Promise.all(
          incomingItems
            .filter(record => {
              // Only process records with PO numbers
              const purchaseNo = record.purchase_no || record.purchaseNo || record.purchase_number || '';
              return purchaseNo && String(purchaseNo).trim() !== '' && String(purchaseNo).toLowerCase() !== 'non po';
            })
            .map(async (record) => {
            const purchaseNo = record.purchase_no || record.purchaseNo || record.purchase_number || '';
            const poNumberStr = String(purchaseNo).replace('#', '').trim();
            
            // Find matching PO
            let poData = null;
            if (poNumberStr && allPurchaseOrders.length > 0) {
              const targetEno = getNumericEno(poNumberStr);
              const vendorId = record.vendor_id || record.vendorId;
              
              const vendorPOs = vendorId
                ? allPurchaseOrders.filter(p => String(p.vendor_id || p.vendorId) === String(vendorId))
                : allPurchaseOrders;
              
              const matchingPOs = vendorPOs.filter(p => {
                const poEno = getNumericEno(p.eno || p.ENO || p.poNumber || p.po_number || '');
                return poEno === targetEno && poEno !== 0;
              });
              
              if (matchingPOs.length > 0) {
                // Get the most recent PO with items
                const posWithItems = matchingPOs.filter(p => {
                  const items = p.purchaseTable || p.purchase_table || p.items || [];
                  return items.length > 0;
                });
                
                if (posWithItems.length > 0) {
                  poData = posWithItems.reduce((latest, current) => {
                    const latestId = parseInt(latest.id || latest._id || 0);
                    const currentId = parseInt(current.id || current._id || 0);
                    return currentId > latestId ? current : latest;
                  });
                } else if (matchingPOs.length > 0) {
                  poData = matchingPOs.reduce((latest, current) => {
                    const latestId = parseInt(latest.id || latest._id || 0);
                    const currentId = parseInt(current.id || current._id || 0);
                    return currentId > latestId ? current : latest;
                  });
                }
              }
            }

            // Check if has balance quantity
            const hasBalance = checkBalanceQuantity(record, poData);

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

            // Calculate total amount
            const totalAmount = inventoryItems.reduce((sum, item) => {
              return sum + Math.abs(item.amount || 0);
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
              totalAmount,
              formattedDate,
              formattedTime,
              hasBalance,
              isToday: formattedDate === new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            };
          })
        );

        setIncomingRecords(processedRecords);
      } catch (error) {
        console.error('Error fetching incoming records:', error);
      } finally {
        setLoading(false);
      }
    };

    if (vendorData.length > 0 && siteData.length > 0 && allPurchaseOrders.length > 0) {
      fetchIncomingRecords();
    }
  }, [vendorData, siteData, allPurchaseOrders]);

  // Filter records based on status and search
  useEffect(() => {
    let filtered = incomingRecords;

    // Filter by status (live/closed)
    if (activeStatus === 'live') {
      filtered = filtered.filter(record => record.hasBalance === true);
    } else {
      filtered = filtered.filter(record => record.hasBalance === false);
    }

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

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.created_at || a.createdAt);
      const dateB = new Date(b.date || b.created_at || b.createdAt);
      return dateB - dateA;
    });

    setFilteredRecords(filtered);
  }, [incomingRecords, activeStatus, searchQuery]);

  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden bg-white">
      {/* Live/Closed Toggle */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveStatus('live')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-[14px] font-medium transition-colors ${
              activeStatus === 'live'
                ? 'bg-white border border-gray-300 text-black shadow-sm'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Live
          </button>
          <button
            type="button"
            onClick={() => setActiveStatus('closed')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-[14px] font-medium transition-colors ${
              activeStatus === 'closed'
                ? 'bg-white border border-gray-300 text-black shadow-sm'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0 px-4 pb-2">
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
            <p className="text-gray-500">
              {activeStatus === 'live' 
                ? 'No live incoming records with pending quantities' 
                : 'No closed incoming records'}
            </p>
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
                    <p className="text-[12px] font-semibold text-[#FF9800]">
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

export default IncomingTracker;

