import React, { useState } from 'react';

const AddOptionModal = ({ isOpen, onClose, onAdd, existingOptions = [], fieldName = 'Option', onSave, selectedCategory = null }) => {
  const [newOption, setNewOption] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (newOption.trim()) {
      const trimmedOption = newOption.trim();
      // Check if option already exists
      if (existingOptions.includes(trimmedOption)) {
        alert(`This ${fieldName.toLowerCase()} already exists!`);
        return;
      }
      
      // If onSave is provided, call the API handler
      if (onSave) {
        setIsSaving(true);
        try {
          await onSave(trimmedOption, selectedCategory);
          // After successful save, call onAdd to update local state
          onAdd(trimmedOption);
          setNewOption('');
          onClose();
        } catch (error) {
          console.error('Error saving:', error);
          alert('Failed to save. Please try again.');
        } finally {
          setIsSaving(false);
        }
      } else {
        // Fallback to original behavior if no onSave handler
        onAdd(trimmedOption);
        setNewOption('');
        onClose();
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div 
        className="bg-white w-full max-w-[360px] rounded-[16px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <p className="text-[16px] font-medium text-black">Create {fieldName}</p>
          <button onClick={onClose} className="text-[#e4572e] text-[20px] font-semibold">
            ×
          </button>
        </div>

        {/* Option Input */}
        <div className="mb-4">
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            {fieldName}<span className="text-[#eb2f8e]">*</span>
          </p>
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={`Type ${fieldName}`}
            className="w-full h-[32px] border border-[#E0E0E0] rounded-[8px] px-3 text-[12px] font-medium text-black placeholder:text-[#9E9E9E] focus:outline-none"
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-[44px] border border-[#E0E0E0] rounded-[8px] text-[14px] font-semibold text-black hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!newOption.trim() || isSaving}
            className="flex-1 h-[44px] bg-black text-white rounded-[8px] text-[14px] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOptionModal;


