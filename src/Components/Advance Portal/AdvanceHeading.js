import React, { useState, useEffect } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
import AdvancePortal from './AdvancePortal';
import AdvanceTableView from './AdvanceTableView';
import AdvanceDatabase from './AdvanceDatabase';
import AdvanceReport from './AdvanceReport';
import AdvanceSummary from './AdvanceSummary';
import MobileProjectAdvance from '../../componentsMobile/ProjectAdvance/ProjectAdvance';
import { isMobileViewportWidth } from '../../constants/mobileBreakpoint';
import {
  ADVANCE_PORTAL_MODULE_NAME,
} from '../../utils/paymentModeArrangement';
import { usePaymentModeSelectOptionsForModule } from '../../utils/usePaymentModeArrangement';

const DEFAULT_PAYMENT_MODE_OPTIONS = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Direct', label: 'Direct' },
];

const ADVANCE_MODULE_TABS = ['advanceportal', 'advacetablview', 'advancedatabase', 'advancereport', 'advancesummary'];
const ADVANCE_DEFAULT_TAB = 'advanceportal';

const getInitialAdvanceTab = (username) => {
    const isAdmin = username === 'Mahalingam M' || username === 'Admin' || username === 'Marimuthu A';
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
    const isAdminAdvance = username === 'Mahalingam M' || username === 'Admin' || username === 'Marimuthu A';
    const allowedTabs = isAdminAdvance
        ? ADVANCE_MODULE_TABS
        : ADVANCE_MODULE_TABS.filter((tab) => tab !== 'advancedatabase');

    const [isMobile, setIsMobile] = useState(() => isMobileViewportWidth());
    const [refreshNonce, setRefreshNonce] = useState(0);
    const paymentModeOptions = usePaymentModeSelectOptionsForModule(
        ADVANCE_PORTAL_MODULE_NAME,
        DEFAULT_PAYMENT_MODE_OPTIONS
    );
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
        <ModuleHeadingWrapper>
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'advanceportal'}
                    onClick={() => handleTabChange('advanceportal')}
                >
                    Advance
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'advacetablview'}
                    onClick={() => handleTabChange('advacetablview')}
                >
                    Table View
                </ModuleHeadingTab>
                {isAdminAdvance && (
                    <ModuleHeadingTab
                        active={activeTab === 'advancedatabase'}
                        onClick={() => handleTabChange('advancedatabase')}
                    >
                        Database
                    </ModuleHeadingTab>
                )}
                <ModuleHeadingTab
                    active={activeTab === 'advancereport'}
                    onClick={() => handleTabChange('advancereport')}
                >
                    Report
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'advancesummary'}
                    onClick={() => handleTabChange('advancesummary')}
                >
                    Summary
                </ModuleHeadingTab>
            </ModuleHeadingBar>
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
        </ModuleHeadingWrapper>
    )
}

export default AdvanceHeading
