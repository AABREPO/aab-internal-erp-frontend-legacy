import React, { useState } from 'react';
import ProfileModal from './ProfileModal';

const Header = ({ title = "Purchase Order", showBack = true, showNotification = true, showProfile = true, user, onLogout, onMenuClick  }) => {
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
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[400px] h-[50px] bg-white z-40" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <div className="relative flex items-center justify-between px-4 h-full">
          {/* Hamburger menu button */}
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
          <p className="absolute left-[105px] transform -translate-x-1/2 font-semibold text-[14px] text-black leading-normal">
            {title}
          </p>

          {/* Right side icons */}
          <div className="flex items-center gap-3 ml-auto">
            {showNotification && (
              <div className="w-[18.945px] h-[19.97px] cursor-pointer flex items-center">
                <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.5 2C6.19 2 3.5 4.69 3.5 8V12L1 15V16H18V15L15.5 12V8C15.5 4.69 12.81 2 9.5 2Z" stroke="black" strokeWidth="1.5" />
                  <circle cx="15" cy="4" r="3" fill="#e4572e" />
                </svg>
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
                      src={`data:image/jpeg;base64,${user.userImage}`} 
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

