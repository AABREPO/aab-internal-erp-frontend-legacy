import React, { useState, useEffect } from 'react';

const SelectOptionModal = ({ isOpen, onClose, onSelect, selectedValue, options = [], onAddNew, fieldName = 'Option' }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter out empty/null/undefined options and then filter based on search query
  const validOptions = options.filter(option => 
    option && typeof option === 'string' && option.trim() !== ''
  );
  
  const filteredOptions = validOptions.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white w-full max-w-[360px] rounded-[16px] p-4 max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <p className="text-[16px] font-medium text-black">Select {fieldName}</p>
          <button onClick={onClose} className="text-[#e4572e] text-[20px] font-semibold">
            ×
          </button>
        </div>

        {/* Search Input */}
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

        {/* New Option Button */}
        <div className="flex-1 overflow-y-auto px-2 w-[308px] max-h-[390px] mb-4 shadow-md rounded-lg">
          <button
            onClick={handleAddNewClick}
            className="w-full h-[36px] px-3 flex items-center gap-2 hover:bg-[#f3f5f7] text-left mb-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-[12px] font-medium text-black">New {fieldName}</p>
          </button>

          {/* Existing Options - Filtered by search */}
          {filteredOptions.length > 0 && (
            <div className="space-y-2">
              {filteredOptions.map((option, index) => {
                const isSelected = selectedValue === option;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(option)}
                    className={`w-full h-[36px] rounded-[6px] px-3 flex items-center justify-between ${isSelected
                      ? 'bg-[#FFF3E0]'
                      : 'bg-white'
                      }`}
                  >
                    <p className="text-[12px] font-medium text-black">{option}</p>
                    {/* Radio Button */}
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {isSelected ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="9" stroke="gray" strokeWidth="2" fill="none" />
                          <circle cx="10" cy="10" r="4" fill="#e4572e" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {/* No results message */}
        {filteredOptions.length === 0 && options.length > 0 && searchQuery && (
          <p className="text-[12px] text-[#777777] text-center py-4">
            No {fieldName.toLowerCase()}s found matching "{searchQuery}". Add a new one above.
          </p>
        )}

        {options.length === 0 && (
          <p className="text-[12px] text-[#777777] text-center py-4">
            No {fieldName.toLowerCase()} options available. Add a new one above.
          </p>
        )}

      </div>
    </div>
  );
};

export default SelectOptionModal;


