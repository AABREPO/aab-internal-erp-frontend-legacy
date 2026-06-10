import React, { useState, useEffect } from 'react';
import '../Heading.css';
import AdvancePortal from './AdvancePortal';
import AdvanceTableView from './AdvanceTableView';
import AdvanceDatabase from './AdvanceDatabase';
import AdvanceReport from './AdvanceReport';
import AdvanceSummary from './AdvanceSummary';
import MobileProjectAdvance from '../../componentsMobile/ProjectAdvance/ProjectAdvance';
import { isMobileViewportWidth } from '../../constants/mobileBreakpoint';

// Payment Mode options
const paymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Direct', label:'Direct'}
];

const ADVANCE_MODULE_TABS = ['advanceportal', 'advacetablview', 'advancedatabase', 'advancereport', 'advancesummary'];
const ADVANCE_DEFAULT_TAB = 'advanceportal';

const getInitialAdvanceTab = (username) => {
    const isAdmin = username === 'Mahalingam M' || username === 'Admin';
    const allowedTabs = isAdmin
        ? ADVANCE_MODULE_TABS
        : ADVANCE_MODULE_TABS.filter((tab) => tab !== 'advancedatabase');
    const savedTab = localStorage.getItem('activePaintTab');
    if (savedTab && allowedTabs.includes(savedTab)) {
        return savedTab;
    }
    return ADVANCE_DEFAULT_TAB;
};

const AdvanceHeading = ({ username, userRoles = [] }) => {
    const isAdminAdvance = username === 'Mahalingam M' || username === 'Admin';
    const allowedTabs = isAdminAdvance
        ? ADVANCE_MODULE_TABS
        : ADVANCE_MODULE_TABS.filter((tab) => tab !== 'advancedatabase');

    const [isMobile, setIsMobile] = useState(() => isMobileViewportWidth());
    const [refreshNonce, setRefreshNonce] = useState(0);
    const bumpRefresh = () => setRefreshNonce((n) => n + 1);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileViewportWidth());
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const initialTab = getInitialAdvanceTab(username);
    const [activeTab, setActiveTab] = useState(() => initialTab);
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([initialTab]));

    useEffect(() => {
        setVisitedTabs((prev) => new Set(prev).add(activeTab));
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'advancedatabase' && !isAdminAdvance) {
            setActiveTab('advanceportal');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, isAdminAdvance]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        bumpRefresh();
    };

    if (isMobile) {
        const storedUser = localStorage.getItem('user');
        const storedUserParsed = storedUser ? JSON.parse(storedUser) : {};
        const user = {
            ...storedUserParsed,
            username,
            // Prefer roles provided from `App.js` props; fall back to localStorage if missing.
            userRoles: Array.isArray(userRoles) && userRoles.length > 0 ? userRoles : (storedUserParsed?.userRoles ?? []),
        };
        return (
            <div style={{ textAlign: 'left' }}>
                <MobileProjectAdvance user={user} onLogout={() => { }} />
            </div>
        );
    }

    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title expense-entry-tabs w-full max-w-full overflow-x-auto no-scrollbar">
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'advanceportal' ? 'active' : ''}`}
                    onClick={() => handleTabChange('advanceportal')}
                >
                    Advance
                </h2>
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'advacetablview' ? 'active' : ''}`}
                    onClick={() => handleTabChange('advacetablview')}
                >
                    Table View
                </h2>
                {isAdminAdvance && (
                    <h2
                        className={`link whitespace-nowrap ${activeTab === 'advancedatabase' ? 'active' : ''}`}
                        onClick={() => handleTabChange('advancedatabase')}
                    >
                        Database
                    </h2>
                )}
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'advancereport' ? 'active' : ''}`}
                    onClick={() => handleTabChange('advancereport')}
                >
                    Report
                </h2>
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'advancesummary' ? 'active' : ''}`}
                    onClick={() => handleTabChange('advancesummary')}
                >
                    Summary
                </h2>
            </div>
            <div className="content">
                {visitedTabs.has('advanceportal') && (
                    <div className={activeTab === 'advanceportal' ? '' : 'hidden'}>
                        <AdvancePortal username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'advanceportal'} />
                    </div>
                )}
                {visitedTabs.has('advacetablview') && (
                    <div className={activeTab === 'advacetablview' ? '' : 'hidden'}>
                        <AdvanceTableView username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'advacetablview'} />
                    </div>
                )}
                {isAdminAdvance && visitedTabs.has('advancedatabase') && (
                    <div className={activeTab === 'advancedatabase' ? '' : 'hidden'}>
                        <AdvanceDatabase username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'advancedatabase'} />
                    </div>
                )}
                {visitedTabs.has('advancereport') && (
                    <div className={activeTab === 'advancereport' ? '' : 'hidden'}>
                        <AdvanceReport username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'advancereport'} />
                    </div>
                )}
                {visitedTabs.has('advancesummary') && (
                    <div className={activeTab === 'advancesummary' ? '' : 'hidden'}>
                        <AdvanceSummary username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'advancesummary'} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdvanceHeading
