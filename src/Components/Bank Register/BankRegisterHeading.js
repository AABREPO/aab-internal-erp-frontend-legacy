import React, { useState, useEffect } from 'react'
import BillPayment from './BillPayment';
import BankRegister6View from './BankRegisterPayments';
import BankRegisterHistory from './BankRegisterHistory';
import BankRegisterReconcile from './BankRegisterReconcile';

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
            case 'bankregister6':
                return <BankRegister6View />;
            case 'bankregisterhistory':
                return <BankRegisterHistory />;
            case 'bankregisterreconcile':
                return <BankRegisterReconcile />;
            default:
                return <BillPayment />;
        }
    };
    return (
        <div className="bg-[#FAF6ED] w-full bank-register-heading-scope">
            <style>{`
              /* Align tab row start with page content without affecting other screens */
              .bank-register-heading-scope .topbar-title .link {
                margin-left: 0 !important;
              }

              @media (max-width: 1000px) {
                .bank-register-heading-scope .topbar-title {
                  display: flex;
                  flex-wrap: nowrap;
                  justify-content: flex-start;
                  gap: 14px;
                  width: 100%;
                  overflow: hidden;
                  box-sizing: border-box;
                  padding: 0 12px;
                }
                .bank-register-heading-scope .topbar-title .link {
                  padding: 0 6px !important;
                  white-space: nowrap !important;
                  font-size: clamp(12px, 3.2vw, 14px) !important;
                }
                .bank-register-heading-scope .topbar-title h2 {
                  margin-left: 0 !important;
                  margin-right: 0 !important;
                }
              }
            `}</style>
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'billpayment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('billpayment')}
                >
                    Bank Payment
                </h2>
                <h2
                    className={`link ${activeTab === 'bankregister6' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bankregister6')}
                >
                    Bank Payments
                </h2>
                <h2
                    className={`link ${activeTab === 'bankregisterhistory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bankregisterhistory')}
                >
                    History
                </h2>
                <h2
                    className={`link ${activeTab === 'bankregisterreconcile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bankregisterreconcile')}
                >
                    Reconcile
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    )
}

export default BankRegisterHeading
