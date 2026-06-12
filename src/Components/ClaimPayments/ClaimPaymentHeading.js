import React, { useState, useEffect } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
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
        <ModuleHeadingWrapper>
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'claimpaymentsummary'}
                    onClick={() => handleTabChange('claimpaymentsummary')}
                >
                    Summary
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'claimpaymenttableview'}
                    onClick={() => handleTabChange('claimpaymenttableview')}
                >
                    Table View
                </ModuleHeadingTab>
                {isAdminClaim && (
                    <ModuleHeadingTab
                        active={activeTab === 'claimpaymentdatabase'}
                        onClick={() => handleTabChange('claimpaymentdatabase')}
                    >
                        Database
                    </ModuleHeadingTab>
                )}
                <ModuleHeadingTab
                    active={activeTab === 'claimpaymentcashregister'}
                    onClick={() => handleTabChange('claimpaymentcashregister')}
                >
                    Cash Register
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'claimpaymentclaimhistory'}
                    onClick={() => handleTabChange('claimpaymentclaimhistory')}
                >
                    Claim History
                </ModuleHeadingTab>
            </ModuleHeadingBar>
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
        </ModuleHeadingWrapper>
    )
}

export default ClaimPaymentHeading
