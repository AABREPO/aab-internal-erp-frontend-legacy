import React, { useState, useEffect } from 'react';

const NetStock = ({ user }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'list'
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showItemNameDropdown, setShowItemNameDropdown] = useState(false);
  const [showItemIdDropdown, setShowItemIdDropdown] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowItemNameDropdown(false);
        setShowItemIdDropdown(false);
      }
    };

    if (showItemNameDropdown || showItemIdDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showItemNameDropdown, showItemIdDropdown]);

  return (
    <div className="flex flex-col bg-white px-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Category and Brand Section */}
        <div className="flex justify-between mb-2 mt-2">
          <p className="text-[12px] text-[#848484] leading-normal mb-2">Category</p>
          <p className="text-[12px] text-[#848484] leading-normal mb-2">Brand</p>
        </div>
        {/* Table/List Segmented Control */}
        <div className="flex-shrink-0 pt-2">
          <div className="flex bg-gray-100 items-center h-9 shadow-sm flex-1 rounded-md">
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 py-1 px-4 ml-1 h-8 rounded text-[14px] font-medium transition-colors ${viewMode === 'table'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-1 px-4 ml-1 h-8 rounded text-[14px] font-medium transition-colors ${viewMode === 'list'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Item Name and Item ID Dropdowns */}
        <div className="flex gap-3 mt-4">
          {/* Item Name Dropdown */}
          <div className="flex-1 relative dropdown-container">
            <p className="text-[12px] font-medium text-black mb-1 leading-normal">Item Name</p>
            <div className="relative">
              <div
                onClick={() => {
                  setShowItemNameDropdown(!showItemNameDropdown);
                  setShowItemIdDropdown(false);
                }}
                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  color: selectedItemName ? '#000' : '#9E9E9E',
                  boxSizing: 'border-box'
                }}
              >
                {selectedItemName || 'Select'}
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {showItemNameDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] max-h-[200px] overflow-y-auto">
                  {/* Dropdown options would go here */}
                  <div
                    onClick={() => {
                      setSelectedItemName('Sample Item');
                      setShowItemNameDropdown(false);
                    }}
                    className="px-3 py-2 text-[12px] font-medium cursor-pointer hover:bg-gray-100"
                  >
                    Sample Item
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Item ID Dropdown */}
          <div className="flex-1 relative dropdown-container">
            <p className="text-[12px] font-medium text-black mb-1 leading-normal">Item ID</p>
            <div className="relative">
              <div
                onClick={() => {
                  setShowItemIdDropdown(!showItemIdDropdown);
                  setShowItemNameDropdown(false);
                }}
                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  color: selectedItemId ? '#000' : '#9E9E9E',
                  boxSizing: 'border-box'
                }}
              >
                {selectedItemId || 'Select'}
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {showItemIdDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] max-h-[200px] overflow-y-auto">
                  {/* Dropdown options would go here */}
                  <div
                    onClick={() => {
                      setSelectedItemId('AA DM 01');
                      setShowItemIdDropdown(false);
                    }}
                    className="px-3 py-2 text-[12px] font-medium cursor-pointer hover:bg-gray-100"
                  >
                    AA DM 01
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


      {/* Main Content Area - Empty */}
      <div className="flex-1 px-4 pb-4 mt-4 min-h-[400px]">
        {/* Empty content area where table/list would be displayed */}
      </div>
    </div>
  );
};

export default NetStock;
