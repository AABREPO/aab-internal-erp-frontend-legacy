import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../PurchaseOrder/Header';
import Sidebar from '../Bars/Sidebar';
import ToolsTrackerTabs from './ToolsTrackerTabs';
import BottomNav from '../PurchaseOrder/BottomNav';
import Transfer from './Transfer';
import History from './History';
import PendingItems from './PendingItems';
import AddInput from './AddInput';
import NetStock from './NetStock';
import ToolsHistory from './ToolsHistory';
import ServiceHistory from './ServiceHistory';
import Locate from './Locate';

const ToolsTracker = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('tools-tracker');
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('toolsTrackerActiveTab');
    return savedTab || 'Transfer';
  });
  const handleMenuClick = () => {
    setSidebarOpen(true);
  };
  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };
  const handleNavigate = (page) => {
    if (page === 'request-for-quotation') {
      setCurrentPage('request-for-quotation');
      navigate('/rfq');
    } else if (page === 'purchase-order') {
      setCurrentPage('purchase-order');
      navigate('/purchaseorder');
    } else if (page === 'inventory') {
      setCurrentPage('inventory');
      navigate('/inventory');
    } else if (page === 'tools-tracker') {
      setCurrentPage('tools-tracker');
      navigate('/toolsTracker');
    } else if (page === 'project-advance') {
      setCurrentPage('project-advance');
      navigate('/portal');
    } else if (page === 'loan-portal') {
      setCurrentPage('loan-portal');
      navigate('/loan');
    }
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('toolsTrackerActiveTab', tab);
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Transfer':
      case 'transfer':
        return <Transfer user={user} />;
      case 'history':
        return <History user={user} onTabChange={handleTabChange} />;
      case 'pending-items':
        return <PendingItems user={user} />;
      case 'add-input':
        return <AddInput user={user} />;
      case 'net-stock':
        return <NetStock user={user} />;
      case 'tools-history':
        return <ToolsHistory user={user} />;
      case 'service-history':
        return <ServiceHistory user={user} onTabChange={handleTabChange} />;
      case 'locate':
        return <Locate user={user} />;
      default:
        return <Transfer user={user} />;
    }
  };
  return (
    <div
      className="relative w-full bg-white max-w-[360px] mx-auto overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        userRoles={user?.userRoles || []}
      />
      {/* Header with Tabs */}
      <Header
        title="Tools Tracker"
        user={user}
        onLogout={onLogout}
        onMenuClick={handleMenuClick}
      >
        <ToolsTrackerTabs activeTab={activeTab} onTabChange={handleTabChange} embedded />
      </Header>
      {/* Content Area - height ends before BottomNav */}
      <div className="mt-[96px] h-[calc(100vh-96px-80px)] overflow-hidden">
        {renderTabContent()}
      </div>
      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
};
export default ToolsTracker;