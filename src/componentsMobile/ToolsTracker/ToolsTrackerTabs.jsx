import React, { useRef, useEffect, useState } from 'react';

const ToolsTrackerTabs = ({ activeTab = 'entry', onTabChange }) => {
  const tabs = [
    { id: 'transfer', label: 'Transfer' },
    { id: 'history', label: 'History' },
    { id: 'pending-items', label: 'Pending Items' },
    { id: 'add-input', label: 'AddInput' },
    { id: 'net-stock', label: 'Net Stock' },
    { id: 'tools-history', label: 'Tools History' },
    { id: 'service-history', label: 'Service' }
  ];
  const dropdownMenuItems = [
    { id: 'transfer', label: 'Transfer' },
    { id: 'history', label: 'History' },
    { id: 'pending-items', label: 'Pending Items' },
    { id: 'add-input', label: 'AddInput' },
    { id: 'net-stock', label: 'Net Stock' },
    { id: 'tools-history', label: 'Tools History' },
    { id: 'service-history', label: 'Service' }
  ];
  const tabsContainerRef = useRef(null);
  const activeTabRef = useRef(null);
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
    if (activeTabRef.current && tabsContainerRef.current) {
      const container = tabsContainerRef.current;
      const activeTabElement = activeTabRef.current;
      const outerContainer = container.closest('.tools-tracker-tabs-container');
      if (outerContainer) {
        const containerRect = outerContainer.getBoundingClientRect();
        const tabRect = activeTabElement.getBoundingClientRect();
        const left = tabRect.left - containerRect.left;
        const width = tabRect.width;
        setUnderlineStyle({ left, width });
      } else {
        const left = activeTabElement.offsetLeft;
        const width = activeTabElement.offsetWidth;
        setUnderlineStyle({ left, width });
      }
    }
  };
  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
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
          right: Math.max(8, window.innerWidth - buttonRect.right)
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
        right: Math.max(8, window.innerWidth - buttonRect.right)
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
        .tools-tracker-tabs-container::-webkit-scrollbar,
        .tools-tracker-tabs-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .tools-tracker-tabs-container,
        .tools-tracker-tabs-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="fixed top-[50px] transform w-full max-w-[357px] h-[40px] overflow-x-auto bg-white z-40 tools-tracker-tabs-container" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <div className="relative h-full px-4 pr-7 overflow-x-auto scrollbar-hide tools-tracker-tabs-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-4 h-full overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing tools-tracker-tabs-scroll"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
                className={`font-semibold text-[12px] leading-normal mt-[8px] whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'text-black' : 'text-[#848484]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div ref={dropdownRef} className="absolute right-1 top-1/2 transform -translate-y-1/2" style={{ zIndex: 31 }}>
            <button ref={kebabButtonRef} onClick={handleDropdownToggle}
              className="w-[20px] h-[20px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity bg-white pointer-events-auto"
            >
              <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="2" cy="2" r="1.5" fill="#000" />
                <circle cx="2" cy="8" r="1.5" fill="#000" />
                <circle cx="2" cy="14" r="1.5" fill="#000" />
              </svg>
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ backgroundColor: '#D9D9D9' }}>
          <div
            className="absolute bottom-0 h-[1.70px] transition-all duration-300"
            style={{
              backgroundColor: '#BF9853',
              left: `${underlineStyle.left}px`,
              width: `${underlineStyle.width}px`
            }}
          ></div>
        </div>
      </div>
      {isDropdownOpen && (
        <div 
          ref={dropdownMenuRef}
          className="fixed bg-white rounded-lg shadow-lg py-2" 
          style={{ 
            zIndex: 9999,
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            width: '180px',
            maxWidth: '180px'
          }}
        >
          {dropdownMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`w-full text-left px-4 py-2 text-[12px] font-semibold transition-colors ${
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
export default ToolsTrackerTabs;