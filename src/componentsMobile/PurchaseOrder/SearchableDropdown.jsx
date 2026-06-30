import React, { useState, useEffect, useRef } from 'react';
import Close from '../Images/close.png';
import CloseIcon from '../Images/Close F.svg'
import Search from '../Images/Search.png'
import Star from '../Images/Star.svg'

const SearchableDropdown = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select...',
  onAddNew,
  fieldName = 'Option',
  showAddNew = true,
  showAllOptions = false,
  maxHeight = '80vh',
  disableKeyboardReposition = false,
  className = '', // Allow custom className for width/height
  suggestedNewValue = '', // Pre-fill when opening "Add New" (e.g. next Item ID like "DH 03")
  addNewLabel = null // Override "Add New {fieldName}" (e.g. "+ DH 05" for Item ID)
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingNewValue, setPendingNewValue] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  // Debug: Log options for Type dropdown
  useEffect(() => {
    if (fieldName === 'Type') {
      console.log('SearchableDropdown Type - options received:', options);
      console.log('SearchableDropdown Type - options length:', options?.length);
      console.log('SearchableDropdown Type - searchQuery:', searchQuery);
    }
  }, [options, searchQuery, fieldName]);

  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];
  
  // Filter options based on search query
  const filteredOptions = safeOptions.filter(option => {
    if (!option || typeof option !== 'string') {
      console.warn('Invalid option:', option);
      return false;
    }
    return option.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Check if search query doesn't match any existing option (for creatable functionality)
  const searchQueryTrimmed = searchQuery.trim();
  const canCreateNew = showAddNew && searchQueryTrimmed.length > 0 && !safeOptions.some(opt => 
    opt && typeof opt === 'string' && opt.toLowerCase() === searchQueryTrimmed.toLowerCase()
  );
  
  // Show all options or limit to 4 based on prop
  const visibleOptions = showAllOptions ? filteredOptions : filteredOptions.slice(0, 4);
  
  // Debug: Log filtered options for Type
  useEffect(() => {
    if (fieldName === 'Type' && isOpen) {
      console.log('SearchableDropdown Type - filteredOptions:', filteredOptions);
      console.log('SearchableDropdown Type - visibleOptions:', visibleOptions);
    }
  }, [filteredOptions, visibleOptions, isOpen, fieldName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown and not on any modal content
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Also check if click is not on the modal backdrop or modal content
        const modalContent = document.querySelector('.searchable-dropdown-modal');
        const modalContentDiv = document.querySelector('.searchable-dropdown-content');
        if ((modalContent && modalContent.contains(event.target)) ||
            (modalContentDiv && modalContentDiv.contains(event.target))) {
          return; // Don't close if clicking inside modal
        }
        // Only close if clicking on the backdrop (dark overlay)
        const backdrop = event.target.closest('.searchable-dropdown-modal');
        if (backdrop && event.target === backdrop) {
          setIsOpen(false);
          setShowAddInput(false);
          setNewOption('');
          // Reset search query to current value when closing
          setSearchQuery(value || '');
        }
      }
    };

    if (isOpen) {
      // Use click instead of mousedown to allow other events to process first
      document.addEventListener('click', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isOpen, value]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Calculate dropdown position for mobile keyboard support
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const updatePosition = () => {
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          // Use visualViewport if available (better for mobile keyboard detection)
          const viewportHeight = window.visualViewport?.height || window.innerHeight;
          const windowHeight = window.innerHeight;
          
          // Detect if keyboard is open (viewport height is significantly less than window height)
          const keyboardOpen = windowHeight - viewportHeight > 150;
          
          const spaceBelow = viewportHeight - rect.bottom;
          const spaceAbove = rect.top;
          
          // Use fixed positioning for better mobile keyboard support
          // Always position above input when keyboard is open or when there's not enough space below
          if (!disableKeyboardReposition && (keyboardOpen || spaceBelow < 200)) {
            // Position above input (keyboard is open or not enough space)
            const maxHeight = Math.min(spaceAbove - 20, 200); // Limit height to available space
            setDropdownStyle({
              position: 'fixed',
              bottom: `${windowHeight - rect.top + 4}px`,
              left: `${rect.left}px`,
              width: `${rect.width}px`,
              maxHeight: `${maxHeight}px`,
              zIndex: 10000,
              overflowY: 'auto'
            });
          } else {
            // Position below input
            setDropdownStyle({
              position: 'fixed',
              top: `${rect.bottom + 4}px`,
              left: `${rect.left}px`,
              width: `${rect.width}px`,
              zIndex: 10000
            });
          }
        }
      };
      
      updatePosition();
      // Update on resize and scroll for mobile keyboard
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      // Use visualViewport API for better mobile keyboard detection
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updatePosition);
        window.visualViewport.addEventListener('scroll', updatePosition);
      }
      
      // Also listen for focus events to detect keyboard
      const handleFocus = () => {
        setTimeout(updatePosition, 300); // Delay to allow keyboard to appear
      };
      
      inputRef.current?.addEventListener('focus', handleFocus);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', updatePosition);
          window.visualViewport.removeEventListener('scroll', updatePosition);
        }
        if (inputRef.current) {
          inputRef.current.removeEventListener('focus', handleFocus);
        }
      };
    } else {
      setDropdownStyle({});
    }
  }, [isOpen]);
  
  // Update search query when value changes (for initial load) - only when dropdown is closed
  useEffect(() => {
    if (value && !isOpen) {
      setSearchQuery(value);
    }
  }, [value, isOpen]);

  const handleSelect = (option) => {
    onChange(option);
    // Reset search query to selected value
    setSearchQuery(option);
    // Close dropdown after selection
    setIsOpen(false);
  };
  
  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
    setIsOpen(true);
    // Focus the input after clearing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };
  
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setIsOpen(true);
    // If exact match found, update value
    const exactMatch = options.find(opt => opt.toLowerCase() === newValue.toLowerCase());
    if (exactMatch) {
      onChange(exactMatch);
    } else if (newValue === '') {
      // Clear value when input is empty
      onChange('');
    }
  };
  
  const handleInputFocus = () => {
    setIsOpen(true);
    // When focusing, clear search to show all options
    setSearchQuery('');
  };
  
  const handleInputBlur = (e) => {
    // Don't close modal on blur - let user close it manually or by clicking outside
    // This prevents the modal from closing when interacting with inputs/buttons inside
    e.stopPropagation();
  };
  
  // Display value: show search query when open, or value when closed
  const displayValue = isOpen ? searchQuery : (value || '');

  const handleAddNew = () => {
    if (newOption.trim()) {
      const value = newOption.trim();
      if (onAddNew) {
        onAddNew(value);
      } else {
        onChange(value);
      }
      setNewOption('');
      setShowAddInput(false);
      setSearchQuery(value);
      setIsOpen(false);
    }
  };

  const handleCreateNewFromSearch = () => {
    if (canCreateNew && searchQueryTrimmed) {
      // Show confirmation modal
      setPendingNewValue(searchQueryTrimmed);
      setShowConfirmModal(true);
      setIsOpen(false);
    }
  };

  const handleConfirmCreate = () => {
    if (pendingNewValue) {
      if (onAddNew) {
        onAddNew(pendingNewValue);
      } else {
        onChange(pendingNewValue);
      }
      setSearchQuery(pendingNewValue);
      setShowConfirmModal(false);
      setPendingNewValue('');
    }
  };

  const handleCancelCreate = () => {
    setShowConfirmModal(false);
    setPendingNewValue('');
    // Reopen dropdown with the search query
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input Field - Now searchable */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onClick={() => {
            setIsOpen(true);
            setSearchQuery(''); // Clear search to show all options including selected one
          }}
          className={`${className || 'w-full h-[32px]'} border border-[rgba(0,0,0,0.16)] rounded pl-[12px] text-[12px] font-medium text-black bg-white focus:outline-none`}
          style={{ 
            boxSizing: 'border-box',
            paddingRight: value ? '40px' : '40px'
          }}
          placeholder={placeholder}
        />
        {/* Clear Button - Show when value is selected */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="clear-button absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
            style={{ right: '12px' }}
          >
            <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
          </button>
        )}
        {/* Dropdown Arrow - Hide when value is selected */}
        {!value && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2 pointer-events-none"
            style={{ right: '12px' }}
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
          </div>
        )}
      </div>

      {/* Dropdown Menu - Always show as popup modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-[16px] searchable-dropdown-modal"
          onClick={(e) => {
            // Only close if clicking directly on the backdrop, not on any child elements
            if (e.target === e.currentTarget) {
              setIsOpen(false);
              setSearchQuery(value || '');
            }
          }}
          onMouseDown={(e) => {
            // Prevent closing when mousedown happens on backdrop
            if (e.target === e.currentTarget) {
              e.stopPropagation();
            }
          }}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg flex flex-col transform  searchable-dropdown-content" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ height: maxHeight, maxHeight: maxHeight, minHeight: maxHeight }}>
            <div className="flex justify-between items-center px-[24px] pt-[20px]">
              <p className="text-[16px] font-semibold text-black">Select {fieldName}</p>
              <button onClick={() => {
                setIsOpen(false);
                setSearchQuery(value || '');
              }} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
              </button>
            </div>
            <div className="px-[24px] pt-[6px] pb-[6px]">
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
                    // Don't close modal on blur - let the handleInputBlur handle it with delay
                    e.stopPropagation();
                  }}
                  placeholder="Search"
                  className="w-full h-[32px] pl-[30px] border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                  autoFocus
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <img src={Search} alt="Search" className="w-[12px] h-[12px]" />
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-[24px] px-[24px]">
              <div className="shadow-md rounded-lg overflow-hidden">
                {/* Create New Option - Show when typing something that doesn't exist */}
                {canCreateNew && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCreateNewFromSearch();
                    }}
                    className="w-full px-[24px] flex items-center gap-[12px] transition-colors hover:bg-[#FFF9EF]"
                    style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                  >
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 bg-[#F5F5F5]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-[12px] font-medium text-black">"{searchQueryTrimmed}"</p>
                  </button>
                )}

                {/* Add New Option - Only show if showAddNew is true and no creatable option is available */}
                {showAddNew && !canCreateNew && (
                  <>
                    {!showAddInput ? (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setNewOption(suggestedNewValue || '');
                          setShowAddInput(true);
                        }}
                        className="w-full px-[10px] flex items-center gap-[4px] transition-colors bg-[#F6F6F6]"
                        style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                      >
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <p className="text-[12px] font-medium text-black">{addNewLabel ?? `Add New ${fieldName}`}</p>
                      </button>
                    ) : (
                      <div className="p-[16px] border-b border-[rgba(0,0,0,0.16)]" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={newOption}
                          onChange={(e) => {
                            e.stopPropagation();
                            setNewOption(e.target.value);
                          }}
                          onKeyPress={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNew();
                            }
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                          }}
                          onKeyUp={(e) => {
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          onFocus={(e) => {
                            e.stopPropagation();
                          }}
                          onBlur={(e) => {
                            e.stopPropagation();
                          }}
                          className="w-full h-[36px] border border-[rgba(0,0,0,0.16)] rounded-[6px] px-[8px] text-[12px] font-medium text-black bg-white mb-2"
                          placeholder={`Enter new ${fieldName.toLowerCase()}`}
                          autoFocus
                        />
                        <div className="flex gap-[8px]">
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddNew();
                            }}
                            className="flex-1 h-[32px] rounded-[6px] bg-black text-white text-[12px] font-medium"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowAddInput(false);
                              setNewOption('');
                            }}
                            className="flex-1 h-[32px] rounded-[6px] border border-[#949494] text-[#363636] text-[12px] font-medium bg-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Filtered Options */}
                {filteredOptions.length > 0 ? (
                  <div className="space-y-0">
                    {filteredOptions.map((option, index) => {
                      // Helper function to split option text at first hyphen (like From dropdown)
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
                      const { firstLine, secondLine } = splitOptionText(option);
                      const isSelected = value === option;
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelect(option);
                          }}
                          className={`w-full px-[10px] flex items-center gap-[8px] transition-colors ${
                            isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#FFF9EF]'
                          }`}
                          style={{ minHeight: '40px', maxHeight: '40px', height: '40px' }}
                        >
                          <div className=" flex items-center justify-center flex-shrink-0">
                            <img src={Star} alt="Star" className="w-[20px] h-[19px]" />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0 text-left">
                            <p className="text-[12px] font-semibold text-black truncate whitespace-nowrap text-left">{firstLine}</p>
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
                      {searchQuery ? 'No options found' : 'No options available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

export default SearchableDropdown;

