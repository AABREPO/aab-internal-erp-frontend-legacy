import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Filter from '../Images/filter (3).png'
const ClaimPaymentSummary = ({ username, userRoles = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [extraRows, setExtraRows] = useState([]);
  const [popupAmount, setPopupAmount] = useState("");
  const [mainDate, setMainDate] = useState("");
  const [siteOption, setSiteOption] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [claimDataList, setClaimDataList] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [mainMode, setMainMode] = useState('');
  const [receivedAmounts, setReceivedAmounts] = useState({});
  const [discountAmounts, setDiscountAmounts] = useState({});
  const [actualAmount, setActualAmount] = useState(0);
  const [collectedAmount, setCollectedAmount] = useState(0);
  const [claimPaymentsData, setClaimPaymentsData] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [paymentPopupData, setPaymentPopupData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    paymentMode: "",
    chequeNo: "",
    chequeDate: "",
    transactionNumber: "",
    accountNumber: ""
  });
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterProjectName, setFilterProjectName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountSubmitted, setDiscountSubmitted] = useState(false);
  const [submittedDiscounts, setSubmittedDiscounts] = useState(new Set());
  const [accountDetails, setAccountDetails] = useState([]);

  // Drag and scroll functionality
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });

  // Debug: Log username on component mount
  useEffect(() => {
    console.log("ClaimPaymentSummary - Username prop:", username);
    if (!username || username.trim() === '') {
      console.warn("⚠️ WARNING: Username is not available! Payments will not have 'entered_by' information.");
    }
  }, [username]);

  useEffect(() => {
    // Fetch data from the API
    fetch('https://backendaab.in/aabuilderDash/expenses_form/get_form')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then((data) => {
        // Filter only items with accountType = 'Claim'
        const filteredData = data.filter(item => item.accountType === 'Claim' || item.accountType === 'Bill Payments + Claim');
        setClaimDataList(filteredData);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, []);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
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
          value: item.siteName,
          label: item.siteName,
          sNo: item.siteNo,
          id: item.id
        }));
        setSiteOption(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);

  // Fetch vendor options
  useEffect(() => {
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
          type: "Vendor",
        }));
        setVendorOptions(formattedData);
      } catch (error) {
        console.error("Fetch vendor error: ", error);
      }
    };
    fetchVendorNames();
  }, []);

  // Fetch contractor options
  useEffect(() => {
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
          type: "Contractor",
        }));
        setContractorOptions(formattedData);
      } catch (error) {
        console.error("Fetch contractor error: ", error);
      }
    };
    fetchContractorNames();
  }, []);

  useEffect(() => {
    // Fetch employee details
    const fetchEmployeeDetails = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
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
          value: item.employee_name,
          label: item.employee_name,
          id: item.id,
          type: "Employee",
        }));
        setEmployeeOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    // Call employee fetch function
    fetchEmployeeDetails();
  }, []);

  // Fetch account details
  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/account-details/getAll", {
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
        setAccountDetails(data);
      } catch (error) {
        console.error("Error fetching account details:", error);
      }
    };
    fetchAccountDetails();
  }, []);
  const filteredData = selectedSite
    ? claimDataList.filter(item => item.siteName === selectedSite.value)
    : claimDataList;
  useEffect(() => {
    const fetchReceivedAmounts = async () => {
      const amounts = {};
      const discounts = {};
      for (const row of filteredData) {
        try {
          const res = await fetch(`https://backendaab.in/aabuildersDash/api/claim_payments/get/${row.id}`);
          const payments = await res.json();

          const totalReceived = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          const totalDiscount = payments.reduce((sum, payment) => sum + (payment.discount_amount || 0), 0);

          amounts[row.id] = totalReceived;
          discounts[row.id] = totalDiscount;
        } catch (error) {
          console.error(`Error fetching payments for row ${row.id}`, error);
          amounts[row.id] = 0;
          discounts[row.id] = 0;
        }
      }
      setReceivedAmounts(amounts);
      setDiscountAmounts(discounts);
    };
    if (filteredData.length > 0) {
      fetchReceivedAmounts();
    }
  }, [filteredData]);
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderWidth: '2px',
      borderRadius: '8px',
      borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.2)',
      }
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };
  useEffect(() => {
    if (selectedRow) {
      const baseAmount = selectedRow.mainInputAmount !== undefined ? selectedRow.mainInputAmount : selectedRow.amount;
      setPopupAmount(baseAmount || "");
    }
  }, [selectedRow]);
  useEffect(() => {
    if (remainingAmount > 0 && discount > 0) {
      const newAmount = remainingAmount - discount;
      if (newAmount >= 0 && newAmount !== Number(paymentPopupData.amount)) {
        setPaymentPopupData(prev => ({ ...prev, amount: newAmount.toString() }));
      }
    }
  }, [discount, remainingAmount]);
  useEffect(() => {
    if (showModal && selectedRow) {
      const claimId = selectedRow.id;
      const hasSubmittedDiscount = submittedDiscounts.has(claimId);
      const hasPreviousDiscount = claimPaymentsData.some(payment => payment.discount_amount && payment.discount_amount > 0);
      setDiscountSubmitted(hasSubmittedDiscount || hasPreviousDiscount);
    }
  }, [showModal, selectedRow, submittedDiscounts, claimPaymentsData]);
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const handleOpenModal = async (row) => {
    setMainDate(getToday());
    setActualAmount(row.amount);
    setSelectedRow(row);
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/claim_payments/get/${row.id}`);
      const claimPayments = await response.json();
      const totalReceived = claimPayments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );
      const remaining = row.amount - totalReceived;
      setRemainingAmount(remaining > 0 ? remaining : 0);
      setPopupAmount(remaining > 0 ? remaining : 0);
      setClaimPaymentsData(claimPayments);
      setMainMode("");
      const lastPayment = claimPayments[claimPayments.length - 1];
      const existingDiscount = lastPayment && lastPayment.discount_amount ? lastPayment.discount_amount : 0;
      setDiscount(existingDiscount);
      setPaymentPopupData({
        date: getToday(),
        amount: remaining > 0 ? remaining : 0,
        paymentMode: "",
        chequeNo: "",
        chequeDate: "",
        transactionNumber: "",
        accountNumber: ""
      });
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching claim payments:", error);
    }
  };
  const handleSavePayment = async () => {
    if (!username || username.trim() === '') {
      alert("Error: Username is not available. Please log in again or contact support.");
      console.error("Username is missing:", username);
      return;
    }
    const isDiscountOnlyPayment = Number(paymentPopupData.amount) === 0 && (discount || 0) >= remainingAmount;
    const hasDiscountOnly = (discount || 0) > 0 && Number(paymentPopupData.amount) === 0;
    const hasPaymentAndDiscount = Number(paymentPopupData.amount) > 0 && (discount || 0) > 0;
    if (Number(paymentPopupData.amount) > 0 && !paymentPopupData.paymentMode) {
      alert("Please select a payment mode.");
      return;
    }
    if (Number(paymentPopupData.amount) === 0 && (discount || 0) === 0) {
      alert("Please enter an amount or discount.");
      return;
    }
    const totalPaymentWithDiscount = Number(paymentPopupData.amount) + (discount || 0);
    if (totalPaymentWithDiscount > remainingAmount) {
      alert(`Payment amount (${paymentPopupData.amount}) + Discount (${discount || 0}) = ${totalPaymentWithDiscount} cannot exceed remaining amount (${remainingAmount})`);
      return;
    }
    const newPayment = {
      entered_by: username,
      expenses_claim_id: selectedRow.expenses_claim_id ?? selectedRow.id,
      payment_mode: (isDiscountOnlyPayment || hasDiscountOnly) ? "Discount" : paymentPopupData.paymentMode,
      date: paymentPopupData.date,
      amount: paymentPopupData.amount,
      cash_register_status: false,
      discount_amount: discount || 0,
      ...(paymentPopupData.paymentMode === "Cheque" && {
        cheque_number: paymentPopupData.chequeNo,
        cheque_date: paymentPopupData.chequeDate
      }),
      transaction_number: paymentPopupData.transactionNumber,
      account_number: paymentPopupData.accountNumber
    };
    try {
      const response = await fetch("https://backendaab.in/aabuildersDash/api/claim_payments/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayment),
      });
      if (!response.ok) {
        alert("Failed to save payment.");
        return;
      }
      const claimPaymentResult = await response.json();
      if (["Gpay", "PhonePe", "Net Banking", "Cheque"].includes(paymentPopupData.paymentMode) && !isDiscountOnlyPayment) {
        const weeklyPaymentBillPayload = {
          date: paymentPopupData.date,
          created_at: new Date().toISOString(),
          contractor_id: selectedRow.contractor_id || getContractorId(selectedRow.contractorName) || getContractorId(selectedRow.contractor) || null,
          vendor_id: selectedRow.vendor_id || getVendorId(selectedRow.vendorName) || getVendorId(selectedRow.vendor) || null,
          employee_id: selectedRow.employee_id || getEmployeeId(selectedRow.employeeName) || getEmployeeId(selectedRow.employee) || getEmployeeId(selectedRow.labour) || getEmployeeId(selectedRow.labourName) || null,
          project_id: selectedRow.project_id || getProjectId(selectedRow.siteName) || null,
          type: selectedRow.type || "Claim",
          bill_payment_mode: paymentPopupData.paymentMode,
          amount: parseFloat(paymentPopupData.amount),
          discount_amount: discount || 0,
          status: true,
          weekly_number: "",
          weekly_payment_expense_id: null,
          advance_portal_id: null,
          staff_advance_portal_id: null,
          claim_payment_id: claimPaymentResult.id || claimPaymentResult.claimPaymentsId,
          cheque_number: paymentPopupData.chequeNo || null,
          cheque_date: paymentPopupData.chequeDate || null,
          transaction_number: paymentPopupData.transactionNumber || null,
          account_number: paymentPopupData.accountNumber || null
        };
        const weeklyPaymentBillResponse = await axios.post(
          "https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save",
          weeklyPaymentBillPayload,
          { headers: { "Content-Type": "application/json" } }
        );
        alert("Payment saved successfully and added to Weekly Payment Bills!");
      } else if (isDiscountOnlyPayment || hasDiscountOnly) {
        alert("Discount applied successfully!");
        setDiscountSubmitted(true);
        setSubmittedDiscounts(prev => new Set([...prev, selectedRow.id]));
      } else if (hasPaymentAndDiscount) {
        alert("Payment and discount saved successfully!");
        setDiscountSubmitted(true);
        setSubmittedDiscounts(prev => new Set([...prev, selectedRow.id]));
      } else {
        alert("Payment saved successfully!");
      }
      window.location.reload();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving payment:", error);
      alert("Error occurred while saving payment.");
    }
  };
  const allData = filteredData;
  const filteredDataWithFilters = allData.filter((row) => {
    if (filterDate) {
      const [year, month, day] = filterDate.split("-");
      const formattedFilterDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
      const rowDate = formatDateOnly(row.date);
      if (rowDate !== formattedFilterDate) return false;
    }
    if (filterProjectName && row.siteName !== filterProjectName) return false;
    if (filterCategory && row.category !== filterCategory) return false;
    if (filterStatus) {
      const received = receivedAmounts[row.id] || 0;
      const isClaimed = received >= row.amount;
      const statusText = isClaimed ? 'Claimed' : 'Not Claimed';
      if (statusText !== filterStatus) return false;
    }
    return true;
  });
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  const sortedData = [...filteredDataWithFilters].sort((a, b) => {
    if (!sortColumn) return 0;
    let aValue, bValue;
    switch (sortColumn) {
      case 'sno':
        return sortDirection === 'asc' ? 0 : 0;
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'siteName':
        aValue = a.siteName || '';
        bValue = b.siteName || '';
        break;
      case 'amount':
        aValue = parseFloat(a.amount) || 0;
        bValue = parseFloat(b.amount) || 0;
        break;
      case 'category':
        aValue = a.category || '';
        bValue = b.category || '';
        break;
      case 'comments':
        aValue = a.comments || '';
        bValue = b.comments || '';
        break;
      case 'source':
        aValue = a.source || '';
        bValue = b.source || '';
        break;
      case 'status':
        const aReceived = receivedAmounts[a.id] || 0;
        const bReceived = receivedAmounts[b.id] || 0;
        aValue = aReceived >= a.amount ? 'Claimed' : 'Not Claimed';
        bValue = bReceived >= b.amount ? 'Claimed' : 'Not Claimed';
        break;
      case 'eno':
        aValue = a.eno || '';
        bValue = b.eno || '';
        break;
      default:
        return 0;
    }
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  const sortedSiteOptions = siteOption.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const formatIndianCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';

    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numAmount);
  };
  const getVendorId = (vendorName) => {
    if (!vendorName) return null;
    const vendor = vendorOptions.find(v => v.value === vendorName);
    return vendor ? vendor.id : null;
  };
  const getContractorId = (contractorName) => {
    if (!contractorName) return null;
    const contractor = contractorOptions.find(c => c.value === contractorName);
    return contractor ? contractor.id : null;
  };
  const getProjectId = (siteName) => {
    if (!siteName) return null;
    const site = siteOption.find(s => s.value === siteName);
    return site ? site.id : null;
  };
  const getEmployeeId = (employeeName) => {
    if (!employeeName) return null;
    const employee = employeeOptions.find(e => e.value === employeeName);
    return employee ? employee.id : null;
  };
  const clearAllFilters = () => {
    setFilterDate('');
    setFilterProjectName('');
    setFilterCategory('');
    setFilterStatus('');
  };
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
  return (
    <body>
      <div className="">
        <div className=' bg-white h-[130px] rounded ml-10 mr-10'>
          <div className=" text-left p-7 ml-10">
            <label className="font-semibold mr-2 block mb-2">Project Name</label>
            <Select
              options={sortedSiteOptions || []}
              placeholder="Select a site..."
              isSearchable={true}
              value={selectedSite}
              onChange={setSelectedSite}
              styles={customStyles}
              isClearable
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              className="w-[380px] h-[45px] focus:outline-none"
            />
          </div>
        </div>
        <div className=' bg-white mt-5 p-5 ml-10 mr-10'>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <button
                className='pl-2'
                onClick={() => setShowFilters(!showFilters)}
              >
                <img
                  src={Filter}
                  alt="Toggle Filter"
                  className="w-7 h-7 border border-[#BF9853] rounded-md ml-3"
                />
              </button>
            </div>
            {(filterDate || filterProjectName || filterCategory || filterStatus) && (
              <div className="flex flex-wrap gap-2 items-center">
                {filterDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">Date: </span>
                    <span className="font-bold">{filterDate}</span>
                    <button onClick={() => setFilterDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {filterProjectName && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Project: </span>
                    <span className="font-bold">{filterProjectName}</span>
                    <button onClick={() => setFilterProjectName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {filterCategory && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Category: </span>
                    <span className="font-bold">{filterCategory}</span>
                    <button onClick={() => setFilterCategory('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {filterStatus && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Status: </span>
                    <span className="font-bold">{filterStatus}</span>
                    <button onClick={() => setFilterStatus('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-[#BF9853] border border-[#BF9853] rounded px-3 py-1 text-sm font-medium hover:bg-[#BF9853] hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
          <div className="rounded-lg border-l-8 border-l-[#BF9853]">
            <div ref={scrollRef} className='overflow-auto max-h-[550px] thin-scrollbar' onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            >
              <table className="w-full border rounded-lg table-fixed">
                <thead className="bg-[#FAF6ED] sticky top-0 z-99">
                  <tr>
                    <th className="px-2 py-2 w-16 text-center sticky top-0 bg-[#FAF6ED] z-20">S.No</th>
                    <th
                      className="px-2 py-2 w-24 cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('date')}
                    >
                      Date {sortColumn === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 w-40 cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('siteName')}
                    >
                      Project Name {sortColumn === 'siteName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 w-32 cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('partyName')}
                    >
                      Party Name {sortColumn === 'partyName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 w-24 cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('amount')}
                    >
                      Amount {sortColumn === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 w-28 cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('category')}
                    >
                      Category {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 w-40 cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('comments')}
                    >
                      Comments {sortColumn === 'comments' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 w-40 cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('source')}
                    >
                      Source {sortColumn === 'source' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 w-24 cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('status')}
                    >
                      Status {sortColumn === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 w-20 cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('eno')}
                    >
                      E.No {sortColumn === 'eno' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-2 py-2 w-24 sticky top-0 bg-[#FAF6ED] z-20">Activity</th>
                    <th className="px-2 py-2 w-16 sticky top-0 bg-[#FAF6ED] z-20">View</th>
                  </tr>
                  {showFilters && (
                    <tr className="bg-white border-b border-gray-200">
                      <th className="pt-2 pb-2"></th>
                      <th className="pt-2 pb-2">
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="p-1 rounded-md bg-transparent -ml-6 w-32 border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                          placeholder="Search Date..."
                        />
                      </th>
                      <th className="pt-2 pb-2">
                        <Select
                          options={[...new Set(allData.map(item => item.siteName))].map(siteName => ({
                            value: siteName,
                            label: siteName
                          }))}
                          value={filterProjectName ? { value: filterProjectName, label: filterProjectName } : null}
                          onChange={(opt) => setFilterProjectName(opt ? opt.value : "")}
                          className="focus:outline-none text-xs"
                          placeholder="Project Name..."
                          isSearchable
                          isClearable
                          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              backgroundColor: 'transparent',
                              borderWidth: '3px',
                              borderColor: state.isFocused
                                ? 'rgba(191, 152, 83, 0.2)'
                                : 'rgba(191, 152, 83, 0.2)',
                              borderRadius: '6px',
                              boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                              '&:hover': {
                                borderColor: 'rgba(191, 152, 83, 0.2)',
                              },
                            }),
                            placeholder: (provided) => ({
                              ...provided,
                              color: '#999',
                              textAlign: 'left',
                            }),
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9,
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              textAlign: 'left',
                              fontWeight: 'normal',
                              fontSize: '15px',
                              backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                              color: 'black',
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              textAlign: 'left',
                              fontWeight: 'normal',
                              color: 'black',
                            }),
                          }}
                        />
                      </th>
                      <th className="pt-2 pb-2"></th>
                      <th className="pt-2 pb-2">
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="p-1 rounded-md bg-transparent w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                          placeholder="Category..."
                        >
                          <option value=''>Select Category...</option>
                          {[...new Set(allData.map(item => item.category))].map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </th>
                      <th className="pt-2 pb-2"></th>
                      <th className="pt-2 pb-2">
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                          className="p-1 rounded-md bg-transparent w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                          placeholder="Status..."
                        >
                          <option value=''>Select Status...</option>
                          <option value='Claimed'>Claimed</option>
                          <option value='Not Claimed'>Not Claimed</option>
                        </select>
                      </th>
                      <th className="pt-2 pb-2"></th>
                      <th className="pt-2 pb-2"></th>
                      <th className="pt-2 pb-2"></th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {sortedData.map((row, index) => (
                    <tr key={index} className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF] font-bold text-[14px]`}>
                      <td className="px-2 py-2 text-center whitespace-nowrap">{index + 1}</td>
                      <td className="px-2 py-2 whitespace-nowrap">{formatDateOnly(row.date)}</td>
                      <td className="px-2 py-2 whitespace-nowrap truncate" title={row.siteName}>{row.siteName}</td>
                      <td className="px-2 py-2 whitespace-nowrap truncate" title={row.vendor || row.contractor}>{row.vendor || row.contractor}</td>
                      <td className="px-2 py-2 whitespace-nowrap">{formatIndianCurrency(row.amount)}</td>
                      <td className="px-2 py-2 whitespace-nowrap truncate" title={row.category}>{row.category}</td>
                      <td className="px-2 py-2 whitespace-nowrap truncate" title={row.comments}>{row.comments}</td>
                      <td className="px-2 py-2 whitespace-nowrap truncate" title={row.source}>{row.source}</td>
                      <td
                        className={`px-2 py-2 font-semibold whitespace-nowrap ${((receivedAmounts[row.id] || 0) + (discountAmounts[row.id] || 0)) >= row.amount
                          ? "text-[#007233]"
                          : "text-[#E4572E]"
                          }`}
                      >
                        {((receivedAmounts[row.id] || 0) + (discountAmounts[row.id] || 0)) >= row.amount ? "Claimed" : "Not Claimed"}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">{row.eno}</td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {(() => {
                          const actualAmount = row.amount;
                          const received = receivedAmounts[row.id] || 0;
                          const discount = discountAmounts[row.id] || 0;
                          const isFullyPaid = (received + discount) >= actualAmount;
                          if (received === 0) {
                            return (
                              <button
                                onClick={() => handleOpenModal(row)}
                                className="border px-2 py-1 rounded-full bg-white hover:bg-gray-100 text-xs whitespace-nowrap"
                              >
                                To Receive
                              </button>
                            );
                          } else if (received > 0 && !isFullyPaid) {
                            return (
                              <span
                                onClick={() => handleOpenModal(row)}
                                className="px-2 py-1 rounded-full bg-[#FFD39E] text-black cursor-pointer text-xs whitespace-nowrap"
                              >
                                Received
                              </span>
                            );
                          } else if (isFullyPaid) {
                            return (
                              <span
                                onClick={() => handleOpenModal(row)}
                                className="px-2 py-1 rounded-full bg-[#E2F9E1] text-green-700 cursor-pointer text-xs whitespace-nowrap"
                              >
                                ✓ Received
                              </span>
                            );
                          }
                        })()}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {row.billCopy ? (
                          <a
                            href={row.billCopy}
                            className="text-red-500 underline text-xs"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          <span></span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white text-left rounded-xl p-6 w-[1100px] h-[740px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-center">
                {(remainingAmount - discount) <= 0 ? "Payment Status" : "Add Payment"}
              </h3>
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-10 h-full">
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                      {remainingAmount > 0 && (remainingAmount - discount) > 0 ? (
                        <div className="space-y-4 mb-4 justify-items-center overflow-y-auto">
                          <div className="border-2 border-[#BF9853] border-opacity-25 w-[600px] rounded-lg p-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <div className="relative">
                                  <input
                                    type="date"
                                    value={paymentPopupData.date}
                                    onChange={(e) => setPaymentPopupData(prev => ({ ...prev, date: e.target.value }))}
                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                <input
                                  type="number"
                                  value={paymentPopupData.amount}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const maxAllowed = remainingAmount - (discount || 0);
                                    if (val === '' || (Number(val) >= 0 && Number(val) <= maxAllowed)) {
                                      setPaymentPopupData(prev => ({ ...prev, amount: val }));
                                    }
                                  }}
                                  placeholder="Enter amount"
                                  className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none no-spinner"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                                <select
                                  value={paymentPopupData.paymentMode}
                                  onChange={(e) => setPaymentPopupData(prev => ({ ...prev, paymentMode: e.target.value }))}
                                  className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                >
                                  <option value="">---Select---</option>
                                  <option value="Cash">Cash</option>
                                  <option value="Gpay">Gpay</option>
                                  <option value="PhonePe">PhonePe</option>
                                  <option value="Net Banking">Net Banking</option>
                                  <option value="Cheque">Cheque</option>
                                  <option value="Invoice Payment">Invoice Payment</option>
                                </select>
                              </div>
                            </div>
                            {(paymentPopupData.paymentMode === "Gpay" || paymentPopupData.paymentMode === "PhonePe" ||
                              paymentPopupData.paymentMode === "Net Banking" || paymentPopupData.paymentMode === "Cheque") && (
                                <div className=" p-4">
                                  <div className="space-y-4">
                                    {paymentPopupData.paymentMode === "Cheque" && (
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No</label>
                                          <input
                                            type="text"
                                            value={paymentPopupData.chequeNo}
                                            onChange={(e) => setPaymentPopupData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                            placeholder="Enter cheque number"
                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date</label>
                                          <input
                                            type="date"
                                            value={paymentPopupData.chequeDate}
                                            onChange={(e) => setPaymentPopupData(prev => ({ ...prev, chequeDate: e.target.value }))}
                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                          />
                                        </div>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number</label>
                                        <input
                                          type="text"
                                          value={paymentPopupData.transactionNumber}
                                          onChange={(e) => setPaymentPopupData(prev => ({ ...prev, transactionNumber: e.target.value }))}
                                          placeholder="Enter transaction number"
                                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                                        <select
                                          value={paymentPopupData.accountNumber}
                                          onChange={(e) => setPaymentPopupData(prev => ({ ...prev, accountNumber: e.target.value }))}
                                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                        >
                                          <option value="">Select Account</option>
                                          {accountDetails.map((account) => (
                                            <option key={account.id} value={account.account_number}>
                                              {account.account_number}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                        </div>
                      )}
                      {claimPaymentsData.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium text-gray-700 mb-3 pl-4">Previous Payments : {claimPaymentsData.length}</h4>
                          <div className="mb-6 justify-items-center">
                            <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                              {claimPaymentsData.map((payment, index) => (
                                <div key={index} className="">
                                  <div className="border-2 border-[#BF9853] border-opacity-25 w-[600px] rounded-lg p-4 mb-4 no-scrollbar">
                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                        <input
                                          type="text"
                                          value={formatDateOnly(payment.date)}
                                          readOnly
                                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                        <input
                                          type="text"
                                          value={formatIndianCurrency(payment.amount)}
                                          readOnly
                                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                                        <div className="flex items-end gap-2">
                                          <input
                                            type="text"
                                            value={payment.payment_mode}
                                            readOnly
                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600"
                                          />
                                          {payment.payment_mode === "Cash" && (
                                            <button
                                              className={`w-20 h-[45px] rounded-lg text-white font-semibold 
                                                  ${payment.cash_register_status ? "bg-gray-400 cursor-not-allowed" : "bg-[#BF9853] hover:bg-[#a57f3f]"}`}
                                              disabled={payment.cash_register_status}
                                              onClick={async () => {
                                                if (payment.cash_register_status) return;
                                                try {
                                                  const res = await axios.get(
                                                    `https://backendaab.in/aabuildersDash/api/cash-register/get/${payment.claimPaymentsId}`
                                                  );
                                                  if (res.data && res.data.length > 0) {
                                                    alert("This payment is already in the cash register.");
                                                    return;
                                                  }
                                                  const cashRegisterPayload = {
                                                    claim_payments_id: payment.claimPaymentsId,
                                                    date: payment.date,
                                                    payment_mode: payment.payment_mode,
                                                    amount: payment.amount,
                                                    cash_register_status: true,
                                                  };
                                                  await axios.post(
                                                    "https://backendaab.in/aabuildersDash/api/cash-register/save",
                                                    cashRegisterPayload,
                                                    { headers: { "Content-Type": "application/json" } }
                                                  );
                                                  const paymentsReceivedPayload = {
                                                    date: payment.date,
                                                    amount: Number(payment.amount),
                                                    type: "Claim",
                                                    weekly_number: "",
                                                    status: false,
                                                  };
                                                  await axios.post(
                                                    "https://backendaab.in/aabuildersDash/api/payments-received/save",
                                                    paymentsReceivedPayload,
                                                    { headers: { "Content-Type": "application/json" } }
                                                  );
                                                  await axios.put(
                                                    `https://backendaab.in/aabuildersDash/api/claim_payments/update-status/${payment.claimPaymentsId}?status=true`
                                                  );
                                                  setClaimPaymentsData((prev) =>
                                                    prev.map((p, i) =>
                                                      i === index ? { ...p, cashRegisterStatus: true } : p
                                                    )
                                                  );
                                                  alert("Added to Cash Register, Payments Received & updated ClaimPayments ✅");
                                                } catch (err) {
                                                  console.error("Error adding payment:", err);
                                                  alert("Failed to add payment.");
                                                }
                                              }}
                                            >
                                              CR
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {(payment.payment_mode === "Gpay" || payment.payment_mode === "PhonePe" || 
                                      payment.payment_mode === "Net Banking" || payment.payment_mode === "Cheque") && (
                                        <div className="p-4">
                                          <div className="space-y-4">
                                            {payment.payment_mode === "Cheque" && (
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No</label>
                                                  <input
                                                    type="text"
                                                    value={payment.cheque_number || ""}
                                                    readOnly
                                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date</label>
                                                  <input
                                                    type="text"
                                                    value={payment.cheque_date ? formatDateOnly(payment.cheque_date) : ""}
                                                    readOnly
                                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600"
                                                  />
                                                </div>
                                              </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number</label>
                                                <input
                                                  type="text"
                                                  value={payment.transaction_number || ""}
                                                  readOnly
                                                  className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                                                <input
                                                  type="text"
                                                  value={payment.account_number || ""}
                                                  readOnly
                                                  className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-[400px] flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="text-left">
                        <h4 className="text-lg font-semibold mb-2">Summary</h4>
                        <div className="space-y-3 shadow-lg rounded-lg p-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Payable:</span>
                            <span className="font-semibold">{formatIndianCurrency(actualAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Received Amount:</span>
                            <span className="font-semibold">{formatIndianCurrency(actualAmount - remainingAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Carry Forward:</span>
                            <span className="font-semibold">0</span>
                          </div>
                          <hr className="border-gray-300" />
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-semibold">{formatIndianCurrency(actualAmount - (actualAmount - remainingAmount))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <input
                              type="text"
                              value={
                                discount === 0
                                  ? ''
                                  : discount.toLocaleString('en-IN') 
                              }
                              onChange={(e) => {
                                if (!discountSubmitted) {
                                  const rawValue = e.target.value.replace(/,/g, '').replace(/\D/g, '');
                                  const newDiscount = Number(rawValue) || 0;
                                  setDiscount(newDiscount);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (!discountSubmitted && e.key === 'Backspace' && discount === 0) {
                                  setDiscount('');
                                }
                              }}
                              disabled={discountSubmitted}
                              className={`w-24 h-6 px-2 no-spinner text-right text-xs border pl-4 border-gray-300 rounded focus:outline-none ${discountSubmitted ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                              placeholder="0"
                              title={
                                discountSubmitted
                                  ? 'Discount already applied in previous payment'
                                  : 'Enter discount amount'
                              }
                            />
                          </div>
                          <hr className="border-gray-300" />
                          <div className="flex justify-between">
                            <span className="text-gray-600">Net Payable:</span>
                            <span className={`font-bold ${(remainingAmount - discount) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatIndianCurrency(Math.max(0, remainingAmount - discount))}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <h4 className="text-lg font-semibold mb-2">Claim Details</h4>
                        <div className="space-y-3 shadow-lg rounded-lg p-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-semibold">{selectedRow ? formatDateOnly(selectedRow.date) : '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Project:</span>
                            <span className="font-semibold">{selectedRow ? selectedRow.siteName : '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-semibold">{selectedRow ? selectedRow.category : '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">E.No:</span>
                            <span className="font-semibold">{selectedRow ? selectedRow.eno : '-'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <h4 className="text-lg font-semibold mb-2">Payment Status</h4>
                        <div className="space-y-3 shadow-lg rounded-lg p-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-semibold ${remainingAmount === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                              {remainingAmount === 0 ? 'Fully Paid' : 'Partially Paid'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Progress:</span>
                            <span className="font-semibold">
                              {actualAmount > 0 ? Math.round(((actualAmount - remainingAmount) / actualAmount) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 p-4 bg-white border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setDiscount(0);
                    setDiscountSubmitted(false);
                    setPaymentPopupData({
                      date: new Date().toISOString().split('T')[0],
                      amount: "",
                      paymentMode: "",
                      chequeNo: "",
                      chequeDate: "",
                      transactionNumber: "",
                      accountNumber: ""
                    });
                  }}
                  className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg"
                >
                  Cancel
                </button>
                {(remainingAmount - discount) > 0 && (
                  <button
                    onClick={handleSavePayment}
                    className="px-4 py-2 bg-[#BF9853] text-white rounded-lg"
                  >
                    Submit
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setDiscount(0);
                  setDiscountSubmitted(false);
                }}
                className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-black"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </body>
  );
}
export default ClaimPaymentSummary