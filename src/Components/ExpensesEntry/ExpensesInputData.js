import React, { useState, useEffect } from 'react';
import axios from 'axios';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
const DTableView = ({username, userRoles = []}) => {
  const [isSiteNamesOpen, setIsSiteNamesOpen] = useState(false);
  const [isMachineToolsOpen, setIsMachineToolsOpen] = useState(false);
  const [isAccountTypesOpen, setAccountTypesOpen] = useState(false);
  const [isVendorNameOpens, setIsVendorNameOpens] = useState(false);
  const [isContractorNameOpens, setContractorNameOpens] = useState(false);
  const [isEditSiteNameOpen, setIsEditSiteNameOpen] = useState(false);
  const [isEditWeeklyTypeOpen, setIsEditWeeklyTypeOpen] = useState(false);
  const [isWeeklyTypeOpen, setIsWeeklyTypeOpen] = useState(false);
  const [editSiteName, setEditSiteName] = useState('');
  const [editSiteNo, setEditSiteNo] = useState('');
  const [editVendorName, setEditVendorName] = useState('');
  const [editContractorName, setEditContractorName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAccountType, setEditAccountType] = useState('');
  const [editWeeklyType, setEditWeeklyType] = useState('');
  const [editMachineTool, setEditMachineTool] = useState('');
  const [isVendorEditOpen, setIsVendorEditOpen] = useState(false);
  const [isContractorEditOpen, setIsContractorEditOpen] = useState(false);
  const [isCategoriesEditOpen, setIsCategoriesEditOpen] = useState(false);
  const [isAccountTypeEditOpen, setIsAccountTypeEditOpen] = useState(false);
  const [isMachineToolsEditOpen, setIsMachineToolsEditOpen] = useState(false);
  const [isSiteNoInitialized, setIsSiteNoInitialized] = useState(false);
  const [isCategoryOpens, setIsCategoryOpens] = useState(false);
  const openSiteNames = () => setIsSiteNamesOpen(true);
  const closeSiteNames = () => setIsSiteNamesOpen(false);
  const openMachineTools = () => setIsMachineToolsOpen(true);
  const closeMachineTools = () => setIsMachineToolsOpen(false);
  const openvendorNames = () => setIsVendorNameOpens(true);
  const closevendorNames = () => setIsVendorNameOpens(false);
  const openContractorNames = () => setContractorNameOpens(true);
  const closeContractorNames = () => setContractorNameOpens(false);
  const openAccountTypes = () => setAccountTypesOpen(true);
  const closeAccountTypes = () => setAccountTypesOpen(false);
  const openWeeklyTypes = () => setIsWeeklyTypeOpen(true);
  const closeWeeklyTypes = () => setIsWeeklyTypeOpen(false);
  const openCategory = () => setIsCategoryOpens(true);
  const closeCategory = () => setIsCategoryOpens(false);
  const [file, setFile] = useState(null);
  const [siteNameSearch, setSiteNameSearch] = useState("");
  const [vendorNameSearch, setVendorNameSearch] = useState("");
  const [contractorNameSearch, setContractorNameSearch] = useState("");
  const [expensesCategorySearch, setExpensesCategorySearch] = useState("");
  const [machineToolsSearch, setMachineToolsSearch] = useState("");
  const [accountTypeSearch, setAccountTypeSearch] = useState("");
  const [weeklyTypeSearch, setWeeklyTypeSearch] = useState('');
  const [siteName, setSiteName] = useState('');
  const [machineTool, setMachineTool] = useState('');
  const [accountType, setAccountType] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [weeklyType, setWeeklyType] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [category, setCategory] = useState('');
  const [siteNo, setSiteNo] = useState('');
  const [siteNames, setSiteNames] = useState([]);
  const [vendorNames, setVendorNames] = useState([]);
  const [contractorNames, setContractorNames] = useState([]);
  const [expensesCategory, setExpensesCategory] = useState([]);
  const [machineToolsOptions, setMachineToolsOptions] = useState([]);
  const [expensesAccountType, setExpensesAccountType] = useState([]);
  const [weeklyTypes, setWeeklyTypes] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSiteNamesModelOpens, setIsSiteNamesModelOpens] = useState(false);
  const [isVendorNameModelOpens, setIsVendorNameModelOpens] = useState(false);
  const [isContractorNameModelOpens, setIsContractorNameModelOpens] = useState(false);
  const [isCategoryModelOpens, setIsCategoryModelOpens] = useState(false);
  const [isMachineToolsModelOpen, setIsMachineToolsModelOpen] = useState(false);
  const [isAccountTypesModelOpen, setIsAccountTypesModelOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [selectedAccountTypeId, setSelectedAccountTypeId] = useState(null);
  const [selectedWeeklyTypeId, setSelectedWeeklyTypeId] = useState(null);
  const [message, setMessage] = useState('');
  console.log(message);
  const openSiteNamesModals = () => setIsSiteNamesModelOpens(true);
  const openVendorNamesModals = () => setIsVendorNameModelOpens(true);
  const openContractorNamesModals = () => setIsContractorNameModelOpens(true);
  const openCategoryModels = () => setIsCategoryModelOpens(true);
  const openAccountTypesModels = () => setIsAccountTypesModelOpen(true);
  const closeAccountTypesModels = () => setIsAccountTypesModelOpen(false);
  const openMachineToolsModels = () => setIsMachineToolsModelOpen(true);
  const closeSiteNamesModals = () => setIsSiteNamesModelOpens(false);
  const closeVendorNamesModals = () => setIsVendorNameModelOpens(false);
  const closeContractorNamesModals = () => setIsContractorNameModelOpens(false);
  const closeCategoryModels = () => setIsCategoryModelOpens(false);
  const closeMachineToolModels = () => setIsMachineToolsModelOpen(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const moduleName = "Expense Entry";
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const response = await axios.get("https://backendaab.in/aabuilderDash/api/user_roles/all");
        const allRoles = response.data;
        const userRoleNames = userRoles.map(r => r.roles);
        const matchedRoles = allRoles.filter(role =>
          userRoleNames.includes(role.userRoles)
        );
        const models = matchedRoles.flatMap(role => role.userModels || []);
        const matchedModel = models.find(role => role.models === moduleName);
        const permissions = matchedModel?.permissions?.[0]?.userPermissions || [];
        setUserPermissions(permissions);
      } catch (error) {
        console.error("Error fetching user roles:", error);
      }
    };
    if (userRoles.length > 0) {
      fetchUserRoles();
    }
  }, [userRoles]);
  const openEditSiteNamePopup = (item) => {
    setEditSiteName(item.siteName);
    setEditSiteNo(item.siteNo);
    setSelectedSiteId(item.id);
    setIsEditSiteNameOpen(true);
  };
  const closeEditSiteNamePopup = () => {
    setIsEditSiteNameOpen(false);
    setEditSiteName('');
    setEditSiteNo('');
    setSelectedSiteId(null);
  };
  const openEditVendorPopup = (item) => {
    setEditVendorName(item.vendorName);
    setSelectedVendorId(item.id);
    setIsVendorEditOpen(true);
  };
  const closeEditVendorPopup = () => {
    setIsVendorEditOpen(false);
    setEditVendorName('');
    setSelectedVendorId(null);
  };
  const openEditContractorPopup = (item) => {
    setEditContractorName(item.contractorName);
    setSelectedContractorId(item.id);
    setIsContractorEditOpen(true);
  }
  const closeEditContractorPopup = () => {
    setIsContractorEditOpen(false);
    setEditContractorName('');
    setSelectedContractorId(null);
  }
  const openEditCategoryPopup = (item) => {
    setEditCategory(item.category);
    setSelectedCategoryId(item.id);
    setIsCategoriesEditOpen(true);
  }
  const closeEditCategoryPopup = () => {
    setIsCategoriesEditOpen(false);
    setEditCategory('');
    setSelectedCategoryId('');
  }
  const openEditAccountTypePopup = (item) => {
    setEditAccountType(item.accountType);
    setSelectedAccountTypeId(item.id);
    setIsAccountTypeEditOpen(true);
  }
  const openEditWeeklyTypePopup = (item) =>{
    setEditWeeklyType(item.type);
    setSelectedWeeklyTypeId(item.id)
    setIsEditWeeklyTypeOpen(true);
  }
  const closeEditAccountTypePopup = () => {
    setIsAccountTypeEditOpen(false);
    setEditAccountType('');
    setSelectedAccountTypeId('');
  }
  const closeEditWeeklyTypePopup = () => {
    setIsEditWeeklyTypeOpen(false);
    setEditWeeklyType('');
    setSelectedWeeklyTypeId('');
  }
  const openEditMachineToolsPopup = (item) => {
    setEditMachineTool(item.machineTool);
    setSelectedMachineId(item.id);
    setIsMachineToolsEditOpen(true);
  }
  const closeEditMachineToolsPopup = () => {
    setIsMachineToolsEditOpen(false);
    setEditMachineTool('');
    setSelectedMachineId('');
  }
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleUploadSiteNames = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/bulk_upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
    window.location.reload();
  };
  const handleUploadVendorNames = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/bulk_upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
    window.location.reload();
  };
  const handleUploadContractorNames = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/bulk_upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
    window.location.reload();
  };
  const handleUploadcategory = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/expenses_categories/bulk_upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
    window.location.reload();
  };
  const handleUploadMachineTools = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/machine_tools/bulk_upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
    window.location.reload();
  };
  const handleUploadAccountType = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/account_type/bulk_upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
    window.location.reload();
  };
  const handleAllSiteNameDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all Site Names?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          setSiteNames([]);
          alert("All site names have been deleted successfully.");
        } else {
          console.error("Failed to delete all area names. Status:", response.status);
          alert("Error deleting the area names. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting all area names:", error);
        alert("An error occurred while deleting all area names.");
      }
    } else {
      console.log("Deletion cancelled.");
    }
  };
  const handleAllVendorNameDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all Site Names?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          setVendorName([]);
          alert("All vendor names have been deleted successfully.");
        } else {
          console.error("Failed to delete all area names. Status:", response.status);
          alert("Error deleting the area names. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting all area names:", error);
        alert("An error occurred while deleting all area names.");
      }
    } else {
      console.log("Deletion cancelled.");
    }
  };
  const handleAllContractorNameDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all Site Names?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          setContractorName([]);
          alert("All contractor names have been deleted successfully.");
        } else {
          console.error("Failed to delete all area names. Status:", response.status);
          alert("Error deleting the area names. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting all area names:", error);
        alert("An error occurred while deleting all area names.");
      }
    } else {
      console.log("Deletion cancelled.");
    }
  };
  const handleAllCategoryDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all Site Names?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/expenses_categories/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          setCategory([]);
          alert("All Category have been deleted successfully.");
        } else {
          console.error("Failed to delete all area names. Status:", response.status);
          alert("Error deleting the area names. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting all area names:", error);
        alert("An error occurred while deleting all area names.");
      }
    } else {
      console.log("Deletion cancelled.");
    }
  };
  const handleAllMachineToolDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all Machine Tools?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/machine_tools/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          setMachineTool([]);
          alert("All Machine Tool have been deleted successfully.");
        } else {
          console.error("Failed to delete all area names. Status:", response.status);
          alert("Error deleting the area names. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting all area names:", error);
        alert("An error occurred while deleting all area names.");
      }
    } else {
      console.log("Deletion cancelled.");
    }
  };
  const handleAllAccountTypes = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all Machine Tools?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/account_type/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          setAccountType([]);
          alert("All Machine Tool have been deleted successfully.");
        } else {
          console.error("Failed to delete all area names. Status:", response.status);
          alert("Error deleting the area names. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting all area names:", error);
        alert("An error occurred while deleting all area names.");
      }
    } else {
      console.log("Deletion cancelled.");
    }
  };
  const handleDeleteAllWeeklyTypes = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all Machine Tools?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/weekly_types/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          setWeeklyTypes([]);
          alert("All Type have been deleted successfully.");
        } else {
          console.error("Failed to delete all Types. Status:", response.status);
          alert("Error deleting the Types. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting all Types:", error);
        alert("An error occurred while deleting all Types.");
      }
    } else {
      console.log("Deletion cancelled.");
    }
  };
  useEffect(() => {
    fetchSiteNames();
  }, []);
  const fetchSiteNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        setSiteNames(data);
        console.log(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchVendorNames();
  }, []);
  const fetchVendorNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        setVendorNames(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchContractorNames();
  }, []);
  const fetchContractorNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/contractor_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        setContractorNames(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/expenses_categories/getAll');
      if (response.ok) {
        const data = await response.json();
        setExpensesCategory(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchMachinTools();
  }, []);
  const fetchMachinTools = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/machine_tools/getAll');
      if (response.ok) {
        const data = await response.json();
        setMachineToolsOptions(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchAccountType();
  }, []);
  const fetchAccountType = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/account_type/getAll');
      if (response.ok) {
        const data = await response.json();
        setExpensesAccountType(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchWeeklyType();
  }, []);
  const fetchWeeklyType = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/weekly_types/getAll');
      if (response.ok) {
        const data = await response.json();
        setWeeklyTypes(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  const handleSubmitSiteNames = async (e) => {
    e.preventDefault();
    const newSiteNames = { siteName, siteNo };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSiteNames),
      });
      if (response.ok) {
        setMessage('Site name saved successfully!');
        window.location.reload();
      } else {
        setMessage('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving area name.');
    }
  };
  const handleSubmitMachineTools = async (e) => {
    e.preventDefault();
    const newMachineTool = { machineTool };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/machine_tools/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMachineTool),
      });
      if (response.ok) {
        setMessage('Area name saved successfully!');
        setMachineTool('');
        window.location.reload();
      } else {
        setMessage('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving area name.');
    }
  };
  const handleSubmitAccountTypes = async (e) => {
    e.preventDefault();
    const newAccountType = { accountType };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/account_type/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccountType),
      });
      if (response.ok) {
        setMessage('Account Type saved successfully!');
        setAccountType('');
        window.location.reload();
      } else {
        setMessage('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving area name.');
    }
  };
  const handleSubmitWeeklyTypes = async (e) => {
    e.preventDefault();
    const newWeeklyType = { type: weeklyType };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/weekly_types/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWeeklyType),
      });
      if (response.ok) {
        setMessage('Weekly Type saved successfully!');
        setWeeklyType('');
        window.location.reload();
      } else {
        setMessage('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving area name.');
    }
  };
  const handleSubmitVendorName = async (e) => {
    e.preventDefault();
    const newVendorName = { vendorName };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVendorName),
      });
      if (response.ok) {
        setMessage('Area name saved successfully!');
        setVendorName('');
        window.location.reload();
      } else {
        setMessage('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving area name.');
    }
  };
  const handleSubmitContractorName = async (e) => {
    e.preventDefault();
    const newContractorName = { contractorName };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/contractor_Names/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContractorName),
      });
      if (response.ok) {
        setMessage('Area name saved successfully!');
        setContractorName('');
        window.location.reload();
      } else {
        setMessage('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving area name.');
    }
  };
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    const newCategory = { category };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/expenses_categories/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      if (response.ok) {
        setMessage('Area name saved successfully!');
        setCategory('');
        window.location.reload();
      } else {
        setMessage('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving area name.');
    }
  };
  const handleSiteNameDelete = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/project_Names/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert("Site Name deleted successfully!!!");
        window.location.reload();
      } else {
        console.error("Failed to delete the site name. Status:", response.status);
        alert("Error deleting the site name. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the Site Name.");
    }
  };
  const handleEditSiteName = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/project_Names/edit/${selectedSiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siteName: editSiteName, siteNo: editSiteNo }),
      });
      if (response.ok) {
        closeEditSiteNamePopup();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleEditVendorName = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/vendor_Names/edit/${selectedVendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendorName: editVendorName }),
      });
      if (response.ok) {
        closeEditVendorPopup();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleEditContractorName = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/contractor_Names/edit/${selectedContractorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractorName: editContractorName }),
      });
      if (response.ok) {
        closeEditContractorPopup();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleEditCategoriesName = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/expenses_categories/edit/${selectedCategoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: editCategory }),
      });
      if (response.ok) {
        closeEditCategoryPopup();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleEditAccountTypes = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/account_type/edit/${selectedAccountTypeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountType: editAccountType }),
      });
      if (response.ok) {
        closeEditAccountTypePopup();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleEditWeeklyTypes = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly_types/edit/${selectedWeeklyTypeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({type: editWeeklyType }),
      });
      if (response.ok) {
        closeEditWeeklyTypePopup();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleEditMachineTools = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/machine_tools/edit/${selectedMachineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ machineTool: editMachineTool }),
      });
      if (response.ok) {
        closeEditMachineToolsPopup();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleVendorNameDelete = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/vendor_Names/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert("Vendor Name deleted successfully!!!");
        window.location.reload();
      } else {
        console.error("Failed to delete the vendor name. Status:", response.status);
        alert("Error deleting the vendor name. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the vendor Name.");
    }
  };
  const handleContractorNameDelete = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/contractor_Names/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert("Contractor Name deleted successfully!!!");
        window.location.reload();
      } else {
        console.error("Failed to delete the Contractor name. Status:", response.status);
        alert("Error deleting the Contractor name. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the Contractor Name.");
    }
  };
  const handleCategoriesDelete = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/expenses_categories/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert("Categories deleted successfully!!!");
        window.location.reload();
      } else {
        console.error("Failed to delete the Categories. Status:", response.status);
        alert("Error deleting the Categories. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the Contractor Name.");
    }
  };
  const handleAccountTypeDelete = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/account_type/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert("Account Type deleted successfully!!!");
        window.location.reload();
      } else {
        console.error("Failed to delete the Account Type. Status:", response.status);
        alert("Error deleting the Account Type. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the Contractor Name.");
    }
  };
  const handleWeeklyTypeDelete = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly_types/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert("Weekly Type deleted successfully!!!");
        window.location.reload();
      } else {
        console.error("Failed to delete the Account Type. Status:", response.status);
        alert("Error deleting the Account Type. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the Contractor Name.");
    }
  };
  const handleMachineToolsDelete = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/machine_tools/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert("Machine Tools deleted successfully!!!");
        window.location.reload();
      } else {
        console.error("Failed to delete the Machine Tools. Status:", response.status);
        alert("Error deleting the Machine Tools. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the Contractor Name.");
    }
  };
  const filteredSiteNames = siteNames.filter((item) =>
    item.siteName.toLowerCase().includes(siteNameSearch.toLowerCase()) ||
    item.siteNo.toLowerCase().includes(siteNameSearch.toLowerCase())
  );
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
  const filteredAccountType = expensesAccountType.filter((item) =>
    item.accountType.toLowerCase().includes(accountTypeSearch.toLowerCase())
  );
  const filteredWeeklyType = weeklyTypes.filter((item) =>
    item.type.toLowerCase().includes(weeklyTypeSearch.toLowerCase())
  );
  useEffect(() => {
    if (isSiteNamesOpen && !isSiteNoInitialized) {
      const lastSiteNo = Math.max(
        ...filteredSiteNames.map(item => Number(item.siteNo)).filter(n => !isNaN(n)),
        0
      );
      setSiteNo((lastSiteNo + 1).toString());
      setIsSiteNoInitialized(true); // Mark it as initialized
    }
    if (!isSiteNamesOpen) {
      setIsSiteNoInitialized(false); // Reset when popup is closed
    }
  }, [isSiteNamesOpen, filteredSiteNames]);
  return (
    <div className="p-4 bg-white ml-6 mr-8">
      <div className=" lg:flex space-x-[2%] lg:w-full md:w-[32rem] w-[20rem] overflow-x-auto">
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Project Name.."
              value={siteNameSearch}
              onChange={(e) => setSiteNameSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openSiteNames}>
              + Add
            </button>
          </div>
          <button onClick={openSiteNamesModals} className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <button onClick={handleAllSiteNameDelete}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[19rem] md:ml-[31rem] ml-52' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-80 ">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left lg:w-16 text-xl font-bold">P.ID</th>
                    <th className="p-2 text-left lg:w-72 text-xl font-bold">Project Name</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto lg:w-80">
                <tbody>
                  {filteredSiteNames.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{item.siteNo}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.siteName}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditSiteNamePopup(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleSiteNameDelete(item.id)} />
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
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
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
          <button onClick={openVendorNamesModals} className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' />
            <h1 className='mt-1.5 text-sm'>Import file</h1>
          </button>
          <button onClick={handleAllVendorNameDelete}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem] lg:ml-[17rem] md:ml-[30rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-72 ">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left lg:w-72 text-xl font-bold">Vendor Name</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditVendorPopup(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleVendorNameDelete(item.id)} />
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
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
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
          <button onClick={openContractorNamesModals} className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <button onClick={handleAllContractorNameDelete}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-72 ">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left lg:w-72 text-xl font-bold">Contractor Name</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto lg:w-72 w-full">
                <tbody>
                  {filteredContractorNames.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(contractorNames.findIndex(c => c.id === item.id) + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.contractorName}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditContractorPopup(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleContractorNameDelete(item.id)} />
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
          <button onClick={openCategoryModels} className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <button onClick={handleAllCategoryDelete}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-72 ">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left lg:w-72 text-xl font-bold">Category</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto lg:w-72 w-full">
                <tbody>
                  {filteredCategories.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(expensesCategory.findIndex(c => c.id === item.id) + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.category}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditCategoryPopup(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleCategoriesDelete(item.id)} />
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
          <button onClick={openMachineToolsModels} className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <button onClick={handleAllMachineToolDelete}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-72 ">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left lg:w-72 text-xl font-bold">Machine Tools</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto lg:w-72 w-full">
                <tbody>
                  {filteredMachineTools.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(machineToolsOptions.findIndex(tool => tool.id === item.id) + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.machineTool}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditMachineToolsPopup(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleMachineToolsDelete(item.id)} />
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
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search account type.."
              value={accountTypeSearch}
              onChange={(e) => setAccountTypeSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openAccountTypes}>
              + Add
            </button>
          </div>
          <button onClick={openAccountTypesModels} className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <button onClick={handleAllAccountTypes}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-72 ">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left lg:w-72 text-xl font-bold">Account Type</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto lg:w-72 w-full">
                <tbody>
                  {filteredAccountType.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(expensesAccountType.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.accountType}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditAccountTypePopup(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleAccountTypeDelete(item.id)} />
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
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Weekly type.."
              value={weeklyTypeSearch}
              onChange={(e) => setWeeklyTypeSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openWeeklyTypes}>
              + Add
            </button>
          </div>
          <button className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <button onClick={handleDeleteAllWeeklyTypes}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-72 ">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left lg:w-72 text-xl font-bold">Type</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto lg:w-72 w-full">
                <tbody>
                  {filteredWeeklyType.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(weeklyTypes.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.type}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditWeeklyTypePopup(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleWeeklyTypeDelete(item.id)} />
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
      </div>
      {isVendorEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditVendorPopup}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditVendorName}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[15.5rem]">Vendor Name</label>
                <input
                  type="text"
                  value={editVendorName}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Vendor Name"
                  onChange={(e) => setEditVendorName(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeEditVendorPopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditSiteNameOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[30rem] px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditSiteNamePopup}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditSiteName}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[17.5rem]">Site Name</label>
                <input
                  type="text"
                  value={editSiteName}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Site Name"
                  onChange={(e) => setEditSiteName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 ">
                <label className="block text-lg font-medium mb-2 -ml-[19rem]">Site No</label>
                <input
                  type="text"
                  value={editSiteNo}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Site No"
                  onChange={(e) => setEditSiteNo(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-4 ml-12 mb-3">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeEditSiteNamePopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isContractorEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditContractorPopup}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditContractorName}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[13.5rem]">Contractor Name</label>
                <input
                  type="text"
                  value={editContractorName}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Contractor Name"
                  onChange={(e) => setEditContractorName(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeEditContractorPopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isCategoriesEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditCategoryPopup}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditCategoriesName}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[17.5rem]">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Category"
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeEditCategoryPopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isAccountTypeEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditAccountTypePopup}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditAccountTypes}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[15rem]">Account Type</label>
                <input
                  type="text"
                  value={editAccountType}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Account Type"
                  onChange={(e) => setEditAccountType(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeEditAccountTypePopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditWeeklyTypeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditWeeklyTypePopup}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditWeeklyTypes}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[15rem]">Type</label>
                <input
                  type="text"
                  value={editWeeklyType}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Account Type"
                  onChange={(e) => setEditWeeklyType(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeEditWeeklyTypePopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isMachineToolsEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditMachineToolsPopup}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditMachineTools}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[17rem]">Machine Tools</label>
                <input
                  type="text"
                  value={editMachineTool}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Machine Tools"
                  onChange={(e) => setEditMachineTool(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeEditMachineToolsPopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isSiteNamesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-80 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeSiteNames}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitSiteNames}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[17rem]">Site Name </label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Site Name"
                  onChange={(e) => setSiteName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[18.5rem]">Site No </label>
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
      {isMachineToolsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeMachineTools}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitMachineTools}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[15rem]">Machine Tools </label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Tools Name"
                  onChange={(e) => setMachineTool(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-4 ml-12">
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
      )}
      {isAccountTypesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeAccountTypes}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitAccountTypes}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-60">Account Type</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Account Type"
                  onChange={(e) => setAccountType(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-4 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeAccountTypes}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isWeeklyTypeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeWeeklyTypes}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitWeeklyTypes}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-60">Type</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Type"
                  onChange={(e) => setWeeklyType(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-4 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeWeeklyTypes}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isVendorNameOpens && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closevendorNames}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitVendorName}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[16rem]">Vendor Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Vendor Name"
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-4 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closevendorNames}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isContractorNameOpens && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeContractorNames}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitContractorName}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[13.5rem]">Contractor Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Contractor Name"
                  onChange={(e) => setContractorName(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-4 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeContractorNames}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isCategoryOpens && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
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
              <div className="flex space-x-2 mt-4 ml-12">
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
      )}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this tile?</p>
            <div className="flex space-x-4">
              <button className="bg-red-500 text-white p-2 rounded">
                Yes, Delete
              </button>
              <button className="bg-gray-300 p-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ModalSiteName
        isOpen={isSiteNamesModelOpens}
        onClose={closeSiteNamesModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadSiteNames}
      />
      <ModalVendorName
        isOpen={isVendorNameModelOpens}
        onClose={closeVendorNamesModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadVendorNames}
      />
      <ModalContractorName
        isOpen={isContractorNameModelOpens}
        onClose={closeContractorNamesModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadContractorNames}
      />
      <ModalCategory
        isOpen={isCategoryModelOpens}
        onClose={closeCategoryModels}
        onFileChange={handleFileChange}
        onUpload={handleUploadcategory}
      />
      <ModalMachineTools
        isOpen={isMachineToolsModelOpen}
        onClose={closeMachineToolModels}
        onFileChange={handleFileChange}
        onUpload={handleUploadMachineTools}
      />
      <ModalAccountTypes
        isOpen={isAccountTypesModelOpen}
        onClose={closeAccountTypesModels}
        onFileChange={handleFileChange}
        onUpload={handleUploadAccountType}
      />
    </div>
  );
};
export default DTableView;
function ModalSiteName({ isOpen, onClose, onFileChange, onUpload }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg text-center w-96 shadow-lg">
        <h2 className="mb-4 text-xl text-gray-800">Upload Bulk Data</h2>
        <div className="mb-5">
          <input
            type="file"
            onChange={onFileChange}
            accept=".csv, .sql"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          />
          <div className="flex justify-between">
            <button
              onClick={onUpload}
              className="px-8 py-2 bg-[#BF9853] text-white rounded-lg cursor-pointer  transition-colors"
            >
              Upload
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ModalVendorName({ isOpen, onClose, onFileChange, onUpload }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg text-center w-96 shadow-lg">
        <h2 className="mb-4 text-xl text-gray-800">Upload Bulk Data</h2>
        <div className="mb-5">
          <input
            type="file"
            onChange={onFileChange}
            accept=".csv, .sql"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          />
          <div className="flex justify-between">
            <button
              onClick={onUpload}
              className="px-8 py-2 bg-[#BF9853] text-white rounded-lg cursor-pointer  transition-colors"
            >
              Upload
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ModalContractorName({ isOpen, onClose, onFileChange, onUpload }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg text-center w-96 shadow-lg">
        <h2 className="mb-4 text-xl text-gray-800">Upload Bulk Data</h2>
        <div className="mb-5">
          <input
            type="file"
            onChange={onFileChange}
            accept=".csv, .sql"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          />
          <div className="flex justify-between">
            <button
              onClick={onUpload}
              className="px-8 py-2 bg-[#BF9853] text-white rounded-lg cursor-pointer  transition-colors"
            >
              Upload
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ModalCategory({ isOpen, onClose, onFileChange, onUpload }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg text-center w-96 shadow-lg">
        <h2 className="mb-4 text-xl text-gray-800">Upload Bulk Data</h2>
        <div className="mb-5">
          <input
            type="file"
            onChange={onFileChange}
            accept=".csv, .sql"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          />
          <div className="flex justify-between">
            <button
              onClick={onUpload}
              className="px-8 py-2 bg-[#BF9853] text-white rounded-lg cursor-pointer  transition-colors"
            >
              Upload
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ModalMachineTools({ isOpen, onClose, onFileChange, onUpload }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg text-center w-96 shadow-lg">
        <h2 className="mb-4 text-xl text-gray-800">Upload Bulk Data</h2>
        <div className="mb-5">
          <input
            type="file"
            onChange={onFileChange}
            accept=".csv, .sql"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          />
          <div className="flex justify-between">
            <button
              onClick={onUpload}
              className="px-8 py-2 bg-[#BF9853] text-white rounded-lg cursor-pointer  transition-colors"
            >
              Upload
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ModalAccountTypes({ isOpen, onClose, onFileChange, onUpload }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg text-center w-96 shadow-lg">
        <h2 className="mb-4 text-xl text-gray-800">Upload Bulk Data</h2>
        <div className="mb-5">
          <input
            type="file"
            onChange={onFileChange}
            accept=".csv, .sql"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          />
          <div className="flex justify-between">
            <button
              onClick={onUpload}
              className="px-8 py-2 bg-[#BF9853] text-white rounded-lg cursor-pointer  transition-colors"
            >
              Upload
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}