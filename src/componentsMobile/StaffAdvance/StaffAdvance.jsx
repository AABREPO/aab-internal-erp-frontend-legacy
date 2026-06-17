import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../PurchaseOrder/Header';
import Sidebar from '../Bars/Sidebar';
import BottomNav from '../PurchaseOrder/BottomNav';
import Advance from './Advance';
import History from './History';
import Report from './Report';
import Summary from './Summary';
import StaffAdvanceTabs from './StaffAdvanceTabs';
import { loadStaffAdvanceData, resolveActiveBranchId, PAYMENT_MODE_OPTIONS } from './staffAdvanceHelpers';
import { STAFF_ADVANCE_MODULE_NAME } from '../../utils/paymentModeArrangement';
import { usePaymentModeSelectOptionsForModule } from '../../utils/usePaymentModeArrangement';

const TAB_IDS = ['advance', 'history', 'report', 'summary'];

const LoadingState = () => (
  <div className="flex h-full items-center justify-center bg-white px-[20px] text-center text-[12px] font-semibold text-[#8A8A8A]">
    Loading staff advance data...
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex h-full flex-col items-center justify-center gap-[12px] bg-white px-[20px] text-center">
    <p className="text-[12px] font-semibold text-[#8A8A8A]">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="h-[32px] rounded-[6px] bg-[#BF9853] px-[14px] text-[12px] font-bold text-white"
    >
      Retry
    </button>
  </div>
);

const StaffAdvance = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('staff-advance');
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('staffAdvanceMobileActiveTab');
    return savedTab || 'advance';
  });
  const [loadedTabs, setLoadedTabs] = useState(() => new Set([activeTab]));
  const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId(user));
  const [dataState, setDataState] = useState({
    isLoading: true,
    error: '',
    peopleOptions: [],
    purposes: [],
    records: []
  });

  const paymentModeOptions = usePaymentModeSelectOptionsForModule(
    STAFF_ADVANCE_MODULE_NAME,
    PAYMENT_MODE_OPTIONS
  );

  const refreshData = useCallback(async () => {
    setDataState((previousState) => ({
      ...previousState,
      isLoading: true,
      error: ''
    }));

    try {
      const data = await loadStaffAdvanceData(activeBranchId);
      setDataState({
        isLoading: false,
        error: '',
        peopleOptions: data.peopleOptions,
        purposes: data.purposes,
        records: data.records
      });
    } catch (error) {
      console.error('Error loading staff advance mobile data:', error);
      setDataState((previousState) => ({
        ...previousState,
        isLoading: false,
        error: 'Unable to load staff advance data.'
      }));
    }
  }, [activeBranchId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    const syncBranch = () => {
      const nextBranchId = resolveActiveBranchId(user);
      setActiveBranchId((previousState) =>
        previousState === nextBranchId ? previousState : nextBranchId
      );
    };

    window.addEventListener('branchSelectionChanged', syncBranch);
    return () => window.removeEventListener('branchSelectionChanged', syncBranch);
  }, [user]);

  useEffect(() => {
    setLoadedTabs((previousTabs) => {
      if (previousTabs.has(activeTab)) return previousTabs;
      const nextTabs = new Set(previousTabs);
      nextTabs.add(activeTab);
      return nextTabs;
    });
    localStorage.setItem('staffAdvanceMobileActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleUpdate = () => {
      refreshData();
    };

    window.addEventListener('staffAdvanceUpdated', handleUpdate);
    return () => window.removeEventListener('staffAdvanceUpdated', handleUpdate);
  }, [refreshData]);

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
    } else if (page === 'goods-recieved-notes') {
      setCurrentPage('goods-recieved-notes');
      navigate('/grn/create');
    } else if (page === 'tools-tracker') {
      setCurrentPage('tools-tracker');
      navigate('/toolsTracker');
    } else if (page === 'project-advance') {
      setCurrentPage('project-advance');
      navigate('/portal/advancePortal');
    } else if (page === 'loan-portal') {
      setCurrentPage('loan-portal');
      navigate('/loan/loanportal');
    } else if (page === 'staff-advance') {
      setCurrentPage('staff-advance');
      navigate('/staffadvance/staffAdvance');
    }
  };

  const renderTab = (tabId) => {
    const sharedProps = {
      records: dataState.records,
      peopleOptions: dataState.peopleOptions,
      purposeOptions: dataState.purposes,
      paymentModeOptions,
    };

    switch (tabId) {
      case 'advance':
        return (
          <Advance
            activeBranchId={activeBranchId}
            peopleOptions={dataState.peopleOptions}
            purposeOptions={dataState.purposes}
            records={dataState.records}
            paymentModeOptions={paymentModeOptions}
            onSaved={refreshData}
          />
        );
      case 'history':
        return <History {...sharedProps} />;
      case 'report':
        return <Report {...sharedProps} />;
      case 'summary':
        return <Summary {...sharedProps} />;
      default:
        return null;
    }
  };

  const content = dataState.isLoading ? (
    <LoadingState />
  ) : dataState.error ? (
    <ErrorState message={dataState.error} onRetry={refreshData} />
  ) : (
    TAB_IDS.map((tabId) => {
      if (!loadedTabs.has(tabId)) return null;

      return (
        <div
          key={tabId}
          className={activeTab === tabId ? 'block h-full' : 'hidden h-full'}
        >
          {renderTab(tabId)}
        </div>
      );
    })
  );

  return (
    <div
      className="relative mx-auto w-full max-w-[360px] overflow-hidden bg-white"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        userRoles={user?.userRoles || []}
      />

      <Header
        title="Staff Advance"
        user={user}
        onLogout={onLogout}
        onMenuClick={() => setSidebarOpen(true)}
      >
        <StaffAdvanceTabs activeTab={activeTab} onTabChange={setActiveTab} embedded />
      </Header>

      <div className="mt-[96px] h-[calc(100vh-96px-80px)] overflow-hidden">{content}</div>

      <BottomNav activeTab="home" />
    </div>
  );
};

export default StaffAdvance;
