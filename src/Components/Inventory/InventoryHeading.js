import React, { useState, useEffect } from "react";
import Incoming from "./Incoming";
import MobileInventory from "../../componentsMobile/Inventory/Inventory";

const InventoryHeading = ({ username, userRoles = [] }) => {

    const [isMobile, setIsMobile] = useState(() => {
        return window.innerWidth <= 768;
    });

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);



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

    if (isMobile) {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : { username, userRoles};
        return (
            <div style={{textAlign: 'left'}}>
                <MobileInventory user={user} onLogout={() => {}}/>;
            </div>
        );
    }

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
