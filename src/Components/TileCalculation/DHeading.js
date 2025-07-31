import React, { useState, useEffect } from 'react';
import TileCalculation from './TileCalculator';
import DTableview from './DTableView';
import TileHistory from './TileHistory';
import './DHeading.css';

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
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'tileCalculate' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tileCalculate')}
                >
                    Tile Calculation
                </h2>
                <h2
                    className={`link ${activeTab === 'tileHistory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tileHistory')}
                >
                    History
                </h2>
                <h2
                    className={`link ${activeTab === 'tileTableView' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tileTableView')}
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

export default DHeading;