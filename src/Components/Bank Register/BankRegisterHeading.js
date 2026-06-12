import React, { useState, useEffect } from 'react'
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
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
        <ModuleHeadingWrapper className="bank-register-heading-scope">
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'bankregister6'}
                    onClick={() => handleTabChange('bankregister6')}
                >
                    Bank Payments
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'bankregisterhistory'}
                    onClick={() => handleTabChange('bankregisterhistory')}
                >
                    History
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'bankregisterreconcile'}
                    onClick={() => handleTabChange('bankregisterreconcile')}
                >
                    Reconcile
                </ModuleHeadingTab>
            </ModuleHeadingBar>
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
        </ModuleHeadingWrapper>
    )
}

export default BankRegisterHeading
