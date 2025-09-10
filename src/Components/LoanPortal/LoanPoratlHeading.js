import React, { useState, useEffect } from 'react';
import LoanTableview from './LoanTableview';
import LoanDatabase from './LoanDatabase';
import LoanAddInput from './LoanAddInput';
import LoanPortal from './LoanPortal';
import LoanReport from './LoanReport';
import LoanSummary from './LoanSummary';

const LoanPoratlHeading = ({ username, userRoles = [] }) => {
  const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'loanportal'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'loanportal':
                return <LoanPortal username={username} userRoles={userRoles} />;
            case 'loantableview':
                return <LoanTableview username={username} userRoles={userRoles} />;
            case 'loandatabase':
                return <LoanDatabase username={username} userRoles={userRoles} />;
            case 'loanaddinput':
                return <LoanAddInput username={username} userRoles={userRoles} />;
            case 'loanreport':
                return <LoanReport username={username} userRoles={userRoles} />;
            case 'loansummary':
                return <LoanSummary username={username} userRoles={userRoles} />;
            default:
                return <LoanPortal />;
        }
    };
    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'loanportal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loanportal')}
                >
                    Loan
                </h2>
                <h2
                    className={`link ${activeTab === 'loantableview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loantableview')}
                >
                    Table View
                </h2>
                <h2
                    className={`link ${activeTab === 'loandatabase' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loandatabase')}
                >
                    Database
                </h2>
                <h2
                    className={`link ${activeTab === 'loanaddinput' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loanaddinput')}
                >
                    Add Input
                </h2>
                <h2
                    className={`link ${activeTab === 'loanreport' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loanreport')}
                >
                    Report
                </h2>                
                <h2
                    className={`link ${activeTab === 'loansummary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loansummary')}
                >
                    Summary
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    )
}

export default LoanPoratlHeading
