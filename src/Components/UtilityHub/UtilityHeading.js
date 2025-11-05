import React, { useState, useEffect } from 'react';
import PropertyTab from './PropertyTab';
import WaterTab from './WaterTab';
import TelecomTab from './TelecomTab';
import SubscriptionTab from './SubscriptionTab';
import AMCTab from './AMCTab';
import ElectricityTab from './ElectricityTab';
import UtilityDashboard from './UtilityDashboard';
import ElectricityDatabase from './ElectricityDatabase';
import PropertyDatabase from './PropertyDatabase';
import WaterDatabase from './WaterDatabase';
import DatabaseTab from './DatabaseTab';

const UtilityHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'property'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'utilitydashboard':
                return <UtilityDashboard username={username} userRoles={userRoles} />;
            case 'electricity':
                return <ElectricityTab username={username} userRoles={userRoles} />;
            case 'property':
                return <PropertyTab username={username} userRoles={userRoles} />;
            case 'water':
                return <WaterTab username={username} userRoles={userRoles} />;
            case 'telecom':
                return <TelecomTab username={username} userRoles={userRoles} />;
            case 'subscription':
                return <SubscriptionTab username={username} userRoles={userRoles} />;
            case 'amc':
                return <AMCTab username={username} userRoles={userRoles} />;
            case 'database':
                return <DatabaseTab username={username} userRoles={userRoles} />;
            case 'electricity-database':
                return <ElectricityDatabase username={username} userRoles={userRoles} />;
            case 'property-database':
                return <PropertyDatabase username={username} userRoles={userRoles} />;
            case 'water-database':
                return <WaterDatabase username={username} userRoles={userRoles} />;

            default:
                return <PropertyTab username={username} userRoles={userRoles} />;
        }
    };

    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
            {/* Top Navigation Tabs */}
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'utilitydashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('utilitydashboard')}
                >
                    Dashboard
                </h2>
                <h2
                    className={`link ${activeTab === 'electricity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('electricity')}
                >
                    Electricity
                </h2>
                <h2
                    className={`link ${activeTab === 'property' ? 'active' : ''}`}
                    onClick={() => setActiveTab('property')}
                >
                    Property
                </h2>
                <h2
                    className={`link ${activeTab === 'water' ? 'active' : ''}`}
                    onClick={() => setActiveTab('water')}
                >
                    Water
                </h2>
                <h2
                    className={`link ${activeTab === 'telecom' ? 'active' : ''}`}
                    onClick={() => setActiveTab('telecom')}
                >
                    Telecom
                </h2>
                <h2
                    className={`link ${activeTab === 'subscription' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subscription')}
                >
                    Subscription
                </h2>
                <h2
                    className={`link ${activeTab === 'amc' ? 'active' : ''}`}
                    onClick={() => setActiveTab('amc')}
                >
                    AMC
                </h2>
                <h2
                    className={`link ${activeTab === 'database' ? 'active' : ''}`}
                    onClick={() => setActiveTab('database')}
                >
                    Database
                </h2>

            </div>

            {/* Dynamic Content Area */}
            <div className="content px-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default UtilityHeading;
