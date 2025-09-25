import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Attach from '../Images/Attachfile.svg';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import edit from '../Images/Edit.svg';

const AdvancePortal = ({ username, userRoles = [] }) => {
  const [selectedType, setSelectedType] = useState('Advance')
  const [selectedOption, setSelectedOption] = useState(null);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [siteOptions, setSiteOptions] = useState([]);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [projectAdvance, setProjectAdvance] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [todayAmount, setTodayAmount] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [filteredPaymentMode, setFilteredPaymentMode] = useState('');
  const [filteredAmount, setFilteredAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [transferSiteId, setTransferSiteId] = useState('');
  const [entryNo, setEntryNo] = useState(1);
  const [advanceData, setAdvanceData] = useState([]);
  const [overallAdvance, setOverallAdvance] = useState(0);
  const [selectedAdvanceFile, setSelectedAdvanceFile] = useState(null);
  const fileInputRef = useRef(null);
  const [billAmount, setBillAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  useEffect(() => {
    const savedselectedType = sessionStorage.getItem('selectedType');
    const savedContractorVendor = sessionStorage.getItem('selectedOption');
    const savedProjectName = sessionStorage.getItem('selectedSite');
    const savedoverallAdvance = sessionStorage.getItem('overallAdvance');
    const savedbillAmount = sessionStorage.getItem('billAmount');
    const savedadvanceAmount = sessionStorage.getItem('advanceAmount');
    const savedtransferSiteId = sessionStorage.getItem('transferSiteId');
    const savedpaymentMode = sessionStorage.getItem('paymentMode');
    const saveddescription = sessionStorage.getItem('description');
    try {
      if (savedselectedType) setSelectedType(JSON.parse(savedselectedType));
      if (savedContractorVendor) setSelectedOption(JSON.parse(savedContractorVendor));
      if (savedProjectName) setSelectedSite(JSON.parse(savedProjectName));
      if (savedoverallAdvance) setOverallAdvance(JSON.parse(savedoverallAdvance));
      if (savedbillAmount) setBillAmount(JSON.parse(savedbillAmount));
      if (savedadvanceAmount) setAdvanceAmount(JSON.parse(savedadvanceAmount));
      if (savedtransferSiteId) setTransferSiteId(JSON.parse(savedtransferSiteId));
      if (savedpaymentMode) setPaymentMode(JSON.parse(savedpaymentMode));
      if (saveddescription) setDescription(JSON.parse(saveddescription));
    } catch (error) {
      console.error("Error parsing sessionStorage data:", error);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  const handleBeforeUnload = () => {
    sessionStorage.removeItem('selectedType');
    sessionStorage.removeItem('selectedOption');
    sessionStorage.removeItem('selectedSite');
    sessionStorage.removeItem('overallAdvance');
    sessionStorage.removeItem('billAmount');
    sessionStorage.removeItem('advanceAmount');
    sessionStorage.removeItem('transferSiteId');
    sessionStorage.removeItem('paymentMode');
    sessionStorage.removeItem('description');
  };
  useEffect(() => {
    if (selectedType) sessionStorage.setItem('selectedType', JSON.stringify(selectedType));
    if (selectedOption) sessionStorage.setItem('selectedOption', JSON.stringify(selectedOption));
    if (selectedSite) sessionStorage.setItem('selectedSite', JSON.stringify(selectedSite));
    if (overallAdvance) sessionStorage.setItem('overallAdvance', JSON.stringify(overallAdvance));
    if (billAmount) sessionStorage.setItem('billAmount', JSON.stringify(billAmount));
    if (advanceAmount) sessionStorage.setItem('advanceAmount', JSON.stringify(advanceAmount));
    if (transferSiteId) sessionStorage.setItem('transferSiteId', JSON.stringify(transferSiteId));
    if (paymentMode) sessionStorage.setItem('paymentMode', JSON.stringify(paymentMode));
    if (description) sessionStorage.setItem('description', JSON.stringify(description));
  }, [selectedType, selectedOption, selectedSite, overallAdvance, billAmount, advanceAmount, transferSiteId, paymentMode, description]);
  const formatWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAmountChange = (e) => {
    // Remove commas before saving
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      setAdvanceAmount(rawValue);
    }
  };
  const handleProjectChange = (selected) => {
    setSelectedSite(selected);
    if (selected) {
      localStorage.setItem("advanceProjectName", JSON.stringify(selected));
    } else {
      localStorage.removeItem("advanceProjectName");
    }
  };
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
    const fetchSites = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
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
          value: item.siteName,
          label: item.siteName,
          id: item.id,
          sNo: item.siteNo
        }));

        // Add predefined site options with IDs 001, 002, 003, 004
        const predefinedSiteOptions = [
          {
            value: "Mason Advance",
            label: "Mason Advance",
            id: "1",
            sNo: "1"
          },
          {
            value: "Material Advance",
            label: "Material Advance",
            id: "2",
            sNo: "2"
          },
          {
            value: "Weekly Advance",
            label: "Weekly Advance",
            id: "3",
            sNo: "3"
          },
          {
            value: "Excess Advance",
            label: "Excess Advance",
            id: "4",
            sNo: "4"
          },
          {
            value: "Material Rent",
            label: "Material Rent",
            id: "",
            sNo: "5"
          },
          {
            value: "Subhash Kumar - Kunnur",
            label: "Subhash Kumar - Kunnur",
            id: "6",
            sNo: "6"
          }
        ];

        // Combine backend data with predefined options
        const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
        setSiteOptions(combinedSiteOptions);
      } catch (error) {
        console.error("Fetch error: ", error);
        
        // Fallback: if API fails, still show predefined options
        const predefinedSiteOptions = [
          {
            value: "Mason Advance",
            label: "Mason Advance",
            id: "1",
            sNo: "1"
          },
          {
            value: "Material Advance",
            label: "Material Advance",
            id: "2",
            sNo: "2"
          },
          {
            value: "Weekly Advance",
            label: "Weekly Advance",
            id: "3",
            sNo: "3"
          },
          {
            value: "Excess Advance",
            label: "Excess Advance",
            id: "4",
            sNo: "4"
          },
          {
            value: "Material Rent",
            label: "Material Rent",
            id: "",
            sNo: "5"
          },
          {
            value: "Subhash Kumar - Kunnur",
            label: "Subhash Kumar - Kunnur",
            id: "6",
            sNo: "6"
          }
        ];
        setSiteOptions(predefinedSiteOptions);
      }
    };
    fetchSites();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setAdvanceData(data);
      } catch (error) {
        console.error('Error fetching advance portal data:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = async (selected) => {
    setSelectedOption(selected);
    if (selected) {
      localStorage.setItem("advanceContractorVendor", JSON.stringify(selected));
    } else {
      localStorage.removeItem("advanceContractorVendor");
    }
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const total = data
        .filter(item => {
          return selected.type === 'Vendor'
            ? item.vendor_id === selected.id
            : selected.type === 'Contractor'
              ? item.contractor_id === selected.id
              : false;
        })
        .reduce((sum, curr) => {
          const amount = parseFloat(curr.amount) || 0;
          const billAmount = parseFloat(curr.bill_amount) || 0;
          const refundAmount = parseFloat(curr.refund_amount) || 0;
          return sum + amount - billAmount - refundAmount;
        }, 0);

      setOverallAdvance(total);
    } catch (error) {
      console.error('Error fetching or processing advance data:', error);
      setOverallAdvance(0);
    }
  };
  const calculateProjectAdvance = async (vendorOrContractor, project) => {
    if (!vendorOrContractor || !project) {
      setProjectAdvance('');
      return;
    }

    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      if (!response.ok) throw new Error('Failed to fetch advance portal data');
      const data = await response.json();

      const isVendor = vendorOrContractor.type === 'Vendor';
      const idField = isVendor ? 'vendor_id' : 'contractor_id';

      // Filter for only this vendor/contractor & project
      const relevantData = data.filter(
        item => item[idField] === vendorOrContractor.id && item.project_id === project.id
      );

      // Sum amounts, subtract bill_amount & refund_amount
      const total = relevantData.reduce((sum, entry) => {
        const amount = parseFloat(entry.amount) || 0;
        const billAmount = parseFloat(entry.bill_amount) || 0;
        const refundAmount = parseFloat(entry.refund_amount) || 0;

        return sum + amount - billAmount - refundAmount;
      }, 0);

      setProjectAdvance(total.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
    } catch (error) {
      console.error('Error calculating project advance:', error);
      setProjectAdvance('');
    }
  };

  // Combine vendor and contractor options
  useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);
  // Get button label based on selected type
  const getButtonLabel = () => {
    switch (selectedType) {
      case 'Advance':
        return 'Pay Advance';
      case 'Transfer':
        return 'Transfer';
      case 'Bill Settlement':
        return 'Settle Bill';
      case 'Refund':
        return 'Refund';
      default:
        return 'Submit';
    }
  };
  // Sort site options alphabetically by label
  const sortedSiteOptions = siteOptions.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
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
  const fetchAdvanceData = async () => {
    try {
      const res = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      const json = await res.json();
      setAdvanceData(json);
    } catch (error) {
      console.error('Error fetching advance data:', error);
    }
  };


  const handleSubmit = async () => {
    // --- Common validation based on type ---
    if (selectedType === 'Advance' || selectedType === 'Refund') {
      if (!selectedOption || !selectedSite || !advanceAmount || !paymentMode) {
        alert("Please fill Nessacary details");
        return;
      }
    } else if (selectedType === 'Bill Settlement') {
      if (!selectedOption || !selectedSite || !billAmount) {
        alert("Please fill Nessacary details");
        return;
      }
      // --- Extra validation for Bill Settlement ---
      const rawAmount = advanceAmount.toString().replace(/,/g, '').trim();
      if (rawAmount && !paymentMode) {
        alert("Please select Payment Mode if you enter Amount Given");
        return;
      }
    } else if (selectedType === 'Transfer') {
      if (!selectedOption || !selectedSite || !advanceAmount || !transferSiteId) {
        alert("Please fill Nessacary details");
        return;
      }
    } else {
      alert("Please select a valid type");
      return;
    }

    // --- Validation for Amount Given ---
    const rawAmount = advanceAmount.toString().replace(/,/g, '').trim();
    if ((selectedType === 'Advance' || selectedType === 'Refund' || selectedType === 'Transfer') && !rawAmount) {
      alert("Please fill the Amount Given");
      return;
    }

    // --- Validation for Bill Amount (only if type is Bill Settlement) ---
    if (selectedType === 'Bill Settlement') {
      const rawBillAmount = billAmount.toString().trim();
      if (!rawBillAmount) {
        alert("Please fill the Bill Amount");
        return;
      }
    }
    setIsSubmitting(true); // Start loading

    try {
      // --- existing code unchanged ---
      const res = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      if (!res.ok) throw new Error('Failed to fetch entry numbers');

      const allData = await res.json();
      const maxEntryNo = allData.length > 0 ? Math.max(...allData.map(item => item.entry_no || 0)) : 0;
      const nextEntryNo = maxEntryNo + 1;

      const createPayload = (overrides = {}) => ({
        type: selectedType,
        date: dateValue,
        vendor_id: selectedOption?.type === 'Vendor' ? selectedOption.id : 0,
        contractor_id: selectedOption?.type === 'Contractor' ? selectedOption.id : 0,
        project_id: selectedSite?.id || 0,
        transfer_site_id: selectedType === 'Transfer' ? parseInt(transferSiteId) : 0,
        payment_mode: selectedType !== 'Transfer' ? paymentMode : '',
        amount:
          selectedType === 'Advance' || selectedType === 'Transfer' || selectedType === 'Bill Settlement'
            ? parseFloat(advanceAmount) || 0
            : 0,
        bill_amount: selectedType === 'Bill Settlement' ? parseFloat(billAmount) || 0 : 0,
        refund_amount: selectedType === 'Refund' ? parseFloat(advanceAmount) || 0 : 0,
        entry_no: nextEntryNo,
        week_no: getWeekNumber(),
        description: description,
        file_url: '',
        ...overrides
      });

      if (selectedType === 'Transfer') {
        const amountValue = parseFloat(advanceAmount) || 0;

        const firstPayload = createPayload({ amount: -Math.abs(amountValue) });
        const secondPayload = createPayload({
          project_id: parseInt(transferSiteId),
          transfer_site_id: selectedSite?.id || 0,
          amount: Math.abs(amountValue)
        });

        await Promise.all([
          fetch('https://backendaab.in/aabuildersDash/api/advance_portal/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(firstPayload)
          }),
          fetch('https://backendaab.in/aabuildersDash/api/advance_portal/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(secondPayload)
          })
        ]);
      } else {
        const payload = createPayload();
        await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      }

      toast.success('Advance saved successfully!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });

      // reset form logic stays same...
      setAdvanceAmount('');
      setDescription('');
      setPaymentMode('');
      setBillAmount('');
      setEntryNo(nextEntryNo);
      fetchAdvanceData();
      if (selectedOption) handleChange(selectedOption);
      if (selectedOption && selectedSite) calculateProjectAdvance(selectedOption, selectedSite);

    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to save data!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to get the current week number
  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = (now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000);
    const oneWeek = 604800000;
    return Math.floor(diff / oneWeek) + 1;
  };
  useEffect(() => {
    if (selectedOption && selectedSite) {
      calculateProjectAdvance(selectedOption, selectedSite);
    } else {
      setProjectAdvance('');
    }
  }, [selectedOption, selectedSite]);
  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    setDateValue(formatted);
  }, []);
  useEffect(() => {
    if (!fromDate || !toDate) {
      setFilteredAmount(0);
      return;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const filtered = advanceData.filter(entry => {
      const entryDate = new Date(entry.date);
      const isInDateRange = entryDate >= from && entryDate <= to;
      const isMatchingPayment =
        !filteredPaymentMode || entry.payment_mode === filteredPaymentMode;
      return isInDateRange && isMatchingPayment;
    });

    // ✅ Sum only the "amount" field, respecting positive/negative values
    const total = filtered.reduce((sum, entry) => {
      const amount = parseFloat(entry.amount) || 0;
      return sum + amount;
    }, 0);

    setFilteredAmount(total);
  }, [fromDate, toDate, filteredPaymentMode, advanceData]);
  // ✅ Calculate today's total amount (only using "amount" field)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTotal = advanceData
      .filter(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      })
      .reduce((sum, entry) => {
        const amount = parseFloat(entry.amount) || 0;
        return sum + amount;
      }, 0);

    setTodayAmount(todayTotal);
  }, [advanceData]);
  // ✅ Export PDF function
  const exportPDF = () => {
    const doc = new jsPDF();

    const entityType = selectedOption?.type === "Contractor" ? "Contractor" : "Vendor";
    const entityName = selectedOption?.label || "";
    const projectName = selectedSite?.label || "";

    doc.setFontSize(12);
    doc.text(`${entityType} - ${entityName}`, 14, 20);

    const pageWidth = doc.internal.pageSize.getWidth();
    const projectText = `Project Name: ${projectName}`;
    const textWidth = doc.getTextWidth(projectText);
    doc.text(projectText, pageWidth - textWidth - 14, 20);

    // ✅ Filter data first
    const filteredData = advanceData
      .filter(entry => {
        const isMatchingVendor =
          selectedOption?.type === 'Vendor'
            ? entry.vendor_id === selectedOption.id
            : selectedOption?.type === 'Contractor'
              ? entry.contractor_id === selectedOption.id
              : false;

        const isForCurrentProject = entry.project_id === selectedSite.id;
        return isMatchingVendor && isForCurrentProject;
      })
      // ✅ Sort by type (custom order) then mode
      .sort((a, b) => {
        const typeOrder = ["Advance", "Bill Settlement", "Refund", "Transfer"];
        const typeIndexA = typeOrder.indexOf((a.type || "").trim());
        const typeIndexB = typeOrder.indexOf((b.type || "").trim());

        if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;

        const modeA = (a.payment_mode || "").trim().toLowerCase();
        const modeB = (b.payment_mode || "").trim().toLowerCase();

        if (!modeA && modeB) return 1;
        if (modeA && !modeB) return -1;

        return modeA.localeCompare(modeB);
      });

    // ✅ Calculate total Advance amount
    const totalAdvance = filteredData
      .filter(entry => entry.type === "Advance")
      .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);

    // ✅ Show total in PDF below the project name
    doc.setFontSize(11);
    doc.text(`Total Advance: ₹${totalAdvance.toLocaleString('en-IN')}`, 10, 20);

    // ✅ Table columns
    const tableColumn = [
      "S.No",
      "Date",
      "Contractor/Vendor",
      "Project Name",
      "Advance",
      "Bill Amount",
      "Refund Amount",
      "Transfer",
      "Type",
      "Mode",
      "Description"
    ];

    // ✅ Table rows
    const tableRows = filteredData.map((entry, index) => {
      const {
        date,
        amount,
        bill_amount,
        type,
        transfer_site_id,
        payment_mode,
        refund_amount,
        contractor_vendor,
        project_name,
        description
      } = entry;

      const advanceAmount =
        type === 'Refund' ? '' : parseFloat(amount || 0).toLocaleString('en-IN');

      const billAmount =
        type === 'Bill Settlement'
          ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
          : '';

      const refundAmount =
        type === 'Refund'
          ? parseFloat(refund_amount || 0).toLocaleString('en-IN')
          : '';

      let transferText = '';
      if (type === 'Transfer') {
        const siteLabel = siteOptions.find(site => site.id === parseInt(transfer_site_id))?.label;
        transferText =
          parseFloat(amount) < 0
            ? `Transfer to ${siteLabel || 'Unknown Site'}`
            : `Transfer from ${siteLabel || 'Unknown Site'}`;
      }

      return [
        index + 1,
        new Date(date).toLocaleDateString('en-GB'),
        contractor_vendor || "",
        project_name || "",
        advanceAmount,
        billAmount,
        refundAmount,
        transferText,
        type,
        payment_mode || '',
        description || ''
      ];
    });

    // ✅ Generate PDF table
    doc.autoTable({
      startY: 34, // moved down because we added total above
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: { halign: "left" },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.1
      }
    });

    doc.save("Advance_Report.pdf");
  };
  // ✅ Export CSV function
  const exportCSV = () => {
    const entityType = selectedOption?.type === "Contractor" ? "Contractor" : "Vendor";
    const entityName = selectedOption?.label || "";
    const projectName = selectedSite?.label || "";

    const filteredData = advanceData.filter(entry => {
      const isMatchingVendor =
        selectedOption?.type === 'Vendor'
          ? entry.vendor_id === selectedOption.id
          : selectedOption?.type === 'Contractor'
            ? entry.contractor_id === selectedOption.id
            : false;

      const isForCurrentProject = entry.project_id === selectedSite.id;
      return isMatchingVendor && isForCurrentProject;
    });

    const rows = filteredData.map((entry, index) => {
      const { date, amount, bill_amount, type, transfer_site_id, payment_mode, refund_amount } = entry;

      const advanceAmount = (() => {
        if (type === 'Refund') {
          return `-${parseFloat(refund_amount || 0).toLocaleString('en-IN')}`;
        }
        return parseFloat(amount || 0).toLocaleString('en-IN');
      })();

      const billAmount =
        type === 'Bill Settlement'
          ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
          : '';

      let transferOrRefund = '';
      if (type === 'Refund') {
        transferOrRefund = 'Refund';
      } else if (type === 'Transfer') {
        const siteLabel = siteOptions.find(site => site.id === parseInt(transfer_site_id))?.label;
        transferOrRefund =
          parseFloat(amount) < 0
            ? `Transfer to ${siteLabel || 'Unknown Site'}`
            : `Transfer from ${siteLabel || 'Unknown Site'}`;
      }

      return {
        "S.No": index + 1,
        "Date": new Date(date).toLocaleDateString('en-GB'),
        "Advance": advanceAmount,
        "Bill": billAmount,
        "Transfer/Refund": transferOrRefund,
        "Mode": payment_mode || ''
      };
    });

    let csv = `${entityType}: ${entityName},Project Name: ${projectName}\n\n`;
    csv += Object.keys(rows[0] || {}).join(",") + "\n";
    rows.forEach(row => {
      csv += Object.values(row).map(value => `"${value}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Advance_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    const { totalAmount, totalRefund, totalBill } = advanceData.reduce(
      (acc, entry) => {
        acc.totalAmount += parseFloat(entry.amount) || 0;
        acc.totalRefund += parseFloat(entry.refund_amount) || 0;
        acc.totalBill += parseFloat(entry.bill_amount) || 0;
        return acc;
      },
      { totalAmount: 0, totalRefund: 0, totalBill: 0 }
    );
  
    const outstanding = totalAmount - totalRefund - totalBill;
  
    console.log("Total Amount:", totalAmount);
    console.log("Total Refund:", totalRefund);
    console.log("Total Bill:", totalBill);
    console.log("Outstanding:", outstanding);
  
    setTotalOutstanding(outstanding);
  }, [advanceData]);
  
  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAdvanceFile(file);
    }
    // This ensures the input is cleared even if the same file is selected again next time
    e.target.value = '';
  };
  const handleEditClick = (entry) => {
    setEditingId(entry.advancePortalId);
    setEditFormData({
      date: entry.date?.split('T')[0] || '',
      amount: entry.amount || '',
      project_id: entry.project_id || '',
      vendor_id: entry.vendor_id || '',
      contractor_id: entry.contractor_id || '',
      entry_no: entry.entry_no || '',
      week_no: entry.week_no || '',
      file_url: entry.file_url || '',
      description: entry.description || '',
      bill_amount: entry.bill_amount || '',
      type: entry.type || '',
      transfer_site_id: entry.transfer_site_id || '',
      payment_mode: entry.payment_mode || '',
      refund_amount: entry.refund_amount || ''
    });
    setIsEditModalOpen(true);
  };
  const handleUpdate = async () => {
    try {
      if (editFormData.type === "Transfer") {
        // Find all rows with the same entry_no
        const sameEntryRows = advanceData.filter(r => r.entry_no === editFormData.entry_no);

        if (sameEntryRows.length === 2) {
          const [record1, record2] = sameEntryRows;

          // Figure out which is being edited
          const editedRecord = sameEntryRows.find(r => r.advancePortalId === editingId);
          const otherRecord = sameEntryRows.find(r => r.advancePortalId !== editingId);

          // Ensure numeric
          const enteredAmount = parseFloat(editFormData.amount) || 0;

          // Prepare updated data
          const updatedEdited = {
            ...editFormData,
            transfer_site_id: parseInt(editFormData.transfer_site_id),
            amount: enteredAmount // positive
          };

          const updatedOther = {
            ...otherRecord,
            project_id: parseInt(editFormData.transfer_site_id), // new "to" site
            transfer_site_id: editedRecord.project_id, // old "from" site
            amount: -Math.abs(enteredAmount) // negative
          };

          // Send both PUT requests
          await Promise.all([
            fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/edit/${editedRecord.advancePortalId}?editedBy=${username}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedEdited)
            }),
            fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/edit/${otherRecord.advancePortalId}?editedBy=${username}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedOther)
            })
          ]);

        } else {
          console.warn('Could not find both Transfer records for entry_no:', editFormData.entry_no);
        }
      } else {
        // Normal single update
        const res = await fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/edit/${editingId}?editedBy=${username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editFormData)
        });

        if (!res.ok) throw new Error('Failed to update');
      }
      window.location.reload();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <body>
      <div>
        <div className='bg-white w-[1700px] h-[150px] ml-10 text-left'>
          <div className='flex'>
            <div className='pt-9 pl-10'>
              <h2 className='font-semibold'>From Date</h2>
              <input
                type='date'
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className='border-2 border-[#BF9853] border-opacity-30 rounded-lg pl-3 mt-2 w-[168px] h-[45px] focus:outline-none'
              />
            </div>
            <div className='pt-9 pl-10'>
              <h2 className='font-semibold'>To Date</h2>
              <input
                type='date'
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className='border-2 border-[#BF9853] border-opacity-30 rounded-lg pl-3 mt-2 w-[168px] h-[45px] focus:outline-none'
              />
            </div>
            <div className='pt-9 pl-10'>
              <h2 className='font-semibold'>Amount Given</h2>
              <input
                readOnly
                value={filteredAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                className='bg-[#F2F2F2] rounded-lg mt-2 p-2 w-[107px] h-[45px] focus:outline-none'
              />
            </div>
            <div className='pt-[60px] pl-5'>
              <select
                value={filteredPaymentMode}
                onChange={(e) => setFilteredPaymentMode(e.target.value)}
                className='w-[163px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 mt-2 rounded-lg focus:outline-none'
              >
                <option value=''>Select</option>
                <option value='Cash'>Cash</option>
                <option value='GPay'>GPay</option>
                <option value='Net Banking'>Net Banking</option>
                <option value='Cheque'>Cheque</option>
              </select>
            </div>
            <div className='pt-9 pl-10'>
              <h2 className='font-semibold'>Today Amount</h2>
              <input
                readOnly
                type='text'
                value={todayAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                className='bg-[#F2F2F2] rounded-lg mt-2 p-2 w-[144px] h-[45px] focus:outline-none'
              />
            </div>
            <div className='pt-9 pl-10'>
              <h2 className='font-semibold'>Total Outstanding</h2>
              <input
                readOnly
                type='text'
                value={totalOutstanding.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                className='bg-[#F2F2F2] p-2 rounded-lg mt-2 w-[144px] h-[45px] focus:outline-none'
              />
            </div>
          </div>
        </div>
        <div className='ml-4 p-6  gap-6'>
          {/* Form */}
          <div className='bg-white w-[1700px] p-6 rounded-md shadow-sm flex '>
            <div className='grid grid-cols-2 gap-4 text-left h-[500px]'>
              {/* Select Type */}
              <div className='flex items-center gap-3'>
                <label className='font-semibold text-[#E4572E]'>Select Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setSelectedType(newType);
                    setAdvanceAmount('');
                    setBillAmount('');
                  }}
                  className='w-[163px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
                >
                  <option value=''>Select Type...</option>
                  <option value='Advance'>Advance</option>
                  <option value='Bill Settlement'>Bill Settlement</option>
                  <option value='Refund'>Refund</option>
                  <option value='Transfer'>Transfer</option>
                </select>
              </div>
              {/* Date */}
              <div className='flex items-center gap-3'>
                <label className='font-semibold text-[#E4572E]'>Date</label>
                <input
                  type='date'
                  placeholder='dd-mm-yyyy'
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className='w-[144px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
                />
              </div>
              {/* Contractor/Vendor */}
              <div className=''> <div className='flex'>
                <label className='font-semibold block'>Contractor/Vendor<span className="text-red-500">*</span></label>
              </div>
                <Select
                  options={combinedOptions}
                  value={selectedOption}
                  onChange={handleChange}
                  className='w-[263px] h-[45px] rounded-lg focus:outline-none'
                  isClearable
                  styles={customStyles}
                />
              </div>
              {/* Overall Advance */}
              <div>
                <label className='font-semibold block'>Overall Advance</label>
                <input
                  value={overallAdvance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  disabled
                  className='w-[263px] h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none'
                />
              </div>
              {/* Project Name */}
              <div>
                <label className='font-semibold block'>Project Name<span className="text-red-500">*</span></label>
                <Select
                  options={sortedSiteOptions || []}
                  placeholder="Select a site..."
                  isSearchable={true}
                  value={selectedSite}
                  onChange={handleProjectChange}
                  styles={customStyles}
                  isClearable
                  className='w-[263px] h-[45px] focus:outline-none'
                />
              </div>
              {/* Project Advance */}
              {selectedType !== 'Bill Settlement' && (
                <div>
                  <label className='font-semibold block'>Project Advance</label>
                  <input
                    value={projectAdvance}
                    readOnly
                    onChange={(e) => setProjectAdvance(e.target.value)}
                    className='w-[263px] h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none'
                  />
                </div>
              )}
              {/* Bill Amount (only for Bill Settlement) */}
              {selectedType === 'Bill Settlement' && (
                <div>
                  <label className='font-semibold block'>Bill Amount<span className="text-red-500">*</span></label>
                  <input
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className='w-[263px] h-[45px] px-2 py-1 rounded-lg border-2 border-[#BF9853] border-opacity-30 focus:outline-none'
                  />
                </div>
              )}
              {/* Transfer Amount */}
              <div>
                <label className='font-semibold block'>
                  {selectedType === 'Transfer'
                    ? 'Transfer Amount'
                    : selectedType === 'Refund'
                      ? 'Refund Amount'
                      : 'Amount Given'}<span className="text-red-500">*</span>
                </label>
                <input
                  value={formatWithCommas(advanceAmount)}
                  onChange={handleAmountChange}
                  className='w-[263px] h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
                />
              </div>
              {/* Conditional Dropdown */}
              <div className=''>
                {selectedType === 'Transfer' ? (
                  <>
                    <label className='font-semibold block'>Project Name</label>
                    <Select
                      options={sortedSiteOptions}
                      placeholder="Select a site..."
                      isSearchable
                      value={sortedSiteOptions.find(option => option.id === parseInt(transferSiteId)) || null}
                      onChange={(selected) => setTransferSiteId(selected ? selected.id : '')}
                      styles={customStyles}
                      isClearable
                      className='w-[263px] h-[45px] focus:outline-none'
                    />
                  </>
                ) : (
                  <>
                    <label className='font-semibold block'>Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className='w-[263px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'>
                      <option value=''>Select</option>
                      <option value='Cash'>Cash</option>
                      <option value='GPay'>GPay</option>
                      <option value='Net Banking'>Net Banking</option>
                    </select>
                  </>
                )}
              </div>
              {/* Description */}
              <div className='col-span-2'>
                <label className='font-semibold block'>Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className='w-full border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'>
                </textarea>
              </div>
              <div className='mt-2'>
                <div className="md:col-span-2 items-center flex">
                  <div className='flex'>
                    <label htmlFor="fileInput" className="cursor-pointer flex items-center text-orange-600">
                      <img className='w-5 h-4' alt='' src={Attach}></img>
                      Attach file
                    </label>
                    <input type="file" id="fileInput" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  </div>
                  {selectedAdvanceFile && <span className="text-gray-600 ml-10">{selectedAdvanceFile.name}</span>}
                </div>
                <button
                  className='bg-[#c7934c] text-white mt-3 w-[120px] h-[33px] rounded flex items-center justify-center'
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : getButtonLabel()}
                </button>
                <ToastContainer
                  position="top-right"  // change this
                  autoClose={3000}
                  hideProgressBar={false}
                  closeOnClick
                  pauseOnHover
                  draggable
                  theme="colored"
                />
              </div>
            </div>
            <div className='flex ml-20'>
              <div>
                <div className='space-x-4 flex ml-[550px] mb-4'>
                  <input
                    readOnly
                    value={projectAdvance}
                    className='border-2 w-[112px] p-2 border-[#E4572E] text-[#E4572E] font-bold border-opacity-10 rounded h-[33px] bg-[#F2F2F2] focus:outline-none'
                  />
                  <span onClick={exportPDF} className='text-[#E4572E] mr-9 font-semibold hover:underline cursor-pointer'>Export pdf</span>
                  <span onClick={exportCSV} className='text-[#007233] mr-9 font-semibold hover:underline cursor-pointer'>Export XL</span>
                  <span className=' text-[#BF9853] mr-9 font-semibold hover:underline'>Print</span>
                </div>
                <div className='border-l-8 border-l-[#BF9853] rounded-lg  h-[400px] overflow-auto'>
                  {selectedOption && selectedSite && (
                    <table className="w-[900px]">
                      <thead className="bg-[#FAF6ED] text-left">
                        <tr>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Advance</th>
                          <th className="px-3 py-2">Bill</th>
                          <th className="px-3 py-2">Transfer/Refund</th>
                          <th className="px-3 py-2">Mode</th>
                          <th className="px-3 py-2">Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {advanceData
                          .filter(entry => {
                            const isMatchingVendor =
                              selectedOption?.type === 'Vendor'
                                ? entry.vendor_id === selectedOption.id
                                : selectedOption?.type === 'Contractor'
                                  ? entry.contractor_id === selectedOption.id
                                  : false;

                            // Only show rows where the project_id matches the current site
                            const isForCurrentProject = entry.project_id === selectedSite.id;

                            return isMatchingVendor && isForCurrentProject;
                          })
                          .sort((a, b) => {
                            const timeA = new Date(a.date || a.timestamp).getTime() || 0;
                            const timeB = new Date(b.date || b.timestamp).getTime() || 0;
                            return timeB - timeA;
                          })
                          .map((entry, index) => {
                            const {
                              date,
                              amount,
                              bill_amount,
                              type,
                              transfer_site_id,
                              payment_mode,
                              refund_amount
                            } = entry;

                            // Format advance amount
                            const advanceAmount = (() => {
                              if (type === 'Refund') {
                                return `-${parseFloat(refund_amount || 0).toLocaleString('en-IN')}`;
                              }
                              return parseFloat(amount || 0).toLocaleString('en-IN');
                            })();

                            // Format bill amount
                            const billAmount =
                              type === 'Bill Settlement'
                                ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
                                : '';

                            // Determine Transfer/Refund label
                            let transferOrRefund = '';
                            if (type === 'Refund') {
                              transferOrRefund = 'Refund';
                            } else if (type === 'Transfer') {
                              const relatedSiteId = transfer_site_id; // the opposite project
                              const siteLabel = siteOptions.find(site => site.id === parseInt(relatedSiteId))?.label;
                              transferOrRefund =
                                parseFloat(amount) < 0
                                  ? `Transfer to ${siteLabel || 'Unknown Site'}`
                                  : `Transfer from ${siteLabel || 'Unknown Site'}`;
                            }

                            return (
                              <tr key={index} className="border-t">
                                <td className="px-3 py-2 text-sm font-semibold">
                                  {new Date(date).toLocaleDateString('en-GB')}
                                </td>
                                <td className="px-3 py-2 text-sm text-left font-semibold">
                                  {advanceAmount}
                                </td>
                                <td className="px-3 py-2 text-sm text-left font-semibold">
                                  {billAmount}
                                </td>
                                <td className="px-3 py-2 text-sm text-left font-semibold">
                                  {transferOrRefund}
                                </td>
                                <td className="px-3 py-2 text-sm text-left font-semibold">
                                  {payment_mode}
                                </td>
                                <td className="px-3 py-2">
                                  <button className="rounded-full transition duration-200 ml-2 mr-3">
                                    <img
                                      src={edit}
                                      onClick={() => handleEditClick(entry)}
                                      alt="Edit"
                                      className=" w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                                    />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[600px]">
              <h2 className="text-lg font-bold mb-4">Edit Entry</h2>
              <div className=' ml-10 text-left'>
                <div>
                  <div className='flex gap-10'>
                    <div>
                      <label className="mb-2 font-semibold block">Date</label>
                      <input
                        type="date"
                        value={editFormData.date}
                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                        className="border-2 border-[#BF9853] border-opacity-30 w-[220px] h-[45px] mb-3 pl-3 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      {/* Amount */}
                      <label className="block mb-2 font-semibold">Amount</label>
                      <input
                        type="number"
                        value={editFormData.amount}
                        onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                        className="border-2 border-[#BF9853] border-opacity-30 w-[220px] h-[45px] mb-3 rounded-lg no-spinner focus:outline-none"
                      />
                    </div>
                  </div>
                  {/* Bill Amount */}
                  <div className='flex gap-10'>
                    <div>
                      <label className="block mb-2 font-semibold">Bill Amount</label>
                      <input
                        type="number"
                        value={editFormData.bill_amount}
                        onChange={(e) => setEditFormData({ ...editFormData, bill_amount: e.target.value })}
                        className="border-2 border-[#BF9853] border-opacity-30  w-[220px] h-[45px] mb-3 rounded-lg no-spinner focus:outline-none"
                      />
                    </div>
                    {/* Type */}
                    <div>
                      <label className="block mb-2 font-semibold">Type</label>
                      <select
                        value={editFormData.type}
                        onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                        className="border-2 border-[#BF9853] border-opacity-30 w-[220px] h-[45px] mb-3 rounded-lg focus:outline-none"
                      >
                        <option value="">Select Type</option>
                        <option value="Advance">Advance</option>
                        <option value="Bill Settlement">Bill Settlement</option>
                        <option value="Refund">Refund</option>
                        <option value="Transfer">Transfer</option>
                      </select>
                    </div>
                  </div>
                  {/* Payment Mode */}
                  <div className='flex gap-10'>
                    <div>
                      <label className="block mb-2 font-semibold">Payment Mode</label>
                      <select
                        value={editFormData.payment_mode}
                        onChange={(e) => setEditFormData({ ...editFormData, payment_mode: e.target.value })}
                        className="border-2 border-[#BF9853] border-opacity-30 w-[220px] h-[45px] mb-3 rounded-lg focus:outline-none"
                      >
                        <option value="">Select</option>
                        <option value="Cash">Cash</option>
                        <option value="GPay">GPay</option>
                        <option value="Net Banking">Net Banking</option>
                      </select>
                    </div>
                    {/* Refund Amount */}
                    <div>
                      <label className="block mb-2 font-semibold">Refund Amount</label>
                      <input
                        type="number"
                        value={editFormData.refund_amount}
                        onChange={(e) => setEditFormData({ ...editFormData, refund_amount: e.target.value })}
                        className="border-2 border-[#BF9853] border-opacity-30 w-[220px] h-[45px] mb-3 rounded-lg no-spinner focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                {/* Transfer Site ID (Searchable) */}
                <div>
                  <label className="block mb-2 font-semibold">Transfer Site</label>
                  <Select
                    options={sortedSiteOptions}
                    value={sortedSiteOptions.find(site => site.id === editFormData.transfer_site_id) || null}
                    onChange={(selected) => setEditFormData({ ...editFormData, transfer_site_id: selected?.id || '' })}
                    isClearable
                    isSearchable
                    styles={customStyles}
                    className="mb-3 w-[480px] h-[45px] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex ml-[300px] gap-3 mt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className=" w-[100px] h-[45px] border border-[#BF9853] rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className=" w-[100px] h-[45px] bg-[#BF9853] text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </body>
  )
}
export default AdvancePortal