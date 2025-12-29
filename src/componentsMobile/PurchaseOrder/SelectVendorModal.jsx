import React, { useState, useEffect } from 'react';

const SelectVendorModal = ({ isOpen, onClose, onSelect, selectedValue, options = [], fieldName = 'Vendor', onAddNew, showStarIcon = true }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingNewValue, setPendingNewValue] = useState('');
  const [favorites, setFavorites] = useState(() => {
    // Load favorites from localStorage based on field name
    const storageKey = `favorite${fieldName}s`;
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // Reset search when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setShowConfirmModal(false);
      setPendingNewValue('');
    }
  }, [isOpen]);

  // Filter options based on search query
  // Normalize search: remove hyphens/dashes and normalize spaces for flexible matching
  const normalizeSearchText = (text) => {
    return text
      .toLowerCase()
      .replace(/[-–—]/g, ' ') // Replace hyphens/dashes with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };

  const normalizedQuery = normalizeSearchText(searchQuery);
  const filteredOptions = options.filter(option => {
    const normalizedOption = normalizeSearchText(option);
    return normalizedOption.includes(normalizedQuery);
  });

  // Check if search query doesn't match any existing option (for creatable functionality)
  const searchQueryTrimmed = searchQuery.trim();
  const canCreateNew = onAddNew && searchQueryTrimmed.length > 0 && !options.some(opt => {
    const normalizedOpt = normalizeSearchText(opt);
    const normalizedQuery = normalizeSearchText(searchQueryTrimmed);
    return normalizedOpt === normalizedQuery;
  });

  // Sort: favorites first, then alphabetically
  const sortedOptions = [...filteredOptions].sort((a, b) => {
    const aIsFavorite = favorites.includes(a);
    const bIsFavorite = favorites.includes(b);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return a.localeCompare(b);
  });

  if (!isOpen) return null;

  const handleSelect = (value) => {
    onSelect(value);
    onClose();
  };

  const handleToggleFavorite = (e, item) => {
    e.stopPropagation();
    const storageKey = `favorite${fieldName}s`;
    const newFavorites = favorites.includes(item)
      ? favorites.filter(f => f !== item)
      : [...favorites, item];
    setFavorites(newFavorites);
    localStorage.setItem(storageKey, JSON.stringify(newFavorites));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCreateNew = () => {
    if (canCreateNew && onAddNew) {
      setPendingNewValue(searchQueryTrimmed);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmCreate = () => {
    if (onAddNew && pendingNewValue) {
      onAddNew(pendingNewValue);
      onSelect(pendingNewValue);
      setShowConfirmModal(false);
      setPendingNewValue('');
      onClose();
    }
  };

  const handleCancelCreate = () => {
    setShowConfirmModal(false);
    setPendingNewValue('');
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
        <div className="flex justify-between items-center px-6 pt-5 ">
          <p className="text-[16px] font-semibold text-black">Select {fieldName}</p>
          <button 
            onClick={onClose} 
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
            {/* Create New Option - Show when typing something that doesn't exist */}
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
                <p className="text-[14px] text-gray-600 font-normal text-left truncate">"{searchQueryTrimmed}"</p>
              </button>
            )}
            {sortedOptions.length > 0 ? (
              <div className="space-y-0">
                {sortedOptions.map((option, index) => {
                  const isFavorite = favorites.includes(option);
                  const isSelected = selectedValue === option;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelect(option)}
                      className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                      }`}
                    >
                      {/* Left: Star Icon (if enabled) and Option Text */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {showStarIcon && (
                          <button
                            onClick={(e) => handleToggleFavorite(e, option)}
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
                        )}
                        <p className="text-[14px] font-medium text-black text-left truncate">{option}</p>
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
                  {searchQuery ? `No ${fieldName.toLowerCase()}s found` : `No ${fieldName.toLowerCase()}s available`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Creating New Option */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[10001] flex items-center justify-center"
          onClick={handleCancelCreate}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div 
            className="bg-white w-full max-w-[360px] mx-4 rounded-[16px] p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-[16px] font-semibold text-black">Confirm Create?</p>
              <button 
                onClick={handleCancelCreate}
                className="text-[#e4572e] text-[20px] font-semibold hover:opacity-80 transition-opacity"
              >
                ×
              </button>
            </div>
            
            <p className="text-[14px] font-medium text-[#848484] mb-6">
              Do you want to create "{pendingNewValue}" as a new {fieldName.toLowerCase()}?
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={handleCancelCreate}
                className="flex-1 h-[40px] border border-black rounded-[8px] text-[14px] font-bold text-black bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreate}
                className="flex-1 h-[40px] bg-black border border-[#f4ede2] rounded-[8px] text-[14px] font-bold text-white hover:bg-gray-800 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectVendorModal;

