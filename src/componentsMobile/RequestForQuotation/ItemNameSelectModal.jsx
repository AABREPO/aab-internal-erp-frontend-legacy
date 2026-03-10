import React, { useState, useEffect, useRef } from 'react';

const ItemNameSelectModal = ({ isOpen, onClose, onSelect, selectedValue, options = [], onAddNew }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const selectedOptionRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [favorites, setFavorites] = useState(() => {
    // Load favorites from localStorage
    const storageKey = 'favoriteItemNames';
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

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div ref={scrollContainerRef} className="bg-white w-full max-w-[360px] rounded-[16px] p-6 max-h-[80vh] overflow-y-auto transform -translate-y-24" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <p className="text-[16px] font-medium text-black">Select Item Name</p>
          <button onClick={onClose} className="text-[#e4572e] text-[20px] font-semibold">
            ×
          </button>
        </div>
        <div className="mb-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full h-[32px] border border-[#E0E0E0] rounded-[8px] px-3 pr-10 text-[12px] font-medium text-black placeholder:text-[#9E9E9E] focus:outline-none"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 15L11 11" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <button onClick={handleAddNewClick} className="w-full h-[36px] px-3 flex items-center gap-2 hover:bg-[#f3f5f7] text-left border-b border-[rgba(0,0,0,0.08)] mb-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-[12px] font-medium text-black">New Item Name</p>
        </button>
        {sortedOptions.length > 0 && (
          <div className="space-y-2">
            {sortedOptions.map((option, index) => {
              const isSelected = selectedValue === option;
              const isFavorite = favorites.includes(option);
              return (
                <button
                  key={index}
                  ref={isSelected ? selectedOptionRef : null}
                  onClick={() => handleSelect(option)}
                  className={`w-full rounded-[6px] px-3 flex items-center gap-3 ${
                    isSelected
                      ? 'bg-[#FFF3E0]'
                      : 'bg-white'
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
                  <div className="flex flex-col flex-1 min-w-0">
                    {(() => {
                      const { firstLine, secondLine } = splitOptionText(option);
                      return (
                        <>
                          <p className="text-[12px] font-medium text-black truncate whitespace-nowrap">{firstLine}</p>
                          {secondLine && (
                            <p className="text-[11px] font-medium text-[#777777] truncate whitespace-nowrap">{secondLine}</p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {filteredOptions.length === 0 && options.length > 0 && searchQuery && (
          <p className="text-[12px] text-[#777777] text-center py-4">
            No item names found matching "{searchQuery}". Add a new one above.
          </p>
        )}
        {options.length === 0 && (
          <p className="text-[12px] text-[#777777] text-center py-4">
            No item name options available. Add a new one above.
          </p>
        )}
      </div>
    </div>
  );
};
export default ItemNameSelectModal;