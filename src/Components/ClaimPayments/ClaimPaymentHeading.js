import React, { useState, useEffect } from 'react';
import '../Heading.css';
import ClaimPaymentSummary from './ClaimPaymentSummary';
import ClaimPaymentTableView from './ClaimPaymentTableView';
import ClaimPaymentDatabase from './ClaimPaymentDatabase';
import ClaimPaymentCashRegister from './ClaimPaymentCashRegister';
import ClaimPaymentClaimHistory from './ClaimPaymentClaimHistory';

const CLAIM_MODULE_TABS = [
    'claimpaymentsummary',
    'claimpaymenttableview',
    'claimpaymentdatabase',
    'claimpaymentcashregister',
    'claimpaymentclaimhistory',
];
const CLAIM_DEFAULT_TAB = 'claimpaymentsummary';

const getInitialClaimTab = (username) => {
    const isAdmin = username === 'Mahalingam M' || username === 'Admin';
    const allowedTabs = isAdmin
        ? CLAIM_MODULE_TABS
        : CLAIM_MODULE_TABS.filter((tab) => tab !== 'claimpaymentdatabase');
    const savedTab = localStorage.getItem('activePaintTab');
    if (savedTab && allowedTabs.includes(savedTab)) {
        return savedTab;
    }
    return CLAIM_DEFAULT_TAB;
};

const ClaimPaymentHeading = ({ username, userRoles = [] }) => {
    const isAdminClaim = username === 'Mahalingam M' || username === 'Admin';
    const allowedTabs = isAdminClaim
        ? CLAIM_MODULE_TABS
        : CLAIM_MODULE_TABS.filter((tab) => tab !== 'claimpaymentdatabase');

    const initialTab = getInitialClaimTab(username);
    const [activeTab, setActiveTab] = useState(() => initialTab);
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([initialTab]));
    const [refreshNonce, setRefreshNonce] = useState(0);
    const bumpRefresh = () => setRefreshNonce((n) => n + 1);

    useEffect(() => {
        setVisitedTabs((prev) => new Set(prev).add(activeTab));
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'claimpaymentdatabase' && !isAdminClaim) {
            setActiveTab('claimpaymentsummary');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, isAdminClaim]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        bumpRefresh();
    };

    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title expense-entry-tabs w-full max-w-full overflow-x-auto no-scrollbar">
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'claimpaymentsummary' ? 'active' : ''}`}
                    onClick={() => handleTabChange('claimpaymentsummary')}
                >
                    Summary
                </h2>
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'claimpaymenttableview' ? 'active' : ''}`}
                    onClick={() => handleTabChange('claimpaymenttableview')}
                >
                    Table View
                </h2>
                {isAdminClaim && (
                    <h2
                        className={`link whitespace-nowrap ${activeTab === 'claimpaymentdatabase' ? 'active' : ''}`}
                        onClick={() => handleTabChange('claimpaymentdatabase')}
                    >
                        Database
                    </h2>
                )}
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'claimpaymentcashregister' ? 'active' : ''}`}
                    onClick={() => handleTabChange('claimpaymentcashregister')}
                >
                    Cash Register
                </h2>
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'claimpaymentclaimhistory' ? 'active' : ''}`}
                    onClick={() => handleTabChange('claimpaymentclaimhistory')}
                >
                    Claim History
                </h2>
            </div>
            <div className="content">
                {visitedTabs.has('claimpaymentsummary') && (
                    <div className={activeTab === 'claimpaymentsummary' ? '' : 'hidden'}>
                        <ClaimPaymentSummary username={username} userRoles={userRoles} refreshSignal={refreshNonce} isActive={activeTab === 'claimpaymentsummary'} />
                    </div>
                )}
                {visitedTabs.has('claimpaymenttableview') && (
                    <div className={activeTab === 'claimpaymenttableview' ? '' : 'hidden'}>
                        <ClaimPaymentTableView username={username} userRoles={userRoles} refreshSignal={refreshNonce} />
                    </div>
                )}
                {isAdminClaim && visitedTabs.has('claimpaymentdatabase') && (
                    <div className={activeTab === 'claimpaymentdatabase' ? '' : 'hidden'}>
                        <ClaimPaymentDatabase username={username} userRoles={userRoles} refreshSignal={refreshNonce} isActive={activeTab === 'claimpaymentdatabase'} />
                    </div>
                )}
                {visitedTabs.has('claimpaymentcashregister') && (
                    <div className={activeTab === 'claimpaymentcashregister' ? '' : 'hidden'}>
                        <ClaimPaymentCashRegister refreshSignal={refreshNonce} isActive={activeTab === 'claimpaymentcashregister'} />
                    </div>
                )}
                {visitedTabs.has('claimpaymentclaimhistory') && (
                    <div className={activeTab === 'claimpaymentclaimhistory' ? '' : 'hidden'}>
                        <ClaimPaymentClaimHistory username={username} userRoles={userRoles} refreshSignal={refreshNonce} isActive={activeTab === 'claimpaymentclaimhistory'} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClaimPaymentHeading
