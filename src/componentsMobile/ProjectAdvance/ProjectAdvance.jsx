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
      <Header user={user} onLogout={onLogout} onMenuClick={handleMenuClick} />
      {/* Tabs - Fixed */}
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Content Area - Add padding to account for fixed Header and Tabs */}
      <div className="pt-[85px]">
        {/* Advance Form Tab Content */}
        {activeTab === 'advanceform' && <AdvanceForm />}
        {/* History Tab Content */}
        {activeTab === 'history' && <History />}
        {/* Report Tab Content */}
        {activeTab === 'report' && <Report />}
        {/* Summary Tab Content */}
        {activeTab === 'summary' && <Summary />}
      </div>
      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
};

export default ProjectAdvance;
