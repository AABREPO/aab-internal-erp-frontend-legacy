import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Attach from '../Images/Attachfile.svg';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);
    const handleChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        if (selectedOption) {
            setSelectedType(selectedOption.type);
        } else {
            setSelectedType("");
        }
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
        // This ensures the input is cleared even if the same file is selected again next time
        e.target.value = '';
    };
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
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!date || !selectedSite || !amount || !selectedCategory || !selectedOption) {
            alert('Please fill out all required fields.');
            return;
        }
        if (selectedAccountType === 'Claim' && !paymentMode) {
            alert('Please select a payment mode for Claim account type.');
            return;
        }
        // Check if payment mode requires popup details for Claim account type
        if (selectedAccountType === 'Claim' && ["GPay", "PhonePe", "Net Banking", "Cheque"].includes(paymentMode)) {
            // Set up payment modal data and show popup
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
            return; // Don't proceed with normal submission
        }

        setIsSubmitting(true);
        try {
            if (selectedAccountType !== 'Daily Wage' && !selectedFile) {
                alert('PDF file is required for this type.');
                setIsSubmitting(false);
                return;
            }
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
                    const finalName = `${formatDateOnly(date)} ${selectedSite.sNo} ${vendor || contractor}`;
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
                    console.log('File URL:', pdfUrl);
                } catch (error) {
                    console.error('Error during file upload:', error);
                    alert('Error during file upload. Please try again.');
                    setIsSubmitting(false);
                    return;
                }
            }
            const bodyData = {
                accountType: selectedAccountType,
                eno: eno,
                date: date,
                siteName: selectedSite ? selectedSite.label : '',
                vendor: vendor,
                contractor: contractor,
                quantity: quantity,
                amount: parseInt(amount),
                category: selectedCategory ? selectedCategory.label : '',
                comments: comments,
                machineTools: selectedMachineTools ? selectedMachineTools.label : '',
                billCopyUrl: pdfUrl || ''
            };
            const formResponse = await fetch("https://backendaab.in/aabuilderDash/expenses_form/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyData),
            });
            if (!formResponse.ok) {
                const errorText = await formResponse.text();
                throw new Error(`Form submission failed: ${errorText}`);
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
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePaymentSubmit = async () => {
        if (!paymentModalData.transactionNumber && paymentModalData.paymentMode !== "Cash") {
            alert("Please enter transaction number.");
            return;
        }
        if (!paymentModalData.accountNumber && paymentModalData.paymentMode !== "Cash") {
            alert("Please select account number.");
            return;
        }
        if (paymentModalData.paymentMode === "Cheque" && (!paymentModalData.chequeNo || !paymentModalData.chequeDate)) {
            alert("Please enter cheque number and date.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload file if exists
            let pdfUrl = '';
            if (selectedFile) {
                try {
                    const formData = new FormData();
                    const finalName = `${formatDateOnly(paymentModalData.date)} ${selectedSite.sNo} ${selectedOption.label}`;
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
            // Create expenses form payload
            const expensesPayload = {
                accountType: selectedAccountType,
                eno: eno,
                date: paymentModalData.date,
                siteName: selectedSite ? selectedSite.label : '',
                vendor: vendor,
                contractor: contractor,
                quantity: quantity,
                amount: parseInt(paymentModalData.amount),
                category: selectedCategory ? selectedCategory.label : '',
                comments: comments,
                machineTools: selectedMachineTools ? selectedMachineTools.label : '',
                billCopyUrl: pdfUrl || ''
            };
            // Save to expenses form
            const expensesResponse = await fetch("https://backendaab.in/aabuilderDash/expenses_form/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(expensesPayload),
            });

            if (!expensesResponse.ok) {
                const errorText = await expensesResponse.text();
                throw new Error(`Expenses form submission failed: ${errorText}`);
            }

            let expensesResult;
            let expensesId = null;

            try {
                const responseText = await expensesResponse.text();
                console.log('Expenses API response:', responseText);

                if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
                    expensesResult = JSON.parse(responseText);
                    expensesId = expensesResult.id || expensesResult.eno;
                } else {
                    // Handle plain text success response
                    console.log('Expenses form submitted successfully (plain text response)');
                    expensesResult = { message: responseText };

                    // Fetch the latest expenses form to get the ID
                    try {
                        const allFormsRes = await fetch("https://backendaab.in/aabuilderDash/expenses_form/get_form");
                        if (allFormsRes.ok) {
                            const allForms = await allFormsRes.json();
                            console.log('All expenses forms:', allForms);
                            console.log('Looking for form with:', {
                                eno: eno,
                                date: paymentModalData.date,
                                siteName: selectedSite.label
                            });

                            if (allForms.length > 0) {
                                // Get the most recent form that matches our criteria
                                let matchingForm = allForms.find(f =>
                                    f.eno === eno &&
                                    f.date === paymentModalData.date &&
                                    f.siteName === selectedSite.label
                                );

                                console.log('Matching form found:', matchingForm);

                                if (matchingForm) {
                                    expensesId = matchingForm.id; // Use the primary key id from the entity (lowercase)
                                    console.log('Found expenses form ID:', expensesId);
                                } else {
                                    console.log('No exact matching form found. Available forms:', allForms.map(f => ({
                                        ENo: f.eno,
                                        date: f.date,
                                        siteName: f.siteName,
                                        id: f.id
                                    })));

                                    // Fallback: Get the most recent form with matching ENo
                                    const recentFormWithEno = allForms
                                        .filter(f => f.eno === eno)
                                        .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))[0];

                                    if (recentFormWithEno) {
                                        expensesId = recentFormWithEno.id;
                                        console.log('Using most recent form with ENo:', expensesId, recentFormWithEno);
                                    } else {
                                        // Last fallback: Get the most recent form overall
                                        const mostRecentForm = allForms
                                            .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))[0];

                                        if (mostRecentForm) {
                                            expensesId = mostRecentForm.id;
                                            console.log('Using most recent form overall:', expensesId, mostRecentForm);
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

            // Create weekly payment bills payload
            const weeklyPaymentBillPayload = {
                date: paymentModalData.date,
                created_at: new Date().toISOString(),
                contractor_id: selectedOption?.type === 'Contractor' ? selectedOption.id : null,
                vendor_id: selectedOption?.type === 'Vendor' ? selectedOption.id : null,
                employee_id: null,
                project_id: selectedSite?.id || null,
                type: "Claim Payment",
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
            // Save to weekly payment bills
            const weeklyResponse = await fetch('https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(weeklyPaymentBillPayload)
            });
            if (!weeklyResponse.ok) {
                const errorText = await weeklyResponse.text();
                throw new Error(`Weekly payment bills submission failed: ${errorText}`);
            }
            let weeklyResult;
            try {
                const responseText = await weeklyResponse.text();
                console.log('Weekly payment bills API response:', responseText);

                if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
                    weeklyResult = JSON.parse(responseText);
                } else {
                    console.error('Non-JSON response from weekly payment bills:', responseText);
                    throw new Error(`Weekly payment bills API returned non-JSON response: ${responseText}`);
                }
            } catch (parseError) {
                console.error('Weekly payment bills response parsing error:', parseError);
                throw new Error('Failed to parse weekly payment bills API response');
            }
            toast.success('Claim payment saved successfully and added to Weekly Payment Bills!', {
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
    const sortedSiteOptions = siteOptions.sort((a, b) =>
        a.label.localeCompare(b.label)
    );
    useEffect(() => {
        const today = new Date();
        const formatted = today.toISOString().split('T')[0];
        setDate(formatted);
    }, []);
    return (
        <body className=' bg-[#FAF6ED]'>
            <div className=" mx-auto p-6 bg-white rounded-lg shadow-lg lg:w-[1824px]">
                <form onSubmit={handleUpload}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <div className="flex mb-4 items-center gap-4">
                                <h4 className="text-base font-semibold mb-2 text-[#E4572E]">Account Type <span className="text-red-500">*</span></h4>
                                <select className="h-[45px] border-2 border-[#BF9853] rounded-lg px-4 py-2 focus:outline-none border-opacity-[0.20] w-[182px]"
                                    value={selectedAccountType}
                                    onChange={(e) => {
                                        const selectedValue = e.target.value;
                                        setSelectedAccountType(selectedValue);
                                        // Find the selected option object
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
                            <div className='text-left'>
                                <label className="text-md font-semibold block mb-1">Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="border-2 border-[#BF9853] w-[168px] h-[45px] rounded-lg px-4 py-2 focus:outline-none border-opacity-[0.20]"
                                />
                            </div>
                        </div>
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
                        <div className='text-left lg:ml-[-570px] md:ml-[-70px]'>
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
                        <div className='text-left'>
                            <label className="text-md font-semibold mb-2 block">Quantity</label>
                            <input
                                type="text"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[290px] h-[45px] focus:outline-none border-opacity-[0.20]"
                            />
                        </div>
                        <div className='text-left lg:ml-[-570px] md:ml-[-70px]'>
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
                        <div className='flex gap-10'>
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
                            {selectedAccountType === 'Claim' && (
                                <div className='text-left'>
                                    <label className="text-md font-semibold mb-2 block">Payment Mode <span className="text-red-500">*</span></label>
                                    <select
                                        value={paymentMode}
                                        onChange={(e) => setPaymentMode(e.target.value)}
                                        className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[290px] h-[43px] focus:outline-none border-opacity-[0.20]"
                                    >
                                        <option value="">Select Payment Mode</option>
                                        <option value="GPay">GPay</option>
                                        <option value="PhonePe">PhonePe</option>
                                        <option value="Net Banking">Net Banking</option>
                                        <option value="Cheque">Cheque</option>
                                    </select>
                                </div>
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
                                    Attach file
                                </label>
                                <input type="file" id="fileInput" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                            </div>
                            {selectedFile && <span className="text-gray-600 lg:-ml-[94rem] -ml-40">{selectedFile.name}</span>}
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
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number<span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={paymentModalData.transactionNumber}
                                                            onChange={(e) => setPaymentModalData(prev => ({ ...prev, transactionNumber: e.target.value }))}
                                                            placeholder="Enter transaction number"
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
                                                            <option value="2027887700014">2027887700014</option>
                                                            <option value="2027887700015">2027887700015</option>
                                                            <option value="2027887700016">2027887700016</option>
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
            borderColor: 'rgba(191, 152, 83, 0.5)',
        }
    }),
};