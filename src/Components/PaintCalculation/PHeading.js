import React, { useState, useEffect } from 'react';
import Paintcalculation from './Paintcalculation';
import PaintHistory from './PaintHistory';
import PaintAddinput from './PaintAddinput';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';

const PHeading = () => {
    // Get the last active tab from localStorage or default to 'paintCalculation'
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'paintCalculation'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'paintCalculation':
                return <Paintcalculation />;
            case 'paintHistory':
                return <PaintHistory />;
            case 'paintAddInput':
                return <PaintAddinput />;
            default:
                return <Paintcalculation />;
        }
    };

    return (
        <ModuleHeadingWrapper>
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'paintCalculation'}
                    onClick={() => setActiveTab('paintCalculation')}
                >
                    Paint Calculation
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'paintHistory'}
                    onClick={() => setActiveTab('paintHistory')}
                >
                    History
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'paintAddInput'}
                    onClick={() => setActiveTab('paintAddInput')}
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

export default PHeading;
