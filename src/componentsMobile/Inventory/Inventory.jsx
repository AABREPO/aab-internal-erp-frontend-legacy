import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../PurchaseOrder/Header';
import Sidebar from '../Bars/Sidebar';
import InventoryTabs from './InventoryTabs';
import BottomNav from '../PurchaseOrder/BottomNav';
import Outgoing from './Outgoing';
import Incoming from './Incoming';
import AddInput from './AddInput';
import History from './History';
import ProjectUsageReport from './ProjectUsageReport';
import IncomingTracker from './IncomingTracker';
import NetStock from './NetStock';
import NonPOHistory from './NonPOHistory';
import EditStock from './EditStock';

const Inventory = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('inventory');
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('inventoryActiveTab');
    return savedTab || 'net-stock';
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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
    }
    else if (page === 'loan-portal') {
      setCurrentPage('loan-portal');
      navigate('/loan');
    }
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('inventoryActiveTab', tab);
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 'outgoing':
        return <Outgoing user={user} />;
      case 'incoming':
        return <Incoming user={user} />;
      case 'net-stock':
        return <NetStock />;
      case 'history':
        return <History onTabChange={handleTabChange} />
      case 'add-input':
        return <AddInput />;
      case 'incoming-tracker':
        return <IncomingTracker user={user} onTabChange={handleTabChange} />;
      case 'project-usage-report':
        return <ProjectUsageReport />;
      case 'project-usage-history':
        return <ProjectUsageReport />;
      case 'non-po-history':
        return <NonPOHistory onTabChange={handleTabChange} />;
      case 'edit-stock':
        return <EditStock />;
      default:
        return null;
    }
  };
  return (
    <div
      className="relative w-full bg-white max-w-[360px] mx-auto h-screen overflow-hidden"
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
      {/* Header - Fixed */}
      <Header
        title="Inventory"
        user={user}
        onLogout={onLogout}
        onMenuClick={handleMenuClick}
      />
      {/* Tabs - Fixed */}
      <InventoryTabs activeTab={activeTab} onTabChange={handleTabChange} />
      {/* Content Area */}
      <div className="mt-[88px] h-[calc(100vh-90px-80px)] overflow-hidden">
        {renderTabContent()}
      </div>
      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
};
export default Inventory;