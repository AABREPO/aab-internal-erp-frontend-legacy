import React, { useState, useEffect, useCallback } from "react";
import Incoming from "./Incoming";

const InventoryHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('activeTab') || 'incoming';
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
            case 'incoming':
                return <Incoming username={username} userRoles={userRoles}/>;
            default:
                return <Incoming username={username} userRoles={userRoles}/>;
        }
    };

    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === '' ? 'active' : ''}`}
                    onClick={() => setActiveTab('')}
                >
                    Outgoing
                </h2>
                <h2
                    className={`link ${activeTab === 'incoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('incoming')}
                >
                    Incoming
                </h2>
                <h2
                    className={`link ${activeTab === '' ? 'active' : ''}`}
                    onClick={() => setActiveTab('')}
                >
                    Site Usage Report
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    );
}

export default InventoryHeading
