import React, { useState, useEffect } from 'react';

const DateRangePickerModal = ({ isOpen, onClose, onConfirm, initialStartDate, initialEndDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectingStart, setSelectingStart] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Parse initial dates if provided
      if (initialStartDate) {
        const parsed = parseDate(initialStartDate);
        if (parsed) {
          setStartDate(parsed);
          setCurrentMonth(parsed.getMonth());
          setCurrentYear(parsed.getFullYear());
        }
      }
      if (initialEndDate) {
        const parsed = parseDate(initialEndDate);
        if (parsed) {
          setEndDate(parsed);
        }
      }
      if (!initialStartDate && !initialEndDate) {
        const now = new Date();
        setCurrentMonth(now.getMonth());
        setCurrentYear(now.getFullYear());
        setStartDate(null);
        setEndDate(null);
        setSelectingStart(true);
      }
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  const parseDate = (dateString) => {
    if (!dateString) return null;
    // Try DD/MM/YYYY format
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
    // Try YYYY-MM-DD format
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
    // Try Date object
    try {
      return new Date(dateString);
    } catch {
      return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForFilter = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    
    if (selectingStart || !startDate) {
      // Selecting start date
      setStartDate(clickedDate);
      setEndDate(null);
      setSelectingStart(false);
    } else {
      // Selecting end date
      if (clickedDate < startDate) {
        // If clicked date is before start date, make it the new start date
        setEndDate(startDate);
        setStartDate(clickedDate);
      } else {
        setEndDate(clickedDate);
      }
    }
  };

  const isDateInRange = (day) => {
    if (!startDate) return false;
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    
    if (endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      return date >= start && date <= end;
    }
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    return date.getTime() === start.getTime();
  };

  const isStartDate = (day) => {
    if (!startDate) return false;
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    return date.getTime() === start.getTime();
  };

  const isEndDate = (day) => {
    if (!endDate) return false;
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return date.getTime() === end.getTime();
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDone = () => {
    if (startDate) {
      const startFormatted = formatDateForFilter(startDate);
      const endFormatted = endDate ? formatDateForFilter(endDate) : startFormatted;
      onConfirm(startFormatted, endFormatted);
    }
    onClose();
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectingStart(true);
  };

  if (!isOpen) return null;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  
  // Get previous month's last days
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);
  
  const days = [];
  
  // Add previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false
    });
  }
  
  // Add current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true
    });
  }
  
  // Add next month's leading days to fill the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false
    });
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div 
        className="bg-white w-[328px] rounded-[8px] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousMonth}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          
          <p className="text-[14px] font-semibold text-black">
            {monthNames[currentMonth]} {currentYear}
          </p>
          
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, idx) => (
            <div key={idx} className="text-center text-[11px] font-medium text-[#9E9E9E] py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((dateObj, idx) => {
            const { day, month, year, isCurrentMonth } = dateObj;
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            
            // Check if this date is start/end/in range (works across months)
            let isStart = false;
            let isEnd = false;
            let inRange = false;
            
            if (startDate) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              isStart = date.getTime() === start.getTime();
            }
            
            if (endDate) {
              const end = new Date(endDate);
              end.setHours(0, 0, 0, 0);
              isEnd = date.getTime() === end.getTime();
            }
            
            if (startDate && endDate) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              const end = new Date(endDate);
              end.setHours(0, 0, 0, 0);
              inRange = date >= start && date <= end && !isStart && !isEnd;
            } else if (startDate && !endDate) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              inRange = date.getTime() === start.getTime();
            }
            
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <button
                key={idx}
                onClick={() => isCurrentMonth && handleDateClick(day)}
                disabled={!isCurrentMonth}
                className={`
                  h-[32px] flex items-center justify-center text-[12px] font-medium rounded-full relative
                  ${!isCurrentMonth ? 'text-[#D9D9D9]' : ''}
                  ${isStart || isEnd ? 'bg-black text-white' : ''}
                  ${inRange && !isStart && !isEnd ? 'bg-[#F5F5F5]' : ''}
                  ${!inRange && !isStart && !isEnd && isCurrentMonth ? 'hover:bg-gray-100 text-black' : ''}
                  ${isToday && !isStart && !isEnd && !inRange ? 'border border-black' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Selected Range Display */}
        {(startDate || endDate) && (
          <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
            <div className="flex items-center justify-between text-[12px] text-[#777777] mb-2">
              <span>Start: {startDate ? formatDate(startDate) : 'Not selected'}</span>
              <span>End: {endDate ? formatDate(endDate) : 'Not selected'}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E0E0E0]">
          <button
            onClick={onClose}
            className="text-[14px] font-medium text-[#9E9E9E] hover:text-black transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {(startDate || endDate) && (
              <button
                onClick={handleClear}
                className="text-[14px] font-medium text-[#9E9E9E] hover:text-black transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleDone}
              disabled={!startDate}
              className="text-[14px] font-semibold text-black hover:text-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangePickerModal;

