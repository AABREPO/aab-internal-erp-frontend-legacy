import React from 'react';

const Tabs = ({ activeTab = 'create', onTabChange }) => {
  return (
    <div className="fixed top-[50px] left-1/2 transform -translate-x-1/2 w-full max-w-[360px] h-[40px] bg-white z-40" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex items-center justify-between px-4 h-full relative">
        <div className="flex gap-6">
          <button
            onClick={() => onTabChange('create')}
            className={`font-semibold text-[12px] leading-normal whitespace-nowrap ${
              activeTab === 'create' ? 'text-black' : 'text-[#848484]'
            }`}
          >
            Create PO
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`font-semibold text-[12px] leading-normal whitespace-nowrap ${
              activeTab === 'history' ? 'text-black' : 'text-[#848484]'
            }`}
          >
            History
          </button>
          <button
            onClick={() => onTabChange('input')}
            className={`font-semibold text-[12px] leading-normal whitespace-nowrap ${
              activeTab === 'input' ? 'text-black' : 'text-[#848484]'
            }`}
          >
            Input Data
          </button>
          <button
            onClick={() => onTabChange('summary')}
            className={`font-semibold text-[12px] leading-normal whitespace-nowrap ${
              activeTab === 'summary' ? 'text-black' : 'text-[#848484]'
            }`}
          >
            Summary
          </button>
        </div>
        
        {/* Three dots menu button */}
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity">
          <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="2" cy="2" r="1.5" fill="#000"/>
            <circle cx="2" cy="8" r="1.5" fill="#000"/>
            <circle cx="2" cy="14" r="1.5" fill="#000"/>
          </svg>
        </button>
      </div>
      
      {/* Base border line in gray */}
      <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ backgroundColor: '#D9D9D9' }}>
      
      {/* Active tab underline in golden-brown, centered on the active tab */}
      {activeTab === 'create' && (
        <div className="absolute bottom-0 left-[4%] w-[16%] h-[1.70px]" style={{ backgroundColor: '#BF9853' }}></div>
      )}
      {activeTab === 'history' && (
        <div className="absolute bottom-0 left-[26%] w-[16%] h-[1.70px]" style={{ backgroundColor: '#BF9853' }}></div>
      )}
      {activeTab === 'input' && (
        <div className="absolute bottom-0 left-[45%] w-[16%] h-[1.70px]" style={{ backgroundColor: '#BF9853' }}></div>
      )}
      {activeTab === 'summary' && (
        <div className="absolute bottom-0 left-[68%] w-[16%] h-[1.70px]" style={{ backgroundColor: '#BF9853' }}></div>
      )}
      </div>
    </div>
  );
};

export default Tabs;

