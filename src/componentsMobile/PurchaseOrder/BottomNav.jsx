import React from 'react';

const BottomNav = ({ activeTab = 'home' }) => {
  const isHomeActive = activeTab === 'home';
  const homeIconColor = isHomeActive ? '#bf9853' : '#979ea3'; // Golden/orange when active
  
  return (
    <div className="fixed bottom-[9px] left-1/2 transform -translate-x-1/2 w-[362px] h-[60px] bg-white rounded-[10px] shadow-[3px_3px_16px_7px_rgba(0,0,0,0.12)]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex items-center justify-center gap-[27px] h-full px-[25.5px]">
        {/* Home */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="w-[20.426px] h-[22.532px] mb-0 flex items-center justify-center">
            <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* House base */}
              <path d="M3 9V20H9V14H14V20H20V9L11.5 2L3 9Z" stroke={homeIconColor} strokeWidth="1.5" fill="none" />
              {/* Upward arrow on roof */}
              <path d="M11.5 2L10 3.5L11.5 5L13 3.5L11.5 2Z" fill={homeIconColor} />
              {/* Windows - two square windows */}
              <rect x="6" y="11" width="2.5" height="2.5" fill={homeIconColor} />
              <rect x="14.5" y="11" width="2.5" height="2.5" fill={homeIconColor} />
            </svg>
          </div>
          <p className={`text-[10px] font-bold leading-normal mt-[2px] ${isHomeActive ? 'text-black' : 'text-[#979ea3]'}`}>
            Home
          </p>
        </div>

        {/* My Task */}
        <div className="flex flex-col items-center justify-center relative w-[102px]">
          <div className="w-[42px] h-[22px] mb-0 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Calendar icon with checkmark */}
              <rect x="3" y="4" width="16" height="15" rx="2" stroke="#979ea3" strokeWidth="1.5" fill="none" />
              <path d="M3 9H19" stroke="#979ea3" strokeWidth="1.5" />
              <path d="M7 5V2" stroke="#979ea3" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M15 5V2" stroke="#979ea3" strokeWidth="1.5" strokeLinecap="round" />
              {/* Checkmark */}
              <path d="M8 13L10 15L14 11" stroke="#979ea3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <p className="text-[10px] font-bold leading-normal mt-[2px] text-[#979ea3]">
            My Task
          </p>
        </div>

        {/* Search */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="w-[20.533px] h-[20.533px] mb-0 flex items-center justify-center">
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9.5" cy="9.5" r="6.5" stroke="#979ea3" strokeWidth="1.5" fill="none" />
              <path d="M15.5 15.5L19 19" stroke="#979ea3" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[10px] font-bold leading-normal mt-[2px] text-[#979ea3]">
            Search
          </p>
        </div>

        {/* PO Order */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="w-[50px] h-[19.884px] mb-0 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Shopping cart outline */}
              <path d="M2 2H4.5L6.5 13H15.5L17.5 6H6" stroke="#979ea3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="7.5" cy="16.5" r="1.5" stroke="#979ea3" strokeWidth="1.5" fill="none" />
              <circle cx="14.5" cy="16.5" r="1.5" stroke="#979ea3" strokeWidth="1.5" fill="none" />
              {/* Downward arrow inside cart */}
              <path d="M10 8V10M10 10L8.5 8.5M10 10L11.5 8.5" stroke="#979ea3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[10px] font-bold leading-normal mt-[2px] text-[#979ea3]">
            PO Order
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="w-[20.142px] h-[21.141px] mb-0 flex items-center justify-center">
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Grid of 4 circles (2x2) */}
              <circle cx="6" cy="6" r="2" fill="#979ea3" />
              <circle cx="15" cy="6" r="2" fill="#979ea3" />
              <circle cx="6" cy="15" r="2" fill="#979ea3" />
              <circle cx="15" cy="15" r="2" fill="#979ea3" />
            </svg>
          </div>
          <p className="text-[10px] font-bold leading-normal mt-[2px] text-[#979ea3]">
            Categories
          </p>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;

