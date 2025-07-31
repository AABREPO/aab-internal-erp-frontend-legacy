import React, { useState, useEffect } from 'react';
import './Heading.css';
import Form from './ExpensesEntry/Form';
import Tableview from './ExpensesEntry/TableViewExpense';
import Database from './ExpensesEntry/DatabaseExpenses';
import ExpensesAddInput from './ExpensesEntry/ExpensesInputData';
import EntryChecking from './ExpensesEntry/EntryCheck';
const Heading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab === 'database' && username !== 'Mahalingam M') {
            return 'expense-entry';
        }
        return savedTab || 'expense-entry';
    });
    useEffect(() => {
        if (activeTab === 'database' && username !== 'Mahalingam M') {
            setActiveTab('expense-entry');
        } else {
            localStorage.setItem('activeTab', activeTab);
        }
    }, [activeTab, username]);
    const renderContent = () => {
        switch (activeTab) {
            case 'expense-entry':
                return <Form username={username} userRoles={userRoles} />;
            case 'tableview':
                return <Tableview username={username} userRoles={userRoles} />;
            case 'database':
                return <Database username={username} userRoles={userRoles} />;
            case 'addInput':
                return <ExpensesAddInput userRoles={userRoles} />;
            case 'entryCheck':
                return <EntryChecking userRoles={userRoles} />;
            default:
                return <Form />;
        }
    };
    return (
        <div className="bg-[#FAF6ED]">
            {/* Top Navigation Tabs */}
            <div className="topbar-title gap-4 w-[350px] sm:w-[580px] lg:w-[850px] overflow-x-auto no-scrollbar px-2 py-3">
                <h2 className={`link whitespace-nowrap ${activeTab === 'expense-entry' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expense-entry')}>
                    Form
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'tableview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tableview')}>
                    Table View
                </h2>
                {username === 'Mahalingam M' && (
                    <>
                        <h2 className={`link whitespace-nowrap ${activeTab === 'database' ? 'active' : ''}`}
                            onClick={() => setActiveTab('database')}>
                            Database
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
            </div>
            {/* Dynamic Content Area */}
            <div className="content px-4">{renderContent()}</div>
        </div>
    );
};
export default Heading;