import React, { useState, useEffect, useCallback } from "react";
import PurchaseOrder from './PurchaseOrder';
import PurchaseHistory from "./PurchaseHistory";
import PurchaseInputData from "./PurchaseInputData";

const PurchaseHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('activeTab') || 'purchaseorder';
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
            case 'purchaseorder':
                return <PurchaseOrder username={username} userRoles={userRoles}/>;
            case 'purchasehistory':
                return <PurchaseHistory username={username} userRoles={userRoles}/>;
            case 'purchaseinputdata':
                return <PurchaseInputData username={username} userRoles={userRoles}/>;
            default:
                return <PurchaseOrder username={username} userRoles={userRoles}/>;
        }
    };

    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'purchaseorder' ? 'active' : ''}`}
                    onClick={() => setActiveTab('purchaseorder')}
                >
                    Purchase Order
                </h2>
                <h2
                    className={`link ${activeTab === 'purchasehistory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('purchasehistory')}
                >
                    History
                </h2>
                <h2
                    className={`link ${activeTab === 'purchaseinputdata' ? 'active' : ''}`}
                    onClick={() => setActiveTab('purchaseinputdata')}
                >
                    Input Data
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    );
}

export default PurchaseHeading
