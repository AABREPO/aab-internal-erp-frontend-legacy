import React, { useState, useEffect } from 'react';

const SelectPOModal = ({ isOpen, onClose, onSelect, selectedValue, vendorName, vendorId, stockingLocation, allPurchaseOrders = [], onFetchPOs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [poNumbers, setPoNumbers] = useState([]);
  const [poDataMap, setPoDataMap] = useState({}); // Map ENO to full PO data
  const [loading, setLoading] = useState(false);

  // Reset search when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Fetch PO numbers from API
  useEffect(() => {
    if (isOpen && vendorId && stockingLocation) {
      fetchPONumbers();
    }
  }, [isOpen, vendorId, stockingLocation]);

  const fetchPONumbers = async () => {
    setLoading(true);
    try {
      // Use cached data if available, otherwise fetch
      let data = allPurchaseOrders;
      if (data.length === 0 && onFetchPOs) {
        data = await onFetchPOs();
      } else if (data.length === 0) {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/purchase_orders/getAll');
        if (response.ok) {
          data = await response.json();
        }
      }

      // Filter POs by vendor_id first, then extract ENOs
      const filteredPOs = data.filter(po => {
        const poVendorId = po.vendor_id || po.vendorId;
        return String(poVendorId) === String(vendorId);
      });

      // Create a map of ENO to PO data (keep the one with most items, then most recent)
      const enoMap = {};
      filteredPOs.forEach(po => {
        const eno = po.eno || po.ENO || po.poNumber || po.po_number || '';
        if (eno) {
          const numStr = String(eno).replace('#', '').trim();
          const itemsCount = (po.purchaseTable || po.purchase_table || po.items || []).length;
          const poId = parseInt(po.id || po._id || 0);
          
          if (!enoMap[numStr] || 
              itemsCount > (enoMap[numStr].itemsCount || 0) ||
              (itemsCount === (enoMap[numStr].itemsCount || 0) && poId > (enoMap[numStr].poId || 0))) {
            enoMap[numStr] = {
              eno: numStr,
              poData: po,
              itemsCount: itemsCount,
              poId: poId
            };
          }
        }
      });

      // Extract unique PO numbers and sort
      const uniquePOs = Object.keys(enoMap)
        .sort((a, b) => {
          const numA = parseInt(a) || 0;
          const numB = parseInt(b) || 0;
          return numB - numA; // Descending order (newest first)
        });

      setPoNumbers(uniquePOs);
      
      // Store the PO data map for quick access
      const dataMap = {};
      Object.values(enoMap).forEach(item => {
        dataMap[item.eno] = item.poData;
      });
      setPoDataMap(dataMap);
    } catch (error) {
      console.error('Error fetching PO numbers:', error);
      setPoNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter PO numbers based on search query
  const filteredPOs = poNumbers.filter(po => {
    const poStr = String(po);
    return poStr.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!isOpen) return null;

  const handleSelect = (poNumber) => {
    // Pass the cached PO data if available to avoid re-fetching
    const cachedData = poNumber ? poDataMap[poNumber] : null;
    onSelect(poNumber, cachedData);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white w-full max-w-[360px] rounded-[16px] p-4 max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-[16px] font-medium text-black">Select PO</p>
          <button onClick={onClose} className="text-[#e4572e] text-[20px] font-semibold">
            ×
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[40px] pl-10 pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[14px] font-medium text-black placeholder:text-[#9E9E9E] focus:outline-none focus:border-[#e4572e]"
          />
        </div>

        {/* Non PO Section */}
        <div className="mb-2">
          <p className="text-[14px] font-medium text-black mb-2">Non PO</p>
          <div
            onClick={() => handleSelect('')}
            className={`flex items-center justify-between p-3 rounded-[8px] cursor-pointer transition-colors mb-2 ${
              !selectedValue || selectedValue === '' ? 'bg-[#FFF4E6]' : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-[14px] font-medium text-black">Non PO</span>
            <div className="flex items-center">
              {!selectedValue || selectedValue === '' ? (
                <div className="w-5 h-5 rounded-full bg-[#e4572e] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-[#747474]"></div>
              )}
            </div>
          </div>
        </div>

        {/* PO Numbers List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-[14px] text-gray-500">Loading...</p>
            </div>
          ) : filteredPOs.length > 0 ? (
            <div className="space-y-1">
              {filteredPOs.map((poNumber) => {
                const isSelected = selectedValue === poNumber || selectedValue === `#${poNumber}`;
                return (
                  <div
                    key={poNumber}
                    onClick={() => handleSelect(poNumber)}
                    className={`flex items-center justify-between p-3 rounded-[8px] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#FFF4E6]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[14px] font-medium text-black">{poNumber}</span>
                    <div className="flex items-center">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#e4572e] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-[#747474]"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-[14px] text-gray-500">No PO numbers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectPOModal;

