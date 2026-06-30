import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
import Invoice from '../Invoice/Invoice';
import EditInvoice from '../Invoice/EditInvoice';
import History from './History';
import Database from './Database';
import AddInput from './AddInput';

const Heading = ({ username, userRoles = [] }) => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = location.pathname;
        if (savedTab === '/invoice-bill/database' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            return '/invoice-bill/invoice';
        }
        return savedTab;
    });

    useEffect(() => {
        if (activeTab === '/invoice-bill/database' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            setActiveTab('/invoice-bill/invoice');
        } else {
            localStorage.setItem('activeInvoiceTab', activeTab);
        }
    }, [activeTab, username]);

    const renderContent = () => {
        switch (activeTab) {
            case '/invoice-bill/invoice':
                return <Invoice />;
            case '/invoice-bill/editinvoice':
                return <EditInvoice />;
            case '/invoice-bill/history':
                return <History />;
            case '/invoice-bill/database':
                return <Database />;
            case '/invoice-bill/addinput':
                return <AddInput />;
            default:
                return <Invoice />;
        }
    };

    const handleTabClick = (path) => {
        setActiveTab(path);
    };

    return (
        <ModuleHeadingWrapper>
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === '/invoice-bill/invoice'}
                    onClick={() => handleTabClick('/invoice-bill/invoice')}
                >
                    Create Invoice
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === '/invoice-bill/editinvoice'}
                    onClick={() => handleTabClick('/invoice-bill/editinvoice')}
                >
                    Edit Invoice
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === '/invoice-bill/history'}
                    onClick={() => handleTabClick('/invoice-bill/history')}
                >
                    History
                </ModuleHeadingTab>
                {(username === 'Mahalingam M' || username === 'Admin') && (
                    <ModuleHeadingTab
                        active={activeTab === '/invoice-bill/database'}
                        onClick={() => handleTabClick('/invoice-bill/database')}
                    >
                        Database
                    </ModuleHeadingTab>
                )}
                <ModuleHeadingTab
                    active={activeTab === '/invoice-bill/addinput'}
                    onClick={() => handleTabClick('/invoice-bill/addinput')}
                >
                    Add Input
                </ModuleHeadingTab>
            </ModuleHeadingBar>
            <div className="content">
                {renderContent()}
            </div>
        </ModuleHeadingWrapper>
    );
};

export default Heading;
