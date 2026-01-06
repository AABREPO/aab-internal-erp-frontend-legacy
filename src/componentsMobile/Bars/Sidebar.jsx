import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../Images/AABBlack.png'

const Sidebar = ({ isOpen, onClose, onNavigate, currentPage, userRoles = [] }) => {
  const [expandedItems, setExpandedItems] = useState({
    procurement: currentPage === 'purchase-order' || currentPage === 'inventory'
  });
  const [roleModels, setRoleModels] = useState([]);
  const buildTime = process.env.REACT_APP_BUILD_TIME;
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

  // Utility to check if user has access to a model
  const hasAccessToModel = (modelName) => {
    return roleModels.some(model => model.models === modelName);
  };

  const toggleExpand = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleItemClick = (page, modelName) => {
    if (page) {
      // Check permission if modelName is provided
      if (modelName && !hasAccessToModel(modelName)) {
        alert("No permissions for this page");
        return;
      }
      onNavigate(page);
      onClose();
    }
  };

  const handleProcurementClick = () => {
    toggleExpand('procurement');
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: 'grid' },
    { id: 'billing', label: 'Billing', icon: 'bell' },
    { id: 'crm', label: 'CRM', icon: 'gear' },
    { id: 'account', label: 'Account', icon: 'document' },
    { 
      id: 'procurement', 
      label: 'Procurement', 
      icon: 'cart',
      subItems: [
        { id: 'purchase-order', label: 'Purchase Order', modelName: 'Purchase Order' },
        { id: 'inventory', label: 'Inventory', modelName: 'Inventory' }
      ]
    },
    { id: 'design-tools', label: 'Design Tools', icon: 'tools' },
    { id: 'hrm', label: 'HRM', icon: 'person' },
    { id: 'utility-hub', label: 'Utility Hub', icon: 'utility' },
    { id: 'master-data', label: 'Master Data', icon: 'gear' }
  ];

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'grid':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.33333 2.5H2.5V8.33333H8.33333V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.5 2.5H11.6667V8.33333H17.5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.33333 11.6667H2.5V17.5H8.33333V11.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.5 11.6667H11.6667V17.5H17.5V11.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'bell':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2.5C7.24 2.5 5 4.74 5 7.5V12.5L3.33333 15V16.6667H16.6667V15L15 12.5V7.5C15 4.74 12.76 2.5 10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="15.8333" cy="3.33333" r="2.5" fill="currentColor"/>
          </svg>
        );
      case 'gear':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.8333 10C15.8333 10.2083 15.8333 10.4167 15.8333 10.625C15.8333 10.8333 15.8333 11.0417 15.8333 11.25L17.0833 12.5C17.2083 12.625 17.3333 12.75 17.4583 12.875L17.5 12.9167C17.625 13.0417 17.75 13.1667 17.875 13.2917L16.625 14.5417C16.5 14.6667 16.375 14.7917 16.25 14.9167L14.1667 16.25C14.0417 16.375 13.9167 16.5 13.7917 16.625L12.5417 15.375C12.4167 15.25 12.2917 15.125 12.1667 15L10.625 15.8333C10.4167 15.8333 10.2083 15.8333 10 15.8333C9.79167 15.8333 9.58333 15.8333 9.375 15.8333L7.83333 15C7.70833 15.125 7.58333 15.25 7.45833 15.375L6.20833 16.625C6.08333 16.5 5.95833 16.375 5.83333 16.25L4.5 14.1667C4.375 14.0417 4.25 13.9167 4.125 13.7917L5.375 12.5417C5.5 12.4167 5.625 12.2917 5.75 12.1667L4.91667 10.625C4.91667 10.4167 4.91667 10.2083 4.91667 10C4.91667 9.79167 4.91667 9.58333 4.91667 9.375L5.75 7.83333C5.625 7.70833 5.5 7.58333 5.375 7.45833L4.125 6.20833C4.25 6.08333 4.375 5.95833 4.5 5.83333L5.83333 4.5C5.95833 4.375 6.08333 4.25 6.20833 4.125L7.45833 5.375C7.58333 5.5 7.70833 5.625 7.83333 5.75L9.375 4.91667C9.58333 4.91667 9.79167 4.91667 10 4.91667C10.2083 4.91667 10.4167 4.91667 10.625 4.91667L12.1667 5.75C12.2917 5.625 12.4167 5.5 12.5417 5.375L13.7917 4.125C13.9167 4.25 14.0417 4.375 14.1667 4.5L15.5 5.83333C15.625 5.95833 15.75 6.08333 15.875 6.20833L14.625 7.45833C14.5 7.58333 14.375 7.70833 14.25 7.83333L15.0833 9.375C15.0833 9.58333 15.0833 9.79167 15.0833 10H15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'document':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.83333 2.5H10.8333L14.1667 5.83333V15.8333C14.1667 16.2754 13.9911 16.6993 13.6785 17.0118C13.366 17.3244 12.942 17.5 12.5 17.5H5.83333C5.39131 17.5 4.96738 17.3244 4.65482 17.0118C4.34226 16.6993 4.16667 16.2754 4.16667 15.8333V4.16667C4.16667 3.72464 4.34226 3.30072 4.65482 2.98816C4.96738 2.67559 5.39131 2.5 5.83333 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 2.5V6.66667H14.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'cart':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 2.5H4.16667L5.83333 15.8333H16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="7.5" cy="17.5" r="1.66667" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="15.8333" cy="17.5" r="1.66667" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5.83333 6.66667H17.5L16.25 12.5H6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'tools':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 2.5L5.83333 4.16667L8.33333 6.66667L10 5L7.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.5 7.5L10 5L11.6667 3.33333L14.1667 5.83333L12.5 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.33333 11.6667L5.83333 14.1667L8.33333 11.6667L5.83333 9.16667L3.33333 11.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.6667 8.33333L14.1667 10.8333L16.6667 8.33333L14.1667 5.83333L11.6667 8.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2.5 17.5L5 15L7.5 17.5L5 20L2.5 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'person':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10C12.3012 10 14.1667 8.13452 14.1667 5.83333C14.1667 3.53215 12.3012 1.66667 10 1.66667C7.69881 1.66667 5.83333 3.53215 5.83333 5.83333C5.83333 8.13452 7.69881 10 10 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.5 18.3333C17.5 15.1117 14.1421 12.5 10 12.5C5.85786 12.5 2.5 15.1117 2.5 18.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'utility':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2.5L12.5 7.5L17.5 8.75L13.75 12.5L14.5833 17.5L10 15L5.41667 17.5L6.25 12.5L2.5 8.75L7.5 7.5L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[55]"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className="fixed h-full w-[280px] bg-white z-[60] shadow-lg overflow-y-auto"
        style={{ fontFamily: "'Manrope', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-1">
                <img src={logo} alt="logo" className="w-8 h-8" />
              <span className="font-semibold text-lg text-black">BUILDERS</span>
            </div>
            <button 
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 py-4">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.subItems ? (
                  <>
                    <div
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                        expandedItems[item.id] ? 'bg-gray-50' : ''
                      }`}
                      onClick={handleProcurementClick}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 text-black">
                          {getIcon(item.icon)}
                        </div>
                        <span className="text-sm font-medium text-black">{item.label}</span>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`transform transition-transform ${expandedItems[item.id] ? 'rotate-90' : ''}`}
                      >
                        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {expandedItems[item.id] && (
                      <div className="bg-gray-50">
                        {item.subItems.map((subItem) => (
                          <div
                            key={subItem.id}
                            className={`px-4 py-2.5 pl-12 cursor-pointer hover:bg-gray-100 ${
                              currentPage === subItem.id ? 'bg-gray-100' : ''
                            }`}
                            onClick={() => handleItemClick(subItem.id, subItem.modelName)}
                          >
                            <span className="text-sm text-black">• {subItem.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                      currentPage === item.id ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => handleItemClick(item.id, item.modelName)}
                  >
                    <div className="w-5 h-5 text-black">
                      {getIcon(item.icon)}
                    </div>
                    <span className="text-sm font-medium text-black">{item.label}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer - Last Updated */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Last Updated: {buildTime || 'Not available'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

