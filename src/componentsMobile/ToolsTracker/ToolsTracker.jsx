import React, { useEffect, useState } from 'react';
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
import { prefetchToolsNetStockData } from './netStockPrefetch';

const TOOLS_TRACKER_TAB_IDS = [
  'transfer',
  'history',
  'pending-items',
  'add-input',
  'net-stock',
  'tools-history',
  'service-history',
  'locate'
];

const normalizeToolsTrackerTab = (tab) => {
  if (!tab) return 'transfer';
  return tab.toLowerCase() === 'transfer' ? 'transfer' : tab;
};

const ToolsTracker = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('tools-tracker');
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('toolsTrackerActiveTab');
    return normalizeToolsTrackerTab(savedTab || 'transfer');
  });
  const [loadedTabs, setLoadedTabs] = useState(() => new Set([activeTab]));

  useEffect(() => {
    setLoadedTabs((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  // Warm Net Stock APIs as soon as Tools Tracker opens.
  useEffect(() => {
    prefetchToolsNetStockData().catch(() => {});
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
    } else if (page === 'billing') {
      setCurrentPage('billing');
      navigate('/tracker/pendingbill');
    } else if (page === 'purchase-order') {
      setCurrentPage('purchase-order');
      navigate('/purchaseorder');
    } else if (page === 'goods-recieved-notes') {
      setCurrentPage('goods-recieved-notes');
      navigate('/grn/create');
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
    const normalizedTab = normalizeToolsTrackerTab(tab);
    setActiveTab(normalizedTab);
    localStorage.setItem('toolsTrackerActiveTab', normalizedTab);
  };

  const getTabComponent = (tabId) => {
    switch (tabId) {
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
        {TOOLS_TRACKER_TAB_IDS.map((tabId) => {
          if (!loadedTabs.has(tabId)) return null;

          return (
            <div
              key={tabId}
              className={activeTab === tabId ? 'block h-full' : 'hidden h-full'}
            >
              {getTabComponent(tabId)}
            </div>
          );
        })}
      </div>
      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
};
export default ToolsTracker;
