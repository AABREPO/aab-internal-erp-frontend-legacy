import React, { useState, useEffect } from "react";
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
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
    <ModuleHeadingWrapper>
      <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'manageusers'}
                    onClick={() => setActiveTab('manageusers')}
                >
                    Manage Users
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'userroleandpermission'}
                    onClick={() => setActiveTab('userroleandpermission')}
                >
                    User Role and Premission
                </ModuleHeadingTab>
            </ModuleHeadingBar>
            <div className="content">
                {renderContent()}
            </div>
    </ModuleHeadingWrapper>
  )
}

export default ManageHeading
