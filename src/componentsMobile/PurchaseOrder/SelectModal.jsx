import React, { useState, useEffect } from 'react';

const SelectModal = ({ isOpen, onClose, onSelect, onAddNew, selectedValue, fieldName, options = [] }) => {
  const [newOption, setNewOption] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset add input state and search when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setNewOption('');
      setShowAddInput(false);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  const handleSelect = (value) => {
    onSelect(value);
    onClose();
  };

  const handleAddNew = () => {
    if (newOption.trim()) {
      const value = newOption.trim();
      // Use onAddNew if provided, otherwise use onSelect
      if (onAddNew) {
        onAddNew(value);
      } else {
        onSelect(value);
      }
      setNewOption('');
      setShowAddInput(false);
      // Don't close the modal - let user close manually or by clicking outside
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white w-full rounded-tl-[16px] rounded-tr-[16px] p-6 max-h-[400px] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <p className="text-[16px] font-medium text-black">Select {fieldName}</p>
          <button onClick={onClose} className="text-[#e4572e] text-[14px] font-semibold underline">
            Cancel
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${fieldName.toLowerCase()}...`}
            className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] px-3 pr-10 text-[12px] font-medium text-black bg-white"
            autoFocus
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" />
              <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Add New Option Section */}
        {!showAddInput ? (
          <button
            onClick={() => setShowAddInput(true)}
            className="w-full h-[36px] rounded-[6px] px-3 mb-3 bg-[#f3f5f7] flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 3V11M3 7H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-[12px] font-medium text-black">Add New {fieldName}</p>
          </button>
        ) : (
          <div className="mb-3">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
              className="w-full h-[36px] border border-[rgba(0,0,0,0.16)] rounded-[6px] px-3 text-[12px] font-medium text-black bg-white mb-2"
              placeholder={`Enter new ${fieldName.toLowerCase()}`}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddNew}
                className="flex-1 h-[36px] rounded-[6px] bg-black text-white text-[12px] font-medium"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddInput(false);
                  setNewOption('');
                }}
                className="flex-1 h-[36px] rounded-[6px] border border-[#949494] text-[#363636] text-[12px] font-medium bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Existing Options - Filtered by search */}
        {filteredOptions.length > 0 && (
          <div className="space-y-2">
            {filteredOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(option)}
                className={`w-full h-[36px] rounded-[6px] px-3 flex items-center justify-between ${
                  selectedValue === option
                    ? 'bg-white border-[0.8px] border-[#26bf94]'
                    : 'bg-[#f3f5f7]'
                }`}
              >
                <p className="text-[12px] font-medium text-black">{option}</p>
                {selectedValue === option && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="6" stroke="#26bf94" strokeWidth="2" />
                    <path d="M4 7L6 9L10 5" stroke="#26bf94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {filteredOptions.length === 0 && options.length > 0 && searchQuery && (
          <p className="text-[12px] text-[#777777] text-center py-4">
            No {fieldName.toLowerCase()} found matching "{searchQuery}". Add a new one above.
          </p>
        )}

        {options.length === 0 && !showAddInput && (
          <p className="text-[12px] text-[#777777] text-center py-4">
            No {fieldName.toLowerCase()} options available. Add a new one above.
          </p>
        )}
      </div>
    </div>
  );
};

export default SelectModal;

