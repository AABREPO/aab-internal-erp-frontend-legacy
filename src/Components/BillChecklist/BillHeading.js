import React, { useState, useEffect } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
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
        <ModuleHeadingWrapper className="w-full h-auto min-h-screen">
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'entrychecklist'}
                    onClick={() => setActiveTab('entrychecklist')}
                >
                    Entry Check List
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'expensesTable'}
                    onClick={() => setActiveTab('expensesTable')}
                >
                    Expenses Table View
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'history'}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </ModuleHeadingTab>
            </ModuleHeadingBar>
            <div className="content">
                {renderContent()}
            </div>
        </ModuleHeadingWrapper>
    )
}

export default BHeading
