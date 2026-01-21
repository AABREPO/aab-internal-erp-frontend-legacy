import React, { useState, useEffect, useRef } from 'react'
import Select from 'react-select';
import axios from "axios";
import edit from '../Images/Edit.svg';
import deletes from '../Images/Delete.svg';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// BillDatabase component - displays fully paid bills (verified + entered + fully paid with tick)
const BillDatabase = ({ username, userRoles = [] }) => {
    const [apiData, setApiData] = useState([])
    // Modal states (match PendingBill style popups)
    const [showModal, setShowModal] = useState(false)
    const [selectedBill, setSelectedBill] = useState(null)
    const [showEntryModal, setShowEntryModal] = useState(false)
    const [selectedEntryBill, setSelectedEntryBill] = useState(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedPaymentBill, setSelectedPaymentBill] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [vendorOptions, setVendorOptions] = useState([])
    const [contractorOptions, setContractorOptions] = useState([])
    const [combinedOptions, setCombinedOptions] = useState([])
    const [expenseMatchStatus, setExpenseMatchStatus] = useState({})
    const [expenseMatchDetails, setExpenseMatchDetails] = useState({})
    const [paymentStatuses, setPaymentStatuses] = useState({})
    const [allBillEntries, setAllBillEntries] = useState([])
    const [expensesData, setExpensesData] = useState([])
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    })

    // Filter state
    const [filters, setFilters] = useState({
        vendorName: null,
        fromDate: '',
        toDate: '',
        paymentStatus: ''
    })

    // Additional state for popups (copied from PendingBill)
    const [poNumbers, setPoNumbers] = useState([])
    const [vendorId, setVendorId] = useState(null)
    const [entryFormData, setEntryFormData] = useState({
        enteredBy: null,
        date: new Date().toISOString().split('T')[0]
    })
    const [editingPreviousEntry, setEditingPreviousEntry] = useState(null)
    const [previousEntryEditData, setPreviousEntryEditData] = useState({
        enteredBy: null,
        date: ''
    })
    const [userList, setUserList] = useState([])
    const [numberInputValue, setNumberInputValue] = useState('')
    const [numberInputLocked, setNumberInputLocked] = useState(false)
    const [hasStartedEditing, setHasStartedEditing] = useState(false)
    const [previousEntryNumbers, setPreviousEntryNumbers] = useState({})
    const [paymentEntries, setPaymentEntries] = useState([
        {
            id: 1,
            date: '',
            amount: '',
            mode: '',
            attachedFile: null,
            chequeNo: '',
            chequeDate: '',
            transactionNumber: '',
            accountNumber: ''
        }
    ])
    const [additionalFields, setAdditionalFields] = useState([])
    const [billData, setBillData] = useState([])
    const [serialNumber, setSerialNumber] = useState(1)
    const [purchaseOrders, setPurchaseOrders] = useState([])
    const [validationResults, setValidationResults] = useState({})
    const [checkingPO, setCheckingPO] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [verifiedBills, setVerifiedBills] = useState({})
    const [noPoSelections, setNoPoSelections] = useState({})
    const [checkedBills, setCheckedBills] = useState({})
    const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false)
    const [originalData, setOriginalData] = useState(null)
    const [editModeStartData, setEditModeStartData] = useState(null)
    const [billEntryDates, setBillEntryDates] = useState({})
    const [formData, setFormData] = useState({
        billArrivalDate: '',
        vendorName: null,
        vendorName1: null,
        noOfBills: '',
        totalAmount: ''
    })
    const [accountDetails, setAccountDetails] = useState([])
    const [selectedVendorAccountDetails, setSelectedVendorAccountDetails] = useState(null)
    const [discount, setDiscount] = useState(0)
    const [discountSubmitted, setDiscountSubmitted] = useState(false)
    const [actualAmount, setActualAmount] = useState(0)
    const [remainingAmount, setRemainingAmount] = useState(0)
    const [existingBillEntryDetails, setExistingBillEntryDetails] = useState(null)
    const [loadingEntryDetails, setLoadingEntryDetails] = useState(false)
    const [existingPaymentDetails, setExistingPaymentDetails] = useState(null)
    const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false)
    const [receivedAmount, setReceivedAmount] = useState(0)
    const [showPaymentSummaryModal, setShowPaymentSummaryModal] = useState(false)
    const [paymentSummaryData, setPaymentSummaryData] = useState(null)
    const [carryForwardData, setCarryForwardData] = useState([])
    const [useCarryForward, setUseCarryForward] = useState(false)
    const [carryForwardAmount, setCarryForwardAmount] = useState(0)

    // Edit modal states
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedEditItem, setSelectedEditItem] = useState(null)
    const [editFormData, setEditFormData] = useState({
        billArrivalDate: '',
        vendorId: null,
        noOfBills: '',
        totalAmount: ''
    })
    const [editLoading, setEditLoading] = useState(false)

    // Overall payment PDF states
    const [overallPaymentPdfFile, setOverallPaymentPdfFile] = useState(null)
    const [uploadingOverallPdf, setUploadingOverallPdf] = useState(false)
    const overallPdfInputRef = useRef(null)
    // Check modal states
    const [showCheckModal, setShowCheckModal] = useState(false)
    const [checkFilteredExpenses, setCheckFilteredExpenses] = useState([])
    const [loadingCheckExpenses, setLoadingCheckExpenses] = useState(false)

    // Custom styles for Select components

    // Fetch vendor names
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
                type: "Vendor"
            }));
            setVendorOptions(formattedData);
        } catch (error) {
            console.error("Error fetching vendor names:", error);
        }
    };

    // Modal open handlers
    const handleVerifyClick = (item) => {
        setSelectedBill(item)
        const numberOfBills = item.noOfBills || item.no_of_bills || 1
        if (item.billVerifications && item.billVerifications.length > 0) {
            const existingBillNumbers = item.billVerifications.map(verification =>
                verification.bill_number === 'NO_PO' ? '' : (verification.bill_number || '')
            )
            while (existingBillNumbers.length < numberOfBills) {
                existingBillNumbers.push('')
            }
            setPoNumbers(existingBillNumbers.slice(0, numberOfBills))
            const initialVerified = {}
            const initialNoPo = {}
            item.billVerifications.forEach((verification, index) => {
                if (index < numberOfBills) {
                    initialVerified[index] = verification.is_verified || false
                    initialNoPo[index] = verification.bill_number === 'NO_PO'
                }
            })
            setVerifiedBills(initialVerified)
            setNoPoSelections(initialNoPo)
            const initialChecked = {}
            item.billVerifications.forEach((verification, index) => {
                if (index < numberOfBills) {
                    initialChecked[index] = verification.is_verified || false
                }
            })
            setCheckedBills(initialChecked)
            setHasBeenSubmitted(true)
            setOriginalData({
                poNumbers: existingBillNumbers.slice(0, numberOfBills),
                noPoSelections: initialNoPo,
                verifiedBills: initialVerified
            })
        } else {
            setPoNumbers(new Array(numberOfBills).fill(''))
            setVerifiedBills({})
            setNoPoSelections({})
            setCheckedBills({})
            setHasBeenSubmitted(false)
            setOriginalData(null)
        }
        setIsEditMode(false)
        setValidationResults({})
        setCheckedBills({}) // Reset checked bills state for new verification
        setShowModal(true)
    }

    const handleEntryClick = async (item) => {
        setSelectedEntryBill(item)
        setShowEntryModal(true)
        setEntryFormData({
            enteredBy: null,
            date: new Date().toISOString().split('T')[0]
        })
        setNumberInputValue(item.adjustment_amount || item.adjustmentAmount || '')
        setNumberInputLocked(false)
        setHasStartedEditing(false)
        const existingDetails = await fetchExistingBillEntryDetails(item.id)
        try {
            const trackerResponse = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${item.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (trackerResponse.ok) {
                const trackerData = await trackerResponse.json()
                setSelectedEntryBill(prev => ({
                    ...prev,
                    adjustment_amount: trackerData.adjustment_amount,
                    ...trackerData
                }))
                if (trackerData.adjustment_amount) {
                    setNumberInputValue(trackerData.adjustment_amount.toString())
                }
            }
        } catch (error) {
            console.error('Error fetching tracker data:', error)
        }
        setEntryFormData({
            enteredBy: null,
            date: ''
        })
    }
    const fetchExistingBillEntryDetails = async (vendorPaymentsTrackerId) => {
        setLoadingEntryDetails(true);
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/bill-entry/get/${vendorPaymentsTrackerId}`, {
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
            setExistingBillEntryDetails(data);
            return data;
        } catch (error) {
            console.error("Error fetching existing bill entry details:", error);
            setExistingBillEntryDetails(null);
            return null;
        } finally {
            setLoadingEntryDetails(false);
        }
    };

    const findVendorAccountDetails = (vendorId) => {
        if (!accountDetails || accountDetails.length === 0) {
            setSelectedVendorAccountDetails(null)
            return
        }
        const details = accountDetails.find(acc => acc.vendor_id === vendorId || acc.vendorId === vendorId)
        setSelectedVendorAccountDetails(details || null)
    }

    const fetchExistingPaymentDetails = async (vendorPaymentsTrackerId) => {
        setLoadingPaymentDetails(true)
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/get/${vendorPaymentsTrackerId}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })
            if (!response.ok) {
                throw new Error('Failed to load payment details')
            }
            const data = await response.json()
            setExistingPaymentDetails(data)
            return data
        } catch (e) {
            console.error('Error fetching existing payment details:', e)
            setExistingPaymentDetails(null)
            return null
        } finally {
            setLoadingPaymentDetails(false)
        }
    }

    const fetchCarryForwardData = async (vendorId) => {
        try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/vendor_carry_forward/getAll", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter by vendor_id and calculate total carry forward amount
                const vendorCarryForward = data.filter(item => item.vendor_id === vendorId);
                setCarryForwardData(vendorCarryForward);
                const totalCarryForward = vendorCarryForward.reduce((sum, item) => {
                    const amount = parseFloat(item.amount) || 0;
                    const billAmount = parseFloat(item.bill_amount) || 0;
                    const refundAmount = parseFloat(item.refund_amount) || 0;
                    return sum + amount - billAmount - refundAmount;
                }, 0);
                setCarryForwardAmount(Math.max(0, totalCarryForward));
            } else {
                console.error("Failed to fetch carry forward data:", response.status);
                setCarryForwardData([]);
                setCarryForwardAmount(0);
            }
        } catch (error) {
            console.error("Error fetching carry forward data:", error);
            setCarryForwardData([]);
            setCarryForwardAmount(0);
        }
    };

    const handlePaymentClick = async (item) => {
        setSelectedPaymentBill(item)
        findVendorAccountDetails(item?.vendor_id)
        const billTotal = parseFloat(item?.total_amount || 0)
        const existingPayments = await fetchExistingPaymentDetails(item.id)
        let received = 0
        let totalDiscount = 0
        if (existingPayments && existingPayments.length > 0) {
            received = existingPayments.reduce((sum, payment) => {
                const amount = parseFloat(payment.amount) || 0;
                const carryForwardAmount = parseFloat(payment.carry_forward_amount) || 0;
                return sum + amount + carryForwardAmount;
            }, 0);
            totalDiscount = existingPayments.reduce((sum, p) => sum + (parseFloat(p.discount_amount) || 0), 0)
            // Pre-fill entries from existing payments
            const mapped = existingPayments.map((p, idx) => ({
                id: p.id || idx + 1,
                date: p.date || '',
                amount: p.amount || '',
                amountDisplay: p.amount ? formatIndianCurrency(parseFloat(p.amount)) : '',
                mode: p.vendor_bill_payment_mode || p.mode || '',
                attachedFile: null,
                chequeNo: p.cheque_number || p.cheque_no || '',
                chequeDate: p.cheque_date || '',
                transactionNumber: p.transaction_number || '',
                accountNumber: p.account_number || ''
            }))
            setPaymentEntries(mapped)
        } else {
            setPaymentEntries([{ id: Date.now(), date: '', amount: '', amountDisplay: '', mode: '', attachedFile: null, chequeNo: '', chequeDate: '', transactionNumber: '', accountNumber: '' }])
        }
        setReceivedAmount(received)
        setDiscount(totalDiscount)
        setDiscountSubmitted(totalDiscount > 0)
        setActualAmount(billTotal)
        setRemainingAmount(Math.max(0, billTotal - received))
        setUseCarryForward(false); // Reset checkbox
        const vendorId = item.vendor_id || item.vendorId
        if (vendorId) {
            // Fetch carry forward data for this vendor
            await fetchCarryForwardData(vendorId);
        } else {
            setCarryForwardData([]);
            setCarryForwardAmount(0);
        }
        setShowPaymentModal(true)
    }

    // Additional handlers for popups (simplified versions)
    const handleEntryCancel = () => {
        setShowEntryModal(false)
        setSelectedEntryBill(null)
        setEntryFormData({
            enteredBy: null,
            date: new Date().toISOString().split('T')[0]
        })
        setAdditionalFields([])
        setExistingBillEntryDetails(null)
        setLoadingEntryDetails(false)
        setEditingPreviousEntry(null)
        setPreviousEntryEditData({
            enteredBy: null,
            date: ''
        })
        setNumberInputValue('')
        setNumberInputLocked(false)
        setHasStartedEditing(false)
    }

    const handlePreviousEntryInputChange = (field, value) => {
        setPreviousEntryEditData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const getUserOptions = () => {
        return userList.map(user => ({
            value: user.name || user.username,
            label: user.name || user.username
        }))
    }

    const isAdminUser = () => {
        return username === 'Admin' || username === 'Mahalingam M'
    }

    const areAllBillsVerifiedAndNotPaid = () => {
        if (!selectedBill) return false
        return selectedBill.billVerifications &&
            selectedBill.billVerifications.every(v => v.is_verified === true || v.status === 'VERIFIED')
    }

    const isSendRequestDisabled = () => {
        if (!selectedBill) return true
        const totalNumbers = poNumbers.length + Object.values(noPoSelections).filter(Boolean).length
        return totalNumbers === 0
    }

    const hasUnverifiedBillNumbers = () => {
        if (!selectedBill) return false
        return poNumbers.some(po => !po.verified)
    }

    const isSubmitDisabled = () => {
        return isSendRequestDisabled() || hasUnverifiedBillNumbers()
    }

    const handleSubmit = () => {
        // Simplified submit handler
        console.log('Submit clicked')
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            // Handle enter key
        }
    }

    // Additional missing handlers for popups
    const handleCancel = () => {
        setShowModal(false)
        setSelectedBill(null)
        setPoNumbers([])
        setValidationResults({})
        setIsEditMode(false)
        setVerifiedBills({})
        setNoPoSelections({})
        setCheckedBills({})
        setOriginalData(null)
        setHasBeenSubmitted(false)
    }

    const handlePoNumberChange = (index, value) => {
        const numericValue = value.replace(/[^0-9]/g, '')
        const newPoNumbers = [...poNumbers]
        newPoNumbers[index] = numericValue
        setPoNumbers(newPoNumbers)
        if (numericValue && isAdminUser()) {
            setNoPoSelections(prev => ({ ...prev, [index]: false }))
        }
        setCheckedBills(prev => {
            const newCheckedBills = { ...prev }
            delete newCheckedBills[index]
            return newCheckedBills
        })
        setValidationResults(prev => {
            const newValidationResults = { ...prev }
            delete newValidationResults[index]
            return newValidationResults
        })
    }

    const handleNoPoChange = (index, checked) => {
        if (!isAdminUser()) {
            return
        }
        setNoPoSelections(prev => ({ ...prev, [index]: checked }))
        if (checked) {
            const newPoNumbers = [...poNumbers]
            newPoNumbers[index] = ''
            setPoNumbers(newPoNumbers)
            setCheckedBills(prev => {
                const newCheckedBills = { ...prev }
                delete newCheckedBills[index]
                return newCheckedBills
            })
            setValidationResults(prev => {
                const newValidationResults = { ...prev }
                delete newValidationResults[index]
                return newValidationResults
            })
        }
    }

    const renderInputFields = () => {
        const fields = []
        const noOfBills = selectedBill?.noOfBills || selectedBill?.no_of_bills || 0
        const hasExistingBills = selectedBill?.billVerifications && selectedBill.billVerifications.length > 0
        const vendorIdForSelected = selectedBill?.vendorId || selectedBill?.vendor_id || null
        for (let i = 0; i < noOfBills; i++) {
            const validation = validationResults[i]
            const hasValidation = validation !== undefined
            const isValid = validation?.matched
            const poNumber = poNumbers[i] || ''
            const isVerified = verifiedBills[i] || false
            const isNoPo = noPoSelections[i] || false
            let borderClass = 'border-gray-300'
            let bgClass = isEditMode ? 'bg-white' : 'bg-[#F2F2F2]'
            let tooltipText = null
            const persistedVerification = selectedBill?.billVerifications && selectedBill.billVerifications[i]
            if (hasValidation) {
                const validationMessage = validation.message
                if (isValid) {
                    borderClass = 'border-green-500'
                    tooltipText = 'Matched'
                } else if (validationMessage === 'Already Entered') {
                    borderClass = 'border-orange-500'
                    tooltipText = 'Already Entered'
                } else {
                    borderClass = 'border-red-500'
                    tooltipText = 'Not Matched'
                }
            } else if (persistedVerification) {
                const persistedBillNumber = persistedVerification.bill_number || persistedVerification.billNumber || ''
                const persistedIsVerified = persistedVerification.is_verified === true || persistedVerification.status === 'VERIFIED'
                if (persistedIsVerified) {
                    borderClass = 'border-green-500'
                    tooltipText = 'Matched'
                } else {
                    borderClass = 'border-red-500'
                    tooltipText = 'Not Matched'
                }
            }
            const showInput = isEditMode || !hasExistingBills
            fields.push(
                <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white">
                    <div className="relative group">
                        {showInput ? (
                            <div className="flex flex-col gap-2 items-center">
                                <input
                                    type="text"
                                    value={poNumber}
                                    onChange={(e) => handlePoNumberChange(i, e.target.value)}
                                    placeholder="Enter PO"
                                    className={`w-20 h-8 px-2 py-1 rounded text-sm text-center ${bgClass} focus:outline-none focus:bg-white transition-colors duration-200 placeholder-gray-400 border ${borderClass}`}
                                    disabled={isNoPo}
                                />
                                {isAdminUser() && (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            id={`no-po-${i}`}
                                            checked={isNoPo}
                                            onChange={(e) => handleNoPoChange(i, e.target.checked)}
                                            className="w-3 h-3"
                                        />
                                        <label htmlFor={`no-po-${i}`} className="text-xs text-gray-600 cursor-pointer">
                                            No PO
                                        </label>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                <div className={`w-20 h-8 px-2 py-1 rounded text-sm text-center bg-gray-50 border ${borderClass} flex items-center justify-center`}>
                                    <span className={isNoPo ? 'text-gray-500' : 'text-gray-700'}>
                                        {isNoPo ? 'No PO' : (poNumber || '-')}
                                    </span>
                                </div>
                            </div>
                        )}
                        {(tooltipText) && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                {tooltipText}
                            </div>
                        )}
                    </div>
                </div>
            )
        }
        return fields
    }

    const handleCheckPO = () => {
        console.log('Check PO clicked')
    }

    const handleApproveRequest = () => {
        console.log('Approve request clicked')
    }

    const handleRejectRequest = () => {
        console.log('Reject request clicked')
    }

    const handleSendRequest = () => {
        console.log('Send request clicked')
    }

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode)
    }

    const handlePreviousEntrySave = async (entryId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/bill-entry/update/${entryId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    enteredBy: previousEntryEditData.enteredBy,
                    enteredDate: previousEntryEditData.date
                })
            })
            if (!response.ok) {
                throw new Error(`Failed to update entry: ${response.statusText}`)
            }
            alert('Previous entry updated successfully!')
            await fetchExistingBillEntryDetails(selectedEntryBill.id)
            setEditingPreviousEntry(null)
            setPreviousEntryEditData({
                enteredBy: null,
                date: ''
            })
        } catch (error) {
            console.error('Error updating previous entry:', error)
            alert(`Error updating previous entry: ${error.message}`)
        }
    }

    const canEditEntry = (entry) => {
        if (isAdminUser()) {
            return true;
        }
        return entry.entered_by === username;
    }

    const handleEditPreviousEntry = (entry) => {
        setEditingPreviousEntry(entry.id)
        setPreviousEntryEditData({
            enteredBy: entry.entered_by,
            date: new Date(entry.entered_date).toISOString().split('T')[0]
        })
    }

    const handleEntryInputChange = (field, value) => {
        setEntryFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleDynamicFieldChange = (fieldId, value) => {
        setAdditionalFields(prev => prev.map(field =>
            field.id === fieldId ? { ...field, value } : field
        ))
    }

    const handleRemoveField = (fieldId) => {
        setAdditionalFields(prev => prev.filter(field => field.id !== fieldId))
    }

    const handleAddField = () => {
        const newField = {
            id: Date.now(),
            label: '',
            value: '',
            type: 'text'
        }
        setAdditionalFields(prev => [...prev, newField])
    }

    const handleEntrySubmit = async () => {
        if (!entryFormData.date) {
            alert('Please fill all required fields')
            return
        }
        try {
            const billEntryData = {
                vendor_payments_tracker_id: selectedEntryBill.id,
                entered_by: username,
                entered_date: entryFormData.date
            }
            const response = await fetch("https://backendaab.in/aabuildersDash/api/bill-entry/save", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(billEntryData)
            })
            if (!response.ok) {
                throw new Error(`Failed to save bill entry: ${response.statusText}`)
            }
            const savedEntry = await response.json()
            setBillData(prev => prev.map(bill =>
                bill.id === selectedEntryBill.id
                    ? { ...bill, entryStatus: 'Entered' }
                    : bill
            ))
            if (selectedEntryBill && apiData.length > 0) {
                setApiData(prev => prev.map(item =>
                    item.id === selectedEntryBill.id
                        ? { ...item, entry_status: 'Entered' }
                        : item
                ))
            }
            alert('Bill entry details saved successfully!')
            setShowEntryModal(false)
            setSelectedEntryBill(null)
            setEntryFormData({
                enteredBy: null,
                date: ''
            })
            setAdditionalFields([])
            await fetchTrackerData()
            await fetchExpensesData()
            await fetchAllBillEntries()
        } catch (error) {
            console.error('Error saving bill entry:', error)
            alert(`Error saving bill entry: ${error.message}`)
        }
    }

    const handleNumberInputChange = (e) => {
        const value = e.target.value
        if (value === '' || !isNaN(Number(value))) {
            setNumberInputValue(value)
            setHasStartedEditing(true)
        }
    }

    const handleAdjustmentAmountUpdate = async () => {
        if (numberInputValue === undefined || numberInputValue === null) {
            alert('Please enter an adjustment amount')
            return
        }
        const billId = selectedEntryBill?.id || selectedBill?.id
        if (!billId) {
            alert('No bill selected')
            return
        }
        const adjustmentAmount = numberInputValue === '' ? 0 : parseFloat(numberInputValue)
        if (numberInputValue !== '' && isNaN(adjustmentAmount)) {
            alert('Please enter a valid number for adjustment amount')
            return
        }
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${billId}/adjustment-amount?adjustmentAmount=${adjustmentAmount}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (response.ok) {
                if (selectedEntryBill) {
                    setSelectedEntryBill(prev => ({
                        ...prev,
                        adjustment_amount: adjustmentAmount,
                        adjustmentAmount: adjustmentAmount
                    }))
                }
                if (selectedBill) {
                    setSelectedBill(prev => ({
                        ...prev,
                        adjustment_amount: adjustmentAmount,
                        adjustmentAmount: adjustmentAmount
                    }))
                }
                setBillData(prev => prev.map(bill =>
                    bill.id === billId
                        ? { ...bill, adjustment_amount: adjustmentAmount, adjustmentAmount: adjustmentAmount }
                        : bill
                ))
                if (apiData.length > 0) {
                    setApiData(prev => prev.map(item =>
                        item.id === billId
                            ? { ...item, adjustment_amount: adjustmentAmount, adjustmentAmount: adjustmentAmount }
                            : item
                    ))
                }
                alert('Adjustment amount updated successfully')
                setNumberInputValue(adjustmentAmount === 0 ? '' : adjustmentAmount.toString())
                setNumberInputLocked(false)
                setHasStartedEditing(false)
                setShowEntryModal(false)
                setSelectedEntryBill(null)
            } else {
                const errorData = await response.json()
                alert(`Error updating adjustment amount: ${errorData.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Error updating adjustment amount:', error)
            alert(`Error updating adjustment amount: ${error.message}`)
        }
    }
    const handleCheck = async () => {
        if (!selectedEntryBill) {
            alert('No bill selected')
            return
        }
        const billId = selectedEntryBill.id
        const matchDetails = expenseMatchDetails[billId]

        if (!matchDetails || !matchDetails.matchingExpenses || matchDetails.matchingExpenses.length === 0) {
            alert('No matching expenses found for this bill')
            return
        }

        setCheckFilteredExpenses(matchDetails.matchingExpenses)
        setShowCheckModal(true)
    }
    const generateExpensePDF = () => {
        if (!checkFilteredExpenses || checkFilteredExpenses.length === 0) {
            alert('No expenses to generate PDF')
            return
        }
        const doc = new jsPDF({
            orientation: 'landscape'
        })
        const vendorName = getVendorNameById(selectedEntryBill?.vendor_id || selectedEntryBill?.vendorId)
        const totalAmount = checkFilteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('Matching Expenses Report', 14, 15)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text(`Vendor: ${vendorName}`, 14, 22)
        doc.text(`Total Entries: ${checkFilteredExpenses.length}`, 130, 22)
        doc.text(`Total Amount: ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 225, 22)
        const tableColumn = [
            'Time Stamp',
            'Date',
            'E.No',
            'Project Name',
            'Vendor',
            'A/C Type',
            'Quantity',
            'Amount',
            'Comments',
            'Category'
        ]
        const tableRows = checkFilteredExpenses.map(expense => [
            formatDate(expense.timestamp || expense.date),
            formatDateOnly(expense.date),
            expense.eno || '-',
            expense.siteName || '-',
            expense.vendor || '-',
            expense.accountType || '-',
            expense.quantity || '-',
            `${Number(expense.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            expense.comments || '-',
            expense.category || '-'
        ])
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            margin: { left: 10, right: 10, top: 30 },
            theme: 'grid',
            headStyles: {
                fillColor: [250, 246, 237],
                textColor: 0,
                fontStyle: 'bold',
                halign: 'left',
                fontSize: 9,
                lineWidth: 0.3
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [0, 0, 0],
                halign: 'left'
            },
            alternateRowStyles: { fillColor: [255, 255, 255] },
            columnStyles: {
                0: { cellWidth: 34 },
                1: { cellWidth: 20 },
                2: { cellWidth: 16 },
                3: { cellWidth: 54 },
                4: { cellWidth: 28 },
                5: { cellWidth: 27 },
                6: { cellWidth: 18 },
                7: { cellWidth: 26, halign: 'right' },
                8: { cellWidth: 20 },
                9: { cellWidth: 30 }
            },
            didDrawPage: function (data) {
                const pageHeight = doc.internal.pageSize.height
                doc.setFontSize(9)
                doc.text(`Page ${data.pageNumber}`, doc.internal.pageSize.width / 2, pageHeight - 5, { align: 'center' })
            }
        })
        const fileName = `Matching_Expenses_${vendorName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(fileName)
    }

    const handlePaymentCancel = () => {
        setShowPaymentModal(false)
        setSelectedPaymentBill(null)
        setPaymentEntries([
            {
                id: 1,
                date: '',
                amount: '',
                amountDisplay: '',
                mode: '',
                attachedFile: null,
                chequeNo: '',
                chequeDate: '',
                transactionNumber: '',
                accountNumber: ''
            }
        ])
        setExistingPaymentDetails(null)
        setLoadingPaymentDetails(false)
        setDiscount(0)
        setDiscountSubmitted(false)
        setActualAmount(0)
        setRemainingAmount(0)
        setOverallPaymentPdfFile(null)
        setUseCarryForward(false)
        setCarryForwardData([])
        setCarryForwardAmount(0)
        if (overallPdfInputRef.current) {
            overallPdfInputRef.current.value = '';
        }
    }

    const sanitizeAmountInput = (input) => {
        if (!input) return ''
        const cleaned = input.replace(/[^\d.]/g, '')
        if (!cleaned) return ''
        const parts = cleaned.split('.')
        const integerPart = parts[0] || ''
        const decimalPart = parts[1] ? parts[1].slice(0, 2) : ''
        return decimalPart ? `${integerPart}.${decimalPart}` : integerPart
    }

    const handlePaymentEntryChange = (entryId, field, value) => {
        setPaymentEntries(prev => prev.map(entry => {
            if (entry.id !== entryId) {
                return entry
            }
            if (field === 'amount') {
                const sanitized = sanitizeAmountInput(value)
                if (!sanitized) {
                    return {
                        ...entry,
                        amount: '',
                        amountDisplay: ''
                    }
                }
                const numericAmount = parseFloat(sanitized)
                const displayValue = Number.isNaN(numericAmount) ? '' : formatIndianCurrency(numericAmount)
                return {
                    ...entry,
                    amount: sanitized,
                    amountDisplay: displayValue
                }
            }
            return { ...entry, [field]: value }
        }))
    }

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
    }

    const handleFileAttachment = async (entryId, file) => {
        try {
            // Convert image to PDF if it's an image
            const processedFile = await convertImageToPdf(file);
            setPaymentEntries(prev => prev.map(entry =>
                entry.id === entryId ? { ...entry, attachedFile: processedFile } : entry
            ))
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file. Please try again.');
        }
    }

    const handleExistingPaymentFileUpload = async (paymentId, file) => {
        if (!file) return;

        try {
            // Convert image to PDF if it's an image
            const processedFile = await convertImageToPdf(file);

            // Find the payment details to generate a proper filename
            const payment = existingPaymentDetails?.find(p => p.id === paymentId);
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
            const vendorName = getVendorNameById(selectedPaymentBill?.vendor_id);
            const finalName = payment
                ? `${timestamp} ${vendorName !== '-' ? vendorName : 'Payment'} ${payment.vendor_bill_payment_mode || ''}`
                : processedFile.name;
            formData.append('file', processedFile);
            formData.append('file_name', finalName);
            const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('File upload failed');
            }

            const uploadResult = await uploadResponse.json();
            const billUrl = uploadResult.url;

            // Update the payment with bill_url using the update API
            const updateResponse = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/update/${paymentId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ bill_url: billUrl })
            });

            if (!updateResponse.ok) {
                throw new Error(`Failed to update bill URL: ${updateResponse.statusText}`);
            }

            // Update local state
            setExistingPaymentDetails(prev => prev.map(payment =>
                payment.id === paymentId ? { ...payment, bill_url: billUrl } : payment
            ));

            // Also update in apiData if present
            setApiData(prev => prev.map(bill => {
                if (bill.id === selectedPaymentBill?.id) {
                    return {
                        ...bill,
                        over_all_payment_pdf_url: bill.over_all_payment_pdf_url
                    };
                }
                return bill;
            }));

            alert('File uploaded and payment updated successfully!');
        } catch (error) {
            console.error('Error uploading file for existing payment:', error);
            alert('Error uploading file. Please try again.');
        }
    }

    const handleOverallPaymentPdfChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!selectedPaymentBill || !selectedPaymentBill.id) {
            alert('Please select a payment bill first');
            return;
        }

        setUploadingOverallPdf(true);

        try {
            // Convert image to PDF if it's an image
            const processedFile = await convertImageToPdf(file);
            setOverallPaymentPdfFile(processedFile);
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
            // Upload file to Google Drive
            const formData = new FormData();
            const vendorName = getVendorNameById(selectedPaymentBill?.vendor_id);
            // Format date as DD-MM-YYYY
            const billDate = selectedPaymentBill.bill_arrival_date || new Date().toISOString().split('T')[0];
            const dateObj = new Date(billDate);
            const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
            const displayVendorName = vendorName !== '-' ? vendorName : 'Overall Payment';
            const fileName = `${timestamp} ${displayVendorName} - summary bill.pdf`;
            formData.append('file', processedFile);
            formData.append('file_name', fileName);

            const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('File upload failed');
            }

            const uploadResult = await uploadResponse.json();
            const pdfUrl = uploadResult.url;

            // Update the overall payment PDF URL via API
            const billId = selectedPaymentBill.id; // This is the tracker ID
            const response = await fetch(
                `https://backendaab.in/aabuildersDash/api/vendor-payments/bills/${billId}/pdf-url?pdfUrl=${encodeURIComponent(pdfUrl)}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to update PDF URL: ${response.statusText}`);
            }

            const updatedTracker = await response.json();

            // Update the local state with the new PDF URL
            setSelectedPaymentBill(prev => ({
                ...prev,
                over_all_payment_pdf_url: pdfUrl,
                overAllPaymentPdfUrl: pdfUrl // Also set camelCase version for consistency
            }));

            // Also update in apiData if present
            setApiData(prev => prev.map(bill =>
                bill.id === billId ? {
                    ...bill,
                    over_all_payment_pdf_url: pdfUrl,
                    overAllPaymentPdfUrl: pdfUrl
                } : bill
            ));

            alert('PDF uploaded successfully!');
        } catch (error) {
            console.error('Error uploading overall payment PDF:', error);
            alert('Error uploading PDF. Please try again.');
            setOverallPaymentPdfFile(null);
        } finally {
            setUploadingOverallPdf(false);
            // Reset the file input
            if (overallPdfInputRef.current) {
                overallPdfInputRef.current.value = '';
            }
        }
    }

    const handleAddPaymentEntry = () => {
        const newEntry = {
            id: Date.now(),
            date: '',
            amount: '',
            amountDisplay: '',
            mode: '',
            attachedFile: null,
            chequeNo: '',
            chequeDate: '',
            transactionNumber: '',
            accountNumber: ''
        }
        setPaymentEntries(prev => [...prev, newEntry])
    }

    // Auto-fill amount when carry forward checkbox is checked
    useEffect(() => {
        if (useCarryForward && carryForwardAmount > 0 && paymentEntries.length > 0 && showPaymentModal) {
            const firstEntry = paymentEntries[0];
            // Only auto-fill if amount is empty
            if (!firstEntry.amount || firstEntry.amount === '') {
                const carryForwardToUse = Math.min(carryForwardAmount, remainingAmount);
                if (carryForwardToUse > 0) {
                    const displayValue = formatIndianCurrency(carryForwardToUse);
                    setPaymentEntries(prev => prev.map((entry, index) => {
                        if (index === 0) {
                            return {
                                ...entry,
                                amount: carryForwardToUse.toString(),
                                amountDisplay: displayValue,
                                mode: entry.mode || 'Carry Forward',
                                date: entry.date || new Date().toISOString().split('T')[0]
                            };
                        }
                        return entry;
                    }));
                }
            }
        } else if (!useCarryForward && paymentEntries.length > 0 && showPaymentModal) {
            // Clear amount when unchecked if it was set by carry forward
            const firstEntry = paymentEntries[0];
            if (firstEntry.mode === 'Carry Forward' && firstEntry.amount) {
                setPaymentEntries(prev => prev.map((entry, index) => {
                    if (index === 0) {
                        return {
                            ...entry,
                            amount: '',
                            amountDisplay: '',
                            mode: ''
                        };
                    }
                    return entry;
                }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useCarryForward, carryForwardAmount, remainingAmount, showPaymentModal])

    const handlePaymentSubmit = async () => {
        // Check if using carry forward only (no payment entries needed)
        const isUsingCarryForwardOnly = useCarryForward && carryForwardAmount > 0;

        // If not using carry forward only, validate payment entries
        if (!isUsingCarryForwardOnly) {
            const hasEmptyFields = paymentEntries.some(entry =>
                !entry.date || !entry.amount || !entry.mode
            )
            if (hasEmptyFields) {
                alert('Please fill all required fields in payment entries')
                return
            }
            const hasInvalidModeFields = paymentEntries.some(entry => {
                if (entry.mode === 'Cheque') {
                    return !entry.chequeNo || !entry.chequeDate
                }
                if (entry.mode === 'Net Banking' || entry.mode === 'Gpay' || entry.mode === 'PhonePe') {
                    return !entry.accountNumber
                }
                return false
            })
            if (hasInvalidModeFields) {
                alert('Please fill all required fields for the selected payment mode...')
                return
            }
        }
        try {
            // Filter out empty payment entries (for carry forward only case)
            const validPaymentEntries = paymentEntries.filter(entry =>
                entry.date && entry.amount && entry.mode
            );
            // Separate regular payments from carry forward entries
            const regularPaymentEntries = validPaymentEntries.filter(entry => entry.mode !== 'Carry Forward');
            const carryForwardEntries = validPaymentEntries.filter(entry => entry.mode === 'Carry Forward');
            const totalPaymentAmount = regularPaymentEntries.reduce((sum, entry) => {
                return sum + (parseFloat(entry.amount) || 0)
            }, 0)
            const currentReceivedAmount = actualAmount - remainingAmount;
            const newTotalReceived = currentReceivedAmount + totalPaymentAmount;
            const remainingAfterPayments = Math.max(0, actualAmount - newTotalReceived);
            // Calculate carry forward to use: either from entries or calculated amount
            let carryForwardToUse = 0;
            if (carryForwardEntries.length > 0) {
                // Sum carry forward amounts from entries
                carryForwardToUse = carryForwardEntries.reduce((sum, entry) => {
                    return sum + (parseFloat(entry.amount) || 0)
                }, 0);
            } else if (useCarryForward) {
                // Calculate how much carry forward can be used
                carryForwardToUse = Math.min(carryForwardAmount, remainingAfterPayments);
            }
            const newRemainingAmount = Math.max(0, remainingAfterPayments - carryForwardToUse);
            // Only process payment entries if there are valid ones
            const paymentDetailsPromises = validPaymentEntries.length > 0
                ? validPaymentEntries.map(async (entry, index) => {
                let billUrl = '';
                if (entry.attachedFile) {
                    try {
                        // Convert image to PDF if it's an image (already converted in handleFileAttachment, but double-check)
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
                        const processedFile = await convertImageToPdf(entry.attachedFile);
                        const formData = new FormData();
                        const vendorName = getVendorNameById(selectedPaymentBill?.vendor_id);
                        const finalName = `${timestamp} ${vendorName !== '-' ? vendorName : 'Payment'} ${entry.mode}`;
                        formData.append('file', processedFile);
                        formData.append('file_name', finalName);
                        const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
                            method: "POST",
                            body: formData,
                        });
                        if (!uploadResponse.ok) {
                            throw new Error('File upload failed');
                        }
                        const uploadResult = await uploadResponse.json();
                        billUrl = uploadResult.url;
                    } catch (error) {
                        console.error('Error during file upload:', error);
                        alert('Error during file upload. Please try again.');
                        return;
                    }
                }
                    // If mode is "Carry Forward", save amount in carry_forward_amount field, not amount field
                    const isCarryForward = entry.mode === 'Carry Forward';
                    const paymentData = {
                        vendor_payments_tracker_id: selectedPaymentBill.id,
                        date: entry.date,
                        actual_amount: actualAmount,
                        amount: isCarryForward ? 0 : (parseFloat(entry.amount) || 0),
                        discount_amount: index === 0 ? discount : 0,
                        carry_forward_amount: isCarryForward ? (parseFloat(entry.amount) || 0) : 0,
                        vendor_bill_payment_mode: entry.mode,
                        cheque_number: entry.chequeNo || '',
                        cheque_date: entry.chequeDate || '',
                        transaction_number: entry.transactionNumber || '',
                        account_number: entry.accountNumber || '',
                        bill_url: billUrl
                    }
                    const response = await fetch("https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/save", {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(paymentData)
                    })
                    if (!response.ok) {
                        throw new Error(`Failed to save payment details: ${response.statusText}`)
                    }
                    return await response.json()
                })
                : [];
            const savedPaymentDetails = await Promise.all(paymentDetailsPromises)

            // Create separate payment entry for carry forward if checkbox is checked AND not already in entries
            if (useCarryForward && carryForwardToUse > 0 && carryForwardEntries.length === 0) {
                try {
                    const carryForwardPaymentData = {
                        vendor_payments_tracker_id: selectedPaymentBill.id,
                        date: validPaymentEntries.length > 0
                            ? validPaymentEntries[0]?.date
                            : new Date().toISOString().split('T')[0],
                        actual_amount: actualAmount,
                        amount: 0,
                        discount_amount: 0,
                        carry_forward_amount: carryForwardToUse,
                        vendor_bill_payment_mode: "Carry Forward",
                        cheque_number: '',
                        cheque_date: '',
                        transaction_number: '',
                        account_number: '',
                        bill_url: ''
                    };
                    const carryForwardPaymentResponse = await fetch("https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/save", {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(carryForwardPaymentData)
                    });
                    if (!carryForwardPaymentResponse.ok) {
                        throw new Error(`Failed to save carry forward payment: ${carryForwardPaymentResponse.statusText}`);
                    }
                } catch (error) {
                    console.error("Error saving carry forward payment:", error);
                    alert(`Error saving carry forward payment: ${error.message}`);
                }
            }

            for (let i = 0; i < validPaymentEntries.length; i++) {
                const entry = validPaymentEntries[i];
                const savedPaymentDetail = savedPaymentDetails[i];
                const billUrl = savedPaymentDetail?.bill_url || '';

                // Only send to weekly-payment-bills/save for Non-Cash payment modes
                if (entry.mode !== 'Cash' && entry.mode !== 'Carry Forward') {
                    const weeklyPaymentBillPayload = {
                        date: entry.date,
                        created_at: new Date().toISOString(),
                        contractor_id: null,
                        vendor_id: selectedPaymentBill.vendor_id,
                        employee_id: null,
                        project_id: 10,
                        type: "Vendor Bill Payment",
                        bill_payment_mode: entry.mode,
                        amount: parseFloat(entry.amount) || 0,
                        status: true,
                        weekly_number: "",
                        weekly_payment_expense_id: null,
                        advance_portal_id: null,
                        staff_advance_portal_id: null,
                        claim_payment_id: null,
                        cheque_number: entry.chequeNo || null,
                        cheque_date: entry.chequeDate || null,
                        transaction_number: entry.transactionNumber || null,
                        account_number: entry.accountNumber || null,
                        vendor_payment_tracker_id: selectedPaymentBill.id,
                        tenant_id: null,
                        tenant_complex_name: null,
                    };
                    try {
                        const weeklyPaymentBillResponse = await fetch(
                            "https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save",
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(weeklyPaymentBillPayload)
                            }
                        );
                        if (!weeklyPaymentBillResponse.ok) {
                            console.error("❌ Weekly payment bill submission failed for entry:", entry);
                        } else {
                            console.log("✅ Weekly payment bill submitted:", weeklyPaymentBillPayload);
                        }
                    } catch (error) {
                        console.error("❌ Error submitting weekly payment bill:", error);
                    }
                }

                // Only send to weekly-expenses/save for Cash payment mode
                if (entry.mode === 'Cash') {
                    const weeklyExpensePayload = {
                        date: entry.date,
                        created_at: new Date().toISOString(),
                        contractor_id: null,
                        vendor_id: selectedPaymentBill.vendor_id,
                        employee_id: null,
                        project_id: 10,
                        type: "Vendor Bill Payment",
                        amount: parseFloat(entry.amount) || 0,
                        status: true,
                        weekly_number: "",
                        period_start_date: null,
                        period_end_date: null,
                        advance_portal_id: null,
                        staff_advance_portal_id: null,
                        loan_portal_id: null,
                        rent_management_id: null,
                        expenses_entry_id: null,
                        vendor_payment_tracker_id: selectedPaymentBill.id,
                        send_to_expenses_entry: false,
                        bill_copy_url: billUrl
                    };
                    try {
                        const weeklyExpenseResponse = await fetch(
                            "https://backendaab.in/aabuildersDash/api/weekly-expenses/save",
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(weeklyExpensePayload)
                            }
                        );
                        if (!weeklyExpenseResponse.ok) {
                            console.error("❌ Weekly expense submission failed for cash payment:", entry);
                        } else {
                            console.log("✅ Weekly expense submitted for cash payment:", weeklyExpensePayload);
                        }
                    } catch (error) {
                        console.error("❌ Error submitting weekly expense for cash payment:", error);
                    }
                }
            }
            // Handle carry forward if checkbox is checked
            // Calculate actual carry forward amount used (from payment entries or separate entry)
            let actualCarryForwardUsed = 0;
            if (carryForwardEntries.length > 0) {
                // Sum carry forward amounts from payment entries
                actualCarryForwardUsed = carryForwardEntries.reduce((sum, entry) => {
                    return sum + (parseFloat(entry.amount) || 0)
                }, 0);
            } else if (useCarryForward && carryForwardToUse > 0) {
                // Use the separate carry forward entry amount
                actualCarryForwardUsed = carryForwardToUse;
            }
            if (useCarryForward && actualCarryForwardUsed > 0) {
                try {
                    // Create a carry forward entry with bill_amount to subtract the used amount
                    const carryForwardPayload = {
                        type: "Bill Payment",
                        date: validPaymentEntries.length > 0
                            ? validPaymentEntries[0]?.date
                            : new Date().toISOString().split('T')[0],
                        vendor_id: selectedPaymentBill.vendor_id,
                        payment_mode: "Carry Forward",
                        amount: 0,
                        bill_amount: actualCarryForwardUsed,
                        refund_amount: 0
                    };
                    const carryForwardResponse = await fetch("https://backendaab.in/aabuildersDash/api/vendor_carry_forward/save", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(carryForwardPayload)
                    });
                    if (!carryForwardResponse.ok) {
                        console.error("Failed to update carry forward amount");
                    } else {
                        console.log("Carry forward amount updated successfully");
                    }
                } catch (error) {
                    console.error("Error updating carry forward:", error);
                }
            }

            setShowPaymentModal(false)
            setPaymentEntries([
                {
                    id: 1,
                    date: '',
                    amount: '',
                    amountDisplay: '',
                    mode: '',
                    attachedFile: null,
                    chequeNo: '',
                    chequeDate: '',
                    transactionNumber: '',
                    accountNumber: ''
                }
            ])
            setExistingPaymentDetails(null)
            setLoadingPaymentDetails(false)
            setDiscount(0)
            setDiscountSubmitted(false)
            setActualAmount(0)
            setRemainingAmount(0)
            setUseCarryForward(false)
            setCarryForwardData([])
            setCarryForwardAmount(0)

            await fetchTrackerData()
            await fetchExpensesData()
            await fetchAllBillEntries()
            const updatedStatus = await getPaymentStatus(selectedPaymentBill);

            setPaymentStatuses(prev => ({
                ...prev,
                [selectedPaymentBill.id]: updatedStatus
            }));

            alert('Payment details saved successfully!');
        } catch (error) {
            console.error('Error saving payment details:', error)
            alert(`Error saving payment details: ${error.message}`)
        }
    }

    const formatIndianCurrency = (amount) => {
        if (!amount) return '₹0'
        return `₹${parseInt(amount).toLocaleString()}`
    }
    const formatDateOnly = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    const formatDate = (dateString) => {
        if (!dateString) return '-';
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
    }

    // Fetch contractor names
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
                type: "Contractor"
            }));
            setContractorOptions(formattedData);
        } catch (error) {
            console.error("Error fetching contractor names:", error);
        }
    };

    // Fetch tracker data
    const fetchTrackerData = async () => {
        setLoading(true);
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
            try {
                const data = await response.json();
                setApiData(data);
            } catch (parseError) {
                console.warn("Detected circular reference in API response. This needs to be fixed in the backend.");
                setError("Invalid data format received from server");
            }
        } catch (error) {
            console.error("Error fetching tracker data:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all bill entries
    const fetchAllBillEntries = async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/bill-entry/getAll", {
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
            setAllBillEntries(data);
        } catch (error) {
            console.error("Error fetching bill entries:", error);
        }
    };

    // Fetch expenses data (use same endpoint as PendingBill for consistent matching)
    const fetchExpensesData = async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuilderDash/expenses_form/get_form", {
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
            setExpensesData(data);
        } catch (error) {
            console.error("Error fetching expenses data:", error);
        }
    };

    // Calculate expense match status for bills (ported from PendingBill)
    const calculateExpenseMatchStatus = (expenses, billEntries = allBillEntries) => {
        const matchStatus = {};
        const billMap = {};
        apiData.forEach(bill => {
            billMap[bill.id] = bill;
        });
        const groupedBillEntries = {};
        billEntries.forEach(billEntry => {
            const trackerId = billEntry.vendor_payments_tracker_id;
            if (!groupedBillEntries[trackerId]) {
                groupedBillEntries[trackerId] = [];
            }
            groupedBillEntries[trackerId].push(billEntry);
        });
        Object.keys(groupedBillEntries).forEach((trackerId) => {
            const billEntriesForTracker = groupedBillEntries[trackerId];
            const bill = billMap[trackerId];
            if (!bill) {
                matchStatus[trackerId] = 'no_match';
                return;
            }
            const vendorName = bill.vendor_name || getVendorNameById(bill.vendor_id);
            const billAmount = parseFloat(bill.total_amount) || 0;
            if (vendorName && billAmount > 0) {
                const enteredDates = [...new Set(billEntriesForTracker.map(entry => entry.entered_date).filter(Boolean))];
                if (enteredDates.length > 0) {
                    const billEnteredDates = enteredDates.map(date => new Date(date).toISOString().split('T')[0]);
                    const dateMatchedExpenses = expenses.filter((expense) => {
                        const expenseDate = new Date(expense.timestamp || expense.date).toISOString().split('T')[0];
                        return billEnteredDates.includes(expenseDate);
                    });
                    const vendorMatchedExpenses = dateMatchedExpenses.filter((expense) => expense.vendor === vendorName);
                    const matchingExpenses = vendorMatchedExpenses.filter((expense) => (
                        expense.accountType === 'Bill Payments' || expense.accountType === 'Bill Refund' || expense.accountType === 'Bill Payments + Claim'
                    ));
                    const totalExpenseAmount = matchingExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
                    const adjustmentAmount = parseFloat(bill.adjustment_amount) || 0;
                    const adjustedBillAmount = billAmount - adjustmentAmount;
                    const matchDetails = {
                        matchingExpensesCount: matchingExpenses.length,
                        totalExpenseAmount,
                        billAmount,
                        adjustmentAmount,
                        adjustedBillAmount,
                        difference: Math.abs(totalExpenseAmount - adjustedBillAmount),
                        matchingExpenses,
                        enteredDates,
                    };
                    if (matchingExpenses.length === 0) {
                        matchStatus[trackerId] = 'no_match';
                    } else if (Math.abs(totalExpenseAmount - adjustedBillAmount) < 0.01) {
                        matchStatus[trackerId] = 'complete_match';
                    } else if (totalExpenseAmount > 0) {
                        matchStatus[trackerId] = 'partial_match';
                    } else {
                        matchStatus[trackerId] = 'no_match';
                    }
                    setExpenseMatchDetails(prev => ({
                        ...prev,
                        [trackerId]: matchDetails,
                    }));
                } else {
                    matchStatus[trackerId] = 'no_match';
                }
            } else {
                matchStatus[trackerId] = 'no_match';
            }
        });
        setExpenseMatchStatus(matchStatus);
    };
    // Get bill verification status
    const getBillVerificationStatus = (item) => {
        if (!item.billVerifications || item.billVerifications.length === 0) {
            return 'Verify'
        }
        const allVerified = item.billVerifications.every(verification =>
            verification.is_verified === true || verification.status === 'VERIFIED'
        )
        const anyVerified = item.billVerifications.some(verification =>
            verification.is_verified === true || verification.status === 'VERIFIED'
        )
        if (allVerified) {
            return '✓ Verified'
        } else if (anyVerified) {
            return 'Verified'
        } else {
            return 'Verify'
        }
    }
    // Get entry status text
    const getEntryStatusText = (item) => {
        const matchStatus = expenseMatchStatus[item.id];
        const baseStatus = item.entry_status || 'Entry';
        if (matchStatus === 'complete_match') {
            return '✓ Entered';
        } else if (matchStatus === 'partial_match') {
            return 'Entered';
        }
        return baseStatus;
    };
    // Check if all bills are verified
    const isAllBillsVerified = (item) => {
        if (!item || !item.billVerifications || item.billVerifications.length === 0) return false
        return item.billVerifications.every(v => v.is_verified === true || v.status === 'VERIFIED')
    }
    // Check if entry is completed
    const isEntryCompleted = (item) => {
        const entryStatus = item.entry_status || 'Entry'
        const matchStatus = expenseMatchStatus[item.id]
        return entryStatus === 'Entered' || entryStatus === '✓ Entered' || matchStatus === 'complete_match'
    }
    // Get payment status
    const getPaymentStatus = async (item) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/get/${item.id}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                return 'To Pay'
            }
            const paymentDetails = await response.json();
            if (!paymentDetails || paymentDetails.length === 0) {
                return 'To Pay'
            }
            const totalPaid = paymentDetails.reduce((sum, payment) => {
                const amount = parseFloat(payment.amount) || 0;
                const carryForwardAmount = parseFloat(payment.carry_forward_amount) || 0;
                return sum + amount + carryForwardAmount;
            }, 0);
            const totalDiscount = paymentDetails.reduce((sum, payment) => sum + (parseFloat(payment.discount_amount) || 0), 0);
            const actualAmount = parseFloat(item.total_amount) || 0;
            const remainingAmount = Math.max(0, actualAmount - totalPaid - totalDiscount);
            if (remainingAmount === 0) {
                return '✓ Paid'
            } else if (totalPaid > 0) {
                return 'Paid'
            } else {
                return 'To Pay'
            }
        } catch (error) {
            console.error('Error fetching payment status:', error);
            return 'To Pay'
        }
    }
    // Get button class for styling (copied from PendingBill)
    const getButtonClass = (status, billId = null) => {
        // Check if this is for Entry Status column and we have expense match data
        if (billId && expenseMatchStatus[billId]) {
            const matchStatus = expenseMatchStatus[billId];
            if (matchStatus === 'complete_match') {
                return 'px-4 py-2 rounded-full text-sm font-semibold bg-[#E2F9E1] border cursor-pointer transition-all duration-200 hover:bg-green-200'
            } else if (matchStatus === 'partial_match') {
                return 'px-4 py-2 rounded-full text-sm font-semibold bg-[#FFD39E] border cursor-pointer transition-all duration-200'
            }
        }
        if (status === '✓ Verified') {
            return 'px-4 py-1.5 rounded-full text-sm font-semibold bg-[#E2F9E1] border cursor-pointer transition-all duration-200'
        } else if (status === 'Verified') {
            return 'px-5 py-1.5 rounded-full text-sm p-2 font-semibold border  cursor-pointer transition-all duration-200'
        } else if (status === 'Entered') {
            return 'px-6 py-2 rounded-full text-sm font-semibold bg-[#FFD39E] border  cursor-pointer transition-all duration-200'
        } else if (status === '✓ Paid') {
            return 'px-6 py-1.5 rounded-full text-sm font-semibold bg-[#E2F9E1] border border-green-500 cursor-pointer transition-all duration-200'
        } else if (status === 'Paid') {
            return 'px-6 py-2 rounded-full text-sm p-2 font-semibold bg-[#FFD39E]  border  cursor-pointer transition-all duration-200'
        } else {
            return 'px-4 py-2 rounded-full text-sm font-semibold bg-[#FAF6ED] border border-gray-300 cursor-pointer transition-all duration-200 hover:bg-gray-100'
        }
    }
    // Get vendor name by ID (copied from PendingBill)
    const getVendorNameById = (vendorId) => {
        if (!vendorId) return '-'
        const vendor = vendorOptions.find(option => option.id === vendorId)
        return vendor ? vendor.label : `Vendor ID: ${vendorId}`
    }
    // Check if bill is fully finished (Verified + Entered + Paid)
    const isFullyFinished = (item) => {
        const verificationStatus = getBillVerificationStatus(item);
        const entryStatus = getEntryStatusText(item);
        const paymentStatus = paymentStatuses[item.id] || 'To Pay';
        return verificationStatus === '✓ Verified' &&
            (entryStatus === '✓ Entered' || entryStatus === 'Entered') &&
            paymentStatus === '✓ Paid';
    }
    // Sort data based on current sort configuration
    const applySorting = (data) => {
        if (!sortConfig.key) return data
        return [...data].sort((a, b) => {
            let aValue, bValue
            switch (sortConfig.key) {
                case 'timestamp': {
                    const getTimestampValue = (item) => {
                        const timestampValue = item.created_at || item.createdAt || item.timestamp
                        return timestampValue ? new Date(timestampValue) : new Date(0)
                    }
                    aValue = getTimestampValue(a)
                    bValue = getTimestampValue(b)
                    break
                }
                case 'bill_arrival_date':
                    aValue = new Date(a.bill_arrival_date || 0)
                    bValue = new Date(b.bill_arrival_date || 0)
                    break
                case 'vendor_name':
                    aValue = getVendorNameById(a.vendor_id)
                    bValue = getVendorNameById(b.vendor_id)
                    break
                case 'bill_verification':
                    aValue = getBillVerificationStatus(a)
                    bValue = getBillVerificationStatus(b)
                    break
                case 'entry_status':
                    aValue = getEntryStatusText(a)
                    bValue = getEntryStatusText(b)
                    break
                case 'payment_status':
                    aValue = paymentStatuses[a.id] || 'To Pay'
                    bValue = paymentStatuses[b.id] || 'To Pay'
                    break
                default:
                    return 0
            }
            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1
            }
            return 0
        })
    }
    // Handle sort
    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }))
    }
    // Filter change handlers
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const clearFilters = () => {
        setFilters({
            vendorName: null,
            fromDate: '',
            toDate: '',
            paymentStatus: ''
        });
    };
    // Filter data function (can filter any provided base dataset)
    const getFilteredData = (baseData = apiData) => {
        let filteredData = [...baseData];
        // Filter by vendor name
        if (filters.vendorName) {
            const selectedVendorId = filters.vendorName.id;
            filteredData = filteredData.filter(item =>
                item.vendor_id === selectedVendorId || item.vendorId === selectedVendorId
            );
        }
        // Filter by date range
        if (filters.fromDate) {
            filteredData = filteredData.filter(item => {
                const itemDate = new Date(item.bill_arrival_date);
                const fromDate = new Date(filters.fromDate);
                return itemDate >= fromDate;
            });
        }
        if (filters.toDate) {
            filteredData = filteredData.filter(item => {
                const itemDate = new Date(item.bill_arrival_date);
                const toDate = new Date(filters.toDate);
                return itemDate <= toDate;
            });
        }
        // Filter by payment status
        if (filters.paymentStatus) {
            filteredData = filteredData.filter(item => {
                const paymentStatus = paymentStatuses[item.id] || 'To Pay';
                switch (filters.paymentStatus) {
                    case 'to-pay':
                        return paymentStatus === 'To Pay';
                    case 'paid':
                        return paymentStatus === '✓ Paid' || paymentStatus === 'Paid';
                    case 'fully-paid':
                        return paymentStatus === '✓ Paid';
                    case 'partially-paid':
                        return paymentStatus === 'Paid';
                    default:
                        return false;
                }
            });
        }
        return filteredData;
    };
    // Load payment statuses for all bills
    const loadPaymentStatuses = async () => {
        const statuses = {};
        for (const item of apiData) {
            const status = await getPaymentStatus(item);
            statuses[item.id] = status;
        }
        setPaymentStatuses(statuses);
    };
    // Show all bills (like PendingBill) instead of only fully paid bills
    const getAllBills = () => {
        return apiData;
    };
    // Handle edit click
    const handleEditClick = (item) => {
        setSelectedEditItem(item)
        const vendorOption = vendorOptions.find(v => v.id === item.vendor_id) ||
            contractorOptions.find(c => c.id === item.vendor_id);
        const formData = {
            billArrivalDate: item.bill_arrival_date ? new Date(item.bill_arrival_date).toISOString().split('T')[0] : '',
            vendorId: vendorOption || null,
            noOfBills: item.no_of_bills || item.noOfBills || '',
            totalAmount: item.total_amount || ''
        }
        setEditFormData(formData)
        setShowEditModal(true)
    }
    // Handle edit input change
    const handleEditInputChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }
    // Handle edit submit
    const handleEditSubmit = async () => {
        if (!selectedEditItem) return
        setEditLoading(true)
        try {
            const payload = {
                bill_arrival_date: editFormData.billArrivalDate || (selectedEditItem.bill_arrival_date ?
                    new Date(selectedEditItem.bill_arrival_date).toISOString().split('T')[0] : ''),
                vendor_id: editFormData.vendorId?.id || selectedEditItem.vendor_id,
                no_of_bills: parseInt(editFormData.noOfBills) || selectedEditItem.no_of_bills || selectedEditItem.noOfBills || 0,
                total_amount: parseFloat(editFormData.totalAmount) || selectedEditItem.total_amount || 0
            }
            const originalDate = selectedEditItem.bill_arrival_date ?
                new Date(selectedEditItem.bill_arrival_date).toISOString().split('T')[0] : ''
            const originalVendorId = selectedEditItem.vendor_id
            const originalNoOfBills = selectedEditItem.no_of_bills || selectedEditItem.noOfBills || 0
            const originalTotalAmount = selectedEditItem.total_amount || 0
            const hasChanges = (
                payload.bill_arrival_date !== originalDate ||
                payload.vendor_id !== originalVendorId ||
                payload.no_of_bills !== parseInt(originalNoOfBills) ||
                payload.total_amount !== parseFloat(originalTotalAmount)
            )
            if (!hasChanges) {
                alert('No changes detected. Please modify at least one field.')
                setEditLoading(false)
                return
            }
            const response = await axios.put(
                `https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${selectedEditItem.id}/update-details`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            if (response.status === 200) {
                alert('Tracker details updated successfully!')
                setShowEditModal(false)
                setSelectedEditItem(null)
                setEditFormData({
                    billArrivalDate: '',
                    vendorId: null,
                    noOfBills: '',
                    totalAmount: ''
                })
                window.location.reload()
            }
        } catch (error) {
            console.error('Error updating tracker details:', error)
            alert(`Failed to update tracker details: ${error.response?.data?.message || error.message}`)
        } finally {
            setEditLoading(false)
        }
    }
    // Handle edit cancel
    const handleEditCancel = () => {
        setShowEditModal(false)
        setSelectedEditItem(null)
        setEditFormData({
            billArrivalDate: '',
            vendorId: null,
            noOfBills: '',
            totalAmount: ''
        })
    }
    // Handle delete
    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this tracker? This action cannot be undone.");
        if (!confirmed) {
            return;
        }
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-payments/delete/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const message = await response.text();
                alert(message);
                // Remove from apiData
                setApiData(prev => prev.filter(item => item.id !== id));
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to delete tracker');
            }
        } catch (error) {
            console.error('Error deleting tracker:', error);
            alert(`An error occurred while deleting the tracker: ${error.message}`);
        }
    }
    useEffect(() => {
        fetchVendorNames();
        fetchContractorNames();
        fetchTrackerData();
        fetchAllBillEntries();
        fetchExpensesData();
        fetchAccountDetails();
        fetchUserList();
    }, []);
    // Fetch account details
    const fetchAccountDetails = async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/account-details/getAll", {
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
            setAccountDetails(data);
        } catch (error) {
            console.error("Error fetching account details:", error);
        }
    };
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderWidth: '2px',
            height: '45px',
            borderRadius: '8px',
            borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
            '&:hover': {
                borderColor: 'rgba(191, 152, 83, 0.2)',
            }
        }),
    };
    // Fetch user list
    const fetchUserList = async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuilderDash/api/user/all", {
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
            setUserList(data);
        } catch (error) {
            console.error("Error fetching user list:", error);
        }
    };
    useEffect(() => {
        setCombinedOptions([...vendorOptions, ...contractorOptions]);
    }, [vendorOptions, contractorOptions]);
    useEffect(() => {
        if (apiData.length > 0) {
            loadPaymentStatuses();
        }
    }, [apiData]);
    useEffect(() => {
        if (apiData.length > 0 && allBillEntries.length > 0 && expensesData.length > 0) {
            calculateExpenseMatchStatus(expensesData, allBillEntries);
        }
    }, [apiData, allBillEntries, expensesData]);
    useEffect(() => {
        if (Object.keys(paymentStatuses).length > 0) {
            console.log('Payment statuses loaded:', paymentStatuses);
        }
    }, [paymentStatuses]);
    const baseData = apiData.filter(isFullyFinished);
    const filteredData = getFilteredData(baseData);
    const sortedData = applySorting(filteredData);
    return (
        <div className="">
            <div className="bg-white p-5  mb-5 ml-10 mr-10 h-[128px]">
                <div className="flex flex-wrap justify-between gap-5 ml-5 text-left items-center">
                    <div className="flex flex-wrap gap-5">
                        <div className=" ">
                            <label className="block mb-1 font-semibold ">Vendor Name</label>
                            <Select
                                options={combinedOptions}
                                value={filters.vendorName}
                                onChange={(selectedOption) => handleFilterChange("vendorName", selectedOption)}
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
                                value={filters.fromDate}
                                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                                placeholder="Select Date"
                                className="w-[168px] h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none "
                            />
                        </div>
                        <div className=" ">
                            <label className="block mb-1 font-semibold ">To Date</label>
                            <input
                                type="date"
                                value={filters.toDate}
                                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                                placeholder="Select Date"
                                className="w-[168px] h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none "
                            />
                        </div>
                        <div className="">
                            <label className="block mb-1 font-semibold ">Payment Status</label>
                            <select value={filters.paymentStatus} onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                                className="w-[172px] h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none "
                            >
                                <option value="">Select status</option>
                                <option value="to-pay">To Pay</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button onClick={clearFilters} className="px-4 py-2 bg-[#BF9853] text-white rounded transition-colors duration-200 text-sm font-medium">
                            Clear
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white p-5 ml-10 mr-10">
                <div className="mb-4 ml-5 mr-5">
                    <div className="text-sm text-gray-600">
                        Showing {filteredData.length} of {baseData.length} entries
                        {(filters.vendorName || filters.fromDate || filters.toDate || filters.paymentStatus) && (
                            <span className="ml-2 text-blue-600">(filtered)</span>
                        )}
                    </div>
                </div>
                <div className='border-l-8 overflow-y-auto border-l-[#BF9853] h-[500px] rounded-lg ml-5 mr-5'>
                    <div className="">
                        <table className="w-full border-collapse">
                            <thead className="bg-[#FAF6ED] sticky top-0 z-90">
                                <tr>
                                    <th className="px-2 py-3 text-left font-semibold">SI.No</th>
                                    <th className="px-2 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                        onClick={() => handleSort('timestamp')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Time Stamp
                                            {sortConfig.key === 'timestamp' && (
                                                <span className="text-xs">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                        onClick={() => handleSort('bill_arrival_date')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Bill Arrival Date
                                            {sortConfig.key === 'bill_arrival_date' && (
                                                <span className="text-xs">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                        onClick={() => handleSort('vendor_name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Vendor Name
                                            {sortConfig.key === 'vendor_name' && (
                                                <span className="text-xs">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left font-semibold">No of Bills</th>
                                    <th className="px-2 py-3 text-left font-semibold">Total Amount</th>
                                    <th className="px-2 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                        onClick={() => handleSort('bill_verification')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Bill verification
                                            {sortConfig.key === 'bill_verification' && (
                                                <span className="text-xs">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                        onClick={() => handleSort('entry_status')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Entry Status
                                            {sortConfig.key === 'entry_status' && (
                                                <span className="text-xs">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                        onClick={() => handleSort('payment_status')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Payment Status
                                            {sortConfig.key === 'payment_status' && (
                                                <span className="text-xs">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left font-semibold">Summary</th>
                                    <th className="px-2 py-3 text-left font-semibold">Activity</th>
                                </tr>
                            </thead>
                            <tbody className="">
                                {loading && (
                                    <tr>
                                        <td colSpan="11" className="px-2 py-8 text-center text-sm text-gray-500">
                                            Loading data...
                                        </td>
                                    </tr>
                                )}
                                {error && (
                                    <tr>
                                        <td colSpan="11" className="px-2 py-8 text-center text-sm text-red-500">
                                            Error loading data: {error}
                                        </td>
                                    </tr>
                                )}
                                {sortedData.length === 0 && !loading && !error && (
                                    <tr>
                                        <td colSpan="11" className="px-2 py-8 text-center text-sm text-gray-500">
                                            No bills found.
                                            {Object.keys(paymentStatuses).length === 0 && " (Payment statuses still loading...)"}
                                        </td>
                                    </tr>
                                )}
                                {sortedData.map((item, index) => (
                                    <tr key={`api-${item.id || index}`} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}`}>
                                        <td className="px-2 py-3 text-left text-sm font-semibold border-b border-gray-100">{index + 1}</td>
                                        <td className="px-2 py-3 text-left text-sm font-semibold border-b border-gray-100">
                                            {item.created_at ? (
                                                new Date(item.created_at).toLocaleString('en-GB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })
                                            ) : item.createdAt ? (
                                                new Date(item.createdAt).toLocaleString('en-GB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })
                                            ) : item.timestamp ? (
                                                new Date(item.timestamp).toLocaleString('en-GB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })
                                            ) : '-'}
                                        </td>
                                        <td className="px-2 text-left py-3 text-sm font-semibold border-b border-gray-100">
                                            {item.bill_arrival_date ? new Date(item.bill_arrival_date).toLocaleDateString('en-GB') : '-'}
                                        </td>
                                        <td className="px-2 py-3 text-left text-sm font-semibold border-b border-gray-100">
                                            {getVendorNameById(item.vendor_id)}
                                        </td>
                                        <td className="px-2 py-3 text-left text-sm font-semibold border-b border-gray-100">
                                            {item.no_of_bills || item.noOfBills || '-'}
                                        </td>
                                        <td className="px-2 py-3 text-right pr-10 text-sm font-semibold border-b border-gray-100">
                                            {item.total_amount ? `₹${parseInt(item.total_amount).toLocaleString()}` : '-'}
                                        </td>
                                        <td className=" py-3 text-left text-sm font-semibold border-b border-gray-100">
                                            <div className="">
                                                <button className={getButtonClass(getBillVerificationStatus(item))}
                                                    style={getBillVerificationStatus(item) === 'Verified' ? { backgroundColor: '#FFD39E' } : {}}
                                                    onClick={() => handleVerifyClick(item)}
                                                >
                                                    {getBillVerificationStatus(item)}
                                                </button>
                                            </div>
                                        </td>
                                        <td className=" py-3 text-sm text-left border-b border-gray-100">
                                            <div className="">
                                                <button className={`${getButtonClass(item.entry_status || 'Entry', item.id)}`}
                                                    onClick={() => handleEntryClick(item)}
                                                >
                                                    {getEntryStatusText(item)}
                                                </button>
                                            </div>
                                        </td>
                                        <td className=" py-3 text-left pr-4 text-sm border-b border-gray-100">
                                            <button
                                                className={`${getButtonClass(paymentStatuses[item.id] || 'To Pay')}`}
                                                onClick={() => handlePaymentClick(item)}
                                            >
                                                {paymentStatuses[item.id] || 'To Pay'}
                                            </button>
                                        </td>
                                        <td className="px-2 py-3 text-left text-sm border-b border-gray-100">
                                            {(item.over_all_payment_pdf_url || item.overAllPaymentPdfUrl) ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const pdfUrl = item.over_all_payment_pdf_url || item.overAllPaymentPdfUrl;
                                                        if (pdfUrl) {
                                                            window.open(pdfUrl, '_blank', 'noopener,noreferrer');
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 text-sm font-medium text-[#BF9853] bg-white border border-[#BF9853] rounded-lg hover:bg-[#FAF6ED] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:ring-opacity-30"
                                                >
                                                    View
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-3 text-left text-sm border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="px-2 py-1.5 transition-colors duration-200 flex items-center justify-start hover:bg-gray-100 rounded"
                                                    onClick={() => handleEditClick(item)}
                                                >
                                                    <img src={edit} alt="edit" className="w-4 h-4" />
                                                </button>
                                                {isAdminUser() && (
                                                    <button
                                                        className="px-2 py-1.5 transition-colors duration-200 flex items-center justify-start hover:bg-gray-100 rounded"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <img src={deletes} alt="delete" className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
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
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] shadow-lg flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-700 text-sm">
                                        {selectedBill?.request_approved ? (
                                            <>
                                                Request has been approved. You can proceed with the bills.
                                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                    Approved
                                                </span>
                                            </>
                                        ) : areAllBillsVerifiedAndNotPaid() ? (
                                            <>
                                                All bills have been verified successfully. No need to send request.
                                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    All Verified
                                                </span>
                                            </>
                                        ) : selectedBill?.send_request ? (
                                            isAdminUser() ? (
                                                <>
                                                    Request has been sent. Admin can approve or reject the request.
                                                </>
                                            ) : (
                                                <>
                                                    Request has been sent. You can only view the bills now.
                                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                        Request Sent
                                                    </span>
                                                </>
                                            )
                                        ) : (
                                            <>
                                                Enter PO numbers or select "No PO" (Max: {selectedBill?.noOfBills || selectedBill?.no_of_bills || 0})
                                                {isSendRequestDisabled() && !hasUnverifiedBillNumbers() && (
                                                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                        Enter bill numbers to enable Send Request
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </p>
                                </div>
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 text-xl"
                                    onClick={handleCancel}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                {renderInputFields()}
                            </div>
                        </div>
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex-shrink-0">
                            <div className="flex justify-between items-center gap-3">
                                <div className="flex gap-3">
                                    {(!selectedBill?.send_request || isAdminUser()) && (
                                        <>
                                            <button
                                                className="px-4 py-2 bg-white text-green-600 border border-green-600 rounded font-medium hover:bg-green-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={handleCheckPO} disabled={checkingPO}
                                            >
                                                {checkingPO ? 'Checking...' : 'Check PO'}
                                            </button>
                                            {selectedBill?.send_request && !selectedBill?.request_approved && isAdminUser() ? (
                                                <>
                                                    <button
                                                        className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors duration-200"
                                                        onClick={handleApproveRequest}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors duration-200"
                                                        onClick={handleRejectRequest}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            ) : (
                                                !selectedBill?.request_approved && !areAllBillsVerifiedAndNotPaid() && !isAdminUser() && (
                                                    <button
                                                        className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${isSendRequestDisabled()
                                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                                            }`}
                                                        onClick={handleSendRequest}
                                                        disabled={isSendRequestDisabled()}
                                                    >
                                                        Send Request
                                                    </button>
                                                )
                                            )}
                                            {selectedBill?.billVerifications && selectedBill.billVerifications.length > 0 ? (
                                                <button
                                                    className="px-4 py-2 rounded font-medium transition-colors duration-200 bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                                                    onClick={toggleEditMode}
                                                >
                                                    Edit
                                                </button>
                                            ) : null}
                                        </>
                                    )}
                                    {selectedBill?.send_request && !isAdminUser() && (
                                        <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded font-medium">
                                            <span className="text-sm">✓ Request Sent</span>
                                        </div>
                                    )}
                                    {selectedBill?.request_approved && (
                                        <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded font-medium">
                                            <span className="text-sm">✓ Request Approved</span>
                                        </div>
                                    )}
                                    {areAllBillsVerifiedAndNotPaid() && (
                                        <div className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded font-medium">
                                            <span className="text-sm">✓ All Bills Verified</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        className="px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors duration-200"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                    {(!selectedBill?.send_request || isAdminUser()) && (
                                        <button
                                            className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${isSubmitDisabled()
                                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                : 'bg-[#BF9853] text-white hover:bg-[#a67c3a]'
                                                }`}
                                            onClick={handleSubmit} disabled={isSubmitDisabled()}
                                        >
                                            Submit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showEntryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-[584px]">
                        <div className="flex justify-between items-center p-6 ">
                            <h3 className="text-lg font-bold text-black">Bill Entry Details</h3>
                            <button
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-orange-500 text-lg font-bold"
                                onClick={handleEntryCancel}
                            >
                                ×
                            </button>
                        </div>
                        {loadingEntryDetails && (
                            <div className="px-6 py-4 text-center">
                                <div className="text-sm text-gray-500">Loading existing details...</div>
                            </div>
                        )}
                        <div className="p-6">
                            {existingBillEntryDetails && existingBillEntryDetails.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Previous Entry Details:</h4>
                                    <div className="space-y-3">
                                        {existingBillEntryDetails.map((entry, index) => (
                                            <div key={entry.id || index} className="flex gap-5 text-left">
                                                <div>
                                                    <label className="block text-sm font-semibold mb-2">Entered By</label>
                                                    {editingPreviousEntry === entry.id ? (
                                                        <Select
                                                            options={getUserOptions()}
                                                            value={{ value: previousEntryEditData.enteredBy, label: previousEntryEditData.enteredBy }}
                                                            onChange={(selectedOption) => handlePreviousEntryInputChange('enteredBy', selectedOption?.value || selectedOption?.label)}
                                                            placeholder="Select"
                                                            className='w-[270px] h-[40px]'
                                                            styles={customStyles}
                                                            isClearable
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={entry.entered_by}
                                                            readOnly
                                                            className="w-[270px] h-[40px] px-3 py-2 border-2 border-gray-300 rounded-lg text-sm bg-gray-50"
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold mb-2">Date</label>
                                                    <div className="flex gap-2">
                                                        {editingPreviousEntry === entry.id ? (
                                                            <>
                                                                <input
                                                                    type="date"
                                                                    value={previousEntryEditData.date}
                                                                    onChange={(e) => handlePreviousEntryInputChange('date', e.target.value)}
                                                                    className="w-[120px] h-[40px] px-3 py-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg text-sm focus:outline-none"
                                                                />
                                                                <button onClick={() => handlePreviousEntrySave(entry.id)}
                                                                    className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors duration-200"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingPreviousEntry(null)
                                                                        setPreviousEntryEditData({
                                                                            enteredBy: null,
                                                                            date: ''
                                                                        })
                                                                    }}
                                                                    className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors duration-200"
                                                                >
                                                                    Cancel
                                                                </button>

                                                            </>
                                                        ) : (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    value={new Date(entry.entered_date).toLocaleDateString('en-GB')}
                                                                    readOnly
                                                                    className="w-[120px] h-[40px] px-3 py-2 border-2 border-gray-300 rounded-lg text-sm bg-gray-50"
                                                                />
                                                                {canEditEntry(entry) && (
                                                                    <button
                                                                        onClick={() => handleEditPreviousEntry(entry)}
                                                                        className="px-3 py-2  transition-colors duration-200"
                                                                    >
                                                                        <img src={edit} alt="edit" className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="text-left">
                                <div className='flex gap-5'>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Entered By</label>
                                        <input
                                            type="text"
                                            value={username}
                                            readOnly
                                            className="w-[270px] h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg text-sm bg-gray-50"
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
                                            <input
                                                type="text"
                                                placeholder="Enter value"
                                                value={field.value}
                                                readOnly
                                                onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
                                                className="w-[270px] h-[40px] px-3 py-2 border-2 border-[#BF9853] bg-gray-50 border-opacity-20 rounded-lg text-sm focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="date"
                                                placeholder="Enter value"
                                                value={field.dateValue || ''}
                                                onChange={(e) => handleDynamicFieldChange(field.id, e.target.value, 'date')}
                                                className="w-[168px] h-[40px] px-3 py-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg text-sm focus:outline-none"
                                            />
                                        </div>
                                        <button onClick={() => handleRemoveField(field.id)} className="w-10 h-10 py-1 text-lg  font-bold">
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
                        <div className="flex gap-4 items-center p-6 ">
                            <div className="flex gap-3">
                                <button
                                    className="px-6 py-2 bg-[#BF9853] text-white rounded font-medium hover:bg-[#a67c3a] transition-colors duration-200"
                                    onClick={handleEntrySubmit}
                                >
                                    Confirm
                                </button>
                                <button className="px-6 py-2 bg-white text-[#BF9853] border border-[#BF9853] rounded font-medium "
                                    onClick={handleEntryCancel}
                                >
                                    Cancel
                                </button>
                            </div>
                            <div className="flex items-center gap-3 -mt-5">
                                <div className=" items-center gap-2">
                                    <label className="text-sm text-gray-600 block text-left">Adjustment Amount</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={hasStartedEditing ? numberInputValue : (selectedEntryBill?.adjustment_amount || '')}
                                            onChange={handleNumberInputChange}
                                            disabled={false}
                                            placeholder="Enter amount"
                                            className="w-32 h-10 px-3 py-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg text-sm focus:outline-none no-spinner"
                                        />
                                        <div className="flex items-center gap-1">
                                            <button className="text-green-600 font-bold text-lg mr-3" onClick={handleAdjustmentAmountUpdate}
                                                disabled={!numberInputValue && !selectedEntryBill?.adjustment_amount && !selectedEntryBill?.adjustmentAmount}
                                            >
                                                ✓
                                            </button>
                                            <button
                                                className="px-3 py-1.5 w-[100px] h-10 bg-[#BF9853] text-white rounded text-sm font-medium transition-colors duration-200"
                                                onClick={handleCheck}
                                            >
                                                Check
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-[1100px] h-[780px] overflow-auto shadow-lg flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-left flex-1">
                                    Payment Report : {existingPaymentDetails?.length || 0}
                                </h3>
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 text-xl font-bold"
                                    onClick={handlePaymentCancel}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex gap-10 h-full">
                                <div className="flex-1 flex flex-col">
                                    {loadingPaymentDetails && (
                                        <div className="px-6 py-4 text-center">
                                            <div className="text-sm text-gray-500">Loading existing payment details...</div>
                                        </div>
                                    )}
                                    {paymentStatuses[selectedPaymentBill?.id] !== '✓ Paid' && (
                                        <>
                                            <div className="flex-1 overflow-y-auto p-4">
                                                {paymentEntries.map((entry, index) => {
                                                    const existingPaymentCount = existingPaymentDetails?.length || 0;
                                                    const paymentNumber = existingPaymentCount + index + 1;
                                                    return (
                                                        <div key={entry.id} className="text-left p- shadow-lg rounded-lg">
                                                            <div className="mb-2">
                                                                <span className="text-sm font-bold text-gray-700">Payment - {paymentNumber}</span>
                                                            </div>
                                                            <div className={`flex gap-4 border border-[#BF9853] border-opacity-35 rounded-md p-4 ${paymentStatuses[selectedPaymentBill?.id] === '✓ Paid' ? 'bg-gray-50' : ''}`}>
                                                                <div className="flex-1">
                                                                    <label className="block font-semibold mb-1 text-sm">Date</label>
                                                                    <input
                                                                        type="date"
                                                                        value={entry.date}
                                                                        onChange={(e) => handlePaymentEntryChange(entry.id, 'date', e.target.value)}
                                                                        disabled={paymentStatuses[selectedPaymentBill?.id] === '✓ Paid'}
                                                                        className={`w-[150px] h-[35px] px-3 border-2 border-[#BF9853] border-opacity-35 rounded-md text-sm focus:outline-none ${paymentStatuses[selectedPaymentBill?.id] === '✓ Paid' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="block font-semibold mb-1 text-sm">Amount</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Enter Amount"
                                                                        value={entry.amountDisplay || ''}
                                                                        onChange={(e) => handlePaymentEntryChange(entry.id, 'amount', e.target.value)}
                                                                        disabled={paymentStatuses[selectedPaymentBill?.id] === '✓ Paid'}
                                                                        className={`w-[150px] h-[35px] px-3 border-2 border-[#BF9853] border-opacity-35 rounded-md text-sm focus:outline-none ${paymentStatuses[selectedPaymentBill?.id] === '✓ Paid' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="block font-semibold mb-1 text-sm">Mode</label>
                                                                    <select
                                                                        value={entry.mode}
                                                                        onChange={(e) => handlePaymentEntryChange(entry.id, 'mode', e.target.value)}
                                                                        disabled={paymentStatuses[selectedPaymentBill?.id] === '✓ Paid'}
                                                                        className={`w-[180px] h-[35px] px-3 border-2 border-[#BF9853] border-opacity-35 rounded-md text-sm focus:outline-none ${paymentStatuses[selectedPaymentBill?.id] === '✓ Paid' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                    >
                                                                        <option value="">Select</option>
                                                                        <option value="Cash">Cash</option>
                                                                        <option value="Net Banking">Net Banking</option>
                                                                        <option value="Gpay">Gpay</option>
                                                                        <option value="PhonePe">PhonePe</option>
                                                                        <option value="Cheque">Cheque</option>
                                                                    </select>
                                                                    <div className="mt-1 px-6">
                                                                        <button className="text-[#E4572E] text-sm flex items-center gap-1"
                                                                            onClick={() => document.getElementById(`file-input-${entry.id}`).click()}
                                                                        >
                                                                            Attach file
                                                                        </button>
                                                                        <input
                                                                            id={`file-input-${entry.id}`}
                                                                            type="file"
                                                                            accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,application/pdf,image/*"
                                                                            className="hidden"
                                                                            onChange={(e) => handleFileAttachment(entry.id, e.target.files[0])}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {(entry.mode === "Gpay" || entry.mode === "PhonePe" || entry.mode === "Net Banking" || entry.mode === "Cheque") && (
                                                                <div className="mt-4 p-4 border border-[#BF9853] border-opacity-25 rounded-lg">
                                                                    <div className="space-y-4">
                                                                        {entry.mode === "Cheque" && (
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div>
                                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        value={entry.chequeNo}
                                                                                        onChange={(e) => handlePaymentEntryChange(entry.id, 'chequeNo', e.target.value)}
                                                                                        placeholder="Enter cheque number"
                                                                                        disabled={paymentStatuses[selectedPaymentBill?.id] === '✓ Paid'}
                                                                                        className={`w-full h-[35px] px-3 border-2 border-[#BF9853] border-opacity-25 rounded-md text-sm focus:outline-none ${paymentStatuses[selectedPaymentBill?.id] === '✓ Paid' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date</label>
                                                                                    <input
                                                                                        type="date"
                                                                                        value={entry.chequeDate}
                                                                                        onChange={(e) => handlePaymentEntryChange(entry.id, 'chequeDate', e.target.value)}
                                                                                        disabled={paymentStatuses[selectedPaymentBill?.id] === '✓ Paid'}
                                                                                        className={`w-full h-[35px] px-3 border-2 border-[#BF9853] border-opacity-25 rounded-md text-sm focus:outline-none ${paymentStatuses[selectedPaymentBill?.id] === '✓ Paid' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number</label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={entry.transactionNumber}
                                                                                    onChange={(e) => handlePaymentEntryChange(entry.id, 'transactionNumber', e.target.value)}
                                                                                    placeholder="Enter transaction number"
                                                                                    disabled={paymentStatuses[selectedPaymentBill?.id] === '✓ Paid'}
                                                                                    className={`w-full h-[35px] px-3 border-2 border-[#BF9853] border-opacity-25 rounded-md text-sm focus:outline-none ${paymentStatuses[selectedPaymentBill?.id] === '✓ Paid' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                                                                                <select
                                                                                    value={entry.accountNumber}
                                                                                    onChange={(e) => handlePaymentEntryChange(entry.id, 'accountNumber', e.target.value)}
                                                                                    disabled={paymentStatuses[selectedPaymentBill?.id] === '✓ Paid'}
                                                                                    className={`w-full h-[35px] px-3 border-2 border-[#BF9853] border-opacity-25 rounded-md text-sm focus:outline-none ${paymentStatuses[selectedPaymentBill?.id] === '✓ Paid' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                                                    );
                                                })}
                                                {paymentStatuses[selectedPaymentBill?.id] !== '✓ Paid' && (
                                                    <div className="flex py-3">
                                                        <button
                                                            onClick={handleAddPaymentEntry}
                                                            className="text-[#E4572E] text-sm font-semibold border-dashed border-b-2 border-[#BF9853] cursor-pointer hover:text-[#c44a26] transition-colors duration-200 flex items-center gap-1"
                                                        >
                                                            <span className="text-red-500">+</span> Add on
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {existingPaymentDetails && existingPaymentDetails.length > 0 && (
                                        <div className="p-w pl-4 overflow-auto h-[700px] mb-2">
                                            <h4 className="text-sm font-semibold text-gray-700 mt-2">Previous Payment Details:</h4>
                                            <div className="space-y-4">
                                                {[...existingPaymentDetails].reverse().map((payment, index) => {
                                                    const totalPayments = existingPaymentDetails.length;
                                                    const paymentNumber = totalPayments - index;
                                                    return (
                                                        <div key={payment.id || index} className="text-left p-4 shadow-lg rounded-lg mb-4">
                                                            <div className="mb-2">
                                                                <span className="text-sm font-bold text-gray-700">Payment - {paymentNumber}</span>
                                                            </div>
                                                            <div className=" border border-[#BF9853] border-opacity-35 rounded-md p-4">
                                                                <div className='grid grid-cols-3 gap-4'>
                                                                    <div>
                                                                        <label className="block font-semibold mb-1 text-sm">Date</label>
                                                                        <input
                                                                            type="date"
                                                                            value={payment.date}
                                                                            readOnly
                                                                            className="w-full h-[35px] px-3 border-2 border-[#BF9853] border-opacity-30 rounded-md text-sm "
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block font-semibold mb-1 text-sm">Amount</label>
                                                                        <input
                                                                            type="text"
                                                                            value={(() => {
                                                                                const amount = parseFloat(payment.amount) || 0;
                                                                                const carryForwardAmount = parseFloat(payment.carry_forward_amount) || 0;
                                                                                const totalAmount = amount + carryForwardAmount;
                                                                                return totalAmount > 0 ? formatIndianCurrency(totalAmount) : '';
                                                                            })()}
                                                                            readOnly
                                                                            className="w-full h-[35px] px-3 border-2 border-[#BF9853] border-opacity-30 rounded-md text-sm "
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block font-semibold mb-1 text-sm">Mode</label>
                                                                        <input
                                                                            type="text"
                                                                            value={payment.vendor_bill_payment_mode || ''}
                                                                            readOnly
                                                                            className="w-full h-[35px] px-3 border-2 border-[#BF9853] border-opacity-30 rounded-md text-sm "
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className='grid grid-cols-2 gap-4 mt-2'>
                                                                    {payment.cheque_number && (
                                                                        <div>
                                                                            <label className="block font-semibold mb-1 text-sm">Cheque No</label>
                                                                            <input
                                                                                type="text"
                                                                                value={payment.cheque_number}
                                                                                readOnly
                                                                                className="w-full h-[35px] px-3 border-2 border-[#BF9853] border-opacity-30 rounded-md text-sm "
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {payment.cheque_date && (
                                                                        <div>
                                                                            <label className="block font-semibold mb-1 text-sm">Cheque Date</label>
                                                                            <input
                                                                                type="date"
                                                                                value={payment.cheque_date}
                                                                                readOnly
                                                                                className="w-full h-[35px] px-3 border-2 border-[#BF9853] border-opacity-30 rounded-md text-sm "
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {payment.transaction_number && (
                                                                        <div>
                                                                            <label className="block font-semibold mb-1 text-sm">Transaction No</label>
                                                                            <input
                                                                                type="text"
                                                                                value={payment.transaction_number}
                                                                                readOnly
                                                                                className="w-full h-[35px] px-3 border-2 border-[#BF9853] border-opacity-30 rounded-md text-sm "
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {payment.account_number && (
                                                                        <div>
                                                                            <label className="block font-semibold mb-1 text-sm">Account No</label>
                                                                            <input
                                                                                type="text"
                                                                                value={payment.account_number}
                                                                                readOnly
                                                                                className="w-full h-[35px] px-3 border-2 border-[#BF9853] border-opacity-30 rounded-md text-sm"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="mt-4 pt-4 border-t border-[#BF9853] border-opacity-20">
                                                                    {payment.bill_url ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (payment.bill_url) {
                                                                                    window.open(payment.bill_url, '_blank', 'noopener,noreferrer');
                                                                                }
                                                                            }}
                                                                            className="px-4 py-2 text-sm font-medium text-[#BF9853] hover:underline cursor-pointer rounded-lg transition-colors duration-200"
                                                                        >
                                                                            View
                                                                        </button>
                                                                    ) : (
                                                                        <div>
                                                                            <input
                                                                                id={`existing-payment-file-${payment.id}`}
                                                                                type="file"
                                                                                accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,application/pdf,image/*"
                                                                                className="hidden"
                                                                                onChange={(e) => handleExistingPaymentFileUpload(payment.id, e.target.files[0])}
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => document.getElementById(`existing-payment-file-${payment.id}`).click()}
                                                                                className="px-4 py-2 text-sm font-medium text-[#E4572E] hover:underline  transition-colors duration-200"
                                                                            >
                                                                                Attach File
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-end gap-3 bg-white mb-4">
                                        <button className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg font-medium"
                                            onClick={handlePaymentCancel}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className={`px-4 py-2 rounded-lg font-medium ${paymentStatuses[selectedPaymentBill?.id] === '✓ Paid' ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'text-white bg-[#BF9853]'}`}
                                            onClick={handlePaymentSubmit}
                                            disabled={paymentStatuses[selectedPaymentBill?.id] === '✓ Paid'}
                                        >
                                            {paymentStatuses[selectedPaymentBill?.id] === '✓ Paid' ? 'Fully Paid' : 'Submit'}
                                        </button>
                                    </div>
                                </div>
                                <div className="w-80 flex flex-col">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {(() => {
                                            // Calculate draft payment total excluding carry forward entries (carry forward is handled separately)
                                            const draftPaymentTotal = paymentEntries
                                                .filter(entry => entry.mode !== 'Carry Forward')
                                                .reduce((sum, entry) => {
                                                    const rawAmount = typeof entry.amount === 'string' ? entry.amount.replace(/,/g, '') : entry.amount
                                                    const numericAmount = parseFloat(rawAmount)
                                                    if (Number.isNaN(numericAmount)) {
                                                        return sum
                                                    }
                                                    return sum + numericAmount
                                                }, 0)
                                            const existingReceivedAmount = Math.max(0, actualAmount - remainingAmount)
                                            const normalizedDiscount = (() => {
                                                if (typeof discount === 'string') {
                                                    const cleaned = discount.replace(/,/g, '')
                                                    const numeric = parseFloat(cleaned)
                                                    return Number.isNaN(numeric) ? 0 : numeric
                                                }
                                                return Number.isFinite(discount) ? discount : 0
                                            })()
                                            // -----------------------------
                                            // BASIC NORMALIZED VALUES
                                            // -----------------------------
                                            const billTotal = actualAmount || 0;
                                            const existingReceived = existingReceivedAmount || 0;
                                            const draftPaid = draftPaymentTotal || 0;
                                            const discountValue = normalizedDiscount || 0;
                                            const carryForwardAvailable = carryForwardAmount || 0;
                                            // -----------------------------
                                            // REMAINING BILL AFTER PREVIOUS PAYMENTS
                                            // -----------------------------
                                            const remainingAfterPayments = Math.max(
                                                0,
                                                billTotal - existingReceived - draftPaid
                                            );
                                            // -----------------------------
                                            // AMOUNT NEEDED TO SETTLE BILL (AFTER DISCOUNT)
                                            // -----------------------------
                                            const amountNeededToPay = Math.max(
                                                0,
                                                remainingAfterPayments - discountValue
                                            );
                                            // -----------------------------
                                            // CARRY FORWARD TO USE
                                            // -----------------------------
                                            const carryForwardToUse = useCarryForward
                                                ? Math.min(carryForwardAvailable, amountNeededToPay)
                                                : 0;
                                            // -----------------------------
                                            // FINAL REMAINING BILL AFTER CARRY FORWARD
                                            // -----------------------------
                                            const projectedRemainingAmount = Math.max(
                                                0,
                                                remainingAfterPayments - carryForwardToUse
                                            );
                                            // -----------------------------
                                            // LIVE RECEIVED AMOUNT (PREVIOUS + CURRENT + CF)
                                            // -----------------------------
                                            const liveReceivedAmount = Math.min(
                                                billTotal,
                                                existingReceived + draftPaid + carryForwardToUse
                                            );
                                            // -----------------------------
                                            // REMAINING CARRY FORWARD BALANCE
                                            // -----------------------------
                                            const remainingCarryForward = useCarryForward
                                                ? Math.max(0, carryForwardAvailable - carryForwardToUse)
                                                : carryForwardAvailable;
                                            // -----------------------------
                                            // NET PAYABLE (FINAL)
                                            // -----------------------------
                                            const excessCarryForward =
                                                useCarryForward && carryForwardToUse > 0 && carryForwardAvailable > amountNeededToPay
                                                    ? carryForwardAvailable - amountNeededToPay
                                                    : 0;
                                            const projectedNetPayable =
                                                projectedRemainingAmount > 0
                                                    ? projectedRemainingAmount
                                                    : excessCarryForward > 0
                                                        ? -excessCarryForward
                                                        : 0;
                                            return (
                                                <div className="text-left">
                                                    <h4 className="text-lg font-semibold mb-2">Summary</h4>
                                                    <div className="space-y-3 shadow-lg rounded-lg p-4">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Total Payable:</span>
                                                            <span className="font-semibold">{formatIndianCurrency(actualAmount)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Received Amount:</span>
                                                            <span className="font-semibold">{formatIndianCurrency(liveReceivedAmount)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-600">Carry Forward:</span>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={useCarryForward}
                                                                    onChange={(e) => setUseCarryForward(e.target.checked)}
                                                                    disabled={carryForwardAmount <= 0 || paymentStatuses[selectedPaymentBill?.id] === '✓ Paid'}
                                                                    className="w-4 h-4 cursor-pointer"
                                                                />
                                                            </div>
                                                            <span className={`font-semibold ${useCarryForward ? 'text-green-600' : ''}`}>
                                                                {formatIndianCurrency(carryForwardAvailable)}
                                                            </span>
                                                        </div>
                                                        <hr className="border-gray-300" />
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Total Amount:</span>
                                                            <span className="font-semibold">{formatIndianCurrency(projectedRemainingAmount)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Discount:</span>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    discount === 0
                                                                        ? ''
                                                                        : discount.toLocaleString('en-IN')
                                                                }
                                                                onChange={(e) => {
                                                                    if (!discountSubmitted) {
                                                                        const rawValue = e.target.value.replace(/,/g, '').replace(/\D/g, '');
                                                                        const newDiscount = Number(rawValue) || 0;
                                                                        setDiscount(newDiscount);
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (!discountSubmitted && e.key === 'Backspace' && discount === 0) {
                                                                        setDiscount('');
                                                                    }
                                                                }}
                                                                disabled={discountSubmitted}
                                                                className={`w-24 h-6 px-2 no-spinner text-right text-xs border pl-4 border-gray-300 rounded focus:outline-none ${discountSubmitted ? 'bg-gray-100 cursor-not-allowed' : ''
                                                                    }`}
                                                                placeholder="0"
                                                                title={
                                                                    discountSubmitted
                                                                        ? 'Discount already applied in previous payment'
                                                                        : 'Enter discount amount'
                                                                }
                                                            />
                                                        </div>
                                                        <hr className="border-gray-300" />
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Net Payable:</span>
                                                            <span className={`font-bold ${projectedNetPayable <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {formatIndianCurrency(projectedNetPayable)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        <div className="text-left">
                                            <h4 className="text-lg font-semibold mb-2">Vendor Details</h4>
                                            <div className="space-y-3 shadow-lg rounded-lg p-4">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Date:</span>
                                                    <span className="font-semibold">{selectedPaymentBill ? new Date(selectedPaymentBill.bill_arrival_date).toLocaleDateString('en-GB') : '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Vendor:</span>
                                                    <span className="font-semibold">{selectedPaymentBill ? getVendorNameById(selectedPaymentBill.vendor_id) : '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">No of Bills:</span>
                                                    <span className="font-semibold">{selectedPaymentBill ? (selectedPaymentBill.no_of_bills || selectedPaymentBill.noOfBills) : '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='text-left'>
                                            <input
                                                ref={overallPdfInputRef}
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,application/pdf,image/*"
                                                onChange={handleOverallPaymentPdfChange}
                                                style={{ display: 'none' }}
                                            />
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => overallPdfInputRef.current?.click()}
                                                    disabled={uploadingOverallPdf}
                                                    className={`text-[#E4572E] text-sm flex items-center gap-1 ${uploadingOverallPdf ? 'opacity-50 cursor-not-allowed' : 'hover:underline cursor-pointer'}`}
                                                >
                                                    {uploadingOverallPdf ? 'Uploading...' : 'Attach file'}
                                                </button>
                                                {(selectedPaymentBill?.over_all_payment_pdf_url || selectedPaymentBill?.overAllPaymentPdfUrl) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const pdfUrl = selectedPaymentBill?.over_all_payment_pdf_url || selectedPaymentBill?.overAllPaymentPdfUrl;
                                                            if (pdfUrl) {
                                                                window.open(pdfUrl, '_blank', 'noopener,noreferrer');
                                                            }
                                                        }}
                                                        className="text-[#BF9853] text-sm flex items-center gap-1 hover:underline cursor-pointer font-medium"
                                                    >
                                                        View
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-lg font-semibold mb-2">Bank Details</h4>
                                            <div className="space-y-3 shadow-lg rounded-lg p-4">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">A/c Name:</span>
                                                    <span className="font-semibold">{selectedVendorAccountDetails?.account_holder_name || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Bank Name:</span>
                                                    <span className="font-semibold">{selectedVendorAccountDetails?.bank_name || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Account No:</span>
                                                    <span className="font-semibold">{selectedVendorAccountDetails?.account_number || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">IFSC Code:</span>
                                                    <span className="font-semibold">{selectedVendorAccountDetails?.ifsc_code || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Branch:</span>
                                                    <span className="font-semibold">{selectedVendorAccountDetails?.branch || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Contact Number:</span>
                                                    <span className="font-semibold">{selectedVendorAccountDetails?.contact_number || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Contact Email:</span>
                                                    <span className="font-semibold">{selectedVendorAccountDetails?.contact_email || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-lg font-semibold mb-2">UPI Details</h4>
                                            <div className="space-y-3 shadow-lg rounded-lg p-4">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
                        <div className="px-6 py-4 border-b border-[#BF9853] border-opacity-20">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-[#BF9853]">Edit Tracker Details</h3>
                                <button onClick={handleEditCancel}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FAF6ED] transition-colors duration-200 text-[#BF9853] text-xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4 text-left">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bill Arrival Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={editFormData.billArrivalDate}
                                        onChange={(e) => handleEditInputChange('billArrivalDate', e.target.value)}
                                        className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none focus:border-[#BF9853] focus:border-opacity-60"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Vendor *
                                    </label>
                                    <Select
                                        value={editFormData.vendorId}
                                        onChange={(selectedOption) => handleEditInputChange('vendorId', selectedOption)}
                                        options={combinedOptions}
                                        placeholder="Select Vendor"
                                        className="basic-single text-left"
                                        classNamePrefix="select"
                                        isClearable
                                        isSearchable
                                        required
                                        menuPortalTarget={document.body}
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                minHeight: '45px',
                                                border: '2px solid rgba(191, 152, 83, 0.3)',
                                                borderRadius: '8px',
                                                '&:hover': {
                                                    border: '2px solid rgba(191, 152, 83, 0.6)',
                                                },
                                                '&:focus-within': {
                                                    border: '2px solid rgba(191, 152, 83, 0.6)',
                                                    boxShadow: 'none',
                                                }
                                            }),
                                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of Bills *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editFormData.noOfBills}
                                        onChange={(e) => handleEditInputChange('noOfBills', e.target.value)}
                                        className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none focus:border-[#BF9853] focus:border-opacity-60"
                                        placeholder="Enter number of bills"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Amount *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editFormData.totalAmount}
                                        onChange={(e) => handleEditInputChange('totalAmount', e.target.value)}
                                        className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none focus:border-[#BF9853] focus:border-opacity-60"
                                        placeholder="Enter total amount"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-[#BF9853] border-opacity-20 flex justify-end space-x-3">
                            <button onClick={handleEditCancel}
                                className="px-6 py-2 text-sm font-medium text-[#BF9853] bg-white border border-[#BF9853] rounded-lg hover:bg-[#FAF6ED] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:ring-opacity-30"
                                disabled={editLoading}
                            >
                                Cancel
                            </button>
                            <button onClick={handleEditSubmit} disabled={editLoading}
                                className="px-6 py-2 text-sm font-medium text-white bg-[#BF9853] border border-[#BF9853] rounded-lg hover:bg-[#a8884a] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:ring-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editLoading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showCheckModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-[1600px] max-h-[90vh] shadow-lg flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-black">
                                    Matching Expenses - {getVendorNameById(selectedEntryBill?.vendor_id || selectedEntryBill?.vendorId)}
                                </h3>
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 text-xl font-bold"
                                    onClick={() => {
                                        setShowCheckModal(false)
                                        setCheckFilteredExpenses([])
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                Total Entries: {checkFilteredExpenses.length} |
                                Total Amount: ₹{checkFilteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            {checkFilteredExpenses.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-sm text-gray-500">No matching expenses found.</div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border-l-8 border-l-[#BF9853] rounded-lg">
                                    <table className="table-fixed min-w-full border-collapse">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="px-3 py-3 text-left font-bold text-sm border-b">Time Stamp</th>
                                                <th className="px-3 py-3 text-left font-bold text-sm border-b">Date</th>
                                                <th className="px-3 py-3 text-left font-bold text-sm border-b">E.No</th>
                                                <th className="px-3 py-3 text-left font-bold text-sm border-b">Project Name</th>
                                                <th className="px-3 py-3 text-left font-bold text-sm border-b">Vendor</th>
                                                <th className="px-3 py-3 text-left font-bold text-sm border-b">Contractor</th>
                                                <th className="px-3 py-3 text-left font-bold text-sm border-b">A/C Type</th>
                                                <th className="px-3 py-3 text-left font-bold text-sm border-b">Quantity</th>
                                                <th className="px-3 py-3 text-left font-bold text-sm border-b">Amount</th>
                                                <th className="px-3 py-3 text-left font-bold text-sm border-b">Comments</th>
                                                <th className="px-3 py-3 text-left font-bold text-sm border-b">Category</th>
                                                <th className="px-3 py-3 text-left font-bold text-sm border-b">Attach File</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {checkFilteredExpenses.map((expense, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}>
                                                    <td className="px-3 py-2 text-left text-sm font-semibold border-b">{formatDate(expense.timestamp || expense.date)}</td>
                                                    <td className="px-3 py-2 text-left text-sm font-semibold border-b">{formatDateOnly(expense.date)}</td>
                                                    <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.eno || '-'}</td>
                                                    <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.siteName || '-'}</td>
                                                    <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.vendor || '-'}</td>
                                                    <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.contractor || '-'}</td>
                                                    <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.accountType || '-'}</td>
                                                    <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.quantity || '-'}</td>
                                                    <td className="px-3 py-2 text-left text-sm font-semibold border-b">
                                                        ₹{Number(expense.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.comments || '-'}</td>
                                                    <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.category || '-'}</td>
                                                    <td className="px-3 py-2 text-left text-sm border-b">
                                                        {expense.billCopy ? (
                                                            <a
                                                                href={expense.billCopy}
                                                                className="text-red-500 underline font-semibold"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                View
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
                            <button
                                className="px-4 py-2 bg-[#BF9853] text-white rounded font-medium hover:bg-[#a67c3a] transition-colors duration-200"
                                onClick={generateExpensePDF}
                            >
                                Generate PDF
                            </button>
                            <button
                                className="px-4 py-2 bg-white text-[#BF9853] border border-[#BF9853] rounded"
                                onClick={() => {
                                    setShowCheckModal(false)
                                    setCheckFilteredExpenses([])
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
export default BillDatabase