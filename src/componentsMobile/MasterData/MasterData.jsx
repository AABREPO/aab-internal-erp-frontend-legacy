import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../ProjectAdvance/Header';
import Sidebar from '../Bars/Sidebar';
import BottomNav from '../ProjectAdvance/BottomNav';
import editIcon from '../Images/edit.png';
import deleteIcon from '../Images/delete.png';
import AccountQrCodeImage from '../../Components/Images/AAB_QR_CODE.jpeg';

const masterDataItems = [
  'Project Name',
  'Vendor Name',
  'Contractor Name',
  'Categories',
  'Machine tools',
  'Employee Details',
  'Company Labour',
  'Account Details',
  'Bank Details',
  'Support Associate Name'
];

const LABOUR_WAGE_TYPE_OPTIONS = [
  'Mason',
  'Carpenter',
  'Electrician',
  'Plumber',
  'Helper',
  'Painter',
  'Supervisor',
  'Other'
];

const MasterData = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('master-data');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [listData, setListData] = useState([]);
  const [itemSearch, setItemSearch] = useState('');
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);
  const [swipedProjectId, setSwipedProjectId] = useState(null);
  const [expandedBankDetailsSection, setExpandedBankDetailsSection] = useState('bank-name');
  const [bankAccountTypes, setBankAccountTypes] = useState([]);
  const [isBankTypesLoading, setIsBankTypesLoading] = useState(false);
  const [isBankNameFormOpen, setIsBankNameFormOpen] = useState(false);
  const [bankNameFormMode, setBankNameFormMode] = useState('new');
  const [bankNameForm, setBankNameForm] = useState({ bankName: '' });
  const [isBankTypeFormOpen, setIsBankTypeFormOpen] = useState(false);
  const [bankTypeFormMode, setBankTypeFormMode] = useState('new');
  const [bankTypeForm, setBankTypeForm] = useState({ accountType: '' });
  const [isBankLocationFormOpen, setIsBankLocationFormOpen] = useState(false);
  const [bankLocationFormMode, setBankLocationFormMode] = useState('new');
  const [bankLocationForm, setBankLocationForm] = useState({ branchName: '' });

  const getListApiUrl = (item) => {
    switch (item) {
      case 'Vendor Name':
        return 'https://backendaab.in/aabuilderDash/api/vendor_Names/getAll';
      case 'Contractor Name':
        return 'https://backendaab.in/aabuilderDash/api/contractor_Names/getAll';
      case 'Categories':
        return 'https://backendaab.in/aabuilderDash/api/expenses_categories/getAll';
      case 'Machine tools':
        return 'https://backendaab.in/aabuilderDash/api/machine_tools/getAll';
      case 'Employee Details':
        return 'https://backendaab.in/aabuildersDash/api/employee_details/getAll';
      case 'Company Labour':
        return 'https://backendaab.in/aabuildersDash/api/labours-details/getAll';
      case 'Account Details':
      case 'Bank Details':
        return 'https://backendaab.in/aabuildersDash/api/account-details/getAll';
      case 'Support Associate Name':
        return 'https://backendaab.in/aabuildersDash/api/support_staff/getAll';
      default:
        return null;
    }
  };

  const getItemPrimaryText = (item, currentItem) => {
    if (!item) return '';
    if (typeof item === 'string') {
      return item;
    }

    switch (currentItem) {
      case 'Vendor Name':
        return item.vendorName || item.vendor_name || item.name || item.value || '';
      case 'Contractor Name':
        return item.contractorName || item.contractor_name || item.name || item.value || '';
      case 'Categories':
        return item.category || item.categoryName || item.category_name || item.expensesCategory || item.name || item.value || '';
      case 'Machine tools':
        return item.machineTool || item.machine_tool || item.name || item.tool_name || item.value || '';
      case 'Employee Details':
        return item.employeeName || item.employee_name || item.name || item.value || '';
      case 'Company Labour':
        return item.labour_name || item.labourName || item.name || item.value || '';
      case 'Account Details':
        return item.account_holder_name || item.accountHolderName || item.account_name || item.accountName || item.name || item.value || '';
      case 'Bank Details':
        return item.bank_name || item.bankName || item.name || item.value || '';
      case 'Support Associate Name':
        return item.supportStaffName || item.support_staff_name || item.name || item.value || '';
      default:
        return '';
    }
  };

  const getItemSecondaryText = (item, currentItem) => {
    if (!item) return '';
    switch (currentItem) {
      case 'Vendor Name':
        return item.vendorBankName || item.vendor_bank_name || item.vendorAccountNumber || item.vendor_account_number || '';
      case 'Contractor Name':
        return item.contractorBankName || item.contractor_bank_name || item.contractorAccountNumber || item.contractor_account_number || '';
      case 'Employee Details':
        return item.mobileNumber || item.mobile_number || item.contactNumber || item.contact_number || '';
      case 'Company Labour':
        return item.labour_salary || item.salary || '';
      case 'Account Details':
        return item.bank_name || item.bankName || item.account_number || item.accountNumber || '';
      case 'Bank Details':
        return item.branch || item.branch_name || '';
      case 'Support Associate Name':
        return item.mobileNumber || item.mobile_number || item.contactNumber || item.contact_number || '';
      default:
        return '';
    }
  };

  const getListRowId = (item, index) => {
    return (
      item.id ||
      item._id ||
      item.labour_id ||
      item.employee_id ||
      item.account_number ||
      item.vendorName ||
      item.vendor_name ||
      item.contractorName ||
      item.contractor_name ||
      item.category ||
      item.categoryName ||
      item.category_name ||
      item.accountType ||
      item.bank_account_type ||
      item.account_type ||
      item.machineTool ||
      item.machine_tool ||
      item.supportStaffName ||
      item.support_staff_name ||
      `list-${index}`
    );
  };
  const [touchStartX, setTouchStartX] = useState(null);
  const [mouseStartX, setMouseStartX] = useState(null);
  const [isAddProjectViewOpen, setIsAddProjectViewOpen] = useState(false);
  const [expandedProjectSection, setExpandedProjectSection] = useState('project-details');
  const [projectFormMode, setProjectFormMode] = useState('new');
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    projectId: '',
    projectCategory: '',
    referenceName: '',
    branch: '',
    projectAddress: '',
    clientName: '',
    fatherName: '',
    mobileNumber: '',
    age: '',
    emailId: '',
    clientAddress: '',
    accountHolderName: '',
    qrCode: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    accountBranch: '',
    upiPhoneNumber: '',
    upiId: ''
  });
  const [isAddOnSheetOpen, setIsAddOnSheetOpen] = useState(false);
  const [isAddVendorViewOpen, setIsAddVendorViewOpen] = useState(false);
  const [expandedVendorSection, setExpandedVendorSection] = useState('vendor-details');
  const [isVendorQrModalOpen, setIsVendorQrModalOpen] = useState(false);
  const [vendorQrPreview, setVendorQrPreview] = useState('');
  const [vendorFormMode, setVendorFormMode] = useState('new');
  const [vendorForm, setVendorForm] = useState({
    vendorName: '',
    vendorCategory: '',
    vendorId: '',
    contactNumber: '',
    referenceName: '',
    branch: '',
    emailId: '',
    vendorAddress: '',
    location: '',
    accountHolderName: '',
    qrCode: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    upiPhoneNumber: '',
    upiId: ''
  });
  const [isAddContractorViewOpen, setIsAddContractorViewOpen] = useState(false);
  const [expandedContractorSection, setExpandedContractorSection] = useState('contractor-details');
  const [isContractorQrModalOpen, setIsContractorQrModalOpen] = useState(false);
  const [contractorQrPreview, setContractorQrPreview] = useState('');
  const [contractorFormMode, setContractorFormMode] = useState('new');
  const [contractorForm, setContractorForm] = useState({
    contractorName: '',
    contractorCategory: '',
    contractorId: '',
    contractorNumber: '',
    referenceName: '',
    branch: '',
    emailId: '',
    contractorAddress: '',
    location: '',
    accountHolderName: '',
    qrCode: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    upiPhoneNumber: '',
    upiId: ''
  });
  const [isAddCategoryViewOpen, setIsAddCategoryViewOpen] = useState(false);
  const [expandedCategorySection, setExpandedCategorySection] = useState('category-details');
  const [categoryFormMode, setCategoryFormMode] = useState('new');
  const [categoryForm, setCategoryForm] = useState({ categoryName: '' });
  const [isAddMachineViewOpen, setIsAddMachineViewOpen] = useState(false);
  const [expandedMachineSection, setExpandedMachineSection] = useState('machine-details');
  const [machineFormMode, setMachineFormMode] = useState('new');
  const [machineForm, setMachineForm] = useState({ machineName: '' });
  const [isAddEmployeeViewOpen, setIsAddEmployeeViewOpen] = useState(false);
  const [expandedEmployeeSection, setExpandedEmployeeSection] = useState('employee-details');
  const [isEmployeeQrModalOpen, setIsEmployeeQrModalOpen] = useState(false);
  const [employeeQrPreview, setEmployeeQrPreview] = useState('');
  const [isEmployeeAadhaarModalOpen, setIsEmployeeAadhaarModalOpen] = useState(false);
  const [employeeAadhaarFile, setEmployeeAadhaarFile] = useState(null);
  const [employeeFormMode, setEmployeeFormMode] = useState('new');
  const [employeeForm, setEmployeeForm] = useState({
    employeeName: '',
    employeeId: '',
    designation: '',
    userName: '',
    mobileNumber: '',
    emailId: '',
    employeeAddress: '',
    location: '',
    accountHolderName: '',
    qrCode: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    branch: '',
    upiPhoneNumber: '',
    upiId: ''
  });
  const [isAddLabourViewOpen, setIsAddLabourViewOpen] = useState(false);
  const [expandedLabourSection, setExpandedLabourSection] = useState('wage-details');
  const [isLabourQrModalOpen, setIsLabourQrModalOpen] = useState(false);
  const [labourQrPreview, setLabourQrPreview] = useState('');
  const [labourFormMode, setLabourFormMode] = useState('new');
  const [labourForm, setLabourForm] = useState({
    labourName: '',
    labourCategory: '',
    labourId: '',
    labourNumber: '',
    referenceName: '',
    branch: '',
    labourAddress: '',
    location: '',
    wageType: '',
    labourSalary: '',
    accountHolderName: '',
    qrCode: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    accountBranch: '',
    upiPhoneNumber: '',
    upiId: ''
  });
  const [isAddAccountViewOpen, setIsAddAccountViewOpen] = useState(false);
  const [expandedAccountSection, setExpandedAccountSection] = useState('account-details');
  const [isAccountQrModalOpen, setIsAccountQrModalOpen] = useState(false);
  const [accountQrPreview, setAccountQrPreview] = useState('');
  const [accountFormMode, setAccountFormMode] = useState('new');
  const [accountForm, setAccountForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    branch: '',
    accountType: '',
    upiPhoneNumber: '',
    upiId: '',
    qrCode: ''
  });

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return masterDataItems;
    return masterDataItems.filter((item) => item.toLowerCase().includes(query));
  }, [search]);

  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    if (!query) return projects;

    return projects.filter((project) =>
      (project.projectName || '').toLowerCase().includes(query) ||
      (project.projectAddress || '').toLowerCase().includes(query) ||
      (project.projectId || '').toLowerCase().includes(query)
    );
  }, [projectSearch, projects]);

  const filteredList = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    if (!query) return listData;

    return listData.filter((item) => {
      const primary = getItemPrimaryText(item, selectedItem).toLowerCase();
      const secondary = getItemSecondaryText(item, selectedItem).toLowerCase();
      return primary.includes(query) || secondary.includes(query);
    });
  }, [itemSearch, listData, selectedItem]);

  useEffect(() => {
    if (selectedItem !== 'Project Name') {
      return;
    }

    let isMounted = true;

    const fetchProjects = async () => {
      setIsProjectsLoading(true);

      try {
        const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/getAll');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        if (isMounted) {
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        if (isMounted) {
          setProjects([]);
        }
      } finally {
        if (isMounted) {
          setIsProjectsLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedItem || selectedItem === 'Project Name') {
      return;
    }

    const apiUrl = getListApiUrl(selectedItem);
    if (!apiUrl) {
      setListData([]);
      return;
    }

    let isMounted = true;

    const fetchListData = async () => {
      setIsListLoading(true);

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${selectedItem}`);
        }

        const data = await response.json();
        if (isMounted) {
          setListData(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(`Error fetching ${selectedItem}:`, error);
        if (isMounted) {
          setListData([]);
        }
      } finally {
        if (isMounted) {
          setIsListLoading(false);
        }
      }
    };

    fetchListData();

    return () => {
      isMounted = false;
    };
  }, [selectedItem]);

  useEffect(() => {
    if (selectedItem !== 'Bank Details') return;
    let isMounted = true;

    const fetchBankTypes = async () => {
      setIsBankTypesLoading(true);
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/bank_type/getAll');
        if (!response.ok) throw new Error('Failed to fetch bank account types');
        const data = await response.json();
        if (isMounted) setBankAccountTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching bank types:', error);
        if (isMounted) setBankAccountTypes([]);
      } finally {
        if (isMounted) setIsBankTypesLoading(false);
      }
    };

    fetchBankTypes();
    return () => {
      isMounted = false;
    };
  }, [selectedItem]);

  useEffect(() => {
    if (currentPage === 'master-data') {
      setSelectedItem(null);
    }
  }, [currentPage]);

  const normalizeProjectForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';

    return {
      projectName: valueOr(item?.projectName, item?.project_name, item?.name),
      projectId: valueOr(item?.projectId, item?.project_id, item?.id),
      projectCategory: valueOr(item?.projectCategory, item?.project_category),
      referenceName: valueOr(item?.projectReferenceName, item?.project_reference_name, item?.referenceName, item?.reference_name),
      branch: valueOr(item?.branch, item?.branch_name),
      projectAddress: valueOr(item?.projectAddress, item?.project_address, item?.address),
      clientName: valueOr(item?.clientName, item?.client_name),
      fatherName: valueOr(item?.fatherName, item?.father_name),
      mobileNumber: valueOr(item?.mobileNumber, item?.mobile_number),
      age: valueOr(item?.age),
      emailId: valueOr(item?.emailId, item?.email_id),
      clientAddress: valueOr(item?.clientAddress, item?.client_address),
      accountHolderName: valueOr(item?.accountHolderName, item?.account_holder_name),
      qrCode: valueOr(item?.qrCode, item?.qr_code, item?.qrImagePreview, item?.qr_image_preview),
      accountNumber: valueOr(item?.accountNumber, item?.account_number),
      bankName: valueOr(item?.bankName, item?.bank_name),
      ifscCode: valueOr(item?.ifscCode, item?.ifsc_code),
      accountBranch: valueOr(item?.accountBranch, item?.account_branch, item?.branch),
      upiPhoneNumber: valueOr(item?.upiPhoneNumber, item?.upi_phone_number, item?.gpayNumber, item?.gpay_number),
      upiId: valueOr(item?.upiId, item?.upi_id)
    };
  };

  useEffect(() => {
    setIsAddVendorViewOpen(false);
    setExpandedVendorSection('vendor-details');
    setIsVendorQrModalOpen(false);
    setVendorQrPreview('');
    setVendorFormMode('new');
    setIsAddContractorViewOpen(false);
    setExpandedContractorSection('contractor-details');
    setIsContractorQrModalOpen(false);
    setContractorQrPreview('');
    setContractorFormMode('new');
    setIsAddCategoryViewOpen(false);
    setExpandedCategorySection('category-details');
    setCategoryFormMode('new');
    setCategoryForm({ categoryName: '' });
    setIsAddMachineViewOpen(false);
    setExpandedMachineSection('machine-details');
    setMachineFormMode('new');
    setMachineForm({ machineName: '' });
    setIsAddEmployeeViewOpen(false);
    setExpandedEmployeeSection('employee-details');
    setIsEmployeeQrModalOpen(false);
    setEmployeeQrPreview('');
    setIsEmployeeAadhaarModalOpen(false);
    setEmployeeAadhaarFile(null);
    setEmployeeFormMode('new');
    setEmployeeForm({
      employeeName: '',
      employeeId: '',
      designation: '',
      userName: '',
      mobileNumber: '',
      emailId: '',
      employeeAddress: '',
      location: '',
      accountHolderName: '',
      qrCode: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      branch: '',
      upiPhoneNumber: '',
      upiId: ''
    });
    setIsAddLabourViewOpen(false);
    setExpandedLabourSection('wage-details');
    setIsLabourQrModalOpen(false);
    setLabourQrPreview('');
    setLabourFormMode('new');
    setLabourForm({
      labourName: '',
      labourCategory: '',
      labourId: '',
      labourNumber: '',
      referenceName: '',
      branch: '',
      labourAddress: '',
      location: '',
      wageType: '',
      labourSalary: '',
      accountHolderName: '',
      qrCode: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      accountBranch: '',
      upiPhoneNumber: '',
      upiId: ''
    });
    setIsAddAccountViewOpen(false);
    setExpandedAccountSection('account-details');
    setIsAccountQrModalOpen(false);
    setAccountQrPreview('');
    setAccountFormMode('new');
    setAccountForm({
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      branch: '',
      accountType: '',
      upiPhoneNumber: '',
      upiId: '',
      qrCode: ''
    });
    setExpandedBankDetailsSection('bank-name');
    setIsBankNameFormOpen(false);
    setBankNameFormMode('new');
    setBankNameForm({ bankName: '' });
    setIsBankTypeFormOpen(false);
    setBankTypeFormMode('new');
    setBankTypeForm({ accountType: '' });
    setIsBankLocationFormOpen(false);
    setBankLocationFormMode('new');
    setBankLocationForm({ branchName: '' });
  }, [selectedItem]);

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${Math.max(1, Math.round(kb))} KB`;
  };

  const normalizeVendorForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';

    const qrCode = valueOr(
      item?.qrCode,
      item?.qr_code,
      item?.qrImagePreview,
      item?.qr_image_preview,
      item?.vendorQrImagePreview,
      item?.vendor_qr_image_preview,
      item?.vendorQrImage,
      item?.vendor_qr_image
    );

    return {
      vendorName: valueOr(item?.vendorName, item?.vendor_name, item?.name),
      vendorCategory: valueOr(item?.vendorCategory, item?.vendor_category, item?.category, item?.categoryName, item?.category_name),
      vendorId: valueOr(item?.vendorId, item?.vendor_id, item?.id),
      contactNumber: valueOr(item?.contactNumber, item?.contact_number, item?.vendorContactNumber, item?.vendor_contact_number, item?.mobileNumber, item?.mobile_number),
      referenceName: valueOr(item?.referenceName, item?.reference_name),
      branch: valueOr(item?.branch, item?.branch_name),
      emailId: valueOr(item?.emailId, item?.email_id, item?.vendorContactEmail, item?.vendor_contact_email),
      vendorAddress: valueOr(item?.vendorAddress, item?.vendor_address, item?.address),
      location: valueOr(item?.location, item?.branchLocation, item?.branch_location),
      accountHolderName: valueOr(item?.accountHolderName, item?.account_holder_name, item?.vendorAccountHolderName, item?.vendor_account_holder_name),
      qrCode,
      accountNumber: valueOr(item?.accountNumber, item?.account_number, item?.vendorAccountNumber, item?.vendor_account_number),
      bankName: valueOr(item?.bankName, item?.bank_name, item?.vendorBankName, item?.vendor_bank_name),
      ifscCode: valueOr(item?.ifscCode, item?.ifsc_code, item?.vendorIfscCode, item?.vendor_ifsc_code),
      upiPhoneNumber: valueOr(item?.upiPhoneNumber, item?.upi_phone_number, item?.gpayNumber, item?.gpay_number, item?.vendorGpayNumber, item?.vendor_gpay_number),
      upiId: valueOr(item?.upiId, item?.upi_id, item?.vendorUpiId, item?.vendor_upi_id)
    };
  };

  const normalizeContractorForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';

    const qrCode = valueOr(
      item?.qrCode,
      item?.qr_code,
      item?.qrImagePreview,
      item?.qr_image_preview,
      item?.contractorQrImagePreview,
      item?.contractor_qr_image_preview,
      item?.contractorQrImage,
      item?.contractor_qr_image
    );

    return {
      contractorName: valueOr(
        item?.contractorName,
        item?.contractor_name,
        item?.supportStaffName,
        item?.support_staff_name,
        item?.name
      ),
      contractorCategory: valueOr(item?.contractorCategory, item?.contractor_category, item?.category, item?.categoryName, item?.category_name),
      contractorId: valueOr(item?.contractorId, item?.contractor_id, item?.id),
      contractorNumber: valueOr(item?.contractorNumber, item?.contractor_number, item?.contactNumber, item?.contact_number, item?.contractorContactNumber, item?.contractor_contact_number, item?.mobileNumber, item?.mobile_number),
      referenceName: valueOr(item?.referenceName, item?.reference_name),
      branch: valueOr(item?.branch, item?.branch_name),
      emailId: valueOr(item?.emailId, item?.email_id, item?.contractorContactEmail, item?.contractor_contact_email),
      contractorAddress: valueOr(item?.contractorAddress, item?.contractor_address, item?.address),
      location: valueOr(item?.location, item?.branchLocation, item?.branch_location),
      accountHolderName: valueOr(item?.accountHolderName, item?.account_holder_name, item?.contractorAccountHolderName, item?.contractor_account_holder_name),
      qrCode,
      accountNumber: valueOr(item?.accountNumber, item?.account_number, item?.contractorAccountNumber, item?.contractor_account_number),
      bankName: valueOr(item?.bankName, item?.bank_name, item?.contractorBankName, item?.contractor_bank_name),
      ifscCode: valueOr(item?.ifscCode, item?.ifsc_code, item?.contractorIfscCode, item?.contractor_ifsc_code),
      upiPhoneNumber: valueOr(item?.upiPhoneNumber, item?.upi_phone_number, item?.gpayNumber, item?.gpay_number, item?.contractorGpayNumber, item?.contractor_gpay_number),
      upiId: valueOr(item?.upiId, item?.upi_id, item?.contractorUpiId, item?.contractor_upi_id)
    };
  };

  const normalizeCategoryForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';
    return {
      categoryName: valueOr(item?.category, item?.categoryName, item?.category_name, item?.expensesCategory, item?.name, item?.value)
    };
  };

  const normalizeMachineForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';
    return {
      machineName: valueOr(item?.machineTool, item?.machine_tool, item?.tool_name, item?.name, item?.value)
    };
  };

  const normalizeEmployeeForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';

    const qrCode = valueOr(
      item?.qrCode,
      item?.qr_code,
      item?.qrImagePreview,
      item?.qr_image_preview,
      item?.empUpiQRImagePreview,
      item?.emp_upi_qr_image_preview,
      item?.employeeQrImagePreview,
      item?.employee_qr_image_preview
    );

    return {
      employeeName: valueOr(item?.employeeName, item?.employee_name, item?.name),
      employeeId: valueOr(item?.employeeId, item?.employee_id, item?.id),
      designation: valueOr(item?.designation, item?.roleOfEmployee, item?.role_of_employee),
      userName: valueOr(item?.userName, item?.username),
      mobileNumber: valueOr(item?.mobileNumber, item?.mobile_number, item?.contactNumber, item?.contact_number),
      emailId: valueOr(item?.emailId, item?.email_id, item?.contactEmail, item?.contact_email),
      employeeAddress: valueOr(item?.employeeAddress, item?.employee_address, item?.address),
      location: valueOr(item?.location, item?.branchLocation, item?.branch_location),
      accountHolderName: valueOr(item?.accountHolderName, item?.account_holder_name, item?.empAccountHolderName, item?.emp_account_holder_name),
      qrCode,
      accountNumber: valueOr(item?.accountNumber, item?.account_number, item?.empAccountNumber, item?.emp_account_number),
      bankName: valueOr(item?.bankName, item?.bank_name, item?.empBankName, item?.emp_bank_name),
      ifscCode: valueOr(item?.ifscCode, item?.ifsc_code, item?.empIfscCode, item?.emp_ifsc_code),
      branch: valueOr(item?.branch, item?.branch_name, item?.empBranch, item?.emp_branch),
      upiPhoneNumber: valueOr(item?.upiPhoneNumber, item?.upi_phone_number, item?.gpayNumber, item?.gpay_number, item?.empGpayNumber, item?.emp_gpay_number),
      upiId: valueOr(item?.upiId, item?.upi_id, item?.empUpiId, item?.emp_upi_id)
    };
  };

  const normalizeLabourForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';

    const qrCode = valueOr(item?.qrCode, item?.qr_code, item?.qrImagePreview, item?.qr_image_preview);

    return {
      labourName: valueOr(item?.labour_name, item?.labourName, item?.name),
      labourCategory: valueOr(item?.labourCategory, item?.labour_category, item?.category, item?.categoryName, item?.category_name),
      labourId: valueOr(item?.labour_id, item?.labourId, item?.id),
      labourNumber: valueOr(item?.labourNumber, item?.labour_number, item?.mobileNumber, item?.mobile_number, item?.contactNumber, item?.contact_number),
      referenceName: valueOr(item?.referenceName, item?.reference_name),
      branch: valueOr(item?.branch, item?.branch_name),
      labourAddress: valueOr(item?.labourAddress, item?.labour_address, item?.address),
      location: valueOr(item?.location, item?.branchLocation, item?.branch_location),
      wageType: valueOr(item?.wageType, item?.wage_type, item?.labourWageType, item?.labour_wage_type),
      labourSalary: valueOr(item?.labour_salary, item?.salary),
      accountHolderName: valueOr(item?.accountHolderName, item?.account_holder_name),
      qrCode,
      accountNumber: valueOr(item?.accountNumber, item?.account_number),
      bankName: valueOr(item?.bankName, item?.bank_name),
      ifscCode: valueOr(item?.ifscCode, item?.ifsc_code),
      accountBranch: valueOr(item?.accountBranch, item?.account_branch, item?.branch),
      upiPhoneNumber: valueOr(item?.upiPhoneNumber, item?.upi_phone_number, item?.gpayNumber, item?.gpay_number),
      upiId: valueOr(item?.upiId, item?.upi_id)
    };
  };

  const normalizeAccountForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';

    const qrCode = valueOr(item?.qrCode, item?.qr_code, item?.qrImagePreview, item?.qr_image_preview);

    return {
      accountHolderName: valueOr(item?.account_holder_name, item?.accountHolderName, item?.account_name, item?.accountName),
      accountNumber: valueOr(item?.account_number, item?.accountNumber),
      bankName: valueOr(item?.bank_name, item?.bankName),
      ifscCode: valueOr(item?.ifsc_code, item?.ifscCode),
      branch: valueOr(item?.branch, item?.branch_name),
      accountType: valueOr(item?.accountType, item?.bank_account_type, item?.account_type, item?.bankAccountType, item?.type),
      upiPhoneNumber: valueOr(item?.upiPhoneNumber, item?.upi_phone_number, item?.gpayNumber, item?.gpay_number),
      upiId: valueOr(item?.upiId, item?.upi_id),
      qrCode
    };
  };

  const handleNavigate = (page) => {
    if (page === 'request-for-quotation') {
      setCurrentPage('request-for-quotation');
      navigate('/rfq');
    } else if (page === 'purchase-order') {
      setCurrentPage('purchase-order');
      navigate('/purchaseorder');
    } else if (page === 'billing') {
      setCurrentPage('billing');
      navigate('/tracker/pendingbill');
    } else if (page === 'goods-recieved-notes') {
      setCurrentPage('goods-recieved-notes');
      navigate('/grn/create');
    } else if (page === 'inventory') {
      setCurrentPage('inventory');
      navigate('/inventory');
    } else if (page === 'tools-tracker') {
      setCurrentPage('tools-tracker');
      navigate('/toolsTracker');
    } else if (page === 'project-advance') {
      setCurrentPage('project-advance');
      navigate('/portal');
    } else if (page === 'loan-portal') {
      setCurrentPage('loan-portal');
      navigate('/loan');
    } else if (page === 'master-data') {
      setCurrentPage('master-data');
      navigate('/master-data');
    }
  };

  const handleItemClick = (item) => {
    if (item === 'Project Name') {
      setSelectedItem(item);
      setProjectSearch('');
      setIsAddProjectViewOpen(false);
      return;
    }

    setSelectedItem(item);
    setItemSearch('');
    setListData([]);
  };

  const getProjectRowId = (item, index) => item.id || item.projectId || item.projectName || `project-${index}`;

  const getProjectSerialNumber = (item, index) => {
    const projectIndex = projects.findIndex((project) => project.id === item.id);
    return projectIndex >= 0 ? projectIndex + 1 : index + 1;
  };

  const handleProjectTouchStart = (event) => {
    setTouchStartX(event.changedTouches[0].clientX);
  };

  const handleProjectTouchEnd = (event, rowId) => {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const swipeDistance = touchStartX - touchEndX;

    if (swipeDistance > 40) {
      setSwipedProjectId(rowId);
    } else if (swipeDistance < -40) {
      setSwipedProjectId(null);
    }

    setTouchStartX(null);
  };

  const handleProjectMouseDown = (event) => {
    setMouseStartX(event.clientX);
  };

  const handleProjectMouseUp = (event, rowId) => {
    if (mouseStartX === null) {
      return;
    }

    const swipeDistance = mouseStartX - event.clientX;

    if (swipeDistance > 40) {
      setSwipedProjectId(rowId);
    } else if (swipeDistance < -40) {
      setSwipedProjectId(null);
    }

    setMouseStartX(null);
  };

  const toggleProjectSection = (sectionId) => {
    setExpandedProjectSection((current) => (current === sectionId ? null : sectionId));
  };

  const renderChevron = (isExpanded) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d={isExpanded ? 'M4 10L8 6L12 10' : 'M4 6L8 10L12 6'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const copyToClipboard = async (text) => {
    const value = String(text ?? '');
    if (!value) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
      }
    } catch (error) {
      console.error('Clipboard write failed:', error);
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch (error) {
      console.error('Clipboard fallback failed:', error);
    }
  };

  const renderInput = ({
    label,
    required,
    placeholder,
    value,
    rightIcon,
    multiline,
    readOnly = true,
    onChange,
    onRightIconClick,
    rightIconInteractive = false
  }) => (
    <div className="w-full">
      <label className="block text-left text-[12px] font-medium text-black">
        {label}
        {required && <span className="text-[#E26D47]">*</span>}
      </label>
      <div className="relative">
        {multiline ? (
          <textarea
            value={value || ''}
            readOnly={readOnly}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className="w-full resize-none rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] py-[10px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
          />
        ) : (
          <input
            value={value || ''}
            readOnly={readOnly}
            onChange={onChange}
            placeholder={placeholder}
            className={`h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0] ${
              rightIcon ? 'pr-[30px]' : ''
            }`}
          />
        )}
        {rightIcon &&
          (rightIconInteractive ? (
            <button
              type="button"
              onClick={onRightIconClick}
              aria-label="Action"
              className="absolute right-[10px] top-1/2 -translate-y-1/2 flex h-[20px] w-[20px] items-center justify-center p-0 text-[#4B4B4B] bg-transparent"
            >
              {rightIcon}
            </button>
          ) : (
            <span className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-[#4B4B4B]">
              {rightIcon}
            </span>
          ))}
      </div>
    </div>
  );

  const renderProjectAccordion = (sectionId, title, content) => {
    const isExpanded = expandedProjectSection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => toggleProjectSection(sectionId)}
          className="flex w-full items-center justify-between px-[14px] py-[13px] text-left"
        >
          <span className="text-[14px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[12px]">{content}</div>}
      </div>
    );
  };

  const toggleBankDetailsSection = (sectionId) => {
    setExpandedBankDetailsSection((current) => (current === sectionId ? null : sectionId));
  };

  const renderBankDetailsAccordion = (sectionId, title, content) => {
    const isExpanded = expandedBankDetailsSection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => toggleBankDetailsSection(sectionId)}
          className="flex w-full items-center justify-between px-[14px] py-[13px] text-left"
        >
          <span className="text-[14px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2]">{content}</div>}
      </div>
    );
  };

  const renderStaticBankDetailsCard = (title, content) => (
    <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex w-full items-center justify-between px-[14px] py-[13px] text-left">
        <span className="text-[14px] font-medium text-black">{title}</span>
        <span className="text-[#2B2B2B]">{renderChevron(true)}</span>
      </div>
      <div className="border-t border-[#F2F2F2]">{content}</div>
    </div>
  );

  const renderBankNameFormView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button type="button" className="pb-[8px] text-[#2B2B2B]" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px]">
          <div className="flex min-w-0 items-center truncate text-[11px] text-[#A4A4A4]">
            <button type="button" onClick={() => setIsBankNameFormOpen(false)} className="truncate text-[11px] text-[#A4A4A4]">
              Master Table
            </button>
            <span className="px-[4px]">&gt;</span>
            <button type="button" onClick={() => setIsBankNameFormOpen(false)} className="truncate text-[11px] text-[#A4A4A4]">
              Bank Name
            </button>
            <span className="px-[4px]">&gt;</span>
            <span className="font-medium text-black">{bankNameFormMode === 'edit' ? 'Edit' : 'New'}</span>
          </div>
          <button type="button" className="shrink-0 text-[12px] font-medium text-black">
            Update
          </button>
        </div>

        <div className="border-t border-[#EFEFEF] px-[16px] py-[8px] text-right">
          <button type="button" className="inline-flex items-center gap-[8px] text-[12px] font-medium text-black">
            <span>Upload File</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.9 2.1L11.9 5.1M9.6 1.4L2.6 8.4V11.4H5.6L12.6 4.4C12.8667 4.13333 13 3.8 13 3.4C13 3 12.8667 2.66667 12.6 2.4L11.6 1.4C11.3333 1.13333 11 1 10.6 1C10.2 1 9.86667 1.13333 9.6 1.4Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px] pb-[18px]">
        <div className="">
          {renderStaticBankDetailsCard(
            'Bank Name Details',
            <div className="px-[14px] py-[12px]">
              {renderInput({
                label: 'Bank Name',
                required: true,
                placeholder: '',
                value: bankNameForm.bankName,
                readOnly: false,
                onChange: (e) => setBankNameForm({ bankName: e.target.value })
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderBankTypeFormView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button type="button" className="pb-[8px] text-[#2B2B2B]" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px]">
          <div className="flex min-w-0 items-center truncate text-[11px] text-[#A4A4A4]">
            <button type="button" onClick={() => setIsBankTypeFormOpen(false)} className="truncate text-[11px] text-[#A4A4A4]">
              Master Table
            </button>
            <span className="px-[4px]">&gt;</span>
            <button type="button" onClick={() => setIsBankTypeFormOpen(false)} className="truncate text-[11px] text-[#A4A4A4]">
              Account Type
            </button>
            <span className="px-[4px]">&gt;</span>
            <span className="font-medium text-black">{bankTypeFormMode === 'edit' ? 'Edit' : 'New'}</span>
          </div>
          <button type="button" className="shrink-0 text-[12px] font-medium text-black">
            Update
          </button>
        </div>

        <div className="border-t border-[#EFEFEF] px-[16px] py-[8px] text-right">
          <button type="button" className="inline-flex items-center gap-[8px] text-[12px] font-medium text-black">
            <span>Upload File</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.9 2.1L11.9 5.1M9.6 1.4L2.6 8.4V11.4H5.6L12.6 4.4C12.8667 4.13333 13 3.8 13 3.4C13 3 12.8667 2.66667 12.6 2.4L11.6 1.4C11.3333 1.13333 11 1 10.6 1C10.2 1 9.86667 1.13333 9.6 1.4Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px] pb-[18px]">
        <div className="">
          {renderStaticBankDetailsCard(
            'Account Type Details',
            <div className="px-[14px] py-[12px]">
              {renderInput({
                label: 'Account Type',
                required: true,
                placeholder: '',
                value: bankTypeForm.accountType,
                readOnly: false,
                onChange: (e) => setBankTypeForm({ accountType: e.target.value })
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderBankLocationFormView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button type="button" className="pb-[8px] text-[#2B2B2B]" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px]">
          <div className="flex min-w-0 items-center truncate text-[11px] text-[#A4A4A4]">
            <button type="button" onClick={() => setIsBankLocationFormOpen(false)} className="truncate text-[11px] text-[#A4A4A4]">
              Master Table
            </button>
            <span className="px-[4px]">&gt;</span>
            <button type="button" onClick={() => setIsBankLocationFormOpen(false)} className="truncate text-[11px] text-[#A4A4A4]">
              Branch Name
            </button>
            <span className="px-[4px]">&gt;</span>
            <span className="font-medium text-black">{bankLocationFormMode === 'edit' ? 'Edit' : 'New'}</span>
          </div>
          <button type="button" className="shrink-0 text-[12px] font-medium text-black">
            {bankLocationFormMode === 'edit' ? 'Save' : 'Save'}
          </button>
        </div>

        <div className="border-t border-[#EFEFEF] px-[16px] py-[8px] text-right">
          <button type="button" className="text-[12px] font-medium text-black">
            Upload File
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px] pb-[18px]">
        <div className="">
          {renderStaticBankDetailsCard(
            'Branch Name Details',
            <div className="px-[14px] py-[12px]">
              {renderInput({
                label: 'Branch Name',
                required: true,
                placeholder: 'Enter Location Name',
                value: bankLocationForm.branchName,
                readOnly: false,
                onChange: (e) => setBankLocationForm({ branchName: e.target.value })
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const toggleVendorSection = (sectionId) => {
    setExpandedVendorSection((current) => (current === sectionId ? null : sectionId));
  };

  const renderVendorAccordion = (sectionId, title, content) => {
    const isExpanded = expandedVendorSection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => toggleVendorSection(sectionId)}
          className="flex w-full items-center justify-between px-[14px] py-[13px] text-left"
        >
          <span className="text-[14px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[12px]">{content}</div>}
      </div>
    );
  };

  const toggleContractorSection = (sectionId) => {
    setExpandedContractorSection((current) => (current === sectionId ? null : sectionId));
  };

  const renderContractorAccordion = (sectionId, title, content) => {
    const isExpanded = expandedContractorSection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => toggleContractorSection(sectionId)}
          className="flex w-full items-center justify-between px-[14px] py-[13px] text-left"
        >
          <span className="text-[14px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[12px]">{content}</div>}
      </div>
    );
  };

  const renderAddContractorView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button type="button" className="pb-[8px] text-[#2B2B2B]" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px]">
          <div className="flex min-w-0 items-center truncate text-[11px] text-[#A4A4A4]">
            <button
              type="button"
              onClick={() => {
                setIsAddContractorViewOpen(false);
                setSelectedItem(null);
              }}
              className="truncate text-[11px] text-[#A4A4A4]"
            >
              Master Table
            </button>
            <span className="px-[4px]">&gt;</span>
            <button
              type="button"
              onClick={() => setIsAddContractorViewOpen(false)}
              className="truncate text-[11px] text-[#A4A4A4]"
            >
              Contractor Name
            </button>
            <span className="px-[4px]">&gt;</span>
            <span className="font-medium text-black">{contractorFormMode === 'edit' ? 'Edit' : 'NEW'}</span>
          </div>
          <button type="button" className="shrink-0 text-[12px] font-medium text-black">
            Update
          </button>
        </div>

        <div className="border-t border-[#EFEFEF] px-[16px] py-[8px] text-right">
          <button type="button" className="inline-flex items-center gap-[8px] text-[12px] font-medium text-black">
            <span>View File</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.9 2.1L11.9 5.1M9.6 1.4L2.6 8.4V11.4H5.6L12.6 4.4C12.8667 4.13333 13 3.8 13 3.4C13 3 12.8667 2.66667 12.6 2.4L11.6 1.4C11.3333 1.13333 11 1 10.6 1C10.2 1 9.86667 1.13333 9.6 1.4Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px] pb-[18px]">
        <div className="">
          {renderContractorAccordion(
            'contractor-details',
            'Contractor Details',
            <div className="space-y-[10px]">
              {renderInput({
                label: selectedItem === 'Support Associate Name' ? 'Associate Name' : 'Contractor Name',
                required: true,
                placeholder: 'Select',
                value: contractorForm.contractorName,
                readOnly: false,
                onChange: (e) => setContractorForm((s) => ({ ...s, contractorName: e.target.value })),
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              })}

              {renderInput({
                label: 'Contractor Category',
                required: true,
                placeholder: 'Select',
                value: contractorForm.contractorCategory,
                readOnly: false,
                onChange: (e) => setContractorForm((s) => ({ ...s, contractorCategory: e.target.value })),
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              })}

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Contractor ID',
                  required: true,
                  placeholder: 'Enter ID',
                  value: contractorForm.contractorId,
                  readOnly: false,
                  onChange: (e) => setContractorForm((s) => ({ ...s, contractorId: e.target.value }))
                })}
                {renderInput({
                  label: 'Contractor Number',
                  required: true,
                  placeholder: 'Enter Number',
                  value: contractorForm.contractorNumber,
                  readOnly: false,
                  onChange: (e) => setContractorForm((s) => ({ ...s, contractorNumber: e.target.value }))
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Reference Name',
                  required: true,
                  placeholder: 'Enter Name',
                  value: contractorForm.referenceName,
                  readOnly: false,
                  onChange: (e) => setContractorForm((s) => ({ ...s, referenceName: e.target.value }))
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: 'Select',
                  value: contractorForm.branch,
                  readOnly: false,
                  onChange: (e) => setContractorForm((s) => ({ ...s, branch: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              {renderInput({
                label: 'Email ID',
                placeholder: '',
                value: contractorForm.emailId,
                readOnly: false,
                onChange: (e) => setContractorForm((s) => ({ ...s, emailId: e.target.value }))
              })}

              {renderInput({
                label: 'Contractor Address',
                required: true,
                placeholder: 'Enter Address',
                value: contractorForm.contractorAddress,
                readOnly: false,
                onChange: (e) => setContractorForm((s) => ({ ...s, contractorAddress: e.target.value })),
                multiline: true
              })}
            </div>
          )}

          {renderContractorAccordion(
            'account-details',
            'Account Details',
            <div className="space-y-[10px]">
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <label className="block text-left text-[12px] font-medium text-black">
                    Account Holder Name<span className="text-[#E26D47]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsContractorQrModalOpen(true)}
                    className="text-[12px] font-medium text-[#4B4B4B]"
                  >
                    QR Code
                  </button>
                </div>
                <div className="relative">
                  <input
                    value={contractorForm.accountHolderName || ''}
                    onChange={(e) => setContractorForm((s) => ({ ...s, accountHolderName: e.target.value }))}
                    placeholder=""
                    className="h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] pr-[30px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(contractorForm.accountHolderName)}
                    aria-label="Copy"
                    className="absolute right-[10px] top-1/2 -translate-y-1/2 flex h-[20px] w-[20px] items-center justify-center p-0 text-[#4B4B4B] bg-transparent"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="w-full">
                <div className="flex items-center justify-between">
                  <label className="block text-left text-[12px] font-medium text-black">
                    Account Number<span className="text-[#E26D47]">*</span>
                  </label>
                  <span className="text-[12px] font-medium text-[#4B4B4B]">{contractorForm.bankName || ''}</span>
                </div>
                <div className="relative">
                  <input
                    value={contractorForm.accountNumber || ''}
                    onChange={(e) => setContractorForm((s) => ({ ...s, accountNumber: e.target.value }))}
                    placeholder=""
                    className="h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] pr-[30px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(contractorForm.accountNumber)}
                    aria-label="Copy"
                    className="absolute right-[10px] top-1/2 -translate-y-1/2 flex h-[20px] w-[20px] items-center justify-center p-0 text-[#4B4B4B] bg-transparent"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'IFSC Code',
                  required: true,
                  placeholder: '',
                  value: contractorForm.ifscCode,
                  readOnly: false,
                  onChange: (e) => setContractorForm((s) => ({ ...s, ifscCode: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  ),
                  rightIconInteractive: true,
                  onRightIconClick: () => copyToClipboard(contractorForm.ifscCode)
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: '',
                  value: contractorForm.location,
                  readOnly: false,
                  onChange: (e) => setContractorForm((s) => ({ ...s, location: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  ),
                  rightIconInteractive: true,
                  onRightIconClick: () => copyToClipboard(contractorForm.location)
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'UPI Phone Number',
                  required: true,
                  placeholder: '',
                  value: contractorForm.upiPhoneNumber,
                  readOnly: false,
                  onChange: (e) => setContractorForm((s) => ({ ...s, upiPhoneNumber: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  ),
                  rightIconInteractive: true,
                  onRightIconClick: () => copyToClipboard(contractorForm.upiPhoneNumber)
                })}
                {renderInput({
                  label: 'UPI ID',
                  required: true,
                  placeholder: '',
                  value: contractorForm.upiId,
                  readOnly: false,
                  onChange: (e) => setContractorForm((s) => ({ ...s, upiId: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  ),
                  rightIconInteractive: true,
                  onRightIconClick: () => copyToClipboard(contractorForm.upiId)
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {isContractorQrModalOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsContractorQrModalOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60"
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-[16px]">
            <div
              className="w-full max-w-[330px] rounded-[14px] bg-white px-[18px] pt-[16px] pb-[18px] shadow-[0px_10px_30px_rgba(0,0,0,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-[12px] text-center">
                <div className="text-[16px] font-semibold text-black">QR Code</div>
                <div className="mt-[2px] text-[11px] text-[#7A7A7A]">Scan for Payment</div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIsContractorQrModalOpen(false)}
                  className="absolute right-0 top-0 text-[#F26B3A]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 5L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mx-auto mb-[12px] flex h-[160px] w-[200px] items-center justify-center rounded-[10px] border border-[#E6E6E6] bg-white">
                {contractorQrPreview ? (
                  <img src={contractorQrPreview} alt="QR Code" className="h-[140px] w-[140px] object-contain" />
                ) : (
                  <img src={AccountQrCodeImage} alt="QR Code" className="h-[140px] w-[140px] object-contain" />
                )}
              </div>

              <input
                value={contractorForm.upiId || ''}
                onChange={(e) => setContractorForm((s) => ({ ...s, upiId: e.target.value }))}
                placeholder=""
                className="mb-[10px] h-[34px] w-full rounded-[6px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
              />

              <input
                type="file"
                accept="image/*"
                id="contractorQrUpload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : '';
                    setContractorQrPreview(result);
                    setContractorForm((s) => ({ ...s, qrCode: result }));
                  };
                  reader.readAsDataURL(file);
                }}
              />

              <button
                type="button"
                onClick={() => document.getElementById('contractorQrUpload')?.click()}
                className="mb-[12px] h-[36px] w-full rounded-[6px] border border-[#D9D9D9] bg-white text-[13px] font-medium text-black"
              >
                Update QR Code
              </button>

              <button type="button" className="h-[44px] w-full rounded-[8px] bg-black text-[14px] font-semibold text-white">
                Update
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  const toggleCategorySection = (sectionId) => {
    setExpandedCategorySection((current) => (current === sectionId ? null : sectionId));
  };

  const renderCategoryAccordion = (sectionId, title, content) => {
    const isExpanded = expandedCategorySection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => toggleCategorySection(sectionId)}
          className="flex w-full items-center justify-between px-[14px] py-[13px] text-left"
        >
          <span className="text-[14px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[12px]">{content}</div>}
      </div>
    );
  };

  const renderAddCategoryView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button type="button" className="pb-[8px] text-[#2B2B2B]" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px] text-[12px] font-medium text-black">
          <button type="button" onClick={() => setIsAddCategoryViewOpen(false)} className="flex items-center gap-[6px]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 9L2 6L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>
          <button type="button" className="text-[12px] font-medium text-black">
            {categoryFormMode === 'edit' ? 'Update' : 'Add'}
          </button>
        </div>

        <div className="border-t border-[#EFEFEF] px-[16px] py-[8px] text-right">
          <button type="button" className="inline-flex items-center gap-[8px] text-[12px] font-medium text-black">
            <span>View File</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.9 2.1L11.9 5.1M9.6 1.4L2.6 8.4V11.4H5.6L12.6 4.4C12.8667 4.13333 13 3.8 13 3.4C13 3 12.8667 2.66667 12.6 2.4L11.6 1.4C11.3333 1.13333 11 1 10.6 1C10.2 1 9.86667 1.13333 9.6 1.4Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px] pb-[18px]">
        <div className="">
          {renderCategoryAccordion(
            'category-details',
            'Category Details',
            <div className="space-y-[10px]">
              {renderInput({
                label: 'Category Name',
                required: true,
                placeholder: '',
                value: categoryForm.categoryName,
                readOnly: false,
                onChange: (e) => setCategoryForm({ categoryName: e.target.value })
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const toggleMachineSection = (sectionId) => {
    setExpandedMachineSection((current) => (current === sectionId ? null : sectionId));
  };

  const renderMachineAccordion = (sectionId, title, content) => {
    const isExpanded = expandedMachineSection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => toggleMachineSection(sectionId)}
          className="flex w-full items-center justify-between px-[14px] py-[13px] text-left"
        >
          <span className="text-[14px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[12px]">{content}</div>}
      </div>
    );
  };

  const renderAddMachineView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button type="button" className="pb-[8px] text-[#2B2B2B]" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px]">
          <div className="flex min-w-0 items-center truncate text-[11px] text-[#A4A4A4]">
            <button
              type="button"
              onClick={() => {
                setIsAddMachineViewOpen(false);
                setSelectedItem(null);
              }}
              className="truncate text-[11px] text-[#A4A4A4]"
            >
              Master Table
            </button>
            <span className="px-[4px]">&gt;</span>
            <button
              type="button"
              onClick={() => setIsAddMachineViewOpen(false)}
              className="truncate text-[11px] text-[#A4A4A4]"
            >
              Machine tools
            </button>
            <span className="px-[4px]">&gt;</span>
            <span className="font-medium text-black">{machineFormMode === 'edit' ? 'Edit' : 'New'}</span>
          </div>
          <button type="button" className="shrink-0 text-[12px] font-medium text-black">
            Update
          </button>
        </div>

        <div className="border-t border-[#EFEFEF] px-[16px] py-[8px] text-right">
          <button type="button" className="inline-flex items-center gap-[8px] text-[12px] font-medium text-black">
            <span>View File</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.9 2.1L11.9 5.1M9.6 1.4L2.6 8.4V11.4H5.6L12.6 4.4C12.8667 4.13333 13 3.8 13 3.4C13 3 12.8667 2.66667 12.6 2.4L11.6 1.4C11.3333 1.13333 11 1 10.6 1C10.2 1 9.86667 1.13333 9.6 1.4Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px] pb-[18px]">
        <div className="">
          {renderMachineAccordion(
            'machine-details',
            'Machine Details',
            <div className="space-y-[10px]">
              {renderInput({
                label: 'Machine Name',
                required: true,
                placeholder: '',
                value: machineForm.machineName,
                readOnly: false,
                onChange: (e) => setMachineForm({ machineName: e.target.value })
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const toggleEmployeeSection = (sectionId) => {
    setExpandedEmployeeSection((current) => (current === sectionId ? null : sectionId));
  };

  const renderEmployeeAccordion = (sectionId, title, content) => {
    const isExpanded = expandedEmployeeSection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => toggleEmployeeSection(sectionId)}
          className="flex w-full items-center justify-between px-[14px] py-[13px] text-left"
        >
          <span className="text-[14px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[12px]">{content}</div>}
      </div>
    );
  };

  const renderAddEmployeeView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button type="button" className="pb-[8px] text-[#2B2B2B]" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px] text-[12px] font-medium text-black">
          <button type="button" onClick={() => setIsAddEmployeeViewOpen(false)} className="flex items-center gap-[6px]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 9L2 6L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>
          <button type="button">{employeeFormMode === 'edit' ? 'Update' : 'Submit'}</button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px] text-[12px] font-medium text-black">
          <button type="button" onClick={() => setIsEmployeeAadhaarModalOpen(true)}>
            Aadhaar Upload
          </button>
          <button type="button">View File</button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px] pb-[18px]">
        <div className="">
          {renderEmployeeAccordion(
            'employee-details',
            'Employee Details',
            <div className="space-y-[10px]">
              {renderInput({
                label: 'Employee Name',
                required: true,
                placeholder: 'Enter Name',
                value: employeeForm.employeeName,
                readOnly: false,
                onChange: (e) => setEmployeeForm((s) => ({ ...s, employeeName: e.target.value })),
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              })}

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Employee ID',
                  required: true,
                  placeholder: 'Enter ID',
                  value: employeeForm.employeeId,
                  readOnly: false,
                  onChange: (e) => setEmployeeForm((s) => ({ ...s, employeeId: e.target.value }))
                })}
                {renderInput({
                  label: 'Designation',
                  required: true,
                  placeholder: 'Select',
                  value: employeeForm.designation,
                  readOnly: false,
                  onChange: (e) => setEmployeeForm((s) => ({ ...s, designation: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'User Name',
                  required: true,
                  placeholder: 'Enter Name',
                  value: employeeForm.userName,
                  readOnly: false,
                  onChange: (e) => setEmployeeForm((s) => ({ ...s, userName: e.target.value }))
                })}
                {renderInput({
                  label: 'Mobile Number',
                  required: true,
                  placeholder: 'Select',
                  value: employeeForm.mobileNumber,
                  readOnly: false,
                  onChange: (e) => setEmployeeForm((s) => ({ ...s, mobileNumber: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              {renderInput({
                label: 'Email ID',
                placeholder: 'Enter EMail',
                value: employeeForm.emailId,
                readOnly: false,
                onChange: (e) => setEmployeeForm((s) => ({ ...s, emailId: e.target.value }))
              })}

              {renderInput({
                label: 'Employee Address',
                required: true,
                placeholder: 'Enter Address',
                value: employeeForm.employeeAddress,
                readOnly: false,
                onChange: (e) => setEmployeeForm((s) => ({ ...s, employeeAddress: e.target.value })),
                multiline: true
              })}
            </div>
          )}

          {renderEmployeeAccordion(
            'account-details',
            'Account Details',
            <div className="space-y-[10px]">
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <label className="block text-left text-[12px] font-medium text-black">
                    Account Holder Name<span className="text-[#E26D47]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEmployeeQrModalOpen(true)}
                    className="text-[12px] font-medium text-[#4B4B4B]"
                  >
                    QR Code
                  </button>
                </div>
                <input
                  value={employeeForm.accountHolderName || ''}
                  onChange={(e) => setEmployeeForm((s) => ({ ...s, accountHolderName: e.target.value }))}
                  placeholder="Enter Name"
                  className="h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
                />
              </div>

              <div className="w-full">
                <div className="flex items-center justify-between">
                  <label className="block text-left text-[12px] font-medium text-black">
                    Account Number<span className="text-[#E26D47]">*</span>
                  </label>
                  <span className="text-[12px] font-medium text-[#4B4B4B]">Bank Name</span>
                </div>
                <input
                  value={employeeForm.accountNumber || ''}
                  onChange={(e) => setEmployeeForm((s) => ({ ...s, accountNumber: e.target.value }))}
                  placeholder="Enter Account Number"
                  className="h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'IFSC Code',
                  required: true,
                  placeholder: 'Enter IFSC Code',
                  value: employeeForm.ifscCode,
                  readOnly: false,
                  onChange: (e) => setEmployeeForm((s) => ({ ...s, ifscCode: e.target.value }))
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: 'Select Branch',
                  value: employeeForm.branch,
                  readOnly: false,
                  onChange: (e) => setEmployeeForm((s) => ({ ...s, branch: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'UPI Phone Number',
                  required: true,
                  placeholder: 'Enter Number',
                  value: employeeForm.upiPhoneNumber,
                  readOnly: false,
                  onChange: (e) => setEmployeeForm((s) => ({ ...s, upiPhoneNumber: e.target.value }))
                })}
                {renderInput({
                  label: 'UPI ID',
                  required: true,
                  placeholder: 'Enter UPI ID',
                  value: employeeForm.upiId,
                  readOnly: false,
                  onChange: (e) => setEmployeeForm((s) => ({ ...s, upiId: e.target.value }))
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {isEmployeeQrModalOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsEmployeeQrModalOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60"
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-[16px]">
            <div
              className="w-full max-w-[330px] rounded-[14px] bg-white px-[18px] pt-[16px] pb-[18px] shadow-[0px_10px_30px_rgba(0,0,0,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-[12px] text-center">
                <div className="text-[16px] font-semibold text-black">QR Code</div>
                <div className="mt-[2px] text-[11px] text-[#7A7A7A]">Scan for Payment</div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIsEmployeeQrModalOpen(false)}
                  className="absolute right-0 top-0 text-[#F26B3A]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 5L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mx-auto mb-[12px] flex h-[160px] w-[200px] items-center justify-center rounded-[10px] border border-[#E6E6E6] bg-white">
                {employeeQrPreview ? (
                  <img src={employeeQrPreview} alt="QR Code" className="h-[140px] w-[140px] object-contain" />
                ) : (
                  <img src={AccountQrCodeImage} alt="QR Code" className="h-[140px] w-[140px] object-contain" />
                )}
              </div>

              <input
                value={employeeForm.upiId || ''}
                onChange={(e) => setEmployeeForm((s) => ({ ...s, upiId: e.target.value }))}
                placeholder=""
                className="mb-[10px] h-[34px] w-full rounded-[6px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
              />

              <input
                type="file"
                accept="image/*"
                id="employeeQrUpload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : '';
                    setEmployeeQrPreview(result);
                    setEmployeeForm((s) => ({ ...s, qrCode: result }));
                  };
                  reader.readAsDataURL(file);
                }}
              />

              <button
                type="button"
                onClick={() => document.getElementById('employeeQrUpload')?.click()}
                className="mb-[12px] h-[36px] w-full rounded-[6px] border border-[#D9D9D9] bg-white text-[13px] font-medium text-black"
              >
                Update QR Code
              </button>

              <button type="button" className="h-[44px] w-full rounded-[8px] bg-black text-[14px] font-semibold text-white">
                Update
              </button>
            </div>
          </div>
        </>
      )}

      {isEmployeeAadhaarModalOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsEmployeeAadhaarModalOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60"
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-[16px]">
            <div
              className="w-full max-w-[330px] rounded-[14px] bg-white px-[16px] pt-[14px] pb-[16px] shadow-[0px_10px_30px_rgba(0,0,0,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-[10px] text-center">
                <div className="text-[15px] font-semibold text-black">Upload and Attach files</div>
                <div className="mt-[2px] text-[10px] text-[#7A7A7A]">Attachments will be of this Transfer</div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIsEmployeeAadhaarModalOpen(false)}
                  className="absolute right-0 top-0 text-[#F26B3A]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 5L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <input
                type="file"
                accept="image/*"
                id="employeeAadhaarUpload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setEmployeeAadhaarFile(file);
                }}
              />

              <button
                type="button"
                onClick={() => document.getElementById('employeeAadhaarUpload')?.click()}
                className="mb-[12px] flex w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-[#D6D6D6] bg-white px-[10px] py-[16px] text-center"
              >
                <div className="mb-[6px] flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-[#F3F3F3] text-[#8A8A8A]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 12V3M9 3L6 6M9 3L12 6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M3 12.5V14.5C3 15.3 3.7 16 4.5 16H13.5C14.3 16 15 15.3 15 14.5V12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-[12px] font-medium text-[#F26B3A]">Click to Upload</div>
                <div className="mt-[2px] text-[10px] text-[#7A7A7A]">Only one images has been uploaded</div>
                <div className="text-[10px] text-[#7A7A7A]">(Max. File size: 5 MB)</div>
              </button>

              <div className="mb-[8px] text-[12px] font-medium text-black">File Uploading</div>

              {employeeAadhaarFile && (
                <div className="mb-[14px] rounded-[10px] border border-[#E7E7E7] bg-white px-[10px] py-[10px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[10px]">
                      <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-[#F3F3F3] text-[#8A8A8A]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2.2" y="2.2" width="11.6" height="11.6" rx="2" stroke="currentColor" strokeWidth="1.3" />
                          <path d="M5 10.5L7 8.5L9 10.5L11 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-[12px] font-medium text-black">{employeeAadhaarFile.name}</div>
                        <div className="text-[10px] text-[#7A7A7A]">{formatFileSize(employeeAadhaarFile.size)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-[10px]">
                      <div className="text-[10px] font-medium text-[#F26B3A]">100%</div>
                      <button type="button" onClick={() => setEmployeeAadhaarFile(null)} aria-label="Remove" className="text-[#F26B3A]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3.2 4.6H12.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          <path d="M6.2 4.6V3.4C6.2 2.8 6.7 2.3 7.3 2.3H8.7C9.3 2.3 9.8 2.8 9.8 3.4V4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          <path d="M5.2 4.6L5.6 13.1C5.6 13.7 6.1 14.2 6.7 14.2H9.3C9.9 14.2 10.4 13.7 10.4 13.1L10.8 4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-[8px] h-[2px] w-full rounded-full bg-[#F0F0F0]">
                    <div className="h-[2px] w-full rounded-full bg-[#F26B3A]" />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsEmployeeAadhaarModalOpen(false)}
                className="h-[44px] w-full rounded-[8px] bg-black text-[14px] font-semibold text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  const toggleAccountSection = (sectionId) => {
    setExpandedAccountSection((current) => (current === sectionId ? null : sectionId));
  };

  const renderAccountAccordion = (sectionId, title, content) => {
    const isExpanded = expandedAccountSection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => toggleAccountSection(sectionId)}
          className="flex w-full items-center justify-between px-[14px] py-[13px] text-left"
        >
          <span className="text-[14px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[12px]">{content}</div>}
      </div>
    );
  };

  const renderAddAccountView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button type="button" className="pb-[8px] text-[#2B2B2B]" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px] text-[12px] font-medium text-black">
          <button type="button" onClick={() => setIsAddAccountViewOpen(false)} className="flex items-center gap-[6px]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 9L2 6L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>
          <button type="button" className="text-[12px] font-medium text-black">
            {accountFormMode === 'edit' ? 'Update' : 'Submit'}
          </button>
        </div>

        <div className="border-t border-[#EFEFEF] px-[16px] py-[8px] text-right">
          <button type="button" className="inline-flex items-center gap-[8px] text-[12px] font-medium text-black">
            <span>Upload File</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3.5 12.25H10.5M7 9.91667V1.75M7 1.75L4.66667 4.08333M7 1.75L9.33333 4.08333"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px] pb-[18px]">
        <div className="">
          {renderAccountAccordion(
            'account-details',
            'Account Details',
            <div className="space-y-[10px]">
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <label className="block text-left text-[12px] font-medium text-black">
                    Account Holder Name<span className="text-[#E26D47]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAccountQrModalOpen(true)}
                    className="text-[12px] font-medium text-[#4B4B4B]"
                  >
                    QR Code
                  </button>
                </div>
                <input
                  value={accountForm.accountHolderName || ''}
                  onChange={(e) => setAccountForm((s) => ({ ...s, accountHolderName: e.target.value }))}
                  placeholder=""
                  className="h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
                />
              </div>

              <div className="w-full">
                <div className="flex items-center justify-between">
                  <label className="block text-left text-[12px] font-medium text-black">
                    Account Number<span className="text-[#E26D47]">*</span>
                  </label>
                  <span className="text-[12px] font-medium text-[#4B4B4B]">{accountForm.bankName || ''}</span>
                </div>
                <input
                  value={accountForm.accountNumber || ''}
                  onChange={(e) => setAccountForm((s) => ({ ...s, accountNumber: e.target.value }))}
                  placeholder=""
                  className="h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'IFSC Code',
                  required: true,
                  placeholder: '',
                  value: accountForm.ifscCode,
                  readOnly: false,
                  onChange: (e) => setAccountForm((s) => ({ ...s, ifscCode: e.target.value }))
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: '',
                  value: accountForm.branch,
                  readOnly: false,
                  onChange: (e) => setAccountForm((s) => ({ ...s, branch: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              {renderInput({
                label: 'Account Type',
                required: true,
                placeholder: '',
                value: accountForm.accountType,
                readOnly: false,
                onChange: (e) => setAccountForm((s) => ({ ...s, accountType: e.target.value })),
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              })}

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'UPI Phone Number',
                  required: true,
                  placeholder: '',
                  value: accountForm.upiPhoneNumber,
                  readOnly: false,
                  onChange: (e) => setAccountForm((s) => ({ ...s, upiPhoneNumber: e.target.value }))
                })}
                {renderInput({
                  label: 'UPI ID',
                  required: true,
                  placeholder: '',
                  value: accountForm.upiId,
                  readOnly: false,
                  onChange: (e) => setAccountForm((s) => ({ ...s, upiId: e.target.value }))
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {isAccountQrModalOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsAccountQrModalOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60"
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-[16px]">
            <div
              className="w-full max-w-[330px] rounded-[14px] bg-white px-[18px] pt-[16px] pb-[18px] shadow-[0px_10px_30px_rgba(0,0,0,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-[12px] text-center">
                <div className="text-[16px] font-semibold text-black">QR Code</div>
                <div className="mt-[2px] text-[11px] text-[#7A7A7A]">Scan for Payment</div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIsAccountQrModalOpen(false)}
                  className="absolute right-0 top-0 text-[#F26B3A]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 5L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mx-auto mb-[12px] flex h-[160px] w-[200px] items-center justify-center rounded-[10px] border border-[#E6E6E6] bg-white">
                {accountQrPreview ? (
                  <img src={accountQrPreview} alt="QR Code" className="h-[140px] w-[140px] object-contain" />
                ) : (
                  <img src={AccountQrCodeImage} alt="QR Code" className="h-[140px] w-[140px] object-contain" />
                )}
              </div>

              <input
                value={accountForm.upiId || ''}
                onChange={(e) => setAccountForm((s) => ({ ...s, upiId: e.target.value }))}
                placeholder=""
                className="mb-[10px] h-[34px] w-full rounded-[6px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
              />

              <input
                type="file"
                accept="image/*"
                id="accountQrUpload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : '';
                    setAccountQrPreview(result);
                    setAccountForm((s) => ({ ...s, qrCode: result }));
                  };
                  reader.readAsDataURL(file);
                }}
              />

              <button
                type="button"
                onClick={() => document.getElementById('accountQrUpload')?.click()}
                className="mb-[12px] h-[36px] w-full rounded-[6px] border border-[#D9D9D9] bg-white text-[13px] font-medium text-black"
              >
                Update QR Code
              </button>

              <button type="button" className="h-[44px] w-full rounded-[8px] bg-black text-[14px] font-semibold text-white">
                Update
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  const toggleLabourSection = (sectionId) => {
    setExpandedLabourSection((current) => (current === sectionId ? null : sectionId));
  };

  const renderLabourAccordion = (sectionId, title, content) => {
    const isExpanded = expandedLabourSection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => toggleLabourSection(sectionId)}
          className="flex w-full items-center justify-between px-[14px] py-[13px] text-left"
        >
          <span className="text-[14px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[12px]">{content}</div>}
      </div>
    );
  };

  const renderAddLabourView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button type="button" className="pb-[8px] text-[#2B2B2B]" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px] text-[12px] font-medium text-black">
          <button type="button" onClick={() => setIsAddLabourViewOpen(false)} className="flex items-center gap-[6px]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 9L2 6L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>
          <button
            type="button"
            className="text-[12px] font-medium text-[#F26B3A]"
            aria-label={labourFormMode === 'edit' ? 'Update labour' : 'Submit labour'}
          >
            Submit
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px] text-[12px] font-medium text-black">
          <span />
          <button type="button" className="text-[#2B2B2B]">
            View File
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px] pb-[18px]">
        <div className="flex flex-col ">
          {renderLabourAccordion(
            'labour-details',
            'Labour Details',
            <div className="space-y-[10px]">
              {renderInput({
                label: 'Labour Name',
                required: true,
                placeholder: '',
                value: labourForm.labourName,
                readOnly: false,
                onChange: (e) => setLabourForm((s) => ({ ...s, labourName: e.target.value })),
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              })}

              {renderInput({
                label: 'Labour Category',
                required: true,
                placeholder: '',
                value: labourForm.labourCategory,
                readOnly: false,
                onChange: (e) => setLabourForm((s) => ({ ...s, labourCategory: e.target.value })),
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              })}

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Labour ID',
                  required: true,
                  placeholder: '',
                  value: labourForm.labourId,
                  readOnly: false,
                  onChange: (e) => setLabourForm((s) => ({ ...s, labourId: e.target.value }))
                })}
                {renderInput({
                  label: 'Labour Number',
                  required: true,
                  placeholder: '',
                  value: labourForm.labourNumber,
                  readOnly: false,
                  onChange: (e) => setLabourForm((s) => ({ ...s, labourNumber: e.target.value }))
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Reference Name',
                  required: true,
                  placeholder: '',
                  value: labourForm.referenceName,
                  readOnly: false,
                  onChange: (e) => setLabourForm((s) => ({ ...s, referenceName: e.target.value }))
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: '',
                  value: labourForm.branch,
                  readOnly: false,
                  onChange: (e) => setLabourForm((s) => ({ ...s, branch: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              {renderInput({
                label: 'Labour Address',
                required: true,
                placeholder: 'Enter Address',
                value: labourForm.labourAddress,
                readOnly: false,
                onChange: (e) => setLabourForm((s) => ({ ...s, labourAddress: e.target.value })),
                multiline: true
              })}
            </div>
          )}

          {renderLabourAccordion(
            'wage-details',
            'Wage Details',
            <div className="space-y-[10px]">
              <div className="w-full">
                <label className="block text-left text-[12px] font-medium text-black">
                  Wage Type<span className="text-[#E26D47]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={labourForm.wageType || ''}
                    onChange={(e) => setLabourForm((s) => ({ ...s, wageType: e.target.value }))}
                    className="h-[32px] w-full appearance-none rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] pr-[30px] text-[12px] text-black outline-none"
                  >
                    <option value="">Select Wage Type</option>
                    {LABOUR_WAGE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-[#4B4B4B]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
              {renderInput({
                label: 'Salary',
                required: true,
                placeholder: '',
                value: labourForm.labourSalary,
                readOnly: false,
                onChange: (e) => setLabourForm((s) => ({ ...s, labourSalary: e.target.value }))
              })}
            </div>
          )}

          {renderLabourAccordion(
            'account-details',
            'Account Details',
            <div className="space-y-[10px]">
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <label className="block text-left text-[12px] font-medium text-black">
                    Account Holder Name<span className="text-[#E26D47]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsLabourQrModalOpen(true)}
                    className="text-[12px] font-medium text-[#4B4B4B]"
                  >
                    QR Code
                  </button>
                </div>
                <input
                  value={labourForm.accountHolderName || ''}
                  onChange={(e) => setLabourForm((s) => ({ ...s, accountHolderName: e.target.value }))}
                  placeholder="Enter Name"
                  className="h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
                />
              </div>

              <div className="w-full">
                <div className="flex items-center justify-between">
                  <label className="block text-left text-[12px] font-medium text-black">
                    Account Number<span className="text-[#E26D47]">*</span>
                  </label>
                  <span className="text-[12px] font-medium text-[#4B4B4B]">Bank Name</span>
                </div>
                <input
                  value={labourForm.accountNumber || ''}
                  onChange={(e) => setLabourForm((s) => ({ ...s, accountNumber: e.target.value }))}
                  placeholder="Enter Account Number"
                  className="h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'IFSC Code',
                  required: true,
                  placeholder: 'Enter IFSC Code',
                  value: labourForm.ifscCode,
                  readOnly: false,
                  onChange: (e) => setLabourForm((s) => ({ ...s, ifscCode: e.target.value }))
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: 'Select Branch',
                  value: labourForm.accountBranch,
                  readOnly: false,
                  onChange: (e) => setLabourForm((s) => ({ ...s, accountBranch: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'UPI Phone Number',
                  required: true,
                  placeholder: 'Enter Number',
                  value: labourForm.upiPhoneNumber,
                  readOnly: false,
                  onChange: (e) => setLabourForm((s) => ({ ...s, upiPhoneNumber: e.target.value }))
                })}
                {renderInput({
                  label: 'UPI ID',
                  required: true,
                  placeholder: 'Enter UPI ID',
                  value: labourForm.upiId,
                  readOnly: false,
                  onChange: (e) => setLabourForm((s) => ({ ...s, upiId: e.target.value }))
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLabourQrModalOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsLabourQrModalOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60"
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-[16px]">
            <div
              className="w-full max-w-[330px] rounded-[14px] bg-white px-[18px] pt-[16px] pb-[18px] shadow-[0px_10px_30px_rgba(0,0,0,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-[12px] text-center">
                <div className="text-[16px] font-semibold text-black">QR Code</div>
                <div className="mt-[2px] text-[11px] text-[#7A7A7A]">Scan for Payment</div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIsLabourQrModalOpen(false)}
                  className="absolute right-0 top-0 text-[#F26B3A]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 5L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mx-auto mb-[12px] flex h-[160px] w-[200px] items-center justify-center rounded-[10px] border border-[#E6E6E6] bg-white">
                {labourQrPreview ? (
                  <img src={labourQrPreview} alt="QR Code" className="h-[140px] w-[140px] object-contain" />
                ) : (
                  <img src={AccountQrCodeImage} alt="QR Code" className="h-[140px] w-[140px] object-contain" />
                )}
              </div>

              <input
                value={labourForm.upiId || ''}
                onChange={(e) => setLabourForm((s) => ({ ...s, upiId: e.target.value }))}
                placeholder=""
                className="mb-[10px] h-[34px] w-full rounded-[6px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
              />

              <input
                type="file"
                accept="image/*"
                id="labourQrUpload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : '';
                    setLabourQrPreview(result);
                    setLabourForm((s) => ({ ...s, qrCode: result }));
                  };
                  reader.readAsDataURL(file);
                }}
              />

              <button
                type="button"
                onClick={() => document.getElementById('labourQrUpload')?.click()}
                className="mb-[12px] h-[36px] w-full rounded-[6px] border border-[#D9D9D9] bg-white text-[13px] font-medium text-black"
              >
                Update QR Code
              </button>

              <button type="button" className="h-[44px] w-full rounded-[8px] bg-black text-[14px] font-semibold text-white">
                Update
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderAddVendorView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button type="button" className="pb-[8px] text-[#2B2B2B]" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px]">
          <div className="flex min-w-0 items-center truncate text-[11px] text-[#A4A4A4]">
            <button
              type="button"
              onClick={() => {
                setIsAddVendorViewOpen(false);
                setSelectedItem(null);
              }}
              className="truncate text-[11px] text-[#A4A4A4]"
            >
              Master Table
            </button>
            <span className="px-[4px]">&gt;</span>
            <button
              type="button"
              onClick={() => setIsAddVendorViewOpen(false)}
              className="truncate text-[11px] text-[#A4A4A4]"
            >
              Vendor Name
            </button>
            <span className="px-[4px]">&gt;</span>
            <span className="font-medium text-black">{vendorFormMode === 'edit' ? 'Edit' : 'NEW'}</span>
          </div>
          <button type="button" className="shrink-0 text-[12px] font-medium text-black">
            Update
          </button>
        </div>

        <div className="border-t border-[#EFEFEF] px-[16px] py-[8px] text-right">
          <button type="button" className="inline-flex items-center gap-[8px] text-[12px] font-medium text-black">
            <span>Upload File</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.9 2.1L11.9 5.1M9.6 1.4L2.6 8.4V11.4H5.6L12.6 4.4C12.8667 4.13333 13 3.8 13 3.4C13 3 12.8667 2.66667 12.6 2.4L11.6 1.4C11.3333 1.13333 11 1 10.6 1C10.2 1 9.86667 1.13333 9.6 1.4Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px] pb-[18px]">
        <div className="">
          {renderVendorAccordion(
            'vendor-details',
            'Vendor Details',
            <div className="space-y-[10px]">
              {renderInput({
                label: 'Vendor Name',
                required: true,
                placeholder: 'Select',
                value: vendorForm.vendorName,
                readOnly: false,
                onChange: (e) => setVendorForm((s) => ({ ...s, vendorName: e.target.value })),
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              })}

              {renderInput({
                label: 'Vendor Category',
                required: true,
                placeholder: 'Select',
                value: vendorForm.vendorCategory,
                readOnly: false,
                onChange: (e) => setVendorForm((s) => ({ ...s, vendorCategory: e.target.value })),
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              })}

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Vendor ID',
                  required: true,
                  placeholder: 'Enter ID',
                  value: vendorForm.vendorId,
                  readOnly: false,
                  onChange: (e) => setVendorForm((s) => ({ ...s, vendorId: e.target.value }))
                })}
                {renderInput({
                  label: 'Contact Number',
                  required: true,
                  placeholder: 'Enter Number',
                  value: vendorForm.contactNumber,
                  readOnly: false,
                  onChange: (e) => setVendorForm((s) => ({ ...s, contactNumber: e.target.value }))
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Reference Name',
                  required: true,
                  placeholder: 'Enter Name',
                  value: vendorForm.referenceName,
                  readOnly: false,
                  onChange: (e) => setVendorForm((s) => ({ ...s, referenceName: e.target.value }))
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: 'Select',
                  value: vendorForm.branch,
                  readOnly: false,
                  onChange: (e) => setVendorForm((s) => ({ ...s, branch: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              {renderInput({
                label: 'Email ID',
                placeholder: '',
                value: vendorForm.emailId,
                readOnly: false,
                onChange: (e) => setVendorForm((s) => ({ ...s, emailId: e.target.value }))
              })}

              {renderInput({
                label: 'Vendor Address',
                required: true,
                placeholder: 'Enter Address',
                value: vendorForm.vendorAddress,
                readOnly: false,
                onChange: (e) => setVendorForm((s) => ({ ...s, vendorAddress: e.target.value })),
                multiline: true
              })}
            </div>
          )}

          {renderVendorAccordion(
            'account-details',
            'Account Details',
            <div className="space-y-[10px]">
              {/*
                Copy buttons are only enabled on this NEW add screen by passing:
                rightIconInteractive + onRightIconClick.
              */}
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <label className="block text-left text-[12px] font-medium text-black">
                    Account Holder Name<span className="text-[#E26D47]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsVendorQrModalOpen(true)}
                    className="text-[12px] font-medium text-[#4B4B4B]"
                  >
                    QR Code
                  </button>
                </div>
                <div className="relative">
                  <input
                    value={vendorForm.accountHolderName || ''}
                    onChange={(e) => setVendorForm((s) => ({ ...s, accountHolderName: e.target.value }))}
                    placeholder=""
                    className="h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] pr-[30px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(vendorForm.accountHolderName)}
                    aria-label="Copy"
                    className="absolute right-[10px] top-1/2 -translate-y-1/2 flex h-[20px] w-[20px] items-center justify-center p-0 text-[#4B4B4B] bg-transparent"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="w-full">
                <div className="flex items-center justify-between">
                  <label className="block text-left text-[12px] font-medium text-black">
                    Account Number<span className="text-[#E26D47]">*</span>
                  </label>
                  <span className="text-[12px] font-medium text-[#4B4B4B]">{vendorForm.bankName || ''}</span>
                </div>
                <div className="relative">
                  <input
                    value={vendorForm.accountNumber || ''}
                    onChange={(e) => setVendorForm((s) => ({ ...s, accountNumber: e.target.value }))}
                    placeholder=""
                    className="h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] pr-[30px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(vendorForm.accountNumber)}
                    aria-label="Copy"
                    className="absolute right-[10px] top-1/2 -translate-y-1/2 flex h-[20px] w-[20px] items-center justify-center p-0 text-[#4B4B4B] bg-transparent"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'IFSC Code',
                  required: true,
                  placeholder: '',
                  value: vendorForm.ifscCode,
                  readOnly: false,
                  onChange: (e) => setVendorForm((s) => ({ ...s, ifscCode: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  ),
                  rightIconInteractive: true,
                  onRightIconClick: () => copyToClipboard(vendorForm.ifscCode)
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: '',
                  value: vendorForm.location,
                  readOnly: false,
                  onChange: (e) => setVendorForm((s) => ({ ...s, location: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  ),
                  rightIconInteractive: true,
                  onRightIconClick: () => copyToClipboard(vendorForm.location)
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'UPI Phone Number',
                  required: true,
                  placeholder: '',
                  value: vendorForm.upiPhoneNumber,
                  readOnly: false,
                  onChange: (e) => setVendorForm((s) => ({ ...s, upiPhoneNumber: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  ),
                  rightIconInteractive: true,
                  onRightIconClick: () => copyToClipboard(vendorForm.upiPhoneNumber)
                })}
                {renderInput({
                  label: 'UPI ID',
                  required: true,
                  placeholder: '',
                  value: vendorForm.upiId,
                  readOnly: false,
                  onChange: (e) => setVendorForm((s) => ({ ...s, upiId: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  ),
                  rightIconInteractive: true,
                  onRightIconClick: () => copyToClipboard(vendorForm.upiId)
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {isVendorQrModalOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsVendorQrModalOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60"
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-[16px]">
            <div
              className="w-full max-w-[330px] rounded-[14px] bg-white px-[18px] pt-[16px] pb-[18px] shadow-[0px_10px_30px_rgba(0,0,0,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-[12px] text-center">
                <div className="text-[16px] font-semibold text-black">QR Code</div>
                <div className="mt-[2px] text-[11px] text-[#7A7A7A]">Scan for Payment</div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIsVendorQrModalOpen(false)}
                  className="absolute right-0 top-0 text-[#F26B3A]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 5L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mx-auto mb-[12px] flex h-[160px] w-[200px] items-center justify-center rounded-[10px] border border-[#E6E6E6] bg-white">
                {vendorQrPreview ? (
                  <img src={vendorQrPreview} alt="QR Code" className="h-[140px] w-[140px] object-contain" />
                ) : (
                  <img src={AccountQrCodeImage} alt="QR Code" className="h-[140px] w-[140px] object-contain" />
                )}
              </div>

              <input
                value={vendorForm.upiId || ''}
                onChange={(e) => setVendorForm((s) => ({ ...s, upiId: e.target.value }))}
                placeholder=""
                className="mb-[10px] h-[34px] w-full rounded-[6px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
              />

              <input
                type="file"
                accept="image/*"
                id="vendorQrUpload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : '';
                    setVendorQrPreview(result);
                    setVendorForm((s) => ({ ...s, qrCode: result }));
                  };
                  reader.readAsDataURL(file);
                }}
              />

              <button
                type="button"
                onClick={() => document.getElementById('vendorQrUpload')?.click()}
                className="mb-[12px] h-[36px] w-full rounded-[6px] border border-[#D9D9D9] bg-white text-[13px] font-medium text-black"
              >
                Update QR Code
              </button>

              <button type="button" className="h-[44px] w-full rounded-[8px] bg-black text-[14px] font-semibold text-white">
                Update
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderAddProjectView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button
            type="button"
            className="pb-[8px] text-[#2B2B2B]"
            aria-label="More options"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px]">
          <div className="flex min-w-0 items-center truncate text-[11px] text-[#A4A4A4]">
            <button
              type="button"
              onClick={() => {
                setIsAddProjectViewOpen(false);
                setSelectedItem(null);
              }}
              className="truncate text-[11px] text-[#A4A4A4]"
            >
              Master Table
            </button>
            <span className="px-[4px]">&gt;</span>
            <button
              type="button"
              onClick={() => setIsAddProjectViewOpen(false)}
              className="truncate text-[11px] text-[#A4A4A4]"
            >
              Project Name
            </button>
            <span className="px-[4px]">&gt;</span>
            <span className="font-medium text-black">{projectFormMode === 'edit' ? 'Edit' : 'New'}</span>
          </div>
          <button
            type="button"
            className="shrink-0 text-[12px] font-medium text-black"
          >
            Submit
          </button>
        </div>

        <div className="border-t border-[#EFEFEF] px-[16px] py-[8px] text-right">
          <button type="button" className="text-[12px] font-medium text-black">
            Upload File
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px] pb-[18px]">
        <div className="">
          {renderProjectAccordion(
            'project-details',
            'Project Details',
            <div className="space-y-[10px]">
              {renderInput({
                label: 'Project Name',
                required: true,
                placeholder: 'Enter Name',
                value: projectForm.projectName,
                readOnly: projectFormMode !== 'edit',
                onChange: (e) => setProjectForm((s) => ({ ...s, projectName: e.target.value })),
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              })}

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Project ID',
                  required: true,
                  placeholder: 'Enter ID',
                  value: projectForm.projectId,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, projectId: e.target.value }))
                })}
                {renderInput({
                  label: 'Project Category',
                  required: true,
                  placeholder: 'Select',
                  value: projectForm.projectCategory,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, projectCategory: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Reference Name',
                  required: true,
                  placeholder: 'Enter Name',
                  value: projectForm.referenceName,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, referenceName: e.target.value }))
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: 'Select',
                  value: projectForm.branch,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, branch: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              {renderInput({
                label: 'Project Address',
                required: true,
                placeholder: 'Enter Address',
                value: projectForm.projectAddress,
                readOnly: projectFormMode !== 'edit',
                onChange: (e) => setProjectForm((s) => ({ ...s, projectAddress: e.target.value })),
                multiline: true
              })}
            </div>
          )}

          {renderProjectAccordion(
            'client-details',
            'Client Details',
            <div className="space-y-[10px]">
              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Client Name',
                  required: true,
                  placeholder: 'Enter Number',
                  value: projectForm.clientName,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, clientName: e.target.value }))
                })}
                {renderInput({
                  label: 'Father Name',
                  required: true,
                  placeholder: 'Enter Age',
                  value: projectForm.fatherName,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, fatherName: e.target.value }))
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Mobile Number',
                  required: true,
                  placeholder: 'Enter Number',
                  value: projectForm.mobileNumber,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, mobileNumber: e.target.value }))
                })}
                {renderInput({
                  label: 'Age',
                  required: true,
                  placeholder: 'Enter Age',
                  value: projectForm.age,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, age: e.target.value }))
                })}
              </div>

              {renderInput({
                label: 'Email ID',
                placeholder: '',
                value: projectForm.emailId,
                readOnly: projectFormMode !== 'edit',
                onChange: (e) => setProjectForm((s) => ({ ...s, emailId: e.target.value }))
              })}

              {renderInput({
                label: 'Client Address',
                required: true,
                placeholder: 'Enter Address',
                value: projectForm.clientAddress,
                readOnly: projectFormMode !== 'edit',
                onChange: (e) => setProjectForm((s) => ({ ...s, clientAddress: e.target.value })),
                multiline: true
              })}
            </div>
          )}

          {renderProjectAccordion(
            'account-details',
            'Account Details',
            <div className="space-y-[10px]">
              <div className="grid grid-cols-[minmax(0,1fr)_92px] gap-[12px]">
                {renderInput({
                  label: 'Account Holder Name',
                  required: true,
                  placeholder: '',
                  value: projectForm.accountHolderName,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, accountHolderName: e.target.value }))
                })}
                {renderInput({
                  label: 'QR Code',
                  placeholder: '',
                  value: projectForm.qrCode,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, qrCode: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_140px] gap-[12px]">
                {renderInput({
                  label: 'Account Number',
                  required: true,
                  placeholder: '',
                  value: projectForm.accountNumber,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, accountNumber: e.target.value }))
                })}
                {renderInput({
                  label: ' ',
                  placeholder: '',
                  value: projectForm.bankName,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, bankName: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'IFSC Code',
                  required: true,
                  placeholder: '',
                  value: projectForm.ifscCode,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, ifscCode: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: '',
                  value: projectForm.accountBranch,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, accountBranch: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'UPI Phone Number',
                  required: true,
                  placeholder: '',
                  value: projectForm.upiPhoneNumber,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, upiPhoneNumber: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )
                })}
                {renderInput({
                  label: 'UPI ID',
                  required: true,
                  placeholder: '',
                  value: projectForm.upiId,
                  readOnly: projectFormMode !== 'edit',
                  onChange: (e) => setProjectForm((s) => ({ ...s, upiId: e.target.value })),
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )
                })}
              </div>
            </div>
          )}

          {renderProjectAccordion(
            'project-information',
            'Project Information',
            <div className="space-y-[12px]">
              <div className="relative">
                <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12.5 12.5L15.75 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="text"
                  readOnly
                  placeholder="Search"
                  className="h-[36px] w-full rounded-full border border-[#D2D2D2] bg-white pl-[38px] pr-[14px] text-[14px] text-black outline-none placeholder:text-[#8F8F8F]"
                />
              </div>

              <div className="rounded-[12px] border border-[#F0F0F0] bg-white p-[12px] shadow-[0px_1px_4px_rgba(0,0,0,0.05)]">
                <div className="grid grid-cols-[minmax(0,1fr)_92px] gap-[10px] text-[12px] text-black">
                  <div className="space-y-[4px] text-left">
                    <div>SL - 01 - 13/41B</div>
                    <div>Home</div>
                    <div>First Floor</div>
                    <div className="text-[#5B5B5B]">07989837327949, 1Phase</div>
                  </div>
                  <div className="space-y-[4px] text-right">
                    <div>1200 Sqft</div>
                    <div>Sh.No 134</div>
                    <div className="whitespace-nowrap text-[#C79B53]">PT 3564743897879</div>
                    <div className="whitespace-nowrap text-[#C79B53]">WT 843646H76346</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddOnSheetOpen(true)}
                className="flex h-[34px] w-full items-center justify-center gap-[8px] rounded-[4px] border border-[#BEBEBE] bg-white text-[14px] font-medium text-black"
              >
                <span className="text-[20px] leading-none">+</span>
                <span>Add on</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {isAddOnSheetOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsAddOnSheetOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/50"
          />

          <div className="fixed inset-x-0 bottom-0 z-[10000] mx-auto w-full rounded-t-[18px] bg-white px-[16px] pb-[16px] pt-[18px] shadow-[0px_-4px_20px_rgba(0,0,0,0.12)]">
            <div className="mb-[10px] flex items-start justify-between">
              <div className="text-[15px] font-medium text-black">Enter Bill Details</div>
              <button
                type="button"
                onClick={() => setIsAddOnSheetOpen(false)}
                className="text-[28px] leading-none text-[#F26B3A]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-[10px]">
              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Project Type',
                  required: true,
                  placeholder: 'Select',
                  value: '',
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
                {renderInput({
                  label: 'Floor Name',
                  required: true,
                  placeholder: 'Select',
                  value: '',
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-[70px_70px_minmax(0,1fr)] gap-[8px]">
                {renderInput({
                  label: 'Shop No',
                  required: true,
                  placeholder: 'Enter',
                  value: ''
                })}
                {renderInput({
                  label: 'Door No',
                  required: true,
                  placeholder: 'Enter',
                  value: ''
                })}
                {renderInput({
                  label: 'Area',
                  required: true,
                  placeholder: 'Enter Area',
                  value: ''
                })}
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[8px]">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <label className="block text-left text-[12px] font-medium text-black">
                      EB.No
                      <span className="text-[#E26D47]">*</span>
                    </label>
                    <span className="text-[12px] font-medium text-[#4B4B4B]">1Phase</span>
                  </div>
                  <input
                    readOnly
                    placeholder="Enter Number"
                    className=" h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
                    value=""
                  />
                </div>
                {renderInput({
                  label: 'Property Tax No',
                  required: true,
                  placeholder: 'Enter Number',
                  value: ''
                })}
              </div>

              {renderInput({
                label: 'Water Tax No',
                required: true,
                placeholder: 'Enter Number',
                value: '',
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              })}
            </div>

            <div className="mt-[16px] mb-[10px] grid grid-cols-2 gap-[14px]">
              <button
                type="button"
                onClick={() => setIsAddOnSheetOpen(false)}
                className="h-[38px] rounded-[8px] border border-[#BEBEBE] bg-white text-[14px] font-medium text-[#3A3A3A]"
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-[38px] rounded-[8px] bg-black text-[14px] font-medium text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderSelectedItemView = () => {
    if (selectedItem === 'Vendor Name' && isAddVendorViewOpen) {
      return renderAddVendorView();
    }
    if ((selectedItem === 'Contractor Name' || selectedItem === 'Support Associate Name') && isAddContractorViewOpen) {
      return renderAddContractorView();
    }
    if (selectedItem === 'Categories' && isAddCategoryViewOpen) {
      return renderAddCategoryView();
    }
    if (selectedItem === 'Machine tools' && isAddMachineViewOpen) {
      return renderAddMachineView();
    }
    if (selectedItem === 'Employee Details' && isAddEmployeeViewOpen) {
      return renderAddEmployeeView();
    }
    if (selectedItem === 'Account Details' && isAddAccountViewOpen) {
      return renderAddAccountView();
    }
    if (selectedItem === 'Company Labour' && isAddLabourViewOpen) {
      return renderAddLabourView();
    }

    if (selectedItem === 'Bank Details') {
      if (isBankNameFormOpen) return renderBankNameFormView();
      if (isBankTypeFormOpen) return renderBankTypeFormView();
      if (isBankLocationFormOpen) return renderBankLocationFormView();

      const query = itemSearch.trim().toLowerCase();
      const uniqueValues = (arr) => Array.from(new Set(arr.filter(Boolean)));

      const bankNameList = uniqueValues(
        (Array.isArray(listData) ? listData : [])
          .map((row) => row?.bank_name || row?.bankName || '')
          .map((v) => (typeof v === 'string' ? v.trim() : ''))
      );

      const bankLocationList = uniqueValues(
        (Array.isArray(listData) ? listData : [])
          .map((row) => row?.branch || row?.branch_name || row?.bankBranchName || '')
          .map((v) => (typeof v === 'string' ? v.trim() : ''))
      );

      const bankAccountTypeList = uniqueValues(
        (Array.isArray(bankAccountTypes) ? bankAccountTypes : [])
          .map((row) => row?.bank_account_type || row?.accountType || row?.account_type || row?.type || row?.name || '')
          .map((v) => (typeof v === 'string' ? v.trim() : ''))
      );

      const filterByQuery = (values) => {
        if (!query) return values;
        return values.filter((v) => v.toLowerCase().includes(query));
      };

      const renderSimpleList = (values, sectionKey) => {
        const filtered = filterByQuery(values);
        return (
          <div className="bg-white">
            {filtered.map((value, index) => (
              <div
                key={`${sectionKey}-${value}-${index}`}
                className="relative border-b border-[#EFEFEF] bg-white last:border-b-0 overflow-hidden select-none"
                style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                onTouchStart={handleProjectTouchStart}
                onTouchEnd={(event) => handleProjectTouchEnd(event, `${sectionKey}-${value}-${index}`)}
                onMouseDown={handleProjectMouseDown}
                onMouseUp={(event) => handleProjectMouseUp(event, `${sectionKey}-${value}-${index}`)}
                onMouseLeave={(event) => handleProjectMouseUp(event, `${sectionKey}-${value}-${index}`)}
              >
                <div className="absolute inset-y-0 right-[6px] flex items-center gap-[4px]">
                  <button
                    type="button"
                    className="flex h-[36px] w-[30px] items-center justify-center rounded-[2px] bg-[#0B7A45] text-white"
                    aria-label="Edit"
                    onClick={() => {
                      if (sectionKey === 'bank-name') {
                        setBankNameFormMode('edit');
                        setBankNameForm({ bankName: value });
                        setIsBankNameFormOpen(true);
                      } else if (sectionKey === 'bank-account-type') {
                        setBankTypeFormMode('edit');
                        setBankTypeForm({ accountType: value });
                        setIsBankTypeFormOpen(true);
                      } else if (sectionKey === 'bank-location') {
                        setBankLocationFormMode('edit');
                        setBankLocationForm({ branchName: value });
                        setIsBankLocationFormOpen(true);
                      }
                    }}
                  >
                    <img src={editIcon} alt="Edit" className="w-[18px] h-[18px]" />
                  </button>
                  <button
                    type="button"
                    className="flex h-[36px] w-[30px] items-center justify-center rounded-[2px] bg-[#F26B3A] text-white"
                    aria-label="Delete"
                  >
                    <img src={deleteIcon} alt="Delete" className="w-[18px] h-[18px]" />
                  </button>
                </div>

                <div
                  className={`grid grid-cols-[28px_minmax(0,1fr)] items-center bg-white px-[14px] py-[10px] transition-transform duration-200 ${
                    swipedProjectId === `${sectionKey}-${value}-${index}` ? '-translate-x-[70px]' : 'translate-x-0'
                  }`}
                >
                  <span className="text-[13px] font-medium text-black text-left">{index + 1}</span>
                  <span className="text-[13px] font-medium text-black text-left">{value}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-[16px] py-[18px] text-center text-[13px] text-[#7A7A7A]">No data found</div>
            )}
          </div>
        );
      };

      return (
        <>
          <div className="border-b border-[#E9E9E9] bg-white">
            <div className="flex items-end justify-between px-[16px] pt-[10px]">
              <div className="relative pb-[8px] text-[14px] font-medium text-black">
                Master Data
                <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
              </div>
              <button type="button" className="pb-[8px] text-[#2B2B2B]" aria-label="More options">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="4" r="1.3" fill="currentColor" />
                  <circle cx="9" cy="9" r="1.3" fill="currentColor" />
                  <circle cx="9" cy="14" r="1.3" fill="currentColor" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px] text-[12px] font-medium text-black">
              <button type="button" onClick={() => setSelectedItem(null)} className="flex items-center gap-[6px]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M5 9L2 6L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Back</span>
              </button>
              <button type="button">Download</button>
            </div>
          </div>

          <div className="px-[12px] pt-[8px]">
            <div className="flex items-center gap-[10px]">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12.5 12.5L15.75 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(event) => setItemSearch(event.target.value)}
                  placeholder="Search"
                  className="h-[36px] w-full rounded-full border border-[#D2D2D2] bg-white pl-[38px] pr-[14px] text-[14px] text-black outline-none placeholder:text-[#8F8F8F]"
                />
              </div>
              <button
                type="button"
                className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black text-white"
                aria-label="Add"
                onClick={() => {
                  if (expandedBankDetailsSection === 'bank-name') {
                    setBankNameFormMode('new');
                    setBankNameForm({ bankName: '' });
                    setIsBankNameFormOpen(true);
                  } else if (expandedBankDetailsSection === 'bank-account-type') {
                    setBankTypeFormMode('new');
                    setBankTypeForm({ accountType: '' });
                    setIsBankTypeFormOpen(true);
                  } else if (expandedBankDetailsSection === 'bank-location') {
                    setBankLocationFormMode('new');
                    setBankLocationForm({ branchName: '' });
                    setIsBankLocationFormOpen(true);
                  } else {
                    setBankNameFormMode('new');
                    setBankNameForm({ bankName: '' });
                    setIsBankNameFormOpen(true);
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-[12px] pt-[12px]">
            <div className="space-y-0">
              {renderBankDetailsAccordion('bank-name', 'Bank Name', renderSimpleList(bankNameList, 'bank-name'))}
              {renderBankDetailsAccordion(
                'bank-account-type',
                'Bank Account type',
                isBankTypesLoading ? (
                  <div className="px-[16px] py-[18px] text-center text-[13px] text-[#7A7A7A]">Loading...</div>
                ) : (
                  renderSimpleList(bankAccountTypeList, 'bank-account-type')
                )
              )}
              {renderBankDetailsAccordion('bank-location', 'Bank Location', renderSimpleList(bankLocationList, 'bank-location'))}
            </div>
          </div>
        </>
      );
    }

    return (
      <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button
            type="button"
            className="pb-[8px] text-[#2B2B2B]"
            aria-label="More options"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px] text-[12px] font-medium text-black">
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="flex items-center gap-[6px]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 9L2 6L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>
          <button type="button">Download</button>
        </div>
      </div>

      <div className="px-[12px] pt-[8px]">
        <div className="flex items-center gap-[10px]">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.5 12.5L15.75 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              value={itemSearch}
              onChange={(event) => setItemSearch(event.target.value)}
              placeholder="Search"
              className="h-[36px] w-full rounded-full border border-[#D2D2D2] bg-white pl-[38px] pr-[14px] text-[14px] text-black outline-none placeholder:text-[#8F8F8F]"
            />
          </div>
          <button
            type="button"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black text-white"
            aria-label="Add"
            onClick={() => {
              if (selectedItem === 'Vendor Name') {
                setVendorFormMode('new');
                setIsAddVendorViewOpen(true);
                setExpandedVendorSection('vendor-details');
                setVendorQrPreview('');
                setVendorForm({
                  vendorName: '',
                  vendorCategory: '',
                  vendorId: '',
                  contactNumber: '',
                  referenceName: '',
                  branch: '',
                  emailId: '',
                  vendorAddress: '',
                  location: '',
                  accountHolderName: '',
                  qrCode: '',
                  accountNumber: '',
                  bankName: '',
                  ifscCode: '',
                  upiPhoneNumber: '',
                  upiId: ''
                });
              } else if (selectedItem === 'Contractor Name' || selectedItem === 'Support Associate Name') {
                setContractorFormMode('new');
                setIsAddContractorViewOpen(true);
                setExpandedContractorSection('contractor-details');
                setContractorQrPreview('');
                setContractorForm({
                  contractorName: '',
                  contractorCategory: '',
                  contractorId: '',
                  contractorNumber: '',
                  referenceName: '',
                  branch: '',
                  emailId: '',
                  contractorAddress: '',
                  location: '',
                  accountHolderName: '',
                  qrCode: '',
                  accountNumber: '',
                  bankName: '',
                  ifscCode: '',
                  upiPhoneNumber: '',
                  upiId: ''
                });
              } else if (selectedItem === 'Categories') {
                setCategoryFormMode('new');
                setIsAddCategoryViewOpen(true);
                setExpandedCategorySection('category-details');
                setCategoryForm({ categoryName: '' });
              } else if (selectedItem === 'Machine tools') {
                setMachineFormMode('new');
                setIsAddMachineViewOpen(true);
                setExpandedMachineSection('machine-details');
                setMachineForm({ machineName: '' });
              } else if (selectedItem === 'Employee Details') {
                setEmployeeFormMode('new');
                setIsAddEmployeeViewOpen(true);
                setExpandedEmployeeSection('employee-details');
                setIsEmployeeQrModalOpen(false);
                setEmployeeQrPreview('');
                setIsEmployeeAadhaarModalOpen(false);
                setEmployeeAadhaarFile(null);
                setEmployeeForm({
                  employeeName: '',
                  employeeId: '',
                  designation: '',
                  userName: '',
                  mobileNumber: '',
                  emailId: '',
                  employeeAddress: '',
                  location: '',
                  accountHolderName: '',
                  qrCode: '',
                  accountNumber: '',
                  bankName: '',
                  ifscCode: '',
                  branch: '',
                  upiPhoneNumber: '',
                  upiId: ''
                });
              } else if (selectedItem === 'Account Details') {
                setAccountFormMode('new');
                setIsAddAccountViewOpen(true);
                setExpandedAccountSection('account-details');
                setIsAccountQrModalOpen(false);
                setAccountQrPreview('');
                setAccountForm({
                  accountHolderName: '',
                  accountNumber: '',
                  bankName: '',
                  ifscCode: '',
                  branch: '',
                  accountType: '',
                  upiPhoneNumber: '',
                  upiId: '',
                  qrCode: ''
                });
              } else if (selectedItem === 'Company Labour') {
                setLabourFormMode('new');
                setIsAddLabourViewOpen(true);
                setExpandedLabourSection('wage-details');
                setIsLabourQrModalOpen(false);
                setLabourQrPreview('');
                setLabourForm({
                  labourName: '',
                  labourCategory: '',
                  labourId: '',
                  labourNumber: '',
                  referenceName: '',
                  branch: '',
                  labourAddress: '',
                  location: '',
                  wageType: '',
                  labourSalary: '',
                  accountHolderName: '',
                  qrCode: '',
                  accountNumber: '',
                  bankName: '',
                  ifscCode: '',
                  accountBranch: '',
                  upiPhoneNumber: '',
                  upiId: ''
                });
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px]">
        <div className="overflow-hidden rounded-[14px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
          <div className="border-b border-[#EFEFEF] bg-[#F8F8F8] px-[14px] py-[10px]">
            <div className="flex items-center">
              <span className="w-[28px]" />
              <span className="text-[14px] font-semibold text-black">{selectedItem}</span>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto scrollbar-none no-scrollbar">
            {isListLoading ? (
              <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                Loading...
              </div>
            ) : filteredList.length === 0 ? (
              <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                No data found
              </div>
            ) : (
              filteredList.map((item, index) => {
                const rowId = getListRowId(item, index);
                const isSwiped = swipedProjectId === rowId;

                return (
                  <div
                    key={rowId}
                    className="relative border-b border-[#EFEFEF] bg-white last:border-b-0 overflow-hidden select-none"
                    style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                    onTouchStart={handleProjectTouchStart}
                    onTouchEnd={(event) => handleProjectTouchEnd(event, rowId)}
                    onMouseDown={handleProjectMouseDown}
                    onMouseUp={(event) => handleProjectMouseUp(event, rowId)}
                    onMouseLeave={(event) => handleProjectMouseUp(event, rowId)}
                  >
                    <div className="absolute inset-y-0 right-[6px] flex items-center gap-[4px]">
                      <button
                        type="button"
                        className="flex h-[36px] w-[30px] items-center justify-center rounded-[2px] bg-[#0B7A45] text-white"
                        aria-label="Edit"
                        onClick={() => {
                          if (selectedItem === 'Vendor Name') {
                            const next = normalizeVendorForForm(item);
                            setVendorFormMode('edit');
                            setVendorForm(next);
                            setVendorQrPreview(next.qrCode || '');
                            setExpandedVendorSection('vendor-details');
                            setIsAddVendorViewOpen(true);
                            return;
                          }

                          if (selectedItem === 'Contractor Name' || selectedItem === 'Support Associate Name') {
                            const next = normalizeContractorForForm(item);
                            setContractorFormMode('edit');
                            setContractorForm(next);
                            setContractorQrPreview(next.qrCode || '');
                            setExpandedContractorSection('contractor-details');
                            setIsAddContractorViewOpen(true);
                            return;
                          }

                          if (selectedItem === 'Categories') {
                            const next = normalizeCategoryForForm(item);
                            setCategoryFormMode('edit');
                            setCategoryForm(next);
                            setExpandedCategorySection('category-details');
                            setIsAddCategoryViewOpen(true);
                            return;
                          }

                          if (selectedItem === 'Machine tools') {
                            const next = normalizeMachineForForm(item);
                            setMachineFormMode('edit');
                            setMachineForm(next);
                            setExpandedMachineSection('machine-details');
                            setIsAddMachineViewOpen(true);
                            return;
                          }

                          if (selectedItem === 'Employee Details') {
                            const next = normalizeEmployeeForForm(item);
                            setEmployeeFormMode('edit');
                            setEmployeeForm(next);
                            setEmployeeQrPreview(next.qrCode || '');
                            setIsEmployeeAadhaarModalOpen(false);
                            setEmployeeAadhaarFile(null);
                            setExpandedEmployeeSection('employee-details');
                            setIsAddEmployeeViewOpen(true);
                            return;
                          }

                          if (selectedItem === 'Account Details') {
                            const next = normalizeAccountForForm(item);
                            setAccountFormMode('edit');
                            setAccountForm(next);
                            setAccountQrPreview(next.qrCode || '');
                            setExpandedAccountSection('account-details');
                            setIsAddAccountViewOpen(true);
                            return;
                          }

                          if (selectedItem === 'Company Labour') {
                            const next = normalizeLabourForForm(item);
                            setLabourFormMode('edit');
                            setLabourForm(next);
                            setLabourQrPreview(next.qrCode || '');
                            setExpandedLabourSection('wage-details');
                            setIsAddLabourViewOpen(true);
                          }
                        }}
                      >
                        <img src={editIcon} alt="Edit" className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        className="flex h-[36px] w-[30px] items-center justify-center rounded-[2px] bg-[#F26B3A] text-white"
                        aria-label="Delete"
                      >
                        <img src={deleteIcon} alt="Delete" className="w-[18px] h-[18px]" />
                      </button>
                    </div>

                    <div
                      className={`grid grid-cols-[28px_minmax(0,1fr)_auto] items-center bg-white px-[14px] py-[10px] transition-transform duration-200 ${
                        isSwiped ? '-translate-x-[70px]' : 'translate-x-0'
                      }`}
                    >
                      <span className="text-[13px] font-medium text-black text-left">
                        {index + 1}
                      </span>
                      <span className="pr-[8px] text-[13px] font-medium text-black text-left">
                        {getItemPrimaryText(item, selectedItem)}
                      </span>
                      <span className="text-[12px] font-medium text-left text-[#7A7A7A]">
                        {getItemSecondaryText(item, selectedItem)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      </>
    );
  };

  const renderProjectNameView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button
            type="button"
            className="pb-[8px] text-[#2B2B2B]"
            aria-label="More options"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px] text-[12px] font-medium text-black">
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="flex items-center gap-[6px]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 9L2 6L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>
          <button type="button">Download</button>
        </div>
      </div>

      <div className="px-[12px] pt-[8px]">
        <div className="flex items-center gap-[10px]">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.5 12.5L15.75 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              value={projectSearch}
              onChange={(event) => setProjectSearch(event.target.value)}
              placeholder="Search"
              className="h-[36px] w-full rounded-full border border-[#D2D2D2] bg-white pl-[38px] pr-[14px] text-[14px] text-black outline-none placeholder:text-[#8F8F8F]"
            />
          </div>

          <button
            type="button"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black text-white"
            aria-label="Add"
            onClick={() => {
              setProjectFormMode('new');
              setProjectForm({
                projectName: '',
                projectId: '',
                projectCategory: '',
                referenceName: '',
                branch: '',
                projectAddress: '',
                clientName: '',
                fatherName: '',
                mobileNumber: '',
                age: '',
                emailId: '',
                clientAddress: '',
                accountHolderName: '',
                qrCode: '',
                accountNumber: '',
                bankName: '',
                ifscCode: '',
                accountBranch: '',
                upiPhoneNumber: '',
                upiId: ''
              });
              setIsAddProjectViewOpen(true);
              setExpandedProjectSection('project-details');
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px]">
        <div className="overflow-hidden rounded-[14px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
          <div className="border-b border-[#EFEFEF] bg-[#F8F8F8] px-[14px] py-[10px]">
            <div className="flex items-center">
              <span className="w-[28px]" />
              <span className="text-[14px] font-semibold text-black">Project Name</span>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto scrollbar-none no-scrollbar">
            {isProjectsLoading ? (
              <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                Loading...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                No projects found
              </div>
            ) : (
              filteredProjects.map((item, index) => {
                const rowId = getProjectRowId(item, index);
                const isSwiped = swipedProjectId === rowId;

                return (
                  <div
                    key={rowId}
                    className="relative border-b border-[#EFEFEF] bg-white last:border-b-0 overflow-hidden select-none"
                    style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                    onTouchStart={handleProjectTouchStart}
                    onTouchEnd={(event) => handleProjectTouchEnd(event, rowId)}
                    onMouseDown={handleProjectMouseDown}
                    onMouseUp={(event) => handleProjectMouseUp(event, rowId)}
                    onMouseLeave={(event) => handleProjectMouseUp(event, rowId)}
                  >
                    <div className="absolute inset-y-0 right-[6px] flex items-center gap-[4px]">
                      <button
                        type="button"
                        className="flex h-[36px] w-[30px] items-center justify-center rounded-[2px] bg-[#0B7A45] text-white"
                        aria-label="Edit"
                        onClick={() => {
                          const next = normalizeProjectForForm(item);
                          setProjectFormMode('edit');
                          setProjectForm(next);
                          setIsAddProjectViewOpen(true);
                          setExpandedProjectSection('project-details');
                        }}
                      >
                        <img src={editIcon} alt="Edit" className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        className="flex h-[36px] w-[30px] items-center justify-center rounded-[2px] bg-[#F26B3A] text-white"
                        aria-label="Delete"
                      >
                        <img src={deleteIcon} alt="Delete" className="w-[18px] h-[18px]" />
                      </button>
                    </div>

                    <div
                      className={`grid grid-cols-[28px_minmax(0,1fr)_auto] items-center bg-white px-[14px] py-[10px] transition-transform duration-200 ${
                        isSwiped ? '-translate-x-[70px]' : 'translate-x-0'
                      }`}
                    >
                      <span className="text-[13px] font-medium text-black text-left">
                        {getProjectSerialNumber(item, index)}
                      </span>
                      <span className="pr-[8px] text-[13px] font-medium text-black text-left">
                        {item.projectName || ''}
                      </span>
                      <span
                        className={`text-[12px] font-medium text-left ${
                          item.projectCategory === 'Client Project'
                            ? 'text-[#C79B53]'
                            : item.projectCategory === 'Own Project'
                              ? 'text-[#111111]'
                              : 'text-[#7A7A7A]'
                        }`}
                      >
                        {item.projectCategory === 'Client Project'
                          ? 'Client'
                          : item.projectCategory === 'Own Project'
                            ? 'Own'
                            : ''}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      className="relative w-full min-h-screen bg-white max-w-[360px] mx-auto overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        userRoles={user?.userRoles || []}
      />

      <Header
        title="Master Data"
        user={user}
        onLogout={onLogout}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div
        className="bg-white"
        style={{
          minHeight: '100vh',
          paddingTop: '56px',
          paddingBottom: 'calc(60px + 18px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        {selectedItem ? (
          selectedItem === 'Project Name' ? (
            isAddProjectViewOpen ? renderAddProjectView() : renderProjectNameView()
          ) : (
            renderSelectedItemView()
          )
        ) : (
          <>
            <div className="border-b border-[#E9E9E9] bg-white">
              <div className="flex items-end justify-between px-[16px] pt-[10px]">
                <div className="relative pb-[8px] text-[14px] font-medium text-black">
                  Master Data
                  <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
                </div>
                <button
                  type="button"
                  className="pb-[8px] text-[#2B2B2B]"
                  aria-label="More options"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="4" r="1.3" fill="currentColor" />
                    <circle cx="9" cy="9" r="1.3" fill="currentColor" />
                    <circle cx="9" cy="14" r="1.3" fill="currentColor" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-end border-t border-[#EFEFEF] px-[16px] py-[6px] text-[12px] font-medium text-black">
                Table
              </div>
            </div>

            <div className="px-[12px] pt-[8px]">
              <div className="relative">
                <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12.5 12.5L15.75 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="h-[36px] w-full rounded-full border border-[#D2D2D2] bg-white pl-[38px] pr-[14px] text-[14px] text-black outline-none placeholder:text-[#8F8F8F]"
                />
              </div>
            </div>

            <div className="px-[12px] pt-[12px]">
              <div className="rounded-[14px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
                {filteredItems.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="flex w-full items-center justify-between border-b border-[#EFEFEF] bg-white px-[14px] py-[13px] text-left last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-[14px]">
                      <span className="w-[20px] shrink-0 text-[13px] font-medium text-black">
                        {index + 1}
                      </span>
                      <span className="truncate text-[14px] font-medium text-black">
                        {item}
                      </span>
                    </div>
                    <span className="ml-[12px] shrink-0 text-[#2B2B2B]">
                      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                ))}

                {filteredItems.length === 0 && (
                  <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                    No results found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav activeTab="home" />
    </div>
  );
};

export default MasterData;
