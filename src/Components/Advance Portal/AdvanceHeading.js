import React, { useState, useEffect } from 'react';
import AdvancePortal from './AdvancePortal';
import AdvanceTableView from './AdvanceTableView';
import AdvanceDatabase from './AdvanceDatabase';
import AdvanceReport from './AdvanceReport';
import AdvanceSummary from './AdvanceSummary';

const AdvanceHeading = ({ username, userRoles = [] }) => {

    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'advanceportal'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'advanceportal':
                return <AdvancePortal username={username} userRoles={userRoles}/>;
            case 'advacetablview':
                return <AdvanceTableView username={username} userRoles={userRoles}/>;
            case 'advancedatabase':
                return <AdvanceDatabase username={username} userRoles={userRoles}/>;
            case 'advancereport':
                return <AdvanceReport username={username} userRoles={userRoles}/>;
            case 'advancesummary':
                return <AdvanceSummary username={username} userRoles={userRoles}/>;
            default:
                return <AdvancePortal />;
        }
    };
    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'advanceportal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('advanceportal')}
                >
                    Advance
                </h2>
                <h2
                    className={`link ${activeTab === 'advacetablview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('advacetablview')}
                >
                    Table View
                </h2>
                <h2
                    className={`link ${activeTab === 'advancedatabase' ? 'active' : ''}`}
                    onClick={() => setActiveTab('advancedatabase')}
                >
                    Database
                </h2>
                <h2
                    className={`link ${activeTab === 'advancereport' ? 'active' : ''}`}
                    onClick={() => setActiveTab('advancereport')}
                >
                    Report
                </h2>
                <h2
                    className={`link ${activeTab === 'advancesummary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('advancesummary')}
                >
                    Summary
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    )
}

export default AdvanceHeading
