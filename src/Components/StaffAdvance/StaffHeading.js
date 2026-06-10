import React, { useState, useEffect } from 'react';
import '../Heading.css';
import StaffAdvance from './StaffAdvance';
import StaffTableview from './StaffTableview';
import StaffDatabase from './StaffDatabase';
import StaffReport from './StaffReport';
import StaffSummary from './StaffSummary';
import StaffAddInput from './StaffAddInput';
import MobileStaffAdvance from '../../componentsMobile/StaffAdvance/StaffAdvance';
import { isMobileViewportWidth } from '../../constants/mobileBreakpoint';

const defaultPaymentModeOptions = [
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
    const isAdmin = username === 'Mahalingam M' || username === 'Admin';
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
    const isAdminStaff = username === 'Mahalingam M' || username === 'Admin';
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

    const [paymentModeOptions, setPaymentModeOptions] = useState(defaultPaymentModeOptions);
    useEffect(() => {
        const fetchPaymentModes = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/payment_mode/getAll');
                if (response.ok) {
                    const data = await response.json();
                    const formattedOptions = data.map((mode) => ({
                        value: mode.modeOfPayment,
                        label: mode.modeOfPayment,
                    }));
                    setPaymentModeOptions(formattedOptions);
                }
            } catch (error) {
                console.error('Error fetching payment modes:', error);
            }
        };
        fetchPaymentModes();
    }, []);

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
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen overflow-auto">
            <div className="w-full xl:px-0 px-5">
                <div className="w-full overflow-x-auto no-scrollbar xl:px-0">
                    <div className="topbar-title flex flex-nowrap xl:flex-wrap min-w-max xl:min-w-0">
                        <h2
                            className={`link ${activeTab === 'staffAdvance' ? 'active' : ''}`}
                            onClick={() => handleTabChange('staffAdvance')}
                        >
                            Advance
                        </h2>
                        <h2
                            className={`link ${activeTab === 'staffTablview' ? 'active' : ''}`}
                            onClick={() => handleTabChange('staffTablview')}
                        >
                            Table View
                        </h2>
                        {isAdminStaff && (
                            <h2
                                className={`link ${activeTab === 'staffDatabase' ? 'active' : ''}`}
                                onClick={() => handleTabChange('staffDatabase')}
                            >
                                Database
                            </h2>
                        )}
                        <h2
                            className={`link ${activeTab === 'staffInput' ? 'active' : ''}`}
                            onClick={() => handleTabChange('staffInput')}
                        >
                            Add Input
                        </h2>
                        <h2
                            className={`link ${activeTab === 'staffReport' ? 'active' : ''}`}
                            onClick={() => handleTabChange('staffReport')}
                        >
                            Report
                        </h2>
                        <h2
                            className={`link ${activeTab === 'staffSummary' ? 'active' : ''}`}
                            onClick={() => handleTabChange('staffSummary')}
                        >
                            Summary
                        </h2>
                    </div>
                </div>
            </div>
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
        </div>
    );
};

export default StaffHeading;
