import React, { useMemo, useState } from 'react';
import Filter from '../Images/Filter.png';
import Download from '../Images/Download.svg';
import CloseIcon from '../Images/Close F.svg';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import {
  buildEmployeePurposeSummary,
  buildPurposePersonSummary,
  downloadCsv,
  formatCurrencyWithSymbol,
  getCurrentWeekRange
} from './staffAdvanceHelpers';

const SegmentedButton = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 px-[16px] h-[28px] rounded text-[14px] font-medium transition-colors duration-300 ${
      active ? 'bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'text-[#848484]'
    }`}
  >
    {children}
  </button>
);

const SummaryCard = ({ title, advanceAmount, pendingAmount }) => {
  const isSettled = pendingAmount <= 0;

  return (
    <div className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]">
      <div className="flex-1 bg-white rounded-[8px] h-full px-[12px] py-[12px] transition-all duration-300 ease-out">
        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center justify-between">
            <p
              className="text-[12px] font-medium text-black leading-snug break-words flex-1"
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            >
              {title}
            </p>
            <span
              className={`px-[8px] py-[2px] rounded-full text-[10px] font-medium ${
                isSettled ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#F57C00]'
              }`}
            >
              {isSettled ? 'Settled' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-[8px]">
            <p className="text-[12px] font-medium text-black leading-snug">
              Advance Amount {formatCurrencyWithSymbol(advanceAmount)}
            </p>
            <p className="text-[12px] font-semibold text-black leading-snug">
              {formatCurrencyWithSymbol(pendingAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Summary = ({ records, peopleOptions, purposeOptions }) => {
  const currentWeek = useMemo(() => getCurrentWeekRange(), []);
  const [viewMode, setViewMode] = useState('employee');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const employeeSummary = useMemo(
    () => buildEmployeePurposeSummary(records, selectedEmployee, purposeOptions),
    [purposeOptions, records, selectedEmployee]
  );

  const purposeSummary = useMemo(
    () => buildPurposePersonSummary(records, selectedPurpose, peopleOptions),
    [peopleOptions, records, selectedPurpose]
  );

  const activeSummary = viewMode === 'employee' ? employeeSummary : purposeSummary;

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activeSummary.items.filter((item) => {
      const label = viewMode === 'employee' ? item.purposeName || '' : item.personName || '';
      const matchesSearch = !query || label.toLowerCase().includes(query);
      const isSettled = item.pendingAdvance <= 0;

      if (statusFilter === 'Settled' && !isSettled) return false;
      if (statusFilter === 'Pending' && isSettled) return false;

      return matchesSearch;
    });
  }, [activeSummary.items, searchQuery, statusFilter, viewMode]);

  const selectedLabel =
    viewMode === 'employee' ? selectedEmployee?.label || 'Select Employee' : selectedPurpose?.label || 'Select Purpose';

  const handleDownload = () => {
    const headers =
      viewMode === 'employee'
        ? ['Purpose', 'Advance Amount', 'Refund Amount', 'Pending Amount']
        : ['Employee', 'Advance Amount', 'Refund Amount', 'Pending Amount'];

    const rows = filteredItems.map((item) =>
      viewMode === 'employee'
        ? [item.purposeName, item.totalAdvance, item.totalRefund, item.pendingAdvance]
        : [item.personName, item.totalAdvance, item.totalRefund, item.pendingAdvance]
    );

    downloadCsv(
      `staff-advance-summary-${viewMode}-${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );
  };
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-full bg-white" style={{ fontFamily: "'Manrope', sans-serif" }} >
      <SelectVendorModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSelect={(value) => {
          setSelectedEmployee(peopleOptions.find((option) => option.label === value) || null);
          setShowEmployeeModal(false);
        }}
        selectedValue={selectedEmployee?.label || ''}
        options={[...new Set(peopleOptions.map((option) => option.label))]}
        fieldName="Employee"
        showStarIcon={false}
      />
      <SelectVendorModal
        isOpen={showPurposeModal}
        onClose={() => setShowPurposeModal(false)}
        onSelect={(value) => {
          setSelectedPurpose(purposeOptions.find((option) => option.label === value) || null);
          setShowPurposeModal(false);
        }}
        selectedValue={selectedPurpose?.label || ''}
        options={[...new Set(purposeOptions.map((option) => option.label))]}
        fieldName="Purpose"
        showStarIcon={false}
      />
      <SelectVendorModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSelect={(value) => {
          setStatusFilter(value);
          setShowStatusModal(false);
        }}
        selectedValue={statusFilter}
        options={['Settled', 'Pending']}
        fieldName="Status"
        showStarIcon={false}
      />
      <div className="flex-shrink-0">
      <div className="mb-[8px]">
        <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-[8px]">
          <p className="text-[12px] font-semibold text-black leading-normal">#{currentWeek.label}</p>
          <button
            type="button"
            onClick={handleDownload}
            className="w-4 h-4 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full"
            title="Download"
          >
            <img src={Download} alt="Download" className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="rounded-[8px] bg-[#F2F4F7] p-[2px] mb-[10px]">
        <div className="grid grid-cols-2 gap-[4px]">
          <SegmentedButton active={viewMode === 'employee'} onClick={() => setViewMode('employee')} >
            Employee
          </SegmentedButton>
          <SegmentedButton active={viewMode === 'purpose'} onClick={() => setViewMode('purpose')} >
            Purpose
          </SegmentedButton>
        </div>
      </div>
      <div className="rounded-[12px] border border-[#EEE9E2] bg-[#FFFDFC] p-[12px] shadow-[0_4px_14px_rgba(0,0,0,0.03)]">
        <div className="relative">
          <div
            onClick={() => {
              if (viewMode === 'employee') {
                setShowEmployeeModal(true);
              } else {
                setShowPurposeModal(true);
              }
            }}
            className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
            style={{
              boxSizing: 'border-box',
              color:
                viewMode === 'employee'
                  ? selectedEmployee
                    ? '#000'
                    : '#9E9E9E'
                  : selectedPurpose
                    ? '#000'
                    : '#9E9E9E'
            }}
          >
            {selectedLabel}
            {selectedLabel !== 'Select Employee' && selectedLabel !== 'Select Purpose' ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (viewMode === 'employee') {
                    setSelectedEmployee(null);
                  } else {
                    setSelectedPurpose(null);
                  }
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
        <div className="mt-[10px] flex items-start justify-between gap-[12px]">
          <div className="min-w-0">
            <p className="truncate text-[12px] text-[#C98A26]">{selectedLabel}</p>
            <p className="mt-[10px] text-[12px] text-[#6C6C6C]">Advance Amount</p>
            <p className="mt-[2px] text-[16px] font-bold text-[#F05A28]">
              {formatCurrencyWithSymbol(activeSummary.overview.grossAdvance)}
            </p>
            <p className="mt-[8px] text-[12px] text-[#6C6C6C]">Pending Amount</p>
            <p className="mt-[2px] text-[16px] font-bold text-[#007233]">
              {formatCurrencyWithSymbol(activeSummary.overview.pendingAmount)}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-[10px] rounded-full border border-[#D7D1C8] px-[14px]">
        <div className="flex h-[36px] items-center gap-[8px]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search"
            className="h-full w-full bg-transparent text-[12px] outline-none placeholder:text-[#8D8D8D]"
          />
        </div>
      </div>
      <div className="pb-[8px] pt-[10px] flex items-center justify-between flex-wrap gap-[8px]">
        <div className="flex items-center gap-[8px] min-w-0">
          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-[8px] px-[0px] flex-shrink-0"
          >
            <img src={Filter} alt="Filter" className="w-[12px] h-[11px]" />
            {!statusFilter ? (
              <span className="text-[13px] font-semibold flex-shrink-0 text-[#9E9E9E]">Filter</span>
            ) : null}
          </button>
          <div
            className="flex items-center gap-[8px] overflow-x-auto no-scrollbar scrollbar-none min-w-0 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {statusFilter ? (
              <div className="flex items-center gap-[6px] border px-[10px] py-[6px] rounded-full flex-shrink-0">
                <span className="text-[11px] font-medium text-black">Status</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('')}
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
          {statusFilter ? (
            <button
              type="button"
              onClick={() => setStatusFilter('')}
              className="text-[13px] font-semibold hover:text-black transition-colors flex-shrink-0 text-[#9E9E9E]"
            >
              x
            </button>
          ) : null}
          <div className="text-[12px] font-semibold text-black">
            Pending Advance : <span className="text-[#E4572E]">{formatCurrencyWithSymbol(activeSummary.overview.pendingAmount)}</span>
          </div>
        </div>
      </div>
      </div>
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y pb-[12px] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {filteredItems.length ? (
          filteredItems.map((item) => (
            <SummaryCard
              key={viewMode === 'employee' ? item.purposeId : item.personKey}
              title={viewMode === 'employee' ? item.purposeName : item.personName}
              advanceAmount={item.totalAdvance}
              pendingAmount={item.pendingAdvance}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-[48px]">
            <div className="w-[64px] h-[64px] rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12H24M8 20H24M8 28H24" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#9E9E9E] text-center mt-4">
              Select a {viewMode === 'employee' ? 'person' : 'purpose'} to view summary
            </p>
          </div>
        )}
      </div>
      {showFilterModal ? (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40" onClick={() => setShowFilterModal(false)}>
          <div className="bg-white rounded-t-2xl w-full p-[16px] relative" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[16px] font-semibold text-black">Select Filters</p>
              <button type="button" onClick={() => setShowFilterModal(false)} className="w-6 h-6 flex items-center justify-center" >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-[16px] mb-3">
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Status</p>
                <div className="relative">
                  <div onClick={() => setShowStatusModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: statusFilter ? '#000' : '#9E9E9E' }}
                  >
                    {statusFilter || 'Select'}
                    {statusFilter ? (
                      <button type="button" onClick={(event) => { event.stopPropagation(); setStatusFilter(''); }}
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
            <div className="flex justify-end gap-[16px]">
              <button type="button" onClick={() => { setStatusFilter(''); setShowFilterModal(false); }}
                className="px-[24px] py-[8px] text-[14px] font-semibold text-black border border-[rgba(0,0,0,0.16)] rounded"
              >
                Cancel
              </button>
              <button type="button" onClick={() => setShowFilterModal(false)} className="px-[24px] py-[8px] text-[14px] font-semibold text-white bg-black rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Summary;