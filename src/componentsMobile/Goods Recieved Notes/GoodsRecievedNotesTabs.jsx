import React, { useRef, useEffect, useState } from 'react';
import Kebab from '../Images/Kebab.svg';

const GoodsRecievedNotesTabs = ({
  activeTab = 'create',
  onTabChange,
  leftLabel = 'Engineer',
  rightLabel = 'Vendor',
  onLeftClick,
  onRightClick
}) => {
  const tabsContainerRef = useRef(null);
  const activeTabRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const updateUnderlinePosition = () => {
    if (activeTabRef.current && tabsContainerRef.current) {
      const containerRect = tabsContainerRef.current.getBoundingClientRect();
      const tabRect = activeTabRef.current.getBoundingClientRect();
      const left = tabRect.left - containerRect.left;
      const width = tabRect.width;
      setUnderlineStyle({ left, width });
    }
  };

  useEffect(() => {
    updateUnderlinePosition();
    window.addEventListener('resize', updateUnderlinePosition);
    return () => {
      window.removeEventListener('resize', updateUnderlinePosition);
    };
  }, [activeTab]);

  return (
    <div className="bg-white">
      <div
        ref={tabsContainerRef}
        className="relative h-[32px] border-b border-[#D9D9D9]"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <div className="flex items-center justify-between px-[14px] pr-[14px] h-full">
          <div className="flex gap-[16px]">
            <button
              ref={activeTab === 'create' ? activeTabRef : null}
              type="button"
              onClick={() => onTabChange('create')}
              className={`relative text-[12px] font-semibold leading-normal mt-[2px] whitespace-nowrap flex-shrink-0 ${activeTab === 'create' ? 'text-black' : 'text-[#848484]'}`}
            >
              Create
            </button>
            <button
              ref={activeTab === 'verify' ? activeTabRef : null}
              type="button"
              onClick={() => onTabChange('verify')}
              className={`relative text-[12px] font-semibold leading-normal mt-[2px] whitespace-nowrap flex-shrink-0 ${activeTab === 'verify' ? 'text-black' : 'text-[#848484]'}`}
            >
              Verify
            </button>
          </div>
          <button type="button" onClick={() => {}} className="flex items-center justify-center w-[16px] h-[16px]" style={{ marginTop: '8px', marginLeft: '8px' }}>
            <img src={Kebab} alt="More" className="w-[16px] h-[16px]" />
          </button>
        </div>
        <div
          className="absolute bottom-0 h-[1.70px] transition-all duration-300"
          style={{
            backgroundColor: '#BF9853',
            left: `${Math.max(0, underlineStyle.left - 8)}px`,
            width: `${underlineStyle.width + 16}px`
          }}
        />
      </div>
      <div className="flex items-center justify-between py-[8px] border-b border-[#E0E0E0]">
        <button
          type="button"
          onClick={onLeftClick}
          className={`text-[12px] font-semibold leading-normal ${onLeftClick ? 'text-black' : 'text-black cursor-default'}`}
        >
          {leftLabel}
        </button>
        <button
          type="button"
          onClick={onRightClick}
          className={`text-[12px] font-semibold leading-normal ${onRightClick ? 'text-black' : 'text-black cursor-default'}`}
        >
          {rightLabel}
        </button>
      </div>
    </div>
  );
};

export default GoodsRecievedNotesTabs;
