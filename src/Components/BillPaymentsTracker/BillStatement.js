import React, { useState, useEffect } from 'react'
import Select from 'react-select';
import axios from "axios";

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
      paymentData[item.id] = info;
    }
    setPaymentInfo(paymentData);
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
  // Get payment date and mode - modified to show multiple dates like entry dates
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
        return { date: '-', mode: '-' }
      }
      const paymentDetails = await response.json();
      if (!paymentDetails || paymentDetails.length === 0) {
        return { date: '-', mode: '-' }
      }
      // Get all payment dates and format them like entry dates
      const paymentDates = paymentDetails
        .map(payment => payment.date)
        .filter(date => date) // Remove null/undefined dates
        .map(date => new Date(date))
        .sort((a, b) => a - b) // Sort dates chronologically
        .map(date => {
          const day = date.getDate();
          const month = date.toLocaleDateString('en-GB', { month: 'short' });
          const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year
          return { day, month, year };
        });
      if (paymentDates.length === 0) {
        return { date: '-', mode: '-' }
      }
      // Remove duplicate dates (same day, month, year)
      const uniqueDates = paymentDates.filter((date, index, arr) =>
        index === arr.findIndex(d => d.day === date.day && d.month === date.month && d.year === date.year)
      );
      let formattedDate = '-';
      if (uniqueDates.length === 1) {
        // Single date format: DD/MM/YYYY
        const date = uniqueDates[0];
        const day = date.day.toString().padStart(2, '0');
        const month = (new Date(0, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(date.month)).getMonth() + 1).toString().padStart(2, '0');
        const year = `20${date.year}`; // Convert 25 to 2025
        formattedDate = `${day}/${month}/${year}`;
      } else if (uniqueDates.length === 2) {
        // Format as "15 & 17 Oct 25"
        const [first, second] = uniqueDates;
        if (first.month === second.month && first.year === second.year) {
          formattedDate = `${first.day} & ${second.day} ${first.month} ${first.year}`;
        } else {
          formattedDate = `${first.day} ${first.month} ${first.year} & ${second.day} ${second.month} ${second.year}`;
        }
      } else {
        // For more than 2 dates, show first and last with "&" in between
        const first = uniqueDates[0];
        const last = uniqueDates[uniqueDates.length - 1];
        if (first.month === last.month && first.year === last.year) {
          formattedDate = `${first.day} & ${last.day} ${first.month} ${first.year}`;
        } else {
          formattedDate = `${first.day} ${first.month} ${first.year} & ${last.day} ${last.month} ${last.year}`;
        }
      }
      const modes = paymentDetails.map(payment => payment.vendor_bill_payment_mode).filter(mode => mode);
      return {
        date: formattedDate,
        mode: modes.length > 0 ? modes.join(', ') : '-'
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
      return { date: '-', mode: '-' }
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
    // Filter by date range
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
    setFilteredData(filtered);
  };
  // Clear filters
  const clearFilters = () => {
    setSelectedVendor(null);
    setFromDate('');
    setToDate('');
    setFilteredData(apiData);
  };
  // Export to PDF
  const exportToPDF = () => {
    alert('Export to PDF functionality would be implemented here');
  };
  // Custom select styles
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderWidth: '2px',
      height: '45px',
      borderRadius: '8px',
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
  }, [selectedVendor, fromDate, toDate, apiData]);
  useEffect(() => {
    if (apiData.length > 0) {
      loadPaymentInfo();
    }
  }, [apiData]);
  return (
    <div className="">
      <div className=' ml-10 mr-10'>
        <div className="mb-6 bg-white p-6 rounded-lg h-[128px]">
          <div className="lg:flex lg:gap-4 gap-2 ml-5 text-left">
            <div>
              <label className="block font-semibold mb-2">Vendor Name</label>
              <Select
                options={combinedOptions}
                value={selectedVendor}
                onChange={setSelectedVendor}
                placeholder="Select Vendor Name"
                styles={customStyles}
                isClearable
                menuPortalTarget={document.body}
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none0"
                placeholder="Select Date"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none"
                placeholder="Select Date"
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
          <div className="overflow-x-auto border-l-8 border-l-[#BF9853] rounded-lg ml-5">
            <table className="w-full border-collapse">
              <thead className="bg-[#FAF6ED]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold ">SI.No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold ">Bill Arrival Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold ">Vendor Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold ">No of Bills</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold ">Total Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold ">Bill verification</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold ">Entry Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold ">Payment date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold ">Mode</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500">
                      Loading data...
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-sm text-red-500">
                      Error loading data: {error}
                    </td>
                  </tr>
                )}
                {filteredData.length === 0 && !loading && !error && (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
                {filteredData.map((item, index) => (
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
                      {item.total_amount ? `₹${parseInt(item.total_amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-gray-200">
                      {getBillVerificationDate(item)}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-gray-200">
                      {getEntryDate(item)}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-gray-200">
                      {paymentInfo[item.id]?.date || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-gray-200">
                      {paymentInfo[item.id]?.mode || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
export default BillStatement