import React, { useEffect, useRef, useState } from 'react';
import Kebab from '../Images/Kebab.svg';

const TAB_ITEMS = [
  { id: 'advance', label: 'Advance' },
  { id: 'history', label: 'History' },
  { id: 'report', label: 'Report' },
  { id: 'summary', label: 'Summary' }
];

const StaffAdvanceTabs = ({ activeTab = 'advance', onTabChange, embedded = false }) => {
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
      const outerContainer = container.closest('.staff-advance-tabs-container');
      if (outerContainer) {
        const containerRect = outerContainer.getBoundingClientRect();
        const tabRect = activeTabElement.getBoundingClientRect();
        setUnderlineStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width
        });
        return;
      }

      setUnderlineStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth
      });
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
      const nextScrollLeft = tabLeft - containerWidth / 2 + tabWidth / 2;

      container.scrollTo({
        left: nextScrollLeft,
        behavior: 'smooth'
      });

      const handleScroll = () => updateUnderlinePosition();
      container.addEventListener('scroll', handleScroll);
      const timeoutId = setTimeout(() => updateUnderlinePosition(), 350);
      window.addEventListener('resize', updateUnderlinePosition);

      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', updateUnderlinePosition);
        clearTimeout(timeoutId);
      };
    }

    return undefined;
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
        const container = kebabButtonRef.current.closest('.staff-advance-tabs-container');
        const containerRect = container ? container.getBoundingClientRect() : null;

        setDropdownPosition({
          top: buttonRect.bottom + 5,
          right: containerRect ? Math.max(8, containerRect.right - buttonRect.right) : 16
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

  const handleDropdownToggle = (event) => {
    event.stopPropagation();
    if (!isDropdownOpen && kebabButtonRef.current) {
      const buttonRect = kebabButtonRef.current.getBoundingClientRect();
      const container = kebabButtonRef.current.closest('.staff-advance-tabs-container');
      const containerRect = container ? container.getBoundingClientRect() : null;

      setDropdownPosition({
        top: buttonRect.bottom + 5,
        right: containerRect ? Math.max(8, containerRect.right - buttonRect.right) : 16
      });
    }
    setIsDropdownOpen((previousState) => !previousState);
  };

  const handleMenuItemClick = (tabId) => {
    onTabChange(tabId);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <style>{`
        .staff-advance-tabs-container::-webkit-scrollbar,
        .staff-advance-tabs-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .staff-advance-tabs-container,
        .staff-advance-tabs-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div
        className={`w-full max-w-[360px] pb-[6px] overflow-x-auto bg-white z-40 staff-advance-tabs-container ${
          embedded ? 'relative' : 'fixed transform'
        }`}
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <div
          className="relative px-2 h-full pr-[4px] flex items-center justify-start scrollbar-hide staff-advance-tabs-scroll"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-[14px] h-full overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing staff-advance-tabs-scroll pr-[20px]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseDown={(event) => {
              setIsDragging(true);
              setStartX(event.pageX - tabsContainerRef.current.offsetLeft);
              setScrollLeft(tabsContainerRef.current.scrollLeft);
            }}
            onMouseLeave={() => setIsDragging(false)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={(event) => {
              if (!isDragging) return;
              event.preventDefault();
              const currentX = event.pageX - tabsContainerRef.current.offsetLeft;
              const walk = (currentX - startX) * 2;
              tabsContainerRef.current.scrollLeft = scrollLeft - walk;
            }}
            onTouchStart={(event) => {
              setIsDragging(true);
              setStartX(event.touches[0].pageX - tabsContainerRef.current.offsetLeft);
              setScrollLeft(tabsContainerRef.current.scrollLeft);
            }}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={(event) => {
              if (!isDragging) return;
              const currentX = event.touches[0].pageX - tabsContainerRef.current.offsetLeft;
              const walk = (currentX - startX) * 2;
              tabsContainerRef.current.scrollLeft = scrollLeft - walk;
            }}
          >
            {TAB_ITEMS.map((tab) => (
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
          <div
            ref={dropdownRef}
            className="absolute right-[-4px] top-0 bottom-0 flex items-center justify-center"
            style={{ zIndex: 31 }}
          >
            <button
              ref={kebabButtonRef}
              onClick={handleDropdownToggle}
              className="flex items-center justify-center w-[16px] h-[16px] cursor-pointer"
              style={{ marginTop: '8px', marginLeft: '8px' }}
            >
              <img src={Kebab} alt="More tabs" className="w-[16px] h-[16px]" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ backgroundColor: '#D9D9D9' }}>
          <div
            className="absolute bottom-0 h-[1.70px] transition-all duration-300"
            style={{
              backgroundColor: '#BF9853',
              left: `${Math.max(0, underlineStyle.left - 8)}px`,
              width: `${underlineStyle.width + 16}px`
            }}
          />
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
            width: '156px',
            maxWidth: '156px'
          }}
        >
          {TAB_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`w-full text-left px-[16px] py-[8px] text-[12px] font-semibold transition-colors ${
                activeTab === item.id ? 'text-black bg-[#E8E8E8]' : 'text-[#333333] hover:bg-[#E8E8E8]'
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

export default StaffAdvanceTabs;
