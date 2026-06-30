import React, { useState } from 'react';
import ElectricityDatabase from './ElectricityDatabase';
import PropertyDatabase from './PropertyDatabase';
import WaterDatabase from './WaterDatabase';
import TelecomDatabase from './TelecomDatabase';
import ProfessionDatabase from './ProfessionDatabase';
import SubscriptionDatabase from './SubscriptionDatabase';
import AMCDatabase from './AMCDatabase';

const DatabaseTab = ({ username, userRoles = [] }) => {
    const [activeDatabaseTab, setActiveDatabaseTab] = useState('electricity-database');

    const renderDatabaseContent = () => {
        switch (activeDatabaseTab) {
            case 'electricity-database':
                return <ElectricityDatabase username={username} userRoles={userRoles} />;
            case 'property-database':
                return <PropertyDatabase username={username} userRoles={userRoles} />;
            case 'water-database':
                return <WaterDatabase username={username} userRoles={userRoles} />;
            case 'telecom-database':
                return <TelecomDatabase username={username} userRoles={userRoles} />;
            case 'profession-database':
                return <ProfessionDatabase username={username} userRoles={userRoles} />;
            case 'subscription-database':
                return <SubscriptionDatabase username={username} userRoles={userRoles} />;
            case 'amc-database':
                return <AMCDatabase username={username} userRoles={userRoles} />;
            default:
                return <ElectricityDatabase username={username} userRoles={userRoles} />;
        }
    };

    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
            {/* Database Sub Navigation */}
            <div className="bg-white rounded-md mb-5 ml-5 mr-5 p-6">
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => setActiveDatabaseTab('electricity-database')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeDatabaseTab === 'electricity-database'
                                ? 'bg-[#BF9853] text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Electricity Database
                    </button>
                    <button
                        onClick={() => setActiveDatabaseTab('property-database')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeDatabaseTab === 'property-database'
                                ? 'bg-[#BF9853] text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Property Database
                    </button>
                    <button
                        onClick={() => setActiveDatabaseTab('water-database')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeDatabaseTab === 'water-database'
                                ? 'bg-[#BF9853] text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Water Database
                    </button>
                    <button
                        onClick={() => setActiveDatabaseTab('telecom-database')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeDatabaseTab === 'telecom-database'
                                ? 'bg-[#BF9853] text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Telecom Database
                    </button>
                    <button
                        onClick={() => setActiveDatabaseTab('profession-database')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeDatabaseTab === 'profession-database'
                                ? 'bg-[#BF9853] text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Profession Database
                    </button>
                    <button
                        onClick={() => setActiveDatabaseTab('subscription-database')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeDatabaseTab === 'subscription-database'
                                ? 'bg-[#BF9853] text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Subscription Database
                    </button>
                    <button
                        onClick={() => setActiveDatabaseTab('amc-database')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                            activeDatabaseTab === 'amc-database'
                                ? 'bg-[#BF9853] text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        AMC Database
                    </button>
                </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="content px-4">
                {renderDatabaseContent()}
            </div>
        </div>
    );
};

export default DatabaseTab;
