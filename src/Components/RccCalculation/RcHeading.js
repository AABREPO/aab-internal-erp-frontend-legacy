import React, { useState, useEffect } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
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
        <ModuleHeadingWrapper>
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'RCCCalculation'}
                    onClick={() => setActiveTab('RCCCalculation')}
                >
                    RCC Calculation
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
    );
};

export default RcHeading;
