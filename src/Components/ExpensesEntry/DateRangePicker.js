import React, { useState, useEffect } from 'react';
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

const DateRangePicker = ({ isOpen, onClose, startDate, endDate, onApply }) => {
    const [viewDate, setViewDate] = useState(() => startDate ? parseISO(startDate) : new Date());
    const [tempFrom, setTempFrom] = useState(startDate ? parseISO(startDate) : null);
    const [tempTo, setTempTo] = useState(endDate ? parseISO(endDate) : null);

    useEffect(() => {
        if (isOpen) {
            const sd = startDate && startDate.trim() ? parseISO(startDate) : null;
            const ed = endDate && endDate.trim() ? parseISO(endDate) : null;
            setTempFrom(sd);
            setTempTo(ed);
            setViewDate(sd || ed || new Date());
        }
    }, [isOpen, startDate, endDate]);

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const weeks = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            weekDays.push(day);
            day = addDays(day, 1);
        }
        weeks.push(weekDays);
    }

    const handleDateClick = (d) => {
        if (!tempFrom || tempTo) {
            setTempFrom(d);
            setTempTo(null);
        } else {
            if (d < tempFrom) {
                setTempTo(tempFrom);
                setTempFrom(d);
            } else {
                setTempTo(d);
            }
        }
    };

    const isInRange = (d) => {
        if (!tempFrom || !tempTo) return false;
        return isWithinInterval(d, { start: tempFrom, end: tempTo });
    };

    const isSelected = (d) => {
        return (tempFrom && isSameDay(d, tempFrom)) || (tempTo && isSameDay(d, tempTo));
    };

    const handleClear = () => {
        setTempFrom(null);
        setTempTo(null);
    };

    const handleCancel = () => {
        setTempFrom(startDate ? parseISO(startDate) : null);
        setTempTo(endDate ? parseISO(endDate) : null);
        onClose();
    };

    const handleDone = () => {
        const fromStr = tempFrom ? format(tempFrom, 'yyyy-MM-dd') : '';
        const toStr = tempTo ? format(tempTo, 'yyyy-MM-dd') : '';
        onApply(fromStr, toStr);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-xl p-4 w-[320px]">
                {/* Header: Month/Year with arrows */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        type="button"
                        onClick={() => setViewDate(subMonths(viewDate, 1))}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 text-lg font-medium"
                    >
                        &lt;
                    </button>
                    <span className="text-base font-semibold text-gray-800">
                        {format(viewDate, 'MMMM yyyy')}
                    </span>
                    <button
                        type="button"
                        onClick={() => setViewDate(addMonths(viewDate, 1))}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 text-lg font-medium"
                    >
                        &gt;
                    </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                        <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0.5">
                    {weeks.flatMap((week) =>
                        week.map((d) => {
                            const inMonth = isSameMonth(d, viewDate);
                            const inRange = isInRange(d);
                            const selected = isSelected(d);
                            return (
                                <button
                                    key={d.toISOString()}
                                    type="button"
                                    onClick={() => handleDateClick(d)}
                                    className={`
                                        w-9 h-9 flex items-center justify-center text-sm rounded
                                        ${!inMonth ? 'text-gray-300' : 'text-gray-800'}
                                        ${inRange && !selected ? 'bg-gray-200' : ''}
                                        ${selected ? 'bg-black text-white' : ''}
                                        ${inMonth && !selected ? 'hover:bg-gray-100' : ''}
                                    `}
                                >
                                    {format(d, 'd')}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                        Clear
                    </button>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="text-sm font-medium text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDone}
                            className="text-sm font-medium text-gray-800 hover:text-black"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DateRangePicker;
