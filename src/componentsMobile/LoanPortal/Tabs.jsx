import React, { useRef, useEffect, useState } from 'react';
import Kebab from '../Images/Kebab.svg';

const Tabs = ({ activeTab = 'loanform', onTabChange }) => {
  const tabs = [
    { id: 'loanform', label: 'Loan' },
    { id: 'history', label: 'History' },
    { id: 'report', label: 'Report' },
    { id: 'summary', label: 'Summary' }
  ];
  const tabsContainerRef = useRef(null);
  const activeTabRef = useRef(null);
  const fixedContainerRef = useRef(null);
  const dropdownRef = useRef(null);
  const kebabButtonRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  const updateUnderlinePosition = () => {
    if (activeTabRef.current && fixedContainerRef.current) {
      const fixedContainer = fixedContainerRef.current;
      const activeTabElement = activeTabRef.current;
      const containerRect = fixedContainer.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      const left = tabRect.left - containerRect.left;
      const width = tabRect.width;
      setUnderlineStyle({ left, width });
    }
  };

  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current && fixedContainerRef.current) {
      const container = tabsContainerRef.current;
      const activeTabElement = activeTabRef.current;
      updateUnderlinePosition();
      const tabLeft = activeTabElement.offsetLeft;
      const tabWidth = activeTabElement.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
      const handleScroll = () => {
        updateUnderlinePosition();
      };
      container.addEventListener('scroll', handleScroll);
      const timeoutId = setTimeout(() => {
        updateUnderlinePosition();
      }, 350);
      window.addEventListener('resize', updateUnderlinePosition);
      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', updateUnderlinePosition);
        clearTimeout(timeoutId);
      };
    }
  }, [activeTab]);

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
      <style>{`
        .loan-portal-tabs-container::-webkit-scrollbar,
        .loan-portal-tabs-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .loan-portal-tabs-container,
        .loan-portal-tabs-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div ref={fixedContainerRef} className="fixed top-[50px] transform w-full max-w-[360px] h-[38px] overflow-x-auto bg-white loan-portal-tabs-container" style={{ fontFamily: "'Manrope', sans-serif", zIndex: 30 }}>
        <div className="relative h-full px-[16px] pr-[24px] overflow-x-auto scrollbar-hide loan-portal-tabs-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div 
            ref={tabsContainerRef}
            className="flex items-center gap-[16px] h-full overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing loan-portal-tabs-scroll"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingRight: '5px' }}
            onMouseDown={(e) => {
              setIsDragging(true);
              setStartX(e.pageX - tabsContainerRef.current.offsetLeft);
              setScrollLeft(tabsContainerRef.current.scrollLeft);
            }}
            onMouseLeave={() => setIsDragging(false)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={(e) => {
              if (!isDragging) return;
              e.preventDefault();
              const x = e.pageX - tabsContainerRef.current.offsetLeft;
              const walk = (x - startX) * 2;
              tabsContainerRef.current.scrollLeft = scrollLeft - walk;
            }}
            onTouchStart={(e) => {
              setIsDragging(true);
              setStartX(e.touches[0].pageX - tabsContainerRef.current.offsetLeft);
              setScrollLeft(tabsContainerRef.current.scrollLeft);
            }}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={(e) => {
              if (!isDragging) return;
              const x = e.touches[0].pageX - tabsContainerRef.current.offsetLeft;
              const walk = (x - startX) * 2;
              tabsContainerRef.current.scrollLeft = scrollLeft - walk;
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                ref={activeTab === tab.id ? activeTabRef : null}
                onClick={() => onTabChange(tab.id)}
                className={`font-semibold text-[12px] leading-normal mt-[8px] whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id ? 'text-black' : 'text-[#848484]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div ref={dropdownRef} className="absolute right-[-4px] top-0 bottom-0 flex items-center justify-center" style={{ zIndex: 31 }}>
          <button
            ref={kebabButtonRef}
            onClick={handleDropdownToggle}
            className="flex items-center justify-center w-[16px] h-[16px] cursor-pointer hover:opacity-7 "
            style={{ marginTop: '8px', marginLeft: '8px' }}
          >
            <img src={Kebab} alt="Kebab" className="w-[16px] h-[16px]" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ backgroundColor: '#D9D9D9' }}>
          <div 
            className="absolute bottom-0 h-[1.70px] transition-all duration-300"
            style={{ 
              backgroundColor: '#BF9853',
              left: `${Math.max(0, underlineStyle.left - 8)}px`,
              width: `${underlineStyle.width + 16}px`
            }}
          ></div>
        </div>
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
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleMenuItemClick(tab.id)}
              className={`w-full text-left px-[16px] py-[8px] text-[12px] font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-black bg-[#E8E8E8]'
                  : 'text-[#333333] hover:bg-[#E8E8E8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default Tabs;
