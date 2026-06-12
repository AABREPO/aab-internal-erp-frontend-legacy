import React, { useState, useEffect } from 'react';
import TileCalculation from './TileCalculator';
import DTableview from './DTableView';
import TileHistory from './TileHistory';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';

const DHeading = () => {
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('activeTab') || 'tileCalculate';
    });

    useEffect(() => {
        // Prevent infinite re-renders by checking if the value actually changed
        const storedTab = localStorage.getItem('activeTab');
        if (storedTab !== activeTab) {
            localStorage.setItem('activeTab', activeTab);
        }
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'tileCalculate':
                return <TileCalculation />;
            case 'tileHistory':
                return <TileHistory />;
            case 'tileTableView':
                return <DTableview />;
            default:
                return <TileCalculation />;
        }
    };

    return (
        <ModuleHeadingWrapper>
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'tileCalculate'}
                    onClick={() => setActiveTab('tileCalculate')}
                >
                    Tile Calculation
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'tileHistory'}
                    onClick={() => setActiveTab('tileHistory')}
                >
                    History
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'tileTableView'}
                    onClick={() => setActiveTab('tileTableView')}
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

export default DHeading;