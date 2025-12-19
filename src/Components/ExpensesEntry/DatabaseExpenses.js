import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
import Select from 'react-select';
import Filter from '../Images/filter (3).png'
import Reload from '../Images/rotate-right.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
Modal.setAppElement('#root');

const DatabaseExpenses = ({ username, userRoles = [] }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [audits, setAudits] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [machineToolsOptions, setMachineToolsOptions] = useState([]);
    const [accountTypeOption, setAccountTypeOption] = useState([]);
    const [editAccountTypeOptions, setEditAccountTypeOptions] = useState([]);
    const [siteOption, setSiteOption] = useState([]);
    const [vendorOption, setVendorOption] = useState([]);
    const [contractorOption, setContractorOption] = useState([]);
    const [categoryOption, setCategoryOption] = useState([]);
    const [machineToolsOption, setMachineToolsOption] = useState([]);
    // Initialize filter states from localStorage or defaults
    const [selectedSiteName, setSelectedSiteName] = useState(() => {
        return localStorage.getItem('expenseFilter_siteName') || '';
    });
    const [selectedVendor, setSelectedVendor] = useState(() => {
        return localStorage.getItem('expenseFilter_vendor') || '';
    });
    const [enoOptions, setEnoOptions] = useState([]);
    const [selectedContractor, setSelectedContractor] = useState(() => {
        return localStorage.getItem('expenseFilter_contractor') || '';
    });
    const [selectedCategory, setSelectedCategory] = useState(() => {
        return localStorage.getItem('expenseFilter_category') || '';
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedEno, setSelectedEno] = useState(() => {
        return localStorage.getItem('expenseFilter_eno') || '';
    });
    const [accountTypeOptions, setAccountTypeOptions] = useState([]);
    const [selectedMachineTools, setSelectedMachineTools] = useState(() => {
        return localStorage.getItem('expenseFilter_machineTools') || '';
    });
    const [selectedDate, setSelectedDate] = useState(() => {
        return localStorage.getItem('expenseFilter_date') || '';
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
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [userPermissions, setUserPermissions] = useState([]);
    const moduleName = "Expense Entry";
    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                const response = await axios.get("https://backendaab.in/aabuilderDash/api/user_roles/all");
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
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
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
        localStorage.setItem('expenseFilter_date', selectedDate);
    }, [selectedDate]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_startDate', startDate);
    }, [startDate]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_endDate', endDate);
    }, [endDate]);

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
        projectId: '',
        vendorId: '',
        contractorId: ''
    });
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
    const [modalIsOpen, setModalIsOpen] = useState(false);
    useEffect(() => {
        axios
            .get('https://backendaab.in/aabuilderDash/expenses_form/get_form')
            .then((response) => {
                const sortedExpenses = response.data.sort((a, b) => {
                    const enoA = parseInt(a.eno, 10);
                    const enoB = parseInt(b.eno, 10);
                    return enoB - enoA;
                });
                setExpenses(sortedExpenses);
                setFilteredExpenses(sortedExpenses);
                const uniqueAccountTypes = [...new Set(response.data.map(expense => expense.accountType))];
                const uniqueMachineTools = [...new Set(response.data.map(expense => expense.machineTools))];
                const uniqueProjectNames = [...new Set(response.data.map(expense => expense.siteName))];
                const siteOptions = uniqueProjectNames.map(name => ({ value: name, label: name }));
                const uniqueVendorOptions = [...new Set(response.data.map(expense => expense.vendor))];
                const vendorOptions = uniqueVendorOptions.map(name => ({ value: name, label: name }));
                const uniqueContractorOptions = [...new Set(response.data.map(expense => expense.contractor))];
                const uniqueCategoryOptions = [...new Set(response.data.map(expense => expense.category))];
                const contractorOption = uniqueContractorOptions.map(name => ({ value: name, label: name }));
                const categoryOption = uniqueCategoryOptions.map(name => ({ value: name, label: name }));
                // Set the unique dropdown options in state
                setAccountTypeOptions(uniqueAccountTypes);
                setMachineToolsOptions(uniqueMachineTools.map(tool => ({ value: tool, label: tool })));
                setSiteOptions(siteOptions);
                setVendorOptions(vendorOptions);
                setContractorOptions(contractorOption);
                setCategoryOptions(categoryOption);
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
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
                const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
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
                const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
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
                const response = await fetch("https://backendaab.in/aabuilderDash/api/expenses_categories/getAll", {
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
                const response = await fetch("https://backendaab.in/aabuilderDash/api/machine_tools/getAll", {
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
        const fetchAccountType = async () => {
            try {
                const response = await fetch("https://backendaab.in/aabuilderDash/api/account_type/getAll", {
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
    const generateTodayPDF = () => {
        const today = new Date().toISOString().slice(0, 10);
        const todayExpenses = expenses.filter(exp => {
            const expenseDate = new Date(exp.date).toISOString().slice(0, 10);
            return expenseDate === today;
        });
        if (todayExpenses.length === 0) {
            alert("No entries found for today.");
            return;
        }
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
                getDisplaySiteName(exp),
                getDisplayVendorName(exp),
                getDisplayContractorName(exp),
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
            // Date range filter (Start Date and End Date)
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
                (selectedMachineTools ? expense.machineTools === selectedMachineTools : true) &&
                (selectedAccountType ? 
                    (selectedAccountType === 'Unknown' ? 
                        (!expense.accountType || expense.accountType === '') : 
                        expense.accountType === selectedAccountType
                    ) : true) &&
                (selectedDate ? expense.date === selectedDate : true) &&
                (selectedEno ? String(expense.eno) === String(selectedEno) : true)
            );
        });
        setFilteredExpenses(filtered);
        setCurrentPage(1); // Reset to first page when filters change
        // Set total amount
        const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        setTotalAmount(total);
        // Dynamically update dropdown options from filtered data
        const getOptions = (data, key) => {
            const unique = [...new Set(data.map(item => item[key]).filter(Boolean))];
            return unique.map(val => ({ value: val, label: val }));
        };
        setSiteOptions(getOptions(filtered, "siteName"));
        setVendorOptions(getOptions(filtered, "vendor"));
        setContractorOptions(getOptions(filtered, "contractor"));
        setCategoryOptions(getOptions(filtered, "category"));
        setMachineToolsOptions(getOptions(filtered, "machineTools"));
        setAccountTypeOptions(getOptions(filtered, "accountType"));
        setEnoOptions([...new Set(filtered.map(item => item.eno).filter(Boolean))]);

    }, [selectedSiteName, selectedVendor, selectedContractor, selectedCategory, selectedMachineTools, selectedAccountType, selectedDate, startDate, endDate, selectedEno, expenses]);
    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        // Prevent clearing the date field
        if (name === "date" && value === "") {
            return; // Don't update formData if date is being cleared
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
        return `${day}/${month}/${year}`;
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
                    hour12: true
                  })
                    .replace(",", "")
                    .replace(/\s/g, "-");
                const finalName = `${timestamp} - ${formData.siteName} - ${formData.vendor || formData.contractor}`;
                uploadFormData.append('file', selectedFile);
                uploadFormData.append('file_name', finalName);
                const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
                    method: "POST",
                    body: uploadFormData,
                });
                if (!uploadResponse.ok) {
                    throw new Error('File upload failed');
                }
                const result = await uploadResponse.json();
                updatedBillCopy = result.url;
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('Failed to upload file. Please try again.');
                return;
            }
        }
        const updatedFormData = {
            ...formData,
            billCopy: updatedBillCopy,
            editedBy: username,
        };
        try {
            const response = await fetch(`https://backendaab.in/aabuilderDash/expenses_form/update/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedFormData)
            });
            if (!response.ok) throw new Error('Failed to update expense');
            setExpenses(expenses.map(exp => (exp.id === editId ? { ...exp, ...updatedFormData } : exp)));
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
    // Sorting function
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };
    // Sort data
    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];
        // Handle different data types
        if (sortField === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortField === 'eno') {
            aValue = parseInt(aValue) || 0;
            bValue = parseInt(bValue) || 0;
        } else if (sortField === 'timestamp') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else {
            aValue = String(aValue || '').toLowerCase();
            bValue = String(bValue || '').toLowerCase();
        }
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    // Pagination logic
    const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = sortedExpenses.slice(startIndex, endIndex);
    // Calculate account type summary
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
    // Create lookup maps for ID to name conversion
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
    // Helper functions to get display names
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
    const handleEditClick = (expense) => {
        setEditId(expense.id);
        setFormData({
            ...expense,
            paymentMode: expense.paymentMode || '',
            utilityType: expense.utilityType || '',
            utilityTypeNumber: expense.utilityTypeNumber || '',
            utilityForTheMonth: expense.utilityForTheMonth || '',
            utilityValidityDays: expense.utilityValidityDays || '',
            projectId: expense.projectId || '',
            vendorId: expense.vendorId || '',
            contractorId: expense.contractorId || ''
        });
        setModalIsOpen(true);
    };
    const handleDelete = async (id, username) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                const response = await fetch(
                    `https://backendaab.in/aabuilderDash/expenses_form/delete/${id}?editedBy=${encodeURIComponent(username)}`,
                    {
                        method: 'POST',
                    }
                );
                if (response.ok) {
                    alert('Expenses deleted successfully!!!');
                    window.location.reload();
                } else {
                    alert('Failed to delete expense');
                }
            } catch (error) {
                console.error('Failed to delete expense:', error);
            }
        }
    };
    const handleCancel = () => {
        setModalIsOpen(false);
        setSelectedFile(null);
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
    const clearFilters = () => {
        setSelectedSiteName('');
        setSelectedVendor('');
        setSelectedContractor('');
        setSelectedCategory('');
        setSelectedMachineTools('');
        setSelectedAccountType('');
        setSelectedDate('');
        setStartDate('');
        setEndDate('');
        setSelectedEno('');
        setFilteredExpenses(expenses);
        setCurrentPage(1);
        setSortField('');
        setSortDirection('asc');
        // Clear localStorage as well
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
        const rows = currentItems.map(expense => [
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
            expense.machineTools,
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
    const generateFilteredPDF = () => {
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(16);
        doc.text("Filtered Expenses Report", 14, 15);
        autoTable(doc, {
            startY: 25,
            head: [[
                'Time', 'Date', 'Site', 'Vendor', 'Contractor',
                'Qty', 'Amount', 'Comments', 'Category', 'A/C Type',
                'Machine Tools', 'E.No'
            ]],
            body: currentItems.map(exp => [
                formatDate(exp.timestamp),
                formatDateOnly(exp.date),
                getDisplaySiteName(exp),
                getDisplayVendorName(exp),
                getDisplayContractorName(exp),
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
        const dateStr = new Date().toISOString().slice(0, 10);
        doc.save(`Filtered_Expenses_${dateStr}.pdf`);
    };
    return (
        <body className=' bg-[#FAF6ED]'>
            <div>
                <div className='mt-[-35px] mb-3 text-right items-center cursor-default flex justify-between max-w-screen-2xl table-auto min-w-full overflow-auto w-screen'>
                    <div></div>
                    <div>
                        <span className='text-[#E4572E] mr-9 font-semibold hover:underline cursor-pointer' onClick={generateFilteredPDF}>Export pdf</span>
                        <span className='text-[#007233] mr-9 font-semibold hover:underline cursor-pointer' onClick={exportToCSV}>Export XL</span>
                        <span className=' text-[#BF9853] mr-9 font-semibold hover:underline'>Print</span>
                    </div>
                </div>
                {Object.keys(accountTypeSummary).length > 0 && (
                    <div className="w-full max-w-[1860px] mx-auto p-4 bg-white shadow-lg mb-4">
                        <div className="flex flex-wrap gap-5 items-end">
                            <div>
                                <label className="block mb-2 font-semibold text-[#BF9853]">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-[168px] h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 focus:outline-none p-2"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold text-[#BF9853]">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-[168px] h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 focus:outline-none p-2"
                                />
                            </div>                            
                            {Object.entries(accountTypeSummary)
                                .sort(([a], [b]) => {
                                    if (a === 'Unknown') return 1;
                                    if (b === 'Unknown') return -1;
                                    return a.localeCompare(b);
                                })
                                .map(([accountType, data]) => (
                                <div key={accountType} className="cursor-pointer transition-all duration-200 hover:scale-105" onClick={() => setSelectedAccountType(accountType)}>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className={`font-semibold transition-colors duration-200 ${selectedAccountType === accountType ? 'text-[#E4572E]' : 'text-[#BF9853] hover:text-[#E4572E]'}`}>
                                            {accountType}
                                        </label>
                                        <span className="text-sm text-red-500 font-medium">
                                            {data.entryCount}
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={`₹${Number(data.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                        readOnly
                                        className={`w-[200px] h-[45px] cursor-pointer rounded-lg border-2 focus:outline-none p-2 text-lg font-bold text-center transition-all duration-200 ${
                                            selectedAccountType === accountType 
                                                ? 'border-[#E4572E] bg-[#FEF2F2] text-[#E4572E] shadow-md' 
                                                : 'border-[#BF9853] border-opacity-25 text-gray-800 hover:border-[#BF9853] hover:border-opacity-75 hover:shadow-sm hover:bg-[#FAF6ED]'
                                        }`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {Object.keys(accountTypeSummary).length === 0 && (
                    <div className="w-full max-w-[1860px] mx-auto p-4 bg-white shadow-lg mb-4">
                        <div className="flex flex-wrap gap-5 items-end">
                            <div>
                                <label className="block mb-2 font-semibold text-[#BF9853]">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-[168px] h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 focus:outline-none p-2"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold text-[#BF9853]">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-[168px] h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 focus:outline-none p-2"
                                />
                            </div>
                        </div>
                    </div>
                )}                
                <div className="w-full max-w-[1860px] mx-auto p-4 bg-white shadow-lg overflow-x-auto">
                    <div
                        className={`text-left flex ${selectedDate || selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools || startDate || endDate
                            ? 'flex-col sm:flex-row sm:justify-between'
                            : 'flex-row justify-between items-center'
                            } mb-3 gap-2`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                            <button className='pl-2' onClick={() => setShowFilters(!showFilters)}>
                                <img
                                    src={Filter}
                                    alt="Toggle Filter"
                                    className="w-7 h-7 border border-[#BF9853] rounded-md"
                                />
                            </button>
                            {(selectedDate || selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools || startDate || endDate) && (
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
                                            <button onClick={() => setSelectedSiteName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {selectedVendor && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Vendor Name: </span>
                                            <span className="font-bold">{selectedVendor}</span>
                                            <button onClick={() => setSelectedVendor('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {selectedContractor && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Contractor Name: </span>
                                            <span className="font-bold">{selectedContractor}</span>
                                            <button onClick={() => setSelectedContractor('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {selectedCategory && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Category: </span>
                                            <span className="font-bold">{selectedCategory}</span>
                                            <button onClick={() => setSelectedCategory('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {selectedAccountType && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Mode: </span>
                                            <span className="font-bold">{selectedAccountType}</span>
                                            <button onClick={() => setSelectedAccountType('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {selectedMachineTools && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Tools: </span>
                                            <span className="font-bold">{selectedMachineTools}</span>
                                            <button onClick={() => setSelectedMachineTools('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <button onClick={clearFilters} className='w-36 h-9 border border-[#BF9853] rounded-md font-semibold text-sm text-[#BF9853] flex items-center justify-center gap-2'>
                                <img className='w-4 h-4' src={Reload} alt="Reload" />
                                Reset Table
                            </button>
                        </div>
                    </div>
                    <div>
                        <div
                            ref={scrollRef}
                            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[600px] overflow-x-auto select-none thin-scrollbar"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}>
                            <table className="table-fixed  min-w-[1765px] w-screen border-collapse">
                                <thead className="sticky top-0 z-9 bg-white ">
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="px-3 w-44 font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('timestamp')}>
                                            Time stamp {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="pt-2 w-32 font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('date')}>
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
                                        <th className="px-0.5 w-[120px] font-bold text-left">Quantity</th>
                                        <th className="px-0.5 w-[120px] font-bold text-left">Amount</th>
                                        <th className="px-0.5 w-[120px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('comments')}>
                                            Comments {sortField === 'comments' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[160px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('category')}>
                                            Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[130px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('accountType')}>
                                            A/C Type {sortField === 'accountType' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[150px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('machineTools')}>
                                            Machine Tools {sortField === 'machineTools' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[150px] font-bold text-left">Source From</th>
                                        <th className="px-0.5 w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('eno')}>
                                            E.No {sortField === 'eno' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-0.5 w-[120px] font-bold text-left">Activity</th>
                                        <th className="px-0.5 w-[50px] font-bold text-left">File</th>
                                    </tr>
                                    {showFilters && (
                                        <tr className="bg-[#FAF6ED]">
                                            <th></th>
                                            <th className=" py-3">
                                                <input
                                                    type="date"
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    className="w-full px-1.5 py-2 text-sm rounded-lg border-2 border-[#BF9853] font-normal border-opacity-30 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:border-transparent transition-all duration-200"
                                                    placeholder="Search Date..."
                                                />
                                            </th>
                                            <th className="py-3">
                                                <Select
                                                    className="w-full"
                                                    options={siteOptions}
                                                    value={selectedSiteName ? { value: selectedSiteName, label: selectedSiteName } : null}
                                                    onChange={(selectedOption) => setSelectedSiteName(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Site..."
                                                    menuPlacement="bottom"
                                                    styles={customStyles}
                                                />
                                            </th>
                                            <th className="py-3">
                                                <Select
                                                    className="w-full"
                                                    options={vendorOptions}
                                                    value={selectedVendor ? { value: selectedVendor, label: selectedVendor } : null}
                                                    onChange={(selectedOption) => setSelectedVendor(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Vendor"
                                                    menuPlacement="bottom"
                                                    styles={customStyles}
                                                />
                                            </th>
                                            <th className="py-3">
                                                <Select
                                                    className="w-full"
                                                    options={contractorOptions}
                                                    value={selectedContractor ? { value: selectedContractor, label: selectedContractor } : null}
                                                    onChange={(selectedOption) => setSelectedContractor(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Contractor"
                                                    menuPlacement="bottom"
                                                    styles={customStyles}
                                                />
                                            </th>
                                            <th></th>
                                            <th className="text-base text-left font-bold py-3">
                                                ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </th>
                                            <th></th>
                                            <th className="py-3">
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
                                            <th className="py-3">
                                                <Select
                                                    className="w-full"
                                                    options={accountTypeOptions}
                                                    value={selectedAccountType ? { value: selectedAccountType, label: selectedAccountType } : null}
                                                    onChange={(selectedOption) => setSelectedAccountType(selectedOption ? selectedOption.value : '')}
                                                    placeholder="A/CType"
                                                    menuPlacement="bottom"
                                                    styles={customStyles}
                                                />
                                            </th>
                                            <th className="py-3">
                                                <Select
                                                    className="w-full"
                                                    options={machineToolsOptions}
                                                    value={selectedMachineTools ? machineToolsOptions.find(opt => opt.value === selectedMachineTools) : null}
                                                    onChange={(selectedOption) => setSelectedMachineTools(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Machine..."
                                                    menuPlacement="bottom"
                                                    styles={customStyles}
                                                />
                                            </th>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {currentItems.map((expense, index) => (
                                        <tr key={expense.id} className="odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="px-3 text-sm text-left ">{formatDate(expense.timestamp)}</td>
                                            <td className=" text-sm text-left w-32 ">{formatDateOnly(expense.date)}</td>
                                            <td className=" text-sm text-left w-60 ">{getDisplaySiteName(expense)}</td>
                                            <td className=" text-sm text-left ">{getDisplayVendorName(expense)}</td>
                                            <td className=" text-sm text-left ">{getDisplayContractorName(expense)}</td>
                                            <td className=" text-sm text-left ">{expense.quantity}</td>
                                            <td className="text-sm text-right pr-5">
                                                ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-sm text-left w-[120px] max-w-[120px] break-words overflow-hidden whitespace-normal px-1">{expense.comments || ''}</td>
                                            <td className=" text-sm text-left ">{expense.category}</td>
                                            <td className=" text-sm text-left ">{expense.accountType}</td>                                            
                                            <td className=" text-sm text-left ">{expense.machineTools}</td>
                                            <td className=" text-sm text-left ">{expense.source}</td>
                                            <td className=" text-sm text-left pl-3 ">{expense.eno}</td>
                                            <td className=" flex w-[100px] justify-between py-2">
                                                <button onClick={() => handleEditClick(expense)} className="rounded-full transition duration-200 ml-2 mr-3">
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
                                                        onClick={() => handleDelete(expense.id, username)}
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
                                            <td className="px-1 text-sm">
                                                {expense.billCopy ? (
                                                    <a
                                                        href={expense.billCopy}
                                                        className="text-red-500 underline "
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
                                            className={`px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#BF9853] ${
                                                currentPage === pageNum
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
                        <Modal isOpen={modalIsOpen} onRequestClose={handleCancel}
                            contentLabel="Edit Expense" className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50"
                            overlayClassName="fixed inset-0">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                                <h2 className="text-xl font-bold mb-6 border-b-2">Edit Expense</h2>
                                <form className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Date</label>
                                        <input type="date" name="date" value={formData.date} onChange={handleChange}
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
                                        <input type="text" name="quantity" value={formData.quantity} onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Category *</label>
                                        <Select name="category" value={categoryOption.find(option => option.value === formData.category)}
                                            onChange={(selectedOption) => setFormData({...formData, category: selectedOption?.value || '' })}
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
                                        <input type="text" name="amount" value={formData.amount} onChange={handleChange}
                                            className="mt-1 block w-full p-2 pl-6 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                            onWheel={(e) => e.target.blur()}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Comments *</label>
                                        <input type="text" name="comments" value={formData.comments} onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <div className=' flex'>
                                            <label className="block text-gray-500 font-semibold text-left cursor-pointer" htmlFor="fileInput">Bill Copy URL</label>
                                            {selectedFile && <span className="text-orange-600 ml-4">{selectedFile.name}</span>}
                                        </div>
                                        <input type="text" name="billCopy" value={formData.billCopy} onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                        />
                                        <input type="file" className="hidden" id="fileInput" onChange={handleFileChange} />
                                    </div>                                    
                                    {/* Conditional fields based on Account Type */}
                                    {(formData.accountType === 'Claim' || formData.accountType === 'Utility Bills') && (
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
                                                <input
                                                    type="text"
                                                    name="utilityTypeNumber"
                                                    value={formData.utilityTypeNumber}
                                                    onChange={handleChange}
                                                    placeholder={`Enter ${formData.utilityType === 'Electricity' ? 'EB Number' : 
                                                                   formData.utilityType === 'Property' ? 'Property Tax Number' : 
                                                                   formData.utilityType === 'Water' ? 'Water Tax Number' : 'Number'}...`}
                                                    className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
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
                                                    <label className="block text-gray-500 font-semibold text-left">Additional Input</label>
                                                    <input
                                                        type="text"
                                                        name="utilityValidityDays"
                                                        value={formData.utilityValidityDays}
                                                        onChange={handleChange}
                                                        placeholder="Enter additional information..."
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
                                            className={`px-4 py-2 bg-[#BF9853] text-white rounded mt-3 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                        <AuditModal show={showModal} onClose={() => setShowModal(false)} audits={audits} />
                    </div>
                </div>
            </div>
        </body>
    );
};
export default DatabaseExpenses;
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
    const columnWidths = [
        "210px", "150px", "180px", "160px", "160px", "140px",
        "120px", "200px", "130px", "180px", "150px"
    ];
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1400px] mx-4 p-4">
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
                                        <td style={{ width: '130px' }} className="border pl-2 text-sm text-left whitespace-nowrap">
                                            {formatDate(audit.editedDate)}
                                        </td>
                                        <td style={{ width: '120px' }} className="border pl-2 text-sm text-left whitespace-nowrap">
                                            {audit.editedBy}
                                        </td>
                                        {fields.map(({ key }, i) => {
                                            let value = audit[`old${key}`];
                                            if (key.toLowerCase().includes("amount")) {
                                                value = value && !isNaN(value) ? Number(value).toLocaleString("en-IN") : "-";
                                            }
                                            if (key.toLowerCase().includes("date")) {
                                                value = value ? new Date(value).toLocaleDateString("en-GB") : "-";
                                            }
                                            return (
                                                <td key={key} style={{ width: columnWidths[i] }} className="border text-sm text-center">
                                                    {value ?? "-"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    <tr className="odd:bg-white even:bg-[#FAF6ED]">
                                        <td style={{ width: '130px' }} className="border pl-2 text-sm text-left whitespace-nowrap">
                                            {formatDate(audit.editedDate)}
                                        </td>
                                        <td style={{ width: '120px' }} className="border pl-2 text-sm text-left whitespace-nowrap">
                                            {audit.editedBy}
                                        </td>
                                        {fields.map(({ key }, i) => {
                                            const oldVal = audit[`old${key}`];
                                            let value = audit[`new${key}`];
                                            if (key.toLowerCase().includes("amount")) {
                                                value = value && !isNaN(value) ? Number(value).toLocaleString("en-IN") : "-";
                                            }
                                            if (key.toLowerCase().includes("date")) {
                                                value = value ? new Date(value).toLocaleDateString("en-GB") : "-";
                                            }
                                            const changed = oldVal !== value;
                                            return (
                                                <td key={key} style={{ width: columnWidths[i] }}
                                                    className={`border text-sm text-center ${changed ? "bg-[#BF9853] text-black font-bold" : ""}`}
                                                >
                                                    {value ?? "-"}
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