import React, { useState, useEffect, useRef } from 'react';
import Close from '../Images/close.png'
import Search from '../Images/Search.png'

const SelectVendorModal = ({ isOpen, onClose, onSelect, selectedValue, options = [], fieldName = 'Vendor', onAddNew, showStarIcon = true, preserveOrder = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingNewValue, setPendingNewValue] = useState('');
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
      setShowConfirmModal(false);
      setPendingNewValue('');
    }
  }, [isOpen]);

  // Lock body scroll when modal is open - prevents background/bottom sheet from scrolling when keyboard opens on mobile
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Scroll to selected option when modal opens
  useEffect(() => {
    if (isOpen && selectedValue && selectedOptionRef.current && scrollContainerRef.current && !searchQuery) {
      setTimeout(() => {
        const container = scrollContainerRef.current;
        const selectedElement = selectedOptionRef.current;
        if (container && selectedElement) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = selectedElement.getBoundingClientRect();
          const scrollTop = container.scrollTop;
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

  // Default behavior: favorites first, then alphabetically.
  // Opt-in preserveOrder keeps the incoming options order (used by PO modal list).
  const sortedOptions = preserveOrder ? filteredOptions : [...filteredOptions].sort((a, b) => {
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
    // Only close if clicking directly on backdrop, not on any child elements
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBackdropMouseDown = (e) => {
    // Prevent closing when mousedown happens on backdrop
    if (e.target === e.currentTarget) {
      e.stopPropagation();
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
      className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-[16px]"
      onClick={handleBackdropClick}
      onMouseDown={handleBackdropMouseDown}
      style={{ 
        fontFamily: "'Manrope', sans-serif",
        overflow: 'hidden',
        overscrollBehavior: 'contain'
      }}
    >
      <div 
        className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px]  -translate-y-[22px] rounded-b-[20px] shadow-lg flex flex-col transform max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxHeight: '80vh', overflow: 'hidden', touchAction: 'pan-y' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-[24px] pt-[20px] ">
          <p className="text-[16px] font-semibold text-black">Select {fieldName}</p>
          <button 
            onClick={onClose} 
            className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
          >
            <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-[24px] pt-[4px] pb-[6px]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                e.stopPropagation();
                setSearchQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              onKeyUp={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onFocus={(e) => {
                e.stopPropagation();
              }}
              onBlur={(e) => {
                e.stopPropagation();
              }}
              placeholder="Search"
              className="w-full h-[32px] pl-[30px] pr-[16px] border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
              autoFocus
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <img src={Search} alt="Search" className="w-[12px] h-[12px]" />
            </div>
          </div>
        </div>

        {/* Options List */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mb-[8px] px-[24px] min-h-[65vh] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
          <div className="shadow-md rounded-lg overflow-hidden">
            {/* Create New Option - Show when typing something that doesn't exist */}
            {canCreateNew && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCreateNew();
                }}
                className="w-full h-[36px] px-[10px] flex items-center bg-gray-100 gap-[8px] hover:bg-[#F5F5F5] transition-colors flex-shrink-0"
                style={{ minHeight: '36px', maxHeight: '36px', height: '36px' }}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-[14px] text-gray-600 font-normal text-left truncate whitespace-nowrap">"{searchQueryTrimmed}"</p>
              </button>
            )}
            {sortedOptions.length > 0 ? (
              <div className="space-y-0" style={{ display: 'flex', flexDirection: 'column' }}>
                {sortedOptions.map((option, index) => {
                  const isFavorite = favorites.includes(option);
                  const isSelected = selectedValue === option;
                  
                  return (
                    <button
                      key={index}
                      ref={isSelected ? selectedOptionRef : null}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(option);
                      }}
                      className={`w-full px-[10px] flex items-center justify-between transition-colors flex-shrink-0 ${
                        isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                      }`}
                      style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                    >
                      {/* Left: Star Icon and Option Text */}
                      <div className="flex items-center gap-[12px] flex-1 min-w-0">
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
                                <p className="text-[12px] font-medium text-black text-left truncate whitespace-nowrap">{firstLine}</p>
                                {secondLine && (
                                  <p className="text-[12px] font-medium text-[#777777] text-left truncate whitespace-nowrap">{secondLine}</p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-[16px]">
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
            className="bg-white w-full max-w-[360px] mx-4 rounded-[16px] p-[24px] shadow-lg"
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
            
            <div className="flex gap-[16px]">
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

