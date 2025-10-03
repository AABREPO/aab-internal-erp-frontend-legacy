import React, { useState, useEffect } from 'react';
import axios from 'axios';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';

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
  const [vendorNames, setVendorNames] = useState([]);
  const [isVendorEditOpen, setIsVendorEditOpen] = useState(false);
  const [editVendorName, setEditVendorName] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  // State for Contractor Names
  const [isContractorNameOpens, setContractorNameOpens] = useState(false);
  const [contractorNameSearch, setContractorNameSearch] = useState("");
  const [contractorName, setContractorName] = useState('');
  const [contractorNames, setContractorNames] = useState([]);
  const [isContractorEditOpen, setIsContractorEditOpen] = useState(false);
  const [editContractorName, setEditContractorName] = useState('');
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [isAccountDetailsOpen, setIsAccountDetailsOpen] = useState(false);
  const [accountDetailsSearch, setAccountDetailsSearch] = useState("");
  // State for Account Details
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [isAccountDetailsEditOpen, setIsAccountDetailsEditOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [editAccountHolderName, setEditAccountHolderName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editIfscCode, setEditIfscCode] = useState('');
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
  const [employeeList, setEmployeeList] = useState([]);
  const [isEditEmployeeDataOpen, setIsEditEmployeeDataOpen] = useState(false);
  const [selectedEmployeeDataId, setSelectedEmployeeDataId] = useState(null);
  const [editEmployeeName, setEditEmployeeName] = useState('');
  const [editEmployeeMobileNumber, setEditEmployeeMobileNumber] = useState('');
  const [editRoleOfEmployee, setEditRoleOfEmployee] = useState('');

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

  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  // State for Master Table functionality
  const [selectedTable, setSelectedTable] = useState(() => {
    // Load selected table from localStorage on component mount
    const savedTable = localStorage.getItem('selectedMasterTable');
    return savedTable || null;
  });
  const [showMasterTable, setShowMasterTable] = useState(true);

  // State for drag scrolling
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Master table data with all table headings
  const masterTableData = [
    { id: 'project-names', name: 'Project Names', description: 'Manage project names and site numbers' },
    { id: 'vendor-names', name: 'Vendor Names', description: 'Manage vendor information' },
    { id: 'contractor-names', name: 'Contractor Names', description: 'Manage contractor information' },
    { id: 'categories', name: 'Categories', description: 'Manage expense categories' },
    { id: 'machine-tools', name: 'Machine Tools', description: 'Manage machine and tool information' },
    { id: 'employee-details', name: 'Employee Details', description: 'Manage employee information' },
    { id: 'labours-list', name: 'Labours List', description: 'Manage labour information' },
    { id: 'Account Details', name: 'Account Details', description: 'Manage account information' }
  ];

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
  const handleMouseDown = (e) => {
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
  const openSiteNames = () => setIsSiteNamesOpen(true);
  const closeSiteNames = () => setIsSiteNamesOpen(false);
  const openvendorNames = () => setIsVendorNameOpens(true);
  const closevendorNames = () => setIsVendorNameOpens(false);
  const openContractorNames = () => setContractorNameOpens(true);
  const closeContractorNames = () => setContractorNameOpens(false);
  const openCategory = () => setIsCategoryOpens(true);
  const closeCategory = () => setIsCategoryOpens(false);
  const openMachineTools = () => setIsMachineToolsOpen(true);
  const closeMachineTools = () => setIsMachineToolsOpen(false);
  const openEmployeeDetails = () => setIsEmployeeDataOpen(true);
  const closeEmployeeDetails = () => setIsEmployeeDataOpen(false);
  const openLabourDetails = () => setIsLaboursListDataOpen(true);
  const closeLabourDetails = () => setIsLaboursListDataOpen(false);
  const openAccountDetails = () => setIsAccountDetailsOpen(true);
  const closeAccountDetails = () => setIsAccountDetailsOpen(false);
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
      }
    } catch (error) {
      console.error('Error:', error);
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
    e.preventDefault();
    const newVendorName = { vendorName };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendorName),
      });
      if (response.ok) {
        setMessage('Vendor name saved successfully!');
        setVendorName('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmitContractorName = async (e) => {
    e.preventDefault();
    const newContractorName = { contractorName };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/contractor_Names/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContractorName),
      });
      if (response.ok) {
        setMessage('Contractor name saved successfully!');
        setContractorName('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
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

  const handleSubmitEmployeeData = async (e) => {
    e.preventDefault();
    const newEmployeeList = { employee_name: employeeName, employee_mobile_number: mobileNumber, role_of_employee: roleOfEmployee };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployeeList),
      });
      if (response.ok) {
        setMessage('Employee Details saved successfully!');
        setEmployeeName('');
        setMobileNumber('');
        setRoleOfEmployee('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
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
    const newAccountDetails = {
      account_holder_name: accountHolderName,
      account_number: accountNumber,
      bank_name: bankName,
      branch: branch,
      ifsc_code: ifscCode
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
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
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
    setIsVendorEditOpen(true);
  };

  const handleEditContractorName = (item) => {
    setSelectedContractorId(item.id);
    setEditContractorName(item.contractorName);
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
    setEditEmployeeMobileNumber(item.employee_mobile_number);
    setEditRoleOfEmployee(item.role_of_employee);
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
    setIsAccountDetailsEditOpen(true);
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

  // Filter functions
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

  const filteredEmployeeData = employeeList.filter((item) =>
    item.employee_name.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const filteredLaboursData = laboursList.filter((item) =>
    item.labour_name.toLowerCase().includes(laboursListSearch.toLowerCase())
  );

  const filteredAccountDetails = accountDetails.filter((item) =>
    (item.account_holder_name || '').toLowerCase().includes(accountDetailsSearch.toLowerCase()) ||
    (item.account_number || '').toLowerCase().includes(accountDetailsSearch.toLowerCase()) ||
    (item.bank_name || '').toLowerCase().includes(accountDetailsSearch.toLowerCase()) ||
    (item.branch || '').toLowerCase().includes(accountDetailsSearch.toLowerCase()) ||
    (item.ifsc_code || '').toLowerCase().includes(accountDetailsSearch.toLowerCase())
  );

  return (
    <div className="p-4 bg-white ml-6 mr-8">
      <div className="border-t pt-6 mt-20">
        <div
          className="lg:flex space-x-[2%] lg:w-full md:w-[32rem] w-[20rem] overflow-x-auto select-none"
          style={{ cursor: isDragging ? 'grabbing' : 'default' }}
          onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        >
          <div className="mb-6">
            <div className="flex items-center mb-8">
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
              {table.id === 'project-names' && (
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
                  <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                    <div className="bg-[#FAF6ED]">
                      <table className="table-auto lg:w-72">
                        <thead className='bg-[#FAF6ED]'>
                          <tr className="border-b">
                            <th className="p-2 text-left lg:w-16 text-xl font-bold">P.ID</th>
                            <th className="p-2 text-left lg:w-72 text-xl font-bold">Project Name</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-[650px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <table className="table-auto lg:w-72">
                        <tbody>
                          {filteredSiteNames.map((item, index) => (
                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                              <td className="p-2 text-left font-semibold">{item.siteNo}</td>
                              <td className="p-2 text-left group flex font-semibold">
                                <div className="flex flex-grow">
                                  {item.siteName}
                                </div>
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => handleEditSiteName(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <img src={edit} alt="Edit" className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSiteName(item.id)}
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
              {table.id === 'vendor-names' && (
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
                    <div className="overflow-y-auto max-h-[650px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                    <div className="overflow-y-auto max-h-[650px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                    <div className="overflow-y-auto max-h-[650px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                    <div className="overflow-y-auto max-h-[650px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                    <div className="overflow-y-auto max-h-[650px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                    <div className="overflow-y-auto max-h-[650px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                                <div className="flex flex-grow">
                                  {item.account_number}
                                </div>
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
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

      {isMachineToolsOpen && (
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

      {isEmployeeDataOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[30rem] px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEmployeeDetails}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitEmployeeData}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-64">Employee Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Name"
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-80">Mobile Number</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Mobile Number"
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-80">Role</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Role"
                  onChange={(e) => setRoleOfEmployee(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-4 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeEmployeeDetails}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLaboursListDataOpen && (
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
              <div className="flex space-x-2 mt-4 ml-12">
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
      )}

      {isAccountDetailsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md px-2 py-2 text-left">
            <div className='p-4'>
              <div>
                <button className="text-red-500 ml-[95%]" onClick={closeAccountDetails}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form onSubmit={handleSubmitAccountDetails}>
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
                <div className="flex space-x-2 justify-end">
                  <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                    Submit
                  </button>
                  <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeAccountDetails}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal Forms */}
      {isEditSiteNameOpen && (
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
                const response = await fetch(`https://backendaab.in/aabuilderDash/api/project_Names/update/${selectedSiteId}`, {
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
      )}

      {isVendorEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={() => setIsVendorEditOpen(false)}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`https://backendaab.in/aabuilderDash/api/vendor_Names/update/${selectedVendorId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ vendorName: editVendorName }),
                });
                if (response.ok) {
                  setMessage('Vendor name updated successfully!');
                  setIsVendorEditOpen(false);
                  window.location.reload();
                }
              } catch (error) {
                console.error('Error:', error);
              }
            }}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[16rem]">Vendor Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Vendor Name"
                  value={editVendorName}
                  onChange={(e) => setEditVendorName(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-4 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Update
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={() => setIsVendorEditOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isContractorEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={() => setIsContractorEditOpen(false)}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`https://backendaab.in/aabuilderDash/api/contractor_Names/update/${selectedContractorId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ contractorName: editContractorName }),
                });
                if (response.ok) {
                  setMessage('Contractor name updated successfully!');
                  setIsContractorEditOpen(false);
                  window.location.reload();
                }
              } catch (error) {
                console.error('Error:', error);
              }
            }}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[13.5rem]">Contractor Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Contractor Name"
                  value={editContractorName}
                  onChange={(e) => setEditContractorName(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-4 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Update
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={() => setIsContractorEditOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCategoriesEditOpen && (
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
              <div className="flex space-x-2 mt-4 ml-12">
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
      )}

      {isMachineToolsEditOpen && (
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
              <div className="flex space-x-2 mt-4 ml-12">
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
      )}

      {isEditEmployeeDataOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[30rem] px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={() => setIsEditEmployeeDataOpen(false)}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`https://backendaab.in/aabuildersDash/api/employee_details/update/${selectedEmployeeDataId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    employee_name: editEmployeeName,
                    employee_mobile_number: editEmployeeMobileNumber,
                    role_of_employee: editRoleOfEmployee
                  }),
                });
                if (response.ok) {
                  setMessage('Employee data updated successfully!');
                  setIsEditEmployeeDataOpen(false);
                  window.location.reload();
                }
              } catch (error) {
                console.error('Error:', error);
              }
            }}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-64">Employee Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Name"
                  value={editEmployeeName}
                  onChange={(e) => setEditEmployeeName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-80">Mobile Number</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Mobile Number"
                  value={editEmployeeMobileNumber}
                  onChange={(e) => setEditEmployeeMobileNumber(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-80">Role</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Role"
                  value={editRoleOfEmployee}
                  onChange={(e) => setEditRoleOfEmployee(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-4 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Update
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={() => setIsEditEmployeeDataOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
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
                const response = await fetch(`https://backendaab.in/aabuildersDash/api/labours-details/update/${selectedLabourDataId}`, {
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
              <div className="flex space-x-2 mt-4 ml-12">
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
      )}
      {isAccountDetailsEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md px-2 py-2 text-left">
            <div className='p-4'>
              <div>
                <button className="text-red-500 ml-[95%]" onClick={() => setIsAccountDetailsEditOpen(false)}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form className='' onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch(`https://backendaab.in/aabuildersDash/api/account-details/update/${selectedAccountId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      account_holder_name: editAccountHolderName,
                      account_number: editAccountNumber,
                      bank_name: editBankName,
                      branch: editBranch,
                      ifsc_code: editIfscCode
                    }),
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
                <div className='flex gap-4'>
                  <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Account Holder Name"
                      value={editAccountHolderName}
                      onChange={(e) => setEditAccountHolderName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Account Number</label>
                    <input
                      type="text"
                      className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Account Number"
                      value={editAccountNumber}
                      onChange={(e) => setEditAccountNumber(e.target.value)}
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
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">IFSC Code</label>
                    <input
                      type="text"
                      className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter IFSC Code"
                      value={editIfscCode}
                      onChange={(e) => setEditIfscCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2">Branch</label>
                  <input
                    type="text"
                    className="w-96 border-2 border-[#BF9853] border-opacity-35 p-2 rounded-lg h-14 focus:outline-none"
                    placeholder="Enter Branch"
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    required
                  />
                </div>
                <div className="flex space-x-2 justify-end">
                  <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                    Update
                  </button>
                  <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={() => setIsAccountDetailsEditOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;