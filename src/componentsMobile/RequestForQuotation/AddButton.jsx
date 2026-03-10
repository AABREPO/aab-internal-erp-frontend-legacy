import React from 'react';
import FlottingButton from '../Images/Flotting Button Black.png'
import FlottingButtonWhite from '../Images/Flotting Button.png'
import New from '../Images/New.png'

const AddButton = ({ onClick, disabled = false, showNew = false }) => {
  return (
    <div 
      className={`fixed bottom-[110px] right-[24px] lg:right-[calc(60%-174px)] z-30 ${
        disabled ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'
      }`} 
      onClick={disabled ? undefined : onClick}
    >
      <div className={`${showNew ? 'px-4' : 'w-[80px]'} h-[80px] rounded-full flex items-center justify-center `}>
        {showNew ? (
          <span className="text-white text-[16px] font-medium flex items-center gap-2">
            <img src={New} alt="New" className="w-[80px] h-[35px]" />
          </span>
        ) : (
          <img src={disabled ? FlottingButtonWhite : FlottingButton} alt="+" className="w-[80px] h-[80px]" />
        )}
      </div>
    </div>
  );
};

export default AddButton;

