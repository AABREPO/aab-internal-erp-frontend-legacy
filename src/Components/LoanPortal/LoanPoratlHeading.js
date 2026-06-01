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
    const [isMobile, setIsMobile] = useState(() => isMobileViewportWidth());
    const isAdminLoan = username === 'Mahalingam M' || username === 'Admin';

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileViewportWidth());
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const [activeTab, setActiveTab] = useState(() => getInitialLoanTab(username));
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([getInitialLoanTab(username)]));

    useEffect(() => {
        if (activeTab === 'loandatabase' && !isAdminLoan) {
            setActiveTab('loanportal');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, isAdminLoan]);

    useEffect(() => {
        setVisitedTabs((prev) => new Set(prev).add(activeTab));
    }, [activeTab]);

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
                    onClick={() => setActiveTab('loanportal')}
                >
                    Loan
                </h2>
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'loantableview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loantableview')}
                >
                    Table View
                </h2>
                {isAdminLoan && (
                    <h2
                        className={`link whitespace-nowrap ${activeTab === 'loandatabase' ? 'active' : ''}`}
                        onClick={() => setActiveTab('loandatabase')}
                    >
                        Database
                    </h2>
                )}
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'loanaddinput' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loanaddinput')}
                >
                    Add Input
                </h2>
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'loanreport' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loanreport')}
                >
                    Report
                </h2>
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'loansummary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loansummary')}
                >
                    Summary
                </h2>
            </div>
            <div className="content">
                {visitedTabs.has('loanportal') && (
                    <div className={activeTab === 'loanportal' ? '' : 'hidden'}>
                        <LoanPortal username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />
                    </div>
                )}
                {visitedTabs.has('loantableview') && (
                    <div className={activeTab === 'loantableview' ? '' : 'hidden'}>
                        <LoanTableview username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />
                    </div>
                )}
                {isAdminLoan && visitedTabs.has('loandatabase') && (
                    <div className={activeTab === 'loandatabase' ? '' : 'hidden'}>
                        <LoanDatabase username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />
                    </div>
                )}
                {visitedTabs.has('loanaddinput') && (
                    <div className={activeTab === 'loanaddinput' ? '' : 'hidden'}>
                        <LoanAddInput username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />
                    </div>
                )}
                {visitedTabs.has('loanreport') && (
                    <div className={activeTab === 'loanreport' ? '' : 'hidden'}>
                        <LoanReport username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />
                    </div>
                )}
                {visitedTabs.has('loansummary') && (
                    <div className={activeTab === 'loansummary' ? '' : 'hidden'}>
                        <LoanSummary username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default LoanPoratlHeading
