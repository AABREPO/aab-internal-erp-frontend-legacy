import React, { useState, useEffect } from 'react'
import Select from 'react-select';
import axios from "axios";
const PendingBill = () => {
    const [showModal, setShowModal] = useState(false)
    const [selectedBill, setSelectedBill] = useState(null)
    const [poNumbers, setPoNumbers] = useState([])
    const [showEntryModal, setShowEntryModal] = useState(false)
    const [selectedEntryBill, setSelectedEntryBill] = useState(null)
    const [vendorId, setVendorId] = useState(null)
    const [entryFormData, setEntryFormData] = useState({
        enteredBy: null,
        date: ''
    })
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedPaymentBill, setSelectedPaymentBill] = useState(null)
    const [paymentEntries, setPaymentEntries] = useState([
        {
            id: 1,
            date: '',
            amount: '',
            mode: '',
            attachedFile: null
        }
    ])
    const [additionalFields, setAdditionalFields] = useState([])
    const [billData, setBillData] = useState([])
    const [serialNumber, setSerialNumber] = useState(1)
    const [apiData, setApiData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [purchaseOrders, setPurchaseOrders] = useState([])
    const [validationResults, setValidationResults] = useState({})
    const [checkingPO, setCheckingPO] = useState(false)
    const [formData, setFormData] = useState({
        billArrivalDate: '',
        vendorName: null,
        vendorName1: null,
        noOfBills: '',
        totalAmount: ''
    })
    const [vendorOptions, setVendorOptions] = useState([])
    const [contractorOptions, setContractorOptions] = useState([])
    const [combinedOptions, setCombinedOptions] = useState([])
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
    useEffect(() => {
        setCombinedOptions([...vendorOptions, ...contractorOptions]);
    }, [vendorOptions, contractorOptions]);
    const fetchTrackerData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/vendor-payments/trackers", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });            
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                console.error("Response Text:", responseText);
                if (responseText.includes('billVerifications') && responseText.includes('vendorPaymentsTracker')) {
                    console.warn("Detected circular reference in API response. This needs to be fixed in the backend.");
                    setError("Backend API has circular reference issue. Please add @JsonManagedReference and @JsonBackReference annotations to your entities.");
                    return;
                }
                
                throw new Error(`Invalid JSON response: ${parseError.message}`);
            }
            setApiData(data);
        } catch (error) {
            console.error("Error fetching tracker data:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    const fetchPurchaseOrders = async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/purchase_orders/getAll", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
            setPurchaseOrders(data);
        } catch (error) {
            console.error("Error fetching purchase orders:", error);
        }
    };
    useEffect(() => {
        fetchTrackerData();
        fetchPurchaseOrders();
    }, []);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleAddBill = () => {
        if (!formData.billArrivalDate || !formData.vendorName || !formData.noOfBills || !formData.totalAmount) {
            alert('Please fill all required fields');
            return;
        }
        const newBill = {
            id: serialNumber,
            billArrivalDate: formData.billArrivalDate,
            vendorName: formData.vendorName.label,
            vendorId: formData.vendorName.id,
            noOfBills: parseInt(formData.noOfBills),
            totalAmount: `₹${parseInt(formData.totalAmount).toLocaleString()}`,
            billVerification: 'Verify',
            entryStatus: 'Entry',
            paymentStatus: 'To Pay'
        };
        setBillData(prev => [newBill, ...prev]);
        setSerialNumber(prev => prev + 1);
        setFormData({
            billArrivalDate: '',
            vendorName: null,
            vendorId: null,
            noOfBills: '',
            totalAmount: ''
        });
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddBill();
        }
    };
    const handleVerifyClick = (bill) => {
        setSelectedBill(bill)
        const numberOfBills = bill.noOfBills || bill.no_of_bills || 1        
        if (bill.billVerifications && bill.billVerifications.length > 0) {
            const existingBillNumbers = bill.billVerifications.map(verification => verification.bill_number || '')
            while (existingBillNumbers.length < numberOfBills) {
                existingBillNumbers.push('')
            }
            setPoNumbers(existingBillNumbers.slice(0, numberOfBills))
        } else {
            setPoNumbers(new Array(numberOfBills).fill(''))
        }    
        setShowModal(true)
    }
    const handlePoNumberChange = (index, value) => {
        const newPoNumbers = [...poNumbers]
        newPoNumbers[index] = value
        setPoNumbers(newPoNumbers)
    }
    const handleSubmit = async () => {
        try {
            const maxBills = selectedBill.noOfBills || selectedBill.no_of_bills || 0
            if (maxBills === 0) {
                alert('Invalid number of bills')
                return
            }
            const validBillNumbers = poNumbers
                .filter(billNumber => billNumber.trim() !== '')
                .slice(0, maxBills)
            if (validBillNumbers.length === 0) {
                alert('Please enter at least one bill number')
                return
            }
            if (poNumbers.filter(billNumber => billNumber.trim() !== '').length > maxBills) {
                alert(`You can only enter ${maxBills} bill numbers maximum`)
                return
            }
            const trackerId = selectedBill.id
            const existingBills = selectedBill.billVerifications || []
            const billsData = validBillNumbers.map((billNumber, index) => {
                const existingBill = existingBills[index]
                if (existingBill) {
                    return {
                        id: existingBill.id,
                        bill_number: billNumber,
                        status: existingBill.status || 'NOT_VERIFIED'
                    }
                } else {
                    return {
                        bill_number: billNumber,
                        status: 'NOT_VERIFIED'
                    }
                }
            })
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${trackerId}/bills`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(billsData)
            })
            if (!response.ok) {
                throw new Error(`Failed to save bills: ${response.statusText}`)
            }
            const savedBills = await response.json()
            const updatedCount = billsData.filter(bill => bill.id).length
            const newCount = billsData.filter(bill => !bill.id).length
            let message = 'Successfully saved bills: '
            if (updatedCount > 0) message += `${updatedCount} updated, `
            if (newCount > 0) message += `${newCount} new`
            alert(message) 
            await fetchTrackerData()         
            setShowModal(false)
            setSelectedBill(null)
            setPoNumbers([])            
        } catch (error) {
            alert(`Error saving bills: ${error.message}`)
        }
    }
    const handleCancel = () => {
        setShowModal(false)
        setSelectedBill(null)
        setPoNumbers([])
        setValidationResults({})
    }
    const handleCheckPO = async () => {
        setCheckingPO(true)
        try {
            const vendorId = selectedBill.vendorId || selectedBill.vendor_id       
            if (!vendorId) {
                alert('Vendor ID not found')
                return
            }
            const vendorPurchaseOrders = purchaseOrders.filter(po => 
                po.vendor_id === vendorId || po.vendorId === vendorId
            )
            const vendorENOs = vendorPurchaseOrders.map(po => 
                po.eno || po.po_number || po.purchase_order_number
            ).filter(eno => eno)
            const newValidationResults = {}
            poNumbers.forEach((billNumber, index) => {
                if (billNumber.trim()) {
                    const isMatched = vendorENOs.includes(billNumber.trim())
                    newValidationResults[index] = {
                        matched: isMatched,
                        message: isMatched ? 'Matched' : 'Not Matched'
                    }
                }
            })
            setValidationResults(newValidationResults)
        } catch (error) {
            alert('Error checking PO numbers')
        } finally {
            setCheckingPO(false)
        }
    }
    const handleEntryClick = (bill) => {
        setSelectedEntryBill(bill)
        setShowEntryModal(true)
    }
    const handleEntryInputChange = (field, value) => {
        setEntryFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }
    const handleEntrySubmit = () => {
        if (!entryFormData.enteredBy || !entryFormData.date) {
            alert('Please fill all required fields')
            return
        }
        setBillData(prev => prev.map(bill =>
            bill.id === selectedEntryBill.id
                ? { ...bill, entryStatus: 'Entered' }
                : bill
        ))
        setShowEntryModal(false)
        setSelectedEntryBill(null)
        setEntryFormData({
            enteredBy: null,
            date: ''
        })
    }
    const handleEntryCancel = () => {
        setShowEntryModal(false)
        setSelectedEntryBill(null)
        setEntryFormData({
            enteredBy: null,
            date: ''
        })
        setAdditionalFields([])
    }
    const handlePaymentClick = (bill) => {
        setSelectedPaymentBill(bill)
        setShowPaymentModal(true)
    }
    const handlePaymentCancel = () => {
        setShowPaymentModal(false)
        setSelectedPaymentBill(null)
        setPaymentEntries([
            {
                id: 1,
                date: '',
                amount: '',
                mode: '',
                attachedFile: null
            }
        ])
    }
    const handleAddPaymentEntry = () => {
        const newEntry = {
            id: Date.now(),
            date: '',
            amount: '',
            mode: '',
            attachedFile: null
        }
        setPaymentEntries(prev => [...prev, newEntry])
    }
    const handlePaymentEntryChange = (entryId, field, value) => {
        setPaymentEntries(prev => prev.map(entry =>
            entry.id === entryId ? { ...entry, [field]: value } : entry
        ))
    }
    const handleFileAttachment = (entryId, file) => {
        setPaymentEntries(prev => prev.map(entry =>
            entry.id === entryId ? { ...entry, attachedFile: file } : entry
        ))
    }
    const handlePaymentSubmit = () => {
        const hasEmptyFields = paymentEntries.some(entry =>
            !entry.date || !entry.amount || !entry.mode
        )
        if (hasEmptyFields) {
            alert('Please fill all required fields in payment entries')
            return
        }
        setBillData(prev => prev.map(bill =>
            bill.id === selectedPaymentBill.id
                ? { ...bill, paymentStatus: 'Paid' }
                : bill
        ))
        handlePaymentCancel()
    }
    const handleAddField = () => {
        const newField = {
            id: Date.now(),
            type: 'text',
            value: '',
            dropdownValue: null
        }
        setAdditionalFields(prev => [...prev, newField])
    }
    const handleRemoveField = (fieldId) => {
        setAdditionalFields(prev => prev.filter(field => field.id !== fieldId))
    }
    const handleDynamicFieldChange = (fieldId, value) => {
        setAdditionalFields(prev => prev.map(field =>
            field.id === fieldId ? { ...field, value } : field
        ))
    }
    const handleDynamicDropdownChange = (fieldId, selectedOption) => {
        setAdditionalFields(prev => prev.map(field =>
            field.id === fieldId ? { ...field, dropdownValue: selectedOption } : field
        ))
    }
    const getButtonClass = (status) => {
        if (status.includes('✓')) {
            return 'px-3 py-1.5 rounded-full text-xs font-medium bg-green-500 text-white border border-green-500 cursor-pointer transition-all duration-200'
        } else if (status === 'Verified' || status === 'Entered' || status === 'Paid') {
            return 'px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-500 text-white border border-yellow-500 cursor-pointer transition-all duration-200'
        } else {
            return 'px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300 cursor-pointer transition-all duration-200 hover:bg-gray-50'
        }
    }
    const getVendorNameById = (vendorId) => {
        if (!vendorId) return '-'
        const vendor = vendorOptions.find(option => option.id === vendorId)
        return vendor ? vendor.label : `Vendor ID: ${vendorId}`
    }
    const getBillVerificationStatus = (item) => {
        if (!item.billVerifications || item.billVerifications.length === 0) {
            return 'Verify'
        }        
        const allVerified = item.billVerifications.every(verification => 
            verification.status === 'VERIFIED'
        )
        const anyVerified = item.billVerifications.some(verification => 
            verification.status === 'VERIFIED'
        )        
        if (allVerified) {
            return '✓ Verified'
        } else if (anyVerified) {
            return 'On Process'
        } else {
            return 'Verify'
        }
    }
    const renderInputFields = () => {
        const fields = []
        const noOfBills = selectedBill?.noOfBills || selectedBill?.no_of_bills || 0
        const hasExistingBills = selectedBill?.billVerifications && selectedBill.billVerifications.length > 0        
        for (let i = 0; i < noOfBills; i++) {
            const validation = validationResults[i]
            const hasValidation = validation !== undefined
            const isValid = validation?.matched
            const poNumber = poNumbers[i] || ''            
            let borderClass = 'border-gray-300'
            if (hasExistingBills && hasValidation) {
                borderClass = isValid ? 'border-green-500' : 'border-red-500'
            }            
            fields.push(
                <div key={i} className="relative group">
                    <input
                        type="text"
                        value={poNumber}
                        onChange={(e) => handlePoNumberChange(i, e.target.value)}
                        className={`w-[81px] h-[36px] px-3 py-2 rounded text-sm bg-[#F2F2F2] focus:outline-none  focus:bg-white transition-colors duration-200 placeholder-gray-500 border-2 ${borderClass}`}
                    />
                    {hasExistingBills && hasValidation && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            {validation.message}
                        </div>
                    )}
                </div>
            )
        }
        return fields
    }
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
    };
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '32px',
            height: '32px',
            borderWidth: '1px',
            borderRadius: '4px',
            borderColor: state.isFocused ? 'rgba(191, 152, 83, 1)' : 'rgba(191, 152, 83, 0.2)',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.2)' : 'none',
            '&:hover': {
                borderColor: 'rgba(191, 152, 83, 0.5)',
            }
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: '30px',
            padding: '0 6px'
        }),
        input: (provided) => ({
            ...provided,
            margin: '0px',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '30px',
        }),
        option: (provided, state) => ({
            ...provided,
            fontSize: '12px',
            padding: '4px 8px'
        })
    };
    const handleSubmitTracker = async () => {
        try {
            const payload = {
                bill_arrival_date: formData.billArrivalDate,
                vendor_id: vendorId?.id,
                no_of_bills: Number(formData.noOfBills),
                total_amount: Number(formData.totalAmount),
            };
            const response = await axios.post("https://backendaab.in/aabuildersDash/api/vendor-payments/tracker", payload);
            console.log("Tracker created:", response.data);
            alert(`Tracker created with ID: ${response.data.id}`);
        } catch (error) {
            console.error("Error creating tracker:", error);
        }
    };
    return (
        <div className="">
            <div className="bg-white p-5  mb-5 ml-10 mr-10">
                <div className="flex flex-wrap gap-5 text-left">
                    <div className=" ">
                        <label className="block mb-1 font-semibold ">Vendor Name</label>
                        <Select
                            options={combinedOptions}
                            value={formData.vendorName1}
                            onChange={(selectedOption) => handleInputChange("vendorName1", selectedOption)}
                            placeholder="Select Vendor Name"
                            styles={customStyles}
                            isClearable
                            menuPortalTarget={document.body}
                            className="w-[323px]"
                        />
                    </div>
                    <div className=" ">
                        <label className="block mb-1 font-semibold ">From Date</label>
                        <input
                            type="date"
                            placeholder="Select Date"
                            className="w-[168px] h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none "
                        />
                    </div>
                    <div className=" ">
                        <label className="block mb-1 font-semibold ">To Date</label>
                        <input
                            type="date"
                            placeholder="Select Date"
                            className="w-[168px] h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none "
                        />
                    </div>
                    <div className="">
                        <label className="block mb-1 font-semibold ">Payment Status</label>
                        <select className="w-[172px] h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none ">
                            <option value="">Select status</option>
                            <option value="to-pay">To Pay</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="bg-white p-5 ml-10 mr-10">
                <div className='border-l-8 border-l-[#BF9853] rounded-lg ml-5 mr-5'>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-[#FAF6ED]">
                                <tr>
                                    <th className="px-2 py-3 text-left text-sm font-semibold">SI.No</th>
                                    <th className="px-2 py-3 text-left text-sm font-semibold">Bill Arrival Date</th>
                                    <th className="px-2 py-3 text-left text-sm font-semibold">Vendor Name</th>
                                    <th className="px-2 py-3 text-left text-sm font-semibold">No of Bills</th>
                                    <th className="px-2 py-3 text-left text-sm font-semibold">Total Amount</th>
                                    <th className="px-2 py-3 text-left text-sm font-semibold">Bill verification</th>
                                    <th className="px-2 py-3 text-left text-sm font-semibold">Entry Status</th>
                                    <th className="px-2 py-3 text-left text-sm font-semibold">Payment Status</th>
                                </tr>
                            </thead>
                            <tbody className="">
                                <tr className="odd:bg-white even:bg-[#FAF6ED]">
                                    <td className="px-2 py-3 text-sm border-b border-gray-100">{serialNumber}</td>
                                    <td className="px-2 py-3 text-sm border-b border-gray-100">
                                        <input
                                            type="date"
                                            value={formData.billArrivalDate}
                                            onChange={(e) => handleInputChange('billArrivalDate', e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="w-[112px] h-[32px] px-2 py-1 bg-[#ECE9E9] rounded text-xs focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-2 py-3 text-sm border-b border-gray-100">
                                        <div className="w-[271px] h-[32px]">
                                            <Select
                                                options={vendorOptions}
                                                value={vendorId}
                                                onChange={(selectedOption) => setVendorId(selectedOption)}
                                                placeholder="Select Vendor"
                                                styles={customSelectStyles}
                                                isClearable
                                                menuPortalTarget={document.body}
                                                className="text-xs"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddBill();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 text-sm border-b border-gray-100">
                                        <input
                                            type="number"
                                            value={formData.noOfBills}
                                            onChange={(e) => handleInputChange('noOfBills', e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            onWheel={(e) => e.target.blur()}
                                            className="w-[56px] h-[32px] px-2 py-1 bg-[#ECE9E9] rounded text-xs focus:outline-none no-spinner"
                                        />
                                    </td>
                                    <td className="px-2 py-3 text-sm border-b border-gray-100">
                                        <input
                                            type="number"
                                            value={formData.totalAmount}
                                            onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleSubmitTracker();
                                                }
                                            }}
                                            onWheel={(e) => e.target.blur()}
                                            placeholder="Amount"
                                            className="w-[104px] h-[32px] px-2 py-1 bg-[#ECE9E9] rounded text-xs focus:outline-none no-spinner"
                                        />
                                    </td>
                                    <td className="px-2 py-3 text-sm border-b border-gray-100">
                                        <span className="text-gray-400 text-xs">-</span>
                                    </td>
                                    <td className="px-2 py-3 text-sm border-b border-gray-100">
                                        <span className="text-gray-400 text-xs">-</span>
                                    </td>
                                    <td className="px-2 py-3 text-sm border-b border-gray-100">
                                        <span className="text-gray-400 text-xs">-</span>
                                    </td>
                                </tr>                                
                                {loading && (
                                    <tr>
                                        <td colSpan="8" className="px-2 py-8 text-center text-sm text-gray-500">
                                            Loading data...
                                        </td>
                                    </tr>
                                )}                                
                                {error && (
                                    <tr>
                                        <td colSpan="8" className="px-2 py-8 text-center text-sm text-red-500">
                                            Error loading data: {error}
                                        </td>
                                    </tr>
                                )}            
                                {apiData.map((item, index) => (
                                    <tr key={`api-${item.id || index}`} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}`}>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">{item.id || index + 1}</td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">
                                            {item.bill_arrival_date ? new Date(item.bill_arrival_date).toLocaleDateString('en-GB') : '-'}
                                        </td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">
                                            {getVendorNameById(item.vendor_id)}
                                        </td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">
                                            {item.no_of_bills || item.noOfBills || '-'}
                                        </td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">
                                            {item.total_amount ? `₹${parseInt(item.total_amount).toLocaleString()}` : '-'}
                                        </td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">
                                            <button
                                                className={getButtonClass(getBillVerificationStatus(item))}
                                                onClick={() => handleVerifyClick(item)}
                                            >
                                                {getBillVerificationStatus(item)}
                                            </button>
                                        </td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">
                                            <button
                                                className={getButtonClass(item.entry_status || 'Entry')}
                                                onClick={() => (item.entry_status || 'Entry') === 'Entry' && handleEntryClick(item)}
                                            >
                                                {item.entry_status || 'Entry'}
                                            </button>
                                        </td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">
                                            <button
                                                className={getButtonClass(item.payment_status || 'To Pay')}
                                                onClick={() => (item.payment_status || 'To Pay') === 'To Pay' && handlePaymentClick(item)}
                                            >
                                                {item.payment_status || 'To Pay'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {billData.map((bill, index) => (
                                    <tr key={`local-${bill.id}`} className={`${(apiData.length + index) % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}`}>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">{bill.id}</td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">{bill.billArrivalDate}</td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">{bill.vendorName}</td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">{bill.noOfBills}</td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">{bill.totalAmount}</td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">
                                            <button
                                                className={getButtonClass(bill.billVerification)}
                                                onClick={() => bill.billVerification === 'Verify' && handleVerifyClick(bill)}
                                            >
                                                {bill.billVerification}
                                            </button>
                                        </td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">
                                            <button
                                                className={getButtonClass(bill.entryStatus)}
                                                onClick={() => bill.entryStatus === 'Entry' && handleEntryClick(bill)}
                                            >
                                                {bill.entryStatus}
                                            </button>
                                        </td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">
                                            <button
                                                className={getButtonClass(bill.paymentStatus)}
                                                onClick={() => bill.paymentStatus === 'To Pay' && handlePaymentClick(bill)}
                                            >
                                                {bill.paymentStatus}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl p-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold px-5">
                                Enter the Matching PO Numbers 
                                <span className="text-sm text-gray-500 ml-2">
                                    (Max: {selectedBill?.noOfBills || selectedBill?.no_of_bills || 0})
                                </span>
                            </h3>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-orange-500 text-xl font-bold"
                                onClick={handleCancel}
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-80 overflow-y-auto">
                                {renderInputFields()}
                            </div>
                        </div>
                        <div className="flex justify-start gap-3 p-5">
                            {selectedBill?.billVerifications && selectedBill.billVerifications.length > 0 ? (
                                <>
                                    <button
                                        className="px-4 py-2 bg-white text-green-600 border-2 border-green-600 rounded font-medium w-[130px] h-[36px] hover:bg-green-50 transition-colors duration-200"
                                        onClick={handleCheckPO}
                                        disabled={checkingPO}
                                    >
                                        {checkingPO ? 'Checking...' : 'Check PO'}
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-gray-500 text-white rounded font-medium w-[120px] h-[36px] hover:bg-gray-600 transition-colors duration-200"
                                        onClick={() => alert('Send Request functionality - This would typically send authorization requests for the PO numbers')}
                                    >
                                        Send Request
                                    </button>
                                </>
                            ) : null}                            
                            <button
                                className="px-4 py-2 w-[100px] h-[36px] bg-white text-[#BF9853] border border-[#BF9853] rounded font-medium hover:bg-amber-50 transition-colors duration-200"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-[#BF9853] text-white rounded font-medium w-[100px] h-[36px] hover:bg-[#a67c3a] transition-colors duration-200"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showEntryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-[534px]">
                        <div className="flex justify-between items-center p-6 ">
                            <h3 className="text-lg font-bold text-black">Bill Entry Details</h3>
                            <button
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-orange-500 text-lg font-bold"
                                onClick={handleEntryCancel}
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="text-left">
                                <div className='flex gap-5'>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Entered By</label>
                                        <Select
                                            options={[
                                                { value: 'user1', label: 'User 1' },
                                                { value: 'user2', label: 'User 2' },
                                                { value: 'user3', label: 'User 3' },
                                                { value: 'admin', label: 'Admin' }
                                            ]}
                                            value={entryFormData.enteredBy}
                                            onChange={(selectedOption) => handleEntryInputChange('enteredBy', selectedOption)}
                                            placeholder="Select"
                                            className='w-[270px] h-[45px]'
                                            styles={customStyles}
                                            isClearable
                                            menuPortalTarget={document.body}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Date</label>
                                        <input
                                            type="date"
                                            value={entryFormData.date}
                                            onChange={(e) => handleEntryInputChange('date', e.target.value)}
                                            className="w-[168px] h-[40px] px-3 py-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg text-sm focus:outline-none "
                                        />
                                    </div>
                                </div>
                                {additionalFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-5 mt-4 ">
                                        <div>
                                            <Select
                                                options={[
                                                    { value: 'text', label: 'Text' },
                                                    { value: 'number', label: 'Number' },
                                                    { value: 'date', label: 'Date' },
                                                    { value: 'dropdown', label: 'Dropdown' }
                                                ]}
                                                value={field.dropdownValue}
                                                onChange={(selectedOption) => handleDynamicDropdownChange(field.id, selectedOption)}
                                                placeholder="Select Type"
                                                className='w-[270px] h-[45px]'
                                                styles={customStyles}
                                                isClearable
                                                menuPortalTarget={document.body}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="date"
                                                placeholder="Enter value"
                                                value={field.value}
                                                onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
                                                className="w-[168px] h-[40px] px-3 py-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg text-sm focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleRemoveField(field.id)}
                                            className="w-10 h-10 py-1 text-lg  font-bold"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <div
                                    className="flex items-center text-[#E4572E] mt-3 w-16 text-sm font-semibold border-dashed border-b-2 border-[#BF9853] cursor-pointer hover:text-[#c44a26] transition-colors duration-200"
                                    onClick={handleAddField}
                                >
                                    <span> + Add on</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-start gap-3 p-6 ">
                            <button
                                className="px-6 py-2 bg-[#BF9853] text-white rounded font-medium hover:bg-[#a67c3a] transition-colors duration-200"
                                onClick={handleEntrySubmit}
                            >
                                Confirm
                            </button>
                            <button
                                className="px-6 py-2 bg-white text-[#BF9853] border border-[#BF9853] rounded font-medium "
                                onClick={handleEntryCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-[1000px] h-[650px] overflow-auto shadow-lg flex flex-col p-5">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold pl-5">Entry Payment Details</h3>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-orange-500 text-xl font-bold"
                                onClick={handlePaymentCancel}
                            >
                                ×
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex gap-10 h-full">
                                <div className="flex-1 flex flex-col">
                                    <div className="flex-1 overflow-y-auto p-4">
                                        {paymentEntries.map((entry, index) => (
                                            <div key={entry.id} className="text-left p-4 shadow-lg rounded-lg mb-4">
                                                <div className="flex gap-4 border border-[#BF9853] border-opacity-35 rounded-md p-4">
                                                    <div className="flex-1">
                                                        <label className="block font-semibold mb-1 text-sm">Date</label>
                                                        <input
                                                            type="date"
                                                            value={entry.date}
                                                            onChange={(e) => handlePaymentEntryChange(entry.id, 'date', e.target.value)}
                                                            className="w-[150px] h-[35px] px-3 border-2 border-[#BF9853] border-opacity-35 rounded text-sm focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block font-semibold mb-1 text-sm">Amount</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter Amount"
                                                            value={entry.amount}
                                                            onChange={(e) => handlePaymentEntryChange(entry.id, 'amount', e.target.value)}
                                                            className="w-[150px] h-[35px] px-3 border-2 border-[#BF9853] border-opacity-35 rounded text-sm focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block font-semibold mb-1 text-sm">Mode</label>
                                                        <select
                                                            value={entry.mode}
                                                            onChange={(e) => handlePaymentEntryChange(entry.id, 'mode', e.target.value)}
                                                            className="w-[180px] h-[35px] px-3 border-2 border-[#BF9853] border-opacity-35 rounded text-sm focus:outline-none"
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="Cash">Cash</option>
                                                            <option value="Bank Transfer">Bank Transfer</option>
                                                            <option value="UPI">UPI</option>
                                                            <option value="Cheque">Cheque</option>
                                                        </select>
                                                        <div className="mt-1 px-6">
                                                            <button
                                                                className="text-[#E4572E] text-sm flex items-center gap-1"
                                                                onClick={() => document.getElementById(`file-input-${entry.id}`).click()}
                                                            >
                                                                Attach file
                                                            </button>
                                                            <input
                                                                id={`file-input-${entry.id}`}
                                                                type="file"
                                                                className="hidden"
                                                                onChange={(e) => handleFileAttachment(entry.id, e.target.files[0])}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex py-3">
                                            <button
                                                onClick={handleAddPaymentEntry}
                                                className="text-[#E4572E] text-sm font-semibold border-dashed border-b-2 border-[#BF9853] cursor-pointer hover:text-[#c44a26] transition-colors duration-200 flex items-center gap-1"
                                            >
                                                <span className="text-red-500">+</span> Add on
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 p-4 bg-white">
                                        <button className="w-[114px] h-[36px] bg-transparent text-[#BF9853] border border-[#BF9853] rounded font-medium"
                                            onClick={handlePaymentCancel}
                                        >
                                            Cancel
                                        </button>
                                        <button className="w-[114px] h-[36px] text-white bg-[#BF9853] rounded font-medium"
                                            onClick={handlePaymentSubmit}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                                <div className="w-80 flex flex-col">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        <div className="text-left">
                                            <h4 className="text-lg font-semibold mb-2">Summary</h4>
                                            <div className="space-y-3 shadow-lg rounded-lg p-4">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Bill Amount:</span>
                                                    <span className="font-semibold">0</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Tax Amount:</span>
                                                    <span className="font-semibold">0</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Discount:</span>
                                                    <span className="font-semibold">0</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Additional Charges:</span>
                                                    <span className="font-semibold">0</span>
                                                </div>
                                                <hr className="border-gray-300" />
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 font-semibold">Total Payable:</span>
                                                    <span className="font-bold text-lg"></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='text-left'>
                                            <button className='text-[#E4572E] text-sm flex items-center gap-1'>
                                                Attach file
                                            </button>
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-lg font-semibold mb-2">Bank Details</h4>
                                            <div className="space-y-3 shadow-lg rounded-lg p-4">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">A/c Name:</span>
                                                    <span className="font-semibold">-</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Bank Name:</span>
                                                    <span className="font-semibold">-</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Account No:</span>
                                                    <span className="font-semibold">-</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">IFSC Code:</span>
                                                    <span className="font-semibold">-</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-lg font-semibold mb-4">UPI Code</h4>
                                            <div className="space-y-3">
                                                <div className="text-gray-600"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default PendingBill