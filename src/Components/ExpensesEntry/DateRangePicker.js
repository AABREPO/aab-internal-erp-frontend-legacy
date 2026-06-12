import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isWithinInterval,
    parseISO,
} from 'date-fns';

const DATE_RANGE_PICKER_PANEL_WIDTH_PX = 252;
const DATE_RANGE_PICKER_PANEL_PADDING_PX = 6;
const DATE_RANGE_PICKER_DAY_CELL_SIZE_PX = 26;
const DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX = 26;
const DATE_RANGE_PICKER_MONTHS = Array.from({ length: 12 }, (_, i) => format(new Date(2024, i, 1), 'MMM'));

const buildYearGrid = (centerYear) => {
    const start = centerYear - 4;
    return Array.from({ length: 12 }, (_, i) => start + i);
};

const DateRangePicker = ({
    isOpen,
    onClose,
    startDate,
    endDate,
    onApply,
    variant = 'modal',
    controlHeightPx,
    anchorRef,
}) => {
    const [viewDate, setViewDate] = useState(() => (startDate ? parseISO(startDate) : new Date()));
    const [tempFrom, setTempFrom] = useState(startDate ? parseISO(startDate) : null);
    const [tempTo, setTempTo] = useState(endDate ? parseISO(endDate) : null);
    const [mode, setMode] = useState('day');
    const [portalStyle, setPortalStyle] = useState(null);
    const containerRef = useRef(null);
    const panelRef = useRef(null);
    const singleClickTimerRef = useRef(null);
    const tempFromRef = useRef(tempFrom);
    const tempToRef = useRef(tempTo);
    const today = useMemo(() => new Date(), []);

    useEffect(() => {
        tempFromRef.current = tempFrom;
    }, [tempFrom]);

    useEffect(() => {
        tempToRef.current = tempTo;
    }, [tempTo]);

    useEffect(() => {
        if (!isOpen) return;
        const sd = startDate && startDate.trim() ? parseISO(startDate) : null;
        const ed = endDate && endDate.trim() ? parseISO(endDate) : null;
        setTempFrom(sd);
        setTempTo(ed);
        setViewDate(sd || ed || new Date());
        setMode('day');
        return () => {
            if (singleClickTimerRef.current) {
                clearTimeout(singleClickTimerRef.current);
                singleClickTimerRef.current = null;
            }
        };
    }, [isOpen, startDate, endDate]);

    const updatePortalPosition = useCallback(() => {
        const anchor = anchorRef?.current;
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        setPortalStyle({
            position: 'fixed',
            top: rect.bottom + 8,
            left: rect.left,
            width: DATE_RANGE_PICKER_PANEL_WIDTH_PX,
            minWidth: DATE_RANGE_PICKER_PANEL_WIDTH_PX,
            maxWidth: 'none',
            zIndex: 99999,
        });
    }, [anchorRef]);

    useLayoutEffect(() => {
        if (!isOpen || variant !== 'dropdown' || !anchorRef) {
            setPortalStyle(null);
            return;
        }
        updatePortalPosition();
        window.addEventListener('scroll', updatePortalPosition, true);
        window.addEventListener('resize', updatePortalPosition);
        return () => {
            window.removeEventListener('scroll', updatePortalPosition, true);
            window.removeEventListener('resize', updatePortalPosition);
        };
    }, [isOpen, variant, anchorRef, mode, viewDate, updatePortalPosition]);

    useEffect(() => {
        if (!isOpen || variant !== 'dropdown') return;
        const onMouseDown = (e) => {
            if (containerRef.current?.contains(e.target)) return;
            if (anchorRef?.current?.contains(e.target)) return;
            onClose();
        };
        window.addEventListener('mousedown', onMouseDown);
        return () => window.removeEventListener('mousedown', onMouseDown);
    }, [isOpen, variant, onClose, anchorRef]);

    useEffect(() => {
        if (!isOpen) return;
        const onWheel = (e) => {
            const el = panelRef.current;
            if (!el) return;
            if (el.contains(e.target)) e.preventDefault();
        };
        window.addEventListener('wheel', onWheel, { passive: false, capture: true });
        return () => window.removeEventListener('wheel', onWheel, { capture: true });
    }, [isOpen]);

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const weeks = useMemo(() => {
        const rows = [];
        let day = calendarStart;
        while (day <= calendarEnd) {
            const week = [];
            for (let i = 0; i < 7; i++) {
                week.push(day);
                day = addDays(day, 1);
            }
            rows.push(week);
        }
        return rows;
    }, [calendarStart, calendarEnd]);

    const years = useMemo(() => buildYearGrid(viewDate.getFullYear()), [viewDate]);

    const applyRange = (fromDate, toDate) => {
        onApply(format(fromDate, 'yyyy-MM-dd'), format(toDate, 'yyyy-MM-dd'));
        onClose();
    };

    const applySingleDate = (d) => {
        const dateStr = format(d, 'yyyy-MM-dd');
        onApply(dateStr, dateStr);
        onClose();
    };

    const handleDateClick = (d) => {
        if (singleClickTimerRef.current) clearTimeout(singleClickTimerRef.current);
        singleClickTimerRef.current = setTimeout(() => {
            singleClickTimerRef.current = null;
            const from = tempFromRef.current;
            const to = tempToRef.current;
            if (!from || to) {
                setTempFrom(d);
                setTempTo(null);
            } else if (d < from) {
                setTempTo(from);
                setTempFrom(d);
                applyRange(d, from);
            } else {
                setTempTo(d);
                applyRange(from, d);
            }
        }, 250);
    };

    const handleDateDoubleClick = (d) => {
        if (singleClickTimerRef.current) {
            clearTimeout(singleClickTimerRef.current);
            singleClickTimerRef.current = null;
        }
        applySingleDate(d);
    };

    const isInRange = (d) => {
        if (!tempFrom || !tempTo) return false;
        return isWithinInterval(d, { start: tempFrom, end: tempTo });
    };

    const isSelected = (d) => (tempFrom && isSameDay(d, tempFrom)) || (tempTo && isSameDay(d, tempTo));

    const handleClear = () => {
        setTempFrom(null);
        setTempTo(null);
    };

    const handlePickMonth = (monthIndex) => {
        const next = new Date(viewDate);
        next.setMonth(monthIndex);
        setViewDate(next);
        setMode('day');
    };

    const handlePickYear = (year) => {
        const next = new Date(viewDate);
        next.setFullYear(year);
        setViewDate(next);
        setMode('day');
    };

    const navButtonStyle = {
        width: DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX,
        height: DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX,
    };

    if (!isOpen) return null;
    if (variant === 'dropdown' && anchorRef && !portalStyle) return null;

    const pickerPanel = (
        <div
            ref={containerRef}
            className={variant === 'dropdown' && !anchorRef ? `absolute left-0 z-[99999] ${controlHeightPx ? '' : 'top-full mt-2'}` : undefined}
            style={
                variant === 'dropdown' && anchorRef
                    ? portalStyle
                    : variant === 'dropdown' && !anchorRef
                        ? {
                            ...(controlHeightPx ? { top: `${controlHeightPx + 8}px` } : {}),
                            width: DATE_RANGE_PICKER_PANEL_WIDTH_PX,
                            minWidth: DATE_RANGE_PICKER_PANEL_WIDTH_PX,
                            maxWidth: 'none',
                        }
                        : undefined
            }
        >
            <div
                ref={panelRef}
                className="bg-white rounded-lg shadow-xl border border-gray-200 box-border"
                style={{
                    width: DATE_RANGE_PICKER_PANEL_WIDTH_PX,
                    minWidth: DATE_RANGE_PICKER_PANEL_WIDTH_PX,
                    maxWidth: 'none',
                    padding: DATE_RANGE_PICKER_PANEL_PADDING_PX,
                    boxSizing: 'border-box',
                }}
            >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    {mode === 'day' ? (
                        <button
                            type="button"
                            onClick={() => setViewDate(subMonths(viewDate, 1))}
                            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-bold"
                            style={navButtonStyle}
                            aria-label="Previous month"
                        >
                            &lt;
                        </button>
                    ) : mode === 'month' ? (
                        <button
                            type="button"
                            onClick={() => setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1))}
                            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-bold"
                            style={navButtonStyle}
                            aria-label="Previous year"
                        >
                            &lt;
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1))}
                            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-bold"
                            style={navButtonStyle}
                            aria-label="Previous years"
                        >
                            &lt;
                        </button>
                    )}

                    <div className="flex items-center justify-center min-w-0">
                        {(mode === 'day' || mode === 'month') && (
                            <button
                                type="button"
                                onClick={() => setMode((m) => (m === 'month' ? 'day' : 'month'))}
                                className="h-8 px-1 text-sm font-bold text-gray-800 hover:bg-gray-100 rounded inline-flex items-center"
                                style={{ height: DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX }}
                                aria-label="Choose month"
                            >
                                {mode === 'month' ? 'Month' : format(viewDate, 'MMMM')}
                            </button>
                        )}
                        {(mode === 'day' || mode === 'year') && (
                            <button
                                type="button"
                                onClick={() => setMode((m) => (m === 'year' ? 'day' : 'year'))}
                                className="h-8 px-1 text-sm font-bold text-gray-800 hover:bg-gray-100 rounded inline-flex items-center"
                                style={{ height: DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX }}
                                aria-label="Choose year"
                            >
                                {mode === 'year' ? 'Year' : format(viewDate, 'yyyy')}
                            </button>
                        )}
                    </div>

                    {mode === 'day' ? (
                        <button
                            type="button"
                            onClick={() => setViewDate(addMonths(viewDate, 1))}
                            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-bold"
                            style={navButtonStyle}
                            aria-label="Next month"
                        >
                            &gt;
                        </button>
                    ) : mode === 'month' ? (
                        <button
                            type="button"
                            onClick={() => setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1))}
                            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-bold"
                            style={navButtonStyle}
                            aria-label="Next year"
                        >
                            &gt;
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1))}
                            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-bold"
                            style={navButtonStyle}
                            aria-label="Next years"
                        >
                            &gt;
                        </button>
                    )}
                </div>

                {mode === 'month' ? (
                    <div className="h-[163px] flex flex-col">
                        <div className="grid grid-cols-7 gap-0.5 mb-1 invisible shrink-0" aria-hidden="true">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                <div key={d} className="text-center text-[11px] font-bold py-0.5">&nbsp;</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 grid-rows-4 gap-0.5 flex-1 min-h-0">
                            {DATE_RANGE_PICKER_MONTHS.map((label, idx) => {
                                const isActive = viewDate.getMonth() === idx;
                                return (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => handlePickMonth(idx)}
                                        className={[
                                            'flex items-center justify-center h-full min-h-0 text-xs font-bold rounded-full text-center',
                                            isActive ? 'bg-[#BF9853] text-white' : 'text-gray-800 hover:bg-[#FAF6ED]',
                                        ].join(' ')}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : mode === 'year' ? (
                    <div className="h-[163px] flex flex-col">
                        <div className="grid grid-cols-7 gap-0.5 mb-1 invisible shrink-0" aria-hidden="true">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                <div key={d} className="text-center text-[11px] font-bold py-0.5">&nbsp;</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 grid-rows-4 gap-0.5 flex-1 min-h-0">
                            {years.map((y) => {
                                const isActive = viewDate.getFullYear() === y;
                                return (
                                    <button
                                        key={y}
                                        type="button"
                                        onClick={() => handlePickYear(y)}
                                        className={[
                                            'flex items-center justify-center h-full min-h-0 text-xs font-bold rounded-full text-center',
                                            isActive ? 'bg-[#BF9853] text-white' : 'text-gray-800 hover:bg-[#FAF6ED]',
                                        ].join(' ')}
                                    >
                                        {y}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-7 gap-0.5 mb-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => (
                                <div
                                    key={d}
                                    className={`text-center text-[11px] font-bold py-0.5 ${idx === 0 || idx === 6 ? 'text-red-500' : 'text-gray-500'}`}
                                >
                                    {d}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">
                            {weeks.flatMap((week) =>
                                week.map((d) => {
                                    const inMonth = isSameMonth(d, viewDate);
                                    const inRange = isInRange(d);
                                    const selected = isSelected(d);
                                    const isToday = isSameDay(d, today);
                                    return (
                                        <button
                                            key={d.toISOString()}
                                            type="button"
                                            onClick={() => handleDateClick(d)}
                                            onDoubleClick={() => handleDateDoubleClick(d)}
                                            className={[
                                                'flex items-center justify-center text-xs rounded',
                                                inMonth ? 'text-gray-900' : 'text-gray-300',
                                                inRange && !selected ? 'bg-gray-200 font-bold' : '',
                                                selected ? 'bg-[#BF9853] text-white font-semibold' : 'font-bold',
                                                !selected && inMonth ? 'hover:bg-gray-100' : '',
                                                !selected && isToday ? 'ring-2 ring-[#BF9853] ring-inset' : '',
                                            ].filter(Boolean).join(' ')}
                                            style={{
                                                width: DATE_RANGE_PICKER_DAY_CELL_SIZE_PX,
                                                height: DATE_RANGE_PICKER_DAY_CELL_SIZE_PX,
                                            }}
                                        >
                                            {format(d, 'd')}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}

                <div className={`flex items-center justify-end gap-1 mt-1.5 pt-1.5${mode === 'day' ? '' : ' invisible pointer-events-none'}`}>
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-3 py-1 text-sm font-bold rounded hover:bg-gray-50"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (variant === 'modal') {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
                {pickerPanel}
            </div>
        );
    }

    if (anchorRef && typeof document !== 'undefined') {
        return createPortal(pickerPanel, document.body);
    }

    return pickerPanel;
};

export default DateRangePicker;
