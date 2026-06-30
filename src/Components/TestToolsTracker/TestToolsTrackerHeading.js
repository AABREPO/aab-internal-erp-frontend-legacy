import React, { useState, useEffect } from 'react'
import TestToolsTrackerEntry from './TestToolsTrackerEntry';
import TestToolsTrackerAddInput from './TestToolsTrackerAddInput';
import TestToolsTrackerPurchaseOrder from './TestToolsTrackerPurchaseOrder';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';

const TestToolsTrackerHeading = ({ username, userRoles }) => {

    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activeTestToolsTrackerTab') || 'testtoolstrackerentry'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activeTestToolsTrackerTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'testtoolstrackerentry':
                return <TestToolsTrackerEntry username={username} userRoles={userRoles} />;
            case 'testtoolstrackeraddinput':
                return <TestToolsTrackerAddInput username={username} userRoles={userRoles} />;
            case 'testtoolstrackerpurchaseorder':
                return <TestToolsTrackerPurchaseOrder username={username} userRoles={userRoles} />;
            default:
                return <TestToolsTrackerEntry username={username} userRoles={userRoles} />;
        }
    };

    return (
        <ModuleHeadingWrapper className="w-full h-screen">
      <ModuleHeadingBar>
        <ModuleHeadingTab
          active={activeTab === 'testtoolstrackerentry'}
          onClick={() => setActiveTab('testtoolstrackerentry')}
        >
          Entry
        </ModuleHeadingTab>
        <ModuleHeadingTab
          active={activeTab === 'testtoolstrackeraddinput'}
          onClick={() => setActiveTab('testtoolstrackeraddinput')}
        >
          Add Input
        </ModuleHeadingTab>
        <ModuleHeadingTab
          active={activeTab === 'testtoolstrackerpurchaseorder'}
          onClick={() => setActiveTab('testtoolstrackerpurchaseorder')}
        >
          Purchase Order
        </ModuleHeadingTab>
      </ModuleHeadingBar>

      <div className="content px-4">
        {renderContent()}
      </div>
    </ModuleHeadingWrapper>
    )
}

export default TestToolsTrackerHeading
