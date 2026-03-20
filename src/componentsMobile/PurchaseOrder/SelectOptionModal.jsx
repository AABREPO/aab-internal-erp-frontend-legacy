import React, { useState, useEffect, useRef } from 'react';
import Close from '../Images/close.png';
import Search from '../Images/Search.png';

const SelectOptionModal = ({ isOpen, onClose, onSelect, selectedValue, options = [], onAddNew, fieldName = 'Option' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const selectedOptionRef = useRef(null);
  const scrollContainerRef = useRef(null);
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
    }
  }, [isOpen]);

  // Scroll to selected option when modal opens
  useEffect(() => {
    if (isOpen && selectedValue && selectedOptionRef.current && scrollContainerRef.current && !searchQuery) {
      setTimeout(() => {
        const container = scrollContainerRef.current;
        const selectedElement = selectedOptionRef.current;
        if (container && selectedElement) {
          const elementOffsetTop = selectedElement.offsetTop;
          const containerHeight = container.clientHeight;
          const elementHeight = selectedElement.offsetHeight;
          
          // Calculate the scroll position to center the selected element
          const scrollPosition = elementOffsetTop - (containerHeight / 2) + (elementHeight / 2);
          container.scrollTop = Math.max(0, scrollPosition);
        }
      }, 100);
    }
  }, [isOpen, selectedValue, searchQuery]);

  // Toggle favorite
  const handleToggleFavorite = (e, option) => {
    e.stopPropagation();
    const storageKey = `favorite${fieldName}s`;
    const updatedFavorites = favorites.includes(option)
      ? favorites.filter(fav => fav !== option)
      : [...favorites, option];
    setFavorites(updatedFavorites);
    localStorage.setItem(storageKey, JSON.stringify(updatedFavorites));
  };

  // Filter out empty/null/undefined options and then filter based on search query
  const validOptions = options.filter(option => 
    option && typeof option === 'string' && option.trim() !== ''
  );
  
  const filteredOptions = validOptions.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort options: favorites first, then alphabetically
  const sortedOptions = [...filteredOptions].sort((a, b) => {
    const aIsFavorite = favorites.includes(a);
    const bIsFavorite = favorites.includes(b);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return a.localeCompare(b);
  });

  if (!isOpen) return null;

  // Helper function to split option text at first hyphen
  const splitOptionText = (text) => {
    if (!text) return { firstLine: '', secondLine: '' };
    const firstHyphenIndex = text.indexOf(' - ');
    if (firstHyphenIndex === -1) {
      return { firstLine: text, secondLine: '' };
    }
    return {
      firstLine: text.substring(0, firstHyphenIndex),
      secondLine: text.substring(firstHyphenIndex + 3) // +3 to skip ' - '
    };
  };

  const handleSelect = (value) => {
    onSelect(value);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddNewClick = () => {
    onClose();
    if (onAddNew) {
      onAddNew();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 -top-[16px] flex items-center justify-center p-[16px]"
      onClick={handleBackdropClick}
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div
        ref={scrollContainerRef}
        className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-[24px] pt-[24px]">
          <p className="text-[16px] font-semibold text-black">Select {fieldName}</p>
          <button onClick={onClose} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
            <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-[24px] pt-[4px] pb-[6px]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-[32px] pl-[30px] pr-[16px] border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
              autoFocus
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <img src={Search} alt="Search" className="w-[12px] h-[12px]" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-[24px] min-h-[65vh]">
          <div className="shadow-md rounded-lg overflow-hidden">
            {/* New Option Button */}
            {onAddNew && (
              <button
                onClick={handleAddNewClick}
                className="w-full px-[24px] flex items-center gap-[12px] transition-colors hover:bg-[#F5F5F5]"
                style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
              >
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-[12px] font-medium text-black">New {fieldName}</p>
              </button>
            )}

            {/* Existing Options - Filtered by search */}
            {sortedOptions.length > 0 ? (
              <div className="space-y-0">
                {sortedOptions.map((option, index) => {
                  const isSelected = selectedValue === option;
                  const isFavorite = favorites.includes(option);
                  const { firstLine, secondLine } = splitOptionText(option);
                  return (
                    <button
                      key={index}
                      ref={isSelected ? selectedOptionRef : null}
                      onClick={() => handleSelect(option)}
                      className={`w-full px-[10px] flex items-center gap-[12px] transition-colors ${
                        isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                      }`}
                      style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                    >
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
                      <div className="flex flex-col flex-1 min-w-0 text-left">
                        <p className="text-[12px] font-medium text-black truncate whitespace-nowrap text-left">{firstLine}</p>
                        {secondLine && (
                          <p className="text-[11px] font-medium text-[#777777] truncate whitespace-nowrap text-left">{secondLine}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-[16px]">
                <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                  {searchQuery.trim() ? 'No options found' : 'No options available'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectOptionModal;


