import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import edit from '../Images/Edit.svg';
import Select from 'react-select';
import Filter from '../Images/filter (3).png'
import Reload from '../Images/rotate-right.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import XL from '../Images/sheets.png'
import Pdf from '../Images/pdf.png'
Modal.setAppElement('#root');
const TOOLS_API_BASE = 'https://backendaab.in/demoAabuildersDash';
// Date Range Picker Component
const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tempStartDate, setTempStartDate] = useState(null);
    const [tempEndDate, setTempEndDate] = useState(null);
    const datePickerRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);
    const formatDate = (dateString) => {
        if (!dateString) return '';
        // If dateString is already in YYYY-MM-DD format, parse it directly
        if (dateString.includes('-') && dateString.length === 10) {
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        }
        // Otherwise, parse as Date object
        const d = new Date(dateString);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const getDisplayText = () => {
        if (startDate && endDate) {
            return `${formatDate(startDate)} to ${formatDate(endDate)}`;
        } else if (startDate) {
            return `${formatDate(startDate)} to ...`;
        }
        return 'Select Date';
    };
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };
    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };
    const formatDateToString = (year, month, day) => {
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${monthStr}-${dayStr}`;
    };
    const handleDateClick = (day, isCurrentMonth) => {
        if (!isCurrentMonth) return;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const dateString = formatDateToString(year, month, day);
        if (!tempStartDate || (tempStartDate && tempEndDate)) {
            setTempStartDate(dateString);
            setTempEndDate(null);
        } else if (tempStartDate && !tempEndDate) {
            let finalStartDate = tempStartDate;
            let finalEndDate = dateString;
            if (dateString < tempStartDate) {
                finalStartDate = dateString;
                finalEndDate = tempStartDate;
            }
            setTempStartDate(finalStartDate);
            setTempEndDate(finalEndDate);
            // Auto-apply when both dates are selected
            setTimeout(() => {
                onStartDateChange(finalStartDate);
                onEndDateChange(finalEndDate);
                setIsOpen(false);
            }, 0);
        }
    };
    const handleDone = () => {
        if (tempStartDate) {
            onStartDateChange(tempStartDate);
            if (tempEndDate) {
                onEndDateChange(tempEndDate);
            } else {
                onEndDateChange('');
            }
        }
        setIsOpen(false);
    };
    const handleCancel = () => {
        setTempStartDate(startDate || null);
        setTempEndDate(endDate || null);
        setIsOpen(false);
    };
    const handleClear = () => {
        setTempStartDate(null);
        setTempEndDate(null);
        onStartDateChange('');
        onEndDateChange('');
        setIsOpen(false);
    };
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };
    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };
    const isDateInRange = (day, isCurrentMonth) => {
        if (!tempStartDate || !isCurrentMonth) return false;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const dateString = formatDateToString(year, month, day);
        if (tempStartDate && tempEndDate) {
            return dateString >= tempStartDate && dateString <= tempEndDate;
        } else if (tempStartDate) {
            return dateString === tempStartDate;
        }
        return false;
    };
    const isStartDate = (day, isCurrentMonth) => {
        if (!tempStartDate || !isCurrentMonth) return false;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const dateString = formatDateToString(year, month, day);
        return dateString === tempStartDate;
    };
    const isEndDate = (day, isCurrentMonth) => {
        if (!tempEndDate || !isCurrentMonth) return false;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const dateString = formatDateToString(year, month, day);
        return dateString === tempEndDate;
    };
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    // Previous month's trailing days
    const prevMonthDays = getDaysInMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, isCurrentMonth: true });
    }
    // Next month's leading days
    const totalCells = 42; // 6 rows * 7 days
    const remainingDays = totalCells - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({ day: i, isCurrentMonth: false });
    }
    useEffect(() => {
        if (isOpen) {
            setTempStartDate(startDate || null);
            setTempEndDate(endDate || null);
        }
    }, [isOpen, startDate, endDate]);
    return (
        <div className="relative" ref={datePickerRef}>
            <input
                type="text"
                readOnly
                value={getDisplayText()}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 text-xs bg-transparent focus:outline-none  cursor-pointer"
                placeholder="Select Date Range"
            />
            {isOpen && (
                <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4" style={{ minWidth: '320px' }}>
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={prevMonth}
                            className="p-1 hover:bg-gray-100 rounded"
                            type="button"
                        >
                            <span className="text-lg">‹</span>
                        </button>
                        <h3 className="font-semibold text-base">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <button
                            onClick={nextMonth}
                            className="p-1 hover:bg-gray-100 rounded"
                            type="button"
                        >
                            <span className="text-lg">›</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day, idx) => (
                            <div key={idx} className="text-center text-xs font-medium text-gray-600 py-1">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((dateObj, idx) => {
                            const { day, isCurrentMonth } = dateObj;
                            const inRange = isDateInRange(day, isCurrentMonth);
                            const isStart = isStartDate(day, isCurrentMonth);
                            const isEnd = isEndDate(day, isCurrentMonth);

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleDateClick(day, isCurrentMonth)}
                                    disabled={!isCurrentMonth}
                                    className={`
                                        py-2 text-sm rounded
                                        ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                                        ${isStart || isEnd ? 'bg-black text-white font-semibold' : ''}
                                        ${inRange && !isStart && !isEnd ? 'bg-gray-200' : ''}
                                        ${isCurrentMonth && !inRange && !isStart && !isEnd ? 'text-black' : ''}
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-4 pt-4 border-t">
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                            type="button"
                        >
                            Clear
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDone}
                                className="px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100 rounded"
                                type="button"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
const TableViewExpense = ({ username, userRoles = [] }) => {
    const TELECOM_DIRECTORY_ENDPOINT = 'https://backendaab.in/demoAabuildersDash/api/utility-telecom/getAll';
    const resolveActiveBranchId = useCallback(() => {
        try {
            const selectedBranchId = localStorage.getItem("selectedBranchId");
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const fallbackBranchId = user?.branchId ?? user?.branch_id ?? user?.brachId;
            const resolved = Number(selectedBranchId || fallbackBranchId);
            return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
        } catch {
            return null;
        }
    }, []);
    const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [exportFilteredExpenses, setExportFilteredExpenses] = useState([]);
    const [editId, setEditId] = useState(null);
    const sentToWeeklyPaymentBillsRef = useRef(new Set());
    const [siteOptions, setSiteOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [machineToolsOptions, setMachineToolsOptions] = useState([]);
    const [machineToolsCatalog, setMachineToolsCatalog] = useState([]);
    const [branchOptions, setBranchOptions] = useState([]);
    const [laboursList, setLaboursList] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [selectedSiteName, setSelectedSiteName] = useState(() => {
        return localStorage.getItem('expenseFilter_siteName') || '';
    });
    const [selectedVendor, setSelectedVendor] = useState(() => {
        return localStorage.getItem('expenseFilter_vendor') || '';
    });
    const [selectedContractor, setSelectedContractor] = useState(() => {
        return localStorage.getItem('expenseFilter_contractor') || '';
    });
    const [selectedCategory, setSelectedCategory] = useState(() => {
        return localStorage.getItem('expenseFilter_category') || '';
    });
    const [enoOptions, setEnoOptions] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedEno, setSelectedEno] = useState(() => {
        return localStorage.getItem('expenseFilter_eno') || '';
    });
    const [accountTypeOptions, setAccountTypeOptions] = useState([]);
    const [selectedMachineTools, setSelectedMachineTools] = useState(() => {
        return localStorage.getItem('expenseFilter_machineTools') || '';
    });
    const [startDate, setStartDate] = useState(() => {
        return localStorage.getItem('expenseFilter_startDate') || '';
    });
    const [endDate, setEndDate] = useState(() => {
        return localStorage.getItem('expenseFilter_endDate') || '';
    });
    const [selectedAccountType, setSelectedAccountType] = useState(() => {
        return localStorage.getItem('expenseFilter_accountType') || '';
    });
    const [accountTypeOption, setAccountTypeOption] = useState([]);
    const [editAccountTypeOptions, setEditAccountTypeOptions] = useState([]);
    const [siteOption, setSiteOption] = useState([]);
    const [vendorOption, setVendorOption] = useState([]);
    const [contractorOption, setContractorOption] = useState([]);
    const [categoryOption, setCategoryOption] = useState([]);
    const [machineToolsOption, setMachineToolsOption] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
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
        localStorage.setItem('expenseFilter_siteName', selectedSiteName);
    }, [selectedSiteName]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_vendor', selectedVendor);
    }, [selectedVendor]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_contractor', selectedContractor);
    }, [selectedContractor]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_category', selectedCategory);
    }, [selectedCategory]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_machineTools', selectedMachineTools);
    }, [selectedMachineTools]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_accountType', selectedAccountType);
    }, [selectedAccountType]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_startDate', startDate);
    }, [startDate]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_endDate', endDate);
    }, [endDate]);
    useEffect(() => {
        const fetchAccountDetails = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/account-details/getAll');
                if (response.ok) {
                    const data = await response.json();
                    setAccountDetails(data);
                }
            } catch (err) {
                console.error('Error fetching account details:', err);
            }
        };
        fetchAccountDetails();
    }, []);
    useEffect(() => {
        localStorage.setItem('expenseFilter_eno', selectedEno);
    }, [selectedEno]);
    const [formData, setFormData] = useState({
        accountType: '',
        date: '',
        siteName: '',
        vendor: '',
        quantity: '',
        contractor: '',
        amount: '',
        category: '',
        otherVendorName: '',
        otherContractorName: '',
        machineTools: '',
        billCopy: '',
        paymentMode: '',
        utilityType: '',
        utilityTypeNumber: '',
        utilityForTheMonth: '',
        utilityValidityDays: '',
        utilityValidityType: '',
        serviceStartingDate: '',
        projectId: '',
        vendorId: '',
        contractorId: ''
    });
    const [projectData, setProjectData] = useState(null);
    const [ebNumberOptions, setEbNumberOptions] = useState([]);
    const [selectedEbNumber, setSelectedEbNumber] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const fetchProjectData = async (projectId) => {
        try {
            if (!projectId) return null;
            const response = await fetch(`https://backendaab.in/demoAabuilderDash/api/projects/get/${projectId}`);
            if (!response.ok) return null;
            const data = await response.json();
            setProjectData(data);
            return data;
        } catch (error) {
            console.error("Error fetching project data:", error);
            return null;
        }
    };

    const updateEbNumberOptions = async (utilityType, project) => {
        if (!utilityType) {
            setEbNumberOptions([]);
            return;
        }
        if (utilityType === 'Telecom') {
            const pid =
                project?.id ??
                project?.projectId ??
                project?.project_id ??
                formData?.projectId ??
                null;
            if (!pid) {
                setEbNumberOptions([]);
                return;
            }
            try {
                const res = await axios.get(TELECOM_DIRECTORY_ENDPOINT);
                const rows = Array.isArray(res.data) ? res.data : [];
                const serviceNos = rows
                    .filter(r => String(r?.project_id ?? r?.projectId ?? '') === String(pid))
                    .map(r => r?.service_number ?? r?.serviceNumber ?? '')
                    .map(v => String(v || '').trim())
                    .filter(Boolean);
                const unique = Array.from(new Set(serviceNos));
                setEbNumberOptions(unique.map((no, idx) => ({ value: no, label: no, id: idx })));
            } catch (e) {
                console.error('Failed to fetch telecom service numbers', e);
                setEbNumberOptions([]);
            }
            return;
        }
        if (!project || !project.propertyDetails) {
            setEbNumberOptions([]);
            return;
        }
        const options = [];
        project.propertyDetails.forEach((property, index) => {
            let optionValue = '';
            switch (utilityType) {
                case 'Electricity':
                    optionValue = property.ebNo || '';
                    break;
                case 'Property':
                    optionValue = property.propertyTaxNo || '';
                    break;
                case 'Water':
                    optionValue = property.waterTaxNo || '';
                    break;
                default:
                    return;
            }
            const v = String(optionValue || '').trim();
            if (v) options.push({ value: v, label: v, id: index });
        });
        setEbNumberOptions(options);
    };

    useEffect(() => {
        if (!modalIsOpen) return;
        if (formData.accountType !== 'Utility Bills') return;
        if (!formData.projectId) return;
        fetchProjectData(formData.projectId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalIsOpen, formData.accountType, formData.projectId]);

    useEffect(() => {
        if (!modalIsOpen) return;
        if (formData.accountType !== 'Utility Bills') return;
        if (!formData.utilityType) {
            setEbNumberOptions([]);
            setSelectedEbNumber(null);
            return;
        }
        if (projectData) updateEbNumberOptions(formData.utilityType, projectData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalIsOpen, formData.accountType, formData.utilityType, projectData]);

    useEffect(() => {
        if (!modalIsOpen) return;
        if (formData.accountType !== 'Utility Bills') return;
        if (!formData.utilityTypeNumber) {
            setSelectedEbNumber(null);
            return;
        }
        const target = String(formData.utilityTypeNumber).trim();
        const opt = ebNumberOptions.find(o => String(o.value).trim() === target || String(o.label).trim() === target);
        if (opt) setSelectedEbNumber(opt);
    }, [modalIsOpen, formData.accountType, formData.utilityTypeNumber, ebNumberOptions]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentModalData, setPaymentModalData] = useState({
        chequeNo: '',
        chequeDate: '',
        transactionNumber: '',
        accountNumber: ''
    });
    const [accountDetails, setAccountDetails] = useState([]);
    const pendingUpdateFormDataRef = useRef(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const moduleName = "Expense Entry";
    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                const response = await axios.get("https://backendaab.in/demoAabuilderDash/api/user_roles/all");
                const allRoles = response.data;
                const userRoleNames = userRoles.map(r => r.roles);
                const matchedRoles = allRoles.filter(role =>
                    userRoleNames.includes(role.userRoles)
                );
                const models = matchedRoles.flatMap(role => role.userModels || []);
                const matchedModel = models.find(role => role.models === moduleName);
                const permissions = matchedModel?.permissions?.[0]?.userPermissions || [];
                setUserPermissions(permissions);
            } catch (error) {
                console.error("Error fetching user roles:", error);
            }
        };
        if (userRoles.length > 0) {
            fetchUserRoles();
        }
    }, [userRoles]);
    useEffect(() => {
        const syncBranch = () => {
            const nextBranchId = resolveActiveBranchId();
            setActiveBranchId((prevBranchId) =>
                prevBranchId === nextBranchId ? prevBranchId : nextBranchId
            );
        };
        syncBranch();
        window.addEventListener("branchSelectionChanged", syncBranch);
        return () => {
            window.removeEventListener("branchSelectionChanged", syncBranch);
        };
    }, [resolveActiveBranchId]);
    useEffect(() => {
        axios
            .get('https://backendaab.in/demoAabuilderDash/expenses_form/get_form', {
                params: activeBranchId ? { branchId: activeBranchId } : {},
            })
            .then((response) => {
                const sortedExpenses = response.data.sort((a, b) => {
                    const enoA = parseInt(a.eno, 10);
                    const enoB = parseInt(b.eno, 10);
                    return enoB - enoA;
                });
                setExpenses(sortedExpenses);
                setFilteredExpenses(sortedExpenses);
                const uniqueEnos = [...new Set(response.data.map(expense => expense.eno))];
                const uniqueAccountTypes = [...new Set(response.data.map(expense => expense.accountType))];
                const uniqueProjectNames = [...new Set(response.data.map(expense => expense.siteName))];
                const siteOptions = uniqueProjectNames.map(name => ({ value: name, label: name }));
                const uniqueVendorOptions = [...new Set(response.data.map(expense => expense.vendor))];
                const vendorOptions = uniqueVendorOptions.map(name => ({ value: name, label: name }));
                const uniqueContractorOptions = [...new Set(response.data.map(expense => expense.contractor))];
                const uniqueCategoryOptions = [...new Set(response.data.map(expense => expense.category))];
                const contractorOption = uniqueContractorOptions.map(name => ({ value: name, label: name }));
                const categoryOption = uniqueCategoryOptions.map(name => ({ value: name, label: name }));
                setEnoOptions(uniqueEnos);
                setAccountTypeOptions(uniqueAccountTypes);
                setSiteOptions(siteOptions);
                setVendorOptions(vendorOptions);
                setContractorOptions(contractorOption);
                setCategoryOptions(categoryOption);
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
            });
    }, [activeBranchId]);
    useEffect(() => {
        const fetchSites = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/project_Names/getAll", {
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
                    id: item.id,
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
    useEffect(() => {
        const fetchVendorNames = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll", {
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
                    id: item.id,
                    value: item.vendorName,
                    label: item.vendorName,
                    type: "Vendor",
                }));
                setVendorOption(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchVendorNames();
    }, []);
    useEffect(() => {
        const fetchContractorNames = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll", {
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
                    id: item.id,
                    value: item.contractorName,
                    label: item.contractorName,
                    type: "Contractor",
                }));
                setContractorOption(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchContractorNames();
    }, []);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/expenses_categories/getAll", {
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
                    value: item.category,
                    label: item.category,
                }));
                setCategoryOption(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchCategories();
    }, []);
    useEffect(() => {
        const fetchMachinTools = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/machine_tools/getAll", {
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
                    value: item.machineTool,
                    label: item.machineTool,
                }));
                setMachineToolsOption(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchMachinTools();
    }, []);
    useEffect(() => {
        const fetchToolsItemIds = async () => {
            try {
                const response = await fetch(`${TOOLS_API_BASE}/api/tools_item_id/getAll`, {
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
                const list = Array.isArray(data) ? data : [];
                const formattedData = list
                    .map((item) => {
                        const rowId = item.id;
                        const itemIdStr = item.item_id ?? item.itemId ?? "";
                        const itemNameIdStr = item.item_name_id ?? item.itemNameId ?? "";
                        const label =
                            itemIdStr ||
                            (rowId != null ? String(rowId) : "");
                        return {
                            value: rowId != null ? String(rowId) : itemIdStr,
                            label,
                            id: rowId,
                            item_id: itemIdStr,
                            item_name_id: itemNameIdStr,
                        };
                    })
                    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
                setMachineToolsCatalog(formattedData);
            } catch (error) {
                console.error("Fetch error (tools_item_id): ", error);
            }
        };
        fetchToolsItemIds();
    }, []);
    const machineToolsIdToLabel = useMemo(() => {
        const map = {};
        machineToolsCatalog.forEach((opt) => {
            if (opt.id != null) {
                const label = String(opt.label ?? opt.item_id ?? opt.id);
                map[opt.id] = label;
                map[String(opt.id)] = label;
                map[Number(opt.id)] = label;
            }
        });
        return map;
    }, [machineToolsCatalog]);
    const getMachineToolsItemIdDisplay = useCallback((val) => {
        if (val == null || val === "") return "";
        const resolved =
            machineToolsIdToLabel[val] ??
            machineToolsIdToLabel[String(val)] ??
            machineToolsIdToLabel[Number(val)];
        if (resolved != null && resolved !== "") return resolved;
        return String(val);
    }, [machineToolsIdToLabel]);
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
        const fetchAccountType = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/account_type/getAll", {
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
                    value: item.accountType,
                    label: item.accountType,
                    id: item.id,
                }));
                setAccountTypeOption(formattedData);
                setEditAccountTypeOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchAccountType();
    }, []);
    useEffect(() => {
        const fetchLaboursList = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/labours-details/getAll');
                if (response.ok) {
                    const data = await response.json();
                    const formattedData = data.map(item => ({
                        value: item.labour_name,
                        label: item.labour_name,
                        id: item.id,
                        type: "Labour",
                        salary: item.labour_salary,
                        extra: item.extra_amount
                    }));
                    setLaboursList(formattedData);
                } else {
                    console.log('Error fetching Labour names.');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchLaboursList();
    }, []);
    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuildersDash/api/employee_details/getAll", {
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
        fetchEmployeeDetails();
    }, []);
    const generateFilteredPDF = () => {
        if (exportFilteredExpenses.length === 0) {
            alert("No filtered data to export.");
            return;
        }
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(16);
        doc.text("Filtered Expenses Report", 14, 15);
        autoTable(doc, {
            startY: 25,
            head: [['Date', 'Site', 'Vendor', 'Contractor',
                'Qty', 'Amount', 'Comments', 'Category', 'A/C Type',
                'Machine Tools', 'E.No'
            ]],
            body: exportFilteredExpenses.map(exp => [
                formatDateOnly(exp.date),
                getDisplaySiteName(exp),
                getDisplayVendorName(exp),
                getDisplayContractorName(exp),
                exp.quantity,
                parseInt(exp.amount).toLocaleString(),
                exp.comments,
                exp.category,
                exp.accountType,
                getMachineToolsItemIdDisplay(exp.machineTools),
                exp.eno
            ]),
            styles: {
                fontSize: 8,
            },
            headStyles: {
                fillColor: [191, 152, 83],
            },
        });
        const dateStr = new Date().toISOString().slice(0, 10);
        doc.save(`Filtered_Expenses_${dateStr}.pdf`);
    };
    useEffect(() => {
        const filtered = expenses.filter(expense => {
            if (startDate && endDate) {
                const s = new Date(startDate);
                const e = new Date(endDate);
                e.setHours(23, 59, 59, 999);
                const expenseDate = new Date(expense.date);
                if (expenseDate < s || expenseDate > e) return false;
            } else if (startDate) {
                const s = new Date(startDate);
                s.setHours(0, 0, 0, 0);
                const expenseDate = new Date(expense.date);
                if (expenseDate < s) return false;
            } else if (endDate) {
                const e = new Date(endDate);
                e.setHours(23, 59, 59, 999);
                const expenseDate = new Date(expense.date);
                if (expenseDate > e) return false;
            }
            return (
                (selectedSiteName ? expense.siteName === selectedSiteName : true) &&
                (selectedVendor ? expense.vendor === selectedVendor : true) &&
                (selectedContractor ? expense.contractor === selectedContractor : true) &&
                (selectedCategory ? expense.category === selectedCategory : true) &&
                (selectedMachineTools ? String(expense.machineTools ?? '') === String(selectedMachineTools) : true) &&
                (selectedAccountType ?
                    (selectedAccountType === 'Unknown' ?
                        (!expense.accountType || expense.accountType === '') :
                        expense.accountType === selectedAccountType
                    ) : true) &&
                (selectedEno ? String(expense.eno) === String(selectedEno) : true)
            );
        });
        setFilteredExpenses(filtered);
        setCurrentPage(1);
        const anyFilterApplied = [
            selectedSiteName,
            selectedVendor,
            selectedContractor,
            selectedCategory,
            selectedMachineTools,
            selectedAccountType,
            startDate,
            endDate,
            selectedEno
        ].some(Boolean);
        setExportFilteredExpenses(anyFilterApplied ? filtered : []);
        const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        setTotalAmount(total);
        const getOptions = (data, key) => {
            const unique = [...new Set(data.map(item => item[key]).filter(Boolean))];
            return unique.map(val => ({ value: val, label: val }));
        };
        setSiteOptions(getOptions(filtered, "siteName"));
        setVendorOptions(getOptions(filtered, "vendor"));
        setContractorOptions(getOptions(filtered, "contractor"));
        setCategoryOptions(getOptions(filtered, "category"));
        const uniqueToolIds = [...new Set(filtered.map((item) => item.machineTools).filter((v) => v != null && v !== ''))];
        setMachineToolsOptions(
            uniqueToolIds.map((id) => ({
                value: String(id),
                label:
                    machineToolsIdToLabel[id] ??
                    machineToolsIdToLabel[String(id)] ??
                    String(id),
            }))
        );
        setAccountTypeOptions(getOptions(filtered, "accountType"));
        setEnoOptions([...new Set(filtered.map(item => item.eno).filter(Boolean))]);
    }, [
        selectedSiteName,
        selectedVendor,
        selectedContractor,
        selectedCategory,
        selectedMachineTools,
        selectedAccountType,
        startDate,
        endDate,
        selectedEno,
        expenses,
        machineToolsIdToLabel
    ]);
    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        if (name === "date" && value === "") {
            return;
        }
        if (name === "utilityType") {
            setSelectedEbNumber(null);
            setEbNumberOptions([]);
            setFormData({
                ...formData,
                utilityType: value,
                utilityTypeNumber: "",
            });
            return;
        }
        setFormData({
            ...formData,
            [name]: type === "file" ? files[0] : value
        });
    };
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const handleSave = async (event) => {
        event.preventDefault();
        let updatedBillCopy = formData.billCopy;
        setIsSubmitting(true);
        if (selectedFile) {
            try {
                const uploadFormData = new FormData();

                const now = new Date();
                const timestamp = now.toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                })
                    .replace(",", "")
                    .replace(/\s/g, "-");

                const finalName = `${timestamp}-${formData.siteName}-${formData.vendor || formData.contractor}`;

                // ✅ CHANGE 1: key must be "files"
                uploadFormData.append("files", selectedFile);

                // ✅ CHANGE 2: required folder
                uploadFormData.append("folder", "FileUpload / Expenses_Entry_Files");

                // ✅ CHANGE 3: optional filename
                uploadFormData.append("fileName", finalName);

                const uploadResponse = await fetch("https://backendaab.in/demoAabuildersDash/api/files/upload", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) {
                    throw new Error("File upload failed");
                }

                const result = await uploadResponse.json();

                // ✅ CHANGE 4: new response structure
                updatedBillCopy = result.urls[0];

            } catch (error) {
                console.error("Error during file upload:", error);
                alert("Error during file upload. Please try again.");
                setIsSubmitting(false);
                return;
            }
        }
        const updatedFormData = {
            ...formData,
            billCopy: updatedBillCopy,
            editedBy: username,
        };
        const isPaymentType = (updatedFormData.accountType === 'Claim' || updatedFormData.accountType === 'Utility Bills' || updatedFormData.accountType === 'Weekly Payment');
        const isNonCashPaymentMode = ['GPay', 'PhonePe', 'Net Banking', 'Cheque'].includes(updatedFormData.paymentMode);
        const previousPaymentMode = expenses.find(e => e.id === editId)?.paymentMode || '';
        const isChangingFromCashToOnline = previousPaymentMode === 'Cash' && isNonCashPaymentMode;
        if (isPaymentType && isNonCashPaymentMode && isChangingFromCashToOnline) {
            pendingUpdateFormDataRef.current = updatedFormData;
            setPaymentModalData({
                chequeNo: '',
                chequeDate: '',
                transactionNumber: '',
                accountNumber: ''
            });
            setShowPaymentModal(true);
            setIsSubmitting(false);
            return;
        }
        try {
            await performUpdateAndWeeklyBills(updatedFormData);
            setModalIsOpen(false);
            setIsSubmitting(false);
            alert('Updated successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Failed to update expense');
        }
    };
    const performUpdateAndWeeklyBills = async (updatedFormData, modalPaymentData = null) => {
        const response = await fetch(`https://backendaab.in/demoAabuilderDash/expenses_form/update/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedFormData)
        });
        if (!response.ok) throw new Error('Failed to update expense');
        setExpenses(expenses.map(exp => (exp.id === editId ? { ...exp, ...updatedFormData } : exp)));
        const isPaymentType = (updatedFormData.accountType === 'Claim' || updatedFormData.accountType === 'Utility Bills' || updatedFormData.accountType === 'Weekly Payment');
        const isNonCashPaymentMode = ['GPay', 'PhonePe', 'Net Banking', 'Cheque'].includes(updatedFormData.paymentMode);
        if (isPaymentType && isNonCashPaymentMode && editId && !sentToWeeklyPaymentBillsRef.current.has(editId)) {
            try {
                const weeklyPaymentBillPayload = {
                    date: updatedFormData.date,
                    created_at: new Date().toISOString(),
                    contractor_id: updatedFormData.contractorId || null,
                    vendor_id: updatedFormData.vendorId || null,
                    employee_id: null,
                    project_id: updatedFormData.projectId || null,
                    type: updatedFormData.accountType === 'Claim' ? 'Claim Payment' : updatedFormData.accountType === 'Weekly Payment' ? 'Weekly Payment' : 'Utility Payment',
                    bill_payment_mode: updatedFormData.paymentMode,
                    amount: parseFloat(updatedFormData.amount) || 0,
                    status: true,
                    weekly_number: '',
                    expenses_entry_id: editId,
                    advance_portal_id: null,
                    staff_advance_portal_id: null,
                    claim_payment_id: null,
                    cheque_number: (modalPaymentData && modalPaymentData.chequeNo) || null,
                    cheque_date: (modalPaymentData && modalPaymentData.chequeDate) || null,
                    transaction_number: (modalPaymentData && modalPaymentData.transactionNumber) || null,
                    account_number: (modalPaymentData && modalPaymentData.accountNumber) || null
                };
                const weeklyResponse = await fetch('https://backendaab.in/demoAabuildersDash/api/weekly-payment-bills/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(weeklyPaymentBillPayload)
                });
                if (weeklyResponse.ok) sentToWeeklyPaymentBillsRef.current.add(editId);
            } catch (weeklyErr) {
                console.error('Weekly payment bills save error:', weeklyErr);
            }
        }
    };
    const handlePaymentModalSubmit = async () => {
        if (!paymentModalData.accountNumber) {
            alert('Please select account number.');
            return;
        }
        if (formData.paymentMode === 'Cheque' && (!paymentModalData.chequeNo || !paymentModalData.chequeDate)) {
            alert('Please enter cheque number and date.');
            return;
        }
        const updatedFormData = pendingUpdateFormDataRef.current;
        if (!updatedFormData) return;
        setIsSubmitting(true);
        try {
            await performUpdateAndWeeklyBills(updatedFormData, paymentModalData);
            setShowPaymentModal(false);
            setModalIsOpen(false);
            setIsSubmitting(false);
            alert('Updated successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Failed to update expense');
            setIsSubmitting(false);
        }
    };
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };
    const customStyles = useMemo(() => ({
        control: (provided, state) => ({
            ...provided,
            borderWidth: '2px',
            lineHeight: '20px',
            fontSize: '12px',
            height: '45px',
            borderRadius: '8px',
            borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.3)' : 'rgba(191, 152, 83, 0.3)',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.3)' : 'none',
        }),
        clearIndicator: (provided) => ({
            ...provided,
            cursor: 'pointer',
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
            maxHeight: '300px',
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '250px',
            overflowY: 'auto',
        }),
        singleValue: (provided) => ({
            ...provided,
            fontWeight: '400',
            color: 'black',
            textAlign: 'left',
        }),
        option: (provided, state) => ({
            ...provided,
            fontWeight: '300',
            fontSize: '14px',
            backgroundColor: state.isSelected
                ? 'rgba(191, 152, 83, 0.3)'
                : state.isFocused
                    ? 'rgba(191, 152, 83, 0.1)'
                    : 'white',
            color: 'black',
            textAlign: 'left',
        }),
        input: (provided) => ({
            ...provided,
            fontWeight: '300',
            color: 'black',
            textAlign: 'left',
        }),
        placeholder: (provided) => ({
            ...provided,
            fontWeight: '500',
            color: '#999',
            textAlign: 'left',
        }),
        indicatorSeparator: (provided) => ({
            ...provided,
            display: 'none',
        }),
    }), []);
    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];
        if (sortField === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortField === 'eno') {
            aValue = parseInt(aValue) || 0;
            bValue = parseInt(bValue) || 0;
        } else if (sortField === 'machineTools') {
            aValue = String(getMachineToolsItemIdDisplay(a.machineTools) || '').toLowerCase();
            bValue = String(getMachineToolsItemIdDisplay(b.machineTools) || '').toLowerCase();
        } else {
            aValue = String(aValue || '').toLowerCase();
            bValue = String(bValue || '').toLowerCase();
        }
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = sortedExpenses.slice(startIndex, endIndex);
    const currentExportItems = exportFilteredExpenses;
    const accountTypeSummary = React.useMemo(() => {
        const summary = {};
        filteredExpenses.forEach(expense => {
            const accountType = expense.accountType || 'Unknown';
            if (!summary[accountType]) {
                summary[accountType] = {
                    totalAmount: 0,
                    entryCount: 0
                };
            }
            summary[accountType].totalAmount += Number(expense.amount) || 0;
            summary[accountType].entryCount += 1;
        });
        return summary;
    }, [filteredExpenses]);
    const projectIdToName = React.useMemo(() => {
        const map = {};
        siteOption.forEach(option => {
            if (option.id) {
                map[option.id] = option.label;
            }
        });
        return map;
    }, [siteOption]);
    const vendorIdToName = React.useMemo(() => {
        const map = {};
        vendorOption.forEach(option => {
            if (option.id) {
                map[option.id] = option.label;
            }
        });
        return map;
    }, [vendorOption]);
    const contractorIdToName = React.useMemo(() => {
        const map = {};
        contractorOption.forEach(option => {
            if (option.id) {
                map[option.id] = option.label;
            }
        });
        return map;
    }, [contractorOption]);
    const labourIdToName = React.useMemo(() => {
        const map = {};
        laboursList.forEach(option => {
            if (option.id) {
                // Store as both string and number to handle type mismatches
                map[option.id] = option.label;
                map[String(option.id)] = option.label;
                map[Number(option.id)] = option.label;
            }
        });
        return map;
    }, [laboursList]);
    const employeeIdToName = React.useMemo(() => {
        const map = {};
        employeeOptions.forEach(option => {
            if (option.id) {
                // Store as both string and number to handle type mismatches
                map[option.id] = option.label;
                map[String(option.id)] = option.label;
                map[Number(option.id)] = option.label;
            }
        });
        return map;
    }, [employeeOptions]);
    const getDisplaySiteName = (expense) => {
        if (expense.projectId && projectIdToName[expense.projectId]) {
            return projectIdToName[expense.projectId];
        }
        return expense.siteName || '';
    };
    const getDisplayVendorName = (expense) => {
        if (expense.vendorId && vendorIdToName[expense.vendorId]) {
            return vendorIdToName[expense.vendorId];
        }
        return expense.vendor || '';
    };
    const getDisplayContractorName = (expense) => {
        if (expense.contractorId && contractorIdToName[expense.contractorId]) {
            return contractorIdToName[expense.contractorId];
        }
        return expense.contractor || '';
    };
    const getBranchName = (id) =>
        branchOptions.find(b => String(b.id) === String(id))?.branch || "";
    const getDisplayStaffName = (expense) => {
        // Prioritize labour over employee
        // Check all possible field name variations
        const labourId = expense.labourId || expense.labour_id || expense.labourID || expense.labour_ID;
        const employeeId = expense.employeeId || expense.employee_id || expense.employeeID || expense.employee_ID;

        // Debug: log first expense with staff data to see what we're working with
        if ((labourId || employeeId) && !window.staffDebugLogged) {
            window.staffDebugLogged = true;
            console.log('Staff Debug - First expense with staff data:', {
                expenseId: expense.id,
                labourId,
                employeeId,
                labourIdType: typeof labourId,
                employeeIdType: typeof employeeId,
                labourIdToNameSample: Object.keys(labourIdToName).slice(0, 3),
                employeeIdToNameSample: Object.keys(employeeIdToName).slice(0, 3),
                allExpenseKeys: Object.keys(expense),
                expenseSample: Object.keys(expense).filter(k =>
                    k.toLowerCase().includes('labour') ||
                    k.toLowerCase().includes('employee') ||
                    k.toLowerCase().includes('staff')
                )
            });
        }
        if (labourId) {
            const labourName = labourIdToName[labourId] || labourIdToName[String(labourId)] || labourIdToName[Number(labourId)];
            if (labourName) {
                return labourName;
            }
        }
        if (employeeId) {
            const employeeName = employeeIdToName[employeeId] ||
                employeeIdToName[String(employeeId)] ||
                employeeIdToName[Number(employeeId)];
            if (employeeName) {
                return employeeName;
            }
        }
        return '';
    };
    const handleEditClick = (expense) => {
        setEditId(expense.id);
        setFormData({
            ...expense,
            paymentMode: expense.paymentMode || '',
            utilityType: expense.utilityType || '',
            utilityTypeNumber: expense.utilityTypeNumber || '',
            utilityForTheMonth: expense.utilityForTheMonth || '',
            utilityValidityDays: expense.utilityValidityDays || '',
            utilityValidityType: expense.utilityValidityType || '',
            serviceStartingDate: expense.serviceStartingDate || '',
            projectId: expense.projectId || '',
            vendorId: expense.vendorId || '',
            contractorId: expense.contractorId || ''
        });
        setModalIsOpen(true);
    };
    const handleCancel = () => {
        setModalIsOpen(false);
        setSelectedFile(null);
    };
    const clearFilters = () => {
        setSelectedSiteName('');
        setSelectedVendor('');
        setSelectedContractor('');
        setSelectedCategory('');
        setSelectedMachineTools('');
        setSelectedAccountType('');
        setStartDate('');
        setEndDate('');
        setSelectedEno('');
        setFilteredExpenses(expenses);
        setCurrentPage(1);
        setSortField('');
        setSortDirection('asc');
        localStorage.removeItem('expenseFilter_siteName');
        localStorage.removeItem('expenseFilter_vendor');
        localStorage.removeItem('expenseFilter_contractor');
        localStorage.removeItem('expenseFilter_category');
        localStorage.removeItem('expenseFilter_machineTools');
        localStorage.removeItem('expenseFilter_accountType');
        localStorage.removeItem('expenseFilter_date');
        localStorage.removeItem('expenseFilter_startDate');
        localStorage.removeItem('expenseFilter_endDate');
        localStorage.removeItem('expenseFilter_eno');
    };
    const exportToCSV = () => {
        if (!currentExportItems || currentExportItems.length === 0) {
            alert("No filtered data to export.");
            return;
        }
        const headers = [
            "Time stamp",
            "Date",
            "Project Name",
            "Vendor",
            "Contractor",
            "Quantity",
            "Amount",
            "Comments",
            "Category",
            "A/C Type",
            "Machine Tools",
            "E.No",
            "Attach file"
        ];
        const rows = currentExportItems.map(expense => [
            formatDate(expense.timestamp),
            formatDateOnly(expense.date),
            getDisplaySiteName(expense),
            getDisplayVendorName(expense),
            getDisplayContractorName(expense),
            expense.quantity,
            `${Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            expense.comments,
            expense.category,
            expense.accountType,
            getMachineToolsItemIdDisplay(expense.machineTools),
            expense.eno,
            expense.billCopy || ""
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(value => `"${value}"`).join(","))
            .join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Expense_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <body className=' bg-[#FAF6ED]'>
            <div>

                <div className="w-full max-w-[1860px] mx-auto p-4 bg-white shadow-lg overflow-x-auto">
                    <div className={`text-left flex ${selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools || startDate || endDate
                        ? 'flex-col sm:flex-row sm:justify-between' : 'flex-row justify-between items-center'} mb-3 gap-2`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                            <button className='pl-2' onClick={() => setShowFilters(!showFilters)}>
                                <img
                                    src={Filter}
                                    alt="Toggle Filter"
                                    className="w-7 h-7 border border-[#BF9853] rounded-md"
                                />
                            </button>
                            {(selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools || startDate || endDate) && (
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                                    {startDate && (
                                        <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                                            <span className="font-normal">Start Date: </span>
                                            <span className="font-bold">{startDate}</span>
                                            <button onClick={() => setStartDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {endDate && (
                                        <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                                            <span className="font-normal">End Date: </span>
                                            <span className="font-bold">{endDate}</span>
                                            <button onClick={() => setEndDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
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
                                            <span className="font-bold">{getMachineToolsItemIdDisplay(selectedMachineTools)}</span>
                                            <button onClick={() => setSelectedMachineTools('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className='flex items-center gap-2'>
                            <button onClick={clearFilters}
                                className='w-10 h-9 border border-[#BF9853] rounded-md font-semibold text-sm text-[#BF9853] flex items-center justify-center gap-2' >
                                <img className='w-4 h-4' src={Reload} alt="Reload" />
                            </button>
                            <div className=' text-left md:text-right md:items-center items-start cursor-default flex max-w-screen-2xl table-auto overflow-auto w-full'>
                                <div className='flex items-center'>
                                    <span className='text-[#E4572E] mr-4 flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={generateFilteredPDF}>PDF<img src={Pdf} alt="Pdf" className='w-4 h-4' /></span>
                                    <span className='text-[#007233] mr-1 flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={exportToCSV}>XL<img src={XL} alt="XL" className='w-4 h-4' /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div ref={scrollRef}
                            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[600px] overflow-scroll select-none thin-scrollbar"
                            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                        >
                            <table className="table-fixed min-w-[1765px] w-full border-collapse">
                                <thead className="sticky top-0 z-20 bg-white ">
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="pt-2 pl-3 w-36 font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('date')}>
                                            Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[300px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('siteName')}>
                                            Project Name {sortField === 'siteName' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[220px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('vendor')}>
                                            Vendor {sortField === 'vendor' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[220px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('contractor')}>
                                            Contractor {sortField === 'contractor' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[120px] font-bold text-left">
                                            Staff
                                        </th>
                                        <th className="px-0.5 w-[120px] font-bold text-left">Quantity</th>
                                        <th className="px-0.5 w-[120px] font-bold text-left">Amount</th>
                                        <th className="px-0.5 w-[120px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('comments')}>
                                            Description {sortField === 'comments' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[150px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('category')}>
                                            Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[150px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('accountType')}>
                                            A/C Type {sortField === 'accountType' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[150px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('machineTools')}>
                                            Machine Tools {sortField === 'machineTools' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[150px] font-bold text-left">Source From</th>
                                        <th className="px-0.5 w-[120px] font-bold text-left">Branch</th>
                                        <th className="px-0.5 w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('eno')}>
                                            E.No {sortField === 'eno' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[60px] font-bold text-left">Edit</th>
                                        <th className="px-0.5 w-[50px] font-bold text-left">File</th>
                                    </tr>
                                    {showFilters && (
                                        <tr className="bg-[#FAF6ED]">
                                            <th className=" py-3">
                                                <DateRangePicker
                                                    startDate={startDate}
                                                    endDate={endDate}
                                                    onStartDateChange={setStartDate}
                                                    onEndDateChange={setEndDate}
                                                />
                                            </th>
                                            <th className=" py-3">
                                                <Select
                                                    className="w-full"
                                                    options={siteOptions}
                                                    value={selectedSiteName ? { value: selectedSiteName, label: selectedSiteName } : null}
                                                    onChange={(selectedOption) => setSelectedSiteName(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Search Site..."
                                                    menuPlacement="bottom"
                                                    styles={customStyles}
                                                />
                                            </th>
                                            <th className=" py-3">
                                                <Select
                                                    className="w-full"
                                                    options={vendorOptions}
                                                    value={selectedVendor ? { value: selectedVendor, label: selectedVendor } : null}
                                                    onChange={(selectedOption) => setSelectedVendor(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Search Vendor"
                                                    menuPlacement="bottom"
                                                    styles={customStyles}
                                                />
                                            </th>
                                            <th className=" py-3">
                                                <Select
                                                    className="w-full"
                                                    options={contractorOptions}
                                                    value={selectedContractor ? { value: selectedContractor, label: selectedContractor } : null}
                                                    onChange={(selectedOption) => setSelectedContractor(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Search Contractor"
                                                    menuPlacement="bottom"
                                                    styles={customStyles}
                                                />
                                            </th>
                                            <th></th>
                                            <th></th>
                                            <th className="text-base text-left font-bold py-3">
                                                ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </th>
                                            <th></th>
                                            <th className=" py-3">
                                                <Select
                                                    className="w-full"
                                                    options={categoryOptions}
                                                    value={selectedCategory ? { value: selectedCategory, label: selectedCategory } : null}
                                                    onChange={(selectedOption) => setSelectedCategory(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Category..."
                                                    menuPlacement="bottom"
                                                    styles={customStyles}
                                                />
                                            </th>
                                            <th className=" py-3">
                                                <Select
                                                    className="w-full"
                                                    options={accountTypeOptions}
                                                    value={selectedAccountType ? { value: selectedAccountType, label: selectedAccountType } : null}
                                                    onChange={(selectedOption) => setSelectedAccountType(selectedOption ? selectedOption.value : '')}
                                                    placeholder="A/C Type"
                                                    menuPlacement="bottom"
                                                    styles={customStyles}
                                                />
                                            </th>
                                            <th className=" py-3">
                                                <Select
                                                    className="w-full"
                                                    options={machineToolsOptions}
                                                    value={selectedMachineTools ? machineToolsOptions.find(opt => opt.value === String(selectedMachineTools)) : null}
                                                    onChange={(selectedOption) => setSelectedMachineTools(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Machine..."
                                                    menuPlacement="bottom"
                                                    styles={customStyles}
                                                />
                                            </th>
                                            <th></th>
                                            <th>
                                            </th>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {currentItems.map((expense, index) => (
                                        <tr key={expense.id} className="odd:bg-white even:bg-[#FAF6ED]">
                                            <td className=" text-sm text-left pl-3 w-32 ">{formatDateOnly(expense.date)}</td>
                                            <td className=" text-sm text-left w-60 ">{getDisplaySiteName(expense)}</td>
                                            <td className=" text-sm text-left ">{getDisplayVendorName(expense)}</td>
                                            <td className=" text-sm text-left ">{getDisplayContractorName(expense)}</td>
                                            <td className=" text-sm text-left ">{getDisplayStaffName(expense)}</td>
                                            <td className=" text-sm text-left ">{expense.quantity}</td>
                                            <td className="text-sm text-right pr-5 ">
                                                ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-sm text-left w-[120px] max-w-[120px] break-words overflow-hidden whitespace-normal px-1">{expense.comments || ''}</td>
                                            <td className=" text-sm text-left ">{expense.category}</td>
                                            <td className=" text-sm text-left ">{expense.accountType}</td>
                                            <td className=" text-sm text-left ">{getMachineToolsItemIdDisplay(expense.machineTools)}</td>
                                            <td className=" text-sm text-left ">{expense.source}</td>
                                            <td className=" text-sm text-left ">{getBranchName(expense.branch_id ?? expense.branchId ?? '') || ''}</td>
                                            <td className=" text-sm text-left pl-3 ">{expense.eno}</td>
                                            <td className=" py-1.5">
                                                {userPermissions.includes("Edit") && (
                                                    <button onClick={() => handleEditClick(expense)} className="rounded-full transition duration-200 ml-2 mr-3">
                                                        <img
                                                            src={edit}
                                                            alt="Edit"
                                                            className=" w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                                                        />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-1 text-sm">
                                                {expense.billCopy ? (
                                                    <a href={expense.billCopy} className="text-red-500 underline" target="_blank" rel="noopener noreferrer">
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
                        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
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
                                    <option value={16}>16</option>
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
                                    Showing {startIndex + 1} to {Math.min(endIndex, sortedExpenses.length)} of {sortedExpenses.length} entries
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
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
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#BF9853] ${currentPage === pageNum
                                                ? 'bg-[#BF9853] text-white border-[#BF9853]'
                                                : 'border-gray-300 hover:bg-[#BF9853] hover:text-white'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                        <Modal
                            isOpen={modalIsOpen}
                            onRequestClose={handleCancel}
                            contentLabel="Edit Expense"
                            className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50 z-[9999]"
                            overlayClassName="fixed inset-0 z-[9999]">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                                <h2 className="text-xl font-bold mb-6 border-b-2">Edit Expense</h2>
                                <form className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Account Type *</label>
                                        <select
                                            name="accountType"
                                            value={formData.accountType}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none">
                                            <option value="" disabled>--- Select ---</option>
                                            {editAccountTypeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Site Name *</label>
                                        <Select
                                            name="siteName"
                                            value={siteOption.find(option => option.value === formData.siteName)}
                                            onChange={(selectedOption) =>
                                                setFormData({
                                                    ...formData,
                                                    siteName: selectedOption?.value || '',
                                                    projectId: selectedOption?.id || ''
                                                })
                                            }
                                            options={siteOption}
                                            placeholder="--- Select Site ---"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                    borderWidth: '2px',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.25rem',
                                                    textAlign: 'left',
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    textAlign: 'left',
                                                    fontWeight: 'normal',
                                                    fontSize: '15px',
                                                    backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                    color: 'black',
                                                }),
                                            }}
                                            menuPlacement="bottom"
                                            menuPosition="absolute"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Vendor Name *</label>
                                        <Select
                                            name="vendor"
                                            options={vendorOption}
                                            value={vendorOption.find(opt => opt.value === formData.vendor)}
                                            onChange={(selectedOption) =>
                                                setFormData({
                                                    ...formData,
                                                    vendor: selectedOption?.value || '',
                                                    vendorId: selectedOption?.id || '',
                                                    contractor: selectedOption ? '' : formData.contractor,
                                                    contractorId: selectedOption ? '' : formData.contractorId
                                                })
                                            }
                                            isDisabled={!!formData.contractor}
                                            isClearable
                                            styles={{
                                                control: (base, state) => ({
                                                    ...base,
                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                    borderWidth: '2px',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.25rem',
                                                    textAlign: 'left',
                                                    boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                    '&:hover': {
                                                        borderColor: 'rgba(191, 152, 83, 0.4)',
                                                    },
                                                }),
                                                placeholder: (base) => ({
                                                    ...base,
                                                    color: '#6B7280',
                                                    textAlign: 'left',
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    textAlign: 'left',
                                                    fontWeight: 'normal',
                                                    fontSize: '15px',
                                                    backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                    color: 'black',
                                                }),
                                                singleValue: (base) => ({
                                                    ...base,
                                                    color: '#111827',
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    zIndex: 999,
                                                }),
                                            }}
                                            placeholder="--- Select Vendor ---"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Contractor Name *</label>
                                        <Select
                                            name="contractor"
                                            options={contractorOption}
                                            value={contractorOption.find(opt => opt.value === formData.contractor)}
                                            onChange={(selectedOption) =>
                                                setFormData({
                                                    ...formData,
                                                    contractor: selectedOption?.value || '',
                                                    contractorId: selectedOption?.id || '',
                                                    vendor: selectedOption ? '' : formData.vendor,
                                                    vendorId: selectedOption ? '' : formData.vendorId
                                                })
                                            }
                                            isDisabled={!!formData.vendor}
                                            isClearable
                                            styles={{
                                                control: (base, state) => ({
                                                    ...base,
                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                    borderWidth: '2px',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.25rem',
                                                    textAlign: 'left',
                                                    boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                    '&:hover': {
                                                        borderColor: 'rgba(191, 152, 83, 0.4)',
                                                    },
                                                }),
                                                placeholder: (base) => ({
                                                    ...base,
                                                    color: '#6B7280',
                                                    textAlign: 'left',

                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    textAlign: 'left',
                                                    fontWeight: 'normal',
                                                    fontSize: '15px',
                                                    backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                    color: 'black',
                                                }),
                                                singleValue: (base) => ({
                                                    ...base,
                                                    color: '#111827',
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    zIndex: 999,
                                                }),
                                            }}
                                            placeholder="--- Select Contractor ---"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Quantity *</label>
                                        <input
                                            type="text"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Category *</label>
                                        <Select
                                            name="category"
                                            value={categoryOption.find(option => option.value === formData.category)}
                                            onChange={(selectedOption) =>
                                                setFormData({ ...formData, category: selectedOption?.value || '' })
                                            }
                                            options={categoryOption}
                                            placeholder="--- Select Category ---"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                    borderWidth: '2px',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.25rem',
                                                    textAlign: 'left',
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    textAlign: 'left',
                                                    fontWeight: 'normal',
                                                    fontSize: '15px',
                                                    backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                    color: 'black',
                                                }),
                                            }}
                                            menuPlacement="bottom"
                                            menuPosition="absolute"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="block text-gray-500 font-semibold text-left">Amount *</label>
                                        <span className="absolute top-9 left-3 mt-[2px] text-gray-600">₹</span>
                                        <input
                                            type="text"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 pl-6 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                            onWheel={(e) => e.target.blur()}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Comments *</label>
                                        <input
                                            type="text"
                                            name="comments"
                                            value={formData.comments}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <div className=' flex'>
                                            <label className="block text-gray-500 font-semibold text-left cursor-pointer" htmlFor="fileInput">Bill Copy URL</label>
                                            {selectedFile && <span className="text-orange-600 ml-4">{selectedFile.name}</span>}
                                        </div>
                                        <input
                                            type="text"
                                            name="billCopy"
                                            value={formData.billCopy}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                        />
                                        <input type="file" className="hidden" id="fileInput" onChange={handleFileChange} />
                                    </div>
                                    {(formData.accountType === 'Claim' || formData.accountType === 'Utility Bills' || formData.accountType === 'Weekly Payment') && (
                                        <div>
                                            <label className="block text-gray-500 font-semibold text-left">Payment Mode *</label>
                                            <select
                                                name="paymentMode"
                                                value={formData.paymentMode}
                                                onChange={handleChange}
                                                className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none">
                                                <option value="">Select Payment Mode</option>
                                                <option value="GPay">GPay</option>
                                                <option value="PhonePe">PhonePe</option>
                                                <option value="Net Banking">Net Banking</option>
                                                <option value="Cheque">Cheque</option>
                                            </select>
                                        </div>
                                    )}
                                    {formData.accountType === 'Utility Bills' && (
                                        <>
                                            <div>
                                                <label className="block text-gray-500 font-semibold text-left">Utility Type *</label>
                                                <select
                                                    name="utilityType"
                                                    value={formData.utilityType}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none">
                                                    <option value="" disabled>--- Select ---</option>
                                                    <option value="Electricity">Electricity</option>
                                                    <option value="Property">Property</option>
                                                    <option value="Water">Water</option>
                                                    <option value="Telecom">Telecom</option>
                                                    <option value="Subscription">Subscription</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-gray-500 font-semibold text-left">
                                                    {formData.utilityType === 'Electricity' ? 'EB Number' :
                                                        formData.utilityType === 'Property' ? 'Property Tax Number' :
                                                            formData.utilityType === 'Water' ? 'Water Tax Number' : 'Number'}
                                                </label>
                                                <Select
                                                    options={ebNumberOptions}
                                                    value={selectedEbNumber}
                                                    onChange={(opt) => {
                                                        setSelectedEbNumber(opt);
                                                        setFormData((prev) => ({ ...prev, utilityTypeNumber: opt?.label || "" }));
                                                    }}
                                                    isClearable
                                                    placeholder={`Select ${formData.utilityType === 'Electricity' ? 'EB Number' :
                                                        formData.utilityType === 'Property' ? 'Property Tax Number' :
                                                            formData.utilityType === 'Water' ? 'Water Tax Number' : 'Number'}...`}
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor: 'rgba(191, 152, 83, 0.2)',
                                                            borderWidth: '2px',
                                                            borderRadius: '0.5rem',
                                                            padding: '0.25rem',
                                                            textAlign: 'left',
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            fontSize: '15px',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: 'black',
                                                        }),
                                                        menu: (base) => ({ ...base, zIndex: 9999 }),
                                                    }}
                                                    menuPlacement="bottom"
                                                    menuPosition="absolute"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-500 font-semibold text-left">Months</label>
                                                <input
                                                    type="month"
                                                    name="utilityForTheMonth"
                                                    value={formData.utilityForTheMonth}
                                                    onChange={handleChange}
                                                    placeholder="Enter months..."
                                                    className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                                />
                                            </div>
                                            {(formData.utilityType === 'Telecom' || formData.utilityType === 'Subscription') && (
                                                <div>
                                                    <label className="block text-gray-500 font-semibold text-left">Validity</label>
                                                    <input
                                                        type="text"
                                                        name="utilityValidityDays"
                                                        value={formData.utilityValidityDays}
                                                        onChange={handleChange}
                                                        placeholder="Enter validity..."
                                                        className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                                    />
                                                </div>
                                            )}
                                            {(formData.utilityType === 'Telecom' || formData.utilityType === 'Subscription') && (
                                                <div>
                                                    <label className="block text-gray-500 font-semibold text-left">Validity Type</label>
                                                    <select
                                                        name="utilityValidityType"
                                                        value={formData.utilityValidityType}
                                                        onChange={handleChange}
                                                        className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                                    >
                                                        <option value="">--- Select ---</option>
                                                        <option value="Days">Days</option>
                                                        <option value="Month">Month</option>
                                                        <option value="Year">Year</option>
                                                    </select>
                                                </div>
                                            )}
                                            {formData.utilityType === 'Telecom' && (
                                                <div>
                                                    <label className="block text-gray-500 font-semibold text-left">Service Start Date</label>
                                                    <input
                                                        type="date"
                                                        name="serviceStartingDate"
                                                        value={formData.serviceStartingDate}
                                                        onChange={handleChange}
                                                        className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div className="col-span-2 flex justify-end space-x-4 mt-4 border-t-2 ">
                                        <button type="button" onClick={handleCancel} className="px-4 py-2 border-2 border-opacity-[] border-[#BF9853] text-[#BF9853] rounded mt-3">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={isSubmitting} onClick={handleSave}
                                            className={`px-4 py-2 bg-[#BF9853] text-white rounded mt-3 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {isSubmitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                        {showPaymentModal && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
                                <div className="bg-white text-left rounded-xl p-6 w-[800px] max-h-[90vh] overflow-y-auto flex flex-col relative">
                                    <h3 className="text-lg font-semibold mb-4 text-center">Payment Details</h3>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="space-y-4 mb-4">
                                            <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                                        <input
                                                            type="date"
                                                            value={(pendingUpdateFormDataRef.current && pendingUpdateFormDataRef.current.date) || ''}
                                                            readOnly
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full bg-gray-100"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                                        <input
                                                            type="text"
                                                            value={(pendingUpdateFormDataRef.current && pendingUpdateFormDataRef.current.amount) || ''}
                                                            readOnly
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                                                        <input
                                                            type="text"
                                                            value={(pendingUpdateFormDataRef.current && pendingUpdateFormDataRef.current.paymentMode) || ''}
                                                            readOnly
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {(formData.paymentMode === 'GPay' || formData.paymentMode === 'PhonePe' || formData.paymentMode === 'Net Banking' || formData.paymentMode === 'Cheque') && (
                                                <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                                                    <div className="space-y-4">
                                                        {formData.paymentMode === 'Cheque' && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No <span className="text-red-500">*</span></label>
                                                                    <input
                                                                        type="text"
                                                                        value={paymentModalData.chequeNo}
                                                                        onChange={(e) => setPaymentModalData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                                                        placeholder="Enter cheque number"
                                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date <span className="text-red-500">*</span></label>
                                                                    <input
                                                                        type="date"
                                                                        value={paymentModalData.chequeDate}
                                                                        onChange={(e) => setPaymentModalData(prev => ({ ...prev, chequeDate: e.target.value }))}
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
                                                                    value={paymentModalData.transactionNumber}
                                                                    onChange={(e) => setPaymentModalData(prev => ({ ...prev, transactionNumber: e.target.value }))}
                                                                    placeholder="Enter transaction number (optional)"
                                                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number <span className="text-red-500">*</span></label>
                                                                <select
                                                                    value={paymentModalData.accountNumber}
                                                                    onChange={(e) => setPaymentModalData(prev => ({ ...prev, accountNumber: e.target.value }))}
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
                                    <div className="flex justify-end gap-3 mt-6 p-4 bg-white border-t">
                                        <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg">
                                            Cancel
                                        </button>
                                        <button type="button" onClick={handlePaymentModalSubmit} disabled={isSubmitting} className="px-4 py-2 bg-[#BF9853] text-white rounded-lg disabled:bg-gray-400">
                                            {isSubmitting ? 'Saving...' : 'Submit'}
                                        </button>
                                    </div>
                                    <button type="button" onClick={() => setShowPaymentModal(false)} className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-black">
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </body>
    );
};
export default TableViewExpense;
const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + 330);
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