import React from 'react';

const DeleteConfirmModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-[320px] h-[240px] rounded-[6px] p-6 relative flex flex-col items-center justify-center">
        <div className="w-[48px] h-[55.295px] mb-4">
          <svg width="48" height="55" viewBox="0 0 48 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 0C10.745 0 0 10.745 0 24C0 37.255 10.745 48 24 48C37.255 48 48 37.255 48 24C48 10.745 37.255 0 24 0ZM24 44C13.507 44 4 34.493 4 24C4 13.507 13.507 4 24 4C34.493 4 44 13.507 44 24C44 34.493 34.493 44 24 44Z" fill="#e4572e"/>
            <path d="M24 12V24M24 32H24.02" stroke="#e4572e" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>        
        <p className="text-[18px] font-semibold text-black mb-2">Confirm Delete?</p>
        <p className="text-[12px] font-medium text-[#848484] text-center mb-6 px-4">
          Do you Want to Confirm Delete Item From this Table
        </p>        
        <div className="flex gap-4">
          <button onClick={onCancel} className="w-[132px] h-[40px] border border-black rounded-[8px] text-[14px] font-bold text-black">
            Cancel
          </button>
          <button onClick={onConfirm} className="w-[132px] h-[40px] bg-black border border-[#f4ede2] rounded-[8px] text-[14px] font-bold text-white">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
export default DeleteConfirmModal;