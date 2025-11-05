import React, { useState, useEffect, useRef } from 'react';
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
  const [clientName, setClientName] = useState(null);
  const [projectType, setProjectType] = useState(null);
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
  const [autoFilledProject, setAutoFilledProject] = useState(false);
  const [allInvoices, setAllInvoices] = useState([]);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneProjectName, setCloneProjectName] = useState(null);
  // 🔹 Track the previous project ID before switching
  const previousProjectRef = useRef(null);
  const [previousProjectName, setPreviousProjectName] = useState(null);
  const [isCloning, setIsCloning] = useState(false);
  const [isInvoiceLocked, setIsInvoiceLocked] = useState(false);
  const [isModalProjectChange, setIsModalProjectChange] = useState(false);

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
          value: item.siteNo,
          label: item.siteName
        }));
        setProjectNameOptions(formattedProjects);
      } catch (error) {
        console.error("Failed to fetch project names:", error);
      }
    };
    fetchProjectNames();
  }, []);
const handleProjectNameChange = async (selectedOption) => {
  if (!selectedOption) {
    ReactDOM.unstable_batchedUpdates(() => {
      setSelectedProjectName(null);
      setProjectType(null);
      setInvoiceNumber("");
      setInvoiceVersions([]);
      setCurrentInvoice(null);
      setItems([]);
      setClientName(null);
      setClientAddress("");
      setInvoiceDate("");
      setAmountPaid("");
      setIsInvoiceLocked(false);
    });
    return;
  }

  setSelectedProjectName(selectedOption);
  setProjectType(selectedOption.project_type || selectedOption.label || "");

  const projectID = String(selectedOption.value);
  const storedClone = sessionStorage.getItem(`cloned_${projectID}`);
  let restored = false;

  if (storedClone) {
    const data = JSON.parse(storedClone);
    console.log("🟢 Restoring cloned data for project:", projectID, data);

    const permanentOptions = allInvoices
      .filter((inv) => inv.invoice && String(inv.invoice.project_id) === projectID)
      .map((inv) => ({
        value: inv.invoice.invoice_number,
        label: inv.invoice.invoice_number,
      }));

    const cachedOptions = Object.values(invoiceCache || {})
      .filter((data) => data.invoice && String(data.invoice.project_id) === projectID)
      .map((data) => ({
        value: data.invoice.invoice_number,
        label: data.invoice.invoice_number,
      }));

    const combinedOptionsMap = new Map();
    [...permanentOptions, ...cachedOptions].forEach((opt) => {
      combinedOptionsMap.set(opt.value, { value: opt.value, label: opt.label });
    });

    let invoiceOptions = Array.from(combinedOptionsMap.values()).sort((a, b) =>
      a.value.localeCompare(b.value, undefined, { numeric: true })
    );

    if (invoiceOptions.length === 0) {
      const baseInv = `INV${projectID}-01`;
      invoiceOptions = [{ value: baseInv, label: `${baseInv}` }];
    }

    setInvoiceVersions(invoiceOptions);

    const invoiceToSelect = data.invoiceNumber || invoiceOptions[invoiceOptions.length - 1]?.value || "";
    setInvoiceNumber(invoiceToSelect);

    // ✅ Restore only cloned items for this project
    setItems(data.clonedItems || []);

    setClientName(null);
    setClientAddress("");
    setInvoiceDate("");
    setAmountPaid("");
    setCurrentInvoice(null);
    setIsInvoiceLocked(false);

    restored = true;
  }

  // ✅ If not cloned, proceed normally
  if (!restored) {
    if (!isCloning && !isModalProjectChange) {
      ReactDOM.unstable_batchedUpdates(() => {
        setInvoiceNumber("");
        setInvoiceVersions([]);
        setCurrentInvoice(null);
        setItems([]);
        setClientName(null);
        setClientAddress("");
        setInvoiceDate("");
        setAmountPaid("");
        setIsInvoiceLocked(false);
      });
    }

    const permanentOptions = allInvoices
      .filter((inv) => inv.invoice && String(inv.invoice.project_id) === projectID)
      .map((inv) => ({
        value: inv.invoice.invoice_number,
        label: inv.invoice.invoice_number,
      }));

    const cachedOptions = Object.values(invoiceCache || {})
      .filter((data) => data.invoice && String(data.invoice.project_id) === projectID)
      .map((data) => ({
        value: data.invoice.invoice_number,
        label: data.invoice.invoice_number,
      }));

    const combinedOptionsMap = new Map();
    [...permanentOptions, ...cachedOptions].forEach((opt) => {
      combinedOptionsMap.set(opt.value, { value: opt.value, label: opt.label });
    });

    let invoiceOptions = Array.from(combinedOptionsMap.values()).sort((a, b) =>
      a.value.localeCompare(b.value, undefined, { numeric: true })
    );

    if (invoiceOptions.length === 0) {
      const baseInv = `INV${projectID}-01`;
      invoiceOptions = [{ value: baseInv, label: baseInv }];
    }

    setInvoiceVersions(invoiceOptions);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const invoiceToSelect = invoiceOptions[invoiceOptions.length - 1]?.value || "";
    setInvoiceNumber(invoiceToSelect);

    if (!isCloning && !isModalProjectChange) {
      await handleInvoiceVersionChange({ value: invoiceToSelect });
      setIsInvoiceLocked(/ D\d+(\.\d+)?/.test(invoiceToSelect));
    } else {
      console.log("🟢 Skipped invoice data load — cloning/modal mode");
    }
  }

  if (isCloning) setIsCloning(false);
};
  const [cachedInvoiceVersions, setCachedInvoiceVersions] = useState([]);
  useEffect(() => {
    if (!invoiceNumber) return;
    const baseInvNum = invoiceNumber.includes('.') ? invoiceNumber.split('.')[0] : invoiceNumber;
    setBaseInvoiceNumber(baseInvNum);
    axios.get(`https://backendaab.in/aabuildersDash/api/invoices/versions/${encodeURIComponent(baseInvNum)}`)
      .then(res => {
        const fetchedOptions = res.data.map(invNum => ({ value: invNum, label: invNum }));
        if (!fetchedOptions.find(o => o.value === baseInvNum)) {
          fetchedOptions.unshift({ value: baseInvNum, label: baseInvNum });
        }
        setCachedInvoiceVersions(prevCache => {
          const cacheValues = new Set(prevCache.map(o => o.value));
          const newCacheEntries = fetchedOptions.filter(opt => !cacheValues.has(opt.value));
          return [...prevCache, ...newCacheEntries];
        });
        setInvoiceVersions(prevOptions => {
          const existingValues = new Set(prevOptions.map(o => o.value));
          const newOptions = fetchedOptions.filter(opt => !existingValues.has(opt.value));
          return [...prevOptions, ...newOptions];
        });
      })
      .catch(err => {
        console.error('Failed to load invoice versions:', err);
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
      if (!options.find(o => o.value === baseInvoiceNumber)) {
        options.unshift({ value: baseInvoiceNumber, label: baseInvoiceNumber });
      }
      setInvoiceVersions(options);
    } catch (error) {
      console.error("Failed to refresh invoice versions:", error);
    }
  };
  const handleInvoiceVersionChange = async (selectedOption) => {
    if (!selectedOption) {
      ReactDOM.unstable_batchedUpdates(() => {
        setInvoiceNumber("");
        setInvoiceDate("");
        setClientName(null);
        setClientAddress("");
        setProjectType(null);
        setAmountPaid("");
        setItems([]);
        setCurrentInvoice(null);
      });
      return;
    }
    const selectedInvoiceNumber = selectedOption.value;
    setInvoiceNumber(selectedInvoiceNumber);
    try {
      // ✅ Step 1: Use cache first
      if (invoiceCache[selectedInvoiceNumber]) {
        const cachedData = invoiceCache[selectedInvoiceNumber];

        ReactDOM.unstable_batchedUpdates(() => {
          setCurrentInvoice(cachedData.invoice);
          setItems(cachedData.items || []);

          const clientOption =
            clients.find(
              c =>
                c.id === cachedData.invoice.client_id ||
                c.value === cachedData.invoice.client_id
            ) || null;

          setClientName(clientOption);
          setClientAddress(cachedData.invoice.client_address || "");
          setInvoiceDate(cachedData.invoice.invoice_date || "");
          setAmountPaid(
            cachedData.invoice.amount_paid ??
            amountPaid ?? 0
          );
          const matchedType =
            projectTypes.find(
              pt =>
                String(pt.value).toLowerCase().trim() ===
                String(cachedData.invoice.project_type).toLowerCase().trim() ||
                String(pt.label).toLowerCase().trim() ===
                String(cachedData.invoice.project_type).toLowerCase().trim()
            ) ||
            (cachedData.invoice.project_type
              ? { value: cachedData.invoice.project_type, label: cachedData.invoice.project_type }
              : null);

          setProjectType(matchedType);
        });
        return;
      }
      const selectedInvEntry = allInvoices.find(
        invEntry => invEntry.invoice.invoice_number === selectedInvoiceNumber
      );
      if (!selectedInvEntry) {
        console.warn("Invoice not found for number:", selectedInvoiceNumber);
        return;
      }
      const invoiceData = selectedInvEntry.invoice;
      const itemList = selectedInvEntry.items || [];
      const newCache = {
        ...invoiceCache,
        [selectedInvoiceNumber]: {
          invoice: invoiceData,
          items: itemList,
        },
      };
      setInvoiceCache(newCache);
      ReactDOM.unstable_batchedUpdates(() => {
        setCurrentInvoice(invoiceData);
        setItems(itemList);

        const clientOption =
          clients.find(
            c =>
              c.id === invoiceData.client_id ||
              c.value === invoiceData.client_id
          ) || null;

        setClientName(clientOption);
        setClientAddress(invoiceData.client_address || "");
        setInvoiceDate(invoiceData.invoice_date || "");
        setAmountPaid(
          invoiceData.amount_paid ??
          currentInvoice?.amount_paid ??
          amountPaid ??
          0
        );

        const matchedType =
          projectTypes.find(
            pt =>
              String(pt.value).toLowerCase().trim() ===
              String(invoiceData.project_type).toLowerCase().trim() ||
              String(pt.label).toLowerCase().trim() ===
              String(invoiceData.project_type).toLowerCase().trim()
          ) ||
          (invoiceData.project_type
            ? { value: invoiceData.project_type, label: invoiceData.project_type }
            : null);

        setProjectType(matchedType);
      });
    } catch (error) {
      console.error("Error while handling invoice version change:", error);
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
    async function initializeInvoices() {
      try {
        const res = await axios.get("https://backendaab.in/aabuildersDash/api/invoices/all-with-items");
        const invoices = res.data || [];
        setAllInvoices(invoices);
        // Do not initialize invoiceNumber or invoiceVersions here
        // Leave empty so invoice dropdown is empty until user selects a project
        setInvoiceVersions([]);
        setInvoiceNumber("");
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
      currentInvoice &&
      invoiceNumber &&
      (invoiceNumber.includes(" D") || invoiceNumber.includes(".")) && // only for copied invoices
      projectNameOptions.length > 0 &&
      projectTypes.length > 0 &&
      !autoFilledProject
    ) {
      const selectedProjectNameOption =
        projectNameOptions.find(
          opt => String(opt.value) === String(currentInvoice.project_id)
        ) || null;

      const selectedProjectTypeOption =
        projectTypes.find(
          pt =>
            String(pt.value) === String(currentInvoice.project_type) ||
            String(pt.label) === String(currentInvoice.project_type)
        ) || { value: currentInvoice.project_type, label: currentInvoice.project_type };

      ReactDOM.unstable_batchedUpdates(() => {
        setSelectedProjectName(selectedProjectNameOption);
        setProjectType(selectedProjectTypeOption);
        setAutoFilledProject(true);
      });

      console.log("✅ Auto-filled copied invoice:", currentInvoice.project_type);
    }
  }, [currentInvoice, invoiceNumber, projectNameOptions, projectTypes, autoFilledProject]);

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

    let baseNumStr = invoiceNumber;
    let newInvoiceNumber = "";

    // 🔹 Case 1: Base invoice (no D or .)
    if (!invoiceNumber.includes(" D")) {
      const topLevelCopies = invoiceVersions
        .filter(opt => opt.value.startsWith(baseNumStr + " D") && !opt.value.includes("."))
        .map(opt => opt.value);
      const nextIndex = topLevelCopies.length + 1;
      newInvoiceNumber = `${baseNumStr} D${nextIndex}`;
    }
    // 🔹 Case 2: First-level copy (like "INV123 D1")
    else if (/ D\d+$/.test(invoiceNumber)) {
      const subCopies = invoiceVersions
        .filter(opt => opt.value.startsWith(`${baseNumStr}.`))
        .map(opt => opt.value);
      const nextSubIndex = subCopies.length + 1;
      newInvoiceNumber = `${baseNumStr}.${nextSubIndex}`;
    }
    // 🔹 Case 3: Sub-copy (like "INV123 D1.1")
    else if (/ D\d+\.\d+$/.test(invoiceNumber)) {
      const prefix = invoiceNumber.substring(0, invoiceNumber.lastIndexOf("."));
      const subCopies = invoiceVersions
        .filter(opt => opt.value.startsWith(prefix + "."))
        .map(opt => opt.value);
      const nextSubIndex = subCopies.length + 1;
      newInvoiceNumber = `${prefix}.${nextSubIndex}`;
    }

    if (!newInvoiceNumber) {
      alert("Unable to generate invoice copy");
      return;
    }

    if (invoiceVersions.some(opt => opt.value === newInvoiceNumber)) {
      alert("Copy invoice number already exists");
      return;
    }

    const currentInvoiceData = { invoice: { ...currentInvoice }, items: [...items] };
    const clonedItems = JSON.parse(JSON.stringify(currentInvoiceData.items));

    const clonedInvoice = {
      ...currentInvoiceData.invoice,
      invoice_number: newInvoiceNumber,
    };

    const normalizedInvoice = {
      ...clonedInvoice,
      invoiceNumber: clonedInvoice.invoice_number || clonedInvoice.invoiceNumber || "",
      client_name: clonedInvoice.client_name || (clientName ? clientName.value : ""),
      client_id: clonedInvoice.client_id || (clientName ? clientName.id : null),
      client_address: clonedInvoice.client_address || clientAddress || "",
      project_type:
        currentInvoice?.project_type ||
        (projectType ? projectType.value : "") ||
        clonedInvoice.project_type ||
        "",
      project_id:
        currentInvoice?.project_id ||
        (selectedProjectName ? selectedProjectName.value : null) ||
        clonedInvoice.project_id ||
        null,

      amount_paid:
        clonedInvoice.amount_paid ??
        currentInvoice?.amount_paid ??
        amountPaid ??
        0,
      invoice_date:
        clonedInvoice.invoice_date ||
        currentInvoice?.invoice_date ||
        invoiceDate ||
        "",
    };
    ReactDOM.unstable_batchedUpdates(() => {
      setInvoiceVersions(prev => [
        ...prev,
        { value: normalizedInvoice.invoiceNumber, label: normalizedInvoice.invoiceNumber },
      ]);

      setInvoiceCache(prev => ({
        ...prev,
        [normalizedInvoice.invoiceNumber]: {
          invoice: normalizedInvoice,
          items: clonedItems,
        },
      }));
      setAllInvoices(prev => [
        ...prev,
        {
          invoice: normalizedInvoice,
          items: clonedItems,
        },
      ]);
      // Refresh UI states
      setInvoiceNumber(normalizedInvoice.invoiceNumber);
      setCurrentInvoice(normalizedInvoice);
      setItems(clonedItems);
      setClientAddress(normalizedInvoice.client_address || "");
      setAmountPaid(normalizedInvoice.amount_paid || 0);

      const clientOption = Array.isArray(clients)
        ? clients.find(
          c =>
            c.id === normalizedInvoice.client_id ||
            c.value === normalizedInvoice.client_id
        )
        : null;
      setClientName(clientOption || null);
    });
    // Reset autofill flag to re-trigger project name/type sync if needed
    setAutoFilledProject(false);

    alert(`Invoice copied to ${newInvoiceNumber}`);
  };
 const fetchItemsForProject = (projectId) => {
  const projectInvoices = allInvoices.filter(
    (invEntry) => String(invEntry.invoice.project_id) === String(projectId)
  );

  const uniqueItemsMap = new Map();

  // FIX: Aggregate and deduplicate items from all versions of the project's invoices.
  // We use description, quantity, and unitPrice as a composite key for uniqueness.
  projectInvoices.flatMap((invEntry) => invEntry.items || []).forEach(item => {
    // Create a unique key based on descriptive fields
    // Assuming 'description', 'quantity', and 'unitPrice' define a unique item
    const key = `${item.description}_${item.quantity}_${item.unitPrice}`;
    
    // Store the item, clearing database-specific IDs/links to prepare it for a new save
    if (!uniqueItemsMap.has(key)) {
        uniqueItemsMap.set(key, { 
            ...item, 
            itemId: null, 
            invoice: null, 
            version: null 
        });
    }
  });

  // Return the unique items as a list
  return Array.from(uniqueItemsMap.values());
};

const handleCloneClick = () => {
  setIsCloneModalOpen(true);
  setCloneProjectName(null);
  setIsModalProjectChange(true); // ✅ mark that changes now come from modal
};

const handleConfirmClone = async () => {
  if (!cloneProjectName) {
    // Note: It's best practice to replace alert() with a custom modal UI in production React apps.
    alert("Please select a project to clone to.");
    return;
  }

  // get source ID robustly
  const sourceId = selectedProjectName?.value ?? selectedProjectName?.siteNo ?? null;
  const targetId = cloneProjectName?.value ?? cloneProjectName?.siteNo ?? null;

  if (!sourceId) {
    alert("No source project selected to clone from.");
    return;
  }
  if (!targetId) {
    alert("No target project selected to clone to.");
    return;
  }

  const confirmMessage = `Do you want to clone items from project ${selectedProjectName?.label || sourceId} to project ${cloneProjectName.label}?`;
  if (!window.confirm(confirmMessage)) return;

  // Ensure allInvoices loaded; if not, try re-fetching once.
  if (!Array.isArray(allInvoices) || allInvoices.length === 0) {
    console.log("handleConfirmClone: allInvoices empty, attempting to refresh from backend...");
    try {
      const res = await axios.get("https://backendaab.in/aabuildersDash/api/invoices/all-with-items");
      setAllInvoices(res.data || []);
    } catch (err) {
      console.error("Failed to refresh invoices before clone:", err);
    }
  }
  
  // Fetch cloned items (now correctly deduplicated by fetchItemsForProject)
  const clonedItems = fetchItemsForProject(sourceId);
  if (!clonedItems || clonedItems.length === 0) {
    console.warn("No items found to clone. Diagnostics:");
    console.warn("selectedProjectName:", selectedProjectName);
    console.warn("allInvoices length:", Array.isArray(allInvoices) ? allInvoices.length : allInvoices);
    alert("No items found in source project to clone. Make sure the source project has invoices/items and that project IDs match invoice.project_id.");
    return;
  }
  
  // Save cloned items to session storage for restoration in the target project
  sessionStorage.setItem(
    `cloned_${String(targetId)}`,
    JSON.stringify({
      sourceProjectId: sourceId,
      targetProjectId: targetId,
      clonedItems, // This is the deduplicated list
      timestamp: new Date().toISOString()
    })
  );

  setIsCloning(true);
  setIsModalProjectChange(true);
  setIsCloneModalOpen(false);
  
  // Switch to target project. This call triggers handleProjectNameChange, 
  // which will RESTORE the items from sessionStorage.
  await handleProjectNameChange(cloneProjectName);
  
  // ❌ REMOVED: The redundant setItems(clonedItems) call. 
  // It is now handled inside handleProjectNameChange's restoration logic.

  setClientName(null);
  setClientAddress("");
  setInvoiceDate("");
  setAmountPaid("");
  setCurrentInvoice(null);
  setIsInvoiceLocked(false);
  setIsCloning(false);
  setTimeout(() => setIsModalProjectChange(false), 100);
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
          <div className="ml-8 pr-4 bg-white rounded-xl" style={{ width: "350px" }}>
            <div className="block p-4 ml-10">
              <div className="block">
                <div className="mb-4 block">
                  <label className="flex mb-1 -ml-10 font-semibold">
                    Date <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-64 p-2 h-10 border-[#FAF6ED] -ml-[5.5rem] rounded-lg"
                    style={{ border: "2px solid #FAF6ED" }}
                    disabled={isInvoiceLocked}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 mt-3 -ml-[15rem] font-semibold">
                    Invoice
                  </label>
                  <Select
                    options={invoiceVersions}
                    value={invoiceVersions.find((opt) => opt.value === invoiceNumber) || null}
                    onChange={handleInvoiceVersionChange}
                    placeholder="Select Invoice Version"
                    className="flex h-10 -ml-[2.6rem] w-64 text-left"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: "2px solid #FAF6ED",
                        backgroundColor: "transparent",
                        boxShadow: "none",
                        borderRadius: "8px",
                        width: "320px",
                        textAlign: "left",
                      }),
                      indicatorSeparator: () => ({ display: "none" }),
                      placeholder: (base) => ({ ...base, color: "#888" }),
                      singleValue: (base) => ({ ...base, color: "#000" }),
                    }}
                    isDisabled={isInvoiceLocked}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 mt-0 -ml-[15.5rem] font-semibold">
                    Client Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Select
                    options={clients}
                    value={clientName}
                    onChange={(value) => {
                      if (!invoiceDate) {
                        alert("⚠️ Please select a Date");
                        return;
                      }
                      setClientName(value);
                    }}
                    getOptionLabel={(option) => option.value}
                    getOptionValue={(option) => option.id}
                    className="w-64 h-10 -ml-[2.6rem] text-left"
                    placeholder="Select Client"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: "2px solid #FAF6ED",
                        backgroundColor: "transparent",
                        boxShadow: "none",
                        borderRadius: "8px",
                        textAlign: "left",
                      }),
                      indicatorSeparator: () => ({ display: "none" }),
                      placeholder: (base) => ({ ...base, color: "#888" }),
                      singleValue: (base) => ({ ...base, color: "#000" }),
                    }}
                    isDisabled={isInvoiceLocked}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 mt-3 -ml-[15rem] font-semibold">
                    Project Type <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Select
                    options={projectTypes}
                    value={projectType}
                    onChange={(value) => {
                      if (!clientName) {
                        alert("⚠️ Please select a Client Name");
                        return;
                      }
                      setProjectType(value);
                    }}
                    placeholder="Select Project Type"
                    className="flex h-10 -ml-[2.6rem] w-64 text-left"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: "2px solid #FAF6ED",
                        backgroundColor: "transparent",
                        boxShadow: "none",
                        borderRadius: "8px",
                        width: "320px",
                        textAlign: "left",
                      }),
                      indicatorSeparator: () => ({ display: "none" }),
                      placeholder: (base) => ({ ...base, color: "#888" }),
                      singleValue: (base) => ({ ...base, color: "#000" }),
                    }}
                    isDisabled={isInvoiceLocked}
                  />
                </div>
                <div className="mb-4" style={{ display: "flex", flexDirection: "column" }}>
                  <label className="block mb-2 mt-1 -ml-[15rem] font-semibold">
                    Project Name
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginLeft: "-2.6rem",
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
                          border: "2px solid #FAF6ED",
                          backgroundColor: "transparent",
                          boxShadow: "none",
                          borderRadius: "8px",
                          width: "250px",
                          minWidth: "150px",
                          textAlign: "left",
                        }),
                        indicatorSeparator: () => ({ display: "flex" }),
                        placeholder: (base) => ({ ...base, color: "#888" }),
                        singleValue: (base) => ({ ...base, color: "#000" }),
                      }}
                    />
                    {selectedProjectName && (
                      <div
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          backgroundColor: "#f0f0f0",
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}
                      >
                        ID: {selectedProjectName.value}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block mb-1 -ml-[13.8rem] font-semibold">
                    Client Address <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    onBlur={() => {
                      if (!clientAddress) {
                        alert("⚠️ Please enter the Client Address.");
                      }
                    }}
                    className="w-64 h-10 p-2 -ml-[5.5rem] border-2 border-[#FAF6ED] rounded-lg"
                    placeholder="Enter Client Address"
                    disabled={isInvoiceLocked}
                  />
                </div>
                <h5 className="-ml-[14.5rem] font-semibold">Client Phone:</h5>
                <div className="w-64 rounded-md p-2 block border-2 border-[#FAF6ED] -ml-[2rem] bg-gray-100">
                  <span className="-ml-32">{clientPhone}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-3 mt-8 items-center border-t pt-4">
                <button
                  className="w-64 bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-800 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Download / Print
                </button>
                <button
                  onClick={handleCloneClick}
                  className="w-64 bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-clone text-xs"></i>
                  Clone
                </button>
                <button
                  onClick={handleMakeCopy}
                  className="w-64 bg-[#BF9853] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#a67f40] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Make A Copy
                </button>
                <button
                  onClick={saveDraftToBackend}
                  className="w-64 bg-[#E4572E] text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-[#c2461f] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Save Online
                </button>
              </div>
            </div>
            {isCloneModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h2 className="text-lg font-bold mb-4">Select Project to Clone Items</h2>
                  <Select
                    options={projectNameOptions}
                    value={cloneProjectName}
                    onChange={setCloneProjectName}
                    placeholder="Select Project"
                    className="mb-4"
                    isSearchable={true}
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsCloneModalOpen(false)}
                      className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmClone}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={!cloneProjectName}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </body>
  );
}
export default InvoiceTable;