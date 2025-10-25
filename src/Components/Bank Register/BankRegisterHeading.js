import React, { useState, useEffect } from 'react'
import BillPayment from './BillPayment';

const BankRegisterHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'bankregister'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'billpayment':
                return <BillPayment username={username} userRoles={userRoles} />;
            default:
                return <BillPayment />;
        }
    };
    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'billpayment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('billpayment')}
                >
                    Bank Payment
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    )
}

export default BankRegisterHeading
