import React, { useRef, useEffect, useState } from 'react';

const InventoryTabs = ({ activeTab = 'net-stock', onTabChange }) => {
  const tabs = [
    { id: 'outgoing', label: 'Outgoing' },
    { id: 'incoming', label: 'Incoming' }, 
    { id: 'project-usage-report', label: 'Project Usage Report' },
    { id: 'net-stock', label: 'Net Stock' },
    { id: 'history', label: 'History' },
    { id: 'add-input', label: 'Add Input' },
    { id: 'incoming-tracker', label: 'Incoming Tracker' },
    { id: 'project-usage-history', label: 'Project Usage History' },
    { id: 'non-po-history', label: 'Non PO History' }
  ];

  const tabsContainerRef = useRef(null);
  const activeTabRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const updateUnderlinePosition = () => {
    if (activeTabRef.current && tabsContainerRef.current) {
      const container = tabsContainerRef.current;
      const activeTabElement = activeTabRef.current;
      
      // Get the exact position relative to the fixed container
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      // Calculate position relative to the fixed container
      const left = tabRect.left - containerRect.left;
      const width = tabRect.width;
      
      setUnderlineStyle({ left, width });
    }
  };

  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      const container = tabsContainerRef.current;
      const activeTabElement = activeTabRef.current;
      
      // Initial position update
      updateUnderlinePosition();
      
      // Scroll to center the active tab
      const tabLeft = activeTabElement.offsetLeft;
      const tabWidth = activeTabElement.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });

      // Update position on scroll
      const handleScroll = () => {
        updateUnderlinePosition();
      };

      container.addEventListener('scroll', handleScroll);
      
      // Update after scroll animation completes
      const timeoutId = setTimeout(() => {
        updateUnderlinePosition();
      }, 350);

      // Also update on window resize
      window.addEventListener('resize', updateUnderlinePosition);

      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', updateUnderlinePosition);
        clearTimeout(timeoutId);
      };
    }
  }, [activeTab]);

  return (
    <div className="fixed top-[50px] transform  w-full max-w-[340px] h-[40px] overflow-x-auto bg-white z-40" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="relative h-full overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div 
          ref={tabsContainerRef}
          className="flex items-center gap-4 px-4 h-full overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
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
              className={`font-semibold text-[12px] leading-normal whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id ? 'text-black' : 'text-[#848484]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Three dots menu button */}
        <button className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity bg-white z-10 pointer-events-auto">
          <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="2" cy="2" r="1.5" fill="#000"/>
            <circle cx="2" cy="8" r="1.5" fill="#000"/>
            <circle cx="2" cy="14" r="1.5" fill="#000"/>
          </svg>
        </button>
      </div>
      
      {/* Base border line in gray */}
      <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ backgroundColor: '#D9D9D9' }}>
        {/* Active tab underline - positioned exactly below the clicked heading */}
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
  );
};

export default InventoryTabs;

