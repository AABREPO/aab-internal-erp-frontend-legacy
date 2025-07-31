import React, { useState, useEffect } from 'react';
import EntryChecklist from './EntryChecklist';
import History from './EntryChecklistHistory';
import ExpenseTableView from './ExpensesTableView';

const BHeading = () => {
    // Get the last active tab from localStorage or default to 'paintCalculation'
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'entrychecklist'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'carpentrycalculator':
                return <EntryChecklist />;
            case 'history':
                return <History />;
            case 'expensesTable':
                return <ExpenseTableView />;
            default:
                return <EntryChecklist />;
        }
    };
    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'entrychecklist' ? 'active' : ''}`}
                    onClick={() => setActiveTab('entrychecklist')}
                >
                    Entry Check List
                </h2>
                <h2
                    className={`link ${activeTab === 'expensesTable' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expensesTable')}
                >
                    Expenses Table View
                </h2>
                <h2
                    className={`link ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    )
}

export default BHeading
