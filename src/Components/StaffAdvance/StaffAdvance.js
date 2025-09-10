import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Select from 'react-select';
import Attach from '../Images/Attachfile.svg';
const StaffAdvance = () => {
  // Form state management
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    amountGiven: '',
    paymentMode: '',
    selectedType: '',
    date: '',
    empName: null,
    overallAdvance: '',
    purpose: null,
    advanceAmount: '',
    amountGivenInput: '',
    transferAmount: '',
    description: ''
  });
  const [staffFromDate, setStaffFromDate] = useState('');
  const [staffToDate, setStaffToDate] = useState('');
  const [staffPaymentMode, setStaffPaymentMode] = useState('');
  const [staffAmountGiven, setStaffAdmountGiven] = useState('');
  const [staffTodayAmount, setTodayAmount] = useState('');
  const [staffTotalOutstanding, setStaffTotalOutstanding] = useState('');
  // Table data state
  const [tableData, setTableData] = useState([]);
  // Filtered table data state - only shows when both EMP Name and Purpose are selected
  const [filteredTableData, setFilteredTableData] = useState([]);
  // Success message state
  const [successMessage, setSuccessMessage] = useState('');
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Employee options state
  const [employeeOptions, setEmployeeOptions] = useState([]);
  // Fetch employee details on component mount
  useEffect(() => {
    // Fetch employee details
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
    // Call employee fetch function
    fetchEmployeeDetails();
  }, []);
  const [purposeOptions, setPurposeOptions] = useState([]);
  // Fetch purpose options from backend on component mount
  useEffect(() => {
    const fetchPurposeOptions = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/purposes/getAll", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          console.warn("Purposes API not available, using empty data");
          setPurposeOptions([]);
          return;
        }
        const data = await response.json();
        // Format for react-select
        const formatted = data.map(item => ({
          value: item.purpose,
          label: item.purpose,
          id: item.id
        }));
        setPurposeOptions(formatted);
      } catch (error) {
        console.warn("Purpose fetch error:", error);
        setPurposeOptions([]);
      }
    };
    fetchPurposeOptions();
  }, []);
  // Memoized custom styles to prevent recreation on every render
  const customStyles = useMemo(() => ({
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
  }), []);
  // Memoized field configuration to prevent recalculation on every render
  const fieldConfig = useMemo(() => {
    switch (formData.selectedType) {
      case 'Refund':
        return {
          purposeLabel: 'Purpose',
          amountGivenLabel: 'Amount',
          paymentModeLabel: 'Payment Mode',
          showTransferAmount: false
        };
      case 'Transfer':
        return {
          purposeLabel: 'Purpose From',
          amountGivenLabel: 'Purpose To',
          paymentModeLabel: 'Transfer Amount',
          showTransferAmount: true
        };
      default:
        return {
          purposeLabel: 'Purpose',
          amountGivenLabel: 'Amount Given',
          paymentModeLabel: 'Payment Mode',
          showTransferAmount: false
        };
    }
  }, [formData.selectedType]);
  // Memoized payment mode options
  const paymentModeOptions = useMemo(() => [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' }
  ], []);
  // Memoized select type options
  const selectTypeOptions = useMemo(() => [
    { value: 'Advance', label: 'Advance' },
    { value: 'Refund', label: 'Refund' },
    { value: 'Transfer', label: 'Transfer' }
  ], []);
  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  // Fetch all records and update table data state
  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch('https://backendaab.in/aabuildersDash/api/staff-advance/all');
      if (!res.ok) {
        console.warn('Staff advance API not available, using empty data');
        setTableData([]);
        return;
      }
      const data = await res.json();
      setTableData(data);
    } catch (err) {
      console.warn('Error fetching records:', err);
      setTableData([]);
    }
  }, []);

  // Filter table data based on selected employee and purpose
  const filterTableData = useCallback(() => {
    if (!formData.empName || !formData.purpose) {
      // If either EMP Name or Purpose is not selected, show empty table
      setFilteredTableData([]);
      return;
    }

    // Filter data based on selected employee and purpose
    const filtered = tableData.filter(record => {
      // Check for employee match - try different possible field names
      const matchesEmployee = record.employee_name === formData.empName.value ||
        record.employee_id === formData.empName.id ||
        record.emp_name === formData.empName.value;

      // Check for purpose match - try different possible field names
      const matchesPurpose = record.purpose === formData.purpose.value ||
        record.purpose_id === formData.purpose.id ||
        record.from_purpose_id === formData.purpose.id;

      return matchesEmployee && matchesPurpose;
    });

    setFilteredTableData(filtered);
  }, [tableData, formData.empName, formData.purpose]);
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Filter table data whenever tableData, empName, or purpose changes
  useEffect(() => {
    filterTableData();
  }, [filterTableData]);

  // Calculate total advance amount for selected employee
  const calculateTotalAdvance = useCallback(() => {
    if (!formData.empName || !tableData.length) {
      return 0;
    }

    const employeeRecords = tableData.filter(record => {
      // Check for employee match - try different possible field names
      return record.employee_name === formData.empName.value ||
        record.employee_id === formData.empName.id ||
        record.emp_name === formData.empName.value;
    });

    const totalAdvance = employeeRecords.reduce((total, record) => {
      if (record.type === 'Advance') {
        return total + (parseFloat(record.amount) || 0);
      } else if (record.type === 'Refund') {
        return total - (parseFloat(record.staff_refund_amount) || 0);
      }
      return total;
    }, 0);

    return totalAdvance;
  }, [formData.empName, tableData]);

  // Update overall advance when employee selection changes
  useEffect(() => {
    const totalAdvance = calculateTotalAdvance();
    setFormData(prev => ({
      ...prev,
      overallAdvance: totalAdvance.toFixed(2)
    }));
  }, [calculateTotalAdvance]);

  // Calculate total amount for selected purpose and employee
  const calculatePurposeTotal = useCallback(() => {
    if (!formData.purpose || !formData.empName || !tableData.length) {
      return 0;
    }
    const purposeId = formData.purpose.id;
    const employeeId = formData.empName.id;
    const purposeRecords = tableData.filter(record => {
      // Check for employee match first
      const employeeMatch = record.employee_name === formData.empName.value ||
        record.employee_id === employeeId ||
        record.emp_name === formData.empName.value;
      if (!employeeMatch) return false;
      // Check if purpose matches (only from_purpose_id for all record types)
      return record.purpose === formData.purpose.value ||
        record.purpose_id === purposeId ||
        record.from_purpose_id === purposeId;
    });
    const totalAmount = purposeRecords.reduce((total, record) => {
      const amount = parseFloat(record.amount) || 0;
      const refund = parseFloat(record.staff_refund_amount) || 0;
      if (record.type === "Advance") {
        return total + amount;
      } else if (record.type === "Refund") {
        return total - refund;
      } else if (record.type === "Transfer") {
        // For transfer records, the amount field already contains the correct sign
        // Negative amount means money going out from this purpose
        return total + amount; // amount is already negative, so this subtracts
      }
      return total;
    }, 0);
    return totalAmount;
  }, [formData.purpose, formData.empName, tableData]);
  // Update advance amount when purpose or employee selection changes
  useEffect(() => {
    const purposeTotal = calculatePurposeTotal();
    setFormData(prev => ({
      ...prev,
      advanceAmount: purposeTotal.toFixed(2)
    }));
  }, [calculatePurposeTotal]);
  // Calculate total amount given to all employees based on date range and payment mode
  const calculateTotalAmountGiven = useCallback(() => {
    if (!tableData.length) {
      return 0;
    }
    // Only calculate if both dates are selected (main filter)
    if (!staffFromDate || !staffToDate) {
      return 0;
    }
    let filteredRecords = tableData;
    // Filter by date range (both dates are required - main filter)
    filteredRecords = filteredRecords.filter(record => {
      const recordDate = new Date(record.date);
      const fromDate = new Date(staffFromDate);
      const toDate = new Date(staffToDate);
      return recordDate >= fromDate && recordDate <= toDate;
    });
    // Filter by payment mode (additional filter - optional)
    if (staffPaymentMode) {
      filteredRecords = filteredRecords.filter(record => 
        record.staff_payment_mode === staffPaymentMode
      );
    }
    // Calculate net amount given (Advance amount minus Refund amount)
    const totalAmount = filteredRecords.reduce((total, record) => {
      if (record.type === 'Advance') {
        return total + (parseFloat(record.amount) || 0);
      } else if (record.type === 'Refund') {
        return total - (parseFloat(record.staff_refund_amount) || 0);
      }
      return total;
    }, 0);
    return totalAmount;
  }, [tableData, staffFromDate, staffToDate, staffPaymentMode]);
  // Update amount given when filters change
  useEffect(() => {
    const totalAmount = calculateTotalAmountGiven();
    // Show "0.00" if both dates are not selected, otherwise show the calculated amount
    if (!staffFromDate || !staffToDate) {
      setStaffAdmountGiven("0.00");
    } else {
      setStaffAdmountGiven(totalAmount.toLocaleString('en-IN', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }));
    }
  }, [calculateTotalAmountGiven, staffFromDate, staffToDate, staffPaymentMode]);
  // Calculate today's amount for all employees (without any filters)
  const calculateTodayAmount = useCallback(() => {
    if (!tableData.length) {
      return 0;
    }
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const todayRecords = tableData.filter(record => {
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      return recordDate === todayString;
    });
    const todayAmount = todayRecords.reduce((total, record) => {
      if (record.type === 'Advance') {
        return total + (parseFloat(record.amount) || 0);
      } else if (record.type === 'Refund') {
        return total - (parseFloat(record.staff_refund_amount) || 0);
      }
      return total;
    }, 0);
    return todayAmount;
  }, [tableData]);
  // Calculate total outstanding amount for all employees (without any filters)
  const calculateTotalOutstanding = useCallback(() => {
    if (!tableData.length) {
      return 0;
    }
    const totalOutstanding = tableData.reduce((total, record) => {
      if (record.type === 'Advance') {
        return total + (parseFloat(record.amount) || 0);
      } else if (record.type === 'Refund') {
        return total - (parseFloat(record.staff_refund_amount) || 0);
      }
      return total;
    }, 0);

    return totalOutstanding;
  }, [tableData]);

  // Update today amount when table data changes
  useEffect(() => {
    const todayAmount = calculateTodayAmount();
    setTodayAmount(todayAmount.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }));
  }, [calculateTodayAmount]);

  // Update total outstanding when table data changes
  useEffect(() => {
    const totalOutstanding = calculateTotalOutstanding();
    setStaffTotalOutstanding(totalOutstanding.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }));
  }, [calculateTotalOutstanding]);
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.selectedType || !formData.date || !formData.empName) {
      alert('Please fill in Type, Date, and Employee Name');
      return;
    }
    if ((formData.selectedType === 'Advance' || formData.selectedType === 'Refund') &&
      (!formData.amountGivenInput || (formData.selectedType === 'Advance' && !formData.paymentMode))) {
      alert('Please fill the amount and payment mode');
      return;
    }
    if (formData.selectedType === 'Transfer' &&
      (!formData.purpose || !formData.transferPurpose || !formData.transferAmount)) {
      alert('Please fill all transfer details');
      return;
    }
    setIsSubmitting(true);
    try {
      const resAll = await fetch('https://backendaab.in/aabuildersDash/api/staff-advance/all');
      let allData = [];
      if (resAll.ok) {
        allData = await resAll.json();
      } else {
        console.warn('Staff advance API not available for entry number generation');
      }
      const maxEntryNo = allData.length > 0 ? Math.max(...allData.map(item => item.entryNo || 0)) : 0;
      const nextEntryNo = maxEntryNo + 1;
      const payload = {
        type: formData.selectedType,
        date: formData.date,
        employee_id: formData.empName.id,
        staff_payment_mode: formData.paymentMode,
        staff_refund_amount: formData.selectedType === 'Refund' ? parseFloat(formData.amountGivenInput) || 0 : 0,
        description: formData.description,
        file_url: formData.fileUrl || null,
        entryNo: nextEntryNo,
        weekNo: 0
      };
      if (formData.selectedType === 'Transfer') {
        payload.from_purpose_id = formData.purpose.id;
        payload.to_purpose_id = formData.transferPurpose.id;
        payload.amount = parseFloat(formData.transferAmount) || 0;
      } else {
        payload.from_purpose_id = formData.purpose?.id || null;
        payload.to_purpose_id = null;
        payload.amount = formData.selectedType === 'Advance' ? parseFloat(formData.amountGivenInput) || 0 : 0;
      }
      const saveRes = await fetch('https://backendaab.in/aabuildersDash/api/staff-advance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!saveRes.ok) {
        console.warn('Save API not available, simulating success');
        setSuccessMessage('Record would be saved (API not available)');
        resetForm();
        return;
      }
      setSuccessMessage('Record saved successfully!');
      resetForm();
      await fetchRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error saving data');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);
  // Handle keyboard enter key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);
  // Check if field is required
  const isRequired = useCallback((field) => {
    const requiredFields = ['selectedType', 'date', 'empName'];
    return requiredFields.includes(field);
  }, []);
  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      fromDate: '',
      toDate: '',
      amountGiven: '',
      paymentMode: '',
      selectedType: '',
      date: '',
      empName: null,
      overallAdvance: '',
      purpose: null,
      advanceAmount: '',
      amountGivenInput: '',
      transferAmount: '',
      description: ''
    });
  }, []);
  // Delete table row
  const deleteRow = useCallback((id) => {
    setTableData(prev => prev.filter(record => record.id !== id));
    // The filtered data will be updated automatically via useEffect
  }, []);
  // Clear all table data
  const clearTable = useCallback(() => {
    if (filteredTableData.length > 0) {
      // Remove only the filtered records from the main table data
      const filteredIds = filteredTableData.map(record => record.id);
      setTableData(prev => prev.filter(record => !filteredIds.includes(record.id)));
      setSuccessMessage('Filtered records cleared!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, [filteredTableData.length, filteredTableData]);
  // Export functions
  const exportToPDF = useCallback(() => {
    console.log('Exporting to PDF...');
    // Add PDF export logic
  }, []);
  const exportToExcel = useCallback(() => {
    console.log('Exporting to Excel...');
    // Add Excel export logic
  }, []);
  const printData = useCallback(() => {
    console.log('Printing...');
    // Add print logic
  }, []);
  return (
    <div className=" bg-[#FAF6ED]">
      <div className='bg-white max-w-[1768px] h-auto text-left shadow-sm rounded ml-10 mr-5'>
        <div className='flex flex-wrap p-6 gap-4 w-full h-full items-start'>
          <div className='flex-shrink-0'>
            <h2 className='font-semibold text-sm mb-1'>From Date</h2>
            <input
              type='date'
              value={staffFromDate}
              onChange={(e) => setStaffFromDate(e.target.value)}
              className='border-2 border-[#BF9853] border-opacity-30 rounded-lg pl-3 w-[168px] h-[45px] focus:outline-none focus:border-[#BF9853] transition-colors'
            />
          </div>
          <div className='flex-shrink-0'>
            <h2 className='font-semibold text-sm mb-1'>To Date</h2>
            <input
              type='date'
              value={staffToDate}
              onChange={(e) => setStaffToDate(e.target.value)}
              className='border-2 border-[#BF9853] border-opacity-30 rounded-lg pl-3 w-[168px] h-[45px] focus:outline-none focus:border-[#BF9853] transition-colors'
            />
          </div>
          <div className='flex-shrink-0'>
            <h2 className='font-semibold text-sm mb-1'>Amount Given</h2>
            <input
              value={staffAmountGiven}
              readOnly
              className='bg-[#F2F2F2] rounded-lg p-2 w-[107px] h-[45px] focus:outline-none focus:bg-white focus:border-2 focus:border-[#BF9853] transition-all'
              placeholder="0.00"
            />
          </div>
          <div className='flex-shrink-0 pt-6'>
            <select
              value={staffPaymentMode}
              onChange={(e) => setStaffPaymentMode(e.target.value)}
              className='w-[133px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none focus:border-[#BF9853] transition-colors'
            >
              <option value=''>Select</option>
              {paymentModeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className='flex-shrink-0'>
            <h2 className='font-semibold text-sm mb-1'>Today Amount</h2>
            <input
              readOnly
              type='text'
              value={staffTodayAmount}
              className='bg-[#F2F2F2] rounded-lg p-2 w-[144px] h-[45px] focus:outline-none'
              placeholder="0.00"
            />
          </div>
          <div className='flex-shrink-0'>
            <h2 className='font-semibold text-sm mb-1'>Total Outstanding</h2>
            <input
              readOnly
              type='text'
              value={staffTotalOutstanding}
              className='bg-[#F2F2F2] p-2 rounded-lg w-[144px] h-[45px] focus:outline-none'
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
      <div className='p-4 max-w-[1800px] ml-6'>
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-sm">
            {successMessage}
          </div>
        )}
        {/* Form */}
        <form onSubmit={handleSubmit} onKeyPress={handleKeyPress} className='bg-white w-full p-6 h-auto rounded shadow-sm'>
          <div className='flex flex-col xl:flex-row '>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-left '>
              {/* Select Type */}
              <div className='space-y-2'>
                <label className='font-semibold text-[#E4572E] block'>
                  Select Type {isRequired('selectedType') && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={formData.selectedType}
                  onChange={(e) => handleInputChange('selectedType', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className='w-[163px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none focus:border-[#BF9853] transition-colors'
                >
                  <option value=''>Select Type...</option>
                  {selectTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Date */}
              <div className='space-y-2'>
                <label className='font-semibold text-[#E4572E] block'>
                  Date {isRequired('date') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type='date'
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='dd-mm-yyyy'
                  className='w-[144px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none focus:border-[#BF9853] transition-colors'
                />
              </div>
              {/* EMP Name */}
              <div className='space-y-2'>
                <label className='font-semibold block'>
                  EMP Name {isRequired('empName') && <span className="text-red-500">*</span>}
                </label>
                <Select
                  value={formData.empName}
                  onChange={(value) => handleInputChange('empName', value)}
                  options={employeeOptions}
                  className='w-[263px] h-[45px] rounded-lg focus:outline-none'
                  isClearable
                  styles={customStyles}
                  placeholder="Select employee..."
                  isSearchable={true}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              <div className='space-y-2'>
                <label className='font-semibold block'>Overall Advance</label>
                <input
                  value={formData.overallAdvance}
                  readOnly
                  className='w-[263px] h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none cursor-not-allowed'
                  placeholder="0.00"
                />
              </div>
              {/* Purpose */}
              <div className='space-y-2'>
                <label className='font-semibold block'>{fieldConfig.purposeLabel}</label>
                <Select
                  value={formData.purpose}
                  onChange={(value) => handleInputChange('purpose', value)}
                  options={purposeOptions}
                  placeholder="Select a purpose..."
                  isSearchable={true}
                  styles={customStyles}
                  isClearable
                  className='w-[263px] h-[45px] focus:outline-none'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              {/* Advance Amount */}
              <div className='space-y-2'>
                <label className='font-semibold block'>
                  Advance Amount {isRequired('advanceAmount') && <span className="text-red-500">*</span>}
                </label>
                <input
                  value={formData.advanceAmount}
                  readOnly
                  className='w-[263px] h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none cursor-not-allowed'
                  placeholder="0.00"
                />
              </div>
              {/* Amount Given / Purpose To */}
              <div className='space-y-2'>
                <label className='font-semibold block'>{fieldConfig.amountGivenLabel}</label>
                {formData.selectedType === 'Transfer' ? (
                  <Select
                    value={formData.transferPurpose}
                    onChange={(value) => handleInputChange('transferPurpose', value)}
                    options={purposeOptions}
                    placeholder="Select purpose to..."
                    styles={customStyles}
                    className='w-[263px] h-[45px] rounded-lg focus:outline-none'
                    isClearable
                  />
                ) : (
                  <input
                    value={formData.amountGivenInput}
                    onChange={(e) => handleInputChange('amountGivenInput', e.target.value)}
                    onKeyPress={handleKeyPress}
                    className='w-[263px] h-[45px] px-2 py-1 rounded-lg border-2 border-[#BF9853] border-opacity-30 focus:outline-none focus:border-[#BF9853] transition-colors'
                    placeholder={`Enter ${fieldConfig.amountGivenLabel.toLowerCase()}`}
                  />
                )}
              </div>
              {/* Conditional Payment Mode/Transfer Amount */}
              <div className='space-y-2'>
                <label className='font-semibold block'>{fieldConfig.paymentModeLabel}</label>
                {formData.selectedType === 'Transfer' ? (
                  <input
                    value={formData.transferAmount}
                    onChange={(e) => handleInputChange('transferAmount', e.target.value)}
                    onKeyPress={handleKeyPress}
                    className='w-[263px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none focus:border-[#BF9853] transition-colors'
                    placeholder="Enter transfer amount"
                  />
                ) : (
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => handleInputChange('paymentMode', e.target.value)}
                    className='w-[263px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none focus:border-[#BF9853] transition-colors'
                  >
                    <option value=''>Select</option>
                    {paymentModeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {/* Description */}
              <div className='col-span-1 md:col-span-2 space-y-2'>
                <label className='font-semibold block'>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className='w-full border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none focus:border-[#BF9853] transition-colors resize-none'
                  placeholder="Enter description..."
                  rows={3}
                />
              </div>
              {/* File Attachment and Submit */}
              <div className='col-span-1 md:col-span-2 space-y-4'>
                <div className="flex items-center">
                  <label htmlFor="fileInput" className="cursor-pointer flex items-center text-orange-600 hover:text-orange-700 transition-colors">
                    <img className='w-5 h-4 mr-2' alt='' src={Attach} />
                    Attach file
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    onChange={(e) => console.log('File selected:', e.target.files[0])}
                  />
                </div>
                <div className='flex gap-3'>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-lg flex items-center justify-center transition-all duration-200 ${isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#c7934c] text-white hover:bg-[#b08542] hover:shadow-md'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Pay Advance'
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className='flex flex-col xl:ml-8 min-w-0 flex-1'>
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4  p-2  rounded-lg'>
                <div className="flex items-center gap- text-sm text-gray-600">
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    className='border-2 w-[112px] p-2 border-[#E4572E] text-[#E4572E] font-bold border-opacity-10 rounded h-[33px] bg-transparent focus:outline-none focus:border-[#E4572E] transition-colors'
                    placeholder=""
                    readOnly
                    value={formData.advanceAmount}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={exportToPDF}
                      className='text-[#E4572E] font-semibold hover:underline cursor-pointer transition-colors'
                    >
                      Export PDF
                    </button>
                    <button
                      type="button"
                      onClick={exportToExcel}
                      className='text-[#007233] font-semibold hover:underline cursor-pointer transition-colors'
                    >
                      Export XL
                    </button>
                    <button
                      type="button"
                      onClick={printData}
                      className='text-[#BF9853] font-semibold hover:underline cursor-pointer transition-colors'
                    >
                      Print
                    </button>
                  </div>
                </div>
              </div>
              <div className='border-l-8 border-l-[#BF9853] rounded-lg h-[500px] overflow-auto shadow-sm bg-white'>
                <table className="w-full min-w-[800px]">
                  <thead className="bg-[#FAF6ED] text-left sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Advance</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Transfer/Refund</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Mode</th>
                      <th className=" py-3 font-semibold text-gray-700">Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTableData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <span>No data available</span>
                            <span className="text-sm">
                              {!formData.empName || !formData.purpose
                                ? "Select both EMP Name and Purpose to view related data"
                                : "No records found for the selected employee and purpose"
                              }
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTableData.map((record) => (
                        <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">{record.date}</td>
                          <td
                            className="px-4 py-3 font-medium"
                            style={{ color: record.type === "Refund" ? '#dc2626' : '#059669' }}
                          >
                            {record.type === "Refund"
                              ? -Math.abs(record.staff_refund_amount || 0)
                              : record.amount}
                          </td>
                          <td className="px-4 py-3">
                            {record.type === "Refund" ? "Refund" : record.staff_refund_amount}
                          </td>
                          <td className="px-4 py-3">{record.staff_payment_mode}</td>
                          <td className=" py-3">{record.activity}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default StaffAdvance;