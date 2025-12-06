import React, { useState, useEffect } from 'react';
import StaffAdvance from './StaffAdvance';
import StaffTableview from './StaffTableview';
import StaffDatabase from './StaffDatabase';
import StaffReport from './StaffReport';
import StaffSummary from './StaffSummary';
import StaffAddInput from './StaffAddInput';

// Payment Mode options
const paymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' }
];

const StaffHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('activePaintTab');
        if (savedTab === 'staffDatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            return 'staffAdvance';
        }
        return savedTab || 'staffAdvance';
    });
    useEffect(() => {
        if (activeTab === 'staffDatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            setActiveTab('staffAdvance');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, username]);
    const renderContent = () => {
        switch (activeTab) {
            case 'staffAdvance':
                return <StaffAdvance username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'staffTablview':
                return <StaffTableview username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'staffDatabase':
                return <StaffDatabase username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'staffInput':
                return <StaffAddInput username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'staffReport':
                return <StaffReport username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'staffSummary':
                return <StaffSummary username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            default:
                return <StaffAdvance paymentModeOptions={paymentModeOptions} />;
        }
    };
    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
            <div className="topbar-title">
                <h2 className={`link ${activeTab === 'staffAdvance' ? 'active' : ''}`} onClick={() => setActiveTab('staffAdvance')} >
                    Advance
                </h2>
                <h2 className={`link ${activeTab === 'staffTablview' ? 'active' : ''}`} onClick={() => setActiveTab('staffTablview')} >
                    Table View
                </h2>
                {(username === 'Mahalingam M' || username === 'Admin') && (
                    <h2 className={`link ${activeTab === 'staffDatabase' ? 'active' : ''}`} onClick={() => setActiveTab('staffDatabase')} >
                        Database
                    </h2>
                )}
                <h2 className={`link ${activeTab === 'staffInput' ? 'active' : ''}`} onClick={() => setActiveTab('staffInput')} >
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