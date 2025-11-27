import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Select from 'react-select';
import Filter from '../Images/filter (3).png'
import Reload from '../Images/rotate-right.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
Modal.setAppElement('#root');

const ExpenseTableView = () => {
    const [totalAmount, setTotalAmount] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [machineToolsOptions, setMachineToolsOptions] = useState([]);
    const [selectedSiteName, setSelectedSiteName] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedContractor, setSelectedContractor] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedEno, setSelectedEno] = useState('');
    const [accountTypeOptions, setAccountTypeOptions] = useState([]);
    const [selectedMachineTools, setSelectedMachineTools] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedAccountType, setSelectedAccountType] = useState('');
    const [showFilters, setShowFilters] = useState(false);
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
    useEffect(() => {
        axios
            .get('https://backendaab.in/aabuilderDash/expenses_form/get_form')
            .then((response) => {
                const sortedExpenses = response.data.sort((a, b) => {
                    const enoA = parseInt(a.eno, 10);
                    const enoB = parseInt(b.eno, 10);
                    return enoB - enoA; // descending order
                });
                setExpenses(sortedExpenses);
                setFilteredExpenses(sortedExpenses);
                // Extract unique values for the dropdowns
                const uniqueAccountTypes = [...new Set(response.data.map(expense => expense.accountType))];
                const uniqueMachineTools = [...new Set(response.data.map(expense => expense.machineTools))];
                const uniqueProjectNames = [...new Set(response.data.map(expense => expense.siteName))];
                const siteOptions = uniqueProjectNames.map(name => ({ value: name, label: name }));
                const uniqueVendorOptions = [...new Set(response.data.map(expense => expense.vendor))];
                const vendorOptions = uniqueVendorOptions.map(name => ({value: name, label: name}));
                const uniqueContractorOptions = [...new Set(response.data.map(expense => expense.contractor))];
                const uniqueCategoryOptions = [...new Set(response.data.map(expense => expense.category))];
                const contractorOption = uniqueContractorOptions.map(name => ({value: name, label: name}));
                const categoryOption = uniqueCategoryOptions.map(name => ({value: name, label: name}));
                // Set the unique dropdown options in state
                setAccountTypeOptions(uniqueAccountTypes);
                setMachineToolsOptions(uniqueMachineTools);
                setSiteOptions(siteOptions);
                setVendorOptions(vendorOptions);
                setContractorOptions(contractorOption);
                setCategoryOptions(categoryOption);
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
            });
    }, []);
    const generateTodayPDF = () => {
        const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
        const todayExpenses = expenses.filter(exp => {
            const expenseDate = new Date(exp.date).toISOString().slice(0, 10);
            return expenseDate === today;
        });
        if (todayExpenses.length === 0) {
            alert("No entries found for today.");
            return;
        }
        // Set landscape orientation
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(16);
        doc.text("Today's Expenses Report", 14, 15);
        autoTable(doc, {
            startY: 25,
            head: [[
                'Time', 'Date', 'Site', 'Vendor', 'Contractor',
                'Qty', 'Amount', 'Comments', 'Category', 'A/C Type',
                'Machine Tools', 'E.No'
            ]],
            body: todayExpenses.map(exp => [
                formatDate(exp.timestamp),
                formatDateOnly(exp.date),
                exp.siteName,
                exp.vendor,
                exp.contractor,
                exp.quantity,
                parseInt(exp.amount).toLocaleString(),
                exp.comments,
                exp.category,
                exp.accountType,
                exp.machineTools,
                exp.eno
            ]),
            styles: {
                fontSize: 8,
            },
            headStyles: {
                fillColor: [191, 152, 83],
            },
        });
        doc.save(`Todays_Expenses_${today}.pdf`);
    };
    useEffect(() => {
        const filtered = expenses.filter(expense => {
            return (
                (selectedSiteName ? expense.siteName === selectedSiteName : true) &&
                (selectedVendor ? expense.vendor === selectedVendor : true) &&
                (selectedContractor ? expense.contractor === selectedContractor : true) &&
                (selectedCategory ? expense.category === selectedCategory : true) &&
                (selectedMachineTools ? expense.machineTools === selectedMachineTools : true) &&
                (selectedAccountType ? expense.accountType === selectedAccountType : true) &&
                (selectedDate ? expense.date === selectedDate : true) &&
                (selectedEno ? String(expense.eno) === String(selectedEno) : true)  // Ensure types match
            );
        });
        setFilteredExpenses(filtered);
        const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        setTotalAmount(total);
    }, [selectedSiteName, selectedVendor, selectedContractor, selectedCategory, selectedMachineTools, selectedEno, selectedAccountType, selectedDate, expenses]);
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const currentItems = filteredExpenses;
    const clearFilters = () => {
        setSelectedSiteName('');
        setSelectedVendor('');
        setSelectedContractor('');
        setSelectedCategory('');
        setSelectedMachineTools('');
        setSelectedAccountType('');
        setSelectedDate('');
        setSelectedEno('');
        setFilteredExpenses(expenses);
    };
    return (
        <body className=' bg-[#FAF6ED]'>
            <div>
                <div className='mt-[-35px] mb-3 text-right items-center cursor-default flex justify-between max-w-screen-2xl table-auto min-w-full overflow-auto w-screen'>
                    <div></div>
                    <div>
                        <span className='text-[#E4572E] mr-9 font-semibold hover:underline cursor-pointer' onClick={generateTodayPDF}>Export pdf</span>
                        <span className=' text-[#007233] mr-9 font-semibold hover:underline'>Export XL</span>
                        <span className=' text-[#BF9853] mr-9 font-semibold hover:underline'>Print</span>
                    </div>
                </div>
                <div className="w-full max-w-[1860px] ml-10 p-4 bg-white overflow-x-auto">
                    <div
                        className={`text-left flex ${selectedDate || selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools
                            ? 'flex-col sm:flex-row sm:justify-between'
                            : 'flex-row justify-between items-center'
                            } mb-3 gap-2`}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                            <button className='pl-2' onClick={() => setShowFilters(!showFilters)}>
                                <img
                                    src={Filter}
                                    alt="Toggle Filter"
                                    className="w-7 h-7 border border-[#BF9853] rounded-md"
                                />
                            </button>
                            {(selectedDate || selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools) && (
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                                    {selectedDate && (
                                        <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                                            <span className="font-normal">Date: </span>
                                            <span className="font-bold">{selectedDate}</span>
                                            <button onClick={() => setSelectedDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedSiteName && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Site Name: </span>
                                            <span className="font-bold">{selectedSiteName}</span>
                                            <button onClick={() => setSelectedSiteName('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedVendor && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Vendor Name: </span>
                                            <span className="font-bold">{selectedVendor}</span>
                                            <button onClick={() => setSelectedVendor('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedContractor && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Contractor Name: </span>
                                            <span className="font-bold">{selectedContractor}</span>
                                            <button onClick={() => setSelectedContractor('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedCategory && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Category: </span>
                                            <span className="font-bold">{selectedCategory}</span>
                                            <button onClick={() => setSelectedCategory('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedAccountType && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Mode: </span>
                                            <span className="font-bold">{selectedAccountType}</span>
                                            <button onClick={() => setSelectedAccountType('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedMachineTools && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Tools: </span>
                                            <span className="font-bold">{selectedMachineTools}</span>
                                            <button onClick={() => setSelectedMachineTools('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <button
                                onClick={clearFilters}
                                className='w-36 h-9 border border-[#BF9853] rounded-md font-semibold text-sm text-[#BF9853] flex items-center justify-center gap-2'
                            >
                                <img className='w-4 h-4' src={Reload} alt="Reload" />
                                Reset Table
                            </button>
                        </div>
                    </div>

                    <div>
                        <div
                            ref={scrollRef}
                            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[685px] overflow-scroll select-none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <table className="table-fixed  min-w-[1765px] w-screen border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="pt-2 pl-3 w-36 font-bold text-left">Date</th>
                                        <th className="px-2 w-[300px] font-bold text-left">Project Name</th>
                                        <th className="px-2 w-[220px] font-bold text-left">Vendor</th>
                                        <th className="px-2 w-[220px] font-bold text-left">Contractor</th>
                                        <th className="px-2 w-[120px] font-bold text-left">Quantity</th>
                                        <th className="px-2 w-[120px] font-bold text-left">Amount</th>
                                        <th className="px-2 w-[120px] font-bold text-left">Comments</th>
                                        <th className="px-2 w-[220px] font-bold text-left">Category</th>
                                        <th className="px-2 w-[220px] font-bold text-left">A/C Type</th>
                                        <th className="px-2 w-[220px] font-bold text-left">Machine Tools</th>
                                        <th className="px-2 w-[80px] font-bold text-left">E.No</th>
                                        <th className="px-3 w-[120px] font-bold text-left">Attach file</th>
                                    </tr>
                                    {showFilters && (
                                        <tr >
                                            <th className="px-2">
                                                <input
                                                    type="date"
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    className="p-1 -ml-3 mt-3 mb-3 rounded-md bg-transparent w-32 border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                                                    placeholder="Search Date..."
                                                />
                                            </th>
                                            <th className="px-2">
                                                <Select
                                                    className="w-60 mt-3 mb-3"
                                                    options={siteOptions}
                                                    value={selectedSiteName ? { value: selectedSiteName, label: selectedSiteName } : null}
                                                    onChange={(selectedOption) => setSelectedSiteName(selectedOption ? selectedOption.value : '')}
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
                                            <th className="px-2">
                                                <Select
                                                    className="w-48 mt-3 mb-3"
                                                    options={vendorOptions}
                                                    value={selectedVendor ? { value: selectedVendor, label: selectedVendor } : null}
                                                    onChange={(selectedOption) => setSelectedVendor(selectedOption ? selectedOption.value : '')}
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
                                            <th className="px-2">
                                                <Select
                                                    className="w-48 mt-3 mb-3"
                                                    options={contractorOptions}
                                                    value={selectedContractor ? { value: selectedContractor, label: selectedContractor } : null}
                                                    onChange={(selectedOption) => setSelectedContractor(selectedOption ? selectedOption.value : '')}
                                                    placeholder="SearchContractor"
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
                                            <th></th>
                                            <th className="text-base text-left pl-2 font-bold">
                                                ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </th>
                                            <th></th>
                                            <th className="px-2">
                                                <Select
                                                    className="w-48 mt-3 mb-3"
                                                    options={categoryOptions}
                                                    value={selectedCategory ? { value: selectedCategory, label: selectedCategory } : null}
                                                    onChange={(selectedOption) => setSelectedCategory(selectedOption ? selectedOption.value : '')}
                                                    placeholder="SearchCategory..."
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
                                            <th className="px-2">
                                                <Select
                                                    className="w-48 mt-3 mb-3"
                                                    options={accountTypeOptions.map(type => ({ value: type, label: type }))}
                                                    value={selectedAccountType ? { value: selectedAccountType, label: selectedAccountType } : null}
                                                    onChange={(selectedOption) => setSelectedAccountType(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Search A/c"
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
                                            <th className="px-2">
                                                <Select
                                                    className="w-48 mt-3 mb-3"
                                                    options={machineToolsOptions.map(tool => ({ value: tool, label: tool }))}
                                                    value={selectedMachineTools ? { value: selectedMachineTools, label: selectedMachineTools } : null}
                                                    onChange={(selectedOption) => setSelectedMachineTools(selectedOption ? selectedOption.value : '')}
                                                    placeholder="SearchMachine..."
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
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {currentItems.map((expense, index) => (
                                        <tr key={expense.id} className="odd:bg-white even:bg-[#FAF6ED]">
                                            <td className=" text-sm text-left py-2 pl-3 w-32 font-semibold">{formatDateOnly(expense.date)}</td>
                                            <td className=" text-sm text-left w-60 font-semibold">{expense.siteName}</td>
                                            <td className=" text-sm text-left font-semibold">{expense.vendor}</td>
                                            <td className=" text-sm text-left font-semibold">{expense.contractor}</td>
                                            <td className=" text-sm text-left font-semibold">{expense.quantity}</td>
                                            <td className="text-sm text-left pl-2 font-semibold">
                                                ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className=" text-sm text-left font-semibold">{expense.comments}</td>
                                            <td className=" text-sm text-left font-semibold">{expense.category}</td>
                                            <td className=" text-sm text-left font-semibold">{expense.accountType}</td>
                                            <td className=" text-sm text-left font-semibold">{expense.machineTools}</td>
                                            <td className=" text-sm text-left pl-3 font-semibold">{expense.eno}</td>
                                            <td className="px-4 py-2 text-sm">
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
};
export default ExpenseTableView;
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