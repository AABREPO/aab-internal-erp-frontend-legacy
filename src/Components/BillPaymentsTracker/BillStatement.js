import React, { useState, useEffect, useMemo, useRef } from 'react'
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  createVendorNameResolver,
  filterStatementRows,
  getPaymentYmd,
  getStatementVendorName,
  normalizeStatementList,
  parseStatementDate,
} from './billStatementFilters';

const BillStatement = ({ username, userRoles = [], paymentModeOptions: arrangementPaymentModeOptions = [], billPaymentsTabActive = true, refreshSignal }) => {
  const API_BASE = 'https://backendaab.in/aabuildersDash/api';
  const [apiData, setApiData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [vendorOptions, setVendorOptions] = useState([])
  // Filter states
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [fromPaymentDate, setFromPaymentDate] = useState('')
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null)
  const paymentModeOptions = useMemo(() => (
    (Array.isArray(arrangementPaymentModeOptions) ? arrangementPaymentModeOptions : [])
      .map((opt) => {
        const value = String(opt?.value || opt?.label || '').trim();
        return value ? { value, label: value } : null;
      })
      .filter(Boolean)
  ), [arrangementPaymentModeOptions])
  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: 'bill_arrival_date',
    direction: 'desc'
  })
  // Fetch vendor names
  const fetchVendorNames = async () => {
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      const data = await response.json();
      const formattedData = data.map(item => ({
        value: item.vendorName,
        label: item.vendorName,
        id: item.id,
        type: "Vendor"
      }));
      setVendorOptions(formattedData);
    } catch (error) {
      console.error("Error fetching vendor names:", error);
    }
  };
  const vendorFilterName =
    typeof selectedVendor === 'string'
      ? selectedVendor
      : (selectedVendor?.label ?? selectedVendor?.value ?? '');

  const vendorNameById = useMemo(() => {
    const map = new Map();
    vendorOptions.forEach((opt) => {
      if (opt?.id != null) {
        map.set(String(opt.id), String(opt.label || opt.value || '').trim());
      }
    });
    return map;
  }, [vendorOptions]);

  const resolveRowVendorName = useMemo(
    () => createVendorNameResolver(vendorNameById),
    [vendorNameById]
  );

  const fetchStatementData = async (signal) => {
    const url = `${API_BASE}/vendor-payments/statement`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      signal
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || `Request failed (${res.status})`);
    }
    const data = await res.json().catch(() => []);
    setApiData(normalizeStatementList(data));
  };
  // Clear filters
  const clearFilters = () => {
    setSelectedVendor(null);
    setFromDate('');
    setToDate('');
    setFromPaymentDate('');
    setSelectedPaymentMode(null);
  };
  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getNoOfBills = (item) => {
    const direct =
      item?.no_of_bills ??
      item?.noOfBills ??
      item?.no_of_bill ??
      item?.noOfBill ??
      item?.bill_count ??
      item?.billCount ??
      item?.bills_count ??
      item?.billsCount ??
      item?.bills_total ??
      item?.billsTotal ??
      null;
    if (direct != null && String(direct).trim() !== '' && String(direct).trim() !== '-') return direct;

    const arrays = [
      item?.bills,
      item?.billEntries,
      item?.bill_entries,
      item?.billIds,
      item?.bill_ids,
      item?.bill_id_list,
      item?.billIdList
    ];
    for (const a of arrays) {
      if (Array.isArray(a)) return a.length;
    }

    // Mobile UI mainly uses `title`; many backends encode bill count there.
    // Examples we try to support:
    // - "Bills - 12"
    // - "12 Bills"
    // - "Bills (12)"
    // - "Bill Count: 12"
    const title = String(item?.title ?? item?.bill_title ?? item?.tracker_title ?? '').trim();
    if (title) {
      const m1 = title.match(/\b(\d+)\s*bills?\b/i); // "12 Bills"
      if (m1) return Number(m1[1]);
      const m1b = title.match(/\bbills?\s*(\d+)\b/i); // "Bills 12"
      if (m1b) return Number(m1b[1]);
      const m2 = title.match(/\bbills?\s*[-:]\s*(\d+)\b/i); // "Bills - 12"
      if (m2) return Number(m2[1]);
      const m3 = title.match(/\bbills?\s*\(\s*(\d+)\s*\)/i); // "Bills (12)"
      if (m3) return Number(m3[1]);
      const m4 = title.match(/\bcount\s*[:\-]?\s*(\d+)\b/i); // "Count: 12"
      if (m4) return Number(m4[1]);
    }
    return '-';
  };

  const getSortDate = (row) => {
    const d =
      parseStatementDate(row?.payment_timestamp ?? row?.paymentTimestamp) ??
      parseStatementDate(row?.payment_date ?? row?.p_date ?? row?.pDate) ??
      parseStatementDate(row?.arrival_date ?? row?.bill_arrival_date);
    return d || new Date(0);
  };

  const getArrivalDate = (row) => {
    const d = parseStatementDate(row?.arrival_date ?? row?.bill_arrival_date);
    return d || new Date(0);
  };
  // Apply sorting to filtered data
  const applySorting = (data) => {
    if (!sortConfig.key) return data
    return [...data].sort((a, b) => {
      let aValue, bValue
      switch (sortConfig.key) {
        case 'si_no':
          // Keep SI.No purely visual (1..N). Sorting by backend IDs is confusing.
          return 0
          break
        case 'bill_arrival_date':
          // Sort strictly by Bill Arrival Date (as requested).
          aValue = getArrivalDate(a)
          bValue = getArrivalDate(b)
          break
        case 'vendor_name':
          aValue = String(a.vendor_name || '').toLowerCase()
          bValue = String(b.vendor_name || '').toLowerCase()
          break
        case 'no_of_bills':
          aValue = parseInt(getNoOfBills(a) || 0)
          bValue = parseInt(getNoOfBills(b) || 0)
          break
        case 'total_amount':
          aValue = parseFloat(a.overall_amount ?? a.total_amount ?? 0)
          bValue = parseFloat(b.overall_amount ?? b.total_amount ?? 0)
          break
        case 'bill_verification':
          aValue = String(a.v_date || '').toLowerCase()
          bValue = String(b.v_date || '').toLowerCase()
          break
        case 'entry_date':
          aValue = String(a.e_date || '').toLowerCase()
          bValue = String(b.e_date || '').toLowerCase()
          break
        case 'payment_date':
          aValue = getSortDate(a)
          bValue = getSortDate(b)
          break
        case 'payment_amount':
          aValue = parseFloat(a.paid_amount ?? a.payment_amount ?? 0)
          bValue = parseFloat(b.paid_amount ?? b.payment_amount ?? 0)
          break
        default:
          return 0
      }
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  const displayData = useMemo(() => {
    const filtered = filterStatementRows(
      apiData,
      {
        vendorName: vendorFilterName,
        fromDate,
        toDate,
        paymentDate: fromPaymentDate,
        paymentMode: selectedPaymentMode?.value ?? '',
      },
      resolveRowVendorName
    );
    return applySorting(filtered);
  }, [
    apiData,
    vendorFilterName,
    fromDate,
    toDate,
    fromPaymentDate,
    selectedPaymentMode,
    sortConfig,
    resolveRowVendorName,
  ]);

  const hasActiveFilters =
    Boolean(vendorFilterName) ||
    Boolean(fromDate) ||
    Boolean(toDate) ||
    Boolean(fromPaymentDate) ||
    Boolean(selectedPaymentMode?.value);
  // Format amount in Indian numbering system with 2 decimal places
  const formatIndianCurrency = (amount) => {
    if (!amount || amount === '-') return '-';
    const num = parseFloat(amount);
    if (isNaN(num)) return '-';
    // Round to 2 decimal places
    const rounded = Math.round(num * 100) / 100;
    // Split into integer and decimal parts
    const parts = rounded.toFixed(2).split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];
    // Apply Indian numbering system
    // First 3 digits from right, then groups of 2 from left
    if (integerPart.length <= 3) {
      return integerPart + '.' + decimalPart;
    }
    // Last 3 digits
    const lastThree = integerPart.slice(-3);
    // Remaining digits from left
    const remaining = integerPart.slice(0, -3);
    // Format remaining: add commas every 2 digits from right to left
    const chunks = [];
    for (let i = remaining.length; i > 0; i -= 2) {
      const start = Math.max(0, i - 2);
      chunks.unshift(remaining.slice(start, i));
    }
    const formattedRemaining = chunks.join(',');
    return formattedRemaining + ',' + lastThree + '.' + decimalPart;
  };
  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Bill Statement Report", 14, 15);
    // Add filter information if any filters are applied
    let filterText = [];
    if (selectedVendor) filterText.push(`Vendor: ${selectedVendor.label}`);
    if (fromDate || toDate) {
      const from = fromDate ? new Date(fromDate).toLocaleDateString('en-GB') : 'All';
      const to = toDate ? new Date(toDate).toLocaleDateString('en-GB') : 'All';
      filterText.push(`Bill Arrival Date: ${from} to ${to}`);
    }
    if (fromPaymentDate) filterText.push(`Payment Date: ${new Date(fromPaymentDate).toLocaleDateString('en-GB')}`);
    if (selectedPaymentMode?.label) {
      filterText.push(`Payment Mode: ${selectedPaymentMode.label}`);
    }
    let yPosition = 20;
    if (filterText.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      filterText.forEach((text, index) => {
        doc.text(text, 14, yPosition + (index * 5));
      });
      yPosition = yPosition + (filterText.length * 5) + 3;
    }
    // Generate date for filename
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB').replace(/\//g, '-');
    // Prepare table data
    const tableColumns = [
      "SI.No",
      "Bill Arrival Date",
      "Vendor Name",
      "No of Bills",
      "Total Amount",
      "Bill Verification",
      "Entry Date",
      "Payment Date",
      "Payment Amount",
      "Mode",
      "Bill",
      "Summary Bill"
    ];
    const tableRows = [];
    displayData.forEach((item, index) => {
      const arrival = item?.arrival_date || item?.bill_arrival_date || null;
      const overallAmount = item?.overall_amount ?? item?.total_amount ?? null;
      const paidAmount = item?.paid_amount ?? item?.payment_amount ?? null;
      const billUrl = item?.bill_url ?? item?.billUrl ?? null;
      const overallPdfUrl = item?.overall_pdf_url ?? item?.overallPdfUrl ?? item?.over_all_payment_pdf_url ?? null;

      tableRows.push([
        String(index + 1),
        arrival ? new Date(arrival).toLocaleDateString('en-GB') : '-',
        resolveRowVendorName(item) || '-',
        String(getNoOfBills(item)),
        overallAmount != null && String(overallAmount).trim() !== '' ? formatIndianCurrency(overallAmount) : '-',
        String(item?.v_date ?? item?.vDate ?? '-'),
        String(item?.e_date ?? item?.eDate ?? '-'),
        String(item?.p_date ?? item?.pDate ?? item?.payment_date ?? '-'),
        paidAmount != null && String(paidAmount).trim() !== '' ? formatIndianCurrency(paidAmount) : '-',
        String(item?.mode ?? '-'),
        billUrl ? 'Yes' : '-',
        overallPdfUrl ? 'Yes' : '-'
      ]);
    });
    // Generate table
    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: yPosition,
      theme: "grid",
      headStyles: {
        fillColor: [191, 152, 83],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: 0
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // SI.No
        1: { halign: 'center', cellWidth: 25 }, // Bill Arrival Date
        2: { halign: 'left', cellWidth: 30 }, // Vendor Name
        3: { halign: 'center', cellWidth: 18 }, // No of Bills
        4: { halign: 'right', cellWidth: 25 }, // Total Amount
        5: { halign: 'center', cellWidth: 25 }, // Bill Verification
        6: { halign: 'center', cellWidth: 25 }, // Entry Date
        7: { halign: 'center', cellWidth: 25 }, // Payment Date
        8: { halign: 'right', cellWidth: 25 }, // Payment Amount
        9: { halign: 'center', cellWidth: 20 }, // Mode
        10: { halign: 'center', cellWidth: 15 }, // Bill
        11: { halign: 'center', cellWidth: 20 } // Summary Bill
      },
      styles: {
        overflow: 'linebreak',
        cellPadding: 2
      },
      margin: { top: yPosition, left: 14, right: 14 }
    });
    // Save PDF
    const fileName = `Bill_Statement_${dateStr}.pdf`;
    doc.save(fileName);
  };
  const selectMenuPortalTarget = typeof document !== 'undefined' ? document.body : null;
  const selectMenuProps = {
    menuPortalTarget: selectMenuPortalTarget,
    menuPosition: 'fixed',
    menuPlacement: 'auto',
  };
  // Custom select styles — menuPortal z-index must sit above table (sticky thead uses z-90)
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderWidth: '2px',
      minHeight: '45px',
      height: '45px',
      borderRadius: '8px',
      textAlign: 'left',
      borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.2)',
      },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 99999 }),
    menu: (base) => ({
      ...base,
      zIndex: 99999,
      textAlign: 'left',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '280px',
    }),
  };
  useEffect(() => {
    fetchVendorNames();
  }, []);
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchStatementData(controller.signal);
        if (!mounted) return;
      } catch (e) {
        if (String(e?.name || '') === 'AbortError') return;
        if (!mounted) return;
        setApiData([]);
        setError(e?.message || 'Failed to load statement');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const billPaymentsTabActivePrevRef = useRef(undefined);
  useEffect(() => {
    const prev = billPaymentsTabActivePrevRef.current;
    billPaymentsTabActivePrevRef.current = billPaymentsTabActive;
    if (!billPaymentsTabActive) return;
    if (prev !== false) return;
    let mounted = true;
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchStatementData(controller.signal);
        if (!mounted) return;
      } catch (e) {
        if (String(e?.name || '') === 'AbortError') return;
        if (!mounted) return;
        setApiData([]);
        setError(e?.message || 'Failed to load statement');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [billPaymentsTabActive]);

  useEffect(() => {
    if (refreshSignal === undefined) return;
    if (!billPaymentsTabActive) return;
    let mounted = true;
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchStatementData(controller.signal);
        if (!mounted) return;
      } catch (e) {
        if (String(e?.name || '') === 'AbortError') return;
        if (!mounted) return;
        setApiData([]);
        setError(e?.message || 'Failed to load statement');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [refreshSignal, billPaymentsTabActive]);

  return (
    <div className="">
      <div className=' ml-10 mr-10'>
        <div className="mb-6 bg-white p-6 rounded-lg min-h-[128px] overflow-visible relative z-[100]">
          <div className="lg:flex lg:gap-4 gap-2 ml-5 text-left ">
            <div className="relative z-[100]">
              <label className="block font-semibold mb-1">Vendor Name</label>
              <Select
                {...selectMenuProps}
                options={vendorOptions}
                value={selectedVendor}
                onChange={(option) => setSelectedVendor(option || null)}
                getOptionLabel={(opt) => opt.label}
                getOptionValue={(opt) => String(opt.id ?? opt.value)}
                placeholder="Select Vendor Name"
                styles={customStyles}
                isClearable
                className="w-[323px]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[168px] h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none0"
                placeholder="Select Date"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[168px] h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none"
                placeholder="Select Date"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Payment Date</label>
              <input
                type="date"
                value={fromPaymentDate}
                onChange={(e) => setFromPaymentDate(e.target.value)}
                className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none"
                placeholder="Select Payment Date"
              />
            </div>
            <div className="text-left relative z-[100]">
              <label className="block font-semibold mb-1">Payment Mode</label>
              <Select
                {...selectMenuProps}
                options={paymentModeOptions}
                value={selectedPaymentMode}
                onChange={(option) => setSelectedPaymentMode(option || null)}
                placeholder="Select Payment Mode "
                styles={customStyles}
                isClearable
                className="w-[230px] "
              />
            </div>
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-[45px] px-4 text-sm font-semibold text-[#BF9853] border-2 border-[#BF9853] border-opacity-30 rounded-lg hover:bg-[#FAF6ED]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-4 relative z-0">
          <div className="flex justify-between items-center p-4 ml-5">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-[#202020]">{displayData.length}</span> of{' '}
              <span className="font-semibold text-[#202020]">{apiData.length}</span> entries
              {vendorFilterName ? (
                <span>
                  {' '}
                  for vendor <span className="font-semibold text-[#202020]">{vendorFilterName}</span>
                </span>
              ) : null}
            </p>
            <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 font-semibold text-sm">
              Export PDF
            </button>
          </div>
          <div className="overflow-x-auto border-l-8 border-l-[#BF9853] h-[500px] rounded-lg ml-5">
            <table className="w-full border-collapse">
              <thead className="bg-[#FAF6ED] sticky top-0 z-90">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200" onClick={() => handleSort('si_no')}>
                    <div className="flex items-center gap-1">
                      SI.No
                      {sortConfig.key === 'si_no' && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200" onClick={() => handleSort('bill_arrival_date')}>
                    <div className="flex items-center gap-1">
                      Bill Arrival Date
                      {sortConfig.key === 'bill_arrival_date' && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200" onClick={() => handleSort('vendor_name')} >
                    <div className="flex items-center gap-1">
                      Vendor Name
                      {sortConfig.key === 'vendor_name' && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200" onClick={() => handleSort('no_of_bills')} >
                    <div className="flex items-center gap-1">
                      No of Bills
                      {sortConfig.key === 'no_of_bills' && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200" onClick={() => handleSort('total_amount')} >
                    <div className="flex items-center gap-1">
                      Total Amount
                      {sortConfig.key === 'total_amount' && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200" onClick={() => handleSort('bill_verification')} >
                    <div className="flex items-center gap-1">
                      Bill verification
                      {sortConfig.key === 'bill_verification' && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200" onClick={() => handleSort('entry_date')} >
                    <div className="flex items-center gap-1">
                      Entry Date
                      {sortConfig.key === 'entry_date' && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200" onClick={() => handleSort('payment_date')}>
                    <div className="flex items-center gap-1">
                      Payment date
                      {sortConfig.key === 'payment_date' && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200" onClick={() => handleSort('payment_amount')}>
                    <div className="flex items-center gap-1">
                      Payment Amount
                      {sortConfig.key === 'payment_amount' && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold ">Mode</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold ">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold ">Summary</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="12" className="px-4 py-8 text-center text-sm text-gray-500">
                      Loading data...
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan="12" className="px-4 py-8 text-center text-sm text-red-500">
                      Error loading data: {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && displayData.length === 0 && (
                  <tr>
                    <td colSpan="12" className="px-4 py-8 text-center text-sm text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  displayData.map((item, index) => {
                  const arrival = item?.arrival_date || item?.bill_arrival_date || null;
                  const overallAmount = item?.overall_amount ?? item?.total_amount ?? null;
                  const paidAmount = item?.paid_amount ?? item?.payment_amount ?? null;
                  const billUrl = item?.bill_url ?? item?.billUrl ?? null;
                  const overallPdfUrl = item?.overall_pdf_url ?? item?.overallPdfUrl ?? item?.over_all_payment_pdf_url ?? null;
                  const rowVendor = resolveRowVendorName(item);
                  return (
                    <tr
                      key={`statement-row-${index}-${item.tracker_id ?? ''}-${item.id ?? ''}-${getPaymentYmd(item) ?? ''}-${rowVendor}`}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}  text-left`}
                    >
                      <td className="px-4 py-3 text-sm border-b border-gray-200">{index + 1}</td>
                      <td className="px-4 py-3 text-sm border-b border-gray-200">
                        {arrival ? new Date(arrival).toLocaleDateString('en-GB') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-200">
                        {rowVendor || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-200">
                        {getNoOfBills(item)}
                      </td>
                      <td className="py-3 text-sm border-b border-gray-200 text-center">
                        {overallAmount != null && String(overallAmount).trim() !== '' ? `₹${formatIndianCurrency(overallAmount)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-200">
                        {item.v_date || item.vDate || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-200">
                        {item.e_date || item.eDate || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-200">
                        {item.p_date || item.pDate || item.payment_date || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-200 text-center">
                        {paidAmount != null && String(paidAmount).trim() !== '' ? `₹${formatIndianCurrency(paidAmount)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-200">
                        {item.mode || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-200">
                        {billUrl ? (
                          <a href={billUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[#656635] hover:underline" title="Open bill attachment">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" />
                            </svg>
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-200">
                        {overallPdfUrl ? (
                          <a href={overallPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[#656635] hover:underline" title="Open summary bill">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" />
                            </svg>
                          </a>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
export default BillStatement