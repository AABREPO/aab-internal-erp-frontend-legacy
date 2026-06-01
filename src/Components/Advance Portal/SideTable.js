import React, { useMemo, useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import edit from '../Images/Edit.svg';
import file from '../Images/file.png';
import Filter from '../Images/TableFilter.svg';
import Search from '../Images/Searchnew.svg';
import Reload from '../Images/Clear.svg';
import Pdf from '../Images/pdf.png';
import XL from '../Images/sheets.png';
import {
  EDBC_IDS,
  getEdbcColumnConfig,
  useEdbcExpandedCells,
  EdbcTableHeaderRow,
  EdbcTableBodyRow,
  EdbcColumnHeader,
  EdbcDateBodyCell,
  EdbcExpandableBodyCell,
  EdbcTableFilterRow,
  EdbcDateFilter,
  EdbcTotalAmountFilter,
  EdbcProjectNameFilter,
  EdbcSelectFilter,
  EdbcEmptyFilterCell,
  DATABASE_TABLE_FILTER_SELECT_STYLES,
  EDBC_TABLE_EDGE_TABLE_CLASS,
  EDBC2_FIRST_COLUMN_WIDTH_CLASS,
} from '../ExpensesEntry/databaseExpensesSharedColumns';

const filterEntriesForSideTable = (advanceData, selectedOption, selectedSite) =>
  (advanceData || [])
    .filter((entry) => {
      const isMatchingVendor =
        selectedOption?.type === 'Vendor'
          ? entry.vendor_id === selectedOption.id
          : selectedOption?.type === 'Contractor'
            ? entry.contractor_id === selectedOption.id
            : false;
      const isForCurrentProject = entry.project_id === selectedSite?.id;
      return isMatchingVendor && isForCurrentProject;
    })
    .sort((a, b) => {
      const entryNoA = a.entry_no || 0;
      const entryNoB = b.entry_no || 0;
      return entryNoB - entryNoA;
    });

const getEntryRowDisplay = (entry, siteOptions) => {
  const {
    amount,
    bill_amount,
    discount_amount,
    type,
    transfer_site_id,
    refund_amount,
  } = entry;
  const discountAmt = parseFloat(discount_amount) || 0;
  const advanceAmount = (() => {
    if (type === 'Refund') {
      return `-${parseFloat(refund_amount || 0).toLocaleString('en-IN')}`;
    }
    return parseFloat(amount || 0).toLocaleString('en-IN');
  })();
  const billAmount =
    type === 'Bill Settlement'
      ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
      : '';
  const discountDisplay =
    type === 'Bill Settlement' && discountAmt > 0
      ? discountAmt.toLocaleString('en-IN')
      : '';
  let transferOrRefund = '';
  if (type === 'Refund') {
    transferOrRefund = 'Refund';
  } else if (type === 'Transfer') {
    const siteLabel = siteOptions.find((site) => site.id === parseInt(transfer_site_id))?.label;
    transferOrRefund =
      parseFloat(amount) < 0
        ? `Transfer to ${siteLabel || 'Unknown Site'}`
        : `Transfer from ${siteLabel || 'Unknown Site'}`;
  }
  return { advanceAmount, billAmount, discountDisplay, transferOrRefund, payment_mode: entry.payment_mode || '' };
};

const toExpenseRow = (entry) => ({ ...entry, id: entry.advancePortalId });

const BLANK_VALUE = 'BLANK';
const BLANK_LABEL = 'Blank';
const blankOption = { value: BLANK_VALUE, label: BLANK_LABEL };

const SideTable = ({
  advanceData,
  selectedOption,
  selectedSite,
  siteOptions,
  onEditClick,
}) => {
  const [overallSearch, setOverallSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterTransferRefund, setFilterTransferRefund] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const filterRowRef = useRef(null);
  const scrollRef = useRef(null);
  const filterNudgeUsedRef = useRef(false);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    scroll.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
    };
    lastMove.current = {
      time: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
    cancelMomentum();
  };
  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const now = Date.now();
    const dt = now - lastMove.current.time || 16;
    velocity.current = {
      x: (e.clientX - lastMove.current.x) / dt,
      y: (e.clientY - lastMove.current.y) / dt,
    };
    scrollRef.current.scrollLeft = scroll.current.left - dx;
    scrollRef.current.scrollTop = scroll.current.top - dy;
    filterNudgeUsedRef.current = false;
    lastMove.current = {
      time: now,
      x: e.clientX,
      y: e.clientY,
    };
  };
  const handleMouseUp = () => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.style.cursor = '';
    scrollRef.current.style.userSelect = '';
    applyMomentum();
  };
  const cancelMomentum = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  };
  const applyMomentum = () => {
    if (!scrollRef.current) return;
    const friction = 0.95;
    const minVelocity = 0.1;
    const step = () => {
      const { x, y } = velocity.current;
      if (!scrollRef.current) return;
      if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
        scrollRef.current.scrollLeft -= x * 20;
        scrollRef.current.scrollTop -= y * 20;
        velocity.current.x *= friction;
        velocity.current.y *= friction;
        animationFrame.current = requestAnimationFrame(step);
      } else {
        cancelMomentum();
      }
    };
    animationFrame.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelMomentum(), []);
  const baseEntries = useMemo(
    () => filterEntriesForSideTable(advanceData, selectedOption, selectedSite),
    [advanceData, selectedOption, selectedSite]
  );
  const modeFilterOptions = useMemo(() => {
    const modes = new Set();
    baseEntries.forEach((entry) => {
      const mode = (entry.payment_mode || '').trim();
      if (mode) modes.add(mode);
    });
    return Array.from(modes)
      .sort((a, b) => a.localeCompare(b))
      .map((mode) => ({ value: mode, label: mode }));
  }, [baseEntries]);
  const transferRefundFilterOptions = useMemo(() => {
    const seen = new Set();
    let hasBlank = false;
    const options = [];
    baseEntries.forEach((entry) => {
      const { transferOrRefund } = getEntryRowDisplay(entry, siteOptions);
      const value = (transferOrRefund || '').trim();
      if (!value) {
        hasBlank = true;
        return;
      }
      if (!seen.has(value)) {
        seen.add(value);
        options.push({ value, label: value });
      }
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    if (hasBlank) options.unshift(blankOption);
    return options;
  }, [baseEntries, siteOptions]);
  const hasActiveColumnFilters =
    filterDate ||
    filterTransferRefund ||
    filterMode;
  const tableEntries = useMemo(() => {
    let entries = baseEntries;
    if (filterDate) {
      const [year, month, day] = filterDate.split('-');
      const formattedSelectDate = `${parseInt(day, 10)}-${parseInt(month, 10)}-${year}`;
      entries = entries.filter((entry) => {
        const entryDateObj = new Date(entry.date);
        const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
        return formattedEntryDate === formattedSelectDate;
      });
    }
    if (filterTransferRefund) {
      if (filterTransferRefund === BLANK_VALUE) {
        entries = entries.filter(
          (entry) => !getEntryRowDisplay(entry, siteOptions).transferOrRefund.trim()
        );
      } else {
        entries = entries.filter(
          (entry) =>
            getEntryRowDisplay(entry, siteOptions).transferOrRefund === filterTransferRefund
        );
      }
    }
    if (filterMode) {
      entries = entries.filter(
        (entry) => (entry.payment_mode || '').toLowerCase() === filterMode.toLowerCase()
      );
    }
    if (!overallSearch.trim()) return entries;
    const q = overallSearch.toLowerCase().trim();
    return entries.filter((entry) => {
      const { advanceAmount, billAmount, discountDisplay, transferOrRefund, payment_mode } =
        getEntryRowDisplay(entry, siteOptions);
      const searchable = [
        new Date(entry.date).toLocaleDateString('en-GB'),
        advanceAmount,
        billAmount,
        discountDisplay,
        transferOrRefund,
        payment_mode,
        entry.type,
        entry.description,
      ]
        .map((v) => String(v ?? '').toLowerCase())
        .join(' ');
      return searchable.includes(q);
    });
  }, [
    baseEntries,
    filterDate,
    filterTransferRefund,
    filterMode,
    overallSearch,
    siteOptions,
  ]);
  const totals = useMemo(
    () =>
      tableEntries.reduce(
        (acc, entry) => {
          if (entry.type === 'Refund') {
            acc.advance -= Number(entry.refund_amount) || 0;
          } else {
            acc.advance += Number(entry.amount) || 0;
          }
          if (entry.type === 'Bill Settlement') {
            acc.bill += Number(entry.bill_amount) || 0;
            acc.discount += Number(entry.discount_amount) || 0;
          }
          return acc;
        },
        { advance: 0, bill: 0, discount: 0 }
      ),
    [tableEntries]
  );
  const { expandedCells, toggleExpandedCell } = useEdbcExpandedCells();
  const edbc2Config = getEdbcColumnConfig(EDBC_IDS.EDBC2);
  const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
  const edbc3Config = getEdbcColumnConfig(EDBC_IDS.EDBC3);
  const edbc13Config = getEdbcColumnConfig(EDBC_IDS.EDBC13);
  const edbc19Config = getEdbcColumnConfig(EDBC_IDS.EDBC19);
  const edbc19TdClass = edbc19Config?.tdClass || '';

  const exportPDF = () => {
    const doc = new jsPDF();
    const entityType = selectedOption?.type === 'Contractor' ? 'Contractor' : 'Vendor';
    const entityName = selectedOption?.label || '';
    const projectName = selectedSite?.label || '';
    doc.setFontSize(12);
    doc.text(`${entityType} - ${entityName}`, 14, 20);
    const pageWidth = doc.internal.pageSize.getWidth();
    const projectText = `Project Name: ${projectName}`;
    const textWidth = doc.getTextWidth(projectText);
    doc.text(projectText, pageWidth - textWidth - 14, 20);
    const filteredData = filterEntriesForSideTable(advanceData, selectedOption, selectedSite)
      .sort((a, b) => {
        const typeOrder = ['Advance', 'Bill Settlement', 'Refund', 'Transfer'];
        const typeIndexA = typeOrder.indexOf((a.type || '').trim());
        const typeIndexB = typeOrder.indexOf((b.type || '').trim());
        if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;
        const modeA = (a.payment_mode || '').trim().toLowerCase();
        const modeB = (b.payment_mode || '').trim().toLowerCase();
        if (!modeA && modeB) return 1;
        if (modeA && !modeB) return -1;
        return modeA.localeCompare(modeB);
      });
    const tableColumn = [
      'S.No',
      'Date',
      'Advance',
      'Bill Amount',
      'Discount',
      'Refund Amount',
      'Transfer',
      'Type',
      'Mode',
      'Description',
    ];
    const tableRows = filteredData.map((entry, index) => {
      const {
        date,
        amount,
        bill_amount,
        discount_amount,
        type,
        transfer_site_id,
        payment_mode,
        refund_amount,
        description,
      } = entry;
      const advanceAmount =
        type === 'Refund' ? '' : parseFloat(amount || 0).toLocaleString('en-IN');
      const billAmount =
        type === 'Bill Settlement'
          ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
          : '';
      const discountDisplay =
        type === 'Bill Settlement' && (parseFloat(discount_amount) || 0) > 0
          ? parseFloat(discount_amount).toLocaleString('en-IN')
          : '';
      const refundAmount =
        type === 'Refund'
          ? parseFloat(refund_amount || 0).toLocaleString('en-IN')
          : '';
      let transferText = '';
      if (type === 'Transfer') {
        const siteLabel = siteOptions.find((site) => site.id === parseInt(transfer_site_id))?.label;
        transferText =
          parseFloat(amount) < 0
            ? `Transfer to ${siteLabel || 'Unknown Site'}`
            : `Transfer from ${siteLabel || 'Unknown Site'}`;
      }
      return [
        index + 1,
        new Date(date).toLocaleDateString('en-GB'),
        advanceAmount,
        billAmount,
        discountDisplay,
        refundAmount,
        transferText,
        type,
        payment_mode || '',
        description || '',
      ];
    });
    doc.autoTable({
      startY: 28,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { halign: 'left' },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.1,
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
    });
    doc.save('Advance_Report.pdf');
  };

  const exportCSV = () => {
    const entityType = selectedOption?.type === 'Contractor' ? 'Contractor' : 'Vendor';
    const entityName = selectedOption?.label || '';
    const projectName = selectedSite?.label || '';
    const filteredData = filterEntriesForSideTable(advanceData, selectedOption, selectedSite);
    const rows = filteredData.map((entry, index) => {
      const { date, amount, bill_amount, discount_amount, type, transfer_site_id, payment_mode, refund_amount } = entry;
      const advanceAmount = (() => {
        if (type === 'Refund') {
          return `-${parseFloat(refund_amount || 0).toLocaleString('en-IN')}`;
        }
        return parseFloat(amount || 0).toLocaleString('en-IN');
      })();
      const billAmount =
        type === 'Bill Settlement'
          ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
          : '';
      const discountCsv =
        type === 'Bill Settlement' && (parseFloat(discount_amount) || 0) > 0
          ? parseFloat(discount_amount).toLocaleString('en-IN')
          : '';
      let transferOrRefund = '';
      if (type === 'Refund') {
        transferOrRefund = 'Refund';
      } else if (type === 'Transfer') {
        const siteLabel = siteOptions.find((site) => site.id === parseInt(transfer_site_id))?.label;
        transferOrRefund =
          parseFloat(amount) < 0
            ? `Transfer to ${siteLabel || 'Unknown Site'}`
            : `Transfer from ${siteLabel || 'Unknown Site'}`;
      }
      return {
        'S.No': index + 1,
        Date: new Date(date).toLocaleDateString('en-GB'),
        Advance: advanceAmount,
        Bill: billAmount,
        Discount: discountCsv,
        'Transfer/Refund': transferOrRefund,
        Mode: payment_mode || '',
      };
    });
    let csv = `${entityType}: ${entityName},Project Name: ${projectName}\n\n`;
    csv += `${Object.keys(rows[0] || {}).join(',')}\n`;
    rows.forEach((row) => {
      csv += `${Object.values(row).map((value) => `"${value}"`).join(',')}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Advance_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterTransferRefund('');
    setFilterMode('');
    setOverallSearch('');
  };

  const toggleFilters = () => {
    const willOpen = !showFilters;
    const scroller = scrollRef.current;
    if (willOpen) {
      setShowFilters(true);
      if (!scroller) return;
      if (scroller.scrollTop <= 0) return;
      if (filterNudgeUsedRef.current) return;
      filterNudgeUsedRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const h = filterRowRef.current?.offsetHeight || 0;
          if (h > 0) {
            scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
          }
        });
      });
      return;
    }
    const h = filterRowRef.current?.offsetHeight || 0;
    setShowFilters(false);
    if (!scroller || h <= 0 || !filterNudgeUsedRef.current) return;
    filterNudgeUsedRef.current = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scroller.scrollTop = scroller.scrollTop + h;
      });
    });
  };

  return (
    <div className="w-full min-w-0 max-w-full flex flex-col">
      <div className="w-fit max-w-full flex flex-col">
      <div
        className={`text-left flex w-full ${
          hasActiveColumnFilters
            ? 'flex-col sm:flex-row sm:justify-between'
            : 'flex-row justify-between items-center'
        } mb-[12px] gap-[6px]`}
      >
        <div className="flex shrink-0 flex-col sm:flex-row sm:items-center sm:space-x-3">
          <button type="button" onClick={toggleFilters} className="shrink-0">
            <img src={Filter} alt="Toggle Filter" className="h-[34px] w-auto shrink-0 border rounded-md" />
          </button>
          {hasActiveColumnFilters && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
              {filterDate && (
                <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                  <span className="font-medium text-[#BF9853]">Date: </span>
                  <span className="font-semibold text-[14px]">{filterDate}</span>
                  <button type="button" onClick={() => setFilterDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                </span>
              )}
              {filterTransferRefund && (
                <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                  <span className="font-medium text-[#BF9853]">Transfer/Refund: </span>
                  <span className="font-semibold text-[14px]">
                    {filterTransferRefund === BLANK_VALUE ? BLANK_LABEL : filterTransferRefund}
                  </span>
                  <button type="button" onClick={() => setFilterTransferRefund('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                </span>
              )}
              {filterMode && (
                <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                  <span className="font-medium text-[#BF9853]">Mode: </span>
                  <span className="font-semibold text-[14px]">{filterMode}</span>
                  <button type="button" onClick={() => setFilterMode('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 items-end justify-end gap-[6px]">
          <button type="button" onClick={clearFilters} className="flex h-[30px] w-[30px] shrink-0 items-center justify-center">
            <img className="w-full h-full" src={Reload} alt="Reload" />
          </button>
          <div className="min-w-0 w-[286px] max-w-[286px] shrink translate-y-[2px] h-[34px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 gap-1">
            <input
              type="text"
              value={overallSearch}
              onChange={(e) => setOverallSearch(e.target.value)}
              placeholder="Search Transactions..."
              className="h-full w-full border-0 p-0 text-[14px] text-[#000000] bg-transparent outline-none"
            />
            <img src={Search} alt="Search" className="w-[16px] h-[16px] pointer-events-none" />
          </div>
          <div className="text-left md:text-right md:items-end items-end cursor-default flex justify-end shrink-0">
            <div className="flex items-end text-center">
              <span onClick={exportPDF} className="text-[#E4572E] mr-2 flex items-center gap-1 font-semibold hover:underline cursor-pointer text-sm">PDF<img src={Pdf} alt="Pdf" className="w-4 h-4" /></span>
              <span onClick={exportCSV} className="text-[#007233] flex items-center gap-1 font-semibold hover:underline cursor-pointer text-sm">XL<img src={XL} alt="XL" className="w-4 h-4" /></span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-hidden w-fit max-w-full">
        <div
          ref={scrollRef}
          className="overflow-x-auto max-h-[400px] overflow-y-scroll no-scrollbar scrollbar-none w-full select-none"
          onWheel={() => { filterNudgeUsedRef.current = false; }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <table className={`table-fixed w-[968px] max-w-[968px] border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS}`}>
            <colgroup>
              <col className={EDBC2_FIRST_COLUMN_WIDTH_CLASS} />
              <col className={edbc8Config?.columnWidthClass} />
              <col className={edbc8Config?.columnWidthClass} />
              <col className={edbc8Config?.columnWidthClass} />
              <col className={edbc3Config?.columnWidthClass} />
              <col className={edbc13Config?.columnWidthClass} />
              <col className={edbc19Config?.columnWidthClass} />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-white">
              <EdbcTableHeaderRow>
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC2} label="Date" />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Advance" />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Bill" />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Discount" />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC3} label="Transfer/Refund" />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC13} label="Mode" />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC19} label="Activity" />
              </EdbcTableHeaderRow>
              {showFilters && (
                <EdbcTableFilterRow ref={filterRowRef}>
                  <EdbcDateFilter
                    placeholder="Date"
                    value={filterDate}
                    onChange={setFilterDate}
                  />
                  <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.advance} />
                  <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.bill} />
                  <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.discount} />
                  <EdbcProjectNameFilter
                    placeholder="Transfer/Refund"
                    options={transferRefundFilterOptions}
                    value={filterTransferRefund}
                    onChange={setFilterTransferRefund}
                    blankOption={blankOption}
                    blankValue={BLANK_VALUE}
                    selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                  />
                  <EdbcSelectFilter
                    columnId={EDBC_IDS.EDBC13}
                    placeholder="Mode"
                    options={modeFilterOptions}
                    value={filterMode}
                    onChange={setFilterMode}
                    selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                  />
                  <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC19} />
                </EdbcTableFilterRow>
              )}
            </thead>
            <tbody>
              {!selectedOption || !selectedSite ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-sm text-gray-500">
                    Please select a contractor/vendor and project to view advance records.
                  </td>
                </tr>
              ) : tableEntries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-sm text-gray-500">
                    No records found for the selected contractor/vendor and project.
                  </td>
                </tr>
              ) : (
                tableEntries.map((entry, index) => {
                  const row = toExpenseRow(entry);
                  const { advanceAmount, billAmount, discountDisplay, transferOrRefund, payment_mode } =
                    getEntryRowDisplay(entry, siteOptions);
                  const rowKey = entry.advancePortalId ?? index;
                  return (
                    <EdbcTableBodyRow key={rowKey}>
                      <EdbcDateBodyCell
                        expense={row}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        formatValue={(date) => new Date(date).toLocaleDateString('en-GB')}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC8}
                        expense={row}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        textAlignClass="text-right"
                        getDisplayValue={() => advanceAmount}
                      />
                      <td className={`${edbc8Config?.tdClass || ''} text-right`.trim()}>
                        <span
                          onClick={() => toggleExpandedCell(`${rowKey}-bill_amount`)}
                          className={`block w-full cursor-pointer text-right ${expandedCells[`${rowKey}-bill_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={billAmount}
                        >
                          {billAmount}
                        </span>
                      </td>
                      <td className={`${edbc8Config?.tdClass || ''} text-right`.trim()}>
                        <span
                          onClick={() => toggleExpandedCell(`${rowKey}-discount_amount`)}
                          className={`block w-full cursor-pointer text-right ${expandedCells[`${rowKey}-discount_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={discountDisplay}
                        >
                          {discountDisplay}
                        </span>
                      </td>
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC3}
                        expense={row}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={() => transferOrRefund}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC13}
                        expense={row}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={() => payment_mode}
                      />
                      <td id={EDBC_IDS.EDBC19} className={edbc19TdClass}>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button type="button" className="rounded-full transition duration-200">
                            <img
                              src={edit}
                              onClick={() => onEditClick(entry)}
                              alt="Edit"
                              className="w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200"
                            />
                          </button>
                          {entry.file_url ? (
                            <a
                              href={entry.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer"
                              title="View File"
                            >
                              <img
                                src={file}
                                className="w-5 h-4 transform hover:scale-110 transition duration-200"
                                alt="View File"
                                style={{ filter: 'invert(0%) brightness(0%)' }}
                              />
                            </a>
                          ) : (
                            <div className="opacity-30">
                              <img
                                src={file}
                                className="w-5 h-4"
                                alt="No File"
                                title="No file attached"
                                style={{ filter: 'invert(0%) brightness(0%)' }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    </EdbcTableBodyRow>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SideTable;
