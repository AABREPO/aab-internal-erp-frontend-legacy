import React, { useState, useEffect } from 'react';

const ToolsHistory = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState('tools-history'); // 'tools-history' or 'service-history'
  const [activeSegment, setActiveSegment] = useState('item'); // 'item' or 'log'
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedMachineNumber, setSelectedMachineNumber] = useState(null);
  const [location, setLocation] = useState('');
  const [showItemNameDropdown, setShowItemNameDropdown] = useState(false);
  const [showItemIdDropdown, setShowItemIdDropdown] = useState(false);
  const [showMachineNumberDropdown, setShowMachineNumberDropdown] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowItemNameDropdown(false);
        setShowItemIdDropdown(false);
        setShowMachineNumberDropdown(false);
      }
    };

    if (showItemNameDropdown || showItemIdDropdown || showMachineNumberDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showItemNameDropdown, showItemIdDropdown, showMachineNumberDropdown]);

  return (
    <div className="flex flex-col bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex mb-2 mt-3 px-4">
        <p className="text-[12px] font-medium text-black leading-normal">Brand</p>
      </div>
      
      {/* Brand Section with Segmented Control */}
      <div className="flex-shrink-0 px-4 pt-2">
        {/* Item/Log Segmented Control */}
        <div className="flex bg-gray-100 items-center h-9 shadow-sm flex-1 rounded-md">
          <button
            onClick={() => setActiveSegment('item')}
            className={`flex-1 py-1 px-4 ml-1 h-8 rounded text-[14px] font-medium transition-colors ${
              activeSegment === 'item'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Item
          </button>
          <button
            onClick={() => setActiveSegment('log')}
            className={`flex-1 py-1 px-4 ml-1 h-8 rounded text-[14px] font-medium transition-colors ${
              activeSegment === 'log'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Log
          </button>
        </div>
      </div>

      {/* Input Fields Section */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        {/* Row 1: Item Name and Item ID */}
        <div className="flex gap-3 mb-4">
          {/* Item Name Dropdown */}
          <div className="flex-1 relative dropdown-container">
            <p className="text-[12px] font-medium text-black mb-1 leading-normal">Item Name</p>
            <div className="relative">
              <div
                onClick={() => {
                  setShowItemNameDropdown(!showItemNameDropdown);
                  setShowItemIdDropdown(false);
                  setShowMachineNumberDropdown(false);
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
                  setShowMachineNumberDropdown(false);
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

        {/* Row 2: Machine Number and Location */}
        <div className="flex gap-3">
          {/* Machine Number Dropdown */}
          <div className="flex-1 relative dropdown-container">
            <p className="text-[12px] font-medium text-black mb-1 leading-normal">Machine Number</p>
            <div className="relative">
              <div
                onClick={() => {
                  setShowMachineNumberDropdown(!showMachineNumberDropdown);
                  setShowItemNameDropdown(false);
                  setShowItemIdDropdown(false);
                }}
                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  color: selectedMachineNumber ? '#000' : '#9E9E9E',
                  boxSizing: 'border-box'
                }}
              >
                {selectedMachineNumber || 'Select'}
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {showMachineNumberDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] max-h-[200px] overflow-y-auto">
                  {/* Dropdown options would go here */}
                  <div
                    onClick={() => {
                      setSelectedMachineNumber('5411117822223');
                      setShowMachineNumberDropdown(false);
                    }}
                    className="px-3 py-2 text-[12px] font-medium cursor-pointer hover:bg-gray-100"
                  >
                    5411117822223
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Text Input */}
          <div className="flex-1 relative">
            <p className="text-[12px] font-medium text-black mb-1 leading-normal">Location</p>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-3 text-[12px] font-medium bg-[#E0E0E0] text-black placeholder-[#9E9E9E] focus:outline-none"
              style={{ boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area - Empty */}
      <div className="flex-1 px-4 pb-4 mt-4 min-h-[400px]">
        {/* Empty content area where history results would be displayed */}
      </div>
    </div>
  );
};

export default ToolsHistory;
