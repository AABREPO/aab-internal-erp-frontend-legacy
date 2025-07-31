import React, { useState, useEffect } from "react";
import ManageUsers from './ManageUsers';
import Userroleandpermission from './Userroleandpermission';

const ManageHeading = () => {
  const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'manageusers'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'manageusers':
                return <ManageUsers/>;
            case 'userroleandpermission':
                return <Userroleandpermission/>;
            default:
                return <ManageUsers/>;
        }
    };

  return (
    <div className="bg-[#FAF6ED]">
      <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'manageusers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manageusers')}
                >
                    Manage Users
                </h2>
                <h2
                    className={`link ${activeTab === 'userroleandpermission' ? 'active' : ''}`}
                    onClick={() => setActiveTab('userroleandpermission')}
                >
                    User Role and Premission
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
    </div>
  )
}

export default ManageHeading
