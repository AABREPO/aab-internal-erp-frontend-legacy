import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Select from 'react-select';
import DateRangePicker from './DateRangePicker';
import CustomDateField from './CustomDateField';
import { Table, TableProvider, buildEntryCheckTableContext, BLANK_VALUE, blankOption } from './Table';
import {
    TABLE_FILTER_MAX_VISIBLE_OPTIONS,
    TABLE_FILTER_MENU_MAX_HEIGHT_PX,
    TABLE_FILTER_OPTION_HEIGHT_PX,
} from './databaseExpensesSharedColumns';
import Reload from '../Images/Clear.svg'
import Filter from '../Images/TableFilter.svg'
import Search from '../Images/Searchnew.svg'
import Pdf from '../Images/pdf.png'
import CalendarIcon from "../Images/Calendoricon.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    EXPENSE_ENTRY_MODULE_NAME,
    sortValuesByArrangement,
} from '../../utils/paymentModeArrangement';
import { useModulePaymentModeArrangementList } from '../../utils/usePaymentModeArrangement';
Modal.setAppElement('#root');
const EntryChecking = () => {
    const [filteredCount, setFilteredCount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [branchOptions, setBranchOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [projectNameOptions, setProjectNameOptions] = useState([]);
    const [selectedSiteName, setSelectedSiteName] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedContractor, setSelectedContractor] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedEno, setSelectedEno] = useState('');
    const [accountTypeOptions, setAccountTypeOptions] = useState([]);
    const [selectedMachineTools, setSelectedMachineTools] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedStartDate, setSelectedStartDate] = useState('');
    const [selectedEndDate, setSelectedEndDate] = useState('');
    const [selectedAccountType, setSelectedAccountType] = useState('');
    const [timestampStartDate, setTimestampStartDate] = useState('');
    const [timestampEndDate, setTimestampEndDate] = useState('');
    const [selectedExpenseDate, setSelectedExpenseDate] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState('');
    const [selectedDescription, setSelectedDescription] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('');
    const [paymentModeFilterOptions, setPaymentModeFilterOptions] = useState([]);
    const expenseEntryPaymentModeOrder = useModulePaymentModeArrangementList(EXPENSE_ENTRY_MODULE_NAME);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [enoOptions, setEnoOptions] = useState([]);
    const [branchFilterOptions, setBranchFilterOptions] = useState([]);
    const [overallSearch, setOverallSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [showFilters, setShowFilters] = useState(false);
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const [showTimestampDateRangePicker, setShowTimestampDateRangePicker] = useState(false);
    const scrollRef = useRef(null);
    const filterRowRef = useRef(null);
    const billArrivalFilterRef = useRef(null);
    const filterNudgeUsedRef = useRef(false);
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
        filterNudgeUsedRef.current = false;
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
            .get('https://backendaab.in/demoAabuilderDash/expenses_form/get_form')
            .then((response) => {
                const sortedExpenses = response.data.sort((a, b) => {
                    const enoA = parseInt(a.eno, 10);
                    const enoB = parseInt(b.eno, 10);
                    return enoB - enoA; // descending order
                });
                setExpenses(sortedExpenses);
                // Extract unique values for the dropdowns
                const isBlankish = (value) =>
                    value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
                const uniqueAccountTypes = [...new Set(response.data.map(expense => expense.accountType))].filter(type => !isBlankish(type));
                const uniqueVendorOptions = [...new Set(response.data.map(expense => expense.vendor))].filter(name => !isBlankish(name));
                const vendorOptions = uniqueVendorOptions.map(name => ({ value: name, label: name }));
                vendorOptions.unshift(blankOption);
                const uniqueContractorOptions = [...new Set(response.data.map(expense => expense.contractor))].filter(name => !isBlankish(name));
                const contractorOption = uniqueContractorOptions.map(name => ({ value: name, label: name }));
                contractorOption.unshift(blankOption);
                const uniqueProjectNames = [...new Set(response.data.map(expense => expense.siteName))].filter(name => !isBlankish(name));
                const projectNameOption = uniqueProjectNames.map(name => ({ value: name, label: name }));
                projectNameOption.unshift(blankOption);
                const uniqueCategories = [...new Set(response.data.map(expense => expense.category))].filter(name => !isBlankish(name));
                const categoryOption = uniqueCategories.map(name => ({ value: name, label: name }));
                categoryOption.unshift(blankOption);
                // Set the unique dropdown options in state
                setAccountTypeOptions([BLANK_VALUE, ...uniqueAccountTypes]);
                setCategoryOptions(categoryOption);
                setVendorOptions(vendorOptions);
                setContractorOptions(contractorOption);
                setProjectNameOptions(projectNameOption);
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
            });
    }, []);
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/branch/getAll', {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) throw new Error('Failed to fetch branches');
                const data = await response.json();
                setBranchOptions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching branches:', error);
                setBranchOptions([]);
            }
        };
        fetchBranches();
    }, []);
    useEffect(() => {
        const isBlankish = (value) =>
            value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
        const uniqueBranchIds = [...new Set(expenses.map(expense => expense.branch_id ?? expense.branchId).filter(Boolean))];
        const branchFilterOptionsBuilt = uniqueBranchIds.map(id => ({
            value: String(id),
            label: branchOptions.find(b => String(b.id) === String(id))?.branch || String(id),
        })).filter(opt => opt.label != null && String(opt.label).trim() !== '');
        branchFilterOptionsBuilt.unshift(blankOption);
        setBranchFilterOptions(branchFilterOptionsBuilt);
        const uniqueEnos = [...new Set(expenses.map(expense => expense.eno))]
            .filter(eno => eno != null && String(eno).trim() !== '')
            .sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
        uniqueEnos.unshift(BLANK_VALUE);
        setEnoOptions(uniqueEnos);
        const uniquePaymentModes = [];
        const seenPaymentModes = new Set();
        let hasBlankPaymentMode = false;
        expenses.forEach((expense) => {
            const mode = expense.paymentMode;
            if (isBlankish(mode)) {
                hasBlankPaymentMode = true;
                return;
            }
            const key = String(mode);
            if (!seenPaymentModes.has(key)) {
                seenPaymentModes.add(key);
                uniquePaymentModes.push(String(mode));
            }
        });
        const sortedPaymentModes = sortValuesByArrangement(uniquePaymentModes, expenseEntryPaymentModeOrder);
        const paymentModeOptionsBuilt = sortedPaymentModes.map((val) => ({ value: val, label: val }));
        paymentModeOptionsBuilt.unshift(blankOption);
        setPaymentModeFilterOptions(paymentModeOptionsBuilt);
    }, [expenses, branchOptions, expenseEntryPaymentModeOrder]);
    useEffect(() => {
        const isBlankish = (value) =>
            value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
        const filtered = expenses.filter(expense => {
            const expenseDate = new Date(expense.date).toISOString().slice(0, 10);
            if (timestampStartDate && timestampEndDate) {
                const ts = new Date(timestampStartDate);
                ts.setHours(0, 0, 0, 0);
                const te = new Date(timestampEndDate);
                te.setHours(23, 59, 59, 999);
                const expenseTs = expense.timestamp ? new Date(expense.timestamp) : null;
                if (!expenseTs || expenseTs < ts || expenseTs > te) return false;
            } else if (timestampStartDate) {
                const ts = new Date(timestampStartDate);
                ts.setHours(0, 0, 0, 0);
                const expenseTs = expense.timestamp ? new Date(expense.timestamp) : null;
                if (!expenseTs || expenseTs < ts) return false;
            } else if (timestampEndDate) {
                const te = new Date(timestampEndDate);
                te.setHours(23, 59, 59, 999);
                const expenseTs = expense.timestamp ? new Date(expense.timestamp) : null;
                if (!expenseTs || expenseTs > te) return false;
            }
            if (overallSearch.trim()) {
                const q = overallSearch.toLowerCase().trim();
                const searchable = [
                    formatDate(expense.timestamp),
                    formatDateOnly(expense.date),
                    expense.siteName,
                    expense.vendor,
                    expense.contractor,
                    expense.quantity,
                    expense.amount,
                    expense.comments,
                    expense.category,
                    expense.accountType,
                    expense.paymentMode,
                    branchOptions.find(b => String(b.id) === String(expense.branch_id ?? expense.branchId ?? ''))?.branch || '',
                    expense.eno
                ]
                    .map((v) => String(v ?? '').toLowerCase())
                    .join(' ');
                if (!searchable.includes(q)) return false;
            }
            return (
                (selectedSiteName
                    ? (selectedSiteName === BLANK_VALUE
                        ? isBlankish(expense.siteName)
                        : expense.siteName === selectedSiteName)
                    : true) &&
                (selectedVendor
                    ? (selectedVendor === BLANK_VALUE
                        ? isBlankish(expense.vendor)
                        : expense.vendor === selectedVendor)
                    : true) &&
                (selectedContractor
                    ? (selectedContractor === BLANK_VALUE
                        ? isBlankish(expense.contractor)
                        : expense.contractor === selectedContractor)
                    : true) &&
                (selectedCategory
                    ? (selectedCategory === BLANK_VALUE
                        ? isBlankish(expense.category)
                        : expense.category === selectedCategory)
                    : true) &&
                (selectedMachineTools
                    ? (selectedMachineTools === BLANK_VALUE
                        ? isBlankish(expense.machineTools)
                        : expense.machineTools === selectedMachineTools)
                    : true) &&
                (selectedAccountType
                    ? (selectedAccountType === BLANK_VALUE
                        ? isBlankish(expense.accountType)
                        : expense.accountType === selectedAccountType)
                    : true) &&
                (selectedPaymentMode
                    ? (selectedPaymentMode === BLANK_VALUE
                        ? isBlankish(expense.paymentMode)
                        : expense.paymentMode === selectedPaymentMode)
                    : true) &&
                (selectedDate ? expense.timestamp.split('T')[0] === selectedDate : true) &&
                (selectedExpenseDate ? expenseDate === selectedExpenseDate : true) &&
                (selectedStartDate ? expenseDate >= selectedStartDate : true) &&
                (selectedEndDate ? expenseDate <= selectedEndDate : true) &&
                (selectedBranch
                    ? (selectedBranch === BLANK_VALUE
                        ? isBlankish(expense.branch_id ?? expense.branchId)
                        : String(expense.branch_id ?? expense.branchId ?? '') === String(selectedBranch))
                    : true) &&
                (selectedQuantity.trim()
                    ? String(expense.quantity ?? '').toLowerCase().includes(selectedQuantity.toLowerCase().trim())
                    : true) &&
                (selectedDescription.trim()
                    ? String(expense.comments ?? '').toLowerCase().includes(selectedDescription.toLowerCase().trim())
                    : true) &&
                (selectedEno
                    ? (selectedEno === BLANK_VALUE
                        ? isBlankish(expense.eno)
                        : String(expense.eno) === String(selectedEno))
                    : true)
            );
        });
        setFilteredExpenses(filtered);
        setFilteredCount(filtered.length);
        setCurrentPage(1);
        const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        setTotalAmount(total);
    }, [selectedSiteName, selectedVendor, selectedContractor, selectedCategory, selectedMachineTools, selectedEno, selectedAccountType, selectedPaymentMode, selectedDate, selectedExpenseDate, selectedStartDate, selectedEndDate, timestampStartDate, timestampEndDate, selectedBranch, selectedQuantity, selectedDescription, overallSearch, expenses, branchOptions]);
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const formatChipDateDMY = (dateString) => {
        if (!dateString) return '';
        const parts = String(dateString).split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            const [y, m, d] = parts;
            return `${d}-${m}-${y}`;
        }
        return String(dateString);
    };
    const getBranchName = (id) =>
        branchOptions.find(b => String(b.id) === String(id))?.branch || "";
    const clearFilters = () => {
        setSelectedSiteName('');
        setSelectedVendor('');
        setSelectedContractor('');
        setSelectedCategory('');
        setSelectedMachineTools('');
        setSelectedAccountType('');
        setSelectedDate('');
        setSelectedExpenseDate('');
        setSelectedStartDate('');
        setSelectedEndDate('');
        setTimestampStartDate('');
        setTimestampEndDate('');
        setSelectedQuantity('');
        setSelectedDescription('');
        setSelectedBranch('');
        setSelectedPaymentMode('');
        setSelectedEno('');
        setOverallSearch('');
        setCurrentPage(1);
        setFilteredExpenses(expenses);
    };
    const generateFilteredPDF = () => {
        if (filteredExpenses.length === 0) {
            alert("No filtered data to export. Please apply some filters first.");
            return;
        }
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(16);
        doc.text("Filtered Expenses Report", 14, 15);
        doc.setFontSize(10);
        let yPosition = 25;        
        if (selectedStartDate || selectedEndDate) {
            const formatDateForPDF = (dateString) => {
                if (!dateString) return '';
                const [year, month, day] = dateString.split('-');
                return `${day}/${month}/${year}`;
            };            
            const dateRange = selectedStartDate && selectedEndDate 
                ? `${formatDateForPDF(selectedStartDate)} to ${formatDateForPDF(selectedEndDate)}`
                : selectedStartDate 
                    ? `From ${formatDateForPDF(selectedStartDate)}`
                    : `Until ${formatDateForPDF(selectedEndDate)}`;
            doc.text(`Date Range: ${dateRange}`, 14, yPosition);
            yPosition += 8;
        }        
        if (selectedVendor) {
            doc.text(`Vendor: ${selectedVendor}`, 14, yPosition);
            yPosition += 8;
        }        
        if (selectedContractor) {
            doc.text(`Contractor: ${selectedContractor}`, 14, yPosition);
            yPosition += 8;
        }        
        if (selectedAccountType) {
            doc.text(`Account Type: ${selectedAccountType}`, 14, yPosition);
            yPosition += 8;
        }        
        doc.text(`Total Entries: ${filteredCount}`, 14, yPosition);
        yPosition += 8;
        doc.text(`Total Amount: ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, yPosition);        
        autoTable(doc, {
            startY: yPosition + 10,
            head: [['Time Stamp', 'Date', 'E.No', 'Project Name', 'Vendor', 'Contractor',
                   'A/C Type', 'Branch', 'Quantity', 'Amount', 'Comments', 'Category']],
            body: filteredExpenses.map(exp => [
                formatDate(exp.timestamp),
                formatDateOnly(exp.date),
                exp.eno,
                exp.siteName,
                exp.vendor,
                exp.contractor,
                exp.accountType,
                getBranchName(exp.branch_id ?? exp.branchId ?? '') || '',
                exp.quantity,
                Number(exp.amount).toLocaleString('en-IN'),
                exp.comments,
                exp.category
            ]),
            styles: {
                fontSize: 7,
            },
            headStyles: {
                fillColor: [191, 152, 83],
            },
        });
        const dateStr = new Date().toISOString().slice(0, 10);
        doc.save(`Filtered_Expenses_Report_${dateStr}.pdf`);
    };
    const TABLE_FILTER_OPTION_HEIGHT = TABLE_FILTER_OPTION_HEIGHT_PX;
    const TABLE_FILTER_MAX_VISIBLE_OPTIONS_COUNT = TABLE_FILTER_MAX_VISIBLE_OPTIONS;
    const getTableFilterMenuMaxHeight = () => {
        const maxLargeHeight = TABLE_FILTER_MENU_MAX_HEIGHT_PX;
        if (typeof window === 'undefined') return maxLargeHeight;
        if (window.innerWidth >= 1024) return maxLargeHeight;

        const viewportSpace = Math.max(window.innerHeight - 320, TABLE_FILTER_OPTION_HEIGHT * 3);
        const tableSpace = scrollRef.current?.clientHeight
            ? Math.max(scrollRef.current.clientHeight - 120, TABLE_FILTER_OPTION_HEIGHT * 3)
            : viewportSpace;
        const raw = Math.min(maxLargeHeight, viewportSpace, tableSpace);
        const visibleCount = Math.max(
            3,
            Math.min(TABLE_FILTER_MAX_VISIBLE_OPTIONS_COUNT, Math.floor(raw / TABLE_FILTER_OPTION_HEIGHT))
        );
        return visibleCount * TABLE_FILTER_OPTION_HEIGHT;
    };
    const [tableFilterMenuMaxHeight, setTableFilterMenuMaxHeight] = useState(getTableFilterMenuMaxHeight);
    useEffect(() => {
        const updateMenuHeight = () => setTableFilterMenuMaxHeight(getTableFilterMenuMaxHeight());
        updateMenuHeight();
        window.addEventListener('resize', updateMenuHeight);
        return () => window.removeEventListener('resize', updateMenuHeight);
    }, [showFilters]);
    const tableFilterSelectClassNames = {
        menuList: () => 'no-scrollbar scrollbar-none',
    };
    const tableFilterSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderWidth: '2px',
            lineHeight: '20px',
            fontSize: '14px',
            fontWeight: 'normal',
            height: '38px',
            minHeight: '38px',
            borderRadius: '8px',
            textAlign: 'left',
            borderColor: 'rgba(191, 152, 83, 0.2)',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
            '&:hover': { borderColor: 'rgba(191, 152, 83, 0.4)' },
        }),
        menu: (provided) => ({ ...provided, zIndex: 9999, maxHeight: tableFilterMenuMaxHeight }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: tableFilterMenuMaxHeight,
            paddingTop: 0,
            paddingBottom: 0,
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
        }),
        option: (provided, state) => ({
            ...provided,
            minHeight: TABLE_FILTER_OPTION_HEIGHT,
            height: TABLE_FILTER_OPTION_HEIGHT,
            paddingTop: 0,
            paddingBottom: 0,
            display: 'flex',
            alignItems: 'center',
            textAlign: 'left',
            fontWeight: 'normal',
            fontSize: '15px',
            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
            color: 'black',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#111827',
            fontWeight: 'normal',
            marginRight: 0,
        }),
        valueContainer: (provided) => ({
            ...provided,
            paddingLeft: '12px',
            paddingRight: '2px',
            paddingTop: 0,
            paddingBottom: 0,
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            paddingLeft: '0px',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            display: state.hasValue ? 'none' : 'flex',
            paddingTop: '0px',
            paddingBottom: '0px',
            paddingRight: '6px',
            paddingLeft: '3px',
        }),
        input: (provided) => ({
            ...provided,
            fontWeight: 'normal',
            color: 'black',
            textAlign: 'left',
            margin: 0,
            padding: 0,
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#A6A5A6',
            textAlign: 'left',
            fontWeight: 'normal',
            paddingLeft: '0px',
            paddingTop: '0px',
            paddingBottom: '0px',
            margin: 0,
        }),
        clearIndicator: (provided) => ({
            ...provided,
            cursor: 'pointer',
        }),
        indicatorSeparator: () => ({ display: 'none' }),
    };
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'transparent',
            fontSize: '14px',
            border: '2px solid rgba(191, 152, 83, 0.2)',
            borderRadius: '8px',
            minHeight: '40px',
            fontWeight: 'medium',
            height: '40px',
            flexWrap: 'nowrap',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
            '&:hover': { borderColor: 'rgba(191, 152, 83, 0.4)' },
        }),
        valueContainer: (provided) => ({
            ...provided,
            flexWrap: 'nowrap',
            overflow: 'hidden',
            paddingLeft: '12px',
            paddingRight: '2px',
            height: '36px',
            alignItems: 'center',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#999',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            position: 'absolute',
        }),
        menu: (provided) => ({ ...provided, zIndex: 9999, maxHeight: tableFilterMenuMaxHeight }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: tableFilterMenuMaxHeight,
            paddingTop: 0,
            paddingBottom: 0,
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
        }),
        option: (provided, state) => ({
            ...provided,
            minHeight: TABLE_FILTER_OPTION_HEIGHT,
            height: TABLE_FILTER_OPTION_HEIGHT,
            paddingTop: 0,
            paddingBottom: 0,
            display: 'flex',
            alignItems: 'center',
            textAlign: 'left',
            fontWeight: 'normal',
            fontSize: '15px',
            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
            color: 'black',
        }),
        singleValue: (provided) => ({
            ...provided,
            textAlign: 'left',
            color: 'black',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
        }),
        input: (provided) => ({
            ...provided,
            margin: 0,
            padding: 0,
            whiteSpace: 'nowrap',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            display: state.hasValue ? 'none' : 'flex',
            color: '#000000',
            flexShrink: 0,
        }),
        clearIndicator: (provided) => ({
            ...provided,
            cursor: 'pointer',
            color: '#000000',
            flexShrink: 0,
        }),
        indicatorSeparator: () => ({ display: 'none' }),
    };
    const nameSelectClassNames = {
        menuList: () => 'no-scrollbar scrollbar-none',
        valueContainer: () => '!flex-nowrap !overflow-hidden',
        placeholder: () => '!whitespace-nowrap !overflow-hidden !text-ellipsis',
        singleValue: () => '!whitespace-nowrap !overflow-hidden !text-ellipsis',
    };
    const isAnyFilterSelected = selectedDate || selectedExpenseDate || selectedStartDate || selectedEndDate || timestampStartDate || timestampEndDate || selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools || selectedPaymentMode || selectedBranch || selectedQuantity.trim() || selectedDescription.trim() || selectedEno || overallSearch.trim();
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = isAnyFilterSelected ? filteredExpenses.slice(startIndex, endIndex) : [];
    const entryCheckTableContext = useMemo(() => ({
        ...buildEntryCheckTableContext({
        currentItems,
        showFilters,
        filterRowRef,
        totalAmount,
        timestampStartDate,
        setTimestampStartDate,
        timestampEndDate,
        setTimestampEndDate,
        showTimestampDateRangePicker,
        setShowTimestampDateRangePicker,
        selectedExpenseDate,
        setSelectedExpenseDate,
        projectNameOptions,
        selectedSiteName,
        setSelectedSiteName,
        vendorOptions,
        selectedVendor,
        setSelectedVendor,
        contractorOptions,
        selectedContractor,
        setSelectedContractor,
        selectedQuantity,
        setSelectedQuantity,
        selectedDescription,
        setSelectedDescription,
        categoryOptions,
        selectedCategory,
        setSelectedCategory,
        accountTypeOptions,
        selectedAccountType,
        setSelectedAccountType,
        branchFilterOptions,
        selectedBranch,
        setSelectedBranch,
        enoOptions,
        selectedEno,
        setSelectedEno,
        customStyles: tableFilterSelectStyles,
        formatDate,
        formatDateOnly,
        getBranchName,
        billArrivalFilterRef,
        }),
        paymentModeFilterOptions,
        selectedPaymentMode,
        setSelectedPaymentMode,
    }), [
        currentItems,
        showFilters,
        totalAmount,
        timestampStartDate,
        timestampEndDate,
        showTimestampDateRangePicker,
        selectedExpenseDate,
        projectNameOptions,
        selectedSiteName,
        vendorOptions,
        selectedVendor,
        contractorOptions,
        selectedContractor,
        selectedQuantity,
        selectedDescription,
        categoryOptions,
        selectedCategory,
        accountTypeOptions,
        selectedAccountType,
        paymentModeFilterOptions,
        selectedPaymentMode,
        branchFilterOptions,
        selectedBranch,
        enoOptions,
        selectedEno,
        tableFilterSelectStyles,
        branchOptions,
    ]);
    return (
        <body className=' bg-[#FAF6ED]'>
            <div className='flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]'>
                <div className='px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]'>
                <div className="w-full pt-[18px] px-[18px] pb-[18px] rounded-[6px] bg-white mb-[18px] shrink-0">
                    <div className="flex flex-wrap lg:flex-nowrap gap-[12px] items-end">
                        <div className="flex flex-col">
                            <label className="font-semibold text-left text-[16px]">Entry Date</label>
                            <div className="mt-2 w-full max-w-[155px]">
                                <CustomDateField
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    placeholder="Date"
                                    alwaysOpenBelow
                                    className={` [&>div:first-child]:!h-[40px] [&>div:first-child]:!border-2 [&>div:first-child]:!border-[rgba(191,152,83,0.2)] [&>div:first-child]:!rounded-lg [&>div:first-child]:!shadow-none [&>div:first-child]:hover:!border-[rgba(191,152,83,0.4)]`}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 max-w-[320px] min-w-0">
                            <label className="font-semibold text-left text-[16px]">Project Name</label>
                            <Select
                                className="mt-2 min-w-0 w-full"
                                classNames={nameSelectClassNames}
                                options={projectNameOptions}
                                value={selectedSiteName ? { value: selectedSiteName, label: selectedSiteName } : null}
                                onChange={(selectedOption) => setSelectedSiteName(selectedOption ? selectedOption.value : '')}
                                placeholder="Project Name"
                                isClearable
                                styles={customSelectStyles}
                            />
                        </div>
                        <div className="flex flex-col flex-1 max-w-[260px] min-w-0">
                            <label className="font-semibold text-left text-[16px]">Vendor Name</label>
                            <Select
                                className="mt-2 min-w-0 w-full"
                                classNames={nameSelectClassNames}
                                options={vendorOptions}
                                value={selectedVendor ? { value: selectedVendor, label: selectedVendor } : null}
                                onChange={(selectedOption) => setSelectedVendor(selectedOption ? selectedOption.value : '')}
                                placeholder="Vendor Name"
                                isClearable
                                styles={customSelectStyles}
                            />
                        </div>
                        <div className="flex flex-col flex-1 max-w-[260px] min-w-0">
                            <label className="font-semibold text-left text-[16px]">Contractor Name</label>
                            <Select
                                className="mt-2 min-w-0 w-full"
                                classNames={nameSelectClassNames}
                                options={contractorOptions}
                                value={selectedContractor ? { value: selectedContractor, label: selectedContractor } : null}
                                onChange={(selectedOption) => setSelectedContractor(selectedOption ? selectedOption.value : '')}
                                placeholder="Contractor Name"
                                isClearable
                                styles={customSelectStyles}
                            />
                        </div>
                        <div className="flex flex-col flex-1 max-w-[200px] min-w-0">
                            <label className="font-semibold text-left text-[16px]">A/C Type</label>
                            <Select
                                className="mt-2 min-w-0 w-full"
                                classNames={nameSelectClassNames}
                                options={accountTypeOptions.map(type => ({ value: type, label: type }))}
                                value={selectedAccountType ? { value: selectedAccountType, label: selectedAccountType } : null}
                                onChange={(selectedOption) => setSelectedAccountType(selectedOption ? selectedOption.value : '')}
                                placeholder="A/C Type"
                                isClearable
                                styles={customSelectStyles}
                            />
                        </div>                        
                        <div className="flex flex-col">
                            <label className="font-semibold text-left text-[16px]">No Of Bills</label>
                            <div className="w-full lg:w-[80px] h-[40px] p-2 mt-2 rounded-lg bg-[#EDEDED] border-2 border-[rgba(191,152,83,0.2)] hover:border-[rgba(191,152,83,0.4)] text-left">
                                {isAnyFilterSelected ? filteredCount : ''}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold text-left text-[16px]">Amount</label>
                            <div className="w-full lg:w-[140px] h-[40px] p-2 mt-2 rounded-lg bg-[#EDEDED] border-2 border-[rgba(191,152,83,0.2)] hover:border-[rgba(191,152,83,0.4)] text-left">
                                {isAnyFilterSelected
                                    ? `₹${Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}`
                                    : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full pt-[18px] px-[18px] pb-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div
                            className={`text-left flex ${isAnyFilterSelected
                                ? 'flex-col sm:flex-row sm:justify-between'
                                : 'flex-row justify-between items-center'
                                } mb-3 gap-2`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                                <button
                                    className=''
                                    onClick={() => {
                                        const willOpen = !showFilters;
                                        setShowFilters(willOpen);
                                        if (!willOpen) return;
                                        const scroller = scrollRef.current;
                                        if (!scroller) return;
                                        if (scroller.scrollTop <= 0) return;
                                        if (filterNudgeUsedRef.current) return;
                                        filterNudgeUsedRef.current = true;
                                        requestAnimationFrame(() => {
                                            requestAnimationFrame(() => {
                                                const h = filterRowRef.current?.offsetHeight || 0;
                                                if (h > 0) {
                                                    scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
                                                }
                                            });
                                        });
                                    }}
                                >
                                    <img
                                        src={Filter}
                                        alt="Toggle Filter"
                                        className=" border rounded-md"
                                    />
                                </button>
                                {isAnyFilterSelected && (
                                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                                        {timestampStartDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-[16px] w-fit">
                                                <span className="font-semibold">Timestamp: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{formatChipDateDMY(timestampStartDate)}{timestampEndDate ? ` – ${formatChipDateDMY(timestampEndDate)}` : ' onwards'}</span>
                                                <button onClick={() => { setTimestampStartDate(''); setTimestampEndDate(''); }} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {timestampEndDate && !timestampStartDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-sm w-fit">
                                                <span className="font-semibold">Timestamp until: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{formatChipDateDMY(timestampEndDate)}</span>
                                                <button onClick={() => setTimestampEndDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {selectedDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-sm w-fit">
                                                <span className="font-semibold">Date: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{formatChipDateDMY(selectedDate)}</span>
                                                <button onClick={() => setSelectedDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {selectedStartDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-[16px] w-fit">
                                                <span className="font-semibold">Date Range: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{formatChipDateDMY(selectedStartDate)}{selectedEndDate ? ` – ${formatChipDateDMY(selectedEndDate)}` : ' onwards'}</span>
                                                <button onClick={() => { setSelectedStartDate(''); setSelectedEndDate(''); }} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {selectedEndDate && !selectedStartDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-sm w-fit">
                                                <span className="font-semibold">Date Range until: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{formatChipDateDMY(selectedEndDate)}</span>
                                                <button onClick={() => setSelectedEndDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {selectedExpenseDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-sm w-fit">
                                                <span className="font-semibold">Date: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{formatChipDateDMY(selectedExpenseDate)}</span>
                                                <button onClick={() => setSelectedExpenseDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {selectedQuantity.trim() && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit">
                                                <span className="font-semibold">Quantity: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{selectedQuantity}</span>
                                                <button onClick={() => setSelectedQuantity('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedDescription.trim() && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit">
                                                <span className="font-semibold">Description: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{selectedDescription}</span>
                                                <button onClick={() => setSelectedDescription('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedBranch && (
                                                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit">
                                                <span className="font-semibold">Branch: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{getBranchName(selectedBranch) || selectedBranch}</span>
                                                <button onClick={() => setSelectedBranch('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedEno && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit">
                                                <span className="font-semibold">Entry No: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{selectedEno}</span>
                                                <button onClick={() => setSelectedEno('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedVendor && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit">
                                                <span className="font-semibold">Vendor Name: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{selectedVendor}</span>
                                                <button onClick={() => setSelectedVendor('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedContractor && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit">
                                                <span className="font-semibold">Contractor Name: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{selectedContractor}</span>
                                                <button onClick={() => setSelectedContractor('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedSiteName && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit">
                                                <span className="font-semibold">Project Name: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{selectedSiteName}</span>
                                                <button onClick={() => setSelectedSiteName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedCategory && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit">
                                                <span className="font-semibold">Category: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{selectedCategory}</span>
                                                <button onClick={() => setSelectedCategory('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedAccountType && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit">
                                                <span className="font-semibold">A/C Type: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{selectedAccountType}</span>
                                                <button onClick={() => setSelectedAccountType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedPaymentMode && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit">
                                                <span className="font-semibold">Mode: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{selectedPaymentMode === BLANK_VALUE ? blankOption.label : selectedPaymentMode}</span>
                                                <button onClick={() => setSelectedPaymentMode('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedMachineTools && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit">
                                                <span className="font-semibold">Tools: </span>
                                                <span className="font-semibold text-[14px] text-[#000000]">{selectedMachineTools}</span>
                                                <button onClick={() => setSelectedMachineTools('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className='flex items-end gap-[6px]'>
                                <button onClick={clearFilters} className='flex h-[34px] w-[34px] shrink-0 items-center justify-center'>
                                    <img className='w-full h-full' src={Reload} alt="Reload" />
                                </button>
                                <div className="w-[286px] min-w-[286px] shrink-0 h-[34px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 gap-1">
                                    <input
                                        type="text"
                                        value={overallSearch}
                                        onChange={(e) => setOverallSearch(e.target.value)}
                                        placeholder="Search Transactions..."
                                        className="h-full w-full border-0 p-0 text-[14px] text-[#000000] bg-transparent outline-none"
                                    />
                                    <img src={Search} alt="Search" className="w-[16px] h-[16px] pointer-events-none" />
                                </div>
                                <span className='text-[#E4572E] flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={generateFilteredPDF}>PDF<img src={Pdf} alt="Pdf" className='w-4 h-4' /></span>
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div ref={scrollRef}
                            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-auto no-scrollbar scrollbar-none select-none relative"
                            onWheel={() => { filterNudgeUsedRef.current = false; }}
                            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                        >
                            {!isAnyFilterSelected && expenses.length > 0 && (
                                <div className={`absolute inset-x-0 bottom-0 flex items-center justify-center text-[16px] font-medium text-[#666666] pointer-events-none z-[1] ${showFilters ? 'top-[84px]' : 'top-[40px]'}`}>
                                    <span>Select the filter after the data has loaded</span>
                                </div>
                            )}
                            <TableProvider value={entryCheckTableContext}>
                              <Table showActivityColumn={false} />
                            </TableProvider>
                        </div>
                        {isAnyFilterSelected && filteredExpenses.length > 0 && (
                            <div className="flex shrink-0 items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">Items per page:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                    >
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                        <option value={200}>200</option>
                                        <option value={300}>300</option>
                                        <option value={400}>400</option>
                                        <option value={500}>500</option>
                                        <option value={600}>600</option>
                                        <option value={700}>700</option>
                                        <option value={800}>800</option>
                                        <option value={900}>900</option>
                                        <option value={1000}>1000</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">
                                        Showing {startIndex + 1} to {Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length} entries
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#BF9853] ${currentPage === pageNum
                                                    ? 'bg-[#BF9853] text-white border-[#BF9853]'
                                                    : 'border-gray-300 hover:bg-[#BF9853] hover:text-white'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
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