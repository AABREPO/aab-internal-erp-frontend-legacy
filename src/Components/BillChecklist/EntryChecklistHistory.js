import React, { useState, useEffect, useRef } from 'react';
import Select from "react-select";
import axios from 'axios';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
import fileDownload from '../Images/file_download.png'
const History = () => {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [selectedChecklist, setSelectedChecklist] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedChecklistNumber, setSelectedChecklistNumber] = useState(null);
    const [clickedChecklistNumber, setClickedChecklistNumber] = useState(null);
    const [selectedChecklistNo, setSelectedChecklistNo] = useState('');
    const [entriesCount, setEntriesCount] = useState(0);
    const [availableYears, setAvailableYears] = useState([]);
    const [checklistUrls, setChecklistUrls] = useState([]);
    const [sortedExpenses, setSortedExpenses] = useState([]);
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [entryDate, setEntryDate] = useState('');
    const [checklistNumbers, setChecklistNumbers] = useState([]);
    const [filteredChecklistNumbers, setFilteredChecklistNumbers] = useState([]);
    const [audits, setAudits] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });

    const handleMouseDown = (e) => {
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
        if (!isDragging.current) return;

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
        if (!isDragging.current) return;
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
        const friction = 0.95;
        const minVelocity = 0.1;

        const step = () => {
            const { x, y } = velocity.current;
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

    useEffect(() => {
        return () => cancelMomentum();
    }, []);
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderWidth: '4px',
            borderRadius: '8px',
            borderColor: state.isFocused ? '#FAF6ED' : '#FAF6ED',
            boxShadow: state.isFocused ? '0 0 0 1px #FAF6ED' : 'none',
            '&:hover': {
                borderColor: '#FAF6ED',
            }
        }),
    };
    useEffect(() => {
        axios
            .get('https://backendaab.in/aabuilderDash/expenses_form/get_form')
            .then((response) => {
                const sortedExpenses = response.data.sort((a, b) => {
                    const enoA = parseInt(a.eno, 10);
                    const enoB = parseInt(b.eno, 10);
                    return enoB - enoA; // descending order
                });
                const uniqueChecklistNumbers = new Set(sortedExpenses.map(item => item.dailyChecklistNo));
                // Update state for the checklist numbers with only unique values
                setChecklistNumbers(uniqueChecklistNumbers);
                setExpenses(sortedExpenses);
                const years = Array.from(new Set(
                    sortedExpenses.map(exp => new Date(exp.timestamp).getFullYear())
                ));
                setAvailableYears(years.sort((a, b) => b - a));
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
            });
    }, []);
    useEffect(() => {
        axios
            .get('https://backendaab.in/aabuilderDash/api/account_type/daily_checklist')
            .then((response) => {
                const sortedExpenses = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                const uniqueUrls = [
                    ...new Set(
                        sortedExpenses.map((expense) => expense.entryChecklistUrl)
                    ),
                ];
                console.log(sortedExpenses);
                setSortedExpenses(sortedExpenses);
                setChecklistUrls(uniqueUrls);
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
            });
    }, []);
    const handleChecklistChange = (e) => {
        const selectedChecklist = e.value;
        setSelectedChecklistNo(selectedChecklist);

        const filtered = expenses.filter(exp => exp.dailyChecklistNo === selectedChecklist);
        setFilteredExpenses(filtered);

        if (filtered.length > 0) {
            const timestamp = new Date(filtered[0].timestamp);
            setYear(timestamp.getFullYear());
            setMonth(timestamp.toLocaleString('default', { month: 'long' }));
            setEntryDate(timestamp.toISOString().split('T')[0]); // yyyy-mm-dd
            setEntriesCount(filtered.length);
        }
    };
    const handleYearChange = (e) => {
        const selectedYear = e.target.value;
        setYear(selectedYear);
        filterChecklistByYearMonth(selectedYear, month);
    };

    const handleMonthChange = (e) => {
        const selectedMonth = e.target.value;
        setMonth(selectedMonth);
        filterChecklistByYearMonth(year, selectedMonth);
    };
    useEffect(() => {
        if (expenses && expenses.length > 0) {
            const allChecklistNos = [...new Set(expenses.map(exp => exp.dailyChecklistNo))];
            setChecklistNumbers(allChecklistNos); // this is your full source
            setFilteredChecklistNumbers(allChecklistNos); // default = same
        }
    }, [expenses]);

    const filterChecklistByYearMonth = (selectedYear, selectedMonth) => {
        // If no year and no month selected, return all checklist numbers
        if (!selectedYear && !selectedMonth) {
            const allChecklistNos = [...new Set(expenses.map(exp => exp.dailyChecklistNo))];
            setFilteredChecklistNumbers(allChecklistNos);
            return;
        }
        // Otherwise, filter based on year and/or month
        const filtered = expenses.filter(exp => {
            const timestamp = new Date(exp.timestamp);
            const expYear = timestamp.getFullYear();
            const expMonth = timestamp.toLocaleString('default', { month: 'long' });
            return (
                (!selectedYear || expYear.toString() === selectedYear.toString()) &&
                (!selectedMonth || expMonth === selectedMonth)
            );
        });
        const uniqueChecklistNos = [...new Set(filtered.map(exp => exp.dailyChecklistNo))];
        setFilteredChecklistNumbers(uniqueChecklistNos);
    };
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderWidth: '4px',
            borderRadius: '8px',
            borderColor: state.isFocused ? '#FAF6ED' : '#FAF6ED',
            boxShadow: state.isFocused ? '0 0 0 1px #FAF6ED' : 'none',
            '&:hover': {
                borderColor: '#FAF6ED',
            }
        }),
    };
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const fetchAuditDetails = async (expenseId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuilderDash/expenses_form/audit/${expenseId}`);
            const data = await response.json();
            setAudits(data);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    // Ensure checklist arrays are safe to map over
    const isYearOrMonthSelected = year || month;
    const safeChecklistOptions = Array.isArray(isYearOrMonthSelected ? filteredChecklistNumbers : checklistNumbers)
        ? (isYearOrMonthSelected ? filteredChecklistNumbers : checklistNumbers)
        : [];
    const options = safeChecklistOptions
        .filter(checklistNo => checklistNo !== null && checklistNo !== undefined && checklistNo !== '')
        .map(checklistNo => ({
            value: checklistNo,
            label: checklistNo
        }));
    return (
        <body>
            <div className=" bg-[#FAF6ED]">
                <div className=" mx-auto lg:w-[1800px] lg:h-[128px] p-4 border-collapse bg-[#FFFFFF] ml-9 mr-6 rounded-md">
                    <div className="w-full p-4">
                        <div className="grid grid-cols-2 lg:grid-cols-[110px_149px_169px_168px_149px] gap-4">
                            {/* Year */}
                            <div className="flex flex-col">
                                <label className="text-base font-semibold mb-1 text-left">Year</label>
                                <select value={year} onChange={handleYearChange}
                                    className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg px-3 py-2 w-[110px] h-[45px] focus:outline-none">
                                    <option value="">Select</option>
                                    {availableYears.map((yr) => (
                                        <option key={yr} value={yr}>{yr}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Month */}
                            <div className="flex flex-col">
                                <label className="text-base font-semibold mb-1 text-left">Month</label>
                                <select value={month} onChange={handleMonthChange}
                                    className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg px-3 py-2 w-[149px] h-[45px] focus:outline-none"
                                >
                                    <option value="">Select Month</option>
                                    <option>January</option>
                                    <option>February</option>
                                    <option>March</option>
                                    <option>April</option>
                                    <option>May</option>
                                    <option>June</option>
                                    <option>July</option>
                                    <option>August</option>
                                    <option>September</option>
                                    <option>October</option>
                                    <option>November</option>
                                    <option>December</option>
                                </select>
                            </div>
                            {/* Entry Check List */}
                            <div className="flex flex-col">
                                <label className="text-base font-semibold mb-1 text-left">Entry Check List</label>
                                <Select
                                    id="checklistDropdown"
                                    value={options.find(option => option.value === selectedChecklistNo)}  // Find the selected option
                                    onChange={handleChecklistChange}
                                    options={options}
                                    styles={customStyles}
                                    className=" px-3 py-2 w-[169px] h-[45px] -mt-2 focus:outline-none -ml-3"
                                    placeholder=""
                                />
                            </div>
                            {/* Entry Date */}
                            <div className="flex flex-col">
                                <label className="text-base font-semibold mb-1 text-left">Entry Date</label>
                                <input type="date" value={entryDate}
                                    className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg px-3 py-2 w-[168px] h-[45px] focus:outline-none" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Main Content */}
                <div className="flex flex-col lg:flex-row ml-9 gap-10 mt-5">
                    <div className="bg-white rounded-lg shadow p-4 lg:w-[693px] h-[610px] space-y-2 overflow-auto">
                        {checklistUrls.length > 0 ? (
                            <table className="table-auto w-full border-collapse">
                                <thead>
                                </thead>
                                <tbody>
                                    {[...new Map(
                                        sortedExpenses
                                            .filter(exp => exp.checklistNumber)
                                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // newest first
                                            .map(item => [item.checklistNumber, item]) // convert to [key, value] pairs for Map
                                    ).values()] // get unique checklistNumbers
                                        .map((checklistData, index) => {
                                            const { checklistNumber, timestamp, entryChecklistUrl } = checklistData;
                                            const formattedDate = timestamp
                                                ? new Date(new Date(timestamp).getTime() - 330 * 60000).toLocaleDateString('en-GB')
                                                : '';
                                            const serialNumber = (index + 1).toString().padStart(2, '0');

                                            return (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 font-bold">{serialNumber}</td>
                                                    <td>
                                                        <div className='flex space-x-4'>
                                                            <img className='w-5 h-5 font-bold' src={fileDownload} alt='' />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    const matchingEntries = sortedExpenses.filter(
                                                                        (expense) => expense.checklistNumber === checklistNumber
                                                                    );
                                                                    setSelectedChecklist(matchingEntries);
                                                                    setSelectedDate(formattedDate);
                                                                    setSelectedChecklistNumber(checklistNumber);
                                                                    setClickedChecklistNumber(checklistNumber);
                                                                    if (entryChecklistUrl) {
                                                                        window.open(entryChecklistUrl, '_blank');
                                                                    }
                                                                }}
                                                                className="underline font-semibold"
                                                                style={{
                                                                    color:
                                                                        clickedChecklistNumber === checklistNumber
                                                                            ? '#ef6f47'
                                                                            : 'black',
                                                                }}
                                                            >
                                                                {checklistNumber} - {formattedDate} Checklist
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="flex w-[100px] space-x-4 py-2">
                                                        <button className="rounded-full transition duration-200 ml-2 mr-3">
                                                            <img
                                                                src={edit}
                                                                alt="Edit"
                                                                className="w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200"
                                                            />
                                                        </button>
                                                        <button className="-ml-5 -mr-2">
                                                            <img
                                                                src={remove}
                                                                alt='delete'
                                                                className='w-4 h-5 transform hover:scale-110 hover:brightness-110 transition duration-200'
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        ) : (
                            <p>No checklist URLs available</p>
                        )}
                    </div>
                    {/* Right: Entry Detail */}
                    <div className="bg-white rounded-lg shadow p-4 w-full max-w-[1066px] lg:h-[610px] ">
                        <div>
                            <h1 className="text-2xl font-bold">Entry Check List</h1>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center sm:space-x-3">
                            <div className="flex justify-between items-start w-full sm:w-auto">
                                <div className="ml-5">
                                    <div className="text-base font-medium mt-3 flex">
                                        <label>Entry No:</label>
                                        <div className="text-[#ef6f47]">{selectedChecklistNumber}</div>
                                    </div>
                                    <div className="text-base font-medium ml-7 mt-3 flex">
                                        <label>Date:</label>
                                        <div className="text-[#ef6f47]">{selectedDate}</div>
                                    </div>
                                </div>
                                {/* Only show on mobile inline */}
                                <div className="block sm:hidden mr-5">
                                    <div className="text-[#ef6f47] rounded text-sm font-bold">
                                        <input
                                            value={selectedChecklist.length}
                                            className="bg-gray-100 w-[49px] h-[39px] rounded-md text-center block"
                                        />
                                    </div>
                                    <button className="flex mt-3 items-center gap-1 text-base font-semibold">
                                        Export PDF
                                    </button>
                                </div>
                            </div>
                            {/* Only show on tablet/desktop */}
                            <div className="hidden sm:flex flex-col items-end space-y-2">
                                <div className="text-[#ef6f47] rounded text-sm font-bold">
                                    <input
                                        value={selectedChecklist.length}
                                        className="bg-gray-100 w-[49px] h-[39px] rounded-md text-center"
                                    />
                                </div>
                                <button className="flex items-center gap-1 text-base font-semibold">
                                    Export PDF
                                </button>
                            </div>
                        </div>
                        {/* Table */}
                        <div
                            ref={scrollRef}
                            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[460px] overflow-scroll select-none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <table className="table-fixed  min-w-[1765px] w-screen border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF6ED] sticky top-0 z-10">
                                        <th className="px-2 w-[240px] font-bold text-left">Time stamp</th>
                                        <th className="px-2 p-2 w-36 font-bold text-left">Date</th>
                                        <th className="px-2 w-[120px] font-bold text-left">E.No</th>
                                        <th className="px-2 w-[300px] font-bold text-left">Project Name</th>
                                        <th className="px-2 w-[220px] font-bold text-left">Vendor</th>
                                        <th className="px-2 w-[220px] font-bold text-left">Contractor</th>
                                        <th className="px-2 w-[120px] font-bold text-left">Quantity</th>
                                        <th className="px-2 w-[120px] font-bold text-left">Amount</th>
                                        <th className="px-2 w-[120px] font-bold text-left">Comments</th>
                                        <th className="px-2 w-[220px] font-bold text-left">Category</th>
                                        <th className="px-3 w-[120px] font-bold text-left">Attach file</th>
                                        <th className="px-2 w-[120px] font-bold text-left">Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedChecklist.map((expense, index) => (
                                        <tr key={index}>
                                            <td className="px-2 text-left font-semibold">{formatDate(expense.timestamp)}</td>
                                            <td className="px-2 text-left font-semibold">{formatDateOnly(expense.date)}</td>
                                            <td className="px-2 text-left font-semibold">{expense.eno}</td>
                                            <td className="px-2 text-left font-semibold">{expense.siteName}</td>
                                            <td className="px-2 text-left font-semibold">{expense.vendor}</td>
                                            <td className="px-2 text-left font-semibold">{expense.contractor}</td>
                                            <td className="px-2 text-left font-semibold">{expense.quantity}</td>
                                            <td className="text-sm text-left pl-2 font-semibold">
                                                ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-2 text-left font-semibold">{expense.comments}</td>
                                            <td className="px-2 text-left font-semibold">{expense.category}</td>
                                            <td className="px-4 text-sm">
                                                {expense.entryChecklistUrl ? (
                                                    <a
                                                        href={expense.entryChecklistUrl}
                                                        className="text-red-500 underline font-semibold"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        View
                                                    </a>
                                                ) : (
                                                    <span></span>
                                                )}
                                            </td>
                                            <td className=" flex w-[100px] justify-between py-2">
                                                <button className="rounded-full transition duration-200 ml-2 mr-3">
                                                    <img
                                                        src={edit}
                                                        alt="Edit"
                                                        className=" w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                                                    />
                                                </button>
                                                <button className=" -ml-5 -mr-2">
                                                    <img
                                                        src={remove}
                                                        alt='delete'
                                                        className='  w-4 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200 ' />
                                                </button>
                                                <button onClick={() => fetchAuditDetails(expense.id)} className="rounded-full transition duration-200 -mr-1" >
                                                    <img
                                                        src={history}
                                                        alt="history"
                                                        className=" w-4 h-5 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <AuditModal show={showModal} onClose={() => setShowModal(false)} audits={audits} />
                </div>
            </div>
        </body>
    );
}

export default History
const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - 330);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';

    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};
const AuditModal = ({ show, onClose, audits }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-md shadow-lg w-[796px] sm:w-3/4 max-w-[796px] mx-4 p-4 ">
                <div className="flex gap-[640px] mt-4 ml-7">
                    <h2 className="text-xl font-bold">History</h2>
                    <button
                        onClick={onClose}
                        className='mt-[-30px]'
                    >
                        <h2 className="text-xl text-red-500 font-bold">x</h2>
                    </button>
                </div>
                <div className="overflow-y-auto mt-2 max-h-80 overflow-x-auto border border-l-8 border-l-[#BF9853] rounded-lg w-[713px] ml-7">
                    <table className="min-w-full bg-white">
                        <thead className="bg-[#FAF6ED]">
                            <tr>
                                <th className="border-b pl-4 py-2 text-left text-base font-bold ">Time Stamp</th>
                                <th className="border-b pl-3 py-2 text-left text-base font-bold ">Headings</th>
                                <th className="border-b pl-3 py-2 text-center text-base font-bold ">Changed</th>
                                <th className="border-b pl-3 py-2 text-left text-base font-bold ">Person</th>
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]">
                                    <td className="border pl-4 text-sm text-left w-44">{formatDate(audit.editedDate)}</td>
                                    <td className="border pl-3 text-sm text-left w-40">{audit.fieldName}</td>
                                    <td className="border pl-3 text-sm text-center" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                        <div className="text-[#E4572E] font-semibold">{audit.oldValue}</div>
                                        <div className="font-bold">to</div>
                                        <div className="text-[#E4572E] font-semibold">{audit.newValue}</div>
                                    </td>
                                    <td className="border pl-3 py-2 text-sm text-left w-40">{audit.editedBy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};