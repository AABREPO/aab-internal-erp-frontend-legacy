import React, { useState, useEffect } from 'react';
import ClaimPaymentSummary from './ClaimPaymentSummary';
import ClaimPaymentTableView from './ClaimPaymentTableView';
import ClaimPaymentDatabase from './ClaimPaymentDatabase';
import ClaimPaymentCashRegister from './ClaimPaymentCashRegister';

const ClaimPaymentHeading = ({ username, userRoles = [] }) => {
  const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'claimpaymentsummary'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'claimpaymentsummary':
                return <ClaimPaymentSummary username={username} userRoles={userRoles}/>;
            case 'claimpaymenttableview':
                return <ClaimPaymentTableView username={username} userRoles={userRoles}/>;
            case 'claimpaymentdatabase':
                return <ClaimPaymentDatabase username={username} userRoles={userRoles}/>;
            case 'claimpaymentcashregister':
                return <ClaimPaymentCashRegister username={username} userRoles={userRoles}/>;
            default:
                return <ClaimPaymentSummary />;
        }
    };
    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'claimpaymentsummary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('claimpaymentsummary')}
                >
                    Summary
                </h2>
                <h2
                    className={`link ${activeTab === 'claimpaymenttableview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('claimpaymenttableview')}
                >
                    Table View
                </h2>
                <h2
                    className={`link ${activeTab === 'claimpaymentdatabase' ? 'active' : ''}`}
                    onClick={() => setActiveTab('claimpaymentdatabase')}
                >
                    Database
                </h2>
                <h2
                    className={`link ${activeTab === 'claimpaymentcashregister' ? 'active' : ''}`}
                    onClick={() => setActiveTab('claimpaymentcashregister')}
                >
                    Cash Register
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    )
}

export default ClaimPaymentHeading
