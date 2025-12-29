import React, { useState, useEffect, useRef } from 'react';

const DatePickerModal = ({ isOpen, onClose, onConfirm, initialDate }) => {
  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);
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

  // Generate years for keyboard navigation
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

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
          if (e.key === 'ArrowUp' && selectedDay > 1) {
            setSelectedDay(selectedDay - 1);
          } else if (e.key === 'ArrowDown' && selectedDay < daysInMonth) {
            setSelectedDay(selectedDay + 1);
          }
        } else if (column === 'month') {
          if (e.key === 'ArrowUp' && selectedMonth > 0) {
            setSelectedMonth(selectedMonth - 1);
          } else if (e.key === 'ArrowDown' && selectedMonth < 11) {
            setSelectedMonth(selectedMonth + 1);
          }
        } else if (column === 'year') {
          const currentIndex = years.indexOf(selectedYear);
          if (e.key === 'ArrowUp' && currentIndex > 0) {
            setSelectedYear(years[currentIndex - 1]);
          } else if (e.key === 'ArrowDown' && currentIndex < years.length - 1) {
            setSelectedYear(years[currentIndex + 1]);
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
  }, [isOpen, selectedDay, selectedMonth, selectedYear, focusedColumn, years]);

  // Scroll to selected item when it changes
  useEffect(() => {
    if (isOpen && dayRef.current) {
      const selectedButton = dayRef.current.querySelector(`[data-day="${selectedDay}"]`);
      if (selectedButton) {
        setTimeout(() => {
          selectedButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [selectedDay, isOpen]);

  useEffect(() => {
    if (isOpen && monthRef.current) {
      const selectedButton = monthRef.current.querySelector(`[data-month="${selectedMonth}"]`);
      if (selectedButton) {
        setTimeout(() => {
          selectedButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [selectedMonth, isOpen]);

  useEffect(() => {
    if (isOpen && yearRef.current) {
      const selectedButton = yearRef.current.querySelector(`[data-year="${selectedYear}"]`);
      if (selectedButton) {
        setTimeout(() => {
          selectedButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [selectedYear, isOpen]);

  // Handle mouse wheel scrolling
  const handleWheel = (e, type) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    
    if (type === 'day') {
      if (delta > 0 && selectedDay < daysInMonth) {
        setSelectedDay(selectedDay + 1);
      } else if (delta < 0 && selectedDay > 1) {
        setSelectedDay(selectedDay - 1);
      }
    } else if (type === 'month') {
      if (delta > 0 && selectedMonth < 11) {
        setSelectedMonth(selectedMonth + 1);
      } else if (delta < 0 && selectedMonth > 0) {
        setSelectedMonth(selectedMonth - 1);
      }
    } else if (type === 'year') {
      const currentIndex = years.indexOf(selectedYear);
      if (delta > 0 && currentIndex < years.length - 1) {
        setSelectedYear(years[currentIndex + 1]);
      } else if (delta < 0 && currentIndex > 0) {
        setSelectedYear(years[currentIndex - 1]);
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

  // Get all items for scrollable columns
  const getAllDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    return days.slice(0, daysInMonth);
  };

  const allDays = getAllDays();
  const allMonths = months;
  const allYears = years;

  // Get visible range for each column (showing 3 items with selected in middle)
  const getVisibleDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const validDays = allDays;
    const index = validDays.indexOf(selectedDay);
    const start = Math.max(0, Math.min(index - 1, validDays.length - 3));
    return validDays.slice(start, start + 3);
  };

  const getVisibleMonths = () => {
    const index = selectedMonth;
    const start = Math.max(0, Math.min(index - 1, allMonths.length - 3));
    return allMonths.slice(start, start + 3);
  };

  const getVisibleYears = () => {
    const index = allYears.indexOf(selectedYear);
    const start = Math.max(0, Math.min(index - 1, allYears.length - 3));
    return allYears.slice(start, start + 3);
  };

  const visibleDays = getVisibleDays();
  const visibleMonths = getVisibleMonths();
  const visibleYears = getVisibleYears();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-[320px] rounded-[6px] p-6 relative">
        <p className="text-[16px] font-medium text-black text-center mb-6">Select the Date</p>
        
        <div className="flex justify-center gap-8 mb-6">
          {/* Day */}
          <div 
            ref={dayRef}
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
            ref={monthRef}
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
            ref={yearRef}
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


