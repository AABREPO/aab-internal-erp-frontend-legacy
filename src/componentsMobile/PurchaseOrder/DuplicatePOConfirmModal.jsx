import React from 'react';

const DuplicatePOConfirmModal = ({ isOpen, onCancel, onConfirm, previousPONumber }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      style={{ fontFamily: "'Manrope', sans-serif" }}
      onClick={onCancel}
    >
      <div className="bg-white w-[320px] rounded-[6px] p-6 relative flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()} >
        <div className="w-[48px] h-[48px] mb-4">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C12.954 4 4 12.954 4 24C4 35.046 12.954 44 24 44C35.046 44 44 35.046 44 24C44 12.954 35.046 4 24 4ZM24 40C15.163 40 8 32.837 8 24C8 15.163 15.163 8 24 8C32.837 8 40 15.163 40 24C40 32.837 32.837 40 24 40Z" fill="#e4572e"/>
            <path d="M24 14V24M24 32H24.02" stroke="#e4572e" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>        
        <p className="text-[18px] font-semibold text-black mb-2 text-center">Duplicate PO Detected</p>
        <p className="text-[12px] font-medium text-[#848484] text-center mb-6 px-4">
          This PO contains the same items as the previous PO (PO #{previousPONumber || 'N/A'}) for this vendor and project.
        </p>
        <p className="text-[12px] font-medium text-[#848484] text-center mb-6 px-4">
          Do you want to create this duplicate PO?
        </p>
        <div className="flex gap-4">
          <button onClick={onCancel} 
            className="w-[132px] h-[40px] border border-black rounded-[8px] text-[14px] font-bold text-black hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button onClick={onConfirm} 
            className="w-[132px] h-[40px] bg-black border border-[#f4ede2] rounded-[8px] text-[14px] font-bold text-white hover:bg-gray-800 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
export default DuplicatePOConfirmModal;