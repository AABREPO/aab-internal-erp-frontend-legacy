import React, { useState, useEffect } from 'react';

const DatePickerModal = ({ isOpen, onClose, onConfirm, initialDate }) => {
  const [focusedColumn, setFocusedColumn] = useState(null); // 'day', 'month', 'year'
  // Parse initial date or use current date
  const getInitialDate = () => {
    if (initialDate) {
      // Parse date from format like "10/11/2025"
      const parts = initialDate.split('/');
      if (parts.length === 3) {
        return {
          day: parseInt(parts[0]),
          month: parseInt(parts[1]) - 1, // JavaScript months are 0-indexed
          year: parseInt(parts[2])
        };
      }
    }
    const now = new Date();
    return {
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear()
    };
  };

  const initial = getInitialDate();
  const [selectedDay, setSelectedDay] = useState(initial.day);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedYear, setSelectedYear] = useState(initial.year);

  // Get days in selected month/year
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Update when initialDate changes
  useEffect(() => {
    if (isOpen && initialDate) {
      const parsed = getInitialDate();
      setSelectedDay(parsed.day);
      setSelectedMonth(parsed.month);
      setSelectedYear(parsed.year);
    }
  }, [isOpen, initialDate]);

  // Adjust day if it's invalid for selected month
  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, selectedDay]);

  // Generate years dynamically - no limit, supports unlimited year selection
  // Years are generated dynamically based on selectedYear

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
        
        // Determine which column to navigate based on focus or default to day
        const column = focusedColumn || 'day';
        
        if (column === 'day') {
          if (e.key === 'ArrowUp') {
            setSelectedDay((prev) => (prev === 1 ? daysInMonth : prev - 1));
          } else if (e.key === 'ArrowDown') {
            setSelectedDay((prev) => (prev === daysInMonth ? 1 : prev + 1));
          }
        } else if (column === 'month') {
          if (e.key === 'ArrowUp') {
            setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1));
          } else if (e.key === 'ArrowDown') {
            setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1));
          }
        } else if (column === 'year') {
          // Unlimited year selection - no bounds
          if (e.key === 'ArrowUp') {
            setSelectedYear(selectedYear - 1);
          } else if (e.key === 'ArrowDown') {
            setSelectedYear(selectedYear + 1);
          }
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Handle tab navigation between columns
        if (focusedColumn === 'day') {
          setFocusedColumn('month');
        } else if (focusedColumn === 'month') {
          setFocusedColumn('year');
        } else {
          setFocusedColumn('day');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedDay, selectedMonth, selectedYear, focusedColumn]);

  // Handle mouse wheel scrolling
  const handleWheel = (e, type) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    
    if (type === 'day') {
      if (delta > 0) {
        setSelectedDay((prev) => (prev === daysInMonth ? 1 : prev + 1));
      } else if (delta < 0) {
        setSelectedDay((prev) => (prev === 1 ? daysInMonth : prev - 1));
      }
    } else if (type === 'month') {
      if (delta > 0) {
        setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1));
      } else if (delta < 0) {
        setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1));
      }
    } else if (type === 'year') {
      // Unlimited year selection - no bounds
      if (delta > 0) {
        setSelectedYear(selectedYear + 1);
      } else if (delta < 0) {
        setSelectedYear(selectedYear - 1);
      }
    }
  };

  if (!isOpen) return null;

  // Generate days (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Generate months
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const months = monthNames.map((name, index) => ({ name, index }));

  const handleOK = () => {
    const day = selectedDay.toString().padStart(2, '0');
    const month = (selectedMonth + 1).toString().padStart(2, '0');
    const formattedDate = `${day}/${month}/${selectedYear}`;
    onConfirm(formattedDate);
    onClose();
  };

  const getCircularDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const prevDay = selectedDay === 1 ? daysInMonth : selectedDay - 1;
    const nextDay = selectedDay === daysInMonth ? 1 : selectedDay + 1;
    return [prevDay, selectedDay, nextDay];
  };

  const getCircularMonths = () => {
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    return [months[prevMonth], months[selectedMonth], months[nextMonth]];
  };

  // Generate visible years dynamically based on selectedYear (no limit)
  const getVisibleYears = () => {
    return [selectedYear - 1, selectedYear, selectedYear + 1];
  };

  const visibleDays = getCircularDays();
  const visibleMonths = getCircularMonths();
  const visibleYears = getVisibleYears();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-[320px] rounded-[6px] p-6 relative">
        <p className="text-[16px] font-medium text-black text-center mb-6">Select the Date</p>
        
        <div className="flex justify-center gap-8 mb-6">
          {/* Day */}
          <div 
            className="flex flex-col items-center relative"
            onFocus={() => setFocusedColumn('day')}
            onWheel={(e) => handleWheel(e, 'day')}
            tabIndex={0}
          >
            {visibleDays.map((day, idx) => (
              <div key={day} className="relative w-full flex flex-col items-center">
                {idx > 0 && (
                  <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-[rgba(0,0,0,0.16)]"></div>
                )}
                <button
                  data-day={day}
                  onClick={() => {
                    setSelectedDay(day);
                    setFocusedColumn('day');
                  }}
                  className={`w-12 h-8 text-[14px] relative ${
                    selectedDay === day 
                      ? 'font-medium text-black' 
                      : 'font-normal text-[#979ea3]'
                  }`}
                >
                  {day}
                </button>
                {idx < visibleDays.length - 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-[rgba(0,0,0,0.16)]"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Month */}
          <div 
            className="flex flex-col items-center relative"
            onFocus={() => setFocusedColumn('month')}
            onWheel={(e) => handleWheel(e, 'month')}
            tabIndex={0}
          >
            {visibleMonths.map((month, idx) => (
              <div key={month.index} className="relative w-full flex flex-col items-center">
                {idx > 0 && (
                  <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-[rgba(0,0,0,0.16)]"></div>
                )}
                <button
                  data-month={month.index}
                  onClick={() => {
                    setSelectedMonth(month.index);
                    setFocusedColumn('month');
                  }}
                  className={`w-12 h-8 text-[14px] relative ${
                    selectedMonth === month.index 
                      ? 'font-medium text-black' 
                      : 'font-normal text-[#979ea3]'
                  }`}
                >
                  {month.name}
                </button>
                {idx < visibleMonths.length - 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-[rgba(0,0,0,0.16)]"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Year */}
          <div 
            className="flex flex-col items-center relative"
            onFocus={() => setFocusedColumn('year')}
            onWheel={(e) => handleWheel(e, 'year')}
            tabIndex={0}
          >
            {visibleYears.map((year, idx) => (
              <div key={year} className="relative w-full flex flex-col items-center">
                {idx > 0 && (
                  <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-[rgba(0,0,0,0.16)]"></div>
                )}
                <button
                  data-year={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setFocusedColumn('year');
                  }}
                  className={`w-12 h-8 text-[14px] relative ${
                    selectedYear === year 
                      ? 'font-medium text-black' 
                      : 'font-normal text-[#979ea3]'
                  }`}
                >
                  {year}
                </button>
                {idx < visibleYears.length - 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-[rgba(0,0,0,0.16)]"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="text-[#656565] text-[16px] font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleOK}
            className="text-[#bf9853] text-[16px] font-bold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;


