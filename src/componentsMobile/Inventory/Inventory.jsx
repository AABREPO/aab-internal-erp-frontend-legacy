import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../PurchaseOrder/Header';
import Sidebar from '../Bars/Sidebar';
import InventoryTabs from './InventoryTabs';
import BottomNav from '../PurchaseOrder/BottomNav';
import Outgoing from './Outgoing';
import Incoming from './Incoming';
import AddInput from './AddInput';

const Inventory = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('inventory');
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('inventoryActiveTab');
    return savedTab || 'net-stock';
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
    }
    // Other pages can be handled here when implemented
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
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-black mb-4">Net Stock</h2>
            <p className="text-gray-500">Net Stock content will be displayed here</p>
          </div>
        );
      case 'history':
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-black mb-4">History</h2>
            <p className="text-gray-500">History content will be displayed here</p>
          </div>
        );
      case 'add-input':
        return <AddInput />;
      case 'incoming-tracker':
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-black mb-4">Incoming Tracker</h2>
            <p className="text-gray-500">Incoming Tracker content will be displayed here</p>
          </div>
        );
      case 'project-usage-report':
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-black mb-4">Project Usage Report</h2>
            <p className="text-gray-500">Project Usage Report content will be displayed here</p>
          </div>
        );
      case 'project-usage-history':
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-black mb-4">Project Usage History</h2>
            <p className="text-gray-500">Project Usage History content will be displayed here</p>
          </div>
        );
      case 'non-po-history':
        return (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-black mb-4">Non PO History</h2>
            <p className="text-gray-500">Non PO History content will be displayed here</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white max-w-[360px] mx-auto pb-[80px]" style={{ fontFamily: "'Manrope', sans-serif" }}>
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
      <div className="pt-[90px]">
        {renderTabContent()}
      </div>
      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
};

export default Inventory;

