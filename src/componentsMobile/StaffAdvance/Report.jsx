import React, { useMemo, useState } from 'react';
import Filter from '../Images/Filter.png';
import Download from '../Images/Download.svg';
import CloseIcon from '../Images/Close F.svg';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import {
  PAYMENT_MODE_OPTIONS,
  createCsvRows,
  downloadCsv,
  formatCurrencyWithSymbol,
  formatDateDisplay,
  getCurrentWeekRange,
  getEntryNumber,
  getPersonName,
  getPurposeName,
  isDateWithinRange,
  parseNumber
} from './staffAdvanceHelpers';
const TYPE_FILTER_OPTIONS = ['Advance', 'Refund', 'Transfer'];
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" />
    <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const TypePickerModal = ({ isOpen, value, searchQuery, onSearchChange, onClose, onSelect }) => {
  if (!isOpen) return null;
  const filteredTypes = TYPE_FILTER_OPTIONS.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-[16px]"
      onClick={onClose} style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div
        className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] -translate-y-[22px] rounded-b-[20px] shadow-lg flex flex-col transform max-h-[80vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center px-[24px] pt-[20px]">
          <p className="text-[16px] font-semibold text-black">Select Type</p>
          <button type="button" onClick={onClose} className="text-red-500 text-[20px] font-semibold">
            <img src={CloseIcon} alt="Close" className="w-[11px] h-[11px]" />
          </button>
        </div>
        <div className="px-[24px] pt-[4px] pb-[6px]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search"
              className="w-full h-[32px] pl-[40px] pr-[16px] border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
              autoFocus
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto mb-[8px] px-[24px] min-h-[65vh] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="shadow-md rounded-lg overflow-hidden">
            {filteredTypes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={`w-full px-[16px] flex items-center gap-3 transition-colors ${value === option ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                  }`}
                style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
              >
                <p className="text-[12px] font-medium text-black text-left">{option}</p>
              </button>
            ))}
            {!filteredTypes.length ? (
              <div className="flex items-center justify-center py-[18px] text-[12px] font-medium text-[#9E9E9E]">
                No type found
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const parseLocalDate = (dateValue) => {
  const parts = String(dateValue || '').split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map((value) => Number(value));
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};
const formatDateToDDMMYYYY = (date) => {
  if (!date || Number.isNaN(date.getTime())) return '';
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};
const getTypeCode = (type) => {
  if (type === 'Refund') return 'RF';
  if (type === 'Transfer') return 'TF';
  return 'AD';
};
const RecordCard = ({ record, peopleOptions, purposeOptions }) => {
  const amount =
    record.type === 'Refund' ? -parseNumber(record.staff_refund_amount) : parseNumber(record.amount);
  const amountColor = amount < 0 ? 'text-[#E4572E]' : 'text-[#007233]';
  return (
    <div className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]">
      <div className="flex-1 bg-white rounded-[8px] h-full px-[12px] py-[12px] transition-all duration-300 ease-out">
        <div className="flex items-start justify-between gap-[12px]">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-black leading-snug break-words">
              #{getTypeCode(record.type)} - {getPersonName(record, peopleOptions)}
            </p>
            <p className="mt-[2px] text-[12px] font-medium text-[#666666] leading-snug">
              {getPurposeName(record.from_purpose_id ?? record.purpose_id, purposeOptions)}
            </p>
            <p className="mt-[2px] text-[11px] font-medium text-[#666666] leading-snug">
              {formatDateDisplay(record.date)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="inline-flex rounded-full bg-[#E7F4FD] px-[8px] py-[2px] text-[10px] font-medium text-[#336EA8]">
              {record.staff_payment_mode || record.type || 'Mode'}
            </span>
            <p className={`mt-[10px] text-[14px] font-semibold ${amountColor}`}>
              {amount < 0
                ? `-${formatCurrencyWithSymbol(Math.abs(amount))}`
                : formatCurrencyWithSymbol(amount)}
            </p>
            <p className="mt-[2px] text-[12px] font-medium text-black leading-snug">
              #{getEntryNumber(record)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
const Report = ({ records, peopleOptions, purposeOptions, paymentModeOptions = PAYMENT_MODE_OPTIONS }) => {
  const currentWeek = useMemo(() => getCurrentWeekRange(), []);
  const [startDate, setStartDate] = useState(toLocalDateString(currentWeek.start));
  const [endDate, setEndDate] = useState(toLocalDateString(currentWeek.end));
  const [typeFilter, setTypeFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [calendarView, setCalendarView] = useState(() => currentWeek.start);
  const [rangeStart, setRangeStart] = useState(() => currentWeek.start);
  const [rangeEnd, setRangeEnd] = useState(() => currentWeek.end);
  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...records]
      .filter((record) => {
        if (startDate && endDate && !isDateWithinRange(record.date, startDate, endDate)) return false;
        if (typeFilter && record.type !== typeFilter) return false;
        if (paymentModeFilter && (record.staff_payment_mode || '') !== paymentModeFilter) return false;
        if (personFilter && getPersonName(record, peopleOptions) !== personFilter) return false;
        if (
          purposeFilter &&
          getPurposeName(record.from_purpose_id ?? record.purpose_id, purposeOptions) !== purposeFilter
        ) {
          return false;
        }
        if (!query) return true;
        const personName = getPersonName(record, peopleOptions).toLowerCase();
        const purposeName = getPurposeName(
          record.from_purpose_id ?? record.purpose_id,
          purposeOptions
        ).toLowerCase();
        const description = String(record.description || '').toLowerCase();
        const entryNo = String(getEntryNumber(record)).toLowerCase();
        return (
          personName.includes(query) ||
          purposeName.includes(query) ||
          description.includes(query) ||
          entryNo.includes(query)
        );
      })
      .sort((left, right) => new Date(right.date) - new Date(left.date));
  }, [
    endDate,
    paymentModeFilter,
    peopleOptions,
    personFilter,
    purposeFilter,
    purposeOptions,
    records,
    searchQuery,
    startDate,
    typeFilter
  ]);
  const totalAdvance = useMemo(
    () =>
      filteredRecords.reduce((sum, record) => {
        if (record.type !== 'Advance') return sum;
        return sum + parseNumber(record.amount);
      }, 0),
    [filteredRecords]
  );
  const dateRangeDisplayText = useMemo(() => {
    const from = parseLocalDate(startDate);
    const to = parseLocalDate(endDate);
    if (!from || !to) return 'Select Date';
    const [firstDate, secondDate] = from <= to ? [from, to] : [to, from];
    return `${formatDateToDDMMYYYY(firstDate)} - ${formatDateToDDMMYYYY(secondDate)}`;
  }, [endDate, startDate]);
  const openDateRangeModal = () => {
    const start = parseLocalDate(startDate) || currentWeek.start;
    const end = parseLocalDate(endDate) || currentWeek.end;
    setRangeStart(start);
    setRangeEnd(end);
    setCalendarView(start);
    setShowDateRangeModal(true);
  };
  const applyDateRange = () => {
    if (!rangeStart || !rangeEnd) return;
    const [firstDate, secondDate] = rangeStart <= rangeEnd ? [rangeStart, rangeEnd] : [rangeEnd, rangeStart];
    setStartDate(toLocalDateString(firstDate));
    setEndDate(toLocalDateString(secondDate));
    setShowDateRangeModal(false);
  };
  const handleDownload = () => {
    downloadCsv(
      `staff-advance-report-${new Date().toISOString().split('T')[0]}.csv`,
      ['Entry No', 'Date', 'Employee', 'Purpose', 'Type', 'Payment Mode', 'Amount', 'Description'],
      createCsvRows(filteredRecords, peopleOptions, purposeOptions)
    );
  };
  return (
    <div className="relative w-full bg-white max-w-[360px] flex flex-col scrollbar-none overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <TypePickerModal
        isOpen={showTypeModal}
        value={typeFilter}
        searchQuery={typeSearchQuery}
        onSearchChange={setTypeSearchQuery}
        onClose={() => {
          setShowTypeModal(false);
          setTypeSearchQuery('');
        }}
        onSelect={(value) => {
          setTypeFilter(value);
          setShowTypeModal(false);
          setTypeSearchQuery('');
        }}
      />
      <SelectVendorModal
        isOpen={showPaymentModeModal}
        onClose={() => setShowPaymentModeModal(false)}
        onSelect={(value) => {
          setPaymentModeFilter(value);
          setShowPaymentModeModal(false);
        }}
        selectedValue={paymentModeFilter}
        options={paymentModeOptions.map((option) => option.label)}
        fieldName="Payment Mode"
        showStarIcon={false}
      />
      <SelectVendorModal
        isOpen={showPersonModal}
        onClose={() => setShowPersonModal(false)}
        onSelect={(value) => {
          setPersonFilter(value);
          setShowPersonModal(false);
        }}
        selectedValue={personFilter}
        options={[...new Set(peopleOptions.map((option) => option.label))]}
        fieldName="Employee"
        showStarIcon={false}
      />
      <SelectVendorModal
        isOpen={showPurposeModal}
        onClose={() => setShowPurposeModal(false)}
        onSelect={(value) => {
          setPurposeFilter(value);
          setShowPurposeModal(false);
        }}
        selectedValue={purposeFilter}
        options={[...new Set(purposeOptions.map((option) => option.label))]}
        fieldName="Purpose"
        showStarIcon={false}
      />
      <div className="mb-[8px] flex items-center justify-between border-b border-gray-200 pb-[6px]">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-[8px]">
          <button type="button" className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent">
            #{currentWeek.label}
          </button>
        </div>
        {/* RIGHT SIDE */}
        <div>
          <button type="button" onClick={() => setShowTypeModal(true)}
            className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent"
          >
            {typeFilter || 'Type'}
          </button>
        </div>
      </div>
      <div className="flex gap-[8px] items-center">
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Date Range</p>
          <div
            role="button"
            tabIndex={0}
            onClick={openDateRangeModal}
            onKeyDown={(event) => {
              if (event.key === 'Enter') openDateRangeModal();
            }}
            className="relative w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[40px] text-[10px] font-medium bg-white flex items-center cursor-pointer whitespace-nowrap"
            style={{ boxSizing: 'border-box', color: startDate && endDate ? '#000' : '#9E9E9E' }}
          >
            {dateRangeDisplayText}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9E9E9E]">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Payment Mode</p>
          <div className="relative">
            <div
              onClick={() => setShowPaymentModeModal(true)}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{ boxSizing: 'border-box', color: paymentModeFilter ? '#000' : '#9E9E9E' }}
            >
              {paymentModeFilter || 'Select'}
              {paymentModeFilter ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setPaymentModeFilter('');
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full h-[36px] pl-[40px] pr-[12px] text-[12px] rounded-full font-medium bg-white focus:outline-none border border-[rgba(0,0,0,0.12)]"
          />
        </div>
      </div>
      <div className="mt-[8px] pb-[8px] flex items-center justify-between flex-wrap gap-[8px]">
        <div className="flex items-center gap-[8px] min-w-0">
          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-[8px] px-[0px] flex-shrink-0"
          >
            <img src={Filter} alt="Filter" className="w-[12px] h-[11px]" />
            {!(personFilter || purposeFilter) ? (
              <span className="text-[13px] font-semibold flex-shrink-0 text-[#9E9E9E]">Filter</span>
            ) : null}
          </button>
          <div
            className="flex items-center gap-[8px] overflow-x-auto no-scrollbar scrollbar-none min-w-0 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {personFilter ? (
              <div className="flex items-center gap-[6px] border px-[10px] py-[6px] rounded-full flex-shrink-0">
                <span className="text-[11px] font-medium text-black">Employee</span>
                <button
                  type="button"
                  onClick={() => setPersonFilter('')}
                  className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ) : null}
            {purposeFilter ? (
              <div className="flex items-center gap-[6px] border px-[10px] py-[6px] rounded-full flex-shrink-0">
                <span className="text-[11px] font-medium text-black">Purpose</span>
                <button
                  type="button"
                  onClick={() => setPurposeFilter('')}
                  className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          {personFilter || purposeFilter ? (
            <button
              type="button"
              onClick={() => {
                setPersonFilter('');
                setPurposeFilter('');
              }}
              className="text-[13px] font-semibold hover:text-black transition-colors flex-shrink-0 text-[#9E9E9E]"
            >
              x
            </button>
          ) : null}
          <div className="text-[12px] font-semibold text-black">
            Total Advance : <span className="text-[#E4572E]">{formatCurrencyWithSymbol(totalAdvance)}</span>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto no-scrollbar scrollbar-none scrollbar-hide max-h-[calc(100vh-240px-90px)] pb-[105px]">
        {filteredRecords.length ? (
          <div >
            {filteredRecords.map((record) => (
              <RecordCard
                key={`${record.id}-${record.date}`}
                record={record}
                peopleOptions={peopleOptions}
                purposeOptions={purposeOptions}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-[48px]">
            <div className="w-[64px] h-[64px] rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12H24M8 20H24M8 28H24" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#9E9E9E] text-center mt-4">
              No report records found
            </p>
          </div>
        )}
      </div>

      {showDateRangeModal ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
          onClick={() => setShowDateRangeModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[95%] max-w-[340px] p-[16px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() =>
                  setCalendarView(new Date(calendarView.getFullYear(), calendarView.getMonth() - 1))
                }
                className="p-[8px] text-black"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="text-[16px] font-semibold">
                {calendarView.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCalendarView(new Date(calendarView.getFullYear(), calendarView.getMonth() + 1))
                }
                className="p-[8px] text-black"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-[2px] text-center text-[12px] font-medium text-[#9E9E9E] mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-[2px]">
              {(() => {
                const year = calendarView.getFullYear();
                const month = calendarView.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const startPadding = (firstDay.getDay() + 7) % 7;
                const days = [];

                for (let index = 0; index < startPadding; index += 1) {
                  days.push(null);
                }

                for (let day = 1; day <= lastDay.getDate(); day += 1) {
                  days.push(new Date(year, month, day));
                }

                const isInRange = (date) => {
                  if (!date || !rangeStart) return false;
                  const time = date.getTime();
                  const startTime = rangeStart.getTime();
                  const endTime = rangeEnd ? rangeEnd.getTime() : startTime;
                  const low = Math.min(startTime, endTime);
                  const high = Math.max(startTime, endTime);
                  return time >= low && time <= high;
                };

                const isStartOrEnd = (date) => {
                  if (!date) return false;
                  const time = date.getTime();
                  return (rangeStart && time === rangeStart.getTime()) || (rangeEnd && time === rangeEnd.getTime());
                };

                return days.map((date, index) => {
                  if (!date) return <div key={`empty-${index}`} />;

                  const inRange = isInRange(date);
                  const highlight = isStartOrEnd(date);

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => {
                        if (!rangeStart || (rangeStart && rangeEnd)) {
                          setRangeStart(date);
                          setRangeEnd(null);
                        } else {
                          setRangeEnd(date);
                        }
                      }}
                      className={`h-9 rounded text-[13px] font-medium ${highlight
                          ? 'bg-black text-white'
                          : inRange
                            ? 'bg-gray-200 text-black'
                            : 'text-black hover:bg-gray-100'
                        }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                });
              })()}
            </div>

            <div className="flex justify-between mt-4 gap-[8px]">
              <button
                type="button"
                onClick={() => {
                  setRangeStart(null);
                  setRangeEnd(null);
                }}
                className="text-[14px] font-semibold text-[#9E9E9E]"
              >
                Clear
              </button>
              <div className="flex gap-[8px]">
                <button
                  type="button"
                  onClick={() => setShowDateRangeModal(false)}
                  className="px-[16px] py-[8px] text-[14px] font-semibold text-[#9E9E9E]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyDateRange}
                  className="px-[16px] py-[8px] text-[14px] font-semibold text-white bg-[#E4572E] rounded"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showFilterModal ? (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40"
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl w-full h-[220px] p-[16px] relative"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[16px] font-semibold text-black">Select Filters</p>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="w-6 h-6 flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-[16px] mb-3">
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Employee</p>
                <div className="relative">
                  <div
                    onClick={() => setShowPersonModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: personFilter ? '#000' : '#9E9E9E' }}
                  >
                    {personFilter || 'Select'}
                    {personFilter ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPersonFilter('');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Purpose</p>
                <div className="relative">
                  <div
                    onClick={() => setShowPurposeModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: purposeFilter ? '#000' : '#9E9E9E' }}
                  >
                    {purposeFilter || 'Select'}
                    {purposeFilter ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPurposeFilter('');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Report;
