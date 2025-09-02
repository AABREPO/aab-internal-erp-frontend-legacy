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

  // Table data state
  const [tableData, setTableData] = useState([]);

  // Success message state
  const [successMessage, setSuccessMessage] = useState('');

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Employee options state
  const [employeeOptions, setEmployeeOptions] = useState([]);

  // Fetch employee details on component mount
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

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.selectedType || !formData.date || !formData.empName || !formData.advanceAmount) {
      alert('Please fill in all required fields (Type, Date, Employee Name, Advance Amount)');
      return;
    }

    // Set loading state
    setIsSubmitting(true);

    // Simulate processing time (you can remove this in production)
    setTimeout(() => {
      // Create new table record
      const newRecord = {
        id: Date.now(), // Unique ID for the record
        date: formData.date,
        advance: formData.advanceAmount,
        bill: formData.amountGivenInput || '-',
        transferRefund: formData.selectedType === 'Transfer' ? formData.transferAmount : 
                       formData.selectedType === 'Refund' ? formData.amountGivenInput : '-',
        mode: formData.selectedType === 'Transfer' ? 'Transfer' : formData.paymentMode || '-',
        activity: formData.description || '-',
        employeeName: formData.empName?.value || '-',
        purpose: formData.purpose?.value || '-',
        type: formData.selectedType
      };

      // Add to table data
      setTableData(prev => [newRecord, ...prev]);

      // Show success message
      setSuccessMessage('Record added successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset form after successful submission
      resetForm();
      
      // Reset loading state
      setIsSubmitting(false);
      
      console.log('Form submitted:', formData);
      console.log('New record added:', newRecord);
    }, 500);
  }, [formData]);

  // Handle keyboard enter key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  }, []);

  // Check if field is required
  const isRequired = useCallback((field) => {
    const requiredFields = ['selectedType', 'date', 'empName', 'advanceAmount'];
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
  }, []);

  // Clear all table data
  const clearTable = useCallback(() => {
    if (tableData.length > 0) {
      setTableData([]);
      setSuccessMessage('All records cleared!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, [tableData.length]);

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
    <div className="min-h-screen bg-[#FAF6ED]">
      <div className='bg-white w-full max-w-[1750px] h-[150px] pl-2 ml-10 text-left shadow-sm'>
        <div className='flex p-7 gap-5 h-full'>
          <div className=''>
            <h2 className='font-semibold'>From Date</h2>
            <input
              type='date'
              value={formData.fromDate}
              onChange={(e) => handleInputChange('fromDate', e.target.value)}
              onKeyPress={handleKeyPress}
              className='border-2 border-[#BF9853] border-opacity-30 rounded-lg pl-3 mt-2 w-[168px] h-[45px] focus:outline-none'
            />
          </div>
          <div className=''>
            <h2 className='font-semibold'>To Date</h2>
                          <input
                type='date'
                value={formData.toDate}
                onChange={(e) => handleInputChange('toDate', e.target.value)}
                onKeyPress={handleKeyPress}
                className='border-2 border-[#BF9853] border-opacity-30 rounded-lg pl-3 mt-2 w-[168px] h-[45px] focus:outline-none'
              />
          </div>
          <div className=''>
            <h2 className='font-semibold'>Amount Given</h2>
            <input
              value={formData.amountGiven}
              onChange={(e) => handleInputChange('amountGiven', e.target.value)}
              onKeyPress={handleKeyPress}
              className='bg-[#F2F2F2] rounded-lg mt-2 p-2 w-[107px] h-[45px] focus:outline-none'
              placeholder="0.00"
            />
          </div>
          <div className='pt-5'>
            <select
              value={formData.paymentMode}
              onChange={(e) => handleInputChange('paymentMode', e.target.value)}
              onKeyPress={handleKeyPress}
              className='w-[133px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 mt-2 rounded-lg focus:outline-none'
            >
              <option value=''>Select</option>
              {paymentModeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className=''>
            <h2 className='font-semibold'>Today Amount</h2>
            <input
              readOnly
              type='text'
              className='bg-[#F2F2F2] rounded-lg mt-2 p-2 w-[144px] h-[45px] focus:outline-none'
              placeholder="0.00"
            />
          </div>
          <div className=''>
            <h2 className='font-semibold'>Total Outstanding</h2>
            <input
              readOnly
              type='text'
              className='bg-[#F2F2F2] p-2 rounded-lg mt-2 w-[144px] h-[45px] focus:outline-none'
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className='ml-4 p-6 gap-6'>
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} onKeyPress={handleKeyPress} className='bg-white w-full max-w-[1750px] p-6 h-auto rounded-md shadow-sm'>
          <div className='flex flex-col lg:flex-row gap-6'>
            <div className='grid grid-cols-2 gap-4 text-left h-auto'>
              {/* Select Type */}
              <div className='flex items-center gap-3'>
                <label className='font-semibold text-[#E4572E]'>
                  Select Type {isRequired('selectedType') && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={formData.selectedType}
                  onChange={(e) => handleInputChange('selectedType', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className='w-[163px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
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
              <div className='flex items-center gap-3'>
                <label className='font-semibold text-[#E4572E]'>
                  Date {isRequired('date') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type='date'
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='dd-mm-yyyy'
                  className='w-[144px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
                />
              </div>

              {/* EMP Name */}
              <div>
                <div className='flex'>
                  <label className='font-semibold block mb-2'>
                    EMP Name {isRequired('empName') && <span className="text-red-500">*</span>}
                  </label>
                </div>
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

              {/* Overall Advance */}
              <div>
                <label className='font-semibold block mb-2'>Overall Advance</label>
                <input
                  value={formData.overallAdvance}
                  onChange={(e) => handleInputChange('overallAdvance', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className='w-[263px] h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none'
                  placeholder="Enter overall advance"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className='font-semibold block mb-2'>{fieldConfig.purposeLabel}</label>
                <Select
                  value={formData.purpose}
                  onChange={(value) => handleInputChange('purpose', value)}
                  placeholder="Select a site..."
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
              <div>
                <label className='font-semibold block mb-2'>
                  Advance Amount {isRequired('advanceAmount') && <span className="text-red-500">*</span>}
                </label>
                <input
                  value={formData.advanceAmount}
                  onChange={(e) => handleInputChange('advanceAmount', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className='w-[263px] h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none'
                  placeholder="Enter advance amount"
                />
              </div>

              {/* Amount Given */}
              <div>
                <label className='font-semibold block mb-2'>{fieldConfig.amountGivenLabel}</label>
                <input
                  value={formData.amountGivenInput}
                  onChange={(e) => handleInputChange('amountGivenInput', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className='w-[263px] h-[45px] px-2 py-1 rounded-lg border-2 border-[#BF9853] border-opacity-30 focus:outline-none'
                  placeholder={`Enter ${fieldConfig.amountGivenLabel.toLowerCase()}`}
                />
              </div>

              {/* Conditional Payment Mode/Transfer Amount */}
              <div>
                <label className='font-semibold block mb-2'>{fieldConfig.paymentModeLabel}</label>
                {formData.selectedType === 'Transfer' ? (
                  <input
                    value={formData.transferAmount}
                    onChange={(e) => handleInputChange('transferAmount', e.target.value)}
                    onKeyPress={handleKeyPress}
                    className='w-[263px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
                    placeholder="Enter transfer amount"
                  />
                ) : (
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => handleInputChange('paymentMode', e.target.value)}
                    className='w-[263px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
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
              <div className='col-span-2'>
                <label className='font-semibold block mb-2'>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className='w-full border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
                  placeholder="Enter description..."
                  rows={3}
                />
              </div>

              {/* File Attachment and Submit */}
              <div className='col-span-2'>
                <div className="md:col-span-2 items-center flex">
                  <div className='flex'>
                    <label htmlFor="fileInput" className="cursor-pointer flex items-center text-orange-600">
                      <img className='w-5 h-4' alt='' src={Attach} />
                      Attach file
                    </label>
                    <input
                      type="file"
                      id="fileInput"
                      className="hidden"
                      onChange={(e) => console.log('File selected:', e.target.files[0])}
                    />
                  </div>
                </div>
                <div className='flex gap-3 mt-3'>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded flex items-center justify-center transition-colors ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#c7934c] text-white hover:bg-[#b08542]'
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

            <div className='flex flex-col ml-0 lg:ml-20'>
              <div className='flex justify-end flex-wrap gap-4 mb-4'>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Records: {tableData.length}</span>
                </div>
                <input
                  className='border-2 w-[112px] p-2 border-[#E4572E] text-[#E4572E] font-bold border-opacity-10 rounded h-[33px] bg-[#F2F2F2] focus:outline-none'
                  placeholder="Search..."
                />
                <button
                  type="button"
                  onClick={exportToPDF}
                  className='text-[#E4572E] font-semibold hover:underline cursor-pointer'
                >
                  Export PDF
                </button>
                <button
                  type="button"
                  onClick={exportToExcel}
                  className='text-[#007233] font-semibold hover:underline cursor-pointer'
                >
                  Export XL
                </button>
                <button
                  type="button"
                  onClick={printData}
                  className='text-[#BF9853] font-semibold hover:underline cursor-pointer'
                >
                  Print
                </button>
                {tableData.length > 0 && (
                  <button
                    type="button"
                    onClick={clearTable}
                    className='text-red-600 font-semibold hover:underline cursor-pointer'
                    title="Clear all records"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className='border-l-8 border-l-[#BF9853] rounded-lg h-[500px] overflow-auto'>
                <table className="w-[1000px]">
                  <thead className="bg-[#FAF6ED] text-left sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Advance</th>
                      <th className="px-3 py-2">Transfer/Refund</th>
                      <th className="px-3 py-2">Mode</th>
                      <th className="px-3 py-2">Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-3 py-4 text-center text-gray-500">
                          No data available. Fill the form and click "Pay Advance" to add records.
                        </td>
                      </tr>
                    ) : (
                      tableData.map((record) => (
                        <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-3 py-2">{record.date}</td>
                          <td className="px-3 py-2">{record.advance}</td>
                          <td className="px-3 py-2">{record.transferRefund}</td>
                          <td className="px-3 py-2">{record.mode}</td>
                          <td className="px-3 py-2">{record.activity}</td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => deleteRow(record.id)}
                              className="text-red-600 hover:text-red-800 font-semibold text-sm"
                              title="Delete record"
                            >
                              ✕
                            </button>
                          </td>
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
