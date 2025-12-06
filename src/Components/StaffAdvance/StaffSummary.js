import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";

const StaffSummary = ({ username, userRoles = [], paymentModeOptions = [] }) => {
  const [empOptions, setEmpOptions] = useState([]);
  const [laboursList, setLaboursList] = useState([]);
  const [staffAdvanceCombinedOptions, setStaffAdvanceCombinedOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [selectedEmpOption, setSelectedEmpOption] = useState('');
  const [selectedPurposeOption, setSelectedPurposeOption] = useState('');
  const [totalPendingAdvance, setTotalPendingAdvance] = useState(0);
  const [purposeDetails, setPurposeDetails] = useState([]);
  const [purposePendingAdvance, setPurposePendingAdvance] = useState(0);
  const [purposeBillAmount, setPurposeBillAmount] = useState(0);
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  // Sorting state for both tables
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [purposeSortConfig, setPurposeSortConfig] = useState({ key: null, direction: 'asc' });
  // Tooltip state for first table (Purpose table)
  const [purposeTooltipData, setPurposeTooltipData] = useState(null);
  const [purposeTooltipPosition, setPurposeTooltipPosition] = useState({ x: 0, y: 0 });
  const [purposeTooltipTitle, setPurposeTooltipTitle] = useState("");
  // Tooltip state for second table (Employee table)
  const [employeeTooltipData, setEmployeeTooltipData] = useState(null);
  const [employeeTooltipPosition, setEmployeeTooltipPosition] = useState({ x: 0, y: 0 });
  const [employeeTooltipTitle, setEmployeeTooltipTitle] = useState("");
  // Popup/Modal state for first table (Purpose table)
  const [purposePopupData, setPurposePopupData] = useState(null);
  const [purposePopupTitle, setPurposePopupTitle] = useState("");
  const [purposePopupContext, setPurposePopupContext] = useState("");
  const [showPurposePopup, setShowPurposePopup] = useState(false);
  const [purposePopupSortConfig, setPurposePopupSortConfig] = useState({ key: null, direction: 'asc' });
  // Popup/Modal state for second table (Employee table)
  const [employeePopupData, setEmployeePopupData] = useState(null);
  const [employeePopupTitle, setEmployeePopupTitle] = useState("");
  const [employeePopupContext, setEmployeePopupContext] = useState("");
  const [showEmployeePopup, setShowEmployeePopup] = useState(false);
  const [employeePopupSortConfig, setEmployeePopupSortConfig] = useState({ key: null, direction: 'asc' });
  // Popup/Modal state for Bill Status popup (combined advance + refund)
  const [showBillStatusPopup, setShowBillStatusPopup] = useState(false);
  const [billStatusPopupData, setBillStatusPopupData] = useState({ advances: [], refunds: [] });
  const [billStatusPopupContext, setBillStatusPopupContext] = useState("");
  const [billStatusPopupSortConfig, setBillStatusPopupSortConfig] = useState({ key: null, direction: 'asc' });
  const [isBillStatusFromFirstTable, setIsBillStatusFromFirstTable] = useState(true);
  useEffect(() => {
    const savedEmp = sessionStorage.getItem('selectedEmpOption');
    try {
      if (savedEmp) setSelectedEmpOption(JSON.parse(savedEmp));
    } catch (error) {
      console.error("Error parsing sessionStorage data:", error);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  const handleBeforeUnload = () => {
    sessionStorage.removeItem('selectedEmpOption');
  };
  useEffect(() => {
    if (selectedEmpOption) sessionStorage.setItem('selectedEmpOption', JSON.stringify(selectedEmpOption));
  }, [selectedEmpOption]);
  useEffect(() => {
    const saved = localStorage.getItem("staffEmpName");
    if (saved) {
      setSelectedEmpOption(JSON.parse(saved));
    }
  }, []);
  useEffect(() => {
    const savedPurpose = localStorage.getItem("staffPurpose");
    if (savedPurpose) {
      setSelectedPurposeOption(JSON.parse(savedPurpose));
    }
  }, []);
  // Fetch Employee Names
  useEffect(() => {
    const fetchEmpNames = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        setEmpOptions(data.map(item => ({
          value: item.employee_name,
          label: item.employee_name,
          id: item.id,
          type: "Employee"
        })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmpNames();
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
          type: "Labour"
        }));
        setLaboursList(formattedData);
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching Labour names.');
    }
  };
  useEffect(() => { setStaffAdvanceCombinedOptions([...empOptions, ...laboursList]); }, [empOptions, laboursList]);
  // Fetch Purpose Options
  useEffect(() => {
    const fetchPurposeOptions = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/purposes/getAll", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) {
          console.warn("Purposes API not available, using empty data");
          setPurposeOptions([]);
          return;
        }
        const data = await res.json();
        setPurposeOptions(data.map(item => ({
          value: item.purpose,
          label: item.purpose,
          id: item.id
        })));
      } catch (err) {
        console.warn("Purpose fetch error:", err);
        setPurposeOptions([]);
      }
    };
    fetchPurposeOptions();
  }, []);
  // Fetch Staff Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/staff-advance/all");
        if (!res.ok) {
          console.warn('Staff advance API not available, using empty data');
          setStaffData([]);
          return;
        }
        const data = await res.json();
        setStaffData(data);
      } catch (err) {
        console.warn("Error fetching staff data", err);
        setStaffData([]);
      }
    };
    fetchData();
  }, []);
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
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };
  // State for filtered purpose data
  const [purposeData, setPurposeData] = useState([]);
  useEffect(() => {
    if (selectedEmpOption) {
      const filtered = staffData.filter(item => {
        // Check based on the type of selected option (Employee or Labour)
        if (selectedEmpOption.type === "Employee") {
          // Only check employee-related fields when an employee is selected
          return item.employee_name === selectedEmpOption.value ||
                 item.employee_id === selectedEmpOption.id ||
                 item.emp_name === selectedEmpOption.value;
        } else if (selectedEmpOption.type === "Labour") {
          // Only check labour-related fields when a labour is selected
          return item.labour_name === selectedEmpOption.value ||
                 item.labour_id === selectedEmpOption.id;
        } else {
          // Fallback to original logic if type is not specified
          return item.employee_name === selectedEmpOption.value ||
                 item.employee_id === selectedEmpOption.id ||
                 item.emp_name === selectedEmpOption.value ||
                 item.labour_name === selectedEmpOption.value ||
                 item.labour_id === selectedEmpOption.id;
        }
      });
      const grouped = {};
      let totalPendingAll = 0;
      let totalRefundAll = 0;
      filtered.forEach(curr => {
        const {
          from_purpose_id,
          to_purpose_id,
          amount = 0,
          staff_refund_amount = 0
        } = curr;
        // Handle Transfer type transactions
        if (curr.type === 'Transfer') {
          // For transfer records, the amount field already contains the correct sign
          // Negative amount means money going out from from_purpose_id (should be counted as refund only)
          // Positive amount means money coming in to from_purpose_id (should be counted as advance)
          if (from_purpose_id) {
            if (!grouped[from_purpose_id]) {
              grouped[from_purpose_id] = {
                purposeName: purposeOptions.find(p => String(p.id) === String(from_purpose_id))?.label || "-",
                purposeId: from_purpose_id,
                totalAdvance: 0,
                totalRefund: 0
              };
            }
            const transferAmount = parseFloat(amount) || 0;
            if (transferAmount < 0) {
              // Negative transfer (money going out) should only be counted as refund, not reduce advance
              grouped[from_purpose_id].totalRefund += Math.abs(transferAmount);
            } else {
              // Positive transfer (money coming in) should be counted as advance
              grouped[from_purpose_id].totalAdvance += transferAmount;
            }
          }
        } else {
          // Handle non-transfer transactions (Advance and Refund)
          if (!grouped[from_purpose_id]) {
            grouped[from_purpose_id] = {
              purposeName: purposeOptions.find(p => String(p.id) === String(from_purpose_id))?.label || "-",
              purposeId: from_purpose_id,
              totalAdvance: 0,
              totalRefund: 0
            };
          }
          // For advance entries, amount can be positive or negative
          if (curr.type === 'Advance') {
            const advanceAmount = parseFloat(amount) || 0;
            // If amount is negative, it will subtract automatically
            grouped[from_purpose_id].totalAdvance += advanceAmount;
          }
          // For refund entries, all refund amounts should subtract from advance
          if (curr.type === 'Refund') {
            const refundAmount = parseFloat(staff_refund_amount) || 0;
            // All refunds subtract: if negative (-500), subtract 500; if positive (100), subtract 100
            // So we add the absolute value to totalRefund (which will be subtracted from advance)
            grouped[from_purpose_id].totalRefund += Math.abs(refundAmount);
          }
        }
      });
      const purposeArray = Object.values(grouped).map(p => {
        const pending = p.totalAdvance - p.totalRefund;
        totalPendingAll += pending;
        totalRefundAll += p.totalRefund;
        return {
          purposeName: p.purposeName,
          pendingAdvance: pending,
          billAmount: p.totalRefund, // Show refund amount
          purposeId: p.purposeId
        };
      });
      setPurposeData(purposeArray);
      setTotalPendingAdvance(totalPendingAll);
      setTotalBillAmount(totalRefundAll); // Show total refund amount
    } else {
      setPurposeData([]);
      setTotalPendingAdvance(0);
      setTotalBillAmount(0);
    }
  }, [selectedEmpOption, staffData, purposeOptions]);
  const sortedPurposeOptions = purposeOptions.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  // Sorting functions
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  const handlePurposeSort = (key) => {
    let direction = 'asc';
    if (purposeSortConfig.key === key && purposeSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setPurposeSortConfig({ key, direction });
  };
  const defaultSort = (data, statusKey = 'pendingAdvance', nameKey = 'purposeName') => {
    return [...data].sort((a, b) => {
      const aStatus = a[statusKey] > 0 ? 1 : 0;
      const bStatus = b[statusKey] > 0 ? 1 : 0;
      if (aStatus !== bStatus) return bStatus - aStatus;

      const aName = (a[nameKey] || '').toLowerCase();
      const bName = (b[nameKey] || '').toLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      return 0;
    });
  };
  const sortData = (data, config, statusKey = 'pendingAdvance', nameKey = 'purposeName') => {
    if (!config.key) {
      return defaultSort(data, statusKey, nameKey);
    }
    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];
      if (config.key === 'billStatus') {
        const aStatus = a.pendingAdvance > 0 ? 'Pending' : 'Bill Settled';
        const bStatus = b.pendingAdvance > 0 ? 'Pending' : 'Bill Settled';
        aValue = aStatus;
        bValue = bStatus;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      if (aValue < bValue) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  // Get refund details for tooltip
  const getRefundDetails = (purposeId, empId, empType) => {
    if (!staffData.length) return [];
    return staffData.filter(item => {
      let matchesEmp = false;
      if (empType === "Employee") {
        matchesEmp = item.employee_id === empId;
      } else if (empType === "Labour") {
        matchesEmp = item.labour_id === empId;
      } else {
        // Fallback to original logic
        matchesEmp = item.employee_id === empId || item.labour_id === empId;
      }
      if (!matchesEmp) return false;
      // Handle regular refunds (include both positive and negative refund amounts)
      if (item.type === 'Refund' && item.from_purpose_id === purposeId && item.staff_refund_amount != null) {
        return true;
      }
      // Handle transfers where this purpose is the source (negative amount)
      if (item.type === 'Transfer' && item.from_purpose_id === purposeId && item.amount < 0) {
        return true;
      }
      return false;
    }).map(item => {
      const refundAmount = item.type === 'Transfer' ? parseFloat(item.amount) || 0 : parseFloat(item.staff_refund_amount) || 0;
      // All refund amounts should subtract from advance (use absolute value)
      return {
        date: new Date(item.date).toLocaleDateString('en-GB'),
        amount: Math.abs(refundAmount), // Use absolute value so all refunds subtract
        type: item.type === 'Transfer' ? 'Transfer Out' : 'Refund'
      };
    });
  };
  // Get advance details for tooltip
  const getAdvanceDetails = (purposeId, empId, empType) => {
    if (!staffData.length) return [];
    return staffData.filter(item => {
      let matchesEmp = false;
      if (empType === "Employee") {
        matchesEmp = item.employee_id === empId;
      } else if (empType === "Labour") {
        matchesEmp = item.labour_id === empId;
      } else {
        // Fallback to original logic
        matchesEmp = item.employee_id === empId || item.labour_id === empId;
      }
      if (!matchesEmp) return false;
      // Handle regular advances (include both positive and negative amounts)
      if (item.type === 'Advance' && item.from_purpose_id === purposeId && item.amount != null) {
        return true;
      }
      // Handle transfers where this purpose is the destination (positive amount)
      if (item.type === 'Transfer' && item.from_purpose_id === purposeId && item.amount > 0) {
        return true;
      }
      return false;
    }).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.amount) || 0,
      type: item.type === 'Transfer' ? 'Transfer In' : 'Advance'
    }));
  };
  // Tooltip handlers for first table (Purpose table)
  const handlePurposeRefundMouseEnter = (event, purposeId, empId, empType) => {
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    if (refundDetails.length > 0) {
      setPurposeTooltipTitle('Refund Details');
      setPurposeTooltipData(refundDetails);
      setPurposeTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  const handlePurposeMouseLeave = () => {
    setPurposeTooltipData(null);
    setPurposeTooltipTitle("");
  };
  const handlePurposeAdvanceMouseEnter = (event, purposeId, empId, empType) => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    if (advanceDetails.length > 0) {
      setPurposeTooltipTitle('Advance Details');
      setPurposeTooltipData(advanceDetails);
      setPurposeTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  // Tooltip handlers for second table (Employee table)
  const handleEmployeeRefundMouseEnter = (event, purposeId, empId, empType) => {
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    if (refundDetails.length > 0) {
      setEmployeeTooltipTitle('Refund Details');
      setEmployeeTooltipData(refundDetails);
      setEmployeeTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  const handleEmployeeMouseLeave = () => {
    setEmployeeTooltipData(null);
    setEmployeeTooltipTitle("");
  };
  const handleEmployeeAdvanceMouseEnter = (event, purposeId, empId, empType) => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    if (advanceDetails.length > 0) {
      setEmployeeTooltipTitle('Advance Details');
      setEmployeeTooltipData(advanceDetails);
      setEmployeeTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  // Click handlers for first table (Purpose table) - Opens popup
  const handlePurposeAdvanceClick = (purposeId, empId, empType, purposeName) => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    if (advanceDetails.length > 0) {
      setPurposePopupTitle('Advance Details');
      setPurposePopupData(advanceDetails);
      const empName = selectedEmpOption ? selectedEmpOption.label : "All Employees/Labours";
      setPurposePopupContext(`${empName} - ${purposeName}`);
      setShowPurposePopup(true);
    }
  };
  const handlePurposeRefundClick = (purposeId, empId, empType, purposeName) => {
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    if (refundDetails.length > 0) {
      setPurposePopupTitle('Refund Details');
      setPurposePopupData(refundDetails);
      const empName = selectedEmpOption ? selectedEmpOption.label : "All Employees/Labours";
      setPurposePopupContext(`${empName} - ${purposeName}`);
      setShowPurposePopup(true);
    }
  };

  // Click handlers for second table (Employee table) - Opens popup
  const handleEmployeeAdvanceClick = (purposeId, empId, empType, empName) => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    if (advanceDetails.length > 0) {
      setEmployeePopupTitle('Advance Details');
      setEmployeePopupData(advanceDetails);
      const purposeName = selectedPurposeOption ? selectedPurposeOption.label : "All Purposes";
      setEmployeePopupContext(`${purposeName} - ${empName}`);
      setShowEmployeePopup(true);
    }
  };
  const handleEmployeeRefundClick = (purposeId, empId, empType, empName) => {
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    if (refundDetails.length > 0) {
      setEmployeePopupTitle('Refund Details');
      setEmployeePopupData(refundDetails);
      const purposeName = selectedPurposeOption ? selectedPurposeOption.label : "All Purposes";
      setEmployeePopupContext(`${purposeName} - ${empName}`);
      setShowEmployeePopup(true);
    }
  };

  // Click handlers for Bill Status - Opens combined popup showing both advances and refunds
  const handlePurposeBillStatusClick = (purposeId, empId, empType, purposeName) => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    setBillStatusPopupData({ advances: advanceDetails, refunds: refundDetails });
    const empName = selectedEmpOption ? selectedEmpOption.label : "All Employees/Labours";
    setBillStatusPopupContext(`${empName} - ${purposeName}`);
    setIsBillStatusFromFirstTable(true);
    setShowBillStatusPopup(true);
  };

  const handleEmployeeBillStatusClick = (purposeId, empId, empType, empName) => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    setBillStatusPopupData({ advances: advanceDetails, refunds: refundDetails });
    const purposeName = selectedPurposeOption ? selectedPurposeOption.label : "All Purposes";
    setBillStatusPopupContext(`${purposeName} - ${empName}`);
    setIsBillStatusFromFirstTable(false);
    setShowBillStatusPopup(true);
  };
  useEffect(() => {
    if (selectedPurposeOption) {
      const purposeId = selectedPurposeOption.id;
      const filtered = staffData.filter(item => {
        // Check for purpose match - try different possible field names
        return item.from_purpose_id === purposeId ||
               item.purpose_id === purposeId ||
               item.purpose === selectedPurposeOption.value;
      });
      const grouped = {};
      let totalPending = 0;
      let totalRefund = 0;
      filtered.forEach(curr => {
        const {
          employee_id,
          labour_id,
          from_purpose_id,
          to_purpose_id,
          amount = 0,
          staff_refund_amount = 0
        } = curr;
        
        // Determine the ID and name based on whether it's an employee or labour
        let personId, personName;
        if (employee_id) {
          personId = employee_id;
          personName = empOptions.find(e => e.id === employee_id)?.label || "-";
        } else if (labour_id) {
          personId = labour_id;
          personName = laboursList.find(l => l.id === labour_id)?.label || "-";
        } else {
          return; // Skip if neither employee_id nor labour_id is present
        }
        
        if (!grouped[personId]) {
          grouped[personId] = {
            name: personName,
            empId: personId,
            empType: employee_id ? "Employee" : "Labour",
            totalAdvance: 0,
            totalRefund: 0
          };
        }
        // Handle Transfer type transactions
        if (curr.type === 'Transfer') {
          // For transfer records, check if this purpose is the from_purpose_id
          // The amount field already contains the correct sign
          if (from_purpose_id === purposeId) {
            const transferAmount = parseFloat(amount) || 0;
            if (transferAmount < 0) {
              // Negative transfer (money going out) should only be counted as refund, not reduce advance
              grouped[personId].totalRefund += Math.abs(transferAmount);
            } else {
              // Positive transfer (money coming in) should be counted as advance
              grouped[personId].totalAdvance += transferAmount;
            }
          }
        } else {
          // Handle non-transfer transactions (Advance and Refund)
          // For advance entries, amount can be positive or negative
          if (curr.type === 'Advance') {
            const advanceAmount = parseFloat(amount) || 0;
            // If amount is negative, it will subtract automatically
            grouped[personId].totalAdvance += advanceAmount;
          }
          // For refund entries, all refund amounts should subtract from advance
          if (curr.type === 'Refund') {
            const refundAmount = parseFloat(staff_refund_amount) || 0;
            // All refunds subtract: if negative (-500), subtract 500; if positive (100), subtract 100
            // So we add the absolute value to totalRefund (which will be subtracted from advance)
            grouped[personId].totalRefund += Math.abs(refundAmount);
          }
        }
      });
      const detailsArray = Object.values(grouped).map(d => {
        const pending = d.totalAdvance - d.totalRefund;
        totalPending += pending;
        totalRefund += d.totalRefund;
        return {
          name: d.name,
          empId: d.empId,
          empType: d.empType,
          pendingAdvance: pending,
          billAmount: d.totalRefund // Show refund amount
        };
      });
      setPurposeDetails(detailsArray);
      setPurposePendingAdvance(totalPending);
      setPurposeBillAmount(totalRefund); // Show total refund amount
    } else {
      setPurposeDetails([]);
      setPurposePendingAdvance(0);
      setPurposeBillAmount(0);
    }
  }, [selectedPurposeOption, staffData, empOptions]);
  const exportPDF = () => {
    const doc = new jsPDF();
    if (selectedEmpOption) {
      const { label } = selectedEmpOption;
      const titleText = `Employee - ${label}`;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(titleText, 14, 15);
    }
    const tableColumn = ["Purpose", "Pending Advance", "Refund Amount", "Status"];
    const tableRows = [];
    purposeData.forEach(purpose => {
      const status = purpose.pendingAdvance > 0 ? "Pending" : "Settled";
      tableRows.push([
        purpose.purposeName,
        purpose.pendingAdvance.toLocaleString("en-IN"),
        purpose.billAmount.toLocaleString("en-IN"),
        status
      ]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: selectedEmpOption ? 20 : 10,
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: "bold"
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      }
    });

    doc.save("Staff_Report.pdf");
  };

  const exportCSV = () => {
    let extraRow = [];

    if (selectedEmpOption) {
      const { label } = selectedEmpOption;
      extraRow = [[`Employee - ${label}`]];
    }

    const headers = ["Purpose", "Pending Advance", "Refund Amount", "Status"];
    const rows = purposeData.map(purpose => [
      purpose.purposeName,
      purpose.pendingAdvance,
      purpose.billAmount,
      purpose.pendingAdvance > 0 ? "Pending" : "Settled"
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Staff_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPurposePDF = () => {
    const doc = new jsPDF();

    if (selectedPurposeOption) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Purpose - ${selectedPurposeOption.label}`, 14, 15);
    }

    const tableColumn = ["Employee Name", "Pending Advance", "Refund Amount", "Status"];
    const tableRows = [];

    purposeDetails.forEach(d => {
      const status = d.pendingAdvance > 0 ? "Pending" : "Settled";
      tableRows.push([
        d.name,
        d.pendingAdvance.toLocaleString("en-IN"),
        d.billAmount.toLocaleString("en-IN"),
        status
      ]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: selectedPurposeOption ? 20 : 10,
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: "bold"
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      }
    });

    doc.save("Purpose_Report.pdf");
  };

  const exportPurposeCSV = () => {
    let extraRow = [];

    if (selectedPurposeOption) {
      extraRow = [[`Purpose - ${selectedPurposeOption.label}`]];
    }

    const headers = ["Employee Name", "Pending Advance", "Refund Amount", "Status"];
    const rows = purposeDetails.map(d => [
      d.name,
      d.pendingAdvance,
      d.billAmount,
      d.pendingAdvance > 0 ? "Pending" : "Settled"
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Purpose_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Popup sorting handlers
  const handlePurposePopupSort = (key) => {
    let direction = 'asc';
    if (purposePopupSortConfig.key === key && purposePopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setPurposePopupSortConfig({ key, direction });
  };

  const handleEmployeePopupSort = (key) => {
    let direction = 'asc';
    if (employeePopupSortConfig.key === key && employeePopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setEmployeePopupSortConfig({ key, direction });
  };

  const handleBillStatusPopupSort = (key) => {
    let direction = 'asc';
    if (billStatusPopupSortConfig.key === key && billStatusPopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setBillStatusPopupSortConfig({ key, direction });
  };

  // Sort popup data
  const sortPopupData = (data, config) => {
    if (!data || data.length === 0) return [];

    // Helper function to parse date string (DD/MM/YYYY) to Date object
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };

    // Default: Sort by date in descending order (newest/most recent date first)
    if (!config.key) {
      return [...data].sort((a, b) => {
        const aDate = parseDate(a.date);
        const bDate = parseDate(b.date);
        return bDate - aDate; // Descending order: most recent date first
      });
    }

    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];

      // Handle date sorting
      if (config.key === 'date') {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
        return config.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      // Handle numeric sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string sorting
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Export Popup PDF
  const exportPopupPDF = (data, title, context, isPurposePopup) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(context, 14, 15);
    doc.setFontSize(10);
    doc.text(title, 14, 22);

    const tableColumn = ["Date", "Type", "Amount"];
    const tableRows = [];
    data.forEach(entry => {
      tableRows.push([
        entry.date,
        entry.type || "-",
        Math.abs(entry.amount).toLocaleString("en-IN")
      ]);
    });

    // Add total row
    // For refund details, all amounts should subtract (use absolute value)
    const total = data.reduce((sum, item) => sum + Math.abs(item.amount), 0);
    tableRows.push(["Total", "", total.toLocaleString("en-IN")]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: 28,
      headStyles: {
        fillColor: [255, 255, 255],
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: "bold"
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      columnStyles: {
        2: { halign: 'right' }  // Amount column
      },
      didParseCell: function (data) {
        // Make the total row bold
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [255, 255, 255];
        }
      }
    });

    const fileName = `${context.replace(/[^a-z0-9]/gi, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(fileName);
  };

  // Export Popup CSV
  const exportPopupCSV = (data, title, context, isPurposePopup) => {
    const extraRow = [[context], [title], []];

    const headers = ["Date", "Type", "Amount"];
    const rows = data.map(entry => [
      entry.date,
      entry.type || "-",
      Math.abs(entry.amount)
    ]);
    // Add total row
    // For refund details, all amounts should subtract (use absolute value)
    const total = data.reduce((sum, item) => sum + Math.abs(item.amount), 0);
    rows.push(["Total", "", total]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const fileName = `${context.replace(/[^a-z0-9]/gi, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Bill Status Popup PDF
  const exportBillStatusPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(billStatusPopupContext, 14, 15);
    doc.setFontSize(10);
    doc.text("Bill Status Details", 14, 22);

    const tableColumn = ["Date", "Advance Amount", "Refund Amount"];
    const tableRows = [];

    // Prepare data - show each transaction individually
    const combinedData = [];
    // Add each advance as a separate row
    billStatusPopupData.advances.forEach((adv, index) => {
      combinedData.push({
        date: adv.date,
        advanceAmount: adv.amount,
        refundAmount: 0,
        sortKey: `advance-${index}`
      });
    });
    // Add each refund as a separate row
    billStatusPopupData.refunds.forEach((ref, index) => {
      combinedData.push({
        date: ref.date,
        advanceAmount: 0,
        refundAmount: ref.amount,
        sortKey: `refund-${index}`
      });
    });

    // Sort by date (newest first)
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };

    if (!billStatusPopupSortConfig.key) {
      combinedData.sort((a, b) => {
        const dateDiff = parseDate(b.date) - parseDate(a.date);
        if (dateDiff !== 0) return dateDiff;
        // Secondary sort by sortKey to maintain order when dates are equal
        return a.sortKey.localeCompare(b.sortKey);
      });
    } else {
      combinedData.sort((a, b) => {
        let aValue = a[billStatusPopupSortConfig.key];
        let bValue = b[billStatusPopupSortConfig.key];

        if (billStatusPopupSortConfig.key === 'date') {
          aValue = parseDate(aValue);
          bValue = parseDate(bValue);
          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          if (primarySort !== 0) return primarySort;
          // Secondary sort by sortKey when dates are equal
          return a.sortKey.localeCompare(b.sortKey);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          if (primarySort !== 0) return primarySort;
          // Secondary sort by date when amounts are equal
          return parseDate(b.date) - parseDate(a.date);
        }

        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        if (aValue < bValue) return billStatusPopupSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return billStatusPopupSortConfig.direction === 'asc' ? 1 : -1;
        // Secondary sort by date when values are equal
        return parseDate(b.date) - parseDate(a.date);
      });
    }

    combinedData.forEach(entry => {
      tableRows.push([
        entry.date,
        entry.advanceAmount !== 0 ? entry.advanceAmount.toLocaleString("en-IN") : "-",
        entry.refundAmount !== 0 ? entry.refundAmount.toLocaleString("en-IN") : "-"
      ]);
    });

    // Add total row
    const totalAdvance = billStatusPopupData.advances.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      // If amount is negative, it will subtract automatically
      return sum + amount;
    }, 0);
    const totalRefund = billStatusPopupData.refunds.reduce((sum, item) => {
      const refund = parseFloat(item.amount) || 0;
      // All refund amounts should subtract from advance (use absolute value)
      // If refund is -500, subtract 500; if refund is 100, subtract 100
      return sum + Math.abs(refund);
    }, 0);
    tableRows.push(["Total", totalAdvance.toLocaleString("en-IN"), totalRefund.toLocaleString("en-IN")]);

    // Add balance row
    // Balance = totalAdvance - totalRefund (all refunds subtract)
    const balance = totalAdvance - totalRefund;
    tableRows.push(["Balance Advance", "", balance.toLocaleString("en-IN")]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: 28,
      headStyles: {
        fillColor: [255, 255, 255],
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: "bold"
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      columnStyles: {
        1: { halign: 'right' }, // Advance Amount
        2: { halign: 'right' }  // Refund Amount
      },
      didParseCell: function (data) {
        // Make the total and balance rows bold
        if (data.row.index === tableRows.length - 2 || data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          if (data.row.index === tableRows.length - 1) {
            data.cell.styles.fillColor = [191, 152, 83]; // Gold color for balance
            data.cell.styles.textColor = [255, 255, 255]; // White text
          } else {
            data.cell.styles.fillColor = [248, 241, 229]; // Light beige for total
          }
        }
      }
    });

    const fileName = `${billStatusPopupContext.replace(/[^a-z0-9]/gi, '_')}_Bill_Status.pdf`;
    doc.save(fileName);
  };

  // Export Bill Status Popup CSV
  const exportBillStatusCSV = () => {
    const extraRow = [[billStatusPopupContext], ["Bill Status Details"], []];

    const headers = ["Date", "Advance Amount", "Refund Amount"];

    // Prepare data - show each transaction individually
    const combinedData = [];
    // Add each advance as a separate row
    billStatusPopupData.advances.forEach((adv, index) => {
      combinedData.push({
        date: adv.date,
        advanceAmount: adv.amount,
        refundAmount: 0,
        sortKey: `advance-${index}`
      });
    });
    // Add each refund as a separate row
    billStatusPopupData.refunds.forEach((ref, index) => {
      combinedData.push({
        date: ref.date,
        advanceAmount: 0,
        refundAmount: ref.amount,
        sortKey: `refund-${index}`
      });
    });

    // Sort by date (newest first)
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };

    if (!billStatusPopupSortConfig.key) {
      combinedData.sort((a, b) => {
        const dateDiff = parseDate(b.date) - parseDate(a.date);
        if (dateDiff !== 0) return dateDiff;
        // Secondary sort by sortKey to maintain order when dates are equal
        return a.sortKey.localeCompare(b.sortKey);
      });
    } else {
      combinedData.sort((a, b) => {
        let aValue = a[billStatusPopupSortConfig.key];
        let bValue = b[billStatusPopupSortConfig.key];

        if (billStatusPopupSortConfig.key === 'date') {
          aValue = parseDate(aValue);
          bValue = parseDate(bValue);
          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          if (primarySort !== 0) return primarySort;
          // Secondary sort by sortKey when dates are equal
          return a.sortKey.localeCompare(b.sortKey);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          if (primarySort !== 0) return primarySort;
          // Secondary sort by date when amounts are equal
          return parseDate(b.date) - parseDate(a.date);
        }

        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        if (aValue < bValue) return billStatusPopupSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return billStatusPopupSortConfig.direction === 'asc' ? 1 : -1;
        // Secondary sort by date when values are equal
        return parseDate(b.date) - parseDate(a.date);
      });
    }

    const rows = combinedData.map(entry => [
      entry.date,
      entry.advanceAmount !== 0 ? entry.advanceAmount : "-",
      entry.refundAmount !== 0 ? entry.refundAmount : "-"
    ]);

    // Add total row
    const totalAdvance = billStatusPopupData.advances.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      // If amount is negative, it will subtract automatically
      return sum + amount;
    }, 0);
    const totalRefund = billStatusPopupData.refunds.reduce((sum, item) => {
      const refund = parseFloat(item.amount) || 0;
      // All refund amounts should subtract from advance (use absolute value)
      // If refund is -500, subtract 500; if refund is 100, subtract 100
      return sum + Math.abs(refund);
    }, 0);
    rows.push(["Total", totalAdvance, totalRefund]);

    // Add balance row
    // Balance = totalAdvance - totalRefund (all refunds subtract)
    const balance = totalAdvance - totalRefund;
    rows.push(["Balance Advance", "", balance]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const fileName = `${billStatusPopupContext.replace(/[^a-z0-9]/gi, '_')}_Bill_Status.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className=" bg-[#FAF6ED]">
      <div className="max-w-[1850px] ml-10 mr-10">
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
          {/* Responsive layout that adapts to screen size */}
          <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 text-left">
            {/* Employee Section */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">Employee Name</label>
                  <Select
                    options={staffAdvanceCombinedOptions}
                    value={selectedEmpOption}
                    onChange={(selectedOption) => {
                      setSelectedEmpOption(selectedOption);
                    }}
                    className="w-full max-w-xs sm:max-w-sm h-[40px] sm:h-[45px] rounded-lg focus:outline-none"
                    isClearable
                    menuPortalTarget={document.body}
                    styles={customStyles}
                  />
                </div>
                <div className="flex flex-col text-right border-2 border-[#E4572E] border-opacity-25 p-2 sm:p-3 rounded-lg bg-orange-50 min-w-0">
                  <span className="text-xs sm:text-sm font-medium">
                    Pending Advance:{" "}
                    <b className="text-red-500">
                      {totalPendingAdvance !== 0 ? totalPendingAdvance.toLocaleString("en-IN") : "0"}
                    </b>
                  </span>
                  <span className="text-xs sm:text-sm">
                    Total Refund:{" "}
                    {totalBillAmount !== 0 ? totalBillAmount.toLocaleString("en-IN") : "0"}
                  </span>
                </div>
              </div>              
              <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm justify-end mb-4">
                <button onClick={exportPDF} className="flex items-center font-bold hover:underline gap-1 text-[#E4572E] px-2 sm:px-3 py-1 rounded hover:bg-orange-50 text-xs sm:text-sm">Export PDF</button>
                <button onClick={exportCSV} className="flex items-center font-bold hover:underline gap-1 text-[#007233] px-2 sm:px-3 py-1 rounded hover:bg-green-50 text-xs sm:text-sm">Export XL</button>
                <button className="flex items-center font-bold hover:underline gap-1 text-[#BF9853] px-2 sm:px-3 py-1 rounded hover:bg-yellow-50 text-xs sm:text-sm">Print</button>
              </div>              
              <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[500px] sm:min-w-[600px] lg:min-w-[700px] max-h-[500px]">
                    <thead>
                      <tr className="bg-[#f8f1e5] text-left">
                        <th
                          className="p-2 sm:p-3 cursor-pointer hover:bg-gray-200 font-semibold text-gray-700 text-xs sm:text-sm"
                          onClick={() => handleSort('purposeName')}
                        >
                          Purpose
                          {sortConfig.key === 'purposeName' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th
                          className="p-2 sm:p-3 cursor-pointer hover:bg-gray-200 font-semibold text-gray-700 text-xs sm:text-sm"
                          onClick={() => handleSort('pendingAdvance')}
                        >
                          Advance
                          {sortConfig.key === 'pendingAdvance' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th
                          className="p-2 sm:p-3 cursor-pointer hover:bg-gray-200 font-semibold text-gray-700 text-xs sm:text-sm"
                          onClick={() => handleSort('billAmount')}
                        >
                          Refund Amount
                          {sortConfig.key === 'billAmount' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th
                          className="p-2 sm:p-3 cursor-pointer hover:bg-gray-200 font-semibold text-gray-700 text-xs sm:text-sm"
                          onClick={() => handleSort('billStatus')}
                        >
                          Status
                          {sortConfig.key === 'billStatus' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortData(purposeData, sortConfig, 'pendingAdvance', 'purposeName').length > 0 ? (
                        sortData(purposeData, sortConfig, 'pendingAdvance', 'purposeName').map((purpose, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#FAF6ED] hover:bg-gray-50"}>
                            <td className="py-2 px-2 sm:py-3 sm:px-3 text-left font-medium text-xs sm:text-sm">{purpose.purposeName}</td>
                            <td
                              className="py-2 px-2 sm:py-3 sm:px-3 cursor-pointer relative font-mono text-xs sm:text-sm"
                              onMouseEnter={(e) => handlePurposeAdvanceMouseEnter(e, purpose.purposeId, selectedEmpOption?.id, selectedEmpOption?.type)}
                              onMouseLeave={handlePurposeMouseLeave}
                              onClick={() => handlePurposeAdvanceClick(purpose.purposeId, selectedEmpOption?.id, selectedEmpOption?.type, purpose.purposeName)}
                            >
                              {purpose.pendingAdvance.toLocaleString("en-IN")}
                            </td>
                            <td
                              className="py-2 px-2 sm:py-3 sm:px-3 cursor-pointer relative font-mono text-xs sm:text-sm"
                              onMouseEnter={(e) => handlePurposeRefundMouseEnter(e, purpose.purposeId, selectedEmpOption?.id, selectedEmpOption?.type)}
                              onMouseLeave={handlePurposeMouseLeave}
                              onClick={() => handlePurposeRefundClick(purpose.purposeId, selectedEmpOption?.id, selectedEmpOption?.type, purpose.purposeName)}
                            >
                              {purpose.billAmount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-2 sm:py-3 sm:px-3 cursor-pointer"
                              onClick={() => handlePurposeBillStatusClick(purpose.purposeId, selectedEmpOption?.id, selectedEmpOption?.type, purpose.purposeName)}
                            >
                              <span 
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  purpose.pendingAdvance > 0 
                                    ? "text-[#E4572E]" 
                                    : "text-green-800"
                                }`}
                              >
                                {purpose.pendingAdvance > 0 ? "Pending" : "Settled"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center p-8 text-gray-500">No data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Purpose Section */}
            <div className="flex-1 min-w-0 xl:ml-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">Purpose</label>
                  <Select
                    options={purposeOptions || []}
                    placeholder="Select a purpose..."
                    isSearchable={true}
                    value={selectedPurposeOption}
                    onChange={setSelectedPurposeOption}
                    styles={customStyles}
                    isClearable
                    menuPortalTarget={document.body}
                    className="w-full max-w-xs sm:max-w-sm h-[40px] sm:h-[45px] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col text-right border-2 border-[#E4572E] border-opacity-25 p-2 sm:p-3 rounded-lg bg-orange-50 min-w-0">
                  <span className="text-xs sm:text-sm font-medium">
                    Pending Advance: <b className="text-[#E4572E]">{purposePendingAdvance.toLocaleString("en-IN")}</b>
                  </span>
                  <span className="text-xs sm:text-sm">Total Refund: {purposeBillAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm justify-end mb-4">
                <button onClick={exportPurposePDF} className="flex items-center gap-1 font-bold hover:underline text-[#E4572E] px-2 sm:px-3 py-1 rounded hover:bg-orange-50 text-xs sm:text-sm">Export PDF</button>
                <button onClick={exportPurposeCSV} className="flex items-center gap-1 font-bold hover:underline text-[#007233] px-2 sm:px-3 py-1 rounded hover:bg-green-50 text-xs sm:text-sm">Export XL</button>
                <button className="flex items-center gap-1 font-bold hover:underline text-[#BF9853] px-2 sm:px-3 py-1 rounded hover:bg-yellow-50 text-xs sm:text-sm">Print</button>
              </div>

              <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[500px] sm:min-w-[600px] lg:min-w-[700px] max-h-[500px]">
                    <thead>
                      <tr className="bg-[#f8f1e5] text-left">
                        <th
                          className="p-2 sm:p-3 cursor-pointer hover:bg-gray-200 font-semibold text-gray-700 text-xs sm:text-sm"
                          onClick={() => handlePurposeSort('name')}
                        >
                          Employee Name
                          {purposeSortConfig.key === 'name' && (
                            <span className="ml-1">{purposeSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th
                          className="p-2 sm:p-3 cursor-pointer hover:bg-gray-200 font-semibold text-gray-700 text-xs sm:text-sm"
                          onClick={() => handlePurposeSort('pendingAdvance')}
                        >
                          Advance
                          {purposeSortConfig.key === 'pendingAdvance' && (
                            <span className="ml-1">{purposeSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th
                          className="p-2 sm:p-3 cursor-pointer hover:bg-gray-200 font-semibold text-gray-700 text-xs sm:text-sm"
                          onClick={() => handlePurposeSort('billAmount')}
                        >
                          Refund Amount
                          {purposeSortConfig.key === 'billAmount' && (
                            <span className="ml-1">{purposeSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th
                          className="p-2 sm:p-3 cursor-pointer hover:bg-gray-200 font-semibold text-gray-700 text-xs sm:text-sm"
                          onClick={() => handlePurposeSort('billStatus')}
                        >
                          Status
                          {purposeSortConfig.key === 'billStatus' && (
                            <span className="ml-1">{purposeSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortData(purposeDetails, purposeSortConfig).length > 0 ? (
                        sortData(purposeDetails, purposeSortConfig).map((d, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#FAF6ED] hover:bg-gray-50"}>
                            <td className="py-2 px-2 sm:py-3 sm:px-3 font-medium text-xs sm:text-sm">{d.name}</td>
                            <td
                              className="py-2 px-2 sm:py-3 sm:px-3 cursor-pointer relative font-mono text-xs sm:text-sm"
                              onMouseEnter={(e) => handleEmployeeAdvanceMouseEnter(e, selectedPurposeOption?.id, d.empId, d.empType)}
                              onMouseLeave={handleEmployeeMouseLeave}
                              onClick={() => handleEmployeeAdvanceClick(selectedPurposeOption?.id, d.empId, d.empType, d.name)}
                            >
                              {d.pendingAdvance.toLocaleString("en-IN")}
                            </td>
                            <td
                              className="py-2 px-2 sm:py-3 sm:px-3 cursor-pointer relative font-mono text-xs sm:text-sm"
                              onMouseEnter={(e) => handleEmployeeRefundMouseEnter(e, selectedPurposeOption?.id, d.empId, d.empType)}
                              onMouseLeave={handleEmployeeMouseLeave}
                              onClick={() => handleEmployeeRefundClick(selectedPurposeOption?.id, d.empId, d.empType, d.name)}
                            >
                              {d.billAmount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-2 sm:py-3 sm:px-3 cursor-pointer"
                              onClick={() => handleEmployeeBillStatusClick(selectedPurposeOption?.id, d.empId, d.empType, d.name)}
                            >
                              <span 
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  d.pendingAdvance > 0 
                                    ? "text-[#E4572E]" 
                                    : "text-green-800"
                                }`}
                              >
                                {d.pendingAdvance > 0 ? "Pending" : "Settled"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center p-8 text-gray-500">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip Component for Purpose Table */}
      {purposeTooltipData && (
        <div
          className="fixed z-50 bg-white text-black p-3 rounded shadow-lg text-sm max-w-xs"
          style={{ left: purposeTooltipPosition.x + 10, top: purposeTooltipPosition.y - 10, pointerEvents: 'none' }}
        >
          <div className="font-semibold mb-2">{purposeTooltipTitle || 'Details'}:</div>
          {purposeTooltipData
            .slice()
            .reverse()
            .map((entry, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-600">{entry.date}:</span>
                <span className="ml-2">
                  ₹{Math.abs(entry.amount).toLocaleString('en-IN')}
                </span>
                {entry.type && (
                  <div className="text-xs text-gray-500 ml-2">({entry.type})</div>
                )}
              </div>
            ))}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <span className="font-semibold">
              Total: ₹
              {purposeTooltipData
                .reduce((sum, item) => sum + Math.abs(item.amount), 0)
                .toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* Tooltip Component for Employee Table */}
      {employeeTooltipData && (
        <div
          className="fixed z-50 bg-white text-black p-3 rounded shadow-lg text-sm max-w-xs"
          style={{ left: employeeTooltipPosition.x + 10, top: employeeTooltipPosition.y - 10, pointerEvents: 'none' }}
        >
          <div className="font-semibold mb-2">{employeeTooltipTitle || 'Details'}:</div>
          {employeeTooltipData
            .slice()
            .reverse()
            .map((entry, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-600">{entry.date}:</span>
                <span className="ml-2">
                  ₹{Math.abs(entry.amount).toLocaleString('en-IN')}
                </span>
                {entry.type && (
                  <div className="text-xs text-gray-500 ml-2">({entry.type})</div>
                )}
              </div>
            ))}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <span className="font-semibold">
              Total: ₹
              {employeeTooltipData
                .reduce((sum, item) => sum + Math.abs(item.amount), 0)
                .toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* Purpose Popup Modal */}
      {showPurposePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPurposePopup(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-[#BF9853]">{purposePopupContext}</h3>
                <p className="text-sm text-gray-600 mt-1">{purposePopupTitle}</p>
              </div>
              <button onClick={() => setShowPurposePopup(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex gap-3 text-sm justify-end mb-3">
              <button
                onClick={() => exportPopupPDF(sortPopupData(purposePopupData, purposePopupSortConfig), purposePopupTitle, purposePopupContext, true)}
                className="flex items-center font-bold hover:underline gap-1 text-[#E4572E]"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportPopupCSV(sortPopupData(purposePopupData, purposePopupSortConfig), purposePopupTitle, purposePopupContext, true)}
                className="flex items-center font-bold hover:underline gap-1 text-[#007233]"
              >
                Export XL
              </button>
            </div>
            <div className="mt-4 border-l-8 border-l-[#BF9853] rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8f1e5]">
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePurposePopupSort('date')}>
                      Date
                      {purposePopupSortConfig.key === 'date' && (
                        <span className="ml-1">{purposePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePurposePopupSort('type')}>
                      Type
                      {purposePopupSortConfig.key === 'type' && (
                        <span className="ml-1">{purposePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePurposePopupSort('amount')}>
                      Amount
                      {purposePopupSortConfig.key === 'amount' && (
                        <span className="ml-1">{purposePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purposePopupData &&
                    sortPopupData(purposePopupData, purposePopupSortConfig)
                      .map((entry, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                          <td className="p-3 text-left">{entry.date}</td>
                          <td className="p-3 text-left text-gray-600">{entry.type || "-"}</td>
                          <td className="p-3 text-right font-semibold">
                            ₹{Math.abs(entry.amount).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#BF9853] text-white font-bold">
                    <td className="p-3 text-left">Total</td>
                    <td></td>
                    <td className="p-3 text-right">
                      ₹{purposePopupData &&
                        purposePopupData
                          .reduce((sum, item) => sum + Math.abs(item.amount), 0)
                          .toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Employee Popup Modal */}
      {showEmployeePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowEmployeePopup(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-[#BF9853]">{employeePopupContext}</h3>
                <p className="text-sm text-gray-600 mt-1">{employeePopupTitle}</p>
              </div>
              <button onClick={() => setShowEmployeePopup(false)} className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none" >
                ×
              </button>
            </div>
            <div className="flex gap-3 text-sm justify-end mb-3">
              <button
                onClick={() => exportPopupPDF(sortPopupData(employeePopupData, employeePopupSortConfig), employeePopupTitle, employeePopupContext, false)}
                className="flex items-center font-bold hover:underline gap-1 text-[#E4572E]"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportPopupCSV(sortPopupData(employeePopupData, employeePopupSortConfig), employeePopupTitle, employeePopupContext, false)}
                className="flex items-center font-bold hover:underline gap-1 text-[#007233]"
              >
                Export XL
              </button>
            </div>
            <div className="mt-4 border-l-8 border-l-[#BF9853] rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8f1e5]">
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200"
                      onClick={() => handleEmployeePopupSort('date')}
                    >
                      Date
                      {employeePopupSortConfig.key === 'date' && (
                        <span className="ml-1">{employeePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200"
                      onClick={() => handleEmployeePopupSort('type')}
                    >
                      Type
                      {employeePopupSortConfig.key === 'type' && (
                        <span className="ml-1">{employeePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200"
                      onClick={() => handleEmployeePopupSort('amount')}
                    >
                      Amount
                      {employeePopupSortConfig.key === 'amount' && (
                        <span className="ml-1">{employeePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employeePopupData &&
                    sortPopupData(employeePopupData, employeePopupSortConfig)
                      .map((entry, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                          <td className="p-3 text-left">{entry.date}</td>
                          <td className="p-3 text-left text-gray-600">{entry.type || "-"}</td>
                          <td className="p-3 text-right font-semibold">
                            ₹{Math.abs(entry.amount).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#BF9853] text-white font-bold">
                    <td className="p-3 text-left">Total</td>
                    <td></td>
                    <td className="p-3 text-right">
                      ₹{employeePopupData &&
                        employeePopupData
                          .reduce((sum, item) => sum + Math.abs(item.amount), 0)
                          .toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bill Status Popup Modal */}
      {showBillStatusPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowBillStatusPopup(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-5xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-[#BF9853]">{billStatusPopupContext}</h3>
                <p className="text-sm text-gray-600 mt-1">Bill Status Details</p>
              </div>
              <button onClick={() => setShowBillStatusPopup(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex gap-3 text-sm justify-end mb-3">
              <button
                onClick={exportBillStatusPDF}
                className="flex items-center font-bold hover:underline gap-1 text-[#E4572E]"
              >
                Export PDF
              </button>
              <button
                onClick={exportBillStatusCSV}
                className="flex items-center font-bold hover:underline gap-1 text-[#007233]"
              >
                Export XL
              </button>
            </div>
            <div className="mt-4 border-l-8 border-l-[#BF9853] rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8f1e5]">
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleBillStatusPopupSort('date')}>
                      Date
                      {billStatusPopupSortConfig.key === 'date' && (
                        <span className="ml-1">{billStatusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleBillStatusPopupSort('advanceAmount')}>
                      Advance Amount
                      {billStatusPopupSortConfig.key === 'advanceAmount' && (
                        <span className="ml-1">{billStatusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleBillStatusPopupSort('refundAmount')}>
                      Refund Amount
                      {billStatusPopupSortConfig.key === 'refundAmount' && (
                        <span className="ml-1">{billStatusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const combinedData = [];
                    // Add each advance as a separate row
                    billStatusPopupData.advances.forEach((adv, index) => {
                      combinedData.push({
                        date: adv.date,
                        advanceAmount: adv.amount,
                        refundAmount: 0,
                        sortKey: `advance-${index}`
                      });
                    });
                    // Add each refund as a separate row
                    billStatusPopupData.refunds.forEach((ref, index) => {
                      combinedData.push({
                        date: ref.date,
                        advanceAmount: 0,
                        refundAmount: ref.amount,
                        sortKey: `refund-${index}`
                      });
                    });
                    const parseDate = (dateStr) => {
                      const [day, month, year] = dateStr.split('/');
                      return new Date(`${year}-${month}-${day}`);
                    };
                    if (!billStatusPopupSortConfig.key) {
                      combinedData.sort((a, b) => {
                        const dateDiff = parseDate(b.date) - parseDate(a.date);
                        if (dateDiff !== 0) return dateDiff;
                        // Secondary sort by sortKey to maintain order when dates are equal
                        return a.sortKey.localeCompare(b.sortKey);
                      });
                    } else {
                      combinedData.sort((a, b) => {
                        let aValue = a[billStatusPopupSortConfig.key];
                        let bValue = b[billStatusPopupSortConfig.key];
                        if (billStatusPopupSortConfig.key === 'date') {
                          aValue = parseDate(aValue);
                          bValue = parseDate(bValue);
                          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                          if (primarySort !== 0) return primarySort;
                          // Secondary sort by sortKey when dates are equal
                          return a.sortKey.localeCompare(b.sortKey);
                        }
                        if (typeof aValue === 'number' && typeof bValue === 'number') {
                          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                          if (primarySort !== 0) return primarySort;
                          // Secondary sort by date when amounts are equal
                          return parseDate(b.date) - parseDate(a.date);
                        }
                        aValue = String(aValue || '').toLowerCase();
                        bValue = String(bValue || '').toLowerCase();
                        if (aValue < bValue) return billStatusPopupSortConfig.direction === 'asc' ? -1 : 1;
                        if (aValue > bValue) return billStatusPopupSortConfig.direction === 'asc' ? 1 : -1;
                        // Secondary sort by date when values are equal
                        return parseDate(b.date) - parseDate(a.date);
                      });
                    }

                    return combinedData.map((entry, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                        <td className="p-3 text-left">{entry.date}</td>
                        <td className={`p-3 text-right font-semibold ${entry.advanceAmount < 0 ? 'text-red-600' : ''}`}>
                          {entry.advanceAmount !== 0 ? `₹${entry.advanceAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className={`p-3 text-right font-semibold ${entry.refundAmount < 0 ? 'text-red-600' : ''}`}>
                          {entry.refundAmount !== 0 ? `₹${entry.refundAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f8f1e5] font-bold">
                    <td className="p-3 text-left">Total</td>
                    <td className="p-3 text-right">
                      ₹{billStatusPopupData.advances.reduce((sum, item) => {
                        const amount = parseFloat(item.amount) || 0;
                        // If amount is negative, it will subtract automatically
                        return sum + amount;
                      }, 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right">
                      ₹{billStatusPopupData.refunds.reduce((sum, item) => {
                        const refund = parseFloat(item.amount) || 0;
                        // All refund amounts should subtract from advance (use absolute value)
                        // If refund is -500, subtract 500; if refund is 100, subtract 100
                        return sum + Math.abs(refund);
                      }, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-[#BF9853] text-white font-bold">
                    <td className="p-3 text-left" colSpan="2">
                      Balance Advance
                    </td>
                    <td className="p-3 text-right">
                      ₹{(() => {
                        const totalAdvance = billStatusPopupData.advances.reduce((sum, item) => {
                          const amount = parseFloat(item.amount) || 0;
                          return sum + amount;
                        }, 0);
                        const totalRefund = billStatusPopupData.refunds.reduce((sum, item) => {
                          const refund = parseFloat(item.amount) || 0;
                          // All refund amounts should subtract from advance (use absolute value)
                          return sum + Math.abs(refund);
                        }, 0);
                        // Balance = totalAdvance - totalRefund (all refunds subtract)
                        return (totalAdvance - totalRefund).toLocaleString('en-IN');
                      })()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffSummary