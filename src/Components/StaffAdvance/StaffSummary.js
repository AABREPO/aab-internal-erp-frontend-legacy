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
  // Tooltip state
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipTitle, setTooltipTitle] = useState("");
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
      lineHeight: '20px',
      fontSize: '14px',
      height: '45px',
      borderRadius: '8px',
      borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.3)' : 'rgba(191, 152, 83, 0.3)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.3)' : 'none',
    }),
    clearIndicator: (provided) => ({
      ...provided,
      cursor: 'pointer',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      maxHeight: '300px',
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '250px',
      overflowY: 'auto',
    }),
    singleValue: (provided) => ({
      ...provided,
      fontWeight: '500',
      color: 'black',
      textAlign: 'left',
    }),
    option: (provided, state) => ({
      ...provided,
      fontWeight: '500',
      backgroundColor: state.isSelected
        ? 'rgba(191, 152, 83, 0.3)'
        : state.isFocused
          ? 'rgba(191, 152, 83, 0.1)'
          : 'white',
      color: 'black',
      textAlign: 'left',
    }),
    input: (provided) => ({
      ...provided,
      fontWeight: '500',
      color: 'black',
      textAlign: 'left',
    }),
    placeholder: (provided) => ({
      ...provided,
      fontWeight: '500',
      color: '#999',
      textAlign: 'left',
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
          // Negative amount means money going out from from_purpose_id
          // Positive amount means money coming in to from_purpose_id
          if (from_purpose_id) {
            if (!grouped[from_purpose_id]) {
              grouped[from_purpose_id] = {
                purposeName: purposeOptions.find(p => String(p.id) === String(from_purpose_id))?.label || "-",
                purposeId: from_purpose_id,
                totalAdvance: 0,
                totalRefund: 0
              };
            }
            grouped[from_purpose_id].totalAdvance += parseFloat(amount) || 0; // Amount already has correct sign
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
          // For advance entries, amount is positive
          if (curr.type === 'Advance') {
            grouped[from_purpose_id].totalAdvance += parseFloat(amount) || 0;
          }
          // For refund entries, subtract the refund amount
          if (curr.type === 'Refund') {
            grouped[from_purpose_id].totalRefund += parseFloat(staff_refund_amount) || 0;
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
      // Handle regular refunds
      if (item.type === 'Refund' && item.from_purpose_id === purposeId && item.staff_refund_amount > 0) {
        return true;
      }
      // Handle transfers where this purpose is the source (negative amount)
      if (item.type === 'Transfer' && item.from_purpose_id === purposeId && item.amount < 0) {
        return true;
      }
      return false;
    }).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: item.type === 'Transfer' ? parseFloat(item.amount) || 0 : parseFloat(item.staff_refund_amount) || 0,
      type: item.type === 'Transfer' ? 'Transfer Out' : 'Refund'
    }));
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
      // Handle regular advances
      if (item.type === 'Advance' && item.from_purpose_id === purposeId && item.amount > 0) {
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
  // Tooltip handlers
  const handleMouseEnter = (event, purposeId, empId, empType) => {
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    if (refundDetails.length > 0) {
      setTooltipTitle('Refund Details');
      setTooltipData(refundDetails);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  const handleMouseLeave = () => {
    setTooltipData(null);
    setTooltipTitle("");
  };
  const handleMouseEnterAdvance = (event, purposeId, empId, empType) => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    if (advanceDetails.length > 0) {
      setTooltipTitle('Advance Details');
      setTooltipData(advanceDetails);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
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
            grouped[personId].totalAdvance += parseFloat(amount) || 0; // Amount already has correct sign
          }
        } else {
          // Handle non-transfer transactions (Advance and Refund)
          // For advance entries, amount is positive
          if (curr.type === 'Advance') {
            grouped[personId].totalAdvance += parseFloat(amount) || 0;
          }
          // For refund entries, subtract the refund amount
          if (curr.type === 'Refund') {
            grouped[personId].totalRefund += parseFloat(staff_refund_amount) || 0;
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
                              className="py-2 px-2 sm:py-3 sm:px-3 cursor-help relative font-mono text-xs sm:text-sm"
                              onMouseEnter={(e) => handleMouseEnterAdvance(e, purpose.purposeId, selectedEmpOption?.id, selectedEmpOption?.type)}
                              onMouseLeave={handleMouseLeave}
                            >
                              {purpose.pendingAdvance.toLocaleString("en-IN")}
                            </td>
                            <td
                              className="py-2 px-2 sm:py-3 sm:px-3 cursor-help relative font-mono text-xs sm:text-sm"
                              onMouseEnter={(e) => handleMouseEnter(e, purpose.purposeId, selectedEmpOption?.id, selectedEmpOption?.type)}
                              onMouseLeave={handleMouseLeave}
                            >
                              {purpose.billAmount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-2 sm:py-3 sm:px-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${purpose.pendingAdvance > 0
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
                              className="py-2 px-2 sm:py-3 sm:px-3 cursor-help relative font-mono text-xs sm:text-sm"
                              onMouseEnter={(e) => handleMouseEnterAdvance(e, selectedPurposeOption?.id, d.empId, d.empType)}
                              onMouseLeave={handleMouseLeave}
                            >
                              {d.pendingAdvance.toLocaleString("en-IN")}
                            </td>
                            <td
                              className="py-2 px-2 sm:py-3 sm:px-3 cursor-help relative font-mono text-xs sm:text-sm"
                              onMouseEnter={(e) => handleMouseEnter(e, selectedPurposeOption?.id, d.empId, d.empType)}
                              onMouseLeave={handleMouseLeave}
                            >
                              {d.billAmount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-2 sm:py-3 sm:px-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${d.pendingAdvance > 0
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

      {/* Enhanced Tooltip Component */}
      {tooltipData && (
        <div
          className="fixed z-50 bg-white text-black p-4 rounded-lg shadow-xl border border-gray-200 text-sm max-w-sm"
          style={{
            left: Math.min(tooltipPosition.x + 10, window.innerWidth - 320),
            top: Math.max(tooltipPosition.y - 10, 10),
            pointerEvents: 'none',
            transform: tooltipPosition.x > window.innerWidth - 320 ? 'translateX(-100%)' : 'none'
          }}
        >
          <div className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">
            {tooltipTitle || 'Details'}
          </div>
          <div className="max-h-48 overflow-y-auto">
            {tooltipData.map((entry, index) => (
              <div key={index} className="mb-2 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-gray-600 text-xs">{entry.date}</span>
                  {entry.type && <span className="text-xs text-blue-600 font-medium">{entry.type}</span>}
                </div>
                <span className="font-mono font-semibold">₹{entry.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Total:</span>
            <span className="font-mono font-bold text-lg">₹{tooltipData.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffSummary