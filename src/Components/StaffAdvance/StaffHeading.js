import React, { useState, useEffect } from 'react';
import StaffAdvance from './StaffAdvance';
import StaffTableview from './StaffTableview';
import StaffDatabase from './StaffDatabase';
import StaffReport from './StaffReport';
import StaffSummary from './StaffSummary';
import StaffAddInput from './StaffAddInput';

const StaffHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'staffAdvance'
    );
    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);
    const renderContent = () => {
        switch (activeTab) {
            case 'staffAdvance':
                return <StaffAdvance username={username} userRoles={userRoles} />;
            case 'staffTablview':
                return <StaffTableview username={username} userRoles={userRoles} />;
            case 'staffDatabase':
                return <StaffDatabase username={username} userRoles={userRoles} />;
            case 'staffInput':
                return <StaffAddInput username={username} userRoles={userRoles} />;
            case 'staffReport':
                return <StaffReport username={username} userRoles={userRoles} />;
            case 'staffSummary':
                return <StaffSummary username={username} userRoles={userRoles} />;
            default:
                return <StaffAdvance />;
        }
    };
    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'staffAdvance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staffAdvance')}
                >
                    Advance
                </h2>
                <h2
                    className={`link ${activeTab === 'staffTablview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staffTablview')}
                >
                    Table View
                </h2>
                <h2
                    className={`link ${activeTab === 'staffDatabase' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staffDatabase')}
                >
                    Database
                </h2>
                <h2
                    className={`link ${activeTab === 'staffInput' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staffInput')}
                >
                    Add Input
                </h2>
                <h2
                    className={`link ${activeTab === 'staffReport' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staffReport')}
                >
                    Report
                </h2>
                <h2
                    className={`link ${activeTab === 'staffSummary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staffSummary')}
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
export default StaffHeading