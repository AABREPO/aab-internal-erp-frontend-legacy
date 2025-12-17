import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Edit from '../Images/Edit.svg';
import Delete from '../Images/Delete.svg';
import history from '../Images/History.svg';
import Filter from '../Images/filter (3).png';
import Change from '../Images/dropdownchange.png';
import Select from 'react-select';
import download from '../Images/file_download.png'
import NotesStart from '../Images/notes _start.png';
import NotesEnd from '../Images/notes_end.png';
import fileUpload from '../Images/file_upload.png';
import file from '../Images/file.png';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { i } from 'mathjs';
function cleanUrl(url) {
    if (!url) return url;
    let cleanedUrl = url.replace(/^["']|["']$/g, '');
    if (cleanedUrl.includes('{') && cleanedUrl.includes('billCopyUrl')) {
        try {
            const parsed = JSON.parse(cleanedUrl);
            if (parsed.billCopyUrl) {
                return parsed.billCopyUrl;
            }
        } catch (e) {
            console.warn('Failed to parse URL as JSON:', cleanedUrl);
        }
    }
    return cleanedUrl;
}
const History = ({ username, userRoles = [] }) => {
    const normalizedUsername = username?.trim();
    const canEditDelete = normalizedUsername === 'Admin' || normalizedUsername === 'Mahalingam M';
    const [expenses, setExpenses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [newExpense, setNewExpense] = useState({
        date: "",
        contractor: "",
        vendor: "",
        project: "",
        project_id: "",
        contractor_id: "",
        vendor_id: "",
        employee_id: "",
        type: "",
        amount: "",
        client_name: "",
        client_id: "",
    });
    const [categoryComments, setCategoryComments] = useState("");
    const [newPayment, setNewPayment] = useState({ date: "", amount: "", type: "" });
    const [weeks, setWeeks] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [combinedOptions, setCombinedOptions] = useState([]);
    const [clientOptions, setClientOptions] = useState([]);
    const [clientProjectOptions, setClientProjectOptions] = useState([]);
    const [clientProjectMap, setClientProjectMap] = useState({});
    const [projectIdToClientName, setProjectIdToClientName] = useState({});
    const [isClientToggleActive, setIsClientToggleActive] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedContractor, setSelectedContractor] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedProjectName, setSelectedProjectName] = useState(null);
    const [selectedProjectOption, setSelectedProjectOption] = useState(null);
    const [projectId, setProjectId] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [contractorId, setContractorId] = useState('');
    const [selectedWeek, setSelectedWeek] = useState("");
    const [editingRowId, setEditingRowId] = useState('');
    const [editingOriginalRow, setEditingOriginalRow] = useState(null);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [editingPaymentId, setEditingPaymentId] = useState('');
    const [editingOriginalPayment, setEditingOriginalPayment] = useState(null);
    const [showWeeklyPaymentExpensesModal, setShowWeeklyPaymentExpensesModal] = useState(false);
    const [weeklyPaymentExpensesAudits, setWeeklyPaymentExpensesAudits] = useState([]);
    const [showWeeklyPaymentReceivedModal, setShowWeeklyPaymentReceivedModal] = useState(false);
    const [weeklyPaymentReceivedAudits, setWeeklyPaymentReceivedAudits] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [weeklyTypes, setWeeklyTypes] = useState([]);
    const [weeklyReceivedTypes, setWeeklyReceivedTypes] = useState([]);
    const currentYear = new Date().getFullYear();
    const startYear = 2000;
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [paymentPopupData, setPaymentPopupData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: "",
        paymentMode: "",
        chequeNo: "",
        chequeDate: "",
        transactionNumber: "",
        accountNumber: ""
    });
    const [currentProjectAdvanceRow, setCurrentProjectAdvanceRow] = useState(null);
    const [weeklyPaymentBills, setWeeklyPaymentBills] = useState([]);
    const [nextWeekDiscountInfo, setNextWeekDiscountInfo] = useState(null);
    const [previousPayments, setPreviousPayments] = useState([]);
    const [accountDetails, setAccountDetails] = useState([]);
    const [fileUploadPopup, setFileUploadPopup] = useState(false);
    const [currentFileRow, setCurrentFileRow] = useState(null);
    const [selectedFileForPopup, setSelectedFileForPopup] = useState(null);
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isConfirmingCategory, setIsConfirmingCategory] = useState(false);
    const [popup, setPopup] = useState({ show: false, message: "", type: "", dateStr: "", editRowId: null, editField: null, editIndex: null, originalDate: "" });
    const [showPopups, setShowPopups] = useState(false);
    const [currentRow, setCurrentRow] = useState(null);
    const [portalDescriptions, setPortalDescriptions] = useState({});
    const [editFormData, setEditFormData] = useState({
        date: "",
        contractor_id: "",
        vendor_id: "",
        employee_id: "",
        project_id: "",
        type: "",
        amount: "",
        advance_portal_id: "",
        staff_advance_portal_id: "",
        client_name: "",
        client_id: "",
        description: "",
    });
    const scrollRef = useRef(null);
    const paymentsScrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const handleMouseDown = (e, ref) => {
        if (!ref.current) return;
        isDragging.current = true;
        start.current = { x: e.clientX, y: e.clientY };
        scroll.current = {
            left: ref.current.scrollLeft,
            top: ref.current.scrollTop,
        };
        lastMove.current = {
            time: Date.now(),
            x: e.clientX,
            y: e.clientY,
        };
        ref.current.style.cursor = 'grabbing';
        ref.current.style.userSelect = 'none';
        cancelMomentum();
    };
    const handleMouseMove = (e, ref) => {
        if (!isDragging.current || !ref.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        const now = Date.now();
        const dt = now - lastMove.current.time || 16;
        velocity.current = {
            x: (e.clientX - lastMove.current.x) / dt,
            y: (e.clientY - lastMove.current.y) / dt,
        };
        ref.current.scrollLeft = scroll.current.left - dx;
        ref.current.scrollTop = scroll.current.top - dy;
        lastMove.current = {
            time: now,
            x: e.clientX,
            y: e.clientY,
        };
    };
    const handleMouseUp = (ref) => {
        if (!isDragging.current || !ref.current) return;
        isDragging.current = false;
        ref.current.style.cursor = '';
        ref.current.style.userSelect = '';
        applyMomentum();
    };
    const cancelMomentum = () => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    };
    const applyMomentum = () => {
        if (!scrollRef.current && !paymentsScrollRef.current) return;
        const friction = 0.95;
        const minVelocity = 0.1;
        const step = () => {
            const { x, y } = velocity.current;
            const activeRef = scrollRef.current || paymentsScrollRef.current;
            if (!activeRef) return;
            if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
                activeRef.scrollLeft -= x * 20;
                activeRef.scrollTop -= y * 20;
                velocity.current.x *= friction;
                velocity.current.y *= friction;
                animationFrame.current = requestAnimationFrame(step);
            } else {
                cancelMomentum();
            }
        };
        animationFrame.current = requestAnimationFrame(step);
    };
    const [showFilters, setShowFilters] = useState(false);
    const [selectDate, setSelectDate] = useState('');
    const [selectContractororVendorName, setSelectContractororVendorName] = useState('');
    const [selectProjectName, setSelectProjectName] = useState('');
    const [selectType, setSelectType] = useState('');
    function getStartAndEndDateOfWeek(weekNumber, year) {
        const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
        const dayOfWeek = simple.getDay();
        const ISOWeekStart = new Date(simple);
        ISOWeekStart.setDate(simple.getDate() - ((dayOfWeek + 7) % 9));
        const ISOWeekEnd = new Date(ISOWeekStart);
        ISOWeekEnd.setDate(ISOWeekStart.getDate() + 6);
        return {
            number: weekNumber,
            start: ISOWeekStart.toISOString().split("T")[0],
            end: ISOWeekEnd.toISOString().split("T")[0],
        };
    }
    function getStartAndEndDateOfISOWeek(weekNo, year) {
        const simple = new Date(year, 0, 1 + (weekNo - 1) * 7);
        let dayOfWeek = simple.getDay();
        if (dayOfWeek === 0) {
            dayOfWeek = 7;
        }
        const ISOweekStart = new Date(simple);
        ISOweekStart.setDate(simple.getDate() - dayOfWeek + 1);
        const ISOweekEnd = new Date(ISOweekStart);
        ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
        ISOweekStart.setHours(0, 0, 0, 0);
        ISOweekEnd.setHours(23, 59, 59, 999);
        return { startDate: ISOweekStart, endDate: ISOweekEnd };
    }
    const formatDateOnly = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return "";
        }
    };
    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
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
        } catch (error) {
            console.error("Error formatting date:", error);
            return "";
        }
    };
    const buildClientKey = (name = "", father = "", mobile = "") => {
        const normalizedName = (name || "").trim().toLowerCase();
        if (!normalizedName) return "";
        const normalizedFather = (father || "").trim().toLowerCase();
        const normalizedMobile = (mobile || "").trim();
        return `${normalizedName}|${normalizedFather}|${normalizedMobile}`;
    };
    const [laboursList, setLaboursList] = useState([]);
    useEffect(() => {
        fetchLaboursList();
    }, []);
    const fetchLaboursList = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/labours-details/getAll');
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
            console.log('Error fetching Labour names.');
        }
    };
    const getClientName = (entry) => {
        if (!entry) return "";
        if (entry.client_name) return entry.client_name;
        if (entry.client_id) {
            const option = clientOptions.find(opt => String(opt.clientId || opt.id) === String(entry.client_id));
            if (option) return option.label;
        }
        if (entry.project_id) {
            const mapped = projectIdToClientName[String(entry.project_id)];
            if (mapped) return mapped;
        }
        return "";
    };
    const getClientOption = (clientId, clientName) => {
        if (!clientOptions.length) return null;
        if (clientId) {
            const byId = clientOptions.find(opt => String(opt.clientId || opt.id) === String(clientId));
            if (byId) return byId;
        }
        if (clientName) {
            const byName = clientOptions.find(opt => opt.label === clientName);
            if (byName) return byName;
        }
        return null;
    };
    useEffect(() => {
        fetchWeeklyType();
    }, []);
    useEffect(() => {
        fetchWeeklyReceivedType();
    }, []);
    useEffect(() => {
        fetchAccountDetails();
    }, []);
    useEffect(() => {
        fetchCategories();
    }, []);
    const fetchWeeklyType = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/weekly_types/getAll');
            if (response.ok) {
                const data = await response.json();
                setWeeklyTypes(data);
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching tile area names.');
        }
    };
    const fetchWeeklyReceivedType = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/weekly_received_types/getAll');
            if (response.ok) {
                const data = await response.json();
                setWeeklyReceivedTypes(data);
            } else {
                console.log('Error fetching Payment Received type.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const fetchAccountDetails = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/account-details/getAll');
            if (response.ok) {
                const data = await response.json();
                setAccountDetails(data);
            } else {
                console.error('Error fetching account details');
            }
        } catch (error) {
            console.error('Error fetching account details:', error);
        }
    };
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
                id: item.id,
                value: item.category,
                label: item.category,
            }));
            setCategoryOptions(formattedData);
        } catch (error) {
            console.error("Fetch error: ", error);
        }
    };
    const handleFileUploadClick = (row) => {
        setCurrentFileRow(row);
        setSelectedFileForPopup(null);
        setFileUploadPopup(true);
    };
    const handleFileSelectInPopup = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFileForPopup(file);
        }
        e.target.value = '';
    };
    const handleSaveFileFromPopup = async () => {
        if (!selectedFileForPopup || !currentFileRow) return;
        try {
            const project = siteOptions.find(opt => opt.id === Number(currentFileRow.project_id));
            const siteNo = project?.sNo || "";
            const name =
                vendorOptions.find(opt => opt.id === Number(currentFileRow.vendor_id))?.label ||
                contractorOptions.find(opt => opt.id === Number(currentFileRow.contractor_id))?.label ||
                employeeOptions.find(opt => opt.id === Number(currentFileRow.employee_id))?.label ||
                "";
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
            const formData = new FormData();
            const finalName = `${timestamp}-${siteNo}-${name}`;
            formData.append("file", selectedFileForPopup);
            formData.append("file_name", finalName);
            const uploadResponse = await fetch(
                "https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive",
                {
                    method: "POST",
                    body: formData,
                }
            );
            if (!uploadResponse.ok) {
                throw new Error("File upload failed");
            }
            const uploadResult = await uploadResponse.json();
            const pdfUrl = uploadResult.url;
            const updateResponse = await fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/${currentFileRow.id}/bill-copy-url`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ billCopyUrl: pdfUrl })
            });
            if (!updateResponse.ok) {
                throw new Error("Failed to update bill copy URL");
            }
            setExpenses((prev) =>
                prev.map((exp) => (exp.id === currentFileRow.id ? { ...exp, bill_copy_url: pdfUrl } : exp))
            );
            setFileUploadPopup(false);
            setCurrentFileRow(null);
            setSelectedFileForPopup(null);
            setPopup({
                show: true,
                message: "File uploaded successfully!",
                type: "success",
                dateStr: new Date().toLocaleDateString('en-GB')
            });
        } catch (error) {
            console.error("Error uploading file:", error);
            setPopup({
                show: true,
                message: "Error during file upload. Please try again.",
                type: "error",
                dateStr: new Date().toLocaleDateString('en-GB')
            });
        }
    };
    const fetchWeeklyPaymentBills = async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/weekly-payment-bills/all", {
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
            setWeeklyPaymentBills(data);
            return data;
        } catch (error) {
            console.error("Error fetching payment bills:", error);
            return [];
        }
    };
    useEffect(() => {
        const fetchNextWeekDiscount = async () => {
            if (!selectedWeek) {
                setNextWeekDiscountInfo(null);
                return;
            }
            const nextWeekNumber = Number(selectedWeek) + 1;
            if (!Number.isFinite(nextWeekNumber)) {
                setNextWeekDiscountInfo(null);
                return;
            }
            try {
                const response = await axios.get(`https://backendaab.in/aabuildersDash/api/payments-received/week/${nextWeekNumber}`);
                const nextWeekPayments = Array.isArray(response.data) ? response.data : [];
                const discountSum = nextWeekPayments.reduce((sum, payment) => {
                    const discount = Number(payment.discount_amount) || 0;
                    return discount > 0 ? sum + discount : sum;
                }, 0);
                if (discountSum > 0) {
                    setNextWeekDiscountInfo({
                        weekNumber: nextWeekNumber,
                        amount: discountSum,
                    });
                } else {
                    setNextWeekDiscountInfo(null);
                }
            } catch (error) {
                console.error("Error fetching next week payments:", error);
                setNextWeekDiscountInfo(null);
            }
        };
        fetchNextWeekDiscount();
    }, [selectedWeek]);
    useEffect(() => {
        fetchWeeklyPaymentBills();
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
                    value: item.vendorName,
                    label: item.vendorName,
                    id: item.id,
                    type: "Vendor",
                }));
                setVendorOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchVendorNames();
    }, []);
    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            try {
                const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
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
                    value: item.contractorName,
                    label: item.contractorName,
                    id: item.id,
                    type: "Contractor",
                }));
                setContractorOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchContractorNames();
    }, []);
    useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions, ...employeeOptions]); }, [vendorOptions, contractorOptions, employeeOptions]);
    useEffect(() => {
        const predefinedSiteOptions = [
            { value: "Mason Advance", label: "Mason Advance", id: 1, sNo: "1" },
            { value: "Material Advance", label: "Material Advance", id: 2, sNo: "2" },
            { value: "Weekly Advance", label: "Weekly Advance", id: 3, sNo: "3" },
            { value: "Excess Advance", label: "Excess Advance", id: 4, sNo: "4" },
            { value: "Material Rent", label: "Material Rent", id: 5, sNo: "5" },
            { value: "Subhash Kumar - Kunnur", label: "Subhash Kumar - Kunnur", id: 6, sNo: "6" },
            { value: "Summary Bill", label: "Summary Bill", id: 7, sNo: "7" },
            { value: "Daily Wage", label: "Daily Wage", id: 8, sNo: "8" },
            { value: "Rent Management Portal", label: "Rent Management Portal", id: 9, sNo: "9" },
            { value: "Multi-Project Batch", label: "Multi-Project Batch", id: 10, sNo: "10" },
            { value: "Loan Portal", label: "Loan Portal", id: 11, sNo: "11" },
        ];
        const fetchSites = async () => {
            try {
                const response = await fetch("https://backendaab.in/aabuilderDash/api/projects/getAll", {
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
                const projectClientMapTemp = {};
                const projectClientNameTemp = {};
                const projectOptions = Array.isArray(data)
                    ? data.map((project, index) => {
                        const label = (project.projectName || project.projectReferenceName || `Project ${project.projectId || project.id || index + 1}`).trim();
                        const rawId = project.id ?? project.projectId ?? (100000 + index);
                        const optionId = Number(rawId);
                        const option = {
                            value: label,
                            label,
                            id: optionId,
                            sNo: project.projectId || ""
                        };
                        const ownerCandidates = Array.isArray(project?.ownerDetailsList)
                            ? project.ownerDetailsList
                            : Array.isArray(project?.ownerDetails)
                                ? project.ownerDetails
                                : [];
                        ownerCandidates.forEach((owner) => {
                            const key = buildClientKey(owner?.clientName, owner?.fatherName, owner?.mobile);
                            if (!key) return;
                            if (!projectClientMapTemp[key]) {
                                projectClientMapTemp[key] = {
                                    name: owner?.clientName || "",
                                    fatherName: owner?.fatherName || "",
                                    mobile: owner?.mobile || "",
                                    clientId: owner?.id || key,
                                    projects: [],
                                };
                            }
                            projectClientMapTemp[key].projects.push(option);
                            if (!projectClientNameTemp[optionId]) {
                                projectClientNameTemp[optionId] = owner?.clientName || "";
                            }
                        });
                        if (!projectClientNameTemp[optionId]) {
                            projectClientNameTemp[optionId] = "";
                        }
                        return option;
                    })
                    : [];
                const combinedSiteOptions = [...predefinedSiteOptions, ...projectOptions];
                setSiteOptions(combinedSiteOptions);
                setProjectIdToClientName(projectClientNameTemp);
                setClientProjectMap(projectClientMapTemp);
                const clientOptionList = Object.entries(projectClientMapTemp).map(([key, value]) => ({
                    value: value.name,
                    label: value.name,
                    id: value.clientId,
                    clientId: value.clientId,
                    fatherName: value.fatherName,
                    mobile: value.mobile,
                    projects: value.projects,
                    compositeKey: key,
                }));
                setClientOptions(clientOptionList);
            } catch (error) {
                console.error("Fetch error: ", error);
                setSiteOptions(predefinedSiteOptions);
                setClientOptions([]);
                setClientProjectMap({});
                setProjectIdToClientName({});
            }
        };
        fetchSites();
    }, []);
    useEffect(() => {
        if (!isClientToggleActive) return;
        if (clientProjectOptions.length === 1) {
            const onlyProject = clientProjectOptions[0];
            setSelectedProjectName(onlyProject);
            setSelectedProjectOption(onlyProject);
            setProjectId(onlyProject.id);
            setNewExpense((prev) => ({ ...prev, project_id: onlyProject.id }));
        }
    }, [clientProjectOptions, isClientToggleActive]);
    useEffect(() => {
        const fetchWeeks = async () => {
            try {
                const response = await axios.get('https://backendaab.in/aabuildersDash/api/payments-received/active_weeks');
                const currentYear = new Date().getFullYear();
                const enrichedWeeks = response.data.map((weekNumber) =>
                    getStartAndEndDateOfWeek(weekNumber, currentYear)
                );
                setWeeks(enrichedWeeks);
            } catch (error) {
                console.error('Error fetching active weeks:', error);
            }
        };
        fetchWeeks();
    }, []);
    useEffect(() => {
        const fetchWeekData = async () => {
            if (!selectedWeek) return;
            try {
                const [expensesRes, paymentsRes] = await Promise.all([
                    axios.get(`https://backendaab.in/aabuildersDash/api/weekly-expenses/week/${selectedWeek}`),
                    axios.get(`https://backendaab.in/aabuildersDash/api/payments-received/week/${selectedWeek}`)
                ]);
                setExpenses(expensesRes.data);
                const filteredPayments = paymentsRes.data.filter(
                    (payment) => payment.type !== "Handover"
                );
                setPayments(filteredPayments);
                await fetchWeeklyPaymentBills();
                const projectAdvanceRows = expensesRes.data.filter(row => row.type === "Project Advance" && row.advance_portal_id);
                const newDescriptions = { ...portalDescriptions };
                for (const row of projectAdvanceRows) {
                    try {
                        const res = await fetch(
                            `https://backendaab.in/aabuildersDash/api/advance_portal/get/${row.advance_portal_id}`
                        );
                        if (res.ok) {
                            const data = await res.json();
                            const description = (data.description || "").trim();
                            newDescriptions[row.advance_portal_id] = description !== "" ? description : undefined;
                        }
                    } catch (error) {
                        console.error("Error fetching advance portal data:", error);
                    }
                }
                setPortalDescriptions(newDescriptions);
            } catch (error) {
                console.error("Error fetching weekly data:", error);
            }
        };
        fetchWeekData();
    }, [selectedWeek]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "type") {
            // Validate type selection against current party selection
            const allowedTypesForClient = ["Loan", "Bank", "Claim"];
            const isClientTypeAllowed = allowedTypesForClient.includes(value);

            if (value === "Staff Advance") {
                // Staff Advance only allows Employee
                if (selectedContractor || selectedVendor || selectedClient) {
                    alert("Staff Advance type only allows Employee. Please select an Employee or clear the Contractor/Vendor/Client selection.");
                    return; // Prevent type change
                }
            } else if (value === "Project Advance") {
                // Project Advance only allows Contractor or Vendor
                if (selectedEmployee || selectedClient) {
                    alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor or clear the Employee/Client selection.");
                    return; // Prevent type change
                }
            }

            // If type doesn't allow client selection and client toggle is active, disable it and clear client selection
            if (!isClientTypeAllowed && isClientToggleActive) {
                setIsClientToggleActive(false);
                setSelectedClient(null);
                setClientProjectOptions([]);
                setSelectedProjectName(null);
                setSelectedProjectOption(null);
                setNewExpense((prev) => ({
                    ...prev,
                    [name]: value,
                    client_name: "",
                    client_id: "",
                }));
                return;
            }

            // If validation passes, update the type
            setNewExpense((prev) => ({ ...prev, [name]: value }));
        } else {
            setNewExpense((prev) => ({ ...prev, [name]: value }));
        }
    };
    const clearFilters = () => {
        setSelectDate('');
        setSelectContractororVendorName('');
        setSelectProjectName('');
        setSelectType('');
    };
    const getVendorName = (id) =>
        vendorOptions.find(v => v.id === id)?.value || "";
    const getContractorName = (id) =>
        contractorOptions.find(c => c.id === id)?.value || "";
    const getEmployeeName = (id) =>
        employeeOptions.find(c => c.id === id)?.value || "";
    const getSiteName = (id) =>
        siteOptions.find(s => String(s.id) === String(id))?.value || "";
    const getLabourName = (id) =>
        laboursList.find(l => l.id === id)?.value || "";
    const getPartyDisplayName = (entry) => {
        const hasContractorVendorEmployee = entry.contractor_id || entry.vendor_id || entry.employee_id;
        if (!hasContractorVendorEmployee && entry.type === "Loan") {
            const client = getClientName(entry);
            if (client) return client;
        }
        if (entry.vendor_id) return getVendorName(entry.vendor_id);
        if (entry.contractor_id) return getContractorName(entry.contractor_id);
        if (entry.employee_id) return getEmployeeName(entry.employee_id);
        if (entry.labour_id) return getLabourName(entry.labour_id);
        return "";
    };
    const filteredExpenses = expenses.filter((entry) => {
        if (selectDate) {
            const [year, month, day] = selectDate.split("-");
            const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
            const entryDateObj = new Date(entry.date);
            const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
            if (formattedEntryDate !== formattedSelectDate) return false;
        }
        if (selectContractororVendorName) {
            const name = getPartyDisplayName(entry);
            if (name.toLowerCase() !== selectContractororVendorName.toLowerCase())
                return false;
        }
        if (selectProjectName) {
            const projectName = getSiteName(entry.project_id) || "";
            if (projectName.toLowerCase() !== selectProjectName.toLowerCase())
                return false;
        }
        if (selectType) {
            if (entry.type?.toLowerCase() !== selectType.toLowerCase()) return false;
        }
        return true;
    });
    const contractorVendorFilterOptions = React.useMemo(() => {
        const labels = new Set();
        return filteredExpenses.map(exp => {
            const label = getPartyDisplayName(exp);
            if (label && !labels.has(label)) {
                labels.add(label);
                return { value: label, label };
            }
            return null;
        }).filter(Boolean);
    }, [filteredExpenses, combinedOptions, clientOptions, projectIdToClientName]);
    const projectFilterOptions = React.useMemo(() => {
        const ids = new Set();
        return filteredExpenses.map(exp => {
            const option = siteOptions.find(opt => opt.id === Number(exp.project_id));
            if (option && !ids.has(option.id)) {
                ids.add(option.id);
                return { value: option.label, label: option.label };
            }
            return null;
        }).filter(Boolean);
    }, [filteredExpenses, siteOptions]);
    const balance = (
        payments.reduce((total, row) => total + Number(row.amount || 0), 0) -
        filteredExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0)
    ).toFixed(2);
    const handleExpenseChange = (e) => {
        const { name, value } = e.target;
        if (name === "date") {
            validateExpenseDate(value);
        } else if (name === "amount" && Number(value) > Number(balance)) {
            alert("Amount cannot exceed the available Balance!");
            setNewExpense((prev) => ({ ...prev, [name]: "" }));
            return;
        } else {
            setNewExpense((prev) => ({ ...prev, [name]: value }));
        }
    };
    // Immediate date validation for Expense
    const validateExpenseDate = (dateStr) => {
        if (!dateStr || !selectedWeek) return;
        const year = new Date().getFullYear();
        const { startDate, endDate } = getStartAndEndDateOfISOWeek(Number(selectedWeek), year);
        const selectedDate = new Date(dateStr);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate < startDate || selectedDate > endDate) {
            setPopup({
                show: true,
                message: `Selected date is out of current week range (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
                type: "expense",
                dateStr,
                editRowId: null,
                editField: null,
                editIndex: null,
                originalDate: ""
            });
        } else {
            setNewExpense((prev) => ({ ...prev, date: dateStr }));
        }
    };
    const handlePartySourceToggle = () => {
        setIsClientToggleActive((prev) => !prev);
        setSelectedClient(null);
        setClientProjectOptions([]);
        setSelectedProjectName(null);
        setSelectedProjectOption(null);
        setSelectedContractor(null);
        setSelectedVendor(null);
        setSelectedEmployee(null);
        setNewExpense((prev) => ({
            ...prev,
            client_name: "",
            client_id: "",
            project_id: "",
            contractor_id: "",
            vendor_id: "",
            employee_id: "",
        }));
        setVendorId('');
        setContractorId('');
        setProjectId('');
    };
    useEffect(() => {
        const handleWheel = (event) => {
            if (document.activeElement.type === "number") {
                event.preventDefault();
            }
        };
        document.addEventListener("wheel", handleWheel, { passive: false });
        return () => {
            document.removeEventListener("wheel", handleWheel);
        };
    }, []);
    const updateLoanPortalEntry = async (loanPortalId, { date, amount, vendorId, contractorId, employeeId, projectId }) => {
        if (!loanPortalId) return;
        const payload = {
            type: "Loan",
            date,
            amount,
            loan_payment_mode: "Cash",
            loan_refund_amount: 0,
            from_purpose_id: 0,
            transfer_Project_id: 0,
            to_purpose_id: 0,
            vendor_id: vendorId || 0,
            contractor_id: contractorId || 0,
            employee_id: employeeId || 0,
            project_id: projectId || 0,
            description: "",
            file_url: ""
        };
        const response = await fetch(
            `https://backendaab.in/aabuildersDash/api/loans/${loanPortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to update Loan Portal entry");
        }
        return response.json();
    };
    const clearLoanPortalEntry = async (loanPortalId, date) => {
        if (!loanPortalId) return;
        const payload = {
            loanPortalId,
            type: "",
            date,
            amount: 0,
            loan_refund_amount: 0,
            loan_payment_mode: "",
            from_purpose_id: 0,
            to_purpose_id: 0,
            vendor_id: 0,
            contractor_id: 0,
            employee_id: 0,
            project_id: 0,
            transfer_Project_id: 0,
            entry_no: 0,
            description: "",
        };
        const response = await fetch(
            `https://backendaab.in/aabuildersDash/api/loans/${loanPortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to clear Loan Portal entry");
        }
        return response.json();
    };
    const createLoanPortalEntry = async ({ date, amount, vendorId, contractorId, employeeId, projectId }) => {
        const payload = {
            type: "Loan",
            date,
            amount,
            loan_payment_mode: "Cash",
            loan_refund_amount: 0,
            from_purpose_id: 0,
            transfer_Project_id: 0,
            to_purpose_id: 0,
            vendor_id: vendorId || 0,
            contractor_id: contractorId || 0,
            employee_id: employeeId || 0,
            project_id: projectId || 0,
            description: "Loan from Cash Register",
            file_url: ""
        };
        const response = await fetch(
            "https://backendaab.in/aabuildersDash/api/loans/save",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to save Loan Portal entry");
        }
        return response.json();
    };
    const getCurrentISOWeekNumber = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
        const oneWeek = 604800000;
        return Math.floor(diff / oneWeek) + 1;
    };
    const updateAdvancePortalEntry = async (advancePortalId, { date, amount, vendorId, contractorId, projectId, description, weekNo }) => {
        if (!advancePortalId) return;
        const payload = {
            type: "Advance",
            date,
            contractor_id: contractorId || null,
            vendor_id: vendorId || null,
            project_id: projectId || null,
            transfer_site_id: 0,
            payment_mode: "Cash",
            amount: Number(amount) || 0,
            bill_amount: 0,
            refund_amount: 0,
            week_no: weekNo || Number(selectedWeek) || getCurrentISOWeekNumber(),
            description: description || "",
            file_url: "",
        };
        const response = await fetch(
            `https://backendaab.in/aabuildersDash/api/advance_portal/edit/${advancePortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to update Advance Portal entry");
        }
        return response.json();
    };
    const clearAdvancePortalEntry = async (advancePortalId, date) => {
        if (!advancePortalId) return;
        const clearedData = {
            date: date || new Date().toISOString().split("T")[0],
            amount: null,
            project_id: null,
            vendor_id: null,
            contractor_id: null,
            file_url: null,
            description: null,
            bill_amount: null,
            type: null,
            transfer_site_id: null,
            payment_mode: null,
            refund_amount: null,
            week_no: null,
            entry_no: null,
        };
        const response = await fetch(
            `https://backendaab.in/aabuildersDash/api/advance_portal/edit/${advancePortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clearedData),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to clear Advance Portal entry");
        }
        return response.json();
    };
    const updateStaffAdvancePortalEntry = async (staffAdvancePortalId, { date, amount, employeeId, projectId, description, weekNo }) => {
        if (!staffAdvancePortalId) return;
        const payload = {
            type: "Advance",
            date,
            employee_id: employeeId || null,
            project_id: projectId || null,
            amount: Number(amount) || 0,
            week_no: weekNo || Number(selectedWeek) || getCurrentISOWeekNumber(),
            staff_payment_mode: "Cash",
            from_purpose_id: 4,
            description: description || "",
            staff_refund_amount: 0,
            file_url: null,
        };
        const response = await fetch(
            `https://backendaab.in/aabuildersDash/api/staff-advance/${staffAdvancePortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to update Staff Advance Portal entry");
        }
        return response.json();
    };
    const clearStaffAdvancePortalEntry = async (staffAdvancePortalId, date) => {
        if (!staffAdvancePortalId) return;
        const clearedData = {
            date: date || new Date().toISOString().split("T")[0],
            amount: null,
            employee_id: null,
            description: null,
            type: null,
            week_no: null,
            from_purpose_id: null,
            staff_payment_mode: null,
            file_url: null,
            staff_refund_amount: null,
            entry_no: null,
        };
        const response = await fetch(
            `https://backendaab.in/aabuildersDash/api/staff-advance/${staffAdvancePortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clearedData),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to clear Staff Advance Portal entry");
        }
        return response.json();
    };
    const createAdvancePortalEntry = async ({ date, amount, vendorId, contractorId, projectId }) => {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/getAll");
        if (!response.ok) {
            throw new Error("Failed to fetch advance portal entry numbers");
        }
        const allEntries = await response.json();
        const maxEntryNo = allEntries.length > 0 ? Math.max(...allEntries.map(item => item.entry_no || 0)) : 0;
        const nextEntryNo = maxEntryNo + 1;
        const weekNo = Number(selectedWeek) || getCurrentISOWeekNumber();
        const payload = {
            type: "Advance",
            date,
            contractor_id: contractorId || null,
            vendor_id: vendorId || null,
            project_id: projectId || null,
            transfer_site_id: 0,
            payment_mode: "Cash",
            amount,
            bill_amount: 0,
            refund_amount: 0,
            entry_no: nextEntryNo,
            week_no: weekNo,
            description: "",
            file_url: "",
        };
        const saveResponse = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!saveResponse.ok) {
            throw new Error("Failed to save advance portal entry");
        }
        return saveResponse.json();
    };
    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        if (name === "date") {
            validatePaymentDate(value);
        } else {
            setNewPayment((prev) => ({ ...prev, [name]: value }));
        }
    };
    // Immediate date validation for Payment
    const validatePaymentDate = (dateStr) => {
        if (!dateStr || !selectedWeek) return;
        const year = new Date().getFullYear();
        const { startDate, endDate } = getStartAndEndDateOfISOWeek(Number(selectedWeek), year);
        const selectedDate = new Date(dateStr);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate < startDate || selectedDate > endDate) {
            setPopup({
                show: true,
                message: `Selected date is out of current week range (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
                type: "payment",
                dateStr,
                editRowId: null,
                editField: null,
                editIndex: null,
                originalDate: ""
            });
        } else {
            setNewPayment((prev) => ({ ...prev, date: dateStr }));
        }
    };
    const handleKeyDown = async (e) => {
        if (e.key !== "Enter") return;
        if (!newExpense.date) {
            alert("Please select a date");
            return;
        }
        if (!selectedProjectName || !newExpense.type || !newExpense.amount) {
            alert("Please fill all fields except date");
            return;
        }
        // Validation before submit: Check type and party compatibility
        if (newExpense.type === "Staff Advance") {
            if (selectedContractor || selectedVendor || selectedClient) {
                alert("Staff Advance type only allows Employee. Please select an Employee and remove Contractor/Vendor/Client selection.");
                return;
            }
            if (!selectedEmployee) {
                alert("Staff Advance type requires an Employee to be selected.");
                return;
            }
        }
        if (newExpense.type === "Project Advance") {
            if (selectedEmployee || selectedClient) {
                alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor and remove Employee/Client selection.");
                return;
            }
            if (!selectedContractor && !selectedVendor) {
                alert("Project Advance type requires either a Contractor or Vendor to be selected.");
                return;
            }
        }
        const payload = {
            date: newExpense.date,
            created_at: new Date().toISOString(),
            contractor_id: selectedContractor ? Number(selectedContractor.id) : null,
            vendor_id: selectedVendor ? Number(selectedVendor.id) : null,
            employee_id: selectedEmployee ? Number(selectedEmployee.id) : null,
            project_id: selectedProjectName ? Number(selectedProjectName.id) : null,
            client_name: selectedClient?.label || newExpense.client_name || null,
            client_id: selectedClient?.id || newExpense.client_id || null,
            type: newExpense.type,
            amount: Number(newExpense.amount),
            status: false,
            weekly_number: Number(selectedWeek),
            period_start_date: new Date().toISOString().split("T")[0],
            period_end_date: new Date().toISOString().split("T")[0],
            advance_portal_id: null,
            staff_advance_portal_id: null,
            loan_portal_id: null,
        };
        try {
            if (newExpense.type === "Loan") {
                try {
                    const loanResponse = await createLoanPortalEntry({
                        date: newExpense.date,
                        amount: Number(newExpense.amount) || 0,
                        vendorId: selectedVendor ? Number(selectedVendor.id) : 0,
                        contractorId: selectedContractor ? Number(selectedContractor.id) : 0,
                        employeeId: selectedEmployee ? Number(selectedEmployee.id) : 0,
                        projectId: selectedProjectName ? Number(selectedProjectName.id) : 0,
                    });
                    payload.loan_portal_id = loanResponse?.id || loanResponse?.loanPortalId || null;
                } catch (loanError) {
                    console.error("Error creating loan portal entry:", loanError);
                }
            }
            if (newExpense.type === "Project Advance") {
                const advanceResponse = await createAdvancePortalEntry({
                    date: newExpense.date,
                    amount: Number(newExpense.amount) || 0,
                    vendorId: selectedVendor ? Number(selectedVendor.id) : null,
                    contractorId: selectedContractor ? Number(selectedContractor.id) : null,
                    projectId: selectedProjectName ? Number(selectedProjectName.id) : null,
                });
                payload.advance_portal_id = advanceResponse?.advancePortalId || advanceResponse?.id || null;
            }
            if (newExpense.type === "Staff Advance") {
                try {
                    const staffAdvanceRes = await fetch("https://backendaab.in/aabuildersDash/api/staff-advance/all");
                    if (!staffAdvanceRes.ok) throw new Error("Failed to fetch staff advance entry numbers");
                    const staffAdvanceData = await staffAdvanceRes.json();
                    const maxEntryNo = staffAdvanceData.length > 0
                        ? Math.max(...staffAdvanceData.map((item) => item.entry_no || 0))
                        : 0;
                    const nextEntryNo = maxEntryNo + 1;
                    const weekNo = Number(selectedWeek) || getCurrentISOWeekNumber();
                    const staffAdvanceSaveData = {
                        date: newExpense.date,
                        employee_id: selectedEmployee ? Number(selectedEmployee.id) : null,
                        project_id: selectedProjectName ? Number(selectedProjectName.id) : null,
                        type: "Advance",
                        from_purpose_id: 4,
                        staff_payment_mode: "Cash",
                        entry_no: nextEntryNo,
                        week_no: weekNo,
                        amount: Number(newExpense.amount) || 0,
                        staff_refund_amount: 0.0,
                        description: "",
                        file_url: null,
                    };
                    const staffAdvanceResponse = await fetch(
                        "https://backendaab.in/aabuildersDash/api/staff-advance/save",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(staffAdvanceSaveData)
                        }
                    );
                    if (!staffAdvanceResponse.ok) {
                        throw new Error("Failed to save staff advance");
                    }
                    const staffAdvanceResponseData = await staffAdvanceResponse.json();
                    payload.staff_advance_portal_id = staffAdvanceResponseData.id || staffAdvanceResponseData.staff_advance_portal_id || staffAdvanceResponseData.staffAdvancePortalId || null;
                } catch (staffAdvanceError) {
                    console.error("Error creating staff advance portal entry:", staffAdvanceError);
                }
            }
            const response = await fetch("https://backendaab.in/aabuildersDash/api/weekly-expenses/update/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                window.location.reload();
                setExpenses((prev) => [{ id: Date.now(), ...newExpense }, ...prev]);
                setNewExpense({
                    date: "",
                    contractor: "",
                    vendor: "",
                    project: "",
                    project_id: "",
                    contractor_id: "",
                    vendor_id: "",
                    employee_id: "",
                    type: "",
                    amount: "",
                    client_name: "",
                    client_id: "",
                });
                setSelectedClient(null);
                setClientProjectOptions([]);
                setSelectedProjectName(null);
                setSelectedProjectOption(null);
                setSelectedContractor(null);
                setSelectedVendor(null);
                setSelectedEmployee(null);
                setVendorId('');
                setContractorId('');
                setProjectId('');
            } else {
                console.error("Failed to save expense. Server responded with:", response.status);
            }
        } catch (err) {
            console.error("Error during expense save:", err);
        }
    };
    const handleKeyDown1 = async (e) => {
        if (e.key === "Enter") {
            const paymentPayload = {
                date: newPayment.date,
                amount: parseFloat(newPayment.amount),
                type: newPayment.type,
                status: true,
                weekly_number: Number(selectedWeek),
                period_start_date: new Date().toISOString().split("T")[0],
                period_end_date: new Date().toISOString().split("T")[0],
            };
            try {
                const response = await fetch("https://backendaab.in/aabuildersDash/api/payments-received/update/save", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(paymentPayload),
                });
                if (response.ok) {
                    window.location.reload();
                    setPayments((prev) => [{ id: Date.now(), ...newPayment }, ...prev]);
                    setNewPayment({ date: "", amount: "", type: "Weekly" });
                } else {
                    console.error("❌ Failed to save payment");
                }
            } catch (error) {
                console.error("🚨 Error saving payment:", error);
            }
        }
    };
    const handleEditExpense = (id, field, value) => {
        if (field === "date") {
            // Validate date against selected week range
            if (!value || !selectedWeek) {
                setExpenses((prevExpenses) =>
                    prevExpenses.map((expense) =>
                        expense.id === id ? { ...expense, [field]: value } : expense
                    )
                );
                return;
            }
            const year = new Date().getFullYear();
            const { startDate, endDate } = getStartAndEndDateOfISOWeek(Number(selectedWeek), year);
            const selectedDate = new Date(value);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < startDate || selectedDate > endDate) {
                const row = expenses.find(exp => exp.id === id);
                setPopup({
                    show: true,
                    message: `Selected date is out of current week range (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
                    type: "edit-expense",
                    dateStr: value,
                    editRowId: id,
                    editField: field,
                    editIndex: null,
                    originalDate: row?.date || ""
                });
                return; // Prevent date change
            }
            setExpenses((prevExpenses) =>
                prevExpenses.map((expense) =>
                    expense.id === id ? { ...expense, [field]: value } : expense
                )
            );
        } else if (field === "amount" && Number(value) > Number(balance)) {
            alert("Amount cannot exceed the available Balance!");
            setExpenses((prevExpenses) =>
                prevExpenses.map((expense) =>
                    expense.id === id ? { ...expense, amount: "" } : expense
                )
            );
            return;
        } else if (field === "type") {
            const row = expenses.find(exp => exp.id === id);
            const allowedTypesForClient = ["Loan", "Bank", "Claim"];
            const isClientTypeAllowed = allowedTypesForClient.includes(value);
            if (value === "Staff Advance") {
                if (row?.contractor_id || row?.vendor_id || row?.client_id) {
                    alert("Staff Advance type only allows Employee. Please select an Employee or clear the Contractor/Vendor/Client selection.");
                    return;
                }
            } else if (value === "Project Advance") {
                if (row?.employee_id || row?.client_id) {
                    alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor or clear the Employee/Client selection.");
                    return;
                }
            }
            if (!isClientTypeAllowed && isClientToggleActive && row?.client_id) {
                setIsClientToggleActive(false);
                setSelectedClient(null);
                setClientProjectOptions([]);
                setSelectedProjectName(null);
                setSelectedProjectOption(null);
                setExpenses((prevExpenses) =>
                    prevExpenses.map((expense) =>
                        expense.id === id ? { ...expense, [field]: value, client_name: "", client_id: "" } : expense
                    )
                );
                return;
            }
            setExpenses((prevExpenses) =>
                prevExpenses.map((expense) =>
                    expense.id === id ? { ...expense, [field]: value } : expense
                )
            );
        } else {
            setExpenses((prevExpenses) =>
                prevExpenses.map((expense) =>
                    expense.id === id ? { ...expense, [field]: value } : expense
                )
            );
        }
    };
    const handleEditPayment = (index, field, value) => {
        if (field === "date") {
            const row = payments[index];
            if (!value || !selectedWeek) {
                setPayments((prevPayments) =>
                    prevPayments.map((payment, i) =>
                        i === index ? { ...payment, [field]: value } : payment
                    )
                );
                return;
            }
            const year = new Date().getFullYear();
            const { startDate, endDate } = getStartAndEndDateOfISOWeek(Number(selectedWeek), year);
            const selectedDate = new Date(value);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < startDate || selectedDate > endDate) {
                setPopup({
                    show: true,
                    message: `Selected date is out of current week range (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
                    type: "edit-payment",
                    dateStr: value,
                    editRowId: null,
                    editField: field,
                    editIndex: index,
                    originalDate: row?.date || ""
                });
                return;
            }
            setPayments((prevPayments) =>
                prevPayments.map((payment, i) =>
                    i === index ? { ...payment, [field]: value } : payment
                )
            );
        } else {
            setPayments((prevPayments) =>
                prevPayments.map((payment, i) =>
                    i === index ? { ...payment, [field]: value } : payment
                )
            );
        }
    };
    function getWeekStartEnd(year, weekNumber) {
        const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
        const dow = simple.getDay();
        const ISOweekStart = simple;
        if (dow <= 4) {
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        } else {
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        }
        const ISOweekEnd = new Date(ISOweekStart);
        ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
        return { start: ISOweekStart, end: ISOweekEnd };
    }
    const generatePDF = async () => {
        if (!selectedWeek) {
            alert("Please select a week before generating the PDF.");
            return;
        }
        const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const year = new Date().getFullYear();
        const weekDates = getWeekStartEnd(year, Number(selectedWeek));
        if (!weekDates || !weekDates.start || !weekDates.end) {
            alert("Error: Could not calculate week dates. Please try again.");
            return;
        }
        const { start, end } = weekDates;
        const weekStartDate = start.toLocaleDateString("en-GB");
        const weekEndDate = end.toLocaleDateString("en-GB");
        if (!Array.isArray(expenses) || !Array.isArray(payments)) {
            alert("Error: Data not loaded properly. Please refresh the page and try again.");
            return;
        }
        let advancePortalData = [];
        let staffAdvanceData = [];
        let loanPortalData = [];
        try {
            const [advanceRes, staffAdvanceRes, loanRes] = await Promise.all([
                fetch("https://backendaab.in/aabuildersDash/api/advance_portal/getAll").catch(() => null),
                fetch("https://backendaab.in/aabuildersDash/api/staff-advance/all").catch(() => null),
                fetch("https://backendaab.in/aabuildersDash/api/loans/all").catch(() => null)
            ]);
            if (advanceRes && advanceRes.ok) {
                advancePortalData = await advanceRes.json();
            }
            if (staffAdvanceRes && staffAdvanceRes.ok) {
                staffAdvanceData = await staffAdvanceRes.json();
            }
            if (loanRes && loanRes.ok) {
                loanPortalData = await loanRes.json();
            }
        } catch (error) {
            console.error("Error fetching portal data:", error);
        }
        const isDateInWeek = (dateStr) => {
            if (!dateStr) return false;
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);
            return date >= start && date <= end;
        };
        const staffAdvanceTotalFromPortal = staffAdvanceData
            .filter(entry =>
                entry.staff_payment_mode === "Cash" &&
                entry.type === "Advance" &&
                isDateInWeek(entry.date)
            )
            .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
        const loanTotalFromPortal = loanPortalData
            .filter(entry =>
                (entry.loan_payment_mode === "Cash" || entry.payment_mode === "Cash") &&
                entry.type === "Loan" &&
                isDateInWeek(entry.date)
            )
            .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
        const totalExpenses = expenses.reduce((t, e) => t + Number(e.amount || 0), 0);
        const totalPayments = payments.reduce((t, p) => t + Number(p.amount || 0), 0);
        const balance = totalPayments - totalExpenses;
        const drawHeader = (doc, titleText = "") => {
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.rect(20, 24, 810, 40);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`PS: ${String(selectedWeek || "")}`, 30, 40);
            doc.setFontSize(9);
            doc.text(String(new Date().toLocaleDateString("en-GB") || ""), 30, 55);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(titleText, 180, 50);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`START  ${String(weekStartDate || "")}`, 460, 40);
            doc.text(`END    ${String(weekEndDate || "")}`, 465, 58);
            doc.setFillColor(220, 250, 220);
            doc.rect(620, 25, 190, 18.5, "F");
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            const amountX = 800;
            doc.text("EXPENSES", 660, 37);
            doc.text(
                String(totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
                amountX, 37,
                { align: "right" }
            );
            doc.setFillColor(250, 220, 220);
            doc.rect(620, 44, 190, 18.5, "F");
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("BALANCE", 660, 58);
            doc.text(
                String(balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
                amountX, 58,
                { align: "right" }
            );
        };
        drawHeader(doc, "WEEKLY PAYMENT REPORT");
        const expensesHeaders = [["SNO", "Date", "Party", "Project Name", "Type", "Amount", "AC", "C", ""]];
        const pdfFilteredExpenses = expenses.filter(row => row.type === "Bill" || row.type === "Wage");
        const expensesData = pdfFilteredExpenses.map((row, idx) => [
            String(idx + 1 || ""),
            String(row.date ? formatDateOnly(row.date) : ""),
            String(getPartyDisplayName(row) || ""),
            String(siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""),
            String(row.type || ""),
            String(Number(row.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
            String(""),
            String(""),
            String("")
        ]);
        autoTable(doc, {
            head: expensesHeaders,
            body: expensesData,
            margin: { top: 64, left: 20 },
            tableWidth: 810,
            theme: "grid",
            styles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            headStyles: {
                textColor: [0, 0, 0],
                fillColor: [255, 230, 230],
                lineColor: [0, 0, 0],
                lineWidth: 1.0,
                fontStyle: 'normal'
            },
            columnStyles: {
                5: { halign: 'right' }
            },
            didDrawPage: (data) => {
                drawHeader(doc, "WEEKLY PAYMENT REPORT");
                if (data.pageNumber > 1) {
                    doc.setFontSize(10);
                }
            },
            pageBreak: 'auto',
            showHead: 'everyPage',
        });
        const paymentsHeaders = [["DATE RECEIVED", "AMOUNT", "TYPE"]];
        const paymentsData = payments.map(r => [
            String(r.created_at ? formatDate(r.created_at) : ""),
            String(Number(r.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
            String(r.type || "")
        ]);
        paymentsData.push([
            { content: "TOTAL", styles: { fontStyle: "bold" } },
            { content: String(totalPayments.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"), styles: { fontStyle: "bold" } },
            { content: "", styles: { fontStyle: "bold" } }
        ]);
        paymentsData.push([
            { content: "BALANCE", styles: { fontStyle: "bold" } },
            { content: String(balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"), styles: { fontStyle: "bold" } },
            { content: "", styles: { fontStyle: "bold" } }
        ]);
        doc.addPage();
        drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
        const baseY = 110;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PAYMENT RECEIVED", 22, baseY - 25);
        autoTable(doc, {
            head: paymentsHeaders,
            body: paymentsData,
            startY: baseY - 20,
            margin: { left: 20 },
            tableWidth: 210,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
            headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' },
            columnStyles: {
                1: { halign: 'right' }
            },
            didDrawPage: () => {
                drawHeader(doc);
            }
        });
        const paymentReceivedTable = doc.lastAutoTable;
        const handoverStartY = paymentReceivedTable && paymentReceivedTable.finalY ? paymentReceivedTable.finalY + 20 : baseY + 250;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("HANDOVER DETAILS", 22, handoverStartY - 5);
        autoTable(doc, {
            head: [["DATE RETURNED", "AMOUNT"]],
            body: [
                ["", ""],
                ["RETURNED", "0"]
            ],
            startY: handoverStartY,
            margin: { left: 22 },
            tableWidth: 200,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
            headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' },
            columnStyles: {
                1: { halign: 'right' }
            },
            didDrawPage: () => {
                drawHeader(doc);
            }
        });
        const dividerX = 260;
        const headerBottomY = 65;
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(dividerX, headerBottomY, dividerX, pageHeight - 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const dailyExpenses = expenses.filter(expense => expense.type === "Daily");
        const dailyExpenseData = dailyExpenses.map(expense => [
            String(expense.date ? formatDateOnly(expense.date) : ""),
            String(Number(expense.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
        ]);
        const dailyExpensesTotal = dailyExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
        if (dailyExpenseData.length === 0) {
            dailyExpenseData.push(["No Daily Expenses", "0.00"]);
        }
        autoTable(doc, {
            head: [["DAILY WAGE", "AMOUNT"]],
            body: dailyExpenseData,
            startY: baseY + 210,
            margin: { left: 300 },
            tableWidth: 200,
            theme: "grid",
            styles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            headStyles: {
                textColor: [0, 0, 0],
                fillColor: [255, 230, 230],
                lineColor: [0, 0, 0],
                lineWidth: 1,
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'right' }
            },
            didDrawPage: () => {
                drawHeader(doc);
            }
        });
        const dailyWageTable = doc.lastAutoTable;
        if (dailyWageTable) {
            const boxY = dailyWageTable.finalY + 2;
            const boxX = 300;
            const boxWidth = 200;
            const boxHeight = 20;
            const splitX = boxX + 114;
            doc.rect(boxX, boxY, boxWidth, boxHeight);
            doc.line(splitX, boxY, splitX, boxY + boxHeight);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("TOTAL", boxX + 10, boxY + 13);
            doc.text(
                String(dailyExpensesTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })),
                boxX + boxWidth - 10,
                boxY + 13,
                { align: "right" }
            );
        }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("EXPENDITURE PAYMENTS", 300, baseY - 25);
        const summaryMap = weeklyTypes.reduce((acc, typeObj) => {
            acc[typeObj.type] = { count: 0, total: 0 };
            return acc;
        }, {});
        const allExpenseTypes = [...new Set(
            expenses
                .filter(expense => expense.type)
                .map(e => e.type)
                .filter(Boolean)
        )];
        const fixedTypes = weeklyTypes.map(typeObj => typeObj.type);
        allExpenseTypes.forEach(type => {
            if (!fixedTypes.includes(type)) {
                summaryMap[type] = { count: 0, total: 0 };
            }
        });
        expenses
            .filter(expense => Number(expense.amount) > 0)
            .forEach(expense => {
                const type = expense.type;
                const amount = Number(expense.amount);
                if (summaryMap[type]) {
                    summaryMap[type].count += 1;
                    if (type !== "Staff Advance" && type !== "Loan") {
                        summaryMap[type].total += amount;
                    }
                }
            });
        if (summaryMap["Staff Advance"]) {
            summaryMap["Staff Advance"].total = staffAdvanceTotalFromPortal;
        }
        if (summaryMap["Loan"]) {
            summaryMap["Loan"].total = loanTotalFromPortal;
        }
        const summaryData = Object.entries(summaryMap)
            .map(([type, { count, total }]) => [
                String(type || ""),
                String(Number(total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
                count,
                total
            ])
            .sort((a, b) => {
                const totalA = Number(a[3]);
                const totalB = Number(b[3]);
                if (totalA === 0 && totalB === 0) {
                    return a[0].localeCompare(b[0]);
                } else if (totalA === 0) {
                    return 1;
                } else if (totalB === 0) {
                    return -1;
                } else {
                    return totalB - totalA;
                }
            })
            .map(([type, formattedTotal, count, originalTotal]) => [
                type,
                formattedTotal,
                count
            ]);
        autoTable(doc, {
            head: [["SUMMARY", "TOTAL"]],
            body: summaryData.map(r => [String(r[0] || ""), String(r[1] || "0")]),
            startY: baseY - 20,
            margin: { left: 300 },
            tableWidth: 200,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
            headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' },
            columnStyles: {
                1: { halign: 'right' }
            },
            didDrawPage: () => {
                drawHeader(doc);
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 0 && data.row && data.row.index !== undefined) {
                    const rowData = summaryData[data.row.index];
                    if (rowData && rowData[2] !== undefined) {
                        const count = rowData[2];
                        if (data.cell && typeof data.cell.x === 'number' && typeof data.cell.y === 'number' && typeof data.cell.height === 'number') {
                            const textX = data.cell.x - 3;
                            const textY = data.cell.y + data.cell.height / 2 + 2;
                            doc.setFontSize(9);
                            doc.text(String(count || "0"), textX, textY, { align: 'right' });
                        }
                    }
                }
            }
        });
        const summaryTable = doc.lastAutoTable;
        if (summaryTable && summaryTable.body && Array.isArray(summaryTable.body)) {
            summaryData.forEach((row, i) => {
                const count = row[2];
                if (count > 1 && summaryTable.body[i] && typeof summaryTable.body[i].y === 'number') {
                    const rowY = summaryTable.body[i].y + 6;
                    const leftX = (summaryTable.settings && summaryTable.settings.margin && summaryTable.settings.margin.left) ? summaryTable.settings.margin.left - 15 : 285;
                    doc.setFontSize(9);
                    doc.text(String(count || ""), leftX, rowY, { align: "right" });
                }
            });
        }
        const summaryTotal = summaryData.reduce((acc, row) => acc + Number(String(row[1] || "0").replace(/,/g, "")), 0);
        const summaryBoxY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 15 : baseY + 100;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.rect(300, summaryBoxY - 12, 200, 20);
        const splitX = 420;
        doc.line(splitX, summaryBoxY - 12, splitX, summaryBoxY + 8);
        doc.text("TOTAL", 310, summaryBoxY + 3);
        doc.text(
            String(summaryTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
            490,
            summaryBoxY + 3,
            { align: "right" }
        );
        const newTableX = 520;
        let newTableY = baseY;
        const staffAdvanceEntries = expenses.filter(e => e.type === "Staff Advance");
        if (staffAdvanceEntries.length > 0) {
            const staffAdvanceCount = staffAdvanceEntries.length;
            const staffAdvanceTotal = staffAdvanceEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const staffAdvanceY = newTableY + 10;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("STAFF ADVANCE", newTableX, staffAdvanceY - 25);
            const staffAdvanceHead = [[
                String(staffAdvanceCount || "0"),
                "PARTY",
                "PROJECT NAME",
                String(staffAdvanceTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const staffAdvanceBody = staffAdvanceEntries.map(e => [
                String(e.date ? formatDateOnly(e.date) : ""),
                String(getPartyDisplayName(e) || ""),
                String(siteOptions.find(opt => opt.id === Number(e.project_id))?.label || ""),
                String(Number(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]);
            autoTable(doc, {
                head: staffAdvanceHead,
                body: staffAdvanceBody,
                startY: staffAdvanceY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc);
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        }
        const staffSalaryEntries = expenses.filter(e => e.type === "Staff Salary");
        if (staffSalaryEntries.length > 0) {
            const staffSalaryCount = staffSalaryEntries.length;
            const staffSalaryTotal = staffSalaryEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const staffSalaryY = newTableY + 30;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("STAFF SALARY", newTableX, staffSalaryY - 25);
            const staffSalaryHead = [[
                String(staffSalaryCount || "0"),
                "PARTY",
                "PROJECT NAME",
                String(staffSalaryTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const staffSalaryBody = staffSalaryEntries.map(e => [
                String(e.date ? formatDateOnly(e.date) : ""),
                String(getPartyDisplayName(e) || ""),
                String(siteOptions.find(opt => opt.id === Number(e.project_id))?.label || ""),
                String(Number(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]);
            autoTable(doc, {
                head: staffSalaryHead,
                body: staffSalaryBody,
                startY: staffSalaryY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc);
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        }
        const excludedTypes = ["Bill", "Wage", "Project Advance", "Staff Advance", "Staff Salary", "Daily", "Diwali Bonus"];
        const otherExpenseTypes = [...new Set(expenses.map(e => e.type).filter(type => type && !excludedTypes.includes(type)))];
        otherExpenseTypes.forEach((expenseType) => {
            const typeEntries = expenses.filter(e => e.type === expenseType);
            if (typeEntries.length === 0) return;
            const typeCount = typeEntries.length;
            const typeTotal = typeEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const typeY = newTableY + 30;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(expenseType.toUpperCase(), newTableX, typeY - 25);
            const typeHead = [[
                String(typeCount || "0"),
                "PARTY",
                "PROJECT NAME",
                String(typeTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const typeBody = typeEntries.map(e => [
                String(e.date ? formatDateOnly(e.date) : ""),
                String(getPartyDisplayName(e) || ""),
                String(siteOptions.find(opt => opt.id === Number(e.project_id))?.label || ""),
                String(Number(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]);
            if (newTableY > doc.internal.pageSize.getHeight() - 150) {
                doc.addPage();
                drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
                newTableY = baseY;
            }
            autoTable(doc, {
                head: typeHead,
                body: typeBody,
                startY: typeY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        });
        const diwaliBonusEntries = expenses.filter(e => e.type === "Diwali Bonus");
        if (diwaliBonusEntries.length > 0) {
            const diwaliBonusCount = diwaliBonusEntries.length;
            const diwaliBonusTotal = diwaliBonusEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const diwaliBonusY = newTableY + 30;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("DIWALI BONUS", newTableX, diwaliBonusY - 25);
            const diwaliBonusHead = [[
                String(diwaliBonusCount || "0"),
                "PARTY",
                "AMOUNT",
                String(diwaliBonusTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const diwaliBonusBody = diwaliBonusEntries.map(e => [
                String(e.date ? formatDateOnly(e.date) : ""),
                String(getPartyDisplayName(e) || ""),
                String(Number(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
                ""
            ]);
            autoTable(doc, {
                head: diwaliBonusHead,
                body: diwaliBonusBody,
                startY: diwaliBonusY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    2: { halign: 'right' },
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc);
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        }
        const lastPeriodEndDate = expenses
            .map(exp => exp.period_end_date)
            .filter(Boolean)
            .pop();
        newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        doc.save(`PR ${selectedWeek || ""} - Weekly Payment Report ${formatDateOnly(lastPeriodEndDate)}.pdf`);
    };
    const lastWeekNumber = Math.max(...weeks.map(week => week.number));
    const getPaymentsByExpenseId = (expenseId) => {
        if (!weeklyPaymentBills || weeklyPaymentBills.length === 0) {
            return [];
        }
        const payments = weeklyPaymentBills.filter(bill => bill.weekly_payment_expense_id === expenseId);
        return payments;
    };
    const updateDescription = async (id, description) => {
        try {
            const res = await fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ description }),
            });
            if (!res.ok) {
                throw new Error("Failed to update description");
            }
            const data = await res.json();
            setEditFormData((prev) => ({
                ...prev,
                description: data.description,
            }));
            return data;
        } catch (error) {
            console.error("❌ Error updating description:", error);
            alert("Failed to update description");
        }
    };
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        if (name === "description") {
            setEditFormData((prev) => ({ ...prev, description: value }));
        } else {
            setEditFormData((prev) => ({ ...prev, [name]: value }));
        }
    };
    const saveEditedExpense = async (row) => {
        try {
            if (row.type === "Staff Advance") {
                if (row.contractor_id || row.vendor_id) {
                    alert("Staff Advance type only allows Employee. Please select an Employee and remove Contractor/Vendor selection.");
                    return;
                }
                if (!row.employee_id) {
                    alert("Staff Advance type requires an Employee to be selected.");
                    return;
                }
            }
            if (row.type === "Project Advance") {
                if (row.employee_id) {
                    alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor/Vendor and remove Employee selection.");
                    return;
                }
                if (!row.contractor_id && !row.vendor_id) {
                    alert("Project Advance type requires either a Contractor or Vendor to be selected.");
                    return;
                }
            }
            const originalExpense =
                editingOriginalRow && editingOriginalRow.id === row.id
                    ? editingOriginalRow
                    : expenses.find((exp) => exp.id === row.id);
            if (originalExpense) {
                const normalize = (val) => {
                    if (val === null || val === undefined || val === "") return "";
                    const str = String(val).trim();
                    return str === "" ? "" : str;
                };
                const compareValues = (original, current) => {
                    const origNorm = normalize(original);
                    const currNorm = normalize(current);
                    if (origNorm === "" && currNorm === "") return true;
                    const origNum = Number(origNorm);
                    const currNum = Number(currNorm);
                    if (!isNaN(origNum) && !isNaN(currNum) && origNorm !== "" && currNorm !== "") {
                        return origNum === currNum;
                    }
                    return origNorm === currNorm;
                };
                const hasChanges =
                    !compareValues(originalExpense.date, row.date) ||
                    !compareValues(originalExpense.type, row.type) ||
                    !compareValues(originalExpense.amount, row.amount) ||
                    !compareValues(originalExpense.project_id, row.project_id) ||
                    !compareValues(originalExpense.contractor_id, row.contractor_id) ||
                    !compareValues(originalExpense.vendor_id, row.vendor_id) ||
                    !compareValues(originalExpense.employee_id, row.employee_id) ||
                    !compareValues(originalExpense.client_id, row.client_id) ||
                    !compareValues(originalExpense.client_name, row.client_name);
                if (!hasChanges) {
                    setEditingRowId(null);
                    setEditingOriginalRow(null);
                    return;
                }
            }
            const wasLoan = originalExpense?.type === "Loan";
            const isNowLoan = row.type === "Loan";
            const wasProjectAdvance = originalExpense?.type === "Project Advance";
            const isNowProjectAdvance = row.type === "Project Advance";
            const wasStaffAdvance = originalExpense?.type === "Staff Advance";
            const isNowStaffAdvance = row.type === "Staff Advance";
            if (isNowLoan) {
                const loanPayload = {
                    date: row.date,
                    amount: Number(row.amount) || 0,
                    vendorId: row.vendor_id ? Number(row.vendor_id) : 0,
                    contractorId: row.contractor_id ? Number(row.contractor_id) : 0,
                    employeeId: row.employee_id ? Number(row.employee_id) : 0,
                    projectId: row.project_id ? Number(row.project_id) : 0,
                };
                if (row.loan_portal_id) {
                    await updateLoanPortalEntry(row.loan_portal_id, loanPayload);
                } else {
                    const newLoan = await createLoanPortalEntry(loanPayload);
                    row.loan_portal_id = newLoan?.id || newLoan?.loanPortalId || null;
                }
            } else if (wasLoan && originalExpense?.loan_portal_id) {
                try {
                    await clearLoanPortalEntry(originalExpense.loan_portal_id, row.date);
                } catch (loanError) {
                    console.error("Error clearing loan portal entry:", loanError);
                }
                row.loan_portal_id = null;
            }
            if (isNowProjectAdvance) {
                const advancePayload = {
                    date: row.date,
                    amount: Number(row.amount) || 0,
                    vendorId: row.vendor_id ? Number(row.vendor_id) : 0,
                    contractorId: row.contractor_id ? Number(row.contractor_id) : 0,
                    projectId: row.project_id ? Number(row.project_id) : 0,
                    description: "",
                    weekNo: row.weekly_number || Number(selectedWeek) || getCurrentISOWeekNumber(),
                };
                if (row.advance_portal_id) {
                    await updateAdvancePortalEntry(row.advance_portal_id, advancePayload);
                } else {
                    const newAdvance = await createAdvancePortalEntry({
                        date: row.date,
                        amount: Number(row.amount) || 0,
                        vendorId: row.vendor_id ? Number(row.vendor_id) : 0,
                        contractorId: row.contractor_id ? Number(row.contractor_id) : 0,
                        projectId: row.project_id ? Number(row.project_id) : 0,
                    });
                    row.advance_portal_id = newAdvance?.advancePortalId || newAdvance?.id || null;
                }
            } else if (wasProjectAdvance && originalExpense?.advance_portal_id) {
                try {
                    await clearAdvancePortalEntry(originalExpense.advance_portal_id, row.date);
                } catch (advanceError) {
                    console.error("Error clearing advance portal entry:", advanceError);
                }
                row.advance_portal_id = null;
            }
            if (isNowStaffAdvance) {
                const staffAdvancePayload = {
                    date: row.date,
                    amount: Number(row.amount) || 0,
                    employeeId: row.employee_id ? Number(row.employee_id) : 0,
                    projectId: row.project_id ? Number(row.project_id) : 0,
                    description: "",
                    weekNo: row.weekly_number || Number(selectedWeek) || getCurrentISOWeekNumber(),
                };
                if (row.staff_advance_portal_id) {
                    await updateStaffAdvancePortalEntry(row.staff_advance_portal_id, staffAdvancePayload);
                } else {
                    try {
                        const staffAdvanceRes = await fetch("https://backendaab.in/aabuildersDash/api/staff-advance/all");
                        if (!staffAdvanceRes.ok) throw new Error("Failed to fetch staff advance entry numbers");
                        const staffAdvanceData = await staffAdvanceRes.json();
                        const maxEntryNo = staffAdvanceData.length > 0
                            ? Math.max(...staffAdvanceData.map((item) => item.entry_no || 0))
                            : 0;
                        const nextEntryNo = maxEntryNo + 1;
                        const weekNo = Number(selectedWeek) || getCurrentISOWeekNumber();
                        const staffAdvanceSaveData = {
                            date: row.date,
                            employee_id: row.employee_id || null,
                            project_id: row.project_id || null,
                            type: "Advance",
                            from_purpose_id: 4,
                            staff_payment_mode: "Cash",
                            entry_no: nextEntryNo,
                            week_no: weekNo,
                            amount: Number(row.amount) || 0,
                            staff_refund_amount: 0.0,
                            description: "",
                            file_url: null,
                        };
                        const staffAdvanceResponse = await fetch(
                            "https://backendaab.in/aabuildersDash/api/staff-advance/save",
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(staffAdvanceSaveData)
                            }
                        );
                        if (!staffAdvanceResponse.ok) {
                            throw new Error("Failed to save staff advance");
                        }
                        const staffAdvanceResponseData = await staffAdvanceResponse.json();
                        row.staff_advance_portal_id = staffAdvanceResponseData.id || staffAdvanceResponseData.staff_advance_portal_id || null;
                    } catch (error) {
                        console.error("Error creating staff advance portal entry:", error);
                    }
                }
            } else if (wasStaffAdvance && originalExpense?.staff_advance_portal_id) {
                try {
                    await clearStaffAdvancePortalEntry(originalExpense.staff_advance_portal_id, row.date);
                } catch (staffAdvanceError) {
                    console.error("Error clearing staff advance portal entry:", staffAdvanceError);
                }
                row.staff_advance_portal_id = null;
            }
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/edit/${row.id}?username=${encodeURIComponent(
                username
            )}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(row),
                });
            if (!response.ok) {
                throw new Error("Failed to update expense");
            }
            window.location.reload();
            if (row.type === "Carry Forward") return;
            setEditingRowId(null);
            setEditingOriginalRow(null);
        } catch (error) {
            console.error("Error updating expense:", error);
        }
    };
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
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
    };
    const saveEditedPaymentReceived = async (row) => {
        try {
            const originalPayment = editingOriginalPayment && editingOriginalPayment.id === row.id
                ? editingOriginalPayment
                : payments.find((pay) => pay.id === row.id);
            if (originalPayment) {
                const normalize = (val) => {
                    if (val === null || val === undefined || val === "") return "";
                    const str = String(val).trim();
                    return str === "" ? "" : str;
                };
                const compareValues = (original, current) => {
                    const origNorm = normalize(original);
                    const currNorm = normalize(current);
                    if (origNorm === "" && currNorm === "") return true;
                    const origNum = Number(origNorm);
                    const currNum = Number(currNorm);
                    if (!isNaN(origNum) && !isNaN(currNum) && origNorm !== "" && currNorm !== "") {
                        return origNum === currNum;
                    }
                    return origNorm === currNorm;
                };
                const hasChanges =
                    !compareValues(originalPayment.date, row.date) ||
                    !compareValues(originalPayment.amount, row.amount) ||
                    !compareValues(originalPayment.type, row.type);
                if (!hasChanges) {
                    setEditingPaymentId(null);
                    setEditingOriginalPayment(null);
                    return;
                }
            }
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/payments-received/update/${row.id}?username=${encodeURIComponent(username)}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(row),
            });
            if (!response.ok) {
                throw new Error("Failed to update expense");
            }
            window.location.reload();
            setEditingPaymentId(null);
            setEditingOriginalPayment(null);
        } catch (error) {
            console.error("Error updating expense:", error);
        }
    };
    useEffect(() => {
        if (weeks.length > 0) {
            setSelectedWeek(weeks[weeks.length - 1].number);
        }
    }, [weeks]);
    const fetchAuditDetailsForExpense = async (expensesId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly_payment_audit/expenses/${expensesId}`);
            const data = await response.json();
            setWeeklyPaymentExpensesAudits(data);
            setShowWeeklyPaymentExpensesModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    const fetchAuditDetailsForPaymentReceived = async (receivedId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly_payment_audit/payments/${receivedId}`);
            const data = await response.json();
            setWeeklyPaymentReceivedAudits(data);
            setShowWeeklyPaymentReceivedModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    const handleWeeklyExpensesDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete This Expense Data?");
        if (confirmed) {
            try {
                const expenseRecord = expenses.find((exp) => exp.id === id);
                if (expenseRecord?.type === "Loan" && expenseRecord.loan_portal_id) {
                    try {
                        await clearLoanPortalEntry(expenseRecord.loan_portal_id, expenseRecord.date);
                    } catch (loanError) {
                        console.error("Error clearing loan portal entry:", loanError);
                        alert("Failed to clear the associated Loan entry. Please try again.");
                        return;
                    }
                }
                if (expenseRecord?.type === "Project Advance" && expenseRecord.advance_portal_id) {
                    try {
                        await clearAdvancePortalEntry(expenseRecord.advance_portal_id, expenseRecord.date);
                    } catch (advanceError) {
                        console.error("Error clearing advance portal entry:", advanceError);
                        alert("Failed to clear the associated Advance Portal entry. Please try again.");
                        return;
                    }
                }
                if (expenseRecord?.type === "Staff Advance" && expenseRecord.staff_advance_portal_id) {
                    try {
                        await clearStaffAdvancePortalEntry(expenseRecord.staff_advance_portal_id, expenseRecord.date);
                    } catch (staffAdvanceError) {
                        console.error("Error clearing staff advance portal entry:", staffAdvanceError);
                        alert("Failed to clear the associated Staff Advance Portal entry. Please try again.");
                        return;
                    }
                }
                const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/delete/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert("Weekly Expenses deleted successfully!!!");
                    window.location.reload();
                } else {
                    console.error("Failed to delete the Weekly Expenses. Status:", response.status);
                    alert("Error deleting the Weekly Expenses. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while deleting the Expense.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };
    const handleWeeklyReceivedDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete This Expense Data?");
        if (confirmed) {
            try {
                const response = await fetch(`https://backendaab.in/aabuildersDash/api/payments-received/delete/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert("Weekly Expenses deleted successfully!!!");
                    window.location.reload();
                } else {
                    console.error("Failed to delete the Weekly Expenses. Status:", response.status);
                    alert("Error deleting the Weekly Expenses. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while deleting the Contractor Name.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };
    return (
        <body>
            <div className='mx-auto w-auto lg:flex justify-between gap-8 p-4 pl-8 border-collapse text-left bg-[#FFFFFF] ml-[30px] mr-6 rounded-md lg:h-[127px]'>
                <div className='flex gap-[16px]'>
                    <div>
                        <h1 className='font-semibold'>Select Week</h1>
                        <div>
                            <select className="w-[303px] h-[45px] border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2"
                                value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
                                <option value="">-- Select Week --</option>
                                {weeks.map((week) => {
                                    const startDate = new Date(week.start);
                                    const endDate = new Date(week.end);
                                    const formatDate = (date) =>
                                        date.toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "long"
                                        });
                                    return (
                                        <option key={week.number} value={week.number}>
                                            {`Week ${week.number}, ${formatDate(startDate)} to ${formatDate(endDate)}`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block font-semibold ">Year</label>
                        <select value={year} onChange={(e) => setYear(e.target.value)}
                            className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-[168px] h-[45px] focus:outline-none">
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className='flex justify-end mb-20 mr-6'>
                    <button className="font-semibold text-lg cursor-pointer flex items-center gap-2" onClick={generatePDF}>
                        Report
                        <img className='w-6 h-5' src={download} alt="Download" />
                    </button>
                </div>
            </div>
            <div className="flex justify-end mr-6 mt-2">
                <h1 className="font-bold text-xl">
                    Balance: <span style={{ color: "#E4572E" }} className="inline-block text-right min-w-[120px]">
                        {(
                            payments.reduce((total, row) => total + Number(row.amount || 0), 0) -
                            filteredExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0)
                        ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                    </span>
                </h1>
            </div>
            <div className="mx-auto w-auto p-3 sm:p-6 border-collapse bg-[#FFFFFF] ml-[15px] sm:ml-[30px] mr-3 sm:mr-6 rounded-md">
                <div className="text-left mb-4 flex justify-between ">
                    <button onClick={() => setShowFilters(!showFilters)}>
                        <img
                            src={Filter}
                            alt="Toggle Filter"
                            className="w-7 h-7 border border-[#BF9853] rounded-md"
                        />
                    </button>
                    {nextWeekDiscountInfo && (
                        <div className="flex justify-end -mr-6 -mt-7">
                            <h2 className="font-semibold text-base">
                                Discount :{" "}
                                <span className="inline-block text-right min-w-[120px] text-xl">
                                    {nextWeekDiscountInfo.amount.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </h2>
                        </div>
                    )}
                </div>
                <div className="flex flex-col xl:flex-row gap-6">
                    <div className="w-full xl:flex-[6] xl:min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                            <h1 className="font-bold text-xl">PS: <span style={{ color: "#E4572E" }}>{selectedWeek}</span> </h1>
                            <h1 className="font-bold text-base">
                                Expenses: <span style={{ color: "#E4572E" }}>
                                    {filteredExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                                </span>
                            </h1>
                        </div>
                        <div className="w-full h-[600px] rounded-lg border-l-8 border-l-[#BF9853] overflow-hidden">
                            <div ref={scrollRef} className="overflow-auto max-h-[600px] thin-scrollbar"
                                onMouseDown={(e) => handleMouseDown(e, scrollRef)} onMouseMove={(e) => handleMouseMove(e, scrollRef)}
                                onMouseUp={() => handleMouseUp(scrollRef)} onMouseLeave={() => handleMouseUp(scrollRef)}
                            >
                                <table className="w-[1320px] border-collapse text-left">
                                    <thead className="sticky top-0 z-10 bg-white">
                                        <tr className="bg-[#FAF6ED]">
                                            <th className="pt-2 pl-2 w-[60px] font-bold text-left">Sl.No</th>
                                            <th className="pt-2 w-[135px] font-bold text-left">Date</th>
                                            <th className="pt-2 w-[200px] font-bold text-left">
                                                {isClientToggleActive ? "Client Name" : "Contractor/Vendor/Employee"}
                                            </th>
                                            <th className="pt-2 w-[200px] font-bold text-left">Project Name</th>
                                            <th className="pt-2 w-[100px] font-bold text-left">Type</th>
                                            <th className="pt-2 w-[110px] font-bold text-left">Amount</th>
                                            <th className="pt-2 w-[120px] font-bold text-left">Activity</th>
                                        </tr>
                                        {showFilters && (
                                            <tr className="bg-[#FAF6ED] border-b border-gray-200">
                                                <th className="pt-2 pb-2 w-[60px]"></th>
                                                <th className="pt-2 pb-2 w-[120px] sm:w-[140px]">
                                                    <input
                                                        type="date"
                                                        value={selectDate}
                                                        onChange={(e) => setSelectDate(e.target.value)}
                                                        className="p-1 rounded-md bg-transparent w-[120px] sm:w-[140px] border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                                                        placeholder="Search Date..."
                                                    />
                                                </th>
                                                <th className="pt-2 pb-2 w-[160px] sm:w-[200px]">
                                                    <Select
                                                        options={contractorVendorFilterOptions}
                                                        value={selectContractororVendorName ? { value: selectContractororVendorName, label: selectContractororVendorName } : null}
                                                        onChange={(opt) => setSelectContractororVendorName(opt ? opt.value : "")}
                                                        className="text-xs focus:outline-none"
                                                        placeholder={isClientToggleActive ? "Client Name..." : "Contractor/Ven..."}
                                                        isSearchable
                                                        isClearable
                                                        menuPortalTarget={document.body}
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
                                                                zIndex: 9999,
                                                                maxHeight: '300px',
                                                                overflow: 'auto',
                                                            }),
                                                            menuList: (provided) => ({
                                                                ...provided,
                                                                maxHeight: '300px',
                                                                overflowY: 'auto',
                                                                padding: '4px',
                                                            }),
                                                            menuPortal: (provided) => ({
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
                                                            indicatorSeparator: () => ({
                                                                display: 'none'
                                                            }),
                                                            indicatorsContainer: (provided) => ({
                                                                ...provided,
                                                                height: '40px',
                                                                gap: '0px'
                                                            }),
                                                            clearIndicator: (provided) => ({
                                                                ...provided,
                                                                padding: '2px'
                                                            }),
                                                            dropdownIndicator: (provided) => ({
                                                                ...provided,
                                                                padding: '2px'
                                                            })
                                                        }}
                                                    />
                                                </th>
                                                <th className="pt-2 pb-2 w-[180px] sm:w-[240px]">
                                                    <Select
                                                        options={projectFilterOptions}
                                                        value={selectProjectName ? { value: selectProjectName, label: selectProjectName } : null}
                                                        onChange={(opt) => setSelectProjectName(opt ? opt.value : "")}
                                                        className="focus:outline-none text-xs"
                                                        placeholder="Project Name..."
                                                        isSearchable
                                                        isClearable
                                                        menuPortalTarget={document.body}
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
                                                                zIndex: 9999,
                                                                maxHeight: '300px',
                                                                overflow: 'auto',
                                                            }),
                                                            menuList: (provided) => ({
                                                                ...provided,
                                                                maxHeight: '300px',
                                                                overflowY: 'auto',
                                                                padding: '4px',
                                                            }),
                                                            menuPortal: (provided) => ({
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
                                                            indicatorSeparator: () => ({
                                                                display: 'none'
                                                            }),
                                                            indicatorsContainer: (provided) => ({
                                                                ...provided,
                                                                height: '40px',
                                                                gap: '0px'
                                                            }),
                                                            clearIndicator: (provided) => ({
                                                                ...provided,
                                                                padding: '2px'
                                                            }),
                                                            dropdownIndicator: (provided) => ({
                                                                ...provided,
                                                                padding: '2px'
                                                            })
                                                        }}
                                                    />
                                                </th>
                                                <th className="pt-2 pb-2 w-[80px] sm:w-[100px]">
                                                    <select
                                                        value={selectType}
                                                        onChange={(e) => setSelectType(e.target.value)}
                                                        className="p-1 rounded-md bg-transparent w-[100px] sm:w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                                                        placeholder="Type..."
                                                    >
                                                        <option value=''>Select Type...</option>
                                                        {weeklyTypes.map((type, index) => (
                                                            <option key={index} value={type.type}>
                                                                {type.type}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </th>
                                                <th className="pt-2 pb-2 w-[110px]"></th>
                                                <th className="pt-2 pb-2 w-[120px]">
                                                    <button
                                                        onClick={clearFilters}
                                                        className="px-3 py-1.5 bg-[#BF9853] text-white rounded-lg hover:bg-[#A68B4A] transition-colors text-sm font-semibold"
                                                        title="Clear all filters"
                                                    >
                                                        Clear
                                                    </button>
                                                </th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody>
                                        {Number(selectedWeek) === Number(lastWeekNumber) ? (
                                            <tr className="">
                                                <td className="px-4 py-2 font-bold">{filteredExpenses.length + 1}.</td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="date"
                                                        name="date"
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-1 rounded-lg w-[100px] sm:w-[120px] h-[40px] focus:outline-none"
                                                        value={newExpense.date}
                                                        onChange={handleExpenseChange}
                                                        onKeyDown={handleKeyDown}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Select
                                                            name="contractor"
                                                            className="w-[150px] sm:w-[180px]"
                                                            value={
                                                                isClientToggleActive
                                                                    ? selectedClient
                                                                    : selectedContractor ||
                                                                    combinedOptions.find(
                                                                        opt =>
                                                                            (opt.type === "Contractor" && opt.id === Number(newExpense.contractor_id)) ||
                                                                            (opt.type === "Vendor" && opt.id === Number(newExpense.vendor_id)) ||
                                                                            (opt.type === "Employee" && opt.id === Number(newExpense.employee_id))
                                                                    ) || null
                                                            }
                                                            onChange={(selectedOption) => {
                                                                if (newExpense.type === "Staff Advance") {
                                                                    if (selectedOption && (selectedOption.type === "Contractor" || selectedOption.type === "Vendor")) {
                                                                        alert("Staff Advance type only allows Employee. Please select an Employee or change the type.");
                                                                        return;
                                                                    }
                                                                    if (isClientToggleActive && selectedOption) {
                                                                        alert("Staff Advance type only allows Employee. Please select an Employee or change the type.");
                                                                        return;
                                                                    }
                                                                }
                                                                if (newExpense.type === "Project Advance") {
                                                                    if (selectedOption && selectedOption.type === "Employee") {
                                                                        alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor or change the type.");
                                                                        return;
                                                                    }
                                                                    if (isClientToggleActive && selectedOption) {
                                                                        alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor or change the type.");
                                                                        return;
                                                                    }
                                                                }
                                                                if (isClientToggleActive) {
                                                                    const allowedTypesForClient = ["Loan", "Bank", "Claim"];
                                                                    if (!allowedTypesForClient.includes(newExpense.type)) {
                                                                        alert("Client name selection is only allowed for Loan, Bank, or Claim types.");
                                                                        return;
                                                                    }
                                                                    setSelectedClient(selectedOption || null);
                                                                    setNewExpense(prev => ({
                                                                        ...prev,
                                                                        client_name: selectedOption ? selectedOption.label : "",
                                                                        client_id: selectedOption ? (selectedOption.clientId || selectedOption.id) : "",
                                                                    }));
                                                                    setVendorId('');
                                                                    setContractorId('');
                                                                    setSelectedContractor(null);
                                                                    setSelectedVendor(null);
                                                                    setSelectedEmployee(null);
                                                                    const clientKey = selectedOption?.compositeKey || (selectedOption ? buildClientKey(selectedOption.label, selectedOption.fatherName, selectedOption.mobile) : "");
                                                                    const projectsForClient = selectedOption
                                                                        ? selectedOption.projects || (clientKey ? (clientProjectMap[clientKey]?.projects || []) : [])
                                                                        : [];
                                                                    setClientProjectOptions(projectsForClient);
                                                                    if (projectsForClient.length === 1) {
                                                                        const onlyProject = projectsForClient[0];
                                                                        setSelectedProjectName(onlyProject);
                                                                        setSelectedProjectOption(onlyProject);
                                                                        setProjectId(onlyProject.id);
                                                                        setNewExpense(prev => ({ ...prev, project_id: onlyProject.id }));
                                                                    }
                                                                    if (!selectedOption) {
                                                                        setSelectedProjectName(null);
                                                                        setSelectedProjectOption(null);
                                                                        setProjectId('');
                                                                        setNewExpense(prev => ({ ...prev, project_id: "" }));
                                                                    }
                                                                    return;
                                                                }
                                                                setSelectedClient(null);
                                                                setSelectedClient(null);
                                                                setClientProjectOptions([]);
                                                                setSelectedProjectName(null);
                                                                setSelectedProjectOption(null);
                                                                setProjectId('');
                                                                if (newExpense.type === "Staff Advance") {
                                                                    if (selectedOption && (selectedOption.type === "Contractor" || selectedOption.type === "Vendor")) {
                                                                        alert("Staff Advance type only allows Employee. Please select an Employee or change the type.");
                                                                        return;
                                                                    }
                                                                }
                                                                if (newExpense.type === "Project Advance") {
                                                                    if (selectedOption && selectedOption.type === "Employee") {
                                                                        alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor or change the type.");
                                                                        return;
                                                                    }
                                                                }
                                                                if (!selectedOption) {
                                                                    setNewExpense(prev => ({
                                                                        ...prev,
                                                                        contractor_id: "",
                                                                        vendor_id: "",
                                                                        employee_id: "",
                                                                        client_name: "",
                                                                        client_id: ""
                                                                    }));
                                                                    setContractorId("");
                                                                    setVendorId("");
                                                                    setSelectedContractor(null);
                                                                    setSelectedVendor(null);
                                                                    setSelectedEmployee(null);
                                                                    setSelectedClient(null);
                                                                } else if (selectedOption.type === "Employee") {
                                                                    setNewExpense(prev => ({
                                                                        ...prev,
                                                                        employee_id: selectedOption.id,
                                                                        contractor_id: "",
                                                                        vendor_id: ""
                                                                    }));
                                                                    setSelectedEmployee(selectedOption);
                                                                    setSelectedContractor(null);
                                                                    setSelectedVendor(null);
                                                                } else if (selectedOption.type === "Contractor") {
                                                                    setNewExpense(prev => ({
                                                                        ...prev,
                                                                        contractor_id: selectedOption.id,
                                                                        vendor_id: ""
                                                                    }));
                                                                    setContractorId(selectedOption.id);
                                                                    setVendorId("");
                                                                    setSelectedContractor(selectedOption);
                                                                    setSelectedVendor(null);
                                                                    setSelectedEmployee(null);
                                                                } else if (selectedOption.type === "Vendor") {
                                                                    setNewExpense(prev => ({
                                                                        ...prev,
                                                                        vendor_id: selectedOption.id,
                                                                        contractor_id: ""
                                                                    }));
                                                                    setVendorId(selectedOption.id);
                                                                    setContractorId("");
                                                                    setSelectedVendor(selectedOption);
                                                                    setSelectedContractor(null);
                                                                    setSelectedEmployee(null);
                                                                }
                                                            }}
                                                            options={isClientToggleActive ? clientOptions : combinedOptions}
                                                            placeholder={isClientToggleActive ? "Client Name" : "Contractor/Vendor"}
                                                            isSearchable
                                                            isClearable
                                                            menuPortalTarget={document.body}
                                                            styles={{
                                                                ...customStyles,
                                                                menu: (provided) => ({
                                                                    ...provided,
                                                                    zIndex: 9999,
                                                                    maxHeight: '300px',
                                                                    overflow: 'auto',
                                                                }),
                                                                menuList: (provided) => ({
                                                                    ...provided,
                                                                    maxHeight: '300px',
                                                                    overflowY: 'auto',
                                                                    overflowX: 'hidden',
                                                                    padding: '4px',
                                                                    WebkitOverflowScrolling: 'touch',
                                                                }),
                                                                menuPortal: (provided) => ({
                                                                    ...provided,
                                                                    zIndex: 9999,
                                                                }),
                                                            }}
                                                        />
                                                        <button type="button" onClick={handlePartySourceToggle} >
                                                            <img
                                                                src={Change}
                                                                className={`w-4 h-4 ${isClientToggleActive ? 'opacity-100' : 'opacity-60'}`}
                                                                alt="Toggle party type"
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Select
                                                        name="project"
                                                        className="w-[180px] sm:w-[220px]"
                                                        value={selectedProjectName || siteOptions.find(opt => opt.id === Number(newExpense.project_id)) || null}
                                                        onChange={(selectedOption) => {
                                                            if (isClientToggleActive) {
                                                                setSelectedProjectName(selectedOption);
                                                                setSelectedProjectOption(selectedOption);
                                                            } else {
                                                                setSelectedProjectName(selectedOption);
                                                                setSelectedProjectOption(null);
                                                            }
                                                            setNewExpense(prev => ({
                                                                ...prev,
                                                                project_id: selectedOption ? selectedOption.id : ""
                                                            }));
                                                            setProjectId(selectedOption ? selectedOption.id : "");
                                                        }}
                                                        options={(isClientToggleActive && clientProjectOptions.length > 0) ? clientProjectOptions : siteOptions}
                                                        placeholder={isClientToggleActive ? "Client Project..." : "Select Site"}
                                                        isSearchable
                                                        isClearable
                                                        menuPortalTarget={document.body}
                                                        styles={{
                                                            ...customStyles,
                                                            menu: (provided) => ({
                                                                ...provided,
                                                                zIndex: 9999,
                                                            }),
                                                            menuPortal: (provided) => ({
                                                                ...provided,
                                                                zIndex: 9999,
                                                            }),
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-left">
                                                    <select
                                                        name="type"
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[100px] sm:w-[120px] h-[40px] rounded-lg focus:outline-none"
                                                        value={newExpense.type}
                                                        onChange={handleInputChange}
                                                        onKeyDown={handleKeyDown}
                                                    >
                                                        <option value="">Select</option>
                                                        {weeklyTypes.map((type, index) => (
                                                            <option key={index} value={type.type}>
                                                                {type.type}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2 text-left">
                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[80px] sm:w-[90px] h-[40px] rounded-lg focus:outline-none"
                                                        value={newExpense.amount}
                                                        onChange={handleExpenseChange}
                                                        onKeyDown={handleKeyDown}
                                                        onFocus={() => window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                                                        onBlur={() => window.removeEventListener("wheel", (e) => e.preventDefault())}
                                                    />
                                                </td>
                                            </tr>
                                        ) : null}
                                        {[...filteredExpenses].reverse().map((row, index) => (
                                            <tr key={row.id} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] text-left">
                                                <td className="text-sm text-left pl-2 w-[60px] font-semibold">{filteredExpenses.length - index}.</td>
                                                <td className="text-sm text-left w-[135px] font-semibold">
                                                    {editingRowId === row.id ? (
                                                        <input
                                                            type="date"
                                                            name="date"
                                                            className="bg-transparent p-1 rounded w-[120px] h-[40px] focus:outline-none"
                                                            value={row.date}
                                                            onChange={(e) => handleEditExpense(row.id, 'date', e.target.value)}
                                                            disabled={editingRowId !== row.id}
                                                        />
                                                    ) : (
                                                        <div className="w-[120px] h-[40px] flex items-center">
                                                            {formatDateOnly(row.date) || ""}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-sm text-left w-[200px] font-semibold">
                                                    {editingRowId === row.id ? (
                                                        <Select
                                                            name="party"
                                                            className="w-[180px]"
                                                            value={
                                                                ((isClientToggleActive || (!row.contractor_id && !row.vendor_id && !row.employee_id && (row.client_name || row.client_id))) && ["Loan", "Bank", "Claim"].includes(row.type))
                                                                    ? getClientOption(row.client_id, row.client_name)
                                                                    : combinedOptions.find(
                                                                        opt =>
                                                                            (opt.type === "Contractor" && opt.id === Number(row.contractor_id)) ||
                                                                            (opt.type === "Vendor" && opt.id === Number(row.vendor_id)) ||
                                                                            (opt.type === "Employee" && opt.id === Number(row.employee_id))
                                                                    ) || null
                                                            }
                                                            onChange={(selectedOption) => {
                                                                const useClientMode = isClientToggleActive || (!row.contractor_id && !row.vendor_id && !row.employee_id && (row.client_name || row.client_id));
                                                                if (useClientMode) {
                                                                    // Only allow client selection if type is Loan, Bank, or Claim
                                                                    const allowedTypesForClient = ["Loan", "Bank", "Claim"];
                                                                    if (selectedOption && !allowedTypesForClient.includes(row.type)) {
                                                                        alert("Client name selection is only allowed for Loan, Bank, or Claim types.");
                                                                        return;
                                                                    }
                                                                    if (!selectedOption) {
                                                                        handleEditExpense(row.id, "client_name", "");
                                                                        handleEditExpense(row.id, "client_id", "");
                                                                    } else {
                                                                        handleEditExpense(row.id, "client_name", selectedOption.label);
                                                                        handleEditExpense(row.id, "client_id", selectedOption.clientId || selectedOption.id);
                                                                    }
                                                                    handleEditExpense(row.id, "contractor_id", "");
                                                                    handleEditExpense(row.id, "vendor_id", "");
                                                                    return;
                                                                }
                                                                if (!selectedOption) {
                                                                    handleEditExpense(row.id, "contractor_id", "");
                                                                    handleEditExpense(row.id, "vendor_id", "");
                                                                    handleEditExpense(row.id, "employee_id", "");
                                                                    handleEditExpense(row.id, "client_id", "");
                                                                    handleEditExpense(row.id, "client_name", "");
                                                                } else if (selectedOption.type === "Contractor") {
                                                                    handleEditExpense(row.id, "contractor_id", selectedOption.id);
                                                                    handleEditExpense(row.id, "vendor_id", "");
                                                                } else if (selectedOption.type === "Vendor") {
                                                                    handleEditExpense(row.id, "vendor_id", selectedOption.id);
                                                                    handleEditExpense(row.id, "contractor_id", "");
                                                                } else if (selectedOption.type === "Employee") {
                                                                    handleEditExpense(row.id, "employee_id", selectedOption.id);
                                                                    handleEditExpense(row.id, "contractor_id", "");
                                                                    handleEditExpense(row.id, "vendor_id", "");
                                                                }
                                                            }}
                                                            options={((isClientToggleActive || (!row.contractor_id && !row.vendor_id && !row.employee_id && (row.client_name || row.client_id))) && ["Loan", "Bank", "Claim"].includes(row.type)) ? clientOptions : combinedOptions}
                                                            placeholder={((isClientToggleActive || (!row.contractor_id && !row.vendor_id && !row.employee_id && (row.client_name || row.client_id))) && ["Loan", "Bank", "Claim"].includes(row.type)) ? "Client Name" : "Select Contractor/Vendor"}
                                                            isSearchable
                                                            isClearable
                                                            menuPortalTarget={document.body}
                                                            styles={{
                                                                ...customStyles,
                                                                menu: (provided) => ({
                                                                    ...provided,
                                                                    zIndex: 9999,
                                                                    maxHeight: '300px',
                                                                    overflow: 'auto',
                                                                }),
                                                                menuList: (provided) => ({
                                                                    ...provided,
                                                                    maxHeight: '300px',
                                                                    overflowY: 'auto',
                                                                    overflowX: 'hidden',
                                                                    padding: '4px',
                                                                    WebkitOverflowScrolling: 'touch',
                                                                }),
                                                                menuPortal: (provided) => ({
                                                                    ...provided,
                                                                    zIndex: 9999,
                                                                }),
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-[180px] h-[40px] flex items-center">
                                                            {getPartyDisplayName(row)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-sm text-left w-[200px] font-semibold">
                                                    {editingRowId === row.id ? (
                                                        <Select
                                                            name="project"
                                                            className="w-[220px]"
                                                            value={siteOptions.find(opt => opt.id === Number(row.project_id)) || null}
                                                            onChange={(selectedOption) =>
                                                                handleEditExpense(
                                                                    row.id,
                                                                    "project_id",
                                                                    selectedOption ? selectedOption.id : ""
                                                                )
                                                            }
                                                            options={siteOptions}
                                                            placeholder="Select Project"
                                                            isSearchable
                                                            isClearable
                                                            menuPortalTarget={document.body}
                                                            styles={{
                                                                ...customStyles,
                                                                menu: (provided) => ({
                                                                    ...provided,
                                                                    zIndex: 9999,
                                                                    maxHeight: '300px',
                                                                    overflow: 'auto',
                                                                }),
                                                                menuList: (provided) => ({
                                                                    ...provided,
                                                                    maxHeight: '300px',
                                                                    overflowY: 'auto',
                                                                    overflowX: 'hidden',
                                                                    padding: '4px',
                                                                    WebkitOverflowScrolling: 'touch',
                                                                }),
                                                                menuPortal: (provided) => ({
                                                                    ...provided,
                                                                    zIndex: 9999,
                                                                }),
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-[220px] h-[40px] flex items-center">
                                                            {siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-sm text-left w-[100px] font-semibold">
                                                    {editingRowId === row.id ? (
                                                        <select
                                                            name="type"
                                                            className="border-2 border-[#BF9853] border-opacity-25 bg-transparent p-1 w-[90px] h-[40px] rounded-lg focus:outline-none"
                                                            value={row.type}
                                                            onChange={(e) => handleEditExpense(row.id, 'type', e.target.value)}
                                                        >
                                                            <option value="">Select</option>
                                                            {weeklyTypes.map((type, index) => (
                                                                <option key={index} value={type.type}>
                                                                    {type.type}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={row.type === "Claim" && !row.send_to_expenses_entry ? "text-red-500" : ""}>{row.type}</span>
                                                                
                                                                    <button
                                                                        onClick={() => {
                                                                            setCurrentProjectAdvanceRow(row);
                                                                            setPaymentPopupData({
                                                                                date: new Date().toISOString().split('T')[0],
                                                                                amount: "",
                                                                                paymentMode: "",
                                                                                chequeNo: "",
                                                                                chequeDate: "",
                                                                                transactionNumber: "",
                                                                                accountNumber: ""
                                                                            });
                                                                            const previousPaymentsForExpense = getPaymentsByExpenseId(row.id);
                                                                            setPreviousPayments(previousPaymentsForExpense);
                                                                            setShowPaymentPopup(true);
                                                                        }}
                                                                        className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-green-600 transition-colors text-xs"
                                                                        title="Add Payment"
                                                                    >
                                                                        +
                                                                    </button>
                                                                
                                                            </div>
                                                            {(() => {
                                                                const payments = getPaymentsByExpenseId(row.id);
                                                                const paymentModes = [...new Set(payments.map(p => p.bill_payment_mode).filter(mode => mode !== null && mode !== undefined))];
                                                                if (paymentModes.length === 0) return null;
                                                                const hoverContent = payments.map(payment =>
                                                                    `${payment.bill_payment_mode}: ₹${payment.amount.toLocaleString('en-IN')}`
                                                                ).join('\n');
                                                                return (
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {paymentModes.length === 1 ? (
                                                                            <span
                                                                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition-colors"
                                                                                title={hoverContent}
                                                                            >
                                                                                {paymentModes[0]}
                                                                            </span>
                                                                        ) : (
                                                                            <span
                                                                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-green-200 transition-colors"
                                                                                title={hoverContent}
                                                                            >
                                                                                Online
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-sm text-left pl-2 w-[110px] font-semibold">
                                                    <div className="flex items-center ">
                                                        <div>
                                                            {editingRowId === row.id ? (
                                                                <input
                                                                    type="number"
                                                                    name="amount"
                                                                    className="border-2 border-[#BF9853] border-opacity-25 bg-transparent p-1 w-[90px] h-[40px] rounded-lg focus:outline-none"
                                                                    value={row.amount}
                                                                    onChange={(e) => handleEditExpense(row.id, 'amount', e.target.value)}
                                                                    disabled={editingRowId !== row.id}
                                                                    onWheel={(e) => e.preventDefault()}
                                                                    onFocus={() => window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                                                                    onBlur={() => window.removeEventListener("wheel", (e) => e.preventDefault())}
                                                                />
                                                            ) : (
                                                                <div className="w-[90px] h-[40px] flex items-center">
                                                                    {Number(row.amount).toLocaleString('en-IN')}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="mr-6 flex items-center gap-3">
                                                            {row.type === "Project Advance" ? (
                                                                <button
                                                                    onClick={async () => {
                                                                        let description = "";
                                                                        if (row.advance_portal_id) {
                                                                            try {
                                                                                const res = await fetch(
                                                                                    `https://backendaab.in/aabuildersDash/api/advance_portal/get/${row.advance_portal_id}`
                                                                                );
                                                                                if (!res.ok) throw new Error("Failed to fetch advance portal data");
                                                                                const data = await res.json();
                                                                                description = data.description || "";
                                                                            } catch (error) {
                                                                                console.error("Error fetching advance portal data:", error);
                                                                            }
                                                                        }
                                                                        setEditFormData((prev) => ({ ...prev, description }));
                                                                        setCurrentRow(row);
                                                                        setShowPopups(true);
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={
                                                                            portalDescriptions[row.advance_portal_id] ? NotesEnd : NotesStart
                                                                        }
                                                                        alt="Notes"
                                                                        className="w-4 h-4 mr-3"
                                                                    />
                                                                </button>
                                                            ) : (
                                                                <button>
                                                                    <img
                                                                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPC9zdmc+"
                                                                        alt=""
                                                                        className="w-4 h-4 mr-3 opacity-0"
                                                                    />
                                                                </button>
                                                            )}
                                                            {row.bill_copy_url ? (
                                                                <a
                                                                    href={cleanUrl(row.bill_copy_url)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="cursor-pointer ml-3"
                                                                    title="View File"
                                                                >
                                                                    <img src={file} className="w-4 h-4" alt="Open File" />
                                                                </a>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleFileUploadClick(row)}
                                                                    className="cursor-pointer ml-3"
                                                                    title="Upload File"
                                                                >
                                                                    <img
                                                                        src={fileUpload}
                                                                        className="w-4 h-4 opacity-70 hover:opacity-100"
                                                                        alt="Upload File"
                                                                    />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-sm text-left pl-2 w-[120px] font-semibold">
                                                    {Number(row.weekly_number) === Number(lastWeekNumber) && (
                                                        <div className="flex gap-2">
                                                            {editingRowId === row.id ? (
                                                                <button className="text-green-600 font-bold text-lg relative z-10" onClick={() => saveEditedExpense(row)}>
                                                                    ✓
                                                                </button>
                                                            ) : (
                                                                row.type === "Daily" ? (
                                                                    <img
                                                                        className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                        src={Edit}
                                                                        alt="Edit Disabled"
                                                                    />
                                                                ) : (
                                                                    canEditDelete && (
                                                                        <button onClick={() => {
                                                                            setEditingRowId(row.id);
                                                                            setEditingOriginalRow({ ...row });
                                                                        }}>
                                                                            <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                                        </button>
                                                                    )
                                                                )
                                                            )}
                                                            {row.type === "Daily" ? (
                                                                <img
                                                                    className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                    src={Delete}
                                                                    alt="Delete Disabled"
                                                                />
                                                            ) : (
                                                                canEditDelete && (
                                                                    <button className="" onClick={() => handleWeeklyExpensesDelete(row.id)}>
                                                                        <img src={Delete} className="w-5 h-4" alt="Delete" />
                                                                    </button>
                                                                )
                                                            )}
                                                            {row.type === "Daily" ? (
                                                                <img
                                                                    className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                    src={history}
                                                                    alt="History Disabled"
                                                                />
                                                            ) : (
                                                                <button className="" onClick={() => fetchAuditDetailsForExpense(row.id)}>
                                                                    <img src={history} className="w-5 h-4" alt="History" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="w-full xl:flex-[2] xl:min-w-[300px]">
                        <div className="block">
                            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                                <h1 className="font-bold text-base">Payments Received</h1>
                                <h1 className="font-bold text-base text-[#E4572E]">
                                    Total: <span style={{ color: "#E4572E" }}>
                                        {payments.reduce((total, row) => total + Number(row.amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                                    </span>
                                </h1>
                            </div>
                            <div ref={paymentsScrollRef} className="rounded-lg border-l-8 border-l-[#BF9853] w-full overflow-y-auto max-h-[300px] thin-scrollbar"
                                onMouseDown={(e) => handleMouseDown(e, paymentsScrollRef)}
                                onMouseMove={(e) => handleMouseMove(e, paymentsScrollRef)}
                                onMouseUp={() => handleMouseUp(paymentsScrollRef)}
                                onMouseLeave={() => handleMouseUp(paymentsScrollRef)}
                            >
                                <table className="w-full border-collapse">
                                    <thead className="bg-[#FAF6ED] h-12">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Date</th>
                                            <th className="px-4 py-2">Amount</th>
                                            <th className="px-4 py-2 text-left">Type</th>
                                            <th>Activity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((row, index) => (
                                            <tr key={index} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] text-left">
                                                <td className="px-4 py-2">
                                                    {editingPaymentId === (row.id || null) ? (
                                                        <input
                                                            type="date"
                                                            value={row.date || ""}
                                                            onChange={(e) =>
                                                                handleEditPayment(index, "date", e.target.value)
                                                            }
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-1 rounded-lg bg-transparent w-[120px] h-[40px] focus:outline-none"
                                                        />
                                                    ) : (
                                                        <div className="w-[120px] h-[40px] flex items-center">
                                                            {formatDateOnly(row.date) || ""}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {editingPaymentId === (row.id || null) ? (
                                                        <input
                                                            type="number"
                                                            value={row.amount || ""}
                                                            onChange={(e) =>
                                                                handleEditPayment(index, "amount", e.target.value)
                                                            }
                                                            className="border-2 border-[#BF9853] border-opacity-25 rounded-lg bg-transparent w-[90px] h-[40px] focus:outline-none"
                                                            onWheel={(e) => e.preventDefault()}
                                                            onFocus={() =>
                                                                window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })
                                                            }
                                                            onBlur={() =>
                                                                window.removeEventListener("wheel", (e) => e.preventDefault())
                                                            }
                                                        />
                                                    ) : (
                                                        <div className="w-[90px] h-[40px] flex items-center">
                                                            {Number(row.amount).toLocaleString('en-IN')}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {editingPaymentId === (row.id || null) ? (
                                                        <>
                                                            <select
                                                                value={row.type || ""}
                                                                onChange={(e) =>
                                                                    handleEditPayment(index, "type", e.target.value)
                                                                }
                                                                className="border-2 border-[#BF9853] border-opacity-25 w-[90px] h-[40px] rounded-lg bg-transparent focus:outline-none"
                                                                disabled={editingPaymentId !== row.id}
                                                            >
                                                                <option value="">Select</option>
                                                                {weeklyReceivedTypes.map((type, idx) => (
                                                                    <option key={idx} value={type.received_type}>
                                                                        {type.received_type}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </>
                                                    ) : (
                                                        <div className="w-[90px] h-[40px] flex items-center">
                                                            {row.type}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-2 py-2">
                                                    {Number(row.weekly_number) === Number(lastWeekNumber) && (
                                                        <div className="flex gap-1">
                                                            {editingPaymentId === row.id ? (
                                                                <button
                                                                    className="text-green-600 font-bold text-lg"
                                                                    onClick={() => saveEditedPaymentReceived(row)}
                                                                    disabled={!weeklyReceivedTypes.some(type => type.received_type === row.type)}
                                                                >
                                                                    ✓
                                                                </button>
                                                            ) : (
                                                                weeklyReceivedTypes.some(type => type.received_type === row.type) ? (
                                                                    canEditDelete && (
                                                                        <button onClick={() => {
                                                                            setEditingPaymentId(row.id);
                                                                            setEditingOriginalPayment({ ...row });
                                                                        }}>
                                                                            <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                                        </button>
                                                                    )
                                                                ) : (
                                                                    <img
                                                                        className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                        src={Edit}
                                                                        alt="Edit Disabled"
                                                                    />
                                                                )
                                                            )}
                                                            {weeklyReceivedTypes.some(type => type.received_type === row.type) ? (
                                                                canEditDelete && (
                                                                    <button className="" onClick={() => handleWeeklyReceivedDelete(row.id)}>
                                                                        <img src={Delete} className="w-5 h-4" alt="Delete" />
                                                                    </button>
                                                                )
                                                            ) : (
                                                                <img
                                                                    className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                    src={Delete}
                                                                    alt="Delete Disabled"
                                                                />
                                                            )}
                                                            {weeklyReceivedTypes.some(type => type.received_type === row.type) ? (
                                                                <button className="" onClick={() => fetchAuditDetailsForPaymentReceived(row.id)}>
                                                                    <img src={history} className="w-5 h-4" alt="History" />
                                                                </button>
                                                            ) : (
                                                                <img
                                                                    className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                    src={history}
                                                                    alt="History Disabled"
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {Number(selectedWeek) === Number(lastWeekNumber) ? (
                                            <tr>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="date"
                                                        name="date"
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-1 rounded-lg w-[120px] h-[40px] focus:outline-none"
                                                        value={newPayment.date}
                                                        onChange={handlePaymentChange}
                                                        onKeyDown={handleKeyDown1}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        className="border-2 border-[#BF9853] border-opacity-25 rounded-lg w-[90px] h-[40px] focus:outline-none"
                                                        value={newPayment.amount}
                                                        onChange={handlePaymentChange}
                                                        onKeyDown={handleKeyDown1}
                                                        onWheel={(e) => e.preventDefault()}
                                                        onFocus={() => window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                                                        onBlur={() => window.removeEventListener("wheel", (e) => e.preventDefault())}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        name="type"
                                                        className="border-2 border-[#BF9853] border-opacity-25 w-[90px] h-[40px] rounded-lg focus:outline-none"
                                                        value={newPayment.type}
                                                        onChange={handlePaymentChange}
                                                        onKeyDown={handleKeyDown1}
                                                    >
                                                        <option value="">Select</option>
                                                        {weeklyReceivedTypes.map((type, index) => (
                                                            <option key={index} value={type.received_type}>
                                                                {type.received_type}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td></td>
                                            </tr>
                                        ) : null}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mt-4 pt-2">
                            <h2 className="font-bold text-lg mb-2">Summary</h2>
                            <div className="overflow-hidden rounded-md border-l-8 border-[#BF9853] text-left">
                                <table className="w-full border-collapse">
                                    <tbody>
                                        {Object.entries(
                                            filteredExpenses
                                                .filter(expense => Number(expense.amount) > 0)
                                                .reduce((acc, expense) => {
                                                    const type = expense.type;
                                                    const amount = Number(expense.amount);
                                                    acc[type] = (acc[type] || 0) + amount;
                                                    return acc;
                                                }, {})
                                        ).map(([type, total], index, arr) => (
                                            <tr key={type}
                                                className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF] ${index === 0 ? "rounded-t-md" : ""
                                                    } ${index === arr.length - 1 ? "rounded-b-md" : ""}`}
                                            >
                                                <td className="font-bold py-1.5 pl-2">{type}</td>
                                                <td className="font-bold py-1.5 px-4 text-right">
                                                    {Number(total).toLocaleString("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <AuditModal show={showWeeklyPaymentExpensesModal} onClose={() => setShowWeeklyPaymentExpensesModal(false)} audits={weeklyPaymentExpensesAudits} vendorOptions={vendorOptions} contractorOptions={contractorOptions}
                    siteOptions={siteOptions} />
                <AuditModalWeeklyPaymentsReceived show={showWeeklyPaymentReceivedModal} onClose={() => setShowWeeklyPaymentReceivedModal(false)}
                    audits={weeklyPaymentReceivedAudits} />
            </div>
            {showPaymentPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white text-left rounded-xl  p-6 w-[800px] h-[770px] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4 text-center">Add Payment</h3>
                        <div className="space-y-4 mb-4 justify-items-center">
                            <div className="border-2 border-[#BF9853] border-opacity-25 w-[600px] rounded-lg p-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={paymentPopupData.date}
                                                onChange={(e) => setPaymentPopupData(prev => ({ ...prev, date: e.target.value }))}
                                                readOnly
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                        <input
                                            type="number"
                                            value={paymentPopupData.amount}
                                            onChange={(e) => setPaymentPopupData(prev => ({ ...prev, amount: e.target.value }))}
                                            placeholder="Enter amount"
                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none no-spinner"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                                        <select
                                            value={paymentPopupData.paymentMode}
                                            onChange={(e) => setPaymentPopupData(prev => ({ ...prev, paymentMode: e.target.value }))}
                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                        >
                                            <option value="">---Select---</option>
                                            <option value="Gpay">Gpay</option>
                                            <option value="PhonePe">PhonePe</option>
                                            <option value="Net Banking">Net Banking</option>
                                            <option value="Cheque">Cheque</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="border-2 border-[#BF9853] border-opacity-25 w-[600px] rounded-lg p-4">
                                <div className="space-y-4">
                                    {paymentPopupData.paymentMode === "Cheque" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No</label>
                                                <input
                                                    type="text"
                                                    value={paymentPopupData.chequeNo}
                                                    onChange={(e) => setPaymentPopupData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                                    placeholder="Enter cheque number"
                                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date</label>
                                                <input
                                                    type="date"
                                                    value={paymentPopupData.chequeDate}
                                                    onChange={(e) => setPaymentPopupData(prev => ({ ...prev, chequeDate: e.target.value }))}
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
                                                value={paymentPopupData.transactionNumber}
                                                onChange={(e) => setPaymentPopupData(prev => ({ ...prev, transactionNumber: e.target.value }))}
                                                placeholder="Enter transaction number"
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                                            <select
                                                value={paymentPopupData.accountNumber}
                                                onChange={(e) => setPaymentPopupData(prev => ({ ...prev, accountNumber: e.target.value }))}
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
                        </div>
                        {previousPayments.length > 0 && (
                            <div>
                                <h4 className="text-md font-medium text-gray-700 mb-3 ml-20">Previous Payments: {previousPayments.length} </h4>
                                <div className="mb-6 justify-items-center">
                                    <div className="space-y-4 max-h-64 overflow-y-auto">
                                        {previousPayments.map((payment, index) => (
                                            <div key={index} className="">
                                                <div className="border-2 border-[#BF9853] border-opacity-25 w-[600px] rounded-lg p-4 mb-4">
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                                            <input
                                                                type="text"
                                                                value={new Date(payment.date).toLocaleDateString('en-GB')}
                                                                readOnly
                                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                                            <input
                                                                type="text"
                                                                value={payment.amount.toLocaleString('en-IN')}
                                                                readOnly
                                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                                                            <input
                                                                type="text"
                                                                value={payment.bill_payment_mode}
                                                                readOnly
                                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="border-2 border-[#BF9853] border-opacity-25 rounded-lg p-4">
                                                    <div className="space-y-4">
                                                        {payment.bill_payment_mode === "Cheque" && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No</label>
                                                                    <input
                                                                        type="text"
                                                                        value={payment.cheque_number || ""}
                                                                        readOnly
                                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date</label>
                                                                    <input
                                                                        type="text"
                                                                        value={payment.cheque_date ? new Date(payment.cheque_date).toLocaleDateString('en-GB') : ""}
                                                                        readOnly
                                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number</label>
                                                                <input
                                                                    type="text"
                                                                    value={payment.transaction_number || ""}
                                                                    readOnly
                                                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                                                                <input
                                                                    type="text"
                                                                    value={payment.account_number || ""}
                                                                    readOnly
                                                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {currentProjectAdvanceRow && currentProjectAdvanceRow.type === "Claim" && currentProjectAdvanceRow.send_to_expenses_entry && (
                            <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-center">
                                    <span className="text-sm font-medium text-green-700">
                                        This Claim Amount Was Already Sent to the Expense Entry
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-6">
                            {currentProjectAdvanceRow && currentProjectAdvanceRow.type === "Claim" && !currentProjectAdvanceRow.send_to_expenses_entry && (
                                <button
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setIsConfirmingCategory(false);
                                        setShowCategoryPopup(true);
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Add To Expense Entry
                                </button>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPaymentPopup(false);
                                        setPaymentPopupData({
                                            date: new Date().toISOString().split('T')[0],
                                            amount: "",
                                            paymentMode: "",
                                            chequeNo: "",
                                            chequeDate: "",
                                            transactionNumber: "",
                                            accountNumber: ""
                                        });
                                        setPreviousPayments([]);
                                        setCurrentProjectAdvanceRow(null);
                                    }}
                                    className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            if (currentProjectAdvanceRow && paymentPopupData.paymentMode && paymentPopupData.amount) {
                                                let advancePortalId = null;
                                                let staffAdvancePortalId = null;
                                                if (currentProjectAdvanceRow.type === "Project Advance" && currentProjectAdvanceRow.advance_portal_id) {
                                                    try {
                                                        const res = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/getAll");
                                                        if (!res.ok) throw new Error("Failed to fetch entry numbers");
                                                        const allData = await res.json();
                                                        const maxEntryNo =
                                                            allData.length > 0
                                                                ? Math.max(...allData.map((item) => item.entry_no || 0))
                                                                : 0;
                                                        const nextEntryNo = maxEntryNo + 1;
                                                        const getWeekNumber = () => {
                                                            const now = new Date();
                                                            const start = new Date(now.getFullYear(), 0, 1);
                                                            const diff =
                                                                now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
                                                            const oneWeek = 604800000;
                                                            return Math.floor(diff / oneWeek) + 1;
                                                        };
                                                        const description = portalDescriptions[currentProjectAdvanceRow.advance_portal_id] || "";
                                                        const advanceUpdateData = {
                                                            type: "Advance",
                                                            date: paymentPopupData.date,
                                                            description: description,
                                                            bill_amount: 0,
                                                            amount: parseFloat(paymentPopupData.amount),
                                                            project_id: currentProjectAdvanceRow.project_id,
                                                            vendor_id: currentProjectAdvanceRow.vendor_id,
                                                            contractor_id: currentProjectAdvanceRow.contractor_id,
                                                            entry_no: nextEntryNo,
                                                            week_no: getWeekNumber(),
                                                            file_url: "",
                                                            transfer_site_id: 0,
                                                            refund_amount: 0,
                                                            payment_mode: paymentPopupData.paymentMode,
                                                            not_allow_to_edit: true
                                                        };
                                                        const advanceResponse = await fetch(
                                                            "https://backendaab.in/aabuildersDash/api/advance_portal/save",
                                                            {
                                                                method: "POST",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify(advanceUpdateData)
                                                            }
                                                        );
                                                        if (!advanceResponse.ok) {
                                                            console.error("Failed to update advance portal payment mode");
                                                        } else {
                                                            const advanceResponseData = await advanceResponse.json();
                                                            advancePortalId = advanceResponseData.advancePortalId || advanceResponseData.advance_portal_id;
                                                        }
                                                    } catch (error) {
                                                        console.error("Error updating advance portal payment mode:", error);
                                                    }
                                                }
                                                if (currentProjectAdvanceRow.type === "Staff Advance") {
                                                    try {
                                                        const staffAdvanceRes = await fetch("https://backendaab.in/aabuildersDash/api/staff-advance/all");
                                                        if (!staffAdvanceRes.ok) throw new Error("Failed to fetch staff advance entry numbers");
                                                        const staffAdvanceData = await staffAdvanceRes.json();
                                                        const maxEntryNo =
                                                            staffAdvanceData.length > 0
                                                                ? Math.max(...staffAdvanceData.map((item) => item.entry_no || 0))
                                                                : 0;
                                                        const nextEntryNo = maxEntryNo + 1;
                                                        const getWeekNumber = () => {
                                                            const now = new Date();
                                                            const start = new Date(now.getFullYear(), 0, 1);
                                                            const diff =
                                                                now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
                                                            const oneWeek = 604800000;
                                                            return Math.floor(diff / oneWeek) + 1;
                                                        };
                                                        const staffAdvanceSaveData = {
                                                            date: paymentPopupData.date,
                                                            employee_id: currentProjectAdvanceRow.employee_id,
                                                            project_id: currentProjectAdvanceRow.project_id,
                                                            type: "Advance",
                                                            from_purpose_id: 4,
                                                            staff_payment_mode: paymentPopupData.paymentMode,
                                                            entry_no: nextEntryNo,
                                                            week_no: getWeekNumber(),
                                                            amount: parseFloat(paymentPopupData.amount),
                                                            staff_refund_amount: 0.0,
                                                            description: "",
                                                            file_url: null,
                                                            labour_id: 0,
                                                            not_allow_to_edit: true
                                                        };
                                                        const staffAdvanceResponse = await fetch(
                                                            "https://backendaab.in/aabuildersDash/api/staff-advance/save",
                                                            {
                                                                method: "POST",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify(staffAdvanceSaveData)
                                                            }
                                                        );
                                                        if (!staffAdvanceResponse.ok) {
                                                            console.error("Failed to save staff advance");
                                                        } else {
                                                            const staffAdvanceResponseData = await staffAdvanceResponse.json();
                                                            staffAdvancePortalId = staffAdvanceResponseData.staffAdvancePortalId || staffAdvanceResponseData.staff_advance_portal_id;
                                                        }
                                                    } catch (error) {
                                                        console.error("Error saving staff advance:", error);
                                                    }
                                                }
                                                const paymentData = {
                                                    date: paymentPopupData.date,
                                                    created_at: new Date().toISOString(),
                                                    contractor_id: currentProjectAdvanceRow.contractor_id || null,
                                                    vendor_id: currentProjectAdvanceRow.vendor_id || null,
                                                    employee_id: currentProjectAdvanceRow.employee_id || null,
                                                    project_id: currentProjectAdvanceRow.project_id || null,
                                                    type: currentProjectAdvanceRow.type || null,
                                                    bill_payment_mode: paymentPopupData.paymentMode,
                                                    amount: parseFloat(paymentPopupData.amount),
                                                    status: true,
                                                    weekly_number: Number(selectedWeek),
                                                    weekly_payment_expense_id: currentProjectAdvanceRow.id,
                                                    advance_portal_id: advancePortalId,
                                                    staff_advance_portal_id: staffAdvancePortalId,
                                                    cheque_number: paymentPopupData.chequeNo || null,
                                                    cheque_date: paymentPopupData.chequeDate || null,
                                                    transaction_number: paymentPopupData.transactionNumber || null,
                                                    account_number: paymentPopupData.accountNumber || null
                                                };
                                                const response = await fetch("https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify(paymentData)
                                                });
                                                if (!response.ok) {
                                                    throw new Error("Failed to save payment");
                                                }
                                                const [expensesRes, paymentsRes] = await Promise.all([
                                                    axios.get(`https://backendaab.in/aabuildersDash/api/weekly-expenses/week/${selectedWeek}`),
                                                    axios.get(`https://backendaab.in/aabuildersDash/api/payments-received/week/${selectedWeek}`)
                                                ]);
                                                setExpenses(expensesRes.data);
                                                const filteredPayments = paymentsRes.data.filter(
                                                    (payment) => payment.type !== "Handover"
                                                );
                                                setPayments(filteredPayments);
                                                await fetchWeeklyPaymentBills();
                                            }
                                        } catch (error) {
                                            console.error("Error saving payment:", error);
                                        }

                                        setShowPaymentPopup(false);
                                        setPaymentPopupData({
                                            date: new Date().toISOString().split('T')[0],
                                            amount: "",
                                            paymentMode: "",
                                            chequeNo: "",
                                            chequeDate: "",
                                            transactionNumber: "",
                                            accountNumber: ""
                                        });
                                        setPreviousPayments([]);
                                        setCurrentProjectAdvanceRow(null);
                                    }}
                                    className="px-4 py-2 bg-[#BF9853] text-white rounded-lg"
                                    disabled={!paymentPopupData.paymentMode || !paymentPopupData.amount}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                        {currentProjectAdvanceRow && currentProjectAdvanceRow.type === "Claim" && (
                            <div className="mt- p-3 text-center -ml-[600px]">
                                <span className="text-sm font-medium text-gray-700">Total Amount: </span>
                                <span className="text-lg font-semibold text-gray-900">
                                    ₹{(Number(currentProjectAdvanceRow.amount) + previousPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)).toLocaleString('en-IN')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {showPopups && (currentRow?.type === "Project Advance" || currentRow?.type === "Bill") && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
                        <label className="block mb-3 text-left">
                            <span className="font-semibold">Description</span>
                            <input
                                type="text"
                                name="description"
                                value={editFormData.description}
                                className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                                onChange={handleEditChange}
                                readOnly={Boolean(currentRow?.description)}
                            />
                        </label>
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowPopups(false)} className="px-4 py-2 bg-gray-200 rounded-lg">
                                Close
                            </button>
                            {!portalDescriptions[currentRow?.advance_portal_id] && (
                                <button
                                    onClick={async () => {
                                        await updateDescription(currentRow.advance_portal_id, editFormData.description);
                                        setShowPopups(false);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                                >
                                    Save
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {fileUploadPopup && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setFileUploadPopup(false);
                            setCurrentFileRow(null);
                            setSelectedFileForPopup(null);
                        }
                    }}
                    tabIndex={0}
                >
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[500px]">
                        <h3 className="text-lg font-semibold mb-4 text-center">
                            {currentFileRow?.bill_copy_url ? 'Change File' : 'Upload File'}
                        </h3>
                        {currentFileRow?.bill_copy_url && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Current file:</p>
                                <a href={cleanUrl(currentFileRow.bill_copy_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                >
                                    View Current File
                                </a>
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">
                                Select PDF File
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileSelectInPopup}
                                className="w-full p-2 border-2 border-[#BF9853] border-opacity-25 rounded-lg focus:outline-none"
                            />
                            {selectedFileForPopup && (
                                <p className="text-sm text-green-600 mt-2">
                                    ✓ {selectedFileForPopup.name} selected
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setFileUploadPopup(false);
                                    setCurrentFileRow(null);
                                    setSelectedFileForPopup(null);
                                }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button onClick={handleSaveFileFromPopup} disabled={!selectedFileForPopup}
                                className={`px-4 py-2 rounded-lg ${!selectedFileForPopup
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                    } text-white`}
                            >
                                {currentFileRow?.bill_copy_url ? 'Update File' : 'Upload File'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showCategoryPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
                        <h3 className="text-lg font-semibold mb-4 text-center">Select Category</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <Select
                                value={selectedCategory}
                                onChange={(selectedOption) => setSelectedCategory(selectedOption)}
                                options={categoryOptions}
                                placeholder="Select Category..."
                                isSearchable
                                isClearable
                                menuPortalTarget={document.body}
                                styles={{
                                    control: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: 'white',
                                        borderWidth: '2px',
                                        borderColor: state.isFocused
                                            ? '#BF9853'
                                            : '#BF9853',
                                        borderRadius: '8px',
                                        boxShadow: state.isFocused ? '0 0 0 1px #BF9853' : 'none',
                                        '&:hover': {
                                            borderColor: '#BF9853',
                                        },
                                    }),
                                    placeholder: (provided) => ({
                                        ...provided,
                                        color: '#999',
                                        textAlign: 'left',
                                    }),
                                    menu: (provided) => ({
                                        ...provided,
                                        zIndex: 9999,
                                        maxHeight: '300px',
                                        overflow: 'auto',
                                    }),
                                    menuList: (provided) => ({
                                        ...provided,
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        padding: '4px',
                                    }),
                                    menuPortal: (provided) => ({
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
                                    indicatorSeparator: () => ({
                                        display: 'none'
                                    }),
                                    indicatorsContainer: (provided) => ({
                                        ...provided,
                                        height: '40px',
                                        gap: '0px'
                                    }),
                                    clearIndicator: (provided) => ({
                                        ...provided,
                                        padding: '2px'
                                    }),
                                    dropdownIndicator: (provided) => ({
                                        ...provided,
                                        padding: '2px'
                                    })
                                }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comments
                            </label>
                            <textarea
                                value={categoryComments}
                                onChange={(e) => setCategoryComments(e.target.value)}
                                placeholder="Enter comments..."
                                className="w-full border-2 border-[#BF9853] border-opacity-25 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:border-transparent resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCategoryPopup(false);
                                    setSelectedCategory(null);
                                    setIsConfirmingCategory(false);
                                }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!selectedCategory || isConfirmingCategory) {
                                        if (!selectedCategory) {
                                            alert("Please select a category");
                                        }
                                        return;
                                    }
                                    setIsConfirmingCategory(true);
                                    setShowCategoryPopup(false);
                                    try {
                                        const enoResponse = await fetch('https://backendaab.in/aabuilderDash/expenses_form/get_form');
                                        if (!enoResponse.ok) {
                                            throw new Error('Failed to fetch ENo');
                                        }
                                        const enoData = await enoResponse.json();
                                        const nextEno = enoData.length > 0 ? Math.max(...enoData.map(item => item.eno || 0)) + 1 : 1;
                                        const expensesFormData = {
                                            accountType: "Claim",
                                            eno: nextEno,
                                            date: currentProjectAdvanceRow.date,
                                            siteName: siteOptions.find(opt => opt.id === Number(currentProjectAdvanceRow.project_id))?.label || "",
                                            vendor: vendorOptions.find(opt => opt.id === Number(currentProjectAdvanceRow.vendor_id))?.label || "",
                                            quantity: 1,
                                            contractor: contractorOptions.find(opt => opt.id === Number(currentProjectAdvanceRow.contractor_id))?.label || "",
                                            amount: Number(currentProjectAdvanceRow.amount) + previousPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
                                            category: selectedCategory.value,
                                            comments: categoryComments || "",
                                            machineTools: "",
                                            source: "Cash Register",
                                            billCopyUrl: currentProjectAdvanceRow.bill_copy_url
                                        };
                                        const expensesFormResponse = await fetch('https://backendaab.in/aabuilderDash/expenses_form/save', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(expensesFormData)
                                        });
                                        if (!expensesFormResponse.ok) {
                                            throw new Error('Failed to save to expenses form');
                                        }
                                        const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/${currentProjectAdvanceRow.id}/send-to-expenses`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                        });
                                        if (response.ok) {
                                            const [expensesRes, paymentsRes] = await Promise.all([
                                                axios.get(`https://backendaab.in/aabuildersDash/api/weekly-expenses/week/${selectedWeek}`),
                                                axios.get(`https://backendaab.in/aabuildersDash/api/payments-received/week/${selectedWeek}`)
                                            ]);
                                            setExpenses(expensesRes.data);
                                            const filteredPayments = paymentsRes.data.filter(
                                                (payment) => payment.type !== "Handover"
                                            );
                                            setPayments(filteredPayments);
                                            await fetchWeeklyPaymentBills();
                                            setCurrentProjectAdvanceRow(prev => ({ ...prev, send_to_expenses_entry: true }));
                                            setPopup({
                                                show: true,
                                                message: "Successfully added to expense entry!",
                                                type: "success",
                                                dateStr: new Date().toLocaleDateString('en-GB')
                                            });
                                            setTimeout(() => {
                                                setShowPaymentPopup(false);
                                                setPaymentPopupData({
                                                    date: new Date().toISOString().split('T')[0],
                                                    amount: "",
                                                    paymentMode: "",
                                                    chequeNo: "",
                                                    chequeDate: "",
                                                    transactionNumber: "",
                                                    accountNumber: ""
                                                });
                                                setPreviousPayments([]);
                                                setCurrentProjectAdvanceRow(null);
                                                setSelectedCategory(null);
                                                setIsConfirmingCategory(false);
                                                setCategoryComments("");
                                            }, 2000);
                                        } else {
                                            throw new Error('Failed to update expense entry status');
                                        }
                                    } catch (error) {
                                        console.error('Error updating expense entry status:', error);
                                        setIsConfirmingCategory(false);
                                        setPopup({
                                            show: true,
                                            message: "Failed to add to expense entry. Please try again.",
                                            type: "error",
                                            dateStr: new Date().toLocaleDateString('en-GB')
                                        });
                                    }
                                }}
                                className="px-4 py-2 bg-[#BF9853] text-white rounded-lg hover:bg-[#BF9853]/90 transition-colors"
                                disabled={!selectedCategory || isConfirmingCategory}
                            >
                                {isConfirmingCategory ? "Processing..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {popup.show && (
                <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-4 z-50 w-96">
                    <p className="mb-4 font-semibold text-center">{popup.message}</p>
                    <div className="flex justify-around">
                        <button
                            className="px-4 py-2 border border-[#BF9853] w-[90px] rounded-lg"
                            onClick={() => {
                                if (popup.type === "expense") {
                                    setNewExpense((prev) => ({ ...prev, date: "" }));
                                } else if (popup.type === "payment") {
                                    setNewPayment((prev) => ({ ...prev, date: "" }));
                                } else if (popup.type === "edit-expense" && popup.editRowId !== null && popup.originalDate) {
                                    setExpenses((prevExpenses) =>
                                        prevExpenses.map((expense) =>
                                            expense.id === popup.editRowId ? { ...expense, date: popup.originalDate } : expense
                                        )
                                    );
                                } else if (popup.type === "edit-payment" && popup.editIndex !== null && popup.originalDate) {
                                    setPayments((prevPayments) =>
                                        prevPayments.map((payment, i) =>
                                            i === popup.editIndex ? { ...payment, date: popup.originalDate } : payment
                                        )
                                    );
                                }
                                setPopup({ show: false, message: "", type: "", dateStr: "", editRowId: null, editField: null, editIndex: null, originalDate: "" });
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </body >
    )
}
export default History
const AuditModal = ({ show, onClose, audits, vendorOptions, contractorOptions, siteOptions }) => {
    if (!show) return null;
    const getNameById = (id, options) => {
        if (!id && id !== 0) return "-";
        const found = options.find(opt => String(opt.id) === String(id));
        return found ? found.label : id;
    };
    const fields = [
        { oldKey: "old_date", newKey: "new_date", label: "Date", width: "120px" },
        { oldKey: "old_type", newKey: "new_type", label: "Type", width: "100px" },
        { oldKey: "old_project_id", newKey: "new_project_id", label: "Project Name", width: "180px", lookup: siteOptions },
        { oldKey: "old_vendor_id", newKey: "new_vendor_id", label: "Vendor", width: "150px", lookup: vendorOptions },
        { oldKey: "old_contractor_id", newKey: "new_contractor_id", label: "Contractor", width: "150px", lookup: contractorOptions },
        { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
    ];
    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        hours = String(hours).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };
    const formatDisplayValue = (value, field) => {
        if (
            (field.oldKey?.includes("vendor_id") || field.oldKey?.includes("transfer_site_id") ||
                field.newKey?.includes("vendor_id") || field.newKey?.includes("transfer_site_id")) &&
            String(value) === "0"
        ) {
            return "-";
        }
        if (field.lookup) {
            return getNameById(value, field.lookup);
        }
        if (field.label.includes("Amount")) {
            return value ? Number(value).toLocaleString("en-IN") : "-";
        }
        if (field.label === "Date") {
            return value ? new Date(value).toLocaleDateString("en-GB") : "-";
        }
        return value ?? "-";
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1800px] mx-4 p-2">
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
                                <th style={{ width: "130px" }}>Time Stamp</th>
                                <th style={{ width: "120px" }}>Edited By</th>
                                {fields.map((f) => (
                                    <th key={f.label} style={{ width: f.width }}
                                        className="border-b py-2 px-2 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                                    >
                                        {f.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]">
                                    <td className="whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: "130px" }}>
                                        {formatDateTime(audit.edited_date)}
                                    </td>
                                    <td className="whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: "120px" }}>
                                        {audit.edited_by}
                                    </td>
                                    {fields.map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;
                                        return (
                                            <td key={f.label} style={{ width: f.width }} title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`whitespace-nowrap overflow-hidden text-ellipsis px-2 ${changed ? "bg-[#BF9853] font-bold" : ""
                                                    }`}
                                            >
                                                {oldDisplay}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
const AuditModalWeeklyPaymentsReceived = ({ show, onClose, audits }) => {
    if (!show) return null;
    const getNameById = (id, options) => {
        if (!id && id !== 0) return "-";
        const found = options.find(opt => String(opt.id) === String(id));
        return found ? found.label : id;
    };
    const fields = [
        { oldKey: "old_date", newKey: "new_date", label: "Date", width: "120px" },
        { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
        { oldKey: "old_type", newKey: "new_type", label: "Type", width: "100px" },
    ];
    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        hours = String(hours).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };
    const formatDisplayValue = (value, field) => {
        if (
            (field.oldKey?.includes("vendor_id") || field.oldKey?.includes("transfer_site_id") ||
                field.newKey?.includes("vendor_id") || field.newKey?.includes("transfer_site_id")) &&
            String(value) === "0"
        ) {
            return "-";
        }
        if (field.lookup) {
            return getNameById(value, field.lookup);
        }
        if (field.label.includes("Amount")) {
            return value ? Number(value).toLocaleString("en-IN") : "-";
        }
        if (field.label === "Date") {
            return value ? new Date(value).toLocaleDateString("en-GB") : "-";
        }
        return value ?? "-";
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1800px] mx-4 p-2">
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
                                <th style={{ width: "130px" }}>Time Stamp</th>
                                <th style={{ width: "120px" }}>Edited By</th>
                                {fields.map((f) => (
                                    <th key={f.label} style={{ width: f.width }}
                                        className="border-b py-2 px-2 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                                    >
                                        {f.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]">
                                    <td className="whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: "130px" }}>
                                        {formatDateTime(audit.edited_date)}
                                    </td>
                                    <td className="whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: "120px" }}>
                                        {audit.edited_by}
                                    </td>
                                    {fields.map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;
                                        return (
                                            <td key={f.label} style={{ width: f.width }} title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`whitespace-nowrap overflow-hidden text-ellipsis px-2 ${changed ? "bg-[#BF9853] font-bold" : ""
                                                    }`}
                                            >
                                                {oldDisplay}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};