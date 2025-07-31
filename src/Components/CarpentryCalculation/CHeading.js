import React, { useState, useEffect } from 'react';
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
    <div className="bg-[#FAF6ED]">
      <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'carpentrycalculator' ? 'active' : ''}`}
                    onClick={() => setActiveTab('carpentrycalculator')}
                >
                    Carpentry Calculator
                </h2>
                <h2
                    className={`link ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </h2>
                <h2
                    className={`link ${activeTab === 'addinput' ? 'active' : ''}`}
                    onClick={() => setActiveTab('addinput')}
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

export default CHeading
