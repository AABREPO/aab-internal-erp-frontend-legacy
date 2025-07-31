import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Select from 'react-select';
import Reload from '../Images/rotate-right.png'
Modal.setAppElement('#root');

const EntryChecking = () => {
    const [filteredCount, setFilteredCount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [selectedSiteName, setSelectedSiteName] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedContractor, setSelectedContractor] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedEno, setSelectedEno] = useState('');
    const [accountTypeOptions, setAccountTypeOptions] = useState([]);
    const [selectedMachineTools, setSelectedMachineTools] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedAccountType, setSelectedAccountType] = useState('');
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
                // Extract unique values for the dropdowns
                const uniqueAccountTypes = [...new Set(response.data.map(expense => expense.accountType))];
                const uniqueVendorOptions = [...new Set(response.data.map(expense => expense.vendor))];
                const vendorOptions = uniqueVendorOptions.map(name => ({ value: name, label: name }));
                const uniqueContractorOptions = [...new Set(response.data.map(expense => expense.contractor))];
                const contractorOption = uniqueContractorOptions.map(name => ({ value: name, label: name }));
                // Set the unique dropdown options in state
                setAccountTypeOptions(uniqueAccountTypes);
                setVendorOptions(vendorOptions);
                setContractorOptions(contractorOption);
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
            });
    }, []);
    useEffect(() => {
        const filtered = expenses.filter(expense => {
            return (
                (selectedSiteName ? expense.siteName === selectedSiteName : true) &&
                (selectedVendor ? expense.vendor === selectedVendor : true) &&
                (selectedContractor ? expense.contractor === selectedContractor : true) &&
                (selectedCategory ? expense.category === selectedCategory : true) &&
                (selectedMachineTools ? expense.machineTools === selectedMachineTools : true) &&
                (selectedAccountType ? expense.accountType === selectedAccountType : true) &&
                (selectedDate ? expense.timestamp.split('T')[0] === selectedDate : true) &&
                (selectedEno ? String(expense.eno) === String(selectedEno) : true)
            );
        });
        setFilteredExpenses(filtered);
        setFilteredCount(filtered.length);
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
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'transparent',
            borderWidth: '3px',
            borderColor: 'rgba(191, 152, 83, 0.2)',
            borderRadius: '6px',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
            '&:hover': { borderColor: 'rgba(191, 152, 83, 0.2)' },
        }),
        placeholder: (provided) => ({ ...provided, color: '#999', textAlign: 'left' }),
        menu: (provided) => ({ ...provided, zIndex: 9 }),
        option: (provided, state) => ({
            ...provided,
            textAlign: 'left',
            fontWeight: 'normal',
            fontSize: '15px',
            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
            color: 'black',
        }),
        singleValue: (provided) => ({ ...provided, textAlign: 'left', color: 'black' }),
    };
    const isAnyFilterSelected = selectedDate || selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools;
    return (
        <body className=' bg-[#FAF6ED]'>
            <div>
                <div className="w-full max-w-[1860px] h-full mx-auto p-4 bg-white shadow-lg">
                    <div
                        className={`text-left flex ${selectedDate || selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools
                            ? 'flex-col sm:flex-row sm:justify-between'
                            : 'flex-row justify-between items-center'
                            } mb-3 gap-2`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                            {(selectedDate || selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools) && (
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                                    {selectedDate && (
                                        <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                                            <span className="font-normal">Date: </span>
                                            <span className="font-bold">{selectedDate}</span>
                                            <button onClick={() => setSelectedDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
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
                                Reset Filter
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-2 lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-1">
                        {/* Date of Entry */}
                        <div className="flex flex-col">
                            <label className="font-bold text-left">Date Of Entry:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="p-2 mt-2 rounded-md bg-transparent w-full border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                            />
                        </div>
                        {/* Vendor */}
                        <div className="flex flex-col">
                            <label className="font-bold text-left">Vendor:</label>
                            <Select
                                className="mt-2 p-1"
                                options={vendorOptions}
                                value={selectedVendor ? { value: selectedVendor, label: selectedVendor } : null}
                                onChange={(selectedOption) => setSelectedVendor(selectedOption ? selectedOption.value : '')}
                                placeholder="Search Vendor"
                                isClearable
                                styles={customSelectStyles}
                            />
                        </div>
                        {/* Contractor */}
                        <div className="flex flex-col">
                            <label className="font-bold text-left">Contractor:</label>
                            <Select
                                className="p-1 mt-2"
                                options={contractorOptions}
                                value={selectedContractor ? { value: selectedContractor, label: selectedContractor } : null}
                                onChange={(selectedOption) => setSelectedContractor(selectedOption ? selectedOption.value : '')}
                                placeholder="Search Contractor"
                                isClearable
                                styles={customSelectStyles}
                            />
                        </div>
                        {/* Account Type */}
                        <div className="flex flex-col">
                            <label className="font-bold text-left">A/C Type:</label>
                            <Select
                                className="p-1 mt-2"
                                options={accountTypeOptions.map(type => ({ value: type, label: type }))}
                                value={selectedAccountType ? { value: selectedAccountType, label: selectedAccountType } : null}
                                onChange={(selectedOption) => setSelectedAccountType(selectedOption ? selectedOption.value : '')}
                                placeholder="Search A/c"
                                isClearable
                                styles={customSelectStyles}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-bold text-left">No Of Bills:</label>
                            <div className="w-full h-11 p-2 mt-3 rounded-lg border-[4px] border-[#FAF6ED] text-left">
                                {isAnyFilterSelected ? filteredCount : ''}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="font-bold text-left">Amount:</label>
                            <div className="w-full h-11 p-2 mt-3 rounded-lg border-[4px] border-[#FAF6ED] text-left">
                                {isAnyFilterSelected
                                    ? `₹${Number(totalAmount).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}`
                                    : ''}
                            </div>
                        </div>
                    </div>
                    {isAnyFilterSelected && (
                        <div
                            ref={scrollRef}
                            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[620px] overflow-scroll select-none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <table className="table-fixed  min-w-[1765px] w-screen border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="px-2 w-[240px] font-bold text-left">Time stamp</th>
                                        <th className="px-2 p-2 w-36 font-bold text-left">Date</th>
                                        <th className="px-2 w-[120px] font-bold text-left">E.No</th>
                                        <th className="px-2 w-[300px] font-bold text-left">Project Name</th>
                                        <th className="px-2 w-[220px] font-bold text-left">Vendor</th>
                                        <th className="px-2 w-[220px] font-bold text-left">Contractor</th>
                                        <th className="px-2 w-[220px] font-bold text-left">A/C Type</th>
                                        <th className="px-2 w-[120px] font-bold text-left">Quantity</th>
                                        <th className="px-2 w-[120px] font-bold text-left">Amount</th>
                                        <th className="px-2 w-[120px] font-bold text-left">Comments</th>
                                        <th className="px-2 w-[220px] font-bold text-left">Category</th>
                                        <th className="px-3 w-[120px] font-bold text-left">Attach file</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.map((expense, index) => (
                                        <tr key={index} className="odd:bg-white even:bg-[#FAF6ED] ">
                                            <td className="px-2 text-left font-semibold py-2">{formatDate(expense.timestamp)}</td>
                                            <td className="px-2 text-left font-semibold">{formatDateOnly(expense.date)}</td>
                                            <td className="px-2 text-left font-semibold">{expense.eno}</td>
                                            <td className="px-2 text-left font-semibold">{expense.siteName}</td>
                                            <td className="px-2 text-left font-semibold">{expense.vendor}</td>
                                            <td className="px-2 text-left font-semibold">{expense.contractor}</td>
                                            <td className="px-2 text-left font-semibold">{expense.accountType}</td>
                                            <td className="px-2 text-left font-semibold">{expense.quantity}</td>
                                            <td className="text-sm text-left pl-2 font-semibold">
                                                ₹{Number(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </body>
    );
};
export default EntryChecking;
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
