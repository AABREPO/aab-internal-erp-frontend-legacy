import React, { useState } from 'react';

const AddItemNameModal = ({ isOpen, onClose, onAdd, existingOptions = [] }) => {
  const [newItemName, setNewItemName] = useState('');

  const handleAdd = () => {
    if (newItemName.trim()) {
      const trimmedName = newItemName.trim();
      // Check if item name already exists
      if (existingOptions.includes(trimmedName)) {
        alert('This item name already exists!');
        return;
      }
      onAdd(trimmedName);
      setNewItemName('');
      onClose();
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
          <p className="text-[16px] font-medium text-black">Create Item Name</p>
          <button onClick={onClose} className="text-[#e4572e] text-[20px] font-semibold">
            ×
          </button>
        </div>

        {/* Item Name Input */}
        <div className="mb-4">
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            Item Name<span className="text-[#eb2f8e]">*</span>
          </p>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Type Item Name"
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
            disabled={!newItemName.trim()}
            className="flex-1 h-[44px] bg-black text-white rounded-[8px] text-[14px] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemNameModal;

