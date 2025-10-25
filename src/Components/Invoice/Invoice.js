import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import CreatableSelect from 'react-select/creatable';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Select from 'react-select';
import add from '../Images/Right.svg'
import delt from '../Images/Worng.svg';
import delet from '../Images/Delete.svg'
const validateSizeInput = (input, unit) => {
  if (!input) return false;
  switch (unit) {
    case 'SQFT':
    case 'M²':
      return /^(\d+'?\d*"?)x(\d+'?\d*"?)$/.test(input) || /^\d+(\.\d+)?x\d+(\.\d+)?$/.test(input);
    case 'CFT':
    case 'M³':
      return /^(\d+'?\d*"?)x(\d+'?\d*"?)x(\d+'?\d*"?)$/.test(input) || /^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?$/.test(input);
    case 'RFT':
      return /^(\d+'?\d*"?)$/.test(input);
    case 'NOS':
      return /^[0-9+\-*/x().\s]+$/.test(input);
    case 'L.S':
      return /^[0-9+\-*/x().\s]+$/.test(input);
    case 'L':
      return /^(\d+'?\d*"?)x(\d+'?\d*"?)x(\d+'?\d*"?)$/.test(input) || /^\d+(\.\d+)?$/.test(input);
    default:
      return true;
  }
};
const descriptions = [
  { value: 'Masonry Works', label: 'Masonry Works', id: 1 },
  { value: 'Tilina Works', label: 'Tilina Works', id: 2 },
  { value: 'Metal Works', label: 'Metal Works', id: 3 },
];
const subItems = [
  { value: 'Cement Flooring-First Floor', label: 'Cement Flooring-First Floor', id: 1 },
  { value: 'GF Veranda Floor Tile', label: 'GF Veranda Floor Tile', id: 2 },
  { value: 'First Floor Bathroom Floor Tile', label: 'First Floor Bathroom Floor Tile', id: 3 },
  { value: 'Terrace Roof Sheet', label: 'Terrace Roof Sheet', id: 4 },
];
const units = [
  { value: '', label: 'Select...' },
  { value: 'RFT', label: 'RFT' },
  { value: 'SQFT', label: 'SQFT' },
  { value: 'CFT', label: 'CFT' },
  { value: 'L', label: 'L' },
  { value: 'M²', label: 'M²' },
  { value: 'M³', label: 'M³' },
  { value: 'NOS', label: 'NOS' },
  { value: 'L.S', label: 'L.S' },
];
const clients = [
  { value: 'Mr. Sivaraman', label: 'Mr. Sivaraman', id: 1 },
  { value: 'Ms. Anjali', label: 'Ms. Anjali', id: 2 },
  { value: 'Mr. Kumar', label: 'Mr. Kumar', id: 3 },
  { value: 'Mr. Patel', label: 'Mr. Patel', id: 4 },
];
const projectTypes = [
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Industrial', label: 'Industrial' },
];
function InvoiceTable() {
  const [items, setItems] = useState([
    {
      description: 'Masonry Works',
      workType: 'Structural',
      subItems: [
        {
          description: 'Cement Flooring-First Floor',
          sizeInput: '',
          qty: '',
          rate: '',
          unit: '',
          amount: '',
          // Separate data for main row
          mainRow: {
            sizeInput: '',
            qty: '',
            rate: '',
            unit: '',
            amount: ''
          }
        },
      ],
    },
  ]);
  const findOption = (options, value) =>
    options.find((opt) => opt.value === value) || null;
  // Group flat items by main description for correct UI structure
  const mapFetchedItems = (flatItems = []) => {
    const grouped = {};
    flatItems.forEach((item, idx) => {
      // Use main description from item (string or object)
      const mainDescValue = item.description?.value || item.description || "";
      if (!grouped[mainDescValue]) {
        grouped[mainDescValue] = {
          description: findOption(descriptions, mainDescValue) || { value: mainDescValue, label: mainDescValue },
          workType: item.workType || "",
          subItems: []
        };
      }
      grouped[mainDescValue].subItems.push({
        description: findOption(subItems, item.sub_description || item.subItemDescription || item.description) ||
          { value: item.sub_description || item.subItemDescription || "", label: item.sub_description || item.subItemDescription || "" },
        sizeInput: item.size_input || item.sizeInput || "",
        qty: item.qty || "",
        rate: item.rate || "",
        unit: findOption(units, item.unit) || { value: item.unit || "", label: item.unit || "" },
        amount: item.amount || "",
        mainRow: {
          sizeInput: item.size_input || item.sizeInput || "",
          qty: item.qty || "",
          rate: item.rate || "",
          unit: findOption(units, item.unit) || { value: item.unit || "", label: item.unit || "" },
          amount: item.amount || ""
        },
        key: item.item_id || idx
      });
    });
    return Object.values(grouped);
  };

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('invoiceItems');
      const savedClientName = localStorage.getItem('invoiceClientName');
      const savedProjectType = localStorage.getItem('invoiceProjectType');
      const savedInvoiceDate = localStorage.getItem('invoiceDate');
      const savedAmountPaid = localStorage.getItem('invoiceAmountPaid');

      if (savedItems) setItems(mapFetchedItems(JSON.parse(savedItems)));
      if (savedClientName) setClientName(JSON.parse(savedClientName));
      if (savedProjectType) setProjectType(JSON.parse(savedProjectType));
      if (savedInvoiceDate) setInvoiceDate(savedInvoiceDate);
      if (savedAmountPaid) setAmountPaid(savedAmountPaid);
    } catch (error) {
      console.error('Failed to load invoice data from localStorage', error);
    }
  }, []);
  const handleRemoveSubItem = (itemIndex, subItemIndex) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].subItems.splice(subItemIndex, 1);
    setItems(updatedItems);
  };
  const parseQty = (qtyStr) => {
    if (!qtyStr) return 0;
    const numStr = qtyStr.toString().replace(/[^\d.-]/g, '');
    return parseFloat(numStr) || 0;
  };
  const handleInputChangeForRow = (e, itemIndex, subItemIndex, isMainRow = false) => {
    const { value } = e.target;
    const updatedItems = [...items];
    const subItem = updatedItems[itemIndex].subItems[subItemIndex];
    const selectedUnit = isMainRow
      ? subItem.mainRow.unit?.value || 'SQFT'
      : subItem.unit?.value || 'SQFT';
    if (isMainRow) {
      subItem.mainRow.sizeInput = value;
    } else {
      subItem.sizeInput = value;
    }
    const isValid = validateSizeInput(value, selectedUnit);
    if (isValid) {
      if (selectedUnit === "SQFT" || selectedUnit === "M²") {
        const area = calculateArea(value, selectedUnit);
        if (isMainRow) {
          subItem.mainRow.qty = `${area} ${selectedUnit === "SQFT" ? "Sqft" : "m²"}`;
        } else {
          subItem.qty = `${area} ${selectedUnit === "SQFT" ? "Sqft" : "m²"}`;
        }
      } else if (selectedUnit === "CFT" || selectedUnit === "M³") {
        const volume = calculateVolume(value, selectedUnit);
        if (isMainRow) {
          subItem.mainRow.qty = `${volume} ${selectedUnit === "CFT" ? "Cubic Feet" : "m³"}`;
        } else {
          subItem.qty = `${volume} ${selectedUnit === "CFT" ? "Cubic Feet" : "m³"}`;
        }
      } else if (selectedUnit === "RFT") {
        const length = convertToFeet(value);
        const qtyStr = isNaN(length) ? "Invalid input" : `${length.toFixed(2)} ft`;
        if (isMainRow) {
          subItem.mainRow.qty = qtyStr;
        } else {
          subItem.qty = qtyStr;
        }
      } else if (selectedUnit === "L") {
        const liters = calculateLiters(value);
        if (isMainRow) {
          subItem.mainRow.qty = `${liters} L`;
        } else {
          subItem.qty = `${liters} L`;
        }
      } else if (selectedUnit === "NOS" || selectedUnit === "L.S") {
        // Evaluate arithmetic expressions for NOS and L.S units
        const evalQty = evaluateExpression(value);
        if (isMainRow) {
          subItem.mainRow.qty = isNaN(evalQty) ? "Invalid input" : `${evalQty}`;
        } else {
          subItem.qty = isNaN(evalQty) ? "Invalid input" : `${evalQty}`;
        }
      } else {
        if (isMainRow) {
          subItem.mainRow.qty = "";
        } else {
          subItem.qty = "";
        }
      }
    } else {
      if (isMainRow) {
        subItem.mainRow.qty = "";
      } else {
        subItem.qty = "";
      }
    }
    // Calculate amount if quantity and rate exist
    if (isMainRow) {
      if (subItem.mainRow.qty && subItem.mainRow.rate) {
        const qtyValue = parseQty(subItem.mainRow.qty);
        subItem.mainRow.amount = (qtyValue * subItem.mainRow.rate).toFixed(2);
      } else {
        subItem.mainRow.amount = '';
      }
    } else {
      if (subItem.qty && subItem.rate) {
        const qtyValue = parseQty(subItem.qty);
        subItem.amount = (qtyValue * subItem.rate).toFixed(2);
      } else {
        subItem.amount = '';
      }
    }
    setItems(updatedItems);
  };
  const [amountPaid, setAmountPaid] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectNameOptions, setProjectNameOptions] = useState([]);
  const [selectedProjectName, setSelectedProjectName] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const clientPhone = "9876543210";
  const [invoiceVersions, setInvoiceVersions] = useState([]);
  const [baseInvoiceNumber, setBaseInvoiceNumber] = useState('');
  const [invoiceCache, setInvoiceCache] = useState({});
  const [projectTypeOptions, setProjectTypeOptions] = useState([]);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [allInvoices, setAllInvoices] = useState([]);
 const getBaseInvoiceNumber = (invoiceNumber) => {
  if (!invoiceNumber) return "";
  return invoiceNumber.includes(".") ? invoiceNumber.split(".")[0] : invoiceNumber;
};

const generateNewInvoiceNumber = (existingInvoiceNumbers = [], currentInvoiceNumber = "") => {
  const baseInv = getBaseInvoiceNumber(currentInvoiceNumber) || "INV200-01";

  // Find all suffix numbers for this base invoice
  const suffixes = existingInvoiceNumbers
    .filter(num => num.startsWith(baseInv))
    .map(num => {
      if (num === baseInv) return 0;
      const suffixStr = num.slice(baseInv.length + 1);
      const suffixNum = parseFloat(suffixStr);
      return isNaN(suffixNum) ? 0 : suffixNum;
    });

  const maxSuffix = Math.max(...suffixes, 0);

  if (maxSuffix === 0) {
    return baseInv;
  } else {
    // Increment decimal suffix by +0.1 for next version
    return `${baseInv}.${(maxSuffix + 0.1).toFixed(1)}`;
  }
};
  useEffect(() => {
    async function fetchAllInvoices() {
      try {
        const res = await axios.get("https://backendaab.in/aabuildersDash/api/invoices/all-with-items");
        // res.data is an array of objects with shape {invoice: {...}, items: [...]}
        setAllInvoices(res.data);
      } catch (error) {
        console.error("Failed to fetch invoices", error);
      }
    }
    fetchAllInvoices();
  }, []);
  useEffect(() => {
    if (
      projectNameOptions.length > 0 &&
      projectTypeOptions.length > 0 &&
      invoiceNumber &&
      currentInvoice
    ) {
      const selectedProjectNameOption =
        projectNameOptions.find(opt => opt.value === currentInvoice.project_id) || null;
      const selectedProjectTypeOption =
        projectTypeOptions.find(opt => opt.value === currentInvoice.project_type) || null;

      ReactDOM.unstable_batchedUpdates(() => {
        setSelectedProjectName(selectedProjectNameOption);
        setProjectType(selectedProjectTypeOption);
      });
    }
  }, [projectNameOptions, projectTypeOptions, invoiceNumber, currentInvoice]);
  useEffect(() => {
    const fetchProjectNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        const formattedProjects = data.map(item => ({
          value: item.id,
          label: item.siteName,
          siteNo: item.siteNo
        }));

        setProjectNameOptions(formattedProjects);
      } catch (error) {
        console.error("Failed to fetch project names:", error);
      }
    };
    fetchProjectNames();
  }, []);

const handleProjectNameChange = (selectedOption) => {
  setSelectedProjectName(selectedOption);

  if (!selectedOption) {
    setInvoiceVersions([]);
    setInvoiceNumber("");
    return;
  }

  // Filter invoices related to the selected project
  const filteredInvoices = allInvoices.filter(invEntry =>
    Number(invEntry.invoice.project_id) === Number(selectedOption.value)
  );

  // Extract all invoice numbers (including versions with decimal suffixes)
  const existingInvoiceNumbers = filteredInvoices.map(invEntry => invEntry.invoice.invoice_number);

  let invoiceOptions = filteredInvoices.map(invEntry => ({
    value: invEntry.invoice.invoice_number,
    label: invEntry.invoice.invoice_number,
  }));

  if (invoiceOptions.length === 0) {
    // If no invoices exist, generate a new invoice number base
    const newInvNum = generateNewInvoiceNumber([], "INV200-01");
    invoiceOptions = [{ value: newInvNum, label: newInvNum }];
    setInvoiceVersions(invoiceOptions);
    setInvoiceNumber(newInvNum);
    return;
  }

  setInvoiceVersions(invoiceOptions);

  // If current invoice number exists in options, keep it, else pick first available invoice number
  if (invoiceOptions.some(opt => opt.value === invoiceNumber)) {
    setInvoiceNumber(invoiceNumber);
  } else {
    setInvoiceNumber(invoiceOptions[0].value);
  }
};
  const [cachedInvoiceVersions, setCachedInvoiceVersions] = useState([]);
  useEffect(() => {
    if (!invoiceNumber) return;
    const baseInvNum = invoiceNumber.includes('.') ? invoiceNumber.split('.')[0] : invoiceNumber;
    setBaseInvoiceNumber(baseInvNum);
    axios.get(`https://backendaab.in/aabuildersDash/api/invoices/versions/${encodeURIComponent(baseInvNum)}`)
      .then(res => {
        const fetchedOptions = res.data.map(invNum => ({ value: invNum, label: invNum }));
        // Ensure base invoice is in the list
        if (!fetchedOptions.find(o => o.value === baseInvNum)) {
          fetchedOptions.unshift({ value: baseInvNum, label: baseInvNum });
        }
        // Update cache first to keep consistent source of truth
        setCachedInvoiceVersions(prevCache => {
          const cacheValues = new Set(prevCache.map(o => o.value));
          const newCacheEntries = fetchedOptions.filter(opt => !cacheValues.has(opt.value));
          return [...prevCache, ...newCacheEntries];
        });
        // Merge with previous state to keep cumulative list for dropdown
        setInvoiceVersions(prevOptions => {
          const existingValues = new Set(prevOptions.map(o => o.value));
          const newOptions = fetchedOptions.filter(opt => !existingValues.has(opt.value));
          return [...prevOptions, ...newOptions];
        });
      })
      .catch(err => {
        console.error('Failed to load invoice versions:', err);
        // On error fallback to cache or last known invoice number
        setInvoiceVersions(cachedInvoiceVersions.length > 0 ? cachedInvoiceVersions : [{ value: invoiceNumber, label: invoiceNumber }]);
      });
  }, [invoiceNumber]);
  useEffect(() => {
    if (!invoiceNumber) return;
    axios.get(`https://backendaab.in/aabuildersDash/api/invoices/${encodeURIComponent(invoiceNumber)}`)
      .then(res => {
        const { invoice, items } = res.data;
        if (invoice) {
          setInvoiceDate(invoice.date || '');
          setClientName(invoice.client_name ? findOption(clients, invoice.client_name) : null);
          setClientAddress(invoice.client_address || '');
          setAmountPaid(invoice.amount_paid || '');
          const mappedItems = mapFetchedItems(items || []);
          setItems(mappedItems);
          // NEW: Set currentInvoice for dropdown synchronization
          setCurrentInvoice(invoice);
        }
      })
      .catch(() => {
        try {
          const savedItems = localStorage.getItem('invoiceItems');
          const savedClientName = localStorage.getItem('invoiceClientName');
          const savedProjectType = localStorage.getItem('invoiceProjectType');
          const savedInvoiceDate = localStorage.getItem('invoiceDate');
          const savedAmountPaid = localStorage.getItem('invoiceAmountPaid');
          if (savedItems) setItems(mapFetchedItems(JSON.parse(savedItems)));
          if (savedClientName) setClientName(JSON.parse(savedClientName));
          if (savedProjectType) setProjectType(JSON.parse(savedProjectType));
          if (savedInvoiceDate) setInvoiceDate(savedInvoiceDate);
          if (savedAmountPaid) setAmountPaid(savedAmountPaid);
        } catch (error) {
          console.error('Failed to load invoice data from localStorage', error);
        }
      });
  }, [invoiceNumber]);
  const refreshInvoiceVersions = async (baseInvoiceNumber) => {
    try {
      const res = await axios.get(
        `https://backendaab.in/aabuildersDash/api/invoices/versions/${encodeURIComponent(baseInvoiceNumber)}`
      );
      const options = res.data.map(invNum => ({ value: invNum, label: invNum }));
      // Ensure the base invoice number is included
      if (!options.find(o => o.value === baseInvoiceNumber)) {
        options.unshift({ value: baseInvoiceNumber, label: baseInvoiceNumber });
      }
      setInvoiceVersions(options);
    } catch (error) {
      console.error("Failed to refresh invoice versions:", error);
    }
  };
  const handleInvoiceVersionChange = async (selectedOption) => {
    if (!selectedOption) return;
    const selectedInvoiceNum = selectedOption.value;
    setInvoiceNumber(selectedInvoiceNum);
    try {
      let invoiceData = invoiceCache[selectedInvoiceNum];
      if (!invoiceData) {
        const res = await axios.get(
          `https://backendaab.in/aabuildersDash/api/invoices/${encodeURIComponent(selectedInvoiceNum)}`,
          { headers: { "Content-Type": "application/json" } }
        );
        invoiceData = {
          invoice: res.data.invoice,
          items: mapFetchedItems(res.data.items || []),
        };
        setInvoiceCache(prev => ({ ...prev, [selectedInvoiceNum]: invoiceData }));
      }
      const { invoice, items } = invoiceData;
      const projectNameOption = projectNameOptions.find(opt => opt.value === invoice.project_id) || null;
      const projectTypeOption = projectTypes.find(opt => opt.value === invoice.project_type) || null;
      const clientOption = clients.find(c => c.id === invoice.client_id) || null;
      // Batch all state updates to avoid intermediate empty UI flicker
      ReactDOM.unstable_batchedUpdates(() => {
        setInvoiceDate(invoice.date || "");
        setClientName(clientOption);
        setClientAddress(invoice.client_address || "");
        setSelectedProjectName(projectNameOption);
        setProjectType(projectTypeOption);
        setAmountPaid(invoice.amount_paid || 0);
        setItems(items);
      });
    } catch (error) {
      console.error("Failed to fetch invoice details on dropdown change:", error);
    }
  };
  const calculateTotalAmount = () => {
    return (items || []).reduce(
      (total, item) =>
        total +
        (item.subItems || []).reduce((subTotal, sub) => subTotal + parseFloat(sub.amount || 0), 0),
      0
    );
  };
  // Load from localStorage on mount (run once)
  // Clear all previously saved invoice-related localStorage values and reset the state on mount
  useEffect(() => {
    localStorage.removeItem('invoiceItems');
    localStorage.removeItem('invoiceClientName');
    localStorage.removeItem('invoiceProjectType');
    localStorage.removeItem('invoiceDate');
    localStorage.removeItem('invoiceAmountPaid');

    setItems([]);           // Invoice table blank
    setClientName(null);    // Client name dropdown blank
    setProjectType(null);   // Project type dropdown blank
    setInvoiceDate('');     // Date blank
    setAmountPaid('');      // Amount paid blank
    setInvoiceNumber('');   // Invoice number blank if needed
  }, []);

  // (DO NOT include or comment out the useEffect that saves to localStorage)

  // Save to localStorage on any of these change
  /* useEffect(() => {
     localStorage.setItem('invoiceItems', JSON.stringify(items));
     localStorage.setItem('invoiceClientName', JSON.stringify(clientName));
     localStorage.setItem('invoiceProjectType', JSON.stringify(projectType));
     localStorage.setItem('invoiceDate', invoiceDate);
     localStorage.setItem('invoiceAmountPaid', amountPaid);
   }, [items, clientName, projectType, invoiceDate, amountPaid]);*/
  // Fixed code: on mount, load invoice number from localStorage if exists, else generate new once
  // Initialize or generate invoice number on mount
useEffect(() => {
  localStorage.removeItem("lastInvoiceNumber");  // Clear legacy localStorage
  localStorage.removeItem("invoiceNumber");

  async function initializeInvoices() {
    try {
      const res = await axios.get("https://backendaab.in/aabuildersDash/api/invoices/all-with-items");
      const invoices = res.data || [];
      setAllInvoices(invoices);

      // Extract existing invoice numbers from backend data
      const existingInvoiceNumbers = invoices.map(inv => inv.invoice.invoice_number);
      const baseInv = "INV200-1";  // or compute your base dynamically if needed

      // Generate new invoice number using your versioning logic
      const newInvNum = generateNewInvoiceNumber(existingInvoiceNumbers, baseInv);
      setInvoiceNumber(newInvNum);
      localStorage.setItem("lastInvoiceNumber", newInvNum);
      localStorage.setItem("invoiceNumber", newInvNum);

      // Create dropdown options of base invoice numbers (excluding suffixes)
      const baseInvoiceNumbers = [...new Set(existingInvoiceNumbers.map(num => num.split('.')[0]))];
      const invoiceOptions = baseInvoiceNumbers.map(num => ({ value: num, label: num }));
      setInvoiceVersions(invoiceOptions);
    } catch (error) {
      console.error("Failed to initialize invoices", error);
    }
  }
  initializeInvoices();
}, []);


  // Clear all other invoice state and localStorage on mount, but NOT invoice number
  useEffect(() => {
    localStorage.removeItem('invoiceItems');
    localStorage.removeItem('invoiceClientName');
    localStorage.removeItem('invoiceProjectType');
    localStorage.removeItem('invoiceDate');
    localStorage.removeItem('invoiceAmountPaid');

    setItems([]);
    setClientName(null);
    setProjectType(null);
    setInvoiceDate('');
    setAmountPaid('');
    // Keep invoiceNumber intact here
  }, []);

  // DO NOT include or comment out any saving-to-localStorage useEffect
  // to prevent repopulating stale invoice UI data

  // }, [items, clientName, projectType, invoiceDate, amountPaid]);

  useEffect(() => {
    if (
      projectNameOptions.length > 0 &&
      projectTypeOptions.length > 0 &&
      invoiceNumber &&
      currentInvoice
    ) {
      const selectedProjectNameOption =
        projectNameOptions.find(opt => opt.value === currentInvoice.project_id) || null;
      const selectedProjectTypeOption =
        projectTypeOptions.find(opt => opt.value === currentInvoice.project_type) || null;
      ReactDOM.unstable_batchedUpdates(() => {
        setSelectedProjectName(selectedProjectNameOption);
        setProjectType(selectedProjectTypeOption);
      });
    }
  }, [projectNameOptions, projectTypeOptions, invoiceNumber, currentInvoice]);
const saveDraftToBackend = async () => {
  if (!invoiceNumber) {
    alert("Invoice number required before saving draft.");
    return;
  }

  const totalAmount = calculateTotalAmount();

  const invoiceData = {
    invoice: {
      invoice_number: invoiceNumber,
      status: "draft",
      date: invoiceDate,
      client_name: clientName ? clientName.value : "",
      client_address: clientAddress || "",
      client_id: clientName ? clientName.id : null,
      project_name: selectedProjectName ? selectedProjectName.label : "",
      project_id: selectedProjectName ? selectedProjectName.value : null,
      project_type: projectType ? projectType.value : "",
      amount_paid: parseFloat(amountPaid) || 0,
      total_amount: totalAmount,
    },
    items: items.flatMap(item =>
      item.subItems.map(sub => ({
        description: item.description?.label || item.description || "",
        sub_description: sub.description?.label || sub.description || "",
        size_input: sub.sizeInput || "",
        qty: sub.qty || "",
        rate: parseFloat(sub.rate) || 0,
        unit: sub.unit?.value || sub.unit || "",
        amount: parseFloat(sub.amount) || 0,
        is_main_row: false,
        invoice_id: null,
        item_id: sub.key || null,
      }))
    ),
  };

  try {
    const res = await axios.post("https://backendaab.in/aabuildersDash/api/invoices/draft", invoiceData, {
      headers: { "Content-Type": "application/json" },
    });

    const savedInvoice = res.data;

    alert("Draft saved successfully!");

    // Update invoiceNumber state and local cache from backend-generated number
    setInvoiceNumber(savedInvoice.invoiceNumber);
    localStorage.setItem("lastInvoiceNumber", savedInvoice.invoiceNumber);

    // Clear local form states except project dropdown
    setItems([]);
    setClientName(null);
    setProjectType(null);
    setInvoiceDate("");
    setAmountPaid("");
    setClientAddress("");

    // Refresh all invoices
    const resAll = await axios.get("https://backendaab.in/aabuildersDash/api/invoices/all-with-items");
    setAllInvoices(resAll.data);

    // Refresh filtered invoice options per current project selection
    if (selectedProjectName) {
      const filteredInvoices = resAll.data.filter(invEntry =>
        Number(invEntry.invoice.project_id) === Number(selectedProjectName.value)
      );
      const invoiceOptions = filteredInvoices.map(invEntry => ({
        value: invEntry.invoice.invoiceNumber,
        label: invEntry.invoice.invoice_number,
      }));
      setInvoiceVersions(invoiceOptions);

      if (invoiceOptions.length > 0) {
        if (!invoiceOptions.find(opt => opt.value === savedInvoice.invoiceNumber)) {
          setInvoiceNumber(invoiceOptions[0].value);
          handleInvoiceVersionChange({ value: invoiceOptions[0].value });
        } else {
          setInvoiceNumber(savedInvoice.invoiceNumber);
        }
      } else {
        setInvoiceNumber('');
      }
    }
  } catch (error) {
    alert("Error saving draft: " + (error.response?.data?.message || error.message));
  }
};
  const finalizeInvoiceBackend = async () => {
    if (!invoiceNumber || invoiceNumber.trim() === '') {
      alert('Invoice number is missing. Cannot finalize.');
      return;
    }
    try {
      await axios.post(
        'https://backendaab.in/aabuildersDash/api/invoices/finalize',
        null,
        {
          params: { invoiceNumber }
        }
      );
      alert('Invoice finalized successfully!');
      // Clear all UI states
      setInvoiceNumber('');
      setInvoiceDate('');
      setClientName(null);
      setClientAddress('');
      setProjectType(null);
      setAmountPaid('');
      setItems([]);
      setInvoiceVersions([]);
      // Clear local storage keys
      localStorage.removeItem('invoiceNumber');
      localStorage.removeItem('invoiceItems');
      localStorage.removeItem('invoiceClientName');
      localStorage.removeItem('invoiceProjectType');
      localStorage.removeItem('invoiceDate');
      localStorage.removeItem('invoiceAmountPaid');
    } catch (error) {
      alert('Error finalizing invoice: ' + (error.response?.data?.message || error.message));
    }
  };
const handleMakeCopy = () => {
  if (!invoiceNumber) {
    alert("No invoice selected to copy");
    return;
  }

  // Find suffix after dot if exists, e.g. .1, .2
  const suffixIndex = invoiceNumber.indexOf('.');
  let baseNumStr = invoiceNumber;
  let suffix = '';

  if (suffixIndex !== -1) {
    baseNumStr = invoiceNumber.substring(0, suffixIndex);
    suffix = invoiceNumber.substring(suffixIndex);
  }

  // Match INV prefix and base number with hyphen, e.g. "INV200-01"
  const prefixMatch = baseNumStr.match(/^([A-Z]+)([\d\-]+)$/);
  if (!prefixMatch) {
    alert("Invalid invoice number format");
    return;
  }

  const prefix = prefixMatch[1]; // "INV"
  const numPart = prefixMatch[2]; // "200-01"

  // Split numeric part on hyphen
  const parts = numPart.split('-');
  if (parts.length < 2) {
    alert("Invalid invoice number format: missing hyphen");
    return;
  }

  const mainPart = parts.slice(0, -1).join('-'); // "200"
  const lastNumStr = parts[parts.length - 1]; // "01"
  const lastNum = parseInt(lastNumStr, 10);
  if (isNaN(lastNum)) {
    alert("Invalid invoice number format: last part is not a number");
    return;
  }

  // Increment decimal suffix if present, otherwise start at .1
  let newSuffix;
  if (suffix) {
    const currentSuffixNum = parseFloat(suffix.substring(1)) || 0;
    newSuffix = '.' + (currentSuffixNum + 1).toFixed(1);
  } else {
    newSuffix = '.1';
  }

  // Rebuild invoice number with prefix, main part, incremented number and new decimal suffix
  const newBaseNumStr = `${prefix}${mainPart}-${lastNumStr}`;
  const newInvoiceNumber = newBaseNumStr + newSuffix;

  // Check if new invoice number exists already
  if (invoiceVersions.some(opt => opt.value === newInvoiceNumber)) {
    alert("Copy invoice number already exists");
    return;
  }

  // Retrieve current invoice data or fallback
  const currentInvoiceData = invoiceCache[invoiceNumber] || {
    invoice: currentInvoice,
    items: items,
  };

  // Deep clone to avoid mutation and ensure React state updates correctly
  const clonedItems = JSON.parse(JSON.stringify(currentInvoiceData.items));
  const clonedInvoice = { ...currentInvoiceData.invoice, invoice_number: newInvoiceNumber };

  // Batch all state updates together to avoid flickers or partial updates
  ReactDOM.unstable_batchedUpdates(() => {
    setInvoiceVersions(prev => [...prev, { value: newInvoiceNumber, label: newInvoiceNumber }]);
    setInvoiceCache(prev => ({ ...prev, [newInvoiceNumber]: { invoice: clonedInvoice, items: clonedItems } }));
    setInvoiceNumber(newInvoiceNumber);
    setCurrentInvoice(clonedInvoice);
    setItems(clonedItems);
    setClientName(clonedInvoice.client_name ? findOption(clients, clonedInvoice.client_name) : null);
    setClientAddress(clonedInvoice.client_address || "");
    setProjectType(projectTypes.find(pt => pt.value === clonedInvoice.project_type) || null);
    setSelectedProjectName(projectNameOptions.find(p => p.value === clonedInvoice.project_id) || null);
    setAmountPaid(clonedInvoice.amount_paid || "");
  });

  alert(`Invoice copied to ${newInvoiceNumber}`);
};



  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        workType: '',
        subItems: [{
          description: '',
          sizeInput: '',
          qty: '',
          rate: '',
          unit: '',
          amount: '',
          mainRow: {
            sizeInput: '',
            qty: '',
            rate: '',
            unit: '',
            amount: ''
          }
        }],
      },
    ]);
  };
  const handleAddSubItem = (itemIndex) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].subItems.push({
      description: '',
      sizeInput: '',
      qty: '',
      rate: '',
      unit: '',
      amount: '',
      mainRow: {
        sizeInput: '',
        qty: '',
        rate: '',
        unit: '',
        amount: ''
      }
    });
    setItems(updatedItems);
  };
  const handleDeleteSubItem = (itemIndex, subItemIndex) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].subItems = updatedItems[itemIndex].subItems.filter(
      (_, index) => index !== subItemIndex
    );
    setItems(updatedItems);
  };
  const totalAmount = calculateTotalAmount();
  const amountDue = totalAmount - amountPaid;
  const convertToFeet = (dim) => {
    let feet = 0;
    let inches = 0;
    if (dim.includes("'") && dim.includes('"')) {
      const parts = dim.split("'"); // Separate feet and inches
      feet = parseFloat(parts[0].trim());
      inches = parseFloat(parts[1].replace('"', '').trim());
      return feet + (inches / 12); // Convert inches to feet and add to feet
    } else if (dim.includes("'")) {
      feet = parseFloat(dim.replace("'", '').trim());
      return feet;
    } else if (dim.includes('"')) {
      inches = parseFloat(dim.replace('"', '').trim());
      return inches / 12; // Convert inches to feet
    }
    return parseFloat(dim.trim());
  };
  const calculateArea = (input, unit) => {
    input = input.replace(/''/g, '"'); // Fix double single quotes
    const dimensionGroups = input.split('+').map(dim => dim.trim());
    let totalArea = 0;
    // Helper to convert feet-inches format to decimal feet
    const convertToFeet = (dim) => {
      let feet = 0;
      let inches = 0;
      if (dim.includes("'") && dim.includes('"')) {
        const parts = dim.split("'");
        feet = parseFloat(parts[0].trim());
        inches = parseFloat(parts[1].replace('"', '').trim());
        // Convert inches to feet and sum with feet
        return feet + (inches / 12);
      } else if (dim.includes("'")) {
        feet = parseFloat(dim.replace("'", '').trim());
        return feet;
      } else if (dim.includes('"')) {
        inches = parseFloat(dim.replace('"', '').trim());
        return inches / 12;
      }
      return parseFloat(dim.trim());
    };
    dimensionGroups.forEach(group => {
      const arr = group.split('x').map(part => part.trim());
      if (arr.length === 2) {
        let length, width;

        if (unit === "M²") {
          length = parseFloat(arr[0]);
          width = parseFloat(arr[1]);
        } else { // default to feet conversion
          length = convertToFeet(arr[0]);
          width = convertToFeet(arr[1]);
        }
        if (!isNaN(length) && !isNaN(width)) {
          totalArea += length * width;
        }
      }
    });
    return totalArea.toFixed(2);  // Return area rounded to 2 decimals
  };
  // Function to calculate volume in cubic feet
  const calculateVolume = (input) => {
    input = input.replace(/''/g, '"');
    const dimensionGroups = input.split('+').map(dim => dim.trim());
    let totalVolume = 0;
    dimensionGroups.forEach(group => {
      const arr = group.split('x').map(part => part.trim());
      if (arr.length === 3) {
        const length = convertToFeet(arr[0]);
        const width = convertToFeet(arr[1]);
        const height = convertToFeet(arr[2]);
        if (!isNaN(length) && !isNaN(width) && !isNaN(height)) {
          totalVolume += length * width * height;
        }
      }
    });

    return totalVolume.toFixed(2);
  };
  const calculateLiters = (input) => {
    // If input looks like a simple number (with optional decimal), assume liters directly
    if (/^\d+(\.\d+)?$/.test(input.trim())) {
      return parseFloat(input).toFixed(2);
    }
    // Otherwise, treat input as cubic feet dimension(s), convert to liters
    const volumeInCubicFeet = parseFloat(calculateVolume(input));
    const volumeInLiters = volumeInCubicFeet * 28;
    return volumeInLiters.toFixed(2);
  };
  // The handleSubItemChange function
  const evaluateExpression = (expr) => {
    expr = expr.replace(/x/gi, '*');
    if (/^[0-9+\-*/().\s]+$/.test(expr)) {
      try {
        // eslint-disable-next-line no-new-func
        return new Function(`return (${expr})`)();
      } catch {
        return NaN;
      }
    }
    return NaN;
  };
  const handleSubItemChange = (itemIndex, subItemIndex, field, value, isMainRow = false) => {
    const updatedItems = [...items];
    const subItem = updatedItems[itemIndex].subItems[subItemIndex];
    const val = typeof value === 'string' ? value.trim() : value;
    if (isMainRow) {
      if (field === 'unit') {
        subItem.mainRow.unit = value;
        if (subItem.mainRow.sizeInput) {
          const selectedUnit = value?.value || 'SQFT';
          if (selectedUnit === 'SQFT' || selectedUnit === 'M²') {
            const area = calculateArea(subItem.mainRow.sizeInput, selectedUnit);
            const qtyStr = area === 'Invalid size input'
              ? area
              : `${area} ${selectedUnit === 'SQFT' ? 'Sqft' : 'm²'}`;
            subItem.mainRow.qty = qtyStr;
            subItem.qty = qtyStr;
          } else if (selectedUnit === 'CFT' || selectedUnit === 'M³') {
            const volume = calculateVolume(subItem.mainRow.sizeInput, selectedUnit);
            const qtyStr = volume === 'Invalid size input'
              ? volume
              : `${volume} ${selectedUnit === 'CFT' ? 'Cubic Feet' : 'm³'}`;
            subItem.mainRow.qty = qtyStr;
            subItem.qty = qtyStr;
          } else if (selectedUnit === 'RFT') {
            const length = convertToFeet(subItem.mainRow.sizeInput);
            const qtyStr = isNaN(length) ? 'Invalid input' : `${length.toFixed(2)} ft`;
            subItem.mainRow.qty = qtyStr;
            subItem.qty = qtyStr;
          } else if (selectedUnit === 'L') {
            const liters = calculateLiters(subItem.mainRow.sizeInput);
            const qtyStr = liters === 'Invalid size input'
              ? liters
              : `${liters} L`;
            subItem.mainRow.qty = qtyStr;
            subItem.qty = qtyStr;
          } else if (selectedUnit === 'NOS') {
            // Fix for NOS: do not change quantity, change amount only
            subItem.mainRow.qty = "1";
            subItem.qty = "1";
            const evalAmount = evaluateExpression(subItem.mainRow.sizeInput);
            if (!isNaN(evalAmount)) {
              subItem.mainRow.amount = (evalAmount * (parseFloat(subItem.mainRow.rate) || 0)).toFixed(2);
              subItem.amount = subItem.mainRow.amount;
            } else {
              subItem.mainRow.amount = 'Invalid input';
              subItem.amount = 'Invalid input';
            }
          } else if (selectedUnit === 'L.S') {
            const evalQty = evaluateExpression(subItem.mainRow.sizeInput);
            subItem.mainRow.qty = isNaN(evalQty)
              ? 'Invalid input'
              : `${evalQty}`;
            subItem.qty = subItem.mainRow.qty;
          } else {
            subItem.mainRow.qty = '1';
            subItem.qty = '1';
          }
        }
      } else if (field === 'rate') {
        subItem.mainRow.rate = parseFloat(val) || 0;
      } else if (field === 'amount') {
        subItem.mainRow.amount = parseFloat(val) || 0;
      }
      if (subItem.mainRow.qty && subItem.mainRow.rate && (subItem.mainRow.unit?.value !== 'NOS')) {
        const qtyValue = parseQty(subItem.mainRow.qty);
        subItem.mainRow.amount = (qtyValue * subItem.mainRow.rate).toFixed(2);
      } else if (subItem.mainRow.unit?.value === 'NOS') {
        // Amount already computed above when unit is NOS
      } else {
        subItem.mainRow.amount = '';
      }
    } else {
      if (field === 'unit') {
        subItem.unit = value;
        if (subItem.sizeInput) {
          const selectedUnit = value?.value || 'SQFT';
          if (selectedUnit === 'SQFT' || selectedUnit === 'M²') {
            const area = calculateArea(subItem.sizeInput, selectedUnit);
            subItem.qty = area === 'Invalid size input'
              ? area
              : `${area} ${selectedUnit === 'SQFT' ? 'Sqft' : 'm²'}`;
          } else if (selectedUnit === 'CFT' || selectedUnit === 'M³') {
            const volume = calculateVolume(subItem.sizeInput, selectedUnit);
            subItem.qty = volume === 'Invalid size input'
              ? volume
              : `${volume} ${selectedUnit === 'CFT' ? 'Cubic Feet' : 'm³'}`;
          } else if (selectedUnit === 'RFT') {
            const length = convertToFeet(subItem.sizeInput);
            subItem.qty = isNaN(length) ? 'Invalid input' : `${length.toFixed(2)} ft`;
          } else if (selectedUnit === 'L') {
            const liters = calculateLiters(subItem.sizeInput);
            subItem.qty = liters === 'Invalid size input'
              ? liters
              : `${liters} L`;
          } else if (selectedUnit === 'NOS') {
            subItem.qty = "1";
            const evalAmount = evaluateExpression(subItem.sizeInput);
            if (!isNaN(evalAmount)) {
              subItem.amount = (evalAmount * (parseFloat(subItem.rate) || 0)).toFixed(2);
            } else {
              subItem.amount = 'Invalid input';
            }
          } else if (selectedUnit === 'L.S') {
            const evalQty = evaluateExpression(subItem.sizeInput);
            subItem.qty = isNaN(evalQty)
              ? 'Invalid input'
              : `${evalQty}`;
          } else {
            subItem.qty = '1';
          }
        }
      } else if (field === 'rate') {
        subItem.rate = parseFloat(val) || 0;
      } else if (field === 'amount') {
        subItem.amount = parseFloat(val) || 0;
      }
      if (subItem.qty && subItem.rate && subItem.unit?.value !== 'NOS') {
        const qtyValue = parseQty(subItem.qty);
        subItem.amount = (qtyValue * subItem.rate).toFixed(2);
      } else if (subItem.unit?.value === 'NOS') {
        // Amount already computed above when unit is NOS
      } else {
        subItem.amount = '';
      }
    }
    setItems(updatedItems);
  };
  let displayIndex = 1;

  return (
    <body className='bg-[#FAF6ED]'>
      <div className="mx-auto p-4 " >
        <div className='-mt-3  flex'>
          <div className="flex ml-32 bg-white rounded-xl">
            <div className=" mt-5 ml-14 pr-4" style={{ width: "1180px" }}>
              <div className="rounded-lg border-l-8 border-l-[#BF9853] -ml-8">
                <table className="w-full table-auto mb-4 border-collapse">
                  <thead>
                    <tr className="bg-[#FAF6ED]">
                      <th className="p-2 text-left border-b border-gray-300">Description of Work</th>
                      <th className="p-2 text-left border-b border-gray-300">Size</th>
                      <th className="p-2 text-left border-b border-gray-300">Qty</th>
                      <th className="p-2 text-left border-b border-gray-300">Rate</th>
                      <th className="p-2 text-left border-b border-gray-300">Unit</th>
                      <th className="p-2 text-left border-b border-gray-300">Amount</th>
                      <th className="p-2 text-left border-b border-gray-300">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, itemIndex) => (
                      <React.Fragment key={itemIndex}>
                        {/* Main Description Row - always empty except for description dropdown */}
                        <tr key={`main-${itemIndex}`} className="odd:bg-white even:bg-[#FAF6ED] hover:bg-gray-50">
                          <td className="p-2 border-b border-gray-200">
                            <div className="flex items-center mb-2">
                              <span className="mr-2 font-semibold">{displayIndex++}.</span>
                              <CreatableSelect
                                options={descriptions}
                                value={item.description || ''}
                                onChange={(value) => {
                                  const updatedItems = [...items];
                                  updatedItems[itemIndex].description = value || '';
                                  setItems(updatedItems);
                                }}
                                className="w-52 font-semibold text-left"
                                styles={{
                                  control: (base, state) => ({
                                    ...base,
                                    backgroundColor: 'transparent',
                                    border: state.isFocused ? '1px solid #BF9853' : '1px solid transparent',
                                    boxShadow: state.isFocused ? '0 0 0 1px #BF9853' : 'none',
                                    '&:hover': {
                                      border: '1px solid #BF9853',
                                    },
                                  }),
                                  indicatorSeparator: () => ({
                                    display: 'none',
                                  }),
                                  placeholder: (base) => ({
                                    ...base,
                                    color: '#888',
                                    textAlign: 'left',
                                  }),
                                  singleValue: (base) => ({
                                    ...base,
                                    color: '#000',
                                    textAlign: 'left',
                                  }),
                                  input: (base) => ({
                                    ...base,
                                    textAlign: 'left',
                                  }),
                                }}
                              />
                            </div>
                          </td>
                          {/* All other fields empty/disabled for main row */}
                          <td className="p-2 border-b border-gray-200">
                            <input type="text" value="" className="w-full p-2 border border-gray-300 rounded" />
                          </td>
                          <td className="p-2 border-b border-gray-200">
                            <input type="text" value="" readOnly className="w-full p-2 border border-gray-200 rounded bg-gray-50" />
                          </td>
                          <td className="p-2 border-b border-gray-200">
                            <input type="number" value="" readOnly className="w-full p-2 border border-gray-300 rounded" />
                          </td>
                          <td className="p-2 border-b border-gray-200">
                            <Select options={units} value={null} className="w-full" isDisabled />
                          </td>
                          <td className="p-2 border-b border-gray-200">
                            <input type="text" value="" readOnly className="w-full p-2 border border-gray-200 rounded bg-gray-50 font-semibold" />
                          </td>
                          <td className="p-2 border-b border-gray-200">
                            {/* Delete button for main row if needed */}
                          </td>
                        </tr>
                        {/* Subitem Rows */}
                        {item.subItems.map((subItem, subItemIndex) => (
                          <tr key={`sub-${itemIndex}-${subItemIndex}`} className="odd:bg-white even:bg-[#FAF6ED] hover:bg-gray-50">
                            <td className="p-2 border-b border-gray-200">
                              <div className="flex items-center space-x-2 gap-0 group">
                                <CreatableSelect
                                  options={subItems}
                                  value={subItem.description || ''}
                                  onChange={(value) => {
                                    const updatedItems = [...items];
                                    updatedItems[itemIndex].subItems[subItemIndex].description = value || descriptions[0];
                                    setItems(updatedItems);

                                  }}
                                  className="w-96 ml-8 font-medium text-left"
                                  styles={{
                                    control: (base, state) => ({
                                      ...base,
                                      backgroundColor: 'transparent',
                                      border: state.isFocused ? '1px solid #BF9853' : '1px solid transparent',
                                      boxShadow: state.isFocused ? '0 0 0 1px #BF9853' : 'none',
                                      '&:hover': {
                                        border: '1px solid #BF9853',
                                      },
                                    }),
                                    indicatorSeparator: () => ({
                                      display: 'none',
                                    }),
                                    placeholder: (base) => ({
                                      ...base,
                                      color: '#888',
                                      textAlign: 'left',
                                    }),
                                    singleValue: (base) => ({
                                      ...base,
                                      color: '#000',
                                    }),
                                  }}
                                />
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    className="font-normal rounded-full hover:bg-gray-200 p-1"
                                    onClick={() => handleAddSubItem(itemIndex)}
                                    title="Add sub-item"
                                  >
                                    <img
                                      src={add}
                                      alt="Add"
                                      className="w-6 h-6"
                                    />
                                  </button>
                                  <button
                                    className="font-normal py-1 px-2 rounded-full hover:bg-gray-200"
                                    onClick={() => handleRemoveSubItem(itemIndex, subItemIndex)}
                                    title="Remove sub-item"
                                  >
                                    <img
                                      src={delt}
                                      alt="Delete"
                                      className="w-6 h-6"
                                    />
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              <input
                                type="text"
                                value={subItem.sizeInput || ''}
                                onChange={(e) => handleInputChangeForRow(e, itemIndex, subItemIndex)}
                                className="w-full p-2 border border-gray-300 rounded hover:border-gray-400 focus:border-[#BF9853] focus:outline-none"
                                placeholder="e.g., 10x12"
                              />
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              <input
                                type="text"
                                value={subItem.qty}
                                readOnly
                                className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                              />
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              <input
                                type="number"
                                value={subItem.rate}
                                onChange={(e) =>
                                  handleSubItemChange(itemIndex, subItemIndex, 'rate', e.target.value)
                                }
                                className="w-full p-2 border border-gray-300 rounded hover:border-gray-400 focus:border-[#BF9853] focus:outline-none"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              <Select
                                options={units}
                                value={subItem.unit}
                                onChange={(value) =>
                                  handleSubItemChange(itemIndex, subItemIndex, 'unit', value)
                                }
                                className="w-full"
                                styles={{
                                  control: (base, state) => ({
                                    ...base,
                                    backgroundColor: 'transparent',
                                    border: state.isFocused ? '1px solid #BF9853' : '1px solid #d1d5db',
                                    boxShadow: state.isFocused ? '0 0 0 1px #BF9853' : 'none',
                                    '&:hover': {
                                      border: '1px solid #BF9853',
                                    },
                                  }),
                                  dropdownIndicator: (base) => ({
                                    ...base,
                                    color: '#000',
                                  }),
                                  indicatorSeparator: () => ({
                                    display: 'none',
                                  }),
                                  placeholder: (base) => ({
                                    ...base,
                                    color: '#888',
                                  }),
                                  singleValue: (base) => ({
                                    ...base,
                                    color: '#000',
                                    textAlign: 'left',
                                  }),
                                  input: (base) => ({
                                    ...base,
                                    textAlign: 'left',
                                  }),
                                }}
                              />
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              <input
                                type="text"
                                value={subItem.amount || ""}
                                readOnly
                                className="w-full p-2 border border-gray-200 rounded bg-gray-50 font-semibold"
                              />
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              <button
                                className="text-red-600 hover:text-red-800 font-bold py-1 px-2 rounded hover:bg-red-50"
                                onClick={() => handleDeleteSubItem(itemIndex, subItemIndex)}
                                title="Delete row"
                              >
                                <img className="w-4 h-4" src={delet} alt="delete"></img>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                <div className='bg-[#FAF6ED]'>
                  <button
                    className="text-[#E4572E] font-semibold rounded mb-4 border-dashed border-b-2 border-[#BF9853] -ml-[60rem]"
                    onClick={handleAddItem}
                  >
                    + Add Item
                  </button>
                </div>
              </div>
              <div className="flex justify-between mb-4">
                <div className="mt-16">
                  <h1 className="text-lg font-bold -mt-10" style={{ marginLeft: '-650px' }}>Notes</h1>

                  <input
                    type="text"
                    className="p-2 border mb-4 h-11 rounded-md -ml-[5rem]"
                    style={{ width: '620px' }}
                  />

                  <input
                    type="text"
                    className="p-1 border mb-4 h-9 rounded-md -ml-[5rem]"
                    style={{ width: '620px' }}
                    placeholder="Terms & Conditions"
                  />

                  <input
                    type="text"
                    className="p-2 border mb-4 block h-11 rounded-md -ml-[1.5rem]"
                    style={{ width: '620px' }}
                    placeholder="Please make the payment by the due date."
                  />
                  <button
                    onClick={finalizeInvoiceBackend}
                    disabled={!invoiceNumber || invoiceNumber.trim() === ''}
                    className="bg-[#BF9853] text-white font-bold py-2 px-4 rounded ml-16 block"
                  >
                    Submit
                  </button>
                </div>
                <div className="w-3/5 mt-10">
                  <div className="flex justify-between mb-2 bg-[#BF9853] py-4 px-6 rounded-lg h-14 border border-gray-300 text-white text-xl text-left font-semibold">
                    <span>Total </span>
                    <span>{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2 p-4 rounded-lg border border-gray-300 h-14 text-xl font-semibold">
                    <span>Amount Paid</span>
                    <input
                      type="text"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className=" p-2 w-20 h-8"
                      placeholder=""
                    />
                  </div>
                  <div className="flex justify-between text-xl font-semibold bg-gray-200 p-4  h-14 border border-gray-300 rounded-lg">
                    <span>Amount Due</span>
                    <span>{amountDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className=" ml-8 pr-4  bg-white rounded-xl" style={{ width: "350px" }}>
            <div className=" block p-4 ml-10">
              <div className=' block'>
                <div className="">
                  <div className="mb-4  block">
                    <label className="flex mb-1 -ml-10 font-semibold">Date</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className=" w-64 p-2 h-10  border-[#FAF6ED] -ml-[5.5rem] rounded-lg" style={{ border: '2px solid #FAF6ED' }}
                    />
                  </div>
                  <div className="block">
                    <div className="mb-4">
                      <label className="block mb-2 mt-3 -ml-[15rem] font-semibold">Invoice</label>
                      <Select
                        options={invoiceVersions}
                        value={invoiceVersions.find(opt => opt.value === invoiceNumber) || null}
                        onChange={handleInvoiceVersionChange}
                        placeholder="Select Invoice Version"
                        className="flex h-10 -ml-[2.6rem] w-64 text-left"
                        styles={{
                          control: (base) => ({
                            ...base,
                            border: '2px solid #FAF6ED',
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            borderRadius: '8px',
                            width: '320px',
                            textAlign: 'left',
                          }),
                          indicatorSeparator: () => ({ display: 'none' }),
                          placeholder: (base) => ({ ...base, color: '#888' }),
                          singleValue: (base) => ({ ...base, color: '#000' }),
                        }}
                      />
                    </div>
                  </div>

                  <label className="block mb-2 mt-0 -ml-[15.5rem] font-semibold">Client Name</label>
                  <Select
                    options={clients}
                    value={clientName}
                    onChange={setClientName}
                    getOptionLabel={option => option.value}
                    getOptionValue={option => option.id}
                    className=" w-64 h-10 -ml-[2.6rem] text-left"
                    placeholder="Select Client"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: '2px solid #FAF6ED ',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        borderRadius: '8px',
                        textAlign: 'left',
                      }),
                      indicatorSeparator: () => ({
                        display: 'none',
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: '#888',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: '#000',
                      }),
                    }}
                  />
                </div>
              </div>
              <div className='block'>
                <div className="mb-4">
                  <label className="block mb-2 mt-3 -ml-[15rem] font-semibold">Project Type</label>
                  <Select
                    options={projectTypes}
                    value={projectType}  // an object like { value: 'Commercial', label: 'Commercial' }
                    onChange={setProjectType}
                    placeholder="Select Project Type"
                    className="flex h-10 -ml-[2.6rem] w-64 text-left"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: '2px solid #FAF6ED',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        borderRadius: '8px',
                        width: '320px',
                        textAlign: 'left',
                      }),
                      indicatorSeparator: () => ({ display: 'none' }),
                      placeholder: (base) => ({ ...base, color: '#888' }),
                      singleValue: (base) => ({ ...base, color: '#000' }),
                    }}
                  />
                </div>
                <div className='block'>
                  <div className="mb-4" style={{ display: 'flex', flexDirection: 'column' }}>
                    <label className="block mb-2 mt-1 -ml-[15rem] font-semibold">Project Name</label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginLeft: '-2.6rem',
                      }}
                    >
                      <Select
                        options={projectNameOptions}
                        value={selectedProjectName}
                        onChange={handleProjectNameChange}
                        className="flex h-10 text-left"
                        placeholder="Select Project Name"
                        styles={{
                          control: (base) => ({
                            ...base,
                            border: '2px solid #FAF6ED',
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            borderRadius: '8px',
                            width: '250px',
                            minWidth: '150px',
                            textAlign: 'left',
                          }),
                          indicatorSeparator: () => ({ display: 'flex' }),
                          placeholder: (base) => ({ ...base, color: '#888' }),
                          singleValue: (base) => ({ ...base, color: '#000' }),
                        }}
                      />
                      {selectedProjectName && (
                        <div
                          style={{
                            padding: '4px 8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: '#f0f0f0',
                            fontWeight: 'bold',
                            flexShrink: 0,
                          }}
                        >
                          ID: {selectedProjectName.siteNo}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-1 -ml-[13.8rem] font-semibold">Client Address:</label>
                <input
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-64 h-10 p-2 -ml-[5.5rem] border-2 border-[#FAF6ED] rounded-lg"
                  rows={3}
                  placeholder="Enter Client Address"
                >
                </input>
              </div>
              <h5 className='-ml-[14.5rem] font-semibold'>Client Phone:</h5>
              <div className="w-64 rounded-md p-2 block  border-2 border-[#FAF6ED] -ml-[2rem] bg-gray-100" style={{}}>
                <span className='-ml-32 '>{clientPhone}</span>
              </div>
            </div>
            <div className='-ml-10 flex flex-col space-y-5'>
              <button className="bg-green-700 text-white font-bold py-2 px-4 rounded ml-16 mt-5 block">
                Download / Print
              </button>
              <button onClick={handleMakeCopy} className="bg-[#BF9853] text-white py-2 px-4 rounded ml-16 block">
                Make A Copy
              </button>
              <button onClick={saveDraftToBackend} className="bg-[#E4572E] text-white font-bold py-2 px-4 rounded ml-16 block">
                Save Online
              </button>
            </div>
          </div>
        </div>
      </div>
    </body>
  );
}
export default InvoiceTable;