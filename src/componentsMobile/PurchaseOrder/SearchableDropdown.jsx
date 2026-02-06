import React, { useState, useEffect, useRef } from 'react';

const SearchableDropdown = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select...',
  onAddNew,
  fieldName = 'Option',
  showAddNew = true,
  showAllOptions = false,
  maxHeight = '144px', // 4 items * 36px height = 144px
  className = '' // Allow custom className for width/height
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAddInput(false);
        setNewOption('');
        // Reset search query to current value when closing
        setSearchQuery(value || '');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
          if (keyboardOpen || spaceBelow < 200) {
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
    // Close dropdown after selection
    setIsOpen(false);
    // Reset search query to selected value when closing
    setSearchQuery(option);
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
    // Don't close if clicking on clear button or dropdown items
    const relatedTarget = e.relatedTarget || document.activeElement;
    if (relatedTarget && (
      relatedTarget.closest('.dropdown-options') || 
      relatedTarget.closest('.clear-button')
    )) {
      return;
    }
    
    // Close dropdown on blur
    setIsOpen(false);
    // Reset search query to current value when closing
    if (value) {
      setSearchQuery(value);
    } else {
      setSearchQuery('');
    }
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
          className={`${className || 'w-full h-[32px]'} border border-[rgba(0,0,0,0.16)] rounded pl-3 text-[12px] font-medium text-black bg-white focus:outline-none`}
          style={{ 
            boxSizing: 'border-box',
            paddingRight: value ? '60px' : '32px'
          }}
          placeholder={placeholder}
        />
        {/* Clear Button - Show when value is selected */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="clear-button absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
            style={{ right: '32px' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {/* Dropdown Arrow - Always visible */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 pointer-events-none"
          style={{ right: '10px' }}
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path 
              d="M2.5 4.5L6 8L9.5 4.5" 
              stroke="#666" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`dropdown-options bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] shadow-lg ${
            showAllOptions ? 'overflow-y-auto' : 'overflow-hidden'
          }`}
          style={{
            ...dropdownStyle,
            maxHeight: showAllOptions ? maxHeight : 'auto'
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Create New Option - Show when typing something that doesn't exist (like SelectVendorModal) */}
          {canCreateNew && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateNewFromSearch();
              }}
              className="w-full h-[36px] px-3 flex items-center gap-2 hover:bg-[#f3f5f7] text-left border-b border-[rgba(0,0,0,0.08)]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-[12px] font-medium text-black">"{searchQueryTrimmed}"</p>
            </button>
          )}

          {/* Add New Option - Only show if showAddNew is true and no creatable option is available */}
          {showAddNew && !canCreateNew && (
            <>
              {!showAddInput ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddInput(true);
                  }}
                  className="w-full h-[36px] px-3 flex items-center gap-2 hover:bg-[#f3f5f7] text-left border-b border-[rgba(0,0,0,0.08)]"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-[12px] font-medium text-black">Add New {fieldName}</p>
                </button>
              ) : (
                <div className="p-2 border-b border-[rgba(0,0,0,0.16)]">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
                    className="w-full h-[36px] border border-[rgba(0,0,0,0.16)] rounded-[6px] px-3 text-[12px] font-medium text-black bg-white mb-2"
                    placeholder={`Enter new ${fieldName.toLowerCase()}`}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddNew();
                      }}
                      className="flex-1 h-[32px] rounded-[6px] bg-black text-white text-[12px] font-medium"
                    >
                      Add
                    </button>
                    <button
                      onClick={(e) => {
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

          {/* Filtered Options - Show all when showAllOptions is true */}
          {visibleOptions.length > 0 ? (
            <div>
              {visibleOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option);
                  }}
                  className={`w-full h-[36px] px-3 flex items-center justify-between hover:bg-[#f3f5f7] text-left ${
                    value === option ? 'bg-[#f3f5f7]' : ''
                  }`}
                >
                  <p className="text-[12px] font-medium text-black">{option}</p>
                  {value === option && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="7" cy="7" r="6" stroke="#26bf94" strokeWidth="2" />
                      <path d="M4 7L6 9L10 5" stroke="#26bf94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          ) : (
            searchQuery && !canCreateNew && (
              <p className="text-[12px] text-[#777777] text-center py-4">
                No results found
              </p>
            )
          )}
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

export default SearchableDropdown;

