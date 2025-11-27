import React, { useState, useEffect } from 'react';
import ClaimPaymentSummary from './ClaimPaymentSummary';
import ClaimPaymentTableView from './ClaimPaymentTableView';
import ClaimPaymentDatabase from './ClaimPaymentDatabase';
import ClaimPaymentCashRegister from './ClaimPaymentCashRegister';
import ClaimPaymentClaimHistory from './ClaimPaymentClaimHistory';

const ClaimPaymentHeading = ({ username, userRoles = [] }) => {
  const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('activePaintTab');
        if (savedTab === 'claimpaymentdatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            return 'claimpaymentsummary';
        }
        return savedTab || 'claimpaymentsummary';
    });

    useEffect(() => {
        if (activeTab === 'claimpaymentdatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            setActiveTab('claimpaymentsummary');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, username]);

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
                case 'claimpaymentclaimhistory':
                    return <ClaimPaymentClaimHistory username={username} userRoles={userRoles}/>;
            default:
                return <ClaimPaymentSummary />;
        }
    };
    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
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
                {(username === 'Mahalingam M' || username === 'Admin') && (
                    <h2
                        className={`link ${activeTab === 'claimpaymentdatabase' ? 'active' : ''}`}
                        onClick={() => setActiveTab('claimpaymentdatabase')}
                    >
                        Database
                    </h2>
                )}
                <h2
                    className={`link ${activeTab === 'claimpaymentcashregister' ? 'active' : ''}`}
                    onClick={() => setActiveTab('claimpaymentcashregister')}
                >
                    Cash Register
                </h2>
                <h2
                    className={`link ${activeTab === 'claimpaymentclaimhistory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('claimpaymentclaimhistory')}
                >
                    Claim History
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    )
}

export default ClaimPaymentHeading
