import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../PurchaseOrder/Header';
import Sidebar from '../Bars/Sidebar';
import ToolsTrackerTabs from './ToolsTrackerTabs';
import BottomNav from '../PurchaseOrder/BottomNav';
import Entry from './Entry';
import History from './History';
import PendingItems from './PendingItems';
import AddInput from './AddInput';
import NetStock from './NetStock';
import ToolsHistory from './ToolsHistory';
import ServiceHistory from './ServiceHistory';

const ToolsTracker = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('tools-tracker');
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('toolsTrackerActiveTab');
    return savedTab || 'entry';
  });

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleNavigate = (page) => {
    if (page === 'purchase-order') {
      setCurrentPage('purchase-order');
      navigate('/purchaseorder');
    } else if (page === 'inventory') {
      setCurrentPage('inventory');
      navigate('/inventory');
    } else if (page === 'tools-tracker') {
      setCurrentPage('tools-tracker');
      navigate('/toolsTracker');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('toolsTrackerActiveTab', tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'entry':
        return <Entry user={user} />;
      case 'history':
        return <History user={user} />;
      case 'pending-items':
        return <PendingItems user={user} />;
      case 'add-input':
        return <AddInput user={user} />;
      case 'net-stock':
        return <NetStock user={user} />;
      case 'tools-history':
        return <ToolsHistory user={user} />;
      case 'service-history':
        return <ServiceHistory user={user} />;
      default:
        return <Entry user={user} />;
    }
  };

  return (
    <div className="relative w-full bg-white max-w-[360px] mx-auto" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        userRoles={user?.userRoles || []}
      />
      {/* Header - Fixed */}
      <Header
        title="Tools Tracker"
        user={user}
        onLogout={onLogout}
        onMenuClick={handleMenuClick}
      />
      {/* Tabs - Fixed */}
      <ToolsTrackerTabs activeTab={activeTab} onTabChange={handleTabChange} />
      {/* Content Area */}
      <div className="mt-[90px]">
        {renderTabContent()}
      </div>
      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
};

export default ToolsTracker;
