import React, { useState, useEffect } from 'react'
import '../Heading.css';
import BillPayment from './BillPayment';
import BankRegister6View from './BankRegisterPayments';
import BankRegisterHistory from './BankRegisterHistory';
import BankRegisterReconcile from './BankRegisterReconcile';

const BANK_REGISTER_MODULE_TABS = ['bankregister6', 'bankregisterhistory', 'bankregisterreconcile'];
const BANK_REGISTER_DEFAULT_TAB = 'bankregister6';

const getInitialBankRegisterTab = () => {
    const savedTab = localStorage.getItem('activePaintTab');
    if (savedTab && BANK_REGISTER_MODULE_TABS.includes(savedTab)) {
        return savedTab;
    }
    return BANK_REGISTER_DEFAULT_TAB;
};

const BankRegisterHeading = ({ username, userRoles = [] }) => {
    const initialTab = getInitialBankRegisterTab();
    const [activeTab, setActiveTab] = useState(() => initialTab);
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([initialTab]));
    const [refreshNonce, setRefreshNonce] = useState(0);
    const bumpRefresh = () => setRefreshNonce((n) => n + 1);

    useEffect(() => {
        setVisitedTabs((prev) => new Set(prev).add(activeTab));
    }, [activeTab]);

    useEffect(() => {
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        bumpRefresh();
    };

    return (
        <div className="bg-[#FAF6ED] bank-register-heading-scope">
            <div className="topbar-title expense-entry-tabs w-full max-w-full overflow-x-auto no-scrollbar">
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'bankregister6' ? 'active' : ''}`}
                    onClick={() => handleTabChange('bankregister6')}
                >
                    Bank Payments
                </h2>
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'bankregisterhistory' ? 'active' : ''}`}
                    onClick={() => handleTabChange('bankregisterhistory')}
                >
                    History
                </h2>
                <h2
                    className={`link whitespace-nowrap ${activeTab === 'bankregisterreconcile' ? 'active' : ''}`}
                    onClick={() => handleTabChange('bankregisterreconcile')}
                >
                    Reconcile
                </h2>
            </div>
            <div className="content">
                {visitedTabs.has('bankregister6') && (
                    <div className={activeTab === 'bankregister6' ? '' : 'hidden'}>
                        <BankRegister6View refreshSignal={refreshNonce} isActive={activeTab === 'bankregister6'} />
                    </div>
                )}
                {visitedTabs.has('bankregisterhistory') && (
                    <div className={activeTab === 'bankregisterhistory' ? '' : 'hidden'}>
                        <BankRegisterHistory />
                    </div>
                )}
                {visitedTabs.has('bankregisterreconcile') && (
                    <div className={activeTab === 'bankregisterreconcile' ? '' : 'hidden'}>
                        <BankRegisterReconcile />
                    </div>
                )}
            </div>
        </div>
    )
}

export default BankRegisterHeading
