import React, { useState, useEffect } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar, ModuleHeadingTab } from '../MainHeadingpage/MainHeadingpage';
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
        <ModuleHeadingWrapper className="w-full h-auto min-h-screen">
            <ModuleHeadingBar>
                <ModuleHeadingTab
                    active={activeTab === 'createquotation'}
                    onClick={() => setActiveTab('createquotation')}
                >
                    Create Quotation
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'quotationhistory'}
                    onClick={() => setActiveTab('quotationhistory')}
                >
                    History
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'quotationdatabase'}
                    onClick={() => setActiveTab('quotationdatabase')}
                >
                    Database
                </ModuleHeadingTab>
                <ModuleHeadingTab
                    active={activeTab === 'quotationaddinput'}
                    onClick={() => setActiveTab('quotationaddinput')}
                >
                    Add Input
                </ModuleHeadingTab>
            </ModuleHeadingBar>

            <div className="content px-4">
                {renderContent()}
            </div>
        </ModuleHeadingWrapper>
    )
}

export default QuotationHeading
