import React, { useState, useEffect, useRef } from 'react';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from 'react-select';
import Filter from '../Images/filter (3).png'
import Reload from '../Images/rotate-right.png'
import { sum } from 'mathjs';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
import Attach from '../Images/Attachfile.svg';

const AdvanceDatabase = ({ username, userRoles = [] }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [advanceData, setAdvanceData] = useState([]);
  const [selectTimeStampDate, setSelectTimeStampDate] = useState('');
  const [selectDatabaseDate, setSelectDatabaseDate] = useState('');
  const [selectDatabaseContractororVendorName, setSelectDatabaseContractororVendorName] = useState('');
  const [selectDatabaseProjectName, setSelectDatabaseProjectName] = useState('');
  const [selectDatabaseTransfer, setSelectDatabaseTransfer] = useState('');
  const [selectDatabaseType, setSelectDatabaseType] = useState('');
  const [selectDatabaseMode, setSelectDatabaseMode] = useState('');
  const [selectDatabaseEntryNo, setSelectDatabaseEntryNo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvancePortalModal, setShowAdvancePortalModal] = useState(false);
  const [file, setFile] = useState(null);
  const [advancePortalAudits, setAdvancePortalAudits] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [overallAdvance, setOverallAdvance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Load filters from sessionStorage on mount
  useEffect(() => {
    // Check if this is a page refresh or navigation
    const isPageRefresh = sessionStorage.getItem('advanceDatabasePageLoaded') === null;

    if (isPageRefresh) {
      // First load or manual refresh - clear filters
      sessionStorage.removeItem('advanceDatabaseFilters');
      sessionStorage.setItem('advanceDatabasePageLoaded', 'true');
    } else {
      // Navigation from another page - restore filters
      const savedFilters = sessionStorage.getItem('advanceDatabaseFilters');
      if (savedFilters) {
        try {
          const filters = JSON.parse(savedFilters);
          if (filters.selectTimeStampDate) setSelectTimeStampDate(filters.selectTimeStampDate);
          if (filters.selectDatabaseDate) setSelectDatabaseDate(filters.selectDatabaseDate);
          if (filters.selectDatabaseContractororVendorName) setSelectDatabaseContractororVendorName(filters.selectDatabaseContractororVendorName);
          if (filters.selectDatabaseProjectName) setSelectDatabaseProjectName(filters.selectDatabaseProjectName);
          if (filters.selectDatabaseTransfer) setSelectDatabaseTransfer(filters.selectDatabaseTransfer);
          if (filters.selectDatabaseType) setSelectDatabaseType(filters.selectDatabaseType);
          if (filters.selectDatabaseMode) setSelectDatabaseMode(filters.selectDatabaseMode);
          if (filters.selectDatabaseEntryNo) setSelectDatabaseEntryNo(filters.selectDatabaseEntryNo);
          if (filters.startDate) setStartDate(filters.startDate);
          if (filters.endDate) setEndDate(filters.endDate);
          if (filters.showFilters !== undefined) setShowFilters(filters.showFilters);
        } catch (error) {
          console.error('Error loading filters from sessionStorage:', error);
        }
      }
    }

    // Set flag to indicate page is loaded
    return () => {
      // On unmount (when navigating away), keep the flag
      sessionStorage.setItem('advanceDatabasePageLoaded', 'true');
    };
  }, []);

  // Detect page refresh and clear the flag
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Check if it's a refresh (reload)
      const entries = performance.getEntriesByType('navigation');
      const navigationType = entries.length > 0 ? entries[0].type : null;

      if (navigationType === 'reload') {
        sessionStorage.removeItem('advanceDatabasePageLoaded');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    const filters = {
      selectTimeStampDate,
      selectDatabaseDate,
      selectDatabaseContractororVendorName,
      selectDatabaseProjectName,
      selectDatabaseTransfer,
      selectDatabaseType,
      selectDatabaseMode,
      selectDatabaseEntryNo,
      startDate,
      endDate,
      showFilters
    };
    sessionStorage.setItem('advanceDatabaseFilters', JSON.stringify(filters));
  }, [selectTimeStampDate, selectDatabaseDate, selectDatabaseContractororVendorName, selectDatabaseProjectName, selectDatabaseTransfer, selectDatabaseType, selectDatabaseMode, selectDatabaseEntryNo, startDate, endDate, showFilters]);

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    scroll.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
    };
    lastMove.current = {
      time: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
    cancelMomentum();
  };
  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const now = Date.now();
    const dt = now - lastMove.current.time || 16;
    velocity.current = {
      x: (e.clientX - lastMove.current.x) / dt,
      y: (e.clientY - lastMove.current.y) / dt,
    };
    scrollRef.current.scrollLeft = scroll.current.left - dx;
    scrollRef.current.scrollTop = scroll.current.top - dy;
    lastMove.current = {
      time: now,
      x: e.clientX,
      y: e.clientY,
    };
  };
  const handleMouseUp = () => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.style.cursor = '';
    scrollRef.current.style.userSelect = '';
    applyMomentum();
  };
  const cancelMomentum = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  };
  const applyMomentum = () => {
    if (!scrollRef.current) return;
    const friction = 0.95;
    const minVelocity = 0.1;
    const step = () => {
      const { x, y } = velocity.current;
      if (!scrollRef.current) return;
      if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
        scrollRef.current.scrollLeft -= x * 20;
        scrollRef.current.scrollTop -= y * 20;
        velocity.current.x *= friction;
        velocity.current.y *= friction;
        animationFrame.current = requestAnimationFrame(step);
      } else {
        cancelMomentum();
      }
    };
    animationFrame.current = requestAnimationFrame(step);
  };
  useEffect(() => {
    return () => cancelMomentum();
  }, []);

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");

    if (!isNaN(rawValue)) {
      setEditFormData(prev => {
        if (prev.type === "Refund") {
          return { ...prev, refund_amount: rawValue, amount: '' };
        } else {
          return { ...prev, amount: rawValue, refund_amount: '' };
        }
      });
    }
  };
  const formatWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle direction if clicking the same column
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      // Default to ascending if switching column
      return { key, direction: 'asc' };
    });
  };
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        setProgress(10);
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
        setProgress(25);
      } catch (error) {
        console.error("Fetch error: ", error);
        setError("Failed to load vendor data");
      }
    };
    fetchVendorNames();
  }, []);
  useEffect(() => {
    const fetchContractorNames = async () => {
      try {
        setProgress(35);
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
        setProgress(50);
      } catch (error) {
        console.error("Fetch error: ", error);
        setError("Failed to load contractor data");
      }
    };
    fetchContractorNames();
  }, []);
  useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);
  const exportPDF = () => {
    const doc = new jsPDF("l", "pt", "a4"); // landscape mode

    // Table column headers (same order as your table)
    const headers = [
      [
        "Time Stamp",
        "Date",
        "Contractor/Vendor",
        "Project Name",
        "Transfer Site",
        "Advance",
        "Bill Payment",
        "Refund",
        "Type",
        "Description",
        "Mode",
        "E.No"
      ]
    ];

    // Map only filtered table data
    const rows = sortedData.map((entry) => [
      formatDate(entry.timestamp),
      formatDateOnly(entry.date),
      entry.vendor_id
        ? getVendorName(entry.vendor_id)
        : getContractorName(entry.contractor_id),
      getSiteName(entry.project_id),
      getSiteName(entry.transfer_site_id),
      entry.amount != null && entry.amount !== ""
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.bill_amount != null && entry.bill_amount !== ""
        ? Number(entry.bill_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.refund_amount != null && entry.refund_amount !== ""
        ? Number(entry.refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.type,
      entry.description,
      entry.payment_mode,
      entry.entry_no
    ]);

    // Add Title
    doc.setFontSize(16);
    doc.text("Transaction Report", 24, 18);

    // AutoTable
    doc.autoTable({
      head: [headers[0]],
      body: rows,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineWidth: 0.3, // border thickness
        lineColor: [100, 100, 100], // border color (black)
        halign: "left"
      },
      headStyles: {
        fillColor: false, // remove background color
        textColor: [0, 0, 0], // black text
        fontStyle: "bold",
        lineWidth: 0.3,
        lineColor: [100, 100, 100]
      },
      bodyStyles: {
        fillColor: false, // no row background color
        textColor: [0, 0, 0],
        lineWidth: 0.3,
        lineColor: [100, 100, 100]
      },
      tableLineWidth: 0.3,
      tableLineColor: [100, 100, 100],
      columnStyles: {
        5: { halign: 'right' }, // Advance
        6: { halign: 'right' }, // Bill Payment
        7: { halign: 'right' }  // Refund
      }
    });

    doc.save("Transaction_Report.pdf");
  };
  const exportCSV = () => {
    const headers = [
      "Time Stamp",
      "Date",
      "Contractor/Vendor",
      "Project Name",
      "Transfer Site",
      "Advance",
      "Bill Payment",
      "Refund",
      "Type",
      "Description",
      "Mode",
      "E.No"
    ];

    const rows = sortedData.map(entry => [
      formatDate(entry.timestamp),
      formatDateOnly(entry.date),
      entry.vendor_id
        ? getVendorName(entry.vendor_id)
        : getContractorName(entry.contractor_id),
      getSiteName(entry.project_id),
      getSiteName(entry.transfer_site_id),
      entry.amount != null && entry.amount !== ""
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.bill_amount != null && entry.bill_amount !== ""
        ? Number(entry.bill_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.refund_amount != null && entry.refund_amount !== ""
        ? Number(entry.refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.type || "",
      entry.description || "",
      entry.payment_mode || "",
      entry.entry_no || ""
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(row => row.map(value => `"${value}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Transaction_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setProgress(60);
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
        const predefinedSiteOptions = [
          {
            value: "Mason Advance",
            label: "Mason Advance",
            id: 1,
            sNo: "1"
          },
          {
            value: "Material Advance",
            label: "Material Advance",
            id: 2,
            sNo: "2"
          },
          {
            value: "Weekly Advance",
            label: "Weekly Advance",
            id: 3,
            sNo: "3"
          },
          {
            value: "Excess Advance",
            label: "Excess Advance",
            id: 4,
            sNo: "4"
          },
          {
            value: "Material Rent",
            label: "Material Rent",
            id: 5,
            sNo: "5"
          },
          {
            value: "Subhash Kumar - Kunnur",
            label: "Subhash Kumar - Kunnur",
            id: 6,
            sNo: "6"
          },
          {
            value: "Summary Bill",
            label: "Summary Bill",
            id: 7,
            sNo: "7"
          },
          {
            value: "Daily Wage",
            label: "Daily Wage",
            id: 8,
            sNo: "8"
          },
          {
            value: "Rent Management Portal",
            label: "Rent Management Portal",
            id: 9,
            sNo: "9"
          }
        ];
        // Combine backend data with predefined options
        const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
        setSiteOptions(combinedSiteOptions);
        setProgress(75);
      } catch (error) {
        console.error("Fetch error: ", error);
        const predefinedSiteOptions = [
          {
            value: "Mason Advance",
            label: "Mason Advance",
            id: 1,
            sNo: "1"
          },
          {
            value: "Material Advance",
            label: "Material Advance",
            id: 2,
            sNo: "2"
          },
          {
            value: "Weekly Advance",
            label: "Weekly Advance",
            id: 3,
            sNo: "3"
          },
          {
            value: "Excess Advance",
            label: "Excess Advance",
            id: 4,
            sNo: "4"
          },
          {
            value: "Material Rent",
            label: "Material Rent",
            id: 5,
            sNo: "5"
          },
          {
            value: "Subhash Kumar - Kunnur",
            label: "Subhash Kumar - Kunnur",
            id: 6,
            sNo: "6"
          },
          {
            value: "Summary Bill",
            label: "Summary Bill",
            id: 7,
            sNo: "7"
          },
          {
            value: "Daily Wage",
            label: "Daily Wage",
            id: 8,
            sNo: "8"
          },
          {
            value: "Rent Management Portal",
            label: "Rent Management Portal",
            id: 9,
            sNo: "9"
          }
        ];
        setSiteOptions(predefinedSiteOptions);
        setProgress(75);
      }
    };
    fetchSites();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setProgress(85);
        const response = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setAdvanceData(data);
        setProgress(100);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching advance portal data:', error);
        setError('Failed to load advance data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
    // This ensures the input is cleared even if the same file is selected again next time
    e.target.value = '';
  };
  const handleUpload = async () => {
    if (!file) {
      alert("Please choose a file before uploading.");
      return;
    }
    setIsUploading(true);
    try {
      console.log("Uploading:", file.name);
      // Prepare the form data
      const formData = new FormData();
      formData.append("file", file);
      // Send POST request
      const response = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/upload-sql", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const result = await response.text(); // or .json() if your API returns JSON
        alert("File uploaded successfully!");
        window.location.reload(); // Reload to fetch new data
        console.log(result);
      } else {
        const errorText = await response.text();
        alert("Upload failed: " + errorText);
        console.error(errorText);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    } finally {
      setIsUploading(false); // Stop loading
      setIsOpen(false); // Close modal/dialog
    }
  };
  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const getVendorName = (id) =>
    vendorOptions.find(v => v.id === id)?.value || "";

  const getContractorName = (id) =>
    contractorOptions.find(c => c.id === id)?.value || "";

  const getSiteName = (id) =>
    siteOptions.find(s => String(s.id) === String(id))?.value || "";

  const filteredData = advanceData.filter((entry) => {
    // Date range filter (Start Date and End Date)
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      const entryDate = new Date(entry.date);
      if (entryDate < s || entryDate > e) return false;
    } else if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      const entryDate = new Date(entry.date);
      if (entryDate < s) return false;
    } else if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      const entryDate = new Date(entry.date);
      if (entryDate > e) return false;
    }

    // Timestamp filter (exact date match on timestamp)
    if (selectTimeStampDate) {
      const selectedDate = new Date(selectTimeStampDate);
      const entryTimestamp = new Date(entry.timestamp);
      // Compare only the date part (ignore time)
      if (selectedDate.toDateString() !== entryTimestamp.toDateString()) {
        return false;
      }
    }

    // Date filter (exact date match)
    if (selectDatabaseDate) {
      const [year, month, day] = selectDatabaseDate.split("-");
      const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
      const entryDateObj = new Date(entry.date);
      const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
      if (formattedEntryDate !== formattedSelectDate) return false;
    }
    // Contractor/Vendor filter
    if (selectDatabaseContractororVendorName) {
      const name = entry.vendor_id
        ? getVendorName(entry.vendor_id)
        : getContractorName(entry.contractor_id) || "";
      if (name.toLowerCase() !== selectDatabaseContractororVendorName.toLowerCase())
        return false;
    }
    // Project Name filter
    if (selectDatabaseProjectName) {
      const projectName = getSiteName(entry.project_id) || "";
      if (projectName.toLowerCase() !== selectDatabaseProjectName.toLowerCase())
        return false;
    }
    // Transfer Site filter
    if (selectDatabaseTransfer) {
      const transferName = getSiteName(entry.transfer_site_id) || "";
      if (transferName.toLowerCase() !== selectDatabaseTransfer.toLowerCase())
        return false;
    }
    // Type filter
    if (selectDatabaseType) {
      if (entry.type?.toLowerCase() !== selectDatabaseType.toLowerCase()) return false;
    }
    // Mode filter
    if (selectDatabaseMode) {
      if (entry.payment_mode?.toLowerCase() !== selectDatabaseMode.toLowerCase()) return false;
    }
    // Entry No filter (partial match)
    if (selectDatabaseEntryNo) {
      if (!entry.entry_no?.toString().includes(selectDatabaseEntryNo.toString())) return false;
    }
    return true; // passes all filters
  });
  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];

    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'timestamp':
            aValue = new Date(a.timestamp);
            bValue = new Date(b.timestamp);
            break;
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case 'entry_no':
            aValue = Number(a.entry_no) || 0;
            bValue = Number(b.entry_no) || 0;
            break;
          case 'vendor':
            aValue = a.vendor_id ? getVendorName(a.vendor_id) : getContractorName(a.contractor_id);
            bValue = b.vendor_id ? getVendorName(b.vendor_id) : getContractorName(b.contractor_id);
            break;
          case 'project':
            aValue = getSiteName(a.project_id);
            bValue = getSiteName(b.project_id);
            break;
          case 'transfer':
            aValue = getSiteName(a.transfer_site_id);
            bValue = getSiteName(b.transfer_site_id);
            break;
          case 'type':
            aValue = a.type || '';
            bValue = b.type || '';
            break;
          case 'mode':
            aValue = a.payment_mode || '';
            bValue = b.payment_mode || '';
            break;
          default:
            return 0;
        }

        const entryA = Number(a.entry_no) || 0;
        const entryB = Number(b.entry_no) || 0;

        // Handle timestamp sorting with matching entry_no direction
        if (sortConfig.key === 'timestamp') {
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          // Secondary sort by entry_no - match the direction of timestamp sort
          return sortConfig.direction === 'asc' ? entryA - entryB : entryB - entryA;
        }

        // Handle date sorting with matching entry_no direction
        if (sortConfig.key === 'date') {
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          // Secondary sort by entry_no - match the direction of date sort
          return sortConfig.direction === 'asc' ? entryA - entryB : entryB - entryA;
        }

        // Handle entry_no sorting (no secondary sort needed)
        if (sortConfig.key === 'entry_no') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Handle other fields
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;

        // Secondary sort by entry_no - always ascending for non-date/timestamp fields
        return entryA - entryB;
      });
    } else {
      // Default sorting: entry_no descending
      sortableData.sort((a, b) => Number(b.entry_no) - Number(a.entry_no));
    }
    return sortableData;
  }, [filteredData, sortConfig]);
  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectTimeStampDate, selectDatabaseDate, selectDatabaseContractororVendorName, selectDatabaseProjectName, selectDatabaseTransfer, selectDatabaseType, selectDatabaseMode, selectDatabaseEntryNo, startDate, endDate]);
  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  const handleChange = async (selected) => {
    setSelectedOption(selected);
    setEditFormData(prev => {
      if (!prev) return prev;
      if (!selected) {
        return { ...prev, vendor_id: '', contractor_id: '' };
      }
      if (selected.type === 'Vendor') {
        return { ...prev, vendor_id: selected.id, contractor_id: '' };
      }
      if (selected.type === 'Contractor') {
        return { ...prev, contractor_id: selected.id, vendor_id: '' };
      }
      return prev;
    });
    if (!selected) {
      setOverallAdvance(0);
      return;
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
  const totalAdvance = advanceData.reduce(
    (sum, entry) => sum + (Number(entry.amount) || 0),
    0
  );
  const totalBill = advanceData.reduce(
    (sum, entry) => sum + (Number(entry.bill_amount) || 0),
    0
  );
  const totalRefund = advanceData.reduce(
    (sum, entry) => sum + (Number(entry.refund_amount) || 0),
    0
  );
  const totalTransfer = advanceData.reduce((sum, entry) => {
    if (entry.type === "Transfer" && Number(entry.amount) > 0) {
      return sum + Number(entry.amount);
    }
    return sum;
  }, 0);
  const fetchAuditDetails = async (advancePortalId) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/history/${advancePortalId}`);
      const data = await response.json();
      setAdvancePortalAudits(data);
      setShowAdvancePortalModal(true);
    } catch (error) {
      console.error("Error fetching audit details:", error);
    }
  };
  const handleEditClick = (entry) => {
    setEditingId(entry.advancePortalId);
    setSelectedFile(null); // Reset selected file when opening edit modal
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
    const preSelected = combinedOptions.find(opt =>
      entry.vendor_id ? opt.id === entry.vendor_id && opt.type === "Vendor"
        : entry.contractor_id ? opt.id === entry.contractor_id && opt.type === "Contractor"
          : false
    );
    setSelectedOption(preSelected || null);
    setIsEditModalOpen(true);
  };
  const handleUpdate = async () => {
    try {
      let fileUrl = editFormData.file_url || '';
      if (selectedFile) {
        try {
          const formData = new FormData();
          const formatDateOnly = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          };
          const selectedSite = siteOptions.find(site => site.id === editFormData.project_id);
          const contractorOrVendor = selectedOption ? selectedOption.label : '';
          const finalName = `${formatDateOnly(editFormData.date)} ${selectedSite?.sNo || ''} ${contractorOrVendor}`;
          formData.append('file', selectedFile);
          formData.append('file_name', finalName);
          const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
            method: "POST",
            body: formData,
          });
          if (!uploadResponse.ok) {
            throw new Error('Upload failed');
          }
          const uploadResult = await uploadResponse.json();
          fileUrl = uploadResult.url;
        } catch (error) {
          console.error('Error during file upload:', error);
          alert('Error during file upload. Please try again.');
          return;
        }
      }

      const buildPayload = (overrides = {}, typeOverride) => {
        const payload = {
          ...editFormData,
          ...overrides,
          file_url: fileUrl,
        };

        if (selectedOption) {
          if (selectedOption.type === 'Vendor') {
            payload.vendor_id = selectedOption.id;
            payload.contractor_id = '';
          } else if (selectedOption.type === 'Contractor') {
            payload.contractor_id = selectedOption.id;
            payload.vendor_id = '';
          }
        }

        const type = typeOverride || payload.type;
        switch (type) {
          case 'Advance':
            payload.bill_amount = '';
            payload.refund_amount = '';
            break;
          case 'Refund':
            payload.bill_amount = '';
            payload.amount = '';
            break;
          case 'Transfer':
            payload.bill_amount = '';
            payload.refund_amount = '';
            payload.payment_mode = '';
            break;
          case 'Bill Settlement':
            payload.amount = '';
            payload.refund_amount = '';
            break;
          default:
            break;
        }
        return payload;
      };

      const updateRecord = async (id, payload) => {
        const res = await fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/edit/${id}?editedBy=${username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          throw new Error('Failed to update record');
        }
      };

      if (editFormData.type === 'Transfer') {
        const sameEntryRows = advanceData.filter(r => r.entry_no === editFormData.entry_no);
        if (sameEntryRows.length === 2) {
          const editedRecord = sameEntryRows.find(r => r.advancePortalId === editingId);
          const otherRecord = sameEntryRows.find(r => r.advancePortalId !== editingId);
          if (editedRecord && otherRecord) {
            const editedAmount = parseFloat(editFormData.amount) || 0;
            const updatedEdited = buildPayload({
              ...editFormData,
              transfer_site_id: parseInt(editFormData.transfer_site_id),
              amount: editedAmount
            }, 'Transfer');
            const updatedOther = buildPayload({
              ...otherRecord,
              project_id: parseInt(editFormData.transfer_site_id),
              transfer_site_id: editedRecord.project_id,
              amount: -editedAmount
            }, 'Transfer');
            await Promise.all([
              updateRecord(editedRecord.advancePortalId, updatedEdited),
              updateRecord(otherRecord.advancePortalId, updatedOther)
            ]);
          } else {
            console.warn('Transfer pair incomplete for entry_no:', editFormData.entry_no);
            const fallbackPayload = buildPayload({}, 'Transfer');
            await updateRecord(editingId, fallbackPayload);
          }
        } else {
          console.warn('Could not find both Transfer records for entry_no:', editFormData.entry_no);
          const fallbackPayload = buildPayload({}, 'Transfer');
          await updateRecord(editingId, fallbackPayload);
        }
      } else {
        const payload = buildPayload();
        await updateRecord(editingId, payload);
      }

      window.location.reload();
      setIsEditModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };
  const handleDelete = async (idToDelete) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;
    try {
      const record = advanceData.find(r => r.advancePortalId === idToDelete);
      if (!record) {
        console.warn('Record not found for ID:', idToDelete);
        return;
      }
      const entryNo = record.entry_no;
      const clearedData = {
        entry_no: entryNo, // Preserve entry_no
        date: record.date,
        amount: '',
        project_id: '',
        vendor_id: '',
        contractor_id: '',
        file_url: '',
        description: '',
        bill_amount: '',
        type: '',
        transfer_site_id: '',
        payment_mode: '',
        refund_amount: ''
      };
      if (record.type === 'Transfer') {
        const transferRecords = advanceData.filter(r => r.entry_no === entryNo);
        if (transferRecords.length !== 2) {
          console.warn(`Expected 2 Transfer records with entry_no ${entryNo}, but found ${transferRecords.length}`);
        }
        await Promise.all(
          transferRecords.map(async rec => {
            const res = await fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/edit/${rec.advancePortalId}?editedBy=${username}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(clearedData)
            });
            if (!res.ok) {
              throw new Error(`Failed to clear transfer record with ID: ${rec.advancePortalId}`);
            }
          })
        );
      } else {
        const res = await fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/edit/${idToDelete}?editedBy=${username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clearedData)
        });
        if (!res.ok) {
          throw new Error('Failed to clear record');
        }
      }
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };
  const totals = currentData.reduce(
    (acc, entry) => {
      acc.amount += Number(entry.amount) || 0;
      acc.bill_amount += Number(entry.bill_amount) || 0;
      acc.refund_amount += Number(entry.refund_amount) || 0;
      return acc;
    },
    { amount: 0, bill_amount: 0, refund_amount: 0 }
  );

  if (loading) {
    return (
      <body className='bg-[#FAF6ED]'>
        <div className='bg-white w-[1850px] h-[500px] p-10 ml-10 flex flex-col items-center justify-center'>
          <div className="text-lg mb-4">Loading advance database...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BF9853] mb-4"></div>
          <div className="text-sm text-gray-600">
            Progress: {progress}%
          </div>
          <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-[#BF9853] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </body>
    );
  }

  if (error) {
    return (
      <body className='bg-[#FAF6ED]'>
        <div className='bg-white w-[1850px] h-[500px] p-10 ml-10 flex items-center justify-center'>
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </body>
    );
  }

  return (
    <div className='bg-[#FAF6ED] min-h-screen w-full'>
      <div className='max-w-[1850px] w-full bg-white rounded-md ml-10 lg:h-[128px] px-4 lg:px-10 text-left flex flex-wrap justify-between items-center gap-5 pb-5'>
        <div className='flex lg:flex-wrap w-full lg:w-auto justify-between'>
          <div className='flex flex-wrap gap-[16px] p-4'>
            <div className=''>
              <label className='block mb-2 font-semibold'>Advance Amount</label>
              <input
                className='w-[183px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
                value={`₹${totalAdvance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                readOnly
              />
            </div>
            <div className=''>
              <label className='block mb-2 font-semibold'>Bill Amount</label>
              <input
                className='w-[183px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
                value={`₹${totalBill.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                readOnly
              />
            </div>
            <div className=''>
              <label className='block mb-2 font-semibold'>Transfer Amount </label>
              <input
                value={`₹${totalTransfer.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                readOnly
                className='w-[183px] lg:w-[220px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2' />
            </div>
            <div className=''>
              <label className='block mb-2 font-semibold'>Refund Amount</label>
              <input
                className='w-[183px] lg:w-[220px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
                value={`₹${totalRefund.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                readOnly
              />
            </div>
            <div className=''>
              <label className='block mb-2 font-semibold'>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='w-[168px] h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 focus:outline-none p-2'
              />
            </div>
            <div className=''>
              <label className='block mb-2 font-semibold'>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='w-[168px] h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 focus:outline-none p-2'
              />
            </div>
          </div>
        </div>
        <div className='mr-0 lg:mr-10'>
          <button onClick={() => setIsOpen(true)} className='w-28 h-[35px] border-2 bg-[#BF9853] border-opacity-25 rounded-lg mt-4 text-white'>Migrate</button>
        </div>
      </div>
      <div className='max-w-[1850px] w-full ml-10 px-4 lg:px-10 bg-white rounded-md h-[650px] mt-5 pt-5'>
        <div
          className={`text-left flex ${selectTimeStampDate || selectDatabaseDate || selectDatabaseContractororVendorName || selectDatabaseProjectName || selectDatabaseTransfer || selectDatabaseType || selectDatabaseMode || selectDatabaseEntryNo || startDate || endDate
            ? 'flex-col sm:flex-row sm:justify-between'
            : 'flex-row justify-between items-center'
            } mb-3 gap-2`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <button className='pl-2' onClick={() => setShowFilters(!showFilters)}>
              <img
                src={Filter}
                alt="Toggle Filter"
                className="w-7 h-7 border border-[#BF9853] rounded-md ml-3"
              />
            </button>
            {(selectTimeStampDate || selectDatabaseDate || selectDatabaseContractororVendorName || selectDatabaseProjectName || selectDatabaseTransfer || selectDatabaseType || selectDatabaseMode || selectDatabaseEntryNo || startDate || endDate) && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                {startDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">Start Date: </span>
                    <span className="font-bold">{startDate}</span>
                    <button onClick={() => setStartDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {endDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">End Date: </span>
                    <span className="font-bold">{endDate}</span>
                    <button onClick={() => setEndDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectTimeStampDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">Timestamp: </span>
                    <span className="font-bold">{selectTimeStampDate}</span>
                    <button onClick={() => setSelectTimeStampDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectDatabaseDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">Date: </span>
                    <span className="font-bold">{selectDatabaseDate}</span>
                    <button onClick={() => setSelectDatabaseDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectDatabaseContractororVendorName && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Contractor/Vendor Name: </span>
                    <span className="font-bold">{selectDatabaseContractororVendorName}</span>
                    <button onClick={() => setSelectDatabaseContractororVendorName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseProjectName && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Project Name:</span>
                    <span className="font-bold">{selectDatabaseProjectName}</span>
                    <button onClick={() => setSelectDatabaseProjectName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseTransfer && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Transfer site: </span>
                    <span className="font-bold">{selectDatabaseTransfer}</span>
                    <button onClick={() => setSelectDatabaseTransfer('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseType && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Type: </span>
                    <span className="font-bold">{selectDatabaseType}</span>
                    <button onClick={() => setSelectDatabaseType('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseMode && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Mode: </span>
                    <span className="font-bold">{selectDatabaseMode}</span>
                    <button onClick={() => setSelectDatabaseMode('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseEntryNo && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Entry No: </span>
                    <span className="font-bold">{selectDatabaseEntryNo}</span>
                    <button onClick={() => setSelectDatabaseEntryNo('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='space-x-4 flex justify-end mr-5'>
            {(selectTimeStampDate || selectDatabaseDate || selectDatabaseContractororVendorName || selectDatabaseProjectName || selectDatabaseTransfer || selectDatabaseType || selectDatabaseMode || selectDatabaseEntryNo || startDate || endDate) && (
              <button
                onClick={() => {
                  setSelectTimeStampDate('');
                  setSelectDatabaseDate('');
                  setSelectDatabaseContractororVendorName('');
                  setSelectDatabaseProjectName('');
                  setSelectDatabaseTransfer('');
                  setSelectDatabaseType('');
                  setSelectDatabaseMode('');
                  setSelectDatabaseEntryNo('');
                  setStartDate('');
                  setEndDate('');
                  sessionStorage.removeItem('advanceDatabaseFilters');
                }}
                className='text-sm text-red-600 hover:underline font-bold'
              >
                Clear All Filters
              </button>
            )}
            <button onClick={exportPDF} className='text-sm text-[#E4572E] hover:underline font-bold'>Export PDF</button>
            <button onClick={exportCSV} className='text-sm text-[#007233] hover:underline font-bold'>Export XL</button>
            <button className='text-sm text-[#BF9853] hover:underline font-bold'>Print</button>
          </div>
        </div>
        <div className='border-l-8 border-l-[#BF9853] rounded-lg mx-2 lg:mx-5'>
          <div ref={scrollRef} className='overflow-auto max-h-[485px] thin-scrollbar'
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          >
            <table className="min-w-[1865px] w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="bg-[#FAF6ED]">
                  <th className="py-2 pl-3 w-[340px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('timestamp')}
                  >
                    Time Stamp {sortConfig.key === 'timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="pt-2 pl-3 w-[320px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 w-[220px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('vendor')}
                  >
                    Contractor/Vendor {sortConfig.key === 'vendor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 w-[450px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('project')}
                  >
                    Project Name {sortConfig.key === 'project' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 w-[450px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('transfer')}
                  >
                    Transfer Site {sortConfig.key === 'transfer' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 w-[100px] font-bold text-right">Advance</th>
                  <th className="px-2 w-[180px] font-bold text-right whitespace-nowrap">Bill Payment</th>
                  <th className="px-2 w-[120px] font-bold text-right">Refund</th>
                  <th className="px-2 w-[120px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('type')}
                  >
                    Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 w-[120px] font-bold text-left">Description</th>
                  <th className="px-2 w-[220px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('mode')}
                  >
                    Mode {sortConfig.key === 'mode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 w-[220px] font-bold text-left whitespace-nowrap">Attached file</th>
                  <th className="px-2 w-[140px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('entry_no')}
                  >
                    E.No {sortConfig.key === 'entry_no' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 w-[120px] font-bold text-left">Activity</th>
                </tr>
                {showFilters && (
                  <tr className="bg-white border-b border-gray-200">
                    <th className="">
                      <input
                        type="date"
                        value={selectTimeStampDate}
                        onChange={(e) => setSelectTimeStampDate(e.target.value)}
                        className="p-1  mt-3 mb-3 rounded-md bg-transparent w-[170px] border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                        placeholder="Date..."
                      />
                    </th>
                    <th className="">
                      <input
                        type="date"
                        value={selectDatabaseDate}
                        onChange={(e) => setSelectDatabaseDate(e.target.value)}
                        className="p-1  mt-3 mb-3 rounded-md bg-transparent w-32 border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                        placeholder="Date..."
                      />
                    </th>
                    <th className="">
                      <Select
                        options={combinedOptions}
                        value={selectDatabaseContractororVendorName ? { value: selectDatabaseContractororVendorName, label: selectDatabaseContractororVendorName } : null}
                        onChange={(opt) => setSelectDatabaseContractororVendorName(opt ? opt.value : "")}
                        className=" w-[220px] focus:outline-none text-xs"
                        placeholder="Contractor/Ven..."
                        isSearchable
                        menuPortalTarget={document.body}
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: state.isFocused
                              ? 'rgba(191, 152, 83, 0.2)'
                              : 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': {
                              borderColor: 'rgba(191, 152, 83, 0.2)',
                            },
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            fontSize: '15px',
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            color: 'black',
                          }),
                        }}
                      />
                    </th>
                    <th className="">
                      <Select
                        options={siteOptions}
                        value={selectDatabaseProjectName ? { value: selectDatabaseProjectName, label: selectDatabaseProjectName } : null}
                        onChange={(opt) => setSelectDatabaseProjectName(opt ? opt.value : "")}
                        className="w-[250px] focus:outline-none text-xs"
                        placeholder="Project Name..."
                        isSearchable
                        menuPortalTarget={document.body}
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: state.isFocused
                              ? 'rgba(191, 152, 83, 0.2)'
                              : 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': {
                              borderColor: 'rgba(191, 152, 83, 0.2)',
                            },
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            fontSize: '15px',
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            color: 'black',
                          }),
                        }}
                      />
                    </th>
                    <th className="">
                      <Select
                        options={siteOptions}
                        value={selectDatabaseTransfer ? { value: selectDatabaseTransfer, label: selectDatabaseTransfer } : null}
                        onChange={(opt) => setSelectDatabaseTransfer(opt ? opt.value : "")}
                        className="w-[250px] focus:outline-none text-xs"
                        placeholder="Transfer Site..."
                        isSearchable
                        menuPortalTarget={document.body}
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: state.isFocused
                              ? 'rgba(191, 152, 83, 0.2)'
                              : 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': {
                              borderColor: 'rgba(191, 152, 83, 0.2)',
                            },
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            fontSize: '15px',
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            color: 'black',
                          }),
                        }}
                      />
                    </th>
                    <th className='w-[100px] pt-2 pb-2 text-right'>{totals.amount.toLocaleString("en-IN")}</th>
                    <th className='w-[180px] pt-2 pb-2 text-right'>{totals.bill_amount.toLocaleString("en-IN")}</th>
                    <th className='w-[120px] pt-2 pb-2 text-right'>{totals.refund_amount.toLocaleString("en-IN")}</th>
                    <th className="">
                      <select
                        value={selectDatabaseType}
                        onChange={(e) => setSelectDatabaseType(e.target.value)}
                        className="p-1  mt-3 mb-3 rounded-md bg-transparent w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                        placeholder="Type..."
                        menuPortalTarget={document.body}
                      >
                        <option value=''>Select Type...</option>
                        <option value='Advance'>Advance</option>
                        <option value='Bill Settlement'>Bill Settlement</option>
                        <option value='Refund'>Refund</option>
                        <option value='Transfer'>Transfer</option>
                      </select>
                    </th>
                    <th className='w-[120px]'></th>
                    <th className="">
                      <select
                        value={selectDatabaseMode}
                        onChange={(e) => setSelectDatabaseMode(e.target.value)}
                        className="p-1  mt-3 mb-3 rounded-md bg-transparent w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                        placeholder="Mode..."
                        menuPortalTarget={document.body}
                      >
                        <option value=''>Select</option>
                        <option value='Cash'>Cash</option>
                        <option value='GPay'>GPay</option>
                        <option value='Net Banking'>Net Banking</option>
                      </select>
                    </th>
                    <th className='w-[220px] '></th>
                    <th className='w-[140px] '>
                      <input
                        type="text"
                        value={selectDatabaseEntryNo}
                        onChange={(e) => setSelectDatabaseEntryNo(e.target.value)}
                        className="p-1 mt-3 mb-3 rounded-md bg-transparent w-[140px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                        placeholder="Entry No..."
                      />
                    </th>
                    <th className='w-[120px] '></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((entry) => (
                    <tr key={entry.id} className="odd:bg-white even:bg-[#FAF6ED]">
                      <td className="text-sm text-left p-2 w-[340px] font-semibold">{formatDate(entry.timestamp)}</td>
                      <td className="text-sm text-left p-2 w-[220px] font-semibold">{formatDateOnly(entry.date)}</td>
                      <td className="text-sm text-left font-semibold">
                        {entry.vendor_id
                          ? getVendorName(entry.vendor_id)
                          : getContractorName(entry.contractor_id)}
                      </td>
                      <td className="text-sm text-left w-60 font-semibold">
                        {getSiteName(entry.project_id)}
                      </td>
                      <td className="text-sm text-left font-semibold">
                        {getSiteName(entry.transfer_site_id)}
                      </td>
                      <td className="text-sm text-right font-semibold">
                        {entry.amount != null && entry.amount !== ""
                          ? Number(entry.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })
                          : ""}
                      </td>
                      <td className="text-sm text-right font-semibold">
                        {entry.bill_amount != null && entry.bill_amount !== ""
                          ? Number(entry.bill_amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })
                          : ""}
                      </td>
                      <td className="text-sm text-right pr-2 font-semibold">
                        {entry.refund_amount != null && entry.refund_amount !== ""
                          ? Number(entry.refund_amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })
                          : ""}
                      </td>
                      <td className="text-sm text-left font-semibold">{entry.type}</td>
                      <td className="text-sm text-left font-semibold">{entry.description}</td>
                      <td className="text-sm text-left font-semibold">{entry.payment_mode}</td>
                      <td className="text-sm text-left pl-3">
                        {entry.file_url ? (
                          <a
                            href={entry.file_url}
                            className="text-red-500 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          <span></span>
                        )}
                      </td>
                      <td className="text-sm text-left pl-3 font-semibold">{entry.entry_no}</td>
                      <td className=" flex w-[100px] justify-between py-2">
                        <button
                          className={`rounded-full transition duration-200 ml-2 mr-3 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={entry.not_allow_to_edit}
                        >
                          <img
                            src={edit}
                            onClick={entry.not_allow_to_edit ? undefined : () => handleEditClick(entry)}
                            alt="Edit"
                            className={`w-4 h-6 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
                          />
                        </button>
                        <button className={`-ml-5 -mr-2 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={entry.not_allow_to_edit}
                        >
                          <img
                            src={remove}
                            alt='delete'
                            onClick={entry.not_allow_to_edit ? undefined : () => handleDelete(entry.advancePortalId)}
                            className={`w-4 h-4 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`} />
                        </button>
                        <button
                          onClick={entry.not_allow_to_edit ? undefined : () => fetchAuditDetails(entry.advancePortalId)}
                          className={`rounded-full transition duration-200 -mr-1 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={entry.not_allow_to_edit}
                        >
                          <img
                            src={history}
                            alt="history"
                            className={`w-4 h-5 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-2 text-center text-sm text-gray-400" colSpan={15}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {sortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-4 bg-white border-t border-gray-200 mb-6">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:border-transparent"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={400}>400</option>
                <option value={500}>500</option>
                <option value={600}>600</option>
                <option value={700}>700</option>
                <option value={800}>800</option>
                <option value={900}>900</option>
                <option value={1000}>1000</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                  }`}
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === pageNum
                        ? 'bg-[#BF9853] text-white'
                        : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-md shadow-lg p-6 w-[400px]">
              <h2 className="text-lg font-semibold mb-4 text-center">
                Upload Bulk Data
              </h2>
              <input
                type="file"
                accept=".csv, .sql"
                onChange={handleFileChange}
                className="border p-2 w-full mb-4"
              />
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleUpload}
                  className={`px-6 py-2 rounded ${isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-[#BF9853] text-white"}`}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 border border-[#BF9853] rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[700px]">
              <h2 className="text-lg font-bold mb-4">Edit Entry</h2>
              <div className='grid grid-cols-2 gap-4 text-left ml-5'>
                <div className='flex items-center gap-3'>
                  <label className='font-semibold text-[#E4572E]'>Select Type</label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setEditFormData(prev => {
                        const updated = { ...prev, type: newType };
                        if (newType === 'Refund') {
                          updated.amount = '';
                          updated.bill_amount = '';
                        } else if (newType === 'Advance') {
                          updated.refund_amount = '';
                          updated.bill_amount = '';
                        } else if (newType === 'Bill Settlement') {
                          updated.refund_amount = '';
                          updated.amount = '';
                        } else if (newType === 'Transfer') {
                          updated.refund_amount = '';
                          updated.bill_amount = '';
                          updated.payment_mode = '';
                        }
                        return updated;
                      });
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
                <div className='flex items-center gap-3'>
                  <label className='font-semibold text-[#E4572E]'>Date</label>
                  <input
                    type='date'
                    placeholder='dd-mm-yyyy'
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className='w-[144px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
                  />
                </div>
                <div className=''>
                  <div className='flex'>
                    <label className='font-semibold block'>Contractor/Vendor</label>
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
                <div>
                  <label className='font-semibold block'>Project Name</label>
                  <Select
                    options={sortedSiteOptions || []}
                    placeholder="Select a site..."
                    isSearchable={true}
                    value={sortedSiteOptions.find(site => site.id === editFormData.project_id) || null}
                    onChange={(selected) => setEditFormData({ ...editFormData, project_id: selected?.id || '' })}
                    styles={customStyles}
                    isClearable
                    className='w-[263px] h-[45px] focus:outline-none' />
                </div>
                {editFormData.type === 'Bill Settlement' && (
                  <div>
                    <label className='font-semibold block'>Bill Amount</label>
                    <input
                      value={editFormData.bill_amount}
                      onChange={(e) => setEditFormData({ ...editFormData, bill_amount: e.target.value })}
                      className='w-[263px] h-[45px] px-2 py-1 rounded-lg border-2 border-[#BF9853] border-opacity-30 focus:outline-none'
                    />
                  </div>
                )}
                <div>
                  <label className='font-semibold block'>
                    {editFormData.type === 'Transfer'
                      ? 'Transfer Amount'
                      : editFormData.type === 'Refund'
                        ? 'Refund Amount'
                        : 'Amount Given'}
                  </label>
                  <input
                    value={editFormData.type === 'Refund' ? formatWithCommas(editFormData.refund_amount) : formatWithCommas(editFormData.amount)}
                    onChange={handleAmountChange}
                    className='w-[263px] h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
                  />
                </div>
                <div className=''>
                  {editFormData.type === 'Transfer' ? (
                    <>
                      <label className='font-semibold block'>Site Name</label>
                      <Select
                        options={sortedSiteOptions}
                        placeholder="Select a site..."
                        isSearchable
                        value={sortedSiteOptions.find(site => site.id === editFormData.transfer_site_id) || null}
                        onChange={(selected) => setEditFormData({ ...editFormData, transfer_site_id: selected?.id || '' })}
                        styles={customStyles}
                        isClearable
                        className='w-[263px] h-[45px] focus:outline-none'
                      />
                    </>
                  ) : (
                    <div className='flex gap-14'>
                      <div className='space-y-2'>
                        <label className='font-semibold block'>Payment Mode</label>
                        <select
                          value={editFormData.payment_mode}
                          onChange={(e) => setEditFormData({ ...editFormData, payment_mode: e.target.value })}
                          className='w-[263px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'>
                          <option value=''>Select</option>
                          <option value='Cash'>Cash</option>
                          <option value='GPay'>GPay</option>
                          <option value='Net Banking'>Net Banking</option>
                        </select>
                      </div>
                      {editFormData.type === 'Bill Settlement' && (
                        <div className='space-y-2 mt-6'>
                          <div className="">
                            <label htmlFor="editFileInput" className="cursor-pointer flex w-40 items-center  text-orange-600 text-sm font-semibold">
                              <img className='w-5 h-4 mr-1' alt='' src={Attach}></img>
                              Attach File
                            </label>
                            <input
                              type="file"
                              id="editFileInput"
                              ref={fileInputRef}
                              className="hidden"
                              onChange={handleEditFileChange}
                            />
                          </div>
                          {selectedFile && (
                            <span className="text-gray-600 text-sm">{selectedFile.name}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className='col-span-2'>
                  <label className='font-semibold block'>Description</label>
                  <textarea
                    rows={2}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className='w-[590px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'>
                  </textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-4 py-2 border border-[#BF9853] w-[100px] h-[45px] rounded"
                >
                  Cancel
                </button>
                <button onClick={handleUpdate} className="px-4 py-2 bg-[#BF9853] w-[100px] h-[45px] text-white rounded">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        <AuditModal show={showAdvancePortalModal} onClose={() => setShowAdvancePortalModal(false)} audits={advancePortalAudits} vendorOptions={vendorOptions} contractorOptions={contractorOptions}
          siteOptions={siteOptions} />
      </div>
    </div>

  )
}
export default AdvanceDatabase

const formatDate = (dateString) => {
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes());
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? String(hours).padStart(2, '0') : '12';
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};
const AuditModal = ({ show, onClose, audits, vendorOptions, contractorOptions, siteOptions }) => {
  if (!show) return null;
  const getNameById = (id, options) => {
    if (!id && id !== 0) return "-";
    const found = options.find(opt => String(opt.id) === String(id));
    return found ? found.label : id;
  };
  const fields = [
    { oldKey: "old_date", newKey: "new_date", label: "Date", width: "120px" },
    { oldKey: "old_type", newKey: "new_type", label: "Type", width: "100px" },
    { oldKey: "old_project_id", newKey: "new_project_id", label: "Project Name", width: "180px", lookup: siteOptions },
    { oldKey: "old_vendor_id", newKey: "new_vendor_id", label: "Vendor", width: "150px", lookup: vendorOptions },
    { oldKey: "old_contractor_id", newKey: "new_contractor_id", label: "Contractor", width: "150px", lookup: contractorOptions },
    { oldKey: "old_transfer_site_id", newKey: "new_transfer_site_id", label: "Transfer", width: "150px", lookup: siteOptions },
    { oldKey: "old_payment_mode", newKey: "new_payment_mode", label: "Mode", width: "100px" },
    { oldKey: "old_description", newKey: "new_description", label: "Description", width: "200px" },
    { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
    { oldKey: "old_bill_amount", newKey: "new_bill_amount", label: "Bill Amount", width: "120px" },
    { oldKey: "old_refund_amount", newKey: "new_refund_amount", label: "Refund", width: "100px" },
  ];
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };
  const formatDisplayValue = (value, field) => {
    if (
      (field.oldKey?.includes("vendor_id") || field.oldKey?.includes("transfer_site_id") ||
        field.newKey?.includes("vendor_id") || field.newKey?.includes("transfer_site_id")) &&
      String(value) === "0"
    ) {
      return "-";
    }
    if (field.lookup) {
      return getNameById(value, field.lookup);
    }
    if (field.label.includes("Amount")) {
      return value ? Number(value).toLocaleString("en-IN") : "-";
    }
    if (field.label === "Date") {
      return value ? new Date(value).toLocaleDateString("en-GB") : "-";
    }
    return value ?? "-";
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1800px] mx-4 p-2">
        <div className="flex justify-between items-center mt-4 ml-7 mr-7">
          <h2 className="text-xl font-bold">History</h2>
          <button onClick={onClose}>
            <h2 className="text-xl text-red-500 -mt-10 font-bold">x</h2>
          </button>
        </div>
        <div className="overflow-auto mt-2 max-h-80 border border-l-8 border-l-[#BF9853] rounded-lg ml-7">
          <table className="table-fixed min-w-full bg-white">
            <thead className="bg-[#FAF6ED]">
              <tr>
                <th style={{ width: "130px" }}>Time Stamp</th>
                <th style={{ width: "120px" }}>Edited By</th>
                {fields.map((f) => (
                  <th
                    key={f.label}
                    style={{ width: f.width }}
                    className="border-b py-2 px-2 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audits.map((audit, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-[#FAF6ED]"
                >
                  <td
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ width: "130px" }}
                  >
                    {formatDateTime(audit.edited_date)}
                  </td>
                  <td
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ width: "120px" }}
                  >
                    {audit.edited_by}
                  </td>
                  {fields.map((f) => {
                    const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                    const newDisplay = formatDisplayValue(audit[f.newKey], f);
                    const changed = oldDisplay !== newDisplay;
                    return (
                      <td
                        key={f.label}
                        style={{ width: f.width }}
                        title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                        className={`whitespace-nowrap overflow-hidden text-ellipsis px-2 ${changed ? "bg-[#BF9853] font-bold" : ""
                          }`}
                      >
                        {oldDisplay}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};