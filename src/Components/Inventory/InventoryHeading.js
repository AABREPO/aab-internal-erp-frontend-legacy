import React, { useState, useEffect } from "react";
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
import Incoming from "./Incoming";
import MobileInventory from "../../componentsMobile/Inventory/Inventory";
import { isMobileViewportWidth } from '../../constants/mobileBreakpoint';

const InventoryHeading = ({ username, userRoles = [] }) => {

    const [isMobile, setIsMobile] = useState(() => isMobileViewportWidth());

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileViewportWidth());
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
        const storedUserParsed = storedUser ? JSON.parse(storedUser) : {};
        const user = {
            ...storedUserParsed,
            username,
            // Prefer roles provided from `App.js` props; fall back to localStorage if missing.
            userRoles: Array.isArray(userRoles) && userRoles.length > 0 ? userRoles : (storedUserParsed?.userRoles ?? []),
        };
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
        <ModuleHeadingWrapper>
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === ''}
                    onClick={() => setActiveTab('')}
                >
                    Outgoing
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'incoming'}
                    onClick={() => setActiveTab('incoming')}
                >
                    Incoming
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === ''}
                    onClick={() => setActiveTab('')}
                >
                    Site Usage Report
                </ModuleHeadingTab>
            </ModuleHeadingBar>
            <div className="content">
                {renderContent()}
            </div>
        </ModuleHeadingWrapper>
    );
}

export default InventoryHeading
