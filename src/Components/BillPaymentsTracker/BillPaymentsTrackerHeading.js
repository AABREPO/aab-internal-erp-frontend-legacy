import React, { useState, useEffect } from 'react';
import PendingBill from './PendingBill';
import BillDatabase from './BillDatabase';
import BillStatement from './BillStatement';

const BillPaymentsTrackerHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'pendingbill'
    );
    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);
    const renderContent = () => {
        switch (activeTab) {
            case 'pendingbill':
                return <PendingBill username={username} userRoles={userRoles} />;
            case 'billdatabase':
                return <BillDatabase username={username} userRoles={userRoles} />;
            case 'billstatement':
                return <BillStatement username={username} userRoles={userRoles} />;
            default:
                return <PendingBill />;
        }
    };
    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'pendingbill' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pendingbill')}
                >
                    Pending Bill
                </h2>
                <h2
                    className={`link ${activeTab === 'billdatabase' ? 'active' : ''}`}
                    onClick={() => setActiveTab('billdatabase')}
                >
                    Database
                </h2>
                <h2
                    className={`link ${activeTab === 'billstatement' ? 'active' : ''}`}
                    onClick={() => setActiveTab('billstatement')}
                >
                    Statement
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    )
}
export default BillPaymentsTrackerHeading