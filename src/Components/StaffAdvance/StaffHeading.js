import React, { useState, useEffect } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
import StaffAdvance from './StaffAdvance';
import StaffTableview from './StaffTableview';
import StaffDatabase from './StaffDatabase';
import StaffReport from './StaffReport';
import StaffSummary from './StaffSummary';
import StaffAddInput from './StaffAddInput';
import MobileStaffAdvance from '../../componentsMobile/StaffAdvance/StaffAdvance';
import { isMobileViewportWidth } from '../../constants/mobileBreakpoint';
import {
    STAFF_ADVANCE_MODULE_NAME,
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

const STAFF_MODULE_TABS = ['staffAdvance', 'staffTablview', 'staffDatabase', 'staffInput', 'staffReport', 'staffSummary'];
const STAFF_DEFAULT_TAB = 'staffAdvance';

const getInitialStaffTab = (username) => {
    const isAdmin = username === 'Mahalingam M' || username === 'Admin' || username === 'Marimuthu A';
    const allowedTabs = isAdmin
        ? STAFF_MODULE_TABS
        : STAFF_MODULE_TABS.filter((tab) => tab !== 'staffDatabase');
    const savedTab = localStorage.getItem('activePaintTab');
    if (savedTab && allowedTabs.includes(savedTab)) {
        return savedTab;
    }
    return STAFF_DEFAULT_TAB;
};

const StaffHeading = ({ username, userRoles = [] }) => {
    const isAdminStaff = username === 'Mahalingam M' || username === 'Admin' || username === 'Marimuthu A';
    const allowedTabs = isAdminStaff
        ? STAFF_MODULE_TABS
        : STAFF_MODULE_TABS.filter((tab) => tab !== 'staffDatabase');

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

    const paymentModeOptions = usePaymentModeSelectOptionsForModule(
        STAFF_ADVANCE_MODULE_NAME,
        DEFAULT_PAYMENT_MODE_OPTIONS
    );

    const initialTab = getInitialStaffTab(username);
    const [activeTab, setActiveTab] = useState(() => initialTab);
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([initialTab]));

    useEffect(() => {
        setVisitedTabs((prev) => new Set(prev).add(activeTab));
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'staffDatabase' && !isAdminStaff) {
            setActiveTab('staffAdvance');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, isAdminStaff]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        bumpRefresh();
    };

    if (isMobile) {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : { username, userRoles };
        return (
            <div style={{ textAlign: 'left' }}>
                <MobileStaffAdvance user={user} onLogout={() => { }} />
            </div>
        );
    }

    return (
        <ModuleHeadingWrapper>
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'staffAdvance'}
                    onClick={() => handleTabChange('staffAdvance')}
                >
                    Advance
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'staffTablview'}
                    onClick={() => handleTabChange('staffTablview')}
                >
                    Table View
                </ModuleHeadingTab>
                {isAdminStaff && (
                    <ModuleHeadingTab
                        active={activeTab === 'staffDatabase'}
                        onClick={() => handleTabChange('staffDatabase')}
                    >
                        Database
                    </ModuleHeadingTab>
                )}
                <ModuleHeadingTab
                    active={activeTab === 'staffInput'}
                    onClick={() => handleTabChange('staffInput')}
                >
                    Input Data
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'staffReport'}
                    onClick={() => handleTabChange('staffReport')}
                >
                    Report
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'staffSummary'}
                    onClick={() => handleTabChange('staffSummary')}
                >
                    Summary
                </ModuleHeadingTab>
            </ModuleHeadingBar>
            <div className="content">
                {visitedTabs.has('staffAdvance') && (
                    <div className={activeTab === 'staffAdvance' ? '' : 'hidden'}>
                        <StaffAdvance username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'staffAdvance'} />
                    </div>
                )}
                {visitedTabs.has('staffTablview') && (
                    <div className={activeTab === 'staffTablview' ? '' : 'hidden'}>
                        <StaffTableview username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'staffTablview'} />
                    </div>
                )}
                {isAdminStaff && visitedTabs.has('staffDatabase') && (
                    <div className={activeTab === 'staffDatabase' ? '' : 'hidden'}>
                        <StaffDatabase username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'staffDatabase'} />
                    </div>
                )}
                {visitedTabs.has('staffInput') && (
                    <div className={activeTab === 'staffInput' ? '' : 'hidden'}>
                        <StaffAddInput username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />
                    </div>
                )}
                {visitedTabs.has('staffReport') && (
                    <div className={activeTab === 'staffReport' ? '' : 'hidden'}>
                        <StaffReport username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'staffReport'} />
                    </div>
                )}
                {visitedTabs.has('staffSummary') && (
                    <div className={activeTab === 'staffSummary' ? '' : 'hidden'}>
                        <StaffSummary username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'staffSummary'} />
                    </div>
                )}
            </div>
        </ModuleHeadingWrapper>
    );
};

export default StaffHeading;
