import React, { useState, useEffect } from 'react'
import Select from 'react-select';
import axios from "axios";
import edit from '../Images/Edit.svg';
import deletes from '../Images/Delete.svg';
const PendingBill = ({ username, userRoles = [] }) => {
    const [showModal, setShowModal] = useState(false)
    const [selectedBill, setSelectedBill] = useState(null)
    const [poNumbers, setPoNumbers] = useState([])
    const [showEntryModal, setShowEntryModal] = useState(false)
    const [selectedEntryBill, setSelectedEntryBill] = useState(null)
    const [vendorId, setVendorId] = useState(null)
    const [entryFormData, setEntryFormData] = useState({
        enteredBy: null, // No longer needed since we use username directly
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
    const [previousEntryNumbers, setPreviousEntryNumbers] = useState({}) // Store numbers for previous entries
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedPaymentBill, setSelectedPaymentBill] = useState(null)
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
    const [apiData, setApiData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [purchaseOrders, setPurchaseOrders] = useState([])
    const [validationResults, setValidationResults] = useState({})
    const [checkingPO, setCheckingPO] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [verifiedBills, setVerifiedBills] = useState({})
    const [noPoSelections, setNoPoSelections] = useState({})
    const [checkedBills, setCheckedBills] = useState({}) // New state to track which bills were checked using Check PO button
    const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false) // Track if data has been submitted before
    const [originalData, setOriginalData] = useState(null) // Store original data for comparison
    const [editModeStartData, setEditModeStartData] = useState(null) // Store data when edit mode starts
    const [expensesData, setExpensesData] = useState([]) // Store expenses form data
    const [expenseMatchStatus, setExpenseMatchStatus] = useState({}) // Store expense matching status for each bill
    const [expenseMatchDetails, setExpenseMatchDetails] = useState({}) // Store detailed matching information for hover tooltips
    const [billEntryDates, setBillEntryDates] = useState({}) // Store entered_date for each bill
    const [allBillEntries, setAllBillEntries] = useState([]) // Store all bill entries from getAll endpoint
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
    const [paymentStatuses, setPaymentStatuses] = useState({})
    const [showPaymentSummaryModal, setShowPaymentSummaryModal] = useState(false)
    const [paymentSummaryData, setPaymentSummaryData] = useState(null)
    
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
    
    // Sort configuration state
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
    useEffect(() => {
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
        fetchAccountDetails();
    }, []);
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
            console.log(data);
        } catch (error) {
            console.error("Error fetching tracker data:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
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
            const entryDates = {};
            data.forEach(entry => {
                if (entry.vendor_payments_tracker_id && entry.entered_date) {
                    entryDates[entry.vendor_payments_tracker_id] = entry.entered_date;
                }
            });
            setBillEntryDates(entryDates);
            return data;
        } catch (error) {
            console.error("Error fetching all bill entries:", error);
            return [];
        }
    };

    // Fetch expenses form data from the API
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
            calculateExpenseMatchStatus(data);

        } catch (error) {
            console.error("Error fetching expenses data:", error);
        }
    };

    // Calculate expense match status for bills
    const calculateExpenseMatchStatus = (expensesData, billEntries = allBillEntries) => {
        const matchStatus = {};

        // Create a map of vendor_payments_tracker_id to bill data for quick lookup
        const billMap = {};
        apiData.forEach(bill => {
            billMap[bill.id] = bill;
        });

        // Group bill entries by vendor_payments_tracker_id to handle multiple dates
        const groupedBillEntries = {};
        billEntries.forEach(billEntry => {
            const trackerId = billEntry.vendor_payments_tracker_id;
            if (!groupedBillEntries[trackerId]) {
                groupedBillEntries[trackerId] = [];
            }
            groupedBillEntries[trackerId].push(billEntry);
        });
        Object.keys(groupedBillEntries).forEach((trackerId, index) => {
            const billEntriesForTracker = groupedBillEntries[trackerId];
            const bill = billMap[trackerId];

            if (!bill) {
                return; // Skip if no corresponding bill found
            }
            const vendorName = bill.vendor_name || getVendorNameById(bill.vendor_id);
            const billAmount = parseFloat(bill.total_amount) || 0;

            if (vendorName && billAmount > 0) {
                // Get all unique entered dates for this tracker ID
                const enteredDates = [...new Set(billEntriesForTracker.map(entry => entry.entered_date).filter(Boolean))];
                if (enteredDates.length > 0) {
                    const billEnteredDates = enteredDates.map(date => new Date(date).toISOString().split('T')[0]);
                    const dateMatchedExpenses = expensesData.filter((expense) => {
                        const expenseDate = new Date(expense.timestamp || expense.date).toISOString().split('T')[0];
                        return billEnteredDates.includes(expenseDate);
                    });
                    const vendorMatchedExpenses = dateMatchedExpenses.filter((expense) => {
                        return expense.vendor === vendorName;
                    });
                    const matchingExpenses = vendorMatchedExpenses.filter((expense) => {
                        return (expense.accountType === 'Bill Payments' || expense.accountType === 'Bill Refund');
                    });

                    const totalExpenseAmount = matchingExpenses.reduce((sum, expense) => {
                        return sum + (parseFloat(expense.amount) || 0);
                    }, 0);

                    // Subtract adjustment_amount from billAmount for comparison
                    const adjustmentAmount = parseFloat(bill.adjustment_amount) || 0;
                    const adjustedBillAmount = billAmount - adjustmentAmount;

                    const matchDetails = {
                        matchingExpensesCount: matchingExpenses.length,
                        totalExpenseAmount: totalExpenseAmount,
                        billAmount: billAmount,
                        adjustmentAmount: adjustmentAmount,
                        adjustedBillAmount: adjustedBillAmount,
                        difference: Math.abs(totalExpenseAmount - adjustedBillAmount),
                        matchingExpenses: matchingExpenses,
                        enteredDates: enteredDates
                    };

                    // Determine match status using adjusted bill amount
                    if (matchingExpenses.length === 0) {
                        matchStatus[trackerId] = 'no_match';
                    } else if (Math.abs(totalExpenseAmount - adjustedBillAmount) < 0.01) {
                        matchStatus[trackerId] = 'complete_match';
                    } else if (totalExpenseAmount > 0) {
                        matchStatus[trackerId] = 'partial_match';
                    } else {
                        matchStatus[trackerId] = 'no_match';
                    }

                    // Store match details for this bill
                    setExpenseMatchDetails(prev => ({
                        ...prev,
                        [trackerId]: matchDetails
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

    // Get entry status text based on expense match status
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

    const fetchExistingPaymentDetails = async (vendorPaymentsTrackerId) => {
        setLoadingPaymentDetails(true);
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/get/${vendorPaymentsTrackerId}`, {
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
            setExistingPaymentDetails(data);
            return data;
        } catch (error) {
            console.error("Error fetching existing payment details:", error);
            setExistingPaymentDetails(null);
            return null;
        } finally {
            setLoadingPaymentDetails(false);
        }
    };
    useEffect(() => {
        fetchTrackerData();
        fetchPurchaseOrders();
        fetchExpensesData();
    }, []);

    // Recalculate expense match status when apiData, expensesData, or allBillEntries changes
    useEffect(() => {
        if (apiData.length > 0 && expensesData.length > 0 && allBillEntries.length > 0) {
            calculateExpenseMatchStatus(expensesData, allBillEntries);
        }
    }, [apiData, expensesData, allBillEntries]);

    // Fetch all bill entries when apiData changes
    useEffect(() => {
        if (apiData.length > 0) {
            fetchAllBillEntries();
        }
    }, [apiData]);

    // Fetch payment statuses for all items
    useEffect(() => {
        const fetchAllPaymentStatuses = async () => {
            if (apiData.length === 0) return;

            const statusPromises = apiData.map(async (item) => {
                const status = await getPaymentStatus(item);
                return { id: item.id, status };
            });

            try {
                const statuses = await Promise.all(statusPromises);
                const statusMap = {};
                statuses.forEach(({ id, status }) => {
                    statusMap[id] = status;
                });
                setPaymentStatuses(statusMap);
            } catch (error) {
                console.error('Error fetching payment statuses:', error);
            }
        };

        fetchAllPaymentStatuses();
    }, [apiData]);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

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

    // Filter data function
    const getFilteredData = () => {
        let filteredData = [...apiData];

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
            totalAmount: formatIndianCurrency(parseInt(formData.totalAmount)),
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
            const existingBillNumbers = bill.billVerifications.map(verification =>
                verification.bill_number === 'NO_PO' ? '' : (verification.bill_number || '')
            )
            while (existingBillNumbers.length < numberOfBills) {
                existingBillNumbers.push('')
            }
            setPoNumbers(existingBillNumbers.slice(0, numberOfBills))

            // Initialize verified bills state based on existing verification status
            const initialVerified = {}
            const initialNoPo = {}
            bill.billVerifications.forEach((verification, index) => {
                if (index < numberOfBills) {
                    initialVerified[index] = verification.is_verified || false
                    // Only set No PO to true if it was explicitly set to 'NO_PO', not for empty strings
                    initialNoPo[index] = verification.bill_number === 'NO_PO'
                }
            })
            setVerifiedBills(initialVerified)
            setNoPoSelections(initialNoPo)
            // Initialize checked bills state based on existing verification status
            const initialChecked = {}
            bill.billVerifications.forEach((verification, index) => {
                if (index < numberOfBills) {
                    initialChecked[index] = verification.is_verified || false
                }
            })
            setCheckedBills(initialChecked)

            // Set tracking states for existing data
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

            // Reset tracking states for new data
            setHasBeenSubmitted(false)
            setOriginalData(null)
        }
        setIsEditMode(false)
        setValidationResults({})
        setCheckedBills({}) // Reset checked bills state for new verification
        setShowModal(true)
    }
    const handlePoNumberChange = (index, value) => {
        // Only allow numeric input and prevent manual string entry
        const numericValue = value.replace(/[^0-9]/g, '')
        const newPoNumbers = [...poNumbers]
        newPoNumbers[index] = numericValue
        setPoNumbers(newPoNumbers)

        // Clear "No PO" selection when user enters a number (only for admin users)
        if (numericValue && isAdminUser()) {
            setNoPoSelections(prev => ({ ...prev, [index]: false }))
        }

        // Reset checked status and validation for this bill when user changes the number
        setCheckedBills(prev => {
            const newCheckedBills = { ...prev }
            delete newCheckedBills[index]
            return newCheckedBills
        })

        // Reset validation result for this bill
        setValidationResults(prev => {
            const newValidationResults = { ...prev }
            delete newValidationResults[index]
            return newValidationResults
        })
    }

    const handleNoPoChange = (index, checked) => {
        // Only allow No PO changes for admin users
        if (!isAdminUser()) {
            return
        }
        setNoPoSelections(prev => ({ ...prev, [index]: checked }))
        // Clear PO number when "No PO" is selected
        if (checked) {
            const newPoNumbers = [...poNumbers]
            newPoNumbers[index] = ''
            setPoNumbers(newPoNumbers)
        }
        // Reset checked status and validation for this bill when "No PO" is changed
        setCheckedBills(prev => {
            const newCheckedBills = { ...prev }
            delete newCheckedBills[index]
            return newCheckedBills
        })
        // Reset validation result for this bill
        setValidationResults(prev => {
            const newValidationResults = { ...prev }
            delete newValidationResults[index]
            return newValidationResults
        })
    }

    const handleVerifiedChange = (index, checked) => {
        setVerifiedBills(prev => ({ ...prev, [index]: checked }))
    }

    // Function to check if data has changed from original
    const hasDataChanged = () => {
        if (!hasBeenSubmitted || !originalData) {
            return true // Allow submission if no previous data
        }

        // If in edit mode, compare with edit mode start data
        if (isEditMode && editModeStartData) {
            // Check if PO numbers have changed since edit mode started
            const currentPoNumbers = poNumbers.slice(0, editModeStartData.poNumbers.length)
            const poNumbersChanged = currentPoNumbers.some((current, index) =>
                current !== (editModeStartData.poNumbers[index] || '')
            )

            // Check if No PO selections have changed since edit mode started
            const noPoChanged = Object.keys(noPoSelections).some(index =>
                noPoSelections[index] !== (editModeStartData.noPoSelections[index] || false)
            ) || Object.keys(editModeStartData.noPoSelections).some(index =>
                (noPoSelections[index] || false) !== editModeStartData.noPoSelections[index]
            )

            return poNumbersChanged || noPoChanged
        }

        // If not in edit mode, compare with original data
        // Check if PO numbers have changed
        const currentPoNumbers = poNumbers.slice(0, originalData.poNumbers.length)
        const poNumbersChanged = currentPoNumbers.some((current, index) =>
            current !== (originalData.poNumbers[index] || '')
        )

        // Check if No PO selections have changed
        const noPoChanged = Object.keys(noPoSelections).some(index =>
            noPoSelections[index] !== (originalData.noPoSelections[index] || false)
        ) || Object.keys(originalData.noPoSelections).some(index =>
            (noPoSelections[index] || false) !== originalData.noPoSelections[index]
        )

        return poNumbersChanged || noPoChanged
    }

    // Function to check if submit button should be disabled
    const isSubmitDisabled = () => {
        // If data has been submitted before and no changes detected, disable submit
        if (hasBeenSubmitted && !hasDataChanged()) {
            return true
        }

        // Check if there are any validation errors that would prevent submission
        if (selectedBill && poNumbers.length > 0) {
            const maxBills = selectedBill.noOfBills || selectedBill.no_of_bills || 0

            // First check for duplicate numbers within the current popup
            const currentBillNumbers = poNumbers.filter(num => num.trim() !== '')
            const duplicateMap = {}

            currentBillNumbers.forEach((billNumber) => {
                if (duplicateMap[billNumber]) {
                    duplicateMap[billNumber]++
                } else {
                    duplicateMap[billNumber] = 1
                }
            })

            // If there are duplicates, disable submit
            const hasDuplicates = Object.values(duplicateMap).some(count => count > 1)
            if (hasDuplicates) {
                return true
            }

            for (let i = 0; i < maxBills; i++) {
                const billNumber = poNumbers[i] || ''
                const isNoPo = noPoSelections[i] || false
                const validation = validationResults[i]

                // If there's a bill number that's not "No PO" and not validated
                if (billNumber.trim() && !isNoPo) {
                    if (!validation || !validation.matched) {
                        return true // Disable submit if there are unvalidated bill numbers
                    }
                }
            }
        }

        return false
    }
    const handleSubmit = async () => {
        try {
            // Check if data has been submitted before and if it has changed
            if (hasBeenSubmitted && !hasDataChanged()) {
                return // Just return without alert - button should be disabled
            }

            const maxBills = selectedBill.noOfBills || selectedBill.no_of_bills || 0
            if (maxBills === 0) {
                alert('Invalid number of bills')
                return
            }
            if (isAdminUser()) {
                const validBillNumbers = poNumbers
                    .filter(billNumber => billNumber.trim() !== '')
                    .slice(0, maxBills)
                const hasNoPoSelections = Object.values(noPoSelections).some(isNoPo => isNoPo)

                if (validBillNumbers.length === 0 && !hasNoPoSelections) {
                    alert('Please enter at least one bill number or select "No PO" for at least one bill')
                    return
                }
            }
            if (poNumbers.filter(billNumber => billNumber.trim() !== '').length > maxBills) {
                alert(`You can only enter ${maxBills} bill numbers maximum`)
                return
            }

            // Auto-run Check PO validation before submission (same logic as handleCheckPO)
            const vendorId = selectedBill.vendorId || selectedBill.vendor_id
            if (!vendorId) {
                alert('Vendor ID not found')
                return
            }

            // Get vendor purchase orders and existing bill numbers
            const vendorPurchaseOrders = purchaseOrders.filter(po =>
                po.vendor_id === vendorId || po.vendorId === vendorId
            )
            const vendorENOs = vendorPurchaseOrders.map(po =>
                po.eno || po.po_number || po.purchase_order_number
            ).filter(eno => eno)

            // Auto-validate all current bill numbers
            const autoValidationResults = {}

            for (let i = 0; i < maxBills; i++) {
                const billNumber = poNumbers[i] || ''
                const isNoPo = noPoSelections[i] || false
                let isMatched = false
                let message = ''

                if (isNoPo) {
                    // "No PO" option is always verified and matched
                    isMatched = true
                    message = 'No PO - Verified'
                } else if (billNumber.trim()) {
                    // Check if this bill number is already entered for this vendor
                    const currentTrackerId = selectedBill.id
                    let isAlreadyEntered = false

                    // Check against all existing trackers for same vendor
                    for (const tracker of apiData) {
                        if (tracker.id !== currentTrackerId) { // Skip current tracker
                            const trackerVendorId = tracker.vendor_id || tracker.vendorId
                            if (trackerVendorId === vendorId) { // Same vendor
                                const verifications = tracker.billVerifications || []
                                for (const verification of verifications) {
                                    const existingBill = verification.bill_number || verification.billNumber
                                    if (existingBill && existingBill !== 'NO_PO' && String(existingBill).trim() === billNumber.trim()) {
                                        isAlreadyEntered = true
                                        break
                                    }
                                }
                                if (isAlreadyEntered) break
                            }
                        }
                    }

                    if (isAlreadyEntered) {
                        // Bill number is already entered for this vendor
                        isMatched = false
                        message = 'Already Entered'
                    } else {
                        // Check against purchase orders only if not already entered
                        isMatched = vendorENOs.includes(billNumber.trim())
                        message = isMatched ? 'Matched' : 'Not Matched'
                    }
                } else {
                    message = 'No PO Entered'
                }

                autoValidationResults[i] = {
                    matched: isMatched,
                    message: message
                }
            }

            // Update the validation results state
            setValidationResults(autoValidationResults)

            // Check for unmatched bill numbers and prevent submission if any exist
            const unmatchedBills = []
            for (let i = 0; i < maxBills; i++) {
                const billNumber = poNumbers[i] || ''
                const isNoPo = noPoSelections[i] || false
                const validation = autoValidationResults[i]

                // Check if bill number exists and is not matched
                if (billNumber.trim() && !isNoPo) {
                    if (!validation || !validation.matched) {
                        unmatchedBills.push(`Bill number ${i + 1} (${billNumber.trim()})`)
                    }
                }
            }

            if (unmatchedBills.length > 0) {
                alert(`Cannot submit: ${unmatchedBills.join(', ')} is/are not matched with purchase orders. Please change these bill numbers or use "Check PO" button first.`)
                return
            }

            const trackerId = selectedBill.id
            const existingBills = selectedBill.billVerifications || []
            const billsData = []

            // Process all bill slots (up to maxBills)
            for (let i = 0; i < maxBills; i++) {
                const existingBill = existingBills[i]
                const billNumber = poNumbers[i] || ''
                const isNoPo = noPoSelections[i] || false
                const validation = autoValidationResults[i] // Use auto-validation results

                // Determine verification status based on auto-validation results
                let finalStatus = 'NOT_VERIFIED'
                let finalIsVerified = false

                if (isNoPo) {
                    // "No PO" is always verified
                    finalStatus = 'VERIFIED'
                    finalIsVerified = true
                } else if (billNumber.trim()) {
                    // Bill number exists
                    if (validation && validation.matched) {
                        // Bill number was verified by auto-validation
                        finalStatus = 'VERIFIED'
                        finalIsVerified = true
                    } else {
                        // Bill number exists but not verified
                        finalStatus = 'NOT_VERIFIED'
                        finalIsVerified = false
                    }
                } else {
                    // Empty bill number
                    finalStatus = 'NOT_VERIFIED'
                    finalIsVerified = false
                }

                let billData = {
                    bill_number: isNoPo ? 'NO_PO' : (billNumber || ''),
                    status: finalStatus,
                    is_verified: finalIsVerified,
                    verified_date: finalIsVerified ? new Date().toISOString() : null
                }

                if (existingBill) {
                    billData.id = existingBill.id
                }

                billsData.push(billData)
            }
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
            // Count verified bills and get their numbers
            const verifiedBills = billsData.filter(bill => bill.is_verified && bill.bill_number !== 'NO_PO')
            const verifiedBillNumbers = verifiedBills.map(bill => bill.bill_number)
            const verifiedCount = verifiedBills.length

            // Show only verified bills information
            if (verifiedCount > 0) {
                alert(`Verified Bills - ${verifiedCount} matched (${verifiedBillNumbers.join(', ')})`)
            } else {
                alert('Bills saved successfully')
            }

            // Mark as submitted and update original data
            setHasBeenSubmitted(true)
            setOriginalData({
                poNumbers: [...poNumbers],
                noPoSelections: { ...noPoSelections },
                verifiedBills: { ...verifiedBills }
            })

            await fetchTrackerData()
            await fetchExpensesData() // Refresh expenses data to recalculate match status
            await fetchAllBillEntries() // Refresh all bill entries
            setShowModal(false)
            setSelectedBill(null)
            setPoNumbers([])

            // Reload the page after successful submit
            window.location.reload()
        } catch (error) {
            alert(`Error saving bills: ${error.message}`)
        }
    }
    const handleCancel = () => {
        setShowModal(false)
        setSelectedBill(null)
        setPoNumbers([])
        setValidationResults({})
        setIsEditMode(false)
        setVerifiedBills({})
        setNoPoSelections({})
        setCheckedBills({})
        setHasBeenSubmitted(false)
        setOriginalData(null)
        setEditModeStartData(null)
    }

    // Edit handler functions
    const handleEditClick = (item) => {
        setSelectedEditItem(item)
        
        const formData = {
            billArrivalDate: item.bill_arrival_date ? new Date(item.bill_arrival_date).toISOString().split('T')[0] : '',
            vendorId: item.vendor_id ? { value: item.vendor_id, label: getVendorNameById(item.vendor_id) } : null,
            noOfBills: item.no_of_bills || item.noOfBills || '',
            totalAmount: item.total_amount || ''
        }
        
        setEditFormData(formData)
        setShowEditModal(true)
    }

    const handleEditInputChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleEditSubmit = async () => {
        if (!selectedEditItem) return

        setEditLoading(true)
        try {
            // Always send all fields to prevent null values in backend
            const payload = {
                bill_arrival_date: editFormData.billArrivalDate || (selectedEditItem.bill_arrival_date ? 
                    new Date(selectedEditItem.bill_arrival_date).toISOString().split('T')[0] : ''),
                vendor_id: editFormData.vendorId?.id || selectedEditItem.vendor_id,
                no_of_bills: parseInt(editFormData.noOfBills) || selectedEditItem.no_of_bills || selectedEditItem.noOfBills || 0,
                total_amount: parseFloat(editFormData.totalAmount) || selectedEditItem.total_amount || 0
            }
            
            // Check if any fields were actually changed
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
                
                // Reload the page to show updated data
                window.location.reload()
            }
        } catch (error) {
            console.error('Error updating tracker details:', error)
            alert(`Failed to update tracker details: ${error.response?.data?.message || error.message}`)
        } finally {
            setEditLoading(false)
        }
    }

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

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode)
        if (!isEditMode) {
            // When entering edit mode, clear validation results to allow fresh checking
            // But preserve existing checkbox states (verifiedBills, noPoSelections, and checkedBills)
            setValidationResults({})

            // Capture current data when entering edit mode
            setEditModeStartData({
                poNumbers: [...poNumbers],
                noPoSelections: { ...noPoSelections },
                verifiedBills: { ...verifiedBills }
            })
        } else {
            // When exiting edit mode, clear edit mode start data
            setEditModeStartData(null)
        }
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

            // First check for duplicate numbers within the current popup
            const duplicateNumbers = []
            const currentBillNumbers = poNumbers.filter(num => num.trim() !== '')
            const duplicateMap = {}

            currentBillNumbers.forEach((billNumber, index) => {
                if (duplicateMap[billNumber]) {
                    duplicateMap[billNumber].push(index)
                } else {
                    duplicateMap[billNumber] = [index]
                }
            })

            // Find duplicates
            Object.keys(duplicateMap).forEach(billNumber => {
                if (duplicateMap[billNumber].length > 1) {
                    duplicateNumbers.push(billNumber)
                }
            })

            if (duplicateNumbers.length > 0) {
                alert(` Duplicate bill found within the same bill number: ${duplicateNumbers.join(', ')}. Please enter unique bill numbers.`)
                setCheckingPO(false)
                return
            }

            // Check all input boxes - whether they have values or not
            poNumbers.forEach((billNumber, index) => {
                const isNoPo = noPoSelections[index]
                let isMatched = false
                let message = ''

                if (isNoPo) {
                    // "No PO" option is always verified and matched
                    isMatched = true
                    message = 'No PO - Verified'
                } else if (billNumber.trim()) {
                    // Check if this bill number is already entered for this vendor
                    const currentTrackerId = selectedBill.id
                    const currentDate = selectedBill.bill_arrival_date || selectedBill.billArrivalDate
                    let isAlreadyEntered = false

                    // Check against all existing trackers for same vendor
                    for (const tracker of apiData) {
                        if (tracker.id !== currentTrackerId) { // Skip current tracker
                            const trackerVendorId = tracker.vendor_id || tracker.vendorId
                            if (trackerVendorId === vendorId) { // Same vendor
                                const verifications = tracker.billVerifications || []
                                for (const verification of verifications) {
                                    const existingBill = verification.bill_number || verification.billNumber
                                    if (existingBill && existingBill !== 'NO_PO' && String(existingBill).trim() === billNumber.trim()) {
                                        isAlreadyEntered = true
                                        break
                                    }
                                }
                                if (isAlreadyEntered) break
                            }
                        }
                    }

                    if (isAlreadyEntered) {
                        // Bill number is already entered for this vendor
                        isMatched = false
                        message = 'Already Entered'
                    } else {
                        // Check against purchase orders only if not already entered
                        isMatched = vendorENOs.includes(billNumber.trim())
                        message = isMatched ? 'Matched' : 'Not Matched'
                    }
                } else {
                    message = 'No PO Entered'
                }
                newValidationResults[index] = {
                    matched: isMatched,
                    message: message
                }
            })
            setValidationResults(newValidationResults)

            // Mark bills as checked using Check PO button (for both first-time and edit mode)
            // Only mark as checked if they are actually matched/validated
            const newCheckedBills = {}
            poNumbers.forEach((billNumber, index) => {
                const isNoPo = noPoSelections[index]
                const validation = newValidationResults[index]

                // Only mark as checked if:
                // 1. It's "No PO" AND admin user (admin must manually select No PO)
                // 2. It has a bill number AND it's matched
                if ((isNoPo && isAdminUser()) || (billNumber.trim() && validation && validation.matched)) {
                    newCheckedBills[index] = true
                }
            })
            setCheckedBills(prev => ({ ...prev, ...newCheckedBills }))

        } catch (error) {
            alert('Error checking PO numbers')
        } finally {
            setCheckingPO(false)
        }
    }

    const handleSendRequest = async () => {
        try {
            const trackerId = selectedBill.id
            if (!trackerId) {
                alert('Tracker ID not found')
                return
            }

            // Check if this is first-time entry (no existing bill verifications)
            const isFirstTimeEntry = !selectedBill.billVerifications || selectedBill.billVerifications.length === 0

            // For admin users, validate that user has entered bill numbers or selected "No PO"
            // For normal users, allow sending request even with empty bill numbers
            const maxBills = selectedBill.noOfBills || selectedBill.no_of_bills || 0
            if (isAdminUser()) {
                const validBillNumbers = poNumbers
                    .filter(billNumber => billNumber.trim() !== '')
                    .slice(0, maxBills)
                const hasNoPoSelections = Object.values(noPoSelections).some(isNoPo => isNoPo)

                if (validBillNumbers.length === 0 && !hasNoPoSelections) {
                    alert('Please enter at least one bill number or select "No PO" before sending request')
                    return
                }
            }

            // Check if there are any entered bill numbers that are not verified
            if (hasUnverifiedBillNumbers()) {
                alert('Cannot send request: Some entered bill numbers are not verified or not checked. Please use "Check PO" button to verify all entered bill numbers first.')
                return
            }

            // Always save current bill data before sending request (for both first-time and edit mode)
            const existingBills = selectedBill.billVerifications || []
            const billsData = []

            // Process all bill slots (up to maxBills)
            for (let i = 0; i < maxBills; i++) {
                const existingBill = existingBills[i]
                const billNumber = poNumbers[i] || ''
                const isNoPo = noPoSelections[i] || false
                const validation = validationResults[i]

                // Determine verification status based on Check PO results
                let finalStatus = 'NOT_VERIFIED'
                let finalIsVerified = false

                if (isNoPo) {
                    // "No PO" is always verified
                    finalStatus = 'VERIFIED'
                    finalIsVerified = true
                } else if (billNumber.trim()) {
                    // Bill number exists
                    if (validation && validation.matched) {
                        // Bill number was verified by Check PO
                        finalStatus = 'VERIFIED'
                        finalIsVerified = true
                    } else {
                        // Bill number exists but not verified by Check PO
                        finalStatus = 'NOT_VERIFIED'
                        finalIsVerified = false
                    }
                } else {
                    // Empty bill number
                    finalStatus = 'NOT_VERIFIED'
                    finalIsVerified = false
                }

                let billData = {
                    bill_number: isNoPo ? 'NO_PO' : (billNumber || ''),
                    status: finalStatus,
                    is_verified: finalIsVerified,
                    verified_date: finalIsVerified ? new Date().toISOString() : null
                }

                if (existingBill) {
                    billData.id = existingBill.id
                }

                billsData.push(billData)
            }

            // Save current bill data first
            const billResponse = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${trackerId}/bills`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(billsData)
            })

            if (!billResponse.ok) {
                throw new Error(`Failed to save current bill data: ${billResponse.statusText}`)
            }

            // Now send the request
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${trackerId}/send-request?sendRequest=true`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to send request: ${response.statusText}`)
            }

            alert('Current data saved and request sent successfully!')

            // Refresh data to show updated status
            await fetchTrackerData()

            // Close modal and reload the page after successful request send
            setShowModal(false)
            setSelectedBill(null)
            setPoNumbers([])
            setValidationResults({})
            setIsEditMode(false)
            setVerifiedBills({})
            setNoPoSelections({})
            setCheckedBills({})
            window.location.reload()

        } catch (error) {
            alert(`Error sending request: ${error.message}`)
        }
    }

    // Fetch users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("https://backendaab.in/aabuilderDash/api/user/all");
                const usersWithRoles = response.data.map((user) => ({
                    ...user,
                    roles: user.userRoles ? user.userRoles.map((role) => role.roles) : [],
                }));
                setUserList(usersWithRoles);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    // Helper function to get user options for dropdown
    const getUserOptions = () => {
        return userList.map(user => ({
            value: user.username,
            label: user.username,
            id: user.id
        }));
    };

    // Helper function to check if user has admin privileges
    const isAdminUser = () => {
        return username === 'Admin' || username === 'Mahalingam M'
    }

    // Helper function to check if current user can edit an entry
    const canEditEntry = (entry) => {
        // Admin users can edit any entry
        if (isAdminUser()) {
            return true;
        }
        // Regular users can only edit their own entries
        return entry.entered_by === username;
    }

    // Helper function to check if all bills are verified and not paid
    const areAllBillsVerifiedAndNotPaid = () => {
        if (!selectedBill?.billVerifications || selectedBill.billVerifications.length === 0) {
            return false
        }

        // Check if all bills are verified and not paid
        return selectedBill.billVerifications.every(verification =>
            (verification.is_verified === true || verification.status === 'VERIFIED') &&
            (verification.is_paid === false || verification.status !== 'PAID')
        )
    }

    // Handle Approve Request for Admin users
    const handleApproveRequest = async () => {
        try {
            const trackerId = selectedBill.id
            if (!trackerId) {
                alert('Tracker ID not found')
                return
            }

            // Auto-run Check PO validation before approval
            const vendorId = selectedBill.vendorId || selectedBill.vendor_id
            if (!vendorId) {
                alert('Vendor ID not found')
                return
            }

            // Get vendor purchase orders and existing bill numbers
            const vendorPurchaseOrders = purchaseOrders.filter(po =>
                po.vendor_id === vendorId || po.vendorId === vendorId
            )
            const vendorENOs = vendorPurchaseOrders.map(po =>
                po.eno || po.po_number || po.purchase_order_number
            ).filter(eno => eno)

            // Auto-validate all current bill numbers
            const maxBills = selectedBill.noOfBills || selectedBill.no_of_bills || 0
            const autoValidationResults = {}

            for (let i = 0; i < maxBills; i++) {
                const billNumber = poNumbers[i] || ''
                const isNoPo = noPoSelections[i] || false
                let isMatched = false
                let message = ''

                if (isNoPo) {
                    // "No PO" option is always verified and matched
                    isMatched = true
                    message = 'No PO - Verified'
                } else if (billNumber.trim()) {
                    // Check if this bill number is already entered for this vendor
                    const currentTrackerId = selectedBill.id
                    let isAlreadyEntered = false

                    // Check against all existing trackers for same vendor
                    for (const tracker of apiData) {
                        if (tracker.id !== currentTrackerId) { // Skip current tracker
                            const trackerVendorId = tracker.vendor_id || tracker.vendorId
                            if (trackerVendorId === vendorId) { // Same vendor
                                const verifications = tracker.billVerifications || []
                                for (const verification of verifications) {
                                    const existingBill = verification.bill_number || verification.billNumber
                                    if (existingBill && existingBill !== 'NO_PO' && String(existingBill).trim() === billNumber.trim()) {
                                        isAlreadyEntered = true
                                        break
                                    }
                                }
                                if (isAlreadyEntered) break
                            }
                        }
                    }

                    if (isAlreadyEntered) {
                        // Bill number is already entered for this vendor
                        isMatched = false
                        message = 'Already Entered'
                    } else {
                        // Check against purchase orders only if not already entered
                        isMatched = vendorENOs.includes(billNumber.trim())
                        message = isMatched ? 'Matched' : 'Not Matched'
                    }
                } else {
                    message = 'No PO Entered'
                }

                autoValidationResults[i] = {
                    matched: isMatched,
                    message: message
                }
            }

            // Update the validation results state
            setValidationResults(autoValidationResults)

            // Validation 1: Check for unmatched bill numbers (using auto-validation results)
            const unmatchedBills = []

            for (let i = 0; i < maxBills; i++) {
                const billNumber = poNumbers[i] || ''
                const isNoPo = noPoSelections[i] || false
                const validation = autoValidationResults[i]

                // Check if bill number exists and is not matched
                if (billNumber.trim() && !isNoPo) {
                    if (!validation || !validation.matched) {
                        unmatchedBills.push(`Bill number ${i + 1} (${billNumber.trim()})`)
                    }
                }
            }

            if (unmatchedBills.length > 0) {
                alert(`Cannot approve: ${unmatchedBills.join(', ')} is/are not matched. Please change these bill numbers.`)
                return
            }

            // Validation 2: Check for duplicate bill numbers
            const duplicateBills = []
            const currentBillNumbers = []
            const currentDate = selectedBill.bill_arrival_date || selectedBill.billArrivalDate

            // Collect current bill numbers
            for (let i = 0; i < maxBills; i++) {
                const billNumber = poNumbers[i] || ''
                const isNoPo = noPoSelections[i] || false

                if (billNumber.trim() && !isNoPo) {
                    currentBillNumbers.push(billNumber.trim())
                }
            }

            // Check against all existing trackers for duplicates
            for (const billNumber of currentBillNumbers) {
                for (const tracker of apiData) {
                    if (tracker.id !== trackerId) { // Skip current tracker
                        const trackerDate = tracker.bill_arrival_date || tracker.billArrivalDate
                        if (trackerDate === currentDate) { // Same date
                            const verifications = tracker.billVerifications || []
                            for (const verification of verifications) {
                                const existingBill = verification.bill_number || verification.billNumber
                                if (existingBill && existingBill !== 'NO_PO' && String(existingBill).trim() === billNumber) {
                                    duplicateBills.push(`Bill number ${billNumber} on ${currentDate}`)
                                    break
                                }
                            }
                        }
                    }
                }
            }

            if (duplicateBills.length > 0) {
                alert(`Cannot approve: ${duplicateBills.join(', ')} is/are already submitted on the same date. Please change these bill numbers.`)
                return
            }

            // First, update all bill verifications according to business logic
            const existingBills = selectedBill.billVerifications || []
            const billsData = []

            // Process all bill slots (up to maxBills)
            for (let i = 0; i < maxBills; i++) {
                const existingBill = existingBills[i]
                const billNumber = poNumbers[i] || ''
                const isNoPo = noPoSelections[i] || false
                const validation = validationResults[i]

                // Admin approval logic:
                // 1. If 'No PO' is selected, set to 'NO_PO' 
                // 2. If bill number exists (even if not verified), keep it as-is
                // 3. If bill number is empty, set it to 'NO_PO'
                let finalBillNumber = ''
                let finalStatus = 'NOT_VERIFIED'
                let finalIsVerified = false

                if (isNoPo) {
                    // Explicitly selected "No PO"
                    finalBillNumber = 'NO_PO'
                    finalStatus = 'VERIFIED'
                    finalIsVerified = true
                } else if (billNumber.trim()) {
                    // Bill number exists - keep it as-is regardless of verification status
                    finalBillNumber = billNumber.trim()
                    if (validation && validation.matched) {
                        // Bill number is verified
                        finalStatus = 'VERIFIED'
                        finalIsVerified = true
                    } else {
                        // Bill number exists but not verified - keep the number but mark as verified
                        finalStatus = 'VERIFIED'
                        finalIsVerified = true
                    }
                } else {
                    // Empty bill number, set to NO_PO
                    finalBillNumber = 'NO_PO'
                    finalStatus = 'VERIFIED'
                    finalIsVerified = true
                }

                let billData = {
                    bill_number: finalBillNumber,
                    status: finalStatus,
                    is_verified: finalIsVerified,
                    verified_date: finalIsVerified ? new Date().toISOString() : null
                }

                if (existingBill) {
                    billData.id = existingBill.id
                }

                billsData.push(billData)
            }

            // Update bill verifications first
            const billResponse = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${trackerId}/bills`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(billsData)
            })

            if (!billResponse.ok) {
                throw new Error(`Failed to update bill verifications: ${billResponse.statusText}`)
            }

            // Then approve the request
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${trackerId}/approve-request?requestApproved=true`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to approve request: ${response.statusText}`)
            }

            alert('Request approved successfully! Empty bill numbers have been set to NO_PO, existing bill numbers preserved.')

            // Refresh data to show updated status
            await fetchTrackerData()

            // Close modal and reload the page after successful approval
            setShowModal(false)
            setSelectedBill(null)
            setPoNumbers([])
            setValidationResults({})
            setIsEditMode(false)
            setVerifiedBills({})
            setNoPoSelections({})
            setCheckedBills({})
            window.location.reload()

        } catch (error) {
            alert(`Error approving request: ${error.message}`)
        }
    }

    // Handle Reject Request for Admin users
    const handleRejectRequest = async () => {
        try {
            const trackerId = selectedBill.id
            if (!trackerId) {
                alert('Tracker ID not found')
                return
            }

            const response = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${trackerId}/send-request?sendRequest=false`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to reject request: ${response.statusText}`)
            }

            alert('Request rejected successfully!')

            // Refresh data to show updated status
            await fetchTrackerData()

            // Close modal and reload the page after successful rejection
            setShowModal(false)
            setSelectedBill(null)
            setPoNumbers([])
            setValidationResults({})
            setIsEditMode(false)
            setVerifiedBills({})
            setNoPoSelections({})
            setCheckedBills({})
            window.location.reload()

        } catch (error) {
            alert(`Error rejecting request: ${error.message}`)
        }
    }

    // Helper function to check if there are unverified bill numbers
    const hasUnverifiedBillNumbers = () => {
        const maxBills = selectedBill?.noOfBills || selectedBill?.no_of_bills || 0
        for (let i = 0; i < maxBills; i++) {
            const billNumber = poNumbers[i] || ''
            const isNoPo = noPoSelections[i] || false
            const validation = validationResults[i]

            // If there's an entered bill number that's not "No PO"
            if (billNumber.trim() && !isNoPo) {
                // Check if it's verified:
                // 1. If no validation result exists, it's unverified (user hasn't clicked Check PO)
                // 2. If validation exists but not matched, it's unverified
                if (!validation || !validation.matched) {
                    return true
                }
            }
        }
        return false
    }

    // Helper function to check if Send Request button should be disabled
    const isSendRequestDisabled = () => {
        if (selectedBill?.send_request && !isAdminUser()) {
            return true // Already sent (unless admin user)
        }

        // If this is existing data (already submitted before), allow Send Request without Check PO
        if (hasBeenSubmitted && originalData) {
            return false // Allow Send Request for existing data
        }

        // Check if there are any entered bill numbers that are not verified (only for new data)
        if (hasUnverifiedBillNumbers()) {
            return true // Disable Send Request if any entered bill number is not verified
        }

        // For normal users, allow Send Request even without bill numbers (if no unverified entries)
        if (!isAdminUser()) {
            return false
        }

        // For admin users, check if user has entered any bill numbers or selected "No PO"
        const maxBills = selectedBill?.noOfBills || selectedBill?.no_of_bills || 0
        const validBillNumbers = poNumbers
            .filter(billNumber => billNumber.trim() !== '')
            .slice(0, maxBills)
        const hasNoPoSelections = Object.values(noPoSelections).some(isNoPo => isNoPo)

        return validBillNumbers.length === 0 && !hasNoPoSelections
    }

    const handleEntryClick = async (bill) => {
        setSelectedEntryBill(bill)
        setShowEntryModal(true)
        
        // Set today's date as default
        setEntryFormData({
            enteredBy: null,
            date: new Date().toISOString().split('T')[0]
        })
        
        // Initialize numberInputValue with existing adjustment amount if available
        setNumberInputValue(bill.adjustment_amount || bill.adjustmentAmount || '')
        setNumberInputLocked(false) // Ensure input is unlocked when modal opens
        setHasStartedEditing(false) // Reset editing flag when modal opens

        // Fetch existing bill entry details if any
        const existingDetails = await fetchExistingBillEntryDetails(bill.id)

        // Fetch vendorPaymentsTracker data to check for existing adjustment_amount
        try {
            const trackerResponse = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${bill.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (trackerResponse.ok) {
                const trackerData = await trackerResponse.json()
                // Update selectedEntryBill with the tracker data including adjustment_amount
                setSelectedEntryBill(prev => ({
                    ...prev,
                    adjustment_amount: trackerData.adjustment_amount,
                    ...trackerData
                }))
                
                // Update numberInputValue with the fetched adjustment amount
                if (trackerData.adjustment_amount) {
                    setNumberInputValue(trackerData.adjustment_amount.toString())
                }
            }
        } catch (error) {
            console.error('Error fetching tracker data:', error)
        }

        // Always reset the editable inputs; show history separately above
        setEntryFormData({
            enteredBy: null,
            date: ''
        })
    }
    const handleEntryInputChange = (field, value) => {
        setEntryFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }
    const handleEntrySubmit = async () => {
        if (!entryFormData.date) {
            alert('Please fill all required fields')
            return
        }

        try {
            // Prepare the data for the API call
            const billEntryData = {
                vendor_payments_tracker_id: selectedEntryBill.id,
                entered_by: username, // Use current username directly
                entered_date: entryFormData.date
            }

            // Send data to the backend API
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

            // Update API data if it exists
            if (selectedEntryBill && apiData.length > 0) {
                setApiData(prev => prev.map(item =>
                    item.id === selectedEntryBill.id
                        ? { ...item, entry_status: 'Entered' }
                        : item
                ))
            }

            alert('Bill entry details saved successfully!')

            // Close modal and reset form
            setShowEntryModal(false)
            setSelectedEntryBill(null)
            setEntryFormData({
                enteredBy: null,
                date: ''
            })
            setAdditionalFields([])

            // Refresh the tracker data to show updated status
            await fetchTrackerData()
            await fetchExpensesData() // Refresh expenses data to recalculate match status
            await fetchAllBillEntries() // Refresh all bill entries

        } catch (error) {
            console.error('Error saving bill entry:', error)
            alert(`Error saving bill entry: ${error.message}`)
        }
    }
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
        // Note: We don't reset previousEntryNumbers here to persist the locked values
    }

    const handleEditPreviousEntry = (entry) => {
        setEditingPreviousEntry(entry.id)
        setPreviousEntryEditData({
            enteredBy: entry.entered_by,
            date: new Date(entry.entered_date).toISOString().split('T')[0]
        })
    }

    const handlePreviousEntryInputChange = (field, value) => {
        setPreviousEntryEditData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handlePreviousEntrySave = async (entryId) => {
        try {
            // Update the previous entry with new data
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

            // Refresh the data
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

    const handleNumberInputChange = (e) => {
        const value = e.target.value
        // Allow any valid number (including negative values for adjustments)
        if (value === '' || !isNaN(Number(value))) {
            setNumberInputValue(value)
            setHasStartedEditing(true)
        }
    }

    const handleNumberInputCheckbox = (e) => {
        if (e.target.checked && numberInputValue) {
            setNumberInputLocked(true)
        }
    }

    const handleAdjustmentAmountUpdate = async () => {
        // Allow empty values to clear the adjustment amount
        if (numberInputValue === undefined || numberInputValue === null) {
            alert('Please enter an adjustment amount')
            return
        }

        // Use the bill ID from the current context - try selectedEntryBill first, then fallback to selectedBill
        const billId = selectedEntryBill?.id || selectedBill?.id
        if (!billId) {
            alert('No bill selected')
            return
        }

        // Handle empty string as 0 (clearing the adjustment)
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
                // Update the local state to reflect the new adjustment amount
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

                // Update the bills list to reflect the change
                setBillData(prev => prev.map(bill =>
                    bill.id === billId
                        ? { ...bill, adjustment_amount: adjustmentAmount, adjustmentAmount: adjustmentAmount }
                        : bill
                ))

                // Update API data if it exists
                if (apiData.length > 0) {
                    setApiData(prev => prev.map(item =>
                        item.id === billId
                            ? { ...item, adjustment_amount: adjustmentAmount, adjustmentAmount: adjustmentAmount }
                            : item
                    ))
                }

                alert('Adjustment amount updated successfully')
                // Update the input value to show the new amount (or empty if cleared)
                setNumberInputValue(adjustmentAmount === 0 ? '' : adjustmentAmount.toString())
                setNumberInputLocked(false)
                setHasStartedEditing(false) // Reset editing flag after successful update
                
                // Close the modal automatically after successful update
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
    const handlePaymentClick = async (bill) => {
        setSelectedPaymentBill(bill)

        // Set amount calculations
        const billAmount = parseFloat(bill.total_amount) || 0;
        setActualAmount(billAmount);

        // Fetch existing payment details if any
        const existingPayments = await fetchExistingPaymentDetails(bill.id);

        // Calculate received amount and remaining amount
        let receivedAmount = 0;
        let totalDiscount = 0;

        if (existingPayments && existingPayments.length > 0) {
            receivedAmount = existingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            totalDiscount = existingPayments.reduce((sum, payment) => sum + (payment.discount_amount || 0), 0);
        }

        const remainingAmount = Math.max(0, billAmount - receivedAmount);
        setRemainingAmount(remainingAmount);
        setDiscount(totalDiscount);
        setDiscountSubmitted(totalDiscount > 0);

        // Find vendor account details for the selected bill from MasterData
        const vendorId = bill.vendor_id || bill.vendorId
        if (vendorId) {
            try {
                // Fetch vendor details from MasterData API
                const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const vendorData = await response.json();
                    // Find the specific vendor by ID
                    const vendorDetails = vendorData.find(vendor => vendor.id === vendorId);
                    setSelectedVendorAccountDetails(vendorDetails || null);
                } else {
                    console.error("Failed to fetch vendor details:", response.status);
                    setSelectedVendorAccountDetails(null);
                }
            } catch (error) {
                console.error("Error fetching vendor details:", error);
                setSelectedVendorAccountDetails(null);
            }
        } else {
            setSelectedVendorAccountDetails(null)
        }

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
    }
    const handleAddPaymentEntry = () => {
        const newEntry = {
            id: Date.now(),
            date: '',
            amount: '',
            mode: '',
            attachedFile: null,
            chequeNo: '',
            chequeDate: '',
            transactionNumber: '',
            accountNumber: ''
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
    const handlePaymentSubmit = async () => {
        const hasEmptyFields = paymentEntries.some(entry =>
            !entry.date || !entry.amount || !entry.mode
        )
        if (hasEmptyFields) {
            alert('Please fill all required fields in payment entries')
            return
        }

        // Validate payment mode specific fields
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

        try {
            const totalPaymentAmount = paymentEntries.reduce((sum, entry) => {
                return sum + (parseFloat(entry.amount) || 0)
            }, 0)
            const currentReceivedAmount = actualAmount - remainingAmount; // Current received amount
            const newTotalReceived = currentReceivedAmount + totalPaymentAmount; // New total received
            const newRemainingAmount = Math.max(0, actualAmount - newTotalReceived)
            const paymentDetailsPromises = paymentEntries.map(async (entry) => {
                const paymentData = {
                    vendor_payments_tracker_id: selectedPaymentBill.id,
                    date: entry.date,
                    actual_amount: actualAmount,
                    amount: parseFloat(entry.amount) || 0,
                    discount_amount: discount,
                    carry_forward_amount: 0,
                    vendor_bill_payment_mode: entry.mode,
                    cheque_number: entry.chequeNo || '',
                    cheque_date: entry.chequeDate || '',
                    transaction_number: entry.transactionNumber || '',
                    account_number: entry.accountNumber || ''
                }

                // Send payment details to the API
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

            // Wait for all payment details to be saved
            const savedPaymentDetails = await Promise.all(paymentDetailsPromises)

            // Send to weekly payment bills API for each payment entry
            for (let i = 0; i < paymentEntries.length; i++) {
                const entry = paymentEntries[i];
                const savedPaymentDetail = savedPaymentDetails[i];
                const weeklyPaymentBillPayload = {
                    date: entry.date,
                    created_at: new Date().toISOString(),
                    contractor_id: null,
                    vendor_id: selectedPaymentBill.vendor_id,
                    employee_id: null,
                    project_id: null,
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
                    vendor_payment_tracker_id: savedPaymentDetail?.id || selectedPaymentBill.id,
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

            // Update local state
            setBillData(prev => prev.map(bill =>
                bill.id === selectedPaymentBill.id
                    ? { ...bill, paymentStatus: newRemainingAmount === 0 ? 'Paid' : 'Partially Paid' }
                    : bill
            ))

            // Update API data if it exists
            if (selectedPaymentBill && apiData.length > 0) {
                setApiData(prev => prev.map(item =>
                    item.id === selectedPaymentBill.id
                        ? { ...item, payment_status: newRemainingAmount === 0 ? 'Paid' : 'Partially Paid' }
                        : item
                ))
            }
            setShowPaymentModal(false)
            setPaymentEntries([
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
            setExistingPaymentDetails(null)
            setLoadingPaymentDetails(false)
            setDiscount(0)
            setDiscountSubmitted(false)
            setActualAmount(0)
            setRemainingAmount(0)

            // Refresh the tracker data to show updated status
            await fetchTrackerData()
            await fetchExpensesData() // Refresh expenses data to recalculate match status
            await fetchAllBillEntries() // Refresh all bill entries

            // Update payment status for this specific item
            const updatedStatus = await getPaymentStatus(selectedPaymentBill);
            setPaymentStatuses(prev => ({
                ...prev,
                [selectedPaymentBill.id]: updatedStatus
            }));

            // Show success message
            alert('Payment details saved successfully and added to Weekly Payment Bills!');

        } catch (error) {
            console.error('Error saving payment details:', error)
            alert(`Error saving payment details: ${error.message}`)
        }
    }
    const handleAddField = () => {
        const newField = {
            id: Date.now(),
            type: 'text',
            value: username,
            dateValue: '',
            dropdownValue: null
        }
        setAdditionalFields(prev => [...prev, newField])
    }
    const handleRemoveField = (fieldId) => {
        setAdditionalFields(prev => prev.filter(field => field.id !== fieldId))
    }
    const handleDynamicFieldChange = (fieldId, value, type = 'text') => {
        setAdditionalFields(prev => prev.map(field =>
            field.id === fieldId ? { ...field, [type === 'date' ? 'dateValue' : 'value']: value } : field
        ))
    }
    const handleDynamicDropdownChange = (fieldId, selectedOption) => {
        setAdditionalFields(prev => prev.map(field =>
            field.id === fieldId ? { ...field, dropdownValue: selectedOption, value: '' } : field
        ))
    }
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
    const getVendorNameById = (vendorId) => {
        if (!vendorId) return '-'
        const vendor = vendorOptions.find(option => option.id === vendorId)
        return vendor ? vendor.label : `Vendor ID: ${vendorId}`
    }

    const formatIndianCurrency = (amount) => {
        if (!amount || isNaN(amount)) return '₹0';
        const numAmount = parseFloat(amount);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(numAmount);
    }
    const isBillAlreadyPaid = (vendorIdToCheck, billNumberToCheck) => {
        if (!vendorIdToCheck || !billNumberToCheck) return false
        const normalizedBill = String(billNumberToCheck).trim()
        for (const tracker of apiData) {
            const trackerVendorId = tracker.vendor_id || tracker.vendorId
            if (trackerVendorId !== vendorIdToCheck) continue
            const verifications = tracker.billVerifications || []
            for (const verification of verifications) {
                const vBill = verification.bill_number || verification.billNumber
                const paid = verification.is_paid === true || verification.status === 'PAID'
                if (paid && String(vBill).trim() === normalizedBill) {
                    return true
                }
            }
        }
        return false
    }
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

            // Calculate total paid amount
            const totalPaid = paymentDetails.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const totalDiscount = paymentDetails.reduce((sum, payment) => sum + (payment.discount_amount || 0), 0);
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
    const getVerifiedBillCount = (item) => {
        if (!item.billVerifications || item.billVerifications.length === 0) {
            return 0
        }
        return item.billVerifications.filter(verification =>
            (verification.is_verified === true || verification.status === 'VERIFIED') &&
            verification.bill_number !== 'NO_PO' &&
            verification.bill_number &&
            verification.bill_number.trim() !== ''
        ).length
    }
    // Helper: check if all bill verifications are completed (all verified)
    const isAllBillsVerified = (item) => {
        if (!item || !item.billVerifications || item.billVerifications.length === 0) return false
        return item.billVerifications.every(v => v.is_verified === true || v.status === 'VERIFIED')
    }

    // Helper: check if entry is completed (similar to how Entry button works)
    const isEntryCompleted = (item) => {
        // Check if entry status is 'Entered' or has expense match status
        const entryStatus = item.entry_status || 'Entry'
        const matchStatus = expenseMatchStatus[item.id]
        
        // Entry is completed if:
        // 1. Entry status is 'Entered' or '✓ Entered'
        // 2. Or if there's a complete match in expenses
        return entryStatus === 'Entered' || entryStatus === '✓ Entered' || matchStatus === 'complete_match'
    }

    // Sort data based on current sort configuration
    const applySorting = (data) => {
        if (!sortConfig.key) return data

        return [...data].sort((a, b) => {
            let aValue, bValue

            switch (sortConfig.key) {
                case 'bill_arrival_date':
                    aValue = new Date(a.bill_arrival_date || 0)
                    bValue = new Date(b.bill_arrival_date || 0)
                    break
                case 'vendor_name':
                    aValue = getVendorNameById(a.vendor_id).toLowerCase()
                    bValue = getVendorNameById(b.vendor_id).toLowerCase()
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

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }

    // Handle sort click
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
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

            // Prioritize frontend validation results over persisted verification
            if (hasValidation) {
                const validationMessage = validation.message
                if (isValid) {
                    const paidPreviously = !isNoPo && poNumber.trim() ? isBillAlreadyPaid(vendorIdForSelected, poNumber.trim()) : false
                    if (paidPreviously) {
                        borderClass = 'border-yellow-500'
                        tooltipText = 'Paid'
                    } else {
                        borderClass = 'border-green-500'
                        tooltipText = 'Matched'
                    }
                } else if (validationMessage === 'Already Entered') {
                    borderClass = 'border-orange-500'
                    tooltipText = 'Already Entered'
                } else {
                    borderClass = 'border-red-500'
                    tooltipText = 'Not Matched'
                }
            } else if (persistedVerification) {
                // Fallback to persisted verification if no frontend validation
                const persistedBillNumber = persistedVerification.bill_number || persistedVerification.billNumber || ''
                const persistedIsVerified = persistedVerification.is_verified === true || persistedVerification.status === 'VERIFIED'
                const persistedIsPaid = persistedVerification.is_paid === true || persistedVerification.status === 'PAID'
                if (persistedIsVerified) {
                    const billToCheck = persistedBillNumber && persistedBillNumber !== 'NO_PO' ? String(persistedBillNumber).trim() : (poNumber && poNumber !== 'NO_PO' ? String(poNumber).trim() : '')
                    const paidPreviously = billToCheck ? (persistedIsPaid || isBillAlreadyPaid(vendorIdForSelected, billToCheck)) : false
                    if (paidPreviously) {
                        borderClass = 'border-yellow-500'
                        tooltipText = 'Paid'
                    } else {
                        borderClass = 'border-green-500'
                        tooltipText = 'Matched'
                    }
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
        // Validate required fields
        if (!formData.billArrivalDate) {
            alert('Please select a bill arrival date');
            return;
        }
        if (!vendorId) {
            alert('Please select a vendor');
            return;
        }
        if (!formData.noOfBills || formData.noOfBills <= 0) {
            alert('Please enter a valid number of bills');
            return;
        }
        if (!formData.totalAmount || formData.totalAmount <= 0) {
            alert('Please enter a valid total amount');
            return;
        }

        try {
            const payload = {
                bill_arrival_date: formData.billArrivalDate,
                vendor_id: vendorId?.id,
                no_of_bills: Number(formData.noOfBills),
                total_amount: Number(formData.totalAmount),
            };
            const response = await axios.post("https://backendaab.in/aabuildersDash/api/vendor-payments/tracker", payload);
            alert(`Tracker created with ID: ${response.data.id}`);
            window.location.reload();
        } catch (error) {
            console.error("Error creating tracker:", error);
        }
    };
    return (
        <div className="">
            <div className="bg-white p-5  mb-5 ml-10 mr-10">
                <div className="flex flex-wrap gap-5 ml-5 text-left">
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
                        <select 
                            value={filters.paymentStatus}
                            onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                            className="w-[172px] h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-30 rounded-lg text-sm focus:outline-none "
                        >
                            <option value="">Select status</option>
                            <option value="to-pay">To Pay</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white p-5 ml-10 mr-10">
                <div className="mb-4 ml-5 mr-5">
                    <div className="text-sm text-gray-600">
                        Showing {getFilteredData().length} of {apiData.length} entries
                        {(filters.vendorName || filters.fromDate || filters.toDate || filters.paymentStatus) && (
                            <span className="ml-2 text-blue-600">(filtered)</span>
                        )}
                    </div>
                </div>
                <div className='border-l-8 border-l-[#BF9853] rounded-lg ml-5 mr-5'>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-[#FAF6ED]">
                                <tr>
                                    <th className="px-2 py-3 text-left text-sm font-semibold">SI.No</th>
                                    <th 
                                        className="px-2 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
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
                                    <th 
                                        className="px-2 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
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
                                    <th className="px-2 py-3 text-left text-sm font-semibold">No of Bills</th>
                                    <th className="px-2 py-3 text-left text-sm font-semibold">Total Amount</th>
                                    <th 
                                        className="px-2 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
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
                                    <th 
                                        className="px-2 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
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
                                    <th 
                                        className="px-2 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
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
                                    <th className="px-2 py-3 text-left text-sm font-semibold">Activity</th>
                                </tr>
                            </thead>
                            <tbody className="">
                                <tr className="odd:bg-white even:bg-[#FAF6ED]">
                                    <td className="px-2 py-3 text-left text-sm border-b border-gray-100">{serialNumber}</td>
                                    <td className="px-2 py-3 text-left text-sm border-b border-gray-100">
                                        <input
                                            type="date"
                                            value={formData.billArrivalDate}
                                            onChange={(e) => handleInputChange('billArrivalDate', e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="w-[112px] h-[32px] px-2 py-1 bg-[#ECE9E9] rounded text-xs focus:outline-none text-left"
                                        />
                                    </td>
                                    <td className="px-2 py-3 text-left text-sm border-b border-gray-100">
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
                                    <td className="px-2 py-3 text-left text-sm border-b border-gray-100">
                                        <input
                                            type="number"
                                            value={formData.noOfBills}
                                            onChange={(e) => handleInputChange('noOfBills', e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            onWheel={(e) => e.target.blur()}
                                            className="w-[56px] h-[32px] px-2 py-1 bg-[#ECE9E9] rounded text-xs focus:outline-none no-spinner text-left"
                                        />
                                    </td>
                                    <td className="px-2 py-3 text-left text-sm border-b border-gray-100">
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
                                            className="w-[104px] h-[32px] px-2 py-1 bg-[#ECE9E9] rounded text-xs focus:outline-none no-spinner text-left"
                                        />
                                    </td>
                                    <td className="px-10 py-3 text-left text-sm border-b border-gray-100">
                                        <span className="text-gray-400 text-xs">-</span>
                                    </td>
                                    <td className="px-10 py-3 text-left text-sm border-b border-gray-100">
                                        <span className="text-gray-400 text-xs">-</span>
                                    </td>
                                    <td className="px-10 py-3 text-left text-sm border-b border-gray-100">
                                        <span className="text-gray-400 text-xs">-</span>
                                    </td>
                                    <td className="px-10 py-3 text-left text-sm border-b border-gray-100">
                                        <span className="text-gray-400 text-xs">-</span>
                                    </td>
                                </tr>
                                {loading && (
                                    <tr>
                                        <td colSpan="9" className="px-2 py-8 text-center text-sm text-gray-500">
                                            Loading data...
                                        </td>
                                    </tr>
                                )}
                                {error && (
                                    <tr>
                                        <td colSpan="9" className="px-2 py-8 text-center text-sm text-red-500">
                                            Error loading data: {error}
                                        </td>
                                    </tr>
                                )}
                                {applySorting(getFilteredData().slice().reverse()).map((item, index) => (
                                    <tr key={`api-${item.id || index}`} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}`}>
                                        <td className="px-2 py-3 text-left text-sm border-b border-gray-100">{item.id || index + 1}</td>
                                        <td className="px-2 text-left py-3 text-sm border-b border-gray-100">
                                            {item.bill_arrival_date ? new Date(item.bill_arrival_date).toLocaleDateString('en-GB') : '-'}
                                        </td>
                                        <td className="px-2 py-3 text-left text-sm border-b border-gray-100">
                                            {getVendorNameById(item.vendor_id)}
                                        </td>
                                        <td className="px-2 py-3 text-left text-sm border-b border-gray-100">
                                            {item.no_of_bills || item.noOfBills || '-'}
                                        </td>
                                        <td className="px-2 py-3 text-center pr-10 text-sm border-b border-gray-100">
                                            {item.total_amount ? formatIndianCurrency(parseInt(item.total_amount)) : '-'}
                                        </td>
                                        <td className=" py-3 text-left text-sm font-semibold border-b border-gray-100">
                                            <div className="relative group">
                                                <button className={getButtonClass(getBillVerificationStatus(item))}
                                                    style={getBillVerificationStatus(item) === 'Verified' ? { backgroundColor: '#FFD39E' } : {}}
                                                    onClick={() => handleVerifyClick(item)}
                                                >
                                                    {getBillVerificationStatus(item)}
                                                </button>
                                                {getBillVerificationStatus(item) === 'Verified' && getVerifiedBillCount(item) > 0 && (
                                                    <div className="absolute bottom-full font-semibold left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                        {getVerifiedBillCount(item)} Bill{getVerifiedBillCount(item) !== 1 ? 's' : ''} is Verified
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className=" py-3 text-sm text-left border-b border-gray-100">
                                            <div className="relative group">
                                                <button
                                                    className={`${getButtonClass(item.entry_status || 'Entry', item.id)} ${!isAllBillsVerified(item) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => {
                                                        if ((item.entry_status || 'Entry') === 'Entry' && isAllBillsVerified(item)) {
                                                            handleEntryClick(item)
                                                        } else if (!isAllBillsVerified(item)) {
                                                            alert('Complete bill verification before entering details')
                                                        }
                                                    }}
                                                    disabled={!isAllBillsVerified(item)}
                                                >
                                                    {getEntryStatusText(item)}
                                                </button>
                                                {/* Hover Tooltip */}
                                                {expenseMatchDetails[item.id] && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                        <div className="text-center">
                                                            <div className="font-semibold">Expense Matching Details</div>
                                                            <div>Bills in Expenses: {expenseMatchDetails[item.id].matchingExpensesCount}</div>
                                                            <div>Expense Amount: {formatIndianCurrency(expenseMatchDetails[item.id].totalExpenseAmount)}</div>
                                                            <div>Bill Amount: {formatIndianCurrency(expenseMatchDetails[item.id].billAmount)}</div>
                                                            {expenseMatchDetails[item.id].adjustmentAmount > 0 && (
                                                                <div>Adjustment: -{formatIndianCurrency(expenseMatchDetails[item.id].adjustmentAmount)}</div>
                                                            )}
                                                            <div>Adjusted Bill Amount: {formatIndianCurrency(expenseMatchDetails[item.id].adjustedBillAmount)}</div>
                                                            <div>Difference: {formatIndianCurrency(expenseMatchDetails[item.id].difference)}</div>
                                                        </div>
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className=" py-3 text-left pr-4 text-sm border-b border-gray-100">
                                            <button
                                                className={`${getButtonClass(paymentStatuses[item.id] || 'To Pay')} ${!isEntryCompleted(item) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => {
                                                    if (isEntryCompleted(item)) {
                                                        handlePaymentClick(item)
                                                    } else {
                                                        alert('Complete entry before proceeding with payment')
                                                    }
                                                }}
                                                disabled={!isEntryCompleted(item)}
                                            >
                                                {paymentStatuses[item.id] || 'To Pay'}
                                            </button>
                                        </td>
                                        <td className="px-2 py-3 text-left text-sm border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="px-2 py-1.5 transition-colors duration-200 flex items-center justify-start hover:bg-gray-100 rounded"
                                                    onClick={() => handleEditClick(item)}
                                                >
                                                    <img src={edit} alt="edit" className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {billData.slice().reverse().map((bill, index) => (
                                    <tr key={`local-${bill.id}`} className={`${(getFilteredData().length + index) % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}`}>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">{bill.id}</td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">{bill.billArrivalDate}</td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">{bill.vendorName}</td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">{bill.noOfBills}</td>
                                        <td className="px-2 py-3 text-sm border-b border-gray-100">{bill.totalAmount}</td>
                                        <td className=" py-3 text-sm border-b border-gray-100">
                                            <button className={getButtonClass(bill.billVerification)} onClick={() => bill.billVerification === 'Verify' && handleVerifyClick(bill)}>
                                                {bill.billVerification}
                                            </button>
                                        </td>
                                        <td className=" py-3 text-sm border-b border-gray-100">
                                            <div className="relative group">
                                                <button
                                                    className={`${getButtonClass(bill.entryStatus, bill.id)} ${!isAllBillsVerified(bill) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => {
                                                        if (bill.entryStatus === 'Entry' && isAllBillsVerified(bill)) {
                                                            handleEntryClick(bill)
                                                        } else if (!isAllBillsVerified(bill)) {
                                                            alert('Complete bill verification before entering details')
                                                        }
                                                    }}
                                                    disabled={!isAllBillsVerified(bill)}
                                                >
                                                    {getEntryStatusText(bill)}
                                                </button>
                                                {/* Hover Tooltip */}
                                                {expenseMatchDetails[bill.id] && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                        <div className="text-center">
                                                            <div className="font-semibold">Expense Matching Details</div>
                                                            <div>Bills in Expenses: {expenseMatchDetails[bill.id].matchingExpensesCount}</div>
                                                            <div>Expense Amount: {formatIndianCurrency(expenseMatchDetails[bill.id].totalExpenseAmount)}</div>
                                                            <div>Bill Amount: {formatIndianCurrency(expenseMatchDetails[bill.id].billAmount)}</div>
                                                            {expenseMatchDetails[bill.id].difference > 0 && (
                                                                <div>Difference: {formatIndianCurrency(expenseMatchDetails[bill.id].difference)}</div>
                                                            )}
                                                        </div>
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className=" py-3 text-left text-sm border-b border-gray-100">
                                            <button 
                                                className={`${getButtonClass(bill.paymentStatus)} ${!isEntryCompleted(bill) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => {
                                                    if (isEntryCompleted(bill) && bill.paymentStatus === 'To Pay') {
                                                        handlePaymentClick(bill)
                                                    } else if (!isEntryCompleted(bill)) {
                                                        alert('Complete entry before proceeding with payment')
                                                    }
                                                }}
                                                disabled={!isEntryCompleted(bill)}
                                            >
                                                {bill.paymentStatus}
                                            </button>
                                        </td>
                                        <td className="px-2 py-3 text-left text-sm border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="px-2 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-start"
                                                    
                                                >
                                                    <img src={edit} alt="edit" className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="px-2 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors duration-200 flex items-center justify-start"
                                                    
                                                >
                                                    <img src={deletes} alt="delete" className="w-4 h-4" />
                                                </button>
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
                        <div className="p-6 flex-1 overflow-hidden">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 h-full">
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
                                                onClick={handleCheckPO}
                                                disabled={checkingPO}
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
                                            onClick={handleSubmit}
                                            disabled={isSubmitDisabled()}
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
                                                                <button
                                                                    onClick={() => handlePreviousEntrySave(entry.id)}
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
                        <div className="flex gap-4 items-center p-6 ">
                            <div className="flex gap-3">
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
                                            <button
                                                className="text-green-600 font-bold text-lg mr-3"
                                                onClick={handleAdjustmentAmountUpdate}
                                                disabled={!numberInputValue && !selectedEntryBill?.adjustment_amount && !selectedEntryBill?.adjustmentAmount}
                                            >
                                                ✓
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
                                <h3 className="text-lg font-semibold text-center flex-1">Entry Payment Details</h3>
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
                                                {paymentEntries.map((entry, index) => (
                                                    <div key={entry.id} className="text-left p-4 shadow-lg rounded-lg">
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
                                                                    value={entry.amount}
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
                                                ))}
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
                                        <div className="p-w overflow-auto h-[300px] mb-8">
                                            <h4 className="text-sm font-semibold text-gray-700">Previous Payment Details:</h4>
                                            <div className="space-y-4">
                                                {existingPaymentDetails.map((payment, index) => (
                                                    <div key={payment.id || index} className="text-left p-4 shadow-lg rounded-lg mb-4">
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
                                                                        value={payment.amount?.toLocaleString() || ''}
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
                                                        </div>
                                                    </div>
                                                ))}
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
                                        <div className="text-left">
                                            <h4 className="text-lg font-semibold mb-2">Summary</h4>
                                            <div className="space-y-3 shadow-lg rounded-lg p-4">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Total Payable:</span>
                                                    <span className="font-semibold">{formatIndianCurrency(actualAmount)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Received Amount:</span>
                                                    <span className="font-semibold">{formatIndianCurrency(actualAmount - remainingAmount)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Carry Forward:</span>
                                                    <span className="font-semibold">0</span>
                                                </div>
                                                <hr className="border-gray-300" />
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Total Amount:</span>
                                                    <span className="font-semibold">{formatIndianCurrency(remainingAmount)}</span>
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
                                                    <span className={`font-bold ${(remainingAmount - discount) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatIndianCurrency(Math.max(0, remainingAmount - discount))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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
                                            <button className='text-[#E4572E] text-sm flex items-center gap-1'>
                                                Attach file
                                            </button>
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
            
            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
                        <div className="px-6 py-4 border-b border-[#BF9853] border-opacity-20">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-[#BF9853]">Edit Tracker Details</h3>
                                <button
                                    onClick={handleEditCancel}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FAF6ED] transition-colors duration-200 text-[#BF9853] text-xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        
                        <div className="px-6 py-4 text-left">
                            <div className="space-y-4">
                                {/* Bill Arrival Date */}
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

                                {/* Vendor Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Vendor *
                                    </label>
                                    <Select
                                        value={editFormData.vendorId}
                                        onChange={(selectedOption) => handleEditInputChange('vendorId', selectedOption)}
                                        options={vendorOptions}
                                        placeholder="Select Vendor"
                                        className="basic-single text-left"
                                        classNamePrefix="select"
                                        isClearable
                                        isSearchable
                                        required
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
                                            })
                                        }}
                                    />
                                </div>

                                {/* Number of Bills */}
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

                                {/* Total Amount */}
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
                            <button
                                onClick={handleEditCancel}
                                className="px-6 py-2 text-sm font-medium text-[#BF9853] bg-white border border-[#BF9853] rounded-lg hover:bg-[#FAF6ED] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:ring-opacity-30"
                                disabled={editLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                disabled={editLoading}
                                className="px-6 py-2 text-sm font-medium text-white bg-[#BF9853] border border-[#BF9853] rounded-lg hover:bg-[#a8884a] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:ring-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editLoading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default PendingBill