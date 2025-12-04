import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import edit from '../Images/Edit.svg';
import Select from 'react-select';
import Filter from '../Images/filter (3).png'
import Reload from '../Images/rotate-right.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
Modal.setAppElement('#root');

const TableViewExpense = ({ username, userRoles = [] }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [exportFilteredExpenses, setExportFilteredExpenses] = useState([]);
    const [editId, setEditId] = useState(null);
    const [siteOptions, setSiteOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [machineToolsOptions, setMachineToolsOptions] = useState([]);
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
    const [accountTypeOption, setAccountTypeOption] = useState([]);
    const [editAccountTypeOptions, setEditAccountTypeOptions] = useState([]);
    const [siteOption, setSiteOption] = useState([]);
    const [vendorOption, setVendorOption] = useState([]);
    const [contractorOption, setContractorOption] = useState([]);
    const [categoryOption, setCategoryOption] = useState([]);
    const [machineToolsOption, setMachineToolsOption] = useState([]);

    const [editPaymentMode, setEditPaymentMode] = useState('');
    const [editUtilityType, setEditUtilityType] = useState('');
    const [editEbNumberOptions, setEditEbNumberOptions] = useState([]);
    const [editSelectedEbNumber, setEditSelectedEbNumber] = useState(null);
    const [editSelectedMonths, setEditSelectedMonths] = useState('');
    const [editThirdInput, setEditThirdInput] = useState('');
    const [editProjectData, setEditProjectData] = useState(null);
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
    const [modalIsOpen, setModalIsOpen] = useState(false);
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
                const uniqueEnos = [...new Set(response.data.map(expense => expense.eno))];
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
                setEnoOptions(uniqueEnos);
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
        setCurrentPage(1); 
        const anyFilterApplied = [
            selectedSiteName,
            selectedVendor,
            selectedContractor,
            selectedCategory,
            selectedMachineTools,
            selectedAccountType,
            selectedDate,
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
        setMachineToolsOptions(getOptions(filtered, "machineTools"));
        setAccountTypeOptions(getOptions(filtered, "accountType"));
        setEnoOptions([...new Set(filtered.map(item => item.eno).filter(Boolean))]);

    }, [
        selectedSiteName,
        selectedVendor,
        selectedContractor,
        selectedCategory,
        selectedMachineTools,
        selectedAccountType,
        selectedDate,
        startDate,
        endDate,
        selectedEno,
        expenses
    ]);
    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        if (name === "date" && value === "") {
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
                    hour12: true
                  })
                    .replace(",", "")
                    .replace(/\s/g, "-");
                const finalName = `${timestamp} - ${formData.siteName} - ${formData.vendor || formData.contractor} `;
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
            const resultText = await response.text();
            setExpenses(expenses.map(exp => (exp.id === editId ? { ...exp, ...updatedFormData } : exp)));
            setModalIsOpen(false);
            setIsSubmitting(false);
            alert('Updated successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Failed to update expense');
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
        setSelectedDate('');
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
    return (
        <body className=' bg-[#FAF6ED]'>
            <div>
                <div className='md:mt-[-35px] mb-3 text-left md:text-right md:items-center items-start cursor-default flex justify-between max-w-screen-2xl table-auto min-w-full overflow-auto w-screen'>
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
                    <div className={`text-left flex ${selectedDate || selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools || startDate || endDate
                        ? 'flex-col sm:flex-row sm:justify-between' : 'flex-row justify-between items-center'} mb-3 gap-2`}>
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
                            <button onClick={clearFilters}
                                className='w-36 h-9 border border-[#BF9853] rounded-md font-semibold text-sm text-[#BF9853] flex items-center justify-center gap-2' >
                                <img className='w-4 h-4' src={Reload} alt="Reload" />
                                Reset Table
                            </button>
                        </div>
                    </div>
                    <div>
                        <div ref={scrollRef}
                            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[600px] overflow-scroll select-none thin-scrollbar"
                            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                        >
                            <table className="table-fixed  min-w-[1765px] w-screen border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="pt-2 pl-3 w-36 font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('date')}>
                                            Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-2 w-[300px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('siteName')}>
                                            Project Name {sortField === 'siteName' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-2 w-[220px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('vendor')}>
                                            Vendor {sortField === 'vendor' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-2 w-[220px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('contractor')}>
                                            Contractor {sortField === 'contractor' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-2 w-[120px] font-bold text-left">Quantity</th>
                                        <th className="px-2 w-[120px] font-bold text-left">Amount</th>
                                        <th className="px-2 w-[120px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('comments')}>
                                            Comments {sortField === 'comments' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-2 w-[150px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('category')}>
                                            Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-2 w-[150px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('accountType')}>
                                            A/C Type {sortField === 'accountType' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-2 w-[150px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('machineTools')}>
                                            Machine Tools {sortField === 'machineTools' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-2 w-[150px] font-bold text-left">Source From</th>
                                        <th className="px-2 w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('eno')}>
                                            E.No {sortField === 'eno' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-2 w-[60px] font-bold text-left">Edit</th>
                                        <th className="px-3 w-[110px] font-bold text-left">Attach file</th>
                                    </tr>
                                    {showFilters && (
                                        <tr className="bg-[#FAF6ED]">
                                            <th className="px-2 py-3">
                                                <input
                                                    type="date"
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-[#BF9853] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:border-transparent transition-all duration-200"
                                                    placeholder="Search Date..."
                                                />
                                            </th>
                                            <th className="px-2 py-3">
                                                <Select
                                                    className="w-full"
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
                                                            backgroundColor: 'white',
                                                            borderWidth: '2px',
                                                            borderColor: state.isFocused
                                                                ? '#BF9853'
                                                                : '#BF9853',
                                                            borderRadius: '8px',
                                                            minHeight: '36px',
                                                            boxShadow: state.isFocused ? '0 0 0 3px rgba(191, 152, 83, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                borderColor: '#BF9853',
                                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#6B7280',
                                                            fontSize: '14px',
                                                            fontWeight: '400',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            fontWeight: '400',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: state.isFocused ? '#BF9853' : '#374151',
                                                            '&:active': {
                                                                backgroundColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            color: '#374151',
                                                        }),
                                                        indicatorSeparator: () => ({
                                                            display: 'none',
                                                        }),
                                                        dropdownIndicator: (provided) => ({
                                                            ...provided,
                                                            color: '#BF9853',
                                                        }),
                                                    }}
                                                />
                                            </th>
                                            <th className="px-2 py-3">
                                                <Select
                                                    className="w-full"
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
                                                            backgroundColor: 'white',
                                                            borderWidth: '2px',
                                                            borderColor: state.isFocused
                                                                ? '#BF9853'
                                                                : '#BF9853',
                                                            borderRadius: '8px',
                                                            minHeight: '36px',
                                                            boxShadow: state.isFocused ? '0 0 0 3px rgba(191, 152, 83, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                borderColor: '#BF9853',
                                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#6B7280',
                                                            fontSize: '14px',
                                                            fontWeight: '400',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            fontWeight: '400',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: state.isFocused ? '#BF9853' : '#374151',
                                                            '&:active': {
                                                                backgroundColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            color: '#374151',
                                                        }),
                                                        indicatorSeparator: () => ({
                                                            display: 'none',
                                                        }),
                                                        dropdownIndicator: (provided) => ({
                                                            ...provided,
                                                            color: '#BF9853',
                                                        }),
                                                    }}
                                                />
                                            </th>
                                            <th className="px-2 py-3">
                                                <Select
                                                    className="w-full"
                                                    options={contractorOptions}
                                                    value={selectedContractor ? { value: selectedContractor, label: selectedContractor } : null}
                                                    onChange={(selectedOption) => setSelectedContractor(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Search Contractor"
                                                    menuPlacement="bottom"
                                                    menuPosition="fixed"
                                                    isClearable
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: 'white',
                                                            borderWidth: '2px',
                                                            borderColor: state.isFocused
                                                                ? '#BF9853'
                                                                : '#BF9853',
                                                            borderRadius: '8px',
                                                            minHeight: '36px',
                                                            boxShadow: state.isFocused ? '0 0 0 3px rgba(191, 152, 83, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                borderColor: '#BF9853',
                                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#6B7280',
                                                            fontSize: '14px',
                                                            fontWeight: '400',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            fontWeight: '400',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: state.isFocused ? '#BF9853' : '#374151',
                                                            '&:active': {
                                                                backgroundColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            color: '#374151',
                                                        }),
                                                        indicatorSeparator: () => ({
                                                            display: 'none',
                                                        }),
                                                        dropdownIndicator: (provided) => ({
                                                            ...provided,
                                                            color: '#BF9853',
                                                        }),
                                                    }}
                                                />
                                            </th>
                                            <th></th>
                                            <th className="text-base text-left pl-2 font-bold py-3">
                                                ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </th>
                                            <th></th>
                                            <th className="px-2 py-3">
                                                <Select
                                                    className="w-full"
                                                    options={categoryOptions}
                                                    value={selectedCategory ? { value: selectedCategory, label: selectedCategory } : null}
                                                    onChange={(selectedOption) => setSelectedCategory(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Category..."
                                                    menuPlacement="bottom"
                                                    menuPosition="fixed"
                                                    isClearable
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: 'white',
                                                            borderWidth: '2px',
                                                            borderColor: state.isFocused
                                                                ? '#BF9853'
                                                                : '#BF9853',
                                                            borderRadius: '8px',
                                                            minHeight: '36px',
                                                            boxShadow: state.isFocused ? '0 0 0 3px rgba(191, 152, 83, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                borderColor: '#BF9853',
                                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#6B7280',
                                                            fontSize: '14px',
                                                            fontWeight: '400',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            fontWeight: '400',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: state.isFocused ? '#BF9853' : '#374151',
                                                            '&:active': {
                                                                backgroundColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            color: '#374151',
                                                        }),
                                                        indicatorSeparator: () => ({
                                                            display: 'none',
                                                        }),
                                                        dropdownIndicator: (provided) => ({
                                                            ...provided,
                                                            color: '#BF9853',
                                                        }),
                                                    }}
                                                />
                                            </th>
                                            <th className="px-2 py-3">
                                                <Select
                                                    className="w-full"
                                                    options={accountTypeOptions}
                                                    value={selectedAccountType ? { value: selectedAccountType, label: selectedAccountType } : null}
                                                    onChange={(selectedOption) => setSelectedAccountType(selectedOption ? selectedOption.value : '')}
                                                    placeholder="A/C Type"
                                                    menuPlacement="bottom"
                                                    menuPosition="fixed"
                                                    isClearable
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: 'white',
                                                            borderWidth: '2px',
                                                            borderColor: state.isFocused
                                                                ? '#BF9853'
                                                                : '#BF9853',
                                                            borderRadius: '8px',
                                                            minHeight: '36px',
                                                            boxShadow: state.isFocused ? '0 0 0 3px rgba(191, 152, 83, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                borderColor: '#BF9853',
                                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#6B7280',
                                                            fontSize: '14px',
                                                            fontWeight: '400',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            fontWeight: '400',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: state.isFocused ? '#BF9853' : '#374151',
                                                            '&:active': {
                                                                backgroundColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            color: '#374151',
                                                        }),
                                                        indicatorSeparator: () => ({
                                                            display: 'none',
                                                        }),
                                                        dropdownIndicator: (provided) => ({
                                                            ...provided,
                                                            color: '#BF9853',
                                                        }),
                                                    }}
                                                />
                                            </th>
                                            <th className="px-2 py-3">
                                                <Select
                                                    className="w-full"
                                                    options={machineToolsOptions.map(tool => ({ value: tool, label: tool }))}
                                                    value={selectedMachineTools ? { value: selectedMachineTools, label: selectedMachineTools } : null}
                                                    onChange={(selectedOption) => setSelectedMachineTools(selectedOption ? selectedOption.value : '')}
                                                    placeholder="Machine..."
                                                    menuPlacement="bottom"
                                                    menuPosition="fixed"
                                                    isClearable
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: 'white',
                                                            borderWidth: '2px',
                                                            borderColor: state.isFocused
                                                                ? '#BF9853'
                                                                : '#BF9853',
                                                            borderRadius: '8px',
                                                            minHeight: '36px',
                                                            boxShadow: state.isFocused ? '0 0 0 3px rgba(191, 152, 83, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                borderColor: '#BF9853',
                                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#6B7280',
                                                            fontSize: '14px',
                                                            fontWeight: '400',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            fontWeight: '400',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: state.isFocused ? '#BF9853' : '#374151',
                                                            '&:active': {
                                                                backgroundColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            color: '#374151',
                                                        }),
                                                        indicatorSeparator: () => ({
                                                            display: 'none',
                                                        }),
                                                        dropdownIndicator: (provided) => ({
                                                            ...provided,
                                                            color: '#BF9853',
                                                        }),
                                                    }}
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
                                            <td className=" text-sm text-left pl-3 w-32 ">{formatDateOnly(expense.date)}</td>
                                            <td className=" text-sm text-left w-60 ">{getDisplaySiteName(expense)}</td>
                                            <td className=" text-sm text-left ">{getDisplayVendorName(expense)}</td>
                                            <td className=" text-sm text-left ">{getDisplayContractorName(expense)}</td>
                                            <td className=" text-sm text-left ">{expense.quantity}</td>
                                            <td className="text-sm text-left pl-2 ">
                                                ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className=" text-sm text-left ">{expense.comments}</td>
                                            <td className=" text-sm text-left ">{expense.category}</td>
                                            <td className=" text-sm text-left ">{expense.accountType}</td>
                                            <td className=" text-sm text-left ">{expense.machineTools}</td>
                                            <td className=" text-sm text-left ">{expense.source}</td>
                                            <td className=" text-sm text-left pl-3 ">{expense.eno}</td>
                                            <td className=" flex py-2">
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
                                            <td className="px-4 text-sm">
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
                            className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50"
                            overlayClassName="fixed inset-0">
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
                                            className={`px-4 py-2 bg-[#BF9853] text-white rounded mt-3 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {isSubmitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
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