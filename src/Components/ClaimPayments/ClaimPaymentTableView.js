import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Filter from '../Images/filter (3).png';

const ClaimPaymentTableView = ({ username, userRoles = [] }) => {
  const [claimDataList, setClaimDataList] = useState([]);
  const [siteOption, setSiteOption] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [receivedAmounts, setReceivedAmounts] = useState({});
  const [discountAmounts, setDiscountAmounts] = useState({});
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc'); // Default to newest first
  const [showFilters, setShowFilters] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterProjectName, setFilterProjectName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [claimPaymentsData, setClaimPaymentsData] = useState([]);

  // Drag and scroll functionality
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });

  // Fetch claim data
  useEffect(() => {
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

  // Fetch sites
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

  const filteredData = selectedSite
    ? claimDataList.filter(item => item.siteName === selectedSite.value)
    : claimDataList;

  // Fetch received amounts and discounts
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

  // Apply additional filters (showing all data, not just fully received)
  const filteredDataWithFilters = filteredData.filter((row) => {
    if (filterDate) {
      const [year, month, day] = filterDate.split("-");
      const formattedFilterDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
      const rowDate = formatDateOnly(row.date);
      if (rowDate !== formattedFilterDate) return false;
    }
    if (filterProjectName && row.siteName !== filterProjectName) return false;
    if (filterCategory && row.category !== filterCategory) return false;
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
  };

  const handleViewDetails = async (row) => {
    setSelectedRow(row);
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/claim_payments/get/${row.id}`);
      const claimPayments = await response.json();
      setClaimPaymentsData(claimPayments);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching claim payments:", error);
    }
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
        <div className=' bg-white h-[130px] rounded ml-10 mr-10'>
          <div className="text-left p-7 ml-10">
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
              <button className='pl-2' onClick={() => setShowFilters(!showFilters)}>
                <img
                  src={Filter}
                  alt="Toggle Filter"
                  className="w-7 h-7 border border-[#BF9853] rounded-md ml-3"
                />
              </button>
              <span className="ml-4 text-sm font-medium text-gray-600">
                Total Entries: <span className="font-bold text-[#BF9853]">{sortedData.length}</span>
              </span>
            </div>
            {(filterDate || filterProjectName || filterCategory) && (
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
              <table className="w-full border rounded-lg">
                <thead className="bg-[#FAF6ED] sticky top-0 z-90">
                  <tr>
                    <th className="px-2 py-2 sticky top-0 bg-[#FAF6ED] z-20">S.No</th>
                    <th
                      className="px-2 text-left py-2 cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('date')}
                    >
                      Date {sortColumn === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 text-left cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('siteName')}
                    >
                      Project Name {sortColumn === 'siteName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 text-left cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('partyName')}
                    >
                      Party Name {sortColumn === 'partyName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 text-left cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('amount')}
                    >
                      Amount {sortColumn === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 text-left cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('category')}
                    >
                      Category {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 text-left cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('comments')}
                    >
                      Comments {sortColumn === 'comments' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 text-left cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('source')}
                    >Source {sortColumn === 'source' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-4 py-2 sticky top-0 bg-[#FAF6ED] z-20">Status</th>
                    <th
                      className="px-4 py-2 cursor-pointer hover:bg-[#f0e6d2] select-none sticky top-0 bg-[#FAF6ED] z-20"
                      onClick={() => handleSort('eno')}
                    >
                      E.No {sortColumn === 'eno' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 sticky top-0 bg-[#FAF6ED] z-20">View</th>
                    <th className="px-4 py-2 sticky top-0 bg-[#FAF6ED] z-20">Details</th>
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
                          options={[...new Set(filteredData.map(item => item.siteName))].map(siteName => ({
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
                      <th className="pt-2 pb-2"></th>
                      <th className="pt-2 pb-2 text-left">
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="p-1 rounded-md bg-transparent w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                          placeholder="Category..."
                        >
                          <option value=''>Select Category...</option>
                          {[...new Set(filteredData.map(item => item.category))].map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </th>
                      <th className="pt-2 pb-2"></th>
                      <th className="pt-2 pb-2"></th>
                      <th className="pt-2 pb-2"></th>
                      <th className="pt-2 pb-2"></th>
                      <th className="pt-2 pb-2"></th>
                      <th className="pt-2 pb-2"></th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {sortedData.map((row, index) => {
                    const received = receivedAmounts[row.id] || 0;
                    const discount = discountAmounts[row.id] || 0;
                    const isClaimed = (received + discount) >= row.amount;
                    return (
                      <tr key={index} className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF] font-bold text-[14px]`}>
                        <td className="px-2 py-2">{index + 1}</td>
                        <td className="px-2 py-2">{formatDateOnly(row.date)}</td>
                        <td className="px-2 py-2 text-left">{row.siteName}</td>
                        <td className="px-2 py-2 text-left">{row.vendor || row.contractor}</td>
                        <td className="px-2 py-2">{formatIndianCurrency(row.amount)}</td>
                        <td className="px-2 py-2 text-left">{row.category}</td>
                        <td className="px-2 py-2 text-left">{row.comments}</td>
                        <td className="px-2 py-2 text-left">{row.source}</td>
                        <td className={`px-2 py-2 font-semibold ${isClaimed ? 'text-[#007233]' : 'text-[#E4572E]'}`}>
                          {isClaimed ? '✓ Claimed' : 'Not Claimed'}
                        </td>
                        <td className="px-4 py-2">{row.eno}</td>
                        <td className="px-4 py-2">
                          {row.billCopy ? (
                            <a
                              href={row.billCopy}
                              className="text-red-500 underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          ) : (
                            <span></span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <button onClick={() => handleViewDetails(row)} className="border px-3 py-1 rounded-full bg-[#BF9853] text-white hover:bg-[#a57f3f]">
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Details Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white text-left rounded-xl p-6 w-[900px] max-h-[700px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-center">Claim Payment Details</h3>
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {/* Claim Information */}
                  <div className="border-2 border-[#BF9853] border-opacity-25 rounded-lg p-4">
                    <h4 className="text-md font-semibold mb-3 text-[#BF9853]">Claim Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600 text-sm">Date:</span>
                        <p className="font-semibold">{formatDateOnly(selectedRow.date)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Project:</span>
                        <p className="font-semibold">{selectedRow.siteName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Party Name:</span>
                        <p className="font-semibold">{selectedRow.vendor || selectedRow.contractor}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Category:</span>
                        <p className="font-semibold">{selectedRow.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Total Amount:</span>
                        <p className="font-semibold text-[#BF9853]">{formatIndianCurrency(selectedRow.amount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">E.No:</span>
                        <p className="font-semibold">{selectedRow.eno}</p>
                      </div>
                      {selectedRow.comments && (
                        <div className="col-span-2">
                          <span className="text-gray-600 text-sm">Reason:</span>
                          <p className="font-semibold">{selectedRow.comments}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Payment History */}
                  <div>
                    <h4 className="text-md font-semibold mb-3 text-[#BF9853]">Payment History ({claimPaymentsData.length})</h4>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto">
                      {claimPaymentsData.map((payment, index) => (
                        <div key={index} className="border-2 border-[#BF9853] border-opacity-25 rounded-lg p-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <span className="text-gray-600 text-sm">Date:</span>
                              <p className="font-semibold">{formatDateOnly(payment.date)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 text-sm">Amount:</span>
                              <p className="font-semibold">{formatIndianCurrency(payment.amount)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 text-sm">Mode:</span>
                              <p className="font-semibold">{payment.payment_mode}</p>
                            </div>
                            {payment.discount_amount > 0 && (
                              <div>
                                <span className="text-gray-600 text-sm">Discount:</span>
                                <p className="font-semibold text-orange-600">{formatIndianCurrency(payment.discount_amount)}</p>
                              </div>
                            )}
                            {payment.cheque_number && (
                              <>
                                <div>
                                  <span className="text-gray-600 text-sm">Cheque No:</span>
                                  <p className="font-semibold">{payment.cheque_number}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 text-sm">Cheque Date:</span>
                                  <p className="font-semibold">{formatDateOnly(payment.cheque_date)}</p>
                                </div>
                              </>
                            )}
                            {payment.transaction_number && (
                              <div>
                                <span className="text-gray-600 text-sm">Transaction No:</span>
                                <p className="font-semibold">{payment.transaction_number}</p>
                              </div>
                            )}
                            {payment.account_number && (
                              <div>
                                <span className="text-gray-600 text-sm">Account No:</span>
                                <p className="font-semibold">{payment.account_number}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-[#BF9853] text-white rounded-lg hover:bg-[#a57f3f]">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </body>
  )
}
export default ClaimPaymentTableView