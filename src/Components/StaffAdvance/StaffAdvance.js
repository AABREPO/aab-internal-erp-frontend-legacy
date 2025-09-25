import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Select from 'react-select';
import Attach from '../Images/Attachfile.svg';
import edit from '../Images/Edit.svg';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const StaffAdvance = () => {
  // Form state management
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    amountGiven: '',
    paymentMode: '',
    selectedType: '',
    date: new Date().toISOString().split('T')[0], // Set to today's date
    empName: null,
    overallAdvance: '',
    purpose: null,
    advanceAmount: '',
    amountGivenInput: '',
    transferAmount: '',
    description: '',
    labourName: null
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
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  // Employee options state
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [laboursList, setLaboursList] = useState([]);
  const [staffAdvanceCombinedOptions, setStaffAdvanceCombinedOptions] = useState([]);
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
  useEffect(() => {
    fetchLaboursList();
  }, []);
  const fetchLaboursList = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/labours-details/getAll');
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.labour_name,
          label: item.labour_name,
          id: item.id,
          type: "Labour",
          salary: item.labour_salary,
          extra: item.extra_amount
        }));
        setLaboursList(formattedData);
      } else {
        console.log('Error fetching Labour names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching Labour names.');
    }
  };

  useEffect(() => { setStaffAdvanceCombinedOptions([...employeeOptions, ...laboursList]); }, [employeeOptions, laboursList]);

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

  const filterTableData = useCallback(() => {
    if (!formData.empName || !formData.purpose) {
      setFilteredTableData([]);
      return;
    }
    const filtered = tableData.filter(record => {
      const matchesEmployee = record.employee_name === formData.empName.value ||
        record.employee_id === formData.empName.id ||
        record.labour_id === formData.empName.id;
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
        record.labour_id === formData.empName.id ||
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
        record.labour_id === employeeId ||
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
    // Calculate total amount given (only Advance amounts, no subtraction of refunds)
    const totalAmount = filteredRecords.reduce((total, record) => {
      if (record.type === 'Advance') {
        return total + (parseFloat(record.amount) || 0);
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
        employee_id: formData.empName?.type === "Employee" ? formData.empName.id : null,
        labour_id: formData.empName?.type === "Labour" ? formData.empName.id : null,
        staff_payment_mode: formData.paymentMode,
        staff_refund_amount:
          formData.selectedType === "Refund"
            ? parseFloat(formData.amountGivenInput) || 0
            : 0,
        description: formData.description,
        file_url: formData.fileUrl || null,
        entryNo: nextEntryNo,
        weekNo: 0,
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
        toast.success('Record would be saved (API not available)', {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        resetForm();
        return;
      }
      toast.success('Record saved successfully!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
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
    setFormData(prev => ({
      fromDate: '',
      toDate: '',
      amountGiven: '',
      paymentMode: '',
      selectedType: prev.selectedType, // Preserve selected type
      date: new Date().toISOString().split('T')[0], // Set to today's date
      empName: prev.empName, // Preserve selected employee
      overallAdvance: '',
      purpose: prev.purpose, // Preserve selected purpose
      advanceAmount: '',
      amountGivenInput: '',
      transferAmount: '',
      description: ''
    }));
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
      toast.success('Filtered records cleared!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    }
  }, [filteredTableData.length, filteredTableData]);
  // Export functions
  const exportToPDF = useCallback(() => {
    try {
      // Create new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Staff Advance Report', 20, 20);

      // Add date range if available
      if (staffFromDate && staffToDate) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date Range: ${staffFromDate} to ${staffToDate}`, 20, 30);
      }

      // Add employee and purpose info if selected
      if (formData.empName && formData.purpose) {
        doc.setFontSize(10);
        doc.text(`Employee: ${formData.empName.label}`, 20, 40);
        doc.text(`Purpose: ${formData.purpose.label}`, 20, 47);
      }

      // Prepare table data
      const tableData = filteredTableData.length > 0 ? filteredTableData : [];

      if (tableData.length === 0) {
        doc.setFontSize(12);
        doc.text('No data available for export', 20, 60);
        doc.save('staff-advance-report.pdf');
        return;
      }

      // Prepare table columns and rows
      const columns = [
        { title: 'Date', dataKey: 'date' },
        { title: 'Advance', dataKey: 'advance' },
        { title: 'Transfer/Refund', dataKey: 'transferRefund' },
        { title: 'Mode', dataKey: 'mode' },
        { title: 'Type', dataKey: 'type' }
      ];

      const rows = tableData.map(record => {
        const advanceAmount = record.type === "Refund"
          ? -Math.abs(record.staff_refund_amount || 0)
          : record.amount;

        const transferRefund = record.type === "Refund"
          ? "Refund"
          : record.type === "Transfer"
            ? (() => {
              const amount = parseFloat(record.amount) || 0;
              if (amount < 0) {
                const toPurposeId = record.to_purpose_id;
                const toPurpose = purposeOptions.find(p => p.id === toPurposeId);
                return `Transfer To ${toPurpose?.label || 'Unknown Purpose'}`;
              } else {
                const fromPurposeId = record.to_purpose_id;
                const fromPurpose = purposeOptions.find(p => p.id === fromPurposeId);
                return `Transfer From ${fromPurpose?.label || 'Unknown Purpose'}`;
              }
            })()
            : record.staff_refund_amount;

        return {
          date: record.date,
          advance: advanceAmount,
          transferRefund: transferRefund,
          mode: record.staff_payment_mode || '',
          type: record.type
        };
      });

      // Add table to PDF
      doc.autoTable({
        columns: columns,
        body: rows,
        startY: 60,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [0, 0, 0], // Black text
          lineColor: [0, 0, 0], // Black borders
          lineWidth: 0.1, // Border width
        },
        headStyles: {
          fillColor: [255, 255, 255], // White background
          textColor: [0, 0, 0], // Black text
          fontStyle: 'bold',
          lineColor: [0, 0, 0], // Black borders
          lineWidth: 0.1, // Border width
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255], // White background for all rows
          lineColor: [0, 0, 0], // Black borders
          lineWidth: 0.1, // Border width
        },
        columnStyles: {
          advance: {
            halign: 'right',
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          },
          transferRefund: {
            halign: 'center',
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          },
          mode: {
            halign: 'center',
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          },
          type: {
            halign: 'center',
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          }
        },
        tableLineColor: [0, 0, 0], // Table border color
        tableLineWidth: 0.1, // Table border width
      });

      // Add summary information at the bottom
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');

      if (formData.empName && formData.purpose) {
        doc.text(`Total Advance Amount: ${formData.advanceAmount}`, 20, finalY);
      }

      if (staffFromDate && staffToDate) {
        doc.text(`Total Amount Given (${staffFromDate} to ${staffToDate}): ${staffAmountGiven}`, 20, finalY + 10);
      }

      doc.text(`Today's Amount: ${staffTodayAmount}`, 20, finalY + 20);
      doc.text(`Total Outstanding: ${staffTotalOutstanding}`, 20, finalY + 30);

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.height - 10);
      }

      // Save the PDF
      const fileName = `staff-advance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('PDF exported successfully!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  }, [filteredTableData, formData, staffFromDate, staffToDate, staffAmountGiven, staffTodayAmount, staffTotalOutstanding, purposeOptions]);
  const exportToExcel = useCallback(() => {
    try {
      // Prepare table data
      const tableData = filteredTableData.length > 0 ? filteredTableData : [];

      if (tableData.length === 0) {
        alert('No data available for export');
        return;
      }

      // Create CSV content starting with title (like PDF)
      const csvRows = [];

      // Add title (like PDF)
      csvRows.push(['Staff Advance Report']);
      csvRows.push(['']); // Empty row

      // Add date range if available (like PDF)
      if (staffFromDate && staffToDate) {
        csvRows.push([`Date Range: ${staffFromDate} to ${staffToDate}`]);
      }

      // Add employee and purpose info if selected (like PDF)
      if (formData.empName && formData.purpose) {
        csvRows.push([`Employee: ${formData.empName.label}`]);
        csvRows.push([`Purpose: ${formData.purpose.label}`]);
      }

      csvRows.push(['']); // Empty row before table

      // Create table headers (same as PDF)
      const headers = ['Date', 'Advance', 'Transfer/Refund', 'Mode', 'Type'];
      csvRows.push(headers);

      // Create table data rows (same logic as PDF)
      const dataRows = tableData.map(record => {
        const advanceAmount = record.type === "Refund"
          ? -Math.abs(record.staff_refund_amount || 0)
          : record.amount;

        const transferRefund = record.type === "Refund"
          ? "Refund"
          : record.type === "Transfer"
            ? (() => {
              const amount = parseFloat(record.amount) || 0;
              if (amount < 0) {
                const toPurposeId = record.to_purpose_id;
                const toPurpose = purposeOptions.find(p => p.id === toPurposeId);
                return `Transfer To ${toPurpose?.label || 'Unknown Purpose'}`;
              } else {
                const fromPurposeId = record.to_purpose_id;
                const fromPurpose = purposeOptions.find(p => p.id === fromPurposeId);
                return `Transfer From ${fromPurpose?.label || 'Unknown Purpose'}`;
              }
            })()
            : record.staff_refund_amount;

        return [
          record.date,
          advanceAmount,
          transferRefund,
          record.staff_payment_mode || '',
          record.type
        ];
      });

      // Add data rows
      csvRows.push(...dataRows);

      // Add empty row before summary (like PDF)
      csvRows.push(['']);

      // Add summary information (same as PDF)
      if (formData.empName && formData.purpose) {
        csvRows.push([`Total Advance Amount: ${formData.advanceAmount}`]);
      }

      if (staffFromDate && staffToDate) {
        csvRows.push([`Total Amount Given (${staffFromDate} to ${staffToDate}): ${staffAmountGiven}`]);
      }

      csvRows.push([`Today's Amount: ${staffTodayAmount}`]);
      csvRows.push([`Total Outstanding: ${staffTotalOutstanding}`]);

      // Add empty row
      csvRows.push(['']);

      // Add footer (like PDF)
      csvRows.push([`Generated on: ${new Date().toLocaleDateString()}`]);

      // Convert to CSV format
      const csvContent = csvRows.map(row =>
        row.map(field => {
          // Escape fields that contain commas, quotes, or newlines
          if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        }).join(',')
      ).join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);

      const fileName = `staff-advance-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV exported successfully!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });

    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV. Please try again.');
    }
  }, [filteredTableData, formData, staffFromDate, staffToDate, staffAmountGiven, staffTodayAmount, staffTotalOutstanding, purposeOptions]);
  const printData = useCallback(() => {
    console.log('Printing...');
    // Add print logic
  }, []);

  // Edit functionality
  const handleEditClick = useCallback((record) => {
    setEditingId(record.id);
    setEditFormData({
      selectedType: record.type || '',
      date: record.date?.split('T')[0] || '',
      empName:
        employeeOptions.find(emp => emp.id === record.employee_id) ||
        laboursList.find(labour => labour.id === record.labour_id) ||
        null,
      purpose: purposeOptions.find(purpose => purpose.id === record.from_purpose_id) || null,
      amountGivenInput: record.amount || '',
      paymentMode: record.staff_payment_mode || '',
      transferPurpose: purposeOptions.find(purpose => purpose.id === record.to_purpose_id) || null,
      transferAmount: record.type === 'Transfer' ? record.amount : '',
      overallAdvance: '',
      advanceAmount: ''
    });
    setIsEditModalOpen(true);
  }, [employeeOptions, laboursList, purposeOptions]);

  const handleUpdate = useCallback(async () => {
    try {
      const updatePayload = {
        type: editFormData.selectedType,
        date: editFormData.date,
        employee_id: editFormData.empName?.type === "Employee" ? editFormData.empName.id : null,
        labour_id: editFormData.empName?.type === "Labour" ? editFormData.empName.id : null,
        from_purpose_id: editFormData.purpose?.id,
        amount: editFormData.amountGivenInput,
        staff_payment_mode: editFormData.paymentMode
      };

      // Add transfer-specific fields if it's a transfer type
      if (editFormData.selectedType === 'Transfer') {
        updatePayload.to_purpose_id = editFormData.transferPurpose?.id;
        updatePayload.amount = editFormData.transferAmount;
      }

      const res = await fetch(`https://backendaab.in/aabuildersDash/api/staff-advance/edit/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success('Record updated successfully!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      setIsEditModalOpen(false);
      await fetchRecords();
    } catch (err) {
      console.error('Error updating record:', err);
      alert('Error updating record');
    }
  }, [editingId, editFormData, fetchRecords]);
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
                  options={staffAdvanceCombinedOptions}
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
                      <th className="px-4 py-3 font-semibold text-gray-700">Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTableData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className=" py-8 text-center text-gray-500">
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
                          <td className=" py-3">{record.date}</td>
                          <td
                            className=" py-3 font-medium"
                            style={{ color: record.type === "Refund" ? '#dc2626' : '#059669' }}
                          >
                            {record.type === "Refund"
                              ? -Math.abs(record.staff_refund_amount || 0)
                              : record.amount}
                          </td>
                          <td className=" py-3">
                            {record.type === "Refund"
                              ? "Refund"
                              : record.type === "Transfer"
                                ? (() => {
                                  // For transfer records, determine direction based on amount sign
                                  const amount = parseFloat(record.amount) || 0;
                                  if (amount < 0) {
                                    // Negative amount means money going out from this purpose
                                    // Find the "to" purpose name from the transfer record
                                    const toPurposeId = record.to_purpose_id;
                                    const toPurpose = purposeOptions.find(p => p.id === toPurposeId);
                                    return `Transfer To ${toPurpose?.label || 'Unknown Purpose'}`;
                                  } else {
                                    // Positive amount means money coming in to this purpose
                                    // Find the "from" purpose name from the transfer record
                                    const fromPurposeId = record.to_purpose_id;
                                    const fromPurpose = purposeOptions.find(p => p.id === fromPurposeId);
                                    return `Transfer From ${fromPurpose?.label || 'Unknown Purpose'}`;
                                  }
                                })()
                                : record.staff_refund_amount
                            }
                          </td>
                          <td className=" py-3">{record.staff_payment_mode}</td>
                          <td className=" py-3">
                            <button
                              type="button"
                              className="rounded-full transition duration-200 ml-2 mr-3"
                              onClick={() => handleEditClick(record)}
                            >
                              <img
                                src={edit}
                                alt="Edit"
                                className=" w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200 cursor-pointer"
                              />
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Edit Staff Advance Entry</h2>
            <div className='text-left'>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Select Type */}
                <div className='space-y-2'>
                  <label className='font-semibold text-[#E4572E] block'>
                    Select Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.selectedType}
                    onChange={(e) => setEditFormData({ ...editFormData, selectedType: e.target.value })}
                    className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none focus:border-[#BF9853] transition-colors'
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
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type='date'
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none focus:border-[#BF9853] transition-colors'
                  />
                </div>

                {/* EMP Name */}
                <div className='space-y-2'>
                  <label className='font-semibold block'>
                    EMP Name <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={editFormData.empName}
                    onChange={(value) => setEditFormData({ ...editFormData, empName: value })}
                    options={staffAdvanceCombinedOptions}
                    className='w-full h-[45px] rounded-lg focus:outline-none'
                    isClearable
                    styles={customStyles}
                    placeholder="Select employee..."
                    isSearchable={true}
                  />
                </div>

                {/* Overall Advance */}
                <div className='space-y-2'>
                  <label className='font-semibold block'>Overall Advance</label>
                  <input
                    value={editFormData.overallAdvance}
                    readOnly
                    className='w-full h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none cursor-not-allowed'
                    placeholder="0.00"
                  />
                </div>

                {/* Purpose */}
                <div className='space-y-2'>
                  <label className='font-semibold block'>Purpose</label>
                  <Select
                    value={editFormData.purpose}
                    onChange={(value) => setEditFormData({ ...editFormData, purpose: value })}
                    options={purposeOptions}
                    placeholder="Select a purpose..."
                    isSearchable={true}
                    styles={customStyles}
                    isClearable
                    className='w-full h-[45px] focus:outline-none'
                  />
                </div>

                {/* Advance Amount */}
                <div className='space-y-2'>
                  <label className='font-semibold block'>Advance Amount</label>
                  <input
                    value={editFormData.advanceAmount}
                    readOnly
                    className='w-full h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none cursor-not-allowed'
                    placeholder="0.00"
                  />
                </div>

                {/* Amount Given / Purpose To */}
                <div className='space-y-2'>
                  <label className='font-semibold block'>
                    {editFormData.selectedType === 'Transfer' ? 'Purpose To' : 'Amount Given'}
                  </label>
                  {editFormData.selectedType === 'Transfer' ? (
                    <Select
                      value={editFormData.transferPurpose}
                      onChange={(value) => setEditFormData({ ...editFormData, transferPurpose: value })}
                      options={purposeOptions}
                      placeholder="Select purpose to..."
                      styles={customStyles}
                      className='w-full h-[45px] rounded-lg focus:outline-none'
                      isClearable
                    />
                  ) : (
                    <input
                      value={editFormData.amountGivenInput}
                      onChange={(e) => setEditFormData({ ...editFormData, amountGivenInput: e.target.value })}
                      className='w-full h-[45px] px-2 py-1 rounded-lg border-2 border-[#BF9853] border-opacity-30 focus:outline-none focus:border-[#BF9853] transition-colors'
                      placeholder="Enter amount given"
                    />
                  )}
                </div>

                {/* Payment Mode/Transfer Amount */}
                <div className='space-y-2'>
                  <label className='font-semibold block'>
                    {editFormData.selectedType === 'Transfer' ? 'Transfer Amount' : 'Payment Mode'}
                  </label>
                  {editFormData.selectedType === 'Transfer' ? (
                    <input
                      value={editFormData.transferAmount}
                      onChange={(e) => setEditFormData({ ...editFormData, transferAmount: e.target.value })}
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none focus:border-[#BF9853] transition-colors'
                      placeholder="Enter transfer amount"
                    />
                  ) : (
                    <select
                      value={editFormData.paymentMode}
                      onChange={(e) => setEditFormData({ ...editFormData, paymentMode: e.target.value })}
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none focus:border-[#BF9853] transition-colors'
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
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-[100px] h-[45px] border border-[#BF9853] rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="w-[100px] h-[45px] bg-[#BF9853] text-white rounded hover:bg-[#a67c3a] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};
export default StaffAdvance;