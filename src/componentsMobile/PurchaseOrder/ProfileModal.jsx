import React from 'react';

const ProfileModal = ({ user, isOpen, onClose, onLogout }) => {
  if (!isOpen || !user) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[12px] p-6 w-full max-w-[320px] mx-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            {user.userImage ? (
              <img 
                src={`data:image/jpeg;base64,${user.userImage}`} 
                alt={user.username || 'Profile'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <span className="text-white text-4xl font-semibold">
                  {user.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="text-center mb-6">
          <h2 className="text-[18px] font-semibold text-black mb-1">
            {user.username || 'User'}
          </h2>
          {user.position && (
            <p className="text-[14px] font-medium text-[#777777] mb-2">
              {user.position}
            </p>
          )}
          {user.email && (
            <p className="text-[12px] font-medium text-[#777777] break-words">
              {user.email}
            </p>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full h-[44px] bg-[#e4572e] text-white rounded-[8px] text-[14px] font-semibold hover:bg-[#cc4d26] transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;

