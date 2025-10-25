import React, { useState, useEffect } from 'react';
import WeeklyPayment from './WeeklyPayment';
import History from './WeeklyPaymentHistory';
import HandoverPaymentsPage from './WeeklyPaymentHandover';
import DailyPayment from './DailyPayment';
import WeeklyPaymentAddInput from './WeeklyPaymentAddInput';
import DailyHistory from './DailyHistory';
const WHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'claimpaymentsummary'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'weeklypayment':
                return <WeeklyPayment username={username} userRoles={userRoles} />;
            case 'dailypayment':
                return <DailyPayment username={username} userRoles={userRoles} />;
            case 'dailyhistory':
                return <DailyHistory username={username} userRoles={userRoles} />;
            case 'weeklyhistory':
                return <History username={username} userRoles={userRoles} />;
            case 'handoverpaymentspage':
                return <HandoverPaymentsPage username={username} userRoles={userRoles} />;
            case 'weeklypaymentaddinput':
                return <WeeklyPaymentAddInput username={username} userRoles={userRoles} />;
            default:
                return <WeeklyPayment />;
        }
    };
    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'weeklypayment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('weeklypayment')}
                >
                    Weekly Payment
                </h2>
                <h2
                    className={`link ${activeTab === 'dailypayment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dailypayment')}
                >
                    Daily Payment
                </h2>
                <h2
                    className={`link ${activeTab === 'weeklyhistory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('weeklyhistory')}
                >
                    History
                </h2>
                <h2
                    className={`link ${activeTab === 'dailyhistory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dailyhistory')}
                >
                    Daily History
                </h2>
                <h2
                    className={`link ${activeTab === 'handoverpaymentspage' ? 'active' : ''}`}
                    onClick={() => setActiveTab('handoverpaymentspage')}
                >
                    Handover
                </h2>                
                <h2
                    className={`link ${activeTab === 'weeklypaymentaddinput' ? 'active' : ''}`}
                    onClick={() => setActiveTab('weeklypaymentaddinput')}
                >
                    Add Input
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    )
}

export default WHeading