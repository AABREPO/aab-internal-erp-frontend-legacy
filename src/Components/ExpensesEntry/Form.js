import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Attach from '../Images/Attachfile.svg';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
const Form = ({ username, userRoles = [] }) => {
    const [eno, setEno] = useState(null);
    const [date, setDate] = useState('');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quantity, setQuantity] = useState("");
    const [comments, setComments] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [combinedOptions, setCombinedOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedType, setSelectedType] = useState("");
    const [selectedAccountType, setSelectedAccountType] = useState('');
    const [selectedSite, setSelectedSite] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedMachineTools, setSelectedMachine] = useState(null);
    const [siteOptions, setSiteOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [machineToolsOptions, setMachineToolsOptions] = useState([]);
    const [accountTypeOptions, setAccountTypeOptions] = useState([]);
    const [showMachineTools, setShowMachineTools] = useState(false);
    const fileInputRef = useRef(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const moduleName = "Expense Entry";
    const [paymentMode, setPaymentMode] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentModalData, setPaymentModalData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: "",
        paymentMode: "",
        chequeNo: "",
        chequeDate: "",
        transactionNumber: "",
        accountNumber: ""
    });
    const [accountDetails, setAccountDetails] = useState([]);
    const [selectedEbNumber, setSelectedEbNumber] = useState(null);
    const [selectedMonths, setSelectedMonths] = useState('');
    const [thirdInput, setThirdInput] = useState('');
    const [ebNumberOptions, setEbNumberOptions] = useState([]);
    const [utilityType, setUtilityType] = useState('');
    const [projectData, setProjectData] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isReviewEditMode, setIsReviewEditMode] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState(null);
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
                setSiteOptions(formattedData);
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
                setVendorOptions(formattedData);
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
                setContractorOptions(formattedData);
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
                    id: item.id,
                    value: item.category,
                    label: item.category,
                }));
                setCategoryOptions(formattedData);
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
                setMachineToolsOptions(formattedData);
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
                setAccountTypeOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchAccountType();
    }, []);
    useEffect(() => {
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
        fetchAccountDetails();
    }, []);
    useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);

    useEffect(() => {
        const prefillDataStr = localStorage.getItem('expenseEntryPrefill');
        if (prefillDataStr && siteOptions.length > 0 && accountTypeOptions.length > 0) {
            try {
                const prefillData = JSON.parse(prefillDataStr);

                const utilityBillsOption = accountTypeOptions.find(opt => opt.value === 'Utility Bills');
                if (utilityBillsOption) {
                    setSelectedAccountType('Utility Bills');
                }

                setUtilityType('Electricity');

                const siteOption = siteOptions.find(opt => opt.label === prefillData.siteName);
                if (siteOption) {
                    setSelectedSite(siteOption);
                }

                const fetchPreviousEntry = async () => {
                    try {
                        const response = await axios.get('https://backendaab.in/aabuilderDash/expenses_form/utility/electricity');
                        const electricityEntries = Array.isArray(response.data) ? response.data : [];

                        const previousEntry = electricityEntries
                            .filter(entry => entry.utilityTypeNumber === prefillData.ebNo)
                            .sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp))[0];

                        if (previousEntry) {
                            if (previousEntry.category && categoryOptions.length > 0) {
                                const categoryOption = categoryOptions.find(opt => opt.value === previousEntry.category);
                                if (categoryOption) {
                                    setSelectedCategory(categoryOption);
                                }
                            }

                            if (previousEntry.quantity) {
                                setQuantity(previousEntry.quantity);
                            }

                            if (previousEntry.comments) {
                                setComments(previousEntry.comments);
                            }

                            if (previousEntry.paymentMode) {
                                setPaymentMode(previousEntry.paymentMode);
                            }

                            if (previousEntry.utilityValidityDays) {
                                setThirdInput(previousEntry.utilityValidityDays);
                            }

                            setTimeout(() => {
                                if (siteOption && projectData) {
                                }
                            }, 500);
                        }
                        const setTNEBContractor = () => {
                            if (contractorOptions.length > 0) {
                                const tnebOption = contractorOptions.find(opt =>
                                    opt.label === 'TNEB' || opt.value === 'TNEB'
                                );
                                if (tnebOption) {
                                    setSelectedOption(tnebOption);
                                    setSelectedType('Contractor');
                                } else {
                                    const tnebInCombined = combinedOptions.find(opt =>
                                        (opt.label === 'TNEB' || opt.value === 'TNEB') && opt.type === 'Contractor'
                                    );
                                    if (tnebInCombined) {
                                        setSelectedOption(tnebInCombined);
                                        setSelectedType('Contractor');
                                    } else {
                                        console.warn('TNEB contractor not found in options, creating temporary option without ID');
                                        const tnebContractor = {
                                            value: 'TNEB',
                                            label: 'TNEB',
                                            type: 'Contractor',
                                            id: null
                                        };
                                        setSelectedOption(tnebContractor);
                                        setSelectedType('Contractor');
                                    }
                                }
                            } else {
                                setTimeout(setTNEBContractor, 500);
                            }
                        };
                        setTNEBContractor();
                    } catch (error) {
                        console.error('Error fetching previous entry:', error);
                    }
                };
                setTimeout(() => {
                    fetchPreviousEntry();
                }, 500);
            } catch (error) {
                console.error('Error parsing prefill data:', error);
                localStorage.removeItem('expenseEntryPrefill');
            }
        }
    }, [siteOptions, accountTypeOptions, categoryOptions, contractorOptions, combinedOptions]);
    useEffect(() => {
        if (selectedSite && selectedSite.id) {
            fetchProjectData(selectedSite.id);
        } else {
            setProjectData(null);
            setEbNumberOptions([]);
        }
    }, [selectedSite]);
    useEffect(() => {
        if (utilityType && projectData) {
            updateEbNumberOptions(utilityType, projectData);
        } else {
            setEbNumberOptions([]);
        }
    }, [utilityType, projectData]);
    useEffect(() => {
        const prefillDataStr = localStorage.getItem('expenseEntryPrefill');
        if (prefillDataStr && ebNumberOptions.length > 0) {
            try {
                const prefillData = JSON.parse(prefillDataStr);
                const ebOption = ebNumberOptions.find(opt => opt.value === prefillData.ebNo);
                if (ebOption) {
                    setSelectedEbNumber(ebOption);
                    setTimeout(() => {
                        localStorage.removeItem('expenseEntryPrefill');
                    }, 1000);
                }
            } catch (error) {
                console.error('Error setting EB number:', error);
                localStorage.removeItem('expenseEntryPrefill');
            }
        }
    }, [ebNumberOptions]);
    const getCurrentWeekNumber = () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + startOfYear.getDay() + 1) / 7);
    };
    const fetchProjectData = async (projectId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuilderDash/api/projects/get/${projectId}`);
            if (response.ok) {
                const data = await response.json();
                setProjectData(data);
                return data;
            } else {
                console.error('Failed to fetch project data');
                return null;
            }
        } catch (error) {
            console.error('Error fetching project data:', error);
            return null;
        }
    };
    const updateEbNumberOptions = (utilityType, projectData) => {
        if (!projectData || !projectData.propertyDetails) {
            setEbNumberOptions([]);
            return;
        }
        const options = [];
        projectData.propertyDetails.forEach((property, index) => {
            let optionValue = '';
            let optionLabel = '';
            switch (utilityType) {
                case 'Electricity':
                    if (property.ebNo) {
                        optionValue = property.ebNo;
                        optionLabel = property.ebNo;
                    }
                    break;
                case 'Property':
                    if (property.propertyTaxNo) {
                        optionValue = property.propertyTaxNo;
                        optionLabel = property.propertyTaxNo;
                    }
                    break;
                case 'Water':
                    if (property.waterTaxNo) {
                        optionValue = property.waterTaxNo;
                        optionLabel = property.waterTaxNo;
                    }
                    break;
                default:
                    return;
            }
            if (optionValue && optionLabel) {
                options.push({
                    value: optionValue,
                    label: optionLabel,
                    id: index
                });
            }
        });
        setEbNumberOptions(options);
    };
    const handleChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        if (selectedOption) {
            setSelectedType(selectedOption.type);
        } else {
            setSelectedType("");
        }
    };
    // Helper function to convert image to PDF
    const convertImageToPdf = (file) => {
        return new Promise((resolve, reject) => {
            // Check if file is an image
            const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
            if (!imageTypes.includes(file.type)) {
                // If it's already a PDF, return as is
                resolve(file);
                return;
            }

            // Create an image element to load the file
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.onload = () => {
                    try {
                        // Calculate dimensions to fit A4 page (in mm)
                        const pdfWidth = 210; // A4 width in mm
                        const pdfHeight = 297; // A4 height in mm
                        const imgWidth = img.width;
                        const imgHeight = img.height;

                        // Calculate aspect ratio
                        const imgAspectRatio = imgWidth / imgHeight;
                        const pdfAspectRatio = pdfWidth / pdfHeight;

                        // Determine orientation
                        const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
                        let finalWidth, finalHeight;

                        if (orientation === 'landscape') {
                            // Use landscape dimensions
                            if (imgAspectRatio > pdfAspectRatio) {
                                // Image is wider, fit to width
                                finalWidth = pdfWidth;
                                finalHeight = pdfWidth / imgAspectRatio;
                            } else {
                                // Image is taller, fit to height
                                finalHeight = pdfHeight;
                                finalWidth = pdfHeight * imgAspectRatio;
                            }
                        } else {
                            // Use portrait dimensions
                            if (imgAspectRatio > pdfAspectRatio) {
                                // Image is wider, fit to width
                                finalWidth = pdfWidth;
                                finalHeight = pdfWidth / imgAspectRatio;
                            } else {
                                // Image is taller, fit to height
                                finalHeight = pdfHeight;
                                finalWidth = pdfHeight * imgAspectRatio;
                            }
                        }

                        // Center the image on the page
                        const xOffset = (pdfWidth - finalWidth) / 2;
                        const yOffset = (pdfHeight - finalHeight) / 2;

                        // Create a new PDF document
                        const pdf = new jsPDF({
                            orientation: orientation,
                            unit: 'mm',
                            format: 'a4'
                        });

                        // Determine image format for PDF
                        let imgFormat = 'JPEG';
                        if (file.type === 'image/png') {
                            imgFormat = 'PNG';
                        } else if (file.type === 'image/gif') {
                            imgFormat = 'GIF';
                        }

                        // Add the image to PDF
                        pdf.addImage(img, imgFormat, xOffset, yOffset, finalWidth, finalHeight);

                        // Convert PDF to blob
                        const pdfBlob = pdf.output('blob');

                        // Create a File object from the blob with .pdf extension
                        const pdfFile = new File([pdfBlob], file.name.replace(/\.[^/.]+$/, '') + '.pdf', {
                            type: 'application/pdf',
                            lastModified: Date.now()
                        });

                        resolve(pdfFile);
                    } catch (error) {
                        console.error('Error converting image to PDF:', error);
                        reject(error);
                    }
                };

                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Convert image to PDF if it's an image
                const processedFile = await convertImageToPdf(file);
                setSelectedFile(processedFile);
            } catch (error) {
                console.error('Error processing file:', error);
                alert('Error processing file. Please try again.');
            }
        }
        e.target.value = '';
    };
    useEffect(() => {
        if (!selectedFile) {
            setFilePreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(selectedFile);
        setFilePreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);
    const handleCategoryChange = (selectedCategory) => {
        setSelectedCategory(selectedCategory);
        if (selectedCategory && selectedCategory.label === 'Machine Repair') {
            setShowMachineTools(true);
        } else {
            setShowMachineTools(false);
            setSelectedMachine(null);
        }
    };
    const fetchLatestEno = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/expenses_form/get_form');
            if (!response.ok) {
                throw new Error('Failed to fetch ENo');
            }
            const data = await response.json();
            if (data.length > 0) {
                const sortedData = data.sort((a, b) => b.eno - a.eno);
                const lastEno = sortedData[0].eno;
                setEno(lastEno + 1);
            } else {
                setEno(54173);
            }
        } catch (error) {
            console.error('Error fetching latest ENo:', error);
        }
    };
    const formatNumber = (num) => {
        if (!num) return '';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (!isNaN(rawValue)) {
            setAmount(rawValue);
        }
    };
    useEffect(() => {
        fetchLatestEno();
    }, []);
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const validateFormFields = () => {
        if (!selectedAccountType || !date || !selectedSite || !amount || !selectedCategory || !selectedOption) {
            alert('Please fill out all required fields.');
            return false;
        }
        if ((selectedAccountType === 'Claim' || selectedAccountType === 'Utility Bills') && !paymentMode) {
            alert('Please select a payment mode for this account type.');
            return false;
        }
        if (selectedAccountType === 'Bill Refund' && !selectedFile) {
            alert('PDF file is required for Bill Refund.');
            return false;
        }
        if (selectedAccountType === 'Utility Bills' && !selectedFile) {
            alert('PDF file is required for Utility Bills.');
            return false;
        }
        if (
            selectedAccountType !== 'Daily Wage' &&
            selectedAccountType !== 'Utility Bills' &&
            selectedAccountType !== 'Bill Refund' &&
            !selectedFile
        ) {
            alert('PDF file is required for this type.');
            return false;
        }
        return true;
    };
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!validateFormFields()) {
            return;
        }
        setShowReviewModal(true);
        setIsReviewEditMode(false);
    };
    const submitExpenseData = async () => {
        if (
            (selectedAccountType === 'Claim' || selectedAccountType === 'Utility Bills') &&
            ["GPay", "PhonePe", "Net Banking", "Cheque"].includes(paymentMode)
        ) {
            setPaymentModalData({
                date: date,
                amount: amount,
                paymentMode: paymentMode,
                chequeNo: "",
                chequeDate: "",
                transactionNumber: "",
                accountNumber: ""
            });
            setShowPaymentModal(true);
            setShowReviewModal(false);
            return;
        }
        setIsSubmitting(true);
        setShowReviewModal(false);
        try {
            let vendor = '';
            let contractor = '';
            if (selectedType === 'Vendor') {
                vendor = selectedOption ? selectedOption.label : '';
            } else if (selectedType === 'Contractor') {
                contractor = selectedOption ? selectedOption.label : '';
            }
            let pdfUrl = '';
            if (selectedFile) {
                try {
                    const formData = new FormData();
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
                    const finalName = `${timestamp} ${selectedSite.sNo} ${vendor || contractor}`;
                    formData.append('file', selectedFile);
                    formData.append('file_name', finalName);
                    const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
                        method: "POST",
                        body: formData,
                    });
                    if (!uploadResponse.ok) {
                        throw new Error('File upload failed');
                    }
                    const uploadResult = await uploadResponse.json();
                    pdfUrl = uploadResult.url;
                } catch (error) {
                    console.error('Error during file upload:', error);
                    alert('Error during file upload. Please try again.');
                    setIsSubmitting(false);
                    return;
                }
            }
            const projectId = selectedSite ? selectedSite.id : null;
            const vendorId = selectedType === 'Vendor' && selectedOption ? (selectedOption.id || null) : null;
            const contractorId = selectedType === 'Contractor' && selectedOption ? (selectedOption.id || null) : null;
            const bodyData = {
                accountType: selectedAccountType,
                eno: eno,
                date: date,
                paymentMode: paymentMode,
                siteName: selectedSite ? selectedSite.label : '',
                projectId: projectId,
                vendor: vendor,
                vendorId: vendorId,
                contractor: contractor,
                contractorId: contractorId,
                source:"Expenses Entry",
                quantity: quantity,
                amount: selectedAccountType === 'Bill Refund' ? -Math.abs(parseInt(amount)) : parseInt(amount),
                category: selectedCategory ? selectedCategory.label : '',
                comments: comments,
                machineTools: selectedMachineTools ? selectedMachineTools.label : '',
                billCopyUrl: pdfUrl || '',
                utilityType: utilityType || '',
                utilityTypeNumber: selectedEbNumber ? selectedEbNumber.label : '',
                utilityForTheMonth: selectedMonths || '',
                utilityValidityDays: thirdInput || ''
            };
            const formResponse = await fetch("https://backendaab.in/aabuilderDash/expenses_form/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyData),
            });
            let expensesId = null;
            let savedExpenseData = null;
            try {
                const responseText = await formResponse.text();
                if (!formResponse.ok) {
                    throw new Error(`Form submission failed: ${responseText}`);
                }
                if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
                    const expensesResult = JSON.parse(responseText);
                    expensesId = expensesResult.id || expensesResult.eno;
                    savedExpenseData = expensesResult;
                } else {
                    try {
                        const allFormsRes = await fetch("https://backendaab.in/aabuilderDash/expenses_form/get_form");
                        if (allFormsRes.ok) {
                            const allForms = await allFormsRes.json();
                            if (allForms.length > 0) {
                                let matchingForm = allForms.find(f =>
                                    f.eno === eno &&
                                    f.date === date &&
                                    f.siteName === selectedSite.label
                                );
                                if (matchingForm) {
                                    expensesId = matchingForm.id;
                                    savedExpenseData = matchingForm;
                                } else {
                                    const recentFormWithEno = allForms
                                        .filter(f => f.eno === eno)
                                        .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))[0];
                                    if (recentFormWithEno) {
                                        expensesId = recentFormWithEno.id;
                                        savedExpenseData = recentFormWithEno;
                                    }
                                }
                            }
                        }
                    } catch (fetchError) {
                        console.error('Could not fetch expenses form ID:', fetchError);
                    }
                }
            } catch (parseError) {
                console.error('Response parsing error:', parseError);
                if (parseError.message && parseError.message.includes('Form submission failed')) {
                    throw parseError;
                }
            }
            if (expensesId) {
                try {
                    const verifyResponse = await fetch(`https://backendaab.in/aabuilderDash/expenses_form/get_form`);
                    if (verifyResponse.ok) {
                        const allForms = await verifyResponse.json();
                        const savedForm = allForms.find(f => f.id === expensesId);
                    }
                } catch (verifyError) {
                    console.error('Could not verify saved data:', verifyError);
                }
            }
            if (paymentMode === 'Cash' && expensesId) {
                let vendorId = null;
                let contractorId = null;
                if (selectedType === 'Vendor' && selectedOption) {
                    vendorId = selectedOption.id;
                } else if (selectedType === 'Contractor' && selectedOption) {
                    contractorId = selectedOption.id;
                }
                const weeklyExpenseData = {
                    date: date,
                    created_at: new Date().toISOString(),
                    contractor_id: contractorId,
                    vendor_id: vendorId,
                    employee_id: null,
                    project_id: projectId,
                    type: utilityType,
                    amount: selectedAccountType === 'Bill Refund' ? -Math.abs(parseFloat(amount)) : parseFloat(amount),
                    status: true,
                    weekly_number: getCurrentWeekNumber(),
                    advance_portal_id: null,
                    staff_advance_portal_id: null,
                    loan_portal_id: null,
                    rent_management_id: null,
                    expenses_entry_id: expensesId,
                    send_to_expenses_entry: false,
                    bill_copy_url: pdfUrl || ''
                };
                try {
                    const weeklyExpenseResponse = await fetch("https://backendaab.in/aabuildersDash/api/weekly-expenses/save", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(weeklyExpenseData),
                    });
                    if (!weeklyExpenseResponse.ok) {
                        console.error("❌ Weekly expense submission failed");
                    } else {
                        console.log("✅ Weekly expense submitted:", weeklyExpenseData);
                    }
                } catch (error) {
                    console.error("❌ Error submitting weekly expense:", error);
                }
            }
            setEno(eno + 1);
            resetForm();
        } catch (error) {
            console.error('Error during form submission:', error);
            alert('Error during form submission. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleReviewConfirm = () => {
        if (isReviewEditMode) {
            return;
        }
        if (!validateFormFields()) {
            return;
        }
        submitExpenseData();
    };
    const handleReviewClose = () => {
        setShowReviewModal(false);
        setIsReviewEditMode(false);
    };
    const handleReviewSave = () => {
        if (!validateFormFields()) {
            return;
        }
        setIsReviewEditMode(false);
    };
    const renderReviewRow = (label, value) => (
        <div className="flex justify-between gap-4 border border-gray-100 rounded-lg px-4 py-2" key={label}>
            <span className="text-sm font-semibold text-gray-600">{label}</span>
            <span className="text-sm text-gray-800 text-right break-words">{value || '-'}</span>
        </div>
    );
    const resetForm = () => {
        setAmount('');
        setQuantity('');
        setComments('');
        setSelectedFile(null);
        setSelectedOption(null);
        setSelectedSite(null);
        setSelectedCategory(null);
        setSelectedMachine(null);
        setSelectedType("");
        setPaymentMode('');
        setSelectedEbNumber(null);
        setSelectedMonths('');
        setThirdInput('');
        setUtilityType('');
        setProjectData(null);
        setEbNumberOptions([]);
        setShowReviewModal(false);
        setIsReviewEditMode(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const handlePaymentSubmit = async () => {
        if (!paymentModalData.accountNumber && paymentModalData.paymentMode !== "Cash") {
            alert("Please select account number.");
            return;
        }
        if (paymentModalData.paymentMode === "Cheque" && (!paymentModalData.chequeNo || !paymentModalData.chequeDate)) {
            alert("Please enter cheque number and date.");
            return;
        }
        if (selectedAccountType === 'Utility Bills' && !selectedFile) {
            alert('PDF file is required for Utility Bills.');
            return;
        }
        setIsSubmitting(true);
        try {
            let pdfUrl = '';
            if (selectedFile) {
                try {
                    const formData = new FormData();
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
                    const finalName = `${timestamp} ${selectedSite.sNo} ${selectedOption.label}`;
                    formData.append('file', selectedFile);
                    formData.append('file_name', finalName);
                    const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
                        method: "POST",
                        body: formData,
                    });
                    if (!uploadResponse.ok) {
                        throw new Error('File upload failed');
                    }
                    const uploadResult = await uploadResponse.json();
                    pdfUrl = uploadResult.url;
                } catch (error) {
                    console.error('Error during file upload:', error);
                    alert('Error during file upload. Please try again.');
                    setIsSubmitting(false);
                    return;
                }
            }
            let vendor = '';
            let contractor = '';
            if (selectedType === 'Vendor') {
                vendor = selectedOption ? selectedOption.label : '';
            } else if (selectedType === 'Contractor') {
                contractor = selectedOption ? selectedOption.label : '';
            }
            const projectId = selectedSite ? selectedSite.id : null;
            const vendorId = selectedType === 'Vendor' && selectedOption ? (selectedOption.id || null) : null;
            const contractorId = selectedType === 'Contractor' && selectedOption ? (selectedOption.id || null) : null;
            const expensesPayload = {
                accountType: selectedAccountType,
                eno: eno,
                date: paymentModalData.date,
                siteName: selectedSite ? selectedSite.label : '',
                projectId: projectId,
                vendor: vendor,
                vendorId: vendorId,
                contractor: contractor,
                contractorId: contractorId,
                quantity: quantity,
                amount: parseInt(paymentModalData.amount),
                source: "Expenses Entry",
                category: selectedCategory ? selectedCategory.label : '',
                comments: comments,
                machineTools: selectedMachineTools ? selectedMachineTools.label : '',
                billCopyUrl: pdfUrl || '',
                paymentMode: paymentModalData.paymentMode,
                utilityType: utilityType || '',
                utilityTypeNumber: selectedEbNumber ? selectedEbNumber.label : '',
                utilityForTheMonth: selectedMonths || '',
                utilityValidityDays: thirdInput || ''
            };
            const expensesResponse = await fetch("https://backendaab.in/aabuilderDash/expenses_form/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(expensesPayload),
            });
            let expensesResult;
            let expensesId = null;
            let savedExpenseData = null;
            try {
                const responseText = await expensesResponse.text();
                if (!expensesResponse.ok) {
                    throw new Error(`Expenses form submission failed: ${responseText}`);
                }
                if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
                    expensesResult = JSON.parse(responseText);
                    expensesId = expensesResult.id || expensesResult.eno;
                    savedExpenseData = expensesResult;
                } else {
                    expensesResult = { message: responseText };
                    try {
                        const allFormsRes = await fetch("https://backendaab.in/aabuilderDash/expenses_form/get_form");
                        if (allFormsRes.ok) {
                            const allForms = await allFormsRes.json();
                            if (allForms.length > 0) {
                                let matchingForm = allForms.find(f =>
                                    f.eno === eno &&
                                    f.date === paymentModalData.date &&
                                    f.siteName === selectedSite.label
                                );
                                if (matchingForm) {
                                    expensesId = matchingForm.id;
                                    savedExpenseData = matchingForm;
                                } else {
                                    const recentFormWithEno = allForms
                                        .filter(f => f.eno === eno)
                                        .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))[0];
                                    if (recentFormWithEno) {
                                        expensesId = recentFormWithEno.id;
                                        savedExpenseData = recentFormWithEno;
                                    } else {
                                        const mostRecentForm = allForms
                                            .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))[0];
                                        if (mostRecentForm) {
                                            expensesId = mostRecentForm.id;
                                            savedExpenseData = mostRecentForm;
                                        }
                                    }
                                }
                            } else {
                                console.log('No expenses forms found in response');
                            }
                        } else {
                            console.error('Failed to fetch expenses forms:', allFormsRes.status, allFormsRes.statusText);
                        }
                    } catch (fetchError) {
                        console.error('Could not fetch expenses form ID:', fetchError);
                    }
                }
            } catch (parseError) {
                console.error('Response parsing error:', parseError);
                throw new Error('Failed to parse expenses form API response');
            }
            if (expensesId) {
                try {
                    const verifyResponse = await fetch(`https://backendaab.in/aabuilderDash/expenses_form/get_form`);
                    if (verifyResponse.ok) {
                        const allForms = await verifyResponse.json();
                        const savedForm = allForms.find(f => f.id === expensesId);
                    }
                } catch (verifyError) {
                    console.error('Could not verify saved data:', verifyError);
                }
            }
            const weeklyPaymentBillPayload = {
                date: paymentModalData.date,
                created_at: new Date().toISOString(),
                contractor_id: selectedOption?.type === 'Contractor' ? selectedOption.id : null,
                vendor_id: selectedOption?.type === 'Vendor' ? selectedOption.id : null,
                employee_id: null,
                project_id: selectedSite?.id || null,
                type: selectedAccountType === 'Claim' ? "Claim Payment" : "Utility Payment",
                bill_payment_mode: paymentModalData.paymentMode,
                amount: parseFloat(paymentModalData.amount),
                status: true,
                weekly_number: "",
                expenses_entry_id: expensesId,
                advance_portal_id: null,
                staff_advance_portal_id: null,
                claim_payment_id: null,
                cheque_number: paymentModalData.chequeNo || null,
                cheque_date: paymentModalData.chequeDate || null,
                transaction_number: paymentModalData.transactionNumber || null,
                account_number: paymentModalData.accountNumber || null
            };
            const weeklyResponse = await fetch('https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(weeklyPaymentBillPayload)
            });
            let weeklyResult;
            try {
                const responseText = await weeklyResponse.text();
                if (!weeklyResponse.ok) {
                    throw new Error(`Weekly payment bills submission failed: ${responseText}`);
                }
                if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
                    weeklyResult = JSON.parse(responseText);
                } else {
                    throw new Error(`Weekly payment bills API returned non-JSON response: ${responseText}`);
                }
            } catch (parseError) {
                console.error('Weekly payment bills response parsing error:', parseError);
                throw new Error('Failed to parse weekly payment bills API response');
            }
            toast.success(`${selectedAccountType} payment saved successfully and added to Weekly Payment Bills!`, {
                position: "top-center",
                autoClose: 3000,
                theme: "colored"
            });
            setEno(eno + 1);
            resetForm();
            setShowPaymentModal(false);
        } catch (error) {
            console.error('Error submitting data:', error);
            toast.error('Failed to save data!', {
                position: "top-center",
                autoClose: 3000,
                theme: "colored"
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleChangeAttachment = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const sortedSiteOptions = siteOptions.sort((a, b) =>
        a.label.localeCompare(b.label)
    );
    const formatDateForReview = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };
    const vendorOrContractorLabel = selectedOption ? `${selectedOption.label}${selectedType ? ` (${selectedType})` : ''}` : '';
    const formattedAmount = amount ? `${selectedAccountType === 'Bill Refund' ? '-' : ''}₹${formatNumber(Math.abs(amount))}` : '';
    const reviewDetails = [
        { label: 'Account Type', value: selectedAccountType || '-' },
        { label: 'Date', value: formatDateForReview(date) || '-' },
        { label: 'Project Name', value: selectedSite?.label || '-' },
        { label: 'Project Number', value: selectedSite?.sNo || '-' },
        { label: 'Vendor / Contractor', value: vendorOrContractorLabel || '-' },
    ];
    if (selectedType === 'Vendor' && selectedOption?.id) {
        reviewDetails.push({ label: 'Vendor ID', value: selectedOption.id });
    }
    if (selectedType === 'Contractor' && selectedOption?.id) {
        reviewDetails.push({ label: 'Contractor ID', value: selectedOption.id });
    }
    reviewDetails.push(
        { label: 'Quantity', value: quantity || '-' },
        { label: 'Amount', value: formattedAmount || '-' },
        { label: 'Category', value: selectedCategory?.label || '-' },
        { label: 'Payment Mode', value: paymentMode || '-' },
        { label: 'Utility Type', value: utilityType || '-' },
        { label: 'Utility Number', value: selectedEbNumber?.label || '-' },
        { label: 'Utility Months', value: selectedMonths || '-' },
        { label: 'Validity / Additional Info', value: thirdInput || '-' },
        { label: 'Comments', value: comments || '-' },
    );
    const isPdfPreview = selectedFile?.type?.toLowerCase().includes('pdf');
    useEffect(() => {
        const today = new Date();
        const formatted = today.toISOString().split('T')[0];
        setDate(formatted);
    }, []);
    return (
        <body className=' bg-[#FAF6ED]'>
            <style jsx>{`
                input:hover, select:hover {
                    border-color: rgba(191, 152, 83, 0.2) !important;
                }
                input:focus, select:focus {
                    border-color: rgba(191, 152, 83, 1) !important;
                    outline: none !important;
                }
            `}</style>
            <div className=" mx-auto p-6 bg-white rounded-lg shadow-lg lg:w-[1824px]">
                <form onSubmit={handleFormSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <div className="flex mb-4 items-center gap-4">
                                <h4 className="text-base font-semibold mb-2 text-[#E4572E]">Account Type <span className="text-red-500">*</span></h4>
                                <select className="h-[45px] border-2 border-[#BF9853] rounded-lg px-4 py-2 focus:outline-none border-opacity-[0.20] w-[182px]"
                                    value={selectedAccountType}
                                    onChange={(e) => {
                                        const selectedValue = e.target.value;
                                        setSelectedAccountType(selectedValue);
                                        const selectedOption = accountTypeOptions.find(option => option.value === selectedValue);
                                        if (selectedOption) {
                                            console.log("Selected ID:", selectedOption.id);
                                        }
                                    }}>
                                    <option value="" disabled>--- Select ---</option>
                                    {accountTypeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='text-left flex gap-4'>
                                <div>
                                    <label className="text-md font-semibold block mb-1">Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="border-2 border-[#BF9853] w-[168px] h-[45px] rounded-lg px-4 py-2 focus:outline-none border-opacity-[0.20]"
                                    />
                                </div>
                                {selectedAccountType === 'Utility Bills' && (
                                    <div className='text-left lg:ml-[145px] md:ml-[-70px]'>
                                        <h4 className="text-base font-semibold mb-2 ">Utility Type <span className="text-red-500">*</span></h4>
                                        <select
                                            className="h-[45px] border-2 border-[#BF9853] rounded-lg px-4 py-2 focus:outline-none border-opacity-[0.20] w-[182px]"
                                            value={utilityType}
                                            onChange={(e) => setUtilityType(e.target.value)}
                                        >
                                            <option value="" disabled>--- Select ---</option>
                                            <option value="Electricity">Electricity</option>
                                            <option value="Property">Property</option>
                                            <option value="Water">Water</option>
                                            <option value="Telecom">Telecom</option>
                                            <option value="Subscription">Subscription</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className='flex gap-10 mb-3'>
                                <div className='text-left'>
                                    <label className="text-md font-semibold mb-2  block">Project Name <span className="text-red-500">*</span></label>
                                    <Select
                                        options={sortedSiteOptions || []}
                                        placeholder="Select a site..."
                                        isSearchable={true}
                                        value={selectedSite}
                                        onChange={setSelectedSite}
                                        styles={customStyles}
                                        isClearable
                                        className="custom-select rounded-lg w-[290px] h-[45px]"
                                    />
                                </div>
                                <div className='text-left'>
                                    <div className='flex'>
                                        <label className="text-md font-semibold mb-2 block">Vendor/Contractor Name <span className="text-red-500">*</span></label>
                                        {selectedType && <span className="text-xs text-orange-600 font-semibold block ml-10 mt-3">{selectedType}</span>}
                                    </div>
                                    <Select
                                        options={combinedOptions}
                                        value={selectedOption}
                                        onChange={handleChange}
                                        placeholder="Select an Option..."
                                        styles={customStyles}
                                        isClearable
                                        className="custom-select rounded-lg w-[290px] h-[45px] "
                                    />
                                </div>
                            </div>
                            <div className='flex gap-10 mb-3'>
                                <div className='text-left'>
                                    <label className="text-md font-semibold mb-2 block">Quantity</label>
                                    <input
                                        type="text"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[290px] h-[45px] focus:outline-none border-opacity-[0.20]"
                                    />
                                </div>
                                <div className='text-left'>
                                    <label className="text-md font-semibold mb-2 block">Amount <span className="text-red-500">*</span></label>
                                    <div className="relative w-[290px] h-[45px]">
                                        <span className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-600 text-lg">₹</span>
                                        <input
                                            type="text"
                                            value={formatNumber(amount)}
                                            onChange={handleAmountChange}
                                            onWheel={(e) => e.target.blur()}
                                            className="pl-8 pr-4 border-2 border-[#BF9853] rounded-lg w-full h-full focus:outline-none border-opacity-[0.20]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='flex gap-10 mb-3'>
                                <div className={`text-left ${selectedAccountType === 'Claim' ? '' : ''}`}>
                                    <label className="text-md font-semibold mb-2 block">Category <span className="text-red-500">*</span></label>
                                    <Select
                                        options={categoryOptions}
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        styles={customStyles}
                                        isClearable
                                        placeholder="Select a category..."
                                        className="custom-select rounded-lg w-[290px] h-[45px]"
                                    />
                                </div>
                                {(selectedAccountType === 'Claim' || selectedAccountType === 'Utility Bills') && (
                                    <div className='text-left'>
                                        <label className="text-md font-semibold mb-2 block">Payment Mode <span className="text-red-500">*</span></label>
                                        <select
                                            value={paymentMode}
                                            onChange={(e) => setPaymentMode(e.target.value)}
                                            className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[290px] h-[43px] focus:outline-none border-opacity-[0.20]"
                                        >
                                            <option value="">Select Payment Mode</option>
                                            <option value="Cash">Cash</option>
                                            <option value="GPay">GPay</option>
                                            <option value="PhonePe">PhonePe</option>
                                            <option value="Net Banking">Net Banking</option>
                                            <option value="Cheque">Cheque</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            {selectedAccountType === 'Utility Bills' && (
                                <>
                                    <div className='flex gap-10 mb-3'>
                                        <div className='text-left'>
                                            <label className="text-md font-semibold mb-2 block">
                                                {utilityType === 'Electricity' ? 'EB Number' :
                                                    utilityType === 'Property' ? 'Property Tax Number' :
                                                        utilityType === 'Water' ? 'Water Tax Number' : 'Number'}
                                            </label>
                                            <Select
                                                options={ebNumberOptions}
                                                value={selectedEbNumber}
                                                onChange={setSelectedEbNumber}
                                                styles={customStyles}
                                                isClearable
                                                placeholder={`Select ${utilityType === 'Electricity' ? 'EB Number' :
                                                    utilityType === 'Property' ? 'Property Tax Number' :
                                                        utilityType === 'Water' ? 'Water Tax Number' : 'Number'}...`}
                                                className="custom-select rounded-lg w-[290px] h-[45px]"
                                            />
                                        </div>
                                        <div className='text-left'>
                                            <label className="text-md font-semibold mb-2 block">Months</label>
                                            <input
                                                type="month"
                                                value={selectedMonths}
                                                onChange={(e) => setSelectedMonths(e.target.value)}
                                                placeholder="Enter months..."
                                                className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[290px] h-[45px] focus:outline-none border-opacity-[0.20]"
                                            />
                                        </div>
                                    </div>
                                    {(utilityType === 'Telecom' || utilityType === 'Subscription') && (
                                        <div className='text-left'>
                                            <label className="text-md font-semibold mb-2 block">Additional Input</label>
                                            <input
                                                type="text"
                                                value={thirdInput}
                                                onChange={(e) => setThirdInput(e.target.value)}
                                                placeholder="Enter additional information..."
                                                className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[290px] h-[45px] focus:outline-none border-opacity-[0.20]"
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {showMachineTools && (
                            <div className='text-left lg:ml-[-570px]'>
                                <label className="text-md font-semibold mb-2 block">Item ID</label>
                                <Select
                                    options={machineToolsOptions}
                                    value={selectedMachineTools}
                                    onChange={setSelectedMachine}
                                    styles={customStyles}
                                    isClearable
                                    placeholder="Select a machine tool..."
                                    className="custom-select rounded-lg w-[290px] h-[45px]"
                                />
                            </div>
                        )}
                        <div className="md:col-span-2 text-left">
                            <label className="text-md font-semibold mb-2 block">Comments</label>
                            <input
                                type="text"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Enter Your Comments ..."
                                className="border-2 border-[#BF9853] rounded-md px-4 py-2 lg:w-[604px] w-80 h-[45px] focus:outline-none border-opacity-[0.20]"
                            />
                        </div>
                        <div className="md:col-span-2 items-center justify-between">
                            <div className='flex'>
                                <label htmlFor="fileInput" className="cursor-pointer flex items-center text-orange-600">
                                    <img className='w-5 h-4' alt='' src={Attach}></img>
                                    Attach file {(selectedAccountType === 'Utility Bills' || selectedAccountType === 'Bill Refund') && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                <input type="file" id="fileInput" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,image/*,application/pdf" />
                            </div>
                            {selectedFile && <span className="text-gray-600 lg:-ml-[84rem] -ml-48">{selectedFile.name}</span>}
                        </div>
                        <div className="flex ">
                            {userPermissions.includes("Create") && (
                                <button type='submit' disabled={isSubmitting}
                                    className={`bg-yellow-700 text-white px-6 py-2 rounded-md hover:bg-yellow-600 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />
            {showReviewModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white text-left rounded-xl p-6 w-[1400px] h-[680px] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Review Submission</h3>
                            <button onClick={handleReviewClose} className="text-2xl font-bold text-gray-400 hover:text-gray-700">
                                ×
                            </button>
                        </div>
                        <div className="flex flex-1 gap-6 overflow-hidden">
                            <div className="flex-[0.40] flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-base font-semibold text-gray-700">Expense Details</h4>
                                    <button
                                        type="button"
                                        onClick={() => setIsReviewEditMode((prev) => !prev)}
                                        className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg hover:bg-[#FFF8EE]"
                                    >
                                        {isReviewEditMode ? 'Cancel Edit' : 'Edit'}
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-4">
                                    {isReviewEditMode ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">Account Type</label>
                                                <select
                                                    className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                    value={selectedAccountType}
                                                    onChange={(e) => {
                                                        const selectedValue = e.target.value;
                                                        setSelectedAccountType(selectedValue);
                                                        const selectedOption = accountTypeOptions.find(option => option.value === selectedValue);
                                                        if (selectedOption) {
                                                            console.log("Selected ID:", selectedOption.id);
                                                        }
                                                    }}
                                                >
                                                    <option value="" disabled>--- Select ---</option>
                                                    {accountTypeOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">Date</label>
                                                <input
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">Project Name</label>
                                                <Select
                                                    options={sortedSiteOptions || []}
                                                    placeholder="Select a site..."
                                                    isSearchable
                                                    value={selectedSite}
                                                    onChange={setSelectedSite}
                                                    styles={customStyles}
                                                    isClearable
                                                    className="custom-select rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">Vendor / Contractor</label>
                                                <Select
                                                    options={combinedOptions}
                                                    value={selectedOption}
                                                    onChange={handleChange}
                                                    placeholder="Select an Option..."
                                                    styles={customStyles}
                                                    isClearable
                                                    className="custom-select rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">Quantity</label>
                                                <input
                                                    type="text"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(e.target.value)}
                                                    className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">Amount</label>
                                                <div className="relative">
                                                    <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-600">₹</span>
                                                    <input
                                                        type="text"
                                                        value={formatNumber(amount)}
                                                        onChange={handleAmountChange}
                                                        className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg pl-7 pr-3 border-opacity-20"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">Category</label>
                                                <Select
                                                    options={categoryOptions}
                                                    value={selectedCategory}
                                                    onChange={handleCategoryChange}
                                                    styles={customStyles}
                                                    isClearable
                                                    placeholder="Select a category..."
                                                    className="custom-select rounded-lg"
                                                />
                                            </div>
                                            {(selectedAccountType === 'Claim' || selectedAccountType === 'Utility Bills') && (
                                                <div>
                                                    <label className="text-sm font-semibold mb-1 block">Payment Mode</label>
                                                    <select
                                                        value={paymentMode}
                                                        onChange={(e) => setPaymentMode(e.target.value)}
                                                        className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                    >
                                                        <option value="">Select Payment Mode</option>
                                                        <option value="Cash">Cash</option>
                                                        <option value="GPay">GPay</option>
                                                        <option value="PhonePe">PhonePe</option>
                                                        <option value="Net Banking">Net Banking</option>
                                                        <option value="Cheque">Cheque</option>
                                                    </select>
                                                </div>
                                            )}
                                            {selectedAccountType === 'Utility Bills' && (
                                                <>
                                                    <div>
                                                        <label className="text-sm font-semibold mb-1 block">Utility Type</label>
                                                        <select
                                                            value={utilityType}
                                                            onChange={(e) => setUtilityType(e.target.value)}
                                                            className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                        >
                                                            <option value="" disabled>--- Select ---</option>
                                                            <option value="Electricity">Electricity</option>
                                                            <option value="Property">Property</option>
                                                            <option value="Water">Water</option>
                                                            <option value="Telecom">Telecom</option>
                                                            <option value="Subscription">Subscription</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-semibold mb-1 block">
                                                            {utilityType === 'Electricity' ? 'EB Number' :
                                                                utilityType === 'Property' ? 'Property Tax Number' :
                                                                    utilityType === 'Water' ? 'Water Tax Number' : 'Number'}
                                                        </label>
                                                        <Select
                                                            options={ebNumberOptions}
                                                            value={selectedEbNumber}
                                                            onChange={setSelectedEbNumber}
                                                            styles={customStyles}
                                                            isClearable
                                                            placeholder="Select number..."
                                                            className="custom-select rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-semibold mb-1 block">Months</label>
                                                        <input
                                                            type="month"
                                                            value={selectedMonths}
                                                            onChange={(e) => setSelectedMonths(e.target.value)}
                                                            className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                        />
                                                    </div>
                                                    {(utilityType === 'Telecom' || utilityType === 'Subscription') && (
                                                        <div>
                                                            <label className="text-sm font-semibold mb-1 block">Additional Input</label>
                                                            <input
                                                                type="text"
                                                                value={thirdInput}
                                                                onChange={(e) => setThirdInput(e.target.value)}
                                                                className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            <div className="col-span-2">
                                                <label className="text-sm font-semibold mb-1 block">Comments</label>
                                                <input
                                                    type="text"
                                                    value={comments}
                                                    onChange={(e) => setComments(e.target.value)}
                                                    className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {reviewDetails.map((detail) => renderReviewRow(detail.label, detail.value))}
                                        </div>
                                    )}
                                </div>
                                {isReviewEditMode && (
                                    <div className="flex justify-end gap-3 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsReviewEditMode(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReviewSave}
                                            className="px-4 py-2 bg-[#BF9853] text-white rounded-lg"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="w-px bg-gray-200"></div>
                            <div className="flex-[0.65] flex flex-col">
                                <h4 className="text-base font-semibold text-gray-700 mb-3"> Preview</h4>
                                <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                                    {filePreviewUrl ? (
                                        isPdfPreview ? (
                                            <iframe
                                                src={`${filePreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                                title="Attachment preview"
                                                className="w-full h-full rounded-lg border-none "
                                            />
                                        ) : (
                                            <img src={filePreviewUrl} alt="Attachment preview" className="w-full h-full object-contain" />
                                        )
                                    ) : (
                                        <p className="text-sm text-gray-500">No file selected</p>
                                    )}
                                </div>
                                {selectedFile && (
                                    <p className="text-xs text-gray-500 mt-2 break-words">{selectedFile.name}</p>
                                )}
                                <button
                                    type="button"
                                    onClick={handleChangeAttachment}
                                    className="mt-4 px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg hover:bg-[#FFF8EE]"
                                >
                                    Change Attachfile
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={handleReviewClose}
                                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handleReviewConfirm}
                                disabled={isSubmitting || isReviewEditMode}
                                className={`px-4 py-2 rounded-lg text-white ${isSubmitting || isReviewEditMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#BF9853]'}`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPaymentModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white text-left rounded-xl p-6 w-[800px] h-[600px] overflow-y-auto flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 text-center">Payment Details</h3>
                        <div className="flex-1 overflow-hidden">
                            <div className="space-y-4 mb-4">
                                <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                            <input
                                                type="date"
                                                value={paymentModalData.date}
                                                onChange={(e) => setPaymentModalData(prev => ({ ...prev, date: e.target.value }))}
                                                readOnly
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none bg-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                            <input
                                                type="number"
                                                value={paymentModalData.amount}
                                                readOnly
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                                            <input
                                                type="text"
                                                value={paymentModalData.paymentMode}
                                                readOnly
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {(paymentModalData.paymentMode === "GPay" || paymentModalData.paymentMode === "PhonePe" ||
                                    paymentModalData.paymentMode === "Net Banking" || paymentModalData.paymentMode === "Cheque") && (
                                        <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                                            <div className="space-y-4">
                                                {paymentModalData.paymentMode === "Cheque" && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No<span className="text-red-500">*</span></label>
                                                            <input
                                                                type="text"
                                                                value={paymentModalData.chequeNo}
                                                                onChange={(e) => setPaymentModalData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                                                placeholder="Enter cheque number"
                                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date<span className="text-red-500">*</span></label>
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
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number<span className="text-red-500">*</span></label>
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
                        <div className="flex justify-end gap-3 mt-6 p-4 bg-white">
                            <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg">
                                Cancel
                            </button>
                            <button onClick={handlePaymentSubmit} disabled={isSubmitting} className="px-4 py-2 bg-[#BF9853] text-white rounded-lg disabled:bg-gray-400">
                                {isSubmitting ? 'Saving...' : 'Submit'}
                            </button>
                        </div>
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-black">
                            ×
                        </button>
                    </div>
                </div>
            )}
        </body>
    );
};
export default Form;
const customStyles = {
    control: (provided, state) => ({
        ...provided,
        borderWidth: '2px',
        borderRadius: '8px',
        borderColor: state.isFocused ? 'rgba(191, 152, 83, 1)' : 'rgba(191, 152, 83, 0.2)',
        boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.2)' : 'none',
        '&:hover': {
            borderColor: 'rgba(191, 152, 83, 0.2)',
        }
    }),
};