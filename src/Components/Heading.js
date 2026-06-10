import React, { useState, useEffect } from 'react';
import './Heading.css';
import Form from './ExpensesEntry/Form';
import Tableview from './ExpensesEntry/TableViewExpense';
import Database from './ExpensesEntry/DatabaseExpenses';
import ExpensesAddInput from './ExpensesEntry/ExpensesInputData';
import EntryChecking from './ExpensesEntry/EntryCheck';
import WeeklyPaymentHistory from './Cash Register/WeeklyPaymentHistory';
import DailyHistory from './Cash Register/DailyHistory';
import Log from './ExpensesEntry/DatabaseExpenseHistoryLog';

const EXPENSE_MODULE_TABS = [
    'expense-entry',
    'tableview',
    'database',
    'log',
    'addInput',
    'entryCheck',
    'weeklyUploadHistory',
    'dailyUpload',
];
const EXPENSE_DEFAULT_TAB = 'expense-entry';

const getInitialExpenseTab = (username) => {
    const prefillData = localStorage.getItem('expenseEntryPrefill');
    if (prefillData) {
        return 'expense-entry';
    }
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab === 'database' && (username !== 'Mahalingam M' && username !== 'Admin' && username !== 'Marimuthu A')) {
        return 'expense-entry';
    }
    return savedTab || EXPENSE_DEFAULT_TAB;
};

const Heading = ({ username, userRoles = [] }) => {
    const isAdminExpense = username === 'Mahalingam M' || username === 'Admin' || username === 'Marimuthu A';
    const allowedTabs = isAdminExpense
        ? EXPENSE_MODULE_TABS
        : EXPENSE_MODULE_TABS.filter((tab) => !['database', 'log', 'addInput'].includes(tab));

    const initialTab = getInitialExpenseTab(username);
    const [activeTab, setActiveTab] = useState(() => initialTab);
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([initialTab]));
    const [refreshNonce, setRefreshNonce] = useState(0);
    const bumpRefresh = () => setRefreshNonce((n) => n + 1);

    useEffect(() => {
        setVisitedTabs((prev) => new Set(prev).add(activeTab));
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'database' && !isAdminExpense) {
            setActiveTab('expense-entry');
        } else {
            localStorage.setItem('activeTab', activeTab);
        }
    }, [activeTab, username, isAdminExpense]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        bumpRefresh();
    };

    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title expense-entry-tabs w-full max-w-full overflow-x-auto no-scrollbar">
                <h2 className={`link whitespace-nowrap ${activeTab === 'expense-entry' ? 'active' : ''}`}
                    onClick={() => handleTabChange('expense-entry')}>
                    Form
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'tableview' ? 'active' : ''}`}
                    onClick={() => handleTabChange('tableview')}>
                    Table View
                </h2>
                {isAdminExpense && (
                    <>
                        <h2 className={`link whitespace-nowrap ${activeTab === 'database' ? 'active' : ''}`}
                            onClick={() => handleTabChange('database')}>
                            Database
                        </h2>
                        <h2 className={`link whitespace-nowrap ${activeTab === 'log' ? 'active' : ''}`}
                            onClick={() => handleTabChange('log')}>
                            Log
                        </h2>
                        <h2 className={`link whitespace-nowrap ${activeTab === 'addInput' ? 'active' : ''}`}
                            onClick={() => handleTabChange('addInput')}>
                            Input Data
                        </h2>                        
                    </>
                )}
                <h2 className={`link whitespace-nowrap ${activeTab === 'entryCheck' ? 'active' : ''}`}
                    onClick={() => handleTabChange('entryCheck')}>
                    Entry Check
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'weeklyUploadHistory' ? 'active' : ''}`}
                    onClick={() => handleTabChange('weeklyUploadHistory')}>
                    Weekly Uploads
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'dailyUpload' ? 'active' : ''}`}
                    onClick={() => handleTabChange('dailyUpload')}>
                    Daily Upload
                </h2>
            </div>
            <div className="content">
                {visitedTabs.has('expense-entry') && (
                    <div className={activeTab === 'expense-entry' ? '' : 'hidden'}>
                        <Form username={username} userRoles={userRoles} refreshSignal={refreshNonce} isActive={activeTab === 'expense-entry'} />
                    </div>
                )}
                {visitedTabs.has('tableview') && (
                    <div className={activeTab === 'tableview' ? '' : 'hidden'}>
                        <Tableview username={username} userRoles={userRoles} isActive={activeTab === 'tableview'} refreshSignal={refreshNonce} />
                    </div>
                )}
                {isAdminExpense && visitedTabs.has('database') && (
                    <div className={activeTab === 'database' ? '' : 'hidden'}>
                        <Database username={username} userRoles={userRoles} isActive={activeTab === 'database'} refreshSignal={refreshNonce} />
                    </div>
                )}
                {isAdminExpense && visitedTabs.has('addInput') && (
                    <div className={activeTab === 'addInput' ? '' : 'hidden'}>
                        <ExpensesAddInput userRoles={userRoles} />
                    </div>
                )}
                {isAdminExpense && visitedTabs.has('log') && (
                    <div className={activeTab === 'log' ? '' : 'hidden'}>
                        <Log userRoles={userRoles} />
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
