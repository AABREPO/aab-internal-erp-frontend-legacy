import React, { useState, useEffect } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import RccCalculator from './RccCalculator';
import RcHistory from './RcHistory';
import RcAddinput from './RcAddinput';

const RcHeading = () => {
    // Get the last active tab from localStorage or default to 'RCCCalculation'
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activeTab') || 'RCCCalculation'
    );

    // Save the active tab to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
    }, [activeTab]);

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'RCCCalculation':
                return <RccCalculator />;
            case 'history':
                return <RcHistory />;
            case 'addinput':
                return <RcAddinput />;
            default:
                return <RccCalculator />;
        }
    };

    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'RCCCalculation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('RCCCalculation')}
                >
                    RCC Calculation
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
    );
};

export default RcHeading;
