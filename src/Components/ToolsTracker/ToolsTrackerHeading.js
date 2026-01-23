import React, { useState, useEffect } from 'react';
import ToolTrackerEntry from './ToolsTrackerEntry';
import ToolTrackerTableview from './ToolsTrackerTableView';
import ToolTrackerPendingItems from './ToolsTrackerPendingItems';
import ToolTrackerDatabase from './ToolsTrackerDatabase';
import ToolTrackerAddInput from './ToolsTrackerAddInput';
import ToolTrackerNetStock from './ToolsTrackerNetStock';
import ToolTrackerToolHistory from './ToolsTrackerToolsHistory';
import ToolTrackerServiceHistory from './ToolsTrackerServiceHistory';
import MobileToolsTracker from "../../componentsMobile/ToolsTracker/ToolsTracker";

const ToolsTrackerHeading = ({ username, userRoles = [] }) => {
  const [isMobile, setIsMobile] = useState(() => {
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [activeTab, setActiveTab] = useState(
    localStorage.getItem('activePaintTab') || 'toolstrackerentry'
  );

  useEffect(() => {
    // Save the active tab to localStorage whenever it changes
    localStorage.setItem('activePaintTab', activeTab);
  }, [activeTab]);

  if (isMobile) {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : { username, userRoles };
    return (
      <div style={{textAlign: 'left'}}>
        <MobileToolsTracker user={user} onLogout={() => { }} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'toolstrackerentry':
        return <ToolTrackerEntry username={username} userRoles={userRoles} />;
      case 'toolstrackertableview':
        return <ToolTrackerTableview username={username} userRoles={userRoles} />;
      case 'toolstrackerpendingitems':
        return <ToolTrackerPendingItems username={username} userRoles={userRoles} />;
      case 'toolstrackerdatabase':
        return <ToolTrackerDatabase username={username} userRoles={userRoles} />;
      case 'toolstrackeraddinput':
        return <ToolTrackerAddInput username={username} userRoles={userRoles} />;
      case 'toolstrackernetstock':
        return <ToolTrackerNetStock username={username} userRoles={userRoles} />;
      case 'toolstrackertoolhistory':
        return <ToolTrackerToolHistory username={username} userRoles={userRoles} />;
      case 'toolstrackerservicehistory':
        return <ToolTrackerServiceHistory username={username} userRoles={userRoles} />;
      default:
        return <ToolTrackerEntry username={username} userRoles={userRoles} />;
    }
  };

  return (
    <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
      {/* Top Navigation Tabs */}
      <div className="topbar-title">
        <h2
          className={`link ${activeTab === 'toolstrackerentry' ? 'active' : ''}`}
          onClick={() => setActiveTab('toolstrackerentry')}
        >
          Entry
        </h2>
        <h2
          className={`link ${activeTab === 'toolstrackertableview' ? 'active' : ''}`}
          onClick={() => setActiveTab('toolstrackertableview')}
        >
          Table View
        </h2>
        <h2
          className={`link ${activeTab === 'toolstrackerpendingitems' ? 'active' : ''}`}
          onClick={() => setActiveTab('toolstrackerpendingitems')}
        >
          Pending Items
        </h2>
        <h2
          className={`link ${activeTab === 'toolstrackerdatabase' ? 'active' : ''}`}
          onClick={() => setActiveTab('toolstrackerdatabase')}
        >
          Database
        </h2>
        <h2
          className={`link ${activeTab === 'toolstrackeraddinput' ? 'active' : ''}`}
          onClick={() => setActiveTab('toolstrackeraddinput')}
        >
          Add Input
        </h2>
        <h2
          className={`link ${activeTab === 'toolstrackernetstock' ? 'active' : ''}`}
          onClick={() => setActiveTab('toolstrackernetstock')}
        >
          Net Stock
        </h2>
        <h2
          className={`link ${activeTab === 'toolstrackertoolhistory' ? 'active' : ''}`}
          onClick={() => setActiveTab('toolstrackertoolhistory')}
        >
          Tool History
        </h2>
        <h2
          className={`link ${activeTab === 'toolstrackerservicehistory' ? 'active' : ''}`}
          onClick={() => setActiveTab('toolstrackerservicehistory')}
        >
          Service History
        </h2>
      </div>

      {/* Dynamic Content Area */}
      <div className="content px-4">
        {renderContent()}
      </div>
    </div>
  )
}

export default ToolsTrackerHeading
