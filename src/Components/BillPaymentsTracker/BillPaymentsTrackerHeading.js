import React, { useState, useEffect, useRef } from 'react';
import '../Heading.css';
import PendingBill from './PendingBill';
import BillDatabase from './BillDatabase';
import BillStatement from './BillStatement';
import MobileBillPaymentsTracker from '../../componentsMobile/BillPaymentsTracker/BillPaymentsTracker';
import { isMobileViewportWidth } from '../../constants/mobileBreakpoint';

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
    const [activeTab, setActiveTab] = useState(() => getInitialBillPaymentsTab(canAccessDatabase));
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([getInitialBillPaymentsTab(canAccessDatabase)]));

    useEffect(() => {
        if (activeTab === 'billdatabase' && !canAccessDatabase) {
            setActiveTab('pendingbill');
        } else {
            localStorage.setItem(BILL_PAYMENTS_TAB_STORAGE_KEY, activeTab);
        }
    }, [activeTab, canAccessDatabase]);

    useEffect(() => {
        setVisitedTabs((prev) => new Set(prev).add(activeTab));
    }, [activeTab]);

    const statementEverOpenedRef = useRef(activeTab === 'billstatement');
    const [statementMounted, setStatementMounted] = useState(() => activeTab === 'billstatement');

    useEffect(() => {
        if (activeTab !== 'billstatement') return;
        if (statementEverOpenedRef.current) return;
        statementEverOpenedRef.current = true;
        setStatementMounted(true);
    }, [activeTab]);

    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title expense-entry-tabs w-full max-w-full overflow-x-auto no-scrollbar">
                <h2 className={`link whitespace-nowrap ${activeTab === 'pendingbill' ? 'active' : ''}`} onClick={() => setActiveTab('pendingbill')}>
                    Pending Bill
                </h2>
                {canAccessDatabase && (
                    <h2 className={`link whitespace-nowrap ${activeTab === 'billdatabase' ? 'active' : ''}`} onClick={() => setActiveTab('billdatabase')} >
                        Database
                    </h2>
                )}
                <h2 className={`link whitespace-nowrap ${activeTab === 'billstatement' ? 'active' : ''}`} onClick={() => setActiveTab('billstatement')} >
                    Statement
                </h2>
            </div>
            <div className="content">
                {visitedTabs.has('pendingbill') && (
                    <div className={activeTab === 'pendingbill' ? '' : 'hidden'}>
                        <PendingBill
                            username={username}
                            userRoles={userRoles}
                            billPaymentsTabActive={activeTab === 'pendingbill'}
                        />
                    </div>
                )}
                {canAccessDatabase && visitedTabs.has('billdatabase') && (
                    <div className={activeTab === 'billdatabase' ? '' : 'hidden'}>
                        <BillDatabase
                            username={username}
                            userRoles={userRoles}
                            billPaymentsTabActive={activeTab === 'billdatabase'}
                        />
                    </div>
                )}
                {statementMounted && visitedTabs.has('billstatement') && (
                    <div className={activeTab === 'billstatement' ? '' : 'hidden'}>
                        <BillStatement
                            username={username}
                            userRoles={userRoles}
                            billPaymentsTabActive={activeTab === 'billstatement'}
                        />
                    </div>
                )}
            </div>
        </div>
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
