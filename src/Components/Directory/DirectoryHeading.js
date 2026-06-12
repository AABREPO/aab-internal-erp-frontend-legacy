import React, { useState, useEffect } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
import DirectoryTelecom from './DirectoryTelecom';
import DirectorySubscription from './DirectorySubscription';
import DirectoryAmc from './DirectoryAmc';
import DirectoryProfession from './DirectoryProfession';


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
            case 'directoryprofession':
                return <DirectoryProfession username={username} userRoles={userRoles} />;
            default:
                return <DirectoryTelecom username={username} userRoles={userRoles} />;
        }
    };

    return (
        <ModuleHeadingWrapper className="w-full h-auto min-h-screen">
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'directorytelecom'}
                    onClick={() => setActiveTab('directorytelecom')}
                >
                    Telecom
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'directorysubscription'}
                    onClick={() => setActiveTab('directorysubscription')}
                >
                    Subscription
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'directoryamc'}
                    onClick={() => setActiveTab('directoryamc')}
                >
                    AMC
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'directoryprofession'}
                    onClick={() => setActiveTab('directoryprofession')}
                >
                    Profession
                </ModuleHeadingTab>
            </ModuleHeadingBar>

            <div className="content px-4">
                {renderContent()}
            </div>
        </ModuleHeadingWrapper>
    );
};

export default DirectoryHeading;