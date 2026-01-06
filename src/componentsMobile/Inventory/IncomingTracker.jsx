import React, { useState, useEffect } from 'react';

const IncomingTracker = () => {
  const [activeStatus, setActiveStatus] = useState('live'); // 'live', 'closed', or 'history'
  const [incomingRecords, setIncomingRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorData, setVendorData] = useState([]);
  const [siteData, setSiteData] = useState([]);
  const [allPurchaseOrders, setAllPurchaseOrders] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [poItemName, setPoItemName] = useState([]);
  const [poBrand, setPoBrand] = useState([]);
  const [poModel, setPoModel] = useState([]);
  const [poType, setPoType] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

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

  // Fetch PO item names, brands, models, types, and categories
  useEffect(() => {
    const fetchPOData = async () => {
      try {
        const [itemNamesRes, brandsRes, modelsRes, typesRes, categoriesRes] = await Promise.all([
          fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll')
        ]);

        if (itemNamesRes.ok) {
          const data = await itemNamesRes.json();
          setPoItemName(data);
        }
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          setPoBrand(data);
        }
        if (modelsRes.ok) {
          const data = await modelsRes.json();
          setPoModel(data);
        }
        if (typesRes.ok) {
          const data = await typesRes.json();
          setPoType(data);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          const options = (data || []).map(item => ({
            value: item.category || item.categoryName || item.name || '',
            label: item.category || item.categoryName || item.name || '',
            id: item.id || item._id || null,
          }));
          setCategoryOptions(options);
        }
      } catch (error) {
        console.error('Error fetching PO data:', error);
      }
    };
    fetchPOData();
  }, []);

  // Helper function to find name by ID
  const findNameById = (array, id, fieldName) => {
    if (!array || !id) return '';
    const found = array.find(item => String(item.id || item._id) === String(id));
    return found ? (found[fieldName] || found.name || '') : '';
  };

  const resolveItemName = (itemId) => {
    return findNameById(poItemName, itemId, 'itemName') || findNameById(poItemName, itemId, 'name') || '';
  };

  const resolveBrandName = (brandId) => {
    return findNameById(poBrand, brandId, 'brand') || findNameById(poBrand, brandId, 'brandName') || findNameById(poBrand, brandId, 'name') || '';
  };

  const resolveModelName = (modelId) => {
    return findNameById(poModel, modelId, 'model') || findNameById(poModel, modelId, 'modelName') || findNameById(poModel, modelId, 'name') || '';
  };

  const resolveTypeName = (typeId) => {
    return findNameById(poType, typeId, 'typeColor') || findNameById(poType, typeId, 'type') || findNameById(poType, typeId, 'typeName') || findNameById(poType, typeId, 'name') || '';
  };

  const resolveCategoryName = (categoryId) => {
    return findNameById(categoryOptions, categoryId, 'category') || findNameById(categoryOptions, categoryId, 'name') || findNameById(categoryOptions, categoryId, 'label') || '';
  };

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
              // Only process records with valid PO numbers (exclude NO_PO, empty, or null)
              const recordPurchaseNo = record.purchase_no || record.purchaseNo || record.purchase_number || '';
              const purchaseNoStr = String(recordPurchaseNo).trim();
              // Exclude empty, null, 'NO_PO', 'no_po', 'non po', 'NON PO', etc.
              return purchaseNoStr !== '' &&
                purchaseNoStr.toUpperCase() !== 'NO_PO' &&
                purchaseNoStr.toLowerCase() !== 'non po';
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

              // Get po_closed_status
              const poClosedStatus = record.po_closed_status || record.poClosedStatus || false;

              return {
                ...record,
                entryNumber,
                purchaseNo,
                vendorName,
                stockingLocation,
                numberOfItems,
                totalQuantity,
                totalAmount,
                formattedDate,
                formattedTime,
                hasBalance,
                poClosedStatus,
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

  // Function to merge records by purchase_no and vendorName
  const mergeRecords = (records) => {
    const mergedMap = {};

    records.forEach(record => {
      // Normalize purchase_no for comparison (remove #, trim, convert to string)
      const purchaseNo = String(record.purchaseNo || '').replace('#', '').trim();
      const vendorName = String(record.vendorName || '').trim();

      // Create a unique key based on purchase_no and vendorName
      // If purchase_no is different, they should NOT be merged
      const key = `${purchaseNo}_${vendorName}`;

      // Only merge if both purchase_no and vendorName match exactly
      if (!mergedMap[key]) {
        const inventoryItems = record.inventoryItems || record.inventory_items || [];
        mergedMap[key] = {
          ...record,
          mergedEntries: [record],
          totalMergedQuantity: record.totalQuantity,
          totalMergedItems: record.numberOfItems,
          totalMergedAmount: record.totalAmount,
          allInventoryItems: [...inventoryItems],
          earliestDate: record.date || record.created_at || record.createdAt,
          latestDate: record.date || record.created_at || record.createdAt,
        };
      } else {
        // Merge with existing record (same purchase_no AND vendorName - guaranteed by key)
        const merged = mergedMap[key];
        merged.mergedEntries.push(record);
        merged.totalMergedQuantity += record.totalQuantity;
        merged.totalMergedItems += record.numberOfItems;
        merged.totalMergedAmount += record.totalAmount;

        // Combine inventory items from all merged entries
        const inventoryItems = record.inventoryItems || record.inventory_items || [];
        merged.allInventoryItems = [...(merged.allInventoryItems || []), ...inventoryItems];

        const recordDate = new Date(record.date || record.created_at || record.createdAt);
        const earliestDate = new Date(merged.earliestDate);
        const latestDate = new Date(merged.latestDate);

        if (recordDate < earliestDate) {
          merged.earliestDate = record.date || record.created_at || record.createdAt;
        }
        if (recordDate > latestDate) {
          merged.latestDate = record.date || record.created_at || record.createdAt;
        }
      }
    });

    return Object.values(mergedMap);
  };

  // Filter records based on status and search
  useEffect(() => {
    let filtered = incomingRecords;

    // Filter by status (live/closed/history)
    if (activeStatus === 'live') {
      // First merge records with same purchase_no and vendorName
      filtered = mergeRecords(filtered);

      // Then recalculate hasBalance for merged records and filter
      filtered = filtered.map(mergedRecord => {
        // Get PO data for the merged record (use first entry's PO data)
        const firstEntry = mergedRecord.mergedEntries?.[0] || mergedRecord;
        const purchaseNo = mergedRecord.purchaseNo || firstEntry.purchaseNo || '';
        const poNumberStr = String(purchaseNo).replace('#', '').trim();
        const vendorId = mergedRecord.vendor_id || mergedRecord.vendorId || firstEntry.vendor_id || firstEntry.vendorId;

        let poData = null;
        if (poNumberStr && allPurchaseOrders.length > 0) {
          const targetEno = getNumericEno(poNumberStr);
          const vendorPOs = vendorId
            ? allPurchaseOrders.filter(p => String(p.vendor_id || p.vendorId) === String(vendorId))
            : allPurchaseOrders;

          const matchingPOs = vendorPOs.filter(p => {
            const poEno = getNumericEno(p.eno || p.ENO || p.poNumber || p.po_number || '');
            return poEno === targetEno && poEno !== 0;
          });

          if (matchingPOs.length > 0) {
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

        // Create a merged record object with all inventory items for balance check
        const mergedRecordForBalance = {
          ...mergedRecord,
          inventoryItems: mergedRecord.allInventoryItems || mergedRecord.inventoryItems || mergedRecord.inventory_items || [],
          inventory_items: mergedRecord.allInventoryItems || mergedRecord.inventoryItems || mergedRecord.inventory_items || []
        };

        // Recalculate hasBalance based on merged totals
        const hasBalance = checkBalanceQuantity(mergedRecordForBalance, poData);

        return {
          ...mergedRecord,
          hasBalance
        };
      }).filter(record => {
        // Show records that have pending stock AND are not closed
        const hasBalance = record.hasBalance === true;
        const isNotClosed = record.poClosedStatus !== true;
        return hasBalance && isNotClosed;
      });
    } else if (activeStatus === 'closed') {
      // First merge records with same purchase_no and vendorName
      filtered = mergeRecords(filtered);

      // Then recalculate hasBalance for merged records and filter
      filtered = filtered.map(mergedRecord => {
        // Get PO data for the merged record (use first entry's PO data)
        const firstEntry = mergedRecord.mergedEntries?.[0] || mergedRecord;
        const purchaseNo = mergedRecord.purchaseNo || firstEntry.purchaseNo || '';
        const poNumberStr = String(purchaseNo).replace('#', '').trim();
        const vendorId = mergedRecord.vendor_id || mergedRecord.vendorId || firstEntry.vendor_id || firstEntry.vendorId;

        let poData = null;
        if (poNumberStr && allPurchaseOrders.length > 0) {
          const targetEno = getNumericEno(poNumberStr);
          const vendorPOs = vendorId
            ? allPurchaseOrders.filter(p => String(p.vendor_id || p.vendorId) === String(vendorId))
            : allPurchaseOrders;

          const matchingPOs = vendorPOs.filter(p => {
            const poEno = getNumericEno(p.eno || p.ENO || p.poNumber || p.po_number || '');
            return poEno === targetEno && poEno !== 0;
          });

          if (matchingPOs.length > 0) {
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

        // Create a merged record object with all inventory items for balance check
        const mergedRecordForBalance = {
          ...mergedRecord,
          inventoryItems: mergedRecord.allInventoryItems || mergedRecord.inventoryItems || mergedRecord.inventory_items || [],
          inventory_items: mergedRecord.allInventoryItems || mergedRecord.inventoryItems || mergedRecord.inventory_items || []
        };

        // Recalculate hasBalance based on merged totals
        const hasBalance = checkBalanceQuantity(mergedRecordForBalance, poData);

        return {
          ...mergedRecord,
          hasBalance
        };
      }).filter(record => {
        // Show records that either:
        // 1. Have no pending stock (hasBalance === false), OR
        // 2. Are marked as closed (po_closed_status === true)
        const hasNoBalance = record.hasBalance === false;
        const isClosed = record.poClosedStatus === true;
        return hasNoBalance || isClosed;
      });
    } else if (activeStatus === 'history') {
      // History shows all records separately (no merging)
      // No additional filtering needed
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => {
        return (
          record.vendorName?.toLowerCase().includes(query) ||
          record.stockingLocation?.toLowerCase().includes(query) ||
          String(record.purchaseNo || record.entryNumber)?.includes(query)
        );
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.latestDate || a.date || a.created_at || a.createdAt);
      const dateB = new Date(b.latestDate || b.date || b.created_at || b.createdAt);
      return dateB - dateA;
    });

    setFilteredRecords(filtered);
  }, [incomingRecords, activeStatus, searchQuery, allPurchaseOrders]);

  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden bg-white">
      {/* Back Button - Show when detail view is open */}
      {showDetailView && selectedRecord && (
        <div className="flex-shrink-0 px-4 pt-2 pb-1">
          <button
            type="button"
            onClick={() => {
              setShowDetailView(false);
              setSelectedRecord(null);
            }}
            className="flex items-center gap-2 text-[14px] font-medium text-black"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Date and Category Buttons - Hide when detail view is open */}
      {!showDetailView && (
        <div className="flex-shrink-0 px-4 pt-1">
          <div className="flex items-center justify-between">
            {/* Date Button */}
            <button
              type="button"
              className="px-3 py-1.5 h-8 text-[12px] font-medium text-black"
            >
              Date
            </button>
            {/* Category Button */}
            <button
              type="button"
              className="px-3 py-1.5 h-8 text-[12px] font-medium text-black"
            >
              Category
            </button>
          </div>
        </div>
      )}

      {/* Live/Closed/History Toggle - Always visible */}
      <div className="flex-shrink-0 px-4 pt-1 pb-3">
        <div className="flex items-center gap-2">
          {/* Live/Closed/History Tabs */}
          <div className="flex bg-gray-100 items-center h-9 shadow-sm flex-1">
            <button
              type="button"
              onClick={() => setActiveStatus('live')}
              className={`flex-1 py-1 px-4 ml-1 h-8 rounded text-[14px] font-medium transition-colors ${activeStatus === 'live'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setActiveStatus('closed')}
              className={`flex-1 py-1 px-4 h-8 rounded-lg text-[14px] font-medium transition-colors ${activeStatus === 'closed'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              Closed
            </button>
            <button
              type="button"
              onClick={() => setActiveStatus('history')}
              className={`flex-1 py-1 px-4 h-8 rounded-lg text-[14px] font-medium transition-colors ${activeStatus === 'history'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {!showDetailView && (
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
      )}

      {/* Filter Button */}
      {!showDetailView && (
        <div className="flex-shrink-0 px-4 pb-3">
          <button
            type="button"
            className="flex items-center gap-2 text-[14px] font-medium text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Filter
          </button>
        </div>
      )}

      {/* Records List */}
      <div className="flex-1 px-4 overflow-hidden flex flex-col">
        {showDetailView && selectedRecord ? (
          /* Detail View - Inline below search bar */
          <div className="bg-white flex flex-col flex-1 min-h-0" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {/* Purchase Order Info Card */}
            <div className="flex-shrink-0 p-4 bg-white border border-gray-200 rounded-lg mb-2">
              <div className="space-y-2">
                <div className="flex items-start">
                  <p className="text-[12px] font-medium text-[#3f3f3f] w-[120px]">Vendor Name</p>
                  <p className="text-[12px] font-medium text-black mx-1">:</p>
                  <p className="text-[12px] font-medium text-[#a6a6a6] flex-1">{selectedRecord.vendorName}</p>
                </div>
                <div className="flex items-start">
                  <p className="text-[12px] font-medium text-[#3f3f3f] w-[120px]">Stocking Location</p>
                  <p className="text-[12px] font-medium text-black mx-1">:</p>
                  <p className="text-[12px] font-medium text-[#a6a6a6] flex-1">{selectedRecord.stockingLocation}</p>
                </div>
                <div className="flex items-start">
                  <p className="text-[12px] font-medium text-[#3f3f3f] w-[120px]">Purchase Order</p>
                  <p className="text-[12px] font-medium text-black mx-1">:</p>
                  <p className="text-[12px] font-medium text-[#a6a6a6] flex-1">#{selectedRecord.purchaseNo || selectedRecord.entryNumber}</p>
                </div>
              </div>
            </div>

            {/* Items Summary */}
            <div className="flex-shrink-0 mb-4 flex items-center gap-2 border-b border-[#E0E0E0] pb-2">
              <p className="text-[14px] font-medium text-black">Items</p>
              <input
                type="text"
                value={selectedRecord.numberOfItems || selectedRecord.totalMergedItems || 0}
                readOnly
                className="w-[30px] h-[30px] border border-[rgba(0,0,0,0.16)] rounded-full px-2 text-[12px] font-medium text-black bg-gray-200 text-center"
              />
              <div className="ml-auto">
                <span className="text-[14px] font-medium text-black">Total Amount: </span>
                <span className="text-[14px] font-semibold text-[#BF9853]">
                  ₹{(selectedRecord.totalAmount || selectedRecord.totalMergedAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div className=" overflow-y-auto min-h-0 space-y-1 no-scrollbar scrollbar-none scrollbar-hide">
              {(() => {
                // Use allInventoryItems if available (for merged records), otherwise use regular inventoryItems
                const inventoryItems = selectedRecord.allInventoryItems || selectedRecord.inventoryItems || selectedRecord.inventory_items || [];
                const getCategoryColor = (category) => {
                  switch (category) {
                    case 'Electricals':
                      return 'bg-[#E3F2FD] text-[#1976D2]';
                    case 'Paint':
                      return 'bg-[#E8F5E9] text-[#2E7D32]';
                    case 'Plumbing':
                      return 'bg-[#FFF3E0] text-[#F57C00]';
                    case 'Carpentry':
                      return 'bg-[#F3E5F5] text-[#7B1FA2]';
                    default:
                      return 'bg-[#E3F2FD] text-[#1976D2]';
                  }
                };

                return inventoryItems.map((item, index) => {
                  const itemId = item.item_id || item.itemId || null;
                  const brandId = item.brand_id || item.brandId || null;
                  const modelId = item.model_id || item.modelId || null;
                  const typeId = item.type_id || item.typeId || null;
                  const categoryId = item.category_id || item.categoryId || null;

                  let itemName = item.itemName || item.item_name || '';
                  let brand = item.brandName || item.brand_name || item.brand || '';
                  let model = item.modelName || item.model_name || item.model || '';
                  let type = item.typeName || item.type_name || item.type || '';
                  let category = item.categoryName || item.category_name || item.category || '';

                  // Resolve names from IDs if not available
                  if (!itemName && itemId) {
                    itemName = resolveItemName(itemId);
                  }
                  if (!brand && brandId) {
                    brand = resolveBrandName(brandId);
                  }
                  if (!model && modelId) {
                    model = resolveModelName(modelId);
                  }
                  if (!type && typeId) {
                    type = resolveTypeName(typeId);
                  }
                  if (!category && categoryId) {
                    category = resolveCategoryName(categoryId);
                  }

                  const quantity = Math.abs(item.quantity || 0);
                  const amount = Math.abs(item.amount || 0);
                  const unit = item.unit || '';

                  // Format details: model, brand, type
                  const details = [model, brand, type].filter(Boolean).join(', ');

                  return (
                    <div key={index} className="bg-white border border-[#E0E0E0] rounded-[8px] p-3">
                      <div className=" ">
                        <div className="flex items-center justify-between">
                          <p className="text-[14px] font-semibold text-black">{itemName}</p>
                          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${getCategoryColor(category)}`}>
                            {(category || 'Electricals').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[12px] font-medium text-gray-600">
                            {model ? `${model}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          
                          <p className="text-[12px] font-medium text-gray-600">
                            {brand ? `${brand}` : ''} {type ? `${type}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">

                          <p className="text-[12px] font-medium text-[#BF9853]">
                            Quantity {quantity}{unit}
                          </p>
                          <p className="text-[14px] font-semibold text-black">
                            ₹{amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">
              {activeStatus === 'live'
                ? 'No live incoming records with pending quantities'
                : activeStatus === 'closed'
                  ? 'No closed incoming records'
                  : 'No history records found'}
            </p>
          </div>
        ) : (
          <div className={activeStatus === 'history' ? 'space-y-0' : 'space-y-3'}>
            {filteredRecords.map((record) => {
              const displayDate = activeStatus === 'history'
                ? record.formattedDate
                : (record.latestDate ? new Date(record.latestDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : record.formattedDate);

              const displayTime = activeStatus !== 'history' && record.formattedTime
                ? record.formattedTime
                : (record.latestDate ? new Date(record.latestDate).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) : '');

              const displayQuantity = activeStatus === 'history'
                ? record.totalQuantity
                : (record.totalMergedQuantity || record.totalQuantity);

              const displayItems = activeStatus === 'history'
                ? record.numberOfItems
                : (record.totalMergedItems || record.numberOfItems);

              if (activeStatus === 'history') {
                // History tab - simple list format
                return (
                  <div
                    key={record.id || record._id || `${record.purchaseNo}_${record.vendorName}_${Math.random()}`}
                    className="flex items-center justify-between py-3 px-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedRecord(record);
                      setShowDetailView(true);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] font-semibold text-[#BF9853]">
                        #{record.purchaseNo || record.entryNumber}
                      </span>
                      <span className="text-[12px] font-semibold text-black">
                        , {record.vendorName}
                      </span>
                      <span className="text-[12px] text-gray-500 ml-2">
                        {displayDate}
                      </span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 12L10 8L6 4" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                );
              } else {
                // Live and Closed tabs - detailed card format
                const isClickable = activeStatus === 'live';
                return (
                  <div
                    key={record.id || record._id || `${record.purchaseNo}_${record.vendorName}_${Math.random()}`}
                    className={`bg-white border border-gray-200 rounded-lg p-4 ${isClickable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    onClick={isClickable ? () => {
                      setSelectedRecord(record);
                      setShowDetailView(true);
                    } : undefined}
                  >
                    <div className="flex justify-between items-start">
                      {/* Left Side */}
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-[12px] font-semibold text-black">
                            #{record.purchaseNo || record.entryNumber}
                          </span>
                          <span className="text-[12px] font-semibold text-black">
                            , {record.vendorName}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-600 mb-1">
                          {record.stockingLocation}
                        </p>
                        <p className="text-[12px] text-gray-500">
                          {displayDate}{displayTime ? ` • ${displayTime}` : ''}
                        </p>
                      </div>

                      {/* Right Side */}
                      <div className="flex flex-col items-end">
                        <p className="text-[12px] text-gray-600 mb-1">
                          No. of Items - {displayItems}
                        </p>
                        <p className='mb-[20px]'></p>
                        <p className="text-[12px] font-semibold text-[#BF9853] mb-1">
                          Quantity - {displayQuantity}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingTracker;

