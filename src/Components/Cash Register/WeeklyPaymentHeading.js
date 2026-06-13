import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../Heading.css';
import WeeklyPayment from './WeeklyPayment';
import History from './WeeklyPaymentHistory';
import HandoverPaymentsPage from './WeeklyPaymentHandover';
import DailyPayment from './DailyPayment';
import WeeklyPaymentAddInput from './WeeklyPaymentAddInput';
import DailyHistory from './DailyHistory';
import download from '../Images/file_download.png';
import XL from '../Images/sheets.png';
const WHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'claimpaymentsummary'
    );
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([activeTab]));
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const weeklyHistoryExportActionsRef = useRef(null);
    const exportDropdownRef = useRef(null);
    const exportMenuRef = useRef(null);
    const [exportMenuPosition, setExportMenuPosition] = useState(null);
    const handleExportActionsReady = useCallback((actions) => {
        weeklyHistoryExportActionsRef.current = actions;
    }, []);

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        setVisitedTabs((prev) => new Set(prev).add(activeTab));
    }, [activeTab]);

    useEffect(() => {
        if (!showExportDropdown) return;
        const handleClickOutside = (event) => {
            if (
                exportDropdownRef.current?.contains(event.target) ||
                exportMenuRef.current?.contains(event.target)
            ) {
                return;
            }
            setShowExportDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showExportDropdown]);

    useEffect(() => {
        if (!showExportDropdown || !exportDropdownRef.current) {
            setExportMenuPosition(null);
            return;
        }
        const updatePosition = () => {
            const rect = exportDropdownRef.current.getBoundingClientRect();
            setExportMenuPosition({
                top: rect.bottom + 4,
                right: window.innerWidth - rect.right,
            });
        };
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [showExportDropdown]);

    useEffect(() => {
        if (activeTab !== 'weeklyhistory') {
            setShowExportDropdown(false);
        }
    }, [activeTab]);

    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title expense-entry-tabs w-full max-w-full flex items-center justify-between overflow-x-auto overflow-y-visible no-scrollbar">
                <div className="flex items-center min-w-0 overflow-x-auto no-scrollbar">
                    <h2 className={`link whitespace-nowrap ${activeTab === 'weeklypayment' ? 'active' : ''}`} onClick={() => setActiveTab('weeklypayment')}>
                        Weekly Payment
                    </h2>
                    <h2 className={`link whitespace-nowrap ${activeTab === 'dailypayment' ? 'active' : ''}`} onClick={() => setActiveTab('dailypayment')}>
                        Daily Payment
                    </h2>
                    <h2 className={`link whitespace-nowrap ${activeTab === 'weeklyhistory' ? 'active' : ''}`} onClick={() => setActiveTab('weeklyhistory')}>
                       Weekly History
                    </h2>
                    <h2 className={`link whitespace-nowrap ${activeTab === 'dailyhistory' ? 'active' : ''}`} onClick={() => setActiveTab('dailyhistory')}>
                        Daily History
                    </h2>
                    <h2 className={`link whitespace-nowrap ${activeTab === 'handoverpaymentspage' ? 'active' : ''}`} onClick={() => setActiveTab('handoverpaymentspage')} >
                        Handover
                    </h2>
                    <h2 className={`link whitespace-nowrap ${activeTab === 'weeklypaymentaddinput' ? 'active' : ''}`} onClick={() => setActiveTab('weeklypaymentaddinput')} >
                        Add Input
                    </h2>
                </div>
                {activeTab === 'weeklyhistory' && (
                    <div className="relative shrink-0 ml-3 mb-2 z-[500]" ref={exportDropdownRef}>
                        <button
                            type="button"
                            className="font-semibold text-sm cursor-pointer flex items-center gap-1 shrink-0 border border-[#D6D6D6] rounded-md px-3 py-1.5 bg-white"
                            onClick={() => setShowExportDropdown((prev) => !prev)}
                        >
                            Export
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {showExportDropdown && exportMenuPosition && createPortal(
                            <div
                                ref={exportMenuRef}
                                className="fixed z-[9999] bg-white border border-[#D6D6D6] rounded-md shadow-lg py-1 min-w-[120px]"
                                style={{ top: exportMenuPosition.top, right: exportMenuPosition.right }}
                            >
                                <button
                                    type="button"
                                    className="w-full font-semibold text-sm cursor-pointer flex items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50"
                                    onClick={() => {
                                        setShowExportDropdown(false);
                                        weeklyHistoryExportActionsRef.current?.generatePDF?.();
                                    }}
                                >
                                    PDF
                                    <img className="w-6 h-5" src={download} alt="Download" />
                                </button>
                                <button
                                    type="button"
                                    className="w-full font-semibold text-sm cursor-pointer flex items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50 text-[#007233]"
                                    onClick={() => setShowExportDropdown(false)}
                                >
                                    XL
                                    <img className="w-4 h-4" src={XL} alt="XL" />
                                </button>
                            </div>,
                            document.body
                        )}
                    </div>
                )}
            </div>
            <div className="content">
                {visitedTabs.has('weeklypayment') && (
                    <div className={activeTab === 'weeklypayment' ? '' : 'hidden'}>
                        <WeeklyPayment username={username} userRoles={userRoles} />
                    </div>
                )}
                {visitedTabs.has('dailypayment') && (
                    <div className={activeTab === 'dailypayment' ? '' : 'hidden'}>
                        <DailyPayment username={username} userRoles={userRoles} />
                    </div>
                )}
                {visitedTabs.has('dailyhistory') && (
                    <div className={activeTab === 'dailyhistory' ? '' : 'hidden'}>
                        <DailyHistory username={username} userRoles={userRoles} />
                    </div>
                )}
                {visitedTabs.has('weeklyhistory') && (
                    <div className={activeTab === 'weeklyhistory' ? '' : 'hidden'}>
                        <History username={username} userRoles={userRoles} onExportActionsReady={handleExportActionsReady} />
                    </div>
                )}
                {visitedTabs.has('handoverpaymentspage') && (
                    <div className={activeTab === 'handoverpaymentspage' ? '' : 'hidden'}>
                        <HandoverPaymentsPage username={username} userRoles={userRoles} />
                    </div>
                )}
                {visitedTabs.has('weeklypaymentaddinput') && (
                    <div className={activeTab === 'weeklypaymentaddinput' ? '' : 'hidden'}>
                        <WeeklyPaymentAddInput username={username} userRoles={userRoles} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default WHeading
