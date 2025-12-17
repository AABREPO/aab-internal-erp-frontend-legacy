import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Filter from '../Images/filter (3).png';

const ClaimPaymentClaimHistory = ({ username, userRoles = [] }) => {
  const [claimDataList, setClaimDataList] = useState([]);
  const [siteOption, setSiteOption] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [allPaymentsData, setAllPaymentsData] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc'); // Default to newest entered first
  const [showFilters, setShowFilters] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterProjectName, setFilterProjectName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

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
        const filteredData = data.filter(item => item.accountType === 'Claim'|| item.accountType === 'Bill Payments + Claim');
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

  // Fetch all payments with claim details
  useEffect(() => {
    const fetchAllPayments = async () => {
      if (claimDataList.length === 0) return;

      const allPayments = [];
      
      for (const claim of claimDataList) {
        try {
          const res = await fetch(`https://backendaab.in/aabuildersDash/api/claim_payments/get/${claim.id}`);
          const payments = await res.json();
          console.log("payments",payments);
          // Check if claim is fully paid
          const totalReceived = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          const totalDiscount = payments.reduce((sum, payment) => sum + (payment.discount_amount || 0), 0);
          const isFullyPaid = (totalReceived + totalDiscount) >= claim.amount;

          // Include all claims (both fully paid and partially paid)
          // Sort payments by date (latest first)
          const sortedPayments = payments.sort((a, b) => new Date(b.date) - new Date(a.date));
          
          // Combine claim data with each payment
          sortedPayments.forEach((payment, index) => {
            allPayments.push({
              ...payment,
              claimData: claim,
              entryNumber: sortedPayments.length - index,
              totalPayments: sortedPayments.length,
              isFullyPaid: isFullyPaid
            });
          });
        } catch (error) {
          console.error(`Error fetching payments for claim ${claim.id}`, error);
        }
      }
      console.log("allPayments",allPayments);
      setAllPaymentsData(allPayments);
    };

    fetchAllPayments();
  }, [claimDataList]);

  // Apply site filter
  const siteFilteredData = selectedSite
    ? allPaymentsData.filter(item => item.claimData.siteName === selectedSite.value)
    : allPaymentsData;

  // Apply additional filters
  const filteredDataWithFilters = siteFilteredData.filter((row) => {
    if (filterDate) {
      const [year, month, day] = filterDate.split("-");
      const formattedFilterDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
      const rowDate = formatDateOnly(row.date);
      if (rowDate !== formattedFilterDate) return false;
    }
    if (filterProjectName && row.claimData.siteName !== filterProjectName) return false;
    if (filterCategory && row.claimData.category !== filterCategory) return false;
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
    if (!sortColumn) {
      // Default sort: newest entries first (by claimPaymentsId descending - higher IDs at top)
      return (b.claimPaymentsId || b.id || 0) - (a.claimPaymentsId || a.id || 0);
    }
    let aValue, bValue;
    switch (sortColumn) {
      case 'entryId':
        aValue = a.id || 0;
        bValue = b.id || 0;
        break;
      case 'claimDate':
        aValue = new Date(a.claimData.date);
        bValue = new Date(b.claimData.date);
        break;
      case 'paymentDate':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'siteName':
        aValue = a.claimData.siteName || '';
        bValue = b.claimData.siteName || '';
        break;
      case 'partyName':
        aValue = a.claimData.vendor || a.claimData.contractor || '';
        bValue = b.claimData.vendor || b.claimData.contractor || '';
        break;
      case 'totalAmount':
        aValue = parseFloat(a.claimData.amount) || 0;
        bValue = parseFloat(b.claimData.amount) || 0;
        break;
      case 'paymentAmount':
        aValue = parseFloat(a.amount) || 0;
        bValue = parseFloat(b.amount) || 0;
        break;
      case 'category':
        aValue = a.claimData.category || '';
        bValue = b.claimData.category || '';
        break;
      case 'eno':
        aValue = a.claimData.eno || '';
        bValue = b.claimData.eno || '';
        break;
      case 'paymentMode':
        aValue = a.payment_mode || '';
        bValue = b.payment_mode || '';
        break;
      case 'enteredBy':
        aValue = a.entered_by || '';
        bValue = b.entered_by || '';
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

  console.log("sortedData",sortedData);
  console.log("filteredDataWithFilters",filteredDataWithFilters);
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
        <div className='h-[600px] bg-white mt-5 p-5 ml-10 mr-10'>
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
              <span className="ml-4 text-sm font-medium text-gray-600">
                Total Claimed Entries: <span className="font-bold text-[#007233]">{sortedData.length}</span>
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
            <div ref={scrollRef} className='overflow-auto max-h-[500px] thin-scrollbar' onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            >
              <table className="w-full border rounded-lg overflow-auto">
                <thead className="bg-[#FAF6ED] sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 whitespace-nowrap min-w-[80px]">S.No</th>
                    <th
                      className="px-6 py-3 whitespace-nowrap min-w-[130px] cursor-pointer hover:bg-[#d4edd6] select-none"
                      onClick={() => handleSort('claimDate')}
                    >
                      Claim Date {sortColumn === 'claimDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-6 py-3 whitespace-nowrap min-w-[180px] cursor-pointer hover:bg-[#d4edd6] select-none"
                      onClick={() => handleSort('siteName')}
                    >
                      Project Name {sortColumn === 'siteName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-6 py-3 whitespace-nowrap min-w-[160px] cursor-pointer hover:bg-[#d4edd6] select-none"
                      onClick={() => handleSort('partyName')}
                    >
                      Party Name {sortColumn === 'partyName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-6 py-3 whitespace-nowrap min-w-[150px] cursor-pointer hover:bg-[#d4edd6] select-none"
                      onClick={() => handleSort('totalAmount')}
                    >
                      Claim Amount {sortColumn === 'totalAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-6 py-3 whitespace-nowrap min-w-[130px] cursor-pointer hover:bg-[#d4edd6] select-none"
                      onClick={() => handleSort('category')}
                    >
                      Category {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-6 py-3 whitespace-nowrap min-w-[100px] cursor-pointer hover:bg-[#d4edd6] select-none"
                      onClick={() => handleSort('eno')}
                    >
                      E.No {sortColumn === 'eno' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-6 py-3 whitespace-nowrap min-w-[150px] cursor-pointer hover:bg-[#d4edd6] select-none"
                      onClick={() => handleSort('paymentDate')}
                    >
                      Payment Date {sortColumn === 'paymentDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-6 py-3 whitespace-nowrap min-w-[160px] cursor-pointer hover:bg-[#d4edd6] select-none"
                      onClick={() => handleSort('paymentAmount')}
                    >
                      Payment Amount {sortColumn === 'paymentAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 whitespace-nowrap min-w-[120px]">Discount</th>
                    <th
                      className="px-6 py-3 whitespace-nowrap min-w-[150px] cursor-pointer hover:bg-[#d4edd6] select-none"
                      onClick={() => handleSort('paymentMode')}
                    >
                      Payment Mode {sortColumn === 'paymentMode' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 whitespace-nowrap min-w-[130px]">Cheque No</th>
                    <th className="px-6 py-3 whitespace-nowrap min-w-[140px]">Cheque Date</th>
                    <th className="px-6 py-3 whitespace-nowrap min-w-[150px]">Transaction No</th>
                    <th className="px-6 py-3 whitespace-nowrap min-w-[140px]">Account No</th>
                    <th
                      className="px-6 py-3 whitespace-nowrap min-w-[130px] cursor-pointer hover:bg-[#d4edd6] select-none"
                      onClick={() => handleSort('enteredBy')}
                    >
                      Entered By {sortColumn === 'enteredBy' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 whitespace-nowrap min-w-[110px]">View Bill</th>
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
                          options={[...new Set(allPaymentsData.map(item => item.claimData.siteName))].map(siteName => ({
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
                            menuPortal: (provided) => ({
                              ...provided,
                              zIndex: 9999,
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
                              backgroundColor: state.isFocused ? 'rgba(0, 114, 51, 0.1)' : 'white',
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
                      <th className="pt-2 pb-2">
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="p-1 rounded-md bg-transparent w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                          placeholder="Category..."
                        >
                          <option value=''>Select Category...</option>
                          {[...new Set(allPaymentsData.map(item => item.claimData.category))].map(category => (
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
                  {sortedData.map((row, index) => (
                    <tr key={index} className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF] font-bold text-[13px]`}>
                      <td className="px-6 py-3 whitespace-nowrap">{index + 1}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{formatDateOnly(row.claimData.date)}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{row.claimData.siteName}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{row.claimData.vendor || row.claimData.contractor}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{formatIndianCurrency(row.claimData.amount)}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{row.claimData.category}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{row.claimData.eno}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{formatDateOnly(row.date)}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{formatIndianCurrency(row.amount)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-orange-600">
                        {row.discount_amount > 0 ? formatIndianCurrency(row.discount_amount) : '-'}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">{row.payment_mode}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{row.cheque_number || '-'}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {row.cheque_date ? formatDateOnly(row.cheque_date) : '-'}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">{row.transaction_number || '-'}</td>
                      <td className="px-6 py-3 whitespace-nowrap">{row.account_number || '-'}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-[#007233]">{row.entered_by || '-'}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {row.claimData.billCopy ? (
                          <a
                            href={row.claimData.billCopy}
                            className="text-red-500 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </body>
  );
}

export default ClaimPaymentClaimHistory;
