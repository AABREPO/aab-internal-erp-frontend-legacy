import React from 'react';

const AddButton = ({ onClick, disabled = false, showNew = false }) => {
  return (
    <div 
      className={`fixed bottom-[110px] right-[24px] lg:right-[calc(50%-164px)] z-30 ${
        disabled ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'
      }`} 
      onClick={disabled ? undefined : onClick}
    >
      <div className={`${showNew ? 'px-4' : 'w-[48px]'} h-[43px] rounded-full flex items-center justify-center ${
        disabled ? 'bg-gray-400' : 'bg-black'
      }`}>
        {showNew ? (
          <span className="text-white text-[16px] font-medium flex items-center gap-3">
            <span className="text-[30px]">+</span>
            <span>New</span>
          </span>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default AddButton;

