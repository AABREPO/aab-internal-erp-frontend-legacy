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
  // ...existing code...
  const findOption = (options, value) =>
    options.find((opt) => opt.value === value) || null;

  // --- ADD: normalize option input to either an option object or null
  const normalizeOption = (input, options = []) => {
    if (!input && input !== 0) return null;
    // already an option-like object
    if (typeof input === 'object' && input.value !== undefined && input.label !== undefined) {
      return input;
    }
    // string/number -> try to find matching option
    const str = String(input).trim();
    const found = (options || []).find(o => String(o.value) === str || String(o.label) === str);
    return found || { value: str, label: str };
  };
  // ...existing code...
  const mapFetchedItems = (flatItems = []) => {
    if (!Array.isArray(flatItems)) return [];
    const grouped = {};
    flatItems.forEach((item, idx) => {
      const mainDescValue = item.description?.value || item.description || "";
      if (!grouped[mainDescValue]) {
        grouped[mainDescValue] = {
          description: normalizeOption(mainDescValue, descriptions),
          workType: item.workType || "",
          subItems: [],
        };
      }

      grouped[mainDescValue].subItems.push({
        description: normalizeOption(
          item.sub_description || item.subItemDescription || item.description,
          subItems
        ) || { value: item.sub_description || item.subItemDescription || "", label: item.sub_description || item.subItemDescription || "" },
        sizeInput: item.size_input || item.sizeInput || "",
        qty: item.qty || "",
        rate: item.rate || "",
        unit: normalizeOption(item.unit || (item.unit && item.unit.value) || item.unit, units) || { value: item.unit || "", label: item.unit || "" },
        amount: item.amount || "",
        mainRow: {
          sizeInput: item.size_input || item.sizeInput || "",
          qty: item.qty || "",
          rate: item.rate || "",
          unit: normalizeOption(item.unit || (item.unit && item.unit.value) || item.unit, units) || { value: item.unit || "", label: item.unit || "" },
          amount: item.amount || "",
        },
        key: item.item_id || idx,
      });
    });
    return Object.values(grouped);
  };
  // ...existing code...

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

    // helper to get plain unit value
    const getUnitValue = (u) => {
      if (!u && u !== 0) return '';
      return typeof u === 'object' && u.value !== undefined ? u.value : String(u);
    };

    // assign sizeInput
    if (isMainRow) {
      subItem.mainRow.sizeInput = value;
    } else {
      subItem.sizeInput = value;
    }

    // compute qty & amount from current sizeInput + unit + rate
    const unitValue = isMainRow ? getUnitValue(subItem.mainRow.unit) : getUnitValue(subItem.unit);
    const sizeVal = isMainRow ? (subItem.mainRow.sizeInput || '') : (subItem.sizeInput || '');
    const rateVal = isMainRow ? (parseFloat(subItem.mainRow.rate) || 0) : (parseFloat(subItem.rate) || 0);

    const computeQty = () => {
      if (!sizeVal || String(sizeVal).trim() === '') return '';
      // if user typed pure number treat as direct measure (convertToFeet will handle plain numbers too)
      try {
        if (unitValue === 'SQFT' || unitValue === 'M²') {
          const area = calculateArea(String(sizeVal), unitValue);
          return isNaN(Number(area)) ? `${area}` : `${area} ${unitValue === 'SQFT' ? 'Sqft' : 'm²'}`;
        }
        if (unitValue === 'CFT' || unitValue === 'M³') {
          const vol = calculateVolume(String(sizeVal));
          return isNaN(Number(vol)) ? `${vol}` : `${vol} ${unitValue === 'CFT' ? 'Cubic Feet' : 'm³'}`;
        }
        if (unitValue === 'RFT') {
          // convertToFeet handles "10'", '10"','10', etc.
          const length = convertToFeet(String(sizeVal));
          return isNaN(length) ? 'Invalid input' : `${length.toFixed(2)} ft`;
        }
        if (unitValue === 'L') {
          const liters = calculateLiters(String(sizeVal));
          return isNaN(Number(liters)) ? `${liters}` : `${liters} L`;
        }
        if (unitValue === 'NOS') {
          const evalQty = evaluateExpression(String(sizeVal));
          return isNaN(evalQty) ? 'Invalid input' : `${evalQty}`;
        }
        if (unitValue === 'L.S') {
          const evalQty = evaluateExpression(String(sizeVal));
          return isNaN(evalQty) ? 'Invalid input' : `${evalQty}`;
        }
        // default: treat as direct numeric qty or text
        return String(sizeVal).trim();
      } catch {
        return '';
      }
    };

    const newQty = computeQty();

    if (isMainRow) {
      subItem.mainRow.qty = newQty;
      // compute amount
      if (subItem.mainRow.qty && rateVal && unitValue !== 'NOS') {
        const q = parseQty(subItem.mainRow.qty);
        subItem.mainRow.amount = (q * rateVal).toFixed(2);
      } else if (unitValue === 'NOS') {
        const q = evaluateExpression(String(sizeVal));
        if (!isNaN(q)) {
          subItem.mainRow.qty = `${q}`;
          subItem.mainRow.amount = (q * rateVal).toFixed(2);
        } else {
          subItem.mainRow.amount = 'Invalid input';
        }
      } else {
        subItem.mainRow.amount = subItem.mainRow.amount ? subItem.mainRow.amount : '';
      }
    } else {
      subItem.qty = newQty;
      if (subItem.qty && rateVal && unitValue !== 'NOS') {
        const q = parseQty(subItem.qty);
        subItem.amount = (q * rateVal).toFixed(2);
      } else if (unitValue === 'NOS') {
        const q = evaluateExpression(String(sizeVal));
        if (!isNaN(q)) {
          subItem.qty = `${q}`;
          subItem.amount = (q * rateVal).toFixed(2);
        } else {
          subItem.amount = 'Invalid input';
        }
      } else {
        subItem.amount = subItem.amount ? subItem.amount : '';
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
  // 🧱 Clone restore guard flag
  const [isRestoringClone, setIsRestoringClone] = useState(false);
  const [isInvoiceLocked, setIsInvoiceLocked] = useState(false);
  const [isModalProjectChange, setIsModalProjectChange] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");


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
          id: item.id,
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
    const sanitizeInvoiceNumber = (invNum) => {
      if (!invNum || typeof invNum !== "string") return "";
      return invNum.trim().split(/[: ]/)[0];
    };

    if (!selectedOption || !selectedOption.value) {
      ReactDOM.unstable_batchedUpdates(() => {
        setSelectedProjectName(null);
        setProjectType(null);
        setInvoiceNumber("");
        setInvoiceVersions([]);
        setCurrentInvoice(null);
        // Assuming 'setItems' is available globally/in scope
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
    // FIX: Set projectType to null to prevent persistence on project name change
    setProjectType(null);
    const projectID = String(selectedOption.value || "").trim();
    if (!projectID) return;

    const storedCloneRaw = localStorage.getItem(`cloned_${projectID}`);
    let restored = false;
    if (storedCloneRaw) {
      const storedClone = JSON.parse(storedCloneRaw);
      console.log("🟢 Restoring cloned data for project:", projectID, storedClone);
      const newBaseInvoiceNumber = `INV${projectID}-01`;
      const clonedInvoiceNumber = newBaseInvoiceNumber;
      const clonedItems = storedClone.clonedItems || [];
      const clonedInvoiceData = null;
      let invoiceOptions = [{ value: clonedInvoiceNumber, label: clonedInvoiceNumber }];
      setInvoiceVersions(invoiceOptions);

      ReactDOM.unstable_batchedUpdates(() => {
        setInvoiceNumber(clonedInvoiceNumber);
        // Assuming 'mapFetchedItems' and 'setItems' are available globally/in scope
        setItems(mapFetchedItems(clonedItems));
        setClientName(null);
        setClientAddress("");
        setInvoiceDate("");
        setAmountPaid("");
        setCurrentInvoice(clonedInvoiceData);
        setIsInvoiceLocked(false);
      });
      restored = true;
    }

    if (!restored) {
      const permanentOptions = allInvoices
        .filter(inv => inv.invoice && String(inv.invoice.project_id) === projectID)
        .map(inv => ({
          value: sanitizeInvoiceNumber(inv.invoice.invoice_number),
          label: sanitizeInvoiceNumber(inv.invoice.invoice_number),
        }));

      const cachedOptions = Object.values(invoiceCache || {})
        .filter(data => data.invoice && String(data.invoice.project_id) === projectID)
        .map(data => ({
          value: sanitizeInvoiceNumber(data.invoice.invoice_number),
          label: sanitizeInvoiceNumber(data.invoice.invoice_number),
        }));

      const combinedOptionsMap = new Map();
      [...permanentOptions, ...cachedOptions].forEach(opt => {
        if (opt.value) combinedOptionsMap.set(opt.value, opt);
      });

      let invoiceOptions = Array.from(combinedOptionsMap.values()).sort((a, b) =>
        a.value.localeCompare(b.value, undefined, { numeric: true })
      );

      const baseInv = `INV${projectID}-01`;
      if (!invoiceOptions.find(opt => opt.value === baseInv)) {
        invoiceOptions.unshift({ value: baseInv, label: baseInv });
      }

      setInvoiceVersions(invoiceOptions);
      await new Promise(resolve => setTimeout(resolve, 0));

      const invoiceToSelect = invoiceOptions.length > 0 ? invoiceOptions[invoiceOptions.length - 1].value : "";
      setInvoiceNumber(invoiceToSelect);

      if (!isCloning && !isModalProjectChange) {
        if (invoiceOptions.length > 0 && invoiceToSelect) {
          // FIX: Removed manual call to handleInvoiceVersionChange. 
          // The useEffect watching invoiceNumber will now handle the fetch.
          setIsInvoiceLocked(/ D\d+(\.\d+)?/.test(invoiceToSelect));
        } else {
          ReactDOM.unstable_batchedUpdates(() => {
            setCurrentInvoice(null);
            // Assuming 'setItems' is available globally/in scope
            setItems([]);
            setClientName(null);
            setClientAddress("");
            setInvoiceDate("");
            setAmountPaid("");
            setIsInvoiceLocked(false);
          });
        }
      }
    }

    if (isCloning) setIsCloning(false);
  };

  const [cachedInvoiceVersions, setCachedInvoiceVersions] = useState([]);

  const refreshInvoiceVersions = async (baseInvoiceNumber) => {
    if (!baseInvoiceNumber) return;
    console.log("[DEBUG] Refreshing invoice versions for base:", baseInvoiceNumber);

    try {
      const res = await axios.get(
        `https://backendaab.in/aabuildersDash/api/invoices/versions/${encodeURIComponent(baseInvoiceNumber)}`
      );

      const data = Array.isArray(res.data) ? res.data : [];
      const options = data
        .map(invNum => invNum?.trim?.())
        .filter(Boolean)
        .map(invNum => ({ value: invNum, label: invNum }));

      console.log("[DEBUG] Invoice versions received:", options);

      // ✅ Ensure base always included
      if (!options.find(o => o.value === baseInvoiceNumber.trim())) {
        options.unshift({ value: baseInvoiceNumber.trim(), label: baseInvoiceNumber.trim() });
        console.log("[DEBUG] Added base invoice number to versions list:", baseInvoiceNumber);
      }

      // ✅ Deduplicate both caches and live options cleanly
      setCachedInvoiceVersions(prevCache => {
        const merged = [...prevCache, ...options];
        const unique = Array.from(new Map(merged.map(o => [o.value, o])).values());
        return unique;
      });

      setInvoiceVersions(prevOptions => {
        const merged = [...prevOptions, ...options];
        const unique = Array.from(new Map(merged.map(o => [o.value, o])).values());
        return unique;
      });

    } catch (error) {
      console.error("[ERROR] Failed to refresh invoice versions:", error);

      const fallback = invoiceNumber
        ? [{ value: invoiceNumber.trim(), label: invoiceNumber.trim() }]
        : cachedInvoiceVersions;

      setInvoiceVersions(fallback.length > 0 ? fallback : []);
    }
  };
  // Restore last invoice AFTER invoices list is loaded to avoid races.
  // Wait for allInvoices to exist so find/lookups and local-cache logic are accurate.
  useEffect(() => {
    // Do nothing until allInvoices are loaded (prevents race where initialize resets state).
    if (!Array.isArray(allInvoices) || allInvoices.length === 0) return;

    const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber');
    if (!lastInvoiceNumber) {
      // No saved invoice — ensure basic UI cleared
      setItems([]);
      setClientName(null);
      setProjectType(null);
      setInvoiceDate('');
      setAmountPaid('');
      return;
    }

    // Mark that we are doing a restore to avoid other effects interfering if you use that flag.
    // (If you don't track isRestoringClone elsewhere, you can add a local flag.)
    setInvoiceNumber(lastInvoiceNumber);

    // Fetch and display the invoice data for the last saved invoice
    axios
      .get(`https://backendaab.in/aabuildersDash/api/invoices/${encodeURIComponent(lastInvoiceNumber)}`)
      .then(res => {
        const { invoice, items } = res.data || {};
        if (invoice) {
          const mappedItems = mapFetchedItems(items || []);
          setInvoiceDate(invoice.date || "");
          setClientName(findOption(clients, invoice.client_name?.trim()) || null);
          setClientAddress(invoice.client_address || "");
          setAmountPaid(invoice.amount_paid ?? "");
          setItems(mappedItems);
          setCurrentInvoice(invoice);

          // Set project type and project name (use existing lookup arrays)
          const matchedType =
            projectTypes.find(pt =>
              String(pt.value).toLowerCase().trim() === String(invoice.project_type).toLowerCase().trim() ||
              String(pt.label).toLowerCase().trim() === String(invoice.project_type).toLowerCase().trim()
            ) || (invoice.project_type ? { value: invoice.project_type, label: invoice.project_type } : null);
          setProjectType(matchedType);

          const selectedProjectNameOption =
            projectNameOptions.find(opt => String(opt.value) === String(invoice.project_id)) || null;
          setSelectedProjectName(selectedProjectNameOption);
        } else {
          console.warn('WARN No invoice data found for:', lastInvoiceNumber);
          setItems([]);
          setCurrentInvoice(null);
        }
      })
      .catch(error => {
        console.error('Error loading invoice data for invoiceNumber:', lastInvoiceNumber, error);
        setItems([]);
        setCurrentInvoice(null);
      });
  }, [allInvoices]);

  // Fetch invoice when invoiceNumber changes, but guard against restore/cloning flows
  useEffect(() => {
    if (!invoiceNumber) return;

    // Avoid fetching while user is cloning / modal project change / or restoring clones
    // (these flags are in your code: isCloning, isModalProjectChange, isRestoringClone)
    if (isRestoringClone || isCloning || isModalProjectChange) {
      console.warn('Skipping backend fetch for invoiceNumber due to clone/modal/restore flags.');
      return;
    }

    let active = true;
    const baseInvNum = getBaseInvoiceNumber(invoiceNumber).trim();
    if (!baseInvNum) return;

    const isBrandNewBaseNumber =
      invoiceNumber.trim() === baseInvNum &&
      !allInvoices.some(invEntry => invEntry.invoice?.invoice_number?.trim() === invoiceNumber.trim());

    if (isBrandNewBaseNumber) {
      console.warn('Skipping GET load for brand new unsaved base invoice:', invoiceNumber);
      ReactDOM.unstable_batchedUpdates(() => {
        setInvoiceDate('');
        setClientName(null);
        setClientAddress('');
        setAmountPaid('');
        setItems([]);
        setCurrentInvoice(null);
      });
      refreshInvoiceVersions(baseInvNum);
      return;
    }

    refreshInvoiceVersions(baseInvNum);

    axios
      .get(`https://backendaab.in/aabuildersDash/api/invoices/${encodeURIComponent(invoiceNumber)}`)
      .then(res => {
        if (!active) return;
        const { invoice, items } = res.data || {};
        if (invoice) {
          const mappedItems = mapFetchedItems(items || []);
          ReactDOM.unstable_batchedUpdates(() => {
            setInvoiceDate(invoice.date || "");
            setClientName(findOption(clients, invoice.client_name?.trim()) || null);
            setClientAddress(invoice.client_address || "");
            setAmountPaid(invoice.amountPaid ?? "");
            setItems(mappedItems);
            setCurrentInvoice(invoice);
          });
        } else {
          console.warn('WARN No invoice data found for:', invoiceNumber);
          ReactDOM.unstable_batchedUpdates(() => {
            setItems([]);
            setCurrentInvoice(null);
          });
        }
      })
      .catch(error => {
        if (!active) return;
        console.error('Error loading invoice data for invoiceNumber:', invoiceNumber, error);
        ReactDOM.unstable_batchedUpdates(() => {
          setItems([]);
          setCurrentInvoice(null);
        });
      });

    return () => {
      active = false;
    };
  }, [invoiceNumber, allInvoices, isRestoringClone, isCloning, isModalProjectChange]);
  const handleInvoiceVersionChange = async (selectedOption) => {
    if (!selectedOption || !selectedOption.value) {
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

    const selectedInvoiceNumber = selectedOption.value.trim();
    setInvoiceNumber(selectedInvoiceNumber);
    localStorage.setItem("lastInvoiceNumber", selectedInvoiceNumber);

    try {
      // ✅ 1️⃣ Check if already cached (fast path)
      if (invoiceCache[selectedInvoiceNumber]) {
        const cachedData = invoiceCache[selectedInvoiceNumber];
        const mappedItems = mapFetchedItems(cachedData.items || []);

        ReactDOM.unstable_batchedUpdates(() => {
          setCurrentInvoice(cachedData.invoice);
          setItems(mappedItems);
          const clientOption =
            clients.find(
              c =>
                c.id === cachedData.invoice.client_id ||
                c.value === cachedData.invoice.client_id
            ) || null;

          setClientName(clientOption);
          setClientAddress(cachedData.invoice.client_address || "");
          setInvoiceDate(cachedData.invoice.date || "");
          setAmountPaid(cachedData.invoice.amount_paid ?? 0);

          const projectTypeStr = String(cachedData.invoice.project_type || "")
            .trim()
            .toLowerCase();
          const matchedType =
            projectTypes.find(pt =>
              String(pt.value).toLowerCase().trim() === projectTypeStr ||
              String(pt.label).toLowerCase().trim() === projectTypeStr
            ) ||
            (cachedData.invoice.project_type
              ? { value: cachedData.invoice.project_type, label: cachedData.invoice.project_type }
              : null);

          setProjectType(matchedType);
        });
        return;
      }

      // ✅ 2️⃣ Load the selected invoice directly from allInvoices
      // (No version copy logic here — D1, D2, etc. are real saved invoices)
      const selectedInvEntry = allInvoices.find(
        invEntry =>
          invEntry.invoice &&
          invEntry.invoice.invoice_number &&
          invEntry.invoice.invoice_number.trim() === selectedInvoiceNumber
      );

      if (!selectedInvEntry) {
        console.warn("No invoice found for", selectedInvoiceNumber);
        return;
      }

      const invoiceData = selectedInvEntry.invoice;
      const itemList = selectedInvEntry.items || [];
      const mappedItems = mapFetchedItems(itemList || []);

      // ✅ Cache it for next selection
      setInvoiceCache(prev => ({
        ...prev,
        [selectedInvoiceNumber]: {
          invoice: invoiceData,
          items: itemList,
        },
      }));

      // ✅ Update state
      ReactDOM.unstable_batchedUpdates(() => {
        setCurrentInvoice(invoiceData);
        setItems(mappedItems);

        const clientOption =
          clients.find(
            c => c.id === invoiceData.client_id || c.value === invoiceData.client_id
          ) || null;

        setClientName(clientOption);
        setClientAddress(invoiceData.client_address || "");
        setInvoiceDate(invoiceData.date || "");
        setAmountPaid(invoiceData.amount_paid ?? 0);

        const projectTypeStr = String(invoiceData.project_type || "")
          .trim()
          .toLowerCase();
        const matchedType =
          projectTypes.find(pt =>
            String(pt.value).toLowerCase().trim() === projectTypeStr ||
            String(pt.label).toLowerCase().trim() === projectTypeStr
          ) ||
          (invoiceData.project_type
            ? { value: invoiceData.project_type, label: invoiceData.project_type }
            : null);

        setProjectType(matchedType);
      });
    } catch (error) {
      console.error("Error loading invoice:", error);
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
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 10000); // 10 seconds
  };
  useEffect(() => {
    async function initializeInvoices() {
      try {
        const res = await axios.get("https://backendaab.in/aabuildersDash/api/invoices/all-with-items");
        const invoices = res.data || [];
        setAllInvoices(invoices);
        setInvoiceVersions([]);
      } catch (error) {
        console.error("Failed to initialize invoices", error);
      }
    }
    initializeInvoices();
  }, []);
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
        invoice_id: currentInvoice?.invoice_id || currentInvoice?.invoiceId || null,
      },
      items: items.flatMap((item) =>
        item.subItems.map((sub) => ({
          description: item.description?.label || item.description || "",
          sub_description: sub.description?.label || sub.description || "",
          size_input: sub.sizeInput || "",
          qty: sub.qty || "",
          rate: parseFloat(sub.rate) || 0,
          unit: sub.unit?.value || sub.unit || "",
          amount: parseFloat(sub.amount) || 0,
          is_main_row: false,
          item_id: sub.key || sub.item_id || null,
        }))
      ),
    };
    try {
      let res;
      const hasExistingInvoice =
        invoiceData.invoice.invoice_id &&
        String(invoiceData.invoice.invoice_number).includes(" D");
      if (hasExistingInvoice) {
        const existingRes = await axios.get(
          `https://backendaab.in/aabuildersDash/api/invoices/with-items/${invoiceData.invoice.invoice_id}`
        );
        const existingInvoice = existingRes.data;
        const oldItems = Array.isArray(existingInvoice.items) ? existingInvoice.items : [];
        const newItems = invoiceData.items || [];
        const mergedItems = [
          ...oldItems,
          ...newItems.filter(
            (newItem) =>
              !oldItems.some(
                (old) =>
                  old.sub_description?.trim() === newItem.sub_description?.trim() &&
                  parseFloat(old.amount) === parseFloat(newItem.amount)
              )
          ),
        ];
        const mergedPayload = { ...invoiceData, items: mergedItems };
        res = await axios.put(
          "https://backendaab.in/aabuildersDash/api/invoices/update-keep-existing",
          mergedPayload,
          { headers: { "Content-Type": "application/json" } }
        );
      } else {
        res = await axios.post(
          "https://backendaab.in/aabuildersDash/api/invoices/save-online",
          invoiceData,
          { headers: { "Content-Type": "application/json" } }
        );
      }
      const savedResponse = res.data || {};
      const savedInvoice = savedResponse.invoice || savedResponse;
      const savedItems = savedResponse.items || invoiceData.items || [];
      const savedNumber = String(savedInvoice.invoice_number || invoiceNumber).trim();
      setInvoiceCache(prev => ({
        ...prev,
        [savedNumber]: { invoice: savedInvoice, items: savedItems }
      }));
      setAllInvoices(prev => {
        const copy = Array.isArray(prev) ? [...prev] : [];
        const idx = copy.findIndex(e => String(e.invoice?.invoice_number || "").trim() === savedNumber);
        if (idx >= 0) {
          copy[idx] = { invoice: savedInvoice, items: savedItems };
        } else {
          copy.push({ invoice: savedInvoice, items: savedItems });
        }
        return copy;
      });
      showToastMessage("✅ Draft saved successfully!");
      ReactDOM.unstable_batchedUpdates(() => {
        setInvoiceNumber("");
        setInvoiceDate("");
        setClientName(null);
        setClientAddress("");
        setProjectType(null);
        setAmountPaid("");
        setItems([]);
        setInvoiceVersions([]);
        setCurrentInvoice(null);
        setSelectedProjectName(null);
      });
      localStorage.removeItem("lastInvoiceNumber");
      localStorage.removeItem("invoiceItems");
      localStorage.removeItem("invoiceClientName");
      localStorage.removeItem("invoiceProjectType");
      localStorage.removeItem("invoiceDate");
      localStorage.removeItem("invoiceAmountPaid");
      try {
        const resAll = await axios.get("https://backendaab.in/aabuildersDash/api/invoices/all-with-items");
        const allInvoicesData = Array.isArray(resAll.data) ? resAll.data : [];
        setAllInvoices(allInvoicesData);
      } catch (err) {
        console.warn("Failed to refresh invoices after save:", err);
      }
    } catch (error) {
      console.error("[ERROR] Failed to save draft:", error);
      showToastMessage("❌ Failed to save draft.");
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
      setInvoiceNumber('');
      setInvoiceDate('');
      setClientName(null);
      setClientAddress('');
      setProjectType(null);
      setAmountPaid('');
      setItems([]);
      setInvoiceVersions([]);
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
  const handleMakeCopy = async () => {
    if (!invoiceNumber) {
      alert("Invoice number required before copying.");
      return;
    }
    const totalAmount = calculateTotalAmount();
    const currentClientId = clientName ? clientName.id : currentInvoice?.client_id || null;
    const currentProjectId = selectedProjectName ? selectedProjectName.value : currentInvoice?.project_id || null;
    const currentInvoicePayload = {
      invoice: {
        invoice_number: invoiceNumber,
        status: "draft",
        date: invoiceDate || currentInvoice?.invoice_date || "",
        client_name: clientName ? clientName.value : currentInvoice?.client_name || "",
        client_address: clientAddress || currentInvoice?.client_address || "",
        client_id: currentClientId,
        project_name: selectedProjectName ? selectedProjectName.label : currentInvoice?.project_name || "",
        project_id: currentProjectId,
        project_type: projectType ? projectType.value : currentInvoice?.project_type || "",
        amount_paid: parseFloat(amountPaid) || currentInvoice?.amount_paid || 0,
        total_amount: totalAmount,
        invoice_id: currentInvoice?.invoice_id || null,
      },
      items: (items || []).flatMap(item =>
        item.subItems.map(sub => ({
          description: item.description?.label || item.description || "",
          sub_description: sub.description?.label || sub.description || "",
          size_input: sub.sizeInput || "",
          qty: sub.qty || "",
          rate: parseFloat(sub.rate) || 0,
          unit: sub.unit?.value || sub.unit || "",
          amount: parseFloat(sub.amount) || 0,
          is_main_row: false,
          item_id: sub.key || sub.item_id || null,
        }))
      ),
    };
    try {
      const response = await axios.post(
        "https://backendaab.in/aabuildersDash/api/invoices/make-copy",
        currentInvoicePayload,
        { headers: { "Content-Type": "application/json" } }
      );
      const savedResponse = response.data || {};
      const savedInvoice = savedResponse.invoice || savedResponse;
      const savedItems = savedResponse.items || [];
      const newInvoiceNumber = savedInvoice.invoice_number || "";
      ReactDOM.unstable_batchedUpdates(() => {
        setInvoiceNumber(newInvoiceNumber);
        setCurrentInvoice(savedInvoice);
        setItems(mapFetchedItems(savedItems));
      });
      await refreshInvoiceVersions(getBaseInvoiceNumber(newInvoiceNumber));
      alert(`Invoice successfully copied as ${newInvoiceNumber}`);
    } catch (error) {
      console.error("[ERROR] Make Copy failed:", error);
      alert("Failed to make a copy. See console for details.");
    }
  };
  const handleCloneClick = () => {
    setIsCloneModalOpen(true);
    setCloneProjectName(null);
    setIsModalProjectChange(true);
  };
  const handleConfirmClone = async () => {
    if (!cloneProjectName) {
      alert("Please select a project to clone to.");
      return;
    }
    const sourceId = String(selectedProjectName?.value ?? selectedProjectName?.siteNo ?? "");
    const targetId = String(cloneProjectName?.value ?? cloneProjectName?.siteNo ?? "");
    if (!sourceId) {
      alert("No source project selected to clone from.");
      return;
    }
    if (!targetId) {
      alert("No target project selected to clone to.");
      return;
    }
    const confirmMessage = `Do you want to clone Records from invoice ${invoiceNumber} of project ${selectedProjectName?.label || sourceId} to project ${cloneProjectName.label}?`;
    if (!window.confirm(confirmMessage)) return;
    if (!Array.isArray(allInvoices) || allInvoices.length === 0) {
      try {
        const res = await axios.get("https://backendaab.in/aabuildersDash/api/invoices/all-with-items");
        setAllInvoices(res.data || []);
      } catch (err) {
        alert("Failed to refresh invoices, cannot clone.");
        return;
      }
    }
    const sourceInvoiceEntry = allInvoices.find(inv =>
      inv.invoice &&
      String(inv.invoice.project_id) === sourceId &&
      inv.invoice.invoice_number.trim().toUpperCase() === invoiceNumber.trim().toUpperCase()
    );
    if (!sourceInvoiceEntry) {
      alert("Selected invoice not found in source project. Cannot clone.");
      return;
    }
    const clonedItemsRaw = sourceInvoiceEntry.items || [];
    if (clonedItemsRaw.length === 0) {
      alert("No items found in the selected invoice to clone.");
      return;
    }
    try {
      const clonePayload = {
        invoice: sourceInvoiceEntry.invoice,
        items: clonedItemsRaw,
        newProjectId: Number(cloneProjectName.value),
        newProjectName: cloneProjectName.label,
      };
      const response = await axios.post("https://backendaab.in/aabuildersDash/api/invoices/clone", clonePayload);
      const clonedInvoice = response.data;
      setSelectedProjectName(cloneProjectName);
      setProjectType(cloneProjectName.project_type || "");
      setInvoiceNumber(clonedInvoice.invoiceNumber);
      setItems(mapFetchedItems(clonedInvoice.items || clonedItemsRaw));
      setClientName(null);
      setClientAddress("");
      setInvoiceDate("");
      setAmountPaid("");
      setCurrentInvoice(clonedInvoice);
      setIsInvoiceLocked(false);
      setIsCloneModalOpen(false);
    } catch (error) {
      alert("Unable to clone invoice: " + (error.response?.data || error.message));
    }
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
      const parts = dim.split("'");
      feet = parseFloat(parts[0].trim());
      inches = parseFloat(parts[1].replace('"', '').trim());
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
  const calculateArea = (input, unit) => {
    input = input.replace(/''/g, '"');
    const dimensionGroups = input.split('+').map(dim => dim.trim());
    let totalArea = 0;
    const convertToFeet = (dim) => {
      let feet = 0;
      let inches = 0;
      if (dim.includes("'") && dim.includes('"')) {
        const parts = dim.split("'");
        feet = parseFloat(parts[0].trim());
        inches = parseFloat(parts[1].replace('"', '').trim());
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
        } else {
          length = convertToFeet(arr[0]);
          width = convertToFeet(arr[1]);
        }
        if (!isNaN(length) && !isNaN(width)) {
          totalArea += length * width;
        }
      }
    });
    return totalArea.toFixed(2);
  };
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
    if (/^\d+(\.\d+)?$/.test(input.trim())) {
      return parseFloat(input).toFixed(2);
    }
    const volumeInCubicFeet = parseFloat(calculateVolume(input));
    const volumeInLiters = volumeInCubicFeet * 28;
    return volumeInLiters.toFixed(2);
  };
  const evaluateExpression = (expr) => {
    expr = expr.replace(/x/gi, '*');
    if (/^[0-9+\-*/().\s]+$/.test(expr)) {
      try {
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
    const getUnitValue = (u) => {
      if (!u && u !== 0) return '';
      return typeof u === 'object' && u.value !== undefined ? u.value : String(u);
    };
    const setAndRecalc = () => {
      const unitValue = isMainRow ? getUnitValue(subItem.mainRow.unit) : getUnitValue(subItem.unit);
      const sizeVal = isMainRow ? (subItem.mainRow.sizeInput || '') : (subItem.sizeInput || '');
      const rateVal = isMainRow ? (parseFloat(subItem.mainRow.rate) || 0) : (parseFloat(subItem.rate) || 0);
      const computeQty = () => {
        if (!sizeVal || String(sizeVal).trim() === '') return '';
        if (unitValue === 'SQFT' || unitValue === 'M²') {
          const area = calculateArea(String(sizeVal), unitValue);
          return isNaN(Number(area)) ? `${area}` : `${area} ${unitValue === 'SQFT' ? 'Sqft' : 'm²'}`;
        }
        if (unitValue === 'CFT' || unitValue === 'M³') {
          const vol = calculateVolume(String(sizeVal));
          return isNaN(Number(vol)) ? `${vol}` : `${vol} ${unitValue === 'CFT' ? 'Cubic Feet' : 'm³'}`;
        }
        if (unitValue === 'RFT') {
          const length = convertToFeet(String(sizeVal));
          return isNaN(length) ? 'Invalid input' : `${length.toFixed(2)} ft`;
        }
        if (unitValue === 'L') {
          const liters = calculateLiters(String(sizeVal));
          return isNaN(Number(liters)) ? `${liters}` : `${liters} L`;
        }
        if (unitValue === 'NOS' || unitValue === 'L.S') {
          const evalQty = evaluateExpression(String(sizeVal));
          return isNaN(evalQty) ? 'Invalid input' : `${evalQty}`;
        }
        return String(sizeVal).trim();
      };
      const newQty = computeQty();
      if (isMainRow) {
        subItem.mainRow.qty = newQty;
        if (subItem.mainRow.qty && rateVal && unitValue !== 'NOS') {
          const q = parseQty(subItem.mainRow.qty);
          subItem.mainRow.amount = (q * rateVal).toFixed(2);
        } else if (unitValue === 'NOS') {
          const q = evaluateExpression(String(sizeVal));
          if (!isNaN(q)) {
            subItem.mainRow.qty = `${q}`;
            subItem.mainRow.amount = (q * rateVal).toFixed(2);
          } else {
            subItem.mainRow.amount = 'Invalid input';
          }
        } else {
          subItem.mainRow.amount = subItem.mainRow.amount ? subItem.mainRow.amount : '';
        }
      } else {
        subItem.qty = newQty;
        if (subItem.qty && rateVal && unitValue !== 'NOS') {
          const q = parseQty(subItem.qty);
          subItem.amount = (q * rateVal).toFixed(2);
        } else if (unitValue === 'NOS') {
          const q = evaluateExpression(String(sizeVal));
          if (!isNaN(q)) {
            subItem.qty = `${q}`;
            subItem.amount = (q * rateVal).toFixed(2);
          } else {
            subItem.amount = 'Invalid input';
          }
        } else {
          subItem.amount = subItem.amount ? subItem.amount : '';
        }
      }
    };
    const val = typeof value === 'string' ? value : value;
    if (isMainRow) {
      if (field === 'unit') {
        subItem.mainRow.unit = value;
      } else if (field === 'rate') {
        subItem.mainRow.rate = parseFloat(val) || '';
      } else if (field === 'amount') {
        subItem.mainRow.amount = parseFloat(val) || '';
      } else if (field === 'sizeInput') {
        subItem.mainRow.sizeInput = val;
      }
    } else {
      if (field === 'unit') {
        subItem.unit = value;
      } else if (field === 'rate') {
        subItem.rate = parseFloat(val) || '';
      } else if (field === 'amount') {
        subItem.amount = parseFloat(val) || '';
      } else if (field === 'sizeInput') {
        subItem.sizeInput = val;
      }
    }
    setAndRecalc();
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
                    {(items || []).map((item, itemIndex) => (
                      <React.Fragment key={itemIndex}>
                        <tr key={`main-${itemIndex}`} className="odd:bg-white even:bg-[#FAF6ED] hover:bg-gray-50">
                          <td className="p-2 border-b border-gray-200">
                            <div className="flex items-center mb-2">
                              <span className="mr-2 font-semibold">{displayIndex++}.</span>
                              <CreatableSelect
                                options={descriptions}
                                value={normalizeOption(item.description, descriptions) || null}
                                onChange={(value) => {
                                  const updatedItems = [...items];
                                  updatedItems[itemIndex].description = normalizeOption(value, descriptions) || null;
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
                        {(item.subItems || []).map((subItem, subItemIndex) => (
                          <tr key={`sub-${itemIndex}-${subItemIndex}`} className="odd:bg-white even:bg-[#FAF6ED] hover:bg-gray-50">
                            <td className="p-2 border-b border-gray-200">
                              <div className="flex items-center space-x-2 gap-0 group">
                                <CreatableSelect
                                  options={subItems}
                                  value={normalizeOption(subItem.description, subItems) || null}
                                  onChange={(value) => {
                                    const updatedItems = [...items];
                                    updatedItems[itemIndex].subItems[subItemIndex].description = normalizeOption(value, subItems) || null;
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
                                    <img src={add} alt="Add" className="w-6 h-6" />
                                  </button>
                                  <button
                                    className="font-normal py-1 px-2 rounded-full hover:bg-gray-200"
                                    onClick={() => handleRemoveSubItem(itemIndex, subItemIndex)}
                                    title="Remove sub-item"
                                  >
                                    <img src={delt} alt="Delete" className="w-6 h-6" />
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
                                onChange={(e) => handleSubItemChange(itemIndex, subItemIndex, 'rate', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded hover:border-gray-400 focus:border-[#BF9853] focus:outline-none"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              <Select
                                options={units}
                                value={subItem.unit}
                                onChange={(value) => handleSubItemChange(itemIndex, subItemIndex, 'unit', value)}
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
                  {showToast && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
                      <div className="bg-green-600 text-white text-2xl font-bold px-10 py-6 rounded-lg shadow-lg pointer-events-auto select-none whitespace-nowrap animate-fadeInOut">
                        {toastMessage}
                      </div>
                    </div>
                  )}
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
                    <button onClick={() => setIsCloneModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-100">
                      Cancel
                    </button>
                    <button onClick={handleConfirmClone} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={!cloneProjectName}>
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