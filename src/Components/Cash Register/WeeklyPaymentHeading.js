import React, { useState, useEffect } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
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
        <ModuleHeadingWrapper>
            <ModuleHeadingBar>
                <ModuleHeadingTab active={activeTab === 'weeklypayment'} onClick={() => setActiveTab('weeklypayment')}>
                    Weekly Payment
                </ModuleHeadingTab>
                <ModuleHeadingTab active={activeTab === 'dailypayment'} onClick={() => setActiveTab('dailypayment')}>
                    Daily Payment
                </ModuleHeadingTab>
                <ModuleHeadingTab active={activeTab === 'weeklyhistory'} onClick={() => setActiveTab('weeklyhistory')}>
                   Weekly History
                </ModuleHeadingTab>
                <ModuleHeadingTab active={activeTab === 'dailyhistory'} onClick={() => setActiveTab('dailyhistory')}>
                    Daily History
                </ModuleHeadingTab>
                <ModuleHeadingTab active={activeTab === 'handoverpaymentspage'} onClick={() => setActiveTab('handoverpaymentspage')}>
                    Handover
                </ModuleHeadingTab>
                <ModuleHeadingTab active={activeTab === 'weeklypaymentaddinput'} onClick={() => setActiveTab('weeklypaymentaddinput')}>
                    Add Input
                </ModuleHeadingTab>
            </ModuleHeadingBar>
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
        </ModuleHeadingWrapper>
    )
}

export default WHeading
