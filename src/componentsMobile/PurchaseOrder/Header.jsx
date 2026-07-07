import React, { useState } from 'react';
import ProfileModal from './ProfileModal';
import Notification from '../Images/Notofocation off.svg'

const Header = ({ title = "Purchase Order", showBack = true, showNotification = true, showProfile = true, user, onLogout, onMenuClick, children }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleProfileClick = () => {
    if (user) {
      setShowProfileModal(true);
    }
  };
  const handleLogout = () => {
    setShowProfileModal(false);
    if (onLogout) {
      onLogout();
    }
  };
  return (
    <>
      <div className={`fixed top-[0px] left-1/2 transform -translate-x-1/2 w-full max-w-[360px] bg-white z-50 ${children ? '' : 'h-[56px]'}`} style={{ fontFamily: "'Manrope', sans-serif" }}>
        <div className="relative flex items-center justify-between border-b-[4px] border-[#F8F8F8] h-[56px] box-border">
          {/* Hamburger menu button */}
          <div className="flex items-center gap-[12px]">
            {showBack && (
              <div
                className="w-[18px] h-[14px] cursor-pointer flex items-center"
                onClick={onMenuClick}
              >
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1H17M1 7H17M1 13H17" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            {/* Title */}
            <div className="flex items-center">
              <p className="absolute font-semibold text-[14px] text-black leading-normal">
                {title}
              </p>
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-[16px]">
            {showNotification && (
              <div className="w-[18.945px] h-[19.97px] cursor-pointer flex items-center">
                <img src={Notification} alt="Notification" className="w-[20px] h-[20px]" />
              </div>
            )}

            {showProfile && (
              <div className="relative">
                <div
                  className="w-[31.66px] h-[31.66px] rounded-full cursor-pointer overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                  onClick={handleProfileClick}
                >
                  {user?.userImage ? (
                    <img
                      src={
                        user.userImage.startsWith('http') || user.userImage.startsWith('data:')
                          ? user.userImage
                          : `data:image/jpeg;base64,${user.userImage}`
                      }
                      alt={user.username || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {children}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        user={user}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Header;

