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

    useEffect(() => {
        if (activeTab === 'loandatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            setActiveTab('loanportal');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, username]);

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
    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
            <div className="topbar-title flex gap-[20px] w-[865px] flex-nowrap">
                <div className="flex-shrink-0">
                    <h2
                        className={`link ${activeTab === 'loanportal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('loanportal')}
                    >
                        Loan
                    </h2>
                </div>
                <div className="flex-shrink-0">
                    <h2
                        className={`link ${activeTab === 'loantableview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('loantableview')}
                    >
                        Table View
                    </h2>
                </div>
                {(username === 'Mahalingam M' || username === 'Admin') && (
                    <div className="flex-shrink-0">
                        <h2
                            className={`link ${activeTab === 'loandatabase' ? 'active' : ''}`}
                            onClick={() => setActiveTab('loandatabase')}
                        >
                            Database
                        </h2>
                    </div>
                )}
                <div className="flex-shrink-0">
                    <h2
                        className={`link ${activeTab === 'loanaddinput' ? 'active' : ''}`}
                        onClick={() => setActiveTab('loanaddinput')}
                    >
                        Add Input
                    </h2>
                </div>
                <div className="flex-shrink-0">
                    <h2
                        className={`link ${activeTab === 'loanreport' ? 'active' : ''}`}
                        onClick={() => setActiveTab('loanreport')}
                    >
                        Report
                    </h2>
                </div>
                <div className="flex-shrink-0">
                    <h2
                        className={`link ${activeTab === 'loansummary' ? 'active' : ''}`}
                        onClick={() => setActiveTab('loansummary')}
                    >
                        Summary
                    </h2>
                </div>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    )
}

export default LoanPoratlHeading
