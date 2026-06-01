import React, { useState, useEffect } from 'react';
import '../Heading.css';
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
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([activeTab]));

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        setVisitedTabs((prev) => new Set(prev).add(activeTab));
    }, [activeTab]);

    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title expense-entry-tabs w-full max-w-full overflow-x-auto no-scrollbar">
                <h2 className={`link whitespace-nowrap ${activeTab === 'weeklypayment' ? 'active' : ''}`} onClick={() => setActiveTab('weeklypayment')}>
                    Weekly Payment
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'dailypayment' ? 'active' : ''}`} onClick={() => setActiveTab('dailypayment')}>
                    Daily Payment
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'weeklyhistory' ? 'active' : ''}`} onClick={() => setActiveTab('weeklyhistory')}>
                   Weekly History
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'dailyhistory' ? 'active' : ''}`} onClick={() => setActiveTab('dailyhistory')}>
                    Daily History
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'handoverpaymentspage' ? 'active' : ''}`} onClick={() => setActiveTab('handoverpaymentspage')} >
                    Handover
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'weeklypaymentaddinput' ? 'active' : ''}`} onClick={() => setActiveTab('weeklypaymentaddinput')} >
                    Add Input
                </h2>
            </div>
            <div className="content">
                {visitedTabs.has('weeklypayment') && (
                    <div className={activeTab === 'weeklypayment' ? '' : 'hidden'}>
                        <WeeklyPayment username={username} userRoles={userRoles} />
                    </div>
                )}
                {visitedTabs.has('dailypayment') && (
                    <div className={activeTab === 'dailypayment' ? '' : 'hidden'}>
                        <DailyPayment username={username} userRoles={userRoles} />
                    </div>
                )}
                {visitedTabs.has('dailyhistory') && (
                    <div className={activeTab === 'dailyhistory' ? '' : 'hidden'}>
                        <DailyHistory username={username} userRoles={userRoles} />
                    </div>
                )}
                {visitedTabs.has('weeklyhistory') && (
                    <div className={activeTab === 'weeklyhistory' ? '' : 'hidden'}>
                        <History username={username} userRoles={userRoles} />
                    </div>
                )}
                {visitedTabs.has('handoverpaymentspage') && (
                    <div className={activeTab === 'handoverpaymentspage' ? '' : 'hidden'}>
                        <HandoverPaymentsPage username={username} userRoles={userRoles} />
                    </div>
                )}
                {visitedTabs.has('weeklypaymentaddinput') && (
                    <div className={activeTab === 'weeklypaymentaddinput' ? '' : 'hidden'}>
                        <WeeklyPaymentAddInput username={username} userRoles={userRoles} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default WHeading
