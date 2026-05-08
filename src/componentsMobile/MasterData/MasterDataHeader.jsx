import React, { useState, useEffect, useRef } from 'react';
import Header from '../PurchaseOrder/Header';
import Kebab from '../Images/Kebab.svg';

const MasterDataTabs = ({ onMasterDataClick }) => {
  const tabsContainerRef = useRef(null);
  const activeTabRef = useRef(null);
  const dropdownRef = useRef(null);
  const kebabButtonRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
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
        setUnderlineStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width
        });
      } else {
        setUnderlineStyle({
          left: activeTabElement.offsetLeft,
          width: activeTabElement.offsetWidth
        });
      }
    }
  };

  useEffect(() => {
    updateUnderlinePosition();
    window.addEventListener('resize', updateUnderlinePosition);
    return () => window.removeEventListener('resize', updateUnderlinePosition);
  }, []);

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
        const container = kebabButtonRef.current.closest('.tools-tracker-tabs-container');
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

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    if (!isDropdownOpen && kebabButtonRef.current) {
      const buttonRect = kebabButtonRef.current.getBoundingClientRect();
      const container = kebabButtonRef.current.closest('.tools-tracker-tabs-container');
      const containerRect = container ? container.getBoundingClientRect() : null;
      setDropdownPosition({
        top: buttonRect.bottom + 5,
        right: containerRect ? Math.max(8, containerRect.right - buttonRect.right) : 16
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
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
      <div
        className="w-full max-w-[360px] pb-[6px] overflow-x-auto bg-white z-40 tools-tracker-tabs-container relative"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <div
          className="relative h-full pl-[12px] pr-[14px] flex items-center justify-start overflow-x-auto scrollbar-hide tools-tracker-tabs-scroll"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-[16px] h-full overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing tools-tracker-tabs-scroll pr-[20px]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              type="button"
              ref={activeTabRef}
              className="font-semibold text-[12px] leading-normal mt-[8px] whitespace-nowrap flex-shrink-0 text-black"
              onClick={onMasterDataClick}
            >
              Master Data
            </button>
          </div>
          <div
            ref={dropdownRef}
            className="absolute right-[-4px] top-0 bottom-0 flex items-center justify-center"
            style={{ zIndex: 31 }}
          >
            <button
              ref={kebabButtonRef}
              type="button"
              onClick={handleDropdownToggle}
              className="flex items-center justify-center w-[16px] h-[16px] cursor-pointer hover:opacity-70"
              style={{ marginTop: '8px', marginLeft: '8px' }}
            >
              <img src={Kebab} alt="More options" className="w-[16px] h-[16px]" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ backgroundColor: '#D9D9D9' }}>
          <div
            className="absolute bottom-0 h-[1.70px] transition-all duration-300"
            style={{
              backgroundColor: '#BF9853',
              left: `${Math.max(0, underlineStyle.left - 8)}px`,
              width: `${(underlineStyle.width > 0 ? underlineStyle.width : 72) + 16}px`
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
            width: '180px',
            maxWidth: '180px'
          }}
        >
          <button
            type="button"
            className="w-full text-left px-[10px] py-[8px] text-[12px] font-semibold text-black bg-[#E8E8E8]"
          >
            Master Data
          </button>
        </div>
      )}
    </>
  );
};

const MasterDataHeader = ({
  title = 'Master Data',
  showBack = true,
  showNotification = true,
  showProfile = true,
  user,
  onLogout,
  onMenuClick,
  showSubHeader,
  showDrillBackDownload,
  onDrillBack,
  onDrillDownload,
  customSubHeaderRow
}) => {
  if (!showSubHeader) {
    return (
      <Header
        title={title}
        showBack={showBack}
        showNotification={showNotification}
        showProfile={showProfile}
        user={user}
        onLogout={onLogout}
        onMenuClick={onMenuClick}
      />
    );
  }

  return (
    <Header
      title={title}
      showBack={showBack}
      showNotification={showNotification}
      showProfile={showProfile}
      user={user}
      onLogout={onLogout}
      onMenuClick={onMenuClick}
    >
      <MasterDataTabs onMasterDataClick={onDrillBack} />
      <div className="flex-shrink-0 flex w-full min-h-0 items-center justify-between border-b border-[#E0E0E0] pt-[8px] pb-[8px]  bg-white">
        {showDrillBackDownload ? (
          <>
            <button
              type="button"
              onClick={onDrillBack}
              className="flex items-center gap-[6px] text-[12px] font-medium text-black"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M5 9L2 6L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back</span>
            </button>
            <button type="button" onClick={onDrillDownload} className="text-[12px] font-semibold text-black">
              Download
            </button>
          </>
        ) : customSubHeaderRow ? (
          customSubHeaderRow
        ) : (
          <>
            <span className="inline-block min-w-[1px]" aria-hidden />
            <p className="text-[12px] font-semibold text-black leading-normal">Table</p>
          </>
        )}
      </div>
    </Header>
  );
};

export default MasterDataHeader;
