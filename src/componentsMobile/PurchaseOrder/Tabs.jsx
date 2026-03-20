import React, { useRef, useEffect, useState } from 'react';
import Kebab from '../Images/Kebab.svg';

const Tabs = ({ activeTab = 'create', onTabChange }) => {
  const dropdownMenuItems = [
    { id: 'create', label: 'Create PO' },
    { id: 'history', label: 'History' },
    { id: 'input', label: 'Input Data' },
    { id: 'summary', label: 'Summary' }
  ];
  const tabsContainerRef = useRef(null);
  const activeTabRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const kebabButtonRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

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
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    const updateDropdownPosition = () => {
      if (isDropdownOpen && kebabButtonRef.current) {
        const buttonRect = kebabButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: buttonRect.bottom + 5,
          right: window.innerWidth - buttonRect.right
        });
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);
      updateDropdownPosition();
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    updateUnderlinePosition();
    window.addEventListener('resize', updateUnderlinePosition);
    return () => {
      window.removeEventListener('resize', updateUnderlinePosition);
    };
  }, [activeTab]);

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    if (!isDropdownOpen && kebabButtonRef.current) {
      const buttonRect = kebabButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + 5,
        right: window.innerWidth - buttonRect.right
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuItemClick = (tabId) => {
    onTabChange(tabId);
    setIsDropdownOpen(false);
  };
  return (
    <>
    <div ref={tabsContainerRef} className="fixed top-[50px] left-1/2 transform -translate-x-1/2 w-full max-w-[360px] h-[38px] bg-white z-40 purchase-order-tabs-container" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex items-center justify-between px-[14px] pr-[14px] h-full relative">
        <div className="flex gap-[16px]">
          <button
            ref={activeTab === 'create' ? activeTabRef : null}
            onClick={() => onTabChange('create')}
            className={`font-semibold text-[12px] leading-normal mt-[8px] whitespace-nowrap flex-shrink-0 ${
              activeTab === 'create' ? 'text-black' : 'text-[#848484]'
            }`}
          >
            Create PO
          </button>
          <button
            ref={activeTab === 'history' ? activeTabRef : null}
            onClick={() => onTabChange('history')}
            className={`font-semibold text-[12px] leading-normal mt-[8px] whitespace-nowrap flex-shrink-0 ${
              activeTab === 'history' ? 'text-black' : 'text-[#848484]'
            }`}
          >
            History
          </button>
          <button
            ref={activeTab === 'input' ? activeTabRef : null}
            onClick={() => onTabChange('input')}
            className={`font-semibold text-[12px] leading-normal mt-[8px] whitespace-nowrap flex-shrink-0 ${
              activeTab === 'input' ? 'text-black' : 'text-[#848484]'
            }`}
          >
            Input Data
          </button>
          <button
            ref={activeTab === 'summary' ? activeTabRef : null}
            onClick={() => onTabChange('summary')}
            className={`font-semibold text-[12px] leading-normal mt-[8px] whitespace-nowrap flex-shrink-0 ${
              activeTab === 'summary' ? 'text-black' : 'text-[#848484]'
            }`}
          >
            Summary
          </button>
        </div>
        
        {/* Three dots menu button */}
        <div ref={dropdownRef} className="absolute right-[-4px] top-0 bottom-0 flex items-center justify-center" style={{ zIndex: 31 }}>
          <button ref={kebabButtonRef} onClick={handleDropdownToggle}
            className="flex items-center justify-center w-[16px] h-[16px] cursor-pointer hover:opacity-7 " style={{ marginTop: '8px', marginLeft: '8px' }}
          >
            <img src={Kebab} alt="Kebab" className="w-[16px] h-[16px]" />
          </button>
        </div>
      </div>
      
      {/* Base border line in gray */}
      <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ backgroundColor: '#D9D9D9' }}>
      </div>
      {/* Active tab underline in golden-brown (matches ToolsTracker extension: +8px on both sides). */}
      <div
        className="absolute bottom-0 h-[1.70px] transition-all duration-300"
        style={{
          backgroundColor: '#BF9853',
          left: `${Math.max(0, underlineStyle.left - 8)}px`,
          width: `${underlineStyle.width + 16}px`
        }}
      />
    </div>
    {isDropdownOpen && (
      <div 
        ref={dropdownMenuRef}
        className="fixed bg-white rounded-lg shadow-lg py-[8px]" 
        style={{ 
          zIndex: 9999,
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
          width: '140px',
          maxWidth: '140px'
        }}
      >
        {dropdownMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuItemClick(item.id)}
            className={`w-full text-left px-[16px] py-[8px] text-[12px] font-semibold transition-colors ${
              activeTab === item.id 
                ? 'text-black bg-[#E8E8E8]' 
                : 'text-[#333333] hover:bg-[#E8E8E8]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    )}
    </>
  );
};

export default Tabs;

