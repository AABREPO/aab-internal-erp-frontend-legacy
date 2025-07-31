import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import logo from '../Images/aablogo.png';
import Sidebar from './Sidebar';
import Logout from '../Images/Logout.png'
const Navbar = ({ username, userImage, position, email, onLogout , userRoles = []}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] = useState(false);
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  const [roleModels, setRoleModels] = useState([]);
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const response = await axios.get("https://backendaab.in/aabuilderDash/api/user_roles/all");
        const allRoles = response.data;
        const userRoleNames = userRoles.map(r => r.roles);
        const matchedRoles = allRoles.filter(role =>
          userRoleNames.includes(role.userRoles)
        );
        // Flatten all matched models
        const models = matchedRoles.flatMap(role => role.userModels || []);
        setRoleModels(models);

      } catch (error) {
        console.error("Error fetching user roles:", error);
      }
    };

    if (userRoles.length > 0) {
      fetchUserRoles();
    }
  }, [userRoles]);
  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };
  const handleClickOutside = (event) => {
    if (
      sidebarRef.current && !sidebarRef.current.contains(event.target) &&
      profileRef.current && !profileRef.current.contains(event.target)
    ) {
      setIsSidebarVisible(false);
      setIsProfileDropdownVisible(false);
    }
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <>
      <nav className="navbar fixed w-full top-0 z-10 bg-white h-14 shadow-md">
        <div className="flex justify-between items-center h-full px-4">
          {/* Left section */}
          <div className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="cursor-pointer w-[42px] h-[40px] rounded-full"
              onClick={toggleSidebar}
            />
            <p className="text-[#BF9853] ml-2 font-medium text-lg">BUILDERS</p>
          </div>
          {/* Right section */}
          <div className="relative flex items-center space-x-4" ref={profileRef}>
            {userImage ? (
              <img
                src={`data:image/jpeg;base64,${userImage}`}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onClick={() => setIsProfileDropdownVisible((prev) => !prev)}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold cursor-pointer"
                onClick={() => setIsProfileDropdownVisible((prev) => !prev)}
              >
                {username?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-gray-700 font-medium">{username}</span>
            <img
              src={Logout}
              alt="Logout"
              onClick={onLogout}
              className="w-8 h-8 cursor-pointer"
            />
            {/* Profile dropdown */}
            {isProfileDropdownVisible && (
              <div className="absolute right-0 top-14 bg-white shadow-lg rounded-md p-4 w-72 z-20">
                <div className="items-center">
                  {userImage ? (
                    <img
                      src={`data:image/jpeg;base64,${userImage}`}
                      alt="Profile"
                      className="w-64 h-64 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                      {username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{username}</p>
                    <p className="text-sm text-gray-500">{position}</p>
                  </div>
                </div>
                <p className="text-base text-gray-600 break-all">{email}</p>
              </div>
            )}
          </div>
        </div>
      </nav>
      <Sidebar isVisible={isSidebarVisible} sidebarRef={sidebarRef} userRoles={userRoles}/>
    </>
  );
};
export default Navbar;