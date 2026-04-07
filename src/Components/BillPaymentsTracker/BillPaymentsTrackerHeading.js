import React, { useState, useEffect } from 'react';
import PendingBill from './PendingBill';
import BillDatabase from './BillDatabase';
import BillStatement from './BillStatement';
import MobileBillPaymentsTracker from '../../componentsMobile/BillPaymentsTracker/BillPaymentsTracker';
import { isMobileViewportWidth } from '../../constants/mobileBreakpoint';

const BillPaymentsTrackerHeadingDesktop = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('activePaintTab');
        if (savedTab === 'billdatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            return 'pendingbill';
        }
        return savedTab || 'pendingbill';
    });
    useEffect(() => {
        if (activeTab === 'billdatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            setActiveTab('pendingbill');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, username]);
    const renderContent = () => {
        switch (activeTab) {
            case 'pendingbill':
                return <PendingBill username={username} userRoles={userRoles} />;
            case 'billdatabase':
                return <BillDatabase username={username} userRoles={userRoles} />;
            case 'billstatement':
                return <BillStatement username={username} userRoles={userRoles} />;
            default:
                return <PendingBill username={username} userRoles={userRoles}/>;
        }
    };
    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'pendingbill' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pendingbill')}
                >
                    Pending Bill
                </h2>
                {(username === 'Mahalingam M' || username === 'Admin') && (
                    <h2
                        className={`link ${activeTab === 'billdatabase' ? 'active' : ''}`}
                        onClick={() => setActiveTab('billdatabase')}
                    >
                        Database
                    </h2>
                )}
                <h2
                    className={`link ${activeTab === 'billstatement' ? 'active' : ''}`}
                    onClick={() => setActiveTab('billstatement')}
                >
                    Statement
                </h2>
            </div>
            <div className="content">
                {renderContent()}
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