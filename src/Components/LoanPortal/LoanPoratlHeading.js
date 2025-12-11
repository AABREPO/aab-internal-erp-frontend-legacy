import React, { useState, useEffect } from 'react';
import LoanTableview from './LoanTableview';
import LoanDatabase from './LoanDatabase';
import LoanAddInput from './LoanAddInput';
import LoanPortal from './LoanPortal';
import LoanReport from './LoanReport';
import LoanSummary from './LoanSummary';

// Payment Mode options
const paymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Advance Transfer', label: 'Advance Transfer' }
];

const LoanPoratlHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('activePaintTab');
        if (savedTab === 'loandatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            return 'loanportal';
        }
        return savedTab || 'loanportal';
    });

    // Mobile accordion state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (activeTab === 'loandatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            setActiveTab('loanportal');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, username]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false); // Close menu after selection on mobile
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'loanportal':
                return <LoanPortal username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'loantableview':
                return <LoanTableview username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'loandatabase':
                return <LoanDatabase username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'loanaddinput':
                return <LoanAddInput username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'loanreport':
                return <LoanReport username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'loansummary':
                return <LoanSummary username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            default:
                return <LoanPortal paymentModeOptions={paymentModeOptions} />;
        }
    };
    // Get the current active tab label
    const getActiveTabLabel = () => {
        switch (activeTab) {
            case 'loanportal':
                return 'Loan';
            case 'loantableview':
                return 'Table View';
            case 'loandatabase':
                return 'Database';
            case 'loanaddinput':
                return 'Add Input';
            case 'loanreport':
                return 'Report';
            case 'loansummary':
                return 'Summary';
            default:
                return 'Loan';
        }
    };

    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen overflow-auto">

            {/* Fixed border wrapper */}
            <div className="w-full xl:px-0 px-5">

                {/* Scrolling headings only */}
                <div className="w-full overflow-x-auto no-scrollbar xl:px-0">

                    <div className="topbar-title flex flex-nowrap xl:flex-wrap min-w-max xl:min-w-0">
                        <h2 className={`link ${activeTab === 'loanportal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('loanportal')}>
                            Loan
                        </h2>

                        <h2 className={`link ${activeTab === 'loantableview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('loantableview')}>
                            Table View
                        </h2>

                        {(username === 'Mahalingam M' || username === 'Admin') && (
                            <h2 className={`link ${activeTab === 'loandatabase' ? 'active' : ''}`}
                                onClick={() => setActiveTab('loandatabase')}>
                                Database
                            </h2>
                        )}

                        <h2 className={`link ${activeTab === 'loanaddinput' ? 'active' : ''}`}
                            onClick={() => setActiveTab('loanaddinput')}>
                            Add Input
                        </h2>

                        <h2 className={`link ${activeTab === 'loanreport' ? 'active' : ''}`}
                            onClick={() => setActiveTab('loanreport')}>
                            Report
                        </h2>

                        <h2 className={`link ${activeTab === 'loansummary' ? 'active' : ''}`}
                            onClick={() => setActiveTab('loansummary')}>
                            Summary
                        </h2>
                    </div>

                </div>
            </div>

            <div className="content">
                {renderContent()}
            </div>

        </div>


    )
}

export default LoanPoratlHeading
