import React, { useState, useEffect } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
import ToolTrackerEntry from './ToolsTrackerEntry';
import ToolTrackerTableview from './ToolsTrackerTableView';
import ToolTrackerPendingItems from './ToolsTrackerPendingItems';
import ToolTrackerDatabase from './ToolsTrackerDatabase';
import ToolTrackerAddInput from './ToolsTrackerAddInput';
import ToolTrackerNetStock from './ToolsTrackerNetStock';
import ToolTrackerToolHistory from './ToolsTrackerToolsHistory';
import ToolTrackerServiceHistory from './ToolsTrackerServiceHistory';
import MobileToolsTracker from "../../componentsMobile/ToolsTracker/ToolsTracker";
import { isMobileViewportWidth } from '../../constants/mobileBreakpoint';

const ToolsTrackerHeading = ({ username, userRoles = [] }) => {
  const [isMobile, setIsMobile] = useState(() => isMobileViewportWidth());
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileViewportWidth());
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
    const storedUserParsed = storedUser ? JSON.parse(storedUser) : {};
    const user = {
      ...storedUserParsed,
      username,
      // Prefer roles provided from `App.js` props; fall back to localStorage if missing.
      userRoles: Array.isArray(userRoles) && userRoles.length > 0 ? userRoles : (storedUserParsed?.userRoles ?? []),
    };
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
    <ModuleHeadingWrapper className="w-full h-auto min-h-screen">
      <ModuleHeadingBar>
        <ModuleHeadingTab active={activeTab === 'toolstrackerentry'} onClick={() => setActiveTab('toolstrackerentry')}>
          Entry
        </ModuleHeadingTab>
        <ModuleHeadingTab active={activeTab === 'toolstrackertableview'} onClick={() => setActiveTab('toolstrackertableview')}>
          Table View
        </ModuleHeadingTab>
        <ModuleHeadingTab active={activeTab === 'toolstrackerpendingitems'} onClick={() => setActiveTab('toolstrackerpendingitems')}>
          Pending Items
        </ModuleHeadingTab>
        <ModuleHeadingTab active={activeTab === 'toolstrackerdatabase'} onClick={() => setActiveTab('toolstrackerdatabase')}>
          Database
        </ModuleHeadingTab>
        <ModuleHeadingTab active={activeTab === 'toolstrackeraddinput'} onClick={() => setActiveTab('toolstrackeraddinput')}>
          Add Input
        </ModuleHeadingTab>
        <ModuleHeadingTab active={activeTab === 'toolstrackernetstock'} onClick={() => setActiveTab('toolstrackernetstock')}>
          Net Stock
        </ModuleHeadingTab>
        <ModuleHeadingTab active={activeTab === 'toolstrackertoolhistory'} onClick={() => setActiveTab('toolstrackertoolhistory')}>
          Tool History
        </ModuleHeadingTab>
        <ModuleHeadingTab active={activeTab === 'toolstrackerservicehistory'} onClick={() => setActiveTab('toolstrackerservicehistory')}>
          Service History
        </ModuleHeadingTab>
      </ModuleHeadingBar>
      <div className="content px-4">
        {renderContent()}
      </div>
    </ModuleHeadingWrapper>
  )
}
export default ToolsTrackerHeading