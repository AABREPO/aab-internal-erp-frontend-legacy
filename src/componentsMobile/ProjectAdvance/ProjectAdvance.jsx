import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from '../Bars/Sidebar';
import Tabs from './Tabs';
import BottomNav from './BottomNav';
import AdvanceForm from './AdvanceForm';
import History from './History';
import Report from './Report';
import Summary from './Summary';

const ProjectAdvance = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('project-advance');
  // Data passed from History when user clicks a vendor name (pre-fill AdvanceForm and show bill details)
  const [initialFromHistory, setInitialFromHistory] = useState(null);
  // Load activeTab from localStorage on mount, default to 'advanceform'
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('projectAdvanceActiveTab');
    return savedTab || 'advanceform';
  });

  // Save activeTab to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem('projectAdvanceActiveTab', activeTab);
  }, [activeTab]);

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
    } else if (page === 'project-advance') {
      setCurrentPage('project-advance');
      navigate('/portal');
    }else if (page === 'loan-portal') {
      setCurrentPage('loan-portal');
      navigate('/loan');
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white max-w-[360px] mx-auto" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        userRoles={user?.userRoles || []}
      />
      {/* Header - Fixed */}
      <Header user={user} onLogout={onLogout} onMenuClick={handleMenuClick} />
      {/* Tabs - Fixed */}
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Content Area - fixed height so only inner content (e.g. cards) scrolls, not the page */}
      <div className="pt-[85px] flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 85px)' }}>
        {/* Advance Form Tab Content */}
        {activeTab === 'advanceform' && (
          <AdvanceForm
            initialFromHistory={initialFromHistory}
            onConsumedInitialFromHistory={() => setInitialFromHistory(null)}
          />
        )}
        {/* History Tab Content */}
        {activeTab === 'history' && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <History
              onVendorClick={(data) => {
                setInitialFromHistory(data);
                setActiveTab('advanceform');
              }}
            />
          </div>
        )}
        {/* Report Tab Content */}
        {activeTab === 'report' && <div className="flex-1 min-h-0 overflow-hidden"><Report /></div>}
        {/* Summary Tab Content */}
        {activeTab === 'summary' && <div className="flex-1 min-h-0 overflow-hidden"><Summary /></div>}
      </div>
      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
};

export default ProjectAdvance;
