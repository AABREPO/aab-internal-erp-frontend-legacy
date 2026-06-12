import React, { useState, useEffect } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
import PropertyTab from './PropertyTab';
import WaterTab from './WaterTab';
import ProfessionTab from './ProfessionTab';
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
            case 'profession':
                return <ProfessionTab username={username} userRoles={userRoles} />;
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
        <ModuleHeadingWrapper className="w-full h-auto min-h-screen">
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'utilitydashboard'}
                    onClick={() => setActiveTab('utilitydashboard')}
                >
                    Dashboard
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'electricity'}
                    onClick={() => setActiveTab('electricity')}
                >
                    Electricity
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'property'}
                    onClick={() => setActiveTab('property')}
                >
                    Property
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'water'}
                    onClick={() => setActiveTab('water')}
                >
                    Water
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'profession'}
                    onClick={() => setActiveTab('profession')}
                >
                    Profession
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'telecom'}
                    onClick={() => setActiveTab('telecom')}
                >
                    Telecom
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'subscription'}
                    onClick={() => setActiveTab('subscription')}
                >
                    Subscription
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'amc'}
                    onClick={() => setActiveTab('amc')}
                >
                    AMC
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'database'}
                    onClick={() => setActiveTab('database')}
                >
                    Database
                </ModuleHeadingTab>
            </ModuleHeadingBar>

            <div className="content px-4">
                {renderContent()}
            </div>
        </ModuleHeadingWrapper>
    );
};

export default UtilityHeading;
