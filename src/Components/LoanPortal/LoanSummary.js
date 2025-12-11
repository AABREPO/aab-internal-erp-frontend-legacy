import React, { useState, useEffect, useMemo } from "react";
import Select from 'react-select';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

const LoanSummary = () => {
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [labourOptions, setLabourOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [selectedAssociate, setSelectedAssociate] = useState(null);
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [tooltipData, setTooltipData] = useState([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipTitle, setTooltipTitle] = useState("");
  const [pendingAdvanceAssociate, setPendingAdvanceAssociate] = useState(0);
  const [pendingAdvancePurpose, setPendingAdvancePurpose] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [purposeSortConfig, setPurposeSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Popup/Modal state for Associate panel (Left Panel)
  const [associatePopupData, setAssociatePopupData] = useState(null);
  const [associatePopupTitle, setAssociatePopupTitle] = useState("");
  const [associatePopupContext, setAssociatePopupContext] = useState("");
  const [showAssociatePopup, setShowAssociatePopup] = useState(false);
  const [associatePopupSortConfig, setAssociatePopupSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Popup/Modal state for Purpose panel (Right Panel)
  const [purposePopupData, setPurposePopupData] = useState(null);
  const [purposePopupTitle, setPurposePopupTitle] = useState("");
  const [purposePopupContext, setPurposePopupContext] = useState("");
  const [showPurposePopup, setShowPurposePopup] = useState(false);
  const [purposePopupSortConfig, setPurposePopupSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Popup/Modal state for Status popup (combined loan + refund)
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusPopupData, setStatusPopupData] = useState({ loans: [], refunds: [] });
  const [statusPopupContext, setStatusPopupContext] = useState("");
  const [statusPopupSortConfig, setStatusPopupSortConfig] = useState({ key: null, direction: 'asc' });
  const [isStatusFromAssociatePanel, setIsStatusFromAssociatePanel] = useState(true);

  const getPurposeName = (id) => {
    const purpose = purposeOptions.find(p => String(p.id) === String(id));
    return purpose ? purpose.value : "";
  };

  const getAssociateName = (id) => {
    // search in vendorOptions, contractorOptions, employeeOptions, and labourOptions combined
    const assoc = [...vendorOptions, ...contractorOptions, ...employeeOptions, ...labourOptions].find(a => String(a.id) === String(id));
    return assoc ? assoc.value : "";
  };
  
  useEffect(() => {
    setCombinedOptions([...vendorOptions, ...contractorOptions, ...employeeOptions, ...labourOptions]);
  }, [vendorOptions, contractorOptions, employeeOptions, labourOptions]);
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setProgress(10);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error("Failed to fetch vendors");
        const data = await res.json();
        setVendorOptions(
          data.map((item) => ({
            id: item.id,
            value: item.vendorName,
            label: item.vendorName,
            type: "Vendor",
          }))
        );
        setProgress(25);
      } catch (error) {
        console.error(error);
        setError("Failed to load vendor data");
      }
    };
    fetchVendors();
  }, []);
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        setProgress(35);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error("Failed to fetch contractors");
        const data = await res.json();
        setContractorOptions(
          data.map((item) => ({
            id: item.id,
            value: item.contractorName,
            label: item.contractorName,
            type: "Contractor",
          }))
        );
        setProgress(45);
      } catch (error) {
        console.error(error);
        setError("Failed to load contractor data");
      }
    };
    fetchContractors();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setProgress(50);
        const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          id: item.id,
          value: item.employee_name,
          label: item.employee_name,
          type: "Employee",
        }));
        setEmployeeOptions(formattedData);
        setProgress(60);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchLabours = async () => {
      try {
        setProgress(65);
        const response = await fetch("https://backendaab.in/aabuildersDash/api/labours-details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          id: item.id,
          value: item.labour_name,
          label: item.labour_name,
          type: "Labour",
        }));
        setLabourOptions(formattedData);
        setProgress(70);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchLabours();
  }, []);

  useEffect(() => {
    const fetchPurposeOptions = async () => {
      try {
        setProgress(75);
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll', {
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
          id: item.id,
          value: item.purpose,
          label: item.purpose,
          type: 'Purpose'
        }));
        setPurposeOptions(formattedData);
        setProgress(80);
      } catch (error) {
        console.error("Error fetching purpose options: ", error);
        setPurposeOptions([]);
      }
    };
    fetchPurposeOptions();
  }, []);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setProgress(85);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error("Failed to fetch sites");
        const data = await res.json();
        setSiteOptions(
          data.map((item) => ({
            id: item.id,
            value: item.siteName,
            label: item.siteName,
            sNo: item.siteNo,
            type: "Site",
          }))
        );
        setProgress(90);
      } catch (error) {
        console.error(error);
        setError("Failed to load site data");
      }
    };
    fetchSites();
  }, []);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setProgress(90);
        const res = await fetch("https://backendaab.in/aabuildersDash/api/loans/all", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error("Failed to fetch loans");
        const data = await res.json();
        setLoanData(data);
        setProgress(100);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError("Failed to load loan data");
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  useEffect(() => {
    let sum = 0;
    if (!selectedAssociate) {
      setPendingAdvanceAssociate(0);
      return;
    }
    loanData.forEach(e => {
      const assocId = e.vendor_id || e.contractor_id || e.employee_id || e.labour_id;
      if (String(assocId) !== String(selectedAssociate.id)) return;
      if (e.type === "Loan" || e.type === "Transfer") sum += Number(e.amount) || 0;
      else if (e.type === "Refund") sum -= Number(e.loan_refund_amount) || 0;
    });
    setPendingAdvanceAssociate(sum);
  }, [selectedAssociate, loanData]);

  useEffect(() => {
    let sum = 0;
    if (!selectedPurpose) {
      setPendingAdvancePurpose(0);
      return;
    }
    loanData.forEach(e => {
      const purposeId = e.loan_purpose_id || e.from_purpose_id;
      if (String(purposeId) !== String(selectedPurpose.id)) return;
      if (e.type === "Loan" || e.type === "Transfer") sum += Number(e.amount) || 0;
      else if (e.type === "Refund") sum -= Number(e.loan_refund_amount) || 0;
    });
    setPendingAdvancePurpose(sum);
  }, [selectedPurpose, loanData]);

  // Group data for left and right separately
  const summaryByAssociate = useMemo(() => {
    if (!selectedAssociate) return [];
    const map = {};
    loanData.forEach(e => {
      const assocId = e.vendor_id || e.contractor_id || e.employee_id || e.labour_id;
      const purposeId = e.loan_purpose_id || e.from_purpose_id;
      if (!assocId || !purposeId) return;
      if (String(assocId) !== String(selectedAssociate.id)) return;
      const key = `${assocId}-${purposeId}`;
      if (!map[key]) map[key] = { associateId: assocId, purposeId, pendingLoan: 0, refund: 0 };
      if (e.type === "Loan" || e.type === "Transfer") map[key].pendingLoan += Number(e.amount) || 0;
      else if (e.type === "Refund") map[key].refund += Number(e.loan_refund_amount) || 0;
    });
    Object.values(map).forEach(item => item.status = item.pendingLoan > 0 ? "Pending" : "Cleared");
    return Object.values(map);
  }, [loanData, selectedAssociate]);

  const summaryByPurpose = useMemo(() => {
    if (!selectedPurpose) return [];
    const map = {};
    loanData.forEach(e => {
      const assocId = e.vendor_id || e.contractor_id || e.employee_id || e.labour_id;
      const purposeId = e.loan_purpose_id || e.from_purpose_id;
      if (!assocId || !purposeId) return;
      if (String(purposeId) !== String(selectedPurpose.id)) return;
      const key = `${purposeId}-${assocId}`;
      if (!map[key]) map[key] = { purposeId, associateId: assocId, pendingLoan: 0, refund: 0 };
      if (e.type === "Loan" || e.type === "Transfer") map[key].pendingLoan += Number(e.amount) || 0;
      else if (e.type === "Refund") map[key].refund += Number(e.loan_refund_amount) || 0;
    });
    Object.values(map).forEach(item => item.status = item.pendingLoan > 0 ? "Pending" : "Cleared");
    return Object.values(map);
  }, [loanData, selectedPurpose]);


  const showDetailsTooltip = (e, title, filtered) => {
    setTooltipTitle(title);
    setTooltipData(filtered);
    setTooltipPos({ x: e.clientX + 10, y: e.clientY + 10 });
    setTooltipVisible(true);
  };
  const hideTooltip = () => setTooltipVisible(false);

  const handleLoanMouseEnter = (e, associateId, purposeId) => {
    const filtered = loanData.filter(
      x => (x.vendor_id || x.contractor_id || x.employee_id || x.labour_id) === associateId &&
        (x.loan_purpose_id === purposeId || x.from_purpose_id === purposeId) &&
        (x.type === 'Loan' || x.type === 'Transfer')
    );
    showDetailsTooltip(e, 'Loan Details', filtered);
  };

  const handleRefundMouseEnter = (e, associateId, purposeId) => {
    const filtered = loanData.filter(
      x => (x.vendor_id || x.contractor_id || x.employee_id || x.labour_id) === associateId &&
        (x.loan_purpose_id === purposeId || x.from_purpose_id === purposeId) &&
        x.type === "Refund"
    );
    showDetailsTooltip(e, 'Refund Details', filtered);
  };

  // Click handlers for Associate panel (Left Panel) - Opens popup
  const handleAssociateLoanClick = (associateId, purposeId, purposeName) => {
    const loanDetails = loanData.filter(
      x => (x.vendor_id || x.contractor_id || x.employee_id || x.labour_id) === associateId &&
        (x.loan_purpose_id === purposeId || x.from_purpose_id === purposeId) &&
        (x.type === 'Loan' || x.type === 'Transfer')
    ).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.amount) || 0,
      type: item.type,
      mode: item.type === "Transfer" ? "" : (item.loan_payment_mode || ""),
      description: item.description || "",
      transferTo: item.type === "Transfer" ? (item.to_purpose_id ? getPurposeName(item.to_purpose_id) : (item.transfer_Project_id ? siteOptions.find(s => String(s.id) === String(item.transfer_Project_id))?.value || "" : "")) : "",
    }));
    if (loanDetails.length > 0) {
      setAssociatePopupTitle('Loan/Transfer Details');
      setAssociatePopupData(loanDetails);
      const associateName = selectedAssociate ? selectedAssociate.label : "All Associates";
      setAssociatePopupContext(`${associateName} - ${purposeName}`);
      setShowAssociatePopup(true);
    }
  };

  const handleAssociateBalanceClick = (associateId, purposeId, purposeName) => {
    // Get all transactions (loans, transfers, and refunds) that affect the balance
    const allTransactions = loanData.filter(
      x => (x.vendor_id || x.contractor_id || x.employee_id || x.labour_id) === associateId &&
        (x.loan_purpose_id === purposeId || x.from_purpose_id === purposeId) &&
        ((x.type === 'Loan' || x.type === 'Transfer') || x.type === "Refund")
    ).map(item => {
      if (item.type === "Refund") {
        return {
          date: new Date(item.date).toLocaleDateString('en-GB'),
          amount: -(parseFloat(item.loan_refund_amount) || 0), // Negative for refunds
          type: item.type,
          mode: item.loan_payment_mode || "",
          description: item.description || "",
          transferTo: "",
        };
      } else {
        return {
          date: new Date(item.date).toLocaleDateString('en-GB'),
          amount: parseFloat(item.amount) || 0,
          type: item.type,
          mode: item.type === "Transfer" ? "" : (item.loan_payment_mode || ""),
          description: item.description || "",
          transferTo: item.type === "Transfer" ? (item.to_purpose_id ? getPurposeName(item.to_purpose_id) : (item.transfer_Project_id ? siteOptions.find(s => String(s.id) === String(item.transfer_Project_id))?.value || "" : "")) : "",
        };
      }
    });
    if (allTransactions.length > 0) {
      setAssociatePopupTitle('Balance Details');
      setAssociatePopupData(allTransactions);
      const associateName = selectedAssociate ? selectedAssociate.label : "All Associates";
      setAssociatePopupContext(`${associateName} - ${purposeName}`);
      setShowAssociatePopup(true);
    }
  };

  const handleAssociateStatusClick = (associateId, purposeId, purposeName) => {
    const loanDetails = loanData.filter(
      x => (x.vendor_id || x.contractor_id || x.employee_id || x.labour_id) === associateId &&
        (x.loan_purpose_id === purposeId || x.from_purpose_id === purposeId) &&
        (x.type === 'Loan' || x.type === 'Transfer')
    ).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.amount) || 0,
      type: item.type,
      mode: item.type === "Transfer" ? "" : (item.loan_payment_mode || ""),
      description: item.description || "",
      transferTo: item.type === "Transfer" ? (item.to_purpose_id ? getPurposeName(item.to_purpose_id) : (item.transfer_Project_id ? siteOptions.find(s => String(s.id) === String(item.transfer_Project_id))?.value || "" : "")) : "",
    }));
    const refundDetails = loanData.filter(
      x => (x.vendor_id || x.contractor_id || x.employee_id || x.labour_id) === associateId &&
        (x.loan_purpose_id === purposeId || x.from_purpose_id === purposeId) &&
        x.type === "Refund"
    ).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.loan_refund_amount) || 0,
      type: item.type,
      mode: item.loan_payment_mode || "",
      description: item.description || "",
    }));
    setStatusPopupData({ loans: loanDetails, refunds: refundDetails });
    const associateName = selectedAssociate ? selectedAssociate.label : "All Associates";
    setStatusPopupContext(`${associateName} - ${purposeName}`);
    setIsStatusFromAssociatePanel(true);
    setShowStatusPopup(true);
  };

  // Click handlers for Purpose panel (Right Panel) - Opens popup
  const handlePurposeLoanClick = (associateId, purposeId, associateName) => {
    const loanDetails = loanData.filter(
      x => (x.vendor_id || x.contractor_id || x.employee_id || x.labour_id) === associateId &&
        (x.loan_purpose_id === purposeId || x.from_purpose_id === purposeId) &&
        (x.type === 'Loan' || x.type === 'Transfer')
    ).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.amount) || 0,
      type: item.type,
      mode: item.type === "Transfer" ? "" : (item.loan_payment_mode || ""),
      description: item.description || "",
      transferTo: item.type === "Transfer" ? (item.to_purpose_id ? getPurposeName(item.to_purpose_id) : (item.transfer_Project_id ? siteOptions.find(s => String(s.id) === String(item.transfer_Project_id))?.value || "" : "")) : "",
    }));
    if (loanDetails.length > 0) {
      setPurposePopupTitle('Loan/Transfer Details');
      setPurposePopupData(loanDetails);
      const purposeName = selectedPurpose ? selectedPurpose.label : "All Purposes";
      setPurposePopupContext(`${purposeName} - ${associateName}`);
      setShowPurposePopup(true);
    }
  };

  const handlePurposeBalanceClick = (associateId, purposeId, associateName) => {
    // Get all transactions (loans, transfers, and refunds) that affect the balance
    const allTransactions = loanData.filter(
      x => (x.vendor_id || x.contractor_id || x.employee_id || x.labour_id) === associateId &&
        (x.loan_purpose_id === purposeId || x.from_purpose_id === purposeId) &&
        ((x.type === 'Loan' || x.type === 'Transfer') || x.type === "Refund")
    ).map(item => {
      if (item.type === "Refund") {
        return {
          date: new Date(item.date).toLocaleDateString('en-GB'),
          amount: -(parseFloat(item.loan_refund_amount) || 0), // Negative for refunds
          type: item.type,
          mode: item.loan_payment_mode || "",
          description: item.description || "",
          transferTo: "",
        };
      } else {
        return {
          date: new Date(item.date).toLocaleDateString('en-GB'),
          amount: parseFloat(item.amount) || 0,
          type: item.type,
          mode: item.type === "Transfer" ? "" : (item.loan_payment_mode || ""),
          description: item.description || "",
          transferTo: item.type === "Transfer" ? (item.to_purpose_id ? getPurposeName(item.to_purpose_id) : (item.transfer_Project_id ? siteOptions.find(s => String(s.id) === String(item.transfer_Project_id))?.value || "" : "")) : "",
        };
      }
    });
    if (allTransactions.length > 0) {
      setPurposePopupTitle('Balance Details');
      setPurposePopupData(allTransactions);
      const purposeName = selectedPurpose ? selectedPurpose.label : "All Purposes";
      setPurposePopupContext(`${purposeName} - ${associateName}`);
      setShowPurposePopup(true);
    }
  };

  const handlePurposeStatusClick = (associateId, purposeId, associateName) => {
    const loanDetails = loanData.filter(
      x => (x.vendor_id || x.contractor_id || x.employee_id || x.labour_id) === associateId &&
        (x.loan_purpose_id === purposeId || x.from_purpose_id === purposeId) &&
        (x.type === 'Loan' || x.type === 'Transfer')
    ).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.amount) || 0,
      type: item.type,
      mode: item.type === "Transfer" ? "" : (item.loan_payment_mode || ""),
      description: item.description || "",
      transferTo: item.type === "Transfer" ? (item.to_purpose_id ? getPurposeName(item.to_purpose_id) : (item.transfer_Project_id ? siteOptions.find(s => String(s.id) === String(item.transfer_Project_id))?.value || "" : "")) : "",
    }));
    const refundDetails = loanData.filter(
      x => (x.vendor_id || x.contractor_id || x.employee_id || x.labour_id) === associateId &&
        (x.loan_purpose_id === purposeId || x.from_purpose_id === purposeId) &&
        x.type === "Refund"
    ).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.loan_refund_amount) || 0,
      type: item.type,
      mode: item.loan_payment_mode || "",
      description: item.description || "",
    }));
    setStatusPopupData({ loans: loanDetails, refunds: refundDetails });
    const purposeName = selectedPurpose ? selectedPurpose.label : "All Purposes";
    setStatusPopupContext(`${purposeName} - ${associateName}`);
    setIsStatusFromAssociatePanel(false);
    setShowStatusPopup(true);
  };

  // Export functions for Associate panel (Left Panel)
  const exportAssociatePDF = () => {
    const doc = new jsPDF();
    if (!sortedSummaryByAssociate.length) {
      alert("No data to export.");
      return;
    }
    if (selectedAssociate) {
      const { type, label } = selectedAssociate;
      const titleText = `${type} - ${label}`;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(titleText, 14, 15);
    }
    const tableColumn = ["Purpose", "Loan", "Balance", "Status"];
    const tableRows = [];
    sortedSummaryByAssociate.forEach(item => {
      tableRows.push([
        getPurposeName(item.purposeId),
        item.pendingLoan.toLocaleString("en-IN"),
        (item.pendingLoan - item.refund).toLocaleString("en-IN"),
        item.status
      ]);
    });
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: selectedAssociate ? 20 : 10,
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
      },
      columnStyles: {
        1: { halign: 'right' }, // Pending Loan
        2: { halign: 'right' }  // Balance
      }
    });
    doc.save("LoanSummary_Associate.pdf");
  };

  const exportAssociateCSV = () => {
    if (!sortedSummaryByAssociate.length) {
      alert("No data to export.");
      return;
    }
    let extraRow = [];
    if (selectedAssociate) {
      const { type, label } = selectedAssociate;
      extraRow = [[`${type} - ${label}`]];
    }
    const headers = ["Purpose", "Loan", "Balance", "Status"];
    const rows = sortedSummaryByAssociate.map(item => [
      getPurposeName(item.purposeId),
      item.pendingLoan,
      item.pendingLoan - item.refund,
      item.status
    ]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "LoanSummary_Associate.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export functions for Purpose panel (Right Panel)
  const exportPurposePDF = () => {
    const doc = new jsPDF();
    if (!sortedSummaryByPurpose.length) {
      alert("No data to export.");
      return;
    }
    if (selectedPurpose) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Purpose - ${selectedPurpose.label}`, 14, 15);
    } else {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("All Purposes - Associate Summary", 14, 15);
    }
    const tableColumn = ["Contractor/Vendor/Employee/Labour", "Loan", "Balance", "Status"];
    const tableRows = [];
    sortedSummaryByPurpose.forEach(item => {
      tableRows.push([
        getAssociateName(item.associateId),
        item.pendingLoan.toLocaleString("en-IN"),
        (item.pendingLoan - item.refund).toLocaleString("en-IN"),
        item.status
      ]);
    });
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: 20,
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
      },
      columnStyles: {
        1: { halign: 'right' }, // Pending Loan
        2: { halign: 'right' }  // Balance
      }
    });
    const fileName = selectedPurpose ? "LoanSummary_Purpose.pdf" : "LoanSummary_AllPurposes.pdf";
    doc.save(fileName);
  };

  const exportPurposeCSV = () => {
    if (!sortedSummaryByPurpose.length) {
      alert("No data to export.");
      return;
    }
    let extraRow = [];
    if (selectedPurpose) {
      extraRow = [[`Purpose - ${selectedPurpose.label}`]];
    } else {
      extraRow = [["All Purposes - Associate Summary"]];
    }
    const headers = ["Contractor/Vendor/Employee/Labour", "Loan", "Balance", "Status"];
    const rows = sortedSummaryByPurpose.map(item => [
      getAssociateName(item.associateId),
      item.pendingLoan,
      item.pendingLoan - item.refund,
      item.status
    ]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const fileName = selectedPurpose ? "LoanSummary_Purpose.csv" : "LoanSummary_AllPurposes.csv";
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Popup sorting handlers
  const handleAssociatePopupSort = (key) => {
    let direction = 'asc';
    if (associatePopupSortConfig.key === key && associatePopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setAssociatePopupSortConfig({ key, direction });
  };

  const handlePurposePopupSort = (key) => {
    let direction = 'asc';
    if (purposePopupSortConfig.key === key && purposePopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setPurposePopupSortConfig({ key, direction });
  };

  const handleStatusPopupSort = (key) => {
    let direction = 'asc';
    if (statusPopupSortConfig.key === key && statusPopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setStatusPopupSortConfig({ key, direction });
  };

  // Sort popup data
  const sortPopupData = (data, config) => {
    if (!data || data.length === 0) return [];
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };
    if (!config.key) {
      return [...data].sort((a, b) => {
        const aDate = parseDate(a.date);
        const bDate = parseDate(b.date);
        return bDate - aDate;
      });
    }
    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];
      if (config.key === 'date') {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Export Popup PDF
  const exportPopupPDF = (data, title, context) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(context, 14, 15);
    doc.setFontSize(10);
    doc.text(title, 14, 22);
    const tableColumn = ["Date", "Transfer", "Amount"];
    const tableRows = [];
    data.forEach(item => {
      let transferInfo = '-';
      if (item.transferTo) {
        transferInfo = `${item.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}${item.transferTo}`;
      } else if (item.type === 'Refund') {
        transferInfo = 'Refund';
      }
      tableRows.push([
        item.date,
        transferInfo,
        item.amount.toLocaleString("en-IN"),
      ]);
    });
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    const totalRow = ["Total", "", total.toLocaleString("en-IN")];
    tableRows.push(totalRow);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
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
        2: { halign: 'right' }
      },
      didParseCell: function (data) {
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
  const exportPopupCSV = (data, title, context) => {
    const extraRow = [[context], [title], []];
    const headers = ["Date", "Transfer", "Amount"];
    const rows = data.map(item => {
      let transferInfo = '-';
      if (item.transferTo) {
        transferInfo = `${item.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}${item.transferTo}`;
      } else if (item.type === 'Refund') {
        transferInfo = 'Refund';
      }
      return [
        item.date,
        transferInfo,
        item.amount,
      ];
    });
    const total = data.reduce((sum, item) => sum + item.amount, 0);
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

  // Export Status Popup PDF
  const exportStatusPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(statusPopupContext, 14, 15);
    doc.setFontSize(10);
    doc.text("Status Details", 14, 22);
    const tableColumn = ["Date", "Loan Amount", "Refund Amount", "Type", "Mode", "Description"];
    const combinedData = [];
    const dateMap = new Map();
    statusPopupData.loans.forEach(loan => {
      const key = `${loan.date}`;
      dateMap.set(key, {
        date: loan.date,
        loanAmount: loan.amount,
        refundAmount: 0,
        type: loan.type,
        mode: loan.mode,
        description: loan.description,
      });
    });
    statusPopupData.refunds.forEach(refund => {
      const key = `${refund.date}`;
      if (dateMap.has(key)) {
        dateMap.get(key).refundAmount = refund.amount;
      } else {
        dateMap.set(key, {
          date: refund.date,
          loanAmount: 0,
          refundAmount: refund.amount,
          type: refund.type,
          mode: refund.mode,
          description: refund.description,
        });
      }
    });
    combinedData.push(...Array.from(dateMap.values()));
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };
    if (!statusPopupSortConfig.key) {
      combinedData.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    } else {
      combinedData.sort((a, b) => {
        let aValue = a[statusPopupSortConfig.key];
        let bValue = b[statusPopupSortConfig.key];
        if (statusPopupSortConfig.key === 'date') {
          aValue = parseDate(aValue);
          bValue = parseDate(bValue);
          return statusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return statusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        if (aValue < bValue) return statusPopupSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return statusPopupSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    const tableRows = combinedData.map(entry => [
      entry.date,
      entry.loanAmount !== 0 ? entry.loanAmount.toLocaleString("en-IN") : "-",
      entry.refundAmount !== 0 ? entry.refundAmount.toLocaleString("en-IN") : "-",
      entry.type,
      entry.mode || "-",
      entry.description || "-",
    ]);
    const totalLoan = statusPopupData.loans.reduce((sum, item) => sum + item.amount, 0);
    const totalRefund = statusPopupData.refunds.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalLoan - totalRefund;
    tableRows.push(["Total", totalLoan.toLocaleString("en-IN"), totalRefund.toLocaleString("en-IN"), "", "", ""]);
    tableRows.push(["Balance", "", balance.toLocaleString("en-IN"), "", "", ""]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
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
        1: { halign: 'right' },
        2: { halign: 'right' }
      },
      didParseCell: function (data) {
        if (data.row.index === tableRows.length - 2 || data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          if (data.row.index === tableRows.length - 1) {
            data.cell.styles.fillColor = [191, 152, 83];
            data.cell.styles.textColor = [255, 255, 255];
          }
        }
      }
    });
    const fileName = `${statusPopupContext.replace(/[^a-z0-9]/gi, '_')}_Status.pdf`;
    doc.save(fileName);
  };

  // Export Status Popup CSV
  const exportStatusCSV = () => {
    const extraRow = [[statusPopupContext], ["Status Details"], []];
    const headers = ["Date", "Loan Amount", "Refund Amount", "Type", "Mode", "Description"];
    const combinedData = [];
    const dateMap = new Map();
    statusPopupData.loans.forEach(loan => {
      const key = `${loan.date}`;
      dateMap.set(key, {
        date: loan.date,
        loanAmount: loan.amount,
        refundAmount: 0,
        type: loan.type,
        mode: loan.mode,
        description: loan.description,
      });
    });
    statusPopupData.refunds.forEach(refund => {
      const key = `${refund.date}`;
      if (dateMap.has(key)) {
        dateMap.get(key).refundAmount = refund.amount;
      } else {
        dateMap.set(key, {
          date: refund.date,
          loanAmount: 0,
          refundAmount: refund.amount,
          type: refund.type,
          mode: refund.mode,
          description: refund.description,
        });
      }
    });
    combinedData.push(...Array.from(dateMap.values()));
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };
    if (!statusPopupSortConfig.key) {
      combinedData.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    } else {
      combinedData.sort((a, b) => {
        let aValue = a[statusPopupSortConfig.key];
        let bValue = b[statusPopupSortConfig.key];
        if (statusPopupSortConfig.key === 'date') {
          aValue = parseDate(aValue);
          bValue = parseDate(bValue);
          return statusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return statusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        if (aValue < bValue) return statusPopupSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return statusPopupSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    const rows = combinedData.map(entry => [
      entry.date,
      entry.loanAmount !== 0 ? entry.loanAmount : "-",
      entry.refundAmount !== 0 ? entry.refundAmount : "-",
      entry.type,
      entry.mode || "-",
      entry.description || "-",
    ]);
    const totalLoan = statusPopupData.loans.reduce((sum, item) => sum + item.amount, 0);
    const totalRefund = statusPopupData.refunds.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalLoan - totalRefund;
    rows.push(["Total", totalLoan, totalRefund, "", "", ""]);
    rows.push(["Balance", "", balance, "", "", ""]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const fileName = `${statusPopupContext.replace(/[^a-z0-9]/gi, '_')}_Status.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const sortData = (data, config, statusKey = 'pendingLoan', nameKey = 'purposeId') => {
    if (!config.key) {
      return [...data].sort((a, b) => {
        const aStatus = a[statusKey] > 0 ? 1 : 0;
        const bStatus = b[statusKey] > 0 ? 1 : 0;
        if (aStatus !== bStatus) return bStatus - aStatus;
        const aName = (a[nameKey] || '').toString();
        const bName = (b[nameKey] || '').toString();
        if (aName < bName) return -1;
        if (aName > bName) return 1;
        return 0;
      });
    }
    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];
      if (config.key === 'balance') {
        aValue = a.pendingLoan - a.refund;
        bValue = b.pendingLoan - b.refund;
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

  const sortedSummaryByAssociate = sortData(summaryByAssociate, sortConfig, 'pendingLoan', 'purposeId');
  const sortedSummaryByPurpose = sortData(summaryByPurpose, purposeSortConfig, 'pendingLoan', 'associateId');

  

  return (
    <div className='bg-[#FAF6ED]'>
      <div className="bg-white rounded-lg xl:w-full xl:max-w-[95vw] xl:h-[780px] p-3 ml-10 mr-10">
        <div className="xl:flex gap-8">
        {/* Left Panel: Contractor/Vendor Summary */}
        <div className="flex-1 text-left bg-white p-4 sm:p-6 mb-6 xl:mb-0">
          <div className="mb-4">
            <label className="block font-semibold mb-2">
              Contractor/Vendor/Employee/Labour
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <Select
                options={combinedOptions}
                value={selectedAssociate}
                onChange={setSelectedAssociate}
                placeholder="Select..."
                className="w-full sm:w-[275px]"
                isClearable
                menuPortalTarget={document.body}
                styles={customStyles}
              />

              {/* Pending Advance badge */}
              <div className="border-2 h-[37px] border-[#E4572E] border-opacity-35 p-2 px-2 rounded text-sm font-medium whitespace-nowrap">
                Pending Advance: ₹{pendingAdvanceAssociate.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
            <button
              onClick={exportAssociatePDF}
              className="flex items-center gap-1 text-sm text-[#E4572E] hover:text-[#E4572E] font-semibold transition-colors"
            >
              Export PDF
            </button>
            <button
              onClick={exportAssociateCSV}
              className="flex items-center gap-1 text-sm text-[#007233] hover:text-[#007233] font-semibold transition-colors"
            >
              Export XL
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 text-sm  text-[#Bf9853] hover:text-[#Bf9853] font-semibold transition-colors"
            >
              Print
            </button>
          </div>
          <div className="rounded-lg border-l-8 border-l-[#BF9853] overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead className="bg-[#FAF6ED] sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleSort('purposeId')}>
                    Purpose
                    {sortConfig.key === 'purposeId' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleSort('pendingLoan')}>
                    Loan
                    {sortConfig.key === 'pendingLoan' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleSort('balance')}>
                    Balance
                    {sortConfig.key === 'balance' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="p-3 text-center font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleSort('status')}>
                    Status
                    {sortConfig.key === 'status' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="p-3 text-center font-semibold">
                    Frequency
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSummaryByAssociate.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-6 text-gray-500">No Records Available</td></tr>
                ) : sortedSummaryByAssociate.map((item, i) => (
                  <tr key={i} className="relative">
                    <td className="border-b border-gray-100 p-3 text-gray-900">
                      {getPurposeName(item.purposeId)}
                    </td>
                    <td
                      className="border-b border-gray-100 p-3 text-gray-900 font-medium cursor-pointer"
                      onMouseEnter={e => handleLoanMouseEnter(e, item.associateId, item.purposeId)}
                      onMouseLeave={hideTooltip}
                      onClick={() => handleAssociateLoanClick(item.associateId, item.purposeId, getPurposeName(item.purposeId))}
                    >
                      ₹{item.pendingLoan.toLocaleString("en-IN")}
                    </td>
                    <td 
                      className="border-b border-gray-100 p-3 text-gray-900 font-medium cursor-pointer"
                      onMouseEnter={e => handleRefundMouseEnter(e, item.associateId, item.purposeId)}
                      onMouseLeave={hideTooltip}
                      onClick={() => handleAssociateBalanceClick(item.associateId, item.purposeId, getPurposeName(item.purposeId))}
                    >
                      ₹{(item.pendingLoan - item.refund).toLocaleString("en-IN")}
                    </td>
                    <td 
                      className={`border-b border-gray-100 p-3 text-center font-medium cursor-pointer ${item.status === "Cleared" ? "text-green-600" : "text-amber-600"}`}
                      onClick={() => handleAssociateStatusClick(item.associateId, item.purposeId, getPurposeName(item.purposeId))}
                    >
                      {item.status}
                    </td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: To Summary */}
        <div className="flex-1 text-left p-4 sm:p-6">
          <div className="mb-4">
            <label className="block font-semibold mb-2">
              Purpose
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <Select
                options={purposeOptions}
                value={selectedPurpose}
                onChange={setSelectedPurpose}
                placeholder="Select Purpose..."
                className="w-full sm:w-[275px]"
                isClearable
                menuPortalTarget={document.body}
                styles={customStyles}
              />

              {/* Pending Advance badge */}
              <div className="h-[37px] border-2 border-[#E4572E] border-opacity-35 p-2 rounded text-sm font-medium whitespace-nowrap">
                Pending Advance: ₹{pendingAdvancePurpose.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
            <button
              onClick={exportPurposePDF}
              className="flex items-center gap-1 text-sm text-[#E4572E] hover:text-[#E4572E] font-semibold"
            >
              Export PDF
            </button>
            <button
              onClick={exportPurposeCSV}
              className="flex items-center gap-1 text-sm text-[#007233] hover:text-[#007233] font-semibold"
            >
              Export XL
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 text-sm text-[#BF9853] hover:text-[#BF9853] font-semibold"
            >
              Print
            </button>
          </div>
          <div className="rounded-lg border-l-8 border-l-[#BF9853] overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead className="bg-[#FAF6ED] sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePurposeSort('associateId')}>
                    Contractor/Vendor/Employee/Labour
                    {purposeSortConfig.key === 'associateId' && (
                      <span className="ml-1">{purposeSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePurposeSort('pendingLoan')}>
                    Loan
                    {purposeSortConfig.key === 'pendingLoan' && (
                      <span className="ml-1">{purposeSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePurposeSort('balance')}>
                    Balance
                    {purposeSortConfig.key === 'balance' && (
                      <span className="ml-1">{purposeSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="p-3 text-center font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePurposeSort('status')}>
                    Status
                    {purposeSortConfig.key === 'status' && (
                      <span className="ml-1">{purposeSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="p-3 text-center font-semibold">
                    Frequency
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSummaryByPurpose.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-6 text-gray-500">No Records Available</td></tr>
                ) : sortedSummaryByPurpose.map((item, i) => (
                  <tr key={i} className="relative">
                    <td className="border-b border-gray-100 p-3 text-gray-900">
                      {getAssociateName(item.associateId)}
                    </td>
                    <td
                      className="border-b border-gray-100 p-3 text-gray-900 font-medium cursor-pointer"
                      onMouseEnter={e => handleLoanMouseEnter(e, item.associateId, item.purposeId)}
                      onMouseLeave={hideTooltip}
                      onClick={() => handlePurposeLoanClick(item.associateId, item.purposeId, getAssociateName(item.associateId))}
                    >
                      ₹{item.pendingLoan.toLocaleString("en-IN")}
                    </td>
                    <td 
                      className="border-b border-gray-100 p-3 text-gray-900 font-medium cursor-pointer"
                      onMouseEnter={e => handleRefundMouseEnter(e, item.associateId, item.purposeId)}
                      onMouseLeave={hideTooltip}
                      onClick={() => handlePurposeBalanceClick(item.associateId, item.purposeId, getAssociateName(item.associateId))}
                    >
                      ₹{(item.pendingLoan - item.refund).toLocaleString("en-IN")}
                    </td>
                    <td 
                      className={`border-b border-gray-100 p-3 text-center font-medium cursor-pointer ${item.status === "Cleared" ? "text-green-600" : "text-amber-600"}`}
                      onClick={() => handlePurposeStatusClick(item.associateId, item.purposeId, getAssociateName(item.associateId))}
                    >
                      {item.status}
                    </td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltipVisible && (
        <div
          style={{
            position: "fixed",
            top: tooltipPos.y + 10,
            left: tooltipPos.x + 10,
            maxWidth: 320,
            backgroundColor: "white",
            border: "1px solid #ccc",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            zIndex: 10000,
            fontSize: 12,
            padding: 8,
            maxHeight: 280,
            overflowY: "auto"
          }}
          onMouseLeave={hideTooltip}
        >
          <div className="font-semibold mb-2">{tooltipTitle}</div>
          {tooltipData.length === 0 ? (
            <p className="text-gray-500">No transactions found.</p>
          ) : (
            tooltipData.map(({ date, amount, loan_refund_amount, type }, i) => (
              <div key={i} className="mb-1">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{date ? new Date(date).toLocaleDateString() : "-"}</span>
                  <span style={{ fontWeight: "bold", color: "black" }}>
                    ₹{(amount || loan_refund_amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div style={{ color: "blue" }}>{type}</div>
              </div>
            ))
          )}
          <div style={{ borderTop: "1px solid #ccc", marginTop: 4, paddingTop: 4, fontWeight: "bold" }}>
            Total: ₹{tooltipData.reduce((acc, curr) => acc + Number(curr.amount || curr.loan_refund_amount || 0), 0).toLocaleString("en-IN")}
          </div>
        </div>
      )}

      {/* Associate Popup */}
      {showAssociatePopup && associatePopupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAssociatePopup(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-[#BF9853]">{associatePopupContext}</h3>
                <p className="text-sm text-gray-600 mt-1">{associatePopupTitle}</p>
              </div>
              <button onClick={() => setShowAssociatePopup(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex gap-3 text-sm justify-end mb-3">
              <button
                onClick={() => exportPopupPDF(sortPopupData(associatePopupData, associatePopupSortConfig), associatePopupTitle, associatePopupContext)}
                className="flex items-center font-bold hover:underline gap-1 text-[#E4572E]"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportPopupCSV(sortPopupData(associatePopupData, associatePopupSortConfig), associatePopupTitle, associatePopupContext)}
                className="flex items-center font-bold hover:underline gap-1 text-[#007233]"
              >
                Export XL
              </button>
            </div>
            <div className="mt-4 border-l-8 border-l-[#BF9853] rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8f1e5]">
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleAssociatePopupSort('date')}>
                      Date
                      {associatePopupSortConfig.key === 'date' && (
                        <span className="ml-1">{associatePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleAssociatePopupSort('transferTo')}>
                      Transfer
                      {associatePopupSortConfig.key === 'transferTo' && (
                        <span className="ml-1">{associatePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleAssociatePopupSort('amount')}>
                      Amount
                      {associatePopupSortConfig.key === 'amount' && (
                        <span className="ml-1">{associatePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortPopupData(associatePopupData, associatePopupSortConfig)
                    .map((entry, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                        <td className="p-3 text-left">{entry.date}</td>
                        <td className="p-3 text-left text-gray-600">
                          {entry.transferTo ? (
                            <div className="text-xs mt-1 text-gray-500">
                              {entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}
                              {entry.transferTo}
                            </div>
                          ) : entry.type === 'Refund' ? (
                            <div className="text-xs mt-1 text-gray-500">Refund</div>
                          ) : '-'}
                        </td>
                        <td className={`p-3 text-right font-semibold ${entry.amount < 0 ? 'text-red-600' : ''}`}>
                          ₹{entry.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#BF9853] text-white font-bold">
                    <td className="p-3 text-left">Total</td>
                    <td></td>
                    <td className="p-3 text-right">
                      ₹{associatePopupData
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Purpose Popup */}
      {showPurposePopup && purposePopupData && (
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
                onClick={() => exportPopupPDF(sortPopupData(purposePopupData, purposePopupSortConfig), purposePopupTitle, purposePopupContext)}
                className="flex items-center font-bold hover:underline gap-1 text-[#E4572E]"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportPopupCSV(sortPopupData(purposePopupData, purposePopupSortConfig), purposePopupTitle, purposePopupContext)}
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
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePurposePopupSort('transferTo')}>
                      Transfer
                      {purposePopupSortConfig.key === 'transferTo' && (
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
                  {sortPopupData(purposePopupData, purposePopupSortConfig)
                    .map((entry, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                        <td className="p-3 text-left">{entry.date}</td>
                        <td className="p-3 text-left text-gray-600">
                          {entry.transferTo ? (
                            <div className="text-xs mt-1 text-gray-500">
                              {entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}
                              {entry.transferTo}
                            </div>
                          ) : entry.type === 'Refund' ? (
                            <div className="text-xs mt-1 text-gray-500">Refund</div>
                          ) : '-'}
                        </td>
                        <td className={`p-3 text-right font-semibold ${entry.amount < 0 ? 'text-red-600' : ''}`}>
                          ₹{entry.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#BF9853] text-white font-bold">
                    <td className="p-3 text-left">Total</td>
                    <td></td>
                    <td className="p-3 text-right">
                      ₹{purposePopupData
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Status Popup */}
      {showStatusPopup && statusPopupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowStatusPopup(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-5xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-[#BF9853]">{statusPopupContext}</h3>
                <p className="text-sm text-gray-600 mt-1">Status Details</p>
              </div>
              <button onClick={() => setShowStatusPopup(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex gap-3 text-sm justify-end mb-3">
              <button
                onClick={exportStatusPDF}
                className="flex items-center font-bold hover:underline gap-1 text-[#E4572E]"
              >
                Export PDF
              </button>
              <button
                onClick={exportStatusCSV}
                className="flex items-center font-bold hover:underline gap-1 text-[#007233]"
              >
                Export XL
              </button>
            </div>
            <div className="mt-4 border-l-8 border-l-[#BF9853] rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8f1e5]">
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleStatusPopupSort('date')}>
                      Date
                      {statusPopupSortConfig.key === 'date' && (
                        <span className="ml-1">{statusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleStatusPopupSort('loanAmount')}>
                      Loan Amount
                      {statusPopupSortConfig.key === 'loanAmount' && (
                        <span className="ml-1">{statusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleStatusPopupSort('refundAmount')}>
                      Refund Amount
                      {statusPopupSortConfig.key === 'refundAmount' && (
                        <span className="ml-1">{statusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const combinedData = [];
                    const dateMap = new Map();
                    statusPopupData.loans.forEach(loan => {
                      const key = `${loan.date}`;
                      dateMap.set(key, {
                        date: loan.date,
                        loanAmount: loan.amount,
                        refundAmount: 0,
                      });
                    });
                    statusPopupData.refunds.forEach(refund => {
                      const key = `${refund.date}`;
                      if (dateMap.has(key)) {
                        dateMap.get(key).refundAmount = refund.amount;
                      } else {
                        dateMap.set(key, {
                          date: refund.date,
                          loanAmount: 0,
                          refundAmount: refund.amount,
                        });
                      }
                    });
                    combinedData.push(...Array.from(dateMap.values()));
                    const parseDate = (dateStr) => {
                      const [day, month, year] = dateStr.split('/');
                      return new Date(`${year}-${month}-${day}`);
                    };
                    if (!statusPopupSortConfig.key) {
                      combinedData.sort((a, b) => parseDate(b.date) - parseDate(a.date));
                    } else {
                      combinedData.sort((a, b) => {
                        let aValue = a[statusPopupSortConfig.key];
                        let bValue = b[statusPopupSortConfig.key];
                        if (statusPopupSortConfig.key === 'date') {
                          aValue = parseDate(aValue);
                          bValue = parseDate(bValue);
                          return statusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                        }
                        if (typeof aValue === 'number' && typeof bValue === 'number') {
                          return statusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                        }
                        return 0;
                      });
                    }
                    return combinedData.map((entry, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                        <td className="p-3 text-left">{entry.date}</td>
                        <td className={`p-3 text-right font-semibold ${entry.loanAmount < 0 ? 'text-red-600' : ''}`}>
                          {entry.loanAmount !== 0 ? `₹${entry.loanAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="p-3 text-right font-semibold">
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
                      ₹{statusPopupData.loans.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right">
                      ₹{statusPopupData.refunds.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-[#BF9853] text-white font-bold">
                    <td className="p-3 text-left">Balance Loan</td>
                    <td className="p-3 text-right" colSpan="2">
                      ₹{(
                        statusPopupData.loans.reduce((sum, item) => sum + item.amount, 0) -
                        statusPopupData.refunds.reduce((sum, item) => sum + item.amount, 0)
                      ).toLocaleString('en-IN')}
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
};

export default LoanSummary;
