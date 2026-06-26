import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../Heading.css';
import WeeklyPayment from './WeeklyPayment';
import History from './WeeklyPaymentHistory';
import DailyPayment from './DailyPayment';
import WeeklyPaymentAddInput from './WeeklyPaymentAddInput';
import DailyHistory from './DailyHistory';
import PdfIcon from '../Images/pdf.png';
import XL from '../Images/sheets.png';
const WHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('activePaintTab');
        const validTabs = ['weeklypayment', 'dailypayment', 'weeklyhistory', 'dailyhistory', 'weeklypaymentaddinput'];
        return validTabs.includes(savedTab) ? savedTab : 'weeklypayment';
    });
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([activeTab]));
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const weeklyHistoryExportActionsRef = useRef(null);
    const weeklyHistoryHandoverActionsRef = useRef(null);
    const weeklyPaymentClosureActionsRef = useRef(null);
    const weeklyPaymentExportActionsRef = useRef(null);
    const dailyHistoryExportActionsRef = useRef(null);
    const dailyPaymentExportActionsRef = useRef(null);
    const exportDropdownRef = useRef(null);
    const exportMenuRef = useRef(null);
    const tabsScrollRef = useRef(null);
    const isTabsDragging = useRef(false);
    const tabsDidDrag = useRef(false);
    const tabsDragStart = useRef({ x: 0, scrollLeft: 0 });
    const [exportMenuPosition, setExportMenuPosition] = useState(null);
    const [closureButtonDisabled, setClosureButtonDisabled] = useState(true);
    const handleExportActionsReady = useCallback((actions) => {
        weeklyHistoryExportActionsRef.current = actions;
    }, []);
    const handleHandoverActionsReady = useCallback((actions) => {
        weeklyHistoryHandoverActionsRef.current = actions;
    }, []);
    const handleClosureActionsReady = useCallback((actions) => {
        weeklyPaymentClosureActionsRef.current = actions;
        setClosureButtonDisabled(actions ? Boolean(actions.isClosureDisabled) : true);
    }, []);
    const handleWeeklyPaymentExportActionsReady = useCallback((actions) => {
        weeklyPaymentExportActionsRef.current = actions;
    }, []);
    const handleDailyHistoryExportActionsReady = useCallback((actions) => {
        dailyHistoryExportActionsRef.current = actions;
    }, []);
    const handleDailyPaymentExportActionsReady = useCallback((actions) => {
        dailyPaymentExportActionsRef.current = actions;
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
                width: rect.width,
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
        if (activeTab !== 'weeklyhistory' && activeTab !== 'dailyhistory' && activeTab !== 'weeklypayment' && activeTab !== 'dailypayment') {
            setShowExportDropdown(false);
        }
    }, [activeTab]);

    const handleTabsMouseDown = (e) => {
        if (!tabsScrollRef.current) return;
        if (e.target.closest('button, a, input, select, textarea')) return;
        if (e.button !== 0) return;
        isTabsDragging.current = true;
        tabsDidDrag.current = false;
        tabsDragStart.current = {
            x: e.clientX,
            scrollLeft: tabsScrollRef.current.scrollLeft,
        };
        tabsScrollRef.current.style.cursor = 'grabbing';
        tabsScrollRef.current.style.userSelect = 'none';
    };

    const handleTabsMouseMove = (e) => {
        if (!isTabsDragging.current || !tabsScrollRef.current) return;
        const dx = e.clientX - tabsDragStart.current.x;
        if (Math.abs(dx) > 5) {
            tabsDidDrag.current = true;
        }
        tabsScrollRef.current.scrollLeft = tabsDragStart.current.scrollLeft - dx;
    };

    const handleTabsMouseUp = () => {
        if (!tabsScrollRef.current) return;
        isTabsDragging.current = false;
        tabsScrollRef.current.style.cursor = '';
        tabsScrollRef.current.style.userSelect = '';
    };

    const handleTabsTouchStart = (e) => {
        if (!tabsScrollRef.current) return;
        if (e.target.closest('button, a, input, select, textarea')) return;
        isTabsDragging.current = true;
        tabsDidDrag.current = false;
        tabsDragStart.current = {
            x: e.touches[0].clientX,
            scrollLeft: tabsScrollRef.current.scrollLeft,
        };
        tabsScrollRef.current.style.userSelect = 'none';
    };

    const handleTabsTouchEnd = () => {
        if (!tabsScrollRef.current) return;
        isTabsDragging.current = false;
        tabsScrollRef.current.style.userSelect = '';
    };

    const handleTabClick = (tab) => {
        if (tabsDidDrag.current) {
            tabsDidDrag.current = false;
            return;
        }
        setActiveTab(tab);
    };

    useEffect(() => {
        const el = tabsScrollRef.current;
        if (!el) return;
        const handleTabsTouchMove = (e) => {
            if (!isTabsDragging.current || !tabsScrollRef.current) return;
            const dx = e.touches[0].clientX - tabsDragStart.current.x;
            if (Math.abs(dx) > 5) {
                tabsDidDrag.current = true;
            }
            if (tabsDidDrag.current) {
                e.preventDefault();
                tabsScrollRef.current.scrollLeft = tabsDragStart.current.scrollLeft - dx;
            }
        };
        el.addEventListener('touchmove', handleTabsTouchMove, { passive: false });
        return () => el.removeEventListener('touchmove', handleTabsTouchMove);
    }, []);

    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title expense-entry-tabs w-full max-w-full flex items-center overflow-hidden">
                <div
                    ref={tabsScrollRef}
                    className="flex flex-1 min-w-0 items-center flex-nowrap overflow-x-auto overflow-y-hidden no-scrollbar scrollbar-none cursor-grab touch-pan-x"
                    onMouseDown={handleTabsMouseDown}
                    onMouseMove={handleTabsMouseMove}
                    onMouseUp={handleTabsMouseUp}
                    onMouseLeave={handleTabsMouseUp}
                    onTouchStart={handleTabsTouchStart}
                    onTouchEnd={handleTabsTouchEnd}
                    onTouchCancel={handleTabsTouchEnd}
                >
                    <h2 className={`link whitespace-nowrap shrink-0 ${activeTab === 'weeklypayment' ? 'active' : ''}`} onClick={() => handleTabClick('weeklypayment')}>
                        Weekly Payment
                    </h2>
                    <h2 className={`link whitespace-nowrap shrink-0 ${activeTab === 'dailypayment' ? 'active' : ''}`} onClick={() => handleTabClick('dailypayment')}>
                        Daily Payment
                    </h2>
                    <h2 className={`link whitespace-nowrap shrink-0 ${activeTab === 'weeklyhistory' ? 'active' : ''}`} onClick={() => handleTabClick('weeklyhistory')}>
                       Weekly History
                    </h2>
                    <h2 className={`link whitespace-nowrap shrink-0 ${activeTab === 'dailyhistory' ? 'active' : ''}`} onClick={() => handleTabClick('dailyhistory')}>
                        Daily History
                    </h2>
                    <h2 className={`link whitespace-nowrap shrink-0 ${activeTab === 'weeklypaymentaddinput' ? 'active' : ''}`} onClick={() => handleTabClick('weeklypaymentaddinput')} >
                        Input Data
                    </h2>
                </div>
                {(activeTab === 'weeklyhistory' || activeTab === 'dailyhistory' || activeTab === 'weeklypayment' || activeTab === 'dailypayment') && (
                    <div className="flex items-center gap-2 shrink-0 ml-3 mb-2 z-[500]">
                        {activeTab === 'weeklypayment' && (
                            <button
                                type="button"
                                className="font-semibold text-sm cursor-pointer shrink-0 border border-[#BF9853] rounded-md px-3 py-1.5 bg-[#BF9853] text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={() => weeklyPaymentClosureActionsRef.current?.openClosure?.()}
                                disabled={closureButtonDisabled}
                                title={closureButtonDisabled ? "Select a branch first" : "Closure"}
                            >
                                Closure
                            </button>
                        )}
                        {activeTab === 'weeklyhistory' && (
                            <button
                                type="button"
                                className="font-semibold text-sm cursor-pointer shrink-0 border border-[#BF9853] rounded-md px-3 py-1.5 bg-[#BF9853] text-white"
                                onClick={() => weeklyHistoryHandoverActionsRef.current?.openHandover?.()}
                            >
                                Handover
                            </button>
                        )}
                    <div className="relative shrink-0" ref={exportDropdownRef}>
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
                                className="fixed z-[9999] bg-white border border-[#D6D6D6] rounded-md shadow-lg py-1"
                                style={{ top: exportMenuPosition.top, right: exportMenuPosition.right, width: exportMenuPosition.width }}
                            >
                                <button
                                    type="button"
                                    className="w-full font-semibold text-sm cursor-pointer flex items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50"
                                    onClick={() => {
                                        setShowExportDropdown(false);
                                        if (activeTab === 'dailyhistory') {
                                            dailyHistoryExportActionsRef.current?.generatePDF?.();
                                        } else if (activeTab === 'dailypayment') {
                                            dailyPaymentExportActionsRef.current?.generatePDF?.();
                                        } else if (activeTab === 'weeklypayment') {
                                            weeklyPaymentExportActionsRef.current?.generatePDF?.();
                                        } else {
                                            weeklyHistoryExportActionsRef.current?.generatePDF?.();
                                        }
                                    }}
                                >
                                    PDF
                                    <img className="w-4 h-4" src={PdfIcon} alt="Pdf" />
                                </button>
                                <button
                                    type="button"
                                    className="w-full font-semibold text-sm cursor-pointer flex items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50 text-black"
                                    onClick={() => {
                                        setShowExportDropdown(false);
                                        if (activeTab === 'dailyhistory') {
                                            dailyHistoryExportActionsRef.current?.generateExcel?.();
                                        }
                                    }}
                                >
                                    XL
                                    <img className="w-4 h-4" src={XL} alt="XL" />
                                </button>
                            </div>,
                            document.body
                        )}
                    </div>
                    </div>
                )}
            </div>
            <div className="content flex flex-col min-h-0 overflow-hidden">
                {visitedTabs.has('weeklypayment') && (
                    <div className={activeTab === 'weeklypayment' ? '' : 'hidden'}>
                        <WeeklyPayment username={username} userRoles={userRoles} onExportActionsReady={handleWeeklyPaymentExportActionsReady} onClosureActionsReady={handleClosureActionsReady} isTabActive={activeTab === 'weeklypayment'} />
                    </div>
                )}
                {visitedTabs.has('dailypayment') && (
                    <div className={activeTab === 'dailypayment' ? '' : 'hidden'}>
                        <DailyPayment username={username} userRoles={userRoles} onExportActionsReady={handleDailyPaymentExportActionsReady} isTabActive={activeTab === 'dailypayment'} />
                    </div>
                )}
                {visitedTabs.has('dailyhistory') && (
                    <div className={activeTab === 'dailyhistory' ? '' : 'hidden'}>
                        <DailyHistory username={username} userRoles={userRoles} onExportActionsReady={handleDailyHistoryExportActionsReady} isTabActive={activeTab === 'dailyhistory'} />
                    </div>
                )}
                {visitedTabs.has('weeklyhistory') && (
                    <div className={activeTab === 'weeklyhistory' ? '' : 'hidden'}>
                        <History username={username} userRoles={userRoles} onExportActionsReady={handleExportActionsReady} onHandoverActionsReady={handleHandoverActionsReady} isTabActive={activeTab === 'weeklyhistory'} />
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
