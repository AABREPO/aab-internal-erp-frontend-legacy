import React, { useState, useEffect } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
import CarpentryCalculator from './CarpentryCalculator';
import History from './History';
import AddInput from './AddInput';

const CHeading = () => {
    // Get the last active tab from localStorage or default to 'paintCalculation'
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'carpentrycalculator'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'carpentrycalculator':
                return <CarpentryCalculator />;
            case 'history':
                return <History/>;
            case 'addinput':
                return <AddInput/>;
            default:
                return <CarpentryCalculator />;
        }
    };

  return (
    <ModuleHeadingWrapper>
      <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'carpentrycalculator'}
                    onClick={() => setActiveTab('carpentrycalculator')}
                >
                    Carpentry Calculator
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'history'}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'addinput'}
                    onClick={() => setActiveTab('addinput')}
                >
                    Add Input
                </ModuleHeadingTab>
            </ModuleHeadingBar>
            <div className="content">
                {renderContent()}
            </div>
    </ModuleHeadingWrapper>
  )
}

export default CHeading
