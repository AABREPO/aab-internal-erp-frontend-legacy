import React, { useState, useEffect } from 'react';
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

const RHeading = ({ username, userRoles = [] }) => {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem('activeTab');
    if (savedTab === 'database' && (username !== 'Mahalingam M' && username !== 'Admin')) {
      return 'form';
    }
    return savedTab || 'form';
  });

  useEffect(() => {
    if (activeTab === 'database' && (username !== 'Mahalingam M' && username !== 'Admin')) {
      setActiveTab('form');
    } else {
      sessionStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab, username]);

  const renderContent = () => {
    switch (activeTab) {
      case 'form':
        return <Form username={username} userRoles={userRoles} />;
      case 'table':
        return <Table username={username} userRoles={userRoles} />;
      case 'database':
        return <RentDatabase username={username} userRoles={userRoles} />;
      case 'dashboard':
        return <Dashboard username={username} userRoles={userRoles} />;
      case 'inputdata':
        return <InputData username={username} userRoles={userRoles} />;
      case 'summary':
        return <Summary username={username} userRoles={userRoles} />;
      case 'rentalagreement':
        return <RentalAgreement username={username} userRoles={userRoles} />;
      case 'tenant':
        return <Tenant username={username} userRoles={userRoles} />;
      case 'monthlyReport':
        return <MonthlyReport />;
      case 'ebno':
        return <Ebno />;
      default:
        return <Form />;
    }
  };

  return (
    <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
      <div className="topbar-title w-[350px] sm:w-[680px] lg:w-[1470px] overflow-x-auto no-scrollbar py-3">
        <h2
          className={`link whitespace-nowrap ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Form
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          Table View
        </h2>
        {(username === 'Mahalingam M' || username === 'Admin') && (
          <h2
            className={`link whitespace-nowrap ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            Database
          </h2>
        )}
        <h2
          className={`link whitespace-nowrap ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'inputdata' ? 'active' : ''}`}
          onClick={() => setActiveTab('inputdata')}
        >
          Input Data
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'rentalagreement' ? 'active' : ''}`}
          onClick={() => setActiveTab('rentalagreement')}
        >
          Rental Agreement
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'tenant' ? 'active' : ''}`}
          onClick={() => setActiveTab('tenant')}
        >
          Tenant
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'monthlyReport' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthlyReport')}
        >
          Monthly Report
        </h2>
        <h2
          className={`link whitespace-nowrap ${activeTab === 'ebno' ? 'active' : ''}`}
          onClick={() => setActiveTab('ebno')}
        >
          EB No
        </h2>
      </div>
      <div className="content">{renderContent()}</div>
    </div>
  );
};

export default RHeading;