import React, { useState, useEffect } from 'react';
import './Heading.css';
import Form from './ExpensesEntry/Form';
import Tableview from './ExpensesEntry/TableViewExpense';
import Database from './ExpensesEntry/DatabaseExpenses';
import DatabaseExpenseHistoryLog from './ExpensesEntry/DatabaseExpenseHistoryLog';
import ExpensesAddInput from './ExpensesEntry/ExpensesInputData';
import EntryChecking from './ExpensesEntry/EntryCheck';
import WeeklyPaymentHistory from './Cash Register/WeeklyPaymentHistory';
import DailyHistory from './Cash Register/DailyHistory';

const isAdminExpenseUser = (u) => u === 'Mahalingam M' || u === 'Admin' || u === 'Marimuthu A';

const getInitialExpenseTab = (username) => {
    const prefillData = localStorage.getItem('expenseEntryPrefill');
    if (prefillData) {
        return 'expense-entry';
    }
    const savedTab = localStorage.getItem('activeTab');
    if ((savedTab === 'database' || savedTab === 'databaseHistory') && !isAdminExpenseUser(username)) {
        return 'expense-entry';
    }
    return savedTab || 'expense-entry';
};

const Heading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(() => getInitialExpenseTab(username));
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([getInitialExpenseTab(username)]));
    const isAdminExpense = isAdminExpenseUser(username);

    useEffect(() => {
        if ((activeTab === 'database' || activeTab === 'databaseHistory') && !isAdminExpense) {
            setActiveTab('expense-entry');
        } else {
            localStorage.setItem('activeTab', activeTab);
        }
    }, [activeTab, username, isAdminExpense]);

    useEffect(() => {
        setVisitedTabs((prev) => new Set(prev).add(activeTab));
    }, [activeTab]);

    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title expense-entry-tabs w-fit max-w-full overflow-x-auto no-scrollbar pt-4 pb-[12px] pr-4">
                <h2 className={`link whitespace-nowrap ${activeTab === 'expense-entry' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expense-entry')}>
                    Form
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'tableview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tableview')}>
                    Table View
                </h2>
                {isAdminExpense && (
                    <>
                        <h2 className={`link whitespace-nowrap ${activeTab === 'database' ? 'active' : ''}`}
                            onClick={() => setActiveTab('database')}>
                            Database
                        </h2>
                        <h2 className={`link whitespace-nowrap ${activeTab === 'databaseHistory' ? 'active' : ''}`}
                            onClick={() => setActiveTab('databaseHistory')}>
                            Log
                        </h2>
                        <h2 className={`link whitespace-nowrap ${activeTab === 'addInput' ? 'active' : ''}`}
                            onClick={() => setActiveTab('addInput')}>
                            Add Input
                        </h2>
                    </>
                )}
                <h2 className={`link whitespace-nowrap ${activeTab === 'entryCheck' ? 'active' : ''}`}
                    onClick={() => setActiveTab('entryCheck')}>
                    Entry Check
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'weeklyUploadHistory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('weeklyUploadHistory')}>
                    Weekly Uploads
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'dailyUpload' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dailyUpload')}>
                    Daily Upload
                </h2>
            </div>
            <div className="content px-4">
                {visitedTabs.has('expense-entry') && (
                    <div className={activeTab === 'expense-entry' ? '' : 'hidden'}>
                        <Form username={username} userRoles={userRoles} />
                    </div>
                )}
                {visitedTabs.has('tableview') && (
                    <div className={activeTab === 'tableview' ? '' : 'hidden'}>
                        <Tableview username={username} userRoles={userRoles} isActive={activeTab === 'tableview'} />
                    </div>
                )}
                {isAdminExpense && visitedTabs.has('database') && (
                    <div className={activeTab === 'database' ? '' : 'hidden'}>
                        <Database username={username} userRoles={userRoles} isActive={activeTab === 'database'} />
                    </div>
                )}
                {isAdminExpense && visitedTabs.has('databaseHistory') && (
                    <div className={activeTab === 'databaseHistory' ? '' : 'hidden'}>
                        <DatabaseExpenseHistoryLog
                            username={username}
                            userRoles={userRoles}
                            isActive={activeTab === 'databaseHistory'}
                        />
                    </div>
                )}
                {isAdminExpense && visitedTabs.has('addInput') && (
                    <div className={activeTab === 'addInput' ? '' : 'hidden'}>
                        <ExpensesAddInput userRoles={userRoles} />
                    </div>
                )}
                {visitedTabs.has('entryCheck') && (
                    <div className={activeTab === 'entryCheck' ? '' : 'hidden'}>
                        <EntryChecking userRoles={userRoles} />
                    </div>
                )}
                {visitedTabs.has('weeklyUploadHistory') && (
                    <div className={activeTab === 'weeklyUploadHistory' ? '' : 'hidden'}>
                        <WeeklyPaymentHistory
                            username={username}
                            userRoles={userRoles}
                            viewMode="expenses-entry-upload"
                        />
                    </div>
                )}
                {visitedTabs.has('dailyUpload') && (
                    <div className={activeTab === 'dailyUpload' ? '' : 'hidden'}>
                        <DailyHistory username={username} userRoles={userRoles} />
                    </div>
                )}
            </div>
        </div>
    );
};
export default Heading;
