import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";
const AdvanceSummary = () => {
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [advanceData, setAdvanceData] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [selectedContractorOrVendorOption, setSelectedContractorOrVendorOption] = useState('');
  const [totalPendingAdvance, setTotalPendingAdvance] = useState(0);
  const [siteDetails, setSiteDetails] = useState([]);
  const [sitePendingAdvance, setSitePendingAdvance] = useState(0);
  const [siteBillAmount, setSiteBillAmount] = useState(0);
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  // Sorting state for both tables
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [siteSortConfig, setSiteSortConfig] = useState({ key: null, direction: 'asc' });
  // Tooltip state for first table (Project table - shows contractor/vendor names)
  const [projectTooltipData, setProjectTooltipData] = useState(null);
  const [projectTooltipPosition, setProjectTooltipPosition] = useState({ x: 0, y: 0 });
  const [projectTooltipTitle, setProjectTooltipTitle] = useState("");
  // Tooltip state for second table (Contractor/Vendor table - shows project names)
  const [siteTooltipData, setSiteTooltipData] = useState(null);
  const [siteTooltipPosition, setSiteTooltipPosition] = useState({ x: 0, y: 0 });
  const [siteTooltipTitle, setSiteTooltipTitle] = useState("");
  // Popup/Modal state for first table
  const [projectPopupData, setProjectPopupData] = useState(null);
  const [projectPopupTitle, setProjectPopupTitle] = useState("");
  const [projectPopupContext, setProjectPopupContext] = useState("");
  const [showProjectPopup, setShowProjectPopup] = useState(false);
  const [projectPopupSortConfig, setProjectPopupSortConfig] = useState({ key: null, direction: 'asc' });
  // Popup/Modal state for second table
  const [sitePopupData, setSitePopupData] = useState(null);
  const [sitePopupTitle, setSitePopupTitle] = useState("");
  const [sitePopupContext, setSitePopupContext] = useState("");
  const [showSitePopup, setShowSitePopup] = useState(false);
  const [sitePopupSortConfig, setSitePopupSortConfig] = useState({ key: null, direction: 'asc' });
  // Popup/Modal state for Bill Status popup (combined advance + bill)
  const [showBillStatusPopup, setShowBillStatusPopup] = useState(false);
  const [billStatusPopupData, setBillStatusPopupData] = useState({ advances: [], bills: [] });
  const [billStatusPopupContext, setBillStatusPopupContext] = useState("");
  const [billStatusPopupSortConfig, setBillStatusPopupSortConfig] = useState({ key: null, direction: 'asc' });
  const [isBillStatusFromFirstTable, setIsBillStatusFromFirstTable] = useState(true);
  // Function to convert Google Drive URL to viewable format for opening in new tab
  const convertToViewableUrl = (url) => {
    if (!url) return url;

    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = null;

      // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
      const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match1) {
        fileId = match1[1];
      }

      // Format: https://drive.google.com/open?id=FILE_ID
      if (!fileId) {
        const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match2) {
          fileId = match2[1];
        }
      }

      // Format: https://drive.google.com/uc?id=FILE_ID
      if (!fileId) {
        const match3 = url.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
        if (match3) {
          fileId = match3[1];
        }
      }

      if (fileId) {
        // Return view URL for opening in new tab
        return `https://drive.google.com/file/d/${fileId}/view`;
      }
    }

    // If not a Google Drive URL or couldn't extract ID, return original URL
    return url;
  };
  useEffect(() => {
    const savedContractorVendor = sessionStorage.getItem('selectedContractorOrVendorOption');
    try {
      if (savedContractorVendor) setSelectedContractorOrVendorOption(JSON.parse(savedContractorVendor));
    } catch (error) {
      console.error("Error parsing sessionStorage data:", error);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  const handleBeforeUnload = () => {
    sessionStorage.removeItem('selectedContractorOrVendorOption');
  };
  useEffect(() => {
    if (selectedContractorOrVendorOption) sessionStorage.setItem('selectedContractorOrVendorOption', JSON.stringify(selectedContractorOrVendorOption));
  }, [selectedContractorOrVendorOption]);
  useEffect(() => {
    const saved = localStorage.getItem("advanceContractorVendor");
    if (saved) {
      setSelectedContractorOrVendorOption(JSON.parse(saved));
    }
  }, []);
  // Removed localStorage effect for selectedAdvanceSite to allow default null state
  // Fetch Vendor Names
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        setProgress(10);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        setVendorOptions(data.map(item => ({
          value: item.vendorName,
          label: item.vendorName,
          type: "Vendor",
          id: item.id
        })));
        setProgress(25);
      } catch (err) {
        console.error(err);
        setError("Failed to load vendor data");
      }
    };
    fetchVendorNames();
  }, []);
  // Fetch Contractor Names
  useEffect(() => {
    const fetchContractorNames = async () => {
      try {
        setProgress(35);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        setContractorOptions(data.map(item => ({
          value: item.contractorName,
          label: item.contractorName,
          type: "Contractor",
          id: item.id
        })));
        setProgress(50);
      } catch (err) {
        console.error(err);
        setError("Failed to load contractor data");
      }
    };
    fetchContractorNames();
  }, []);
  useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);
  // Fetch Site Names
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
        // Add predefined site options with IDs 001, 002, 003, 004
        const predefinedSiteOptions = [
          { value: "Mason Advance", label: "Mason Advance", id: 1, sNo: "1" },
          { value: "Material Advance", label: "Material Advance", id: 2, sNo: "2" },
          { value: "Weekly Advance", label: "Weekly Advance", id: 3, sNo: "3" },
          { value: "Excess Advance", label: "Excess Advance", id: 4, sNo: "4" },
          { value: "Material Rent", label: "Material Rent", id: 5, sNo: "5" },
          { value: "Subhash Kumar - Kunnur", label: "Subhash Kumar - Kunnur", id: 6, sNo: "6" },
          { value: "Summary Bill", label: "Summary Bill", id: 7, sNo: "7" },
          { value: "Daily Wage", label: "Daily Wage", id: 8, sNo: "8" },
          { value: "Rent Management Portal", label: "Rent Management Portal", id: 9, sNo: "9" },
          { value: "Multi-Project Batch", label: "Multi-Project Batch", id: 10, sNo: "10" },
          { value: "Loan Portal", label: "Loan Portal", id: 11, sNo: "11" },
        ];
        // Combine backend data with predefined options
        const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
        setSiteOptions(combinedSiteOptions);
        setProgress(75);
      } catch (error) {
        console.error("Fetch error: ", error);
        // Fallback: if API fails, still show predefined options
        const predefinedSiteOptions = [
          { value: "Mason Advance", label: "Mason Advance", id: 1, sNo: "1" },
          { value: "Material Advance", label: "Material Advance", id: 2, sNo: "2" },
          { value: "Weekly Advance", label: "Weekly Advance", id: 3, sNo: "3" },
          { value: "Excess Advance", label: "Excess Advance", id: 4, sNo: "4" },
          { value: "Material Rent", label: "Material Rent", id: 5, sNo: "5" },
          { value: "Subhash Kumar - Kunnur", label: "Subhash Kumar - Kunnur", id: 6, sNo: "6" },
          { value: "Summary Bill", label: "Summary Bill", id: 7, sNo: "7" },
          { value: "Daily Wage", label: "Daily Wage", id: 8, sNo: "8" },
          { value: "Rent Management Portal", label: "Rent Management Portal", id: 9, sNo: "9" },
          { value: "Multi-Project Batch", label: "Multi-Project Batch", id: 10, sNo: "10" },
          { value: "Loan Portal", label: "Loan Portal", id: 11, sNo: "11" },
        ];
        setSiteOptions(predefinedSiteOptions);
        setProgress(75);
      }
    };
    fetchSites();
  }, []);
  // Fetch Advance Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setProgress(85);
        const res = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/getAll");
        const data = await res.json();
        setAdvanceData(data);
        setProgress(100);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching advance data", err);
        setError("Failed to load advance data");
        setLoading(false);
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
      minHeight: '45px',
      height: '45px',
      borderRadius: '8px',
      borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.5)' : 'rgba(191, 152, 83, 0.25)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.5)',
      },
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
  const [selectedAdvanceSite, setSelectedAdvanceSite] = useState(null);
  const [projectData, setProjectData] = useState([]);
  useEffect(() => {
    if (selectedContractorOrVendorOption) {
      // When a specific contractor/vendor is selected, show projects for that entity only
      const filtered = advanceData.filter(item => {
        if (selectedContractorOrVendorOption.type === "Vendor") {
          return item.vendor_id === selectedContractorOrVendorOption.id;
        }
        if (selectedContractorOrVendorOption.type === "Contractor") {
          return item.contractor_id === selectedContractorOrVendorOption.id;
        }
        return false;
      });
      const grouped = {};
      let totalPendingAll = 0;
      let totalBillAll = 0;
      filtered.forEach(curr => {
        const {
          project_id,
          amount = 0,
          bill_amount = 0,
          refund_amount = 0
        } = curr;
        if (!grouped[project_id]) {
          grouped[project_id] = {
            projectName: siteOptions.find(s => String(s.id) === String(project_id))?.label || "-",
            projectId: project_id,
            totalAdvance: 0,
            totalBill: 0,
            totalRefund: 0
          };
        }
        grouped[project_id].totalAdvance += parseFloat(amount) || 0;
        grouped[project_id].totalBill += parseFloat(bill_amount) || 0;
        grouped[project_id].totalRefund += parseFloat(refund_amount) || 0;
      });
      const projectArray = Object.values(grouped).map(p => {
        const pending = p.totalAdvance - p.totalBill - p.totalRefund;
        totalPendingAll += pending;
        totalBillAll += p.totalBill;
        return {
          projectName: p.projectName,
          pendingAdvance: pending,
          billAmount: p.totalBill,
          projectId: p.projectId
        };
      });
      setProjectData(projectArray);
      setTotalPendingAdvance(totalPendingAll);
      setTotalBillAmount(totalBillAll);
    } else {
      const grouped = {};
      let totalPendingAll = 0;
      let totalBillAll = 0;

      advanceData.forEach(curr => {
        const {
          project_id,
          amount = 0,
          bill_amount = 0,
          refund_amount = 0
        } = curr;

        if (project_id) {
          if (!grouped[project_id]) {
            grouped[project_id] = {
              projectName: siteOptions.find(s => String(s.id) === String(project_id))?.label || "-",
              projectId: project_id,
              totalAdvance: 0,
              totalBill: 0,
              totalRefund: 0
            };
          }
          grouped[project_id].totalAdvance += parseFloat(amount) || 0;
          grouped[project_id].totalBill += parseFloat(bill_amount) || 0;
          grouped[project_id].totalRefund += parseFloat(refund_amount) || 0;
        }
      });

      const projectArray = Object.values(grouped).map(p => {
        const pending = p.totalAdvance - p.totalBill - p.totalRefund;
        totalPendingAll += pending;
        totalBillAll += p.totalBill;
        return {
          projectName: p.projectName,
          pendingAdvance: pending,
          billAmount: p.totalBill,
          projectId: p.projectId
        };
      });

      setProjectData(projectArray);
      setTotalPendingAdvance(totalPendingAll);
      setTotalBillAmount(totalBillAll);
    }
  }, [selectedContractorOrVendorOption, advanceData, siteOptions]);
  const sortedSiteOptions = siteOptions.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  const handleSiteSort = (key) => {
    let direction = 'asc';
    if (siteSortConfig.key === key && siteSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSiteSortConfig({ key, direction });
  };
  const defaultSort = (data, statusKey = 'pendingAdvance', nameKey = 'projectName') => {
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
  const sortData = (data, config, statusKey = 'pendingAdvance', nameKey = 'projectName') => {
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
  const getBillDetails = (projectId, contractorVendorId, contractorVendorType) => {
    if (!advanceData.length) return [];
    return advanceData.filter(item => {
      const matchesProject = projectId ? item.project_id === projectId : true;
      // If no contractor/vendor is selected, show all bills for the project
      const matchesEntity = contractorVendorId
        ? (contractorVendorType === 'Contractor'
          ? item.contractor_id === contractorVendorId
          : item.vendor_id === contractorVendorId)
        : true;
      return matchesProject && matchesEntity && item.bill_amount > 0;
    }).map(item => {
      // Debug: log to see actual data structure
      if (item.bill_amount > 0) {
        console.log('Bill item from API:', {
          advancePortalId: item.advancePortalId,
          bill_amount: item.bill_amount,
          file_url: item.file_url,
          type: item.type,
          allKeys: Object.keys(item)
        });
      }
      return {
        advancePortalId: item.advancePortalId || 0,
        date: new Date(item.date).toLocaleDateString('en-GB'),
        amount: parseFloat(item.bill_amount) || 0,
        projectName: siteOptions.find(s => String(s.id) === String(item.project_id))?.label || "Unknown Site",
        contractorVendorName: item.contractor_id
          ? contractorOptions.find(c => c.id === item.contractor_id)?.label || "-"
          : vendorOptions.find(v => v.id === item.vendor_id)?.label || "-",
        type: item.type || "Bill",
        file_url: (item.file_url && typeof item.file_url === 'string' && item.file_url.trim() !== '') ? item.file_url : null
      };
    });
  };
  const getAdvanceDetails = (projectId, contractorVendorId, contractorVendorType) => {
    if (!advanceData.length) return [];

    // Check if both contractor/vendor and project are selected
    const bothFiltersApplied = contractorVendorId && projectId;

    return advanceData.filter(item => {
      const matchesProject = projectId ? item.project_id === projectId : true;
      // If no contractor/vendor is selected, show all advances for the project
      const matchesEntity = contractorVendorId
        ? (contractorVendorType === 'Contractor'
          ? item.contractor_id === contractorVendorId
          : item.vendor_id === contractorVendorId)
        : true;
      const hasAmount = (parseFloat(item.amount) || 0) !== 0;
      const hasRefund = (parseFloat(item.refund_amount) || 0) !== 0;
      return matchesProject && matchesEntity && (hasAmount || hasRefund);
    }).map(item => {
      let amount = parseFloat(item.amount) || 0;
      const refundAmount = parseFloat(item.refund_amount) || 0;

      // If there's a refund amount, use it as negative (money returned)
      if (refundAmount !== 0) {
        amount = -refundAmount; // Show refund as negative
      }

      // Handle Transfer type amounts when both filters are applied
      if (bothFiltersApplied && item.type === 'Transfer') {
        // Transfer amounts are already stored with correct sign:
        // Negative = Transfer To (money going out to transfer_site_id)
        // Positive = Transfer From (money coming from transfer_site_id)
        // Keep the amount as is
        amount = parseFloat(item.amount) || 0;
      }

      return {
        advancePortalId: item.advancePortalId || 0,
        date: new Date(item.date).toLocaleDateString('en-GB'),
        amount: amount,
        projectName: siteOptions.find(s => String(s.id) === String(item.project_id))?.label || "Unknown Site",
        contractorVendorName: item.contractor_id
          ? contractorOptions.find(c => c.id === item.contractor_id)?.label || "-"
          : vendorOptions.find(v => v.id === item.vendor_id)?.label || "-",
        type: refundAmount !== 0 ? "Refund" : (item.type || "Advance"),
        transferSiteName: item.transfer_site_id
          ? siteOptions.find(s => String(s.id) === String(item.transfer_site_id))?.label || "-"
          : null,
        isRefund: refundAmount !== 0
      };
    });
  };
  // Handlers for first table (Project table)
  const handleProjectBillMouseEnter = (event, projectId, contractorVendorId, contractorVendorType) => {
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);
    if (billDetails.length > 0) {
      setProjectTooltipTitle('Bill Details');
      setProjectTooltipData(billDetails);
      setProjectTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  const handleProjectMouseLeave = () => {
    setProjectTooltipData(null);
    setProjectTooltipTitle("");
  };
  const handleProjectAdvanceMouseEnter = (event, projectId, contractorVendorId, contractorVendorType) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    if (advanceDetails.length > 0) {
      setProjectTooltipTitle('Advance Details');
      setProjectTooltipData(advanceDetails);
      setProjectTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  // Handlers for second table (Contractor/Vendor table)
  const handleSiteBillMouseEnter = (event, projectId, contractorVendorId, contractorVendorType) => {
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);
    if (billDetails.length > 0) {
      setSiteTooltipTitle('Bill Details');
      setSiteTooltipData(billDetails);
      setSiteTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  const handleSiteMouseLeave = () => {
    setSiteTooltipData(null);
    setSiteTooltipTitle("");
  };
  const handleSiteAdvanceMouseEnter = (event, projectId, contractorVendorId, contractorVendorType) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    if (advanceDetails.length > 0) {
      setSiteTooltipTitle('Advance Details');
      setSiteTooltipData(advanceDetails);
      setSiteTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  // Click handlers for first table (Project table) - Opens popup
  const handleProjectAdvanceClick = (projectId, contractorVendorId, contractorVendorType, projectName) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    if (advanceDetails.length > 0) {
      setProjectPopupTitle('Advance Details');
      setProjectPopupData(advanceDetails);
      // Set context: "Contractor/Vendor Name - Project Name"
      const contractorVendorName = selectedContractorOrVendorOption
        ? selectedContractorOrVendorOption.label
        : "All Contractors/Vendors";
      setProjectPopupContext(`${contractorVendorName} - ${projectName}`);
      setShowProjectPopup(true);
    }
  };
  const handleProjectBillClick = (projectId, contractorVendorId, contractorVendorType, projectName) => {
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);
    if (billDetails.length > 0) {
      setProjectPopupTitle('Bill Details');
      setProjectPopupData(billDetails);
      // Set context: "Contractor/Vendor Name - Project Name"
      const contractorVendorName = selectedContractorOrVendorOption
        ? selectedContractorOrVendorOption.label
        : "All Contractors/Vendors";
      setProjectPopupContext(`${contractorVendorName} - ${projectName}`);
      setShowProjectPopup(true);
    }
  };

  // Click handlers for second table (Contractor/Vendor table) - Opens popup
  const handleSiteAdvanceClick = (projectId, contractorVendorId, contractorVendorType, contractorVendorName) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    if (advanceDetails.length > 0) {
      setSitePopupTitle('Advance Details');
      setSitePopupData(advanceDetails);
      // Set context: "Project Name - Contractor/Vendor Name"
      const projectName = selectedAdvanceSite
        ? selectedAdvanceSite.label
        : "All Projects";
      setSitePopupContext(`${projectName} - ${contractorVendorName}`);
      setShowSitePopup(true);
    }
  };
  const handleSiteBillClick = (projectId, contractorVendorId, contractorVendorType, contractorVendorName) => {
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);
    if (billDetails.length > 0) {
      setSitePopupTitle('Bill Details');
      setSitePopupData(billDetails);
      // Set context: "Project Name - Contractor/Vendor Name"
      const projectName = selectedAdvanceSite
        ? selectedAdvanceSite.label
        : "All Projects";
      setSitePopupContext(`${projectName} - ${contractorVendorName}`);
      setShowSitePopup(true);
    }
  };

  // Click handlers for Bill Status - Opens combined popup showing both advances and bills
  const handleProjectBillStatusClick = (projectId, contractorVendorId, contractorVendorType, projectName) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);

    setBillStatusPopupData({ advances: advanceDetails, bills: billDetails });
    const contractorVendorName = selectedContractorOrVendorOption
      ? selectedContractorOrVendorOption.label
      : "All Contractors/Vendors";
    setBillStatusPopupContext(`${contractorVendorName} - ${projectName}`);
    setIsBillStatusFromFirstTable(true);
    setShowBillStatusPopup(true);
  };

  const handleSiteBillStatusClick = (projectId, contractorVendorId, contractorVendorType, contractorVendorName) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);

    setBillStatusPopupData({ advances: advanceDetails, bills: billDetails });
    const projectName = selectedAdvanceSite
      ? selectedAdvanceSite.label
      : "All Projects";
    setBillStatusPopupContext(`${projectName} - ${contractorVendorName}`);
    setIsBillStatusFromFirstTable(false);
    setShowBillStatusPopup(true);
  };
  useEffect(() => {
    if (selectedAdvanceSite) {
      // When a specific site is selected, show contractors/vendors for that site only
      const siteId = selectedAdvanceSite.id;
      const filtered = advanceData.filter(item => item.project_id === siteId);
      const grouped = {};
      let totalPending = 0;
      let totalBill = 0;
      filtered.forEach(curr => {
        const {
          contractor_id,
          vendor_id,
          type,
          amount = 0,
          bill_amount = 0,
          refund_amount = 0
        } = curr;
        const entityId = contractor_id || vendor_id;
        const entityType = contractor_id ? "Contractor" : "Vendor";
        const entityName =
          entityType === "Contractor"
            ? contractorOptions.find(c => c.id === entityId)?.label || "-"
            : vendorOptions.find(v => v.id === entityId)?.label || "-";
        if (!grouped[entityId]) {
          grouped[entityId] = {
            name: entityName,
            entityId: entityId,
            entityType: entityType,
            pendingAdvance: 0,
            billAmount: 0
          };
        }
        grouped[entityId].pendingAdvance += parseFloat(amount) || 0;
        grouped[entityId].billAmount += parseFloat(bill_amount) || 0;
        grouped[entityId].pendingAdvance -= (parseFloat(bill_amount) || 0) + (parseFloat(refund_amount) || 0);
      });
      const detailsArray = Object.values(grouped);
      detailsArray.forEach(d => {
        totalPending += d.pendingAdvance;
        totalBill += d.billAmount;
      });
      setSiteDetails(detailsArray);
      setSitePendingAdvance(totalPending);
      setSiteBillAmount(totalBill);
    } else {
      // When no site is selected, show all contractors/vendors with their totals across all sites
      const grouped = {};
      let totalPending = 0;
      let totalBill = 0;

      advanceData.forEach(curr => {
        const {
          contractor_id,
          vendor_id,
          type,
          amount = 0,
          bill_amount = 0,
          refund_amount = 0
        } = curr;
        const entityId = contractor_id || vendor_id;
        const entityType = contractor_id ? "Contractor" : "Vendor";
        const entityName =
          entityType === "Contractor"
            ? contractorOptions.find(c => c.id === entityId)?.label || "-"
            : vendorOptions.find(v => v.id === entityId)?.label || "-";

        if (entityId && entityName !== "-") {
          if (!grouped[entityId]) {
            grouped[entityId] = {
              name: entityName,
              entityId: entityId,
              entityType: entityType,
              pendingAdvance: 0,
              billAmount: 0
            };
          }
          grouped[entityId].pendingAdvance += parseFloat(amount) || 0;
          grouped[entityId].billAmount += parseFloat(bill_amount) || 0;
          grouped[entityId].pendingAdvance -= (parseFloat(bill_amount) || 0) + (parseFloat(refund_amount) || 0);
        }
      });

      const detailsArray = Object.values(grouped);
      detailsArray.forEach(d => {
        totalPending += d.pendingAdvance;
        totalBill += d.billAmount;
      });
      setSiteDetails(detailsArray);
      setSitePendingAdvance(totalPending);
      setSiteBillAmount(totalBill);
    }
  }, [selectedAdvanceSite, advanceData, contractorOptions, vendorOptions]);
  const filteredProjects = selectedProject
    ? projectData.filter(proj => proj.projectName === selectedProject.value)
    : projectData;
  const sortedFilteredData = sortData(filteredProjects, sortConfig, 'pendingAdvance', 'projectName');
  const exportPDF = () => {
    const doc = new jsPDF();
    if (selectedContractorOrVendorOption) {
      const { type, label } = selectedContractorOrVendorOption;
      const titleText = `${type} - ${label}`;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(titleText, 14, 15);
    }
    const tableColumn = ["Project Name", "Pending Advance", "Bill Amount", "Bill Status"];
    const tableRows = [];
    sortedFilteredData.forEach(proj => {
      const status = proj.pendingAdvance > 0 ? "Pending" : "Bill Settled";
      tableRows.push([
        proj.projectName,
        proj.pendingAdvance.toLocaleString("en-IN"),
        proj.billAmount.toLocaleString("en-IN"),
        status
      ]);
    });
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: selectedContractorOrVendorOption ? 20 : 10,
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
        1: { halign: 'right' }, // Pending Advance
        2: { halign: 'right' }  // Bill Amount
      }
    });
    doc.save("Project_Report.pdf");
  };
  const exportCSV = () => {
    let extraRow = [];
    if (selectedContractorOrVendorOption) {
      const { type, label } = selectedContractorOrVendorOption;
      extraRow = [[`${type} - ${label}`]];
    }
    const headers = ["Project Name", "Pending Advance", "Bill Amount", "Bill Status"];
    const sortedProjectData = sortData(projectData, sortConfig, 'pendingAdvance', 'projectName');
    const rows = sortedFilteredData.map(proj => [
      proj.projectName,
      proj.pendingAdvance,
      proj.billAmount,
      proj.pendingAdvance > 0 ? "Pending" : "Bill Settled"
    ]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Project_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportsiteNamePDF = () => {
    const doc = new jsPDF();
    if (selectedAdvanceSite) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Site Name - ${selectedAdvanceSite.label}`, 14, 15);
    } else {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("All Sites - Contractor/Vendor Summary", 14, 15);
    }
    const tableColumn = ["Contractor/Vendor", "Pending Advance", "Bill Amount", "Bill Status"];
    const tableRows = [];
    const sortedSiteDetails = sortData(siteDetails, siteSortConfig);
    sortedSiteDetails.forEach(d => {
      const status = d.pendingAdvance > 0 ? "Pending" : "Bill Settled";
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
        1: { halign: 'right' }, // Pending Advance
        2: { halign: 'right' }  // Bill Amount
      }
    });
    const fileName = selectedAdvanceSite ? "Site_Report.pdf" : "All_Sites_Contractor_Report.pdf";
    doc.save(fileName);
  };
  const exportSiteNameCSV = () => {
    let extraRow = [];
    if (selectedAdvanceSite) {
      extraRow = [[`Site Name - ${selectedAdvanceSite.label}`]];
    } else {
      extraRow = [["All Sites - Contractor/Vendor Summary"]];
    }
    const headers = ["Contractor/Vendor", "Pending Advance", "Bill Amount", "Bill Status"];
    const sortedSiteDetails = sortData(siteDetails, siteSortConfig);
    const rows = sortedSiteDetails.map(d => [
      d.name,
      d.pendingAdvance,
      d.billAmount,
      d.pendingAdvance > 0 ? "Pending" : "Bill Settled"
    ]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const fileName = selectedAdvanceSite ? "Site_Report.csv" : "All_Sites_Contractor_Report.csv";
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Popup sorting handlers
  const handleProjectPopupSort = (key) => {
    let direction = 'asc';
    if (projectPopupSortConfig.key === key && projectPopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setProjectPopupSortConfig({ key, direction });
  };

  const handleSitePopupSort = (key) => {
    let direction = 'asc';
    if (sitePopupSortConfig.key === key && sitePopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSitePopupSortConfig({ key, direction });
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
  const exportPopupPDF = (data, title, context, isProjectPopup) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(context, 14, 15);
    doc.setFontSize(10);
    doc.text(title, 14, 22);

    const tableColumn = isProjectPopup && selectedContractorOrVendorOption
      ? ["Date", "Transfer", "Amount"]
      : isProjectPopup
        ? ["Date", "Contractor/Vendor", "Amount"]
        : selectedAdvanceSite
          ? ["Date", "Transfer", "Amount"]
          : ["Date", "Project Name", "Amount"];

    const tableRows = [];
    data.forEach(entry => {
      const row = [entry.date];

      if (isProjectPopup && selectedContractorOrVendorOption) {
        let transferInfo = '';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferSiteName) {
          transferInfo = `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}`;
        }
        row.push(transferInfo);
      } else if (isProjectPopup) {
        row.push(entry.contractorVendorName || "");
      } else if (selectedAdvanceSite) {
        let transferInfo = '';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferSiteName) {
          transferInfo = `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}`;
        }
        row.push(transferInfo);
      } else {
        row.push(entry.projectName || "");
      }

      row.push(entry.amount.toLocaleString("en-IN"));
      tableRows.push(row);
    });

    // Add total row
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    const totalRow = ["Total"];
    if (isProjectPopup && selectedContractorOrVendorOption) {
      totalRow.push("");
    } else if (isProjectPopup) {
      totalRow.push("");
    } else if (selectedAdvanceSite) {
      totalRow.push("");
    } else {
      totalRow.push("");
    }
    totalRow.push(total.toLocaleString("en-IN"));
    tableRows.push(totalRow);

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
  const exportPopupCSV = (data, title, context, isProjectPopup) => {
    const extraRow = [[context], [title], []];

    const headers = isProjectPopup && selectedContractorOrVendorOption
      ? ["Date", "Transfer", "Amount"]
      : isProjectPopup
        ? ["Date", "Contractor/Vendor", "Amount"]
        : selectedAdvanceSite
          ? ["Date", "Transfer", "Amount"]
          : ["Date", "Project Name", "Amount"];

    const rows = data.map(entry => {
      const row = [entry.date];

      if (isProjectPopup && selectedContractorOrVendorOption) {
        let transferInfo = '';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferSiteName) {
          transferInfo = `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}`;
        } else {
          transferInfo = '-';
        }
        row.push(transferInfo);
      } else if (isProjectPopup) {
        row.push(entry.contractorVendorName || "-");
      } else if (selectedAdvanceSite) {
        let transferInfo = '';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferSiteName) {
          transferInfo = `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}`;
        } else {
          transferInfo = '-';
        }
        row.push(transferInfo);
      } else {
        row.push(entry.projectName || "-");
      }
      row.push(entry.amount);
      return row;
    });
    // Add total row
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

  // Export Bill Status Popup PDF
  const exportBillStatusPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(billStatusPopupContext, 14, 15);
    doc.setFontSize(10);
    doc.text("Bill Status Details", 14, 22);

    // Determine columns based on context
    let tableColumn = ["Date"];
    if (!isBillStatusFromFirstTable && !selectedAdvanceSite) {
      tableColumn.push("Project Name");
    } else if (isBillStatusFromFirstTable && !selectedContractorOrVendorOption) {
      tableColumn.push("Contractor/Vendor");
    } else if ((isBillStatusFromFirstTable && selectedContractorOrVendorOption) ||
      (!isBillStatusFromFirstTable && selectedAdvanceSite)) {
      tableColumn.push("Transfer");
    }
    tableColumn.push("Advance Amount", "Bill Amount");

    // Prepare data
    const combinedData = [];
    const dateMap = new Map();

    billStatusPopupData.advances.forEach(adv => {
      const key = `${adv.date}-${adv.advancePortalId}`;
      dateMap.set(key, {
        date: adv.date,
        advancePortalId: adv.advancePortalId,
        advanceAmount: adv.amount,
        billAmount: 0,
        projectName: adv.projectName,
        contractorVendorName: adv.contractorVendorName,
        transferSiteName: adv.transferSiteName,
        type: adv.type,
        isRefund: adv.isRefund
      });
    });

    billStatusPopupData.bills.forEach(bill => {
      const key = `${bill.date}-${bill.advancePortalId}`;
      if (dateMap.has(key)) {
        dateMap.get(key).billAmount = bill.amount;
        dateMap.get(key).file_url = bill.file_url || null;
      } else {
        dateMap.set(key, {
          date: bill.date,
          advancePortalId: bill.advancePortalId,
          advanceAmount: 0,
          billAmount: bill.amount,
          projectName: bill.projectName,
          contractorVendorName: bill.contractorVendorName,
          transferSiteName: bill.transferSiteName,
          type: bill.type,
          isRefund: false,
          file_url: bill.file_url || null
        });
      }
    });

    combinedData.push(...Array.from(dateMap.values()));

    // Sort by date (newest first)
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };

    // Apply sorting based on billStatusPopupSortConfig
    if (!billStatusPopupSortConfig.key) {
      combinedData.sort((a, b) => {
        const dateDiff = parseDate(b.date) - parseDate(a.date);
        if (dateDiff !== 0) return dateDiff;
        // Secondary sort by advancePortalId (entry number) - descending to match date order
        return b.advancePortalId - a.advancePortalId;
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
          // Secondary sort by advancePortalId (entry number) - match the direction of date sort
          return billStatusPopupSortConfig.direction === 'asc' ? a.advancePortalId - b.advancePortalId : b.advancePortalId - a.advancePortalId;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          if (primarySort !== 0) return primarySort;
          // Secondary sort by advancePortalId (entry number) - always ascending for amounts
          return a.advancePortalId - b.advancePortalId;
        }

        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        if (aValue < bValue) return billStatusPopupSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return billStatusPopupSortConfig.direction === 'asc' ? 1 : -1;
        // Secondary sort by advancePortalId (entry number) - always ascending for text fields
        return a.advancePortalId - b.advancePortalId;
      });
    }

    const tableRows = [];
    combinedData.forEach(entry => {
      const row = [entry.date];

      if (!isBillStatusFromFirstTable && !selectedAdvanceSite) {
        row.push(entry.projectName || "-");
      } else if (isBillStatusFromFirstTable && !selectedContractorOrVendorOption) {
        row.push(entry.contractorVendorName || "-");
      } else if ((isBillStatusFromFirstTable && selectedContractorOrVendorOption) ||
        (!isBillStatusFromFirstTable && selectedAdvanceSite)) {
        let transferInfo = '-';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferSiteName) {
          transferInfo = `${entry.advanceAmount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}`;
        }
        row.push(transferInfo);
      }

      row.push(
        entry.advanceAmount !== 0 ? entry.advanceAmount.toLocaleString("en-IN") : "-",
        entry.billAmount !== 0 ? entry.billAmount.toLocaleString("en-IN") : "-"
      );
      tableRows.push(row);
    });

    // Add total row
    const totalAdvance = billStatusPopupData.advances.reduce((sum, item) => sum + item.amount, 0);
    const totalBill = billStatusPopupData.bills.reduce((sum, item) => sum + item.amount, 0);
    const totalRow = ["Total"];
    if (tableColumn.length === 4) totalRow.push("");
    totalRow.push(
      totalAdvance.toLocaleString("en-IN"),
      totalBill.toLocaleString("en-IN")
    );
    tableRows.push(totalRow);

    // Add balance row
    const balance = totalAdvance - totalBill;
    const balanceRow = ["Balance Advance"];
    if (tableColumn.length === 4) balanceRow.push("");
    balanceRow.push("", balance.toLocaleString("en-IN"));
    tableRows.push(balanceRow);

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
        2: { halign: 'right' }, // Advance Amount
        3: { halign: 'right' }  // Bill Amount
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

    // Determine columns based on context
    let headers = ["Date"];
    if (!isBillStatusFromFirstTable && !selectedAdvanceSite) {
      headers.push("Project Name");
    } else if (isBillStatusFromFirstTable && !selectedContractorOrVendorOption) {
      headers.push("Contractor/Vendor");
    } else if ((isBillStatusFromFirstTable && selectedContractorOrVendorOption) ||
      (!isBillStatusFromFirstTable && selectedAdvanceSite)) {
      headers.push("Transfer");
    }
    headers.push("Advance Amount", "Bill Amount");

    // Prepare data
    const combinedData = [];
    const dateMap = new Map();

    billStatusPopupData.advances.forEach(adv => {
      const key = `${adv.date}-${adv.advancePortalId}`;
      dateMap.set(key, {
        date: adv.date,
        advancePortalId: adv.advancePortalId,
        advanceAmount: adv.amount,
        billAmount: 0,
        projectName: adv.projectName,
        contractorVendorName: adv.contractorVendorName,
        transferSiteName: adv.transferSiteName,
        type: adv.type,
        isRefund: adv.isRefund
      });
    });

    billStatusPopupData.bills.forEach(bill => {
      const key = `${bill.date}-${bill.advancePortalId}`;
      if (dateMap.has(key)) {
        dateMap.get(key).billAmount = bill.amount;
        dateMap.get(key).file_url = bill.file_url || null;
      } else {
        dateMap.set(key, {
          date: bill.date,
          advancePortalId: bill.advancePortalId,
          advanceAmount: 0,
          billAmount: bill.amount,
          projectName: bill.projectName,
          contractorVendorName: bill.contractorVendorName,
          transferSiteName: bill.transferSiteName,
          type: bill.type,
          isRefund: false,
          file_url: bill.file_url || null
        });
      }
    });

    combinedData.push(...Array.from(dateMap.values()));

    // Sort by date (newest first)
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };

    // Apply sorting based on billStatusPopupSortConfig
    if (!billStatusPopupSortConfig.key) {
      combinedData.sort((a, b) => {
        const dateDiff = parseDate(b.date) - parseDate(a.date);
        if (dateDiff !== 0) return dateDiff;
        // Secondary sort by advancePortalId (entry number) - descending to match date order
        return b.advancePortalId - a.advancePortalId;
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
          // Secondary sort by advancePortalId (entry number) - match the direction of date sort
          return billStatusPopupSortConfig.direction === 'asc' ? a.advancePortalId - b.advancePortalId : b.advancePortalId - a.advancePortalId;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          if (primarySort !== 0) return primarySort;
          // Secondary sort by advancePortalId (entry number) - always ascending for amounts
          return a.advancePortalId - b.advancePortalId;
        }

        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        if (aValue < bValue) return billStatusPopupSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return billStatusPopupSortConfig.direction === 'asc' ? 1 : -1;
        // Secondary sort by advancePortalId (entry number) - always ascending for text fields
        return a.advancePortalId - b.advancePortalId;
      });
    }

    const rows = combinedData.map(entry => {
      const row = [entry.date];

      if (!isBillStatusFromFirstTable && !selectedAdvanceSite) {
        row.push(entry.projectName || "-");
      } else if (isBillStatusFromFirstTable && !selectedContractorOrVendorOption) {
        row.push(entry.contractorVendorName || "-");
      } else if ((isBillStatusFromFirstTable && selectedContractorOrVendorOption) ||
        (!isBillStatusFromFirstTable && selectedAdvanceSite)) {
        let transferInfo = '-';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferSiteName) {
          transferInfo = `${entry.advanceAmount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}`;
        }
        row.push(transferInfo);
      }

      row.push(
        entry.advanceAmount !== 0 ? entry.advanceAmount : "-",
        entry.billAmount !== 0 ? entry.billAmount : "-"
      );
      return row;
    });

    // Add total row
    const totalAdvance = billStatusPopupData.advances.reduce((sum, item) => sum + item.amount, 0);
    const totalBill = billStatusPopupData.bills.reduce((sum, item) => sum + item.amount, 0);
    const totalRow = ["Total"];
    if (headers.length === 4) totalRow.push("");
    totalRow.push(totalAdvance, totalBill);
    rows.push(totalRow);

    // Add balance row
    const balance = totalAdvance - totalBill;
    const balanceRow = ["Balance Advance"];
    if (headers.length === 4) balanceRow.push("");
    balanceRow.push("", balance);
    rows.push(balanceRow);

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

  if (loading) {
    return (
      <body className='bg-[#FAF6ED]'>
        <div className='bg-white w-full max-w-[1850px] h-[500px] rounded-md p-10 ml-4 sm:ml-6 lg:ml-10 flex flex-col items-center justify-center mx-auto'>
          <div className="text-lg mb-4">Loading advance summary...</div>
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
        <div className='bg-white w-full max-w-[1850px] h-[500px] rounded-md p-10 ml-4 sm:ml-6 lg:ml-10 flex items-center justify-center mx-auto'>
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </body>
    );
  }

  return (
    <div className='bg-[#FAF6ED]'>
      <div className="flex flex-wrap gap-6">
        <div className="bg-white rounded xl:w-[1850px] xl:h-[793px] p-4 ml-10 mr-10 px-4 lg:px-14">
          <div className="xl:flex space-y-4 xl:space-y-0 gap-8">
            <div className="w-full">
              <div className="flex items-center mb-4 lg:justify-between">
                <div className='lg:flex lg:gap-3 gap-1'>
                  <div className="text-left">
                    <label className="block font-semibold mb-2">Contractor/Vendor</label>
                    <Select
                      options={combinedOptions}
                      value={selectedContractorOrVendorOption}
                      onChange={(selectedOption) => {
                        setSelectedContractorOrVendorOption(selectedOption);
                      }}
                      placeholder="Select..."
                      className="w-[253px] h-[45px] rounded-lg focus:outline-none"
                      isClearable
                      menuPortalTarget={document.body}
                      styles={customStyles}
                    />
                  </div>
                  <div className="text-left">
                    <label className="block font-semibold mb-2">Project Name</label>
                    <Select
                      options={projectData.map(proj => ({
                        value: proj.projectName,
                        label: proj.projectName
                      }))}
                      value={selectedProject}
                      onChange={(selectedOption) => setSelectedProject(selectedOption)}
                      className="w-[273px] h-[45px] rounded-lg focus:outline-none"
                      isClearable
                      isSearchable
                      menuPortalTarget={document.body}
                      styles={customStyles}
                    />
                  </div>
                </div>
                <div className="flex flex-col text-right border-2 border-[#E4572E] border-opacity-25 p-2">
                  <span>
                    Pending Advance:{" "}
                    <b className="text-red-500">
                      {totalPendingAdvance !== 0 ? totalPendingAdvance.toLocaleString("en-IN") : "0"}
                    </b>
                  </span>
                  <span>
                    Bill Amount:{" "}
                    {totalBillAmount !== 0 ? totalBillAmount.toLocaleString("en-IN") : "0"}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 text-sm justify-end">
                <button onClick={exportPDF} className="flex items-center font-bold hover:underline gap-1 text-[#E4572E]">Export PDF</button>
                <button onClick={exportCSV} className="flex items-center font-bold hover:underline gap-1 text-[#007233]">Export XL</button>
                <button className="flex items-center font-bold hover:underline gap-1 text-[#BF9853]">Print</button>
              </div>
              <div className="border-l-8 border-l-[#BF9853] rounded-lg h-[580px] overflow-auto">
                <table className="w-full border-collapse ">
                  <thead>
                    <tr className="bg-[#f8f1e5] text-left sticky top-0 z-10">
                      <th className="p-2 py-2 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('projectName')}>
                        Project Name
                        {sortConfig.key === 'projectName' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="p-2 cursor-pointer hover:bg-gray-200 text-right" onClick={() => handleSort('pendingAdvance')}>
                        Advance
                        {sortConfig.key === 'pendingAdvance' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="p-2 cursor-pointer hover:bg-gray-200 text-right" onClick={() => handleSort('billAmount')} >
                        Bill Amount
                        {sortConfig.key === 'billAmount' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('billStatus')} >
                        Bill Status
                        {sortConfig.key === 'billStatus' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFilteredData.length > 0 ? (
                      sortedFilteredData.map((proj, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                          <td className="py-2 px-6 text-left">{proj.projectName}</td>
                          <td className="py-2 cursor-pointer relative text-right"
                            onMouseEnter={(e) => handleProjectAdvanceMouseEnter(e, proj.projectId, selectedContractorOrVendorOption?.id, selectedContractorOrVendorOption?.type)}
                            onMouseLeave={handleProjectMouseLeave}
                            onClick={() => handleProjectAdvanceClick(proj.projectId, selectedContractorOrVendorOption?.id, selectedContractorOrVendorOption?.type, proj.projectName)}
                          >
                            {proj.pendingAdvance.toLocaleString("en-IN")}
                          </td>
                          <td className="p-2 cursor-pointer relative text-right"
                            onMouseEnter={(e) => handleProjectBillMouseEnter(e, proj.projectId, selectedContractorOrVendorOption?.id, selectedContractorOrVendorOption?.type)}
                            onMouseLeave={handleProjectMouseLeave}
                            onClick={() => handleProjectBillClick(proj.projectId, selectedContractorOrVendorOption?.id, selectedContractorOrVendorOption?.type, proj.projectName)}
                          >
                            {proj.billAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="p-2 cursor-pointer"
                            style={{ color: proj.pendingAdvance > 0 ? "red" : "green" }}
                            onClick={() => handleProjectBillStatusClick(proj.projectId, selectedContractorOrVendorOption?.id, selectedContractorOrVendorOption?.type, proj.projectName)}
                          >
                            {proj.pendingAdvance > 0 ? "Pending" : "Bill Settled"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center p-4">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className=" w-full">
              <div className="flex items-center mb-4 lg:justify-between">
                <div className="text-left">
                  <label className="block font-semibold mb-2">Project Name</label>
                  <Select
                    options={sortedSiteOptions || []}
                    placeholder="Select a project..."
                    isSearchable={true}
                    value={selectedAdvanceSite}
                    onChange={setSelectedAdvanceSite}
                    styles={customStyles}
                    isClearable
                    menuPortalTarget={document.body}
                    className="w-[270px] h-[45px] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col text-right border-2 border-[#E4572E] border-opacity-25 p-2">
                  <span>
                    Pending Advance: <b className="text-red-500">{sitePendingAdvance.toLocaleString("en-IN")}</b>
                  </span>
                  <span>Bill Amount: {siteBillAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="flex gap-3 text-sm justify-end">
                <button onClick={exportsiteNamePDF} className="flex items-center gap-1 font-bold hover:underline text-[#E4572E]">Export PDF</button>
                <button onClick={exportSiteNameCSV} className="flex items-center gap-1 font-bold hover:underline text-[#007233]"> Export XL</button>
                <button className="flex items-center gap-1 font-bold hover:underline text-[#BF9853]"> Print</button>
              </div>
              <div className="border-l-8 border-l-[#BF9853] rounded-lg h-[580px] overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f8f1e5] text-left sticky top-0 z-10">
                      <th className="p-2 py-2 cursor-pointer hover:bg-gray-200" onClick={() => handleSiteSort('name')} >
                        Contractor/Vendor
                        {siteSortConfig.key === 'name' && (
                          <span className="ml-1">{siteSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="p-2 cursor-pointer hover:bg-gray-200 text-right" onClick={() => handleSiteSort('pendingAdvance')} >
                        Advance
                        {siteSortConfig.key === 'pendingAdvance' && (
                          <span className="ml-1">{siteSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="p-2 cursor-pointer hover:bg-gray-200 text-right" onClick={() => handleSiteSort('billAmount')} >
                        Bill Amount
                        {siteSortConfig.key === 'billAmount' && (
                          <span className="ml-1">{siteSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => handleSiteSort('billStatus')} >
                        Bill Status
                        {siteSortConfig.key === 'billStatus' && (
                          <span className="ml-1">{siteSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortData(siteDetails, siteSortConfig).length > 0 ? (
                      sortData(siteDetails, siteSortConfig).map((d, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                          <td className="p-2 text-left">{d.name}</td>
                          <td className="p-2 cursor-pointer relative text-right"
                            onMouseEnter={(e) => handleSiteAdvanceMouseEnter(e, selectedAdvanceSite?.id || null, d.entityId, d.entityType)}
                            onMouseLeave={handleSiteMouseLeave}
                            onClick={() => handleSiteAdvanceClick(selectedAdvanceSite?.id || null, d.entityId, d.entityType, d.name)}
                          >
                            {d.pendingAdvance.toLocaleString("en-IN")}
                          </td>
                          <td className="p-2 cursor-pointer relative text-right"
                            onMouseEnter={(e) => handleSiteBillMouseEnter(e, selectedAdvanceSite?.id || null, d.entityId, d.entityType)}
                            onMouseLeave={handleSiteMouseLeave}
                            onClick={() => handleSiteBillClick(selectedAdvanceSite?.id || null, d.entityId, d.entityType, d.name)}
                          >
                            {d.billAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="p-2 cursor-pointer text-left"
                            style={{ color: d.pendingAdvance > 0 ? "red" : "green" }}
                            onClick={() => handleSiteBillStatusClick(selectedAdvanceSite?.id || null, d.entityId, d.entityType, d.name)}
                          >
                            {d.pendingAdvance > 0 ? "Pending" : "Bill Settled"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center p-4">
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
      {projectTooltipData && (
        <div className="fixed z-50 bg-white text-black p-3 rounded shadow-lg text-sm max-w-xs"
          style={{ left: projectTooltipPosition.x + 10, top: projectTooltipPosition.y - 10, pointerEvents: 'none' }}
        >
          <div className="font-semibold mb-2">{projectTooltipTitle || 'Details'}:</div>
          {projectTooltipData
            .slice()
            .reverse()
            .map((entry, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-600">{entry.date}:</span>
                <span className={`ml-2 ${entry.amount < 0 ? 'text-red-600' : ''}`}>
                  ₹{entry.amount.toLocaleString('en-IN')}
                </span>
                {entry.contractorVendorName && !selectedContractorOrVendorOption && (
                  <div className="text-xs text-gray-500 ml-2">({entry.contractorVendorName})</div>
                )}
                {entry.isRefund && selectedContractorOrVendorOption && (
                  <div className="text-xs text-gray-500 ml-2">(Refund)</div>
                )}
                {entry.type === 'Transfer' && selectedContractorOrVendorOption && entry.transferSiteName && !entry.isRefund && (
                  <div className="text-xs text-gray-500 ml-2">
                    ({entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}{entry.transferSiteName})
                  </div>
                )}
              </div>
            ))}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <span className="font-semibold">
              Total: ₹
              {projectTooltipData
                .reduce((sum, item) => sum + item.amount, 0)
                .toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
      {siteTooltipData && (
        <div className="fixed z-50 bg-white text-black p-3 rounded shadow-lg text-sm max-w-xs"
          style={{ left: siteTooltipPosition.x + 10, top: siteTooltipPosition.y - 10, pointerEvents: 'none' }}
        >
          <div className="font-semibold mb-2">{siteTooltipTitle || 'Details'}:</div>
          {siteTooltipData
            .slice()
            .reverse()
            .map((entry, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-600">{entry.date}:</span>
                <span className={`ml-2 ${entry.amount < 0 ? 'text-red-600' : ''}`}>
                  ₹{entry.amount.toLocaleString('en-IN')}
                </span>
                {entry.projectName && !selectedAdvanceSite && (
                  <div className="text-xs text-gray-500 ml-2">({entry.projectName})</div>
                )}
                {entry.isRefund && selectedAdvanceSite && (
                  <div className="text-xs text-gray-500 ml-2">(Refund)</div>
                )}
                {entry.type === 'Transfer' && selectedAdvanceSite && entry.transferSiteName && !entry.isRefund && (
                  <div className="text-xs text-gray-500 ml-2">
                    ({entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}{entry.transferSiteName})
                  </div>
                )}
              </div>
            ))}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <span className="font-semibold">
              Total: ₹
              {siteTooltipData
                .reduce((sum, item) => sum + item.amount, 0)
                .toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
      {showProjectPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowProjectPopup(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-[#BF9853]">{projectPopupContext}</h3>
                <p className="text-sm text-gray-600 mt-1">{projectPopupTitle}</p>
              </div>
              <button onClick={() => setShowProjectPopup(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex gap-3 text-sm justify-end mb-3">
              <button
                onClick={() => exportPopupPDF(sortPopupData(projectPopupData, projectPopupSortConfig), projectPopupTitle, projectPopupContext, true)}
                className="flex items-center font-bold hover:underline gap-1 text-[#E4572E]"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportPopupCSV(sortPopupData(projectPopupData, projectPopupSortConfig), projectPopupTitle, projectPopupContext, true)}
                className="flex items-center font-bold hover:underline gap-1 text-[#007233]"
              >
                Export XL
              </button>
            </div>
            <div className="mt-4 border-l-8 border-l-[#BF9853] rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8f1e5]">
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleProjectPopupSort('date')}>
                      Date
                      {projectPopupSortConfig.key === 'date' && (
                        <span className="ml-1">{projectPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    {!selectedContractorOrVendorOption && (
                      <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleProjectPopupSort('contractorVendorName')}>
                        Contractor/Vendor
                        {projectPopupSortConfig.key === 'contractorVendorName' && (
                          <span className="ml-1">{projectPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    )}
                    {selectedContractorOrVendorOption && (
                      <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleProjectPopupSort('transferSiteName')}>
                        Transfer
                        {projectPopupSortConfig.key === 'transferSiteName' && (
                          <span className="ml-1">{projectPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    )}
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleProjectPopupSort('amount')}>
                      Amount
                      {projectPopupSortConfig.key === 'amount' && (
                        <span className="ml-1">{projectPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>

                  </tr>
                </thead>
                <tbody>
                  {projectPopupData &&
                    sortPopupData(projectPopupData, projectPopupSortConfig)
                      .map((entry, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                          <td className="p-3 text-left">{entry.date}</td>
                          {!selectedContractorOrVendorOption && (
                            <td className="p-3 text-left text-gray-600">{entry.contractorVendorName || "-"}</td>
                          )}
                          {selectedContractorOrVendorOption && (
                            <td className="p-3 text-left text-gray-600">
                              {entry.isRefund ? (
                                <div className="text-xs mt-1 text-gray-500">Refund</div>
                              ) : entry.type === 'Transfer' && selectedContractorOrVendorOption && (
                                <div className="text-xs mt-1 text-gray-500">
                                  {entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}
                                  {entry.transferSiteName || '-'}
                                </div>
                              )}
                            </td>
                          )}
                          <td className={`p-3 text-right font-semibold ${entry.amount < 0 ? 'text-red-600' : ''}`}>
                            ₹{entry.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#BF9853] text-white font-bold">
                    <td className="p-3 text-left">Total</td>
                    {!selectedContractorOrVendorOption && <td></td>}
                    {selectedContractorOrVendorOption && <td></td>}
                    <td className="p-3 text-right">
                      ₹{projectPopupData &&
                        projectPopupData
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
      {showSitePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowSitePopup(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-[#BF9853]">{sitePopupContext}</h3>
                <p className="text-sm text-gray-600 mt-1">{sitePopupTitle}</p>
              </div>
              <button onClick={() => setShowSitePopup(false)} className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none" >
                ×
              </button>
            </div>
            <div className="flex gap-3 text-sm justify-end mb-3">
              <button
                onClick={() => exportPopupPDF(sortPopupData(sitePopupData, sitePopupSortConfig), sitePopupTitle, sitePopupContext, false)}
                className="flex items-center font-bold hover:underline gap-1 text-[#E4572E]"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportPopupCSV(sortPopupData(sitePopupData, sitePopupSortConfig), sitePopupTitle, sitePopupContext, false)}
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
                      onClick={() => handleSitePopupSort('date')}
                    >
                      Date
                      {sitePopupSortConfig.key === 'date' && (
                        <span className="ml-1">{sitePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    {!selectedAdvanceSite && (
                      <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSitePopupSort('projectName')}
                      >
                        Project Name
                        {sitePopupSortConfig.key === 'projectName' && (
                          <span className="ml-1">{sitePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    )}
                    {selectedAdvanceSite && (
                      <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSitePopupSort('transferSiteName')}
                      >
                        Transfer
                        {sitePopupSortConfig.key === 'transferSiteName' && (
                          <span className="ml-1">{sitePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    )}
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSitePopupSort('amount')}
                    >
                      Amount
                      {sitePopupSortConfig.key === 'amount' && (
                        <span className="ml-1">{sitePopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sitePopupData &&
                    sortPopupData(sitePopupData, sitePopupSortConfig)
                      .map((entry, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                          <td className="p-3 text-left">{entry.date}</td>
                          {!selectedAdvanceSite && (
                            <td className="p-3 text-left text-gray-600">{entry.projectName || "-"}</td>
                          )}
                          {selectedAdvanceSite && (
                            <td className="p-3 text-left text-gray-600">
                              {entry.isRefund ? (
                                <div className="text-xs mt-1 text-gray-500">Refund</div>
                              ) : entry.type === 'Transfer' && selectedAdvanceSite && (
                                <div className="text-xs mt-1 text-gray-500">
                                  {entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}
                                  {entry.transferSiteName || '-'}
                                </div>
                              )}
                            </td>
                          )}
                          <td className={`p-3 text-right font-semibold ${entry.amount < 0 ? 'text-red-600' : ''}`}>
                            ₹{entry.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#BF9853] text-white font-bold">
                    <td className="p-3 text-left">Total</td>
                    {!selectedAdvanceSite && <td></td>}
                    {selectedAdvanceSite && <td></td>}
                    <td className="p-3 text-right">
                      ₹{sitePopupData &&
                        sitePopupData
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
                    {!isBillStatusFromFirstTable && !selectedAdvanceSite && (
                      <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleBillStatusPopupSort('projectName')}>
                        Project Name
                        {billStatusPopupSortConfig.key === 'projectName' && (
                          <span className="ml-1">{billStatusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    )}
                    {isBillStatusFromFirstTable && !selectedContractorOrVendorOption && (
                      <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleBillStatusPopupSort('contractorVendorName')}>
                        Contractor/Vendor
                        {billStatusPopupSortConfig.key === 'contractorVendorName' && (
                          <span className="ml-1">{billStatusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    )}
                    {((isBillStatusFromFirstTable && selectedContractorOrVendorOption) || (!isBillStatusFromFirstTable && selectedAdvanceSite)) && (
                      <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleBillStatusPopupSort('transferSiteName')}>
                        Transfer
                        {billStatusPopupSortConfig.key === 'transferSiteName' && (
                          <span className="ml-1">{billStatusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    )}
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleBillStatusPopupSort('advanceAmount')}>
                      Advance Amount
                      {billStatusPopupSortConfig.key === 'advanceAmount' && (
                        <span className="ml-1">{billStatusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleBillStatusPopupSort('billAmount')}>
                      Bill Amount
                      {billStatusPopupSortConfig.key === 'billAmount' && (
                        <span className="ml-1">{billStatusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const combinedData = [];
                    const dateMap = new Map();
                    billStatusPopupData.advances.forEach(adv => {
                      const key = `${adv.date}-${adv.advancePortalId}`;
                      dateMap.set(key, {
                        date: adv.date,
                        advancePortalId: adv.advancePortalId,
                        advanceAmount: adv.amount,
                        billAmount: 0,
                        projectName: adv.projectName,
                        contractorVendorName: adv.contractorVendorName,
                        transferSiteName: adv.transferSiteName,
                        type: adv.type,
                        isRefund: adv.isRefund
                      });
                    });
                    billStatusPopupData.bills.forEach(bill => {
                      const key = `${bill.date}-${bill.advancePortalId}`;
                      const fileUrl = bill.file_url && bill.file_url.trim() !== '' ? bill.file_url : null;
                      if (dateMap.has(key)) {
                        dateMap.get(key).billAmount = bill.amount;
                        dateMap.get(key).file_url = fileUrl;
                      } else {
                        dateMap.set(key, {
                          date: bill.date,
                          advancePortalId: bill.advancePortalId,
                          advanceAmount: 0,
                          billAmount: bill.amount,
                          projectName: bill.projectName,
                          contractorVendorName: bill.contractorVendorName,
                          transferSiteName: bill.transferSiteName,
                          type: bill.type,
                          isRefund: false,
                          file_url: fileUrl
                        });
                      }
                    });
                    combinedData.push(...Array.from(dateMap.values()));
                    const parseDate = (dateStr) => {
                      const [day, month, year] = dateStr.split('/');
                      return new Date(`${year}-${month}-${day}`);
                    };
                    if (!billStatusPopupSortConfig.key) {
                      combinedData.sort((a, b) => {
                        const dateDiff = parseDate(b.date) - parseDate(a.date);
                        if (dateDiff !== 0) return dateDiff;
                        return b.advancePortalId - a.advancePortalId;
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
                          return billStatusPopupSortConfig.direction === 'asc' ? a.advancePortalId - b.advancePortalId : b.advancePortalId - a.advancePortalId;
                        }
                        if (typeof aValue === 'number' && typeof bValue === 'number') {
                          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                          if (primarySort !== 0) return primarySort;
                          return a.advancePortalId - b.advancePortalId;
                        }
                        aValue = String(aValue || '').toLowerCase();
                        bValue = String(bValue || '').toLowerCase();
                        if (aValue < bValue) return billStatusPopupSortConfig.direction === 'asc' ? -1 : 1;
                        if (aValue > bValue) return billStatusPopupSortConfig.direction === 'asc' ? 1 : -1;
                        return a.advancePortalId - b.advancePortalId;
                      });
                    }

                    return combinedData.map((entry, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                        <td className="p-3 text-left">{entry.date}</td>
                        {!isBillStatusFromFirstTable && !selectedAdvanceSite && (
                          <td className="p-3 text-left text-gray-600">{entry.projectName || "-"}</td>
                        )}
                        {isBillStatusFromFirstTable && !selectedContractorOrVendorOption && (
                          <td className="p-3 text-left text-gray-600">{entry.contractorVendorName || "-"}</td>
                        )}
                        {((isBillStatusFromFirstTable && selectedContractorOrVendorOption) || (!isBillStatusFromFirstTable && selectedAdvanceSite)) && (
                          <td className="p-3 text-left text-gray-600">
                            {entry.isRefund ? (
                              <div className="text-xs text-gray-500">Refund</div>
                            ) : entry.type === 'Transfer' && entry.transferSiteName ? (
                              <div className="text-xs text-gray-500">
                                {entry.advanceAmount < 0 ? 'To: ' : 'From: '}
                                {entry.transferSiteName}
                              </div>
                            ) : '-'}
                          </td>
                        )}
                        <td className={`p-3 text-right font-semibold ${entry.advanceAmount < 0 ? 'text-red-600' : ''}`}>
                          {entry.advanceAmount !== 0 ? `₹${entry.advanceAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td
                          className={`p-3 text-right font-semibold ${entry.billAmount !== 0 && entry.file_url ? 'cursor-pointer hover:underline' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (entry.billAmount !== 0 && entry.file_url) {
                              const viewableUrl = convertToViewableUrl(entry.file_url);
                              window.open(viewableUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          style={entry.billAmount !== 0 && entry.file_url ? {
                            cursor: 'pointer'
                          } : {}}
                          title={entry.billAmount !== 0 && entry.file_url ? 'Click to open bill document in new tab' : ''}
                        >
                          {entry.billAmount !== 0 ? `₹${entry.billAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f8f1e5] font-bold">
                    <td className="p-3 text-left" colSpan={
                      (!isBillStatusFromFirstTable && !selectedAdvanceSite) ||
                        (isBillStatusFromFirstTable && !selectedContractorOrVendorOption) ||
                        ((isBillStatusFromFirstTable && selectedContractorOrVendorOption) ||
                          (!isBillStatusFromFirstTable && selectedAdvanceSite))
                        ? 2 : 1
                    }>
                      Total
                    </td>
                    <td className="p-3 text-right">
                      ₹{billStatusPopupData.advances.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right">
                      ₹{billStatusPopupData.bills.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-[#BF9853] text-white font-bold">
                    <td className="p-3 text-left" colSpan={
                      (!isBillStatusFromFirstTable && !selectedAdvanceSite) ||
                        (isBillStatusFromFirstTable && !selectedContractorOrVendorOption) ||
                        ((isBillStatusFromFirstTable && selectedContractorOrVendorOption) ||
                          (!isBillStatusFromFirstTable && selectedAdvanceSite))
                        ? 3 : 2
                    }>
                      Balance Advance
                    </td>
                    <td className="p-3 text-right" colSpan="2">
                      ₹{(
                        billStatusPopupData.advances.reduce((sum, item) => sum + item.amount, 0) -
                        billStatusPopupData.bills.reduce((sum, item) => sum + item.amount, 0)
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
}
export default AdvanceSummary