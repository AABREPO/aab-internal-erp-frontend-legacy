import React, { useState, useEffect } from 'react'
import Select from 'react-select';
import axios from "axios";
import edit from '../Images/Edit.svg';
import deletes from '../Images/Delete.svg';

const BillDatabase = ({ username, userRoles = [] }) => {
    const [apiData, setApiData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [vendorOptions, setVendorOptions] = useState([])
    const [contractorOptions, setContractorOptions] = useState([])
    const [combinedOptions, setCombinedOptions] = useState([])
    const [expenseMatchStatus, setExpenseMatchStatus] = useState({})
    const [paymentStatuses, setPaymentStatuses] = useState({})
    const [allBillEntries, setAllBillEntries] = useState([])
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    })
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
    const getButtonClass = (status, billId = null) => {
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
        const vendor = combinedOptions.find(option => option.id === vendorId)
        return vendor ? vendor.label : `Vendor ID: ${vendorId}`
    }
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
    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }))
    }
    const loadPaymentStatuses = async () => {
        const statuses = {};
        for (const item of apiData) {
            const status = await getPaymentStatus(item);
            statuses[item.id] = status;
        }
        setPaymentStatuses(statuses);
    };
    const getFullyFinishedBills = () => {
        if (apiData.length === 0) return [];        
        return apiData.filter(item => {
            const verificationStatus = getBillVerificationStatus(item);
            const entryStatus = getEntryStatusText(item);
            const paymentStatus = paymentStatuses[item.id] || 'To Pay';
            return verificationStatus === '✓ Verified' && 
                   (entryStatus === '✓ Entered' || entryStatus === 'Entered') && 
                   paymentStatus === '✓ Paid';
        });
    };
    useEffect(() => {
        fetchVendorNames();
        fetchContractorNames();
        fetchTrackerData();
        fetchAllBillEntries();
    }, []);
    useEffect(() => {
        setCombinedOptions([...vendorOptions, ...contractorOptions]);
    }, [vendorOptions, contractorOptions]);
    useEffect(() => {
        if (apiData.length > 0) {
            loadPaymentStatuses();
        }
    }, [apiData]);
    useEffect(() => {
        if (Object.keys(paymentStatuses).length > 0) {
            console.log('Payment statuses loaded:', paymentStatuses);
        }
    }, [paymentStatuses]);
    const fullyFinishedBills = getFullyFinishedBills();
    const sortedData = applySorting(fullyFinishedBills);
  return (
        <div className="bg-white p-5 ml-10 mr-10">
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
                            {sortedData.length === 0 && !loading && !error && (
                                <tr>
                                    <td colSpan="9" className="px-2 py-8 text-center text-sm text-gray-500">
                                        No completed bills found. 
                                        {Object.keys(paymentStatuses).length === 0 && " (Payment statuses still loading...)"}
                                    </td>
                                </tr>
                            )}
                            {sortedData.map((item, index) => (
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
                                    <td className="px-2 py-3 text-left text-sm border-b border-gray-100">
                                        {item.total_amount ? `₹${parseInt(item.total_amount).toLocaleString()}` : '-'}
                                    </td>
                                    <td className=" py-3 text-left text-sm font-semibold border-b border-gray-100">
                                        <div className="relative group">
                                            <button className={getButtonClass(getBillVerificationStatus(item))}
                                                style={getBillVerificationStatus(item) === 'Verified' ? { backgroundColor: '#FFD39E' } : {}}
                                            >
                                                {getBillVerificationStatus(item)}
                                            </button>
                                        </div>
                                    </td>
                                    <td className=" py-3 text-sm text-left border-b border-gray-100">
                                        <div className="relative group">
                                            <button
                                                className={`${getButtonClass(item.entry_status || 'Entry', item.id)}`}
                                            >
                                                {getEntryStatusText(item)}
                                            </button>
                                        </div>
                                    </td>
                                    <td className=" py-3 text-left pr-4 text-sm border-b border-gray-100">
                                        <button
                                            className={`${getButtonClass(paymentStatuses[item.id] || 'To Pay')}`}
                                        >
                                            {paymentStatuses[item.id] || 'To Pay'}
                                        </button>
                                    </td>
                                    <td className="px-2 py-3 text-left text-sm border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="px-2 py-1.5 transition-colors duration-200 flex items-center justify-start hover:bg-gray-100 rounded"
                                            >
                                                <img src={edit} alt="edit" className="w-4 h-4" />
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
  )
}
export default BillDatabase