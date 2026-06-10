import React, { useState, useEffect } from 'react';
import '../Heading.css';
import Form from './Form';
import Table from './Table';
import Dashboard from './Dashboard';
import InputData from './InputData';
import Summary from './Summary';
import RentalAgreement from './RentalAgreement';
import Tenant from './Tenant';
import RentDatabase from './RentDatabase';
import MonthlyReport from './MonthlyReport';
import Ebno from './Ebno';

const RENT_MODULE_TABS = [
  'form',
  'table',
  'database',
  'dashboard',
  'inputdata',
  'summary',
  'rentalagreement',
  'tenant',
  'monthlyReport',
  'ebno',
];
const RENT_DEFAULT_TAB = 'form';

const getInitialRentTab = (username) => {
  const isAdmin = username === 'Mahalingam M' || username === 'Admin';
  const allowedTabs = isAdmin
    ? RENT_MODULE_TABS
    : RENT_MODULE_TABS.filter((tab) => tab !== 'database');
  const savedTab = sessionStorage.getItem('activeTab');
  if (savedTab && allowedTabs.includes(savedTab)) {
    return savedTab;
  }
  return RENT_DEFAULT_TAB;
};

const RHeading = ({ username, userRoles = [] }) => {
  const isAdminRent = username === 'Mahalingam M' || username === 'Admin';

  const allowedTabs = isAdminRent
    ? RENT_MODULE_TABS
    : RENT_MODULE_TABS.filter((tab) => tab !== 'database');

  const initialTab = getInitialRentTab(username);

  const [activeTab, setActiveTab] = useState(() => initialTab);
  const [visitedTabs, setVisitedTabs] = useState(() => new Set([initialTab]));
  const [refreshNonce, setRefreshNonce] = useState(0);
  const bumpRefresh = () => setRefreshNonce((n) => n + 1);

  useEffect(() => {
    setVisitedTabs((prev) => new Set(prev).add(activeTab));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'database' && !isAdminRent) {
      setActiveTab('form');
    } else {
      sessionStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab, isAdminRent]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    bumpRefresh();
  };

  return (
    <div className="bg-[#FAF6ED]">
      <div className="topbar-title expense-entry-tabs w-full max-w-full overflow-x-auto no-scrollbar">
        <h2
          className={`link whitespace-nowrap ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => handleTabChange('form')}
        >
          Form
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => handleTabChange('table')}
        >
          Table View
        </h2>
        {isAdminRent && (
          <h2
            className={`link whitespace-nowrap ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => handleTabChange('database')}
          >
            Database
          </h2>
        )}
        <h2
          className={`link whitespace-nowrap ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          Dashboard
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'inputdata' ? 'active' : ''}`}
          onClick={() => handleTabChange('inputdata')}
        >
          Input Data
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => handleTabChange('summary')}
        >
          Summary
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'rentalagreement' ? 'active' : ''}`}
          onClick={() => handleTabChange('rentalagreement')}
        >
          Rental Agreement
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'tenant' ? 'active' : ''}`}
          onClick={() => handleTabChange('tenant')}
        >
          Tenant
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'monthlyReport' ? 'active' : ''}`}
          onClick={() => handleTabChange('monthlyReport')}
        >
          Monthly Report
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'ebno' ? 'active' : ''}`}
          onClick={() => handleTabChange('ebno')}
        >
          EB No
        </h2>
      </div>
      <div className="content">
        {visitedTabs.has('form') && (
          <div className={activeTab === 'form' ? '' : 'hidden'}>
            <Form username={username} userRoles={userRoles} refreshSignal={refreshNonce} isActive={activeTab === 'form'} />
          </div>
        )}
        {visitedTabs.has('table') && (
          <div className={activeTab === 'table' ? '' : 'hidden'}>
            <Table username={username} userRoles={userRoles} refreshSignal={refreshNonce} isActive={activeTab === 'table'} />
          </div>
        )}
        {isAdminRent && visitedTabs.has('database') && (
          <div className={activeTab === 'database' ? '' : 'hidden'}>
            <RentDatabase username={username} userRoles={userRoles} refreshSignal={refreshNonce} isActive={activeTab === 'database'} />
          </div>
        )}
        {visitedTabs.has('dashboard') && (
          <div className={activeTab === 'dashboard' ? '' : 'hidden'}>
            <Dashboard
              username={username}
              userRoles={userRoles}
              refreshSignal={refreshNonce}
              isActive={activeTab === 'dashboard'}
            />
          </div>
        )}
        {visitedTabs.has('inputdata') && (
          <div className={activeTab === 'inputdata' ? '' : 'hidden'}>
            <InputData username={username} userRoles={userRoles} />
          </div>
        )}
        {visitedTabs.has('summary') && (
          <div className={activeTab === 'summary' ? '' : 'hidden'}>
            <Summary username={username} userRoles={userRoles} />
          </div>
        )}
        {visitedTabs.has('rentalagreement') && (
          <div className={activeTab === 'rentalagreement' ? '' : 'hidden'}>
            <RentalAgreement username={username} userRoles={userRoles} />
          </div>
        )}
        {visitedTabs.has('tenant') && (
          <div className={activeTab === 'tenant' ? '' : 'hidden'}>
            <Tenant username={username} userRoles={userRoles} />
          </div>
        )}
        {visitedTabs.has('monthlyReport') && (
          <div className={activeTab === 'monthlyReport' ? '' : 'hidden'}>
            <MonthlyReport />
          </div>
        )}
        {visitedTabs.has('ebno') && (
          <div className={activeTab === 'ebno' ? '' : 'hidden'}>
            <Ebno />
          </div>
        )}
      </div>
    </div>
  );
};

export default RHeading;
