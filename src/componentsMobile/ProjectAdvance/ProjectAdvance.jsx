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

  // Avoid re-mounting heavy tab components (they fetch big datasets).
  // Once a tab is opened once, keep it mounted and only hide/show.
  const [loadedTabs, setLoadedTabs] = useState(() => ({
    [activeTab]: true,
  }));

  // Save activeTab to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem('projectAdvanceActiveTab', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    setLoadedTabs((prev) => (prev[activeTab] ? prev : { ...prev, [activeTab]: true }));
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
    } else if (page === 'billing') {
      setCurrentPage('billing');
      navigate('/tracker/pendingbill');
    } else if (page === 'inventory') {
      setCurrentPage('inventory');
      navigate('/inventory');
    } else if (page === 'tools-tracker') {
      setCurrentPage('tools-tracker');
      navigate('/toolsTracker');
    } else if (page === 'project-advance') {
      setCurrentPage('project-advance');
      navigate('/portal/advancePortal');
    }else if (page === 'loan-portal') {
      setCurrentPage('loan-portal');
      navigate('/loan/loanportal');
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
      {/* Main column: 100vh with pt for fixed chrome + pb for fixed BottomNav */}
      <div
        className="pt-[84px] box-border flex flex-col min-h-0 overflow-hidden"
        style={{
          height: '100vh',
          paddingBottom: 'calc(60px + 9px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Advance Form Tab Content — flex parent so AdvanceForm flex-1 / list scroll works */}
        {loadedTabs.advanceform && (
          <div
            className="flex flex-col min-h-0 flex-1"
            style={{ display: activeTab === 'advanceform' ? 'flex' : 'none' }}
          >
            <AdvanceForm
              isAdvanceTabActive={activeTab === 'advanceform'}
              initialFromHistory={initialFromHistory}
              onConsumedInitialFromHistory={() => setInitialFromHistory(null)}
            />
          </div>
        )}

        {/* History Tab Content */}
        {loadedTabs.history && (
          <div
            className="flex-1 min-h-0 overflow-hidden"
            style={{ display: activeTab === 'history' ? 'block' : 'none' }}
          >
            <History
              user={user}
              onVendorClick={(data) => {
                setInitialFromHistory(data);
                setActiveTab('advanceform');
              }}
            />
          </div>
        )}

        {/* Report Tab Content */}
        {loadedTabs.report && (
          <div
            className="flex-1 min-h-0 overflow-hidden"
            style={{ display: activeTab === 'report' ? 'block' : 'none' }}
          >
            <Report />
          </div>
        )}

        {/* Summary Tab Content */}
        {loadedTabs.summary && (
          <div
            className="flex-1 min-h-0 overflow-hidden"
            style={{ display: activeTab === 'summary' ? 'block' : 'none' }}
          >
            <Summary />
          </div>
        )}
      </div>
      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
};

export default ProjectAdvance;
