import React, { useState, useEffect } from 'react';
import Paintcalculation from './Paintcalculation';
import PaintHistory from './PaintHistory';
import PaintAddinput from './PaintAddinput';
import './PHeading.css';

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
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'paintCalculation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('paintCalculation')}
                >
                    Paint Calculation
                </h2>
                <h2
                    className={`link ${activeTab === 'paintHistory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('paintHistory')}
                >
                    History
                </h2>
                <h2
                    className={`link ${activeTab === 'paintAddInput' ? 'active' : ''}`}
                    onClick={() => setActiveTab('paintAddInput')}
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

export default PHeading;
