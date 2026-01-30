import React, { useState, useEffect, useRef } from 'react';
import Select from "react-select";
import axios from 'axios';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
import Filter from '../Images/filter (3).png';
import Reload from '../Images/rotate-right.png';
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
    const [showTableFilter, setShowTableFilter] = useState(false);
    const [tableFilters, setTableFilters] = useState({
        date: '',
        siteName: '',
        vendor: '',
        contractor: '',
        category: ''
    });
    const [displayedExpenses, setDisplayedExpenses] = useState([]);
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
        filterChecklistByYearMonth(selectedYear, month, entryDate);
    };
    const handleMonthChange = (e) => {
        const selectedMonth = e.target.value;
        setMonth(selectedMonth);
        filterChecklistByYearMonth(year, selectedMonth, entryDate);
    };
    const handleEntryDateChange = (e) => {
        const selectedDate = e.target.value;
        setEntryDate(selectedDate);
        filterChecklistByYearMonth(year, month, selectedDate);
        if (selectedDate) {
            const filtered = expenses.filter(exp => {
                const expDate = new Date(exp.timestamp).toISOString().split('T')[0];
                return expDate === selectedDate;
            });
            setFilteredExpenses(filtered);
            setEntriesCount(filtered.length);
            const uniqueChecklistNos = [...new Set(filtered.map(exp => exp.dailyChecklistNo))];
            if (uniqueChecklistNos.length > 0) {
                setSelectedChecklistNo(uniqueChecklistNos[0]);
            } else {
                setSelectedChecklistNo('');
            }
        }
    };
    useEffect(() => {
        if (expenses && expenses.length > 0) {
            const allChecklistNos = [...new Set(expenses.map(exp => exp.dailyChecklistNo))];
            setChecklistNumbers(allChecklistNos);
            setFilteredChecklistNumbers(allChecklistNos);
        }
    }, [expenses]);
    const filterChecklistByYearMonth = (selectedYear, selectedMonth, selectedDate) => {
        if (!selectedYear && !selectedMonth && !selectedDate) {
            const allChecklistNos = [...new Set(expenses.map(exp => exp.dailyChecklistNo))];
            setFilteredChecklistNumbers(allChecklistNos);
            return;
        }
        const filtered = expenses.filter(exp => {
            const timestamp = new Date(exp.timestamp);
            const expYear = timestamp.getFullYear();
            const expMonth = timestamp.toLocaleString('default', { month: 'long' });
            const expDate = timestamp.toISOString().split('T')[0];
            return (
                (!selectedYear || expYear.toString() === selectedYear.toString()) &&
                (!selectedMonth || expMonth === selectedMonth) &&
                (!selectedDate || expDate === selectedDate)
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
    const isYearOrMonthSelected = year || month || entryDate;
    useEffect(() => {
        let result = [...filteredExpenses];
        if (tableFilters.date) {
            result = result.filter(exp => {
                const expDate = new Date(exp.date).toISOString().split('T')[0];
                return expDate === tableFilters.date;
            });
        }
        if (tableFilters.siteName) {
            result = result.filter(exp =>
                exp.siteName?.toLowerCase().includes(tableFilters.siteName.toLowerCase())
            );
        }
        if (tableFilters.vendor) {
            result = result.filter(exp =>
                exp.vendor?.toLowerCase().includes(tableFilters.vendor.toLowerCase())
            );
        }
        if (tableFilters.contractor) {
            result = result.filter(exp =>
                exp.contractor?.toLowerCase().includes(tableFilters.contractor.toLowerCase())
            );
        }
        if (tableFilters.category) {
            result = result.filter(exp =>
                exp.category?.toLowerCase().includes(tableFilters.category.toLowerCase())
            );
        }
        setDisplayedExpenses(result);
    }, [filteredExpenses, tableFilters]);
    const handleTableFilterChange = (field, value) => {
        setTableFilters(prev => ({ ...prev, [field]: value }));
    };
    const resetTableFilters = () => {
        setTableFilters({
            date: '',
            siteName: '',
            vendor: '',
            contractor: '',
            category: ''
        });
    };
    const totalAmount = displayedExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const uniqueSiteNames = [...new Set(filteredExpenses.map(exp => exp.siteName).filter(Boolean))];
    const uniqueVendors = [...new Set(filteredExpenses.map(exp => exp.vendor).filter(Boolean))];
    const uniqueContractors = [...new Set(filteredExpenses.map(exp => exp.contractor).filter(Boolean))];
    const uniqueCategories = [...new Set(filteredExpenses.map(exp => exp.category).filter(Boolean))];
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
                            <input type="date" value={entryDate} onChange={handleEntryDateChange}
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
                <div className='mb-3 flex flex-col sm:flex-row lg:justify-between sm:items-center cursor-default'>
                    <div className='flex items-center gap-4'>
                        <button className='pl-2' onClick={() => setShowTableFilter(!showTableFilter)}>
                            <img
                                src={Filter}
                                alt="Toggle Filter"
                                className="w-7 h-7 border border-[#BF9853] rounded-md"
                            />
                        </button>
                        {(tableFilters.date || tableFilters.siteName || tableFilters.vendor || tableFilters.contractor || tableFilters.category) && (
                            <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                                {tableFilters.date && (
                                    <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                                        <span className="font-normal">Date: </span>
                                        <span className="font-bold">{tableFilters.date}</span>
                                        <button onClick={() => handleTableFilterChange('date', '')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                    </span>
                                )}
                                {tableFilters.siteName && (
                                    <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                        <span className="font-normal">Site Name: </span>
                                        <span className="font-bold">{tableFilters.siteName}</span>
                                        <button onClick={() => handleTableFilterChange('siteName', '')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                    </span>
                                )}
                                {tableFilters.vendor && (
                                    <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                        <span className="font-normal">Vendor Name: </span>
                                        <span className="font-bold">{tableFilters.vendor}</span>
                                        <button onClick={() => handleTableFilterChange('vendor', '')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                    </span>
                                )}
                                {tableFilters.contractor && (
                                    <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                        <span className="font-normal">Contractor Name: </span>
                                        <span className="font-bold">{tableFilters.contractor}</span>
                                        <button onClick={() => handleTableFilterChange('contractor', '')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                    </span>
                                )}
                                {tableFilters.category && (
                                    <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                        <span className="font-normal">Category: </span>
                                        <span className="font-bold">{tableFilters.category}</span>
                                        <button onClick={() => handleTableFilterChange('category', '')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                    </span>
                                )}
                            </div>
                        )}
                        <button
                            onClick={resetTableFilters}
                            className='w-36 h-9 border border-[#BF9853] rounded-md font-semibold text-sm text-[#BF9853] flex items-center justify-center gap-2'
                        >
                            <img className='w-4 h-4' src={Reload} alt="Reload" />
                            Reset Table
                        </button>
                    </div>
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
                                <tr className="bg-[#FAF6ED] sticky top-0 z-9">
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
                                {showTableFilter && (
                                    <tr className="bg-[#FAF6ED] sticky top-[32px] z-9">
                                        <th className="px-2 w-[240px]"></th>
                                        <th className="px-2 w-36">
                                            <input
                                                type="date"
                                                value={tableFilters.date}
                                                onChange={(e) => handleTableFilterChange('date', e.target.value)}
                                                className="p-1 mt-3 mb-3 rounded-md bg-transparent w-32 border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                                                placeholder="dd-mm-yyyy"
                                            />
                                        </th>
                                        <th className="px-2 w-[120px]"></th>
                                        <th className="px-2 w-[300px]">
                                            <Select
                                                className="w-60 mt-3 mb-3"
                                                options={uniqueSiteNames.map(site => ({ value: site, label: site }))}
                                                value={tableFilters.siteName ? { value: tableFilters.siteName, label: tableFilters.siteName } : null}
                                                onChange={(selectedOption) => handleTableFilterChange('siteName', selectedOption ? selectedOption.value : '')}
                                                placeholder="Search Site..."
                                                menuPlacement="bottom"
                                                menuPosition="fixed"
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
                                                        fontSize: '13px',
                                                        color: '#999',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        zIndex: 9999,
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
                                        <th className="px-2 w-[220px]">
                                            <Select
                                                className="w-48 mt-3 mb-3"
                                                options={uniqueVendors.map(vendor => ({ value: vendor, label: vendor }))}
                                                value={tableFilters.vendor ? { value: tableFilters.vendor, label: tableFilters.vendor } : null}
                                                onChange={(selectedOption) => handleTableFilterChange('vendor', selectedOption ? selectedOption.value : '')}
                                                placeholder="Search Vendor"
                                                menuPlacement="bottom"
                                                menuPosition="fixed"
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
                                                        fontSize: '13px',
                                                        color: '#999',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        zIndex: 9999,
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
                                        <th className="px-2 w-[220px]">
                                            <Select
                                                className="w-48 mt-3 mb-3"
                                                options={uniqueContractors.map(contractor => ({ value: contractor, label: contractor }))}
                                                value={tableFilters.contractor ? { value: tableFilters.contractor, label: tableFilters.contractor } : null}
                                                onChange={(selectedOption) => handleTableFilterChange('contractor', selectedOption ? selectedOption.value : '')}
                                                placeholder="Search Contractor"
                                                menuPlacement="bottom"
                                                menuPosition="fixed"
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
                                                        fontSize: '13px',
                                                        color: '#999',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        zIndex: 9999,
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
                                        <th className="px-2 w-[120px]"></th>
                                        <th className="px-2 w-[120px] text-left font-semibold text-[#BF9853]">
                                            ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </th>
                                        <th className="px-2 w-[120px]"></th>
                                        <th className="px-2 w-[220px]">
                                            <Select
                                                className="w-48 mt-3 mb-3"
                                                options={uniqueCategories.map(category => ({ value: category, label: category }))}
                                                value={tableFilters.category ? { value: tableFilters.category, label: tableFilters.category } : null}
                                                onChange={(selectedOption) => handleTableFilterChange('category', selectedOption ? selectedOption.value : '')}
                                                placeholder="Search Category"
                                                menuPlacement="bottom"
                                                menuPosition="fixed"
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
                                                        fontSize: '13px',
                                                        color: '#999',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        zIndex: 9999,
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
                                        <th className="px-3 w-[120px]"></th>
                                        <th className="px-2 w-[120px]"></th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {displayedExpenses.map((expense, index) => (
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