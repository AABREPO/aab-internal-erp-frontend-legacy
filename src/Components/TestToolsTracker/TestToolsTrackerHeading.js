import React, { useState, useEffect } from 'react'
import TestToolsTrackerEntry from './TestToolsTrackerEntry';
import TestToolsTrackerAddInput from './TestToolsTrackerAddInput';
import TestToolsTrackerPurchaseOrder from './TestToolsTrackerPurchaseOrder';
import '../Heading.css';

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
        <div className="bg-[#FAF6ED] w-full h-screen">
      {/* Top Navigation Tabs */}
      <div className="topbar-title">
        <h2
          className={`link ${activeTab === 'testtoolstrackerentry' ? 'active' : ''}`}
          onClick={() => setActiveTab('testtoolstrackerentry')}
        >
          Entry
        </h2>
        <h2
          className={`link ${activeTab === 'testtoolstrackeraddinput' ? 'active' : ''}`}
          onClick={() => setActiveTab('testtoolstrackeraddinput')}
        >
          Add Input
        </h2>
        <h2
          className={`link ${activeTab === 'testtoolstrackerpurchaseorder' ? 'active' : ''}`}
          onClick={() => setActiveTab('testtoolstrackerpurchaseorder')}
        >
          Purchase Order
        </h2>
      </div>

      {/* Dynamic Content Area */}
      <div className="content px-4">
        {renderContent()}
      </div>
    </div>
    )
}

export default TestToolsTrackerHeading
