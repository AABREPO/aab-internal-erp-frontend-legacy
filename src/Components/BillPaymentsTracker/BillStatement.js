import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select';
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const BillStatement = ({ username, userRoles = [] }) => {
  const [apiData, setApiData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [vendorOptions, setVendorOptions] = useState([])
  const [contractorOptions, setContractorOptions] = useState([])
  const [combinedOptions, setCombinedOptions] = useState([])
  const [allBillEntries, setAllBillEntries] = useState([])
  const [paymentInfo, setPaymentInfo] = useState({})
  // Filter states
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [fromPaymentDate, setFromPaymentDate] = useState('')
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null)
  const paymentModeOptions = useMemo(() => {
    const modes = new Set()
    Object.values(paymentInfo || {}).forEach(payments => {
      if (!Array.isArray(payments)) return
      payments.forEach(payment => {
        const mode = (payment?.mode || '').trim()
        if (mode && mode !== '-') {
          modes.add(mode)
        }
      })
    })
    return Array.from(modes)
      .sort((a, b) => a.localeCompare(b))
      .map(mode => ({ value: mode, label: mode }))
  }, [paymentInfo])
  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
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
  // Fetch contractor names
  const fetchContractorNames = async () => {
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
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
        value: item.contractorName,
        label: item.contractorName,
        id: item.id,
        type: "Contractor"
      }));
      setContractorOptions(formattedData);
    } catch (error) {
      console.error("Error fetching contractor names:", error);
    }
  };
  // Fetch tracker data
  const fetchTrackerData = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://backendaab.in/aabuildersDash/api/vendor-payments/trackers", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      try {
        const data = await response.json();
        setApiData(data);
        setFilteredData(data);
      } catch (parseError) {
        console.warn("Detected circular reference in API response. This needs to be fixed in the backend.");
        setError("Invalid data format received from server");
      }
    } catch (error) {
      console.error("Error fetching tracker data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all bill entries
  const fetchAllBillEntries = async () => {
    try {
      const response = await fetch("https://backendaab.in/aabuildersDash/api/bill-entry/getAll", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      setAllBillEntries(data);
    } catch (error) {
      console.error("Error fetching bill entries:", error);
    }
  };
  // Load payment information for all bills
  const loadPaymentInfo = async () => {
    const paymentData = {};
    for (const item of apiData) {
      const info = await getPaymentInfo(item);
      paymentData[item.id] = info; // info is an array of payments
    }
    setPaymentInfo(paymentData);
  };

  // Check if this is the last payment for a vendor
  const isLastPayment = (payments, currentIndex) => {
    return currentIndex === payments.length - 1;
  };

  // Get vendor name by ID
  const getVendorNameById = (vendorId) => {
    const vendor = combinedOptions.find(option => option.id === vendorId);
    return vendor ? vendor.label : 'Unknown Vendor';
  };
  // Get bill verification date
  const getBillVerificationDate = (item) => {
    if (!item.billVerifications || item.billVerifications.length === 0) {
      return '-'
    }
    const verifiedBills = item.billVerifications.filter(verification =>
      verification.is_verified === true || verification.status === 'VERIFIED'
    );
    if (verifiedBills.length === 0) {
      return '-'
    }
    const dates = verifiedBills.map(verification => {
      // Check for verification date or timestamp fields
      const dateValue = verification.verified_date || verification.verification_date || verification.created_at || verification.updated_at || verification.timestamp || verification.date;
      if (dateValue) {
        try {
          const date = new Date(dateValue);
          return date.toLocaleDateString('en-GB');
        } catch (error) {
          console.error('Error parsing date:', dateValue, error);
          return null;
        }
      }
      return null
    }).filter(date => date !== null);

    if (dates.length === 0) {
      return '-'
    }
    // Remove duplicate dates and return unique dates only
    const uniqueDates = [...new Set(dates)];
    return uniqueDates.join(', ')
  };
  // Get entry date(s) - modified to show multiple dates
  const getEntryDate = (item) => {
    const entries = allBillEntries.filter(entry => entry.vendor_payments_tracker_id === item.id);
    if (entries.length === 0) {
      return '-'
    }
    // Get all unique entry dates for this vendor
    const entryDates = entries
      .map(entry => entry.entered_date)
      .filter(date => date) // Remove null/undefined dates
      .map(date => new Date(date))
      .sort((a, b) => a - b) // Sort dates chronologically
      .map(date => {
        const day = date.getDate();
        const month = date.toLocaleDateString('en-GB', { month: 'short' });
        const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year
        return { day, month, year };
      });
    if (entryDates.length === 0) {
      return '-'
    }
    // Remove duplicate dates (same day, month, year)
    const uniqueDates = entryDates.filter((date, index, arr) =>
      index === arr.findIndex(d => d.day === date.day && d.month === date.month && d.year === date.year)
    );
    if (uniqueDates.length === 1) {
      // Single date format: DD/MM/YYYY
      const date = uniqueDates[0];
      const day = date.day.toString().padStart(2, '0');
      const month = (new Date(0, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(date.month)).getMonth() + 1).toString().padStart(2, '0');
      const year = `20${date.year}`; // Convert 25 to 2025
      return `${day}/${month}/${year}`;
    } else if (uniqueDates.length === 2) {
      // Format as "15 & 17 Oct 25"
      const [first, second] = uniqueDates;
      if (first.month === second.month && first.year === second.year) {
        return `${first.day} & ${second.day} ${first.month} ${first.year}`
      } else {
        return `${first.day} ${first.month} ${first.year} & ${second.day} ${second.month} ${second.year}`
      }
    } else {
      // For more than 2 dates, show first and last with "&" in between
      const first = uniqueDates[0];
      const last = uniqueDates[uniqueDates.length - 1];
      if (first.month === last.month && first.year === last.year) {
        return `${first.day} & ${last.day} ${first.month} ${first.year}`
      } else {
        return `${first.day} ${first.month} ${first.year} & ${last.day} ${last.month} ${last.year}`
      }
    }
  };
  // Get payment date and mode - each payment as its own row
  const getPaymentInfo = async (item) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/get/${item.id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        return []
      }
      const paymentDetails = await response.json();
      if (!paymentDetails || paymentDetails.length === 0) {
        return []
      }
      // Map each payment to its own display object
      const payments = paymentDetails.map(payment => {
        const rawUrl = payment?.bill_url || payment?.file_url || payment?.document_url || payment?.bill_document_url || payment?.url;
        const isHttpUrl = typeof rawUrl === 'string' && /^(http|https):\/\//i.test(rawUrl);
        const rawDate = payment?.date;
        // Include carry_forward_amount in the amount calculation
        const amount = parseFloat(payment?.amount) || 0;
        const carryForwardAmount = parseFloat(payment?.carry_forward_amount) || 0;
        const totalAmount = amount + carryForwardAmount;
        return ({
          date: rawDate ? new Date(rawDate).toLocaleDateString('en-GB') : '-',
          rawDate: rawDate || null, // Store raw date for filtering
          mode: payment?.vendor_bill_payment_mode || '-',
          amount: totalAmount > 0 ? totalAmount : (payment?.amount || payment?.payment_amount || '-'),
          billUrl: isHttpUrl ? rawUrl : null
        });
      });
      return payments;
    } catch (error) {
      console.error('Error fetching payment info:', error);
      return []
    }
  };
  // Apply filters
  const applyFilters = () => {
    let filtered = [...apiData];
    // Filter by vendor
    if (selectedVendor) {
      filtered = filtered.filter(item =>
        getVendorNameById(item.vendor_id).toLowerCase().includes(selectedVendor.label.toLowerCase())
      );
    }
    // Filter by date range (bill arrival date)
    if (fromDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.bill_arrival_date);
        const from = new Date(fromDate);
        return itemDate >= from;
      });
    }
    if (toDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.bill_arrival_date);
        const to = new Date(toDate);
        return itemDate <= to;
      });
    }
    // Filter by exact payment date match
    if (fromPaymentDate) {
      filtered = filtered.filter(item => {
        const payments = paymentInfo[item.id] || [];
        if (payments.length === 0) {
          // If no payments and filtering by payment date, exclude this item
          return false;
        }
        // Check if any payment matches the exact selected date
        return payments.some(payment => {
          // Use rawDate if available (original API date), otherwise try to parse formatted date
          const dateToCheck = payment.rawDate || payment.date;
          if (!dateToCheck || dateToCheck === '-') return false;
          try {
            const paymentDate = new Date(dateToCheck);
            if (isNaN(paymentDate.getTime())) {
              // If rawDate parsing failed, try parsing formatted date (DD/MM/YYYY)
              if (payment.date && payment.date !== '-') {
                const parts = payment.date.split('/');
                if (parts.length === 3) {
                  paymentDate.setFullYear(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                } else {
                  return false;
                }
              } else {
                return false;
              }
            }
            paymentDate.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
            const selectedDate = new Date(fromPaymentDate);
            selectedDate.setHours(0, 0, 0, 0);
            // Compare dates: year, month, and day must match exactly
            return paymentDate.getTime() === selectedDate.getTime();
          } catch (error) {
            console.error('Error parsing payment date:', dateToCheck, error);
            return false;
          }
        });
      });
    }
    if (selectedPaymentMode?.value) {
      filtered = filtered.filter(item => {
        const payments = paymentInfo[item.id] || []
        if (payments.length === 0) {
          return false
        }
        return payments.some(payment => {
          const modeToCheck = (payment.mode || '').trim().toLowerCase()
          return modeToCheck === selectedPaymentMode.value.trim().toLowerCase()
        })
      })
    }
    const sorted = applySorting(filtered);
    setFilteredData(sorted);
  };
  // Clear filters
  const clearFilters = () => {
    setSelectedVendor(null);
    setFromDate('');
    setToDate('');
    setFromPaymentDate('');
    setSelectedPaymentMode(null);
    setFilteredData(apiData);
  };
  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }
  // Apply sorting to filtered data
  const applySorting = (data) => {
    if (!sortConfig.key) return data
    return [...data].sort((a, b) => {
      let aValue, bValue
      switch (sortConfig.key) {
        case 'si_no':
          // Sort by item ID or index
          aValue = a.id || 0
          bValue = b.id || 0
          break
        case 'bill_arrival_date':
          aValue = new Date(a.bill_arrival_date || 0)
          bValue = new Date(b.bill_arrival_date || 0)
          break
        case 'vendor_name':
          aValue = getVendorNameById(a.vendor_id).toLowerCase()
          bValue = getVendorNameById(b.vendor_id).toLowerCase()
          break
        case 'no_of_bills':
          aValue = parseInt(a.no_of_bills || a.noOfBills || 0)
          bValue = parseInt(b.no_of_bills || b.noOfBills || 0)
          break
        case 'total_amount':
          aValue = parseFloat(a.total_amount || 0)
          bValue = parseFloat(b.total_amount || 0)
          break
        case 'bill_verification':
          aValue = getBillVerificationDate(a)
          bValue = getBillVerificationDate(b)
          break
        case 'entry_date':
          aValue = getEntryDate(a)
          bValue = getEntryDate(b)
          break
        case 'payment_date':
          // Sort by first payment date if available
          const aPayments = paymentInfo[a.id] || []
          const bPayments = paymentInfo[b.id] || []
          const aFirstPayment = aPayments.length > 0 && aPayments[0].rawDate ? new Date(aPayments[0].rawDate) : null
          const bFirstPayment = bPayments.length > 0 && bPayments[0].rawDate ? new Date(bPayments[0].rawDate) : null
          aValue = aFirstPayment || new Date(0)
          bValue = bFirstPayment || new Date(0)
          break
        case 'payment_amount':
          // Sort by total payment amount
          const aTotalPayment = (paymentInfo[a.id] || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
          const bTotalPayment = (paymentInfo[b.id] || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
          aValue = aTotalPayment
          bValue = bTotalPayment
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
    if (selectedVendor) {
      filterText.push(`Vendor: ${selectedVendor.label}`);
    }
    if (fromDate || toDate) {
      const from = fromDate ? new Date(fromDate).toLocaleDateString('en-GB') : 'All';
      const to = toDate ? new Date(toDate).toLocaleDateString('en-GB') : 'All';
      filterText.push(`Bill Arrival Date: ${from} to ${to}`);
    }
    if (fromPaymentDate) {
      filterText.push(`Payment Date: ${new Date(fromPaymentDate).toLocaleDateString('en-GB')}`);
    }
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
    filteredData.forEach((item, index) => {
      const payments = paymentInfo[item.id] || [];
      if (payments.length === 0) {
        // No payments - single row
        tableRows.push([
          String(item.id || index + 1),
          item.bill_arrival_date ? new Date(item.bill_arrival_date).toLocaleDateString('en-GB') : '-',
          getVendorNameById(item.vendor_id),
          String(item.no_of_bills || item.noOfBills || '-'),
          formatIndianCurrency(item.total_amount),
          getBillVerificationDate(item),
          getEntryDate(item),
          '-',
          '-',
          '-',
          '-',
          '-'
        ]);
      } else {
        // Multiple payments - one row per payment
        payments.forEach((pay, pIndex) => {
          const overallPdfUrl = item.over_all_payment_pdf_url || item.overAllPaymentPdfUrl;
          const showOverallPdf = isLastPayment(payments, pIndex) && overallPdfUrl;
          tableRows.push([
            String(item.id || index + 1),
            item.bill_arrival_date ? new Date(item.bill_arrival_date).toLocaleDateString('en-GB') : '-',
            getVendorNameById(item.vendor_id),
            String(item.no_of_bills || item.noOfBills || '-'),
            formatIndianCurrency(item.total_amount),
            getBillVerificationDate(item),
            getEntryDate(item),
            pay.date || '-',
            pay.amount !== '-' ? formatIndianCurrency(pay.amount) : '-',
            pay.mode || '-',
            pay.billUrl ? 'Yes' : '-',
            showOverallPdf ? 'Yes' : '-'
          ]);
        });
      }
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
  // Custom select styles
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderWidth: '2px',
      height: '45px',
      borderRadius: '8px',
      textAlign: 'left',
      borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.2)',
      }
    }),
  };
  useEffect(() => {
    fetchVendorNames();
    fetchContractorNames();
    fetchTrackerData();
    fetchAllBillEntries();
  }, []);
  useEffect(() => {
    setCombinedOptions([...vendorOptions, ...contractorOptions]);
  }, [vendorOptions, contractorOptions]);
  useEffect(() => {
    applyFilters();
  }, [selectedVendor, fromDate, toDate, fromPaymentDate, selectedPaymentMode, apiData, paymentInfo, sortConfig]);
  useEffect(() => {
    if (apiData.length > 0) {
      loadPaymentInfo();
    }
  }, [apiData]);
  return (
    <div className="">
      <div className=' ml-10 mr-10'>
        <div className="mb-6 bg-white p-6 rounded-lg h-[128px]">
          <div className="lg:flex lg:gap-4 gap-2 ml-5 text-left ">
            <div>
              <label className="block font-semibold mb-1">Vendor Name</label>
              <Select
                options={combinedOptions}
                value={selectedVendor}
                onChange={setSelectedVendor}
                placeholder="Select Vendor Name"
                styles={customStyles}
                isClearable
                menuPortalTarget={document.body}
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
            <div className="text-left">
              <label className="block font-semibold mb-1">Payment Mode</label>
              <Select
                options={paymentModeOptions}
                value={selectedPaymentMode}
                onChange={setSelectedPaymentMode}
                placeholder="Select Payment Mode "
                styles={customStyles}
                isClearable
                menuPortalTarget={document.body}
                className="w-[230px] "
              />
            </div>
          </div>
        </div>
        <div className="bg-white p-4">
          <div className="flex justify-end items-center p-4 ml-5">
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
                {filteredData.length === 0 && !loading && !error && (
                  <tr>
                    <td colSpan="12" className="px-4 py-8 text-center text-sm text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
                {filteredData.map((item, index) => {
                  const payments = paymentInfo[item.id] || [];
                  if (payments.length === 0) {
                    return (
                      <tr key={`statement-${item.id || index}`} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}  text-left`}>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">{item.id || index + 1}</td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          {item.bill_arrival_date ? new Date(item.bill_arrival_date).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          {getVendorNameById(item.vendor_id)}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          {item.no_of_bills || item.noOfBills || '-'}
                        </td>
                        <td className=" py-3 text-sm border-b border-gray-200 text-center">
                          {item.total_amount ? `₹${formatIndianCurrency(item.total_amount)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          {getBillVerificationDate(item)}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          {getEntryDate(item)}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">-</td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">-</td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">-</td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">-</td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">-</td>
                      </tr>
                    );
                  }
                  return payments.map((pay, pIndex) => {
                    const overallPdfUrl = item.over_all_payment_pdf_url || item.overAllPaymentPdfUrl;
                    const showOverallPdf = isLastPayment(payments, pIndex) && overallPdfUrl;
                    return (
                      <tr key={`statement-${item.id || index}-${pIndex}`} className={`${(index + pIndex) % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}  text-left`}>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">{item.id || index + 1}</td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          {item.bill_arrival_date ? new Date(item.bill_arrival_date).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          {getVendorNameById(item.vendor_id)}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          {item.no_of_bills || item.noOfBills || '-'}
                        </td>
                        <td className=" py-3 text-sm border-b border-gray-200 text-center">
                          {item.total_amount ? `₹${formatIndianCurrency(item.total_amount)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          {getBillVerificationDate(item)}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          {getEntryDate(item)}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">{pay.date}</td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200 text-center">
                          {pay.amount !== '-' ? `₹${formatIndianCurrency(pay.amount)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">{pay.mode}</td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          {pay.billUrl ? (
                            <a href={pay.billUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[#656635] hover:underline" title="Open bill attachment">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" />
                              </svg>
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          {showOverallPdf ? (
                            <a href={overallPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[#656635] hover:underline" title="Open summary bill">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" />
                              </svg>
                            </a>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  });
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