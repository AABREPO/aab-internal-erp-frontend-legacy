import React, { useState, useEffect } from 'react';
import CreateQuotation from './CreateQuotation';
import QuotationDatabase from './QuotationDatabase';
import QuotationHistory from './QuotationHistory';
import QuotationAddInput from './QuotationAddInput';

const QuotationHeading = ({ username, userRoles = [] }) => {

    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'createquotation'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'createquotation':
                return <CreateQuotation username={username} userRoles={userRoles} />;
            case 'quotationhistory':
                return <QuotationHistory username={username} userRoles={userRoles} />;
            case 'quotationdatabase':
                return <QuotationDatabase username={username} userRoles={userRoles} />;
            case 'quotationaddinput':
                return <QuotationAddInput username={username} userRoles={userRoles} />;
            default:
                return <CreateQuotation username={username} userRoles={userRoles} />;
        }
    };

    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
            {/* Top Navigation Tabs */}
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'createquotation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('createquotation')}
                >
                    Create Quotation
                </h2>
                <h2
                    className={`link ${activeTab === 'quotationhistory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('quotationhistory')}
                >
                    History
                </h2>
                <h2
                    className={`link ${activeTab === 'quotationdatabase' ? 'active' : ''}`}
                    onClick={() => setActiveTab('quotationdatabase')}
                >
                    Database
                </h2>
                <h2
                    className={`link ${activeTab === 'quotationaddinput' ? 'active' : ''}`}
                    onClick={() => setActiveTab('quotationaddinput')}
                >
                    Add Input
                </h2>
            </div>

            {/* Dynamic Content Area */}
            <div className="content px-4">
                {renderContent()}
            </div>
        </div>
    )
}

export default QuotationHeading
