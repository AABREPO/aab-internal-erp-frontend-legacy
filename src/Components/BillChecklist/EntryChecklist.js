import React, { useState, useEffect, useRef } from 'react';
import Select from "react-select";
import axios from 'axios';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
const EntryChecklist = () => {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [selectedChecklistNo, setSelectedChecklistNo] = useState('');
    const [entriesCount, setEntriesCount] = useState(0);
    const [availableYears, setAvailableYears] = useState([]);
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
    useEffect(() => {
        axios
            .get('https://backendaab.in/aabuilderDash/expenses_form/get_form')
            .then((response) => {
                const sortedExpenses = response.data.sort((a, b) => {
                    const enoA = parseInt(a.eno, 10);
                    const enoB = parseInt(b.eno, 10);
                    return enoB - enoA;
                });
                const uniqueChecklistNumbers = new Set(sortedExpenses.map(item => item.dailyChecklistNo));
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
    const handleChecklistChange = (e) => {
        const selectedChecklist = e.value;
        setSelectedChecklistNo(selectedChecklist);
        const filtered = expenses.filter(exp => exp.dailyChecklistNo === selectedChecklist);
        setFilteredExpenses(filtered);
        if (filtered.length > 0) {
            const timestamp = new Date(filtered[0].timestamp);
            setYear(timestamp.getFullYear());
            setMonth(timestamp.toLocaleString('default', { month: 'long' }));
            setEntryDate(timestamp.toISOString().split('T')[0]);
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
            setChecklistNumbers(allChecklistNos);
            setFilteredChecklistNumbers(allChecklistNos);
        }
    }, [expenses]);
    const filterChecklistByYearMonth = (selectedYear, selectedMonth) => {
        if (!selectedYear && !selectedMonth) {
            const allChecklistNos = [...new Set(expenses.map(exp => exp.dailyChecklistNo))];
            setFilteredChecklistNumbers(allChecklistNos);
            return;
        }
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
            <div className=" mx-auto lg:w-[1850px] lg:h-[128px] p-4 border-collapse bg-[#FFFFFF] ml-10 mr-6 rounded-md">
                <div className="w-full p-4">
                    <div className="grid grid-cols-2 lg:grid-cols-[110px_149px_169px_168px_149px] gap-4">
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
                        <div className="flex flex-col">
                            <label className="text-base font-semibold mb-1 text-left">Entry Check List</label>
                            <Select
                                id="checklistDropdown"
                                value={options.find(option => option.value === selectedChecklistNo)}
                                onChange={handleChecklistChange}
                                options={options}
                                styles={customStyles}
                                className=" px-3 py-2 w-[169px] h-[45px] -mt-2 focus:outline-none -ml-3"
                                placeholder=""
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-base font-semibold mb-1 text-left">Entry Date</label>
                            <input type="date" value={entryDate}
                                className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg px-3 py-2 w-[168px] h-[45px] focus:outline-none" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-base font-semibold mb-1 text-left">Entry Count</label>
                            <input type="text"
                                value={entriesCount}
                                className="border-2 border-[#BF9853] border-opacity-25 focus:outline-none rounded-lg px-3 py-2 w-[149px] h-[45px] text-red-500 font-semibold bg-gray-100"
                                readOnly />
                        </div>
                    </div>
                </div>
            </div>
            <div className=" mx-auto max-w-[1850px] overflow-x-auto p-4 border-collapse mt-5 bg-[#FFFFFF] ml-10 mr-6 rounded-md">
                <div className='mb-3 flex flex-col sm:flex-row lg:justify-between sm:items-center text-right cursor-default'>
                    <div className='hidden sm:block'></div>
                    <div className='flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 mt-2 sm:mt-0'>
                        <span className='text-[#E4572E] font-semibold hover:underline cursor-pointer'>Export PDF</span>
                        <span className='text-[#007233] font-semibold hover:underline cursor-pointer'>Export XL</span>
                        <span className='text-[#BF9853] font-semibold hover:underline cursor-pointer'>Print</span>
                    </div>
                </div>
                <div>
                    <div
                        ref={scrollRef}
                        className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[550px] overflow-scroll select-none"
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
                                {filteredExpenses.map((expense, index) => (
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
                                            {expense.billCopy ? (
                                                <a
                                                    href={expense.billCopy}
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
                    <AuditModal show={showModal} onClose={() => setShowModal(false)} audits={audits} />
                </div>
            </div>
        </body>
    )
}
export default EntryChecklist

const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes());
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
    const fields = [
        { key: "Date", label: "Date" },
        { key: "AccountType", label: "Account Type" },
        { key: "SiteName", label: "Site Name" },
        { key: "Vendor", label: "Vendor" },
        { key: "Contractor", label: "Contractor" },
        { key: "Category", label: "Category" },
        { key: "Quantity", label: "Quantity" },
        { key: "Comments", label: "Comments" },
        { key: "Amount", label: "Amount" },
        { key: "MachineTools", label: "Machine Tools" },
        { key: "BillCopy", label: "Bill Copy" },
    ];
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return isNaN(date) ? "-" : date.toLocaleString();
    };
    const columnWidths = [
        "210px", "150px", "180px", "160px", "160px", "140px",
        "120px", "200px", "130px", "180px", "150px"
    ];
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-md shadow-lg w-[796px] sm:w-3/4 max-w-[796px] mx-4 p-4">
                <div className="flex justify-between items-center mt-4 ml-7 mr-7">
                    <h2 className="text-xl font-bold">History</h2>
                    <button onClick={onClose}>
                        <h2 className="text-xl text-red-500 -mt-10 font-bold">x</h2>
                    </button>
                </div>
                <div className="overflow-auto mt-2 max-h-80 border border-l-8 border-l-[#BF9853] rounded-lg ml-7">
                    <table className="table-fixed min-w-full bg-white">
                        <thead className="bg-[#FAF6ED]">
                            <tr>
                                <th style={{ width: '130px' }} className="border-b py-2 px-2 text-left text-base font-bold whitespace-nowrap">Time Stamp</th>
                                <th style={{ width: '120px' }} className="border-b py-2 px-2 text-left text-base font-bold whitespace-nowrap">Edited By</th>
                                <th style={{ width: '210px' }} className="border-b py-2 px-8 text-left text-base font-bold whitespace-nowrap">Date</th>
                                <th style={{ width: '150px' }} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">Account Type</th>
                                <th style={{ width: '180px' }} className="border-b py-2 px-12 text-center text-base font-bold whitespace-nowrap">Site Name</th>
                                <th style={{ width: '160px' }} className="border-b py-2 px-10 text-center text-base font-bold whitespace-nowrap">Vendor</th>
                                <th style={{ width: '160px' }} className="border-b py-2 px-10 text-center text-base font-bold whitespace-nowrap">Contractor</th>
                                <th style={{ width: '140px' }} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">Category</th>
                                <th style={{ width: '120px' }} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">Quantity</th>
                                <th style={{ width: '200px' }} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">Comments</th>
                                <th style={{ width: '130px' }} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">Amount</th>
                                <th style={{ width: '180px' }} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">Machine Tools</th>
                                <th style={{ width: '300px' }} className="border-b py-2 px-14 text-center text-base font-bold whitespace-nowrap">Bill Copy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <React.Fragment key={index}>
                                    <tr className="odd:bg-white even:bg-[#FAF6ED]">
                                        <td style={{ width: '130px' }} className="border pl-2 text-sm text-left whitespace-nowrap">{formatDate(audit.editedDate)}</td>
                                        <td style={{ width: '120px' }} className="border pl-2 text-sm text-left whitespace-nowrap">{audit.editedBy}</td>
                                        {fields.map(({ key }, i) => (
                                            <td key={key} style={{ width: columnWidths[i] }} className="border text-sm text-center">
                                                {audit[`old${key}`] ?? "-"}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="odd:bg-white even:bg-[#FAF6ED]">
                                        <td style={{ width: '130px' }} className="border pl-2 text-sm text-left whitespace-nowrap">{formatDate(audit.editedDate)}</td>
                                        <td style={{ width: '120px' }} className="border pl-2 text-sm text-left whitespace-nowrap">{audit.editedBy}</td>
                                        {fields.map(({ key }, i) => {
                                            const oldVal = audit[`old${key}`];
                                            const newVal = audit[`new${key}`];
                                            const changed = oldVal !== newVal;
                                            return (
                                                <td
                                                    key={key}
                                                    style={{ width: columnWidths[i] }}
                                                    className={`border text-sm text-center ${changed ? "bg-[#BF9853] text-black font-bold" : ""}`}
                                                >
                                                    {newVal ?? "-"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};