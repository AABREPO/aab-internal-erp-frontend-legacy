import React, { useState, useRef, useEffect } from "react";
import Attach from '../Images/Attachfile.svg';
import Select from 'react-select';
import Swal from 'sweetalert2';
import axios from 'axios';
const Form = () => {
    const [selectedType, setSelectedType] = useState("Rent");
    const getPreviousMonth = () => {
        const now = new Date();
        now.setMonth(now.getMonth() - 1); // go to previous month
        return now.toISOString().slice(0, 7); // format YYYY-MM
    };
    const [startingDate, setStartingDate] = useState('');
    const [calculatedRent, setCalculatedRent] = useState('');
    const [properties, setProperties] = useState([]);
    const [tenantName, setTenantName] = useState('');
    const [shopNo, setShopNo] = useState('');
    const [tenantOptions, setTenantOptions] = useState([]);
    const [tenantShopData, setTenantShopData] = useState([]);
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [shopNoOptions, setShopNoOptions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(getPreviousMonth());
    const [amount, setAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState("");
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [filteredShopNoOptions, setFilteredShopNoOptions] = useState(shopNoOptions);

    const handleFileChanges = (e) => {
        setFile(e.target.files[0]);
        setUploadStatus('');
    };
    const [paidOnDate, setPaidOnDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // "YYYY-MM-DD"
    });
    const [selectedRentFile, setSelectedRentFile] = useState(null);
    const fileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentModeOptions, setPaymentModeOptions] = useState([]);
    useEffect(() => {
        const savedSelectedType = sessionStorage.getItem('selectedType');
        const savedShopNo = sessionStorage.getItem('shopNo')
        const savedSelectedMonth = sessionStorage.getItem('selectedMonth');
        const savedTenantName = sessionStorage.getItem('tenantName');
        const savedAmount = sessionStorage.getItem('amount');
        const savedPaidOnDate = sessionStorage.getItem('paidOnDate');
        const savedPaymentMode = sessionStorage.getItem('paymentMode')
        try {
            if (savedSelectedType) setSelectedType(JSON.parse(savedSelectedType));
            if (savedSelectedMonth) setSelectedMonth(JSON.parse(savedSelectedMonth));
            if (savedShopNo) setShopNo(JSON.parse(savedShopNo));
            if (savedTenantName) setTenantName(JSON.parse(savedTenantName));
            if (savedAmount) setAmount(JSON.parse(savedAmount));
            if (savedPaymentMode) setPaymentMode(JSON.parse(savedPaymentMode));
            if (savedPaidOnDate) setPaidOnDate(JSON.parse(savedPaidOnDate));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('selectedType');
        sessionStorage.removeItem('shopNo');
        sessionStorage.removeItem('selectedMonth');
        sessionStorage.removeItem('tenantName');
        sessionStorage.removeItem('amount');
        sessionStorage.removeItem('paidOnDate');
        sessionStorage.removeItem('paymentMode')
    };
    useEffect(() => {
        if (selectedType) sessionStorage.setItem('selectedType', JSON.stringify(selectedType));
        if (shopNo) sessionStorage.setItem('shopNo', JSON.stringify(shopNo));
        if (selectedMonth) sessionStorage.setItem('selectedMonth', JSON.stringify(selectedMonth));
        if (tenantName) sessionStorage.setItem('tenantName', JSON.stringify(tenantName));
        if (amount) sessionStorage.setItem('amount', JSON.stringify(amount));
        if (paidOnDate) sessionStorage.setItem('paidOnDate', JSON.stringify(paidOnDate));
        if (paymentMode) sessionStorage.setItem('paymentMode', JSON.stringify(paymentMode));
    }, [selectedType, shopNo, selectedMonth, tenantName, amount, paidOnDate, paymentMode]);
    const [message, setMessage] = useState('');
    const [eno, setEno] = useState(null);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedRentFile(file);
        }
        // This ensures the input is cleared even if the same file is selected again next time
        e.target.value = '';
    };
    useEffect(() => {
        fetchProperties();
    }, []);
    const fetchProperties = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/properties/all');
            if (response.ok) {
                const data = await response.json();
                setProperties(data);
                setMessage('Error fetching properties.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching properties.');
        }
    };
    useEffect(() => {
        fetchTenants();
    }, []);
    const fetchTenants = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/tenantShop/getAll');
            if (response.ok) {
                const data = await response.json();
                setTenantShopData(data);
                // Filter active tenants only
                const activeTenants = data.filter(t =>
                    t.property?.some(p =>
                        p.shops?.some(shop => shop.active)
                    )
                );
                // Step 2: Map all active tenant-shop combinations
                const options = activeTenants.flatMap(t =>
                    t.property.flatMap(p =>
                        p.shops
                            .filter(shop => shop.active)
                            .map(shop => ({
                                label: t.tenantName,
                                value: t.tenantName,
                                tenantId: t.id,
                                shopNo: shop.shopNo
                            }))
                    )
                );
                const tenantOptionsUnique = options.filter(
                    (t, i, arr) => t.label && arr.findIndex(x => x.value === t.value) === i
                );
                setTenantOptions(tenantOptionsUnique);
                const uniqueShopNos = [...new Set(options.map(o => o.shopNo).filter(Boolean))];
                const shopOptions = uniqueShopNos.map(no => ({ label: no, value: no }));
                setShopNoOptions(shopOptions);
            } else {
                setMessage('Error fetching tenants.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching properties.');
        }
    };
    const shopInfoMap = {};
    tenantShopData.forEach(tenant => {
        tenant.property?.forEach(property => {
            property.shops?.forEach(shop => {
                if (shop.shopNo) {
                    shopInfoMap[shop.shopNo] = {
                        doorNo: shop.doorNo || '',
                        propertyName: property.propertyName || '',
                        advanceAmount: shop.advanceAmount || '',
                        monthlyRent: shop.monthlyRent || '',
                        startingDate: shop.startingDate
                    };
                }
            });
        });
    });
    const formatINR = (value) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (!numericValue) return '';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(Number(numericValue));
    };
    const fetchLatestEno = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/rental_forms/getAll');
            if (!response.ok) {
                throw new Error('Failed to fetch ENo');
            }
            const data = await response.json();
            if (data.length > 0) {
                const sortedData = data.sort((a, b) => b.eno - a.eno);
                const lastEno = sortedData[0].eno;
                setEno(lastEno + 1);
            } else {
                setEno(1);
            }
        } catch (error) {
            console.error('Error fetching latest ENo:', error);
        }
    };
    useEffect(() => {
        fetchLatestEno();
    }, []);
    useEffect(() => {
        fetchPaymentModes();
    }, []);
    const fetchPaymentModes = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/payment_mode/getAll');
            if (response.ok) {
                const data = await response.json();
                setPaymentModeOptions(data);
            } else {
                setMessage('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching tile area names.');
        }
    };
    const handleSubmit = async () => {
        setIsSubmitting(true);
        const today = new Date();
        const day = today.getDate();
        const month = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();
        const getOrdinal = (n) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        const date = `${month} ${getOrdinal(day)} ${year}`;
        try {
            const rentFormsRes = await fetch("https://backendaab.in/aabuildersDash/api/rental_forms/getAll");
            if (!rentFormsRes.ok) throw new Error("Failed to fetch existing rent forms");
            const rentForms = await rentFormsRes.json();
            let pdfUrl = '';
            if (selectedRentFile) {
                const formData = new FormData();
                formData.append('pdf', selectedRentFile);
                formData.append('filename', `${date} `);
                const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/rentForm/googleUploader/uploadToGoogleDrive", {
                    method: "POST",
                    body: formData,
                });
                if (!uploadResponse.ok) throw new Error('File upload failed');
                const uploadResult = await uploadResponse.json();
                pdfUrl = uploadResult.url;
            }
            const tenantInfo = shopInfoMap[shopNo];
            const baseMonthlyRent = parseFloat(calculatedRent || 0);
            // 🧼 Clean and parse amount
            const isStartingMonth = (dateObj) => {
                const start = new Date(startingDate);
                return (
                    dateObj.getFullYear() === start.getFullYear() &&
                    dateObj.getMonth() === start.getMonth()
                );
            };

            const cleanedAmount = parseFloat((amount || "").replace(/[^0-9.]/g, ""));
            let remainingAmount = isNaN(cleanedAmount) ? 0 : cleanedAmount;

            const submissions = [];

            if (selectedType === "Rent" && baseMonthlyRent > 0) {
                let currentDate = new Date(selectedMonth);

                while (remainingAmount > 0) {
                    const currentMonthStr = currentDate.toISOString().slice(0, 7);
                    const existingEntries = rentForms.filter(
                        r => r.formType === "Rent" && r.shopNo === shopNo && r.forTheMonthOf === currentMonthStr
                    );
                    const alreadyPaid = existingEntries.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

                    let applicableRent = isStartingMonth(currentDate)
                        ? parseFloat(calculatedRent || 0)
                        : baseMonthlyRent;

                    const dueThisMonth = applicableRent - alreadyPaid;

                    if (dueThisMonth <= 0) {
                        Swal.fire({
                            icon: 'info',
                            title: 'Rent Already Paid',
                            text: `Rent is already fully paid for ${currentMonthStr}. Please change the month.`,
                            confirmButtonColor: '#bf9853'
                        });
                        setIsSubmitting(false);
                        return;
                    }

                    const amountToPay = Math.min(remainingAmount, dueThisMonth);

                    const rentalForm = {
                        formType: "Rent",
                        shopNo,
                        eno,
                        tenantName,
                        amount: amountToPay,
                        refundAmount: "",
                        paymentMode,
                        paidOnDate,
                        forTheMonthOf: currentMonthStr,
                        attachedFile: pdfUrl,
                    };

                    submissions.push(rentalForm);
                    remainingAmount -= amountToPay;
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }

            } else {
                const isClosure = selectedType === "Shop Closure";
                const form = {
                    formType: selectedType,
                    shopNo,
                    eno,
                    tenantName,
                    amount: isClosure ? "" : cleanedAmount,
                    refundAmount: isClosure ? cleanedAmount : "",
                    paymentMode,
                    paidOnDate,
                    forTheMonthOf: selectedType === "Rent" ? selectedMonth : "",
                    attachedFile: pdfUrl,
                };
                submissions.push(form);
            }
            for (const form of submissions) {
                const response = await fetch("https://backendaab.in/aabuildersDash/api/rental_forms/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
                if (!response.ok) {
                    console.error("❌ Submission failed for:", form);
                    throw new Error("Form submission failed");
                } else {
                    console.log("✅ Form submitted:", form);
                }
            }
            if (selectedType === "Shop Closure") {
                try {
                    await vacateShop(selectedTenantId, shopNo);
                } catch (err) {
                    console.error("❌ VacateShop failed", err);
                }
            }
            setIsSubmitting(false);
            setShopNo('');
            setTenantName('');
            setSelectedTenantId('');
            setAmount('');
            setPaymentMode('');
            setPaidOnDate('');
            window.location.reload();
        } catch (error) {
            console.error("❌ Error submitting form:", error);
            alert("Unexpected error occurred.");
            setIsSubmitting(false);
        }
    };
    const vacateShop = async (tenantId, shopNo) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/tenantShop/vacateShop/${tenantId}/${shopNo}`, {
                method: 'PUT',
            });
            if (!response.ok) {
                throw new Error('Failed to vacate shop');
            }
            const result = await response.text();
            alert(result);
            window.location.reload(); // optional: reload to fetch updated data
        } catch (error) {
            console.error('Vacate error:', error);
            alert('Failed to vacate shop');
        }
    };
    useEffect(() => {
        if (!startingDate || !selectedMonth || selectedType !== "Rent") return;
        const start = new Date(startingDate);
        const [year, month] = selectedMonth.split('-').map(Number);
        const selected = new Date(year, month - 1); // month is 0-indexed
        // If selected month is before the starting month, rent is 0
        if (
            selected.getFullYear() < start.getFullYear() ||
            (selected.getFullYear() === start.getFullYear() && selected.getMonth() < start.getMonth())
        ) {
            setCalculatedRent("0");
            return;
        }
        // If selected month is the same as starting month, calculate pro-rated rent
        if (start.getFullYear() === selected.getFullYear() && start.getMonth() === selected.getMonth()) {
            const totalDays = new Date(year, month, 0).getDate();
            const startDay = start.getDate();
            const rentPerDay = parseFloat(shopInfoMap[shopNo]?.monthlyRent || 0) / totalDays;
            const proRatedDays = totalDays - startDay + 1;
            const rawRent = rentPerDay * proRatedDays;
            const proRatedRent = Math.floor(rawRent / 10) * 10; // round down to nearest 10
            setCalculatedRent(proRatedRent.toString());
        } else {
            // For later months, show full rent
            setCalculatedRent(shopInfoMap[shopNo]?.monthlyRent || '');
        }
    }, [selectedMonth, startingDate, selectedType, shopNo]);

    useEffect(() => {
        if (selectedType === "Rent" && calculatedRent) {
            setAmount(calculatedRent.toString());
        }
    }, [selectedType, calculatedRent]);
    const handleSubmitOldData = async (e) => {
        e.preventDefault();

        if (!file) {
            setUploadStatus('Please select a CSV file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('https://backendaab.in/aabuildersDash/api/rental_forms/upload_old_data', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadStatus(response.data);
            console.log(response);
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('Failed to upload file. Please try again.');
        }
    };
    useEffect(() => {
    if (tenantName) {
        const tenant = tenantShopData.find(t => t.tenantName === tenantName);
        const shops = tenant?.property?.flatMap(p => p.shops)?.filter(shop => shop.active) || [];

        const filtered = shops.map(shop => ({
            label: shop.shopNo,
            value: shop.shopNo,
        }));

        setFilteredShopNoOptions(filtered);
    } else {
        setFilteredShopNoOptions(shopNoOptions);
    }
}, [tenantName, tenantShopData, shopNoOptions]); // ✅ Added shopNoOptions


    return (
        <div className="p-6 bg-[#FFFFFF] lg:w-[1800px] w-[400px] ml-12 text-left pl-8">
            <div className="flex">
                <div>
                    <h2 className="text-[#E4572E] font-bold mb-2 text-base">Select Type</h2>
                    <select className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 mt-1 w-[170px] h-[45px]"
                        value={selectedType} onChange={(e) => setSelectedType(e.target.value)} >
                        <option value="Rent">Rent</option>
                        <option value="Advance">Advance</option>
                        <option value="Shop Closure">Shop Closure</option>
                        <option value="Pending Rent">Pending Rent</option>
                    </select>
                </div>
                <span className="text-right ml-4 text-[#E4572E]">ENO:{eno}</span>
            </div>
            <div className="mt-4 lg:flex gap-8">
                <div className="mt-4">
                    <label className="block font-semibold mb-2">Shop No</label>
                    <Select
                        name="shopNo"
                        value={filteredShopNoOptions.find(option => option.value === shopNo)}
                        onChange={(selectedOption) => {
                            if (selectedOption) {
                                const selectedShopNo = selectedOption.value;
                                setShopNo(selectedShopNo);
                                if (selectedType !== "Pending Rent") {
                                    const matchingTenant = [...tenantShopData].reverse().find(t =>
                                        t.property?.some(p =>
                                            p.shops?.some(shop => shop.shopNo === selectedShopNo && shop.active)
                                        )
                                    );
                                    if (matchingTenant) {
                                        setTenantName(matchingTenant.tenantName);
                                        setSelectedTenantId(matchingTenant.id);
                                        const shopData = shopInfoMap[selectedShopNo];
                                        if (shopData) {
                                            setStartingDate(shopData.startingDate);
                                        }
                                    } else {
                                        setTenantName('');
                                        setSelectedTenantId('');
                                    }
                                } else {
                                    // If type is Pending Rent, skip auto-matching
                                    setTenantName('');
                                    setSelectedTenantId('');
                                }
                            } else {
                                setShopNo('');
                                setTenantName('');
                                setSelectedTenantId('');
                            }
                        }}
                        options={filteredShopNoOptions}
                        placeholder="Choose No"
                        isSearchable
                        isClearable
                        className="w-[170px]"
                        classNamePrefix="select"
                        styles={{
                            control: (provided, state) => ({
                                ...provided,
                                height: '45px',
                                minHeight: '45px',
                                backgroundColor: 'transparent',
                                borderWidth: '2px',
                                borderColor: state.isFocused
                                    ? 'rgba(191, 152, 83, 0.5)'
                                    : 'rgba(191, 152, 83, 0.18)',
                                borderRadius: '8px',
                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                '&:hover': {
                                    borderColor: 'rgba(191, 152, 83, 0.4)',
                                },
                            }),
                            placeholder: (provided) => ({
                                ...provided,
                                color: '#999',
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: 'black',
                            }),
                        }}
                    />
                </div>
                <div className="mt-4">
                    {selectedType === "Rent" && selectedMonth && calculatedRent && (
                        <div className="text-sm text-gray-700 -mt-5">
                            Rent To Be Paid For {selectedMonth
                                ? new Date(`${selectedMonth}-01`).toLocaleString('default', {
                                    month: 'long',
                                    year: 'numeric',
                                })
                                : ''}: ₹ {calculatedRent}
                        </div>
                    )}
                    <label className="block font-semibold mb-2">Tenant Name</label>
                    <Select
                        name="tenantName"
                        value={tenantOptions.find(option => option.value === tenantName)}
                        onChange={(selectedOption) => {
                            if (selectedOption) {
                                setTenantName(selectedOption.value);
                                setSelectedTenantId(selectedOption.tenantId);

                                if (selectedType !== "Pending Rent") {
                                    const tenantMatch = tenantShopData.find(t => t.tenantName === selectedOption.value);
                                    const tenantShops = tenantMatch?.property?.flatMap(p => p.shops)?.filter(shop => shop.active) || [];

                                    // Update shop options to only show this tenant's shops
                                    const newShopOptions = tenantShops.map(shop => ({
                                        value: shop.shopNo,
                                        label: shop.shopNo
                                    }));
                                    setFilteredShopNoOptions(newShopOptions);

                                    // Optionally auto-select the first shop
                                    if (tenantShops.length > 0) {
                                        const activeShop = tenantShops[0];
                                        setShopNo(activeShop.shopNo);

                                        const shopData = shopInfoMap[activeShop.shopNo];
                                        if (shopData) {
                                            setStartingDate(shopData.startingDate);
                                        }
                                    } else {
                                        setShopNo('');
                                    }
                                } else {
                                    setFilteredShopNoOptions(shopNoOptions); // Reset to all if Pending Rent
                                    setShopNo('');
                                }
                            } else {
                                setTenantName('');
                                setSelectedTenantId('');
                                setFilteredShopNoOptions(shopNoOptions);
                                setShopNo('');
                            }

                        }}
                        options={tenantOptions}
                        placeholder="Choose Tenant"
                        isSearchable
                        isClearable
                        className="w-[290px]"
                        classNamePrefix="select"
                        styles={{
                            control: (provided, state) => ({
                                ...provided,
                                height: '45px',
                                minHeight: '45px',
                                backgroundColor: 'transparent',
                                borderWidth: '2px',
                                borderColor: state.isFocused
                                    ? 'rgba(191, 152, 83, 0.5)'
                                    : 'rgba(191, 152, 83, 0.18)',
                                borderRadius: '8px',
                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                '&:hover': {
                                    borderColor: 'rgba(191, 152, 83, 0.4)',
                                },
                            }),
                            placeholder: (provided) => ({
                                ...provided,
                                color: '#999',
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: 'black',
                            }),
                        }}
                    />
                </div>
            </div>
            <div className="mt-2 lg:flex gap-8">
                <div className="mt-4">

                    <label className="block font-semibold mb-2">
                        {selectedType === "Shop Closure" ? "Refund Amount" : "Amount"}
                    </label>
                    <input
                        className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-[170px] h-[45px]"
                        type="text"
                        value={formatINR(amount)}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <div className="mt-4">
                    <label className="block font-semibold mb-2">Payment Mode</label>
                    <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-[290px] h-[45px]"
                    >
                        <option value="">Choose Method</option>
                        {paymentModeOptions.map((mode) => (
                            <option key={mode.id} value={mode.modeOfPayment}>
                                {mode.modeOfPayment}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mt-2 lg:flex gap-8">
                <div className="mt-4">
                    <label className="block font-semibold mb-2">Paid on</label>
                    <input
                        type="date"
                        value={paidOnDate}
                        onChange={(e) => setPaidOnDate(e.target.value)}
                        className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-[170px] h-[45px]"
                    />
                </div>
                {(selectedType === "Rent" || selectedType === "Pending Rent") && (
                    <div className="mt-4">
                        <label className="block font-semibold mb-2">For The Month of</label>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-[170px] h-[45px]"
                        />
                    </div>
                )}

            </div>
            <div className="mt-4 sm:flex">
                <div className='flex'>
                    <label htmlFor="fileInput" className="cursor-pointer flex items-center text-orange-600">
                        <img className='w-5 h-4' alt='' src={Attach}></img>
                        Attach file
                    </label>
                    <input type="file" id="fileInput" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                </div>
                {selectedRentFile && <span className="text-gray-600">{selectedRentFile.name}</span>}
            </div>
            <button
                type='submit'
                disabled={isSubmitting}
                onClick={handleSubmit}
                className={`bg-yellow-700 text-white px-6 mt-8 py-2 rounded-md hover:bg-yellow-600 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
        </div>
    );
};
export default Form;