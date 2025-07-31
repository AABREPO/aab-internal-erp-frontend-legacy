import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Attach from '../Images/Attachfile.svg';
import axios from "axios";
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
    console.log(selectedAccountType);
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
        if (!date || !selectedSite || !amount || !selectedCategory) {
            alert('Please fill out all required fields.');
            return;
        }
        setIsSubmitting(true);
        try {
            if (selectedAccountType === 'Bill Payment' && !selectedFile) {
                alert('PDF file is required for Bill Payment.');
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
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
                                <h4 className="text-base font-semibold mb-2 text-[#E4572E]">Account Type</h4>
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
                                <label className="text-md font-semibold block mb-1">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="border-2 border-[#BF9853] w-[168px] h-[45px] rounded-lg px-4 py-2 focus:outline-none border-opacity-[0.20]"
                                />
                            </div>
                        </div>
                        <div className='text-left'>
                            <label className="text-md font-semibold mb-2  block">Project Name</label>
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
                                <label className="text-md font-semibold mb-2 block">Vendor/Contractor Name</label>
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
                            <label className="text-md font-semibold mb-2 block">Amount</label>
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
                        <div className='text-left'>
                            <label className="text-md font-semibold mb-2 block">Category</label>
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
                                <button
                                    type='submit'
                                    disabled={isSubmitting}
                                    className={`bg-yellow-700 text-white px-6 py-2 rounded-md hover:bg-yellow-600 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
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