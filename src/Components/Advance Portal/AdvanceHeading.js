import React, { useState, useEffect } from 'react';
import AdvancePortal from './AdvancePortal';
import AdvanceTableView from './AdvanceTableView';
import AdvanceDatabase from './AdvanceDatabase';
import AdvanceReport from './AdvanceReport';
import AdvanceSummary from './AdvanceSummary';
import MobileProjectAdvance from '../../componentsMobile/ProjectAdvance/ProjectAdvance';
import { isMobileViewportWidth } from '../../constants/mobileBreakpoint';

// Payment Mode options
const paymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Direct', label:'Direct'}
];

const AdvanceHeading = ({ username, userRoles = [] }) => {

    const [isMobile, setIsMobile] = useState(() => isMobileViewportWidth());
    const [refreshNonce, setRefreshNonce] = useState(0);
    const bumpRefresh = () => setRefreshNonce((n) => n + 1);

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
        const savedTab = localStorage.getItem('activePaintTab');
        if (savedTab === 'advancedatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            return 'advanceportal';
        }
        return savedTab || 'advanceportal';
    });

    useEffect(() => {
        if (activeTab === 'advancedatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            setActiveTab('advanceportal');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, username]);

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
            <div style={{ textAlign: 'left' }}>
                <MobileProjectAdvance user={user} onLogout={() => { }} />
            </div>
        );
    }

    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'advanceportal' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('advanceportal');
                        bumpRefresh();
                    }}
                >
                    Advance
                </h2>
                <h2
                    className={`link ${activeTab === 'advacetablview' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('advacetablview');
                        bumpRefresh();
                    }}
                >
                    Table View
                </h2>
                {(username === 'Mahalingam M' || username === 'Admin') && (
                    <h2
                        className={`link ${activeTab === 'advancedatabase' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('advancedatabase');
                            bumpRefresh();
                        }}
                    >
                        Database
                    </h2>
                )}
                <h2
                    className={`link ${activeTab === 'advancereport' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('advancereport');
                        bumpRefresh();
                    }}
                >
                    Report
                </h2>
                <h2
                    className={`link ${activeTab === 'advancesummary' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('advancesummary');
                        bumpRefresh();
                    }}
                >
                    Summary
                </h2>
            </div>
            <div className="content">
                {/* Keep all tabs mounted so data can prefetch; just hide inactive tabs. */}
                <div style={{ display: activeTab === 'advanceportal' ? 'block' : 'none' }}>
                    <AdvancePortal username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} />
                </div>
                <div style={{ display: activeTab === 'advacetablview' ? 'block' : 'none' }}>
                    <AdvanceTableView username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} />
                </div>
                {(username === 'Mahalingam M' || username === 'Admin') && (
                    <div style={{ display: activeTab === 'advancedatabase' ? 'block' : 'none' }}>
                        <AdvanceDatabase username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} />
                    </div>
                )}
                <div style={{ display: activeTab === 'advancereport' ? 'block' : 'none' }}>
                    <AdvanceReport username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} />
                </div>
                <div style={{ display: activeTab === 'advancesummary' ? 'block' : 'none' }}>
                    <AdvanceSummary username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} refreshSignal={refreshNonce} />
                </div>
            </div>
        </div>
    )
}

export default AdvanceHeading
