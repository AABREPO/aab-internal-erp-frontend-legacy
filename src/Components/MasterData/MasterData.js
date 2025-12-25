import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
import share from '../Images/share.png';
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import QRCode from '../Images/AAB_QR_CODE.jpeg';
import DownloadIcon from '../Images/download_icon.png';
import Select from 'react-select';
const MasterData = ({ username, userRoles = [] }) => {
  // State for Project Names (from ExpensesInputData)
  const [isSiteNamesOpen, setIsSiteNamesOpen] = useState(false);
  const [siteNameSearch, setSiteNameSearch] = useState("");
  const [siteName, setSiteName] = useState('');
  const [siteNo, setSiteNo] = useState('');
  const [siteNames, setSiteNames] = useState([]);
  const [isEditSiteNameOpen, setIsEditSiteNameOpen] = useState(false);
  const [editSiteName, setEditSiteName] = useState('');
  const [editSiteNo, setEditSiteNo] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [accountDetails, setAccountDetails] = useState([]);
  // State for Vendor Names
  const [isVendorNameOpens, setIsVendorNameOpens] = useState(false);
  const [vendorNameSearch, setVendorNameSearch] = useState("");
  const [vendorName, setVendorName] = useState('');
  const [vendorAccountHolderName, setVendorAccountHolderName] = useState('');
  const [vendorAccountNumber, setVendorAccountNumber] = useState('');
  const [vendorBankName, setVendorBankName] = useState('');
  const [vendorBranch, setVendorBranch] = useState('');
  const [vendorIfscCode, setVendorIfscCode] = useState('');
  const [vendorGpayNumber, setVendorGpayNumber] = useState('');
  const [vendorUpiId, setVendorUpiId] = useState('');
  const [vendorContactNumber, setVendorContactNumber] = useState('');
  const [vendorContactEmail, setVendorContactEmail] = useState('');
  const [vendorQrImage, setVendorQrImage] = useState(null);
  const [vendorNames, setVendorNames] = useState([]);
  const [isVendorEditOpen, setIsVendorEditOpen] = useState(false);
  const [editVendorName, setEditVendorName] = useState('');
  const [editVendorAccountHolderName, setEditVendorAccountHolderName] = useState('');
  const [editVendorAccountNumber, setEditVendorAccountNumber] = useState('');
  const [editVendorBankName, setEditVendorBankName] = useState('');
  const [editVendorBranch, setEditVendorBranch] = useState('');
  const [editVendorIfscCode, setEditVendorIfscCode] = useState('');
  const [editVendorGpayNumber, setEditVendorGpayNumber] = useState('');
  const [editVendorUpiId, setEditVendorUpiId] = useState('');
  const [editVendorContactNumber, setEditVendorContactNumber] = useState('');
  const [editVendorContactEmail, setEditVendorContactEmail] = useState('');
  const [editVendorQrImage, setEditVendorQrImage] = useState(null);
  const [editVendorQrImagePreview, setEditVendorQrImagePreview] = useState(null);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [vendorBulkUploadFile, setVendorBulkUploadFile] = useState(null);
  const [isVendorBulkUploadOpen, setIsVendorBulkUploadOpen] = useState(false);
  const [supportStaffNameList, setSupportStaffNameList] = useState([]);
  const [supportStaffSearch, setSupportStaffSearch] = useState('');
  const [isSupportStaffNameEditOpen, setIsSupportStaffNameEditOpen] = useState(false);
  const [selectedSupportStaffNameId, setSelectedSupportStaffNameId] = useState(null);
  const [editSupportStaffName, setEditSupportStaffName] = useState('');
  const [editSupportStaffMobileNumber, setEditSupportStaffMobileNumber] = useState('');
  const [supportStaffName, setSupportStaffName] = useState('');
  const [supportStaffMobileNumber, setSupportStaffMobileNumber] = useState('');

  // State for Contractor Names
  const [isContractorNameOpens, setContractorNameOpens] = useState(false);
  const [contractorNameSearch, setContractorNameSearch] = useState("");
  const [contractorName, setContractorName] = useState('');
  const [contractorAccountHolderName, setContractorAccountHolderName] = useState('');
  const [contractorAccountNumber, setContractorAccountNumber] = useState('');
  const [contractorBankName, setContractorBankName] = useState('');
  const [contractorBranch, setContractorBranch] = useState('');
  const [contractorIfscCode, setContractorIfscCode] = useState('');
  const [contractorGpayNumber, setContractorGpayNumber] = useState('');
  const [contractorUpiId, setContractorUpiId] = useState('');
  const [contractorContactNumber, setContractorContactNumber] = useState('');
  const [contractorContactEmail, setContractorContactEmail] = useState('');
  const [contractorQrImage, setContractorQrImage] = useState(null);
  const [contractorQrImagePreview, setContractorQrImagePreview] = useState(null);
  const [contractorNames, setContractorNames] = useState([]);
  const [isContractorEditOpen, setIsContractorEditOpen] = useState(false);
  const [editContractorName, setEditContractorName] = useState('');
  const [editContractorAccountHolderName, setEditContractorAccountHolderName] = useState('');
  const [editContractorAccountNumber, setEditContractorAccountNumber] = useState('');
  const [editContractorBankName, setEditContractorBankName] = useState('');
  const [editContractorBranch, setEditContractorBranch] = useState('');
  const [editContractorIfscCode, setEditContractorIfscCode] = useState('');
  const [editContractorGpayNumber, setEditContractorGpayNumber] = useState('');
  const [editContractorUpiId, setEditContractorUpiId] = useState('');
  const [editContractorContactNumber, setEditContractorContactNumber] = useState('');
  const [editContractorContactEmail, setEditContractorContactEmail] = useState('');
  const [editContractorQrImage, setEditContractorQrImage] = useState(null);
  const [editContractorQrImagePreview, setEditContractorQrImagePreview] = useState(null);
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [isAccountDetailsOpen, setIsAccountDetailsOpen] = useState(false);
  const [accountDetailsSearch, setAccountDetailsSearch] = useState("");
  // State for Account Details
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [gpayNumber, setGpayNumber] = useState('');
  const [accountType, setAccountType] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [qrImagePreview, setQrImagePreview] = useState(null);
  const [isAccountDetailsEditOpen, setIsAccountDetailsEditOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [editAccountHolderName, setEditAccountHolderName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');

  // Edit mode states for all three popups
  const [isVendorEditMode, setIsVendorEditMode] = useState(false);
  const [isContractorEditMode, setIsContractorEditMode] = useState(false);
  const [isAccountEditMode, setIsAccountEditMode] = useState(false);
  const [isEmployeeEditMode, setIsEmployeeEditMode] = useState(false);

  // Copy button feedback state
  const [copiedButtonId, setCopiedButtonId] = useState(null);
  const [editBankName, setEditBankName] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editIfscCode, setEditIfscCode] = useState('');
  const [editUpiId, setEditUpiId] = useState('');
  const [editGpayNumber, setEditGpayNumber] = useState('');
  const [editAccountType, setEditAccountType] = useState('');
  const [editQrImage, setEditQrImage] = useState(null);
  const [editQrImagePreview, setEditQrImagePreview] = useState(null);

  // Store original data for reset on cancel
  const [originalVendorData, setOriginalVendorData] = useState({});
  const [originalContractorData, setOriginalContractorData] = useState({});
  const [originalAccountData, setOriginalAccountData] = useState({});
  // State for Categories
  const [isCategoryOpens, setIsCategoryOpens] = useState(false);
  const [expensesCategorySearch, setExpensesCategorySearch] = useState("");
  const [category, setCategory] = useState('');
  const [expensesCategory, setExpensesCategory] = useState([]);
  const [isCategoriesEditOpen, setIsCategoriesEditOpen] = useState(false);
  const [editCategory, setEditCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // State for Machine Tools
  const [isMachineToolsOpen, setIsMachineToolsOpen] = useState(false);
  const [machineToolsSearch, setMachineToolsSearch] = useState("");
  const [machineTool, setMachineTool] = useState('');
  const [machineToolsOptions, setMachineToolsOptions] = useState([]);
  const [isMachineToolsEditOpen, setIsMachineToolsEditOpen] = useState(false);
  const [editMachineTool, setEditMachineTool] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState(null);

  // State for Employee Details (from WeeklyPaymentAddInput)
  const [isEmployeeDataOpen, setIsEmployeeDataOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [roleOfEmployee, setRoleOfEmployee] = useState('');
  const [empAccountHolderName, setEmpAccountHolderName] = useState('');
  const [empAccountNumber, setEmpAccountNumber] = useState('');
  const [empBankName, setEmpBankName] = useState('');
  const [empIfscCode, setEmpIfscCode] = useState('');
  const [empBranch, setEmpBranch] = useState('');
  const [empUpiId, setEmpUpiId] = useState('');
  const [empGpayNumber, setEmpGpayNumber] = useState('');
  const [empContactEmail, setEmpContactEmail] = useState('');
  const [empUpiQRImage, setEmpUpiQRImage] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [aadhaarPdfFile, setAadhaarPdfFile] = useState(null);
  const [aadhaarImageUrl, setAadhaarImageUrl] = useState('');
  const [employeeList, setEmployeeList] = useState([]);
  const [isEditEmployeeDataOpen, setIsEditEmployeeDataOpen] = useState(false);
  const [selectedEmployeeDataId, setSelectedEmployeeDataId] = useState(null);
  const [editEmployeeName, setEditEmployeeName] = useState('');
  const [editEmployeeMobileNumber, setEditEmployeeMobileNumber] = useState('');
  const [editRoleOfEmployee, setEditRoleOfEmployee] = useState('');
  const [editEmpAccountHolderName, setEditEmpAccountHolderName] = useState('');
  const [editEmpAccountNumber, setEditEmpAccountNumber] = useState('');
  const [editEmpBankName, setEditEmpBankName] = useState('');
  const [editEmpIfscCode, setEditEmpIfscCode] = useState('');
  const [editEmpBranch, setEditEmpBranch] = useState('');
  const [editEmpUpiId, setEditEmpUpiId] = useState('');
  const [editEmpGpayNumber, setEditEmpGpayNumber] = useState('');
  const [editEmpContactEmail, setEditEmpContactEmail] = useState('');
  const [editEmpUpiQRImage, setEditEmpUpiQRImage] = useState(null);
  const [editEmpUpiQRImagePreview, setEditEmpUpiQRImagePreview] = useState(null);
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editAadhaarPdfFile, setEditAadhaarPdfFile] = useState(null);
  const [editAadhaarImageUrl, setEditAadhaarImageUrl] = useState('');

  // State for Labours List
  const [isLaboursListDataOpen, setIsLaboursListDataOpen] = useState(false);
  const [laboursListSearch, setLaboursListSearch] = useState('');
  const [labourName, setLabourName] = useState('');
  const [labourSalary, setLabourSalary] = useState('');
  const [laboursList, setLaboursList] = useState([]);
  const [isEditLaboursListDataOpen, setIsEditLaboursListDataOpen] = useState(false);
  const [selectedLabourDataId, setSelectedLabourDataId] = useState(null);
  const [editLabourName, setEditLabourName] = useState('');
  const [editLabourSalary, setEditLabourSalary] = useState('');

  // State for Bank Account Type
  const [isBankAccountTypeOpen, setIsBankAccountTypeOpen] = useState(false);
  const [bankAccountTypeSearch, setBankAccountTypeSearch] = useState('');
  const [bankAccountType, setBankAccountType] = useState('');
  const [bankAccountTypes, setBankAccountTypes] = useState([]);
  const [isBankAccountTypeEditOpen, setIsBankAccountTypeEditOpen] = useState(false);
  const [selectedBankAccountTypeId, setSelectedBankAccountTypeId] = useState(null);
  const [editBankAccountType, setEditBankAccountType] = useState('');

  // State for EB Service Link with Project ID
  const [isEbServiceLinkOpen, setIsEbServiceLinkOpen] = useState(false);
  const [isSupportStaffNameOpen, setIsSupportStaffNameOpen] = useState(false);
  const [ebServiceLinkSearch, setEbServiceLinkSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [doorNo, setDoorNo] = useState('');
  const [ebServiceNo, setEbServiceNo] = useState('');
  const [ebServiceLinks, setEbServiceLinks] = useState([]);
  const [isEbServiceLinkEditOpen, setIsEbServiceLinkEditOpen] = useState(false);
  const [selectedEbServiceLinkId, setSelectedEbServiceLinkId] = useState(null);
  const [editProjectId, setEditProjectId] = useState('');
  const [editSelectedProject, setEditSelectedProject] = useState(null);
  const [editDoorNo, setEditDoorNo] = useState('');
  const [editEbServiceNo, setEditEbServiceNo] = useState('');

  // State for Project Management
  const [isProjectManagementOpen, setIsProjectManagementOpen] = useState(false);
  const [projectManagementSearch, setProjectManagementSearch] = useState('');
  const [newProject, setNewProject] = useState({
    projectName: '',
    projectAddress: '',
    projectId: '',
    projectCategory: '',
    projectReferenceName: '',
    ownerDetailsList: [{
      clientName: "",
      fatherName: "",
      mobile: "",
      age: "",
      clientAddress: ""
    }],
    propertyDetailsList: [{
      projectType: "",
      floorName: "",
      shopNo: "",
      doorNo: "",
      area: "",
      ebNo: "",
      ebNoPhase: "1P",
      ebNoFrequency: "",
      propertyTaxNo: "",
      propertyTaxFrequency: "",
      waterTaxNo: "",
      waterTaxFrequency: ""
    }]
  });
  const [projects, setProjects] = useState([]);
  const projectCategoryOptions = useMemo(() => {
    const categories = new Set();
    projects.forEach(project => {
      if (project?.projectCategory) {
        categories.add(project.projectCategory);
      }
    });
    return Array.from(categories);
  }, [projects]);
  const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [editProject, setEditProject] = useState({
    projectName: '',
    projectAddress: '',
    projectId: '',
    projectCategory: '',
    projectReferenceName: '',
    ownerDetailsList: [{
      clientName: "",
      fatherName: "",
      mobile: "",
      age: "",
      clientAddress: ""
    }],
    propertyDetailsList: [{
      projectType: "",
      floorName: "",
      shopNo: "",
      doorNo: "",
      area: "",
      ebNo: "",
      ebNoPhase: "1P",
      ebNoFrequency: "",
      propertyTaxNo: "",
      propertyTaxFrequency: "",
      waterTaxNo: "",
      waterTaxFrequency: ""
    }]
  });

  const [message, setMessage] = useState('');
  // Tooltip state for Account Details hover
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipTitle, setTooltipTitle] = useState("");

  // Export functionality states
  const [isExportTypeModalOpen, setIsExportTypeModalOpen] = useState(false);
  const [isExportSelectionModalOpen, setIsExportSelectionModalOpen] = useState(false);
  const [exportType, setExportType] = useState(''); // 'pdf' or 'excel'
  const [exportDataType, setExportDataType] = useState(''); // 'vendor' or 'contractor'
  const [exportSearchTerm, setExportSearchTerm] = useState('');
  const [exportProjectCategory, setExportProjectCategory] = useState('');
  const [selectedExportItems, setSelectedExportItems] = useState([]);

  // State for Master Table functionality
  const [selectedTable, setSelectedTable] = useState(() => {
    // Load selected table from localStorage on component mount
    const savedTable = localStorage.getItem('selectedMasterTable');
    return savedTable || null;
  });

  // State for drag scrolling
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Master table data with all table headings
  const masterTableData = [
    { id: 'project-management', name: 'Project Management', description: 'Manage project details with owners and properties' },
    { id: 'vendor-names', name: 'Vendor Names', description: 'Manage vendor information' },
    { id: 'contractor-names', name: 'Contractor Names', description: 'Manage contractor information' },
    { id: 'categories', name: 'Categories', description: 'Manage expense categories' },
    { id: 'machine-tools', name: 'Machine Tools', description: 'Manage machine and tool information' },
    { id: 'employee-details', name: 'Employee Details', description: 'Manage employee information' },
    { id: 'labours-list', name: 'Labours List', description: 'Manage labour information' },
    { id: 'Account Details', name: 'Account Details', description: 'Manage account information' },
    { id: 'bank-account-type', name: 'Bank Account Type', description: 'Manage bank account types' },
    { id: 'support-staff-name', name: 'Support Staff Name', description: 'Manage Support Staff Names' }
  ];
  const [vendorQrImageFile, setVendorQrImageFile] = useState(null);
  const [vendorQrImagePreview, setVendorQrImagePreview] = useState(null);

  const handleVendorQrImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVendorQrImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setVendorQrImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to get reordered table data (selected table first, others after)
  const getReorderedTableData = () => {
    if (!selectedTable) return masterTableData;

    const selectedTableData = masterTableData.find(table => table.id === selectedTable);
    const otherTables = masterTableData.filter(table => table.id !== selectedTable);

    return [selectedTableData, ...otherTables];
  };

  // Function to handle table selection
  const handleTableSelection = (tableId) => {
    setSelectedTable(tableId);
    // Save selected table to localStorage
    localStorage.setItem('selectedMasterTable', tableId);
  };

  // Function to clear selection
  const clearSelection = () => {
    setSelectedTable(null);
    // Remove selected table from localStorage
    localStorage.removeItem('selectedMasterTable');
  };

  // Drag scrolling functions
  const interactiveDragSelectors =
    'input, textarea, button, select, a, label, [role="button"], [contenteditable="true"], .prevent-drag-scroll';

  const shouldSkipDragScroll = (target) => {
    if (!target || typeof target.closest !== 'function') return false;
    return Boolean(target.closest(interactiveDragSelectors));
  };

  const handleMouseDown = (e) => {
    if (shouldSkipDragScroll(e.target)) {
      setIsDragging(false);
      return;
    }
    setIsDragging(true);
    setStartX(e.pageX - e.currentTarget.offsetLeft);
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    e.currentTarget.scrollLeft = scrollLeft - walk;
  };

  // Touch support for mobile devices
  const handleTouchStart = (e) => {
    if (shouldSkipDragScroll(e.target)) {
      setIsDragging(false);
      return;
    }
    setIsDragging(true);
    setStartX(e.touches[0].pageX - e.currentTarget.offsetLeft);
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    e.currentTarget.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Open/Close functions
  const openSiteNames = () => {
    // Generate next site number automatically
    const generateNextSiteNumber = () => {
      if (siteNames.length === 0) {
        return '342'; // Start with 342 as requested
      }

      // Extract numbers from existing site numbers and find the highest
      const siteNumbers = siteNames
        .map(site => site.siteNo)
        .filter(siteNo => siteNo && siteNo.toString().trim() !== '')
        .map(siteNo => {
          // Try to extract numeric value from various formats
          const numericMatch = siteNo.toString().match(/\d+/);
          return numericMatch ? parseInt(numericMatch[0]) : null;
        })
        .filter(num => num !== null && !isNaN(num));

      if (siteNumbers.length === 0) {
        return '342'; // Default to 342 if no valid numbers found
      }

      const maxNumber = Math.max(...siteNumbers);
      const nextNumber = maxNumber + 1;
      return nextNumber.toString();
    };

    // Clear previous values and set new site number
    setSiteName('');
    setSiteNo(generateNextSiteNumber());
    setIsSiteNamesOpen(true);
  };

  const closeSiteNames = () => {
    // Clear form fields when closing
    setSiteName('');
    setSiteNo('');
    setIsSiteNamesOpen(false);
  };
  const openvendorNames = () => setIsVendorNameOpens(true);
  const closevendorNames = () => {
    setIsVendorNameOpens(false);
    // Clear vendor QR image when closing without submitting
    setVendorQrImage(null);
    setVendorQrImagePreview(null);
  };
  const openContractorNames = () => setContractorNameOpens(true);
  const closeContractorNames = () => {
    setContractorNameOpens(false);
    // Clear contractor QR image when closing without submitting
    setContractorQrImage(null);
    setContractorQrImagePreview(null);
  };
  const openCategory = () => setIsCategoryOpens(true);
  const closeCategory = () => setIsCategoryOpens(false);
  const openMachineTools = () => setIsMachineToolsOpen(true);
  const closeMachineTools = () => setIsMachineToolsOpen(false);
  const openEmployeeDetails = () => setIsEmployeeDataOpen(true);
  const closeEmployeeDetails = () => setIsEmployeeDataOpen(false);
  const openLabourDetails = () => setIsLaboursListDataOpen(true);
  const closeLabourDetails = () => setIsLaboursListDataOpen(false);
  const openAccountDetails = () => setIsAccountDetailsOpen(true);
  const closeAccountDetails = () => {
    setIsAccountDetailsOpen(false);
    // Clear QR image when closing without submitting
    setQrImage(null);
    setQrImagePreview(null);
  };
  const openBankAccountType = () => setIsBankAccountTypeOpen(true);
  const closeBankAccountType = () => setIsBankAccountTypeOpen(false);
  const openEbServiceLink = () => setIsEbServiceLinkOpen(true);
  const closeEbServiceLink = () => setIsEbServiceLinkOpen(false);
  const openSupportStaffName = () => setIsSupportStaffNameOpen(true);
  const closeSupportStaffName = () => setIsSupportStaffNameOpen(false);
  const openProjectManagement = () => {
    // Generate next project ID
    const generateNextProjectId = () => {
      if (projects.length === 0) {
        return '1'; // Start with 1 if no projects exist
      }

      // Extract numbers from existing project IDs and find the highest
      const projectIds = projects
        .map(project => project.projectId)
        .filter(projectId => projectId && projectId.toString().trim() !== '')
        .map(projectId => {
          // Try to extract numeric value from various formats
          const numericMatch = projectId.toString().match(/\d+/);
          return numericMatch ? parseInt(numericMatch[0]) : null;
        })
        .filter(num => num !== null && !isNaN(num));

      if (projectIds.length === 0) {
        return '1'; // Default to 1 if no valid numbers found
      }

      const maxNumber = Math.max(...projectIds);
      const nextNumber = maxNumber + 1;
      return nextNumber.toString();
    };

    // Set the auto-generated project ID
    const nextProjectId = generateNextProjectId();
    setNewProject(prev => ({
      ...prev,
      projectId: nextProjectId
    }));

    setIsProjectManagementOpen(true);
  };
  const closeProjectManagement = () => {
    setIsProjectManagementOpen(false);
    // Reset form data with default sets
    setNewProject({
      projectName: '',
      projectAddress: '',
      projectId: '',
      projectCategory: '',
      projectReferenceName: '',
      ownerDetailsList: [{
        clientName: "",
        fatherName: "",
        mobile: "",
        age: "",
        clientAddress: ""
      }],
      propertyDetailsList: [{
        projectType: "",
        floorName: "",
        shopNo: "",
        doorNo: "",
        area: "",
        ebNo: "",
        ebNoPhase: "1P",
        ebNoFrequency: "",
        propertyTaxNo: "",
        propertyTaxFrequency: "",
        waterTaxNo: "",
        waterTaxFrequency: ""
      }]
    });
  };
  // Fetch functions
  useEffect(() => {
    fetchSiteNames();
    fetchVendorNames();
    fetchContractorNames();
    fetchCategories();
    fetchMachinTools();
    fetchEmployeeList();
    fetchLaboursList();
    fetchAccountDetails();
    fetchBankAccountTypes();
    fetchEbServiceLinks();
    fetchSupportStaffNameList();
    fetchProjects();
  }, []);

  const fetchSiteNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        setSiteNames(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const fetchVendorNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        setVendorNames(data);
      } else {
        console.error('Failed to fetch vendor names:', response.status);
      }
    } catch (error) {
      console.error('Error fetching vendor names:', error);
    }
  };

  const fetchContractorNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/contractor_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        setContractorNames(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/expenses_categories/getAll');
      if (response.ok) {
        const data = await response.json();
        setExpensesCategory(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const fetchMachinTools = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/machine_tools/getAll');
      if (response.ok) {
        const data = await response.json();
        setMachineToolsOptions(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const fetchEmployeeList = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll');
      if (response.ok) {
        const data = await response.json();
        setEmployeeList(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const fetchLaboursList = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/labours-details/getAll');
      if (response.ok) {
        const data = await response.json();
        setLaboursList(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const fetchAccountDetails = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/account-details/getAll');
      if (response.ok) {
        const data = await response.json();
        setAccountDetails(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const fetchBankAccountTypes = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/bank_type/getAll');
      if (response.ok) {
        const data = await response.json();
        setBankAccountTypes(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const fetchEbServiceLinks = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/eb-service-no/getAll');
      if (response.ok) {
        const data = await response.json();
        setEbServiceLinks(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const fetchSupportStaffNameList = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/support_staff/getAll');
      if (response.ok) {
        const data = await response.json();
        setSupportStaffNameList(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const fetchProjects = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/getAll');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Project Management Handler Functions
  const handleNewOwnerChange = (index, field, value) => {
    const updatedOwners = [...newProject.ownerDetailsList];
    updatedOwners[index][field] = value;
    setNewProject((prev) => ({ ...prev, ownerDetailsList: updatedOwners }));
  };

  const sortPropertyDetailsByShopNo = (details = []) => {
    const parseShopNo = (shopNo = '') => {
      const trimmed = shopNo.trim().toUpperCase();
      const sanitized = trimmed.replace(/[\s-]+/g, '');
      if (!trimmed) {
        return { isEmpty: true, prefix: '', number: Number.MAX_SAFE_INTEGER, remainder: '' };
      }

      const alphaNumericMatch = sanitized.match(/^([A-Z]+)(\d+)/);
      if (alphaNumericMatch) {
        const [, prefix, numberPart] = alphaNumericMatch;
        return {
          isEmpty: false,
          prefix,
          number: parseInt(numberPart, 10),
          remainder: sanitized.slice(alphaNumericMatch[0].length),
        };
      }

      const numericMatch = sanitized.match(/^(\d+)/);
      if (numericMatch) {
        return {
          isEmpty: false,
          prefix: '',
          number: parseInt(numericMatch[1], 10),
          remainder: sanitized.slice(numericMatch[1].length),
        };
      }

      return { isEmpty: false, prefix: sanitized || trimmed, number: Number.MAX_SAFE_INTEGER, remainder: '' };
    };

    return [...details].sort((a, b) => {
      const shopA = parseShopNo(a.shopNo);
      const shopB = parseShopNo(b.shopNo);

      if (shopA.isEmpty !== shopB.isEmpty) {
        return shopA.isEmpty ? 1 : -1;
      }
      if (shopA.prefix !== shopB.prefix) {
        return shopA.prefix.localeCompare(shopB.prefix);
      }
      if (shopA.number !== shopB.number) {
        return shopA.number - shopB.number;
      }
      return shopA.remainder.localeCompare(shopB.remainder);
    });
  };

  const handleNewDetailChange = (index, field, value) => {
    const updatedDetails = [...newProject.propertyDetailsList];
    updatedDetails[index][field] = value;
    setNewProject((prev) => ({ ...prev, propertyDetailsList: updatedDetails }));
  };

  const addNewOwner = () => {
    setNewProject((prev) => ({
      ...prev,
      ownerDetailsList: [...prev.ownerDetailsList, {
        clientName: "",
        fatherName: "",
        mobile: "",
        age: "",
        clientAddress: ""
      }]
    }));
  };

  const addNewPropertyDetail = () => {
    setNewProject((prev) => ({
      ...prev,
      propertyDetailsList: [...prev.propertyDetailsList, {
        projectType: "",
        floorName: "",
        shopNo: "",
        doorNo: "",
        area: "",
        ebNo: "",
        ebNoFrequency: "",
        propertyTaxNo: "",
        propertyTaxFrequency: "",
        waterTaxNo: "",
        waterTaxFrequency: ""
      }]
    }));
  };

  // Edit form handler functions
  const handleEditOwnerChange = (index, field, value) => {
    const updatedOwners = [...editProject.ownerDetailsList];
    updatedOwners[index][field] = value;
    setEditProject((prev) => ({ ...prev, ownerDetailsList: updatedOwners }));
  };

  const handleEditDetailChange = (index, field, value) => {
    const updatedDetails = [...editProject.propertyDetailsList];
    updatedDetails[index][field] = value;
    setEditProject((prev) => ({ ...prev, propertyDetailsList: updatedDetails }));
  };

  const addEditOwner = () => {
    setEditProject((prev) => ({
      ...prev,
      ownerDetailsList: [...prev.ownerDetailsList, {
        clientName: "",
        fatherName: "",
        mobile: "",
        age: "",
        clientAddress: ""
      }]
    }));
  };

  const addEditPropertyDetail = () => {
    setEditProject((prev) => ({
      ...prev,
      propertyDetailsList: [...prev.propertyDetailsList, {
        projectType: "",
        floorName: "",
        shopNo: "",
        doorNo: "",
        area: "",
        ebNo: "",
        ebNoFrequency: "",
        propertyTaxNo: "",
        propertyTaxFrequency: "",
        waterTaxNo: "",
        waterTaxFrequency: ""
      }]
    }));
  };

  // Submit functions
  const handleSubmitSiteNames = async (e) => {
    e.preventDefault();
    const newSiteNames = { siteName, siteNo };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSiteNames),
      });
      if (response.ok) {
        setMessage('Site name saved successfully!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmitVendorName = async (e) => {
    e.preventDefault(); // prevent page reload
    try {
      // Create a vendor object to match backend @JsonProperty annotations
      const vendorData = {
        vendorName: vendorName,
        account_holder_name: vendorAccountHolderName,
        account_number: vendorAccountNumber,
        bank_name: vendorBankName,
        ifsc_code: vendorIfscCode,
        branch: vendorBranch,
        gpay_number: vendorGpayNumber,
        upi_id: vendorUpiId,
        contact_number: vendorContactNumber,
        contact_email: vendorContactEmail
      };
      // Create FormData object
      const formData = new FormData();
      // Create a blob for the vendor data
      const vendorBlob = new Blob([JSON.stringify(vendorData)], { type: 'application/json' });
      formData.append("vendor", vendorBlob);
      if (vendorQrImageFile) {
        formData.append("file", vendorQrImageFile);
      }
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/save", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        const errorText = await response.text();
        setMessage(`Error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to save vendor: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      setMessage("Vendor saved successfully!");
      window.location.reload();
      // Reset form fields or close modal
      setVendorName("");
      setVendorAccountHolderName("");
      setVendorAccountNumber("");
      setVendorBankName("");
      setVendorIfscCode("");
      setVendorBranch("");
      setVendorGpayNumber("");
      setVendorUpiId("");
      setVendorContactNumber("");
      setVendorContactEmail("");
      setVendorQrImageFile(null);
      setVendorQrImagePreview(null);
      closevendorNames();
    } catch (error) {
      console.error("Error saving vendor:", error);
      setMessage(`Error: ${error.message}`);
    }
  };
  const handleSubmitContractorName = async (e) => {
    e.preventDefault();
    // Create FormData for multipart/form-data submission
    const formData = new FormData();
    // Create contractor object with correct JSON property names
    const contractorData = {
      contractorName,
      account_holder_name: contractorAccountHolderName,
      account_number: contractorAccountNumber,
      bank_name: contractorBankName,
      branch: contractorBranch,
      ifsc_code: contractorIfscCode,
      gpay_number: contractorGpayNumber,
      upi_id: contractorUpiId,
      contact_number: contractorContactNumber,
      contact_email: contractorContactEmail
    };
    // Create a blob for the contractor data (like vendor implementation)
    const contractorBlob = new Blob([JSON.stringify(contractorData)], { type: 'application/json' });
    formData.append('contractor', contractorBlob);
    // Add file if selected
    if (contractorQrImage) {
      formData.append('file', contractorQrImage);
    }
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/contractor_Names/save', {
        method: 'POST',
        body: formData, // No Content-Type header needed, browser sets it automatically for FormData
      });
      if (response.ok) {
        setMessage('Contractor name saved successfully!');
        setContractorName('');
        setContractorAccountHolderName('');
        setContractorAccountNumber('');
        setContractorBankName('');
        setContractorBranch('');
        setContractorIfscCode('');
        setContractorGpayNumber('');
        setContractorUpiId('');
        setContractorContactNumber('');
        setContractorContactEmail('');
        setContractorQrImage(null);
        setContractorQrImagePreview(null);
        closeContractorNames();
        fetchContractorNames(); // Refresh the list
        window.location.reload();
      } else {
        const errorData = await response.text();
        setMessage('Error saving contractor: ' + errorData);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving contractor: ' + error.message);
    }
  };
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    const newCategory = { category };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/expenses_categories/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      if (response.ok) {
        setMessage('Category saved successfully!');
        setCategory('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleSubmitMachineTools = async (e) => {
    e.preventDefault();
    const newMachineTool = { machineTool };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/machine_tools/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMachineTool),
      });
      if (response.ok) {
        setMessage('Machine tool saved successfully!');
        setMachineTool('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  // Function to upload Aadhaar PDF to Google Drive
  const uploadAadhaarPdfToGoogleDrive = async (file, employeeName) => {
    try {
      console.log('Starting Aadhaar PDF upload for:', employeeName);
      console.log('File details:', file);

      const formData = new FormData();
      const finalName = `${employeeName}_Aadhaar_${new Date().toISOString().split('T')[0]}`;
      formData.append('file', file);
      formData.append('file_name', finalName);

      console.log('Uploading with filename:', finalName);

      const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
        method: "POST",
        body: formData,
      });

      console.log('Upload response status:', uploadResponse.status);
      console.log('Upload response ok:', uploadResponse.ok);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed with response:', errorText);
        throw new Error(`File upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);

      // Check different possible response structures
      const url = uploadResult.url || uploadResult.data?.url || uploadResult.fileUrl || uploadResult.downloadUrl;
      console.log('Extracted URL:', url);

      return url;
    } catch (error) {
      console.error('Error during Aadhaar PDF upload:', error);
      throw error;
    }
  };

  const handleSubmitEmployeeData = async (e) => {
    e.preventDefault();

    // Handle Aadhaar PDF upload first
    let aadhaarUrl = '';

    if (aadhaarPdfFile) {
      try {
        aadhaarUrl = await uploadAadhaarPdfToGoogleDrive(aadhaarPdfFile, employeeName);
        if (!aadhaarUrl) {
          throw new Error('Upload completed but no URL returned');
        }
      } catch (error) {
        console.error('Error uploading Aadhaar PDF:', error);
        alert('Error uploading Aadhaar PDF. Please try again.');
        return;
      }
    } else {
      console.log('No Aadhaar PDF file selected');
    }

    // Prepare employee data with Aadhaar URL
    const formData = new FormData();
    const employeeDetails = {
      employee_name: employeeName,
      employee_id: employeeId,
      employee_mobile_number: mobileNumber,
      role_of_employee: roleOfEmployee,
      account_holder_name: empAccountHolderName,
      account_number: empAccountNumber,
      bank_name: empBankName,
      ifsc_code: empIfscCode,
      branch: empBranch,
      upi_id: empUpiId,
      gpay_number: empGpayNumber,
      contact_email: empContactEmail,
      aadhaar_image_url: aadhaarUrl
    };

    console.log('Saving employee with data:', employeeDetails);

    // Create a blob for the employee data (like vendor implementation)
    const employeeBlob = new Blob([JSON.stringify(employeeDetails)], { type: 'application/json' });
    formData.append('employeeDetails', employeeBlob);

    if (empUpiQRImage) {
      formData.append('upi_qr_image', empUpiQRImage);
    }

    try {
      console.log('Sending save request to backend...');
      const response = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/save', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        console.log('Employee data saved successfully!');
        setMessage('Employee Details saved successfully!');
        // Reset all form fields
        setEmployeeName('');
        setMobileNumber('');
        setRoleOfEmployee('');
        setEmpAccountHolderName('');
        setEmpAccountNumber('');
        setEmpBankName('');
        setEmpIfscCode('');
        setEmpBranch('');
        setEmpUpiId('');
        setEmpGpayNumber('');
        setEmpContactEmail('');
        setEmpUpiQRImage(null);
        setEmployeeId('');
        setAadhaarPdfFile(null);
        setAadhaarImageUrl('');
        window.location.reload();
      } else {
        console.error('Save request failed:', response.status, response.statusText);
        alert('Failed to save employee data. Please try again.');
      }
    } catch (error) {
      console.error('Error saving employee data:', error);
      alert('Error saving employee data. Please try again.');
    }
  };
  const handleSubmitLaboursData = async (e) => {
    e.preventDefault();
    const newLaboursList = { labour_name: labourName, labour_salary: labourSalary };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/labours-details/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLaboursList),
      });
      if (response.ok) {
        setMessage('Labour details saved successfully!');
        setLabourName('');
        setLabourSalary('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleSubmitAccountDetails = async (e) => {
    e.preventDefault();
    // Convert Base64 to proper format for backend
    let qrImageBase64 = null;
    if (qrImagePreview) {
      // Remove data URL prefix if present and keep only Base64 data
      qrImageBase64 = qrImagePreview.includes(',') ? qrImagePreview.split(',')[1] : qrImagePreview;
    }
    const newAccountDetails = {
      account_holder_name: accountHolderName,
      account_number: accountNumber,
      bank_name: bankName,
      branch: branch,
      ifsc_code: ifscCode,
      upi_id: upiId,
      gpay_number: gpayNumber,
      account_type: accountType,
      upi_qr_image: qrImageBase64
    };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/account-details/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccountDetails),
      });
      if (response.ok) {
        setMessage('Account details saved successfully!');
        setAccountHolderName('');
        setAccountNumber('');
        setBankName('');
        setBranch('');
        setIfscCode('');
        setUpiId('');
        setGpayNumber('');
        setAccountType('');
        setQrImage(null);
        setQrImagePreview(null);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleSubmitBankAccountType = async (e) => {
    e.preventDefault();
    const newBankAccountType = { bank_account_type: bankAccountType };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/bank_type/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBankAccountType),
      });
      if (response.ok) {
        setMessage('Bank Account Type saved successfully!');
        setBankAccountType('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmitEbServiceLink = async (e) => {
    e.preventDefault();
    const newEbServiceLink = {
      project_id: parseInt(selectedProject?.value),
      door_no: doorNo,
      eb_service_no: ebServiceNo
    };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/eb-service-no/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEbServiceLink),
      });
      if (response.ok) {
        setMessage('EB Service Link saved successfully!');
        setSelectedProject(null);
        setDoorNo('');
        setEbServiceNo('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleSubmitSupportStaffName = async (e) => {
    e.preventDefault();
    const newSupportStaffName = {
      support_staff_name: supportStaffName,
      mobile_number: supportStaffMobileNumber
    };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/support_staff/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupportStaffName),
      });
      if (response.ok) {
        setMessage('Support Staff Name saved successfully!');
        setSupportStaffName('');
        setSupportStaffMobileNumber('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();

    try {
      // Map frontend state to backend field names
      const payload = {
        projectName: newProject.projectName,
        projectAddress: newProject.projectAddress,
        projectId: newProject.projectId,
        projectCategory: newProject.projectCategory,
        projectReferenceName: newProject.projectReferenceName,
        ownerDetails: newProject.ownerDetailsList,      // map to backend
        propertyDetails: newProject.propertyDetailsList // map to backend
      };

      const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Sync with Project Names API
        try {
          // Check if a Project Names record exists with the same projectId (as siteNo)
          const existingSiteName = siteNames.find(site => site.siteNo === newProject.projectId.toString());

          const siteNamePayload = {
            siteName: newProject.projectName,
            siteNo: newProject.projectId
          };

          if (existingSiteName) {
            // Update existing Project Names record
            const siteNameResponse = await fetch(`https://backendaab.in/aabuilderDash/api/project_Names/edit/${existingSiteName.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(siteNamePayload),
            });

            if (siteNameResponse.ok) {
              fetchSiteNames(); // Refresh site names list
            }
          } else {
            // Create new Project Names record
            const siteNameResponse = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(siteNamePayload),
            });

            if (siteNameResponse.ok) {
              fetchSiteNames(); // Refresh site names list
            }
          }
        } catch (syncError) {
          console.error('Error syncing with Project Names:', syncError);
          // Don't fail the main operation if sync fails
        }

        setMessage('Project saved successfully!');
        closeProjectManagement();
        fetchProjects();
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setMessage('Failed to save project.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error occurred while saving project.');
    }
  };
  // Edit handler functions
  const handleEditSiteName = (item) => {
    setSelectedSiteId(item.id);
    setEditSiteName(item.siteName);
    setEditSiteNo(item.siteNo);
    setIsEditSiteNameOpen(true);
  };
  const handleEditVendorName = (item) => {
    setSelectedVendorId(item.id);
    setEditVendorName(item.vendorName);
    setEditVendorAccountHolderName(item.account_holder_name || '');
    setEditVendorAccountNumber(item.account_number || '');
    setEditVendorBankName(item.bank_name || '');
    setEditVendorBranch(item.branch || '');
    setEditVendorIfscCode(item.ifsc_code || '');
    setEditVendorGpayNumber(item.gpay_number || '');
    setEditVendorUpiId(item.upi_id || '');
    setEditVendorContactNumber(item.contact_number || '');
    setEditVendorContactEmail(item.contact_email || '');
    // Handle QR image from backend byte array
    let qrImagePreview = null;
    if (item.upi_qr_image) {
      let qrImageData = item.upi_qr_image;
      qrImageData = qrImageData.replace(/\s/g, '');
      if (!qrImageData.startsWith('data:')) {
        if (qrImageData.startsWith('/9j/') || qrImageData.startsWith('/9j4')) {
          qrImageData = `data:image/jpeg;base64,${qrImageData}`;
        } else if (qrImageData.startsWith('iVBORw0KGgo')) {
          qrImageData = `data:image/png;base64,${qrImageData}`;
        } else {
          // Default to JPEG
          qrImageData = `data:image/jpeg;base64,${qrImageData}`;
        }
      }
      qrImagePreview = qrImageData;
      setEditVendorQrImagePreview(qrImageData);
    } else {
      setEditVendorQrImagePreview(null);
    }
    // Store original data for reset on cancel
    setOriginalVendorData({
      vendorName: item.vendorName,
      accountHolderName: item.account_holder_name || '',
      accountNumber: item.account_number || '',
      bankName: item.bank_name || '',
      branch: item.branch || '',
      ifscCode: item.ifsc_code || '',
      gpayNumber: item.gpay_number || '',
      upiId: item.upi_id || '',
      contactNumber: item.contact_number || '',
      contactEmail: item.contact_email || '',
      qrImagePreview: qrImagePreview
    });
    setIsVendorEditOpen(true);
  };
  const handleEditContractorName = (item) => {
    setSelectedContractorId(item.id);
    setEditContractorName(item.contractorName);
    setEditContractorAccountHolderName(item.account_holder_name || '');
    setEditContractorAccountNumber(item.account_number || '');
    setEditContractorBankName(item.bank_name || '');
    setEditContractorBranch(item.branch || '');
    setEditContractorIfscCode(item.ifsc_code || '');
    setEditContractorGpayNumber(item.gpay_number || '');
    setEditContractorUpiId(item.upi_id || '');
    setEditContractorContactNumber(item.contact_number || '');
    setEditContractorContactEmail(item.contact_email || '');
    // Handle QR image from backend (like vendor implementation)
    let qrImagePreview = null;
    if (item.upi_qr_image) {
      let qrImageData = item.upi_qr_image;
      qrImageData = qrImageData.replace(/\s/g, '');
      if (!qrImageData.startsWith('data:')) {
        if (qrImageData.startsWith('/9j/') || qrImageData.startsWith('/9j4')) {
          qrImageData = `data:image/jpeg;base64,${qrImageData}`;
        } else if (qrImageData.startsWith('iVBORw0KGgo')) {
          qrImageData = `data:image/png;base64,${qrImageData}`;
        } else {
          // Default to JPEG
          qrImageData = `data:image/jpeg;base64,${qrImageData}`;
        }
      }
      qrImagePreview = qrImageData;
      setEditContractorQrImagePreview(qrImageData);
    } else {
      setEditContractorQrImagePreview(null);
    }
    // Store original data for reset on cancel
    setOriginalContractorData({
      contractorName: item.contractorName,
      accountHolderName: item.account_holder_name || '',
      accountNumber: item.account_number || '',
      bankName: item.bank_name || '',
      branch: item.branch || '',
      ifscCode: item.ifsc_code || '',
      gpayNumber: item.gpay_number || '',
      upiId: item.upi_id || '',
      contactNumber: item.contact_number || '',
      contactEmail: item.contact_email || '',
      qrImagePreview: qrImagePreview
    });
    setIsContractorEditOpen(true);
  };
  const handleEditCategory = (item) => {
    setSelectedCategoryId(item.id);
    setEditCategory(item.category);
    setIsCategoriesEditOpen(true);
  };
  const handleEditMachineTool = (item) => {
    setSelectedMachineId(item.id);
    setEditMachineTool(item.machineTool);
    setIsMachineToolsEditOpen(true);
  };
  const handleEditEmployeeData = (item) => {
    setSelectedEmployeeDataId(item.id);
    setEditEmployeeName(item.employee_name);
    setEditEmployeeId(item.employee_id || '');
    setEditEmployeeMobileNumber(item.employee_mobile_number);
    setEditRoleOfEmployee(item.role_of_employee);
    setEditEmpAccountHolderName(item.account_holder_name || '');
    setEditEmpAccountNumber(item.account_number || '');
    setEditEmpBankName(item.bank_name || '');
    setEditEmpIfscCode(item.ifsc_code || '');
    setEditEmpBranch(item.branch || '');
    setEditEmpUpiId(item.upi_id || '');
    setEditEmpGpayNumber(item.gpay_number || '');
    setEditEmpContactEmail(item.contact_email || '');
    setEditAadhaarImageUrl(item.aadhaar_image_url || '');
    setEditAadhaarPdfFile(null);

    // Handle QR image from backend byte array (like vendor implementation)
    let qrImagePreview = null;
    if (item.upi_qr_image) {
      let qrImageData = item.upi_qr_image;
      qrImageData = qrImageData.replace(/\s/g, '');
      if (!qrImageData.startsWith('data:')) {
        if (qrImageData.startsWith('/9j/') || qrImageData.startsWith('/9j4')) {
          qrImageData = `data:image/jpeg;base64,${qrImageData}`;
        } else if (qrImageData.startsWith('iVBORw0KGgo')) {
          qrImageData = `data:image/png;base64,${qrImageData}`;
        } else {
          // Default to JPEG
          qrImageData = `data:image/jpeg;base64,${qrImageData}`;
        }
      }
      qrImagePreview = qrImageData;
    }
    setEditEmpUpiQRImagePreview(qrImagePreview);
    setEditEmpUpiQRImage(null);
    setIsEmployeeEditMode(false); // Default to locked mode
    setIsEditEmployeeDataOpen(true);
  };
  const handleEditLabourData = (item) => {
    setSelectedLabourDataId(item.id);
    setEditLabourName(item.labour_name);
    setEditLabourSalary(item.labour_salary);
    setIsEditLaboursListDataOpen(true);
  };
  const handleEditAccountDetails = (item) => {
    setSelectedAccountId(item.id);
    setEditAccountHolderName(item.account_holder_name);
    setEditAccountNumber(item.account_number);
    setEditBankName(item.bank_name);
    setEditBranch(item.branch);
    setEditIfscCode(item.ifsc_code);
    setEditUpiId(item.upi_id || '');
    setEditGpayNumber(item.gpay_number || '');
    setEditAccountType(item.account_type || '');
    let qrImagePreview = null;
    if (item.upi_qr_image) {
      let qrImageData = item.upi_qr_image;
      qrImageData = qrImageData.replace(/\s/g, '');
      if (!qrImageData.startsWith('data:')) {
        if (qrImageData.startsWith('/9j/') || qrImageData.startsWith('/9j4')) {
          qrImageData = `data:image/jpeg;base64,${qrImageData}`;
        } else if (qrImageData.startsWith('iVBORw0KGgo')) {
          qrImageData = `data:image/png;base64,${qrImageData}`;
        } else {
          qrImageData = `data:image/jpeg;base64,${qrImageData}`;
        }
      }
      qrImagePreview = qrImageData;
      setEditQrImagePreview(qrImageData);
    } else {
      setEditQrImagePreview(null);
    }
    setOriginalAccountData({
      accountHolderName: item.account_holder_name,
      accountNumber: item.account_number,
      bankName: item.bank_name,
      branch: item.branch,
      ifscCode: item.ifsc_code,
      upiId: item.upi_id || '',
      gpayNumber: item.gpay_number || '',
      accountType: item.account_type || '',
      qrImagePreview: qrImagePreview
    });
    setIsAccountDetailsEditOpen(true);
  };
  const handleEditBankAccountType = (item) => {
    setSelectedBankAccountTypeId(item.id);
    setEditBankAccountType(item.bank_account_type);
    setIsBankAccountTypeEditOpen(true);
  };
  const handleEditSupportStaffName = (item) => {
    setSelectedSupportStaffNameId(item.id);
    setEditSupportStaffName(item.support_staff_name);
    setEditSupportStaffMobileNumber(item.mobile_number || '');
    setIsSupportStaffNameEditOpen(true);
  };
  const handleEditEbServiceLink = (item) => {
    setSelectedEbServiceLinkId(item.id);
    setEditProjectId(item.project_id?.toString() || '');
    const project = siteNames.find(site => site.siteNo === item.project_id.toString());
    setEditSelectedProject(project ? { value: project.siteNo, label: project.siteName } : null);
    setEditDoorNo(item.door_no || '');
    setEditEbServiceNo(item.eb_service_no || '');
    setIsEbServiceLinkEditOpen(true);
  };
  const handleEditProject = (item) => {
    setSelectedProjectId(item.id);
    setEditProject({
      projectName: item.projectName || '',
      projectAddress: item.projectAddress || '',
      projectId: item.projectId || '',
      projectCategory: item.projectCategory || '',
      projectReferenceName: item.projectReferenceName || '',
      ownerDetailsList: item.ownerDetails && item.ownerDetails.length > 0 ? item.ownerDetails : [{
        clientName: "",
        fatherName: "",
        mobile: "",
        age: "",
        clientAddress: ""
      }],
      propertyDetailsList: sortPropertyDetailsByShopNo(
        item.propertyDetails && item.propertyDetails.length > 0
          ? item.propertyDetails.map(detail => ({
            ...detail,
            ebNoPhase: detail.ebNoPhase || "1P"
          }))
          : [
            {
              projectType: "",
              floorName: "",
              shopNo: "",
              doorNo: "",
              area: "",
              ebNo: "",
              ebNoPhase: "1P",
              ebNoFrequency: "",
              propertyTaxNo: "",
              propertyTaxFrequency: "",
              waterTaxNo: "",
              waterTaxFrequency: ""
            }
          ]
      )
    });
    setIsProjectEditOpen(true);
  };
  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const projectToDelete = projects.find(project => project.id === id);
        const response = await fetch(`https://backendaab.in/aabuilderDash/api/projects/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          if (projectToDelete) {
            try {
              const existingSiteNameBySiteNo = siteNames.find(site => site.siteNo === projectToDelete.projectId?.toString());
              const existingSiteNameById = siteNames.find(site => site.id === id);
              const existingSiteName = existingSiteNameById || existingSiteNameBySiteNo;
              if (existingSiteName) {
                const siteNameResponse = await fetch(`https://backendaab.in/aabuilderDash/api/project_Names/delete/${existingSiteName.id}`, {
                  method: 'DELETE',
                });
                if (siteNameResponse.ok) {
                  fetchSiteNames(); // Refresh site names list
                }
              }
            } catch (syncError) {
              console.error('Error syncing delete with Project Names:', syncError);
            }
          }
          setMessage('Project deleted successfully!');
          fetchProjects();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleSubmitEditProject = async (e) => {
    e.preventDefault();
    try {
      // Sort property details only on submit
      const sortedPropertyDetails = sortPropertyDetailsByShopNo(editProject.propertyDetailsList);
      const payload = {
        projectName: editProject.projectName,
        projectAddress: editProject.projectAddress,
        projectId: editProject.projectId,
        projectCategory: editProject.projectCategory,
        projectReferenceName: editProject.projectReferenceName,
        ownerDetails: editProject.ownerDetailsList,       // mapped for backend
        propertyDetails: sortedPropertyDetails  // mapped for backend - sorted before submit
      };
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/projects/edit/${selectedProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        try {
          const existingSiteNameBySiteNo = siteNames.find(site => site.siteNo === editProject.projectId.toString());
          const existingSiteNameById = siteNames.find(site => site.id === selectedProjectId);
          const existingSiteName = existingSiteNameById || existingSiteNameBySiteNo;
          const siteNamePayload = {
            siteName: editProject.projectName,
            siteNo: editProject.projectId
          };
          if (existingSiteName) {
            const siteNameResponse = await fetch(`https://backendaab.in/aabuilderDash/api/project_Names/edit/${existingSiteName.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(siteNamePayload),
            });
            if (siteNameResponse.ok) {
              fetchSiteNames(); // Refresh site names list
            }
          } else {
            const siteNameResponse = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(siteNamePayload),
            });
            if (siteNameResponse.ok) {
              fetchSiteNames(); // Refresh site names list
            }
          }
        } catch (syncError) {
          console.error('Error syncing with Project Names:', syncError);
        }
        setMessage('Project updated successfully!');
        setIsProjectEditOpen(false);
        fetchProjects();
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setMessage('Failed to update project.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error occurred while updating project.');
    }
  };
  const resetVendorData = () => {
    if (originalVendorData) {
      setEditVendorName(originalVendorData.vendorName || '');
      setEditVendorAccountHolderName(originalVendorData.accountHolderName || '');
      setEditVendorAccountNumber(originalVendorData.accountNumber || '');
      setEditVendorBankName(originalVendorData.bankName || '');
      setEditVendorBranch(originalVendorData.branch || '');
      setEditVendorIfscCode(originalVendorData.ifscCode || '');
      setEditVendorGpayNumber(originalVendorData.gpayNumber || '');
      setEditVendorUpiId(originalVendorData.upiId || '');
      setEditVendorContactNumber(originalVendorData.contactNumber || '');
      setEditVendorContactEmail(originalVendorData.contactEmail || '');
      setEditVendorQrImagePreview(originalVendorData.qrImagePreview || null);
      setEditVendorQrImage(null);
    }
    setIsVendorEditMode(false);
    setIsVendorEditOpen(false);
  };
  const resetContractorData = () => {
    if (originalContractorData) {
      setEditContractorName(originalContractorData.contractorName || '');
      setEditContractorAccountHolderName(originalContractorData.accountHolderName || '');
      setEditContractorAccountNumber(originalContractorData.accountNumber || '');
      setEditContractorBankName(originalContractorData.bankName || '');
      setEditContractorBranch(originalContractorData.branch || '');
      setEditContractorIfscCode(originalContractorData.ifscCode || '');
      setEditContractorGpayNumber(originalContractorData.gpayNumber || '');
      setEditContractorUpiId(originalContractorData.upiId || '');
      setEditContractorContactNumber(originalContractorData.contactNumber || '');
      setEditContractorContactEmail(originalContractorData.contactEmail || '');
      setEditContractorQrImagePreview(originalContractorData.qrImagePreview || null);
      setEditContractorQrImage(null);
    }
    setIsContractorEditMode(false);
    setIsContractorEditOpen(false);
  };
  const resetAccountData = () => {
    if (originalAccountData) {
      setEditAccountHolderName(originalAccountData.accountHolderName || '');
      setEditAccountNumber(originalAccountData.accountNumber || '');
      setEditBankName(originalAccountData.bankName || '');
      setEditBranch(originalAccountData.branch || '');
      setEditIfscCode(originalAccountData.ifscCode || '');
      setEditUpiId(originalAccountData.upiId || '');
      setEditGpayNumber(originalAccountData.gpayNumber || '');
      setEditAccountType(originalAccountData.accountType || '');
      setEditQrImagePreview(originalAccountData.qrImagePreview || null);
      setEditQrImage(null);
    }
    setIsAccountEditMode(false);
    setIsAccountDetailsEditOpen(false);
  };
  const resetEmployeeData = () => {
    setIsEmployeeEditMode(false);
    setIsEditEmployeeDataOpen(false);
  };
  // Delete handler functions
  const handleDeleteSiteName = async (id) => {
    if (window.confirm('Are you sure you want to delete this site name?')) {
      try {
        const response = await fetch(`https://backendaab.in/aabuilderDash/api/project_Names/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessage('Site name deleted successfully!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const handleDeleteVendorName = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor name?')) {
      try {
        const response = await fetch(`https://backendaab.in/aabuilderDash/api/vendor_Names/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessage('Vendor name deleted successfully!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const handleDeleteAllVendorNames = async () => {
    if (window.confirm('Are you sure you want to delete ALL vendor names? This action cannot be undone.')) {
      try {
        const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/deleteAll', {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessage('All vendor names deleted successfully!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const handleVendorBulkUpload = async (e) => {
    e.preventDefault();
    if (!vendorBulkUploadFile) {
      setMessage('Please select a SQL file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('file', vendorBulkUploadFile);
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/bulk_upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.text();
      if (response.ok) {
        setMessage(result);
        setVendorBulkUploadFile(null);
        setIsVendorBulkUploadOpen(false);
        window.location.reload();
      } else {
        setMessage(`Upload failed: ${result}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Upload failed: ' + error.message);
    }
  };
  const handleVendorBulkUploadFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.sql')) {
      setVendorBulkUploadFile(file);
    } else {
      setMessage('Please select a valid SQL file');
      setVendorBulkUploadFile(null);
    }
  };

  // General bulk upload handler for all table types
  const handleBulkUpload = async (e, tableType) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    let apiEndpoint = '';
    let refreshFunction = null;

    switch (tableType) {
      case 'siteNames':
        apiEndpoint = 'https://backendaab.in/aabuilderDash/api/project_Names/bulkUpload';
        refreshFunction = fetchSiteNames;
        break;
      case 'vendorNames':
        apiEndpoint = 'https://backendaab.in/aabuilderDash/api/vendor_Names/bulkUpload';
        refreshFunction = fetchVendorNames;
        break;
      case 'contractorNames':
        apiEndpoint = 'https://backendaab.in/aabuilderDash/api/contractor_Names/bulkUpload';
        refreshFunction = fetchContractorNames;
        break;
      case 'categories':
        apiEndpoint = 'https://backendaab.in/aabuilderDash/api/expenses_categories/bulkUpload';
        refreshFunction = fetchCategories;
        break;
      case 'machineTools':
        apiEndpoint = 'https://backendaab.in/aabuilderDash/api/machine_tools/bulkUpload';
        refreshFunction = fetchMachinTools;
        break;
      case 'employeeDetails':
        apiEndpoint = 'https://backendaab.in/aabuildersDash/api/employee_details/bulkUpload';
        refreshFunction = fetchEmployeeList;
        break;
      case 'labourDetails':
        apiEndpoint = 'https://backendaab.in/aabuildersDash/api/labours-details/bulkUpload';
        refreshFunction = fetchLaboursList;
        break;
      case 'accountDetails':
        apiEndpoint = 'https://backendaab.in/aabuildersDash/api/account-details/bulkUpload';
        refreshFunction = fetchAccountDetails;
        break;
      case 'bankAccountType':
        apiEndpoint = 'https://backendaab.in/aabuildersDash/api/bank_type/bulkUpload';
        refreshFunction = fetchBankAccountTypes;
        break;
      case 'ebServiceLink':
        apiEndpoint = 'https://backendaab.in/aabuildersDash/api/eb-service-no/upload';
        refreshFunction = fetchEbServiceLinks;
        break;
      case 'projectManagement':
        apiEndpoint = 'https://backendaab.in/aabuilderDash/api/projects/upload-sql';
        refreshFunction = fetchProjects;
        break;
      default:
        setMessage('Invalid table type for bulk upload');
        return;
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage(`${tableType} bulk upload successful!`);
        if (refreshFunction) {
          refreshFunction(); // Refresh the list
        }
      } else {
        const errorData = await response.json();
        setMessage(`${tableType} bulk upload failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`${tableType} bulk upload error:`, error);
      setMessage(`${tableType} bulk upload failed: ` + error.message);
    }

    // Reset the file input
    e.target.value = '';
  };

  // Specific handler for project management bulk upload
  const handleProjectManagementBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/upload-sql', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.text();
        setMessage(`Project Management bulk upload successful! ${result}`);
        fetchProjects(); // Refresh the project list
      } else {
        const errorData = await response.text();
        setMessage(`Project Management bulk upload failed: ${errorData}`);
      }
    } catch (error) {
      console.error('Project Management bulk upload error:', error);
      setMessage(`Project Management bulk upload failed: ${error.message}`);
    }

    // Reset the file input
    e.target.value = '';
  };
  const handleDeleteContractorName = async (id) => {
    if (window.confirm('Are you sure you want to delete this contractor name?')) {
      try {
        const response = await fetch(`https://backendaab.in/aabuilderDash/api/contractor_Names/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessage('Contractor name deleted successfully!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`https://backendaab.in/aabuilderDash/api/expenses_categories/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessage('Category deleted successfully!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const handleDeleteMachineTool = async (id) => {
    if (window.confirm('Are you sure you want to delete this machine tool?')) {
      try {
        const response = await fetch(`https://backendaab.in/aabuilderDash/api/machine_tools/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessage('Machine tool deleted successfully!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const handleDeleteEmployeeData = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee data?')) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/employee_details/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessage('Employee data deleted successfully!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const handleDeleteLabourData = async (id) => {
    if (window.confirm('Are you sure you want to delete this labour data?')) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/labours-details/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessage('Labour data deleted successfully!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const handleDeleteAccountDetails = async (id) => {
    if (window.confirm('Are you sure you want to delete this account details?')) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/account-details/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessage('Account details deleted successfully!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const handleDeleteBankAccountType = async (id) => {
    if (window.confirm('Are you sure you want to delete this bank account type?')) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/bank_type/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessage('Bank Account Type deleted successfully!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleDeleteEbServiceLink = async (id) => {
    if (window.confirm('Are you sure you want to delete this EB Service Link?')) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/eb-service-no/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessage('EB Service Link deleted successfully!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const handleDeleteSupportStaffName = async (id) => {
    if (window.confirm('Are you sure you want to delete this support staff name?')) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/support_staff/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessage('Support staff name deleted successfully!');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  // Filter functions
  const filteredVendorNames = vendorNames.filter((item) =>
    item.vendorName.toLowerCase().includes(vendorNameSearch.toLowerCase())
  );
  const filteredContractorNames = contractorNames.filter((item) =>
    item.contractorName.toLowerCase().includes(contractorNameSearch.toLowerCase())
  );
  const filteredCategories = expensesCategory.filter((item) =>
    item.category.toLowerCase().includes(expensesCategorySearch.toLowerCase())
  );
  const filteredMachineTools = machineToolsOptions.filter((item) =>
    item.machineTool.toLowerCase().includes(machineToolsSearch.toLowerCase())
  );
  const filteredEmployeeData = employeeList.filter((item) =>
    item.employee_name.toLowerCase().includes(employeeSearch.toLowerCase())
  );
  const filteredLaboursData = laboursList.filter((item) =>
    item.labour_name.toLowerCase().includes(laboursListSearch.toLowerCase())
  );
  const filteredBankAccountTypes = bankAccountTypes.filter((item) =>
    item.bank_account_type.toLowerCase().includes(bankAccountTypeSearch.toLowerCase())
  );

  const filteredEbServiceLinks = ebServiceLinks.filter((item) =>
    (item.project_id?.toString() || '').toLowerCase().includes(ebServiceLinkSearch.toLowerCase()) ||
    (item.door_no || '').toLowerCase().includes(ebServiceLinkSearch.toLowerCase()) ||
    (item.eb_service_no || '').toLowerCase().includes(ebServiceLinkSearch.toLowerCase())
  );
  const filteredSupportStaffNameList = supportStaffNameList.filter((item) =>
    item.support_staff_name.toLowerCase().includes(supportStaffSearch.toLowerCase())
  );
  const filteredAccountDetails = accountDetails.filter((item) =>
    (item.account_holder_name || '').toLowerCase().includes(accountDetailsSearch.toLowerCase()) ||
    (item.account_number || '').toLowerCase().includes(accountDetailsSearch.toLowerCase()) ||
    (item.bank_name || '').toLowerCase().includes(accountDetailsSearch.toLowerCase()) ||
    (item.branch || '').toLowerCase().includes(accountDetailsSearch.toLowerCase()) ||
    (item.ifsc_code || '').toLowerCase().includes(accountDetailsSearch.toLowerCase()) ||
    (item.upi_id || '').toLowerCase().includes(accountDetailsSearch.toLowerCase()) ||
    (item.gpay_number || '').toLowerCase().includes(accountDetailsSearch.toLowerCase()) ||
    (item.account_type || '').toLowerCase().includes(accountDetailsSearch.toLowerCase())
  );
  // Hover event handlers for Account Details
  const handleAccountMouseEnter = (event, accountItem) => {
    const accountHolderName = accountItem.account_holder_name || '-';
    const bankName = accountItem.bank_name || '-';
    const branch = accountItem.branch || '-';
    const ifscCode = accountItem.ifsc_code || '-';
    const upiId = accountItem.upi_id || '-';
    const gpayNumber = accountItem.gpay_number || '-';
    const accountType = accountItem.account_type || '-';
    setTooltipTitle('');
    setTooltipData([
      { label: 'Account Holder', value: accountHolderName },
      { label: 'Bank Name', value: bankName },
      { label: 'Branch', value: branch },
      { label: 'IFSC Code', value: ifscCode },
      { label: 'UPI ID', value: upiId },
      { label: 'GPay Number', value: gpayNumber },
      { label: 'Account Type', value: accountType }
    ]);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };
  const handleAccountMouseLeave = () => {
    setTooltipData(null);
    setTooltipTitle("");
  };
  // QR Image upload handlers
  const handleQrImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setQrImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrImagePreview(e.target.result);
        console.log('QR Image uploaded, Base64 length:', e.target.result.length);
      };
      reader.readAsDataURL(file);
    }
  };
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "transparent",
      borderColor: state.isFocused ? "#FAF6ED" : "transparent",
      "&:hover": {
        borderColor: "none",
      },
      boxShadow: state.isFocused ? "0 0 0 #FAF6ED" : "none",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#000',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
  };
  const handleEditQrImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setEditQrImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditQrImagePreview(e.target.result);
        console.log('Edit QR Image uploaded, Base64 length:', e.target.result.length);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleEditVendorQrImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEditVendorQrImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditVendorQrImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // Contractor QR Image upload handlers
  const handleContractorQrImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setContractorQrImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setContractorQrImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleEditContractorQrImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEditContractorQrImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditContractorQrImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // PDF Generation Functions
  const handleVendorShare = (vendor) => {
    const doc = new jsPDF();
    // Add title 
    doc.setFontSize(20);
    doc.setTextColor(191, 152, 83);
    doc.text('Vendor Information', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details', 14, 30);
    doc.setFont('helvetica', 'normal'); // reset back to normal for table
    const vendorData = [
      ['Vendor Name', vendor.vendorName || 'N/A'],
      ['Account Holder Name', vendor.account_holder_name || 'N/A'],
      ['Account Number', vendor.account_number || 'N/A'],
      ['Bank Name', vendor.bank_name || 'N/A'],
      ['Branch', vendor.branch || 'N/A'],
      ['IFSC Code', vendor.ifsc_code || 'N/A'],
      ['Gpay/PhonePe Number', vendor.gpay_number || 'N/A'],
      ['UPI ID', vendor.upi_id || 'N/A'],
      ['Contact Number', vendor.contact_number || 'N/A'],
      ['Contact Email', vendor.contact_email || 'N/A']
    ];
    doc.autoTable({
      startY: 35,
      body: vendorData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          textColor: [0, 0, 0],
          font: 'helvetica', // use helvetica bold variant
          fontSize: 11 // slightly larger for emphasis
        },
        1: {
          textColor: [50, 50, 50]
        }
      },
      headStyles: { fillColor: [191, 152, 83] }
    });
    // Add QR code if available
    if (vendor.upi_qr_image) {
      doc.addImage(
        `data:image/jpeg;base64,${vendor.upi_qr_image}`,
        'JPEG',
        80,
        doc.lastAutoTable.finalY + 20,
        50,
        50
      );
      doc.setFontSize(10);
      doc.text('Scan to Pay', 105, doc.lastAutoTable.finalY + 75, { align: 'center' });
    }
    // Download the PDF
    doc.save(`Vendor_${vendor.vendorName || 'Details'}.pdf`);
  };
  const handleContractorShare = (contractor) => {
    const doc = new jsPDF();
    // Add title 
    doc.setFontSize(20);
    doc.setTextColor(191, 152, 83);
    doc.text('Contractor Information', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details', 14, 30);
    doc.setFont('helvetica', 'normal'); // reset back to normal for table
    const contractorData = [
      ['Contractor Name', contractor.contractorName || 'N/A'],
      ['Account Holder Name', contractor.account_holder_name || 'N/A'],
      ['Account Number', contractor.account_number || 'N/A'],
      ['Bank Name', contractor.bank_name || 'N/A'],
      ['Branch', contractor.branch || 'N/A'],
      ['IFSC Code', contractor.ifsc_code || 'N/A'],
      ['Gpay/PhonePe Number', contractor.gpay_number || 'N/A'],
      ['UPI ID', contractor.upi_id || 'N/A'],
      ['Contact Number', contractor.contact_number || 'N/A'],
      ['Contact Email', contractor.contact_email || 'N/A']
    ];
    doc.autoTable({
      startY: 35,
      body: contractorData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          textColor: [0, 0, 0],
          font: 'helvetica', // use helvetica bold variant
          fontSize: 11 // slightly larger for emphasis
        },
        1: {
          textColor: [50, 50, 50]
        }
      },
      headStyles: { fillColor: [191, 152, 83] }
    });
    // Add QR code if available
    if (contractor.upi_qr_image) {
      let qrImageData = contractor.upi_qr_image.replace(/\s/g, '');
      if (!qrImageData.startsWith('data:')) {
        if (qrImageData.startsWith('/9j/') || qrImageData.startsWith('/9j4')) {
          qrImageData = `data:image/jpeg;base64,${qrImageData}`;
        } else if (qrImageData.startsWith('iVBORw0KGgo')) {
          qrImageData = `data:image/png;base64,${qrImageData}`;
        } else {
          qrImageData = `data:image/jpeg;base64,${qrImageData}`;
        }
      }
      doc.addImage(qrImageData, 'JPEG', 80, doc.lastAutoTable.finalY + 20, 50, 50);
      doc.setFontSize(10);
      doc.text('Scan to Pay', 105, doc.lastAutoTable.finalY + 75, { align: 'center' });
    }
    // Download the PDF
    doc.save(`Contractor_${contractor.contractorName || 'Details'}.pdf`);
  };
  // Copy to clipboard functionality
  const copyToClipboard = async (text, fieldName, buttonId) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Copied!');
      setCopiedButtonId(buttonId);
      setTimeout(() => {
        setMessage('');
        setCopiedButtonId(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setMessage('Failed to copy');
      setTimeout(() => setMessage(''), 2000);
    }
  };
  // Copy button component
  const CopyButton = ({ text, fieldName, buttonId, className = "" }) => (
    <button
      type="button"
      onClick={() => copyToClipboard(text, fieldName, buttonId)}
      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded text-xs font-medium transition-colors duration-200 ${copiedButtonId === buttonId ? 'bg-green-100 text-green-700' : 'text-gray-600'
        } ${className}`}
      title="Copy"
    >
      {copiedButtonId === buttonId ? 'Copied!' : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
  const handleEmployeeShare = (employee) => {
    const doc = new jsPDF();
    // Add title 
    doc.setFontSize(20);
    doc.setTextColor(191, 152, 83);
    doc.text('Employee Information', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Details', 14, 30);
    doc.setFont('helvetica', 'normal'); // reset back to normal for table
    const employeeData = [
      ['Employee Name', employee.employee_name || 'N/A'],
      ['Mobile Number', employee.employee_mobile_number || 'N/A'],
      ['Role', employee.role_of_employee || 'N/A'],
      ['Account Holder Name', employee.account_holder_name || 'N/A'],
      ['Account Number', employee.account_number || 'N/A'],
      ['Bank Name', employee.bank_name || 'N/A'],
      ['Branch', employee.branch || 'N/A'],
      ['IFSC Code', employee.ifsc_code || 'N/A'],
      ['Gpay/PhonePe Number', employee.gpay_number || 'N/A'],
      ['UPI ID', employee.upi_id || 'N/A'],
      ['Contact Email', employee.contact_email || 'N/A']
    ];
    doc.autoTable({
      startY: 35,
      body: employeeData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          textColor: [0, 0, 0],
          font: 'helvetica',
          fontSize: 11
        },
        1: {
          textColor: [50, 50, 50]
        }
      },
      headStyles: { fillColor: [191, 152, 83] }
    });
    // Add QR code if available
    if (employee.upi_qr_image) {
      let qrImageData = employee.upi_qr_image.replace(/\s/g, '');
      if (!qrImageData.startsWith('data:')) {
        if (qrImageData.startsWith('/9j/') || qrImageData.startsWith('/9j4')) {
          qrImageData = `data:image/jpeg;base64,${qrImageData}`;
        } else if (qrImageData.startsWith('iVBORw0KGgo')) {
          qrImageData = `data:image/png;base64,${qrImageData}`;
        } else {
          qrImageData = `data:image/jpeg;base64,${qrImageData}`;
        }
      }
      doc.addImage(qrImageData, 'JPEG', 80, doc.lastAutoTable.finalY + 20, 50, 50);
      doc.setFontSize(10);
      doc.text('Scan to Pay', 105, doc.lastAutoTable.finalY + 75, { align: 'center' });
    }
    // Download the PDF
    doc.save(`Employee_${employee.employee_name || 'Details'}.pdf`);
  };
  const handleAccountShare = (account) => {
    const doc = new jsPDF();
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(191, 152, 83); // #BF9853 color
    doc.text('Account Information', 105, 20, { align: 'center' });
    // Add account details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details', 14, 30);
    doc.setFont('helvetica', 'normal'); // reset back to normal for table
    const accountData = [
      ['Account Holder Name', account.account_holder_name || 'N/A'],
      ['Account Number', account.account_number || 'N/A'],
      ['Bank Name', account.bank_name || 'N/A'],
      ['Branch', account.branch || 'N/A'],
      ['IFSC Code', account.ifsc_code || 'N/A'],
      ['UPI ID', account.upi_id || 'N/A'],
      ['GPay Number', account.gpay_number || 'N/A'],
      ['Account Type', account.account_type || 'N/A']
    ];
    doc.autoTable({
      startY: 35,
      body: accountData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          textColor: [0, 0, 0],
          font: 'helvetica', // use helvetica bold variant
          fontSize: 11 // slightly larger for emphasis
        },
        1: {
          textColor: [50, 50, 50]
        }
      },
      headStyles: { fillColor: [191, 152, 83] }
    });
    // Add QR code if available
    if (account.upi_qr_image) {
      doc.addImage(account.upi_qr_image, 'JPEG', 80, doc.lastAutoTable.finalY + 20, 50, 50);
      doc.setFontSize(10);
      doc.text('Scan to Pay', 105, doc.lastAutoTable.finalY + 75, { align: 'center' });
    }
    // Download the PDF
    doc.save(`Account_${account.account_holder_name || 'Details'}.pdf`);
  };

  // Export functionality handlers
  const handleDownloadIconClick = (dataType) => {
    setExportDataType(dataType);
    setExportProjectCategory('');
    setIsExportTypeModalOpen(true);
  };

  const handleExportTypeSelect = (type) => {
    setExportType(type);
    setIsExportTypeModalOpen(false);
    setIsExportSelectionModalOpen(true);
    setSelectedExportItems([]);
    setExportSearchTerm('');
    setExportProjectCategory('');
  };

  const handleExportItemToggle = (itemId) => {
    setSelectedExportItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAllExportItems = () => {
    let dataList = [];
    if (exportDataType === 'vendor') {
      dataList = filteredExportVendors;
    } else if (exportDataType === 'contractor') {
      dataList = filteredExportContractors;
    } else if (exportDataType === 'employee') {
      dataList = getFilteredExportData();
    } else if (exportDataType === 'project') {
      dataList = filteredExportProjects;
    } else if (exportDataType === 'ebServiceLink') {
      dataList = filteredExportEbServiceLinks;
    }
    const allIds = dataList.map(item => item.id);
    setSelectedExportItems(allIds);
  };

  const handleDeselectAllExportItems = () => {
    setSelectedExportItems([]);
  };

  const getFilteredExportData = () => {
    if (exportDataType === 'vendor') {
      return vendorNames.filter(item =>
        item.vendorName.toLowerCase().includes(exportSearchTerm.toLowerCase())
      );
    } else if (exportDataType === 'contractor') {
      return contractorNames.filter(item =>
        item.contractorName.toLowerCase().includes(exportSearchTerm.toLowerCase())
      );
    } else if (exportDataType === 'employee') {
      return employeeList.filter(item =>
        (item.employee_name || '').toLowerCase().includes(exportSearchTerm.toLowerCase()) ||
        (item.employee_mobile_number || '').toLowerCase().includes(exportSearchTerm.toLowerCase()) ||
        (item.role_of_employee || '').toLowerCase().includes(exportSearchTerm.toLowerCase())
      );
    } else if (exportDataType === 'project') {
      const search = exportSearchTerm.toLowerCase();
      return projects.filter(item => {
        const matchesSearch =
          (item.projectName || '').toLowerCase().includes(search) ||
          (item.projectId || '').toString().toLowerCase().includes(search) ||
          (item.projectReferenceName || '').toLowerCase().includes(search);
        const matchesCategory = !exportProjectCategory ||
          (item.projectCategory || '').toLowerCase() === exportProjectCategory.toLowerCase();
        return matchesSearch && matchesCategory;
      });
    } else if (exportDataType === 'ebServiceLink') {
      return ebServiceLinks.filter(item =>
        (item.project_id?.toString() || '').toLowerCase().includes(exportSearchTerm.toLowerCase()) ||
        (item.door_no || '').toLowerCase().includes(exportSearchTerm.toLowerCase()) ||
        (item.eb_service_no || '').toLowerCase().includes(exportSearchTerm.toLowerCase())
      );
    }
    return [];
  };

  const filteredExportVendors = exportDataType === 'vendor' ? getFilteredExportData() : [];
  const filteredExportContractors = exportDataType === 'contractor' ? getFilteredExportData() : [];
  const filteredExportProjects = exportDataType === 'project' ? getFilteredExportData() : [];
  const filteredExportEbServiceLinks = exportDataType === 'ebServiceLink' ? getFilteredExportData() : [];

  const handleExportToPDF = () => {
    let selectedData = [];
    if (exportDataType === 'vendor') {
      selectedData = vendorNames.filter(item => selectedExportItems.includes(item.id));
    } else if (exportDataType === 'contractor') {
      selectedData = contractorNames.filter(item => selectedExportItems.includes(item.id));
    } else if (exportDataType === 'employee') {
      selectedData = employeeList.filter(item => selectedExportItems.includes(item.id));
    } else if (exportDataType === 'project') {
      selectedData = projects.filter(item => selectedExportItems.includes(item.id));
    } else {
      selectedData = ebServiceLinks.filter(item => selectedExportItems.includes(item.id));
    }

    if (selectedData.length === 0) {
      alert('Please select at least one item to export');
      return;
    }

    const doc = new jsPDF('landscape');
    let title = 'Export List';
    if (exportDataType === 'vendor') {
      title = 'Vendor List';
    } else if (exportDataType === 'contractor') {
      title = 'Contractor List';
    } else if (exportDataType === 'employee') {
      title = 'Employee List';
    } else if (exportDataType === 'project') {
      title = 'Project List';
    } else {
      title = 'EB Service Link List';
    }

    doc.setFontSize(20);
    doc.setTextColor(191, 152, 83);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    const formatId = (id, prefix) => {
      if (!id) return '';
      const paddedId = id.toString().padStart(4, '0');
      return `${prefix}${paddedId}`;
    };

    let tableHead = [];
    let tableData = [];
    let columnStyles = {};
    let projectCount = 0;
    let rowCounter = 1;

    if (exportDataType === 'ebServiceLink') {
      tableHead = [[
        'ID',
        'Project ID',
        'Door No',
        'EB Service No'
      ]];
      tableData = selectedData.map(item => ([
        item.id || '',
        item.project_id || '',
        item.door_no || '',
        item.eb_service_no || ''
      ]));
      columnStyles = {
        0: { cellWidth: 18 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 }
      };
    } else if (exportDataType === 'employee') {
      tableHead = [[
        'Customer ID',
        'Beneficiary Code',
        'Beneficiary Name',
        'Account Number',
        'IFSC Code',
        'Account Type',
        'Mobile Number',
        'Email ID',
        'Address 1',
        'Address 2',
        'Address 3',
        'Address 4',
        'ZIP Code'
      ]];
      tableData = selectedData.map(item => {
        const prefix = 'E';
        return [
          '149985391',
          formatId(item.id, prefix),
          item.employee_name || '',
          item.account_number || '',
          item.ifsc_code || '',
          '',
          item.employee_mobile_number || '',
          item.contact_email || 'aabsvprentry@gmail.com',
          '',
          '',
          '',
          '',
          ''
        ];
      });
      columnStyles = {
        0: { cellWidth: 18 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 18 },
        6: { cellWidth: 22 },
        7: { cellWidth: 25 },
        8: { cellWidth: 15 },
        9: { cellWidth: 15 },
        10: { cellWidth: 15 },
        11: { cellWidth: 15 },
        12: { cellWidth: 15 }
      };
    } else if (exportDataType === 'project') {
      tableHead = [[
        'S.No',
        'P.ID',
        'Project Name',
        'Project Reference Name',
        'Project Category',
        'Project Type',
        'Floor Name',
        'Shop No',
        'Door No',
        'Area',
        'EB No',
        'Property Tax No',
        'Water Tax No'
      ]];
      const uniqueProjectKeys = new Set(
        selectedData.map(item => (item.id ?? item.projectId ?? item.projectName ?? '').toString())
      );
      projectCount = uniqueProjectKeys.size;
      tableData = selectedData.flatMap(project => {
        const propertyDetails = Array.isArray(project.propertyDetails) && project.propertyDetails.length > 0
          ? project.propertyDetails
          : Array.isArray(project.propertyDetailsList) && project.propertyDetailsList.length > 0
            ? project.propertyDetailsList
            : [null];
        return propertyDetails.map(detail => ([
          rowCounter++,
          project.projectId || '',
          project.projectName || '',
          project.projectReferenceName || '',
          project.projectCategory || '',
          detail?.projectType || '',
          detail?.floorName || '',
          detail?.shopNo || '',
          detail?.doorNo || '',
          detail?.area || '',
          detail?.ebNo || '',
          detail?.propertyTaxNo || '',
          detail?.waterTaxNo || ''
        ]));
      });
      columnStyles = {
        0: { cellWidth: 11 },
        1: { cellWidth: 10 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 26 },
        5: { cellWidth: 16 },
        6: { cellWidth: 23 },
        7: { cellWidth: 15 },
        8: { cellWidth: 15 },
        9: { cellWidth: 13 },
        10: { cellWidth: 25 },
        11: { cellWidth: 27 },
        12: { cellWidth: 23 }
      };
    } else {
      tableHead = [[
        'Customer ID',
        'Beneficiary Code',
        'Beneficiary Name',
        'Account Number',
        'IFSC Code',
        'Account Type',
        'Mobile Number',
        'Email ID',
        'Address 1',
        'Address 2',
        'Address 3',
        'Address 4',
        'ZIP Code'
      ]];
      tableData = selectedData.map(item => {
        const prefix = exportDataType === 'vendor' ? 'V' : 'C';
        return [
          '149985391',
          formatId(item.id, prefix),
          exportDataType === 'vendor' ? (item.vendorName || '') : (item.contractorName || ''),
          item.account_number || '',
          item.ifsc_code || '',
          '',
          item.contact_number || '',
          item.contact_email || 'aabsvprentry@gmail.com',
          '',
          '',
          '',
          '',
          ''
        ];
      });
      columnStyles = {
        0: { cellWidth: 18 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 18 },
        6: { cellWidth: 22 },
        7: { cellWidth: 25 },
        8: { cellWidth: 15 },
        9: { cellWidth: 15 },
        10: { cellWidth: 15 },
        11: { cellWidth: 15 },
        12: { cellWidth: 15 }
      };
    }

    if (exportDataType === 'project' && projectCount) {
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Projects Count: ${projectCount}`, doc.internal.pageSize.getWidth() - 14, 26, { align: 'right' });
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
    }

    doc.autoTable({
      startY: 30,
      head: tableHead,
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: exportDataType === 'project' ? 8 : 7,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [191, 152, 83],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      columnStyles
    });

    doc.save(`${title.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    setIsExportSelectionModalOpen(false);
  };

  const handleExportToExcel = () => {
    let selectedData = [];
    if (exportDataType === 'vendor') {
      selectedData = vendorNames.filter(item => selectedExportItems.includes(item.id));
    } else if (exportDataType === 'contractor') {
      selectedData = contractorNames.filter(item => selectedExportItems.includes(item.id));
    } else if (exportDataType === 'employee') {
      selectedData = employeeList.filter(item => selectedExportItems.includes(item.id));
    } else if (exportDataType === 'project') {
      selectedData = projects.filter(item => selectedExportItems.includes(item.id));
    } else {
      selectedData = ebServiceLinks.filter(item => selectedExportItems.includes(item.id));
    }

    if (selectedData.length === 0) {
      alert('Please select at least one item to export');
      return;
    }

    const formatId = (id, prefix) => {
      if (!id) return '';
      const paddedId = id.toString().padStart(4, '0');
      return `${prefix}${paddedId}`;
    };

    let worksheetData = [];
    let rowCounter = 1;
    let projectCount = 0;
    if (exportDataType === 'ebServiceLink') {
      worksheetData = selectedData.map(item => ({
        'ID': item.id || '',
        'Project ID': item.project_id || '',
        'Door No': item.door_no || '',
        'EB Service No': item.eb_service_no || ''
      }));
    } else if (exportDataType === 'employee') {
      worksheetData = selectedData.map(item => {
        const prefix = 'E';
        return {
          'Customer ID': '149985391',
          'Beneficiary Code': formatId(item.id, prefix),
          'Beneficiary Name': item.employee_name || '',
          'Account Number': item.account_number || '',
          'IFSC Code': item.ifsc_code || '',
          'Account Type': '',
          'Mobile Number': item.employee_mobile_number || '',
          'Email ID': item.contact_email || 'aabsvprentry@gmail.com',
          'Address 1': '',
          'Address 2': '',
          'Address 3': '',
          'Address 4': '',
          'ZIP Code': ''
        };
      });
    } else if (exportDataType === 'project') {
      const uniqueProjectKeys = new Set(
        selectedData.map(item => (item.id ?? item.projectId ?? item.projectName ?? '').toString())
      );
      projectCount = uniqueProjectKeys.size;
      worksheetData = selectedData.flatMap(project => {
        const propertyDetails = Array.isArray(project.propertyDetails) && project.propertyDetails.length > 0
          ? project.propertyDetails
          : Array.isArray(project.propertyDetailsList) && project.propertyDetailsList.length > 0
            ? project.propertyDetailsList
            : [null];
        return propertyDetails.map(detail => ({
          'S.No': rowCounter++,
          'Project ID': project.projectId || '',
          'Project Name': project.projectName || '',
          'Project Reference Name': project.projectReferenceName || '',
          'Project Category': project.projectCategory || '',
          'Project Type': detail?.projectType || '',
          'Floor Name': detail?.floorName || '',
          'Shop No': detail?.shopNo || '',
          'Door No': detail?.doorNo || '',
          'Area': detail?.area || '',
          'EB No': detail?.ebNo || '',
          'Property Tax No': detail?.propertyTaxNo || '',
          'Water Tax No': detail?.waterTaxNo || ''
        }));
      });
    } else {
      worksheetData = selectedData.map(item => {
        const prefix = exportDataType === 'vendor' ? 'V' : 'C';
        return {
          'Customer ID': '149985391',
          'Beneficiary Code': formatId(item.id, prefix),
          'Beneficiary Name': exportDataType === 'vendor' ? (item.vendorName || '') : (item.contractorName || ''),
          'Account Number': item.account_number || '',
          'IFSC Code': item.ifsc_code || '',
          'Account Type': '',
          'Mobile Number': item.contact_number || '',
          'Email ID': item.contact_email || 'aabsvprentry@gmail.com',
          'Address 1': '',
          'Address 2': '',
          'Address 3': '',
          'Address 4': '',
          'ZIP Code': ''
        };
      });
    }

    const worksheet = exportDataType === 'project'
      ? XLSX.utils.json_to_sheet(worksheetData, { origin: 'A3' })
      : XLSX.utils.json_to_sheet(worksheetData);

    if (exportDataType === 'project') {
      XLSX.utils.sheet_add_aoa(worksheet, [['Total Projects', projectCount]], { origin: 'A1' });
      XLSX.utils.sheet_add_aoa(worksheet, [['']], { origin: 'A2' });
    }

    const columnWidths = exportDataType === 'ebServiceLink' ? [
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 }
    ] : exportDataType === 'project' ? [
      { wch: 8 },   // S.No
      { wch: 15 },  // Project ID
      { wch: 25 },  // Project Name
      { wch: 30 },  // Project Reference Name
      { wch: 22 },  // Project Category
      { wch: 18 },  // Project Type
      { wch: 18 },  // Floor Name
      { wch: 12 },  // Shop No
      { wch: 12 },  // Door No
      { wch: 15 },  // Area
      { wch: 20 },  // EB No
      { wch: 22 },  // Property Tax No
      { wch: 22 }   // Water Tax No
    ] : [
      { wch: 12 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    let sheetName = 'Export';
    if (exportDataType === 'vendor') {
      sheetName = 'Vendors';
    } else if (exportDataType === 'contractor') {
      sheetName = 'Contractors';
    } else if (exportDataType === 'employee') {
      sheetName = 'Employees';
    } else if (exportDataType === 'project') {
      sheetName = 'Projects';
    } else {
      sheetName = 'EB Service Links';
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const fileName = `${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    setIsExportSelectionModalOpen(false);
  };
  return (
    <div className="p-4  ml-6">
      <div className="border-t pt-6 mt-20">
        <div
          className="lg:flex space-x-[2%] lg:w-full md:w-[32rem] w-[20rem] overflow-x-auto select-none h-[780px]"
          style={{ cursor: isDragging ? 'grabbing' : 'default' }}
          onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        >
          <div className="mb-6">
            <div className="flex items-center mb-10 mt-10">
              <h2 className="text-xl font-bold text-[#BF9853]">Master Tables</h2>
              {selectedTable && (
                <button
                  onClick={clearSelection}
                  className="text-[#BF9853] border border-[#BF9853] px-4 ml-20 py-2 rounded-lg hover:bg-[#BF9853] hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
              <div className="bg-[#FAF6ED]">
                <table className="table-auto w-[300px]">
                  <thead className='bg-[#FAF6ED]'>
                    <tr className="border-b">
                      <th className="p-2 text-left text-xl font-bold">S.No</th>
                      <th className="p-2 text-left text-xl font-bold">Table Name</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="table-auto w-[300px]">
                  <tbody>
                    {masterTableData.map((table, index) => (
                      <tr
                        key={table.id}
                        onClick={() => handleTableSelection(table.id)}
                        className={`border-b cursor-pointer transition-all duration-200 hover:bg-[#FAF6ED] ${selectedTable === table.id
                          ? 'bg-[#FAF6ED] border-l-4 border-l-[#BF9853]'
                          : 'odd:bg-white even:bg-gray-50'
                          }`}
                      >
                        <td className="p-3 text-left font-semibold">
                          {(index + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="p-3 text-left font-semibold text-[#BF9853]">
                          {table.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {getReorderedTableData().map((table, index) => (
            <div key={table.id}
              className={selectedTable === table.id ? 'ring-4 ring-[#faf9f8] ring-opacity-50 rounded-lg shadow-lg' : ''}
            >
              {table.id === 'project-management' && (
                <div>
                  <div className="flex items-center mb-2 lg:mt-0 mt-3">
                    <input
                      type="text"
                      className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                      placeholder="Search Project.."
                      value={projectManagementSearch}
                      onChange={(e) => setProjectManagementSearch(e.target.value)}
                    />
                    <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                      <img src={search} alt='search' className=' w-5 h-5' />
                    </button>
                    <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                      onClick={openProjectManagement}>
                      + Add
                    </button>
                  </div>
                  <button className="flex items-center text-[#E4572E] font-bold px-1 ml-4 mt-2"
                    onClick={() => document.getElementById('projectManagementFileInput').click()}>
                    <img src={imports} alt='import' className='w-4 h-4 mr-1' />
                    Import File
                  </button>
                  <input
                    type="file"
                    id="projectManagementFileInput"
                    accept=".sql"
                    style={{ display: 'none' }}
                    onChange={(e) => handleProjectManagementBulkUpload(e)}
                  />

                  <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] mt-6'>
                    <div className="bg-[#FAF6ED]">
                      <table className="table-auto lg:w-[470px]">
                        <thead className='bg-[#FAF6ED]'>
                          <tr className="border-b">
                            <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                            <th className="p-2 text-left lg:w-72 text-xl font-bold">Project Name</th>
                            <th>
                              <div>
                                <button onClick={() => handleDownloadIconClick('project')}>
                                  <img src={DownloadIcon} alt='download' className=' cursor-pointer hover:opacity-75' />
                                </button>
                              </div>
                            </th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <table className="table-auto lg:w-full w-full">
                        <tbody>
                          {projects.filter(project =>
                            project.projectName?.toLowerCase().includes(projectManagementSearch.toLowerCase()) ||
                            project.projectAddress?.toLowerCase().includes(projectManagementSearch.toLowerCase()) ||
                            project.projectId?.toLowerCase().includes(projectManagementSearch.toLowerCase())
                          ).map((item, index) => (
                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED] group">
                              <td className="p-2 text-left font-semibold">
                                {(projects.findIndex(p => p.id === item.id) + 1).toString().padStart(2, '0')}
                              </td>
                              <td className="p-2 text-left font-semibold">
                                {item.projectName || ''}
                              </td>
                              <td className="p-2 text-left font-semibold">
                                {item.projectCategory === 'Client Project' && (
                                  <span className="text-xs font-semibold text-[#E4572E]  px-2 py-1 rounded">
                                    Client
                                  </span>
                                )}
                                {item.projectCategory === 'Own Project' && (
                                  <span className="text-xs font-semibold text-[#007233] px-2 py-1 rounded">
                                    Own
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-left font-semibold">
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => handleEditProject(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <img src={edit} alt="Edit" className="w-6 h-6" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProject(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <img src={deleteIcon} alt="Delete" className="w-6 h-6" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {table.id === 'vendor-names' && (
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                      placeholder="Search Vendor Name.."
                      value={vendorNameSearch}
                      onChange={(e) => setVendorNameSearch(e.target.value)}
                    />
                    <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                      <img src={search} alt='search' className=' w-5 h-5' />
                    </button>
                    <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                      onClick={openvendorNames}>
                      + Add
                    </button>
                  </div>
                  <button className="flex items-center text-[#E4572E] font-bold ml-4 "
                    onClick={() => document.getElementById('vendorNamesFileInput').click()}>
                    <img src={imports} alt='import' className='w-4 h-4 mr-1' />
                    Import File
                  </button>
                  <input
                    type="file"
                    id="vendorNamesFileInput"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    onChange={(e) => handleBulkUpload(e, 'vendorNames')}
                  />
                  <div>
                    <button onClick={() => handleDownloadIconClick('vendor')}>
                      <img src={DownloadIcon} alt='download' className='-mb-10 mt-5 ml-[15rem] cursor-pointer hover:opacity-75' />
                    </button>
                  </div>
                  <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                    <div className="bg-[#FAF6ED]">
                      <table className="table-auto lg:w-72">
                        <thead className='bg-[#FAF6ED]'>
                          <tr className="border-b">
                            <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                            <th className="p-2 text-left lg:w-72 text-xl font-bold">Vendor Name</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <table className="table-auto lg:w-72 w-full">
                        <tbody>
                          {filteredVendorNames.map((item, index) => (
                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                              <td className="p-2 text-left font-semibold">
                                {(vendorNames.findIndex(v => v.id === item.id) + 1).toString().padStart(2, '0')}
                              </td>
                              <td className="p-2 text-left group flex font-semibold">
                                <div className="flex flex-grow">
                                  {item.vendorName}
                                </div>
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button onClick={() => handleVendorShare(item)}>
                                    <img src={share} alt='Share' className='w-4 h-4' />
                                  </button>
                                  <button
                                    onClick={() => handleEditVendorName(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <img src={edit} alt="Edit" className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVendorName(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {table.id === 'contractor-names' && (
                <div>
                  <div className="flex items-center ">
                    <input
                      type="text"
                      className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                      placeholder="Search Contractor Name.."
                      value={contractorNameSearch}
                      onChange={(e) => setContractorNameSearch(e.target.value)}
                    />
                    <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                      <img src={search} alt='search' className=' w-5 h-5' />
                    </button>
                    <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                      onClick={openContractorNames}>
                      + Add
                    </button>
                  </div>
                  <button className="flex items-center text-[#E4572E] font-bold px-1 ml-4 mt-2 "
                    onClick={() => document.getElementById('contractorNamesFileInput').click()}>
                    <img src={imports} alt='import' className='w-4 h-4 mr-1' />
                    Import File
                  </button>
                  <input
                    type="file"
                    id="contractorNamesFileInput"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    onChange={(e) => handleBulkUpload(e, 'contractorNames')}
                  />
                  <button onClick={() => handleDownloadIconClick('contractor')}>
                    <img src={DownloadIcon} alt='download' className='-mb-10 mt-5 ml-[15rem] cursor-pointer hover:opacity-75' />
                  </button>
                  <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                    <div className="bg-[#FAF6ED]">
                      <table className="table-auto lg:w-72">
                        <thead className='bg-[#FAF6ED]'>
                          <tr className="border-b">
                            <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                            <th className="p-2 text-left lg:w-72 text-xl font-bold">Contractor Name</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <table className="table-auto lg:w-72 w-full">
                        <tbody>
                          {filteredContractorNames.map((item, index) => (
                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                              <td className="p-2 text-left font-semibold">
                                {(contractorNames.findIndex(c => c.id === item.id) + 1).toString().padStart(2, '0')}
                              </td>
                              <td className="p-2 text-left group flex font-semibold">
                                <div className="flex flex-grow">
                                  {item.contractorName}
                                </div>
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button onClick={() => handleContractorShare(item)}>
                                    <img src={share} alt='Share' className='w-4 h-4' />
                                  </button>
                                  <button
                                    onClick={() => handleEditContractorName(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <img src={edit} alt="Edit" className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteContractorName(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {table.id === 'categories' && (
                <div>
                  <div className="flex items-center mb-2 lg:mt-0 mt-3">
                    <input
                      type="text"
                      className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                      placeholder="Search Categories.."
                      value={expensesCategorySearch}
                      onChange={(e) => setExpensesCategorySearch(e.target.value)}
                    />
                    <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                      <img src={search} alt='search' className=' w-5 h-5' />
                    </button>
                    <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                      onClick={openCategory}>
                      + Add
                    </button>
                  </div>
                  <button className="flex items-center text-[#E4572E] font-bold px-1 ml-4 mt-2 mb-6"
                    onClick={() => document.getElementById('categoriesFileInput').click()}>
                    <img src={imports} alt='import' className='w-4 h-4 mr-1' />
                    Import File
                  </button>
                  <input
                    type="file"
                    id="categoriesFileInput"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    onChange={(e) => handleBulkUpload(e, 'categories')}
                  />
                  <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                    <div className="bg-[#FAF6ED]">
                      <table className="table-auto lg:w-72">
                        <thead className='bg-[#FAF6ED]'>
                          <tr className="border-b">
                            <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                            <th className="p-2 text-left lg:w-72 text-xl font-bold">Category</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <table className="table-auto lg:w-72 w-full">
                        <tbody>
                          {filteredCategories.map((item, index) => (
                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                              <td className="p-2 text-left font-semibold">
                                {(expensesCategory.findIndex(c => c.id === item.id) + 1).toString().padStart(2, '0')}
                              </td>
                              <td className="p-2 text-left group flex font-semibold">
                                <div className="flex flex-grow">
                                  {item.category}
                                </div>
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => handleEditCategory(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <img src={edit} alt="Edit" className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {table.id === 'machine-tools' && (
                <div>
                  <div className="flex items-center mb-2 lg:mt-0 mt-3">
                    <input
                      type="text"
                      className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                      placeholder="Search Tools.."
                      value={machineToolsSearch}
                      onChange={(e) => setMachineToolsSearch(e.target.value)}
                    />
                    <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                      <img src={search} alt='search' className=' w-5 h-5' />
                    </button>
                    <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                      onClick={openMachineTools}>
                      + Add
                    </button>
                  </div>
                  <button className="flex items-center text-[#E4572E] font-bold px-1 ml-4 mt-2 mb-6"
                    onClick={() => document.getElementById('machineToolsFileInput').click()}>
                    <img src={imports} alt='import' className='w-4 h-4 mr-1' />
                    Import File
                  </button>
                  <input
                    type="file"
                    id="machineToolsFileInput"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    onChange={(e) => handleBulkUpload(e, 'machineTools')}
                  />
                  <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                    <div className="bg-[#FAF6ED]">
                      <table className="table-auto lg:w-72">
                        <thead className='bg-[#FAF6ED]'>
                          <tr className="border-b">
                            <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                            <th className="p-2 text-left lg:w-72 text-xl font-bold">Machine Tools</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <table className="table-auto lg:w-72 w-full">
                        <tbody>
                          {filteredMachineTools.map((item, index) => (
                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                              <td className="p-2 text-left font-semibold">
                                {(machineToolsOptions.findIndex(tool => tool.id === item.id) + 1).toString().padStart(2, '0')}
                              </td>
                              <td className="p-2 text-left group flex font-semibold">
                                <div className="flex flex-grow">
                                  {item.machineTool}
                                </div>
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => handleEditMachineTool(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <img src={edit} alt="Edit" className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMachineTool(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {table.id === 'employee-details' && (
                <div>
                  <div className="flex items-center mb-2 lg:mt-0 mt-3">
                    <input
                      type="text"
                      className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                      placeholder="Search Employee Name.."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                    />
                    <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                      <img src={search} alt='search' className=' w-5 h-5' />
                    </button>
                    <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                      onClick={openEmployeeDetails}>
                      + Add
                    </button>
                  </div>
                  <button className="flex items-center text-[#E4572E] font-bold px-1 ml-4 mt-2"
                    onClick={() => document.getElementById('employeeDetailsFileInput').click()}>
                    <img src={imports} alt='import' className='w-4 h-4 mr-1' />
                    Import File
                  </button>
                  <input
                    type="file"
                    id="employeeDetailsFileInput"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    onChange={(e) => handleBulkUpload(e, 'employeeDetails')}
                  />
                  <div>
                    <button onClick={() => handleDownloadIconClick('employee')}>
                      <img src={DownloadIcon} alt='download' className='-mb-10 mt-5 ml-[15rem] cursor-pointer hover:opacity-75' />
                    </button>
                  </div>
                  <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                    <div className="bg-[#FAF6ED]">
                      <table className="table-auto lg:w-72">
                        <thead className='bg-[#FAF6ED]'>
                          <tr className="border-b">
                            <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                            <th className="p-2 text-left lg:w-72 text-xl font-bold">Employee Name</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <table className="table-auto lg:w-72 w-full">
                        <tbody>
                          {filteredEmployeeData.map((item, index) => (
                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                              <td className="p-2 text-left font-semibold">
                                {(employeeList.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}
                              </td>
                              <td className="p-2 text-left group flex font-semibold">
                                <div className="flex flex-grow">
                                  {item.employee_name}
                                </div>
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button onClick={() => handleEmployeeShare(item)}>
                                    <img src={share} alt='Share' className='w-4 h-4' />
                                  </button>
                                  <button
                                    onClick={() => handleEditEmployeeData(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <img src={edit} alt="Edit" className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEmployeeData(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {table.id === 'labours-list' && (
                <div>
                  <div className="flex items-center mb-2 lg:mt-0 mt-3">
                    <input
                      type="text"
                      className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                      placeholder="Search Labour Name.."
                      value={laboursListSearch}
                      onChange={(e) => setLaboursListSearch(e.target.value)}
                    />
                    <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                      <img src={search} alt='search' className=' w-5 h-5' />
                    </button>
                    <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                      onClick={openLabourDetails}>
                      + Add
                    </button>
                  </div>
                  <button className="flex items-center text-[#E4572E] font-bold px-1 ml-4 mt-2 mb-6"
                    onClick={() => document.getElementById('labourDetailsFileInput').click()}>
                    <img src={imports} alt='import' className='w-4 h-4 mr-1' />
                    Import File
                  </button>
                  <input
                    type="file"
                    id="labourDetailsFileInput"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    onChange={(e) => handleBulkUpload(e, 'labourDetails')}
                  />
                  <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                    <div className="bg-[#FAF6ED]">
                      <table className="table-auto lg:w-72">
                        <thead className='bg-[#FAF6ED]'>
                          <tr className="border-b">
                            <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                            <th className="p-2 text-left lg:w-72 text-xl font-bold">Labour Name</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <table className="table-auto lg:w-72 w-full">
                        <tbody>
                          {filteredLaboursData.map((item, index) => (
                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                              <td className="p-2 text-left font-semibold">
                                {(laboursList.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}
                              </td>
                              <td className="p-2 text-left group flex font-semibold">
                                <div className="flex flex-grow">
                                  {item.labour_name}
                                </div>
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => handleEditLabourData(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <img src={edit} alt="Edit" className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLabourData(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {table.id === 'Account Details' && (
                <div>
                  <div className="flex items-center mb-2 lg:mt-0 mt-3">
                    <input
                      type="text"
                      className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                      placeholder="Search Account Details.."
                      value={accountDetailsSearch}
                      onChange={(e) => setAccountDetailsSearch(e.target.value)}
                    />
                    <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                      <img src={search} alt='search' className=' w-5 h-5' />
                    </button>
                    <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                      onClick={openAccountDetails}>
                      + Add
                    </button>
                  </div>
                  <button className="flex items-center text-[#E4572E] font-bold px-1 ml-4 mt-2 mb-6"
                    onClick={() => document.getElementById('accountDetailsFileInput').click()}>
                    <img src={imports} alt='import' className='w-4 h-4 mr-1' />
                    Import File
                  </button>
                  <input
                    type="file"
                    id="accountDetailsFileInput"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    onChange={(e) => handleBulkUpload(e, 'accountDetails')}
                  />
                  <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                    <div className="bg-[#FAF6ED]">
                      <table className="table-auto lg:w-[300px]">
                        <thead className='bg-[#FAF6ED]'>
                          <tr className="border-b">
                            <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                            <th className="p-2 text-left lg:w-32 text-xl font-bold">Account No</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-[250px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <table className="table-auto lg:w-[300px] w-full">
                        <tbody>
                          {filteredAccountDetails.map((item, index) => (
                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                              <td className="p-2 text-left font-semibold">
                                {(accountDetails.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}
                              </td>
                              <td className="p-2 text-left group flex font-semibold">
                                <div className="flex flex-grow cursor-help relative"
                                  onMouseEnter={(e) => handleAccountMouseEnter(e, item)}
                                  onMouseLeave={handleAccountMouseLeave}
                                >
                                  {item.account_number}
                                </div>
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button onClick={() => handleAccountShare(item)}>
                                    <img src={share} alt='Share' className='w-4 h-4' />
                                  </button>
                                  <button
                                    onClick={() => handleEditAccountDetails(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <img src={edit} alt="Edit" className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAccountDetails(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {table.id === 'bank-account-type' && (
                <div>
                  <div className="flex items-center mb-2 lg:mt-0 mt-3">
                    <input
                      type="text"
                      className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                      placeholder="Search Bank Account Type.."
                      value={bankAccountTypeSearch}
                      onChange={(e) => setBankAccountTypeSearch(e.target.value)}
                    />
                    <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                      <img src={search} alt='search' className=' w-5 h-5' />
                    </button>
                    <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                      onClick={openBankAccountType}>
                      + Add
                    </button>
                  </div>
                  <button className="flex items-center text-[#E4572E] font-bold px-1 ml-4 mt-2 mb-6"
                    onClick={() => document.getElementById('bankAccountTypeFileInput').click()}>
                    <img src={imports} alt='import' className='w-4 h-4 mr-1' />
                    Import File
                  </button>
                  <input
                    type="file"
                    id="bankAccountTypeFileInput"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    onChange={(e) => handleBulkUpload(e, 'bankAccountType')}
                  />
                  <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                    <div className="bg-[#FAF6ED]">
                      <table className="table-auto lg:w-72">
                        <thead className='bg-[#FAF6ED]'>
                          <tr className="border-b">
                            <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                            <th className="p-2 text-left lg:w-72 text-xl font-bold">Bank Account Type</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <table className="table-auto lg:w-72 w-full">
                        <tbody>
                          {filteredBankAccountTypes.map((item, index) => (
                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                              <td className="p-2 text-left font-semibold">
                                {(bankAccountTypes.findIndex(b => b.id === item.id) + 1).toString().padStart(2, '0')}
                              </td>
                              <td className="p-2 text-left group flex font-semibold">
                                <div className="flex flex-grow">
                                  {item.bank_account_type}
                                </div>
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => handleEditBankAccountType(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <img src={edit} alt="Edit" className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBankAccountType(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {table.id === 'support-staff-name' && (
                <div>
                  <div className="flex items-center mb-2 lg:mt-0 mt-3">
                    <input
                      type="text"
                      className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                      placeholder="Search EB Service Link.."
                      value={supportStaffSearch}
                      onChange={(e) => setSupportStaffSearch(e.target.value)}
                    />
                    <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                      <img src={search} alt='search' className=' w-5 h-5' />
                    </button>
                    <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                      onClick={openSupportStaffName}>
                      + Add
                    </button>
                  </div>
                  <button className="flex items-center text-[#E4572E] font-bold px-1 ml-4 mt-2 mb-6">
                    <img src={imports} alt='import' className='w-4 h-4 mr-1' />
                    Import File
                  </button>
                  
                  <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                    <div className="bg-[#FAF6ED]">
                      <table className="table-auto lg:w-72">
                        <thead className='bg-[#FAF6ED]'>
                          <tr className="border-b">
                            <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                            <th className="p-2 text-left lg:w-72 text-xl font-bold">Support Staff Name</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <table className="table-auto lg:w-full w-full">
                        <tbody>
                          {filteredSupportStaffNameList.map((item, index) => (
                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                              <td className="p-2 text-left font-semibold">
                                {(supportStaffNameList.findIndex(e => e.id === item.id) + 1).toString().padStart(2, '0')}
                              </td>
                              <td className="p-2 text-left group flex font-semibold">
                                <div className="flex flex-grow">
                                  {item.support_staff_name || ''}
                                </div>
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => handleEditSupportStaffName(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <img src={edit} alt="Edit" className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSupportStaffName(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
      {/* Modal Forms */}
      {isSiteNamesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[30rem] h-80 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeSiteNames}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitSiteNames}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[17rem]">Site Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Site Name"
                  onChange={(e) => setSiteName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[18.5rem]">Site No</label>
                <input
                  type="text"
                  value={siteNo}
                  onChange={(e) => setSiteNo(e.target.value)}
                  placeholder="Enter Site No"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeSiteNames}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isVendorNameOpens && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md px-2 py-2 text-left w-[1100px]">
            <div className='p-4'>
              <div>
                <button className="text-red-500 ml-[95%]" onClick={closevendorNames}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <div className="flex justify-between">
                <form onSubmit={handleSubmitVendorName}>
                  <div className='flex justify-between gap-10'>
                    <div className='mr-5'>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Vendor Name</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Vendor Name"
                            value={vendorName}
                            onChange={(e) => setVendorName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Account Holder Name</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Account Holder Name"
                            value={vendorAccountHolderName}
                            onChange={(e) => setVendorAccountHolderName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Account Number</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Account Number"
                            value={vendorAccountNumber}
                            onChange={(e) => setVendorAccountNumber(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Bank Name</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Bank Name"
                            value={vendorBankName}
                            onChange={(e) => setVendorBankName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">IFSC Code</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter IFSC Code"
                            value={vendorIfscCode}
                            onChange={(e) => setVendorIfscCode(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Branch</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Branch"
                            value={vendorBranch}
                            onChange={(e) => setVendorBranch(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Gpay/PhonePe Number</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Gpay/PhonePe Number"
                            value={vendorGpayNumber}
                            onChange={(e) => setVendorGpayNumber(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">UPI ID</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter UPI ID"
                            value={vendorUpiId}
                            onChange={(e) => setVendorUpiId(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Contact Number</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Contact Number"
                            value={vendorContactNumber}
                            onChange={(e) => setVendorContactNumber(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Contact Email</label>
                          <input
                            type="email"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Contact Email"
                            value={vendorContactEmail}
                            onChange={(e) => setVendorContactEmail(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    {/* QR Image Section */}
                    <div className="w-52 mt-10">
                      <div>
                        <div className="mb-4">
                          <div className="w-48 h-48 border-2 border-[#BF9853] border-opacity-35 rounded-lg flex items-center justify-center bg-gray-50">
                            {vendorQrImagePreview ? (
                              <img src={vendorQrImagePreview} alt="QR Preview" className="w-full h-full object-contain rounded-lg" />
                            ) : (
                              <span className="text-gray-400 text-sm">QR Image Preview</span>
                            )}
                          </div>
                        </div>
                        <div className="mb-4">
                          <input
                            type="file"
                            id="vendorQrImageUpload"
                            accept="image/*"
                            onChange={handleVendorQrImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('vendorQrImageUpload').click()}
                            className="w-52 bg-[#BF9853] text-white px-4 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                          >
                            Add QR
                          </button>
                        </div>
                      </div>
                      <div className="flex space-x-2 justify-end mt-52 ml-5">
                        <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                          Submit
                        </button>
                        <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closevendorNames}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {isContractorNameOpens && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md px-2 py-2 text-left w-[1100px]">
            <div className='p-4'>
              <div>
                <button className="text-red-500 ml-[95%]" onClick={closeContractorNames}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <div className="flex justify-between">
                <form onSubmit={handleSubmitContractorName}>
                  <div className=' flex gap-16'>
                    <div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Contractor Name</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Contractor Name"
                            value={contractorName}
                            onChange={(e) => setContractorName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Account Holder Name</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Account Holder Name"
                            value={contractorAccountHolderName}
                            onChange={(e) => setContractorAccountHolderName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Account Number</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Account Number"
                            value={contractorAccountNumber}
                            onChange={(e) => setContractorAccountNumber(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Bank Name</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Bank Name"
                            value={contractorBankName}
                            onChange={(e) => setContractorBankName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">IFSC Code</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter IFSC Code"
                            value={contractorIfscCode}
                            onChange={(e) => setContractorIfscCode(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Branch</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Branch"
                            value={contractorBranch}
                            onChange={(e) => setContractorBranch(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Gpay/PhonePe Number</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Gpay/PhonePe Number"
                            value={contractorGpayNumber}
                            onChange={(e) => setContractorGpayNumber(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">UPI ID</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter UPI ID"
                            value={contractorUpiId}
                            onChange={(e) => setContractorUpiId(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Contact Number</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Contact Number"
                            value={contractorContactNumber}
                            onChange={(e) => setContractorContactNumber(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Contact Email</label>
                          <input
                            type="email"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Contact Email"
                            value={contractorContactEmail}
                            onChange={(e) => setContractorContactEmail(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    {/* QR Image Section */}
                    <div className="w-52 mt-10">
                      <div>
                        <div className="mb-4">
                          <div className="w-48 h-48 border-2 border-[#BF9853] border-opacity-35 rounded-lg flex items-center justify-center bg-gray-50">
                            {contractorQrImagePreview ? (
                              <img src={contractorQrImagePreview} alt="QR Preview" className="w-full h-full object-contain rounded-lg" />
                            ) : (
                              <span className="text-gray-400 text-sm">QR Image Preview</span>
                            )}
                          </div>
                        </div>
                        <div className="mb-4">
                          <input
                            type="file"
                            id="contractorQrImageUpload"
                            accept="image/*"
                            onChange={handleContractorQrImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('contractorQrImageUpload').click()}
                            className="w-52 bg-[#BF9853] text-white px-4 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                          >
                            Add QR
                          </button>
                        </div>
                      </div>
                      <div className="flex space-x-2 justify-end mt-52">
                        <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                          Submit
                        </button>
                        <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeContractorNames}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div >

      )
      }
      {
        isCategoryOpens && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
              <div>
                <button className="text-red-500 ml-[95%]" onClick={closeCategory}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form onSubmit={handleSubmitCategory}>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-72">Category</label>
                  <input
                    type="text"
                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter Category"
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4 mr-5">
                  <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                    Submit
                  </button>
                  <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeCategory}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {
        isMachineToolsOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
              <div>
                <button className="text-red-500 ml-[95%]" onClick={closeMachineTools}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form onSubmit={handleSubmitMachineTools}>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-[15rem]">Machine Tools</label>
                  <input
                    type="text"
                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter Tools Name"
                    onChange={(e) => setMachineTool(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end mr-5 space-x-2 mt-4">
                  <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                    Submit
                  </button>
                  <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeMachineTools}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {isEmployeeDataOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md px-2 py-2 text-left w-[1100px]">
            <div className='p-4'>
              <div>
                <button className="text-red-500 ml-[95%]" onClick={closeEmployeeDetails}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <div className="flex justify-between">
                <form onSubmit={handleSubmitEmployeeData} encType="multipart/form-data">
                  <div className='flex justify-between gap-10'>
                    <div className='mr-5'>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Employee Name</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Employee Name"
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Employee ID</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Employee ID"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Designation</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Designation"
                            value={roleOfEmployee}
                            onChange={(e) => setRoleOfEmployee(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Mobile Number</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Mobile Number"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Account Holder Name</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Account Holder Name"
                            value={empAccountHolderName}
                            onChange={(e) => setEmpAccountHolderName(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Account Number</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Account Number"
                            value={empAccountNumber}
                            onChange={(e) => setEmpAccountNumber(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Bank Name</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Bank Name"
                            value={empBankName}
                            onChange={(e) => setEmpBankName(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">IFSC Code</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter IFSC Code"
                            value={empIfscCode}
                            onChange={(e) => setEmpIfscCode(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Branch</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Branch"
                            value={empBranch}
                            onChange={(e) => setEmpBranch(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">UPI ID</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter UPI ID"
                            value={empUpiId}
                            onChange={(e) => setEmpUpiId(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">GPay Number</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter GPay Number"
                            value={empGpayNumber}
                            onChange={(e) => setEmpGpayNumber(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Contact Email</label>
                          <input
                            type="email"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Contact Email"
                            value={empContactEmail}
                            onChange={(e) => setEmpContactEmail(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    {/* QR Image Section */}
                    <div className="w-52 mt-10">
                      <div>
                        <div className="mb-4">
                          <div className="w-48 h-48 border-2 border-[#BF9853] border-opacity-35 rounded-lg flex items-center justify-center bg-gray-50">
                            {empUpiQRImage ? (
                              <img src={URL.createObjectURL(empUpiQRImage)} alt="QR Preview" className="w-full h-full object-contain rounded-lg" />
                            ) : (
                              <span className="text-gray-400 text-sm">Profile Preview</span>
                            )}
                          </div>
                        </div>
                        <div className="mb-4">
                          <input
                            type="file"
                            id="employeeQrImageUpload"
                            accept="image/*"
                            onChange={(e) => setEmpUpiQRImage(e.target.files[0])}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('employeeQrImageUpload').click()}
                            className="w-52 bg-[#BF9853] text-white px-4 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                          >
                            Add Image
                          </button>
                        </div>
                      </div>
                      <div className="flex space-x-2 justify-end mt-52 ml-5">
                        <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                          Submit
                        </button>
                        <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeEmployeeDetails}>
                          Cancel
                        </button>
                      </div>
                      <div className="mt-4 ml-5">
                        <input
                          type="file"
                          id="aadhaarPdfUpload"
                          accept=".pdf"
                          onChange={(e) => setAadhaarPdfFile(e.target.files[0])}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => document.getElementById('aadhaarPdfUpload').click()}
                            className="bg-[#BF9853] text-white px-2 py-2 w-48 -ml-14 rounded-lg hover:bg-yellow-800 font-semibold"
                          >
                            Select Aadhaar PDF
                          </button>
                          {aadhaarImageUrl && (
                            <button
                              type="button"
                              onClick={() => window.open(aadhaarImageUrl, '_blank')}
                              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 font-semibold"
                              title="View existing Aadhaar PDF"
                            >
                              📄
                            </button>
                          )}
                        </div>
                        {aadhaarPdfFile && (
                          <p className="text-sm text-green-600 mt-2 -ml-14">Selected: {aadhaarPdfFile.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )
      }
      {
        isLaboursListDataOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md w-[30rem] h-80 px-2 py-2">
              <div>
                <button className="text-red-500 ml-[95%]" onClick={closeLabourDetails}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form onSubmit={handleSubmitLaboursData}>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-64">Labour Name</label>
                  <input
                    type="text"
                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter Name"
                    onChange={(e) => setLabourName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-80">Salary</label>
                  <input
                    type="number"
                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter Salary"
                    onChange={(e) => setLabourSalary(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end mr-2 space-x-2 mt-4">
                  <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                    Submit
                  </button>
                  <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeLabourDetails}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {
        isAccountDetailsOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md px-2 py-2 text-left w-[1100px]">
              <div className='p-4'>
                <div>
                  <button className="text-red-500 ml-[95%]" onClick={closeAccountDetails}>
                    <img src={cross} alt='cross' className='w-5 h-5' />
                  </button>
                </div>
                <div className="flex justify-between">
                  <div className="flex">
                    <form className='flex' onSubmit={handleSubmitAccountDetails}>
                      <div className=''>
                        <div className='flex gap-4'>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">Account Holder Name</label>
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter Account Holder Name"
                              value={accountHolderName}
                              onChange={(e) => setAccountHolderName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">Account Number</label>
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter Account Number"
                              value={accountNumber}
                              onChange={(e) => setAccountNumber(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className='flex gap-4'>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">Bank Name</label>
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter Bank Name"
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">IFSC Code</label>
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter IFSC Code"
                              value={ifscCode}
                              onChange={(e) => setIfscCode(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className='flex gap-4'>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">Branch</label>
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter Branch"
                              value={branch}
                              onChange={(e) => setBranch(e.target.value)}
                              required
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">UPI ID</label>
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter UPI ID"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className='flex gap-4'>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">GPay Number</label>
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter GPay Number"
                              value={gpayNumber}
                              onChange={(e) => setGpayNumber(e.target.value)}
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">Account Type</label>
                            <select
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                              value={accountType}
                              onChange={(e) => setAccountType(e.target.value)}
                              required
                            >
                              <option value="">Select Account Type</option>
                              {bankAccountTypes.map((type) => (
                                <option key={type.id} value={type.bank_account_type}>
                                  {type.bank_account_type}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      {/* QR Image Section */}
                      <div className=" mt-10">
                        <div className='ml-10'>
                          <div className="mb-4">
                            <div className="w-48 h-48 border-2 border-[#BF9853] border-opacity-35 rounded-lg flex items-center justify-center bg-gray-50">
                              {qrImagePreview ? (
                                <img src={qrImagePreview} alt="QR Preview" className="w-full h-full object-contain rounded-lg" />
                              ) : (
                                <span className="text-gray-400 text-sm">QR Image Preview</span>
                              )}
                            </div>
                          </div>
                          <div className="">
                            <input
                              type="file"
                              id="qrImageUpload"
                              accept="image/*"
                              onChange={handleQrImageUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById('qrImageUpload').click()}
                              className="w-48 bg-[#BF9853] text-white px-4 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                            >
                              Add QR
                            </button>
                          </div>
                          <div className="flex space-x-2 justify-end mt-24">
                            <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                              Submit
                            </button>
                            <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeAccountDetails}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* Edit Modal Forms */}
      {
        isEditSiteNameOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md w-[30rem] h-80 px-2 py-2">
              <div>
                <button className="text-red-500 ml-[95%]" onClick={() => setIsEditSiteNameOpen(false)}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch(`https://backendaab.in/aabuilderDash/api/project_Names/edit/${selectedSiteId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ siteName: editSiteName, siteNo: editSiteNo }),
                  });
                  if (response.ok) {
                    setMessage('Site name updated successfully!');
                    setIsEditSiteNameOpen(false);
                    window.location.reload();
                  }
                } catch (error) {
                  console.error('Error:', error);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-[17rem]">Site Name</label>
                  <input
                    type="text"
                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter Site Name"
                    value={editSiteName}
                    onChange={(e) => setEditSiteName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-[18.5rem]">Site No</label>
                  <input
                    type="text"
                    value={editSiteNo}
                    onChange={(e) => setEditSiteNo(e.target.value)}
                    placeholder="Enter Site No"
                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex space-x-2 mt-8 ml-12">
                  <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                    Update
                  </button>
                  <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={() => setIsEditSiteNameOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {
        isVendorEditOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md px-2 py-2 text-left w-[1150px]">
              <div className='p-4'>
                <div>
                  <button className="text-red-500 ml-[95%]" onClick={resetVendorData}>
                    <img src={cross} alt='cross' className='w-5 h-5' />
                  </button>
                </div>
                <div className="flex justify-between">
                  <div className="flex">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData();

                      // Create vendor object with correct field names matching @JsonProperty annotations
                      const vendorData = {
                        vendorName: editVendorName,
                        account_holder_name: editVendorAccountHolderName,
                        account_number: editVendorAccountNumber,
                        bank_name: editVendorBankName,
                        branch: editVendorBranch,
                        ifsc_code: editVendorIfscCode,
                        gpay_number: editVendorGpayNumber,
                        upi_id: editVendorUpiId,
                        contact_number: editVendorContactNumber,
                        contact_email: editVendorContactEmail
                      };

                      // Create a blob for the vendor data
                      const vendorBlob = new Blob([JSON.stringify(vendorData)], { type: 'application/json' });
                      formData.append('vendor', vendorBlob);

                      // Add QR image file if selected
                      if (editVendorQrImage) {
                        formData.append('file', editVendorQrImage);
                      }

                      console.log("Edit FormData entries:");
                      for (let [key, value] of formData.entries()) {
                        console.log(key, typeof value, value);
                      }
                      try {
                        const response = await fetch(`https://backendaab.in/aabuilderDash/api/vendor_Names/edit/${selectedVendorId}`, {
                          method: 'PUT',
                          body: formData,
                        });
                        if (response.ok) {
                          const result = await response.json();
                          setMessage('Vendor name updated successfully!');
                          setIsVendorEditOpen(false);
                          window.location.reload();
                        } else {
                          const errorText = await response.text();
                          setMessage(`Error: ${response.status} - ${errorText}`);
                        }
                      } catch (error) {
                        console.error('Edit error:', error);
                        setMessage(`Error: ${error.message}`);
                      }
                    }}>
                      <div className='flex gap-14'>
                        <div>
                          <div className='flex gap-4'>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Vendor Name</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Vendor Name"
                                  value={editVendorName}
                                  onChange={(e) => setEditVendorName(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Account Holder Name</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Account Holder Name"
                                  value={editVendorAccountHolderName}
                                  onChange={(e) => setEditVendorAccountHolderName(e.target.value)}
                                  disabled={!isVendorEditMode}
                                />
                                {!isVendorEditMode && (
                                  <CopyButton
                                    text={editVendorAccountHolderName}
                                    fieldName="Account Holder Name"
                                    buttonId="vendor-account-holder"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex gap-4'>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Account Number</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Account Number"
                                  value={editVendorAccountNumber}
                                  onChange={(e) => setEditVendorAccountNumber(e.target.value)}
                                  disabled={!isVendorEditMode}
                                />
                                {!isVendorEditMode && (
                                  <CopyButton
                                    text={editVendorAccountNumber}
                                    fieldName="Account Number"
                                    buttonId="vendor-account-number"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Bank Name</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Bank Name"
                                  value={editVendorBankName}
                                  onChange={(e) => setEditVendorBankName(e.target.value)}
                                  disabled={!isVendorEditMode}
                                />
                                {!isVendorEditMode && (
                                  <CopyButton
                                    text={editVendorBankName}
                                    fieldName="Bank Name"
                                    buttonId="vendor-bank-name"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex gap-4'>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">IFSC Code</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter IFSC Code"
                                  value={editVendorIfscCode}
                                  onChange={(e) => setEditVendorIfscCode(e.target.value)}
                                  disabled={!isVendorEditMode}
                                />
                                {!isVendorEditMode && (
                                  <CopyButton
                                    text={editVendorIfscCode}
                                    fieldName="IFSC Code"
                                    buttonId="vendor-ifsc-code"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Branch</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Branch"
                                  value={editVendorBranch}
                                  onChange={(e) => setEditVendorBranch(e.target.value)}
                                  disabled={!isVendorEditMode}
                                />
                                {!isVendorEditMode && (
                                  <CopyButton
                                    text={editVendorBranch}
                                    fieldName="Branch"
                                    buttonId="vendor-branch"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex gap-4'>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Gpay/PhonePe Number</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Gpay/PhonePe Number"
                                  value={editVendorGpayNumber}
                                  onChange={(e) => setEditVendorGpayNumber(e.target.value)}
                                  disabled={!isVendorEditMode}
                                />
                                {!isVendorEditMode && (
                                  <CopyButton
                                    text={editVendorGpayNumber}
                                    fieldName="Gpay/PhonePe Number"
                                    buttonId="vendor-gpay-number"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">UPI ID</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter UPI ID"
                                  value={editVendorUpiId}
                                  onChange={(e) => setEditVendorUpiId(e.target.value)}
                                  disabled={!isVendorEditMode}
                                />
                                {!isVendorEditMode && (
                                  <CopyButton
                                    text={editVendorUpiId}
                                    fieldName="UPI ID"
                                    buttonId="vendor-upi-id"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex gap-4'>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Contact Number</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Contact Number"
                                  value={editVendorContactNumber}
                                  onChange={(e) => setEditVendorContactNumber(e.target.value)}
                                  disabled={!isVendorEditMode}
                                />
                                {!isVendorEditMode && (
                                  <CopyButton
                                    text={editVendorContactNumber}
                                    fieldName="Contact Number"
                                    buttonId="vendor-contact-number"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Contact Email</label>
                              <div className="relative">
                                <input
                                  type="email"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Contact Email"
                                  value={editVendorContactEmail}
                                  onChange={(e) => setEditVendorContactEmail(e.target.value)}
                                  disabled={!isVendorEditMode}
                                />
                                {!isVendorEditMode && (
                                  <CopyButton
                                    text={editVendorContactEmail}
                                    fieldName="Contact Email"
                                    buttonId="vendor-contact-email"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* QR Image Section */}
                        <div className="w-52 mt-10">
                          <div className='ml-3'>
                            <div className="mb-4">
                              <div className="w-48 h-48 border-2 border-[#BF9853] border-opacity-35 rounded-lg flex items-center justify-center bg-gray-50">
                                {editVendorQrImagePreview ? (
                                  <img src={editVendorQrImagePreview} alt="QR Preview" className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                  <span className="text-gray-400 text-sm">QR Image Preview</span>
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <input
                                type="file"
                                id="editVendorQrImageUpload"
                                accept="image/*"
                                onChange={handleEditVendorQrImageUpload}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => document.getElementById('editVendorQrImageUpload').click()}
                                className="w-52 bg-[#BF9853] text-white px-4 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                              >
                                Add QR
                              </button>
                            </div>
                            <div className="mb-4">
                              <button
                                type="button"
                                onClick={() => setIsVendorEditMode(!isVendorEditMode)}
                                className="w-52 bg-[#BF9853] text-white px-4 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                              >
                                {isVendorEditMode ? 'Disable Edit' : 'Edit Vendor Details'}
                              </button>
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-40">
                            <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                              Update
                            </button>
                            <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={resetVendorData}>
                              Cancel
                            </button>
                          </div>
                        </div>



                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {
        isVendorBulkUploadOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md px-2 py-2 text-left w-[600px]">
              <div className='p-4'>
                <div>
                  <button className="text-red-500 ml-[95%]" onClick={() => {
                    setIsVendorBulkUploadOpen(false);
                    setVendorBulkUploadFile(null);
                  }}>
                    <img src={cross} alt='cross' className='w-5 h-5' />
                  </button>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[#BF9853] mb-6">Bulk Upload Vendor Names</h2>
                  <form onSubmit={handleVendorBulkUpload}>
                    <div className="mb-6">
                      <label className="block text-lg font-medium mb-2 text-left">Upload SQL File</label>
                      <input
                        type="file"
                        accept=".sql"
                        onChange={handleVendorBulkUploadFileChange}
                        className="w-full p-3 border-2 border-[#BF9853] border-opacity-35 rounded-lg focus:outline-none"
                        required
                      />
                      <p className="text-sm text-gray-600 mt-2">Only .sql files are allowed</p>
                    </div>
                    <div className="flex space-x-4 justify-center">
                      <button
                        type="submit"
                        className="bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                        disabled={!vendorBulkUploadFile}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                        onClick={() => {
                          setIsVendorBulkUploadOpen(false);
                          setVendorBulkUploadFile(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {
        isContractorEditOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md px-2 py-2 text-left w-[1100px]">
              <div className='p-4'>
                <div>
                  <button className="text-red-500 ml-[95%]" onClick={resetContractorData}>
                    <img src={cross} alt='cross' className='w-5 h-5' />
                  </button>
                </div>
                <div className="flex justify-between">
                  <div className="flex">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      // Create FormData for multipart/form-data submission
                      const formData = new FormData();
                      // Create contractor object with correct JSON property names
                      const contractorData = {
                        contractorName: editContractorName,
                        account_holder_name: editContractorAccountHolderName,
                        account_number: editContractorAccountNumber,
                        bank_name: editContractorBankName,
                        branch: editContractorBranch,
                        ifsc_code: editContractorIfscCode,
                        gpay_number: editContractorGpayNumber,
                        upi_id: editContractorUpiId,
                        contact_number: editContractorContactNumber,
                        contact_email: editContractorContactEmail
                      };
                      // Create a blob for the contractor data (like vendor implementation)
                      const contractorBlob = new Blob([JSON.stringify(contractorData)], { type: 'application/json' });
                      formData.append('contractor', contractorBlob);
                      // Add file if selected
                      if (editContractorQrImage) {
                        formData.append('file', editContractorQrImage);
                      }
                      try {
                        const response = await fetch(`https://backendaab.in/aabuilderDash/api/contractor_Names/edit/${selectedContractorId}`, {
                          method: 'PUT',
                          body: formData,
                        });
                        if (response.ok) {
                          window.location.reload();
                          setMessage('Contractor name updated successfully!');
                          setIsContractorEditOpen(false);
                          fetchContractorNames(); // Refresh the list
                        } else {
                          const errorData = await response.text();
                          setMessage('Error updating contractor: ' + errorData);
                        }
                      } catch (error) {
                        console.error('Error:', error);
                        setMessage('Error updating contractor: ' + error.message);
                      }
                    }}>
                      <div className='flex gap-16'>
                        <div>
                          <div className='flex gap-4'>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Contractor Name</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Contractor Name"
                                  value={editContractorName}
                                  onChange={(e) => setEditContractorName(e.target.value)}
                                  disabled={!isContractorEditMode}
                                  required
                                />
                                {!isContractorEditMode && (
                                  <CopyButton
                                    text={editContractorName}
                                    fieldName="Contractor Name"
                                    buttonId="contractor-name"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Account Holder Name</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Account Holder Name"
                                  value={editContractorAccountHolderName}
                                  onChange={(e) => setEditContractorAccountHolderName(e.target.value)}
                                  disabled={!isContractorEditMode}
                                />
                                {!isContractorEditMode && (
                                  <CopyButton
                                    text={editContractorAccountHolderName}
                                    fieldName="Account Holder Name"
                                    buttonId="contractor-account-holder"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex gap-4'>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Account Number</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Account Number"
                                  value={editContractorAccountNumber}
                                  onChange={(e) => setEditContractorAccountNumber(e.target.value)}
                                  disabled={!isContractorEditMode}
                                />
                                {!isContractorEditMode && (
                                  <CopyButton
                                    text={editContractorAccountNumber}
                                    fieldName="Account Number"
                                    buttonId="contractor-account-number"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Bank Name</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Bank Name"
                                  value={editContractorBankName}
                                  onChange={(e) => setEditContractorBankName(e.target.value)}
                                  disabled={!isContractorEditMode}
                                />
                                {!isContractorEditMode && (
                                  <CopyButton
                                    text={editContractorBankName}
                                    fieldName="Bank Name"
                                    buttonId="contractor-bank-name"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex gap-4'>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">IFSC Code</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter IFSC Code"
                                  value={editContractorIfscCode}
                                  onChange={(e) => setEditContractorIfscCode(e.target.value)}
                                  disabled={!isContractorEditMode}
                                />
                                {!isContractorEditMode && (
                                  <CopyButton
                                    text={editContractorIfscCode}
                                    fieldName="IFSC Code"
                                    buttonId="contractor-ifsc-code"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Branch</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Branch"
                                  value={editContractorBranch}
                                  onChange={(e) => setEditContractorBranch(e.target.value)}
                                  disabled={!isContractorEditMode}
                                />
                                {!isContractorEditMode && (
                                  <CopyButton
                                    text={editContractorBranch}
                                    fieldName="Branch"
                                    buttonId="contractor-branch"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex gap-4'>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Gpay/PhonePe Number</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Gpay/PhonePe Number"
                                  value={editContractorGpayNumber}
                                  onChange={(e) => setEditContractorGpayNumber(e.target.value)}
                                  disabled={!isContractorEditMode}
                                />
                                {!isContractorEditMode && (
                                  <CopyButton
                                    text={editContractorGpayNumber}
                                    fieldName="Gpay/PhonePe Number"
                                    buttonId="contractor-gpay-number"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">UPI ID</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter UPI ID"
                                  value={editContractorUpiId}
                                  onChange={(e) => setEditContractorUpiId(e.target.value)}
                                  disabled={!isContractorEditMode}
                                />
                                {!isContractorEditMode && (
                                  <CopyButton
                                    text={editContractorUpiId}
                                    fieldName="UPI ID"
                                    buttonId="contractor-upi-id"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex gap-4'>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Contact Number</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Contact Number"
                                  value={editContractorContactNumber}
                                  onChange={(e) => setEditContractorContactNumber(e.target.value)}
                                  disabled={!isContractorEditMode}
                                />
                                {!isContractorEditMode && (
                                  <CopyButton
                                    text={editContractorContactNumber}
                                    fieldName="Contact Number"
                                    buttonId="contractor-contact-number"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-lg font-medium mb-2">Contact Email</label>
                              <div className="relative">
                                <input
                                  type="email"
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  placeholder="Enter Contact Email"
                                  value={editContractorContactEmail}
                                  onChange={(e) => setEditContractorContactEmail(e.target.value)}
                                  disabled={!isContractorEditMode}
                                />
                                {!isContractorEditMode && (
                                  <CopyButton
                                    text={editContractorContactEmail}
                                    fieldName="Contact Email"
                                    buttonId="contractor-contact-email"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* QR Image Section */}
                        <div className="w-52 mt-10">
                          <div>
                            <div className="mb-4">
                              <div className="w-48 h-48 border-2 border-[#BF9853] border-opacity-35 rounded-lg flex items-center justify-center bg-gray-50">
                                {editContractorQrImagePreview ? (
                                  <img src={editContractorQrImagePreview} alt="QR Preview" className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                  <span className="text-gray-400 text-sm">QR Image Preview</span>
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <input
                                type="file"
                                id="editContractorQrImageUpload"
                                accept="image/*"
                                onChange={handleEditContractorQrImageUpload}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => document.getElementById('editContractorQrImageUpload').click()}
                                className="w-52 bg-[#BF9853] text-white px-4 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                              >
                                Add QR
                              </button>
                            </div>
                            <div className="mb-4">
                              <button
                                type="button"
                                onClick={() => setIsContractorEditMode(!isContractorEditMode)}
                                className="w-52 bg-[#BF9853] text-white px-4 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                              >
                                {isContractorEditMode ? 'Disable Edit' : 'Edit Contractor Details'}
                              </button>
                            </div>
                          </div>
                          <div className="flex space-x-2 justify-end mt-40">
                            <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                              Update
                            </button>
                            <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={resetContractorData}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {
        isCategoriesEditOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
              <div>
                <button className="text-red-500 ml-[95%]" onClick={() => setIsCategoriesEditOpen(false)}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch(`https://backendaab.in/aabuilderDash/api/expenses_categories/update/${selectedCategoryId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: editCategory }),
                  });
                  if (response.ok) {
                    setMessage('Category updated successfully!');
                    setIsCategoriesEditOpen(false);
                    window.location.reload();
                  }
                } catch (error) {
                  console.error('Error:', error);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-72">Category</label>
                  <input
                    type="text"
                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter Category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end mr-5 space-x-2 mt-4 ">
                  <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                    Update
                  </button>
                  <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={() => setIsCategoriesEditOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {
        isMachineToolsEditOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
              <div>
                <button className="text-red-500 ml-[95%]" onClick={() => setIsMachineToolsEditOpen(false)}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch(`https://backendaab.in/aabuilderDash/api/machine_tools/update/${selectedMachineId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ machineTool: editMachineTool }),
                  });
                  if (response.ok) {
                    setMessage('Machine tool updated successfully!');
                    setIsMachineToolsEditOpen(false);
                    window.location.reload();
                  }
                } catch (error) {
                  console.error('Error:', error);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-[15rem]">Machine Tools</label>
                  <input
                    type="text"
                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter Tools Name"
                    value={editMachineTool}
                    onChange={(e) => setEditMachineTool(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end mr-5 space-x-2 mt-4">
                  <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                    Update
                  </button>
                  <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={() => setIsMachineToolsEditOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {
        isBankAccountTypeOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
              <div>
                <button className="text-red-500 ml-[95%]" onClick={closeBankAccountType}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form onSubmit={handleSubmitBankAccountType}>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-56">Bank Account Type</label>
                  <input
                    type="text"
                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter Bank Account Type"
                    onChange={(e) => setBankAccountType(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4 mr-2">
                  <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                    Submit
                  </button>
                  <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeBankAccountType}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {
        isBankAccountTypeEditOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
              <div>
                <button className="text-red-500 ml-[95%]" onClick={() => setIsBankAccountTypeEditOpen(false)}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch(`https://backendaab.in/aabuildersDash/api/bank_type/edit/${selectedBankAccountTypeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bank_account_type: editBankAccountType }),
                  });
                  if (response.ok) {
                    setMessage('Bank Account Type updated successfully!');
                    setIsBankAccountTypeEditOpen(false);
                    window.location.reload();
                  }
                } catch (error) {
                  console.error('Error:', error);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-56">Bank Account Type</label>
                  <input
                    type="text"
                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter Bank Account Type"
                    value={editBankAccountType}
                    onChange={(e) => setEditBankAccountType(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4 mr-2">
                  <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                    Update
                  </button>
                  <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={() => setIsBankAccountTypeEditOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {
        isEbServiceLinkOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md w-[30rem] text-left px-6 py-2">
              <div>
                <button className="text-red-500 ml-[95%]" onClick={closeEbServiceLink}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form onSubmit={handleSubmitEbServiceLink}>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2">Project Name</label>
                  <Select
                    value={selectedProject}
                    onChange={setSelectedProject}
                    options={siteNames.map(site => ({
                      value: site.siteNo,
                      label: site.siteName
                    }))}
                    placeholder="Select Project Name"
                    isSearchable
                    isClearable
                    className="w-96 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg"
                    styles={customSelectStyles}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2">Door No</label>
                  <input
                    type="text"
                    className="w-96 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter Door No"
                    value={doorNo}
                    onChange={(e) => setDoorNo(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2">EB Service No</label>
                  <input
                    type="text"
                    className="w-96 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter EB Service No"
                    value={ebServiceNo}
                    onChange={(e) => setEbServiceNo(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4 mb-4">
                  <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                    Submit
                  </button>
                  <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeEbServiceLink}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {
        isEbServiceLinkEditOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md w-[30rem] text-left px-6 py-2">
              <div>
                <button className="text-red-500 ml-[95%]" onClick={() => setIsEbServiceLinkEditOpen(false)}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch(`https://backendaab.in/aabuildersDash/api/eb-service-no/update/${selectedEbServiceLinkId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      project_id: parseInt(editSelectedProject?.value),
                      door_no: editDoorNo,
                      eb_service_no: editEbServiceNo
                    }),
                  });
                  if (response.ok) {
                    setMessage('EB Service Link updated successfully!');
                    window.location.reload();
                  }
                } catch (error) {
                  console.error('Error:', error);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2">Project Name</label>
                  <Select
                    value={editSelectedProject}
                    onChange={setEditSelectedProject}
                    options={siteNames.map(site => ({
                      value: site.siteNo,
                      label: site.siteName
                    }))}
                    placeholder="Select Project Name"
                    isSearchable
                    isClearable
                    className="w-96 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg"
                    styles={customSelectStyles}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2">Door No</label>
                  <input
                    type="text"
                    className="w-96 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter Door No"
                    value={editDoorNo}
                    onChange={(e) => setEditDoorNo(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2">EB Service No</label>
                  <input
                    type="text"
                    className="w-96 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                    placeholder="Enter EB Service No"
                    value={editEbServiceNo}
                    onChange={(e) => setEditEbServiceNo(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end mr-2 space-x-2 mt-4 mb-4">
                  <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                    Update
                  </button>
                  <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={() => setIsEbServiceLinkEditOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {isSupportStaffNameOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeSupportStaffName}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitSupportStaffName}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-56">Support Staff Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Support Staff Name"
                  onChange={(e) => setSupportStaffName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-56">Mobile Number</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Mobile Number"
                  onChange={(e) => setSupportStaffMobileNumber(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end mr-5 space-x-2 mt-4 ">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeSupportStaffName}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )
      }

      {isSupportStaffNameEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={() => setIsSupportStaffNameEditOpen(false)}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`https://backendaab.in/aabuildersDash/api/support_staff/edit/${selectedSupportStaffNameId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ support_staff_name: editSupportStaffName, mobile_number: editSupportStaffMobileNumber }),
                });
                if (response.ok) {
                  setMessage('Support Staff Name updated successfully!');
                  setIsSupportStaffNameEditOpen(false);
                  window.location.reload();
                }
              } catch (error) {
                console.error('Error:', error);
              }
            }}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-56">Support Staff Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Support Staff Name"
                  value={editSupportStaffName}
                  onChange={(e) => setEditSupportStaffName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 -ml-56">Mobile Number</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Mobile Number"
                  value={editSupportStaffMobileNumber}
                  onChange={(e) => setEditSupportStaffMobileNumber(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end mr-5 space-x-2 mt-4 ">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Update
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={() => setIsSupportStaffNameEditOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProjectManagementOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[95rem] h-[40rem] text-left overflow-y-auto pl-20">
            <div className='flex justify-end mt-4 mr-8'>
              <div>
                <button className="text-red-500 " onClick={closeProjectManagement}>
                  <img src={cross} alt="close" className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmitProject}>
              <div className='h-[500px] overflow-auto'>
                <div className="flex gap-4">
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Name</label>
                    <input
                      type="text"
                      value={newProject.projectName}
                      onChange={(e) =>
                        setNewProject((prev) => ({ ...prev, projectName: e.target.value }))
                      }
                      className="w-[35rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Project Name"
                      required
                    />
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project ID</label>
                    <input className="w-[25rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Project ID"
                      type="text"
                      value={newProject.projectId}
                      onChange={(e) =>
                        setNewProject((prev) => ({ ...prev, projectId: e.target.value }))
                      }></input>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Reference Name</label>
                    <input className="w-[35rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Project Reference Name"
                      type="text"
                      value={newProject.projectReferenceName}
                      onChange={(e) =>
                        setNewProject((prev) => ({ ...prev, projectReferenceName: e.target.value }))
                      }></input>
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Category</label>
                    <select className="w-[25rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      value={newProject.projectCategory}
                      onChange={(e) =>
                        setNewProject((prev) => ({ ...prev, projectCategory: e.target.value }))
                      }>
                      <option value="">Select Project Category</option>
                      <option value="Client Project">Client Project</option>
                      <option value="Own Project">Own Project</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4 pl-5">
                  <label className="block text-lg font-medium mb-2">Project Address</label>
                  <input className="w-[62rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                    placeholder="Enter Project Address"
                    type="text"
                    value={newProject.projectAddress}
                    onChange={(e) =>
                      setNewProject((prev) => ({ ...prev, projectAddress: e.target.value }))
                    }></input>
                </div>
                {newProject.ownerDetailsList.map((owner, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex mb-2 ">
                      <div className="mt-12 mr-4">
                        {index + 1}.
                      </div>
                      <div className='flex mb-2 gap-5'>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Client Name</label>
                          <input
                            type="text"
                            value={owner.clientName}
                            onChange={(e) => handleNewOwnerChange(index, 'clientName', e.target.value)}
                            placeholder="Client Name"
                            className="w-80 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Father Name</label>
                          <input
                            type="text"
                            value={owner.fatherName}
                            onChange={(e) => handleNewOwnerChange(index, 'fatherName', e.target.value)}
                            placeholder="Father Name"
                            className="w-72 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Mobile</label>
                          <input
                            type="text"
                            value={owner.mobile}
                            onChange={(e) => handleNewOwnerChange(index, 'mobile', e.target.value)}
                            placeholder="Mobile"
                            className="w-60 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Age</label>
                          <input
                            type="text"
                            value={owner.age}
                            onChange={(e) => handleNewOwnerChange(index, 'age', e.target.value)}
                            placeholder="Age"
                            className="w-20 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                      </div>
                    </div>
                    <div className=" relative pl-4">
                      <label className="block text-lg font-medium ">Client Address</label>
                      <input
                        type="text"
                        value={owner.clientAddress}
                        onChange={(e) => handleNewOwnerChange(index, 'clientAddress', e.target.value)}
                        placeholder="Client Address"
                        className="w-[62rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedOwners = [...newProject.ownerDetailsList];
                          updatedOwners.splice(index, 1);
                          setNewProject((prev) => ({
                            ...prev,
                            ownerDetailsList: updatedOwners,
                          }));
                        }}
                        className="absolute ml-2 mt-3 text-red-500 font-bold text-xl"
                        title="Remove this owner"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="text-[#E4572E] font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]" onClick={addNewOwner}>+ Add Another Owner</button>
                {newProject.propertyDetailsList.map((detail, index) => (
                  <div className="flex mb-2 gap-5" key={index}>
                    <div className="mt-12">
                      {index + 1}.
                    </div>
                    <div className="">
                      <label className="block mb-1 text-lg font-medium">Project Type</label>
                      <select
                        value={detail.projectType}
                        onChange={(e) => handleNewDetailChange(index, 'projectType', e.target.value)}
                        className="w-40  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      >
                        <option value="">Select Type</option>
                        <option value="Shop">Shop</option>
                        <option value="House">House</option>
                        <option value="Land">Land</option>
                        <option value="Office">Office</option>
                        <option value="Construction">Construction</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Floor Name</label>
                      <select
                        value={detail.floorName}
                        onChange={(e) => handleNewDetailChange(index, 'floorName', e.target.value)}
                        className="w-36  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      >
                        <option value="">Select Floor</option>
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="First Floor">First Floor</option>
                        <option value="Second Floor">Second Floor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Shop No</label>
                      <input
                        type="text"
                        value={detail.shopNo}
                        onChange={(e) => handleNewDetailChange(index, 'shopNo', e.target.value)}
                        placeholder="Shop No"
                        className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Door No</label>
                      <input
                        type="text"
                        value={detail.doorNo}
                        onChange={(e) => handleNewDetailChange(index, 'doorNo', e.target.value)}
                        placeholder="Door No"
                        className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Area</label>
                      <input
                        type="text"
                        value={detail.area}
                        onChange={(e) => handleNewDetailChange(index, 'area', e.target.value)}
                        placeholder="Area"
                        className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-1">
                        <label className='text-lg font-medium '>EB.NO</label>
                        <div className="relative inline-flex bg-gray-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleNewDetailChange(index, 'ebNoPhase', '1P')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${(detail.ebNoPhase || '1P') === '1P'
                              ? 'bg-[#BF9853] text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-800'
                              }`}
                          >
                            1P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNewDetailChange(index, 'ebNoPhase', '3P')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${detail.ebNoPhase === '3P'
                              ? 'bg-[#BF9853] text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-800'
                              }`}
                          >
                            3P
                          </button>
                        </div>
                      </div>
                      <div className="flex">
                        <input
                          type='text'
                          value={detail.ebNo}
                          onChange={(e) => handleNewDetailChange(index, 'ebNo', e.target.value)}
                          placeholder='EB NO'
                          className='w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className='block mb-1 text-lg font-medium '>Property Tax No</label>
                      <div className="flex">
                        <input
                          type='text'
                          value={detail.propertyTaxNo}
                          onChange={(e) => handleNewDetailChange(index, 'propertyTaxNo', e.target.value)}
                          placeholder='Property Tax No'
                          className='w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className='block mb-1 text-lg font-medium '>Water Tax No</label>
                      <div className="flex">
                        <input
                          type='text'
                          value={detail.waterTaxNo}
                          onChange={(e) => handleNewDetailChange(index, 'waterTaxNo', e.target.value)}
                          placeholder='Water Tax No'
                          className='w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className="flex items-end mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedList = [...newProject.propertyDetailsList];
                          updatedList.splice(index, 1);
                          setNewProject(prev => ({
                            ...prev,
                            propertyDetailsList: updatedList,
                          }));
                        }}
                        className="text-red-500 font-bold text-xl hover:text-red-700"
                        title="Remove this row"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="text-[#E4572E] font-bold px-1 ml-3 border-dashed border-b-2 border-[#BF9853] " onClick={addNewPropertyDetail}>+ Add on</button>
              </div>
              <div className="flex justify-end mr-5 space-x-2 mt-8 mb-4">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeProjectManagement}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isProjectEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[95rem] h-[40rem] text-left overflow-y-auto pl-20">
            <div className='flex justify-end mr-8 mt-5'>
              <button className="text-red-500 " onClick={() => setIsProjectEditOpen(false)}>
                <img src={cross} alt="close" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEditProject}>
              <div className='h-[500px] overflow-auto'>
                <div className="flex gap-4">
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Name</label>
                    <input
                      type="text"
                      value={editProject.projectName}
                      onChange={(e) =>
                        setEditProject((prev) => ({ ...prev, projectName: e.target.value }))
                      }
                      className="w-[35rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Project Name"
                      required
                    />
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project ID</label>
                    <input className="w-[25rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Project ID"
                      type="text"
                      value={editProject.projectId}
                      onChange={(e) =>
                        setEditProject((prev) => ({ ...prev, projectId: e.target.value }))
                      }></input>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Reference Name</label>
                    <input className="w-[35rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Project Reference Name"
                      type="text"
                      value={editProject.projectReferenceName}
                      onChange={(e) =>
                        setEditProject((prev) => ({ ...prev, projectReferenceName: e.target.value }))
                      }></input>
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Category</label>
                    <select className="w-[25rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      value={editProject.projectCategory}
                      onChange={(e) =>
                        setEditProject((prev) => ({ ...prev, projectCategory: e.target.value }))
                      }>
                      <option value="">Select Project Category</option>
                      <option value="Client Project">Client Project</option>
                      <option value="Own Project">Own Project</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4 pl-5">
                  <label className="block text-lg font-medium mb-2">Project Address</label>
                  <input className="w-[62rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                    placeholder="Enter Project Address"
                    type="text"
                    value={editProject.projectAddress}
                    onChange={(e) =>
                      setEditProject((prev) => ({ ...prev, projectAddress: e.target.value }))
                    }></input>
                </div>
                {editProject.ownerDetailsList.map((owner, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex mb-2 ">
                      <div className="mt-12 mr-4">
                        {index + 1}.
                      </div>
                      <div className='flex mb-2 gap-5'>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Client Name</label>
                          <input
                            type="text"
                            value={owner.clientName}
                            onChange={(e) => handleEditOwnerChange(index, 'clientName', e.target.value)}
                            placeholder="Client Name"
                            className="w-80 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Father Name</label>
                          <input
                            type="text"
                            value={owner.fatherName}
                            onChange={(e) => handleEditOwnerChange(index, 'fatherName', e.target.value)}
                            placeholder="Father Name"
                            className="w-72 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Mobile</label>
                          <input
                            type="text"
                            value={owner.mobile}
                            onChange={(e) => handleEditOwnerChange(index, 'mobile', e.target.value)}
                            placeholder="Mobile"
                            className="w-60 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Age</label>
                          <input
                            type="text"
                            value={owner.age}
                            onChange={(e) => handleEditOwnerChange(index, 'age', e.target.value)}
                            placeholder="Age"
                            className="w-20 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                      </div>
                    </div>
                    <div className=" relative pl-4">
                      <label className="block text-lg font-medium ">Client Address</label>
                      <input
                        type="text"
                        value={owner.clientAddress}
                        onChange={(e) => handleEditOwnerChange(index, 'clientAddress', e.target.value)}
                        placeholder="Client Address"
                        className="w-[62rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedOwners = [...editProject.ownerDetailsList];
                          updatedOwners.splice(index, 1);
                          setEditProject((prev) => ({
                            ...prev,
                            ownerDetailsList: updatedOwners,
                          }));
                        }}
                        className="absolute ml-2 mt-3 text-red-500 font-bold text-xl"
                        title="Remove this owner"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="text-[#E4572E] font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]" onClick={addEditOwner}>+ Add Another Owner</button>
                {editProject.propertyDetailsList.map((detail, index) => (
                  <div className="flex mb-2 gap-5" key={index}>
                    <div className="mt-12">
                      {index + 1}.
                    </div>
                    <div className="">
                      <label className="block mb-1 text-lg font-medium">Project Type</label>
                      <select
                        value={detail.projectType}
                        onChange={(e) => handleEditDetailChange(index, 'projectType', e.target.value)}
                        className="w-40  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      >
                        <option value="">Select Type</option>
                        <option value="Shop">Shop</option>
                        <option value="House">House</option>
                        <option value="Land">Land</option>
                        <option value="Office">Office</option>
                        <option value="Construction">Construction</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Floor Name</label>
                      <select
                        value={detail.floorName}
                        onChange={(e) => handleEditDetailChange(index, 'floorName', e.target.value)}
                        className="w-36  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      >
                        <option value="">Select Floor</option>
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="First Floor">First Floor</option>
                        <option value="Second Floor">Second Floor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Shop No</label>
                      <input
                        type="text"
                        value={detail.shopNo}
                        onChange={(e) => handleEditDetailChange(index, 'shopNo', e.target.value)}
                        placeholder="Shop No"
                        className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Door No</label>
                      <input
                        type="text"
                        value={detail.doorNo}
                        onChange={(e) => handleEditDetailChange(index, 'doorNo', e.target.value)}
                        placeholder="Door No"
                        className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Area</label>
                      <input
                        type="text"
                        value={detail.area}
                        onChange={(e) => handleEditDetailChange(index, 'area', e.target.value)}
                        placeholder="Area"
                        className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-1">
                        <label className='text-lg font-medium '>EB.NO</label>
                        <div className="relative inline-flex bg-gray-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleEditDetailChange(index, 'ebNoPhase', '1P')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${(detail.ebNoPhase || '1P') === '1P'
                              ? 'bg-[#BF9853] text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-800'
                              }`}
                          >
                            1P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditDetailChange(index, 'ebNoPhase', '3P')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${detail.ebNoPhase === '3P'
                              ? 'bg-[#BF9853] text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-800'
                              }`}
                          >
                            3P
                          </button>
                        </div>
                      </div>
                      <div className="flex">
                        <input
                          type='text'
                          value={detail.ebNo}
                          onChange={(e) => handleEditDetailChange(index, 'ebNo', e.target.value)}
                          placeholder='EB NO'
                          className='w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className='block mb-1 text-lg font-medium '>Property Tax No</label>
                      <div className="flex">
                        <input
                          type='text'
                          value={detail.propertyTaxNo}
                          onChange={(e) => handleEditDetailChange(index, 'propertyTaxNo', e.target.value)}
                          placeholder='Property Tax No'
                          className='w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className='block mb-1 text-lg font-medium '>Water Tax No</label>
                      <div className="flex">
                        <input
                          type='text'
                          value={detail.waterTaxNo}
                          onChange={(e) => handleEditDetailChange(index, 'waterTaxNo', e.target.value)}
                          placeholder='Water Tax No'
                          className='w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className="flex items-end mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedList = [...editProject.propertyDetailsList];
                          updatedList.splice(index, 1);
                          setEditProject(prev => ({
                            ...prev,
                            propertyDetailsList: updatedList,
                          }));
                        }}
                        className="text-red-500 font-bold text-xl hover:text-red-700"
                        title="Remove this row"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="text-[#E4572E] font-bold px-1 ml-3 border-dashed border-b-2 border-[#BF9853] " onClick={addEditPropertyDetail}>+ Add on</button>
              </div>
              <div className="flex justify-end space-x-2 mt-8 mb-4 mr-5">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Update
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={() => setIsProjectEditOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditEmployeeDataOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md px-2 py-2 text-left w-[1100px]">
            <div className='p-4'>
              <div>
                <button className="text-red-500 ml-[95%]" onClick={() => setIsEditEmployeeDataOpen(false)}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <div className="flex justify-between">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  let aadhaarUrl = editAadhaarImageUrl;
                  if (editAadhaarPdfFile) {
                    try {
                      aadhaarUrl = await uploadAadhaarPdfToGoogleDrive(editAadhaarPdfFile, editEmployeeName);
                      if (!aadhaarUrl) {
                        throw new Error('Upload completed but no URL returned');
                      }
                    } catch (error) {
                      console.error('Error uploading Aadhaar PDF:', error);
                      alert('Error uploading Aadhaar PDF. Please try again.');
                      return;
                    }
                  } else {
                    console.log('No Aadhaar PDF file selected, using existing URL:', editAadhaarImageUrl);
                  }
                  const formData = new FormData();
                  const employeeDetails = {
                    employee_name: editEmployeeName,
                    employee_id: editEmployeeId,
                    employee_mobile_number: editEmployeeMobileNumber,
                    role_of_employee: editRoleOfEmployee,
                    account_holder_name: editEmpAccountHolderName,
                    account_number: editEmpAccountNumber,
                    bank_name: editEmpBankName,
                    ifsc_code: editEmpIfscCode,
                    branch: editEmpBranch,
                    upi_id: editEmpUpiId,
                    gpay_number: editEmpGpayNumber,
                    contact_email: editEmpContactEmail,
                    aadhaar_image_url: aadhaarUrl
                  };
                  const employeeBlob = new Blob([JSON.stringify(employeeDetails)], { type: 'application/json' });
                  formData.append('employeeDetails', employeeBlob);
                  if (editEmpUpiQRImage) {
                    formData.append('upi_qr_image', editEmpUpiQRImage);
                  }
                  try {
                    const response = await fetch(`https://backendaab.in/aabuildersDash/api/employee_details/edit/${selectedEmployeeDataId}`, {
                      method: 'PUT',
                      body: formData,
                    });
                    if (response.ok) {
                      setMessage('Employee data updated successfully!');
                      setIsEditEmployeeDataOpen(false);
                      window.location.reload();
                    } else {
                      console.error('Update request failed:', response.status, response.statusText);
                      alert('Failed to update employee data. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error updating employee:', error);
                    alert('Error updating employee data. Please try again.');
                  }
                }}>
                  <div className='flex justify-between gap-10'>
                    <div className='mr-5'>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Employee Name</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Employee Name"
                            value={editEmployeeName}
                            onChange={(e) => setEditEmployeeName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Employee ID</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Employee ID"
                            value={editEmployeeId}
                            onChange={(e) => setEditEmployeeId(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Designation</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Designation"
                            value={editRoleOfEmployee}
                            onChange={(e) => setEditRoleOfEmployee(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Mobile Number</label>
                          <input
                            type="text"
                            className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                            placeholder="Enter Mobile Number"
                            value={editEmployeeMobileNumber}
                            onChange={(e) => setEditEmployeeMobileNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Account Holder Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter Account Holder Name"
                              value={editEmpAccountHolderName}
                              onChange={(e) => setEditEmpAccountHolderName(e.target.value)}
                              disabled={!isEmployeeEditMode}
                            />
                            {!isEmployeeEditMode && (
                              <CopyButton
                                text={editEmpAccountHolderName}
                                fieldName="Account Holder Name"
                                buttonId="employee-account-holder-name"
                              />
                            )}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Account Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter Account Number"
                              value={editEmpAccountNumber}
                              onChange={(e) => setEditEmpAccountNumber(e.target.value)}
                              disabled={!isEmployeeEditMode}
                            />
                            {!isEmployeeEditMode && (
                              <CopyButton
                                text={editEmpAccountNumber}
                                fieldName="Account Number"
                                buttonId="employee-account-number"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Bank Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter Bank Name"
                              value={editEmpBankName}
                              onChange={(e) => setEditEmpBankName(e.target.value)}
                              disabled={!isEmployeeEditMode}
                            />
                            {!isEmployeeEditMode && (
                              <CopyButton
                                text={editEmpBankName}
                                fieldName="Bank Name"
                                buttonId="employee-bank-name"
                              />
                            )}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">IFSC Code</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter IFSC Code"
                              value={editEmpIfscCode}
                              onChange={(e) => setEditEmpIfscCode(e.target.value)}
                              disabled={!isEmployeeEditMode}
                            />
                            {!isEmployeeEditMode && (
                              <CopyButton
                                text={editEmpIfscCode}
                                fieldName="IFSC Code"
                                buttonId="employee-ifsc-code"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Branch</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter Branch"
                              value={editEmpBranch}
                              onChange={(e) => setEditEmpBranch(e.target.value)}
                              disabled={!isEmployeeEditMode}
                            />
                            {!isEmployeeEditMode && (
                              <CopyButton
                                text={editEmpBranch}
                                fieldName="Branch"
                                buttonId="employee-branch"
                              />
                            )}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">UPI ID</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter UPI ID"
                              value={editEmpUpiId}
                              onChange={(e) => setEditEmpUpiId(e.target.value)}
                              disabled={!isEmployeeEditMode}
                            />
                            {!isEmployeeEditMode && (
                              <CopyButton
                                text={editEmpUpiId}
                                fieldName="UPI ID"
                                buttonId="employee-upi-id"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">GPay Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter GPay Number"
                              value={editEmpGpayNumber}
                              onChange={(e) => setEditEmpGpayNumber(e.target.value)}
                              disabled={!isEmployeeEditMode}
                            />
                            {!isEmployeeEditMode && (
                              <CopyButton
                                text={editEmpGpayNumber}
                                fieldName="GPay Number"
                                buttonId="employee-gpay-number"
                              />
                            )}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-lg font-medium mb-2">Contact Email</label>
                          <div className="relative">
                            <input
                              type="email"
                              className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                              placeholder="Enter Contact Email"
                              value={editEmpContactEmail}
                              onChange={(e) => setEditEmpContactEmail(e.target.value)}
                              disabled={!isEmployeeEditMode}
                            />
                            {!isEmployeeEditMode && (
                              <CopyButton
                                text={editEmpContactEmail}
                                fieldName="Contact Email"
                                buttonId="employee-contact-email"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-52 mt-10">
                      <div>
                        <div className="mb-4">
                          <div className="w-48 h-48 border-2 border-[#BF9853] border-opacity-35 rounded-lg flex items-center justify-center bg-gray-50">
                            {editEmpUpiQRImagePreview ? (
                              <img src={editEmpUpiQRImagePreview} alt="QR Preview" className="w-full h-full object-contain rounded-lg" />
                            ) : editEmpUpiQRImage ? (
                              <img src={URL.createObjectURL(editEmpUpiQRImage)} alt="QR Preview" className="w-full h-full object-contain rounded-lg" />
                            ) : (
                              <span className="text-gray-400 text-sm">Profile Preview</span>
                            )}
                          </div>
                        </div>
                        <div className="mb-4">
                          <input
                            type="file"
                            id="editEmployeeQrImageUpload"
                            accept="image/*"
                            onChange={(e) => {
                              setEditEmpUpiQRImage(e.target.files[0]);
                              setEditEmpUpiQRImagePreview(null);
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('editEmployeeQrImageUpload').click()}
                            className="w-52 bg-[#BF9853] text-white px-4 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                          >
                            Add Image
                          </button>
                        </div>
                        <div className="mb-4">
                          <button
                            type="button"
                            onClick={() => setIsEmployeeEditMode(!isEmployeeEditMode)}
                            className="w-52 bg-[#BF9853] text-white px-4 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                          >
                            {isEmployeeEditMode ? 'Disable Edit' : 'Edit Employee Details'}
                          </button>
                        </div>
                      </div>
                      <div className="flex space-x-2 justify-end mt-40 ml-5">
                        <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                          Update
                        </button>
                        <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={resetEmployeeData}>
                          Cancel
                        </button>
                      </div>
                      <div className="mt-4 ml-5">
                        <input
                          type="file"
                          id="editAadhaarPdfUpload"
                          accept=".pdf"
                          onChange={(e) => setEditAadhaarPdfFile(e.target.files[0])}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => document.getElementById('editAadhaarPdfUpload').click()}
                            className="bg-[#BF9853] text-white px-2 py-2 w-48 -ml-14 rounded-lg hover:bg-yellow-800 font-semibold"
                          >
                            Select Aadhaar PDF
                          </button>
                          {editAadhaarImageUrl && (
                            <button
                              type="button"
                              onClick={() => window.open(editAadhaarImageUrl, '_blank')}
                              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 font-semibold"
                              title="View existing Aadhaar PDF"
                            >
                              📄
                            </button>
                          )}
                        </div>
                        {editAadhaarPdfFile && (
                          <p className="text-sm text-green-600 mt-2 -ml-14">Selected: {editAadhaarPdfFile.name}</p>
                        )}
                        {editAadhaarImageUrl && !editAadhaarPdfFile && (
                          <p className="text-sm text-blue-600 mt-2 -ml-14">Current: Aadhaar PDF uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {isEditLaboursListDataOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[30rem] h-80 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={() => setIsEditLaboursListDataOpen(false)}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`https://backendaab.in/aabuildersDash/api/labours-details/edit/${selectedLabourDataId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    labour_name: editLabourName,
                    labour_salary: editLabourSalary
                  }),
                });
                if (response.ok) {
                  setMessage('Labour data updated successfully!');
                  setIsEditLaboursListDataOpen(false);
                  window.location.reload();
                }
              } catch (error) {
                console.error('Error:', error);
              }
            }}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-64">Labour Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Name"
                  value={editLabourName}
                  onChange={(e) => setEditLabourName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-80">Salary</label>
                <input
                  type="number"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Salary"
                  value={editLabourSalary}
                  onChange={(e) => setEditLabourSalary(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4 mr-2">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Update
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={() => setIsEditLaboursListDataOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )
      }
      {isAccountDetailsEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md px-2 py-2 text-left w-[1100px]">
            <div className='p-2'>
              <div>
                <button className="text-red-500 ml-[98%] " onClick={resetAccountData}>
                  <img src={cross} alt='cross' className='w-5 h-5 -mt-7 ml-2' />
                </button>
              </div>
              <div className="flex justify-between">
                <div className="flex">
                  <form className='' onSubmit={async (e) => {
                    e.preventDefault();
                    let qrImageBase64 = null;
                    if (editQrImagePreview) {
                      qrImageBase64 = editQrImagePreview.includes(',') ? editQrImagePreview.split(',')[1] : editQrImagePreview;
                    }
                    const updateData = {
                      account_holder_name: editAccountHolderName,
                      account_number: editAccountNumber,
                      bank_name: editBankName,
                      branch: editBranch,
                      ifsc_code: editIfscCode,
                      upi_id: editUpiId,
                      gpay_number: editGpayNumber,
                      account_type: editAccountType,
                      upi_qr_image: qrImageBase64
                    };
                    try {
                      const response = await fetch(`https://backendaab.in/aabuildersDash/api/account-details/update/${selectedAccountId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData),
                      });
                      if (response.ok) {
                        setMessage('Account details updated successfully!');
                        setIsAccountDetailsEditOpen(false);
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error('Error:', error);
                    }
                  }}>
                    <div className='flex gap-16'>
                      <div>
                        <div className='flex gap-4'>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">Account Holder Name</label>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                placeholder="Enter Account Holder Name"
                                value={editAccountHolderName}
                                onChange={(e) => setEditAccountHolderName(e.target.value)}
                                disabled={!isAccountEditMode}
                                required
                              />
                              {!isAccountEditMode && (
                                <CopyButton
                                  text={editAccountHolderName}
                                  fieldName="Account Holder Name"
                                  buttonId="account-holder-name"
                                />
                              )}
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">Account Number</label>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                placeholder="Enter Account Number"
                                value={editAccountNumber}
                                onChange={(e) => setEditAccountNumber(e.target.value)}
                                disabled={!isAccountEditMode}
                                required
                              />
                              {!isAccountEditMode && (
                                <CopyButton
                                  text={editAccountNumber}
                                  fieldName="Account Number"
                                  buttonId="account-number"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='flex gap-4'>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">Bank Name</label>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                placeholder="Enter Bank Name"
                                value={editBankName}
                                onChange={(e) => setEditBankName(e.target.value)}
                                disabled={!isAccountEditMode}
                                required
                              />
                              {!isAccountEditMode && (
                                <CopyButton
                                  text={editBankName}
                                  fieldName="Bank Name"
                                  buttonId="account-bank-name"
                                />
                              )}
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">IFSC Code</label>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                placeholder="Enter IFSC Code"
                                value={editIfscCode}
                                onChange={(e) => setEditIfscCode(e.target.value)}
                                disabled={!isAccountEditMode}
                                required
                              />
                              {!isAccountEditMode && (
                                <CopyButton
                                  text={editIfscCode}
                                  fieldName="IFSC Code"
                                  buttonId="account-ifsc-code"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='flex gap-4'>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">Branch</label>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                placeholder="Enter Branch"
                                value={editBranch}
                                onChange={(e) => setEditBranch(e.target.value)}
                                disabled={!isAccountEditMode}
                                required
                              />
                              {!isAccountEditMode && (
                                <CopyButton
                                  text={editBranch}
                                  fieldName="Branch"
                                  buttonId="account-branch"
                                />
                              )}
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">UPI ID</label>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                placeholder="Enter UPI ID"
                                value={editUpiId}
                                onChange={(e) => setEditUpiId(e.target.value)}
                                disabled={!isAccountEditMode}
                              />
                              {!isAccountEditMode && (
                                <CopyButton
                                  text={editUpiId}
                                  fieldName="UPI ID"
                                  buttonId="account-upi-id"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='flex gap-4'>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">GPay Number</label>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                placeholder="Enter GPay Number"
                                value={editGpayNumber}
                                onChange={(e) => setEditGpayNumber(e.target.value)}
                                disabled={!isAccountEditMode}
                              />
                              {!isAccountEditMode && (
                                <CopyButton
                                  text={editGpayNumber}
                                  fieldName="GPay Number"
                                  buttonId="account-gpay-number"
                                />
                              )}
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">Account Type</label>
                            <div className="relative">
                              {isAccountEditMode ? (
                                <select
                                  className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 focus:outline-none"
                                  value={editAccountType}
                                  onChange={(e) => setEditAccountType(e.target.value)}
                                  required
                                >
                                  <option value="">Select Account Type</option>
                                  {bankAccountTypes.map((type) => (
                                    <option key={type.id} value={type.bank_account_type}>
                                      {type.bank_account_type}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 pr-12 rounded-lg h-14 bg-gray-50 flex items-center text-gray-800">
                                  <span className={`truncate ${editAccountType ? '' : 'text-gray-400 '}`}>
                                    {editAccountType || 'Select Account Type'}
                                  </span>
                                </div>
                              )}
                              {!isAccountEditMode && (
                                <CopyButton
                                  text={editAccountType}
                                  fieldName="Account Type"
                                  buttonId="account-type"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-52 mt-10">
                        <div>
                          <div className="mb-4">
                            <div className="w-52 h-52 border-2 border-[#BF9853] border-opacity-35 rounded-lg flex items-center justify-center bg-gray-50">
                              {editQrImagePreview ? (
                                <img src={editQrImagePreview} alt="QR Preview" className="w-full h-full object-contain rounded-lg" />
                              ) : (
                                <span className="text-gray-400 text-sm">QR Image Preview</span>
                              )}
                            </div>
                          </div>
                          <div className="mb-4">
                            <input
                              type="file"
                              id="editQrImageUpload"
                              accept="image/*"
                              onChange={handleEditQrImageUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById('editQrImageUpload').click()}
                              className="w-52 bg-[#BF9853] text-white px-4 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                            >
                              Add QR
                            </button>
                          </div>
                          <div className="mb-4">
                            <button
                              type="button"
                              onClick={() => setIsAccountEditMode(!isAccountEditMode)}
                              className="w-52 bg-[#BF9853] text-white px-4 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                            >
                              {isAccountEditMode ? 'Disable Edit' : 'Edit Account Details'}
                            </button>
                          </div>
                        </div>
                        <div className="flex space-x-2 justify-end mt-16">
                          <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                            Update
                          </button>
                          <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={resetAccountData}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      )
      }
      {tooltipData && (
        <div className="fixed z-50 bg-white text-black p-3 rounded shadow-lg text-sm max-w-xs border"
          style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y - 10, pointerEvents: 'none' }}
        >
          {tooltipData.map((entry, index) => (
            <div key={index} className="mb-1">
              <span className="font-semibold text-gray-700">{entry.label}:</span>
              <span className="ml-1 text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      )
      }
      {isExportTypeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg px-8 py-6 w-96">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#BF9853]">Select Export Type</h2>
              <button onClick={() => setIsExportTypeModalOpen(false)} className="text-red-500 hover:text-red-700">
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <button onClick={() => handleExportTypeSelect('pdf')} className="bg-[#BF9853] text-white px-8 py-4 rounded-lg hover:bg-yellow-800 font-semibold text-lg transition-colors">
                Export as PDF
              </button>
              <button onClick={() => handleExportTypeSelect('excel')} className="bg-[#BF9853] text-white px-8 py-4 rounded-lg hover:bg-yellow-800 font-semibold text-lg transition-colors">
                Export as Excel
              </button>
            </div>
          </div>
        </div>
      )}
      {isExportSelectionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg px-6 py-6 w-[1200px] max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#BF9853]">
                Select {
                  exportDataType === 'vendor' ? 'Vendors' :
                    exportDataType === 'contractor' ? 'Contractors' :
                      exportDataType === 'employee' ? 'Employees' :
                        exportDataType === 'project' ? 'Projects' :
                          'EB Service Links'
                } to Export
              </h2>
              <button onClick={() => setIsExportSelectionModalOpen(false)} className="text-red-500 hover:text-red-700">
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <div className="flex gap-6 flex-1 overflow-hidden">
              <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Available {exportDataType === 'vendor' ? 'Vendors' : exportDataType === 'contractor' ? 'Contractors' : exportDataType === 'employee' ? 'Employees' : exportDataType === 'project' ? 'Projects' : 'EB Service Links'}
                </h3>
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full border-2 border-[#BF9853] border-opacity-35 rounded-lg p-3 pr-10 focus:outline-none focus:border-[#BF9853]"
                      placeholder={`Search ${exportDataType === 'vendor' ? 'vendor' :
                        exportDataType === 'contractor' ? 'contractor' :
                          exportDataType === 'employee' ? 'employee' :
                            exportDataType === 'project' ? 'project' :
                              'EB service link'
                        }...`}
                      value={exportSearchTerm}
                      onChange={(e) => setExportSearchTerm(e.target.value)}
                    />
                    <img src={search} alt='search' className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5' />
                  </div>
                </div>
                {exportDataType === 'project' && (
                  <div className="mb-4">
                    <select
                      className="w-full border-2 border-[#BF9853] border-opacity-35 rounded-lg p-3 focus:outline-none focus:border-[#BF9853]"
                      value={exportProjectCategory}
                      onChange={(e) => setExportProjectCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {projectCategoryOptions.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex space-x-3 mb-4">
                  <button onClick={handleSelectAllExportItems} className="px-4 py-2 bg-[#BF9853] text-white rounded-lg hover:bg-yellow-800 font-semibold text-sm transition-colors" >
                    Select All
                  </button>
                  <button onClick={handleDeselectAllExportItems} className="px-4 py-2 border-2 border-[#BF9853] text-[#BF9853] rounded-lg hover:bg-[#FAF6ED] font-semibold text-sm transition-colors" >
                    Deselect All
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto border-2 border-[#BF9853] border-opacity-35 rounded-lg p-3">
                  {(exportDataType === 'vendor' ? filteredExportVendors : exportDataType === 'contractor' ? filteredExportContractors : exportDataType === 'employee' ? getFilteredExportData() : exportDataType === 'project' ? filteredExportProjects : filteredExportEbServiceLinks).length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No {
                        exportDataType === 'vendor' ? 'vendors' :
                          exportDataType === 'contractor' ? 'contractors' :
                            exportDataType === 'employee' ? 'employees' :
                              exportDataType === 'project' ? 'projects' :
                                'EB service links'
                      } found
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(exportDataType === 'vendor' ? filteredExportVendors : exportDataType === 'contractor' ? filteredExportContractors : exportDataType === 'employee' ? getFilteredExportData() : exportDataType === 'project' ? filteredExportProjects : filteredExportEbServiceLinks).map((item) => (
                        <label key={item.id} className="flex items-center p-3 hover:bg-[#FAF6ED] rounded-lg cursor-pointer transition-colors" >
                          <input
                            type="checkbox"
                            checked={selectedExportItems.includes(item.id)}
                            onChange={() => handleExportItemToggle(item.id)}
                            className="w-5 h-5 text-[#BF9853] border-2 border-[#BF9853] rounded focus:ring-[#BF9853] cursor-pointer"
                          />
                          <span className="ml-3 text-base font-medium">
                            {
                              exportDataType === 'vendor' ? item.vendorName :
                                exportDataType === 'contractor' ? item.contractorName :
                                  exportDataType === 'employee' ? item.employee_name :
                                    exportDataType === 'project' ? `${item.projectId || ''} - ${item.projectName || ''}` :
                                      `${item.project_id || item.projectId || ''} - ${item.door_no || item.doorNo || ''} - ${item.eb_service_no || item.ebServiceNo || ''}`
                            }
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Selected Items ({selectedExportItems.length})
                  </h3>
                </div>
                <div className="flex-1 overflow-hidden border-2 border-[#BF9853] border-opacity-35 rounded-lg">
                  {selectedExportItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm">No items selected</p>
                        <p className="text-xs mt-1">Select items from the left to see them here</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-y-auto h-full">
                      <table className="w-full">
                        <thead className="bg-[#BF9853] text-white sticky top-0 z-10">
                          <tr>
                            <th className="p-3 text-left font-semibold text-sm">ID</th>
                            <th className="p-3 text-left font-semibold text-sm">
                              {
                                exportDataType === 'vendor' ? 'Vendor Name' :
                                  exportDataType === 'contractor' ? 'Contractor Name' :
                                    exportDataType === 'employee' ? 'Employee Name' :
                                      exportDataType === 'project' ? 'Project' :
                                        'EB Service Link'
                              }
                            </th>
                            <th className="p-3 text-center font-semibold text-sm w-20">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedExportItems.map((itemId, index) => {
                            let item = null;
                            if (exportDataType === 'vendor') {
                              item = vendorNames.find(v => v.id === itemId);
                            } else if (exportDataType === 'contractor') {
                              item = contractorNames.find(c => c.id === itemId);
                            } else if (exportDataType === 'employee') {
                              item = employeeList.find(e => e.id === itemId);
                            } else if (exportDataType === 'project') {
                              item = projects.find(p => p.id === itemId);
                            } else if (exportDataType === 'ebServiceLink') {
                              item = ebServiceLinks.find(link => link.id === itemId);
                            }
                            if (!item) return null;
                            return (
                              <tr
                                key={itemId}
                                className={`border-b border-gray-200 hover:bg-[#FAF6ED] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }`}
                              >
                                <td className="p-3 text-sm font-medium text-left text-gray-700">
                                  {item.id}
                                </td>
                                <td className="p-3 text-sm text-left text-gray-900">
                                  {
                                    exportDataType === 'vendor' ? item.vendorName :
                                      exportDataType === 'contractor' ? item.contractorName :
                                        exportDataType === 'employee' ? item.employee_name :
                                          exportDataType === 'project' ? `${item.projectId || ''} - ${item.projectName || ''}` :
                                            `${item.project_id || item.projectId || ''} - ${item.door_no || item.doorNo || ''} - ${item.eb_service_no || item.ebServiceNo || ''}`
                                  }
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleExportItemToggle(itemId)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                    title="Remove"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={exportType === 'pdf' ? handleExportToPDF : handleExportToExcel}
                className="bg-[#BF9853] text-white px-8 py-3 rounded-lg hover:bg-yellow-800 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedExportItems.length === 0}
              >
                Export {exportType === 'pdf' ? 'PDF' : 'Excel'} ({selectedExportItems.length} items)
              </button>
              <button
                onClick={() => setIsExportSelectionModalOpen(false)}
                className="px-8 py-3 border-2 border-[#BF9853] text-[#BF9853] rounded-lg hover:bg-[#FAF6ED] font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};
export default MasterData;