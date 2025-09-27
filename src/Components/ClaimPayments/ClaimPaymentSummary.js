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
  const [mainMode, setMainMode] = useState('');
  const [receivedAmounts, setReceivedAmounts] = useState({});
  const [actualAmount, setActualAmount] = useState(0);
  const [collectedAmount, setCollectedAmount] = useState(0);
  const [claimPaymentsData, setClaimPaymentsData] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterProjectName, setFilterProjectName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Drag and scroll functionality
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });


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
        const filteredData = data.filter(item => item.accountType === 'Claim');
        console.log("Filtered data:", filteredData);
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
          sNo: item.siteNo
        }));
        setSiteOption(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);
  const filteredData = selectedSite
    ? claimDataList.filter(item => item.siteName === selectedSite.value)
    : claimDataList;
  useEffect(() => {
    const fetchReceivedAmounts = async () => {
      const amounts = {};

      for (const row of filteredData) {
        try {
          const res = await fetch(`https://backendaab.in/aabuildersDash/api/claim_payments/get/${row.id}`);
          const payments = await res.json();

          const totalReceived = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          amounts[row.id] = totalReceived;
        } catch (error) {
          console.error(`Error fetching payments for row ${row.id}`, error);
          amounts[row.id] = 0;
        }
      }

      setReceivedAmounts(amounts);
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
  };
  useEffect(() => {
    if (selectedRow) {
      // Use mainInputAmount if it exists (updated amount), otherwise use original amount
      const baseAmount = selectedRow.mainInputAmount !== undefined ? selectedRow.mainInputAmount : selectedRow.amount;
      setPopupAmount(baseAmount || "");
    }
  }, [selectedRow]);

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];  // "YYYY-MM-DD"
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
      setPopupAmount(remaining > 0 ? remaining : 0); // Prefill but editable
      setClaimPaymentsData(claimPayments);
      setMainMode(""); // no default
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching claim payments:", error);
    }
  };
  const handleSavePayment = async () => {
    if (!mainMode) {
      alert("Please select a payment mode.");
      return;
    }
    const newPayment = {
      entered_by: username, // or from login context
      expenses_claim_id: selectedRow.expenses_claim_id ?? selectedRow.id,
      payment_mode: mainMode,
      date: mainDate,
      amount: popupAmount,
      cash_register_status: false,
    };

    try {
      const response = await fetch("https://backendaab.in/aabuildersDash/api/claim_payments/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayment),
      });

      if (response.ok) {
        alert("Payment saved successfully!");
        window.location.reload();
        setShowModal(false);
        // Optionally refresh table or data
      } else {
        alert("Failed to save payment.");
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      alert("Error occurred while saving payment.");
    }
  };

  // Show all data instead of just unclaimed data
  const allData = filteredData;

  // Apply filters to the data
  const filteredDataWithFilters = allData.filter((row) => {
    // Date filter
    if (filterDate) {
      const [year, month, day] = filterDate.split("-");
      const formattedFilterDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
      const rowDate = formatDateOnly(row.date);
      if (rowDate !== formattedFilterDate) return false;
    }

    // Project Name filter
    if (filterProjectName && row.siteName !== filterProjectName) return false;

    // Category filter
    if (filterCategory && row.category !== filterCategory) return false;

    // Status filter
    if (filterStatus) {
      const received = receivedAmounts[row.id] || 0;
      const isClaimed = received >= row.amount;
      const statusText = isClaimed ? 'Claimed' : 'Not Claimed';
      if (statusText !== filterStatus) return false;
    }

    return true;
  });

  // Sorting function
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort the data
  const sortedData = [...filteredDataWithFilters].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aValue, bValue;
    
    switch (sortColumn) {
      case 'sno':
        return sortDirection === 'asc' ? 0 : 0; // S.No doesn't need sorting
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

  const clearAllFilters = () => {
    setFilterDate('');
    setFilterProjectName('');
    setFilterCategory('');
    setFilterStatus('');
  };

  // Drag and scroll event handlers
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
        <div className='w-[1700px] bg-white h-[130px] rounded ml-10'>
          <div className=" text-left p-7 ml-10">
            <label className="font-semibold mr-2 block mb-2">Project Name</label>
            <Select
              options={sortedSiteOptions || []}
              placeholder="Select a site..."
              isSearchable={true}
              value={selectedSite}
              onChange={setSelectedSite} // local only — won't affect Advance Page
              styles={customStyles}
              isClearable
              className="w-[380px] h-[45px] focus:outline-none"
            />
          </div>
        </div>
        <div className='w-[1700px] bg-white mt-5 p-5 ml-10'>
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
            {/* Filter Chips */}
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
            <div
              ref={scrollRef}
              className='overflow-auto max-h-[600px] thin-scrollbar'
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <table className="w-full border rounded-lg overflow-hidden">
              <thead className="bg-[#FAF6ED]">
                <tr>
                  <th className="px-4 py-2">S.No</th>
                  <th 
                    className="px-4 py-2 cursor-pointer hover:bg-[#f0e6d2] select-none"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortColumn === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer hover:bg-[#f0e6d2] select-none"
                    onClick={() => handleSort('siteName')}
                  >
                    Project Name {sortColumn === 'siteName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer hover:bg-[#f0e6d2] select-none"
                    onClick={() => handleSort('amount')}
                  >
                    Amount {sortColumn === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer hover:bg-[#f0e6d2] select-none"
                    onClick={() => handleSort('category')}
                  >
                    Category {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer hover:bg-[#f0e6d2] select-none"
                    onClick={() => handleSort('comments')}
                  >
                    Reason {sortColumn === 'comments' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer hover:bg-[#f0e6d2] select-none"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortColumn === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer hover:bg-[#f0e6d2] select-none"
                    onClick={() => handleSort('eno')}
                  >
                    E.No {sortColumn === 'eno' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-2">Activity</th>
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
                  </tr>
                )}
              </thead>
              <tbody>
                {sortedData.map((row, index) => (
                  <tr key={index} className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF] font-bold text-[14px]`}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{formatDateOnly(row.date)}</td>
                    <td className="px-4 py-2">{row.siteName}</td>
                    <td className="px-4 py-2">{formatIndianCurrency(row.amount)}</td>
                    <td className="px-4 py-2">{row.category}</td>
                    <td className="px-4 py-2">{row.comments}</td>
                    <td
                      className={`px-4 py-2 font-semibold ${(receivedAmounts[row.id] || 0) >= row.amount
                        ? "text-[#007233]"
                        : "text-[#E4572E]"
                        }`}
                    >
                      {(receivedAmounts[row.id] || 0) >= row.amount ? "Claimed" : "Not Claimed"}
                    </td>
                    <td className="px-4 py-2">{row.eno}</td>
                    <td className="px-4 py-2">
                      {(() => {
                        const actualAmount = row.amount;
                        const received = receivedAmounts[row.id] || 0;

                        if (received === 0) {
                          return (
                            <button
                              onClick={() => handleOpenModal(row)}
                              className="border px-3 py-1 rounded-full bg-white hover:bg-gray-100"
                            >
                              To Receive
                            </button>
                          );
                        } else if (received > 0 && received < actualAmount) {
                          return (
                            <span
                              onClick={() => handleOpenModal(row)}
                              className="px-3 py-1 rounded-full bg-[#FFD39E] text-black cursor-pointer"
                            >
                              Received
                            </span>
                          );
                        } else if (received >= actualAmount) {
                          return (
                            <span
                              onClick={() => handleOpenModal(row)}
                              className="px-3 py-1 rounded-full bg-[#E2F9E1] text-green-700 cursor-pointer"
                            >
                              ✓ Received
                            </span>
                          );
                        }
                      })()}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-[700px] relative shadow-xl">
              {/* Title */}
              <h2 className="text-xl font-semibold mb-6 text-center">Entry Payment Details</h2>

              {/* Previous Payments */}
              {claimPaymentsData.length > 0 ? (
                claimPaymentsData.map((payment, idx) => (
                  <div key={idx} className="flex gap-4 mb-4">
                    {/* Date */}
                    <div className="flex flex-col text-left w-[168px]">
                      <label className="mb-1 font-bold">Date</label>
                      <input
                        type="text"
                        value={formatDateOnly(payment.date)}
                        readOnly
                        className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2 "
                      />
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col text-left w-[168px]">
                      <label className="mb-1 font-bold">Amount</label>
                      <input
                        type="text"
                        value={formatIndianCurrency(payment.amount)}
                        readOnly
                        className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2 "
                      />
                    </div>

                    {/* Mode */}
                    <div className="flex flex-col text-left w-[168px]">
                      <label className="mb-1 font-bold">Mode</label>
                      <input
                        type="text"
                        value={payment.payment_mode}
                        readOnly
                        className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2 "
                      />
                    </div>

                    {/* CR Button (only for Cash mode) */}
                    {payment.payment_mode === "Cash" && (
                        <button
                          className={`w-20 h-[45px] mr-1 rounded-lg text-white font-semibold 
                              ${payment.cash_register_status ? "bg-gray-400 cursor-not-allowed" : "bg-[#BF9853]"}`}
                          disabled={payment.cash_register_status}
                          onClick={async () => {
                            if (payment.cash_register_status) return;
                            try {
                              //Check if already exists in backend
                              const res = await axios.get(
                                `https://backendaab.in/aabuildersDash/api/cash-register/get/${payment.claimPaymentsId}`
                              );
                              if (res.data && res.data.length > 0) {
                                alert("This payment is already in the cash register.");
                                return;
                              }
                              //Save to Cash Register
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
                              //Save to Payments Received
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
                              //Update ClaimPayments.cashRegisterStatus → true
                              await axios.put(
                                `https://backendaab.in/aabuildersDash/api/claim_payments/update-status/${payment.claimPaymentsId}?status=true`
                              );
                              // Update UI immediately
                              setClaimPaymentsData((prev) =>
                                prev.map((p, i) =>
                                  i === idx ? { ...p, cashRegisterStatus: true } : p
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
                ))
              ) : (
                <p className="text-sm text-gray-500 mb-4">No previous payments found.</p>
              )}
              {/* New Entry */}
              <div className="flex gap-4 mb-6">
                {/* Date */}
                <div className="flex flex-col text-left w-[168px]">
                  <label className="mb-1 font-bold">Date</label>
                  <input
                    type="date"
                    value={mainDate}
                    onChange={(e) => setMainDate(e.target.value)}
                    className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2"
                  />
                </div>

                {/* Amount */}
                <div className="flex flex-col text-left w-[168px]">
                  <label className="mb-1 font-bold">Amount</label>
                  <input
                    type="number"
                    value={popupAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 0 && val <= remainingAmount) {
                        setPopupAmount(val);
                      }
                    }}
                    placeholder="Enter amount"
                    className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2"
                  />
                </div>

                {/* Mode */}
                <div className="flex flex-col text-left w-[168px]">
                  <label className="mb-1 font-bold">Mode</label>
                  <select
                    value={mainMode}
                    onChange={(e) => setMainMode(e.target.value)}
                    className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2"
                  >
                    <option value="">Select Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="G-pay">G-pay</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              {/* Save Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleSavePayment}
                  className="bg-[#BF9853] text-white w-[114px] h-[36px] rounded hover:bg-[#a57f3f]"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="border border-[#BF9853] text-[#BF9853] w-[114px] h-[36px] rounded hover:bg-[#f9f5ef]"
                >
                  Cancel
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
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