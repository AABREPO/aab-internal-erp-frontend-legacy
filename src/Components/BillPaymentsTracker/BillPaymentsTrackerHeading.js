import React, { useState, useEffect } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
import PendingBill from './PendingBill';
import BillDatabase from './BillDatabase';
import BillStatement from './BillStatement';
import MobileBillPaymentsTracker from '../../componentsMobile/BillPaymentsTracker/BillPaymentsTracker';
import { isMobileViewportWidth } from '../../constants/mobileBreakpoint';
import {
    BILL_PAYMENT_TRACKER_MODULE_NAME,
} from '../../utils/paymentModeArrangement';
import { usePaymentModeSelectOptionsForModule } from '../../utils/usePaymentModeArrangement';

const BILL_PAYMENTS_TAB_STORAGE_KEY = 'billPaymentsTrackerActiveTab';

const isValidBillPaymentsTab = (tab, canAccessDatabase) => {
    if (!tab || typeof tab !== 'string') return false;
    if (tab === 'pendingbill' || tab === 'billstatement') return true;
    if (tab === 'billdatabase') return !!canAccessDatabase;
    return false;
};

const getInitialBillPaymentsTab = (canAccessDatabase) => {
    let tab = localStorage.getItem(BILL_PAYMENTS_TAB_STORAGE_KEY);
    if (!isValidBillPaymentsTab(tab, canAccessDatabase)) {
        const legacy = localStorage.getItem('activePaintTab');
        if (isValidBillPaymentsTab(legacy, canAccessDatabase)) {
            tab = legacy;
        } else {
            tab = 'pendingbill';
        }
    }
    return tab;
};

const BillPaymentsTrackerHeadingDesktop = ({ username, userRoles = [] }) => {
    const canAccessDatabase = username === 'Mahalingam M' || username === 'Admin';
    const initialTab = getInitialBillPaymentsTab(canAccessDatabase);
    const [activeTab, setActiveTab] = useState(() => initialTab);
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([initialTab]));
    const [refreshNonce, setRefreshNonce] = useState(0);
    const paymentModeOptions = usePaymentModeSelectOptionsForModule(
        BILL_PAYMENT_TRACKER_MODULE_NAME,
        []
    );
    const bumpRefresh = () => setRefreshNonce((n) => n + 1);

    useEffect(() => {
        setVisitedTabs((prev) => new Set(prev).add(activeTab));
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'billdatabase' && !canAccessDatabase) {
            setActiveTab('pendingbill');
        } else {
            localStorage.setItem(BILL_PAYMENTS_TAB_STORAGE_KEY, activeTab);
        }
    }, [activeTab, canAccessDatabase]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        bumpRefresh();
    };

    return (
        <ModuleHeadingWrapper>
            <ModuleHeadingBar>
                <ModuleHeadingTab active={activeTab === 'pendingbill'} onClick={() => handleTabChange('pendingbill')}>
                    Pending Bill
                </ModuleHeadingTab>
                {canAccessDatabase && (
                    <ModuleHeadingTab active={activeTab === 'billdatabase'} onClick={() => handleTabChange('billdatabase')}>
                        Database
                    </ModuleHeadingTab>
                )}
                <ModuleHeadingTab active={activeTab === 'billstatement'} onClick={() => handleTabChange('billstatement')}>
                    Statement
                </ModuleHeadingTab>
            </ModuleHeadingBar>
            <div className="content">
                {visitedTabs.has('pendingbill') && (
                    <div className={activeTab === 'pendingbill' ? '' : 'hidden'}>
                        <PendingBill
                            username={username}
                            userRoles={userRoles}
                            paymentModeOptions={paymentModeOptions}
                            billPaymentsTabActive={activeTab === 'pendingbill'}
                            refreshSignal={refreshNonce}
                        />
                    </div>
                )}
                {canAccessDatabase && visitedTabs.has('billdatabase') && (
                    <div className={activeTab === 'billdatabase' ? '' : 'hidden'}>
                        <BillDatabase
                            username={username}
                            userRoles={userRoles}
                            paymentModeOptions={paymentModeOptions}
                            billPaymentsTabActive={activeTab === 'billdatabase'}
                            refreshSignal={refreshNonce}
                        />
                    </div>
                )}
                {visitedTabs.has('billstatement') && (
                    <div className={activeTab === 'billstatement' ? '' : 'hidden'}>
                        <BillStatement
                            username={username}
                            userRoles={userRoles}
                            paymentModeOptions={paymentModeOptions}
                            billPaymentsTabActive={activeTab === 'billstatement'}
                            refreshSignal={refreshNonce}
                        />
                    </div>
                )}
            </div>
        </ModuleHeadingWrapper>
    )
}

const BillPaymentsTrackerHeading = ({ username, userRoles = [], onLogout }) => {
    const [isMobile, setIsMobile] = useState(() => isMobileViewportWidth());
    useEffect(() => {
        const handleResize = () => setIsMobile(isMobileViewportWidth());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        const storedUserParsed = (() => {
            try {
                return JSON.parse(localStorage.getItem('user') || '{}');
            } catch {
                return {};
            }
        })();
        const user = {
            ...storedUserParsed,
            username,
            userRoles: Array.isArray(userRoles) && userRoles.length > 0 ? userRoles : (storedUserParsed?.userRoles ?? []),
        };
        return <MobileBillPaymentsTracker user={user} onLogout={onLogout} />;
    }

    return <BillPaymentsTrackerHeadingDesktop username={username} userRoles={userRoles} />;
};

export default BillPaymentsTrackerHeading
