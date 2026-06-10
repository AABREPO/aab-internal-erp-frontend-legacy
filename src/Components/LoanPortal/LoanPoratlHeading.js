import React, { useState, useEffect } from 'react';
import '../Heading.css';
import LoanTableview from './LoanTableview';
import LoanDatabase from './LoanDatabase';
import LoanAddInput from './LoanAddInput';
import LoanPortal from './LoanPortal';
import LoanReport from './LoanReport';
import LoanSummary from './LoanSummary';
import MobileLoanPortal from '../../componentsMobile/LoanPortal/LoanPortal';
import { isMobileViewportWidth } from '../../constants/mobileBreakpoint';

// Payment Mode options
const paymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Advance Transfer', label: 'Advance Transfer' }
];

const LOAN_MODULE_TABS = ['loanportal', 'loantableview', 'loandatabase', 'loanaddinput', 'loanreport', 'loansummary'];
const LOAN_DEFAULT_TAB = 'loanportal';

const getInitialLoanTab = (username) => {
    const isAdmin = username === 'Mahalingam M' || username === 'Admin';
    const allowedTabs = isAdmin
        ? LOAN_MODULE_TABS
        : LOAN_MODULE_TABS.filter((tab) => tab !== 'loandatabase');
    const savedTab = localStorage.getItem('activePaintTab');
    if (savedTab && allowedTabs.includes(savedTab)) {
        return savedTab;
    }
    return LOAN_DEFAULT_TAB;
};

const LoanPoratlHeading = ({ username, userRoles = [] }) => {
    const isAdminLoan = username === 'Mahalingam M' || username === 'Admin';
    const allowedTabs = isAdminLoan
        ? LOAN_MODULE_TABS
        : LOAN_MODULE_TABS.filter((tab) => tab !== 'loandatabase');

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

    const initialTab = getInitialLoanTab(username);
    const [activeTab, setActiveTab] = useState(() => initialTab);
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([initialTab]));

    useEffect(() => {
        setVisitedTabs((prev) => new Set(prev).add(activeTab));
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'loandatabase' && !isAdminLoan) {
            setActiveTab('loanportal');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, isAdminLoan]);

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
                <MobileLoanPortal user={user} onLogout={() => { }} />
            </div>
        );
    }

    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title expense-entry-tabs w-full max-w-full overflow-x-auto no-scrollbar">
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'loanportal' ? 'active' : ''}`}
                    onClick={() => handleTabChange('loanportal')}
                >
                    Loan
                </h2>
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'loantableview' ? 'active' : ''}`}
                    onClick={() => handleTabChange('loantableview')}
                >
                    Table View
                </h2>
                {isAdminLoan && (
                    <h2
                        className={`link whitespace-nowrap ${activeTab === 'loandatabase' ? 'active' : ''}`}
                        onClick={() => handleTabChange('loandatabase')}
                    >
                        Database
                    </h2>
                )}
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'loanaddinput' ? 'active' : ''}`}
                    onClick={() => handleTabChange('loanaddinput')}
                >
                    Add Input
                </h2>
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'loanreport' ? 'active' : ''}`}
                    onClick={() => handleTabChange('loanreport')}
                >
                    Report
                </h2>
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'loansummary' ? 'active' : ''}`}
                    onClick={() => handleTabChange('loansummary')}
                >
                    Summary
                </h2>
            </div>
            <div className="content">
                {visitedTabs.has('loanportal') && (
                    <div className={activeTab === 'loanportal' ? '' : 'hidden'}>
                        <LoanPortal username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'loanportal'} />
                    </div>
                )}
                {visitedTabs.has('loantableview') && (
                    <div className={activeTab === 'loantableview' ? '' : 'hidden'}>
                        <LoanTableview username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'loantableview'} />
                    </div>
                )}
                {isAdminLoan && visitedTabs.has('loandatabase') && (
                    <div className={activeTab === 'loandatabase' ? '' : 'hidden'}>
                        <LoanDatabase username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'loandatabase'} />
                    </div>
                )}
                {visitedTabs.has('loanaddinput') && (
                    <div className={activeTab === 'loanaddinput' ? '' : 'hidden'}>
                        <LoanAddInput username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />
                    </div>
                )}
                {visitedTabs.has('loanreport') && (
                    <div className={activeTab === 'loanreport' ? '' : 'hidden'}>
                        <LoanReport username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} />
                    </div>
                )}
                {visitedTabs.has('loansummary') && (
                    <div className={activeTab === 'loansummary' ? '' : 'hidden'}>
                        <LoanSummary username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} isActive={activeTab === 'loansummary'} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default LoanPoratlHeading
