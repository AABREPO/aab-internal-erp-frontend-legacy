import React, { useState, useEffect } from 'react';

const SelectLocatorsModal = ({ isOpen, onClose, onSelect, selectedValues = [], options = [], fieldName = 'Locators', onAddNew }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelected, setLocalSelected] = useState(selectedValues);

  // Update local selected when selectedValues prop changes
  useEffect(() => {
    setLocalSelected(selectedValues);
  }, [selectedValues]);

  // Reset search when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter options based on search query
  const normalizeSearchText = (text) => {
    return text
      .toLowerCase()
      .replace(/[-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizedQuery = normalizeSearchText(searchQuery);
  const filteredOptions = options.filter(option => {
    const normalizedOption = normalizeSearchText(option);
    return normalizedOption.includes(normalizedQuery);
  });

  // Check if search query doesn't match any existing option
  const searchQueryTrimmed = searchQuery.trim();
  const canCreateNew = onAddNew && searchQueryTrimmed.length > 0 && !options.some(opt => {
    const normalizedOpt = normalizeSearchText(opt);
    const normalizedQuery = normalizeSearchText(searchQueryTrimmed);
    return normalizedOpt === normalizedQuery;
  });

  if (!isOpen) return null;

  const handleToggleSelect = (value) => {
    const newSelected = localSelected.includes(value)
      ? localSelected.filter(v => v !== value)
      : [...localSelected, value];
    setLocalSelected(newSelected);
    // Immediately call onSelect to update the backend
    onSelect(newSelected);
  };

  const handleConfirm = () => {
    onSelect(localSelected);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      // Call onSelect with current selection before closing
      onSelect(localSelected);
      onClose();
    }
  };

  const handleCreateNew = () => {
    if (canCreateNew && onAddNew) {
      onAddNew(searchQueryTrimmed);
      const newSelected = [...localSelected, searchQueryTrimmed];
      setLocalSelected(newSelected);
      setSearchQuery('');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div 
        className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-5">
          <p className="text-[16px] font-semibold text-black">Select {fieldName}</p>
          <button 
            onClick={() => {
              // Call onSelect with current selection before closing
              onSelect(localSelected);
              onClose();
            }} 
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            {/* Create New Option */}
            {canCreateNew && (
              <button
                onClick={handleCreateNew}
                className="w-full h-[36px] px-6 flex items-center bg-gray-100 gap-2 hover:bg-[#F5F5F5] transition-colors"
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-[14px] text-gray-600 font-normal text-left truncate">New Model</p>
              </button>
            )}
            {filteredOptions.length > 0 ? (
              <div className="space-y-0">
                {filteredOptions.map((option, index) => {
                  const isSelected = localSelected.includes(option);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleToggleSelect(option)}
                      className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                      }`}
                    >
                      {/* Left: Option Text */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-black text-left truncate">{option}</p>
                      </div>

                      {/* Right: Checkbox */}
                      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                        {isSelected ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="16" height="16" rx="2" fill="#4CAF50" stroke="#4CAF50" strokeWidth="2"/>
                            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                  {searchQuery ? `No ${fieldName.toLowerCase()} found` : `No ${fieldName.toLowerCase()} available`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectLocatorsModal;

