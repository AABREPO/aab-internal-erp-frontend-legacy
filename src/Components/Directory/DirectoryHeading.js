import React, { useState, useEffect } from 'react';
import DirectoryTelecom from './DirectoryTelecom';
import DirectorySubscription from './DirectorySubscription';
import DirectoryAmc from './DirectoryAmc';


const DirectoryHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'directory'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'directorytelecom':
                return <DirectoryTelecom username={username} userRoles={userRoles} />;
            case 'directorysubscription':
                return <DirectorySubscription username={username} userRoles={userRoles} />;
            case 'directoryamc':
                return <DirectoryAmc username={username} userRoles={userRoles} />;
            default:
                return <DirectoryTelecom username={username} userRoles={userRoles} />;
        }
    };

    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
            {/* Top Navigation Tabs */}
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'directorytelecom' ? 'active' : ''}`}
                    onClick={() => setActiveTab('directorytelecom')}
                >
                    Telecom
                </h2>
                <h2
                    className={`link ${activeTab === 'directorysubscription' ? 'active' : ''}`}
                    onClick={() => setActiveTab('directorysubscription')}
                >
                    Subscription
                </h2>
                <h2
                    className={`link ${activeTab === 'directoryamc' ? 'active' : ''}`}
                    onClick={() => setActiveTab('directoryamc')}
                >
                    AMC
                </h2>
            </div>

            {/* Dynamic Content Area */}
            <div className="content px-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default DirectoryHeading;