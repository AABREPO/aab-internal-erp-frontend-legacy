import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './InHeading.css';
import Invoice from '../Invoice/Invoice';
import EditInvoice from '../Invoice/EditInvoice';
import History from './History';
import Database from './Database';
import AddInput from './AddInput';

const Heading = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.pathname);

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activeInvoiceTab', activeTab);
    }, [activeTab]);

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
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title ml-40">
                <h2
                    className={`link ${activeTab === '/invoice-bill/invoice' ? 'active' : ''}`}
                    onClick={() => handleTabClick('/invoice-bill/invoice')}
                >
                    Create Invoice
                </h2>
                <h2
                    className={`link ${activeTab === '/invoice-bill/editinvoice' ? 'active' : ''}`}
                    onClick={() => handleTabClick('/invoice-bill/editinvoice')}
                >
                    Edit Invoice
                </h2>
                <h2
                    className={`link ${activeTab === '/invoice-bill/history' ? 'active' : ''}`}
                    onClick={() => handleTabClick('/invoice-bill/history')}
                >
                    History
                </h2>
                <h2
                    className={`link ${activeTab === '/invoice-bill/database' ? 'active' : ''}`}
                    onClick={() => handleTabClick('/invoice-bill/database')}
                >
                    Database
                </h2>
                <h2
                    className={`link ${activeTab === '/invoice-bill/addinput' ? 'active' : ''}`}
                    onClick={() => handleTabClick('/invoice-bill/addinput')}
                >
                    Add Input
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    );
};

export default Heading;
