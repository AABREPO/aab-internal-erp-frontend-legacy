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
  formatRelativeDateTime,
  getCurrentWeekRange,
  getEntryNumber,
  getPersonName,
  getPurposeName,
  getRecordSignedAmount,
  isDateWithinRange
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
      onClick={onClose}
      style={{ fontFamily: "'Manrope', sans-serif" }}
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

        <div
          className="flex-1 overflow-y-auto mb-[8px] px-[24px] min-h-[65vh] [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
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

const getTypeCode = (type) => {
  if (type === 'Refund') return 'RF';
  if (type === 'Transfer') return 'TF';
  return 'AD';
};

const getPaymentModeBadgeClass = (mode) => {
  if (!mode) return 'bg-gray-100 text-gray-600';
  const normalized = String(mode).toLowerCase();
  if (normalized === 'cash') return 'bg-[#E7F4FD] text-[#336EA8]';
  return 'bg-[#FFEFFF] text-[#815182]';
};

const RecordCard = ({ record, peopleOptions, purposeOptions }) => {
  const signedAmount = getRecordSignedAmount(record);
  const amountColor = signedAmount < 0 ? 'text-[#E4572E]' : 'text-[#007233]';
  const paymentMode = record.staff_payment_mode || record.type || 'Entry';

  return (
    <div className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]">
      <div className="flex-1 bg-white rounded-[8px] h-full px-[12px] py-[12px] transition-all duration-300 ease-out">
        <div className="flex items-start justify-between gap-[12px]">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-black leading-snug break-words">
              #{getTypeCode(record.type)} - {formatDateDisplay(record.date)} - {getEntryNumber(record)}
            </p>
            <p className="mt-[2px] text-[12px] font-medium text-black leading-snug">
              {getPersonName(record, peopleOptions)}
            </p>
            <p className="mt-[2px] text-[12px] font-medium text-[#666666] leading-snug">
              {getPurposeName(record.from_purpose_id ?? record.purpose_id, purposeOptions)}
            </p>
            <p className="mt-[4px] text-[10px] font-medium text-[#666666] leading-snug">
              {formatRelativeDateTime(record.date).replace(/\s\|\s/g, ' • ')}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span
              className={`inline-flex rounded-full px-[8px] py-[2px] text-[10px] font-medium ${getPaymentModeBadgeClass(paymentMode)}`}
            >
              {paymentMode}
            </span>
            <p className={`mt-[10px] text-[14px] font-semibold ${amountColor}`}>
              {signedAmount < 0
                ? `-${formatCurrencyWithSymbol(Math.abs(signedAmount))}`
                : formatCurrencyWithSymbol(signedAmount)}
            </p>
            <p className="mt-[2px] text-[12px] font-medium text-black leading-snug">
              {record.type || 'Advance'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const History = ({ records, peopleOptions, purposeOptions }) => {
  const [typeFilter, setTypeFilter] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [entryNoFilter, setEntryNoFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showEntryNoModal, setShowEntryNoModal] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');

  const currentWeek = useMemo(() => getCurrentWeekRange(), []);

  const weeklyRecords = useMemo(
    () => records.filter((record) => isDateWithinRange(record.date, currentWeek.start, currentWeek.end)),
    [currentWeek.end, currentWeek.start, records]
  );

  const entryOptions = useMemo(
    () =>
      [...new Set(weeklyRecords.map((record) => String(getEntryNumber(record))))]
        .filter(Boolean)
        .sort((left, right) => Number(right) - Number(left)),
    [weeklyRecords]
  );

  const filteredRecords = useMemo(() => {
    return [...weeklyRecords]
      .filter((record) => {
        if (typeFilter && record.type !== typeFilter) return false;
        if (personFilter && getPersonName(record, peopleOptions) !== personFilter) return false;
        if (entryNoFilter && String(getEntryNumber(record)) !== entryNoFilter) return false;
        if (
          purposeFilter &&
          getPurposeName(record.from_purpose_id ?? record.purpose_id, purposeOptions) !== purposeFilter
        ) {
          return false;
        }
        if (paymentModeFilter && (record.staff_payment_mode || '') !== paymentModeFilter) return false;
        return true;
      })
      .sort((left, right) => new Date(right.date) - new Date(left.date));
  }, [
    entryNoFilter,
    paymentModeFilter,
    peopleOptions,
    personFilter,
    purposeFilter,
    purposeOptions,
    typeFilter,
    weeklyRecords
  ]);

  const handleDownload = () => {
    downloadCsv(
      `staff-advance-history-${new Date().toISOString().split('T')[0]}.csv`,
      ['Entry No', 'Date', 'Employee', 'Purpose', 'Type', 'Payment Mode', 'Amount', 'Description'],
      createCsvRows(filteredRecords, peopleOptions, purposeOptions)
    );
  };

  return (
    <div
      className="relative w-full bg-white max-w-[360px] flex flex-col scrollbar-none overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
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
        isOpen={showEntryNoModal}
        onClose={() => setShowEntryNoModal(false)}
        onSelect={(value) => {
          setEntryNoFilter(value);
          setShowEntryNoModal(false);
        }}
        selectedValue={entryNoFilter}
        options={entryOptions}
        fieldName="Entry. No"
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

      <SelectVendorModal
        isOpen={showPaymentModeModal}
        onClose={() => setShowPaymentModeModal(false)}
        onSelect={(value) => {
          setPaymentModeFilter(value);
          setShowPaymentModeModal(false);
        }}
        selectedValue={paymentModeFilter}
        options={PAYMENT_MODE_OPTIONS.map((option) => option.label)}
        fieldName="Mode"
        showStarIcon={false}
      />

      <div className="mb-[8px] flex items-center justify-between border-b border-gray-200 pt-[4px] pb-[8px]">

  {/* LEFT SIDE */}
  <div className="flex items-center gap-[8px]">
    <button
      type="button"
      className="text-[12px] font-semibold text-black leading-normal p-0 border-0 bg-transparent"
    >
      #{currentWeek.label}
    </button>
  </div>

  {/* RIGHT SIDE */}
  <div className="flex items-center gap-[8px]">
    <button
      type="button"
      onClick={() => setShowTypeModal(true)}
      className="text-[12px] font-semibold text-black leading-normal p-0 border-0 bg-transparent"
    >
      {typeFilter || 'Type'}
    </button>

    {typeFilter && (
      <button
        type="button"
        onClick={() => setTypeFilter('')}
        className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full"
      >
        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
      </button>
    )}

    <button
      type="button"
      onClick={handleDownload}
      className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full"
    >
      <img src={Download} alt="Download" className="w-4 h-4" />
    </button>
  </div>

</div>

      <div className="flex-shrink-0">
        <div className="flex items-center justify-between gap-[20px]">
          <div className="flex items-center gap-[4px] min-w-0">
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0"
            >
              <img src={Filter} alt="Filter" className="w-[11px] h-[11px]" />
              {!(personFilter || entryNoFilter || purposeFilter || paymentModeFilter) ? (
                <span className="text-[13px] font-semibold flex-shrink-0 text-[#9E9E9E]">Filter</span>
              ) : null}
            </button>

            <div
              className="flex items-center gap-[4px] overflow-x-auto no-scrollbar scrollbar-none min-w-0 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {personFilter ? (
                <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
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

              {entryNoFilter ? (
                <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Entry. No</span>
                  <button
                    type="button"
                    onClick={() => setEntryNoFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ) : null}

              {purposeFilter ? (
                <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
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

              {paymentModeFilter ? (
                <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Mode</span>
                  <button
                    type="button"
                    onClick={() => setPaymentModeFilter('')}
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

          {personFilter || entryNoFilter || purposeFilter || paymentModeFilter ? (
            <button
              type="button"
              onClick={() => {
                setPersonFilter('');
                setEntryNoFilter('');
                setPurposeFilter('');
                setPaymentModeFilter('');
              }}
              className="text-[13px] font-semibold hover:text-black transition-colors flex-shrink-0 text-[#9E9E9E]"
            >
              x
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-y-auto no-scrollbar scrollbar-none scrollbar-hide mt-1 max-h-[calc(100vh-160px-80px)] pb-[105px]">
        {filteredRecords.length ? (
          <div className="space-y-[8px]">
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
              No staff advance records yet
            </p>
          </div>
        )}
      </div>

      {showFilterModal ? (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40"
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl w-full p-[16px] h-[220px] relative"
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

            <div className="grid grid-cols-[2fr_1fr] gap-[16px] mb-3">
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
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Entry. No</p>
                <div className="relative">
                  <div
                    onClick={() => setShowEntryNoModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: entryNoFilter ? '#000' : '#9E9E9E' }}
                  >
                    {entryNoFilter || 'Select'}
                    {entryNoFilter ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEntryNoFilter('');
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

              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Mode</p>
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
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default History;
